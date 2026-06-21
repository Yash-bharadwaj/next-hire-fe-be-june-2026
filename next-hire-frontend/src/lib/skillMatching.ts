// Deterministic skill comparison between a job's required/preferred skills and
// a candidate's real recorded skills (CandidateSkill rows when available,
// falling back to the plain skills[] list). Unlike a fabricated "required
// level vs candidate level" table, this only shows proficiency/experience the
// candidate actually has on file - skills with no record show as unmatched.

export interface SkillComparisonRow {
  skill: string;
  requirement: "Required" | "Preferred";
  category: string;
  candidateLevel: string;
  yearsExperience?: number;
  matched: boolean;
  score: number;
}

interface CandidateSkillRecord {
  skill_name: string;
  category?: string;
  proficiency_level?: "beginner" | "intermediate" | "advanced" | "expert";
  years_of_experience?: number;
}

interface JobSkillsInput {
  required_skills?: string[];
  preferred_skills?: string[];
}

interface CandidateSkillsInput {
  skills?: string[];
  candidateSkills?: CandidateSkillRecord[];
}

const PROFICIENCY_SCORE: Record<string, number> = {
  expert: 100,
  advanced: 80,
  intermediate: 60,
  beginner: 40,
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const computeSkillMatrix = (
  job?: JobSkillsInput,
  candidate?: CandidateSkillsInput
): SkillComparisonRow[] => {
  const candidateSkills: CandidateSkillRecord[] = candidate?.candidateSkills?.length
    ? candidate.candidateSkills
    : (candidate?.skills || []).map((name) => ({ skill_name: name }));

  const findCandidateSkill = (name: string) =>
    candidateSkills.find((s) => s.skill_name.toLowerCase() === name.toLowerCase());

  const buildRow = (name: string, requirement: "Required" | "Preferred"): SkillComparisonRow => {
    const match = findCandidateSkill(name);
    const proficiency = match?.proficiency_level;
    const score = !match ? 0 : proficiency ? PROFICIENCY_SCORE[proficiency] ?? 60 : 60;
    return {
      skill: name,
      requirement,
      category: match?.category ? capitalize(match.category) : "—",
      candidateLevel: proficiency ? capitalize(proficiency) : match ? "On file" : "Not matched",
      yearsExperience: match?.years_of_experience,
      matched: !!match,
      score,
    };
  };

  return [
    ...(job?.required_skills || []).map((s) => buildRow(s, "Required")),
    ...(job?.preferred_skills || []).map((s) => buildRow(s, "Preferred")),
  ];
};

export const summarizeSkillMatrix = (rows: SkillComparisonRow[]) => {
  const matchedCount = rows.filter((r) => r.matched).length;
  const avgScore = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0;
  return { totalSkills: rows.length, matchedCount, avgScore };
};

export const getMatchLevelLabel = (score: number): string => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Limited";
};
