'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileDetailModal from '@/components/ProfileDetailModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Calendar,
  Globe,
  Sparkles,
  User
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
  idDocumentImage: string;
  submittedDate: string;
  profile: 'pending' | 'approved' | 'rejected';
  skills: string[];
  experience: string;
  languages: string[];
  rituals: string[];
  status: 'active' | 'inactive';
  bio?: string;
  rating?: number;
  completedProjects?: number;
  joinedDate?: string;
  lastActive?: string;
  services?: Service[];
}
interface Service {
  name: string;
  price: number;
  location: string;
  duration: string;
}
// Mock data
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
//     idDocumentImage: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
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
//     idDocumentImage: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400',
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
//     idDocumentImage: 'https://images.pexels.com/photos/7841828/pexels-photo-7841828.jpeg?auto=compress&cs=tinysrgb&w=400',
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
//     idDocumentImage: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
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
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);


  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchConsultants = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.warn('No admin token found');
        return;
      }
      const [startDate, endDate] = [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], new Date().toISOString().split('T')[0]];
      const response = await fetch(`${baseUrl}/api/admin/consultants?vsub=1&startdate=${startDate}&enddate=${endDate}`, {
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

  useEffect(() => {


    fetchConsultants();
  }, []);

  useEffect(() => {
    let filtered = consultants;

    if (searchTerm) {
      filtered = filtered.filter(consultant =>
        (consultant?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (consultant?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    if (profileFilter !== 'all') {
      filtered = filtered.filter(consultant => consultant.profile === profileFilter);
    }

    setFilteredConsultants(filtered);
  }, [searchTerm, profileFilter, consultants]);

  const handleStatusChange = async (consultantId: string, profileId: string, action: 'approve' | 'reject') => {
    setActionLoading(consultantId);
    setActionResult(null);

    try {
      const isapproved = action === 'approve' ? '1' : '3'; // Assuming 2 = approved, 0 = rejected
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setActionResult({ type: 'error', message: 'Unauthorized: No admin token found.' });
        return;
      }

      const response = await fetch(`${baseUrl}/api/admin/consultant/profile/status/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          consultantid: consultantId,
          profileid: profileId, // If `profileid` is different, update this accordingly
          isapproved
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'API Error');
      }


      // Update UI

      const newProfile = action === 'approve' ? 'approved' : 'rejected';

      setConsultants(prev =>
        prev.map(consultant =>
          consultant.id === consultantId
            ? { ...consultant, profile: newProfile as 'approved' | 'rejected' }
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

  const handleActionComplete = () => {
    // Refresh the data after an action is completed
    fetchConsultants();
  };
  const getProfileBadge = (profile: string) => {
    switch (profile) {
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
              Freelancer Verification
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
              Freelancer Verification
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
              <CardDescription>Search and filter freelancer verification requests</CardDescription>
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
                  <Label htmlFor="profile">Profile</Label>
                  <select
                    id="profile"
                    value={profileFilter}
                    onChange={(e) => setProfileFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Profiles</option>
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
                        <p className="text-sm text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Submitted: {new Date(consultant.submittedDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">Experience: {consultant.experience}</p>
                        {/* <div className="flex flex-wrap gap-1 mt-2">
                          {consultant.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                          {consultant.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{consultant.skills.length - 3} more</Badge>
                          )}
                        </div> */}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getProfileBadge(consultant.profile)}
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

          {/* Profile Detail Modal */}
          <ProfileDetailModal
            profile={selectedConsultant}
            isOpen={!!selectedConsultant}
            onClose={() => setSelectedConsultant(null)}
            onStatusChange={handleStatusChange}
            actionLoading={actionLoading}
            title="Freelancer Verification Details"
            description="Review the freelancer's information and make a decision"
            showActions={true}
            profileType="consultant"
            onActionComplete={handleActionComplete}
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}