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

create or replace function set_updated_at()
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

create or replace function reverse_reconciliation () returns trigger as $$
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

create or replace function update_quick_sales_status()
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


create or replace function apply_reconciliation()
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

CREATE OR REPLACE FUNCTION block_reconciled_quick_sales_changes()
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

create or replace function set_updated_at()
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

create or replace function block_inventory_sale_if_reconciled()
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
create or replace function calculate_total_amount()
returns trigger as $$
begin
  new.total_amount := new.selling_price * new.quantity;
  return new;
end;
$$ language plpgsql;

-- updated_at trigger function
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Deduct stock function
create or replace function deduct_stock()
returns trigger as $$
declare
  current_stock integer;
begin
  -- Lock and get current stock
  select stock_quantity
  into current_stock
  from inventory_items
  where id = new.item_id
  for update;

  -- Prevent negative stock
  if current_stock < new.quantity then
    raise exception 'Insufficient stock for item %', new.item_id;
  end if;

  -- Deduct stock safely
  update inventory_items
  set stock_quantity = stock_quantity - new.quantity
  where id = new.item_id;

  return new;
end;
$$ language plpgsql;

create or replace function restore_stock()
returns trigger as $$
begin
  -- Restore stock only if sale was not previously deleted
  if old.soft_deleted = false and new.soft_deleted = true then
    update inventory_items
    set stock_quantity = stock_quantity + old.quantity
    where id = old.item_id;
  end if;

  return new;
end;
$$ language plpgsql;

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
create trigger deduct_stock_trigger
after insert on inventory_sales
for each row
execute function deduct_stock();

-- Restore stock on sale deletion
create trigger restore_stock_trigger
after update on inventory_sales
for each row
execute function restore_stock();

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
create or replace function generate_item_code()
returns trigger as $$
begin
  if new.item_code is null then
    new.item_code := 'ITEM-' || lpad(nextval('item_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

-- Block manual updates to item_code
create or replace function prevent_item_code_update()
returns trigger as $$
begin
  if old.item_code is not null then
    raise exception 'Item code cannot be updated';
  end if;
  return new;
end;
$$ language plpgsql;

-- updated_at trigger function
create or replace function set_updated_at()
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

