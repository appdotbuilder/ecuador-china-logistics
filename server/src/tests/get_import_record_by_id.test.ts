
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type CreateImportRecordInput } from '../schema';
import { getImportRecordById } from '../handlers/get_import_record_by_id';

// Test import record data
const testImportRecord: CreateImportRecordInput = {
  tracking_number: 'TEST12345',
  supplier_name: 'Test Supplier Ltd',
  supplier_contact: 'supplier@test.com',
  goods_description: 'Electronic components for testing',
  total_value_usd: 1500.50,
  weight_kg: 25.750,
  current_status: 'ORDER_PLACED',
  order_placed_date: new Date('2024-01-15'),
  order_placed_notes: 'Order confirmed by supplier',
  ecuapass_reference: 'ECU123456',
  senae_declaration_number: null,
  customs_broker: 'ABC Customs Services'
};

describe('getImportRecordById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return import record by id', async () => {
    // Create test record
    const insertResult = await db.insert(importRecordsTable)
      .values({
        ...testImportRecord,
        total_value_usd: testImportRecord.total_value_usd.toString(),
        weight_kg: testImportRecord.weight_kg.toString()
      })
      .returning()
      .execute();

    const createdRecord = insertResult[0];

    // Fetch by ID
    const result = await getImportRecordById(createdRecord.id);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(createdRecord.id);
    expect(result!.tracking_number).toBe('TEST12345');
    expect(result!.supplier_name).toBe('Test Supplier Ltd');
    expect(result!.supplier_contact).toBe('supplier@test.com');
    expect(result!.goods_description).toBe('Electronic components for testing');
    expect(result!.total_value_usd).toBe(1500.50);
    expect(result!.weight_kg).toBe(25.750);
    expect(result!.current_status).toBe('ORDER_PLACED');
    expect(result!.order_placed_date).toEqual(new Date('2024-01-15'));
    expect(result!.order_placed_notes).toBe('Order confirmed by supplier');
    expect(result!.ecuapass_reference).toBe('ECU123456');
    expect(result!.senae_declaration_number).toBeNull();
    expect(result!.customs_broker).toBe('ABC Customs Services');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent id', async () => {
    const result = await getImportRecordById(99999);
    expect(result).toBeNull();
  });

  it('should convert numeric fields correctly', async () => {
    // Create test record
    const insertResult = await db.insert(importRecordsTable)
      .values({
        ...testImportRecord,
        total_value_usd: testImportRecord.total_value_usd.toString(),
        weight_kg: testImportRecord.weight_kg.toString()
      })
      .returning()
      .execute();

    const result = await getImportRecordById(insertResult[0].id);

    expect(result).not.toBeNull();
    expect(typeof result!.total_value_usd).toBe('number');
    expect(typeof result!.weight_kg).toBe('number');
    expect(result!.total_value_usd).toBe(1500.50);
    expect(result!.weight_kg).toBe(25.750);
  });

  it('should handle records with nullable fields', async () => {
    const minimalRecord = {
      tracking_number: 'MIN001',
      supplier_name: 'Minimal Supplier',
      supplier_contact: null,
      goods_description: 'Basic goods',
      total_value_usd: '100.00',
      weight_kg: '5.000',
      current_status: 'ORDER_PLACED' as const,
      order_placed_date: null,
      order_placed_notes: null,
      ecuapass_reference: null,
      senae_declaration_number: null,
      customs_broker: null
    };

    const insertResult = await db.insert(importRecordsTable)
      .values(minimalRecord)
      .returning()
      .execute();

    const result = await getImportRecordById(insertResult[0].id);

    expect(result).not.toBeNull();
    expect(result!.supplier_contact).toBeNull();
    expect(result!.order_placed_date).toBeNull();
    expect(result!.order_placed_notes).toBeNull();
    expect(result!.ecuapass_reference).toBeNull();
    expect(result!.senae_declaration_number).toBeNull();
    expect(result!.customs_broker).toBeNull();
    expect(result!.total_value_usd).toBe(100.00);
    expect(result!.weight_kg).toBe(5.000);
  });
});
