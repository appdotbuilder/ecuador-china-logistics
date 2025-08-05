
import { serial, text, pgTable, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';

// Define import status enum
export const importStatusEnum = pgEnum('import_status', ['ORDER_PLACED', 'SHIPPED', 'IN_CUSTOMS', 'DELIVERED']);

export const importRecordsTable = pgTable('import_records', {
  id: serial('id').primaryKey(),
  tracking_number: text('tracking_number').notNull().unique(),
  supplier_name: text('supplier_name').notNull(),
  supplier_contact: text('supplier_contact'), // Nullable by default
  goods_description: text('goods_description').notNull(),
  total_value_usd: numeric('total_value_usd', { precision: 12, scale: 2 }).notNull(),
  weight_kg: numeric('weight_kg', { precision: 10, scale: 3 }).notNull(),
  current_status: importStatusEnum('current_status').notNull().default('ORDER_PLACED'),
  
  // Stage-specific date and notes fields
  order_placed_date: timestamp('order_placed_date'),
  order_placed_notes: text('order_placed_notes'),
  shipped_date: timestamp('shipped_date'),
  shipped_notes: text('shipped_notes'),
  customs_entry_date: timestamp('customs_entry_date'),
  customs_notes: text('customs_notes'),
  delivered_date: timestamp('delivered_date'),
  delivered_notes: text('delivered_notes'),
  
  // SENAE and ECUAPASS compliance fields
  ecuapass_reference: text('ecuapass_reference'),
  senae_declaration_number: text('senae_declaration_number'),
  customs_broker: text('customs_broker'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type ImportRecord = typeof importRecordsTable.$inferSelect;
export type NewImportRecord = typeof importRecordsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { importRecords: importRecordsTable };
