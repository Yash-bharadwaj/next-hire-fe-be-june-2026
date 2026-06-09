import React, { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Upload, Users, Building2, Save, RefreshCw, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Organization Member Interface
interface OrgMember {
  id: string;
  name: string;
  position: string;
  department: string;
  parentId: string | null;
  level: number;
  type: 'role' | 'department';
  email?: string;
  logo?: string;
}

// Custom Organization Node Component
const OrganizationNode = ({ data }: { data: any }) => {
  return (
    <div className={`relative px-4 py-3 shadow-lg rounded-lg border-2 min-w-[180px] bg-background transition-all duration-200 hover:shadow-xl ${
      data.type === 'department' 
        ? 'border-primary/30 bg-primary/5' 
        : 'border-border hover:border-primary/50'
    } ${data.level === 0 ? 'border-primary bg-primary/10' : ''}`}>
      
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary/80"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-background !bg-primary hover:!bg-primary/80"
        style={{ bottom: -6 }}
      />

      <div className="flex flex-col items-center">
        <Avatar className="w-12 h-12 mb-2">
          <AvatarImage src={data.logo} alt={data.name} />
          <AvatarFallback className={data.type === 'department' ? 'bg-primary/20' : 'bg-secondary'}>
            {data.type === 'department' ? (
              <Building2 className="w-6 h-6" />
            ) : (
              <Users className="w-6 h-6" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-sm font-semibold text-foreground text-center mb-1">
          {data.name}
        </div>
        <div className="text-xs text-muted-foreground text-center mb-2">
          {data.position}
        </div>
        
        {data.department && data.department !== data.name && (
          <Badge variant="secondary" className="text-xs">
            {data.department}
          </Badge>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  organization: OrganizationNode,
};

// Initial organization data
const initialOrgData: OrgMember[] = [
  {
    id: 'ceo',
    name: 'John Smith',
    position: 'Chief Executive Officer',
    department: 'Executive',
    parentId: null,
    level: 0,
    type: 'role',
    email: 'john.smith@company.com'
  },
  {
    id: 'hr-dept',
    name: 'Human Resources',
    position: 'Department',
    department: 'HR',
    parentId: 'ceo',
    level: 1,
    type: 'department'
  },
  {
    id: 'sales-dept',
    name: 'Sales',
    position: 'Department',
    department: 'Sales',
    parentId: 'ceo',
    level: 1,
    type: 'department'
  },
  {
    id: 'tech-dept',
    name: 'Technology',
    position: 'Department',
    department: 'Technology',
    parentId: 'ceo',
    level: 1,
    type: 'department'
  },
  {
    id: 'hr-manager',
    name: 'Sarah Johnson',
    position: 'HR Manager',
    department: 'HR',
    parentId: 'hr-dept',
    level: 2,
    type: 'role',
    email: 'sarah.johnson@company.com'
  },
  {
    id: 'sales-manager',
    name: 'Mike Davis',
    position: 'Sales Manager',
    department: 'Sales',
    parentId: 'sales-dept',
    level: 2,
    type: 'role',
    email: 'mike.davis@company.com'
  },
  {
    id: 'tech-lead',
    name: 'Alex Chen',
    position: 'Tech Lead',
    department: 'Technology',
    parentId: 'tech-dept',
    level: 2,
    type: 'role',
    email: 'alex.chen@company.com'
  }
];

export function OrganizationalChart() {
  const [orgData, setOrgData] = useState<OrgMember[]>(initialOrgData);
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [draggedItem, setDraggedItem] = useState<OrgMember | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  
  // Generate nodes and edges from org data
  const { nodes: generatedNodes, edges: generatedEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Calculate positions based on hierarchy
    const levelCounts: { [key: number]: number } = {};
    const levelPositions: { [key: number]: number } = {};
    
    // Count members per level
    orgData.forEach(member => {
      levelCounts[member.level] = (levelCounts[member.level] || 0) + 1;
    });
    
    // Generate nodes with calculated positions
    orgData.forEach((member, index) => {
      const levelPos = levelPositions[member.level] || 0;
      const levelCount = levelCounts[member.level] || 1;
      const spacing = 250;
      const offsetX = (levelPos - (levelCount - 1) / 2) * spacing;
      
      nodes.push({
        id: member.id,
        type: 'organization',
        position: { 
          x: 600 + offsetX, 
          y: member.level * 200 + 50 
        },
        data: {
          ...member,
          name: member.name,
          position: member.position,
          department: member.department,
          type: member.type,
          level: member.level,
          logo: member.logo
        },
      });
      
      levelPositions[member.level] = levelPos + 1;
      
      // Generate edges
      if (member.parentId) {
        edges.push({
          id: `edge-${member.parentId}-${member.id}`,
          source: member.parentId,
          target: member.id,
          type: 'straight',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { 
            stroke: 'hsl(var(--primary))', 
            strokeWidth: member.level === 1 ? 2 : 1.5 
          },
        });
      }
    });
    
    return { nodes, edges };
  }, [orgData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(generatedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(generatedEdges);

  // Update nodes when orgData changes
  React.useEffect(() => {
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [generatedNodes, generatedEdges, setNodes, setEdges]);

  const handleAddMember = () => {
    const newMember: OrgMember = {
      id: `member-${Date.now()}`,
      name: '',
      position: '',
      department: '',
      parentId: null,
      level: 0,
      type: 'role'
    };
    setEditingMember(newMember);
    setIsAddDialogOpen(true);
  };

  const handleEditMember = (member: OrgMember) => {
    setEditingMember({ ...member });
    setLogoPreview(member.logo || '');
    setIsAddDialogOpen(true);
  };

  const handleSaveMember = () => {
    if (!editingMember) return;
    
    if (!editingMember.name || !editingMember.position) {
      toast({
        title: "Error",
        description: "Name and position are required",
        variant: "destructive"
      });
      return;
    }

    // Calculate level based on parent
    let level = 0;
    if (editingMember.parentId) {
      const parent = orgData.find(m => m.id === editingMember.parentId);
      level = parent ? parent.level + 1 : 0;
    }

    const memberToSave = { ...editingMember, level, logo: logoPreview };
    
    if (orgData.find(m => m.id === editingMember.id)) {
      // Update existing
      setOrgData(prev => prev.map(m => m.id === editingMember.id ? memberToSave : m));
    } else {
      // Add new
      setOrgData(prev => [...prev, memberToSave]);
    }
    
    setIsAddDialogOpen(false);
    setEditingMember(null);
    setLogoPreview('');
    
    toast({
      title: "Success",
      description: `Member ${memberToSave.name} saved successfully`,
    });
  };

  const handleDeleteMember = (id: string) => {
    // Check if member has children
    const hasChildren = orgData.some(m => m.parentId === id);
    if (hasChildren) {
      toast({
        title: "Cannot Delete",
        description: "This member has subordinates. Please reassign them first.",
        variant: "destructive"
      });
      return;
    }
    
    setOrgData(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Success",
      description: "Member deleted successfully",
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, member: OrgMember) => {
    setDraggedItem(member);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetMember: OrgMember) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(targetMember.id);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetMember: OrgMember) => {
    e.preventDefault();
    setDragOverItem(null);
    
    if (!draggedItem || draggedItem.id === targetMember.id) {
      setDraggedItem(null);
      return;
    }

    // Prevent dropping a parent onto its child
    const isChildOfDragged = (memberId: string, potentialParentId: string): boolean => {
      const member = orgData.find(m => m.id === memberId);
      if (!member || !member.parentId) return false;
      if (member.parentId === potentialParentId) return true;
      return isChildOfDragged(member.parentId, potentialParentId);
    };

    if (isChildOfDragged(targetMember.id, draggedItem.id)) {
      toast({
        title: "Invalid Move",
        description: "Cannot move a member under their own subordinate",
        variant: "destructive"
      });
      setDraggedItem(null);
      return;
    }

    // Update the hierarchy
    const newLevel = targetMember.level + 1;
    const updatedOrgData = orgData.map(member => {
      if (member.id === draggedItem.id) {
        return {
          ...member,
          parentId: targetMember.id,
          level: newLevel
        };
      }
      return member;
    });

    // Update levels for all children recursively
    const updateChildrenLevels = (parentId: string, baseLevel: number): OrgMember[] => {
      return updatedOrgData.map(member => {
        if (member.parentId === parentId) {
          return {
            ...member,
            level: baseLevel + 1
          };
        }
        return member;
      });
    };

    let finalData = updatedOrgData;
    const updateChildren = (parentId: string, level: number) => {
      finalData = finalData.map(member => {
        if (member.parentId === parentId) {
          const updatedMember = { ...member, level: level + 1 };
          updateChildren(member.id, level + 1);
          return updatedMember;
        }
        return member;
      });
    };

    updateChildren(draggedItem.id, newLevel);

    setOrgData(finalData);
    setDraggedItem(null);
    
    toast({
      title: "Hierarchy Updated",
      description: `${draggedItem.name} moved under ${targetMember.name}`,
    });
  };

  const availableParents = orgData.filter(m => 
    editingMember ? m.id !== editingMember.id : true
  );

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organizational Hierarchy
            </span>
            <Button onClick={handleAddMember} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table View */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Organization Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgData
                      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
                      .map((member) => (
                        <TableRow 
                          key={member.id}
                          draggable={member.level > 0} // Can't drag top-level members
                          onDragStart={(e) => handleDragStart(e, member)}
                          onDragOver={(e) => handleDragOver(e, member)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, member)}
                          className={`transition-all duration-200 ${
                            draggedItem?.id === member.id 
                              ? 'opacity-50 scale-95 bg-primary/10' 
                              : ''
                          } ${
                            dragOverItem === member.id 
                              ? 'bg-primary/20 border-primary border-2 animate-pulse' 
                              : ''
                          } ${
                            member.level > 0 
                              ? 'cursor-move hover:bg-muted/50' 
                              : ''
                          }`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {member.level > 0 && (
                                  <div className="text-muted-foreground mr-2 text-xs">
                                    ⋮⋮
                                  </div>
                                )}
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={member.logo} />
                                  <AvatarFallback className="text-xs">
                                    {member.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div>
                                <div className="font-medium text-sm flex items-center gap-2">
                                  <span style={{ marginLeft: `${member.level * 12}px` }}>
                                    {member.name}
                                  </span>
                                  {member.level > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      (Drag to reorganize)
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground" style={{ marginLeft: `${member.level * 12}px` }}>
                                  {member.department}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{member.position}</div>
                            <Badge variant={member.type === 'department' ? 'default' : 'secondary'} className="text-xs">
                              {member.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              L{member.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleEditMember(member)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteMember(member.id)}
                                disabled={member.level === 0}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diagram View */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Hierarchy Diagram
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                style={{ background: 'hsl(var(--background))' }}
              >
                <MiniMap 
                  nodeClassName="!fill-primary/20"
                  maskColor="hsl(var(--background))"
                />
                <Controls />
                <Background />
              </ReactFlow>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMember?.name ? 'Edit Member' : 'Add New Member'}
            </DialogTitle>
          </DialogHeader>
          
          {editingMember && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={editingMember.position}
                    onChange={(e) => setEditingMember({...editingMember, position: e.target.value})}
                    placeholder="Enter position"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editingMember.department}
                    onChange={(e) => setEditingMember({...editingMember, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={editingMember.type}
                    onValueChange={(value: 'role' | 'department') => 
                      setEditingMember({...editingMember, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="parent">Reports To</Label>
                <Select
                  value={editingMember.parentId || 'none'}
                  onValueChange={(value) => 
                    setEditingMember({
                      ...editingMember, 
                      parentId: value === 'none' ? null : value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent (Top Level)</SelectItem>
                    {availableParents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.name} - {parent.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <Label htmlFor="logo">Profile Picture / Logo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {logoPreview && (
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={logoPreview} />
                      <AvatarFallback>
                        {editingMember.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMember}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Member
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}