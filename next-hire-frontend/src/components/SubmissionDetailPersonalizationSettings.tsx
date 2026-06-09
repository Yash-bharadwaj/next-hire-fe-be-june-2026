import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface PersonalizationItem {
  id: string;
  name: string;
  category: "header" | "tabs" | "overview" | "statistics";
  enabled: boolean;
  description: string;
  mandatory?: boolean;
  masked?: boolean;
  fieldType?: "text" | "email" | "telephone" | "date" | "number";
  isCustom?: boolean;
  defaultFromProfile?: boolean;
  properties?: "none" | "masked" | "email" | "telephone" | "lov-multiselect" | "lov-single";
  listOfValues?: string[];
}

interface SubmissionDetailPersonalizationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: PersonalizationItem[]) => void;
  currentSettings?: PersonalizationItem[];
}

const defaultSettings: PersonalizationItem[] = [
  // Header Fields
  { id: "candidateName", name: "Candidate Name", category: "header", enabled: true, description: "Submitted candidate name" },
  { id: "jobTitle", name: "Job Title", category: "header", enabled: true, description: "Position applied for" },
  { id: "submissionDate", name: "Submission Date", category: "header", enabled: true, description: "Date of submission" },
  { id: "submissionStatus", name: "Status", category: "header", enabled: true, description: "Current submission status" },
  { id: "clientCompany", name: "Client Company", category: "header", enabled: true, description: "Target company" },
  { id: "recruiterName", name: "Recruiter", category: "header", enabled: true, description: "Assigned recruiter" },
  
  // Statistics
  { id: "daysActive", name: "Days Active", category: "statistics", enabled: true, description: "Days since submission" },
  { id: "interviewStages", name: "Interview Stages", category: "statistics", enabled: true, description: "Number of interview rounds" },
  { id: "feedbackScore", name: "Feedback Score", category: "statistics", enabled: true, description: "Client feedback rating" },
  
  // Tabs
  { id: "overviewTab", name: "Overview Tab", category: "tabs", enabled: true, description: "Submission overview and details" },
  { id: "candidateTab", name: "Candidate Tab", category: "tabs", enabled: true, description: "Candidate profile and information" },
  { id: "documentsTab", name: "Documents Tab", category: "tabs", enabled: true, description: "Resume and supporting documents" },
  
  // Overview Section Fields
  { id: "submissionSummary", name: "Submission Summary", category: "overview", enabled: true, description: "Brief submission overview" },
  { id: "matchingCriteria", name: "Matching Criteria", category: "overview", enabled: true, description: "How candidate matches job requirements" },
];

const SubmissionDetailPersonalizationSettings = ({ isOpen, onClose, onSave, currentSettings }: SubmissionDetailPersonalizationSettingsProps) => {
  const [settings, setSettings] = useState<PersonalizationItem[]>(currentSettings || defaultSettings);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "email" | "telephone" | "date" | "number">("text");
  const [newFieldCategory, setNewFieldCategory] = useState<"header" | "tabs" | "overview" | "statistics">("overview");

  const handleAddCustomField = () => {
    if (newFieldName.trim()) {
      const newField: PersonalizationItem = {
        id: `custom_${Date.now()}`,
        name: newFieldName,
        category: newFieldCategory,
        enabled: true,
        description: `Custom ${newFieldType} field`,
        fieldType: newFieldType,
        isCustom: true,
        mandatory: false,
        masked: newFieldType === "email" || newFieldType === "telephone"
      };
      setSettings([...settings, newField]);
      setNewFieldName("");
      setNewFieldType("text");
      setShowAddField(false);
    }
  };

  const handleDeleteCustomField = (id: string) => {
    setSettings(settings.filter(setting => setting.id !== id));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "header": return "📝";
      case "tabs": return "📑";
      case "overview": return "👁️";
      case "statistics": return "📊";
      default: return "⚙️";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "header": return "text-blue-600";
      case "tabs": return "text-green-600";
      case "overview": return "text-purple-600";
      case "statistics": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Submission Detail Personalization Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="max-h-[60vh] overflow-y-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Screen</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Display</TableHead>
                <TableHead>Mandatory</TableHead>
                <TableHead>Custom field</TableHead>
                <TableHead>Default from User profile?</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Manage LOV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">Submissions</TableCell>
                  <TableCell>Detail</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(setting.category)}>
                      {getCategoryIcon(setting.category)} {setting.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {setting.name}
                      {setting.fieldType && setting.fieldType !== "text" && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {setting.fieldType}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={setting.enabled ? "yes" : "no"} 
                      onValueChange={(value) => {
                        setSettings(settings.map(s => 
                          s.id === setting.id ? { ...s, enabled: value === "yes" } : s
                        ));
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={setting.mandatory ? "yes" : "no"} 
                      onValueChange={(value) => {
                        setSettings(settings.map(s => 
                          s.id === setting.id ? { ...s, mandatory: value === "yes" } : s
                        ));
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={setting.isCustom ? "yes" : "no"} 
                      onValueChange={(value) => {
                        setSettings(settings.map(s => 
                          s.id === setting.id ? { ...s, isCustom: value === "yes" } : s
                        ));
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <input 
                      type="checkbox"
                      checked={setting.defaultFromProfile || false}
                      onChange={(e) => {
                        setSettings(settings.map(s => 
                          s.id === setting.id ? { ...s, defaultFromProfile: e.target.checked } : s
                        ));
                      }}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={setting.properties || "none"} 
                      onValueChange={(value) => {
                        setSettings(settings.map(s => 
                          s.id === setting.id ? { ...s, properties: value === "none" ? undefined : value as PersonalizationItem["properties"] } : s
                        ));
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="masked">Masked</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="telephone">Telephone</SelectItem>
                        <SelectItem value="lov-multiselect">LOV Multiselect</SelectItem>
                        <SelectItem value="lov-single">LOV Single Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!(setting.properties === "lov-single" || setting.properties === "lov-multiselect")}
                      onClick={() => {
                        console.log("Manage LOV for", setting.name);
                      }}
                      className="text-xs"
                    >
                      {(setting.properties === "lov-single" || setting.properties === "lov-multiselect") ? "Link" : "Manage"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {/* Add Custom Field Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Custom Fields</h3>
            <Button onClick={() => setShowAddField(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>

          {showAddField && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="field-name">Field Name</Label>
                  <Input
                    id="field-name"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Enter field name"
                  />
                </div>
                <div>
                  <Label htmlFor="field-type">Field Type</Label>
                  <Select value={newFieldType} onValueChange={(value: any) => setNewFieldType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="telephone">Telephone</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="field-category">Section</Label>
                  <Select value={newFieldCategory} onValueChange={(value: any) => setNewFieldCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="tabs">Tabs</SelectItem>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="statistics">Statistics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCustomField} size="sm">
                  Add Field
                </Button>
                <Button onClick={() => setShowAddField(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setSettings(defaultSettings)}>
            Reset to Default
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailPersonalizationSettings;