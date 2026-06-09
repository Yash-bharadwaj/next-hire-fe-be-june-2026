import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RotateCcw, Settings, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PersonalizationItem {
  id: string;
  name: string;
  category: "header" | "tabs" | "overview" | "statistics";
  enabled: boolean;
  description: string;
  mandatory?: boolean;
  masked?: boolean;
  isCustom?: boolean;
  fieldType?: "text" | "email" | "telephone" | "number" | "date";
  defaultFromProfile?: boolean;
  properties?: "none" | "masked" | "email" | "telephone" | "lov-multiselect" | "lov-single";
  listOfValues?: string[];
}

interface CandidateDetailPersonalizationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: PersonalizationItem[]) => void;
  currentSettings?: PersonalizationItem[];
}

const defaultSettings: PersonalizationItem[] = [
  // Header Fields
  { id: "candidateName", name: "Candidate Name", category: "header", enabled: true, description: "Full candidate name" },
  { id: "email", name: "Email Address", category: "header", enabled: true, description: "Primary email contact", fieldType: "email" },
  { id: "phone", name: "Phone Number", category: "header", enabled: true, description: "Primary phone contact", fieldType: "telephone" },
  { id: "currentRole", name: "Current Role", category: "header", enabled: true, description: "Current job title" },
  { id: "location", name: "Location", category: "header", enabled: true, description: "Candidate location" },
  { id: "experience", name: "Experience", category: "header", enabled: true, description: "Years of experience" },
  { id: "skills", name: "Skills", category: "header", enabled: true, description: "Key skills and technologies" },
  { id: "status", name: "Candidate Status", category: "header", enabled: true, description: "Current candidate status" },
  { id: "availability", name: "Availability", category: "header", enabled: true, description: "Availability status" },
  { id: "salaryExpectation", name: "Salary Expectation", category: "header", enabled: true, description: "Expected salary range", fieldType: "number" },
  
  // Statistics
  { id: "totalApplications", name: "Total Applications", category: "statistics", enabled: true, description: "Number of job applications" },
  { id: "interviewsScheduled", name: "Interviews Scheduled", category: "statistics", enabled: true, description: "Number of scheduled interviews" },
  { id: "offersReceived", name: "Offers Received", category: "statistics", enabled: true, description: "Number of job offers" },
  { id: "responseRate", name: "Response Rate", category: "statistics", enabled: true, description: "Application response rate" },
  { id: "profileViews", name: "Profile Views", category: "statistics", enabled: true, description: "Number of profile views" },
  { id: "matchScore", name: "Match Score", category: "statistics", enabled: true, description: "Job matching score" },
  
  // Tabs
  { id: "overviewTab", name: "Overview Tab", category: "tabs", enabled: true, description: "Candidate overview and basic information" },
  { id: "experienceTab", name: "Experience Tab", category: "tabs", enabled: true, description: "Work experience and history" },
  { id: "skillsTab", name: "Skills Tab", category: "tabs", enabled: true, description: "Technical and soft skills" },
  { id: "educationTab", name: "Education Tab", category: "tabs", enabled: true, description: "Educational background" },
  { id: "documentsTab", name: "Documents Tab", category: "tabs", enabled: true, description: "Resume and portfolio files" },
  { id: "notesTab", name: "Notes Tab", category: "tabs", enabled: true, description: "Candidate notes and comments" },
  { id: "interviewsTab", name: "Interviews Tab", category: "tabs", enabled: true, description: "Interview history and feedback" },
  { id: "timelineTab", name: "Timeline Tab", category: "tabs", enabled: true, description: "Candidate activity timeline" },
  
  // Overview Section Fields
  { id: "summary", name: "Summary", category: "overview", enabled: true, description: "Candidate summary" },
  { id: "contactInfo", name: "Contact Information", category: "overview", enabled: true, description: "Phone, email, and contact details" },
  { id: "preferences", name: "Job Preferences", category: "overview", enabled: true, description: "Job type and location preferences" },
  { id: "certifications", name: "Certifications", category: "overview", enabled: true, description: "Professional certifications" },
  { id: "languageSkills", name: "Language Skills", category: "overview", enabled: true, description: "Language proficiency" },
  { id: "socialProfiles", name: "Social Profiles", category: "overview", enabled: true, description: "LinkedIn and other profiles" },
];

