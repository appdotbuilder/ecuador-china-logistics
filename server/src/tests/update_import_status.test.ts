
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type UpdateImportStatusInput, type CreateImportRecordInput } from '../schema';
import { updateImportStatus } from '../handlers/update_import_status';
import { eq } from 'drizzle-orm';

// Helper function to create a test import record directly
const createTestRecord = async (input: CreateImportRecordInput) => {
  const result = await db.insert(importRecordsTable)
    .values({
      tracking_number: input.tracking_number,
      supplier_name: input.supplier_name,
      supplier_contact: input.supplier_contact,
      goods_description: input.goods_description,
      total_value_usd: input.total_value_usd.toString(),
      weight_kg: input.weight_kg.toString(),
      current_status: input.current_status,
      order_placed_date: input.order_placed_date,
      order_placed_notes: input.order_placed_notes,
      ecuapass_reference: input.ecuapass_reference,
      senae_declaration_number: input.senae_declaration_number,
      customs_broker: input.customs_broker
    })
    .returning()
    .execute();

  const record = result[0];
  return {
    ...record,
    total_value_usd: parseFloat(record.total_value_usd),
    weight_kg: parseFloat(record.weight_kg)
  };
};

// Test input for creating a base import record
const testCreateInput: CreateImportRecordInput = {
  tracking_number: 'TEST-001',
  supplier_name: 'Test Supplier',
  supplier_contact: 'test@supplier.com',
  goods_description: 'Test goods',
  total_value_usd: 1000.50,
  weight_kg: 25.5,
  current_status: 'ORDER_PLACED',
  order_placed_date: new Date('2024-01-01'),
  order_placed_notes: 'Initial order',
  ecuapass_reference: 'ECP-001',
  senae_declaration_number: 'SENAE-001',
  customs_broker: 'Test Broker'
};

describe('updateImportStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update status to SHIPPED with date and notes', async () => {
    // Create initial record
    const created = await createTestRecord(testCreateInput);
    
    const updateInput: UpdateImportStatusInput = {
      id: created.id,
      status: 'SHIPPED',
      date: new Date('2024-01-05'),
      notes: 'Package shipped via DHL'
    };

    const result = await updateImportStatus(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.current_status).toEqual('SHIPPED');
    expect(result.shipped_date).toEqual(new Date('2024-01-05'));
    expect(result.shipped_notes).toEqual('Package shipped via DHL');
    expect(result.updated_at).toBeInstanceOf(Date);
    
    // Verify other fields remain unchanged
    expect(result.tracking_number).toEqual('TEST-001');
    expect(result.total_value_usd).toEqual(1000.50);
    expect(result.weight_kg).toEqual(25.5);
  });

  it('should update status to IN_CUSTOMS with customs date and notes', async () => {
    const created = await createTestRecord(testCreateInput);
    
    const updateInput: UpdateImportStatusInput = {
      id: created.id,
      status: 'IN_CUSTOMS',
      date: new Date('2024-01-10'),
      notes: 'Entered customs clearance'
    };

    const result = await updateImportStatus(updateInput);

    expect(result.current_status).toEqual('IN_CUSTOMS');
    expect(result.customs_entry_date).toEqual(new Date('2024-01-10'));
    expect(result.customs_notes).toEqual('Entered customs clearance');
  });

  it('should update status to DELIVERED with delivery date and notes', async () => {
    const created = await createTestRecord(testCreateInput);
    
    const updateInput: UpdateImportStatusInput = {
      id: created.id,
      status: 'DELIVERED',
      date: new Date('2024-01-15'),
      notes: 'Delivered to warehouse'
    };

    const result = await updateImportStatus(updateInput);

    expect(result.current_status).toEqual('DELIVERED');
    expect(result.delivered_date).toEqual(new Date('2024-01-15'));
    expect(result.delivered_notes).toEqual('Delivered to warehouse');
  });

  it('should handle null notes', async () => {
    const created = await createTestRecord(testCreateInput);
    
    const updateInput: UpdateImportStatusInput = {
      id: created.id,
      status: 'SHIPPED',
      date: new Date('2024-01-05'),
      notes: null
    };

    const result = await updateImportStatus(updateInput);

    expect(result.current_status).toEqual('SHIPPED');
    expect(result.shipped_date).toEqual(new Date('2024-01-05'));
    expect(result.shipped_notes).toBe(null);
  });

  it('should save status update to database', async () => {
    const created = await createTestRecord(testCreateInput);
    
    const updateInput: UpdateImportStatusInput = {
      id: created.id,
      status: 'SHIPPED',
      date: new Date('2024-01-05'),
      notes: 'Package shipped'
    };

    await updateImportStatus(updateInput);

    // Query database to verify update
    const records = await db.select()
      .from(importRecordsTable)
      .where(eq(importRecordsTable.id, created.id))
      .execute();

    expect(records).toHaveLength(1);
    const record = records[0];
    expect(record.current_status).toEqual('SHIPPED');
    expect(record.shipped_date).toEqual(new Date('2024-01-05'));
    expect(record.shipped_notes).toEqual('Package shipped');
    expect(record.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent record', async () => {
    const updateInput: UpdateImportStatusInput = {
      id: 999999,
      status: 'SHIPPED',
      date: new Date(),
      notes: 'Test'
    };

    await expect(updateImportStatus(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle ORDER_PLACED status update correctly', async () => {
    const created = await createTestRecord(testCreateInput);
    
    const updateInput: UpdateImportStatusInput = {
      id: created.id,
      status: 'ORDER_PLACED',
      date: new Date('2024-01-02'),
      notes: 'Order confirmed with supplier'
    };

    const result = await updateImportStatus(updateInput);

    expect(result.current_status).toEqual('ORDER_PLACED');
    expect(result.order_placed_date).toEqual(new Date('2024-01-02'));
    expect(result.order_placed_notes).toEqual('Order confirmed with supplier');
  });
});
