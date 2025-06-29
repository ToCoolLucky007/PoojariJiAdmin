'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PeriodFilter from '@/components/PeriodFilter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  Eye,
  Calendar,
  ShoppingCart,
  IndianRupee,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  TrendingUp,
  ShoppingBag,
  Hash,
  Scale
} from 'lucide-react';
import { TimePeriod, getDateRangeForPeriod, filterDataByDateRange, calculatePeriodComparison } from '@/lib/date-utils';

interface OrderItem {
  price: number;
  itemid: number;
  itemname: string;
  quantity: number;
  bookingid: number;
  measurement: string;
}

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  freelancerName: string;
  serviceName: string;
  category: string;
  orderAmount: number;
  servicefee: number;
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';

  items: OrderItem[];
}

// // Mock data
// const mockOrders: Order[] = [
//   {
//     id: '1',
//     orderId: 'ORD-2024-001',
//     customerName: 'Jennifer Smith',
//     customerEmail: 'jennifer.smith@email.com',
//     freelancerName: 'Alex Johnson',
//     serviceName: 'E-commerce Website Development',
//     category: 'Web Development',
//     orderAmount: 2500,
//     orderDate: '2025-06-15',
//     deliveryDate: '2024-02-15',
//     status: 'in-progress',
//     paymentStatus: 'paid',
//     description: 'Complete e-commerce website with payment integration and admin panel',
//     requirements: ['Responsive design', 'Payment gateway integration', 'Admin dashboard', 'Product catalog'],
//     deliverables: ['Source code', 'Documentation', 'Deployment guide', '30 days support'],
//     items: [
//       { price: 1200.00, itemid: 1, itemname: 'Frontend Development', quantity: 1, bookingid: 73, measurement: 'Project' },
//       { price: 800.00, itemid: 2, itemname: 'Backend API', quantity: 1, bookingid: 73, measurement: 'Project' },
//       { price: 300.00, itemid: 3, itemname: 'Database Setup', quantity: 1, bookingid: 73, measurement: 'Project' },
//       { price: 200.00, itemid: 4, itemname: 'Testing & QA', quantity: 1, bookingid: 73, measurement: 'Hours' }
//     ]
//   },
//   {
//     id: '2',
//     orderId: 'ORD-2024-002',
//     customerName: 'Robert Johnson',
//     customerEmail: 'robert.j@email.com',
//     freelancerName: 'Sarah Chen',
//     serviceName: 'Brand Identity Design',
//     category: 'Design',
//     orderAmount: 800,
//     orderDate: '2025-06-14',
//     deliveryDate: '2025-06-28',
//     status: 'completed',
//     paymentStatus: 'paid',
//     description: 'Complete brand identity package including logo, business cards, and brand guidelines',
//     requirements: ['Logo design', 'Business card design', 'Brand guidelines', 'Color palette'],
//     deliverables: ['Logo files (AI, PNG, SVG)', 'Business card design', 'Brand guideline document', 'Color palette'],
//     items: [
//       { price: 400.00, itemid: 5, itemname: 'Logo Design', quantity: 1, bookingid: 74, measurement: 'Design' },
//       { price: 150.00, itemid: 6, itemname: 'Business Card Design', quantity: 2, bookingid: 74, measurement: 'Design' },
//       { price: 250.00, itemid: 7, itemname: 'Brand Guidelines', quantity: 1, bookingid: 74, measurement: 'Document' }
//     ]
//   },
//   {
//     id: '3',
//     orderId: 'ORD-2024-003',
//     customerName: 'Lisa Chen',
//     customerEmail: 'lisa.chen@email.com',
//     freelancerName: 'Michael Rodriguez',
//     serviceName: 'SEO Optimization Campaign',
//     category: 'Digital Marketing',
//     orderAmount: 1200,
//     orderDate: '2025-06-13',
//     deliveryDate: '2024-02-13',
//     status: 'in-progress',
//     paymentStatus: 'paid',
//     description: '3-month SEO campaign to improve website ranking and organic traffic',
//     requirements: ['Keyword research', 'On-page optimization', 'Content strategy', 'Monthly reports'],
//     deliverables: ['SEO audit report', 'Optimized content', 'Backlink strategy', 'Monthly performance reports'],
//     items: [
//       { price: 300.00, itemid: 8, itemname: 'Keyword Research', quantity: 1, bookingid: 75, measurement: 'Report' },
//       { price: 500.00, itemid: 9, itemname: 'On-page Optimization', quantity: 10, bookingid: 75, measurement: 'Pages' },
//       { price: 400.00, itemid: 10, itemname: 'Content Strategy', quantity: 3, bookingid: 75, measurement: 'Months' }
//     ]
//   },
//   {
//     id: '4',
//     orderId: 'ORD-2024-004',
//     customerName: 'David Wilson',
//     customerEmail: 'david.wilson@email.com',
//     freelancerName: 'Emma Wilson',
//     serviceName: 'Data Analysis Dashboard',
//     category: 'Data Science',
//     orderAmount: 1800,
//     orderDate: '2025-06-12',
//     deliveryDate: '2025-06-26',
//     status: 'pending',
//     paymentStatus: 'pending',
//     description: 'Interactive dashboard for sales data analysis with predictive insights',
//     requirements: ['Data visualization', 'Interactive charts', 'Predictive analytics', 'Export functionality'],
//     deliverables: ['Dashboard application', 'Source code', 'User manual', 'Training session'],
//     items: [
//       { price: 600.00, itemid: 11, itemname: 'Data Visualization', quantity: 5, bookingid: 76, measurement: 'Charts' },
//       { price: 800.00, itemid: 12, itemname: 'Predictive Analytics', quantity: 1, bookingid: 76, measurement: 'Model' },
//       { price: 400.00, itemid: 13, itemname: 'Dashboard Development', quantity: 1, bookingid: 76, measurement: 'Project' }
//     ]
//   }
// ];

export default function OrderDetailsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 🔥 PERIOD FILTERING STATE - THIS CONTROLS THE TIME PERIOD
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('this-month');
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.warn('No admin token found');
          return;
        }
        const [startDate, endDate] = [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], new Date().toISOString().split('T')[0]];
        const response = await fetch(`${baseUrl}/api/admin/orders?startdate=${startDate}&enddate=${endDate}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
          setOrders(data.data);

        } else {
          console.error('Failed to fetch consultants:', data.message || 'Unknown error');
          setOrders([]);

        }
      } catch (error) {
        console.error('Error fetching consultants:', error);
        setOrders([]);

      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 🔥 FILTER DATA BY PERIOD AND OTHER CRITERIA - THIS IS WHERE THE MAGIC HAPPENS
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // 🔥 FILTER BY DATE PERIOD - FILTERS ORDERS BY THEIR ORDER DATE
    const dateRange = getDateRangeForPeriod(selectedPeriod, customDateRange);
    filtered = filterDataByDateRange(filtered, 'orderDate', dateRange);

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();

      filtered = filtered.filter(order =>
        // orderId might be a number → stringify first
        (order.orderId !== null && order.orderId !== undefined
          ? String(order.orderId).toLowerCase()
          : ''
        ).includes(search) ||

        (order.customerName?.toLowerCase() || '').includes(search) ||
        (order.serviceName?.toLowerCase() || '').includes(search) ||
        (order.category?.toLowerCase() || '').includes(search)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  }, [orders, selectedPeriod, customDateRange, searchTerm, statusFilter]);

  // 🔥 CALCULATE PERIOD COMPARISON - COMPARES CURRENT VS PREVIOUS PERIOD
  const periodComparison = useMemo(() => {
    const currentRange = getDateRangeForPeriod(selectedPeriod, customDateRange);
    const currentData = filterDataByDateRange(orders, 'orderDate', currentRange);

    // Get previous period data for comparison
    let previousPeriod: TimePeriod = 'last-month';
    if (selectedPeriod === 'today') previousPeriod = 'yesterday';
    else if (selectedPeriod === 'this-week') previousPeriod = 'last-week';
    else if (selectedPeriod === 'this-month') previousPeriod = 'last-month';

    const previousRange = getDateRangeForPeriod(previousPeriod);
    const previousData = filterDataByDateRange(orders, 'orderDate', previousRange);

    return calculatePeriodComparison(currentData, previousData);
  }, [orders, selectedPeriod, customDateRange]);

  const getStatusBadge = (status: string) => {

    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'ongoing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Package className="w-3 h-3 mr-1" />New</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unpaid</Badge>;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Order Details
            </h1>
            <div className="grid gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      </div>
                      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
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
              Order Details
            </h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {filteredOrders.length} Orders
            </Badge>
          </div>

          {/* 🔥 PERIOD FILTER COMPONENT - THIS IS THE UI FOR SELECTING TIME PERIODS */}
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            customDateRange={customDateRange}
            onCustomDateRangeChange={(from, to) => setCustomDateRange({ from, to })}
            showComparison={false}
            title="Filter Orders by Date"
            description="View orders placed during the selected period"
          />

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
                    <p className="text-sm text-gray-500">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredOrders.filter(o => o.status === 'completed').length}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredOrders.filter(o => o.status === 'in-progress').length}</p>
                    <p className="text-sm text-gray-500">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <IndianRupee className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹

                      {filteredOrders.reduce((sum, o) => sum + (Number(o.orderAmount) || 0), 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-sm text-gray-500">Total Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Additional Filters</CardTitle>
              <CardDescription>Search and filter order records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by order ID, customer, service, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="accepted">Accepted</option>
                    <option value="ongoing">In Progress</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>

                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.orderId}</h3>
                        <p className="text-sm text-gray-600">{order.serviceName}</p>
                        <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
                        <p className="text-sm text-gray-500">Freelancer: {order.freelancerName}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Ordered: {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            <IndianRupee className="w-3 h-3 inline mr-1" />
                            ₹{order.orderAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            <ShoppingBag className="w-3 h-3 inline mr-1" />
                            {order.items.length} items
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">{order.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <div className="mt-1">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your search, filters, or time period.</p>
              </CardContent>
            </Card>
          )}

          {/* Detail Modal */}
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Complete information about the order
                </DialogDescription>
              </DialogHeader>

              {selectedOrder && (
                <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order ID:</span>
                          <span className="font-mono font-medium">{selectedOrder.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium">{selectedOrder.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Service:</span>
                          <span className="font-medium">{selectedOrder.serviceName}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-medium text-green-600">₹{selectedOrder.orderAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order Date:</span>
                          <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery Date:</span>
                          <span>{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Participants</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Customer:</span>
                          <span className="font-medium">{selectedOrder.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span>{selectedOrder.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Freelancer:</span>
                          <span className="font-medium">{selectedOrder.freelancerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Service Amount:</span>
                          <span className="font-medium text-green-600">₹{selectedOrder.servicefee}</span>
                        </div>

                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.description}</p>
                  </div>

                  {/* Order Items Section */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <ShoppingBag className="w-4 h-4 mr-2 text-blue-600" />
                      Order Items ({selectedOrder.items.length} items)
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">{item.itemname}</h5>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <Hash className="w-3 h-3 mr-1" />
                                    ID: {item.itemid}
                                  </span>
                                  <span className="flex items-center">
                                    <Scale className="w-3 h-3 mr-1" />
                                    {item.measurement}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">₹{item.price.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">per {item.measurement}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <Badge variant="outline" className="bg-white">{item.quantity}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Subtotal:</span>
                              <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Order Total:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{selectedOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total of {selectedOrder.items.reduce((total, item) => total + item.quantity, 0)} items
                      </div>
                    </div>
                  </div>



                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-sm text-gray-500">Order Status:</span>
                        <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Payment Status:</span>
                        <div className="mt-1">{getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}