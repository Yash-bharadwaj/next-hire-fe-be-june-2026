
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KanbanColumn } from "@/components/KanbanColumn";
import { Search, Filter, Plus, Users, TrendingUp, Clock, CheckCircle, Award } from "lucide-react";

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

const SourcingPipeline = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample candidate data
  const [candidates, setCandidates] = useState<Record<string, Candidate[]>>({
    sourced: [
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567",
        score: 92,
        experience: "5+ years React Developer",
        location: "San Francisco, CA",
        notes: "Strong technical background, looking for remote work",
        lastContact: "2 days ago"
      },
      {
        id: 2,
        name: "Michael Chen",
        email: "michael.chen@email.com",
        score: 88,
        experience: "3+ years Full Stack Developer",
        location: "New York, NY",
        notes: "Open to relocation, excellent communication skills"
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        email: "emily.rodriguez@email.com",
        phone: "+1 (555) 987-6543",
        score: 85,
        experience: "4+ years Frontend Developer",
        location: "Austin, TX",
        lastContact: "1 week ago"
      }
    ],
    screening: [
      {
        id: 4,
        name: "David Kim",
        email: "david.kim@email.com",
        score: 90,
        experience: "6+ years Senior Developer",
        location: "Seattle, WA",
        notes: "Completed initial phone screening, very interested",
        lastContact: "Yesterday"
      },
      {
        id: 5,
        name: "Lisa Thompson",
        email: "lisa.thompson@email.com",
        phone: "+1 (555) 456-7890",
        score: 87,
        experience: "4+ years React/Node Developer",
        location: "Denver, CO",
        notes: "Technical assessment scheduled for next week"
      }
    ],
    submitted: [
      {
        id: 6,
        name: "Alex Johnson",
        email: "alex.johnson@email.com",
        score: 94,
        experience: "7+ years Lead Developer",
        location: "Boston, MA",
        notes: "Submitted to TechCorp for Senior React position",
        lastContact: "3 days ago"
      }
    ],
    interview: [
      {
        id: 7,
        name: "Jennifer Lee",
        email: "jennifer.lee@email.com",
        phone: "+1 (555) 321-0987",
        score: 91,
        experience: "5+ years Frontend Lead",
        location: "Los Angeles, CA",
        notes: "First interview scheduled for Friday 2PM",
        lastContact: "Today"
      }
    ],
    offer: [
      {
        id: 8,
        name: "Robert Wilson",
        email: "robert.wilson@email.com",
        score: 96,
        experience: "8+ years Senior Engineer",
        location: "Chicago, IL",
        notes: "Offer extended, awaiting response",
        lastContact: "2 hours ago"
      }
    ]
  });

  const stages = [
    {
      id: "sourced",
      title: "Sourced",
      color: "bg-gray-50",
      count: candidates.sourced.length
    },
    {
      id: "screening",
      title: "Screening",
      color: "bg-blue-50",
      count: candidates.screening.length
    },
    {
      id: "submitted",
      title: "Client Submitted",
      color: "bg-purple-50",
      count: candidates.submitted.length
    },
    {
      id: "interview",
      title: "Interview",
      color: "bg-yellow-50",
      count: candidates.interview.length
    },
    {
      id: "offer",
      title: "Offer",
      color: "bg-green-50",
      count: candidates.offer.length
    }
  ];

  const handleAddCandidate = (stageId: string) => {
    console.log(`Add candidate to ${stageId}`);
    // Here you would typically open a modal or form to add a new candidate
  };

  const handleMoveCandidate = (candidateId: number, newStage: string) => {
    setCandidates(prevCandidates => {
      const newCandidates = { ...prevCandidates };
      
      // Find and remove candidate from current stage
      let candidateToMove: Candidate | null = null;
      for (const [stageKey, stageCandidates] of Object.entries(newCandidates)) {
        const candidateIndex = stageCandidates.findIndex(c => c.id === candidateId);
        if (candidateIndex !== -1) {
          candidateToMove = stageCandidates[candidateIndex];
          newCandidates[stageKey] = stageCandidates.filter(c => c.id !== candidateId);
          break;
        }
      }
      
      // Add candidate to new stage
      if (candidateToMove && newCandidates[newStage]) {
        newCandidates[newStage] = [...newCandidates[newStage], candidateToMove];
      }
      
      return newCandidates;
    });
  };

  // Filter candidates based on search term
  const filteredCandidates = Object.fromEntries(
    Object.entries(candidates).map(([stage, stageCandidates]) => [
      stage,
      stageCandidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ])
  );

  const totalCandidates = Object.values(candidates).reduce((sum, stage) => sum + stage.length, 0);
  const avgScore = Math.round(
    Object.values(candidates)
      .flat()
      .reduce((sum, candidate) => sum + candidate.score, 0) / totalCandidates
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sourcing Funnel</h1>
          <p className="text-gray-600">Manage candidates through your recruitment funnel</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-lg font-bold text-gray-900">{totalCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-lg font-bold text-gray-900">{avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-50">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Process</p>
                <p className="text-lg font-bold text-gray-900">{candidates.screening.length + candidates.submitted.length + candidates.interview.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-lg font-bold text-gray-900">{candidates.offer.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="text-sm">
              {Object.values(filteredCandidates).reduce((sum, stage) => sum + stage.length, 0)} candidates
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Funnel Columns */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            id={stage.id}
            title={stage.title}
            count={filteredCandidates[stage.id]?.length || 0}
            color={stage.color}
            candidates={filteredCandidates[stage.id] || []}
            onAddCandidate={handleAddCandidate}
            onMoveCandidate={handleMoveCandidate}
          />
        ))}
      </div>
    </div>
  );
};

export default SourcingPipeline;
