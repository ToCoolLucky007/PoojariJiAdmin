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
import {
  Search,
  Eye,
  Calendar,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';

interface Consumer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string;
  joinedDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  preferredCategories: string[];
  accountType: 'individual' | 'business';
}

// Mock data
const mockConsumers: Consumer[] = [
  {
    id: '1',
    name: 'Jennifer Smith',
    email: 'jennifer.smith@email.com',
    phone: '+1-555-0201',
    location: 'Los Angeles, USA',
    profileImage: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300',
    joinedDate: '2024-01-15',
    lastActive: '2024-01-16',
    status: 'active',
    totalOrders: 12,
    totalSpent: 3450,
    averageOrderValue: 287.5,
    preferredCategories: ['Web Development', 'Design'],
    accountType: 'business'
  },
  {
    id: '2',
    name: 'Robert Johnson',
    email: 'robert.j@email.com',
    phone: '+1-555-0202',
    location: 'Chicago, USA',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
    joinedDate: '2024-01-14',
    lastActive: '2024-01-16',
    status: 'active',
    totalOrders: 8,
    totalSpent: 1890,
    averageOrderValue: 236.25,
    preferredCategories: ['Digital Marketing', 'Content Writing'],
    accountType: 'individual'
  },
  {
    id: '3',
    name: 'Lisa Chen',
    email: 'lisa.chen@email.com',
    phone: '+1-555-0203',
    location: 'Boston, USA',
    profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
    joinedDate: '2024-01-13',
    lastActive: '2024-01-15',
    status: 'active',
    totalOrders: 15,
    totalSpent: 4200,
    averageOrderValue: 280,
    preferredCategories: ['Mobile App Development', 'UI/UX Design'],
    accountType: 'business'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1-555-0204',
    location: 'Miami, USA',
    profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
    joinedDate: '2024-01-12',
    lastActive: '2024-01-14',
    status: 'inactive',
    totalOrders: 5,
    totalSpent: 950,
    averageOrderValue: 190,
    preferredCategories: ['SEO', 'Social Media Marketing'],
    accountType: 'individual'
  }
];

export default function ConsumerDetailsPage() {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [filteredConsumers, setFilteredConsumers] = useState<Consumer[]>([]);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchConsumers = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConsumers(mockConsumers);
      setFilteredConsumers(mockConsumers);
      setIsLoading(false);
    };

    fetchConsumers();
  }, []);

  useEffect(() => {
    let filtered = consumers;

    if (searchTerm) {
      filtered = filtered.filter(consumer =>
        consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumer.preferredCategories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(consumer => consumer.status === statusFilter);
    }

    setFilteredConsumers(filtered);
  }, [searchTerm, statusFilter, consumers]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="destructive">Suspended</Badge>;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    return type === 'business'
      ? <Badge variant="outline" className="bg-blue-50 text-blue-700">Business</Badge>
      : <Badge variant="outline" className="bg-gray-50 text-gray-700">Individual</Badge>;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Consumer Details
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
              Consumer Details
            </h1>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {filteredConsumers.length} Consumers
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{consumers.length}</p>
                    <p className="text-sm text-gray-500">Total Consumers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{consumers.filter(c => c.status === 'active').length}</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{consumers.reduce((sum, c) => sum + c.totalOrders, 0)}</p>
                    <p className="text-sm text-gray-500">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">${consumers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Filter Consumers</CardTitle>
              <CardDescription>Search and filter consumer profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, or categories..."
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
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredConsumers.map((consumer) => (
              <Card key={consumer.id} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={consumer.profileImage}
                        alt={consumer.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{consumer.name}</h3>
                        <p className="text-sm text-gray-600">{consumer.email}</p>
                        <p className="text-sm text-gray-500">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {consumer.location}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">{consumer.totalOrders} orders</span>
                          <span className="text-sm font-medium text-green-600">${consumer.totalSpent.toLocaleString()} spent</span>
                          {getAccountTypeBadge(consumer.accountType)}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {consumer.preferredCategories.slice(0, 2).map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">{category}</Badge>
                          ))}
                          {consumer.preferredCategories.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{consumer.preferredCategories.length - 2} more</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(consumer.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConsumer(consumer)}
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

          {filteredConsumers.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No consumers found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}

          {/* Detail Modal */}
          <Dialog open={!!selectedConsumer} onOpenChange={() => setSelectedConsumer(null)}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Consumer Profile</DialogTitle>
                <DialogDescription>
                  Detailed information about the consumer
                </DialogDescription>
              </DialogHeader>

              {selectedConsumer && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedConsumer.profileImage}
                      alt={selectedConsumer.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedConsumer.name}</h3>
                      <p className="text-gray-600">{selectedConsumer.email}</p>
                      <p className="text-gray-600">{selectedConsumer.phone}</p>
                      <p className="text-sm text-gray-500">{selectedConsumer.location}</p>
                      <div className="mt-2">
                        {getAccountTypeBadge(selectedConsumer.accountType)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Order Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Orders:</span>
                          <span className="font-medium">{selectedConsumer.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Spent:</span>
                          <span className="font-medium">${selectedConsumer.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Avg Order Value:</span>
                          <span className="font-medium">${selectedConsumer.averageOrderValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Account Activity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Joined:</span>
                          <span>{new Date(selectedConsumer.joinedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Active:</span>
                          <span>{new Date(selectedConsumer.lastActive).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          {getStatusBadge(selectedConsumer.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Preferred Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedConsumer.preferredCategories.map((category) => (
                        <Badge key={category} variant="outline">{category}</Badge>
                      ))}
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