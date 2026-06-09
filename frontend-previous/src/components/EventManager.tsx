import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Download, Search } from "lucide-react";

const EventManager = () => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Event Manager</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Monitor and manage webhook events in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Module</TableHead>
                  <TableHead className="font-semibold text-gray-900">Key</TableHead>
                  <TableHead className="font-semibold text-gray-900">Change Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Before</TableHead>
                  <TableHead className="font-semibold text-gray-900">After</TableHead>
                  <TableHead className="font-semibold text-gray-900">Event ID</TableHead>
                  <TableHead className="font-semibold text-gray-900">Webhook Binding</TableHead>
                  <TableHead className="font-semibold text-gray-900">Synchronous</TableHead>
                  <TableHead className="font-semibold text-gray-900">Event Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Date/Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Job</TableCell>
                  <TableCell>J124</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Job.Create</TableCell>
                  <TableCell>Job.Create</TableCell>
                  <TableCell>
                    <Select defaultValue="asynchronous" disabled>
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
                    <Select defaultValue="asynchronous" disabled>
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
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Triggered
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">7/11/2025 11:08:34</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Job</TableCell>
                  <TableCell>J124</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Job.Publish</TableCell>
                  <TableCell>Job.Publish</TableCell>
                  <TableCell>
                    <Select defaultValue="asynchronous" disabled>
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
                    <Select defaultValue="asynchronous" disabled>
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
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Triggered
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">7/11/2025 11:18:56</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Job</TableCell>
                  <TableCell>J156</TableCell>
                  <TableCell>Deletion status</TableCell>
                  <TableCell>X</TableCell>
                  <TableCell>Job.Delete</TableCell>
                  <TableCell>Job.Delete</TableCell>
                  <TableCell>
                    <Select defaultValue="asynchronous" disabled>
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
                    <Select defaultValue="asynchronous" disabled>
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
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                      Error
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">7/8/2025 9:07:34</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Job</TableCell>
                  <TableCell>J763</TableCell>
                  <TableCell>Primary Recruiter</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Job.Validate</TableCell>
                  <TableCell>Job.Validate</TableCell>
                  <TableCell>
                    <Select defaultValue="synchronous" disabled>
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
                    <Select defaultValue="synchronous" disabled>
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
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      In-progress
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">7/4/2025 11:08:34</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventManager;