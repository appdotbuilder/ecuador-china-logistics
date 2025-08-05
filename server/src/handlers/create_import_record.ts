
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type CreateImportRecordInput, type ImportRecord } from '../schema';

export const createImportRecord = async (input: CreateImportRecordInput): Promise<ImportRecord> => {
  try {
    // Insert import record
    const result = await db.insert(importRecordsTable)
      .values({
        tracking_number: input.tracking_number,
        supplier_name: input.supplier_name,
        supplier_contact: input.supplier_contact,
        goods_description: input.goods_description,
        total_value_usd: input.total_value_usd.toString(), // Convert number to string for numeric column
        weight_kg: input.weight_kg.toString(), // Convert number to string for numeric column
        current_status: input.current_status,
        order_placed_date: input.order_placed_date,
        order_placed_notes: input.order_placed_notes,
        ecuapass_reference: input.ecuapass_reference,
        senae_declaration_number: input.senae_declaration_number,
        customs_broker: input.customs_broker
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const importRecord = result[0];
    return {
      ...importRecord,
      total_value_usd: parseFloat(importRecord.total_value_usd), // Convert string back to number
      weight_kg: parseFloat(importRecord.weight_kg) // Convert string back to number
    };
  } catch (error) {
    console.error('Import record creation failed:', error);
    throw error;
  }
};
