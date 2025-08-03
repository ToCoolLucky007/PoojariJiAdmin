'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  Calendar,
  Mail,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';

interface Feedback {
  id: number;
  app: string;
  type: 'Feedback' | 'Suggestion' | 'Problem';
  description: string;
  createdAt: string;
  email: string;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState('-1');
  const [selectedType, setSelectedType] = useState('-1');
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueApps, setUniqueApps] = useState<string[]>([]);
  // Actual filters to use in API call (only update when user clicks "Apply Filters")
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    app: '-1',
    type: '-1',
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Pagination state
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  // Fetch feedback data from API
  const fetchFeedbacks = async (customPage = page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.warn('No admin token found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: customPage.toString(),
        limit: itemsPerPage.toString(),
        search: appliedFilters.search,
        app: appliedFilters.app,
        type: appliedFilters.type,
      });

      const response = await fetch(`${baseUrl}/api/admin/feedbacks?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      const data = await response.json();

      if (response.ok && data.success) {


        setFeedbacks(data.data.feedbacks || []);
        setTotalCount(data.data.totalCount || 0);
        setUniqueApps(data.data.uniqueApps || []);
      } else {
        console.error('Failed to fetch consultants:', data.message || 'Unknown error');
        setFeedbacks([]);
        setTotalCount(0);
        setUniqueApps([]);
      }

    } catch (error) {
      console.error('Error fetching feedback:', error);

    } finally {
      setLoading(false);
    }
  };
  const handleApplyFilters = async () => {

    setAppliedFilters({
      search: searchTerm,
      app: selectedApp,
      type: selectedType,
    });
    setPage(1);
  };
  const handlePageChange = (page: number) => {
    setPage(page);
    //fetchFeedbacks(page);
  };
  useEffect(() => {
    handleApplyFilters(); // triggers the first fetch with default filters
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchFeedbacks();
  }, [appliedFilters, page]);
  // Pagination calculations
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalCount);


  // Get type icon and color
  const getTypeConfig = (type: string) => {

    switch (type) {
      case 'Feedback':

        return { icon: MessageSquare, color: 'bg-blue-100 text-blue-800', label: 'Feedback' };
      case 'Suggestion':
        return { icon: Lightbulb, color: 'bg-green-100 text-green-800', label: 'Suggestion' };
      case 'Problem':
        return { icon: AlertTriangle, color: 'bg-red-100 text-red-800', label: 'Problem' };
      default:
        return { icon: MessageSquare, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  // Get app icon
  const getAppIcon = (app: string) => {
    if (app.toLowerCase().includes('mobile')) {
      return Smartphone;
    }
    return MessageSquare;
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['ID', 'App', 'Type', 'Description', 'Created At', 'Email'],
      ...feedbacks.map(feedback => [
        feedback.id,
        feedback.app,
        feedback.type,
        feedback.description,
        format(new Date(feedback.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        feedback.email
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-gray-600 mt-1">View and manage user feedback, suggestions, and problems</p>
            </div>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Lightbulb className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Suggestions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbacks.filter(f => f.type === 'Suggestion').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Problems</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbacks.filter(f => f.type === 'Problem').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">General Feedback</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {feedbacks.filter(f => f.type === 'Feedback').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="appFilter">Application</Label>
                  <select
                    id="appFilter"
                    value={selectedApp}
                    onChange={(e) => setSelectedApp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="-1">All Applications</option>
                    {uniqueApps.map(app => (
                      <option key={app} value={app}>{app}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="typeFilter">Type</Label>
                  <select
                    id="typeFilter"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="-1">All Types</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Problem">Problem</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="default"
                    onClick={handleApplyFilters} // <-- Your fetch function
                    className="w-full"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedApp('-1');
                      setSelectedType('-1');
                      setAppliedFilters({
                        search: '',
                        app: '-1',
                        type: '-1',
                      });

                      setPage(1);
                      // handleApplyFilters(); // Optionally refetch with cleared filters
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Feedback Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Feedback List ({totalCount} total items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">App</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((feedback) => {
                      const typeConfig = getTypeConfig(feedback.type);
                      const AppIcon = getAppIcon(feedback.app);

                      return (
                        <tr key={feedback.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <AppIcon className="h-5 w-5 text-gray-500 mr-2" />
                              <span className="font-medium text-gray-900">{feedback.app}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={typeConfig.color}>
                              <typeConfig.icon className="h-3 w-3 mr-1" />
                              {typeConfig.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="max-w-md">
                              <p className="text-gray-900 line-clamp-2">
                                {feedback.description}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="text-sm">
                                {format(new Date(feedback.createdAt), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(feedback.createdAt), 'HH:mm')}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-1" />
                              <span className="text-sm">{feedback.email}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {feedbacks.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No feedback found matching your criteria</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex} to {endIndex} of {totalCount} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(page - 1, 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div >
      </AdminLayout >
    </ProtectedRoute >
  );
}