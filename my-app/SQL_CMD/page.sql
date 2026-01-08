create index idx_quick_sales_phone on quick_sales(phone);
create index idx_inventory_items_phone on inventory_items(phone);
create index idx_inventory_sales_phone on inventory_sales(phone);
create index idx_reconciliation_links_phone on reconciliation_links(phone);

-- RECONCILIATION LINKS TABLE
--------------------------------------------------- Reconciliation Links Table
create table reconciliation_links (
  id uuid primary key default uuid_generate_v4(),

  -- User identification (for MVP + future auth)
  phone text,
  auth_user_id uuid references auth.users(id),

  -- Financial links
  quick_sales_id uuid not null references quick_sales(id) on delete cascade,
  inventory_sales_id uuid not null references inventory_sales(id) on delete cascade,

  linked_amount numeric(16,2) not null check (linked_amount > 0),

  unique (quick_sales_id, inventory_sales_id)
  -- 
  -- is_reversal boolean default false,
  -- reversal_of uuid references reconciliation_links(id),

  -- unique (reversal_of),

  -- Audit fields
  created_by uuid references auth.users(id),

  soft_deleted boolean default false,
  deleted_reason text,
  deleted_at timestamp,

  created_at timestamp default now(),
  updated_at timestamp default now()

  -- check (
  --   (is_reversal = false and reversal_of is null)
  --   or
  --   (is_reversal = true and reversal_of is not null)
  -- )
);

create or replace function set_updated_at() -- checked
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create or replace function reverse_reconciliation()
-- returns trigger as $$
-- begin
--   if old.soft_deleted = false and new.soft_deleted = true then
--     update quick_sales
--     set 
--       reconciled_amount = reconciled_amount - old.linked_amount
--     where id = old.quick_sales_id;    
--   end if;

--   return new;
-- end;
-- $$ language plpgsql;

create or replace function reverse_reconciliation () returns trigger as $$ -- checkeed
begin
  if old.soft_deleted = false and new.soft_deleted = true then
    update quick_sales
  set reconciled_amount = greatest(
    0,
    reconciled_amount - old.linked_amount
  )
  where id = old.quick_sales_id;   
  end if;

  return new;
end;
$$ language plpgsql;

create or replace function update_quick_sales_status() -- checked
returns trigger as $$
begin
  update quick_sales
  set status =
    case
      when reconciled_amount <= 0 then 'pending'
      when reconciled_amount < total_amount then 'partial'
      else 'completed' -- >= total_amount
    end
  where id = new.quick_sales_id;

  return new;
end;
$$ language plpgsql;


create or replace function apply_reconciliation() -- checked
returns trigger as $$
begin
  update quick_sales
  set reconciled_amount = reconciled_amount + new.linked_amount
  where id = new.quick_sales_id;

  return new;
end;
$$ language plpgsql;


create trigger set_reconciliation_updated_at
before update on reconciliation_links
for each row
execute function set_updated_at();

create trigger reverse_reconciliation_trigger
after update on reconciliation_links
for each row
execute function reverse_reconciliation();

create trigger update_quick_sales_status_trigger
after insert or update on reconciliation_links
for each row
execute function update_quick_sales_status();

create trigger apply_reconciliation_trigger
after insert on reconciliation_links
for each row
execute function apply_reconciliation();

---------------------------------------------------


-- QUICK SALES TABLE vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
--------------------------------------------------- Quick Sales Table
create table quick_sales (
  id uuid primary key default uuid_generate_v4(),

  phone text,  
  auth_user_id uuid,

  total_amount numeric(16,2) not null,
  reconciled_amount numeric(16,2) default 0,

  status text default 'pending',

  created_at timestamp default now(),
  updated_at timestamp default now()

  --   ALTER TABLE quick_sales
  -- ADD CONSTRAINT quick_sales_reconciled_amount_check
  CHECK (
    reconciled_amount >= 0
    AND reconciled_amount <= total_amount
  );
);

CREATE OR REPLACE FUNCTION block_reconciled_quick_sales_changes() -- checked
RETURNS trigger AS $$
BEGIN
  -- Allow reconciliation/system updates
  IF OLD.reconciled_amount > 0 THEN
    -- If user tries to change business fields → block
    IF
      NEW.total_amount IS DISTINCT FROM OLD.total_amount OR
      NEW.note IS DISTINCT FROM OLD.note OR
      NEW.mode IS DISTINCT FROM OLD.mode
    THEN
      RAISE EXCEPTION
        'Quick sale has linked payments and cannot be modified';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_quick_sales_after_reconciliation
