
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type ImportRecord } from '../schema';
import { eq } from 'drizzle-orm';

export const getImportRecordById = async (id: number): Promise<ImportRecord | null> => {
  try {
    const results = await db.select()
      .from(importRecordsTable)
      .where(eq(importRecordsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers
    const record = results[0];
    return {
      ...record,
      total_value_usd: parseFloat(record.total_value_usd),
      weight_kg: parseFloat(record.weight_kg)
    };
  } catch (error) {
    console.error('Failed to fetch import record:', error);
    throw error;
  }
};
