import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/ui/data-grid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Building2,
  Users,
  UserCheck,
  Truck,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Settings,
  Share2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  FileSpreadsheet,
  Import,
  PenTool,
  Bot,
  RotateCcw,
  ExternalLink,
  Pencil,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBusinessPartners, useBusinessPartnerStats } from "@/hooks/useBusinessPartners";
import { businessPartnerService } from "@/services/businessPartnerService";
import { useAuth } from "@/contexts/AuthContext";

const BusinessPartners = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Hooks
  const {
    businessPartners,
    loading,
    error,
    pagination,
    fetchBusinessPartners,
    refresh
  } = useBusinessPartners();

  const {
    stats,
    loading: statsLoading,
    refresh: refreshStats
  } = useBusinessPartnerStats();

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Calculate stats from real data
  const totalPartners = stats?.totalPartners || 0;
  const leads = stats?.leads || 0;
  const clients = stats?.clients || 0;
  const vendors = stats?.vendors || 0;
  const activePartners = stats?.activePartners || 0;

  const handleLeadsClick = () => {
    fetchBusinessPartners({ partner_type: "lead" });
  };

  const handleClientsClick = () => {
    fetchBusinessPartners({ partner_type: "client" });
  };

  const handleVendorsClick = () => {
    fetchBusinessPartners({ partner_type: "vendor" });
  };

  const handleActiveClick = () => {
    fetchBusinessPartners({ status: "active" });
  };

  const handleViewDetails = (partnerId: string) => {
    navigate(`/dashboard/business-partners/${partnerId}`);
  };

  const navigationCards = [
    {
      title: "Total Partners",
      value: totalPartners.toString(),
      icon: Building2,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: () => fetchBusinessPartners({})
    },
    {
      title: "Leads",
      value: leads.toString(),
      icon: TrendingUp,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleLeadsClick
    },
    {
      title: "Clients",
      value: clients.toString(),
      icon: UserCheck,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
      onClick: handleClientsClick
    },
    {
      title: "Vendors",
      value: vendors.toString(),
      icon: Truck,
      color: "text-orange-700",
      gradientOverlay: "bg-gradient-to-br from-orange-400/30 via-orange-500/20 to-orange-600/30",
      onClick: handleVendorsClick
    },
    {
      title: "Active",
      value: activePartners.toString(),
      icon: Users,
      color: "text-emerald-700",
      gradientOverlay: "bg-gradient-to-br from-emerald-400/30 via-emerald-500/20 to-emerald-600/30",
      onClick: handleActiveClick
    }
  ];

  // Helper functions now use the service
  const getStatusColor = (status: string) => {
    return businessPartnerService.getStatusColor(status as any);
  };

  const getPartnerType = (partner: any) => {
    return businessPartnerService.getPartnerType(partner);
  };

  const getPartnerTypeColor = (partner: any) => {
    return businessPartnerService.getPartnerTypeColor(partner);
  };

  const formatDate = (dateString: string) => {
    return businessPartnerService.formatDate(dateString);
  };

  const columns = [
    {
      field: 'business_partner_number',
      headerName: 'BP #',
      width: 80,
      renderCell: (value: string, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row.id);
          }}
          className="text-blue-600 font-medium font-poppins text-xs hover:text-blue-800 hover:underline cursor-pointer"
        >
          {value}
        </button>
      )
    },
    {
      field: 'name',
      headerName: 'Company Name',
      width: 200,
      renderCell: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(row.id);
              }}
              className="font-medium text-gray-900 font-poppins text-xs hover:text-blue-600 hover:underline cursor-pointer text-left"
            >
              {value}
            </button>
            <span className="text-xs text-gray-500 font-poppins">{row.domain}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/business-partners/${row.id}?edit=true`);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit business partner"
          >
            <Pencil className="w-3 h-3 text-gray-500 hover:text-blue-600" />
          </button>
        </div>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (value: any, row: any) => (
        <Badge className={`${getPartnerTypeColor(row)} border font-medium font-poppins text-xs whitespace-nowrap`}>
          {getPartnerType(row)}
        </Badge>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 80,
      renderCell: (value: string) => (
        <Badge className={`${getStatusColor(value)} border font-medium font-poppins text-xs whitespace-nowrap`}>{value}</Badge>
      )
    },
    {
      field: 'city',
      headerName: 'Location',
      width: 120,
      renderCell: (value: any, row: any) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-gray-700 font-poppins text-xs">{row.city}, {row.state}</span>
        </div>
      )
    },
    {
      field: 'primary_email',
      headerName: 'Contact',
      width: 180,
      renderCell: (value: string, row: any) => (
        <div className="flex flex-col gap-1">
          <a 
            href={`mailto:${value}`}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-3 h-3" />
            <span className="truncate font-poppins">{value}</span>
          </a>
          <a 
            href={`tel:${row.primary_phone}`}
            className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="w-3 h-3" />
            <span className="font-poppins">{row.primary_phone}</span>
          </a>
        </div>
      )
    },
    {
      field: 'website',
      headerName: 'Website',
      width: 120,
      renderCell: (value: string) => (
        <a 
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <Globe className="w-3 h-3" />
          <span className="font-poppins">Visit</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs">{value}</span>
      )
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs">{formatDate(value)}</span>
      )
    },
    {
      field: 'last_activity_at',
      headerName: 'Last Activity',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs">{formatDate(value)}</span>
      )
    },
  ];

  // Check if user is authorized
  if (user?.role !== "recruiter") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              This page is only available for recruiters.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-roboto-slab">Business Partners</h1>
          <p className="text-sm text-gray-600 font-roboto-slab">Manage client relationships and partnerships</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh} 
            disabled={loading}
            className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs flex-1 sm:flex-none px-2 sm:px-3"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs flex-1 sm:flex-none px-2 sm:px-3">
                <FileText className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Google Sheets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs flex-1 sm:flex-none px-2 sm:px-3">
                <Settings className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share contacts
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Send bulk email
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCheck className="w-4 h-4 mr-2" />
                Update status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash2 className="w-4 h-4 mr-2" />
                Bulk delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <RotateCcw className="w-4 h-4 mr-2" />
                Mass changes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex-1 sm:flex-none px-2 sm:px-3">
                <Plus className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">New Partner</span>
                <span className="sm:hidden">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <PenTool className="w-4 h-4 mr-2" />
                Manual Entry
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Import className="w-4 h-4 mr-2" />
                Import from file
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bot className="w-4 h-4 mr-2" />
                AI Assistant
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                From Business Card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
        {statsLoading ? (
          // Loading skeleton for navigation cards
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-sm backdrop-blur-xl bg-white/20">
              <CardContent className="relative p-1.5 sm:p-2">
                <div className="flex flex-col items-center space-y-1">
                  <div className="p-1 sm:p-1.5 rounded-full bg-gray-200 animate-pulse">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-gray-300 rounded"></div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          navigationCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card 
                key={card.title} 
                className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer backdrop-blur-xl bg-white/20"
                onClick={card.onClick}
              >
                <div className={`absolute inset-0 ${card.gradientOverlay}`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                <CardContent className="relative p-1.5 sm:p-2">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="p-1 sm:p-1.5 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                      <IconComponent className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${card.color}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-600 font-roboto-slab truncate">{card.title}</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 font-roboto-slab">{card.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Data Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading && businessPartners.length === 0 ? (
            // Loading state
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading business partners...</span>
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">{error}</p>
              <Button onClick={refresh} variant="outline" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : businessPartners.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No business partners found</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first business partner.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Business Partner
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-0">
              <div className="min-w-full">
                <DataGrid
                  rows={businessPartners}
                  columns={columns}
                  pageSizeOptions={[5, 10, 25, 50]}
                  checkboxSelection
                  onRowClick={(row) => handleViewDetails(row.id)}
                  initialFilters={activeFilters}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessPartners;
