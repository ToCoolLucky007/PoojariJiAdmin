'use client';

import { useState, useEffect } from 'react';
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
  DollarSign,
  Package,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Save,
  X
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

interface ItemPrice {
  id: string;
  itemName: string;
  category: string;
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

// Mock data
const mockTiers: Tier[] = [
  {
    id: '1',
    name: 'Tier 1',
    description: 'Premium tier for metro cities',
    createdDate: '2024-01-15',
    assignedStates: ['Delhi', 'Maharashtra', 'Karnataka']
  },
  {
    id: '2',
    name: 'Tier 2',
    description: 'Standard tier for major cities',
    createdDate: '2024-01-16',
    assignedStates: ['Gujarat', 'Tamil Nadu', 'West Bengal']
  },
  {
    id: '3',
    name: 'Tier 3',
    description: 'Economy tier for smaller cities',
    createdDate: '2024-01-17',
    assignedStates: ['Bihar', 'Odisha', 'Jharkhand']
  }
];

const mockItems: ItemPrice[] = [
  {
    id: '1',
    itemName: 'Wedding Ceremony',
    category: 'Ceremonies',
    tierPrices: { '1': 8000, '2': 6500, '3': 5000 }
  },
  {
    id: '2',
    itemName: 'Housewarming Puja',
    category: 'Pujas',

    tierPrices: { '1': 3500, '2': 2800, '3': 2000 }
  },
  {
    id: '3',
    itemName: 'Astrology Consultation',
    category: 'Consultations',

    tierPrices: { '1': 1500, '2': 1200, '3': 1000 }
  }
];

export default function TierPricingPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [items, setItems] = useState<ItemPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tiers');

  // Modal states
  const [showTierModal, setShowTierModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);


  // Form states
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [editingItem, setEditingItem] = useState<ItemPrice | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedTierForState, setSelectedTierForState] = useState<string>('');

  // Form data
  const [tierForm, setTierForm] = useState({ name: '', description: '' });
  const [itemForm, setItemForm] = useState({ itemName: '', category: '' });


  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


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

      fetchTiers();
      setItems(mockItems);
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

  // Handle item operations
  const handleSaveItem = async () => {
    if (!itemForm.itemName.trim() || !itemForm.category.trim()) {
      setActionResult({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    setActionLoading('item');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingItem) {
        setItems(prev => prev.map(item =>
          item.id === editingItem.id
            ? { ...item, ...itemForm }
            : item
        ));
        setActionResult({ type: 'success', message: 'Item updated successfully!' });
      } else {
        const newItem: ItemPrice = {
          id: Date.now().toString(),
          ...itemForm,
          tierPrices: {}
        };
        setItems(prev => [...prev, newItem]);
        setActionResult({ type: 'success', message: 'Item created successfully!' });
      }

      setShowItemModal(false);
      setEditingItem(null);
      setItemForm({ itemName: '', category: '' });
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to save item' });
    } finally {
      setActionLoading(null);
    }
  };


  // Update individual item price
  const updateItemPrice = async (itemId: string, tierId: string, price: number) => {
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? {
          ...item,
          tierPrices: { ...item.tierPrices, [tierId]: price }
        }
        : item
    ));
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category)));

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tiers">Tier Management</TabsTrigger>
              <TabsTrigger value="states">State Assignment</TabsTrigger>
              <TabsTrigger value="items">Item Pricing</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
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
                    <div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">Choose Categories</option>
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <Button

                      className="bg-blue-600 hover:bg-blue-700 text-white"

                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Item</th>
                          <th className="text-left p-3">Category</th>

                          {tiers.map((tier) => (
                            <th key={tier.id} className="text-left p-3">{tier.name}</th>
                          ))}
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{item.itemName}</td>
                            <td className="p-3">
                              <Badge variant="outline">{item.category}</Badge>
                            </td>
                            {tiers.map((tier) => (
                              <td key={tier.id} className="p-3">
                                <Input
                                  type="number"
                                  value={item.tierPrices[tier.id]}
                                  onChange={(e) => updateItemPrice(item.id, tier.id, Number(e.target.value))}
                                  className="w-24"
                                  min="0"
                                />
                              </td>
                            ))}
                            <td className="p-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item);
                                  setItemForm({
                                    itemName: item.itemName,
                                    category: item.category
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


            {/* Bulk Operations Tab */}
            <TabsContent value="bulk" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Bulk Operations</CardTitle>
                  <CardDescription>Perform bulk operations on pricing and tiers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-1">


                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-2">Export/Import</h3>
                      <p className="text-sm text-gray-600 mb-4">Export current pricing or import bulk pricing data</p>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full" disabled>
                          <Package className="w-4 h-4 mr-2" />
                          Export Prices
                        </Button>
                        <Button variant="outline" className="w-full" disabled>
                          <Package className="w-4 h-4 mr-2" />
                          Import Prices
                        </Button>
                      </div>
                    </Card>
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

          {/* Item Modal */}
          <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update item information' : 'Add a new item to the pricing system'}
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
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={itemForm.itemName}
                    onChange={(e) => setItemForm(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder="e.g., Wedding Ceremony, Consultation"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={itemForm.category}
                    onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Ceremonies, Pujas, Consultations"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowItemModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveItem} disabled={!!actionLoading}>
                    {actionLoading === 'item' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingItem ? 'Update' : 'Add'}
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