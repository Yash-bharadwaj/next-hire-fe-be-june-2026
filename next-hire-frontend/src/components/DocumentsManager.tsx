import React, { useState } from "react";
import { format, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";
import {
  FileText,
  Upload,
  Eye,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Plus,
  ExternalLink,
  FileQuestion
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Document {
  id: number | string;
  name: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  size?: string;
  validFrom?: string;
  validTo?: string;
  description?: string;
  /** Direct URL to view/download the file. Omit if the file isn't accessible (e.g. a locally-added placeholder). */
  url?: string;
}

interface DocumentsManagerProps {
  documents: Document[];
  onUpload?: (document: Omit<Document, 'id'>) => void;
  title?: string;
}

type DocumentStatus = 'active' | 'expiring' | 'expired';
type FilterStatus = 'all' | DocumentStatus;

const getDocumentStatus = (validTo?: string): DocumentStatus => {
  // No expiry date (e.g. a résumé) - treat as currently valid.
  if (!validTo) return 'active';

  const today = new Date();
  const expiryDate = parseISO(validTo);
  const daysUntilExpiry = differenceInDays(expiryDate, today);

  if (isBefore(expiryDate, today)) {
    return 'expired';
  } else if (daysUntilExpiry <= 30) {
    return 'expiring';
  } else {
    return 'active';
  }
};

const getStatusBadge = (status: DocumentStatus, validTo?: string) => {
  const daysUntilExpiry = validTo ? differenceInDays(parseISO(validTo), new Date()) : null;

  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case 'expiring':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Expires in {daysUntilExpiry ?? 0} days
        </Badge>
      );
    case 'expired':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
  }
};

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"]);
const TEXT_EXTENSIONS = new Set(["txt", "csv", "log", "md", "json"]);

/** Inline document preview - PDFs, images, and text files render directly;
 * everything else (DOC/DOCX, etc.) falls back to an "open file" prompt
 * since browsers can't render those formats in an iframe. */
const DocumentPreviewDialog = ({
  doc,
  onClose,
}: {
  doc: Document | null;
  onClose: () => void;
}) => {
  const ext = (doc?.type || "").toLowerCase();
  const isPdf = ext === "pdf";
  const isImage = IMAGE_EXTENSIONS.has(ext);
  const isText = TEXT_EXTENSIONS.has(ext);

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[90vw] h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
        {doc && (
          <>
            <DialogHeader className="px-6 py-4 border-b shrink-0 pr-14">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="flex items-center gap-2 text-base font-medium">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </DialogTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded {format(parseISO(doc.uploadDate), "MMM d, yyyy")}
                    {doc.size ? ` • ${doc.size}` : ""}
                    {doc.description ? ` • ${doc.description}` : ""}
                  </p>
                </div>
                {doc.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => window.open(doc.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open in new tab
                  </Button>
                )}
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-auto bg-gray-100">
              {!doc.url ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
                  <FileQuestion className="w-14 h-14 mb-3 text-gray-300" />
                  <p>This document doesn&apos;t have a file attached.</p>
                </div>
              ) : isPdf ? (
                <iframe
                  src={doc.url}
                  title={doc.name}
                  className="w-full h-full border-0"
                />
              ) : isImage ? (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={doc.url}
                    alt={doc.name}
                    className="max-w-full max-h-full object-contain rounded shadow-sm"
                  />
                </div>
              ) : isText ? (
                <iframe
                  src={doc.url}
                  title={doc.name}
                  className="w-full h-full border-0 bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
                  <FileQuestion className="w-14 h-14 mb-3 text-gray-300" />
                  <p className="mb-4">
                    Preview isn&apos;t available for {ext ? `.${ext.toUpperCase()}` : "this"} files.
                  </p>
                  <Button onClick={() => window.open(doc.url, "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open file
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const UploadDocumentDialog = ({ onUpload }: { onUpload?: (document: Omit<Document, 'id'>) => void }) => {
  const [open, setOpen] = useState(false);
  const [validFromDate, setValidFromDate] = useState<Date>();
  const [validToDate, setValidToDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: '',
    type: 'PDF',
    uploadedBy: 'Current User',
    size: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validFromDate || !validToDate) return;

    const newDocument: Omit<Document, 'id'> = {
      ...formData,
      uploadDate: new Date().toISOString(),
      validFrom: validFromDate.toISOString(),
      validTo: validToDate.toISOString(),
    };

    onUpload?.(newDocument);
    setOpen(false);
    setFormData({ name: '', type: 'PDF', uploadedBy: 'Current User', size: '', description: '' });
    setValidFromDate(undefined);
    setValidToDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
          <Plus className="w-4 h-4 mr-1" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter document name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="type">Document Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="DOC">DOC</SelectItem>
                <SelectItem value="DOCX">DOCX</SelectItem>
                <SelectItem value="IMG">Image</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validFromDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {validFromDate ? format(validFromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={validFromDate}
                    onSelect={setValidFromDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Valid To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validToDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {validToDate ? format(validToDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={validToDate}
                    onSelect={setValidToDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Upload</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const DocumentsManager: React.FC<DocumentsManagerProps> = ({ 
  documents, 
  onUpload, 
  title = "Documents & Files" 
}) => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return getDocumentStatus(doc.validTo) === filter;
  });

  const statusCounts = {
    active: documents.filter(doc => getDocumentStatus(doc.validTo) === 'active').length,
    expiring: documents.filter(doc => getDocumentStatus(doc.validTo) === 'expiring').length,
    expired: documents.filter(doc => getDocumentStatus(doc.validTo) === 'expired').length,
  };

  return (
    <>
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <UploadDocumentDialog onUpload={onUpload} />
        </div>
        
        {/* Status Summary & Filter */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">Active: {statusCounts.active}</span>
            <span className="text-yellow-600">Expiring: {statusCounts.expiring}</span>
            <span className="text-red-600">Expired: {statusCounts.expired}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter} onValueChange={(value: FilterStatus) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No documents found for the selected filter.</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const status = getDocumentStatus(doc.validTo);
              return (
                <div 
                  key={doc.id} 
                  className={cn(
                    "border rounded-lg p-4 hover:shadow-md transition-shadow",
                    status === 'expired' && "border-red-200 bg-red-50/30",
                    status === 'expiring' && "border-yellow-200 bg-yellow-50/30",
                    status === 'active' && "border-green-200 bg-green-50/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className={cn(
                        "w-8 h-8",
                        status === 'expired' && "text-red-600",
                        status === 'expiring' && "text-yellow-600",
                        status === 'active' && "text-green-600"
                      )} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">{doc.name}</p>
                          {getStatusBadge(status, doc.validTo)}
                        </div>
                        <p className="text-xs text-gray-500">
                          Uploaded {format(parseISO(doc.uploadDate), "MMM d, yyyy")}
                          {doc.size && ` • ${doc.size}`}
                        </p>
                        {doc.validFrom && doc.validTo && (
                          <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                            <span>Valid: {format(parseISO(doc.validFrom), "MMM d, yyyy")} - {format(parseISO(doc.validTo), "MMM d, yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        disabled={!doc.url}
                        onClick={() => doc.url && setPreviewDoc(doc)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={!doc.url}
                        onClick={() => doc.url && window.open(doc.url, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
    <DocumentPreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </>
  );
};