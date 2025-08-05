
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type ImportRecord, type ImportRecordFilters } from '../schema';
import { eq, gte, lte, ilike, and, desc, type SQL } from 'drizzle-orm';

export const getImportRecords = async (filters?: ImportRecordFilters): Promise<ImportRecord[]> => {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    if (filters) {
      // Filter by status
      if (filters.status) {
        conditions.push(eq(importRecordsTable.current_status, filters.status));
      }

      // Filter by tracking number (case insensitive partial match)
      if (filters.tracking_number) {
        conditions.push(ilike(importRecordsTable.tracking_number, `%${filters.tracking_number}%`));
      }

      // Filter by supplier name (case insensitive partial match)
      if (filters.supplier_name) {
        conditions.push(ilike(importRecordsTable.supplier_name, `%${filters.supplier_name}%`));
      }

      // Filter by date range (using created_at field)
      if (filters.date_from) {
        conditions.push(gte(importRecordsTable.created_at, filters.date_from));
      }

      if (filters.date_to) {
        conditions.push(lte(importRecordsTable.created_at, filters.date_to));
      }
    }

    // Build and execute query with proper type handling
    const results = conditions.length > 0
      ? await db.select()
          .from(importRecordsTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .orderBy(desc(importRecordsTable.created_at))
          .execute()
      : await db.select()
          .from(importRecordsTable)
          .orderBy(desc(importRecordsTable.created_at))
          .execute();

    // Convert numeric fields to numbers before returning
    return results.map(record => ({
      ...record,
      total_value_usd: parseFloat(record.total_value_usd),
      weight_kg: parseFloat(record.weight_kg)
    }));
  } catch (error) {
    console.error('Failed to fetch import records:', error);
    throw error;
  }
};
