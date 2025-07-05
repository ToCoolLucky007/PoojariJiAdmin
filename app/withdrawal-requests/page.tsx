'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Eye,
  Calendar,
  IndianRupee,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Loader2,
  AlertCircle,
  Hash,
  Building2,
  Banknote,
  Gift,
  TrendingUp,
  Coins,
  Filter,
  RotateCcw
} from 'lucide-react';
import { isWithinInterval, subDays, format } from 'date-fns';

interface WithdrawalRequest {
  id: string;
  requestId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerId: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'bank_transfer' | 'paypal' | 'stripe' | 'upi';
  withdrawalType: 'earnings' | 'bonus' | 'mixed';
  earningsAmount: number;
  bonusAmount: number;
  bankDetails: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    accountHolderName: string;
  };
  transactionId?: string;
  userNotes?: string;
  adminNotes?: string;
  processedDate?: string;
  processedBy?: string;
  failureReason?: string;
  availableEarnings: number;
  availableBonus: number;
  requestedEarnings: number;
  requestedBonus: number;
  bonusDetails?: {
    referralBonus: number;
    joinBonus: number;
    commissionBonus: number;
    otherBonus: number;
  };
}

// // Mock data with bonus withdrawal support
// const mockWithdrawalRequests: WithdrawalRequest[] = [
//   {
//     id: '1',
//     requestId: 'WR-2024-001',
//     freelancerName: 'Alex Johnson',
//     freelancerEmail: 'alex.johnson@email.com',
//     freelancerId: 'FL001',
//     amount: 1250.00,
//     requestDate: '2025-07-16',
//     status: 'pending',
//     paymentMethod: 'bank_transfer',
//     withdrawalType: 'earnings',
//     earningsAmount: 1250.00,
//     bonusAmount: 0,
//     bankDetails: {
//       accountNumber: '****1234',
//       routingNumber: '021000021',
//       bankName: 'Chase Bank',
//       accountHolderName: 'Alex Johnson'
//     },
//     availableEarnings: 2450.00,
//     availableBonus: 150.00,
//     requestedEarnings: 1250.00,
//     requestedBonus: 0
//   },
//   {
//     id: '2',
//     requestId: 'WR-2024-002',
//     freelancerName: 'Sarah Chen',
//     freelancerEmail: 'sarah.chen@email.com',
//     freelancerId: 'FL002',
//     amount: 950.00,
//     requestDate: '2025-07-15',
//     status: 'processing',
//     paymentMethod: 'paypal',
//     withdrawalType: 'mixed',
//     earningsAmount: 750.00,
//     bonusAmount: 200.00,
//     bankDetails: {
//       accountNumber: 'sarah.chen@paypal.com',
//       routingNumber: '',
//       bankName: 'PayPal',
//       accountHolderName: 'Sarah Chen'
//     },
//     transactionId: 'TXN123456789',
//     notes: 'Processing mixed withdrawal via PayPal',
//     processedDate: '2025-07-16',
//     processedBy: 'Admin User',
//     availableEarnings: 1200.00,
//     availableBonus: 300.00,
//     requestedEarnings: 750.00,
//     requestedBonus: 200.00,
//     bonusDetails: {
//       referralBonus: 100.00,
//       performanceBonus: 75.00,
//       seasonalBonus: 25.00,
//       otherBonus: 0
//     }
//   },
//   {
//     id: '3',
//     requestId: 'WR-2024-003',
//     freelancerName: 'Michael Rodriguez',
//     freelancerEmail: 'michael.r@email.com',
//     freelancerId: 'FL003',
//     amount: 2100.00,
//     requestDate: '2025-07-14',
//     status: 'completed',
//     paymentMethod: 'bank_transfer',
//     withdrawalType: 'earnings',
//     earningsAmount: 2100.00,
//     bonusAmount: 0,
//     bankDetails: {
//       accountNumber: '****5678',
//       routingNumber: '111000025',
//       bankName: 'Bank of America',
//       accountHolderName: 'Michael Rodriguez'
//     },
//     transactionId: 'TXN987654321',
//     notes: 'Payment completed successfully',
//     processedDate: '2025-07-15',
//     processedBy: 'Admin User',
//     availableEarnings: 500.00,
//     availableBonus: 75.00,
//     requestedEarnings: 2100.00,
//     requestedBonus: 0
//   },
//   {
//     id: '4',
//     requestId: 'WR-2024-004',
//     freelancerName: 'Emma Wilson',
//     freelancerEmail: 'emma.wilson@email.com',
//     freelancerId: 'FL004',
//     amount: 350.00,
//     requestDate: '2025-07-13',
//     status: 'failed',
//     paymentMethod: 'upi',
//     withdrawalType: 'bonus',
//     earningsAmount: 0,
//     bonusAmount: 350.00,
//     bankDetails: {
//       accountNumber: '9876543210@upi',
//       routingNumber: '',
//       bankName: 'UPI',
//       accountHolderName: 'Emma Wilson'
//     },
//     transactionId: 'TXN456789123',
//     notes: 'Bonus withdrawal failed due to invalid UPI ID',
//     processedDate: '2025-07-14',
//     processedBy: 'Admin User',
//     failureReason: 'Invalid UPI ID provided',
//     availableEarnings: 1500.00,
//     availableBonus: 450.00,
//     requestedEarnings: 0,
//     requestedBonus: 350.00,
//     bonusDetails: {
//       referralBonus: 200.00,
//       performanceBonus: 100.00,
//       seasonalBonus: 50.00,
//       otherBonus: 0
//     }
//   },
//   {
//     id: '5',
//     requestId: 'WR-2024-005',
//     freelancerName: 'David Kim',
//     freelancerEmail: 'david.kim@email.com',
//     freelancerId: 'FL005',
//     amount: 2150.00,
//     requestDate: '2025-07-12',
//     status: 'pending',
//     paymentMethod: 'stripe',
//     withdrawalType: 'mixed',
//     earningsAmount: 1800.00,
//     bonusAmount: 350.00,
//     bankDetails: {
//       accountNumber: '****9012',
//       routingNumber: '026009593',
//       bankName: 'Wells Fargo',
//       accountHolderName: 'David Kim'
//     },
//     availableEarnings: 2200.00,
//     availableBonus: 500.00,
//     requestedEarnings: 1800.00,
//     requestedBonus: 350.00,
//     bonusDetails: {
//       referralBonus: 150.00,
//       performanceBonus: 125.00,
//       seasonalBonus: 50.00,
//       otherBonus: 25.00
//     }
//   },
//   {
//     id: '6',
//     requestId: 'WR-2024-006',
//     freelancerName: 'Lisa Park',
//     freelancerEmail: 'lisa.park@email.com',
//     freelancerId: 'FL006',
//     amount: 275.00,
//     requestDate: '2025-07-11',
//     status: 'completed',
//     paymentMethod: 'paypal',
//     withdrawalType: 'bonus',
//     earningsAmount: 0,
//     bonusAmount: 275.00,
//     bankDetails: {
//       accountNumber: 'lisa.park@paypal.com',
//       routingNumber: '',
//       bankName: 'PayPal',
//       accountHolderName: 'Lisa Park'
//     },
//     transactionId: 'TXN789456123',
//     notes: 'Bonus withdrawal completed successfully',
//     processedDate: '2025-07-12',
//     processedBy: 'Admin User',
//     availableEarnings: 890.00,
//     availableBonus: 125.00,
//     requestedEarnings: 0,
//     requestedBonus: 275.00,
//     bonusDetails: {
//       referralBonus: 175.00,
//       performanceBonus: 75.00,
//       seasonalBonus: 25.00,
//       otherBonus: 0
//     }
//   }
// ];

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending'); // Default to pending
  const [typeFilter, setTypeFilter] = useState<string>('all');
  // Initialize with last 30 days
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: thirtyDaysAgo,
    to: now
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form fields for processing
  const [transactionId, setTransactionId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Applied filter states (what's actually being used for filtering)
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>('pending');
  const [appliedTypeFilter, setAppliedTypeFilter] = useState<string>('all');
  const [appliedDateRange, setAppliedDateRange] = useState<{ from?: Date; to?: Date }>({
    from: thirtyDaysAgo,
    to: now
  });
  useEffect(() => {

    // Set default date range (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const formattedStart = format(thirtyDaysAgo, 'yyyy-MM-dd');
    const formattedEnd = format(now, 'yyyy-MM-dd');
    fetchRequests(formattedStart, formattedEnd);
  }, []);

  const fetchRequests = async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.warn('No admin token found');
        return;
      }


      const response = await fetch(`${baseUrl}/api/admin/orders/withdrawal?startdate=${startDate}&enddate=${endDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        //  setFilteredOrders(data.data);
      } else {
        console.error('Failed to fetch orders:', data.message || 'Unknown error');
        setRequests([]);
        //setFilteredOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setRequests([]);

    } finally {
      setIsLoading(false);
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    //  setRequests(mockWithdrawalRequests);
    setIsLoading(false);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (selectedRequest) {
      setTransactionId(selectedRequest.transactionId || '');
      setAdminNotes(selectedRequest.adminNotes || '');
      setFailureReason(selectedRequest.failureReason || '');
    } else {
      setTransactionId('');
      setAdminNotes('');
      setFailureReason('');
    }
  }, [selectedRequest]);


  // Apply filters function
  const handleApplyFilters = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedStatusFilter(statusFilter);
    setAppliedTypeFilter(typeFilter);
    setAppliedDateRange(dateRange);
    // Fetch new data with the selected date range



    if (dateRange.from && dateRange.to) {


      const formattedStart = format(dateRange.from, 'yyyy-MM-dd');
      const formattedEnd = format(dateRange.to, 'yyyy-MM-dd');



      fetchRequests(formattedStart, formattedEnd);
    }
  };

  // Filter data by criteria
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filter by date range
    if (appliedDateRange.from || appliedDateRange.to) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.requestDate);

        if (appliedDateRange.from && appliedDateRange.to) {
          return isWithinInterval(requestDate, { start: appliedDateRange.from, end: appliedDateRange.to });
        } else if (appliedDateRange.from) {
          return requestDate >= appliedDateRange.from;
        } else if (appliedDateRange.to) {
          return requestDate <= appliedDateRange.to;
        }

        return true;
      });
    }

    // Filter by search term
    if (appliedSearchTerm) {
      filtered = filtered.filter(request =>
        request.requestId.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
        request.freelancerName.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
        request.freelancerEmail.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
        request.transactionId?.toLowerCase().includes(appliedSearchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (appliedStatusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === appliedStatusFilter);
    }

    // Filter by withdrawal type
    if (appliedTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.withdrawalType === appliedTypeFilter);
    }

    return filtered;

  }, [requests, appliedDateRange, appliedSearchTerm, appliedStatusFilter, appliedTypeFilter]);

  const handleStatusUpdate = async (requestId: string, newStatus: 'processing' | 'completed' | 'failed') => {
    if (!selectedRequest) return;

    // Validation
    if (newStatus === 'completed' && !transactionId.trim()) {
      setActionResult({ type: 'error', message: 'Transaction ID is required for completed withdrawals' });
      return;
    }

    if (newStatus === 'failed' && !failureReason.trim()) {
      setActionResult({ type: 'error', message: 'Failure reason is required for failed withdrawals' });
      return;
    }

    setActionLoading(requestId);
    setActionResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Admin token missing');

      // Simulate API call
      const res = await fetch(`${baseUrl}/api/admin/consultant/withdrawal/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          withdrawalid: requestId,
          status: newStatus,
          transactionid: transactionId.trim(),
          adminnotes: failureReason.trim()
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Withdrawal API call failed');
      }

      const currentDate = new Date().toISOString().split('T')[0];

      setRequests(prev =>
        prev.map(request => {
          if (request.id === requestId) {
            return {
              ...request,
              status: newStatus,
              transactionId: newStatus !== 'pending' ? transactionId.trim() || undefined : undefined,
              adminNotes: adminNotes.trim() || undefined,
              failureReason: newStatus === 'failed' ? failureReason.trim() || undefined : undefined,
              processedDate: currentDate,
              processedBy: 'Admin User'
            };
          }
          return request;
        })
      );

      setActionResult({
        type: 'success',
        message: `Withdrawal request ${newStatus} successfully!`
      });

      setSelectedRequest(null);
    } catch (error) {
      setActionResult({
        type: 'error',
        message: 'Failed to update withdrawal request. Please try again.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetFilters = () => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    setSearchTerm('');
    setStatusFilter('pending');
    setTypeFilter('all');
    setDateRange({ from: thirtyDaysAgo, to: now });

    // Also reset applied filters
    setAppliedSearchTerm('');
    setAppliedStatusFilter('pending');
    setAppliedTypeFilter('all');
    setAppliedDateRange({ from: thirtyDaysAgo, to: now });

    // Fetch data with reset date range

    const formattedStart = format(thirtyDaysAgo, 'yyyy-MM-dd');
    const formattedEnd = format(now, 'yyyy-MM-dd');
    fetchRequests(formattedStart, formattedEnd);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getWithdrawalTypeBadge = (type: string) => {
    switch (type) {
      case 'earnings':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><IndianRupee className="w-3 h-3 mr-1" />Earnings</Badge>;
      case 'bonus':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100"><Gift className="w-3 h-3 mr-1" />Bonus</Badge>;
      case 'mixed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><Coins className="w-3 h-3 mr-1" />Mixed</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodLabels = {
      bank_transfer: 'Bank Transfer',
      paypal: 'PayPal',
      stripe: 'Stripe',
      upi: 'UPI'
    };

    return <Badge variant="outline" className="text-xs">{methodLabels[method as keyof typeof methodLabels] || method}</Badge>;
  };

  const formatDateRange = () => {
    if (!appliedDateRange.from && !appliedDateRange.to) return 'All dates';

    if (appliedDateRange.from && appliedDateRange.to) {
      return `${appliedDateRange.from.toLocaleDateString()} - ${appliedDateRange.to.toLocaleDateString()}`;
    } else if (appliedDateRange.from) {
      return `From ${appliedDateRange.from.toLocaleDateString()}`;
    } else if (appliedDateRange.to) {
      return `Until ${appliedDateRange.to.toLocaleDateString()}`;
    }

    return 'All dates';
  };

  // Check if filters have changed from applied filters
  const hasUnappliedChanges = () => {
    return (
      searchTerm !== appliedSearchTerm ||
      statusFilter !== appliedStatusFilter ||
      typeFilter !== appliedTypeFilter ||
      dateRange.from?.getTime() !== appliedDateRange.from?.getTime() ||
      dateRange.to?.getTime() !== appliedDateRange.to?.getTime()
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Withdrawal Requests
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
              Withdrawal Requests
            </h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {filteredRequests.length} Requests
            </Badge>
          </div>

          {actionResult && (
            <Alert className={actionResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionResult.message}</AlertDescription>
            </Alert>
          )}

          {/* Filter Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                    Filter Withdrawal Requests
                  </CardTitle>
                  <CardDescription>Search and filter withdrawal requests by various criteria</CardDescription>
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
              <div className="space-y-6">
                {/* Date Range Filter */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Filter by Request Date
                  </Label>
                  <DateRangePicker
                    from={dateRange.from}
                    to={dateRange.to}
                    onDateRangeChange={(from, to) => setDateRange({ from, to })}
                    placeholder="Select date range"
                  />
                </div>

                {/* Other Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by request ID, freelancer name, email, or transaction ID..."
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
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="earnings">Earnings Only</option>
                      <option value="bonus">Bonus Only</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                {/* Apply Filter Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Current Filter: {formatDateRange()}
                    </span>
                    {hasUnappliedChanges() && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                        Filters Changed
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleApplyFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!hasUnappliedChanges()}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-6">
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Banknote className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
                    <p className="text-sm text-gray-500">Total Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredRequests.filter(r => r.status === 'pending').length}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredRequests.filter(r => r.status === 'processing').length}</p>
                    <p className="text-sm text-gray-500">Processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredRequests.filter(r => r.status === 'completed').length}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <IndianRupee className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{filteredRequests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Gift className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{filteredRequests.reduce((sum, r) => sum + r.bonusAmount, 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Bonus Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>






















































          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${request.withdrawalType === 'bonus'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                        : request.withdrawalType === 'mixed'
                          ? 'bg-gradient-to-r from-green-600 to-blue-600'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}>
                        {request.withdrawalType === 'bonus' ? (
                          <Gift className="h-8 w-8 text-white" />
                        ) : request.withdrawalType === 'mixed' ? (
                          <Coins className="h-8 w-8 text-white" />
                        ) : (
                          <Banknote className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.requestId}</h3>
                        <p className="text-sm text-gray-600">{request.freelancerName}</p>
                        <p className="text-sm text-gray-500">{request.freelancerEmail}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            <IndianRupee className="w-3 h-3 inline mr-1" />
                            ₹{request.amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {getWithdrawalTypeBadge(request.withdrawalType)}
                          {getPaymentMethodBadge(request.paymentMethod)}
                          {request.transactionId && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              <Hash className="w-3 h-3 mr-1" />
                              {request.transactionId}
                            </Badge>
                          )}
                        </div>
                        {/* Breakdown for mixed withdrawals */}
                        {request.withdrawalType === 'mixed' && (
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <span>Earnings: ₹{request.earningsAmount.toLocaleString()}</span>
                            <span>•</span>
                            <span>Bonus: ₹{request.bonusAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(request.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
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

          {filteredRequests.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests found</h3>
                <p className="text-gray-500">Try adjusting your search, filters, or date range.</p>
              </CardContent>
            </Card>
          )}

          {/* Detail Modal */}
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Withdrawal Request Details</DialogTitle>
                <DialogDescription>
                  Review and process the withdrawal request
                </DialogDescription>
              </DialogHeader>

              {selectedRequest && (
                <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Request Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Request ID:</span>
                          <span className="font-mono font-medium">{selectedRequest.requestId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Amount:</span>
                          <span className="font-medium text-green-600">₹{selectedRequest.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Withdrawal Type:</span>
                          {getWithdrawalTypeBadge(selectedRequest.withdrawalType)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Request Date:</span>
                          <span>{new Date(selectedRequest.requestDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Method:</span>
                          {getPaymentMethodBadge(selectedRequest.paymentMethod)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Notes:</span>
                          <span className="font-medium text-green-600">{selectedRequest.userNotes}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Freelancer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium">{selectedRequest.freelancerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span>{selectedRequest.freelancerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Freelancer ID:</span>
                          <span className="font-mono">{selectedRequest.freelancerId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Available Earnings:</span>
                          <span className="font-medium text-blue-600">₹{selectedRequest.availableEarnings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Available Bonus:</span>
                          <span className="font-medium text-purple-600">₹{selectedRequest.availableBonus.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Withdrawal Breakdown */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                      Withdrawal Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 flex items-center">
                            <IndianRupee className="w-4 h-4 mr-1 text-blue-600" />
                            Earnings Withdrawal
                          </span>
                          <span className="text-lg font-bold text-blue-600">₹{selectedRequest.earningsAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Requested: ₹{selectedRequest.requestedEarnings.toLocaleString()} / Available: ₹{selectedRequest.availableEarnings.toLocaleString()}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 flex items-center">
                            <Gift className="w-4 h-4 mr-1 text-purple-600" />
                            Bonus Withdrawal
                          </span>
                          <span className="text-lg font-bold text-purple-600">₹{selectedRequest.bonusAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Requested: ₹{selectedRequest.requestedBonus.toLocaleString()} / Available: ₹{selectedRequest.availableBonus.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bonus Details */}
                  {selectedRequest.bonusAmount > 0 && selectedRequest.bonusDetails && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Gift className="w-4 h-4 mr-2 text-purple-600" />
                        Bonus Breakdown
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-purple-700">₹{selectedRequest.bonusDetails.referralBonus.toFixed(2)}</div>
                          <div className="text-gray-600">Referral</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-700">₹{selectedRequest.bonusDetails.joinBonus.toFixed(2)}</div>
                          <div className="text-gray-600">Performance</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-700">₹{selectedRequest.bonusDetails.commissionBonus.toFixed(2)}</div>
                          <div className="text-gray-600">Seasonal</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-700">₹{selectedRequest.bonusDetails.otherBonus.toFixed(2)}</div>
                          <div className="text-gray-600">Other</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Details */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                      Payment Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">Account Holder:</span>
                        <span className="font-medium">{selectedRequest.bankDetails.accountHolderName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Bank/Service:</span>
                        <span className="font-medium">{selectedRequest.bankDetails.bankName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Account Number:</span>
                        <span className="font-mono">{selectedRequest.bankDetails.accountNumber}</span>
                      </div>
                      {selectedRequest.bankDetails.routingNumber && (
                        <div>
                          <span className="text-gray-500 block">Routing Number:</span>
                          <span className="font-mono">{selectedRequest.bankDetails.routingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Processing Information */}
                  {selectedRequest.status !== 'pending' && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Processing Information</h4>
                      <div className="space-y-2 text-sm">
                        {selectedRequest.processedDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Processed Date:</span>
                            <span>{new Date(selectedRequest.processedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedRequest.processedBy && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Processed By:</span>
                            <span>{selectedRequest.processedBy}</span>
                          </div>
                        )}
                        {selectedRequest.transactionId && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Transaction ID:</span>
                            <span className="font-mono">{selectedRequest.transactionId}</span>
                          </div>
                        )}
                        {selectedRequest.adminNotes && (
                          <div>
                            <span className="text-gray-500 block mb-1">Notes:</span>
                            <p className="bg-white p-2 rounded border">{selectedRequest.adminNotes}</p>
                          </div>
                        )}
                        {selectedRequest.failureReason && (
                          <div>
                            <span className="text-gray-500 block mb-1">Failure Reason:</span>
                            <p className="bg-red-50 text-red-700 p-2 rounded border border-red-200">{selectedRequest.failureReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Processing Form */}
                  {selectedRequest.status === 'pending' || selectedRequest.status === 'processing' ? (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-yellow-600" />
                          Process Withdrawal
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="transactionId" className="text-sm text-gray-700">
                              Transaction ID
                            </Label>
                            <Input
                              id="transactionId"
                              type="text"
                              placeholder="Enter transaction ID"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="notes" className="text-sm text-gray-700">
                              Notes
                            </Label>
                            <textarea
                              id="notes"
                              placeholder="Add processing notes..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="failureReason" className="text-sm text-gray-700">
                              Failure Reason (for failed status)
                            </Label>
                            <textarea
                              id="failureReason"
                              placeholder="Enter failure reason if marking as failed..."
                              value={failureReason}
                              onChange={(e) => setFailureReason(e.target.value)}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedRequest.id, 'failed')}
                          disabled={!!actionLoading}
                          className="hover:bg-red-50 hover:border-red-200"
                        >
                          {actionLoading === selectedRequest.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Mark Failed
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedRequest.id, 'processing')}
                          disabled={!!actionLoading}
                          className="hover:bg-blue-50 hover:border-blue-200"
                        >
                          {actionLoading === selectedRequest.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4 mr-2" />
                          )}
                          Mark Processing
                        </Button>

                        <Button
                          onClick={() => handleStatusUpdate(selectedRequest.id, 'completed')}
                          disabled={!!actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {actionLoading === selectedRequest.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Mark Completed
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}