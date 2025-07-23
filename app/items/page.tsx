'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  Package,
  Settings,
  Filter,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Loader2,
  FileText,
  Globe,
  Hash,
  Scale,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';



// Interfaces
interface Service {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  services: Service[];
}

interface ServiceItem {
  id: number;
  name: string;
  name_hindi: string;
  quantity: number;
  measurement: string;
  measurement_hindi: string;
  isactive: boolean;
  canalterquantity: boolean;
  nondeliverable: boolean;
  isEditing?: boolean;
  isSelected?: boolean;
}

interface BulkUpdateData {
  serviceid?: number;
  isactive?: boolean;
  canalterquantity?: boolean;
  nondeliverable?: boolean;
  measurement?: string;
  measurement_hindi?: string;
}

// Predefined measurement options
const measurementOptions = [
  { english: 'kg', hindi: 'कि.ग्रा.' },         // किलोग्राम
  { english: 'g', hindi: 'ग्रा.' },             // ग्राम
  { english: 'mg', hindi: 'मि.ग्रा.' },         // मिलीग्राम
  { english: 'lt', hindi: 'ली.' },               // लीटर
  { english: 'ml', hindi: 'मि.ली.' },           // मिलीलीटर
  { english: 'mt', hindi: 'मी.' },               // मीटर
  { english: 'pc', hindi: 'प्रति' },            // Piece
  { english: 'pkt', hindi: 'पैकेट' },           // Packet
  { english: 'bunch', hindi: 'गुच्छा' },        // bunch
  { english: 'roll', hindi: 'रोल' },            // roll (different from bunch)
  { english: 'set', hindi: 'सेट' },             // set
];

// Mock data for services
// const mockServices: Service[] = [
//   { serviceid: 1, name: 'Wedding Ceremony', name_hindi: 'विवाह समारोह', isactive: true, parentid: null },
//   { serviceid: 2, name: 'Housewarming Puja', name_hindi: 'गृह प्रवेश पूजा', isactive: true, parentid: 1 },
//   { serviceid: 3, name: 'Astrology Consultation', name_hindi: 'ज्योतिष परामर्श', isactive: true, parentid: 1 },
//   { serviceid: 4, name: 'Vastu Consultation', name_hindi: 'वास्तु परामर्श', isactive: true, parentid: null },
//   { serviceid: 5, name: 'Festival Celebrations', name_hindi: 'त्योहार समारोह', isactive: true, parentid: null },
// ];
// Replace with actual API calls

// Mock data with only one level of category and services
// const mockCategoryData: Category[] = [
//   {
//     id: 1,
//     name: "Wedding Services",

//     services: [
//       { id: 101, name: "Wedding Ceremony" },
//       { id: 102, name: "Housewarming Puja" },
//     ],
//   },
//   {
//     id: 2,
//     name: "Consultations",

//     services: [
//       { id: 103, name: "Astrology Consultation" },
//       { id: 104, name: "Vastu Consultation" },
//     ],
//   },
//   {
//     id: 3,
//     name: "Festivals",

