'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Globe,
    Sparkles,
    DollarSign,
    ZoomIn,
    X,
    CreditCard,
    FileText,
    MapPin,
    Clock,
    Star,
    Briefcase,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    User
} from 'lucide-react';

interface Service {
    name: string;
    price: number;
    location: string;
    duration: string;
}

interface ProfileData {
    id: string;
    consultantid: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string;
    identificationNumber: string;
    idType: string;
    idDocument: string;
    idDocumentImage: string;
    languages: string[];
    rituals: string[];
    // Optional fields for different profile types
    about?: string;
    bio?: string;
    experience?: string;
    rating?: number;
    completedProjects?: number;
    skills?: string[];
    services?: Service[];
    activestatus?: 'active' | 'inactive';
    status?: 'approved' | 'rejected' | 'pending';
    profileCompleted?: boolean;
    joinedDate?: string;
    lastActive?: string;
    submittedDate?: string;
}

interface ProfileDetailModalProps {
    profile: ProfileData | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange?: (consultantId: string, profileId: string, action: 'approve' | 'reject') => void;
    actionLoading?: string | null;
    title?: string;
    description?: string;
    showActions?: boolean;
    profileType?: 'consultant' | 'freelancer';
}

export default function ProfileDetailModal({
    profile,
    isOpen,
    onClose,
    onStatusChange,
    actionLoading,
    title = "Profile Details",
    description = "Detailed information about the profile",
    showActions = false,
    profileType = 'consultant'
}: ProfileDetailModalProps) {
    const [imageZoom, setImageZoom] = useState<string | null>(null);

    if (!profile) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    const getActiveBadge = (isactive?: string) => {
        if (isactive === undefined) return null;
        return (isactive == "active") ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                In-active
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

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                        {/* Profile Header */}
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <img
                                    src={profile.profileImage}
                                    alt={profile.name}
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200"
                                    onClick={() => setImageZoom(profile.profileImage)}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-2xl cursor-pointer"
                                    onClick={() => setImageZoom(profile.profileImage)}>
                                    <ZoomIn className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">{profile.name}</h3>
                                    {profile.status && getStatusBadge(profile.status)}
                                </div>
                                <p className="text-gray-600 mb-1">{profile.email}</p>
                                <p className="text-gray-600 mb-1">{profile.phone}</p>
                                {profile.experience && (
                                    <p className="text-sm text-gray-500 mb-3">Experience: {profile.experience}</p>
                                )}
                                <div className="flex items-center space-x-2">

                                    {profile.activestatus !== undefined && getActiveBadge(profile.activestatus)}
                                </div>
                            </div>
                        </div>

                        {/* About/Bio Section */}
                        {(profile.about || profile.bio) && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                    About
                                </h4>
                                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                                    {profile.about || profile.bio}
                                </p>
                            </div>
                        )}

                        {/* Languages and Rituals */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                                    Languages
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {profile.languages.map((language) => (
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
                                    {profile.rituals.map((ritual) => (
                                        <Badge key={ritual} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 block w-full text-center">
                                            {ritual}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Skills Section (for freelancers) */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill) => (
                                        <Badge key={skill} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        adg
                        {/* Services Section */}
                        {profile.services && profile.services.length > 0 && (
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                                    Services & Location-Based Pricing
                                </h4>
                                <div className="space-y-6">
                                    {Object.entries(groupServicesByName(profile.services)).map(([serviceName, serviceVariants]) => (
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
                        )}

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
                                        <p className="font-medium">{profile.idType}</p>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-sm text-gray-500">ID Number:</span>
                                        <p className="font-mono font-medium">{profile.identificationNumber}</p>
                                    </div>

                                </div>

                                <div className="bg-white p-4 rounded border">
                                    <div className="mb-3">
                                        <span className="text-sm text-gray-500 block mb-2">Document Image:</span>
                                        <div className="relative group">
                                            <img
                                                src={profile.idDocumentImage}
                                                alt={`${profile.idType} Document`}
                                                className="w-full h-32 object-cover rounded border cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                                onClick={() => setImageZoom(profile.idDocumentImage)}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded cursor-pointer"
                                                onClick={() => setImageZoom(profile.idDocumentImage)}>
                                                <ZoomIn className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Click to view full size</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance/Activity Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Performance (for freelancers) */}
                            {(profile.rating !== undefined || profile.completedProjects !== undefined) && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                                    <div className="space-y-2 text-sm">
                                        {profile.rating !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Rating:</span>
                                                <div className="flex items-center">
                                                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                    <span className="font-medium">{profile.rating}</span>
                                                </div>
                                            </div>
                                        )}
                                        {profile.completedProjects !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Projects:</span>
                                                <span className="font-medium">{profile.completedProjects}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Activity */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Activity</h4>
                                <div className="space-y-2 text-sm">
                                    {(profile.joinedDate || profile.submittedDate) && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{profile.joinedDate ? 'Joined:' : 'Submitted:'}</span>
                                            <span>{new Date(profile.joinedDate || profile.submittedDate!).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {profile.lastActive && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Last Active:</span>
                                            <span>{new Date(profile.lastActive).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Incomplete Warning */}
                        {profile.profileCompleted === false && (
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-orange-900 mb-1">Profile Incomplete</h4>
                                        <p className="text-sm text-orange-700">
                                            This {profileType} hasn't completed their profile yet. They may be missing important information like portfolio items, certifications, or detailed work history.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {showActions && profile.status === 'pending' && onStatusChange && (
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => onStatusChange(profile.consultantid, profile.id, 'reject')}
                                    disabled={!!actionLoading}
                                    className="hover:bg-red-50 hover:border-red-200"
                                >
                                    {actionLoading === profile.id ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <XCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => onStatusChange(profile.consultantid, profile.id, 'approve')}
                                    disabled={!!actionLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {actionLoading === profile.id ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Approve
                                </Button>
                            </div>
                        )}
                    </div>
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
        </>
    );
}