const CandidateDetailPersonalizationSettings = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentSettings 
}: CandidateDetailPersonalizationSettingsProps) => {
  const [settings, setSettings] = useState<PersonalizationItem[]>(currentSettings || defaultSettings);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "email" | "telephone" | "number" | "date">("text");
  const [newFieldCategory, setNewFieldCategory] = useState<"header" | "tabs" | "overview" | "statistics">("overview");
  const { toast } = useToast();

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    
    const newField: PersonalizationItem = {
      id: `custom_${Date.now()}`,
      name: newFieldName,
      category: newFieldCategory,
      enabled: true,
      description: `Custom ${newFieldType} field`,
      isCustom: true,
      fieldType: newFieldType,
      mandatory: false,
      masked: false
    };
    
    setSettings(prev => [...prev, newField]);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldCategory("overview");
    
    toast({
      title: "Custom Field Added",
      description: `${newFieldName} has been added as a custom field.`,
    });
  };

  const handleRemoveCustomField = (id: string) => {
    setSettings(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Custom Field Removed",
      description: "Custom field has been removed.",
    });
  };

  const handleSave = () => {
    onSave(settings);
    toast({
      title: "Settings Saved",
      description: "Your candidate personalization settings have been updated successfully.",
    });
    onClose();
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "header": return "👤";
      case "tabs": return "📑";
      case "overview": return "👁️";
      case "statistics": return "📊";
      default: return "⚙️";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "header": return "bg-blue-50 text-blue-700 border-blue-200";
      case "tabs": return "bg-green-50 text-green-700 border-green-200";
      case "overview": return "bg-purple-50 text-purple-700 border-purple-200";
      case "statistics": return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const groupedSettings = (settings || []).reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PersonalizationItem[]>);

  const enabledCount = (settings || []).filter(item => item.enabled).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Candidate Detail Personalization Settings
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Customize which fields and sections are visible in the candidate detail view
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="border-green-200 text-green-700">
              {enabledCount} of {settings.length} items enabled
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
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
                {settings.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">Candidates</TableCell>
                    <TableCell>Detail</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(item.category)} variant="outline">
                        {getCategoryIcon(item.category)} {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {item.fieldType && item.fieldType !== "text" && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.fieldType}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.enabled ? "yes" : "no"} 
                        onValueChange={(value) => {
                          setSettings(prev => prev.map(setting => 
                            setting.id === item.id ? { ...setting, enabled: value === "yes" } : setting
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
                        value={item.mandatory ? "yes" : "no"} 
                        onValueChange={(value) => {
                          setSettings(prev => prev.map(setting => 
                            setting.id === item.id ? { ...setting, mandatory: value === "yes" } : setting
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
                        value={item.isCustom ? "yes" : "no"} 
                        onValueChange={(value) => {
                          setSettings(prev => prev.map(setting => 
                            setting.id === item.id ? { ...setting, isCustom: value === "yes" } : setting
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
                        checked={item.defaultFromProfile || false}
                        onChange={(e) => {
                          setSettings(prev => prev.map(setting => 
                            setting.id === item.id ? { ...setting, defaultFromProfile: e.target.checked } : setting
                          ));
                        }}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.properties || "none"} 
                        onValueChange={(value) => {
                          setSettings(prev => prev.map(setting => 
                            setting.id === item.id ? { ...setting, properties: value === "none" ? undefined : value as PersonalizationItem["properties"] } : setting
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
                        disabled={!(item.properties === "lov-single" || item.properties === "lov-multiselect")}
                        onClick={() => {
                          console.log("Manage LOV for", item.name);
                        }}
                        className="text-xs"
                      >
                        {(item.properties === "lov-single" || item.properties === "lov-multiselect") ? "Link" : "Manage"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add Custom Field Section */}
        <div className="border-t pt-4">
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Custom Field
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="flex-1"
                />
                <Select value={newFieldType} onValueChange={(value: any) => setNewFieldType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Field Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="telephone">Phone</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Select 
                    value={newFieldCategory} 
                    onValueChange={(value: any) => setNewFieldCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="tabs">Tabs</SelectItem>
                      <SelectItem value="overview">Overview</SelectItem>
                      <SelectItem value="statistics">Statistics</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddCustomField} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailPersonalizationSettings;