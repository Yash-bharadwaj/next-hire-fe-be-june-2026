
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, MoreHorizontal, Mail, Phone, Eye, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  score: number;
  experience: string;
  location: string;
  notes?: string;
  lastContact?: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  candidates: Candidate[];
  onAddCandidate: (stageId: string) => void;
  onMoveCandidate: (candidateId: number, newStage: string) => void;
}

export function KanbanColumn({ 
  id, 
  title, 
  count, 
  color, 
  candidates, 
  onAddCandidate,
  onMoveCandidate 
}: KanbanColumnProps) {
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    const candidateId = parseInt(e.dataTransfer.getData("candidateId"));
    const sourceStage = e.dataTransfer.getData("sourceStage");
    
    if (sourceStage !== id) {
      onMoveCandidate(candidateId, id);
    }
  };

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    e.dataTransfer.setData("candidateId", candidate.id.toString());
    e.dataTransfer.setData("sourceStage", id);
  };

  return (
    <Card 
      className={`min-w-[320px] ${color} border-l-4 ${
        id === "sourced" ? "border-l-gray-400" :
        id === "screening" ? "border-l-blue-500" :
        id === "submitted" ? "border-l-purple-500" :
        id === "interview" ? "border-l-yellow-500" :
        "border-l-green-500"
      } ${draggedOver ? "ring-2 ring-blue-300 bg-blue-50/50" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="bg-white/80 text-xs">
              {count}
            </Badge>
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onAddCandidate(id)}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {candidates.map((candidate) => (
          <Card 
            key={candidate.id} 
            className="bg-white shadow-sm hover:shadow-md transition-all cursor-move group"
            draggable
            onDragStart={(e) => handleDragStart(e, candidate)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <GripVertical className="w-4 h-4 text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{candidate.experience} • {candidate.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      candidate.score >= 90 ? "bg-green-50 text-green-700 border-green-200" :
                      candidate.score >= 75 ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {candidate.score}%
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem>
                        <Eye className="w-3 h-3 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-3 h-3 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="w-3 h-3 mr-2" />
                        Schedule Call
                      </DropdownMenuItem>
                      {id !== "offer" && (
                        <DropdownMenuItem onClick={() => onMoveCandidate(candidate.id, getNextStage(id))}>
                          Move to {getNextStageTitle(id)}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-600">{candidate.email}</p>
                {candidate.phone && (
                  <p className="text-xs text-gray-600">{candidate.phone}</p>
                )}
                {candidate.notes && (
                  <p className="text-xs text-gray-500 italic">{candidate.notes}</p>
                )}
                {candidate.lastContact && (
                  <p className="text-xs text-gray-400">Last contact: {candidate.lastContact}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {candidates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No candidates</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2" 
              onClick={() => onAddCandidate(id)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add First
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getNextStage(currentStage: string): string {
  const stages = ["sourced", "screening", "submitted", "interview", "offer"];
  const currentIndex = stages.indexOf(currentStage);
  return stages[currentIndex + 1] || currentStage;
}

function getNextStageTitle(currentStage: string): string {
  const titles: Record<string, string> = {
    "sourced": "Screening",
    "screening": "Client Submitted",
    "submitted": "Interview",
    "interview": "Offer"
  };
  return titles[currentStage] || "";
}
