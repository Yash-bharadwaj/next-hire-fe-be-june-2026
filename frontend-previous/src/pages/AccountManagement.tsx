import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Network, 
  Users, 
  Key, 
  Palette, 
  Smartphone, 
  Building, 
  Activity,
  MoreHorizontal 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountManagement = () => {
  const navigate = useNavigate();

  const accountSections = [
    {
      icon: User,
      title: "Personal Info",
      description: "Manage your basic information, contact details, and profile settings.",
      action: () => navigate("/dashboard/account/personal-info")
    },
    {
      icon: Shield,
      title: "Login & Security",
      description: "Safeguarding your information with strong authentication measures.",
      action: () => navigate("/dashboard/account/security")
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description: "Simplify payments today, with secure, user-friendly transaction processes.",
      action: () => navigate("/dashboard/account/billing")
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Keep updated with important notices and event reminders.",
      action: () => navigate("/dashboard/account/notifications")
    },
    {
      icon: Network,
      title: "Integrations",
      description: "Enhance workflows with Advanced Integrations.",
      action: () => navigate("/dashboard/account/integrations")
    },
    {
      icon: Users,
      title: "Members, Teams & Roles",
      description: "Efficient management of members, teams, and roles.",
      action: () => navigate("/dashboard/settings")
    },
    {
      icon: Key,
      title: "API Keys",
      description: "Secure and manage Your API Keys effectively and efficiently.",
      action: () => navigate("/dashboard/account/api-keys")
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Transforming your online presence with flawless appearance.",
      action: () => navigate("/dashboard/account/appearance")
    },
    {
      icon: Smartphone,
      title: "Devices",
      description: "Stay ahead with the latest devices and innovations news.",
      action: () => navigate("/dashboard/account/devices")
    },
    {
      icon: Building,
      title: "Brand",
      description: "Trending brand designs, identities, and logos.",
      action: () => navigate("/dashboard/account/brand")
    },
    {
      icon: Activity,
      title: "Activity",
      description: "Central Hub for Personal Customization.",
      action: () => navigate("/dashboard/account/activity")
    }
  ];

  const currentUser = {
    name: "John Doe",
    email: "john.doe@thenexthire.com"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                Account
              </Button>
              <span className="text-gray-400">•</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 font-roboto-slab">Get Started</h1>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-700 font-medium">{currentUser.name}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{currentUser.email}</span>
            <span className="text-gray-400">•</span>
            <Button variant="link" className="p-0 h-auto text-green-600 hover:text-green-700">
              Personal Info
            </Button>
          </div>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {accountSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card 
                key={index}
                className="bg-white border-green-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={section.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-colors">
                      <IconComponent className="w-6 h-6 text-green-600" />
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                    {section.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* More Account Options */}
        <div className="text-center">
          <Button variant="link" className="text-green-600 hover:text-green-700">
            More Account Options
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>2025 © thenexthire Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;