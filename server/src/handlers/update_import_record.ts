
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type UpdateImportRecordInput, type ImportRecord } from '../schema';
import { eq } from 'drizzle-orm';

export const updateImportRecord = async (input: UpdateImportRecordInput): Promise<ImportRecord> => {
  try {
    // Build update values object only with provided fields
    const updateValues: Partial<typeof importRecordsTable.$inferInsert> = {};
    
    if (input.tracking_number !== undefined) {
      updateValues.tracking_number = input.tracking_number;
    }
    if (input.supplier_name !== undefined) {
      updateValues.supplier_name = input.supplier_name;
    }
    if (input.supplier_contact !== undefined) {
      updateValues.supplier_contact = input.supplier_contact;
    }
    if (input.goods_description !== undefined) {
      updateValues.goods_description = input.goods_description;
    }
    if (input.total_value_usd !== undefined) {
      updateValues.total_value_usd = input.total_value_usd.toString();
    }
    if (input.weight_kg !== undefined) {
      updateValues.weight_kg = input.weight_kg.toString();
    }
    if (input.current_status !== undefined) {
      updateValues.current_status = input.current_status;
    }
    if (input.order_placed_date !== undefined) {
      updateValues.order_placed_date = input.order_placed_date;
    }
    if (input.order_placed_notes !== undefined) {
      updateValues.order_placed_notes = input.order_placed_notes;
    }
    if (input.shipped_date !== undefined) {
      updateValues.shipped_date = input.shipped_date;
    }
    if (input.shipped_notes !== undefined) {
      updateValues.shipped_notes = input.shipped_notes;
    }
    if (input.customs_entry_date !== undefined) {
      updateValues.customs_entry_date = input.customs_entry_date;
    }
    if (input.customs_notes !== undefined) {
      updateValues.customs_notes = input.customs_notes;
    }
    if (input.delivered_date !== undefined) {
      updateValues.delivered_date = input.delivered_date;
    }
    if (input.delivered_notes !== undefined) {
      updateValues.delivered_notes = input.delivered_notes;
    }
    if (input.ecuapass_reference !== undefined) {
      updateValues.ecuapass_reference = input.ecuapass_reference;
    }
    if (input.senae_declaration_number !== undefined) {
      updateValues.senae_declaration_number = input.senae_declaration_number;
    }
    if (input.customs_broker !== undefined) {
      updateValues.customs_broker = input.customs_broker;
    }

    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();

    // Update the record
    const result = await db.update(importRecordsTable)
      .set(updateValues)
      .where(eq(importRecordsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Import record with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers
    const updatedRecord = result[0];
    return {
      ...updatedRecord,
      total_value_usd: parseFloat(updatedRecord.total_value_usd),
      weight_kg: parseFloat(updatedRecord.weight_kg)
    };
  } catch (error) {
    console.error('Import record update failed:', error);
    throw error;
  }
};
