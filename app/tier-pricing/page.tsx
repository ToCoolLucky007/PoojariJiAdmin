'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Package,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Save,
  X,
  Upload,
  FileText
} from 'lucide-react';

interface Tier {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  assignedStates: string[];
}

interface StateAssignment {
  state: string;
  tierId: string;
  tierName: string;
}
interface Category {
  id: number;
  name: string;
  services: Service[];
}

interface Service {
  id: number;
  name: string;
}
interface ItemPrice {
  id: string;
  name: string;
  name_hindi: string;
  quantity: string;
  measurement: string;
  measurement_hindi: string;
  tierPrices: { [tierId: string]: number };
}

// Indian states list
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Puducherry', 'Andaman and Nicobar Islands'
];

// // Mock data
// const mockTiers: Tier[] = [
//   {
//     id: '1',
//     name: 'Tier 1',
//     description: 'Premium tier for metro cities',
//     createdDate: '2024-01-15',
//     assignedStates: ['Delhi', 'Maharashtra', 'Karnataka']
//   },

//   {
//     id: '2',
//     name: 'Tier 2',
//     description: 'Standard tier for major cities',
//     createdDate: '2024-01-16',
//     assignedStates: ['Gujarat', 'Tamil Nadu', 'West Bengal']
//   },
//   {
//     id: '3',
//     name: 'Tier 3',
//     description: 'Economy tier for smaller cities',
//     createdDate: '2024-01-17',
//     assignedStates: ['Bihar', 'Odisha', 'Jharkhand']
//   }
// ];

// const mockItems: ItemPrice[] = [
//   {
//     id: '1',
//     itemName: 'Wedding Ceremony',
//     quantity: '1 kg',
//     tierPrices: { '1': 8000, '2': 6500, '3': 5000 }
//   },
//   {
//     id: '16',
//     itemName: 'Rajma',
//     quantity: '1 kg',
//     tierPrices: {
//       '1': 10,
//       '2': 20
//     }
//   },
//   {
//     id: '2',
//     itemName: 'Housewarming Puja',
//     quantity: '1 kg',
//     tierPrices: { '1': 3500, '2': 2800, '3': 2000 }
//   },
//   {
//     id: '3',
//     itemName: 'Astrology Consultation',
//     quantity: '1 kg',
//     tierPrices: { '1': 1500, '2': 1200, '3': 1000 }
//   }
// ];

