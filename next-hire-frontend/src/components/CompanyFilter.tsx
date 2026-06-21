import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Check } from "lucide-react";

interface CompanyFilterProps {
  companies: string[];
  selectedCompany?: string;
  onCompanyChange: (company: string) => void;
}

// Filters by the real client/company names present in the current data set
// (passed in via `companies`), rather than a fixed list.
export function CompanyFilter({ companies, selectedCompany = "all", onCompanyChange }: CompanyFilterProps) {
  const label = selectedCompany === "all" ? "All Companies" : selectedCompany;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-xs gap-2 min-w-[140px] justify-between bg-white/90 backdrop-blur-sm shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-3 h-3" />
            <span className="font-medium truncate max-w-[100px]">{label}</span>
          </div>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border-gray-200 z-50 min-w-[180px] shadow-lg">
        <DropdownMenuItem
          onClick={() => onCompanyChange("all")}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
        >
          <div className="flex items-center gap-2 flex-1">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-sm">All Companies</span>
          </div>
          {selectedCompany === "all" && <Check className="w-4 h-4 text-blue-600" />}
        </DropdownMenuItem>
        {companies.length > 0 && <DropdownMenuSeparator />}
        {companies.map((company) => (
          <DropdownMenuItem
            key={company}
            onClick={() => onCompanyChange(company)}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium text-sm truncate">{company}</span>
            </div>
            {selectedCompany === company && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
