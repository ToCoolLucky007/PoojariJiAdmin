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
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Consultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  about: string;
  profileImage: string;
  identificationNumber: string;
  idType: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  skills: string[];
  experience: string;
}

// Mock data
const mockConsultants: Consultant[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    about: 'Experienced web developer with 5+ years in React and Node.js. Passionate about creating scalable applications and mentoring junior developers.',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
    identificationNumber: 'DL123456789',
    idType: 'Driver License',
    submittedDate: '2024-01-15',
    status: 'pending',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    experience: '5+ years'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0124',
    about: 'Digital marketing specialist with expertise in SEO, social media marketing, and content strategy. Helped 50+ businesses grow their online presence.',
    profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
    identificationNumber: 'SSN987654321',
    idType: 'Social Security',
    submittedDate: '2024-01-14',
    status: 'pending',
    skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
    experience: '3+ years'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0125',
    about: 'UI/UX designer focused on creating intuitive and beautiful user experiences. Expert in Figma, Adobe Creative Suite, and user research methodologies.',
    profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
    identificationNumber: 'PP123ABC789',
    idType: 'Passport',
    submittedDate: '2024-01-13',
    status: 'approved',
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'User Research'],
    experience: '4+ years'
  }
];

export default function ConsultantVerificationPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.warn('No admin token found');
          return;
        }

        const response = await fetch(`${baseUrl}/api/admin/consultant/verifications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
          setConsultants(data.data);
          setFilteredConsultants(data.data);
        } else {
          console.error('Failed to fetch consultants:', data.message || 'Unknown error');
          setConsultants([]);
          setFilteredConsultants([]);
        }
      } catch (error) {
        console.error('Error fetching consultants:', error);
        setConsultants([]);
        setFilteredConsultants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  useEffect(() => {
    let filtered = consultants;

    if (searchTerm) {
      filtered = filtered.filter(consultant =>
        consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultant => consultant.status === statusFilter);
    }

    setFilteredConsultants(filtered);
  }, [searchTerm, statusFilter, consultants]);

  const handleStatusChange = async (consultantId: string, action: 'approve' | 'reject') => {
    setActionLoading(consultantId);
    setActionResult(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      setConsultants(prev =>
        prev.map(consultant =>
          consultant.id === consultantId
            ? { ...consultant, status: newStatus as 'approved' | 'rejected' }
            : consultant
        )
      );

      setActionResult({
        type: 'success',
        message: `Consultant ${action === 'approve' ? 'approved' : 'rejected'} successfully!`
      });

      setSelectedConsultant(null);
    } catch (error) {
      setActionResult({
        type: 'error',
        message: `Failed to ${action} consultant. Please try again.`
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
              Consultant Verification
            </h1>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
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
              Consultant Verification
            </h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {filteredConsultants.length} Applications
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
              <CardDescription>Search and filter consultant verification requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
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
            {filteredConsultants.map((consultant) => (
              <Card key={consultant.id} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={consultant.profileImage}
                        alt={consultant.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{consultant.name}</h3>
                        <p className="text-sm text-gray-600">{consultant.email}</p>
                        <p className="text-sm text-gray-500">Submitted: {new Date(consultant.submittedDate).toLocaleDateString()}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {/* {consultant.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                          {consultant.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{consultant.skills.length - 3} more</Badge>
                          )} */}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(consultant.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConsultant(consultant)}
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

          {filteredConsultants.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No consultants found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}

          {/* Detail Modal */}
          <Dialog open={!!selectedConsultant} onOpenChange={() => setSelectedConsultant(null)}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Consultant Verification Details</DialogTitle>
                <DialogDescription>
                  Review the consultant's information and make a decision
                </DialogDescription>
              </DialogHeader>

              {selectedConsultant && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedConsultant.profileImage}
                      alt={selectedConsultant.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedConsultant.name}</h3>
                      <p className="text-gray-600">{selectedConsultant.email}</p>
                      <p className="text-gray-600">{selectedConsultant.phone}</p>
                      <p className="text-sm text-gray-500">Experience: {selectedConsultant.experience}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedConsultant.about}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {/* {selectedConsultant.skills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))} */}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Identification</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium">{selectedConsultant.idType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Number:</span>
                        <p className="font-medium">{selectedConsultant.identificationNumber}</p>
                      </div>
                    </div>
                  </div>

                  {selectedConsultant.status === 'pending' && (
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(selectedConsultant.id, 'reject')}
                        disabled={!!actionLoading}
                        className="hover:bg-red-50 hover:border-red-200"
                      >
                        {actionLoading === selectedConsultant.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedConsultant.id, 'approve')}
                        disabled={!!actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading === selectedConsultant.id ? (
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