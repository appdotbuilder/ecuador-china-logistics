
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type UpdateImportStatusInput, type ImportRecord } from '../schema';
import { eq } from 'drizzle-orm';

export const updateImportStatus = async (input: UpdateImportStatusInput): Promise<ImportRecord> => {
  try {
    // Determine which date and notes fields to update based on status
    const updateFields: any = {
      current_status: input.status,
      updated_at: new Date()
    };

    // Set the appropriate date and notes fields based on status
    switch (input.status) {
      case 'ORDER_PLACED':
        updateFields.order_placed_date = input.date;
        updateFields.order_placed_notes = input.notes;
        break;
      case 'SHIPPED':
        updateFields.shipped_date = input.date;
        updateFields.shipped_notes = input.notes;
        break;
      case 'IN_CUSTOMS':
        updateFields.customs_entry_date = input.date;
        updateFields.customs_notes = input.notes;
        break;
      case 'DELIVERED':
        updateFields.delivered_date = input.date;
        updateFields.delivered_notes = input.notes;
        break;
    }

    // Convert numeric fields to strings for database storage
    const result = await db.update(importRecordsTable)
      .set(updateFields)
      .where(eq(importRecordsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Import record with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const record = result[0];
    return {
      ...record,
      total_value_usd: parseFloat(record.total_value_usd),
      weight_kg: parseFloat(record.weight_kg)
    };
  } catch (error) {
    console.error('Import status update failed:', error);
    throw error;
  }
};
