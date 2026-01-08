// lib/db.ts
"use client"

import Dexie from "dexie";

export type QuickSale = {
  id: string;
  phone?: string;
  auth_user_id?: string | null;
  total_amount: number;
  reconciled_amount: number;
  status: "pending" | "partial" | "completed";
  note: string | null;
  mode: string;
  soft_deleted?: boolean;
  deleted_reason?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type InventoryItem = {
  id: string;
  phone: string;
  auth_user_id?: string | null;
  //   item_code?: string | null;
  name: string;
  stock_quantity: number;
  unit_price: number;
  soft_deleted?: boolean;
  deleted_reason?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type InventoryBatch = {
  id: string;
  item_id: string; // inventory_items.id
  phone?: string;
  quantity: number;
  unit_cost: number;
  is_active: boolean;
  soft_deleted?: boolean;
  deleted_reason?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type InventorySale = {
  id: string;
  phone?: string;
  auth_user_id?: string | null;
  client_sale_id: string | null;
  item_id: string; // references inventory_items.id
  name: string;
  batch_id?: string;
  batch_unit_cost?: number;
  batch_quantity_at_sale?: number;
  quantity: number;
  selling_price: number;
  total_amount: number;
  payment_type: string;
  sync_status: "pending" | "confirmed" | "rejected";
  rejection_reason?: string | null;
  soft_deleted?: boolean;
  deleted_reason?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ReconciliationLink = {
  id: string;
  phone?: string;
  auth_user_id?: string | null;
  quick_sales_id: string;
  inventory_sales_id: string;
  linked_amount: number; // can be negative for reversal
  //   is_reversal?: boolean;
  //   reversal_of?: string | null;
  created_by?: string | null;
  soft_deleted?: boolean;
  deleted_reason?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Expenses = {
  id: string;
  phone?: string;
  auth_user_id?: string | null;
  inventory_sales_id: string;
  type: string;
  category: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  amount: number | null;
  note?: string;
  soft_deleted?: boolean;
  deleted_reason?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type PendingSync = {
  local_id?: number; // Dexie auto-increment key
  phone: string;
  table:
    | "quick_sales"
    | "inventory_items"
    | "inventory_sales"
    | "reconciliation_links"
    | "inventory_batches"
    | "expenses";
  action: "insert" | "update" | "soft_delete" | "hard_delete";
  payload: any; // full row data (including local ids)
  permanently_failed?: boolean;
  sync_status?: string | null;
  rejection_reason?: string | null;
  created_at?: string;
  tries?: number;
  last_error?: string | null;
  paused_until?: number | null;
};

class MySalesDB extends Dexie {
  quick_sales!: Dexie.Table<QuickSale, string>;
  inventory_items!: Dexie.Table<InventoryItem, string>;
  inventory_sales!: Dexie.Table<InventorySale, string>;
  reconciliation_links!: Dexie.Table<ReconciliationLink, string>;
  inventory_batches!: Dexie.Table<InventoryBatch, string>;
  expenses!: Dexie.Table<Expenses, string>;
  pending_sync!: Dexie.Table<PendingSync, number>;

  constructor() {
    super("mySalesDB");
    this.version(7).stores({
      quick_sales: "id, phone, total_amount, reconciled_amount, status, created_at",
      inventory_items: "id, phone, name, stock_quantity, created_at",
      inventory_sales: "id, phone, item_id, batch_id, inventory_sales_id, soft_deleted, created_at",
      reconciliation_links:
        "id, phone, quick_sales_id, inventory_sales_id, created_at",
      inventory_batches: "id, phone, item_id, is_active, created_at",
      expenses: "id, type, phone, inventory_sales_id, created_at",
      pending_sync: "++local_id, table, phone, action, created_at",
    });

    this.quick_sales = this.table("quick_sales");
    this.inventory_items = this.table("inventory_items");
    this.inventory_sales = this.table("inventory_sales");
    this.reconciliation_links = this.table("reconciliation_links");
    this.inventory_batches = this.table("inventory_batches");
    this.expenses = this.table("expenses");
    this.pending_sync = this.table("pending_sync");
  }
}

export const db = new MySalesDB();
