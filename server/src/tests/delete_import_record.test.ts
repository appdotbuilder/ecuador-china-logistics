
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type CreateImportRecordInput } from '../schema';
import { deleteImportRecord } from '../handlers/delete_import_record';
import { eq } from 'drizzle-orm';

// Test input for creating import records
const testInput: CreateImportRecordInput = {
  tracking_number: 'TR123456789',
  supplier_name: 'Test Supplier Co.',
  supplier_contact: 'contact@testsupplier.com',
  goods_description: 'Electronics and components',
  total_value_usd: 1500.50,
  weight_kg: 25.750,
  current_status: 'ORDER_PLACED',
  order_placed_date: new Date('2024-01-15'),
  order_placed_notes: 'Initial order placed',
  ecuapass_reference: 'ECP-2024-001',
  senae_declaration_number: null,
  customs_broker: 'ABC Customs Broker'
};

describe('deleteImportRecord', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing import record', async () => {
    // Create a test record
    const insertResult = await db.insert(importRecordsTable)
      .values({
        ...testInput,
        total_value_usd: testInput.total_value_usd.toString(),
        weight_kg: testInput.weight_kg.toString()
      })
      .returning()
      .execute();

    const createdRecord = insertResult[0];
    expect(createdRecord.id).toBeDefined();

    // Delete the record
    const deleteResult = await deleteImportRecord(createdRecord.id);

    expect(deleteResult).toBe(true);

    // Verify the record was deleted
    const records = await db.select()
      .from(importRecordsTable)
      .where(eq(importRecordsTable.id, createdRecord.id))
      .execute();

    expect(records).toHaveLength(0);
  });

  it('should return false for non-existent record', async () => {
    const nonExistentId = 99999;

    const deleteResult = await deleteImportRecord(nonExistentId);

    expect(deleteResult).toBe(false);
  });

  it('should not affect other records when deleting', async () => {
    // Create two test records
    const firstRecord = await db.insert(importRecordsTable)
      .values({
        ...testInput,
        tracking_number: 'TR111111111',
        total_value_usd: testInput.total_value_usd.toString(),
        weight_kg: testInput.weight_kg.toString()
      })
      .returning()
      .execute();

    const secondRecord = await db.insert(importRecordsTable)
      .values({
        ...testInput,
        tracking_number: 'TR222222222',
        total_value_usd: testInput.total_value_usd.toString(),
        weight_kg: testInput.weight_kg.toString()
      })
      .returning()
      .execute();

    // Delete the first record
    const deleteResult = await deleteImportRecord(firstRecord[0].id);

    expect(deleteResult).toBe(true);

    // Verify first record is deleted
    const firstRecordCheck = await db.select()
      .from(importRecordsTable)
      .where(eq(importRecordsTable.id, firstRecord[0].id))
      .execute();

    expect(firstRecordCheck).toHaveLength(0);

    // Verify second record still exists
    const secondRecordCheck = await db.select()
      .from(importRecordsTable)
      .where(eq(importRecordsTable.id, secondRecord[0].id))
      .execute();

    expect(secondRecordCheck).toHaveLength(1);
    expect(secondRecordCheck[0].tracking_number).toEqual('TR222222222');
  });
});
