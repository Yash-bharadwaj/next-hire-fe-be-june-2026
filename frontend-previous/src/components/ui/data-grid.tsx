import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, ChevronUp, ChevronDown, ArrowUpDown, Filter, Check, MoreVertical, Eye, EyeOff, Settings, X, Save, Bookmark, Trash2 } from "lucide-react";

interface Column {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (value: any, row: any) => React.ReactNode;
}

interface SavedLayout {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  searchTerm: string;
  hiddenColumns: string[];
  sortConfig: { field: string; direction: 'asc' | 'desc' | null };
  createdAt: Date;
}

interface DataGridProps {
  rows: any[];
  columns: Column[];
  pageSizeOptions?: number[];
  checkboxSelection?: boolean;
  onRowClick?: (row: any) => void;
  initialFilters?: Record<string, string[]>;
}

export const DataGrid = ({ 
  rows, 
  columns, 
  pageSizeOptions = [5, 10, 25, 50], 
  checkboxSelection = false,
  onRowClick,
  initialFilters = {}
}: DataGridProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' | null }>({ field: '', direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(initialFilters);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [layoutName, setLayoutName] = useState("");

  // Update filters when initialFilters change
  useEffect(() => {
    setColumnFilters(initialFilters);
    setCurrentPage(1);
  }, [initialFilters]);

  // Get visible columns
  const visibleColumns = useMemo(() => 
    columns.filter(col => !hiddenColumns.has(col.field)), 
    [columns, hiddenColumns]
  );

  // Get unique values for each column for filtering
  const getUniqueColumnValues = (field: string) => {
    const values = rows
      .map(row => row[field])
      .filter(value => value !== null && value !== undefined && value !== "")
      .map(value => String(value));
    return [...new Set(values)].sort();
  };

  // Filter rows based on search term and column filters
  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        columns.some(column => 
          String(row[column.field]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([field, selectedValues]) => {
      if (selectedValues.length > 0) {
        filtered = filtered.filter(row => 
          selectedValues.includes(String(row[field]))
        );
      }
    });

    return filtered;
  }, [rows, searchTerm, columns, columnFilters]);

  // Sort filtered rows
  const sortedRows = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) return filteredRows;
    
    return [...filteredRows].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortConfig]);

  // Paginate sorted rows
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);

  const handleSort = (field: string) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const handleColumnFilter = (field: string, values: string[]) => {
    setColumnFilters(prev => ({
      ...prev,
      [field]: values
    }));
    setCurrentPage(1);
  };

  const getActiveFiltersCount = (field: string) => {
    return columnFilters[field]?.length || 0;
  };

  const toggleColumnVisibility = (field: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

  const saveLayout = () => {
    if (!layoutName.trim()) {
      toast({
        title: "Layout name required",
        description: "Please enter a name for this layout",
        variant: "destructive"
      });
      return;
    }

    const newLayout: SavedLayout = {
      id: Date.now().toString(),
      name: layoutName.trim(),
      filters: columnFilters,
      searchTerm,
      hiddenColumns: Array.from(hiddenColumns),
      sortConfig,
      createdAt: new Date()
    };

    setSavedLayouts(prev => [...prev, newLayout]);
    setLayoutName("");
    setShowSaveDialog(false);
    
    toast({
      title: "Layout saved",
      description: `"${newLayout.name}" has been saved successfully`,
    });
  };

  const applyLayout = (layout: SavedLayout) => {
    setColumnFilters(layout.filters);
    setSearchTerm(layout.searchTerm);
    setHiddenColumns(new Set(layout.hiddenColumns));
    setSortConfig(layout.sortConfig);
    setCurrentPage(1);
    
    toast({
      title: "Layout applied",
      description: `"${layout.name}" layout has been applied`,
    });
  };

  const deleteLayout = (layoutId: string) => {
    setSavedLayouts(prev => prev.filter(layout => layout.id !== layoutId));
    toast({
      title: "Layout deleted",
      description: "Layout has been removed",
    });
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setSearchTerm("");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedRows);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (row: any, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, row]);
    } else {
      setSelectedRows(prev => prev.filter(r => r.id !== row.id));
    }
  };

  const isAllSelected = paginatedRows.length > 0 && selectedRows.length === paginatedRows.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < paginatedRows.length;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="w-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGlobalFilter(!showGlobalFilter)}
            className="h-8 border-gray-300 hover:bg-gray-100 text-xs"
          >
            <Filter className="w-4 h-4" />
            {Object.keys(columnFilters).some(key => columnFilters[key].length > 0) && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {Object.values(columnFilters).flat().length}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-gray-300 hover:bg-gray-100 text-xs">
                <Settings className="w-4 h-4 mr-1" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white border-gray-200">
              {columns.map((column) => (
                <DropdownMenuItem
                  key={column.field}
                  className="flex items-center space-x-2 p-2 text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleColumnVisibility(column.field);
                  }}
                  onSelect={(e) => e.preventDefault()}
                >
                  <input
                    type="checkbox"
                    checked={!hiddenColumns.has(column.field)}
                    onChange={() => toggleColumnVisibility(column.field)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{column.headerName}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-gray-300 hover:bg-gray-100 text-xs">
                <Save className="w-4 h-4 mr-1" />
                Save Layout
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-white border-gray-200 shadow-lg" align="start">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Save Current Layout</h4>
                <Input
                  placeholder="Enter layout name..."
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveLayout}
                    className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {(Object.keys(columnFilters).some(key => columnFilters[key].length > 0) || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-gray-600 hover:bg-gray-100 text-xs"
            >
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-600 font-medium">
          {sortedRows.length} row{sortedRows.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Global Search */}
      {showGlobalFilter && (
        <div className="p-4 border-b border-gray-200 bg-gray-50/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-xs"
            />
          </div>
        </div>
      )}

      {/* Saved Layouts */}
      {savedLayouts.length > 0 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50/30">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Saved Layouts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedLayouts.map((layout) => (
              <div
                key={layout.id}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all group"
              >
                <button
                  onClick={() => applyLayout(layout)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Bookmark className="w-3 h-3" />
                  {layout.name}
                </button>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {Object.values(layout.filters).flat().length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-xs">
                      {Object.values(layout.filters).flat().length} filters
                    </Badge>
                  )}
                  {layout.hiddenColumns.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-xs">
                      {layout.hiddenColumns.length} hidden
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayout(layout.id);
                  }}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-gray-200 hover:bg-gray-50">
              {checkboxSelection && (
                <TableHead className="w-12 h-8">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.field}
                  className="relative h-8 font-medium text-xs text-gray-600 border-gray-200 whitespace-nowrap"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center justify-between group">
                    <div 
                      className={`flex items-center gap-2 ${column.sortable !== false ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`}
                      onClick={() => column.sortable !== false && handleSort(column.field)}
                    >
                      <span className="select-none text-xs">{column.headerName}</span>
                      {column.sortable !== false && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {getSortIcon(column.field)}
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200">
                        {column.sortable !== false && (
                          <>
                            <DropdownMenuItem onClick={() => handleSort(column.field)} className="text-xs">
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Sort Ascending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSort(column.field)} className="text-xs">
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Sort Descending
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {column.filterable !== false && (
                          <DropdownMenuItem asChild>
                            <div className="w-full">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center w-full cursor-pointer text-xs">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                    {getActiveFiltersCount(column.field) > 0 && (
                                      <Badge variant="secondary" className="ml-auto h-4 px-1 text-xs">
                                        {getActiveFiltersCount(column.field)}
                                      </Badge>
                                    )}
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 bg-white border-gray-200 shadow-lg" align="start">
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-xs">Filter {column.headerName}</h4>
                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                      {getUniqueColumnValues(column.field).map((value) => {
                                        const isSelected = columnFilters[column.field]?.includes(value) || false;
                                        return (
                                          <div
                                            key={value}
                                            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                            onClick={() => {
                                              const currentFilters = columnFilters[column.field] || [];
                                              const newFilters = isSelected
                                                ? currentFilters.filter(f => f !== value)
                                                : [...currentFilters, value];
                                              handleColumnFilter(column.field, newFilters);
                                            }}
                                          >
                                            <div className="w-4 h-4 border rounded flex items-center justify-center border-gray-300">
                                              {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                                            </div>
                                            <span className="text-xs">{value}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {getActiveFiltersCount(column.field) > 0 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs"
                                        onClick={() => handleColumnFilter(column.field, [])}
                                      >
                                        Clear Filter
                                      </Button>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleColumnVisibility(column.field)} className="text-xs">
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide Column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow 
                key={row.id || index} 
                className="hover:bg-gray-50 cursor-pointer transition-colors border-gray-200"
                onClick={() => onRowClick?.(row)}
              >
                {checkboxSelection && (
                  <TableCell className="h-8">
                    <input
                      type="checkbox"
                      checked={selectedRows.some(r => r.id === row.id)}
                      onChange={(e) => handleSelectRow(row, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                )}
                {visibleColumns.map((column) => (
                  <TableCell key={column.field} className="h-8 text-gray-700 font-poppins text-xs">
                    <div className="font-poppins text-xs">
                      {column.renderCell 
                        ? column.renderCell(row[column.field], row) 
                        : row[column.field]
                      }
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer with Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-700">Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-16 h-8 border-gray-300 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()} className="text-xs">{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-xs text-gray-700">
            {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length}
          </p>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 px-2 border-gray-300 hover:bg-gray-100 text-xs"
            >
              First
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2 border-gray-300 hover:bg-gray-100 text-xs"
            >
              Previous
            </Button>
            
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 text-gray-500 text-xs">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(Number(page))}
                    className={`h-8 px-3 text-xs ${
                      currentPage === page 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2 border-gray-300 hover:bg-gray-100 text-xs"
            >
              Next
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 px-2 border-gray-300 hover:bg-gray-100 text-xs"
            >
              Last
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
