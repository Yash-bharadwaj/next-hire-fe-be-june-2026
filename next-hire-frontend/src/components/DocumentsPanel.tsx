import { useState } from "react";
import { format, parseISO, differenceInDays, isBefore } from "date-fns";
import { FileText, Upload, Download, Eye, AlertTriangle, CheckCircle, XCircle, Search, Plus, Loader2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { resolveDocumentUrl, fetchDocumentPreviewText } from "@/lib/api";

export type DocumentType = "PDF" | "DOC" | "DOCX" | "IMG" | "OTHER";

// document_type is a manually-picked dropdown value at upload time (and has
// no "TXT" option at all), so it's an unreliable signal for how to render a
// preview - the file extension on the name is the real source of truth.
// Anything that isn't a directly-embeddable PDF/image is sent to the backend
// for text extraction; the backend's real support list (PDF/DOCX/TXT) is
// the single source of truth for what succeeds vs. reports "unsupported".
type PreviewKind = "pdf" | "image" | "text";

const getPreviewKind = (doc: DocumentRecord): PreviewKind => {
  const name = doc.name.toLowerCase();
  // The extension is checked first and wins outright - a .txt file tagged
  // "PDF" in the dropdown (the field defaults to PDF and is easy to leave
  // unchanged) must still preview as text, not be forced into a PDF viewer.
  if (name.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp|svg|bmp)$/.test(name)) return "image";
  if (/\.[a-z0-9]+$/.test(name)) return "text";
  // No recognizable extension at all - fall back to the manually-picked type.
  if (doc.document_type === "PDF") return "pdf";
  if (doc.document_type === "IMG") return "image";
  return "text";
};

export interface DocumentRecord {
  id: string;
  url: string;
  name: string;
  document_type: DocumentType;
  size?: number;
  valid_from: string;
  valid_to?: string;
  at: string;
}

export interface DocumentUploadData {
  file?: File;
  name: string;
  document_type: DocumentType;
  valid_from: string;
  valid_to?: string;
}

type DocStatus = "active" | "expiring" | "expired";

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(bytes < 1024 * 100 ? 1 : 0)} KB`;
};

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
  onUpload: (data: DocumentUploadData) => Promise<void>;
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

interface DocumentsPanelProps {
  title?: string;
  documents: DocumentRecord[];
  onUpload: (data: DocumentUploadData) => Promise<void>;
  // Optional - most entities' generic "attachments" have no delete endpoint
  // at all on the backend. Only provide this where one genuinely exists.
  onDelete?: (documentId: string) => Promise<void>;
}

export const DocumentsPanel = ({ title = "Documents", documents, onUpload, onDelete }: DocumentsPanelProps) => {
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<
    | { doc: DocumentRecord; kind: "pdf" | "image"; url: string }
    | { doc: DocumentRecord; kind: "text"; text: string; truncated: boolean }
    | { doc: DocumentRecord; kind: "error"; message: string }
    | null
  >(null);
  const { toast } = useToast();

  const handleOpen = async (doc: DocumentRecord) => {
    setOpeningId(doc.id);
    try {
      const url = await resolveDocumentUrl(doc.url);
      if (!url) throw new Error("No URL returned");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to open document",
        variant: "destructive",
      });
    } finally {
      setOpeningId(null);
    }
  };

  const handlePreview = async (doc: DocumentRecord) => {
    setPreviewingId(doc.id);
    const kind = getPreviewKind(doc);
    try {
      if (kind === "text") {
        const { text, truncated } = await fetchDocumentPreviewText(doc.url);
        setPreview({ doc, kind: "text", text, truncated });
      } else {
        const url = await resolveDocumentUrl(doc.url);
        if (!url) throw new Error("No URL returned");
        setPreview({ doc, kind, url });
      }
    } catch (err: any) {
      setPreview({
        doc,
        kind: "error",
        message: err?.response?.data?.message || "Preview isn't available for this file.",
      });
    } finally {
      setPreviewingId(null);
    }
  };

  const filteredDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(search.trim().toLowerCase()));

  const statusCounts = {
    active: documents.filter((d) => getDocumentStatus(d.valid_to) === "active").length,
    expiring: documents.filter((d) => getDocumentStatus(d.valid_to) === "expiring").length,
    expired: documents.filter((d) => getDocumentStatus(d.valid_to) === "expired").length,
  };

  const handleUpload = async (data: DocumentUploadData) => {
    try {
      await onUpload(data);
      toast({ title: "Document uploaded" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (doc: DocumentRecord) => {
    if (!onDelete) return;
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    setDeletingId(doc.id);
    try {
      await onDelete(doc.id);
      toast({ title: "Document deleted" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <UploadDocumentDialog open={showUpload} onOpenChange={setShowUpload} onUpload={handleUpload} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">Active: {statusCounts.active}</span>
            <span className="text-yellow-600">Expiring: {statusCounts.expiring}</span>
            <span className="text-red-600">Expired: {statusCounts.expired}</span>
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{search ? "No documents match your search." : "No documents uploaded yet."}</p>
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
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                            onClick={() => handlePreview(doc)}
                            disabled={previewingId === doc.id}
                          >
                            {previewingId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                            onClick={() => handleOpen(doc)}
                            disabled={openingId === doc.id}
                          >
                            {openingId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                      {onDelete && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(doc)}
                              disabled={deletingId === doc.id}
                            >
                              {deletingId === doc.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate">{preview?.doc.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="flex flex-col gap-3">
              {preview.kind === "image" ? (
                <img
                  src={preview.url}
                  alt={preview.doc.name}
                  className="max-w-full max-h-[70vh] mx-auto object-contain rounded-md"
                />
              ) : preview.kind === "pdf" ? (
                <iframe title={preview.doc.name} src={preview.url} className="w-full h-[70vh] rounded-md border" />
              ) : preview.kind === "text" ? (
                <>
                  <pre className="w-full h-[70vh] overflow-auto rounded-md border bg-gray-50 p-4 text-sm whitespace-pre-wrap font-mono">
                    {preview.text}
                  </pre>
                  {preview.truncated && (
                    <p className="text-xs text-gray-500">
                      This preview is truncated - download the file to see the rest.
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{preview.message}</p>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => handleOpen(preview.doc)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
