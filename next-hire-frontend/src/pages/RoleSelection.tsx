import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Users, UserCheck, ChevronRight, Sparkles, Monitor, Package, Search, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, UserRole } from "@/contexts/AuthContext";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { user, updateUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleRoleSelection = (role: UserRole, client?: string) => {
    if (role === 'company' || role === 'client') {
      updateUserRole(role);
      navigate("/dashboard");
    } else {
      setSelectedRole(role);
      if (client) {
        setSelectedClient(client);
        updateUserRole(role);
        navigate("/dashboard");
      }
    }
  };

  const clients = [
    { id: 'client1', name: 'Randstad', icon: Building2 },
    { id: 'client2', name: 'TASC', icon: Users },
    { id: 'client3', name: 'Infosys', icon: Monitor },
    { id: 'client4', name: 'ABC Staffing', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-green-100/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(34 197 94 / 0.03)%27%3e%3cpath d=%27m0 .5 32 32M32 .5 0 32%27/%3e%3c/svg%3e')] bg-top"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-200/15 to-green-300/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      
      <div className="w-full max-w-2xl space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-green-500/25 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <Sparkles className="text-white w-8 h-8 relative z-10" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Welcome {user?.name}
          </h2>
          <p className="text-green-600/70 font-medium">Choose your access level</p>
        </div>

        {/* Role Selection */}
        <Card className="border-0 shadow-2xl shadow-green-500/10 bg-white/95 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white/80 to-emerald-50/30"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"></div>
          
          <CardHeader className="space-y-1 pb-6 relative z-10">
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Select Your Role
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-4">
            {!selectedRole ? (
              // Main role selection
              <div className="space-y-4">
                {/* Recruiter */}
                <Button
                  onClick={() => handleRoleSelection('company')}
                  className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">Recruiter</div>
                      <div className="text-green-100 text-sm">Access company dashboard</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6" />
                </Button>

                {/* Candidate */}
                <Button
                  onClick={() => setSelectedRole('candidate')}
                  variant="outline"
                  className="w-full h-16 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg text-green-700">Candidate</div>
                      <div className="text-green-600 text-sm">Choose your client</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-green-600" />
                </Button>

                {/* Vendor */}
                <Button
                  onClick={() => setSelectedRole('vendor')}
                  variant="outline"
                  className="w-full h-16 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg text-green-700">Vendor</div>
                      <div className="text-green-600 text-sm">Choose your client</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-green-600" />
                </Button>

                {/* Client */}
                <Button
                  onClick={() => setSelectedRole('client')}
                  variant="outline"
                  className="w-full h-16 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-between px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg text-green-700">Client</div>
                      <div className="text-green-600 text-sm">Client portal access</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-green-600" />
                </Button>
              </div>
            ) : (
              // Client selection
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    onClick={() => setSelectedRole(null)}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    ← Back
                  </Button>
                  <h3 className="text-lg font-semibold text-green-700 capitalize">
                    {selectedRole === 'client' ? 'select your client patner' : `Select ${selectedRole} Client`}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clients.map((client) => (
                    <Button
                      key={client.id}
                      onClick={() => handleRoleSelection(selectedRole, client.id)}
                      variant="outline"
                      className="h-20 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-2"
                    >
                      <client.icon className="w-6 h-6 text-green-600" />
                      <div className="font-semibold text-green-700">{client.name}</div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}