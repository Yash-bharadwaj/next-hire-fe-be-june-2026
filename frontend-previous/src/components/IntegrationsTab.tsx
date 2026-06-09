import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Settings as SettingsIcon, Linkedin, Github, Mail, Calendar, Briefcase, Users, Globe, Database, Phone, MessageSquare, Monitor, Smartphone, Send, Headphones } from "lucide-react";

// Mock integrations data
const integrations = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect with LinkedIn for professional networking and recruitment',
    icon: Linkedin,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    requiresCredentials: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Integrate with GitHub for developer recruitment and portfolio review',
    icon: Github,
    color: 'text-gray-900',
    bgColor: 'bg-gray-100',
    requiresCredentials: true,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and receive emails directly through Gmail integration',
    icon: Mail,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    requiresCredentials: true,
  },
];

// Mock form component
const AddNewIntegrationForm = ({ onSuccess }: { onSuccess: () => void }) => (
  <Button variant="outline" size="sm">
    Add Integration
  </Button>
);

// Mock credentials component
const IntegrationCredentials = ({ integration }: { integration: any }) => null;

interface IntegrationsTabProps {
  integrationStates: Record<string, boolean>;
  toggleIntegration: (id: string) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
}

const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  integrationStates,
  toggleIntegration,
  webhookUrl,
  setWebhookUrl,
}) => {
  return (
    <div className="space-y-8">

      {/* Zapier Webhook Configuration */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Zapier Integration</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Connect your recruitment workflows with 5,000+ apps</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="webhook-url" className="text-sm font-medium text-gray-700">
                Webhook URL
              </Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-500">
                Copy this URL from your Zapier webhook configuration
              </p>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={!webhookUrl}
              >
                Test Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Available Integrations</h2>
            <p className="text-gray-600 text-sm mt-1">Connect your favorite tools and platforms</p>
          </div>
          <AddNewIntegrationForm onSuccess={() => {}} />
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id} className="border border-gray-200 hover:border-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${integration.bgColor}`}>
                      <integration.icon className={`w-5 h-5 ${integration.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={integrationStates[integration.id] || false}
                    onCheckedChange={() => toggleIntegration(integration.id)}
                    className="ml-2"
                  />
                </div>
                
                <IntegrationCredentials integration={integration} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTab;