import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { logger } from "../utils/logger";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

// Tried in order; first model that returns a usable response wins.
const GENERATION_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
];

export class UnsupportedFileTypeError extends Error {}
export class EmptyDocumentError extends Error {}
export class AIParsingError extends Error {}

/**
 * Extract plain text from an uploaded résumé/job-description file.
 * Throws UnsupportedFileTypeError for unsupported formats and
 * EmptyDocumentError when no readable text could be found (e.g. scanned PDFs).
 */
export async function extractText(filePath: string, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();
  let text = "";

  if (ext === ".pdf") {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    text = data.text || "";
  } else if (ext === ".docx") {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || "";
  } else if (ext === ".txt") {
    text = await fs.readFile(filePath, "utf-8");
  } else if (ext === ".doc") {
    throw new UnsupportedFileTypeError(
      "Legacy .doc files are not supported. Please upload a PDF, DOCX, or TXT file."
    );
  } else {
    throw new UnsupportedFileTypeError(
      "Unsupported file type. Please upload a PDF, DOCX, or TXT file."
    );
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new EmptyDocumentError(
      "No readable text found in this file. If this is a scanned or image-based PDF, please upload a text-based PDF or DOCX instead."
    );
  }

  return trimmed;
}

/**
 * Generate a 768-dimension embedding for the given text using Gemini.
 * Returns null (non-fatal) if the API key is missing or the request fails,
 * so callers can proceed without an embedding.
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  const input = text.trim();
  if (!input) return null;

  if (!GEMINI_API_KEY) {
    logger.warn("GEMINI_API_KEY not configured; skipping embedding generation");
    return null;
  }

  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text: input.slice(0, 8000) }] },
          outputDimensionality: EMBEDDING_DIMENSIONS,
        }),
      }
    );

    if (!response.ok) {
      logger.error(`Gemini embedding request failed (${response.status}): ${await response.text()}`);
      return null;
    }

    const data: any = await response.json();
    const values = data?.embedding?.values;
    if (!Array.isArray(values) || values.length === 0) {
      logger.error("Gemini embedding response missing values");
      return null;
    }
    return values as number[];
  } catch (error) {
    logger.error("Failed to generate embedding", error);
    return null;
  }
}

/**
 * Strip markdown code fences and extract the first {...} block as a fallback,
 * so minor formatting quirks in the model's response don't break parsing.
 */
function parseJsonFromText(text: string): any {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Model response did not contain valid JSON");
  }
}

