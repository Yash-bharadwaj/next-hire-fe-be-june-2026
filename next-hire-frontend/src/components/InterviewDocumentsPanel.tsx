import { useState } from "react";
import { format, parseISO, differenceInDays, isBefore } from "date-fns";
import { FileText, Upload, Download, AlertTriangle, CheckCircle, XCircle, Filter, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { interviewService, InterviewDocument, DocumentType } from "@/services/interviewService";
import { cn } from "@/lib/utils";

type DocStatus = "active" | "expiring" | "expired";

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(bytes < 1024 * 100 ? 1 : 0)} KB`;
};
type FilterStatus = "all" | DocStatus;

const getDocumentStatus = (validTo?: string): DocStatus => {
  if (!validTo) return "active";
  const expiryDate = parseISO(validTo);
  if (isBefore(expiryDate, new Date())) return "expired";
  if (differenceInDays(expiryDate, new Date()) <= 30) return "expiring";
  return "active";
};

const StatusBadge = ({ status, validTo }: { status: DocStatus; validTo?: string }) => {
  if (status === "active") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    );
  }
  if (status === "expiring") {
    const days = validTo ? differenceInDays(parseISO(validTo), new Date()) : 0;
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Expires in {days} days
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200">
      <XCircle className="w-3 h-3 mr-1" />
      Expired
    </Badge>
  );
};

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: { file?: File; name: string; document_type: DocumentType; valid_from: string; valid_to?: string }) => Promise<void>;
}

const UploadDocumentDialog = ({ open, onOpenChange, onUpload }: UploadDocumentDialogProps) => {
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("PDF");
  const [file, setFile] = useState<File | null>(null);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setDocumentType("PDF");
    setFile(null);
    setValidFrom("");
    setValidTo("");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !validFrom) return;
    setSaving(true);
    try {
      await onUpload({
        file: file || undefined,
        name: name.trim(),
        document_type: documentType,
        valid_from: new Date(validFrom).toISOString(),
        valid_to: validTo ? new Date(validTo).toISOString() : undefined,
      });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) reset(); }}>
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="doc-name">Document Name</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter document name" />
          </div>

          <div>
            <Label htmlFor="doc-type">Document Type</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger id="doc-type">
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

          <div>
            <Label htmlFor="doc-file">File (optional)</Label>
            <Input id="doc-file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid-from">Valid From</Label>
              <Input id="valid-from" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="valid-to">Valid To</Label>
              <Input id="valid-to" type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !validFrom || saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface InterviewDocumentsPanelProps {
  interviewId: string;
  documents: InterviewDocument[];
  onChanged: () => void;
}

export const InterviewDocumentsPanel = ({ interviewId, documents, onChanged }: InterviewDocumentsPanelProps) => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();

  const filteredDocuments = documents.filter((doc) => filter === "all" || getDocumentStatus(doc.valid_to) === filter);

  const statusCounts = {
    active: documents.filter((d) => getDocumentStatus(d.valid_to) === "active").length,
    expiring: documents.filter((d) => getDocumentStatus(d.valid_to) === "expiring").length,
    expired: documents.filter((d) => getDocumentStatus(d.valid_to) === "expired").length,
  };

  const handleUpload = async (data: { file?: File; name: string; document_type: DocumentType; valid_from: string; valid_to?: string }) => {
    try {
      await interviewService.addInterviewAttachment(interviewId, data);
      toast({ title: "Document uploaded" });
      onChanged();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Interview Documents</CardTitle>
          <UploadDocumentDialog open={showUpload} onOpenChange={setShowUpload} onUpload={handleUpload} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">Active: {statusCounts.active}</span>
            <span className="text-yellow-600">Expiring: {statusCounts.expiring}</span>
            <span className="text-red-600">Expired: {statusCounts.expired}</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
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
              const status = getDocumentStatus(doc.valid_to);
              return (
                <div
                  key={doc.id}
                  className={cn(
                    "border rounded-lg p-4 hover:shadow-md transition-shadow",
                    status === "expired" && "border-red-200 bg-red-50/30",
                    status === "expiring" && "border-yellow-200 bg-yellow-50/30",
                    status === "active" && "border-green-200 bg-green-50/30"
                  )}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <FileText
                        className={cn(
                          "w-8 h-8",
                          status === "expired" && "text-red-600",
                          status === "expiring" && "text-yellow-600",
                          status === "active" && "text-green-600"
                        )}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">{doc.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {doc.document_type}
                          </Badge>
                          <StatusBadge status={status} validTo={doc.valid_to} />
                        </div>
                        <p className="text-xs text-gray-500">
                          Uploaded {format(parseISO(doc.at), "MMM d, yyyy")}
                          {doc.size ? ` • ${formatFileSize(doc.size)}` : ""}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Valid: {format(parseISO(doc.valid_from), "MMM d, yyyy")}
                          {doc.valid_to ? ` - ${format(parseISO(doc.valid_to), "MMM d, yyyy")}` : " - No expiry"}
                        </p>
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
