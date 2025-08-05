
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type CreateImportRecordInput } from '../schema';
import { createImportRecord } from '../handlers/create_import_record';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateImportRecordInput = {
  tracking_number: 'TRK-123456',
  supplier_name: 'Test Supplier Co.',
  supplier_contact: 'supplier@test.com',
  goods_description: 'Electronic components for testing',
  total_value_usd: 1250.75,
  weight_kg: 15.5,
  current_status: 'ORDER_PLACED',
  order_placed_date: new Date('2024-01-15'),
  order_placed_notes: 'Initial order placed with supplier',
  ecuapass_reference: 'ECP-2024-001',
  senae_declaration_number: 'SENAE-12345',
  customs_broker: 'ABC Customs Brokers'
};

describe('createImportRecord', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an import record with all fields', async () => {
    const result = await createImportRecord(testInput);

    // Basic field validation
    expect(result.tracking_number).toEqual('TRK-123456');
    expect(result.supplier_name).toEqual('Test Supplier Co.');
    expect(result.supplier_contact).toEqual('supplier@test.com');
    expect(result.goods_description).toEqual('Electronic components for testing');
    expect(result.total_value_usd).toEqual(1250.75);
    expect(typeof result.total_value_usd).toBe('number');
    expect(result.weight_kg).toEqual(15.5);
    expect(typeof result.weight_kg).toBe('number');
    expect(result.current_status).toEqual('ORDER_PLACED');
    expect(result.order_placed_date).toEqual(new Date('2024-01-15'));
    expect(result.order_placed_notes).toEqual('Initial order placed with supplier');
    expect(result.ecuapass_reference).toEqual('ECP-2024-001');
    expect(result.senae_declaration_number).toEqual('SENAE-12345');
    expect(result.customs_broker).toEqual('ABC Customs Brokers');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Stage-specific fields should be null for new records
    expect(result.shipped_date).toBeNull();
    expect(result.shipped_notes).toBeNull();
    expect(result.customs_entry_date).toBeNull();
    expect(result.customs_notes).toBeNull();
    expect(result.delivered_date).toBeNull();
    expect(result.delivered_notes).toBeNull();
  });

  it('should save import record to database', async () => {
    const result = await createImportRecord(testInput);

    // Query using proper drizzle syntax
    const records = await db.select()
      .from(importRecordsTable)
      .where(eq(importRecordsTable.id, result.id))
      .execute();

    expect(records).toHaveLength(1);
    const record = records[0];
    expect(record.tracking_number).toEqual('TRK-123456');
    expect(record.supplier_name).toEqual('Test Supplier Co.');
    expect(parseFloat(record.total_value_usd)).toEqual(1250.75);
    expect(parseFloat(record.weight_kg)).toEqual(15.5);
    expect(record.current_status).toEqual('ORDER_PLACED');
    expect(record.created_at).toBeInstanceOf(Date);
  });

  it('should create record with minimal required fields only', async () => {
    const minimalInput: CreateImportRecordInput = {
      tracking_number: 'MIN-001',
      supplier_name: 'Minimal Supplier',
      supplier_contact: null,
      goods_description: 'Basic goods',
      total_value_usd: 100.0,
      weight_kg: 1.0,
      current_status: 'ORDER_PLACED',
      order_placed_date: null,
      order_placed_notes: null,
      ecuapass_reference: null,
      senae_declaration_number: null,
      customs_broker: null
    };

    const result = await createImportRecord(minimalInput);

    expect(result.tracking_number).toEqual('MIN-001');
    expect(result.supplier_name).toEqual('Minimal Supplier');
    expect(result.supplier_contact).toBeNull();
    expect(result.total_value_usd).toEqual(100.0);
    expect(result.weight_kg).toEqual(1.0);
    expect(result.current_status).toEqual('ORDER_PLACED');
    expect(result.order_placed_date).toBeNull();
    expect(result.ecuapass_reference).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should enforce unique tracking number constraint', async () => {
    // Create first record
    await createImportRecord(testInput);

    // Attempt to create second record with same tracking number
    const duplicateInput = { ...testInput };
    
    await expect(createImportRecord(duplicateInput)).rejects.toThrow(/unique/i);
  });

  it('should handle different import statuses', async () => {
    const shippedInput: CreateImportRecordInput = {
      ...testInput,
      tracking_number: 'TRK-SHIPPED',
      current_status: 'SHIPPED'
    };

    const result = await createImportRecord(shippedInput);

    expect(result.current_status).toEqual('SHIPPED');
    expect(result.tracking_number).toEqual('TRK-SHIPPED');
  });
});
