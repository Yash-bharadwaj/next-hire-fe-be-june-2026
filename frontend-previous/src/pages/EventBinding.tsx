import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings as SettingsIcon, Play, Pause, Trash2, Edit, Activity, CheckCircle, XCircle, Clock } from "lucide-react";

// Mock data for event bindings
const mockEventBindings = [
  {
    id: 1,
    name: "New Job Posted",
    triggerUrl: "https://hooks.zapier.com/hooks/catch/123456/job-posted",
    status: "active",
    lastTriggered: "2024-01-15 10:30:00",
    createdAt: "2024-01-10 09:15:00",
    successCount: 45,
    failureCount: 2
  },
  {
    id: 2,
    name: "Candidate Applied",
    triggerUrl: "https://example.com/webhook/candidate-applied",
    status: "paused",
    lastTriggered: "2024-01-14 16:45:00",
    createdAt: "2024-01-08 14:20:00",
    successCount: 78,
    failureCount: 0
  },
  {
    id: 3,
    name: "Interview Scheduled",
    triggerUrl: "https://api.company.com/events/interview",
    status: "active",
    lastTriggered: "2024-01-15 11:22:00",
    createdAt: "2024-01-05 11:10:00",
    successCount: 23,
    failureCount: 1
  },
  {
    id: 4,
    name: "Placement Confirmed",
    triggerUrl: "https://webhook.site/placement-confirmed",
    status: "failed",
    lastTriggered: "2024-01-12 09:15:00",
    createdAt: "2024-01-01 08:00:00",
    successCount: 12,
    failureCount: 5
  }
];

const EventBinding = () => {
  const [eventBindingEnabled, setEventBindingEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBindings = mockEventBindings.filter(binding =>
    binding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    binding.triggerUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Pause className="w-3 h-3 mr-1" />Paused</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Event Binding</h1>
        <p className="text-muted-foreground mt-2">
          Configure custom event bindings and webhook triggers for your application
        </p>
      </div>
      
      {/* Event Binding Configuration */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Event Binding</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Manage custom event bindings and webhook triggers</p>
              </div>
            </div>
            <Switch
              checked={eventBindingEnabled}
              onCheckedChange={setEventBindingEnabled}
            />
          </div>
        </CardHeader>
        {eventBindingEnabled && (
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure your custom event bindings here. You can set up triggers for various application events.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="event-name" className="text-sm font-medium text-gray-700">
                    Event Name
                  </Label>
                  <Input
                    id="event-name"
                    type="text"
                    placeholder="Enter event name..."
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="trigger-url" className="text-sm font-medium text-gray-700">
                    Trigger URL
                  </Label>
                  <Input
                    id="trigger-url"
                    type="url"
                    placeholder="https://example.com/webhook"
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Event Binding
                </Button>
                <Button variant="outline">
                  Test Trigger
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Event Bindings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Event Bindings</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Manage and monitor your active event bindings</p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Search bindings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Activity className="w-4 h-4 mr-2" />
                Add Binding
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Trigger URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Success/Failure</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBindings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No event bindings match your search." : "No event bindings configured yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBindings.map((binding) => (
                    <TableRow key={binding.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          {binding.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-600" title={binding.triggerUrl}>
                          {binding.triggerUrl}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(binding.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-600 font-medium">{binding.successCount}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-600 font-medium">{binding.failureCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(binding.lastTriggered).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(binding.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-green-50"
                          >
                            {binding.status === 'active' ? (
                              <Pause className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <Play className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockEventBindings.length}</div>
              <div className="text-sm text-gray-600">Total Bindings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockEventBindings.filter(b => b.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {mockEventBindings.reduce((sum, b) => sum + b.successCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockEventBindings.reduce((sum, b) => sum + b.failureCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Failures</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventBinding;