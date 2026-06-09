import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Check, Package, Monitor, Search, Apple, Facebook, Film, Zap, Cloud, Car, Home } from "lucide-react";

const companies = [
  { id: "all", name: "All Companies", icon: null },
  { id: "amazon", name: "Amazon", icon: Package },
  { id: "microsoft", name: "Microsoft", icon: Monitor },
  { id: "google", name: "Google", icon: Search },
  { id: "apple", name: "Apple", icon: Apple },
  { id: "meta", name: "Meta", icon: Facebook },
  { id: "netflix", name: "Netflix", icon: Film },
  { id: "tesla", name: "Tesla", icon: Zap },
  { id: "salesforce", name: "Salesforce", icon: Cloud },
  { id: "uber", name: "Uber", icon: Car },
  { id: "airbnb", name: "Airbnb", icon: Home },
];

interface CompanyFilterProps {
  selectedCompany?: string;
  onCompanyChange?: (companyId: string) => void;
}

export function CompanyFilter({ selectedCompany = "all", onCompanyChange }: CompanyFilterProps) {
  const [selected, setSelected] = useState(selectedCompany);

  const handleCompanySelect = (companyId: string) => {
    setSelected(companyId);
    onCompanyChange?.(companyId);
  };

  const selectedCompanyData = companies.find(c => c.id === selected);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs gap-2 min-w-[140px] justify-between bg-white/90 backdrop-blur-sm shadow-sm"
        >
          <div className="flex items-center gap-2">
            {selectedCompanyData?.icon ? (
              <selectedCompanyData.icon className="w-3 h-3" />
            ) : (
              <Building2 className="w-3 h-3" />
            )}
            <span className="font-medium truncate max-w-[80px]">
              {selectedCompanyData?.name || "All Companies"}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white border-gray-200 z-50 min-w-[160px] shadow-lg"
      >
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => handleCompanySelect(company.id)}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
          >
            <div className="flex items-center gap-2 flex-1">
              {company.icon ? (
                <company.icon className="w-4 h-4 text-gray-500" />
              ) : (
                <Building2 className="w-4 h-4 text-gray-500" />
              )}
              <span className="font-medium text-sm">{company.name}</span>
            </div>
            {selected === company.id && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleCompanySelect("all")}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-600"
        >
          <Building2 className="w-4 h-4" />
          <span className="font-medium text-sm">Clear Filter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}