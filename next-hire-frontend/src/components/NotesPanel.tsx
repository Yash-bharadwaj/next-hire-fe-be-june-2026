import { useState } from "react";
import { format } from "date-fns";
import { BookOpen, Search, PenTool, History, Tags, Edit, Share2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type NoteCategory = "technical" | "behavioral" | "feedback" | "general";

export interface NoteRecord {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  isPrivate: boolean;
  tags: string[];
  author: string;
  at: string;
}

export interface NoteFormData {
  title?: string;
  content: string;
  category?: NoteCategory;
  isPrivate?: boolean;
  tags?: string[];
}

const categoryColor: Record<NoteCategory, string> = {
  technical: "bg-blue-100 text-blue-800 border-blue-200",
  behavioral: "bg-purple-100 text-purple-800 border-purple-200",
  feedback: "bg-yellow-100 text-yellow-800 border-yellow-200",
  general: "bg-gray-100 text-gray-800 border-gray-200",
};

interface NoteFormState {
  title: string;
  content: string;
  category: NoteCategory;
  isPrivate: boolean;
  tags: string;
}

const emptyForm: NoteFormState = { title: "", content: "", category: "general", isPrivate: false, tags: "" };

const parseTags = (raw: string) =>
  raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

interface NotesPanelProps {
  title?: string;
  description?: string;
  notes: NoteRecord[];
  onAdd: (data: NoteFormData) => Promise<void>;
  onUpdate: (noteId: string, data: NoteFormData) => Promise<void>;
}

export const NotesPanel = ({
  title = "Notes",
  description = "Comprehensive notes and feedback in one place",
  notes,
  onAdd,
  onUpdate,
}: NotesPanelProps) => {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<"all" | NoteCategory>("all");
  const [search, setSearch] = useState("");

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<NoteFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null);
  const [editForm, setEditForm] = useState<NoteFormState>(emptyForm);
  const [editSaving, setEditSaving] = useState(false);

  const filteredNotes = notes.filter((note) => {
    const matchesFilter = categoryFilter === "all" || note.category === categoryFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.tags.some((t) => t.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const handleAddNote = async () => {
    if (!addForm.content.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        title: addForm.title.trim() || undefined,
        content: addForm.content.trim(),
        category: addForm.category,
        isPrivate: addForm.isPrivate,
        tags: parseTags(addForm.tags),
      });
      toast({ title: "Note added" });
      setAddForm(emptyForm);
      setShowAddDialog(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (note: NoteRecord) => {
    setEditingNote(note);
    setEditForm({
      title: note.title,
      content: note.content,
      category: note.category,
      isPrivate: note.isPrivate,
      tags: note.tags.join(", "),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editForm.content.trim()) return;
    setEditSaving(true);
    try {
      await onUpdate(editingNote.id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        category: editForm.category,
        isPrivate: editForm.isPrivate,
        tags: parseTags(editForm.tags),
      });
      toast({ title: "Note updated" });
      setEditingNote(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update note",
        variant: "destructive",
      });
    } finally {
      setEditSaving(false);
    }
  };

  const handleShare = async (note: NoteRecord) => {
    const text = `${note.title || "Note"}\n\n${note.content}\n\n— ${note.author}, ${format(new Date(note.at), "PPP")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: note.title || "Note", text });
        return;
      } catch {
        // user cancelled the share sheet or it failed - fall back to clipboard
      }
    }
    await navigator.clipboard.writeText(text);
    toast({ title: "Note copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as "all" | NoteCategory)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notes</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t flex-wrap gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">Total: {notes.length}</span>
              <span className="text-blue-600">Public: {notes.filter((n) => !n.isPrivate).length}</span>
              <span className="text-orange-600">Private: {notes.filter((n) => n.isPrivate).length}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notes found</h3>
              <p className="text-gray-500">
                {notes.length === 0 ? "Start taking notes." : "Try a different filter or search."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{note.title || "Untitled note"}</h3>
                      {note.isPrivate && <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Private</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <PenTool className="w-3 h-3" />
                        {note.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <History className="w-3 h-3" />
                        {format(new Date(note.at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>
                  <Badge className={cn("text-xs", categoryColor[note.category])}>{note.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{note.content}</p>

                {note.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Tags className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openEditDialog(note)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50" onClick={() => handleShare(note)}>
                    <Share2 className="w-3 h-3 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Note Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} placeholder="Note title..." />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={addForm.content}
                onChange={(e) => setAddForm({ ...addForm, content: e.target.value })}
                placeholder="Write your note..."
                className="min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={addForm.category} onValueChange={(v) => setAddForm({ ...addForm, category: v as NoteCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="add-private"
                    checked={addForm.isPrivate}
                    onCheckedChange={(checked) => setAddForm({ ...addForm, isPrivate: !!checked })}
                  />
                  <Label htmlFor="add-private">Private note</Label>
                </div>
              </div>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={addForm.tags} onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })} placeholder="react, positive, technical" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!addForm.content.trim() || saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v as NoteCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-private"
                    checked={editForm.isPrivate}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, isPrivate: !!checked })}
                  />
                  <Label htmlFor="edit-private">Private note</Label>
                </div>
              </div>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editForm.content.trim() || editSaving}>
              {editSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
