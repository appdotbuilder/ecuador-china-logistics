
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { importRecordsTable } from '../db/schema';
import { type CreateImportRecordInput, type ImportRecordFilters } from '../schema';
import { getImportRecords } from '../handlers/get_import_records';

// Test data for import records
const testRecord1: CreateImportRecordInput = {
  tracking_number: 'TRK001',
  supplier_name: 'Supplier One',
  supplier_contact: 'contact1@supplier1.com',
  goods_description: 'Electronics components',
  total_value_usd: 1500.00,
  weight_kg: 25.5,
  current_status: 'ORDER_PLACED',
  order_placed_date: new Date('2024-01-15'),
  order_placed_notes: 'Order confirmed',
  ecuapass_reference: 'EC001',
  senae_declaration_number: 'SN001',
  customs_broker: 'Broker One'
};

const testRecord2: CreateImportRecordInput = {
  tracking_number: 'TRK002',
  supplier_name: 'Supplier Two',
  supplier_contact: null,
  goods_description: 'Textile products',
  total_value_usd: 800.50,
  weight_kg: 15.2,
  current_status: 'SHIPPED',
  order_placed_date: new Date('2024-01-10'),
  order_placed_notes: null,
  ecuapass_reference: null,
  senae_declaration_number: null,
  customs_broker: null
};

const testRecord3: CreateImportRecordInput = {
  tracking_number: 'ABC123',
  supplier_name: 'Different Company', // Changed to avoid "Supplier" substring match
  supplier_contact: 'different@supplier.com',
  goods_description: 'Medical equipment',
  total_value_usd: 3200.75,
  weight_kg: 45.8,
  current_status: 'DELIVERED',
  order_placed_date: new Date('2024-01-20'),
  order_placed_notes: 'Urgent delivery',
  ecuapass_reference: 'EC003',
  senae_declaration_number: 'SN003',
  customs_broker: 'Broker Two'
};

describe('getImportRecords', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all import records when no filters applied', async () => {
    // Create first record
    await db.insert(importRecordsTable).values({
      ...testRecord1,
      total_value_usd: testRecord1.total_value_usd.toString(),
      weight_kg: testRecord1.weight_kg.toString()
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second record (this will be more recent)
    await db.insert(importRecordsTable).values({
      ...testRecord2,
      total_value_usd: testRecord2.total_value_usd.toString(),
      weight_kg: testRecord2.weight_kg.toString()
    }).execute();

    const results = await getImportRecords();

    expect(results).toHaveLength(2);
    // The second record should be first due to desc ordering by created_at
    expect(results[0].tracking_number).toEqual('TRK002');
    expect(results[1].tracking_number).toEqual('TRK001');
    
    // Verify numeric conversion
    expect(typeof results[0].total_value_usd).toBe('number');
    expect(typeof results[0].weight_kg).toBe('number');
    expect(results[0].total_value_usd).toEqual(800.50);
    expect(results[0].weight_kg).toEqual(15.2);
  });

  it('should filter by status', async () => {
    // Create test records with different statuses
    await db.insert(importRecordsTable).values([
      {
        ...testRecord1,
        total_value_usd: testRecord1.total_value_usd.toString(),
        weight_kg: testRecord1.weight_kg.toString()
      },
      {
        ...testRecord2,
        total_value_usd: testRecord2.total_value_usd.toString(),
        weight_kg: testRecord2.weight_kg.toString()
      },
      {
        ...testRecord3,
        total_value_usd: testRecord3.total_value_usd.toString(),
        weight_kg: testRecord3.weight_kg.toString()
      }
    ]).execute();

    const filters: ImportRecordFilters = { status: 'SHIPPED' };
    const results = await getImportRecords(filters);

    expect(results).toHaveLength(1);
    expect(results[0].current_status).toEqual('SHIPPED');
    expect(results[0].tracking_number).toEqual('TRK002');
  });

  it('should filter by tracking number with partial match', async () => {
    // Create test records
    await db.insert(importRecordsTable).values([
      {
        ...testRecord1,
        total_value_usd: testRecord1.total_value_usd.toString(),
        weight_kg: testRecord1.weight_kg.toString()
      },
      {
        ...testRecord3,
        total_value_usd: testRecord3.total_value_usd.toString(),
        weight_kg: testRecord3.weight_kg.toString()
      }
    ]).execute();

    const filters: ImportRecordFilters = { tracking_number: 'TRK' };
    const results = await getImportRecords(filters);

    expect(results).toHaveLength(1);
    expect(results[0].tracking_number).toEqual('TRK001');

    // Test case insensitive search
    const filtersLower: ImportRecordFilters = { tracking_number: 'abc' };
    const resultsLower = await getImportRecords(filtersLower);

    expect(resultsLower).toHaveLength(1);
    expect(resultsLower[0].tracking_number).toEqual('ABC123');
  });

  it('should filter by supplier name with partial match', async () => {
    // Create test records - only the ones for this specific test
    await db.insert(importRecordsTable).values([
      {
        ...testRecord1,
        total_value_usd: testRecord1.total_value_usd.toString(),
        weight_kg: testRecord1.weight_kg.toString()
      },
      {
        ...testRecord2,
        total_value_usd: testRecord2.total_value_usd.toString(),
        weight_kg: testRecord2.weight_kg.toString()
      },
      {
        ...testRecord3,
        total_value_usd: testRecord3.total_value_usd.toString(),
        weight_kg: testRecord3.weight_kg.toString()
      }
    ]).execute();

    const filters: ImportRecordFilters = { supplier_name: 'Supplier' };
    const results = await getImportRecords(filters);

    // Should match "Supplier One" and "Supplier Two", but NOT "Different Company"
    expect(results).toHaveLength(2);
    const supplierNames = results.map(r => r.supplier_name);
    expect(supplierNames).toContain('Supplier One');
    expect(supplierNames).toContain('Supplier Two');
    expect(supplierNames).not.toContain('Different Company');
  });

  it('should filter by date range', async () => {
    // Create record with current timestamp (which will be within our date range)
    await db.insert(importRecordsTable).values({
      ...testRecord1,
      total_value_usd: testRecord1.total_value_usd.toString(),
      weight_kg: testRecord1.weight_kg.toString()
    }).execute();

    // Use a date range that includes today
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filters: ImportRecordFilters = {
      date_from: yesterday,
      date_to: tomorrow
    };
    const results = await getImportRecords(filters);

    expect(results).toHaveLength(1);
    expect(results[0].created_at).toBeInstanceOf(Date);
    expect(results[0].created_at >= yesterday).toBe(true);
    expect(results[0].created_at <= tomorrow).toBe(true);
  });

  it('should combine multiple filters', async () => {
    // Create test records
    await db.insert(importRecordsTable).values([
      {
        ...testRecord1,
        total_value_usd: testRecord1.total_value_usd.toString(),
        weight_kg: testRecord1.weight_kg.toString()
      },
      {
        ...testRecord2,
        total_value_usd: testRecord2.total_value_usd.toString(),
        weight_kg: testRecord2.weight_kg.toString()
      }
    ]).execute();

    const filters: ImportRecordFilters = {
      status: 'ORDER_PLACED',
      supplier_name: 'Supplier One'
    };
    const results = await getImportRecords(filters);

    expect(results).toHaveLength(1);
    expect(results[0].current_status).toEqual('ORDER_PLACED');
    expect(results[0].supplier_name).toEqual('Supplier One');
  });

  it('should return empty array when no records match filters', async () => {
    // Create test record
    await db.insert(importRecordsTable).values({
      ...testRecord1,
      total_value_usd: testRecord1.total_value_usd.toString(),
      weight_kg: testRecord1.weight_kg.toString()
    }).execute();

    const filters: ImportRecordFilters = { status: 'IN_CUSTOMS' };
    const results = await getImportRecords(filters);

    expect(results).toHaveLength(0);
  });

  it('should return results ordered by created_at desc', async () => {
    // Create first record
    await db.insert(importRecordsTable).values({
      ...testRecord1,
      total_value_usd: testRecord1.total_value_usd.toString(),
      weight_kg: testRecord1.weight_kg.toString()
    }).execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second record
    await db.insert(importRecordsTable).values({
      ...testRecord2,
      total_value_usd: testRecord2.total_value_usd.toString(),
      weight_kg: testRecord2.weight_kg.toString()
    }).execute();

    const results = await getImportRecords();

    expect(results).toHaveLength(2);
    // Second record should be first (most recent)
    expect(results[0].created_at >= results[1].created_at).toBe(true);
  });
});
