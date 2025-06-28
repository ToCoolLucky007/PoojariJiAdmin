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
  User,
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Download,
  Globe,
  Sparkles
} from 'lucide-react';

interface Consultant {
  id: string;
  consultantid: string;
  name: string;
  email: string;
  phone: string;
  about: string;
  profileImage: string;
  identificationNumber: string;
  idType: string;
  idDocument: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  skills: string[];
  experience: string;
  languages: string[];
  rituals: string[];
}

// // Mock data
// const mockConsultants: Consultant[] = [
//   {
//     id: '1',
//     name: 'Pandit Rajesh Kumar',
//     email: 'rajesh.kumar@email.com',
//     phone: '+91-9876543210',
//     about: 'Experienced Vedic astrologer and ritual specialist with 15+ years of practice. Expert in North Indian Vedic traditions and Sanskrit mantras. Passionate about helping people find spiritual guidance and peace.',
//     profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
//     identificationNumber: 'DL123456789',
//     idType: 'Aadhaar Card',
//     idDocument: 'aadhaar_rajesh_kumar.pdf',
//     submittedDate: '2024-01-15',
//     status: 'pending',
//     skills: ['Vedic Astrology', 'Palmistry', 'Vastu Shastra', 'Gemstone Consultation'],
//     experience: '15+ years',
//     languages: ['Hindi', 'Sanskrit', 'English', 'Punjabi'],
//     rituals: ['North Indian Vedic Ritual Style', 'Maharashtrian Vedic Style']
//   },
//   {
//     id: '2',
//     name: 'Acharya Priya Sharma',
//     email: 'priya.sharma@email.com',
//     phone: '+91-9123456789',
//     about: 'Spiritual counselor and ritual expert specializing in South Indian Agama traditions. Fluent in Tamil and Telugu scriptures with deep knowledge of temple rituals and ceremonies.',
//     profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
//     identificationNumber: 'SSN987654321',
//     idType: 'PAN Card',
//     idDocument: 'pan_priya_sharma.pdf',
//     submittedDate: '2024-01-14',
//     status: 'pending',
//     skills: ['Temple Rituals', 'Spiritual Counseling', 'Mantra Chanting', 'Meditation Guidance'],
//     experience: '12+ years',
//     languages: ['Tamil', 'Telugu', 'Sanskrit', 'Hindi', 'English'],
//     rituals: ['South Indian Agama Ritual Style', 'Bengali Tantrik & Vedic Style']
//   },
//   {
//     id: '3',
//     name: 'Guruji Amit Patel',
//     email: 'amit.patel@email.com',
//     phone: '+91-9987654321',
//     about: 'Traditional Gujarati priest and spiritual guide with expertise in Vedic ceremonies and modern spiritual counseling. Combines ancient wisdom with contemporary understanding.',
//     profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
//     identificationNumber: 'PP123ABC789',
//     idType: 'Passport',
//     idDocument: 'passport_amit_patel.pdf',
//     submittedDate: '2024-01-13',
//     status: 'approved',
//     skills: ['Vedic Ceremonies', 'Spiritual Counseling', 'Yoga Philosophy', 'Life Coaching'],
//     experience: '10+ years',
//     languages: ['Gujarati', 'Hindi', 'English', 'Sanskrit'],
//     rituals: ['North Indian Vedic Ritual Style', 'Maharashtrian Vedic Style']
//   },
//   {
//     id: '4',
//     name: 'Pandit Arjun Bhattacharya',
//     email: 'arjun.bhattacharya@email.com',
//     phone: '+91-9876543211',
//     about: 'Bengali Tantrik and Vedic scholar with deep knowledge of ancient scriptures and modern applications. Specializes in complex rituals and spiritual healing practices.',
//     profileImage: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300',
//     identificationNumber: 'WB123456789',
//     idType: 'Voter ID',
//     idDocument: 'voter_id_arjun.pdf',
//     submittedDate: '2024-01-12',
//     status: 'pending',
//     skills: ['Tantrik Practices', 'Vedic Astrology', 'Spiritual Healing', 'Ancient Scriptures'],
//     experience: '20+ years',
//     languages: ['Bengali', 'Hindi', 'Sanskrit', 'English'],
//     rituals: ['Bengali Tantrik & Vedic Style', 'North Indian Vedic Ritual Style']
//   }
// ];

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
        (consultant.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (consultant.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultant => consultant.status === statusFilter);
    }

    setFilteredConsultants(filtered);
  }, [searchTerm, statusFilter, consultants]);

  const handleStatusChange = async (consultantId: string, profileid: string, action: 'approve' | 'reject') => {

    setActionLoading(consultantId);
    setActionResult(null);

    try {
      // Simulate API call
      const isapproved = action === 'approve' ? '1' : '3'; // Assuming 2 = approved, 0 = rejected
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setActionResult({ type: 'error', message: 'Unauthorized: No admin token found.' });
        return;
      }
      console.log("result" + isapproved);
      const response = await fetch(`${baseUrl}/api/admin/consultant/verification/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          consultantid: consultantId,
          profileid: profileid, // If `profileid` is different, update this accordingly
          isapproved
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'API Error');
      }


      // Update UI

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      setConsultants(prev =>
        prev.map(c =>
          c.id === profileid ? { ...c, status: newStatus as Consultant['status'] } : c
        )
      );

      setActionResult({
        type: 'success',
        message: `Consultant ${newStatus} successfully!`
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
  const handleDownloadDocument = (documentName: string) => {
    console.log(documentName);
    // Simulate document download
    const link = document.createElement('a');
    link.href = '#';
    link.download = documentName;
    link.click();
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
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Consultant Verification Details</DialogTitle>
                <DialogDescription>
                  Review the consultant's information and make a decision
                </DialogDescription>
              </DialogHeader>

              {selectedConsultant && (
                <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-start space-x-6">
                    <img
                      src={selectedConsultant.profileImage}
                      alt={selectedConsultant.name}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-200 shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedConsultant.name}</h3>
                      <p className="text-gray-600 mb-1">{selectedConsultant.email}</p>
                      <p className="text-gray-600 mb-1">{selectedConsultant.phone}</p>
                      <p className="text-sm text-gray-500 mb-3">Experience: {selectedConsultant.experience}</p>
                      <div className="flex items-center space-x-2">

                        {getStatusBadge(selectedConsultant.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      About
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">{selectedConsultant.about}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-blue-600" />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedConsultant.languages.map((language) => (
                          <Badge key={language} className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                        Ritual Styles
                      </h4>
                      <div className="space-y-2">
                        {selectedConsultant.rituals.map((ritual) => (
                          <Badge key={ritual} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 block w-full text-center">
                            {ritual}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>



                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-600" />
                      Identification Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-gray-500">Document Type:</span>
                            <p className="font-medium">{selectedConsultant.idType}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(selectedConsultant.idDocument)}
                            className="hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div>
                          <span className="text-sm text-gray-500">ID Number:</span>
                          <p className="font-mono font-medium">{selectedConsultant.identificationNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedConsultant.status === 'pending' && (
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(selectedConsultant.consultantid, selectedConsultant.id, 'reject')}
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
                        onClick={() => handleStatusChange(selectedConsultant.consultantid, selectedConsultant.id, 'approve')}
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