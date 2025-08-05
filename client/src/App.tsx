
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect, useCallback } from 'react';
import { Truck, Package, FileText, CheckCircle, Clock, Ship, Building } from 'lucide-react';
import type { ImportRecord, CreateImportRecordInput, ImportStatus, ImportRecordFilters, UpdateImportStatusInput } from '../../server/src/schema';

// Stub data for demonstration (since backend handlers are placeholders)
const STUB_IMPORT_RECORDS: ImportRecord[] = [
  {
    id: 1,
    tracking_number: 'CHN2024001',
    supplier_name: 'Shanghai Electronics Co.',
    supplier_contact: 'contact@shanghai-electronics.com',
    goods_description: 'Electronic components and semiconductors',
    total_value_usd: 15000,
    weight_kg: 250,
    current_status: 'DELIVERED' as ImportStatus,
    order_placed_date: new Date('2024-01-15'),
    order_placed_notes: 'Initial order placed with 30% advance payment',
    shipped_date: new Date('2024-01-22'),
    shipped_notes: 'Shipped via China Post EMS',
    customs_entry_date: new Date('2024-02-05'),
    customs_notes: 'Standard customs clearance completed',
    delivered_date: new Date('2024-02-08'),
    delivered_notes: 'Delivered to warehouse in Quito',
    ecuapass_reference: 'ECP-2024-001234',
    senae_declaration_number: 'SNE-2024-567890',
    customs_broker: 'Ecuador Customs Services SA',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-02-08')
  },
  {
    id: 2,
    tracking_number: 'CHN2024002',
    supplier_name: 'Guangzhou Textile Manufacturing',
    supplier_contact: null,
    goods_description: 'Cotton fabrics and textile materials',
    total_value_usd: 8500,
    weight_kg: 180,
    current_status: 'IN_CUSTOMS' as ImportStatus,
    order_placed_date: new Date('2024-02-01'),
    order_placed_notes: 'Bulk order for Q1 inventory',
    shipped_date: new Date('2024-02-10'),
    shipped_notes: 'Shipped via maritime container',
    customs_entry_date: new Date('2024-02-25'),
    customs_notes: 'Awaiting additional documentation',
    delivered_date: null,
    delivered_notes: null,
    ecuapass_reference: 'ECP-2024-001235',
    senae_declaration_number: 'SNE-2024-567891',
    customs_broker: 'Ecuador Customs Services SA',
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-25')
  }
];

