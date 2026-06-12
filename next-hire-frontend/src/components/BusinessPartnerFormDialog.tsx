import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BusinessPartner,
  CreateBusinessPartnerRequest,
  UpdateBusinessPartnerRequest,
  BusinessPartnerSource,
  BusinessPartnerStatus,
  BusinessPartnerPriority,
  CompanySize,
} from "@/services/businessPartnerService";
import { CountrySelect, StateSelect, CitySelect } from "@/components/location-fields";

interface FormState {
  name: string;
  primary_email: string;
  primary_phone: string;
  website: string;
  domain: string;
  is_lead: boolean;
  is_client: boolean;
  is_vendor: boolean;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  industry: string;
  company_size: CompanySize | "";
  annual_revenue: string;
  tax_id: string;
  source: BusinessPartnerSource;
  status: BusinessPartnerStatus;
  priority: BusinessPartnerPriority;
  notes: string;
}

const emptyForm: FormState = {
  name: "",
  primary_email: "",
  primary_phone: "",
  website: "",
  domain: "",
  is_lead: false,
  is_client: false,
  is_vendor: false,
  address1: "",
  address2: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  industry: "",
  company_size: "",
  annual_revenue: "",
  tax_id: "",
  source: "other",
  status: "prospect",
  priority: "medium",
  notes: "",
};

interface BusinessPartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: BusinessPartner | null;
  onSubmit: (
    data: CreateBusinessPartnerRequest | UpdateBusinessPartnerRequest
  ) => Promise<boolean>;
}

const BusinessPartnerFormDialog: React.FC<BusinessPartnerFormDialogProps> = ({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        primary_email: initialData.primary_email || "",
        primary_phone: initialData.primary_phone || "",
        website: initialData.website || "",
        domain: initialData.domain || "",
        is_lead: !!initialData.is_lead,
        is_client: !!initialData.is_client,
        is_vendor: !!initialData.is_vendor,
        address1: initialData.address1 || "",
        address2: initialData.address2 || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "",
        postal_code: initialData.postal_code || "",
        industry: initialData.industry || "",
        company_size: initialData.company_size || "",
        annual_revenue:
          initialData.annual_revenue !== undefined && initialData.annual_revenue !== null
            ? initialData.annual_revenue.toString()
            : "",
        tax_id: initialData.tax_id || "",
        source: initialData.source || "other",
        status: initialData.status || "prospect",
        priority: initialData.priority || "medium",
        notes: initialData.notes || "",
      });
    } else {
      setFormData(emptyForm);
    }
  }, [open, mode, initialData]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    const payload: CreateBusinessPartnerRequest | UpdateBusinessPartnerRequest = {
      name: formData.name.trim(),
      is_lead: formData.is_lead,
      is_client: formData.is_client,
      is_vendor: formData.is_vendor,
      source: formData.source,
      status: formData.status,
      priority: formData.priority,
    };

    if (formData.primary_email.trim()) payload.primary_email = formData.primary_email.trim();
    if (formData.primary_phone.trim()) payload.primary_phone = formData.primary_phone.trim();
    if (formData.website.trim()) payload.website = formData.website.trim();
    if (formData.domain.trim()) payload.domain = formData.domain.trim();
    if (formData.address1.trim()) payload.address1 = formData.address1.trim();
    if (formData.address2.trim()) payload.address2 = formData.address2.trim();
    if (formData.city.trim()) payload.city = formData.city.trim();
    if (formData.state.trim()) payload.state = formData.state.trim();
    if (formData.country.trim()) payload.country = formData.country.trim();
    if (formData.postal_code.trim()) payload.postal_code = formData.postal_code.trim();
    if (formData.industry.trim()) payload.industry = formData.industry.trim();
    if (formData.company_size) payload.company_size = formData.company_size as CompanySize;
    if (formData.annual_revenue.trim()) payload.annual_revenue = parseFloat(formData.annual_revenue);
    if (formData.tax_id.trim()) payload.tax_id = formData.tax_id.trim();
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    setSaving(true);
    const success = await onSubmit(payload);
    setSaving(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New Business Partner" : "Edit Business Partner"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new lead, client, or vendor to your business partners."
              : "Update this business partner's information."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="mb-1 block">Company Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Acme Corporation"
              />
            </div>
            <div>
              <Label className="mb-1 block">Primary Email</Label>
              <Input
                type="email"
                value={formData.primary_email}
                onChange={(e) => update("primary_email", e.target.value)}
                placeholder="contact@acme.com"
              />
            </div>
            <div>
              <Label className="mb-1 block">Primary Phone</Label>
              <Input
                value={formData.primary_phone}
                onChange={(e) => update("primary_phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label className="mb-1 block">Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://acme.com"
              />
            </div>
            <div>
              <Label className="mb-1 block">Domain</Label>
              <Input
                value={formData.domain}
                onChange={(e) => update("domain", e.target.value)}
                placeholder="acme.com"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Partner Type</Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="bp-is-lead"
                  checked={formData.is_lead}
                  onCheckedChange={(checked) => update("is_lead", checked === true)}
                />
                <Label htmlFor="bp-is-lead" className="font-normal cursor-pointer">
                  Lead
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="bp-is-client"
                  checked={formData.is_client}
                  onCheckedChange={(checked) => update("is_client", checked === true)}
                />
                <Label htmlFor="bp-is-client" className="font-normal cursor-pointer">
                  Client
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="bp-is-vendor"
                  checked={formData.is_vendor}
                  onCheckedChange={(checked) => update("is_vendor", checked === true)}
                />
                <Label htmlFor="bp-is-vendor" className="font-normal cursor-pointer">
                  Vendor
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="mb-1 block">Address Line 1</Label>
              <Input
                value={formData.address1}
                onChange={(e) => update("address1", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 block">Address Line 2</Label>
              <Input
                value={formData.address2}
                onChange={(e) => update("address2", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Country</Label>
              <CountrySelect
                value={formData.country}
                onChange={(value) => {
                  update("country", value);
                  update("state", "");
                  update("city", "");
                }}
              />
            </div>
            <div>
              <Label className="mb-1 block">State</Label>
              <StateSelect
                country={formData.country}
                value={formData.state}
                onChange={(value) => {
                  update("state", value);
                  update("city", "");
                }}
              />
            </div>
            <div>
              <Label className="mb-1 block">City</Label>
              <CitySelect
                country={formData.country}
                state={formData.state}
                value={formData.city}
                onChange={(value) => update("city", value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Postal Code</Label>
              <Input
                value={formData.postal_code}
                onChange={(e) => update("postal_code", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block">Industry</Label>
              <Input
                value={formData.industry}
                onChange={(e) => update("industry", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Company Size</Label>
              <Select
                value={formData.company_size || undefined}
                onValueChange={(value) => update("company_size", value as CompanySize)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Annual Revenue ($)</Label>
              <Input
                type="number"
                min="0"
                value={formData.annual_revenue}
                onChange={(e) => update("annual_revenue", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Tax ID</Label>
              <Input value={formData.tax_id} onChange={(e) => update("tax_id", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="mb-1 block">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => update("source", value as BusinessPartnerSource)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="trade_show">Trade Show</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="email_campaign">Email Campaign</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => update("status", value as BusinessPartnerStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => update("priority", value as BusinessPartnerPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !formData.name.trim()}>
            {saving
              ? "Saving..."
              : mode === "create"
              ? "Create Partner"
              : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessPartnerFormDialog;
