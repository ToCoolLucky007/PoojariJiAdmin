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
  DollarSign,
  ZoomIn,
  X,
  CreditCard,
  FileText
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
  status: 'active' | 'inactive' | 'pending';
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
const mockFreelancers: Freelancer[] = [
  {
    id: '1',
    name: 'Pandit Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91-9876543210',
    location: 'Delhi, India',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
    experience: '15+ years',
    rating: 4.8,
    completedProjects: 47,
    joinedDate: '2024-01-15',
    lastActive: '2024-01-16',
    status: 'active',
    bio: 'Experienced Vedic astrologer and ritual specialist with 15+ years of practice. Expert in North Indian Vedic traditions and Sanskrit mantras.',
    profileCompleted: true,
    languages: ['English', 'Hindi', 'Punjabi'],
    rituals: ['North Indian Vedic Ritual Style', 'Maharashtrian Vedic Style'],
    identificationNumber: 'DL123456789',
    idType: 'Aadhaar Card',
    idDocument: 'aadhaar_rajesh_kumar.pdf',
    idDocumentImage: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
    services: [
      { name: 'Wedding Ceremony', price: 5000, location: 'Delhi', duration: '4 hours' },
      { name: 'Wedding Ceremony', price: 6000, location: 'Gurgaon', duration: '4 hours' },
      { name: 'Wedding Ceremony', price: 7000, location: 'Noida', duration: '4 hours' },
      { name: 'Housewarming Puja', price: 2500, location: 'Delhi', duration: '2 hours' },
      { name: 'Housewarming Puja', price: 3000, location: 'Gurgaon', duration: '2 hours' },
      { name: 'Astrology Consultation', price: 1000, location: 'Online', duration: '1 hour' },
      { name: 'Vastu Consultation', price: 3000, location: 'Delhi', duration: '3 hours' },
      { name: 'Vastu Consultation', price: 3500, location: 'Gurgaon', duration: '3 hours' }
    ]
  },
  {
    id: '2',
    name: 'Acharya Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91-9123456789',
    location: 'Chennai, India',
    profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
    experience: '12+ years',
    rating: 4.9,
    completedProjects: 32,
    joinedDate: '2024-01-14',
    lastActive: '2024-01-16',
    status: 'active',
    bio: 'Spiritual counselor and ritual expert specializing in South Indian Agama traditions. Fluent in Tamil and Telugu scriptures.',
    profileCompleted: true,
    languages: ['English', 'Hindi', 'Punjabi'],
    rituals: ['South Indian Agama Ritual Style'],
    identificationNumber: 'SSN987654321',
    idType: 'PAN Card',
    idDocument: 'pan_priya_sharma.pdf',
    idDocumentImage: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400',
    services: [
      { name: 'Temple Style Wedding', price: 8000, location: 'Chennai', duration: '6 hours' },
      { name: 'Temple Style Wedding', price: 9000, location: 'Bangalore', duration: '6 hours' },
      { name: 'Spiritual Counseling', price: 1500, location: 'Online', duration: '1.5 hours' },
      { name: 'Mantra Initiation', price: 2000, location: 'Chennai', duration: '2 hours' },
      { name: 'Mantra Initiation', price: 2500, location: 'Bangalore', duration: '2 hours' },
      { name: 'Festival Celebrations', price: 4000, location: 'Chennai', duration: '3 hours' },
      { name: 'Festival Celebrations', price: 4500, location: 'Bangalore', duration: '3 hours' }
    ]
  },
  {
    id: '3',
    name: 'Guruji Amit Patel',
    email: 'amit.patel@email.com',
    phone: '+91-9987654321',
    location: 'Mumbai, India',
    profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
    experience: '10+ years',
    rating: 4.7,
    completedProjects: 28,
    joinedDate: '2024-01-13',
    lastActive: '2024-01-15',
    status: 'active',
    bio: 'Traditional Gujarati priest and spiritual guide with expertise in Vedic ceremonies and modern spiritual counseling.',
    profileCompleted: false,
    languages: ['English', 'Hindi', 'Punjabi'],
    rituals: ['North Indian Vedic Ritual Style', 'Maharashtrian Vedic Style'],
    identificationNumber: 'PP123ABC789',
    idType: 'Passport',
    idDocument: 'passport_amit_patel.pdf',
    idDocumentImage: 'https://images.pexels.com/photos/7841828/pexels-photo-7841828.jpeg?auto=compress&cs=tinysrgb&w=400',
    services: [
      { name: 'Gujarati Wedding', price: 6000, location: 'Mumbai', duration: '5 hours' },
      { name: 'Gujarati Wedding', price: 7000, location: 'Pune', duration: '5 hours' },
      { name: 'Business Blessing', price: 2000, location: 'Mumbai', duration: '1.5 hours' },
      { name: 'Business Blessing', price: 2500, location: 'Pune', duration: '1.5 hours' },
      { name: 'Yoga & Meditation', price: 1200, location: 'Online', duration: '1 hour' }
    ]
  },
  {
    id: '4',
    name: 'Pandit Arjun Bhattacharya',
    email: 'arjun.bhattacharya@email.com',
    phone: '+91-9876543211',
    location: 'Kolkata, India',
    profileImage: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300',
    experience: '20+ years',
    rating: 4.9,
    completedProjects: 41,
    joinedDate: '2024-01-12',
    lastActive: '2024-01-16',
    status: 'active',
    bio: 'Bengali Tantrik and Vedic scholar with deep knowledge of ancient scriptures and modern applications.',
    profileCompleted: true,
    languages: ['English', 'Hindi', 'Punjabi'],
    rituals: ['North Indian Vedic Ritual Style', 'South Indian Agama Ritual Style'],
    identificationNumber: 'WB123456789',
    idType: 'Voter ID',
    idDocument: 'voter_id_arjun.pdf',
    idDocumentImage: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400',
    services: [
      { name: 'Bengali Wedding', price: 7000, location: 'Kolkata', duration: '5 hours' },
      { name: 'Bengali Wedding', price: 8000, location: 'Bhubaneswar', duration: '5 hours' },
      { name: 'Tantrik Healing', price: 3500, location: 'Kolkata', duration: '2 hours' },
      { name: 'Tantrik Healing', price: 4000, location: 'Bhubaneswar', duration: '2 hours' },
      { name: 'Ancient Scripture Study', price: 2500, location: 'Online', duration: '2 hours' },
      { name: 'Spiritual Healing', price: 2000, location: 'Kolkata', duration: '1.5 hours' },
      { name: 'Spiritual Healing', price: 2500, location: 'Bhubaneswar', duration: '1.5 hours' }
    ]
  },
  {
    id: '5',
    name: 'Swami Ravi Shankar',
    email: 'ravi.shankar@email.com',
    phone: '+91-9555012345',
    location: 'Rishikesh, India',
    profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
    experience: '8+ years',
    rating: 4.6,
    completedProjects: 23,
    joinedDate: '2024-01-11',
    lastActive: '2024-01-15',
    status: 'active',
    bio: 'Spiritual teacher and meditation expert specializing in Himalayan traditions and yoga philosophy.',
    profileCompleted: false,
    languages: ['English', 'Hindi', 'Punjabi'],
    rituals: ['North Indian Vedic Ritual Style'],
    identificationNumber: 'UK123456789',
    idType: 'Driving License',
    idDocument: 'driving_license_ravi.pdf',
    idDocumentImage: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=400',
    services: [
      { name: 'Meditation Workshop', price: 1800, location: 'Rishikesh', duration: '3 hours' },
      { name: 'Meditation Workshop', price: 2200, location: 'Haridwar', duration: '3 hours' },
      { name: 'Spiritual Retreat', price: 15000, location: 'Rishikesh', duration: '3 days' },
      { name: 'Spiritual Retreat', price: 18000, location: 'Haridwar', duration: '3 days' },
      { name: 'Online Satsang', price: 500, location: 'Online', duration: '1 hour' }
    ]
  },
  {
    id: '6',
    name: 'Mata Lakshmi Devi',
    email: 'lakshmi.devi@email.com',
    phone: '+91-9444567890',
    location: 'Varanasi, India',
    profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
    experience: '18+ years',
    rating: 4.8,
    completedProjects: 35,
    joinedDate: '2024-01-10',
    lastActive: '2024-01-14',
    status: 'inactive',
    bio: 'Traditional priestess and spiritual guide with expertise in Goddess worship and women-centric rituals.',
    profileCompleted: false,
    languages: ['English', 'Hindi', 'Punjabi'],
    rituals: ['North Indian Vedic Ritual Style', 'South Indian Agama Ritual Style', 'Maharashtrian Vedic Style'],
    identificationNumber: 'UP123456789',
    idType: 'Aadhaar Card',
    idDocument: 'aadhaar_lakshmi_devi.pdf',
    idDocumentImage: 'https://images.pexels.com/photos/7841828/pexels-photo-7841828.jpeg?auto=compress&cs=tinysrgb&w=400',
    services: [
      { name: 'Goddess Puja', price: 3000, location: 'Varanasi', duration: '2.5 hours' },
      { name: 'Goddess Puja', price: 3500, location: 'Allahabad', duration: '2.5 hours' },
      { name: 'Women Blessing Ceremony', price: 2500, location: 'Varanasi', duration: '2 hours' },
      { name: 'Women Blessing Ceremony', price: 3000, location: 'Allahabad', duration: '2 hours' },
      { name: 'Spiritual Guidance', price: 1000, location: 'Online', duration: '1 hour' }
    ]
  }
];

export default function FreelancerDetailsPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [imageZoom, setImageZoom] = useState<string | null>(null);

  // Period filtering state
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('this-month');
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    const fetchFreelancers = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFreelancers(mockFreelancers);
      setIsLoading(false);
    };

    fetchFreelancers();
  }, []);

  // Filter data by period and other criteria
  const filteredFreelancers = useMemo(() => {
    let filtered = freelancers;

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

    // Apply profile completion filter
    if (profileFilter !== 'all') {
      filtered = filtered.filter(freelancer =>
        profileFilter === 'completed' ? freelancer.profileCompleted : !freelancer.profileCompleted
      );
    }

    // Apply date filter last (only if not showing all data)
    if (selectedPeriod !== 'this-month' || customDateRange.from || customDateRange.to) {
      const dateRange = getDateRangeForPeriod(selectedPeriod, customDateRange);
      filtered = filterDataByDateRange(filtered, 'joinedDate', dateRange);
    }

    return filtered;
  }, [freelancers, selectedPeriod, customDateRange, searchTerm, statusFilter, profileFilter]);

  // Calculate period comparison
  const periodComparison = useMemo(() => {
    const currentRange = getDateRangeForPeriod(selectedPeriod, customDateRange);
    const currentData = filterDataByDateRange(freelancers, 'joinedDate', currentRange);

    // Get previous period data for comparison
    let previousPeriod: TimePeriod = 'last-month';
    if (selectedPeriod === 'today') previousPeriod = 'yesterday';
    else if (selectedPeriod === 'this-week') previousPeriod = 'last-week';
    else if (selectedPeriod === 'this-month') previousPeriod = 'last-month';

    const previousRange = getDateRangeForPeriod(previousPeriod);
    const previousData = filterDataByDateRange(freelancers, 'joinedDate', previousRange);

    return calculatePeriodComparison(currentData, previousData);
  }, [freelancers, selectedPeriod, customDateRange]);

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

  const getProfileCompletionBadge = (completed: boolean) => {
    return completed ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Complete
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Incomplete
      </Badge>
    );
  };

  // Group services by name for better display
  const groupServicesByName = (services: Service[]) => {
    const grouped: { [key: string]: Service[] } = {};
    services.forEach(service => {
      if (!grouped[service.name]) {
        grouped[service.name] = [];
      }
      grouped[service.name].push(service);
    });
    return grouped;
  };

  // Calculate stats for filtered data
  const totalFreelancers = filteredFreelancers.length;
  const completedProfiles = filteredFreelancers.filter(f => f.profileCompleted).length;
  const completionRate = totalFreelancers > 0 ? Math.round((completedProfiles / totalFreelancers) * 100) : 0;

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
            comparison={periodComparison}
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

            {/* Profile Completion Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl md:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  </div>
                  <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                    {completionRate}%
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {completedProfiles}/{totalFreelancers}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    Completed Profiles
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{totalFreelancers - completedProfiles} incomplete</span>
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
                    <option value="completed">Complete</option>
                    <option value="incomplete">Incomplete</option>
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
                          {getProfileCompletionBadge(freelancer.profileCompleted)}
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

          {/* Detail Modal */}
          <Dialog open={!!selectedFreelancer} onOpenChange={() => setSelectedFreelancer(null)}>
            <DialogContent className="sm:max-w-5xl">
              <DialogHeader>
                <DialogTitle>Freelancer Profile</DialogTitle>
                <DialogDescription>
                  Detailed information about the freelancer
                </DialogDescription>
              </DialogHeader>

              {selectedFreelancer && (
                <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={selectedFreelancer.profileImage}
                        alt={selectedFreelancer.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                        onClick={() => setImageZoom(selectedFreelancer.profileImage)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-full cursor-pointer"
                        onClick={() => setImageZoom(selectedFreelancer.profileImage)}>
                        <ZoomIn className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900">{selectedFreelancer.name}</h3>
                        {getProfileCompletionBadge(selectedFreelancer.profileCompleted)}
                      </div>
                      <p className="text-gray-600">{selectedFreelancer.email}</p>
                      <p className="text-gray-600">{selectedFreelancer.phone}</p>
                      <p className="text-sm text-gray-500">Experience: {selectedFreelancer.experience}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedFreelancer.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-blue-600" />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFreelancer.languages.map((language) => (
                          <Badge key={language} className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                        Ritual Styles
                      </h4>
                      <div className="space-y-2">
                        {selectedFreelancer.rituals.map((ritual) => (
                          <Badge key={ritual} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 block w-full text-center">
                            {ritual}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ID Documents Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
                      Identification Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded border">
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">Document Type:</span>
                          <p className="font-medium">{selectedFreelancer.idType}</p>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">ID Number:</span>
                          <p className="font-mono font-medium">{selectedFreelancer.identificationNumber}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Document File:</span>
                          <p className="text-blue-600 underline cursor-pointer text-sm">{selectedFreelancer.idDocument}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded border">
                        <div className="mb-3">
                          <span className="text-sm text-gray-500 block mb-2">Document Image:</span>
                          <div className="relative group">
                            <img
                              src={selectedFreelancer.idDocumentImage}
                              alt={`${selectedFreelancer.idType} Document`}
                              className="w-full h-32 object-cover rounded border cursor-pointer hover:shadow-lg transition-shadow duration-200"
                              onClick={() => setImageZoom(selectedFreelancer.idDocumentImage)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded cursor-pointer"
                              onClick={() => setImageZoom(selectedFreelancer.idDocumentImage)}>
                              <ZoomIn className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Click to view full size</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      Services & Location-Based Pricing
                    </h4>
                    <div className="space-y-6">
                      {Object.entries(groupServicesByName(selectedFreelancer.services)).map(([serviceName, serviceVariants]) => (
                        <div key={serviceName} className="bg-white p-4 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-gray-900 mb-3 text-lg">{serviceName}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {serviceVariants.map((service, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded border">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span className="font-medium">{service.location}</span>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                    ₹{service.price.toLocaleString()}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{service.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rating:</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{selectedFreelancer.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Projects:</span>
                          <span className="font-medium">{selectedFreelancer.completedProjects}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Activity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Joined:</span>
                          <span>{new Date(selectedFreelancer.joinedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Active:</span>
                          <span>{new Date(selectedFreelancer.lastActive).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!selectedFreelancer.profileCompleted && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-orange-900 mb-1">Profile Incomplete</h4>
                          <p className="text-sm text-orange-700">
                            This freelancer hasn't completed their profile yet. They may be missing important information like portfolio items, certifications, or detailed work history.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Image Zoom Modal */}
          <Dialog open={!!imageZoom} onOpenChange={() => setImageZoom(null)}>
            <DialogContent className="sm:max-w-2xl p-0 bg-transparent border-0 shadow-none">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
                  onClick={() => setImageZoom(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {imageZoom && (
                  <img
                    src={imageZoom}
                    alt="Zoomed Image"
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}