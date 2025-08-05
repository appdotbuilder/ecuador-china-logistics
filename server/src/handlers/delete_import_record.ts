
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteImportRecord = async (id: number): Promise<boolean> => {
  try {
    const result = await db.delete(importRecordsTable)
      .where(eq(importRecordsTable.id, id))
      .execute();

    // Check if any rows were affected (deleted)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Import record deletion failed:', error);
    throw error;
  }
};