function App() {
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ImportRecord | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Form state for creating new import records
  const [formData, setFormData] = useState<CreateImportRecordInput>({
    tracking_number: '',
    supplier_name: '',
    supplier_contact: null,
    goods_description: '',
    total_value_usd: 0,
    weight_kg: 0,
    current_status: 'ORDER_PLACED',
    order_placed_date: null,
    order_placed_notes: null,
    ecuapass_reference: null,
    senae_declaration_number: null,
    customs_broker: null
  });

  // Status update form state
  const [statusUpdateForm, setStatusUpdateForm] = useState<UpdateImportStatusInput>({
    id: 0,
    status: 'ORDER_PLACED',
    date: new Date(),
    notes: null
  });

  // Filter state
  const [filters, setFilters] = useState<ImportRecordFilters>({});

  // Load import records
  const loadImportRecords = useCallback(async () => {
    try {
      // STUB: Using stub data since backend handlers are placeholders
      // In real implementation, this would be:
      // const result = await trpc.getImportRecords.query(filters);
      console.log('STUB: Using mock data - backend handlers are placeholders');
      setImportRecords(STUB_IMPORT_RECORDS);
    } catch (error) {
      console.error('Failed to load import records:', error);
    }
  }, []);

  useEffect(() => {
    loadImportRecords();
  }, [loadImportRecords]);

  const handleCreateImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // STUB: Simulating API call since backend handlers are placeholders
      console.log('STUB: Creating import record with mock data');
      const newRecord: ImportRecord = {
        id: Math.max(...importRecords.map(r => r.id), 0) + 1,
        ...formData,
        shipped_date: null,
        shipped_notes: null,
        customs_entry_date: null,
        customs_notes: null,
        delivered_date: null,
        delivered_notes: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      setImportRecords((prev: ImportRecord[]) => [newRecord, ...prev]);
      
      // Reset form
      setFormData({
        tracking_number: '',
        supplier_name: '',
        supplier_contact: null,
        goods_description: '',
        total_value_usd: 0,
        weight_kg: 0,
        current_status: 'ORDER_PLACED',
        order_placed_date: null,
        order_placed_notes: null,
        ecuapass_reference: null,
        senae_declaration_number: null,
        customs_broker: null
      });
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create import record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // STUB: Simulating status update since backend handlers are placeholders
      console.log('STUB: Updating status with mock data');
      
      const updatedRecords = importRecords.map(record => {
        if (record.id === statusUpdateForm.id) {
          const updatedRecord = { ...record };
          updatedRecord.current_status = statusUpdateForm.status;
          updatedRecord.updated_at = new Date();

          // Update appropriate date and notes fields based on status
          switch (statusUpdateForm.status) {
            case 'ORDER_PLACED':
              updatedRecord.order_placed_date = statusUpdateForm.date;
              updatedRecord.order_placed_notes = statusUpdateForm.notes;
              break;
            case 'SHIPPED':
              updatedRecord.shipped_date = statusUpdateForm.date;
              updatedRecord.shipped_notes = statusUpdateForm.notes;
              break;
            case 'IN_CUSTOMS':
              updatedRecord.customs_entry_date = statusUpdateForm.date;
              updatedRecord.customs_notes = statusUpdateForm.notes;
              break;
            case 'DELIVERED':
              updatedRecord.delivered_date = statusUpdateForm.date;
              updatedRecord.delivered_notes = statusUpdateForm.notes;
              break;
          }

          return updatedRecord;
        }
        return record;
      });

      setImportRecords(updatedRecords);
      setIsStatusDialogOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ImportStatus) => {
    switch (status) {
      case 'ORDER_PLACED':
        return <FileText className="h-4 w-4" />;
      case 'SHIPPED':
        return <Ship className="h-4 w-4" />;
      case 'IN_CUSTOMS':
        return <Building className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ImportStatus) => {
    switch (status) {
      case 'ORDER_PLACED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_CUSTOMS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openStatusDialog = (record: ImportRecord) => {
    setSelectedRecord(record);
    setStatusUpdateForm({
      id: record.id,
      status: record.current_status,
      date: new Date(),
      notes: null
    });
    setIsStatusDialogOpen(true);
  };

  const currentStatusFilter = filters.status || 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">🇨🇳➡️🇪🇨 Import Logistics Tracker</h1>
          </div>
          <p className="text-gray-600">Manage imports from China to Ecuador with SENAE & ECUAPASS compliance</p>
          
          {/* STUB Warning */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              📍 <strong>Demo Mode:</strong> This application uses stub data since backend handlers are placeholder implementations. 
              All functionality is demonstrated with mock data.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Select value={currentStatusFilter} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value as ImportStatus }))
            }>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ORDER_PLACED">Order Placed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="IN_CUSTOMS">In Customs</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Search by tracking number..."
              className="w-64"
              value={filters.tracking_number || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters(prev => ({ ...prev, tracking_number: e.target.value || undefined }))
              }
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Package className="h-4 w-4 mr-2" />
                New Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Import Record</DialogTitle>
                <DialogDescription>
                  Add a new import shipment from China to Ecuador
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateImport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tracking_number">Tracking Number *</Label>
                    <Input
                      id="tracking_number"
                      value={formData.tracking_number}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, tracking_number: e.target.value }))
                      }
                      placeholder="CHN2024XXX"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="supplier_name">Supplier Name *</Label>
                    <Input
                      id="supplier_name"
                      value={formData.supplier_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, supplier_name: e.target.value }))
                      }
                      placeholder="Shanghai Electronics Co."
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="supplier_contact">Supplier Contact</Label>
                  <Input
                    id="supplier_contact"
                    value={formData.supplier_contact || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, supplier_contact: e.target.value || null }))
                    }
                    placeholder="contact@supplier.com"
                  />
                </div>

                <div>
                  <Label htmlFor="goods_description">Goods Description *</Label>
                  <Textarea
                    id="goods_description"
                    value={formData.goods_description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData(prev => ({ ...prev, goods_description: e.target.value }))
                    }
                    placeholder="Electronic components, textiles, machinery..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_value_usd">Total Value (USD) *</Label>
                    <Input
                      id="total_value_usd"
                      type="number"
                      value={formData.total_value_usd}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, total_value_usd: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight_kg">Weight (kg) *</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ecuapass_reference">ECUAPASS Reference</Label>
                    <Input
                      id="ecuapass_reference"
                      value={formData.ecuapass_reference || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, ecuapass_reference: e.target.value || null }))
                      }
                      placeholder="ECP-2024-XXXXXX"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="senae_declaration_number">SENAE Declaration</Label>
                    <Input
                      id="senae_declaration_number"
                      value={formData.senae_declaration_number || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, senae_declaration_number: e.target.value || null }))
                      }
                      placeholder="SNE-2024-XXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customs_broker">Customs Broker</Label>
                  <Input
                    id="customs_broker"
                    value={formData.customs_broker || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, customs_broker: e.target.value || null }))
                    }
                    placeholder="Ecuador Customs Services SA"
                  />
                </div>

                <div>
                  <Label htmlFor="order_placed_notes">Initial Notes</Label>
                  <Textarea
                    id="order_placed_notes"
                    value={formData.order_placed_notes || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData(prev => ({ ...prev, order_placed_notes: e.target.value || null }))
                    }
                    placeholder="Additional notes about the order..."
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Import'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Import Records Grid */}
        {importRecords.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No import records yet</p>
              <p className="text-gray-400">Create your first import to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {importRecords.map((record: ImportRecord) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(record.current_status)}
                        {record.tracking_number}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {record.supplier_name} • {record.goods_description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(record.current_status)} border`}>
                        {record.current_status.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusDialog(record)}
                      >
                        Update Status
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">📦 Shipment Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">Value:</span> ${record.total_value_usd.toLocaleString()}</p>
                        <p><span className="text-gray-500">Weight:</span> {record.weight_kg} kg</p>
                        {record.supplier_contact && (
                          <p><span className="text-gray-500">Contact:</span> {record.supplier_contact}</p>
                        )}
                      </div>
                    </div>

                    {/* Compliance Info */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">📋 Compliance</h4>
                      <div className="space-y-1 text-sm">
                        {record.ecuapass_reference && (
                          <p><span className="text-gray-500">ECUAPASS:</span> {record.ecuapass_reference}</p>
                        )}
                        {record.senae_declaration_number && (
                          <p><span className="text-gray-500">SENAE:</span> {record.senae_declaration_number}</p>
                        )}
                        {record.customs_broker && (
                          <p><span className="text-gray-500">Broker:</span> {record.customs_broker}</p>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">⏱️ Timeline</h4>
                      <div className="space-y-1 text-sm">
                        {record.order_placed_date && (
                          <p><span className="text-gray-500">Ordered:</span> {record.order_placed_date.toLocaleDateString()}</p>
                        )}
                        {record.shipped_date && (
                          <p><span className="text-gray-500">Shipped:</span> {record.shipped_date.toLocaleDateString()}</p>
                        )}
                        {record.customs_entry_date && (
                          <p><span className="text-gray-500">Customs:</span> {record.customs_entry_date.toLocaleDateString()}</p>
                        )}
                        {record.delivered_date && (
                          <p><span className="text-gray-500">Delivered:</span> {record.delivered_date.toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status-specific Notes */}
                  {(record.order_placed_notes || record.shipped_notes || record.customs_notes || record.delivered_notes) && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">📝 Notes</h4>
                        <div className="space-y-2 text-sm">
                          {record.order_placed_notes && (
                            <p><span className="text-blue-600 font-medium">Order:</span> {record.order_placed_notes}</p>
                          )}
                          {record.shipped_notes && (
                            <p><span className="text-yellow-600 font-medium">Shipping:</span> {record.shipped_notes}</p>
                          )}
                          {record.customs_notes && (
                            <p><span className="text-orange-600 font-medium">Customs:</span> {record.customs_notes}</p>
                          )}
                          {record.delivered_notes && (
                            <p><span className="text-green-600 font-medium">Delivery:</span> {record.delivered_notes}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Import Status</DialogTitle>
              <DialogDescription>
                Update the status for tracking number: {selectedRecord?.tracking_number}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={statusUpdateForm.status}
                  onValueChange={(value) =>
                    setStatusUpdateForm(prev => ({ ...prev, status: value as ImportStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORDER_PLACED">Order Placed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="IN_CUSTOMS">In Customs</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status_date">Date</Label>
                <Input
                  id="status_date"
                  type="date"
                  value={statusUpdateForm.date.toISOString().split('T')[0]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setStatusUpdateForm(prev => ({ ...prev, date: new Date(e.target.value) }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="status_notes">Notes</Label>
                <Textarea
                  id="status_notes"
                  value={statusUpdateForm.notes || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setStatusUpdateForm(prev => ({ ...prev, notes: e.target.value || null }))
                  }
                  placeholder="Add notes about this status update..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Status'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
