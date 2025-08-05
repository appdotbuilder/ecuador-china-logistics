
import { z } from 'zod';

// Import status enum
export const importStatusSchema = z.enum(['ORDER_PLACED', 'SHIPPED', 'IN_CUSTOMS', 'DELIVERED']);
export type ImportStatus = z.infer<typeof importStatusSchema>;

// Import record schema
export const importRecordSchema = z.object({
  id: z.number(),
  tracking_number: z.string(),
  supplier_name: z.string(),
  supplier_contact: z.string().nullable(),
  goods_description: z.string(),
  total_value_usd: z.number(),
  weight_kg: z.number(),
  current_status: importStatusSchema,
  order_placed_date: z.coerce.date().nullable(),
  order_placed_notes: z.string().nullable(),
  shipped_date: z.coerce.date().nullable(),
  shipped_notes: z.string().nullable(),
  customs_entry_date: z.coerce.date().nullable(),
  customs_notes: z.string().nullable(),
  delivered_date: z.coerce.date().nullable(),
  delivered_notes: z.string().nullable(),
  ecuapass_reference: z.string().nullable(),
  senae_declaration_number: z.string().nullable(),
  customs_broker: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ImportRecord = z.infer<typeof importRecordSchema>;

// Input schema for creating import records
export const createImportRecordInputSchema = z.object({
  tracking_number: z.string().min(1),
  supplier_name: z.string().min(1),
  supplier_contact: z.string().nullable(),
  goods_description: z.string().min(1),
  total_value_usd: z.number().positive(),
  weight_kg: z.number().positive(),
  current_status: importStatusSchema.default('ORDER_PLACED'),
  order_placed_date: z.coerce.date().nullable(),
  order_placed_notes: z.string().nullable(),
  ecuapass_reference: z.string().nullable(),
  senae_declaration_number: z.string().nullable(),
  customs_broker: z.string().nullable()
});

export type CreateImportRecordInput = z.infer<typeof createImportRecordInputSchema>;

// Input schema for updating import records
export const updateImportRecordInputSchema = z.object({
  id: z.number(),
  tracking_number: z.string().min(1).optional(),
  supplier_name: z.string().min(1).optional(),
  supplier_contact: z.string().nullable().optional(),
  goods_description: z.string().min(1).optional(),
  total_value_usd: z.number().positive().optional(),
  weight_kg: z.number().positive().optional(),
  current_status: importStatusSchema.optional(),
  order_placed_date: z.coerce.date().nullable().optional(),
  order_placed_notes: z.string().nullable().optional(),
  shipped_date: z.coerce.date().nullable().optional(),
  shipped_notes: z.string().nullable().optional(),
  customs_entry_date: z.coerce.date().nullable().optional(),
  customs_notes: z.string().nullable().optional(),
  delivered_date: z.coerce.date().nullable().optional(),
  delivered_notes: z.string().nullable().optional(),
  ecuapass_reference: z.string().nullable().optional(),
  senae_declaration_number: z.string().nullable().optional(),
  customs_broker: z.string().nullable().optional()
});

export type UpdateImportRecordInput = z.infer<typeof updateImportRecordInputSchema>;

// Status update schema for stage transitions
export const updateImportStatusInputSchema = z.object({
  id: z.number(),
  status: importStatusSchema,
  date: z.coerce.date(),
  notes: z.string().nullable()
});

export type UpdateImportStatusInput = z.infer<typeof updateImportStatusInputSchema>;

// Query filters schema
export const importRecordFiltersSchema = z.object({
  status: importStatusSchema.optional(),
  tracking_number: z.string().optional(),
  supplier_name: z.string().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional()
});

export type ImportRecordFilters = z.infer<typeof importRecordFiltersSchema>;
