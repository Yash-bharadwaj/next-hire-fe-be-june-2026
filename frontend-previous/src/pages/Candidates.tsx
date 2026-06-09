
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
  Calendar,
  User,
  Mail,
  Phone,
  GraduationCap,
  Star,
  FileText,
  MessageSquare,
  Briefcase,
  Users,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  UserCheck,
  UserX,
  Send,
  Bot,
  FileSpreadsheet,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock candidates data - in real app this would come from API
const candidatesData = [
  {
    id: "1",
    name: "Jack Collins",
    email: "jack.collins@email.com",
    phone: "(555) 123-4567",
    title: "Senior React Developer",
    location: "Toledo, MT",
    experience: "8 years",
    status: "Active",
    currentSalary: "$95,000",
    expectedSalary: "$120,000",
    skills: "React, TypeScript, Node.js",
    availability: "2 weeks notice",
    lastContact: "2024-01-20",
    submissions: 3,
    rating: 4.5
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 987-6543",
    title: "Product Manager",
    location: "San Francisco, CA",
    experience: "6 years",
    status: "Available",
    currentSalary: "$110,000",
    expectedSalary: "$135,000",
    skills: "Product Strategy, Agile, Analytics",
    availability: "Immediate",
    lastContact: "2024-01-19",
    submissions: 5,
    rating: 4.8
  },
  {
    id: "3",
    name: "Alex Chen",
    email: "alex.chen@email.com",
    phone: "(555) 456-7890",
    title: "UX Designer",
    location: "New York, NY",
    experience: "4 years",
    status: "Interview",
    currentSalary: "$85,000",
    expectedSalary: "$100,000",
    skills: "Figma, User Research, Prototyping",
    availability: "3 weeks notice",
    lastContact: "2024-01-18",
    submissions: 2,
    rating: 4.2
  },
  {
    id: "4",
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "(555) 321-0987",
    title: "Data Scientist",
    location: "Austin, TX",
    experience: "5 years",
    status: "Placed",
    currentSalary: "$105,000",
    expectedSalary: "$125,000",
    skills: "Python, Machine Learning, SQL",
    availability: "N/A",
    lastContact: "2024-01-15",
    submissions: 4,
    rating: 4.6
  }
];

const Candidates = () => {
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const activeCandidates = candidatesData.filter(candidate => candidate.status === "Active").length;
  const availableCandidates = candidatesData.filter(candidate => candidate.status === "Available").length;
  const inInterviewCandidates = candidatesData.filter(candidate => candidate.status === "Interview").length;
  const placedCandidates = candidatesData.filter(candidate => candidate.status === "Placed").length;
  const totalSubmissions = candidatesData.reduce((sum, candidate) => sum + candidate.submissions, 0);
  const avgRating = (candidatesData.reduce((sum, candidate) => sum + candidate.rating, 0) / candidatesData.length).toFixed(1);

  const handleActiveClick = () => {
    setActiveFilters({ status: ["Active"] });
  };

  const handleAvailableClick = () => {
    setActiveFilters({ status: ["Available"] });
  };

  const handleInterviewClick = () => {
    setActiveFilters({ status: ["Interview"] });
  };

  const handlePlacedClick = () => {
    setActiveFilters({ status: ["Placed"] });
  };

  const navigationCards = [
    {
      title: "Active Candidates",
      value: activeCandidates.toString(),
      icon: CheckCircle,
      color: "text-green-700",
      gradientOverlay: "bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/30",
      onClick: handleActiveClick
    },
    {
      title: "Available",
      value: availableCandidates.toString(),
      icon: User,
      color: "text-blue-700",
      gradientOverlay: "bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/30",
      onClick: handleAvailableClick
    },
    {
      title: "In Interview",
      value: inInterviewCandidates.toString(),
      icon: Clock,
      color: "text-amber-700",
      gradientOverlay: "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/30",
      onClick: handleInterviewClick
    },
    {
      title: "Placed",
      value: placedCandidates.toString(),
      icon: Briefcase,
      color: "text-purple-700",
      gradientOverlay: "bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-purple-600/30",
      onClick: handlePlacedClick
    },
    {
      title: "Total Submissions",
      value: totalSubmissions.toString(),
      icon: FileText,
      color: "text-indigo-700",
      gradientOverlay: "bg-gradient-to-br from-indigo-400/30 via-indigo-500/20 to-indigo-600/30",
      onClick: () => navigate("/dashboard/submissions")
    },
    {
      title: "Avg Rating",
      value: avgRating,
      icon: Star,
      color: "text-orange-700",
      gradientOverlay: "bg-gradient-to-br from-orange-400/30 via-orange-500/20 to-orange-600/30",
      onClick: () => {}
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Available': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Interview': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Placed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatSalary = (salary: string) => {
    return salary?.includes('$') ? salary : `$${salary}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      renderCell: (value: string, row: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/candidates/${row.id}`);
          }}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium font-poppins text-xs"
        >
          #{value}
        </button>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      renderCell: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/candidates/${row.id}`);
            }}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1"
            title={value}
          >
            {value}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/candidates/${row.id}?edit=true`);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit candidate"
          >
            <Pencil className="w-3 h-3 text-gray-500 hover:text-blue-600" />
          </button>
        </div>
      )
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 180,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={value}>{value}</span>
      )
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 120,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={value}>{value}</span>
      )
    },
    {
      field: 'experience',
      headerName: 'Experience',
      width: 100,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap" title={value}>{value}</span>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (value: string) => (
        <Badge className={`${getStatusColor(value)} border font-medium font-poppins text-xs whitespace-nowrap`}>{value}</Badge>
      )
    },
    {
      field: 'currentSalary',
      headerName: 'Current Salary',
      width: 120,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-medium font-poppins text-xs whitespace-nowrap">{formatSalary(value)}</span>
      )
    },
    {
      field: 'expectedSalary',
      headerName: 'Expected Salary',
      width: 130,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-medium font-poppins text-xs whitespace-nowrap">{formatSalary(value)}</span>
      )
    },
    {
      field: 'submissions',
      headerName: 'Submissions',
      width: 100,
      renderCell: (value: number) => (
        <span className="text-gray-700 font-medium font-poppins text-xs whitespace-nowrap">{value}</span>
      )
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 80,
      renderCell: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-gray-700 font-medium font-poppins text-xs">{value}</span>
        </div>
      )
    },
    {
      field: 'lastContact',
      headerName: 'Last Contact',
      width: 110,
      renderCell: (value: string) => (
        <span className="text-gray-700 font-poppins text-xs whitespace-nowrap">{formatDate(value)}</span>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-roboto-slab">Candidates</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 hover:border-green-300 text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Export
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
              <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50">
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Send a Followup
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCheck className="w-4 h-4 mr-2" />
                Change Ownership
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckCircle className="w-4 h-4 mr-2" />
                Change status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash2 className="w-4 h-4 mr-2" />
                Mark for deletion
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="w-4 h-4 mr-2" />
                Send to Vendors
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Send Hotlist email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Bot className="w-4 h-4 mr-2" />
                AI Recruiter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Navigation Cards - Single Row */}
      <div className="grid grid-cols-6 gap-2">
        {navigationCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card 
              key={card.title} 
              className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1 group cursor-pointer backdrop-blur-xl bg-white/20"
              onClick={card.onClick}
            >
              <div className={`absolute inset-0 ${card.gradientOverlay}`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
              <CardContent className="relative p-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-full bg-white/30 backdrop-blur-sm shadow-sm group-hover:bg-white/40 transition-all border border-white/20">
                    <IconComponent className={`h-3 w-3 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 font-roboto-slab">{card.title}</p>
                    <p className="text-sm font-bold text-gray-900 font-roboto-slab">{card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <DataGrid
            rows={candidatesData}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            onRowClick={(row) => console.log('Row clicked:', row)}
            initialFilters={activeFilters}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Candidates;
