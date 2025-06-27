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
  CheckCircle, 
  XCircle, 
  Clock,
  Building2,
  FileText,
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface Business {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  businessType: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    gstCertificate: string;
    panCard: string;
    businessLicense: string;
  };
}

// Mock data
const mockBusinesses: Business[] = [
  {
    id: '1',
    businessName: 'TechSolutions Pvt Ltd',
    ownerName: 'Rajesh Kumar',
    email: 'rajesh@techsolutions.com',
    phone: '+91-9876543210',
    address: '123 Tech Park, Bangalore, Karnataka, India',
    gstNumber: '07AABCT1332L1ZZ',
    panNumber: 'AABCT1332L',
    businessType: 'Software Development',
    submittedDate: '2024-01-15',
    status: 'pending',
    documents: {
      gstCertificate: 'gst_cert_001.pdf',
      panCard: 'pan_card_001.pdf',
      businessLicense: 'business_license_001.pdf'
    }
  },
  {
    id: '2',
    businessName: 'Digital Marketing Hub',
    ownerName: 'Priya Sharma',
    email: 'priya@digitalmarketing.com',
    phone: '+91-9123456789',
    address: '456 Business Center, Mumbai, Maharashtra, India',
    gstNumber: '27AABCD5678M1ZX',
    panNumber: 'AABCD5678M',
    businessType: 'Marketing Services',
    submittedDate: '2024-01-14',
    status: 'pending',
    documents: {
      gstCertificate: 'gst_cert_002.pdf',
      panCard: 'pan_card_002.pdf',
      businessLicense: 'business_license_002.pdf'
    }
  },
  {
    id: '3',
    businessName: 'Creative Design Studio',
    ownerName: 'Amit Patel',
    email: 'amit@creativedesign.com',
    phone: '+91-9987654321',
    address: '789 Creative Lane, Pune, Maharashtra, India',
    gstNumber: '27AABCE9012N1ZY',
    panNumber: 'AABCE9012N',
    businessType: 'Design Services',
    submittedDate: '2024-01-13',
    status: 'approved',
    documents: {
      gstCertificate: 'gst_cert_003.pdf',
      panCard: 'pan_card_003.pdf',
      businessLicense: 'business_license_003.pdf'
    }
  }
];

export default function BusinessVerificationPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBusinesses(mockBusinesses);
      setFilteredBusinesses(mockBusinesses);
      setIsLoading(false);
    };

    fetchBusinesses();
  }, []);

  useEffect(() => {
    let filtered = businesses;

    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(business => business.status === statusFilter);
    }

    setFilteredBusinesses(filtered);
  }, [searchTerm, statusFilter, businesses]);

  const handleStatusChange = async (businessId: string, action: 'approve' | 'reject') => {
    setActionLoading(businessId);
    setActionResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      setBusinesses(prev => 
        prev.map(business => 
          business.id === businessId 
            ? { ...business, status: newStatus as 'approved' | 'rejected' }
            : business
        )
      );

      setActionResult({
        type: 'success',
        message: `Business ${action === 'approve' ? 'approved' : 'rejected'} successfully!`
      });

      setSelectedBusiness(null);
    } catch (error) {
      setActionResult({
        type: 'error',
        message: `Failed to ${action} business. Please try again.`
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Business Verification
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
              Business Verification
            </h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {filteredBusinesses.length} Applications
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
              <CardTitle>Filter Applications</CardTitle>
              <CardDescription>Search and filter business verification requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by business name, owner, or email..."
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
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{business.businessName}</h3>
                        <p className="text-sm text-gray-600">Owner: {business.ownerName}</p>
                        <p className="text-sm text-gray-600">{business.email}</p>
                        <p className="text-sm text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Submitted: {new Date(business.submittedDate).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">{business.businessType}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(business.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBusiness(business)}
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

          {filteredBusinesses.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}

          {/* Detail Modal */}
          <Dialog open={!!selectedBusiness} onOpenChange={() => setSelectedBusiness(null)}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Business Verification Details</DialogTitle>
                <DialogDescription>
                  Review the business information and documentation
                </DialogDescription>
              </DialogHeader>
              
              {selectedBusiness && (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedBusiness.businessName}</h3>
                      <p className="text-gray-600">Owner: {selectedBusiness.ownerName}</p>
                      <p className="text-gray-600">{selectedBusiness.email}</p>
                      <p className="text-gray-600">{selectedBusiness.phone}</p>
                      <Badge variant="outline" className="mt-1">{selectedBusiness.businessType}</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Business Address</h4>
                    <p className="text-gray-700 text-sm">{selectedBusiness.address}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        GST Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">GST Number:</span>
                          <p className="font-mono font-medium">{selectedBusiness.gstNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Certificate:</span>
                          <p className="text-blue-600 underline cursor-pointer">{selectedBusiness.documents.gstCertificate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-purple-600" />
                        PAN Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">PAN Number:</span>
                          <p className="font-mono font-medium">{selectedBusiness.panNumber}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">PAN Card:</span>
                          <p className="text-purple-600 underline cursor-pointer">{selectedBusiness.documents.panCard}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-600" />
                      Additional Documents
                    </h4>
                    <div className="text-sm">
                      <span className="text-gray-500">Business License:</span>
                      <p className="text-gray-600 underline cursor-pointer">{selectedBusiness.documents.businessLicense}</p>
                    </div>
                  </div>

                  {selectedBusiness.status === 'pending' && (
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(selectedBusiness.id, 'reject')}
                        disabled={!!actionLoading}
                        className="hover:bg-red-50 hover:border-red-200"
                      >
                        {actionLoading === selectedBusiness.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedBusiness.id, 'approve')}
                        disabled={!!actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading === selectedBusiness.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </Button>
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