import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge, 
  Node,
  Position,
  Handle,
  NodeProps
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { 
  Upload, 
  Download, 
  Play, 
  Save, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  Code, 
  Eye,
  GitBranch,
  Database,
  FileJson,
  Webhook,
  Zap,
  TestTube,
  History,
  Users,
  Lock,
  Unlock,
  Trash2,
  Copy,
  RotateCcw,
  Github,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransformationFunction {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: { name: string; type: string; required: boolean }[];
}

interface MappingVersion {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
  description: string;
}

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  children?: SchemaField[];
}

interface MappingRelationship {
  id: string;
  sourceField: string;
  targetField: string;
  cardinality: '1:1' | '1:n' | 'n:1';
  transformations?: string[];
}

// Custom Node Components
const SourceFieldNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 min-w-[150px]">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
        <span className="font-medium text-sm">{data?.label as string}</span>
        {data?.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
      </div>
      <div className="text-xs text-gray-600 mt-1">{data?.type as string}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};

const TargetFieldNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 min-w-[150px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full" />
        <span className="font-medium text-sm">{data?.label as string}</span>
        {data?.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
      </div>
      <div className="text-xs text-gray-600 mt-1">{data?.type as string}</div>
    </div>
  );
};

const TransformationNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 min-w-[120px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <div className="text-center">
        <div className="font-medium text-sm text-purple-700">{data?.label as string}</div>
        <div className="text-xs text-purple-600">{data?.category as string}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  );
};

const nodeTypes = {
  sourceField: SourceFieldNode,
  targetField: TargetFieldNode,
  transformation: TransformationNode,
};

const MappingBuilder = () => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [sourceSchema, setSourceSchema] = useState<SchemaField[]>([]);
  const [targetSchema, setTargetSchema] = useState<SchemaField[]>([]);
  const [testPayload, setTestPayload] = useState('');
  const [previewOutput, setPreviewOutput] = useState('');
  const [generatedPython, setGeneratedPython] = useState('');
  const [isNewMappingOpen, setIsNewMappingOpen] = useState(false);
  const [newMappingName, setNewMappingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardinality, setSelectedCardinality] = useState<'1:1' | '1:n' | 'n:1'>('1:1');
  const [relationships, setRelationships] = useState<MappingRelationship[]>([]);
  const [isGitHubSyncing, setIsGitHubSyncing] = useState(false);
  
  // Sample data
  const transformationFunctions: TransformationFunction[] = [
    { id: 'to_upper', name: 'To Upper', description: 'Convert text to uppercase', category: 'String', parameters: [{ name: 'input', type: 'string', required: true }] },
    { id: 'to_lower', name: 'To Lower', description: 'Convert text to lowercase', category: 'String', parameters: [{ name: 'input', type: 'string', required: true }] },
    { id: 'concat', name: 'Concatenate', description: 'Join multiple strings', category: 'String', parameters: [{ name: 'strings', type: 'array', required: true }, { name: 'separator', type: 'string', required: false }] },
    { id: 'format_date', name: 'Format Date', description: 'Format date string', category: 'Date', parameters: [{ name: 'date', type: 'string', required: true }, { name: 'format', type: 'string', required: true }] },
    { id: 'add', name: 'Add', description: 'Add numbers', category: 'Math', parameters: [{ name: 'a', type: 'number', required: true }, { name: 'b', type: 'number', required: true }] },
    { id: 'multiply', name: 'Multiply', description: 'Multiply numbers', category: 'Math', parameters: [{ name: 'a', type: 'number', required: true }, { name: 'b', type: 'number', required: true }] },
    { id: 'if_then_else', name: 'If-Then-Else', description: 'Conditional logic', category: 'Logic', parameters: [{ name: 'condition', type: 'boolean', required: true }, { name: 'then', type: 'any', required: true }, { name: 'else', type: 'any', required: false }] },
    { id: 'default_value', name: 'Default Value', description: 'Provide default if null/empty', category: 'Logic', parameters: [{ name: 'value', type: 'any', required: true }, { name: 'default', type: 'any', required: true }] }
  ];

  const mappingVersions: MappingVersion[] = [
    { id: '1', name: 'Webhook to CRM', version: '1.2.0', createdAt: '2024-01-15', createdBy: 'John Doe', status: 'published', description: 'Maps incoming webhook data to CRM format' },
    { id: '2', name: 'API Integration', version: '1.0.0', createdAt: '2024-01-10', createdBy: 'Jane Smith', status: 'draft', description: 'Third-party API data transformation' },
    { id: '3', name: 'Legacy System', version: '2.1.0', createdAt: '2024-01-05', createdBy: 'Bob Johnson', status: 'archived', description: 'Legacy system data migration mapping' }
  ];

  // Sample schemas
  const sampleSourceSchema: SchemaField[] = [
    { name: 'user_id', type: 'string', required: true, description: 'Unique user identifier' },
    { name: 'first_name', type: 'string', required: true },
    { name: 'last_name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'phone', type: 'string', required: false },
    { name: 'address', type: 'object', required: false, children: [
      { name: 'street', type: 'string', required: false },
      { name: 'city', type: 'string', required: false },
      { name: 'zip', type: 'string', required: false }
    ]},
    { name: 'created_at', type: 'datetime', required: true }
  ];

  const sampleTargetSchema: SchemaField[] = [
    { name: 'id', type: 'string', required: true },
    { name: 'fullName', type: 'string', required: true },
    { name: 'emailAddress', type: 'string', required: true },
    { name: 'phoneNumber', type: 'string', required: false },
    { name: 'location', type: 'object', required: false, children: [
      { name: 'streetAddress', type: 'string', required: false },
      { name: 'cityName', type: 'string', required: false },
      { name: 'postalCode', type: 'string', required: false }
    ]},
    { name: 'dateCreated', type: 'datetime', required: true }
  ];

  const initialNodes: Node[] = [
    {
      id: 'source-1',
      data: { label: 'user_id' },
      position: { x: 100, y: 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: 'target-1', 
      data: { label: 'id' },
      position: { x: 400, y: 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }
  ];

  const onConnect = useCallback((params: Connection) => {
    // Create edge with cardinality
    const newEdge = {
      ...params,
      data: { cardinality: selectedCardinality },
      label: selectedCardinality,
      style: { stroke: getCardinalityColor(selectedCardinality) }
    };
    setEdges((eds) => addEdge(newEdge, eds));
    
    // Track relationship
    if (params.source && params.target) {
      const newRelationship: MappingRelationship = {
        id: `${params.source}-${params.target}`,
        sourceField: params.source,
        targetField: params.target,
        cardinality: selectedCardinality
      };
      setRelationships(prev => [...prev, newRelationship]);
    }
  }, [setEdges, selectedCardinality]);

  const createNodesFromSchema = useCallback((schema: SchemaField[], type: 'source' | 'target', startY: number = 50) => {
    const nodes: Node[] = [];
    let yOffset = startY;
    const xPosition = type === 'source' ? 100 : 600;

    const addFieldNode = (field: SchemaField, level: number = 0) => {
      const nodeId = `${type}-${field.name}-${level}`;
      nodes.push({
        id: nodeId,
        type: type === 'source' ? 'sourceField' : 'targetField',
        position: { x: xPosition + (level * 20), y: yOffset },
        data: {
          label: field.name,
          type: field.type,
          required: field.required,
          description: field.description,
          fieldPath: field.name
        },
        draggable: false,
      });
      yOffset += 80;

      // Add child fields
      if (field.children) {
        field.children.forEach(child => addFieldNode(child, level + 1));
      }
    };

    schema.forEach(field => addFieldNode(field));
    return nodes;
  }, []);

  const updateCanvasNodes = useCallback(() => {
    const sourceNodes = sourceSchema.length > 0 ? createNodesFromSchema(sourceSchema, 'source') : [];
    const targetNodes = targetSchema.length > 0 ? createNodesFromSchema(targetSchema, 'target') : [];
    setNodes([...sourceNodes, ...targetNodes]);
  }, [sourceSchema, targetSchema, createNodesFromSchema, setNodes]);

  // Update canvas when schemas change
  React.useEffect(() => {
    updateCanvasNodes();
  }, [updateCanvasNodes]);

  const getCardinalityColor = (cardinality: '1:1' | '1:n' | 'n:1') => {
    switch (cardinality) {
      case '1:1': return '#22c55e'; // green
      case '1:n': return '#3b82f6'; // blue  
      case 'n:1': return '#f59e0b'; // amber
      default: return '#6b7280'; // gray
    }
  };

  const handleGitHubSync = async () => {
    setIsGitHubSyncing(true);
    try {
      // Simulate GitHub sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "GitHub Sync Complete",
        description: "Mapping configurations have been synced to your GitHub repository",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync with GitHub. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsGitHubSyncing(false);
    }
  };

  const handleSchemaUpload = (type: 'source' | 'target', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Convert JSON to schema format
        const convertToSchema = (obj: any, path: string = ''): SchemaField[] => {
          return Object.entries(obj).map(([key, value]) => {
            const fieldPath = path ? `${path}.${key}` : key;
            const field: SchemaField = {
              name: key,
              type: Array.isArray(value) ? 'array' : typeof value === 'object' && value !== null ? 'object' : typeof value,
              required: true, // Default to required, could be enhanced
              description: `Field: ${fieldPath}`
            };

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              field.children = convertToSchema(value, fieldPath);
            }

            return field;
          });
        };

        const schema = convertToSchema(parsed);
        
        if (type === 'source') {
          setSourceSchema(schema);
        } else {
          setTargetSchema(schema);
        }
        
        toast({
          title: "Schema Uploaded",
          description: `${type === 'source' ? 'Source' : 'Target'} schema loaded successfully`,
        });
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Invalid JSON file format",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleSchema = (type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceSchema(sampleSourceSchema);
    } else {
      setTargetSchema(sampleTargetSchema);
    }
    
    toast({
      title: "Sample Schema Loaded",
      description: `${type === 'source' ? 'Source' : 'Target'} sample schema loaded`,
    });
  };

  const handleTestMapping = () => {
    if (!testPayload) {
      toast({
        title: "No Test Data",
        description: "Please provide test payload data",
        variant: "destructive"
      });
      return;
    }

    if (edges.length === 0) {
      toast({
        title: "No Mappings",
        description: "Please create field mappings before testing",
        variant: "destructive"
      });
      return;
    }

    try {
      const input = JSON.parse(testPayload);
      const output: any = {};

      // Apply mappings based on edges
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
          const sourceField = sourceNode.data.fieldPath;
          const targetField = targetNode.data.fieldPath;
          
          // Get value from source
          const sourceValue = getNestedValue(input, sourceField);
          
          // Apply transformations based on cardinality and edge data
          let transformedValue = sourceValue;
          if (edge.data?.cardinality === '1:n' && !Array.isArray(sourceValue)) {
            transformedValue = [sourceValue];
          } else if (edge.data?.cardinality === 'n:1' && Array.isArray(sourceValue)) {
            transformedValue = sourceValue[0]; // Take first element
          }
          
          // Set value in target
          setNestedValue(output, targetField, transformedValue);
        }
      });
      
      setPreviewOutput(JSON.stringify(output, null, 2));
      toast({
        title: "Test Successful",
        description: "Payload transformed successfully",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Invalid test payload format or mapping error",
        variant: "destructive"
      });
    }
  };

  // Helper functions for nested object access
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  const handleGeneratePython = () => {
    const pythonCode = `
def transform_payload(source_data):
    """
    Generated transformation function
    Maps source webhook data to target API format
    """
    try:
        # Extract source fields
        user_id = source_data.get('user_id')
        first_name = source_data.get('first_name', '')
        last_name = source_data.get('last_name', '')
        email = source_data.get('email')
        phone = source_data.get('phone')
        address = source_data.get('address', {})
        created_at = source_data.get('created_at')
        
        # Transform to target format
        transformed_data = {
            'id': user_id,
            'fullName': f"{first_name} {last_name}".strip(),
            'emailAddress': email,
            'phoneNumber': phone,
            'location': {
                'streetAddress': address.get('street'),
                'cityName': address.get('city'), 
                'postalCode': address.get('zip')
            },
            'dateCreated': created_at
        }
        
        # Remove null values if needed
        transformed_data = {k: v for k, v in transformed_data.items() if v is not None}
        
        return transformed_data
        
    except Exception as e:
        raise ValueError(f"Transformation failed: {str(e)}")

def forward_to_target_api(transformed_data, api_endpoint, api_key):
    """
    Forward transformed data to target API
    """
    import requests
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(api_endpoint, json=transformed_data, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage example:
# result = transform_payload(webhook_data)
# api_response = forward_to_target_api(result, 'https://api.example.com/users', 'your_api_key')
`;
    
    setGeneratedPython(pythonCode.trim());
    toast({
      title: "Python Code Generated",
      description: "Transformation functions have been generated",
    });
  };

  const handleNewMapping = () => {
    if (!newMappingName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please enter a mapping name",
        variant: "destructive"
      });
      return;
    }

    // Reset the mapping builder state
    setNodes([]);
    setEdges([]);
    setSourceSchema([]);
    setTargetSchema([]);
    setTestPayload('');
    setPreviewOutput('');
    setGeneratedPython('');
    
    setIsNewMappingOpen(false);
    setNewMappingName('');
    
    toast({
      title: "New Mapping Created",
      description: `"${newMappingName}" mapping session started`,
    });
  };

  const filteredMappings = mappingVersions.filter(mapping => 
    mapping.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mapping.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSchemaField = (field: SchemaField, level: number = 0) => (
    <div key={field.name} className={`ml-${level * 4} mb-2`}>
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
        <span className="font-medium">{field.name}</span>
        <Badge variant="secondary" className="text-xs">{field.type}</Badge>
        {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
      </div>
      {field.children?.map(child => renderSchemaField(child, level + 1))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mapping Builder</h1>
          <p className="text-muted-foreground mt-2">
            Visual mapping tool for implementation consultants and technical admins to define, transform, and deploy data payload mappings
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleGitHubSync}
            disabled={isGitHubSyncing}
          >
            {isGitHubSyncing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Github className="w-4 h-4 mr-2" />
            )}
            {isGitHubSyncing ? 'Syncing...' : 'Sync with GitHub'}
          </Button>
          <Dialog open={isNewMappingOpen} onOpenChange={setIsNewMappingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Mapping
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Mapping</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mapping-name">Mapping Name</Label>
                  <Input
                    id="mapping-name"
                    value={newMappingName}
                    onChange={(e) => setNewMappingName(e.target.value)}
                    placeholder="Enter mapping name..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewMappingOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleNewMapping}>
                    Create Mapping
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Mapping Builder</TabsTrigger>
          <TabsTrigger value="versions">Version Control</TabsTrigger>
          <TabsTrigger value="test">Preview & Test</TabsTrigger>
          <TabsTrigger value="deploy">Python Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Source Schema Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Source Schema
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <label>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload JSON
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => handleSchemaUpload('source', e)}
                      />
                    </label>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLoadSampleSchema('source')}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Sample
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {sourceSchema.length > 0 ? (
                    <div className="space-y-1">
                      {sourceSchema.map(field => renderSchemaField(field))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileJson className="w-8 h-8 mx-auto mb-2" />
                      <p>Upload or configure source schema</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Mapping Canvas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Mapping Canvas
                    <Badge variant="outline" className="ml-2">
                      {edges.length} Mappings
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="cardinality" className="text-sm font-medium">
                      Cardinality:
                    </Label>
                    <Select value={selectedCardinality} onValueChange={(value: '1:1' | '1:n' | 'n:1') => setSelectedCardinality(value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            1:1
                          </div>
                        </SelectItem>
                        <SelectItem value="1:n">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            1:n
                          </div>
                        </SelectItem>
                        <SelectItem value="n:1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            n:1
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag to connect fields. Select cardinality before creating connections.
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] border rounded-lg bg-gray-50">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-white"
                  >
                    <Background color="#f1f5f9" />
                    <Controls />
                    <MiniMap 
                      nodeColor={(node) => {
                        switch (node.type) {
                          case 'sourceField': return '#3b82f6';
                          case 'targetField': return '#22c55e';
                          case 'transformation': return '#8b5cf6';
                          default: return '#64748b';
                        }
                      }}
                    />
                  </ReactFlow>
                </div>
                {edges.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Active Mappings ({edges.length})</h4>
                    <div className="space-y-1">
                      {edges.map((edge) => {
                        const sourceNode = nodes.find(n => n.id === edge.source);
                        const targetNode = nodes.find(n => n.id === edge.target);
                        return (
                          <div key={edge.id} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">{sourceNode?.data.label}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-medium">{targetNode?.data.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {edge.data?.cardinality || '1:1'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Schema Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Target Schema
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <label>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload JSON
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => handleSchemaUpload('target', e)}
                      />
                    </label>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleLoadSampleSchema('target')}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Sample
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {targetSchema.length > 0 ? (
                    <div className="space-y-1">
                      {targetSchema.map(field => renderSchemaField(field))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <FileJson className="w-8 h-8 mx-auto mb-2" />
                      <p>Upload or configure target schema</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Transformation Library */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Transformation Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {transformationFunctions.map((func) => (
                  <div
                    key={func.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    title={func.description}
                  >
                    <div className="font-medium text-sm">{func.name}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {func.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Mapping Versions
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search mappings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMappings.map((mapping) => (
                  <div key={mapping.id} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{mapping.name}</h3>
                          <Badge variant="outline">v{mapping.version}</Badge>
                          <Badge 
                            variant={mapping.status === 'published' ? 'default' : 
                                   mapping.status === 'draft' ? 'secondary' : 'outline'}
                          >
                            {mapping.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{mapping.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>Created: {mapping.createdAt}</span>
                          <span>By: {mapping.createdBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-1" />
                          Clone
                        </Button>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Test Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="test-payload">Sample Payload (JSON)</Label>
                    <Textarea
                      id="test-payload"
                      placeholder={`{
  "user_id": "12345",
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "zip": "12345"
  },
  "created_at": "2024-01-15T10:30:00Z"
}`}
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                      className="h-[200px] font-mono text-sm"
                    />
                  </div>
                  <Button onClick={handleTestMapping} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Test Transformation
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Transformed Payload</Label>
                    <Textarea
                      value={previewOutput}
                      readOnly
                      className="h-[200px] font-mono text-sm bg-muted"
                      placeholder="Test output will appear here..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generated Python Code
              </CardTitle>
              <Button onClick={handleGeneratePython} className="ml-auto">
                <Code className="w-4 h-4 mr-2" />
                Generate Code
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={generatedPython}
                  readOnly
                  className="h-[400px] font-mono text-sm bg-muted"
                  placeholder="Generated Python transformation code will appear here..."
                />
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download .py
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save & Deploy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-based Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Admin</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Full CRUD access</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Editor</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Create/edit mappings</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <TestTube className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Tester</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Test mappings only</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Viewer</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Read-only access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MappingBuilder;