//     services: [
//       { id: 105, name: "Diwali Lakshmi Puja" },
//       { id: 106, name: "Navratri Durga Puja" },
//     ],
//   },
// ];
// Mock data for service items
// const mockServiceItems: ServiceItem[] = [
//   {
//     id: 1,
//     serviceid: 1,
//     name: 'Priest Services',
//     name_hindi: 'पुजारी सेवाएं',
//     quantity: 1,
//     measurement: 'Hours',
//     measurement_hindi: 'घंटे',
//     isactive: true,
//     canalterquantity: false,
//     nondeliverable: true
//   },
//   {
//     id: 2,
//     serviceid: 1,
//     name: 'Flowers and Garlands',
//     name_hindi: 'फूल और माला',
//     quantity: 5,
//     measurement: 'Kg',
//     measurement_hindi: 'किलोग्राम',
//     isactive: true,
//     canalterquantity: true,
//     nondeliverable: false
//   },
//   {
//     id: 3,
//     serviceid: 1,
//     name: 'Sacred Thread',
//     name_hindi: 'पवित्र धागा',
//     quantity: 10,
//     measurement: 'Meters',
//     measurement_hindi: 'मीटर',
//     isactive: true,
//     canalterquantity: true,
//     nondeliverable: false
//   },
//   {
//     id: 4,
//     serviceid: 2,
//     name: 'Coconuts',
//     name_hindi: 'नारियल',
//     quantity: 5,
//     measurement: 'Piece',
//     measurement_hindi: 'टुकड़ा',
//     isactive: true,
//     canalterquantity: true,
//     nondeliverable: false
//   },
//   {
//     id: 5,
//     serviceid: 2,
//     name: 'Incense Sticks',
//     name_hindi: 'अगरबत्ती',
//     quantity: 2,
//     measurement: 'Packets',
//     measurement_hindi: 'पैकेट',
//     isactive: true,
//     canalterquantity: true,
//     nondeliverable: false
//   },
//   {
//     id: 6,
//     serviceid: 3,
//     name: 'Consultation Session',
//     name_hindi: 'परामर्श सत्र',
//     quantity: 1,
//     measurement: 'Session',
//     measurement_hindi: 'सत्र',
//     isactive: true,
//     canalterquantity: false,
//     nondeliverable: true
//   },
//   {
//     id: 7,
//     serviceid: 4,
//     name: 'Site Visit',
//     name_hindi: 'स्थल भ्रमण',
//     quantity: 1,
//     measurement: 'Visit',
//     measurement_hindi: 'भ्रमण',
//     isactive: true,
//     canalterquantity: false,
//     nondeliverable: true
//   },
//   {
//     id: 8,
//     serviceid: 4,
//     name: 'Vastu Report',
//     name_hindi: 'वास्तु रिपोर्ट',
//     quantity: 1,
//     measurement: 'Document',
//     measurement_hindi: 'दस्तावेज़',
//     isactive: true,
//     canalterquantity: false,
//     nondeliverable: false
//   }
// ];