export default function TierPricingPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [items, setItems] = useState<ItemPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tiers');
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string>('-1');
  // Modal states
  const [showTierModal, setShowTierModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);


  // Form states
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [editingItem, setEditingItem] = useState<ItemPrice | null>(null);
  const [editItemPrices, setEditItemPrices] = useState<{ [tierId: string]: string }>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedTierForState, setSelectedTierForState] = useState<string>('');

  // Form data
  const [tierForm, setTierForm] = useState({ name: '', description: '' });
  const [itemForm, setItemForm] = useState({ itemName: '' });


  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('0');

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const EXCLUDED_COLUMNS = ['Category', 'Item ID', 'Item Name', 'Quantity'];

  // Clear action result when modals open/close
  useEffect(() => {
    if (!showTierModal && !showStateModal && !showItemModal) {
      const timer = setTimeout(() => setActionResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTierModal, showStateModal, showItemModal]);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      fetchCategoriesWithServices();
      fetchTiers();
      fetchTierPrices();
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const fetchTiers = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.warn('No admin token found');
        return;
      }
      const response = await fetch(`${baseUrl}/api/admin/pricing/tiers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.data)) {
        setTiers(data.data);
      } else {
        console.error('Failed to fetch consultants:', data.message || 'Unknown error');
        setTiers([]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };


  const fetchTierPrices = async (filters: {
    search?: string;
  } = {}) => {
    try {
      setIsLoading(true);


      // Validation
      if (filters.search == "") {
        setActionResult({ type: 'error', message: 'Enter item name' });

        return;
      }
      setActionResult(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.warn('No admin token found');
        return;
      }
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${baseUrl}/api/admin/tier/prices?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.data)) {

        setItems(data.data);
      } else {
        console.error('Failed to fetch consultants:', data.message || 'Unknown error');
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
    finally {

      setIsLoading(false);

    }

  };

  const fetchCategoriesWithServices = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.warn('No admin token found');
        return;
      }
      const response = await fetch(`${baseUrl}/api/admin/service/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        const flatData = data.data;
        // Transform flat result into nested categories with services
        const categoryMap: { [key: number]: Category } = {};

        flatData.forEach((row: any) => {
          if (!categoryMap[row.category_id]) {
            categoryMap[row.category_id] = {
              id: row.category_id,
              name: row.category_name,

              services: [],
            };
          }

          if (row.service_id) {
            categoryMap[row.category_id].services.push({
              id: row.service_id,
              name: row.service_name,

            });
          }
        });

        const nestedCategories = Object.values(categoryMap);
        setCategories(nestedCategories);

      } else {
        console.error('Failed to fetch consultants:', data.message || 'Unknown error');
        setCategories([]);

      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
    setIsLoading(false);
  };


  // Get state assignments
  const getStateAssignments = (): StateAssignment[] => {
    const assignments: StateAssignment[] = [];
    tiers.forEach(tier => {
      tier.assignedStates.forEach(state => {
        assignments.push({
          state,
          tierId: tier.id,
          tierName: tier.name
        });
      });
    });
    return assignments;
  };

  // Get unassigned states
  const getUnassignedStates = (): string[] => {
    const assignedStates = getStateAssignments().map(a => a.state);
    return INDIAN_STATES.filter(state => !assignedStates.includes(state));
  };

  // Handle tier operations
  const handleSaveTier = async () => {

    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.warn('No admin token found');
      return;
    }

    if (!tierForm.name.trim()) {
      setActionResult({ type: 'error', message: 'Tier name is required' });
      return;
    }

    setActionLoading('tier');
    try {
      const response = await fetch(`${baseUrl}/api/admin/pricing/tier/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingTier?.id || 0,
          name: tierForm.name, // If `profileid` is different, update this accordingly
          description: tierForm.description
        })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'API Error');
      }

      if (editingTier) {
        setTiers(prev => prev.map(tier =>
          tier.id === editingTier.id
            ? { ...tier, name: tierForm.name, description: tierForm.description }
            : tier
        ));
        setActionResult({ type: 'success', message: 'Tier updated successfully!' });
      } else {
        const newTier: Tier = {
          id: result.p_id,
          name: tierForm.name,
          description: tierForm.description,
          createdDate: new Date().toISOString().split('T')[0],
          assignedStates: []
        };
        setTiers(prev => [...prev, newTier]);
        setActionResult({ type: 'success', message: 'Tier created successfully!' });
      }

      setShowTierModal(false);
      setEditingTier(null);
      setTierForm({ name: '', description: '' });
    } catch (error: any) {

      setActionResult({ type: 'error', message: error.message || 'Failed to save tier' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    setActionLoading(tierId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTiers(prev => prev.filter(tier => tier.id !== tierId));
      setActionResult({ type: 'success', message: 'Tier deleted successfully!' });
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to delete tier' });
    } finally {
      setActionLoading(null);
    }
  };

  // Excel Template Download
  const handleDownloadTemplate = () => {
    if (items.length === 0) {
      setActionResult({ type: 'error', message: 'No items available. Please select a service first.' });
      return;
    }

    // Create template data
    const templateData = items.map(item => {
      const row: any = {

        'Item Id': item.id,
        'Item Name': item.name,
        'Quantity': item.quantity || '1 unit'
      };

      // Add tier columns
      tiers.forEach(tier => {
        row[tier.name] = item.tierPrices[tier.id] || '';
      });

      return row;
    });

    downloadExcel(templateData, 'pricing-template');
    setActionResult({ type: 'success', message: 'Template downloaded successfully!' });
  };

  // Export Current Prices
  const handleExportPrices = () => {
    if (items.length === 0) {
      setActionResult({ type: 'error', message: 'No items available to export.' });
      return;
    }

    const exportData = items.map(item => {
      const row: any = {

        'Item Id': item.id,
        'Item Name': item.name,
        'Quantity': item.quantity + ' ' + item.measurement || '1 unit'
      };

      tiers.forEach(tier => {
        row[tier.name] = item.tierPrices[tier.id] || 0;
      });

      return row;
    });

    downloadExcel(exportData, `pricing-export-${new Date().toISOString().split('T')[0]}`);
    setActionResult({ type: 'success', message: 'Prices exported successfully!' });
  };

  // Handle Import File
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    Papa.parse(file, {
      header: true, // Treat first row as column headers
      skipEmptyLines: true,
      complete: function (results: any) {
        if (results.data && results.data.length > 0) {
          setImportPreview(results.data); // results.data is an array of objects
        } else {
          setActionResult({ type: 'error', message: 'Empty or invalid file' });
        }
      },
      error: function () {
        setActionResult({ type: 'error', message: 'Failed to read CSV file' });
      }
    });
  };

  // Process Import
  const handleProcessImport = async () => {
    if (!importFile || importPreview.length === 0) {
      setActionResult({ type: 'error', message: 'Please select a valid file first' });
      return;
    }

    setActionLoading('import');
    try {
      const payload = importPreview.map((row) => {
        const itemId = parseInt(row['Item Id']);
        const tierPrices: Record<string, number> = {};

        Object.entries(row).forEach(([column, value]) => {
          if (!EXCLUDED_COLUMNS.includes(column)) {
            let tierId: string | undefined;

            tiers.forEach(tier => {
              if (tier.name == column) {
                tierId = tier.id;
              }
            });
            //    const tierId = tiers[column]; // Lookup ID using tierMap
            if (tierId && value !== undefined && value !== '') {
              const numericValue = parseFloat(value as string);
              if (!isNaN(numericValue)) {
                tierPrices[tierId] = numericValue;
              }
            }
          }
        });

        return {
          itemId,
          tierPrices,
        };
      });

      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin token missing');

      // Simulate API call
      // Example API call structure:
      const res = await fetch(`${baseUrl}/api/admin/pricing/bulk/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: payload })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'API call failed');
      }

      // In real implementation, process the imported data
      setActionResult({ type: 'success', message: `Successfully imported ${importPreview.length} items!` });
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      fetchTierPrices();
      // Refresh items after import
      // fetchTierPrices(); // Uncomment when API is ready
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to import data' });
    } finally {
      setActionLoading(null);
    }
  };

  // Download Excel utility function
  const downloadExcel = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Handle edit item with all tier prices
  const handleEditItem = (item: ItemPrice) => {
    setEditingItem(item);

    // Initialize edit prices with current tier prices
    const currentPrices: { [tierId: string]: string } = {};
    tiers.forEach(tier => {
      currentPrices[tier.id] = item.tierPrices[tier.id]?.toString() || '';
    });
    setEditItemPrices(currentPrices);
  };

  const handleSaveEditItem = async () => {
    if (!editingItem) return;

    setActionLoading('edit-item');
    try {
      // Convert string prices to numbers and validate
      const updatedTierPrices: { [tierId: string]: number } = {};
      let hasError = false;

      Object.entries(editItemPrices).forEach(([tierId, price]) => {
        if (price.trim()) {
          const numPrice = parseFloat(price);
          if (isNaN(numPrice) || numPrice < 0) {
            hasError = true;
            return;
          }
          updatedTierPrices[tierId] = numPrice;
        }
      });

      if (hasError) {
        setActionResult({ type: 'error', message: 'Please enter valid prices (numbers only, no negative values)' });
        return;
      }
      // API call with item ID and updated prices
      const updateData = {
        itemId: editingItem.id,
        tierPrices: updatedTierPrices
      };

      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin token missing');

      // Simulate API call
      // Example API call structure:
      const res = await fetch(`${baseUrl}/api/admin/pricing/item/${editingItem.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tierPrices: updatedTierPrices })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'API call failed');
      }

      // Update the item with new tier prices
      setItems(prev => prev.map(item =>
        item.id === editingItem.id
          ? { ...item, tierPrices: updatedTierPrices }
          : item
      ));

      setActionResult({ type: 'success', message: 'Item prices updated successfully!' });
      setEditingItem(null);
      setEditItemPrices({});
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to update item prices' });
    } finally {
      setActionLoading(null);
    }
  };
  // Handle state removal from tier
  const handleRemoveStateFromTier = async (state: string) => {
    setActionLoading(`remove-${state}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove state from all tiers
      setTiers(prev => prev.map(tier => ({
        ...tier,
        assignedStates: tier.assignedStates.filter(s => s !== state)
      })));

      setActionResult({ type: 'success', message: `${state} removed from tier successfully!` });
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to remove state from tier' });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle state assignment
  const handleAssignState = async () => {
    if (!selectedState || !selectedTierForState) {
      setActionResult({ type: 'error', message: 'Please select both state and tier' });
      return;
    }

    setActionLoading('state');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin token missing');

      // Simulate API call
      const res = await fetch(`${baseUrl}/api/admin/pricing/tier/state/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tierid: selectedTierForState,
          state: selectedState
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'API call failed');
      }

      // Update tiers in a single operation to ensure proper state updates
      setTiers(prev => prev.map(tier => {

        if (tier.id == selectedTierForState) {

          // Add state to selected tier (avoid duplicates)
          const newAssignedStates = tier.assignedStates.includes(selectedState)
            ? tier.assignedStates
            : [...tier.assignedStates, selectedState];
          return { ...tier, assignedStates: newAssignedStates };
        } else {
          // Remove state from any other tier
          return {
            ...tier,
            assignedStates: tier.assignedStates.filter(state => state !== selectedState)
          };

        }
      }));
      setActionResult({ type: 'success', message: 'State assigned successfully!' });
      setShowStateModal(false);
      setSelectedState('');
      setSelectedTierForState('');
    } catch (error: any) {
      setActionResult({ type: 'error', message: error.message });
    } finally {
      setActionLoading(null);
    }
  };


  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '0';
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  // const categories = Array.from(new Set(items.map(item => item.category)));

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tier-based Pricing Management
            </h1>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
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
              Tier-based Pricing Management
            </h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {tiers.length} Tiers • {items.length} Items
            </Badge>
          </div>

          {actionResult && (
            <Alert className={actionResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionResult.message}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tiers">Tier Management</TabsTrigger>
              <TabsTrigger value="states">State Assignment</TabsTrigger>
              <TabsTrigger value="items">Item Pricing</TabsTrigger>

            </TabsList>

            {/* Tier Management Tab */}
            <TabsContent value="tiers" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pricing Tiers</CardTitle>
                      <CardDescription>Create and manage pricing tiers for different regions</CardDescription>
                    </div>
                    <Button onClick={() => { setEditingTier(null); setShowTierModal(true) }} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {tiers.map((tier) => (
                      <div key={tier.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                Created: {new Date(tier.createdDate).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500">
                                States: {tier.assignedStates.length}
                              </span>
                            </div>
                            {tier.assignedStates.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {tier.assignedStates.slice(0, 3).map((state) => (
                                  <Badge key={state} variant="outline" className="text-xs">{state}</Badge>
                                ))}
                                {tier.assignedStates.length > 3 && (
                                  <Badge variant="outline" className="text-xs">+{tier.assignedStates.length - 3} more</Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTier(tier);
                                setTierForm({ name: tier.name, description: tier.description });
                                setShowTierModal(true);
                              }}

                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTier(tier.id)}
                              disabled={!!actionLoading}
                              className="hover:bg-red-50 hover:border-red-200"
                            >
                              {actionLoading === tier.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* State Assignment Tab */}
            <TabsContent value="states" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>State-Tier Assignments</CardTitle>
                      <CardDescription>Assign states to pricing tiers</CardDescription>
                    </div>
                    <Button onClick={() => setShowStateModal(true)} className="bg-green-600 hover:bg-green-700">
                      <MapPin className="w-4 h-4 mr-2" />
                      Assign State
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Assigned States */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Assigned States ({getStateAssignments().length})</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {getStateAssignments().map((assignment) => (
                          <div key={assignment.state} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{assignment.state}</span>
                              <Badge className="ml-2 bg-blue-100 text-blue-800">{assignment.tierName}</Badge>
                            </div>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveStateFromTier(assignment.state)}
                              disabled={!!actionLoading}
                              className="hover:bg-red-50 hover:border-red-200"
                            >
                              {actionLoading === `remove-${assignment.state}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </Button> */}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Unassigned States */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Unassigned States ({getUnassignedStates().length})</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {getUnassignedStates().map((state) => (
                          <div key={state} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <span className="text-gray-700">{state}</span>
                            <Badge variant="outline" className="ml-2 text-orange-700 border-orange-300">Unassigned</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Item Pricing Tab */}
            <TabsContent value="items" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Item Pricing</CardTitle>
                      <CardDescription>Manage individual item prices across tiers</CardDescription>
                    </div>

                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search items..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>


                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleExportPrices}
                      disabled={items.length === 0}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Export Current Prices
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowImportModal(true)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Import Prices from Excel
                    </Button>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Id</th>
                          <th className="text-left p-3">Item</th>

                          <th className="text-left p-3">Packing</th>
                          {tiers.map((tier) => (
                            <th key={tier.id} className="text-left p-3">{tier.name}</th>
                          ))}
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{item.id}</td>
                            <td className="p-3 font-medium"><div>
                              <div className="font-medium">{item.name}</div>
                              <div className="font-medium">{item.name_hindi}</div>
                            </div></td>
                            <td className="p-3 font-medium">
                              <div className="font-medium">{item.quantity}</div>
                              <div className="font-medium">{item.measurement}/{item.measurement_hindi}</div></td>
                            {tiers.map((tier) => (
                              <td key={tier.id} className="p-3">

                                ₹ {item.tierPrices[tier.id]}
                              </td>
                            ))}
                            <td className="p-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  handleEditItem(item);
                                  setItemForm({
                                    itemName: item.name
                                  });
                                  setShowItemModal(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



          </Tabs>

          {/* Tier Modal */}
          <Dialog open={showTierModal} onOpenChange={setShowTierModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTier ? 'Edit Tier' : 'Create New Tier'}</DialogTitle>
                <DialogDescription>
                  {editingTier ? 'Update tier information' : 'Create a new pricing tier'}
                </DialogDescription>
              </DialogHeader>
              {actionResult && (
                <Alert className={actionResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{actionResult.message}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tierName">Tier Name</Label>
                  <Input
                    id="tierName"
                    value={tierForm.name}
                    onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tier 1, Premium, Economy"
                  />
                </div>
                <div>
                  <Label htmlFor="tierDescription">Description</Label>
                  <Input
                    id="tierDescription"
                    value={tierForm.description}
                    onChange={(e) => setTierForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this tier"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowTierModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTier} disabled={!!actionLoading}>
                    {actionLoading === 'tier' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingTier ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* State Assignment Modal */}
          <Dialog open={showStateModal} onOpenChange={setShowStateModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign State to Tier</DialogTitle>
                <DialogDescription>
                  Select a state and assign it to a pricing tier
                </DialogDescription>
              </DialogHeader>
              {actionResult && (
                <Alert className={actionResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{actionResult.message}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a state</option>
                    {getUnassignedStates().map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <select
                    id="tier"
                    value={selectedTierForState}
                    onChange={(e) => setSelectedTierForState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a tier</option>
                    {tiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>{tier.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowStateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignState} disabled={!!actionLoading}>
                    {actionLoading === 'state' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Assign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Edit Item Prices Modal */}
          <Dialog open={!!editingItem} onOpenChange={() => {
            setEditingItem(null);
            setEditItemPrices({});
            setActionResult(null);
          }}>
            <DialogContent className="max-w-2xl" key={editingItem?.id}>
              <DialogHeader>
                <DialogTitle>Edit Item Prices</DialogTitle>
                <DialogDescription>
                  Update prices for all tiers for this item
                </DialogDescription>
              </DialogHeader>

              {actionResult && (
                <Alert className={actionResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{actionResult.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Item Name</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-900 font-medium">
                    {editingItem?.name}
                  </div>
                </div>



                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Set Prices for All Tiers
                  </Label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {tiers.map(tier => (
                      <div key={tier.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-20">
                          <Badge variant="outline" className="w-full justify-center bg-white">
                            {tier.name}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                            <Input
                              type="number"
                              placeholder="Enter price"
                              value={editItemPrices[tier.id] || ''}
                              onChange={(e) => setEditItemPrices(prev => ({
                                ...prev,
                                [tier.id]: e.target.value
                              }))}
                              className="pl-8"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="w-16 text-xs text-gray-500">
                          {tier.assignedStates.length} states
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingItem(null);
                    setEditItemPrices({});
                    setActionResult(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEditItem}
                  disabled={!!actionLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {actionLoading === 'edit-item' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save All Prices
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>


          {/* Import Modal */}
          <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Import Prices from Excel</DialogTitle>
                <DialogDescription>
                  Upload an Excel file to bulk import item prices
                </DialogDescription>
              </DialogHeader>

              {actionResult && (
                <Alert className={actionResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{actionResult.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="importFile">Select Excel File</Label>
                  <Input
                    id="importFile"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportFile}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: .xlsx, .xls, .csv
                  </p>
                </div>

                {importPreview.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Preview ({importPreview.length} items)
                    </Label>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              {Object.keys(importPreview[0] || {}).map(header => (
                                <th key={header} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.slice(0, 10).map((row, index) => (
                              <tr key={index} className="border-b">
                                {Object.values(row).map((value: any, cellIndex) => (
                                  <td key={cellIndex} className="px-3 py-2 text-gray-900">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {importPreview.length > 10 && (
                        <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 border-t">
                          Showing first 10 of {importPreview.length} items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>


              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportPreview([]);
                    setActionResult(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcessImport}
                  disabled={!importFile || importPreview.length === 0 || !!actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === 'import' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Import {importPreview.length} Items
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute >
  );
}