async function callGeminiJSON(prompt: string, maxOutputTokens = 4096): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new AIParsingError(
      "AI parsing is not configured on this server (missing GEMINI_API_KEY)."
    );
  }

  let lastError: unknown = null;

  for (const model of GENERATION_MODELS) {
    try {
      const response = await fetch(
        `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
              maxOutputTokens,
            },
          }),
        }
      );

      if (!response.ok) {
        lastError = new Error(`Gemini model ${model} returned ${response.status}: ${await response.text()}`);
        logger.warn(`AI parsing: model ${model} failed with status ${response.status}`);
        continue;
      }

      const data: any = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = new Error(`Gemini model ${model} returned no content`);
        logger.warn(`AI parsing: model ${model} returned no content`);
        continue;
      }

      return parseJsonFromText(text);
    } catch (error) {
      lastError = error;
      logger.warn(`AI parsing: model ${model} threw an error`, error);
    }
  }

  logger.error("AI parsing: all Gemini models failed", lastError);
  throw new AIParsingError(
    "AI parsing is temporarily unavailable. Please try again later or enter the details manually."
  );
}

export type SkillCategory = "technical" | "soft" | "language" | "certification" | "other";

export interface ParsedResumeSkill {
  name: string;
  category: SkillCategory;
}

export interface ParsedResumeEducation {
  degree?: string;
  institution?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  grade?: string;
}

export interface ParsedResumeExperience {
  employer?: string;
  title?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  responsibilities?: string[];
  technologies?: string[];
}

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  current_employer?: string;
  current_job_title?: string;
  total_experience_years?: number;
  skills: ParsedResumeSkill[];
  education: ParsedResumeEducation[];
  experience: ParsedResumeExperience[];
  certifications: string[];
  summary?: string;
}

const str = (value: any): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const strArray = (value: any): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim().length > 0) : [];

const num = (value: any): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const VALID_SKILL_CATEGORIES: SkillCategory[] = ["technical", "soft", "language", "certification", "other"];

const normalizeSkillCategory = (value: any): SkillCategory =>
  VALID_SKILL_CATEGORIES.includes(value) ? value : "technical";

/**
 * Normalize the AI's "skills" array: accepts either plain strings or
 * { name, category } objects, trims, and de-duplicates case-insensitively.
 */
const skillArray = (value: any): ParsedResumeSkill[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: ParsedResumeSkill[] = [];
  for (const item of value) {
    let name: string | undefined;
    let category: any;
    if (typeof item === "string") {
      name = item;
    } else if (item && typeof item === "object") {
      name = str(item.name);
      category = item.category;
    }
    name = name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ name, category: normalizeSkillCategory(category) });
  }
  return result;
};

/** Drop education entries that have neither a degree nor an institution. */
const educationArray = (value: any): ParsedResumeEducation[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): ParsedResumeEducation | null => {
      if (!item || typeof item !== "object") return null;
      const degree = str(item.degree);
      const institution = str(item.institution);
      if (!degree && !institution) return null;
      return {
        degree,
        institution,
        field: str(item.field),
        start_date: str(item.start_date),
        end_date: str(item.end_date),
        is_current: typeof item.is_current === "boolean" ? item.is_current : undefined,
        grade: str(item.grade),
      };
    })
    .filter((e): e is ParsedResumeEducation => e !== null);
};

/** Drop experience entries that have neither an employer nor a title. */
const experienceArray = (value: any): ParsedResumeExperience[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): ParsedResumeExperience | null => {
      if (!item || typeof item !== "object") return null;
      const employer = str(item.employer);
      const title = str(item.title);
      if (!employer && !title) return null;
      return {
        employer,
        title,
        location: str(item.location),
        start_date: str(item.start_date),
        end_date: str(item.end_date),
        is_current: typeof item.is_current === "boolean" ? item.is_current : undefined,
        description: str(item.description),
        responsibilities: strArray(item.responsibilities),
        technologies: strArray(item.technologies),
      };
    })
    .filter((e): e is ParsedResumeExperience => e !== null);
};

const PRESENT_KEYWORDS = new Set([
  "present", "current", "currently", "ongoing", "now", "till date", "to date", "n/a", "na", "tbd",
]);

const MONTH_NAMES: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
  sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

/**
 * Parse resume date strings ("2020-05", "May 2020", "2020", "05/2020", ...)
 * into a Date. Returns undefined for "Present"/empty/unrecognized formats so
 * callers never fabricate a date.
 */
export function parseFlexibleDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || PRESENT_KEYWORDS.has(trimmed.toLowerCase())) return undefined;

  // Dates are constructed via Date.UTC at midnight so the calendar date is
  // preserved regardless of the server's local timezone (matches how
  // ISO date-only strings, e.g. from manual-entry date pickers, are parsed).
  let match = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  }

  match = trimmed.match(/^(\d{4})[-/](\d{1,2})$/);
  if (match) {
    const [, y, m] = match;
    return new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  }

  match = trimmed.match(/^(\d{1,2})[-/](\d{4})$/);
  if (match) {
    const [, m, y] = match;
    return new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  }

  match = trimmed.match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (match) {
    const monthIndex = MONTH_NAMES[match[1].toLowerCase()];
    if (monthIndex !== undefined) {
      return new Date(Date.UTC(Number(match[2]), monthIndex, 1));
    }
  }

  match = trimmed.match(/^(\d{4})$/);
  if (match) {
    return new Date(Date.UTC(Number(match[1]), 0, 1));
  }

  return undefined;
}

/**
 * Normalize a candidate-supplied URL (e.g. "linkedin.com/in/foo") into a full
 * https:// URL. Returns undefined if the value isn't a plausible URL, so
 * callers never persist a fabricated/garbage link.
 */
export function normalizeUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  let trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes(".")) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * Parse résumé text into structured candidate data using Gemini.
 */
export async function parseResume(text: string): Promise<ParsedResume> {
  const truncated = text.slice(0, 15000);

  const prompt = `You are an expert resume parser. Read the resume text below and return ONLY a single valid JSON object (no markdown fences, no commentary) with exactly this shape:

{
  "name": string | null,
  "email": string | null,
  "phone": string | null,
  "location": string | null,
  "linkedin_url": string | null,
  "portfolio_url": string | null,
  "current_employer": string | null,
  "current_job_title": string | null,
  "total_experience_years": number | null,
  "skills": [{ "name": string, "category": "technical" | "soft" | "language" | "certification" | "other" }],
  "education": [{ "degree": string, "institution": string, "field": string, "start_date": string, "end_date": string, "is_current": boolean, "grade": string }],
  "experience": [{ "employer": string, "title": string, "location": string, "start_date": string, "end_date": string, "is_current": boolean, "description": string, "responsibilities": string[], "technologies": string[] }],
  "certifications": string[],
  "summary": string | null
}

Rules:
- Extract "email" and "phone" exactly as written if present, otherwise null.
- "linkedin_url" is the candidate's LinkedIn profile URL if present. "portfolio_url" is a personal website, portfolio, or GitHub/GitLab profile URL if present (prefer a personal site over GitHub if both exist). Use null if not present in the text - never guess a URL from the candidate's name.
- "total_experience_years" is the candidate's total professional experience in years as a number (estimate from the work history dates if not stated explicitly).
- "skills" is a deduplicated array of distinct skills and competencies, each tagged with the best-fitting "category": "technical" for programming languages, frameworks, tools, and platforms; "soft" for interpersonal/management skills; "language" for spoken/written languages (e.g. Spanish, Mandarin); "certification" for professional certifications/licenses; "other" if none fit. Normalize capitalization (e.g. "JavaScript", "Project Management").
- "certifications" is a flat array of certification/license names, kept separate from "skills".
- For "education" and "experience" entries, "start_date" and "end_date" should be in "YYYY-MM" or "YYYY" format when known, otherwise null. Set "is_current" to true only when the text explicitly says so (e.g. "Present", "Current").
- "responsibilities" and "technologies" describe a single experience entry: key duties/achievements and technologies/tools used in that role.
- "summary" is a concise 2-3 sentence professional summary written in third person.
- Use null for any field that cannot be determined, and an empty array for array fields with no data. Never invent information that is not present in the text.

Resume text:
"""
${truncated}
"""`;

  const result = await callGeminiJSON(prompt, 8192);

  return {
    name: str(result.name),
    email: str(result.email),
    phone: str(result.phone),
    location: str(result.location),
    linkedin_url: normalizeUrl(str(result.linkedin_url)),
    portfolio_url: normalizeUrl(str(result.portfolio_url)),
    current_employer: str(result.current_employer),
    current_job_title: str(result.current_job_title),
    total_experience_years: num(result.total_experience_years),
    skills: skillArray(result.skills),
    education: educationArray(result.education),
    experience: experienceArray(result.experience),
    certifications: strArray(result.certifications),
    summary: str(result.summary),
  };
}

export interface ParsedJobDescription {
  title?: string;
  company_name?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  job_type?: "full_time" | "part_time" | "contract" | "temporary";
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  experience_min_years?: number;
  experience_max_years?: number;
  required_skills: string[];
  preferred_skills: string[];
  education_requirements?: string;
  description: string;
  positions_available?: number;
}

const VALID_JOB_TYPES = ["full_time", "part_time", "contract", "temporary"];

/**
 * Parse a job description document into structured job fields using Gemini.
 */
export async function parseJobDescription(text: string): Promise<ParsedJobDescription> {
  const truncated = text.slice(0, 15000);

  const prompt = `You are an expert job description parser. Read the job posting text below and return ONLY a single valid JSON object (no markdown fences, no commentary) with exactly this shape:

{
  "title": string | null,
  "company_name": string | null,
  "location": string | null,
  "city": string | null,
  "state": string | null,
  "country": string | null,
  "job_type": "full_time" | "part_time" | "contract" | "temporary" | null,
  "salary_min": number | null,
  "salary_max": number | null,
  "salary_currency": string | null,
  "experience_min_years": number | null,
  "experience_max_years": number | null,
  "required_skills": string[],
  "preferred_skills": string[],
  "education_requirements": string | null,
  "description": string,
  "positions_available": number | null
}

Rules:
- "description" is a clean, well-written summary of the role, responsibilities, and requirements as plain text (no markdown headers), at least a few sentences.
- "salary_currency" is a 3-letter ISO currency code (e.g. "USD", "INR") if it can be inferred, otherwise null.
- "job_type" must be exactly one of "full_time", "part_time", "contract", "temporary", or null if unclear.
- "required_skills" and "preferred_skills" are flat, deduplicated arrays of skill names with normalized capitalization.
- Use null for any field that cannot be determined, and an empty array for array fields with no data. Never invent information that is not present in the text.

Job description text:
"""
${truncated}
"""`;

  const result = await callGeminiJSON(prompt);

  const jobType = VALID_JOB_TYPES.includes(result.job_type) ? result.job_type : undefined;
  const currency = str(result.salary_currency);

  return {
    title: str(result.title),
    company_name: str(result.company_name),
    location: str(result.location),
    city: str(result.city),
    state: str(result.state),
    country: str(result.country),
    job_type: jobType as ParsedJobDescription["job_type"],
    salary_min: num(result.salary_min),
    salary_max: num(result.salary_max),
    salary_currency: currency ? currency.toUpperCase().slice(0, 3) : undefined,
    experience_min_years: num(result.experience_min_years),
    experience_max_years: num(result.experience_max_years),
    required_skills: strArray(result.required_skills),
    preferred_skills: strArray(result.preferred_skills),
    education_requirements: str(result.education_requirements),
    description: str(result.description) || truncated.slice(0, 2000),
    positions_available: num(result.positions_available),
  };
}
