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
import {
  Search,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  IndianRupee,
  User,
  ShoppingCart,
  Loader2,
  AlertCircle,
  CreditCard
} from 'lucide-react';

interface CancelledOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  orderAmount: number;
  refundAmount: number;
  orderDate: string;
  cancellationDate: string;
  reason: string;
  status: 'initiated' | 'in-progress' | 'completed';
  refundDate?: string;
  paymentReference?: string;
  refundReference?: string;
}

// Mock data
// const mockCancelledOrders: CancelledOrder[] = [
//   {
//     id: '1',
//     orderId: 'ORD-2024-001',
//     customerName: 'John Smith',
//     customerEmail: 'john.smith@email.com',
//     serviceName: 'Website Development',
//     orderAmount: 1500,
//     refundAmount: 1425,
//     orderDate: '2024-01-10',
//     cancellationDate: '2024-01-15',
//     reason: 'Customer requested cancellation due to budget constraints',
//     status: 'initiated',
//     paymentReference: 'PAY123456789'
//   },
//   {
//     id: '2',
//     orderId: 'ORD-2024-002',
//     customerName: 'Sarah Johnson',
//     customerEmail: 'sarah.j@email.com',
//     serviceName: 'Digital Marketing Campaign',
//     orderAmount: 800,
//     refundAmount: 760,
//     orderDate: '2024-01-08',
//     cancellationDate: '2024-01-12',
//     reason: 'Service provider unavailable for the requested timeline',
//     status: 'in-progress',
//     paymentReference: 'PAY987654321',
//     refundDate: '2024-01-16'
//   },
//   {
//     id: '3',
//     orderId: 'ORD-2024-003',
//     customerName: 'Michael Chen',
//     customerEmail: 'michael.chen@email.com',
//     serviceName: 'Logo Design',
//     orderAmount: 300,
//     refundAmount: 300,
//     orderDate: '2024-01-05',
//     cancellationDate: '2024-01-07',
//     reason: 'Duplicate order placed by mistake',
//     status: 'completed',
//     paymentReference: 'PAY456789123',
//     refundDate: '2024-01-10',
//     refundReference: 'REF789123456'
//   },
//   {
//     id: '4',
//     orderId: 'ORD-2024-004',
//     customerName: 'Emily Davis',
//     customerEmail: 'emily.davis@email.com',
//     serviceName: 'Content Writing',
//     orderAmount: 250,
//     refundAmount: 225,
//     orderDate: '2024-01-12',
//     cancellationDate: '2024-01-14',
//     reason: 'Quality concerns with initial deliverables',
//     status: 'initiated',
//     paymentReference: 'PAY321654987'
//   }
// ];

