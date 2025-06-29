'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PeriodFilter from '@/components/PeriodFilter';
import ProfileDetailModal from '@/components/ProfileDetailModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  Eye,
  XCircle,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Briefcase,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Globe,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { TimePeriod, getDateRangeForPeriod, filterDataByDateRange, calculatePeriodComparison } from '@/lib/date-utils';

interface Service {
  name: string;
  price: number;
  location: string;
  duration: string;
}

interface Freelancer {
  id: string;
  consultantid: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string;
  experience: string;
  rating: number;
  completedProjects: number;
  joinedDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
  profile: 'approved' | 'pending' | 'rejected' | 'not submitted';
  bio: string;
  profileCompleted: boolean;
  languages: string[];
  rituals: string[];
  services: Service[];
  identificationNumber: string;
  idType: string;
  idDocument: string;
  idDocumentImage: string;
}

// Mock data with updated structure for location-based pricing and ID documents
// const mockFreelancers: Freelancer[] = [
//   {
//     id: '1',
//     name: 'Pandit Rajesh Kumar',
//     email: 'rajesh.kumar@email.com',
//     phone: '+91-9876543210',
//     location: 'Delhi, India',
//     profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
//     experience: '15+ years',
//     rating: 4.8,
//     completedProjects: 47,
//     joinedDate: '2024-01-15',
//     lastActive: '2024-01-16',
//     status: 'active',
//     bio: 'Experienced Vedic astrologer and ritual specialist with 15+ years of practice. Expert in North Indian Vedic traditions and Sanskrit mantras.',
//     profileCompleted: true,
//     languages: ['English', 'Hindi', 'Punjabi'],
//     rituals: ['North Indian Vedic Ritual Style', 'Maharashtrian Vedic Style'],
//     identificationNumber: 'DL123456789',
//     idType: 'Aadhaar Card',
//     idDocument: 'aadhaar_rajesh_kumar.pdf',
//     idDocumentImage: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
//     services: [
//       { name: 'Wedding Ceremony', price: 5000, location: 'Delhi', duration: '4 hours' },
//       { name: 'Wedding Ceremony', price: 6000, location: 'Gurgaon', duration: '4 hours' },
//       { name: 'Wedding Ceremony', price: 7000, location: 'Noida', duration: '4 hours' },
//       { name: 'Housewarming Puja', price: 2500, location: 'Delhi', duration: '2 hours' },
//       { name: 'Housewarming Puja', price: 3000, location: 'Gurgaon', duration: '2 hours' },
//       { name: 'Astrology Consultation', price: 1000, location: 'Online', duration: '1 hour' },
//       { name: 'Vastu Consultation', price: 3000, location: 'Delhi', duration: '3 hours' },
//       { name: 'Vastu Consultation', price: 3500, location: 'Gurgaon', duration: '3 hours' }
//     ]
//   },
//   {
//     id: '2',
//     name: 'Acharya Priya Sharma',
//     email: 'priya.sharma@email.com',
//     phone: '+91-9123456789',
//     location: 'Chennai, India',
//     profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
//     experience: '12+ years',
//     rating: 4.9,
//     completedProjects: 32,
//     joinedDate: '2024-01-14',
//     lastActive: '2024-01-16',
//     status: 'active',
//     bio: 'Spiritual counselor and ritual expert specializing in South Indian Agama traditions. Fluent in Tamil and Telugu scriptures.',
//     profileCompleted: true,
//     languages: ['English', 'Hindi', 'Punjabi'],
//     rituals: ['South Indian Agama Ritual Style'],
//     identificationNumber: 'SSN987654321',
//     idType: 'PAN Card',
//     idDocument: 'pan_priya_sharma.pdf',
//     idDocumentImage: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400',
//     services: [
//       { name: 'Temple Style Wedding', price: 8000, location: 'Chennai', duration: '6 hours' },
//       { name: 'Temple Style Wedding', price: 9000, location: 'Bangalore', duration: '6 hours' },
//       { name: 'Spiritual Counseling', price: 1500, location: 'Online', duration: '1.5 hours' },
//       { name: 'Mantra Initiation', price: 2000, location: 'Chennai', duration: '2 hours' },
//       { name: 'Mantra Initiation', price: 2500, location: 'Bangalore', duration: '2 hours' },
//       { name: 'Festival Celebrations', price: 4000, location: 'Chennai', duration: '3 hours' },
//       { name: 'Festival Celebrations', price: 4500, location: 'Bangalore', duration: '3 hours' }
//     ]
//   },
//   {
//     id: '3',
//     name: 'Guruji Amit Patel',
//     email: 'amit.patel@email.com',
//     phone: '+91-9987654321',
//     location: 'Mumbai, India',
//     profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
//     experience: '10+ years',
//     rating: 4.7,
//     completedProjects: 28,
//     joinedDate: '2024-01-13',
//     lastActive: '2024-01-15',
//     status: 'active',
//     bio: 'Traditional Gujarati priest and spiritual guide with expertise in Vedic ceremonies and modern spiritual counseling.',
//     profileCompleted: false,
//     languages: ['English', 'Hindi', 'Punjabi'],
//     rituals: ['North Indian Vedic Ritual Style', 'Maharashtrian Vedic Style'],
//     identificationNumber: 'PP123ABC789',
//     idType: 'Passport',
//     idDocument: 'passport_amit_patel.pdf',
//     idDocumentImage: 'https://images.pexels.com/photos/7841828/pexels-photo-7841828.jpeg?auto=compress&cs=tinysrgb&w=400',
//     services: [
//       { name: 'Gujarati Wedding', price: 6000, location: 'Mumbai', duration: '5 hours' },
//       { name: 'Gujarati Wedding', price: 7000, location: 'Pune', duration: '5 hours' },
//       { name: 'Business Blessing', price: 2000, location: 'Mumbai', duration: '1.5 hours' },
//       { name: 'Business Blessing', price: 2500, location: 'Pune', duration: '1.5 hours' },
//       { name: 'Yoga & Meditation', price: 1200, location: 'Online', duration: '1 hour' }
//     ]
//   },
//   {
//     id: '4',
//     name: 'Pandit Arjun Bhattacharya',
//     email: 'arjun.bhattacharya@email.com',
//     phone: '+91-9876543211',
//     location: 'Kolkata, India',
//     profileImage: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300',
//     experience: '20+ years',
//     rating: 4.9,
//     completedProjects: 41,
//     joinedDate: '2024-01-12',
//     lastActive: '2024-01-16',
//     status: 'active',
//     bio: 'Bengali Tantrik and Vedic scholar with deep knowledge of ancient scriptures and modern applications.',
//     profileCompleted: true,
//     languages: ['English', 'Hindi', 'Punjabi'],
//     rituals: ['North Indian Vedic Ritual Style', 'South Indian Agama Ritual Style'],
//     identificationNumber: 'WB123456789',
//     idType: 'Voter ID',
//     idDocument: 'voter_id_arjun.pdf',
//     idDocumentImage: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
//     services: [
//       { name: 'Bengali Wedding', price: 7000, location: 'Kolkata', duration: '5 hours' },
//       { name: 'Bengali Wedding', price: 8000, location: 'Bhubaneswar', duration: '5 hours' },
//       { name: 'Tantrik Healing', price: 3500, location: 'Kolkata', duration: '2 hours' },
//       { name: 'Tantrik Healing', price: 4000, location: 'Bhubaneswar', duration: '2 hours' },
//       { name: 'Ancient Scripture Study', price: 2500, location: 'Online', duration: '2 hours' },
//       { name: 'Spiritual Healing', price: 2000, location: 'Kolkata', duration: '1.5 hours' },
//       { name: 'Spiritual Healing', price: 2500, location: 'Bhubaneswar', duration: '1.5 hours' }
//     ]
//   },
//   {
//     id: '5',
//     name: 'Swami Ravi Shankar',
//     email: 'ravi.shankar@email.com',
//     phone: '+91-9555012345',
//     location: 'Rishikesh, India',
//     profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
//     experience: '8+ years',
//     rating: 4.6,
//     completedProjects: 23,
//     joinedDate: '2024-01-11',
//     lastActive: '2024-01-15',
//     status: 'active',
//     bio: 'Spiritual teacher and meditation expert specializing in Himalayan traditions and yoga philosophy.',
//     profileCompleted: false,
//     languages: ['English', 'Hindi', 'Punjabi'],
//     rituals: ['North Indian Vedic Ritual Style'],
//     identificationNumber: 'UK123456789',
//     idType: 'Driving License',
//     idDocument: 'driving_license_ravi.pdf',
//     idDocumentImage: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400',
//     services: [
//       { name: 'Meditation Workshop', price: 1800, location: 'Rishikesh', duration: '3 hours' },
//       { name: 'Meditation Workshop', price: 2200, location: 'Haridwar', duration: '3 hours' },
//       { name: 'Spiritual Retreat', price: 15000, location: 'Rishikesh', duration: '3 days' },
//       { name: 'Spiritual Retreat', price: 18000, location: 'Haridwar', duration: '3 days' },
//       { name: 'Online Satsang', price: 500, location: 'Online', duration: '1 hour' }
//     ]
//   },
//   {
//     id: '6',
//     name: 'Mata Lakshmi Devi',
//     email: 'lakshmi.devi@email.com',
//     phone: '+91-9444567890',
//     location: 'Varanasi, India',
//     profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
//     experience: '18+ years',
//     rating: 4.8,
//     completedProjects: 35,
//     joinedDate: '2024-01-10',
//     lastActive: '2024-01-14',
//     status: 'inactive',
//     bio: 'Traditional priestess and spiritual guide with expertise in Goddess worship and women-centric rituals.',
//     profileCompleted: false,
//     languages: ['English', 'Hindi', 'Punjabi'],
//     rituals: ['North Indian Vedic Ritual Style', 'South Indian Agama Ritual Style', 'Maharashtrian Vedic Style'],
//     identificationNumber: 'UP123456789',
//     idType: 'Aadhaar Card',
//     idDocument: 'aadhaar_lakshmi_devi.pdf',
//     idDocumentImage: 'https://images.pexels.com/photos/7841828/pexels-photo-7841828.jpeg?auto=compress&cs=tinysrgb&w=400',
//     services: [
//       { name: 'Goddess Puja', price: 3000, location: 'Varanasi', duration: '2.5 hours' },
//       { name: 'Goddess Puja', price: 3500, location: 'Allahabad', duration: '2.5 hours' },
//       { name: 'Women Blessing Ceremony', price: 2500, location: 'Varanasi', duration: '2 hours' },
//       { name: 'Women Blessing Ceremony', price: 3000, location: 'Allahabad', duration: '2 hours' },
//       { name: 'Spiritual Guidance', price: 1000, location: 'Online', duration: '1 hour' }
//     ]
//   }
// ];

