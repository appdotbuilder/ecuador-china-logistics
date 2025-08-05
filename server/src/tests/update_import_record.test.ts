
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type CreateImportRecordInput, type UpdateImportRecordInput } from '../schema';
import { updateImportRecord } from '../handlers/update_import_record';
import { eq } from 'drizzle-orm';

// Test inputs
const testCreateInput: CreateImportRecordInput = {
  tracking_number: 'TEST123',
  supplier_name: 'Test Supplier',
  supplier_contact: 'supplier@test.com',
  goods_description: 'Test goods for import',
  total_value_usd: 1500.50,
  weight_kg: 25.5,
  current_status: 'ORDER_PLACED',
  order_placed_date: new Date('2024-01-15'),
  order_placed_notes: 'Initial order notes',
  ecuapass_reference: 'ECP123456',
  senae_declaration_number: 'SENAE789',
  customs_broker: 'Test Broker Inc'
};

describe('updateImportRecord', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test record
  const createTestRecord = async () => {
    const result = await db.insert(importRecordsTable)
      .values({
        tracking_number: testCreateInput.tracking_number,
        supplier_name: testCreateInput.supplier_name,
        supplier_contact: testCreateInput.supplier_contact,
        goods_description: testCreateInput.goods_description,
        total_value_usd: testCreateInput.total_value_usd.toString(),
        weight_kg: testCreateInput.weight_kg.toString(),
        current_status: testCreateInput.current_status,
        order_placed_date: testCreateInput.order_placed_date,
        order_placed_notes: testCreateInput.order_placed_notes,
        ecuapass_reference: testCreateInput.ecuapass_reference,
        senae_declaration_number: testCreateInput.senae_declaration_number,
        customs_broker: testCreateInput.customs_broker
      })
      .returning()
      .execute();

    return {
      ...result[0],
      total_value_usd: parseFloat(result[0].total_value_usd),
      weight_kg: parseFloat(result[0].weight_kg)
    };
  };

  it('should update basic import record fields', async () => {
    // Create initial record
    const created = await createTestRecord();

    const updateInput: UpdateImportRecordInput = {
      id: created.id,
      supplier_name: 'Updated Supplier Name',
      goods_description: 'Updated goods description',
      total_value_usd: 2000.75,
      weight_kg: 30.2
    };

    const result = await updateImportRecord(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.supplier_name).toEqual('Updated Supplier Name');
    expect(result.goods_description).toEqual('Updated goods description');
    expect(result.total_value_usd).toEqual(2000.75);
    expect(result.weight_kg).toEqual(30.2);
    
    // Unchanged fields should remain the same
    expect(result.tracking_number).toEqual('TEST123');
    expect(result.supplier_contact).toEqual('supplier@test.com');
    expect(result.current_status).toEqual('ORDER_PLACED');
    
    // updated_at should be different from created_at  
    expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
  });

  it('should update status and stage-specific fields', async () => {
    // Create initial record
    const created = await createTestRecord();

    const updateInput: UpdateImportRecordInput = {
      id: created.id,
      current_status: 'SHIPPED',
      shipped_date: new Date('2024-01-20'),
      shipped_notes: 'Package shipped via air freight'
    };

    const result = await updateImportRecord(updateInput);

    expect(result.current_status).toEqual('SHIPPED');
    expect(result.shipped_date).toEqual(new Date('2024-01-20'));
    expect(result.shipped_notes).toEqual('Package shipped via air freight');
    
    // Other stage fields should remain unchanged
    expect(result.order_placed_date).toEqual(new Date('2024-01-15'));
    expect(result.order_placed_notes).toEqual('Initial order notes');
    expect(result.customs_entry_date).toBeNull();
    expect(result.delivered_date).toBeNull();
  });

  it('should update compliance fields', async () => {
    // Create initial record
    const created = await createTestRecord();

    const updateInput: UpdateImportRecordInput = {
      id: created.id,
      ecuapass_reference: 'ECP987654',
      senae_declaration_number: 'SENAE456',
      customs_broker: 'Updated Broker LLC'
    };

    const result = await updateImportRecord(updateInput);

    expect(result.ecuapass_reference).toEqual('ECP987654');
    expect(result.senae_declaration_number).toEqual('SENAE456');
    expect(result.customs_broker).toEqual('Updated Broker LLC');
  });

  it('should handle nullable fields correctly', async () => {
    // Create initial record
    const created = await createTestRecord();

    const updateInput: UpdateImportRecordInput = {
      id: created.id,
      supplier_contact: null,
      order_placed_notes: null,
      customs_broker: null
    };

    const result = await updateImportRecord(updateInput);

    expect(result.supplier_contact).toBeNull();
    expect(result.order_placed_notes).toBeNull();
    expect(result.customs_broker).toBeNull();
  });

  it('should save updates to database', async () => {
    // Create initial record
    const created = await createTestRecord();

    const updateInput: UpdateImportRecordInput = {
      id: created.id,
      supplier_name: 'Database Updated Supplier',
      total_value_usd: 3000.25
    };

    await updateImportRecord(updateInput);

    // Query database directly to verify changes
    const records = await db.select()
      .from(importRecordsTable)
      .where(eq(importRecordsTable.id, created.id))
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].supplier_name).toEqual('Database Updated Supplier');
    expect(parseFloat(records[0].total_value_usd)).toEqual(3000.25);
    expect(records[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent record', async () => {
    const updateInput: UpdateImportRecordInput = {
      id: 99999,
      supplier_name: 'Non-existent Record'
    };

    expect(updateImportRecord(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle partial updates correctly', async () => {
    // Create initial record
    const created = await createTestRecord();

    // Update only one field
    const updateInput: UpdateImportRecordInput = {
      id: created.id,
      tracking_number: 'UPDATED123'
    };

    const result = await updateImportRecord(updateInput);

    // Only the updated field should change
    expect(result.tracking_number).toEqual('UPDATED123');
    expect(result.supplier_name).toEqual('Test Supplier');
    expect(result.goods_description).toEqual('Test goods for import');
    expect(result.total_value_usd).toEqual(1500.50);
    expect(result.weight_kg).toEqual(25.5);
  });

  it('should validate numeric type conversions', async () => {
    // Create initial record
    const created = await createTestRecord();

    const updateInput: UpdateImportRecordInput = {
      id: created.id,
      total_value_usd: 1234.56,
      weight_kg: 78.123
    };

    const result = await updateImportRecord(updateInput);

    expect(typeof result.total_value_usd).toBe('number');
    expect(typeof result.weight_kg).toBe('number');
    expect(result.total_value_usd).toEqual(1234.56);
    expect(result.weight_kg).toEqual(78.123);
  });
});