export default function CancelledOrdersPage() {
  const [orders, setOrders] = useState<CancelledOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CancelledOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CancelledOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentReferenceError, setPaymentReferenceError] = useState('');

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

        const response = await fetch(`${baseUrl}/api/admin/orders/refund`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
          setOrders(data.data);
          setFilteredOrders(data.data);
        } else {
          console.error('Failed to fetch orders:', data.message || 'Unknown error');
          setOrders([]);
          setFilteredOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setIsLoading(false);
      }
    };


    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);


  // Reset payment reference when modal opens/closes
  useEffect(() => {
    if (selectedOrder) {
      setPaymentReference('');
      setPaymentReferenceError('');
    }
  }, [selectedOrder]);

  const handleProcessRefund = async (orderId: string) => {
    // Validate payment reference for in-progress orders
    if (selectedOrder?.status === 'in-progress' && !paymentReference.trim()) {
      setPaymentReferenceError('Payment reference is required to complete the refund');
      return;
    }

    setActionLoading(orderId);
    setActionResult(null);
    setPaymentReferenceError('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin token missing');

      const currentDate = new Date().toISOString().split('T')[0];
      const refundRef = paymentReference.trim() || "";

      const selected = orders.find(order => order.id === orderId);
      if (!selected) throw new Error('Order not found');

      // Determine refund status

      const dbrefundstatus = selected.status === 'initiated' ? '1' : '2'; // Assuming 2 = approved, 0 = rejected
      const res = await fetch(`${baseUrl}/api/admin/orders/refund/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingid: selected.orderId,
          refundstatus: dbrefundstatus,
          refundpaymentref: refundRef
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Refund API call failed');
      }

      // Update local state to reflect the changes
      setOrders(prev =>
        prev.map(order => {
          if (order.id === orderId) {

            let newStatus: 'initiated' | 'in-progress' | 'completed' = 'in-progress';
            let updates: Partial<CancelledOrder> = { status: newStatus };

            if (order.status === 'initiated') {
              updates.refundDate = currentDate;
            } else if (order.status === 'in-progress') {
              newStatus = 'completed';
              updates.status = newStatus;
              updates.refundReference = refundRef;
            }
            return { ...order, ...updates };
          }
          return order;
        })
      );


      setActionResult({
        type: 'success',
        message: 'Refund processed successfully!'
      });

      setSelectedOrder(null);
    } catch (error: any) {
      console.error('Refund Error:', error);
      setActionResult({
        type: 'error',
        message: error.message || 'Failed to process refund.'
      });
    } finally {
      setActionLoading(null);
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><RefreshCw className="w-3 h-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Initiated</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      default: return 'text-orange-600';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cancelled Orders
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
              Cancelled Orders
            </h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {filteredOrders.length} Refund Requests
            </Badge>
          </div>

          {actionResult && (
            <Alert className={actionResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionResult.message}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Filter Orders</CardTitle>
              <CardDescription>Search and filter cancelled order requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by order ID, customer name, or service..."
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
                    <option value="initiated">Initiated</option>
                    <option value="in-progress">In Progress</option>
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
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.orderId}</h3>
                        <p className="text-sm text-gray-600">{order.serviceName}</p>
                        <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Cancelled: {new Date(order.cancellationDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            <IndianRupee className="w-3 h-3 inline mr-1" />
                            Refund: ₹{order.refundAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(order.status)}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled orders found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}

          {/* Detail Modal */}
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Cancelled Order Details</DialogTitle>
                <DialogDescription>
                  Review order information and process refund
                </DialogDescription>
              </DialogHeader>

              {selectedOrder && (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order ID:</span>
                          <span className="font-mono font-medium">{selectedOrder.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Service:</span>
                          <span className="font-medium">{selectedOrder.serviceName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order Date:</span>
                          <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cancelled Date:</span>
                          <span>{new Date(selectedOrder.cancellationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium">{selectedOrder.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span>{selectedOrder.customerEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cancellation Reason</h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.reason}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order Amount:</span>
                          <span className="font-medium">₹{selectedOrder.orderAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Refund Amount:</span>
                          <span className="font-medium text-green-600">₹{selectedOrder.refundAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Ref:</span>
                          <span className="font-mono text-xs">{selectedOrder.paymentReference}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Refund Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Status:</span>
                          <span className={`font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                        {selectedOrder.refundDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Refund Date:</span>
                            <span>{new Date(selectedOrder.refundDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedOrder.refundReference && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Refund Ref:</span>
                            <span className="font-mono text-xs">{selectedOrder.refundReference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedOrder.status !== 'completed' && (
                    <div className="space-y-4">
                      {selectedOrder.status === 'in-progress' && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <CreditCard className="w-4 h-4 mr-2 text-yellow-600" />
                            Payment Reference
                          </h4>
                          <div className="space-y-2">
                            <Label htmlFor="paymentReference" className="text-sm text-gray-700">
                              Enter payment reference to complete refund *
                            </Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="paymentReference"
                                type="text"
                                placeholder="e.g., REF123456789"
                                value={paymentReference}
                                onChange={(e) => {
                                  setPaymentReference(e.target.value);
                                  if (paymentReferenceError) setPaymentReferenceError('');
                                }}
                                className={`pl-10 ${paymentReferenceError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                              />
                            </div>
                            {paymentReferenceError && (
                              <p className="text-sm text-red-600 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {paymentReferenceError}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              This reference will be used to track the refund transaction
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end pt-4 border-t">
                        <Button
                          onClick={() => handleProcessRefund(selectedOrder.id)}
                          disabled={!!actionLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {actionLoading === selectedOrder.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          )}
                          {selectedOrder.status === 'initiated' ? 'Process Refund' : 'Complete Refund'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}