export default function ItemsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("all");
  const [services, setServices] = useState<Service[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('0');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Applied filter states (what's actually being used for display)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedServiceFilter, setAppliedServiceFilter] = useState<string>('0');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>('all');

  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkUpdateData, setBulkUpdateData] = useState<BulkUpdateData>({});
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // New item form
  const [newItem, setNewItem] = useState<Partial<ServiceItem>>({

    name: '',
    name_hindi: '',
    quantity: 1,
    measurement: '',
    measurement_hindi: '',
    isactive: true,
    canalterquantity: true,
    nondeliverable: false
  });

  // API function to fetch service items with filters
  const fetchItems = async (filters: {
    search?: string;
  } = {}) => {
    setIsFilterLoading(true);

    try {
      // alert(filters.serviceid);
      // if (!filters.serviceid || filters.serviceid == "0") {
      //   setActionResult({ type: 'error', message: 'Please choose service' });
      //   setServiceItems([]);
      //   setIsFilterLoading(false);
      //   return;
      // }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const token = localStorage.getItem('adminToken');


      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${baseUrl}/api/admin/items?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        // Add service names to items for display
        const itemsWithServiceNames = data.data.map((item: ServiceItem) => ({
          ...item
        }));

        setServiceItems(itemsWithServiceNames);
      } else {
        console.error('Failed to fetch items:', data.message || 'Unknown error');
        setActionResult({ type: 'error', message: 'Failed to fetch items' });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setActionResult({ type: 'error', message: 'Error fetching items' });
    } finally {
      setIsFilterLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);

      // Load services first
      fetchItems();


      setIsLoading(false);
    };

    fetchInitialData();
  }, []);




  // Handle apply filters
  const handleApplyFilters = () => {

    setAppliedSearchTerm(searchTerm);
    setAppliedServiceFilter(serviceFilter);
    setAppliedStatusFilter(statusFilter);

    fetchItems({
      search: searchTerm
    });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    fetchItems();
  };

  // Check if filters have changed from applied filters
  const hasUnappliedChanges = () => {
    return (
      searchTerm !== appliedSearchTerm ||
      serviceFilter !== appliedServiceFilter ||
      statusFilter !== appliedStatusFilter
    );
  };

  // Handle item selection for bulk operations
  const handleSelectItem = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === serviceItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(serviceItems.map(item => item.id)));
    }
  };

  // Handle inline editing
  const handleEditItem = (item: ServiceItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.warn('No admin token found');
      return;
    }
    setActionLoading(true);
    ///${editingItem.id}

    // Build custom payload
    const payload = {
      id: editingItem.id,
      name: editingItem.name,
      name_hindi: editingItem.name_hindi,
      quantity: editingItem.quantity,
      measurement: editingItem.measurement,
      measurement_hindi: editingItem.measurement_hindi,
      isactive: editingItem.isactive ? 1 : 0,
      canalterquantity: editingItem.canalterquantity ? 1 : 0,
      nondeliverable: editingItem.nondeliverable ? 1 : 0,
    };


    try {


      const response = await fetch(`${baseUrl}/api/admin/item/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'API Error');
      }

      // const updatedItem = await response.json();

      // Update item in local state
      setServiceItems(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...editingItem }
            : item
        )
      );

      setEditingItem(null);
      setActionResult({ type: 'success', message: 'Item updated successfully!' });
    } catch (error) {
      console.error(error);
      setActionResult({ type: 'error', message: 'Failed to update item.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Handle adding new item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.measurement || !newItem.name_hindi) {
      setActionResult({ type: 'error', message: 'Please fill in required fields.' });
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.warn('No admin token found');
      return;
    }
    setActionLoading(true);
    // Build custom payload
    const payload = {
      name: newItem.name,
      name_hindi: newItem.name_hindi,
      quantity: newItem.quantity,
      measurement: newItem.measurement,
      measurement_hindi: newItem.measurement_hindi,
      isactive: newItem.isactive ? 1 : 0,
      canalterquantity: newItem.canalterquantity ? 1 : 0,
      nondeliverable: newItem.nondeliverable ? 1 : 0,
    };


    try {

      const response = await fetch(`${baseUrl}/api/admin/item/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'API Error');
      }
      //  await fetchServiceItems({ search: '', serviceid: newItem.serviceid.toString(), status: 'all' });

      const newItemWithId = {
        ...result.data
      };

      setServiceItems(prev => [...prev, result.data]);
      setNewItem({
        name: '',
        name_hindi: '',
        quantity: 1,
        measurement: '',
        measurement_hindi: '',
        isactive: true,
        canalterquantity: true,
        nondeliverable: false
      });
      setShowAddModal(false);
      setActionResult({ type: 'success', message: 'Item added successfully!' });
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to add item.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selectedItems.size === 0) {
      setActionResult({ type: 'error', message: 'Please select items to update.' });
      return;
    }

    setActionLoading(true);

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setActionResult({ type: 'error', message: 'Admin token not found.' });
      setActionLoading(false);
      return;
    }
    const payload = {
      ids: Array.from(selectedItems),
      data: {
        ...(bulkUpdateData.isactive !== undefined && { isactive: bulkUpdateData.isactive ? 1 : 0 }),
        ...(bulkUpdateData.canalterquantity !== undefined && { canalterquantity: bulkUpdateData.canalterquantity ? 1 : 0 }),
        ...(bulkUpdateData.nondeliverable !== undefined && { nondeliverable: bulkUpdateData.nondeliverable ? 1 : 0 }),
      }
    };

    try {
      const response = await fetch(`${baseUrl}/api/admin/items/bulkupdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Bulk update failed');
      }






      setServiceItems(prev =>
        prev.map(item => {
          if (selectedItems.has(item.id)) {
            return {
              ...item,
              ...(bulkUpdateData.isactive !== undefined && { isactive: bulkUpdateData.isactive }),
              ...(bulkUpdateData.canalterquantity !== undefined && { canalterquantity: bulkUpdateData.canalterquantity }),
              ...(bulkUpdateData.nondeliverable !== undefined && { nondeliverable: bulkUpdateData.nondeliverable }),
            };
          }
          return item;
        })
      );

      setSelectedItems(new Set());
      setBulkUpdateData({});
      setShowBulkModal(false);
      setActionResult({ type: 'success', message: `${selectedItems.size} items updated successfully!` });
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to update items.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setServiceItems(prev => prev.filter(item => item.id !== itemId));
      setActionResult({ type: 'success', message: 'Item deleted successfully!' });
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to delete item.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle measurement selection
  const handleMeasurementSelect = (measurement: { english: string; hindi: string }, isEditing: boolean = false) => {
    if (isEditing && editingItem) {
      setEditingItem({
        ...editingItem,
        measurement: measurement.english,
        measurement_hindi: measurement.hindi
      });
    } else {
      setNewItem({
        ...newItem,
        measurement: measurement.english,
        measurement_hindi: measurement.hindi
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  const getBooleanBadge = (value: boolean, trueLabel: string, falseLabel: string) => {
    return value
      ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{trueLabel}</Badge>
      : <Badge variant="outline">{falseLabel}</Badge>;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Items Management
            </h1>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Items Management
            </h1>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {serviceItems.length} Items
              </Badge>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {actionResult && (
            <Alert className={actionResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionResult.message}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                    Filters & Actions
                  </CardTitle>
                  <CardDescription>Search and filter items, or perform bulk operations</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by name, service, or measurement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>




                </div>

                {/* Apply Filter Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Current Filters Applied
                    </span>
                    {hasUnappliedChanges() && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                        Filters Changed
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleApplyFilters}
                    disabled={!hasUnappliedChanges() || isFilterLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isFilterLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Filter className="w-4 h-4 mr-2" />
                    )}
                    Apply Filters
                  </Button>
                </div>

                {/* Bulk Actions */}
                {selectedItems.size > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItems(new Set())}
                        >
                          Clear Selection
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowBulkModal(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Bulk Update
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="hover:bg-blue-50"
                  >
                    {selectedItems.size === serviceItems.length ? (
                      <CheckSquare className="w-4 h-4 mr-2" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    Select All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isFilterLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading items...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-700">Select</th>
                        {/* <th className="text-left py-3 px-2 font-medium text-gray-700">Service</th> */}
                        <th className="text-left py-3 px-2 font-medium text-gray-700">Item Name</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-700">Hindi Name</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-700">Quantity</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-700">Measurement</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-700">Properties</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectItem(item.id)}
                              className="p-1"
                            >
                              {selectedItems.has(item.id) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                          </td>
                          {/* <td className="py-3 px-2">
                            <Badge variant="outline" className="text-xs">
                              {item.serviceName}
                            </Badge>
                          </td> */}
                          <td className="py-3 px-2">
                            {editingItem?.id === item.id ? (
                              <Input
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                className="w-full"
                              />
                            ) : (
                              <span className="font-medium">{item.name}</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {editingItem?.id === item.id ? (
                              <Input
                                value={editingItem.name_hindi}
                                onChange={(e) => setEditingItem({ ...editingItem, name_hindi: e.target.value })}
                                className="w-full"
                              />
                            ) : (
                              <span className="text-gray-600">{item.name_hindi}</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {editingItem?.id === item.id ? (
                              <Input
                                type="number"
                                value={editingItem.quantity}
                                onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 0 })}
                                className="w-20"
                              />
                            ) : (
                              <span className="font-mono">{item.quantity}</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {editingItem?.id === item.id ? (
                              <div className="space-y-1">
                                <select
                                  value={`${editingItem.measurement}|${editingItem.measurement_hindi}`}
                                  onChange={(e) => {
                                    const [english, hindi] = e.target.value.split('|');
                                    handleMeasurementSelect({ english, hindi }, true);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select Measurement</option>
                                  {measurementOptions.map((option) => (
                                    <option key={option.english} value={`${option.english}|${option.hindi}`}>
                                      {option.english} / {option.hindi}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium">{item.measurement}</div>
                                <div className="text-sm text-gray-500">{item.measurement_hindi}</div>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {editingItem?.id === item.id ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingItem({ ...editingItem, isactive: !editingItem.isactive })}
                                className={editingItem.isactive ? 'bg-green-50 border-green-200' : 'bg-gray-50'}
                              >
                                {editingItem.isactive ? (
                                  <ToggleRight className="w-4 h-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
                            ) : (
                              getStatusBadge(item.isactive)
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {editingItem?.id === item.id ? (
                              <div className="space-y-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingItem({ ...editingItem, canalterquantity: !editingItem.canalterquantity })}
                                  className={`w-full ${editingItem.canalterquantity ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                                >
                                  {editingItem.canalterquantity ? 'Can Alter' : 'Fixed Qty'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingItem({ ...editingItem, nondeliverable: !editingItem.nondeliverable })}
                                  className={`w-full ${editingItem.nondeliverable ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}
                                >
                                  {editingItem.nondeliverable ? 'OUT' : 'IN'}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {getBooleanBadge(item.canalterquantity, 'Can Alter', 'Fixed Qty')}
                                {getBooleanBadge(item.nondeliverable, 'OUT', 'IN')}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            {editingItem?.id === item.id ? (
                              <div className="flex items-center space-x-1">
                                <Button
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  disabled={actionLoading}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {actionLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={actionLoading}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="hover:bg-red-50 hover:border-red-200"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!isFilterLoading && serviceItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Item Modal */}
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>
                  Create a new item
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">





                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newName">Item Name (English) *</Label>
                    <Input
                      id="newName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newNameHindi">Item Name (Hindi)</Label>
                    <Input
                      id="newNameHindi"
                      value={newItem.name_hindi}
                      onChange={(e) => setNewItem({ ...newItem, name_hindi: e.target.value })}
                      placeholder="हिंदी में नाम"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newQuantity">Quantity</Label>
                    <Input
                      id="newQuantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newMeasurement">Measurement</Label>
                    <select
                      id="newMeasurement"
                      value={`${newItem.measurement}|${newItem.measurement_hindi}`}
                      onChange={(e) => {
                        const [english, hindi] = e.target.value.split('|');
                        handleMeasurementSelect({ english, hindi });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="|">Select Measurement</option>
                      {measurementOptions.map((option) => (
                        <option key={option.english} value={`${option.english}|${option.hindi}`}>
                          {option.english} / {option.hindi}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newActive"
                      checked={newItem.isactive}
                      onChange={(e) => setNewItem({ ...newItem, isactive: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="newActive">Active</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newCanAlter"
                      checked={newItem.canalterquantity}
                      onChange={(e) => setNewItem({ ...newItem, canalterquantity: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="newCanAlter">Can Alter Quantity</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newNonDeliverable"
                      checked={newItem.nondeliverable}
                      onChange={(e) => setNewItem({ ...newItem, nondeliverable: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="newNonDeliverable">Non-deliverable</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Update Modal */}
          <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Update Items</DialogTitle>
                <DialogDescription>
                  Update {selectedItems.size} selected item{selectedItems.size > 1 ? 's' : ''}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkStatus"
                        checked={bulkUpdateData.isactive === true}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, isactive: true })}
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkStatus"
                        checked={bulkUpdateData.isactive === false}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, isactive: false })}
                      />
                      <span>Inactive</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkStatus"
                        checked={bulkUpdateData.isactive === undefined}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, isactive: undefined })}
                      />
                      <span>No Change</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Can Alter Quantity</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkCanAlter"
                        checked={bulkUpdateData.canalterquantity === true}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, canalterquantity: true })}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkCanAlter"
                        checked={bulkUpdateData.canalterquantity === false}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, canalterquantity: false })}
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkCanAlter"
                        checked={bulkUpdateData.canalterquantity === undefined}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, canalterquantity: undefined })}
                      />
                      <span>No Change</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Non-deliverable</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkNonDeliverable"
                        checked={bulkUpdateData.nondeliverable === true}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, nondeliverable: true })}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkNonDeliverable"
                        checked={bulkUpdateData.nondeliverable === false}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, nondeliverable: false })}
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="bulkNonDeliverable"
                        checked={bulkUpdateData.nondeliverable === undefined}
                        onChange={() => setBulkUpdateData({ ...bulkUpdateData, nondeliverable: undefined })}
                      />
                      <span>No Change</span>
                    </label>
                  </div>
                </div>



                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkUpdate}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Update {selectedItems.size} Item{selectedItems.size > 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}