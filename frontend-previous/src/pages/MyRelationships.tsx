import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, MessageSquare, Phone, Mail, Building2, Calendar, Star, Plus } from "lucide-react";

export default function MyRelationships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [relationshipType, setRelationshipType] = useState("all");

  const relationships = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Recruiter",
      company: "TechCorp Inc",
      type: "recruiter",
      email: "sarah.johnson@techcorp.com",
      phone: "+1 (555) 123-4567",
      lastContact: "2024-01-15",
      status: "active",
      rating: 5,
      notes: "Great recruiter, very responsive and helpful with job matching.",
      connectionDate: "2023-06-15",
      jobsWorkedTogether: 3
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Hiring Manager",
      company: "StartupXYZ",
      type: "hiring_manager",
      email: "m.chen@startupxyz.com",
      phone: "+1 (555) 987-6543",
      lastContact: "2024-01-10",
      status: "active",
      rating: 4,
      notes: "Direct hiring manager for frontend positions. Prefers technical discussions.",
      connectionDate: "2023-09-20",
      jobsWorkedTogether: 1
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Talent Acquisition Specialist",
      company: "Digital Solutions",
      type: "recruiter",
      email: "emily.r@digitalsolutions.com",
      phone: "+1 (555) 456-7890",
      lastContact: "2024-01-08",
      status: "inactive",
      rating: 3,
      notes: "Good for contract positions but response time can be slow.",
      connectionDate: "2023-03-10",
      jobsWorkedTogether: 2
    },
    {
      id: 4,
      name: "David Kim",
      title: "Engineering Director",
      company: "Enterprise Corp",
      type: "hiring_manager",
      email: "david.kim@enterprisecorp.com",
      phone: "+1 (555) 321-0987",
      lastContact: "2023-12-20",
      status: "active",
      rating: 5,
      notes: "Former colleague, now in leadership. Great reference for senior roles.",
      connectionDate: "2022-11-05",
      jobsWorkedTogether: 0
    },
    {
      id: 5,
      name: "Lisa Thompson",
      title: "Vendor Relations Manager",
      company: "Cloud Systems Inc",
      type: "vendor",
      email: "lisa.thompson@cloudsystems.com",
      phone: "+1 (555) 654-3210",
      lastContact: "2024-01-12",
      status: "active",
      rating: 4,
      notes: "Works with multiple vendors for DevOps and cloud positions.",
      connectionDate: "2023-08-15",
      jobsWorkedTogether: 4
    }
  ];

  const getTypeConfig = (type: string) => {
    const configs = {
      recruiter: { label: "Recruiter", color: "bg-blue-100 text-blue-800" },
      hiring_manager: { label: "Hiring Manager", color: "bg-green-100 text-green-800" },
      vendor: { label: "Vendor", color: "bg-purple-100 text-purple-800" },
      colleague: { label: "Colleague", color: "bg-orange-100 text-orange-800" }
    };
    return configs[type as keyof typeof configs] || { label: type, color: "bg-gray-100 text-gray-800" };
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  const filteredRelationships = relationships.filter(relationship => {
    const matchesSearch = relationship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relationship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         relationship.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = relationshipType === "all" || relationship.type === relationshipType;
    return matchesSearch && matchesType;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Relationships</h1>
          <p className="text-gray-600">Manage your professional network and connections</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={relationshipType} onValueChange={setRelationshipType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="recruiter">Recruiters</SelectItem>
                <SelectItem value="hiring_manager">Hiring Managers</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="colleague">Colleagues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRelationships.map((relationship) => {
              const typeConfig = getTypeConfig(relationship.type);
              return (
                <Card key={relationship.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`/api/placeholder/48/48`} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {relationship.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{relationship.name}</h3>
                        <p className="text-sm text-gray-600">{relationship.title}</p>
                        <p className="text-sm text-gray-500">{relationship.company}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                        {getStatusBadge(relationship.status)}
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(relationship.rating)}
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p>Connected: {new Date(relationship.connectionDate).toLocaleDateString()}</p>
                      <p>Last contact: {new Date(relationship.lastContact).toLocaleDateString()}</p>
                      <p>Jobs together: {relationship.jobsWorkedTogether}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {filteredRelationships.map((relationship) => {
            const typeConfig = getTypeConfig(relationship.type);
            return (
              <Card key={relationship.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`/api/placeholder/48/48`} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {relationship.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{relationship.name}</h3>
                        <p className="text-sm text-gray-600">{relationship.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{relationship.company}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                        <div className="flex items-center gap-1 mt-1 justify-center">
                          {renderStars(relationship.rating)}
                        </div>
                      </div>

                      <div className="text-center">
                        {getStatusBadge(relationship.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          {relationship.jobsWorkedTogether} jobs
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600">Last Contact</p>
                        <p className="text-xs text-gray-500">
                          {new Date(relationship.lastContact).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {relationship.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{relationship.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {filteredRelationships.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or add new professional contacts.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}