ON quick_sales;

CREATE TRIGGER protect_quick_sales_after_reconciliation
BEFORE UPDATE OR DELETE ON quick_sales
FOR EACH ROW
EXECUTE FUNCTION block_reconciled_quick_sales_changes();

create or replace function set_updated_at() -- checked
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


create trigger set_quick_sales_updated_at
before update on quick_sales
for each row
execute function set_updated_at();
---------------------------------------------------


-- INVENTORY SALES TABLE
--------------------------------------------------- Inventory Table
create table inventory_sales (
  id uuid primary key default uuid_generate_v4(),

  phone text,
  auth_user_id uuid,

  item_id uuid not null references inventory_items(id),

  quantity integer not null check (quantity > 0),
  selling_price numeric(16,2) not null,
  total_amount numeric(16,2) not null,

  soft_deleted boolean default false,
  deleted_reason text,
  deleted_at timestamp,

  
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create or replace function block_inventory_sale_if_reconciled() -- checked
returns trigger as $$
begin
  if exists (
    select 1 from reconciliation_links
    where inventory_sales_id = old.id
      and soft_deleted = false
  ) then
    raise exception
      'Inventory sale has reconciliations and cannot be modified';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger protect_inventory_sales_after_reconciliation
before update or delete on inventory_sales
for each row
execute function block_inventory_sale_if_reconciled();


-- Auto-calculate total_amount
create or replace function calculate_total_amount() -- checked
returns trigger as $$
begin
  new.total_amount := new.selling_price * new.quantity;
  return new;
end;
$$ language plpgsql;

-- updated_at trigger function
create or replace function set_updated_at() -- checked
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Deduct stock function
-- create or replace function deduct_stock()
-- returns trigger as $$
-- declare
--   current_stock integer;
-- begin
--   -- Lock and get current stock
--   select stock_quantity
--   into current_stock
--   from inventory_items
--   where id = new.item_id
--   for update;

--   -- Prevent negative stock
--   if current_stock < new.quantity then
--     raise exception 'Insufficient stock for item %', new.item_id;
--   end if;

--   -- Deduct stock safely
--   update inventory_items
--   set stock_quantity = stock_quantity - new.quantity
--   where id = new.item_id;

--   return new;
-- end;
-- $$ language plpgsql;

-- create or replace function restore_stock()
-- returns trigger as $$
-- begin
--   -- Restore stock only if sale was not previously deleted
--   if old.soft_deleted = false and new.soft_deleted = true then
--     update inventory_items
--     set stock_quantity = stock_quantity + old.quantity
--     where id = old.item_id;
--   end if;

--   return new;
-- end;
-- $$ language plpgsql;

---------------------------------------------------
-- TRIGGERS
---------------------------------------------------

-- Auto total calculation
create trigger calculate_inventory_total
before insert or update on inventory_sales
for each row
execute function calculate_total_amount();

-- updated_at trigger
create trigger set_inventory_updated_at
before update on inventory_sales
for each row
execute function set_updated_at();

-- Deduct stock on new sale
-- create trigger deduct_stock_trigger
-- after insert on inventory_sales
-- for each row
-- execute function deduct_stock();

-- Restore stock on sale deletion
-- create trigger restore_stock_trigger
-- after update on inventory_sales
-- for each row
-- execute function restore_stock();

---------------------------------------------------



-- INVENTORY ITEMS TABLE
--------------------------------------------------- Inventory Items Table
create table inventory_items (
  id uuid primary key default uuid_generate_v4(),
  phone text,
  auth_user_id uuid,

  item_code text unique,   -- ITEM-0001
  name text not null,

  stock_quantity integer not null default 0,
  unit_price numeric(16,2) not null,

  soft_deleted boolean default false,
  deleted_reason text,
  deleted_at timestamp,

  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Sequence for Item Codes
create sequence item_code_seq start 1 owned by inventory_items.id;

-- Item Code Generator
create or replace function generate_item_code() -- checked
returns trigger as $$
begin
  if new.item_code is null then
    new.item_code := 'ITEM-' || lpad(nextval('item_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

-- Block manual updates to item_code
create or replace function prevent_item_code_update() -- checked
returns trigger as $$
begin
  if old.item_code is not null then
    raise exception 'Item code cannot be updated';
  end if;
  return new;
end;
$$ language plpgsql;

-- updated_at trigger function
create or replace function set_updated_at() -- checked
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Item code before insert
create trigger set_inventory_item_code
before insert on inventory_items
for each row
execute function generate_item_code();

-- Prevent item code updates
create trigger lock_inventory_item_code
before update of item_code on inventory_items
for each row
execute function prevent_item_code_update();

-- updated_at trigger
create trigger set_inventory_updated_at
before update on inventory_items
for each row
execute function set_updated_at();

create table inventory_batches (
  id uuid primary key default uuid_generate_v4(),

  phone text,
  auth_user_id uuid,

  item_id uuid not null references inventory_items(id),

  quantity integer not null check (quantity >= 0),
  unit_cost numeric(16,2) not null,

  is_active boolean default true,

  soft_deleted boolean default false,
  deleted_reason text,
  deleted_at timestamp,

  created_at timestamp default now(),
  updated_at timestamp default now()
);

create trigger set_inventory_updated_at
before update on inventory_batches
for each row
execute function set_updated_at();


create or replace function recompute_inventory_item(item uuid) -- checked
returns void as $$
declare
  total_stock integer;
  display_price numeric(16,2);
begin
  -- total stock
  select coalesce(sum(quantity), 0)
  into total_stock
  from inventory_batches
  where item_id = item
    and is_active = true
    and soft_deleted = false;

  -- display price (oldest active batch)
  select unit_cost
  into display_price
  from inventory_batches
  where item_id = item
    and is_active = true
    and soft_deleted = false
  order by created_at asc
  limit 1;

  update inventory_items
  set
    stock_quantity = total_stock,
    unit_price = coalesce(display_price, unit_price)
  where id = item;
end;
$$ language plpgsql;


create or replace function inventory_batch_changed() -- checked
returns trigger as $$
begin
  perform recompute_inventory_item(new.item_id);
  return new;
end;
$$ language plpgsql;

create trigger inventory_batch_changed_insert
after insert on inventory_batches
for each row execute function inventory_batch_changed();

create trigger inventory_batch_changed_update
after update on inventory_batches
for each row execute function inventory_batch_changed();


create or replace function create_cogs_expense() -- checked
returns trigger as $$
declare
  v_cost numeric(16,2);
begin
  INSERT INTO expenses (
    id,
    phone,
    inventory_sales_id,
    type,
    category,
    quantity,
    unit_cost,
    total_cost,
    system_generated,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.phone,
    NEW.id,
    'cogs',
    'inventory',
    NEW.batch_quantity_at_sale,
    NEW.batch_unit_cost,
    NEW.batch_quantity_at_sale * NEW.batch_unit_cost,
    TRUE,
    now(),
    now()
  );

  RETURN NEW;
end;
$$ language plpgsql;

create trigger inventory_sale_cogs_trigger
after insert on inventory_sales
for each row
execute function create_cogs_expense();

CREATE OR REPLACE FUNCTION public.handle_inventory_sale_update() -- checked
RETURNS trigger AS $$
DECLARE
    v_expense_id uuid;
    v_quantity_changed boolean := NEW.quantity <> OLD.quantity;
    v_has_reconciliation boolean;
BEGIN
    -- Ignore old soft-deleted rows
    IF OLD.soft_deleted THEN
        RETURN NEW;
    END IF;

    -- 🔒 Batch is immutable
    IF NEW.batch_id <> OLD.batch_id THEN
        RAISE EXCEPTION 'Changing batch on a sale is not allowed';
    END IF;

    -- 🔒 Quantity must be positive
    IF NEW.quantity <= 0 THEN
        RAISE EXCEPTION 'Sale quantity must be greater than zero';
    END IF;

    -- 🔒 Prevent edits if reconciled
    SELECT EXISTS (
        SELECT 1
        FROM reconciliation_links
        WHERE inventory_sales_id = OLD.id
          AND soft_deleted = false
    ) INTO v_has_reconciliation;

    IF v_has_reconciliation THEN
        IF v_quantity_changed THEN
            RAISE EXCEPTION 'Cannot edit quantity: sale has reconciliations';
        END IF;
        IF NEW.selling_price <> OLD.selling_price THEN
            RAISE EXCEPTION 'Cannot edit selling price: sale has reconciliations';
        END IF;
    END IF;

    -- --------------------------
    -- 1️⃣ Handle soft delete
    -- --------------------------
    IF NEW.soft_deleted THEN
        -- Soft delete related COGS expense
        PERFORM set_config('app.allow_system_expense_update', 'true', true);

        UPDATE expenses
        SET soft_deleted = true,
            deleted_reason = 'inventory sale deleted',
            deleted_at = now(),
            updated_at = now()
        WHERE inventory_sales_id = OLD.id
          AND type = 'cogs'
          AND soft_deleted = false;

        RETURN NEW;
    END IF;

    -- --------------------------
    -- 2️⃣ Quantity changed? adjust batch and COGS
    -- --------------------------
    IF v_quantity_changed THEN
        -- Restore old batch quantity
        UPDATE inventory_batches
        SET quantity = quantity + OLD.quantity,
            is_active = true
        WHERE id = OLD.batch_id;

        -- Deduct new quantity
        UPDATE inventory_batches
        SET quantity = quantity - NEW.quantity,
            is_active = (quantity - NEW.quantity) > 0
        WHERE id = NEW.batch_id;

        -- Recompute item stock
        PERFORM recompute_inventory_item(NEW.item_id);

        -- Update COGS expense
        PERFORM set_config('app.allow_system_expense_update', 'true', true);

        SELECT id
        INTO v_expense_id
        FROM expenses
        WHERE inventory_sales_id = NEW.id
          AND type = 'cogs'
          AND soft_deleted = false
        LIMIT 1;

        IF v_expense_id IS NOT NULL THEN
            UPDATE expenses
            SET quantity = NEW.quantity,
                total_cost = NEW.quantity * NEW.batch_unit_cost,
                updated_at = now()
            WHERE id = v_expense_id;
        END IF;
    END IF;

    -- --------------------------
    -- 3️⃣ Selling price or payment type change? update revenue only
    -- --------------------------
    IF NEW.selling_price <> OLD.selling_price
       OR NEW.payment_type <> OLD.payment_type THEN
        NEW.total_amount := NEW.quantity * NEW.selling_price;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create trigger trg_inventory_sales_update
before update on inventory_sales
for each row
execute function handle_inventory_sale_update();

CREATE OR REPLACE FUNCTION protect_system_expensses() -- checked
RETURNS trigger AS $$
BEGIN
  -- Only allow internal updates if the flag is set
  IF OLD.system_generated = true AND current_setting('app.allow_system_expense_update', true) <> 'true' THEN
    RAISE EXCEPTION 'System-generated expenses cannot be modified or deleted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

create trigger lock_system_expenses
before update or delete on expenses
for each row
execute function protect_system_expensses();


create or replace function restore_batch_stock() -- checked
returns trigger as $$

begin
  if old.soft_deleted = false and new.soft_deleted = true then
    update inventory_batches
    set
      quantity = quantity + old.quantity,
      is_active = true
    where id = old.batch_id;

    perform recompute_inventory_item(old.item_id);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger restore_batch_stock_trigger
after update on inventory_sales
for each row
execute function restock_batch_stock();

--Things I did

alter table inventory_sales
add column batch_unit_cost numeric(16,2),
add column batch_quantity_at_sale integer;

alter table expenses
alter column inventory_sales_id drop not null;

ALTER TABLE expenses
ALTER COLUMN inventory_sales_id DROP NOT NULL;

ALTER TABLE expenses
ALTER COLUMN quantity DROP NOT NULL,
ALTER COLUMN unit_cost DROP NOT NULL;

ALTER TABLE expenses
ADD COLUMN amount numeric(16,2);

-- UPDATE expenses
-- SET amount = total_cost
-- WHERE amount IS NULL;

ALTER TABLE expenses
ALTER COLUMN amount SET NOT NULL;

ALTER TABLE expenses
ADD COLUMN system_generated boolean DEFAULT false;

-- UPDATE expenses
-- SET system_generated = true
-- WHERE type = 'cogs';

ALTER TABLE expenses
ALTER COLUMN category DROP DEFAULT;





create or replace function public.apply_inventory_sale() --checked
returns trigger as $$
declare
  v_remaining integer := new.quantity;
  v_take integer;
  v_batch inventory_batches;
begin
  if new.quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  while v_remaining > 0 loop
    -- FIFO: pick oldest active batch
    select *
    into v_batch
    from inventory_batches
    where item_id = new.item_id
      and is_active = true
      and soft_deleted = false
    order by created_at asc
    limit 1
    for update;

    if not found then
      raise exception 'Insufficient stock for item %', new.item_id;
    end if;

    v_take := least(v_batch.quantity, v_remaining);

    -- deduct from batch
    update inventory_batches
    set
      quantity = quantity - v_take,
      is_active = (quantity - v_take) > 0
    where id = v_batch.id;

    -- create per-batch sale row ONLY if batch_id not yet assigned
    if new.batch_id is null then
      update inventory_sales
      set batch_id = v_batch.id
      where id = new.id;
    end if;

    v_remaining := v_remaining - v_take;
  end loop;

  -- recompute item stock
  perform recompute_inventory_item(new.item_id);

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_inventory_sale_insert on inventory_sales;

create trigger trg_inventory_sale_insert
after insert on inventory_sales
for each row
execute function public.apply_inventory_sale();

-- CREATE OR REPLACE FUNCTION apply_inventory_sale_on_confirm()
-- RETURNS trigger AS $$
-- BEGIN
--   IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
--     -- FIFO logic here 
--   END IF;

--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trg_inventory_sale_confirm
-- AFTER UPDATE OF status ON inventory_sales
-- FOR EACH ROW
-- EXECUTE FUNCTION apply_inventory_sale_on_confirm();

-- PERFORM public.apply_inventory_sale(NEW);



-- New Stuffs for Syncing
ALTER TABLE inventory_sales
ADD COLUMN sync_status text NOT NULL DEFAULT 'pending'
CHECK (sync_status IN ('pending', 'confirmed', 'rejected'));

ALTER TABLE inventory_sales
ADD COLUMN rejection_reason text;

CREATE OR REPLACE FUNCTION confirm_inventory_sale(
  p_client_sale_id uuid,
  p_item_id uuid,
  p_quantity integer,
  p_selling_price numeric,
  p_phone text,
  p_payment_type text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock integer;
  v_sale_id uuid;
BEGIN
  -- Lock stock
  SELECT stock_quantity
  INTO v_stock
  FROM inventory_items
  WHERE id = p_item_id
  FOR UPDATE;

  IF v_stock < p_quantity THEN
    RETURN jsonb_build_object(
      'status', 'rejected',
      'reason', 'insufficient_stock'
    );
  END IF;

  -- Create sale
  INSERT INTO inventory_sales (
    id,
    client_sale_id,
    item_id,
    quantity,
    selling_price,
    total_amount,
    phone,
    payment_type,
    sync_status,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    p_client_sale_id,
    p_item_id,
    p_quantity,
    p_selling_price,
    p_quantity * p_selling_price,
    p_phone,
    p_payment_type,
    'confirmed',
    now(),
    now()
  )
  RETURNING id INTO v_sale_id;

  -- FIFO deduction (your existing logic)
  PERFORM apply_inventory_sale(v_sale_id);

  RETURN jsonb_build_object(
    'status', 'confirmed',
    'sale_id', v_sale_id
  );
END;
$$;

DROP TRIGGER IF EXISTS trg_inventory_sale_insert ON inventory_sales;

CREATE OR REPLACE FUNCTION public.apply_inventory_sale(p_sale_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_sale inventory_sales;
  v_remaining integer;
  v_take integer;
  v_batch inventory_batches;
BEGIN
  SELECT *
  INTO v_sale
  FROM inventory_sales
  WHERE id = p_sale_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale not found';
  END IF;

  IF v_sale.quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero';
  END IF;

  IF v_sale.sync_status <> 'confirmed' THEN
    RAISE EXCEPTION 'FIFO can only run on confirmed sales';
  END IF;

  v_remaining := v_sale.quantity;

  WHILE v_remaining > 0 LOOP
    SELECT *
    INTO v_batch
    FROM inventory_batches
    WHERE item_id = v_sale.item_id
      AND is_active = true
      AND soft_deleted = false
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock for item %', v_sale.item_id;
    END IF;

    v_take := LEAST(v_batch.quantity, v_remaining);

    UPDATE inventory_batches
    SET
      quantity = quantity - v_take,
      is_active = (quantity - v_take) > 0
    WHERE id = v_batch.id;

    UPDATE inventory_sales
    SET batch_id = v_batch.id
    WHERE id = v_sale.id
      AND batch_id IS NULL;

    v_remaining := v_remaining - v_take;
  END LOOP;

  PERFORM recompute_inventory_item(v_sale.item_id);
END;
$$;

-- https://github.com/dexie/Dexie.js/issues/1767