export default function FreelancerDetailsPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Period filtering state
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('this-month');
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});



  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.warn('No admin token found');
          return;
        }
        const currentRange = getDateRangeForPeriod(selectedPeriod, customDateRange);
        const startDate = new Date(currentRange.from).toISOString().split('T')[0];
        const endDate = new Date(currentRange.to).toISOString().split('T')[0];
        const response = await fetch(`${baseUrl}/api/admin/consultants?vsub=0&startdate=${startDate}&enddate=${endDate}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
          setFreelancers(data.data);
          //setFilteredConsultants(data.data);
        } else {
          console.error('Failed to fetch consultants:', data.message || 'Unknown error');
          setFreelancers([]);
          //   setFilteredConsultants([]);
        }
      } catch (error) {
        console.error('Error fetching consultants:', error);
        setFreelancers([]);
        //  setFilteredConsultants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  // Filter data by period and other criteria
  const filteredFreelancers = useMemo(() => {
    let filtered = [...freelancers];

    // Apply search filter first
    if (searchTerm) {
      filtered = filtered.filter(freelancer =>
        freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase())) ||
        freelancer.rituals.some(ritual => ritual.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(freelancer => freelancer.status === statusFilter);
    }

    // Apply profile filter
    if (profileFilter !== 'all') {
      filtered = filtered.filter(freelancer => freelancer.profile === profileFilter);
    }

    console.log(filtered);
    // Apply date filter only if not showing default "this-month" or if custom range is set
    if (selectedPeriod !== 'this-month' || customDateRange.from || customDateRange.to) {
      const dateRange = getDateRangeForPeriod(selectedPeriod, customDateRange);

      filtered = filterDataByDateRange(filtered, 'joinedDate', dateRange);
    }
    return filtered;
  }, [freelancers, selectedPeriod, customDateRange, searchTerm, statusFilter, profileFilter]);



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getProfileBadge = (profileStatus: string) => {
    switch (profileStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Clock className="w-3 h-3 mr-1" />
          Not Submitted
        </Badge>;
    }
  };


  // Calculate stats for filtered data
  const totalFreelancers = filteredFreelancers.length;
  const approvedProfiles = filteredFreelancers.filter(f => f.profile === 'approved').length;
  const approvalRate = totalFreelancers > 0 ? Math.round((approvedProfiles / totalFreelancers) * 100) : 0;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Freelancer Details
            </h1>
            <div className="grid gap-4">
              {[1, 2, 3, 4].map((i) => (
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
              Freelancer Details
            </h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {filteredFreelancers.length} Freelancers
            </Badge>
          </div>

          {/* Period Filter */}
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            customDateRange={customDateRange}
            onCustomDateRangeChange={(from, to) => setCustomDateRange({ from, to })}
            showComparison={false}
            title="Filter Freelancers by Join Date"
            description="View freelancers who joined during the selected period"
          />

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalFreelancers}</p>
                    <p className="text-sm text-gray-500">Total Freelancers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredFreelancers.filter(f => f.status === 'active').length}</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Approval Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl md:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Profile Approval</span>
                  </div>
                  <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                    {approvalRate}%
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {approvedProfiles}/{totalFreelancers}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    Approved Profiles
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${approvalRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{totalFreelancers - approvedProfiles} pending/rejected</span>
                  <span>{totalFreelancers} total</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{filteredFreelancers.reduce((sum, f) => sum + f.completedProjects, 0)}</p>
                    <p className="text-sm text-gray-500">Total Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Additional Filters</CardTitle>
              <CardDescription>Search and filter freelancer profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, languages, or rituals..."
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
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
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredFreelancers.map((freelancer) => (
              <Card key={freelancer.id} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={freelancer.profileImage}
                        alt={freelancer.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{freelancer.name}</h3>
                          {getProfileBadge(freelancer.profile)}
                        </div>
                        <p className="text-sm text-gray-600">{freelancer.email}</p>
                        <p className="text-sm text-gray-500">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {freelancer.location}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">{freelancer.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">{freelancer.completedProjects} projects</span>
                          <span className="text-sm font-medium text-green-600">{freelancer.services.length} services</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {freelancer.languages.slice(0, 3).map((language) => (
                            <Badge key={language} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{language}</Badge>
                          ))}
                          {freelancer.languages.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{freelancer.languages.length - 3} more</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(freelancer.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFreelancer(freelancer)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFreelancers.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
                <p className="text-gray-500">Try adjusting your search, filters, or time period.</p>
              </CardContent>
            </Card>
          )}

          {/* Profile Detail Modal */}
          <ProfileDetailModal
            profile={selectedFreelancer}
            isOpen={!!selectedFreelancer}
            onClose={() => setSelectedFreelancer(null)}
            title="Freelancer Profile"
            description="Detailed information about the freelancer"
            showActions={false}
            profileType="freelancer"
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}