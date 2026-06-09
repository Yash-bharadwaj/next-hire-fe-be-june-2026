import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Filter, Search, Activity, Zap, Settings as SettingsIcon, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EventManager = () => {
  const [customIntegrationsEnabled, setCustomIntegrationsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock event data
  const events = [
    {
      id: 1,
      module: 'Job',
      field: '-',
      changeType: 'Created',
      before: '-',
      after: 'Job.Create',
      eventId: 'Job.Create',
      webhookBinding: 'asynchronous',
      synchronous: 'asynchronous',
      status: 'Active',
      remarks: 'Trigger webhook to enrich data and update Vector database'
    },
    {
      id: 2,
      module: 'Candidate',
      field: 'status',
      changeType: 'Updated',
      before: 'Applied',
      after: 'Interviewed',
      eventId: 'Candidate.StatusChange',
      webhookBinding: 'synchronous',
      synchronous: 'synchronous',
      status: 'Active',
      remarks: 'Real-time status update notification'
    },
    {
      id: 3,
      module: 'Submission',
      field: '-',
      changeType: 'Created',
      before: '-',
      after: 'Submission.Create',
      eventId: 'Submission.Create',
      webhookBinding: 'asynchronous',
      synchronous: 'asynchronous',
      status: 'Inactive',
      remarks: 'Temporarily disabled for maintenance'
    },
    {
      id: 4,
      module: 'Interview',
      field: 'scheduled_date',
      changeType: 'Updated',
      before: 'null',
      after: 'DateTime',
      eventId: 'Interview.Schedule',
      webhookBinding: 'synchronous',
      synchronous: 'synchronous',
      status: 'Active',
      remarks: 'Send calendar invites immediately'
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.remarks.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">Inactive</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor system events and workflows
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Event Management Toggle */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Event Management</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Manage custom event bindings and webhook triggers</p>
              </div>
            </div>
            <Switch
              checked={customIntegrationsEnabled}
              onCheckedChange={setCustomIntegrationsEnabled}
            />
          </div>
        </CardHeader>
      </Card>

      {customIntegrationsEnabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Event Bindings
              </CardTitle>
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                {/* Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Module</TableHead>
                    <TableHead className="font-semibold text-gray-900">Field</TableHead>
                    <TableHead className="font-semibold text-gray-900">Change Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">Before</TableHead>
                    <TableHead className="font-semibold text-gray-900">After</TableHead>
                    <TableHead className="font-semibold text-gray-900">Event ID</TableHead>
                    <TableHead className="font-semibold text-gray-900">Webhook Binding</TableHead>
                    <TableHead className="font-semibold text-gray-900">Synchronous</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{event.module}</TableCell>
                      <TableCell>{event.field}</TableCell>
                      <TableCell>{event.changeType}</TableCell>
                      <TableCell>{event.before}</TableCell>
                      <TableCell>{event.after}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{event.eventId}</code>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={event.webhookBinding}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asynchronous">Asynchronous</SelectItem>
                            <SelectItem value="synchronous">Synchronous</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={event.synchronous}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asynchronous">Asynchronous</SelectItem>
                            <SelectItem value="synchronous">Synchronous</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(event.status)}
                          {getStatusBadge(event.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs">
                        {event.remarks}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by creating your first event binding.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'Active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive Events</p>
                <p className="text-2xl font-bold">{events.filter(e => e.status === 'Inactive').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sync Events</p>
                <p className="text-2xl font-bold">{events.filter(e => e.synchronous === 'synchronous').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventManager;