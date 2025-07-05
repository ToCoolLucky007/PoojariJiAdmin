'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  ArrowRight,
  CheckCircle,
  Clock,
  UserPlus,
  Banknote
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  freelancers: {
    today: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    trend: 'up' | 'down';
    percentage: number;
    registered: number;
    profileCompleted: number;
  };
  consumers: {
    today: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    trend: 'up' | 'down';
    percentage: number;
  };
  orders: {
    today: number;
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    trend: 'up' | 'down';
    percentage: number;
  };
}

// Mock data - replace with actual API calls
const mockStats: DashboardStats = {
  freelancers: {
    today: 12,
    thisWeek: 84,
    lastWeek: 76,
    thisMonth: 324,
    trend: 'up',
    percentage: 10.5,
    registered: 324,
    profileCompleted: 187
  },
  consumers: {
    today: 28,
    thisWeek: 187,
    lastWeek: 203,
    thisMonth: 756,
    trend: 'down',
    percentage: 7.9
  },
  orders: {
    today: 45,
    thisWeek: 312,
    lastWeek: 289,
    thisMonth: 1247,
    trend: 'up',
    percentage: 8.0
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    const fetchStats = async () => {

      try {
        setIsLoading(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.warn('No admin token found');
          return;
        }
        const response = await fetch(`${baseUrl}/api/admin/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {

          setStats(data.data); // assuming API returns { freelancers, consumers, orders }
        } else {
          console.error('Failed to fetch orders:', data.message || 'Unknown error');
          setStats(null);

        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);


  const FreelancerStatCard = ({
    title,
    icon: Icon,
    data,
    detailLink
  }: {
    title: string;
    icon: any;
    data: DashboardStats['freelancers'];
    detailLink: string;
  }) => {


    return (
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-blue-600" />
            <Badge variant={data.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
              {data.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {data.percentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-2xl font-bold text-gray-900">{data.today}</div>
            <div className="text-xs text-gray-500 mb-4">Today</div>



            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-800">{data.thisWeek}</div>
                <div className="text-xs text-gray-500">This Week</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-600">{data.lastWeek}</div>
                <div className="text-xs text-gray-500">Last Week</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">{data.thisMonth}</div>
                <div className="text-xs text-gray-500">This Month</div>
              </div>
            </div>

            <Link href={detailLink}>
              <Button
                variant="outline"
                className="w-full mt-4 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatCard = ({
    title,
    icon: Icon,
    data,
    detailLink
  }: {
    title: string;
    icon: any;
    data: DashboardStats['consumers'];
    detailLink: string;
  }) => (
    <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-blue-600" />
          <Badge variant={data.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
            {data.trend === 'up' ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {data.percentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-2xl font-bold text-gray-900">{data.today}</div>
          <div className="text-xs text-gray-500 mb-4">Today</div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-800">{data.thisWeek}</div>
              <div className="text-xs text-gray-500">This Week</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-600">{data.lastWeek}</div>
              <div className="text-xs text-gray-500">Last Week</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{data.thisMonth}</div>
              <div className="text-xs text-gray-500">This Month</div>
            </div>
          </div>

          <Link href={detailLink}>
            <Button
              variant="outline"
              className="w-full mt-4 hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <div className="flex items-center space-x-2 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
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
              Dashboard Overview
            </h1>
            <div className="flex items-center space-x-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>

          {stats && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FreelancerStatCard
                title="New Freelancers"
                icon={Users}
                data={stats.freelancers}
                detailLink="/freelancer-details"
              />
              <StatCard
                title="New Consumers"
                icon={UserCheck}
                data={stats.consumers}
                detailLink="/consumer-details"
              />
              <StatCard
                title="Orders Placed"
                icon={ShoppingCart}
                data={stats.orders}
                detailLink="/order-details"
              />
            </div>
          )}

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
              <CardDescription>Manage your platform efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/consultant-verification">
                  <Button variant="outline" className="w-full h-16 hover:bg-blue-50 hover:border-blue-200">
                    <div className="text-center">
                      <UserCheck className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                      <div className="text-sm font-medium">Consultant Verification</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/business-verification">
                  <Button variant="outline" className="w-full h-16 hover:bg-purple-50 hover:border-purple-200">
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                      <div className="text-sm font-medium">Business Verification</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/cancelled-orders">
                  <Button variant="outline" className="w-full h-16 hover:bg-orange-50 hover:border-orange-200">
                    <div className="text-center">
                      <ShoppingCart className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                      <div className="text-sm font-medium">Cancelled Orders</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/withdrawal-requests">
                  <Button variant="outline" className="w-full h-16 hover:bg-green-50 hover:border-green-200">
                    <div className="text-center">
                      <Banknote className="h-6 w-6 mx-auto mb-1 text-green-600" />
                      <div className="text-sm font-medium">Withdrawal Requests</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}