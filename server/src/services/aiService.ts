import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedJob, ResumeSuggestionsResult } from '../types';
import { createError } from '../middleware/errorHandler';

let geminiClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw createError(
        'Gemini API key not configured. Add GEMINI_API_KEY to .env! 🔑',
        500
      );
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
}

// Strip markdown code fences Gemini sometimes wraps around JSON
function extractJSON(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const firstBrace = raw.indexOf('{');
  const lastBrace  = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return raw.slice(firstBrace, lastBrace + 1);
  }
  return raw.trim();
}

// ── Parse job description ───────────────────────────────────────────────────

export async function parseJobDescription(jd: string): Promise<ParsedJob> {
  const client = getClient();
  const model  = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a job description parser. Read the job description below and return ONLY a raw JSON object — no markdown, no code fences, no explanation.

Return exactly this shape:
{
  "company": "company name or empty string",
  "role": "exact job title",
  "seniority": "Junior or Mid or Senior or Staff or Principal",
  "location": "city name, Remote, or Hybrid",
  "requiredSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "salaryRange": "salary range or empty string"
}

Job description:
${jd.slice(0, 6000)}`;

  try {
    const result = await model.generateContent(prompt);
    const raw    = result.response.text();
    const clean  = extractJSON(raw);
    const parsed = JSON.parse(clean) as ParsedJob;

    // Defensive defaults so the app never crashes on missing fields
    return {
      company:          parsed.company          ?? '',
      role:             parsed.role             ?? '',
      seniority:        parsed.seniority        ?? '',
      location:         parsed.location         ?? '',
      requiredSkills:   Array.isArray(parsed.requiredSkills)   ? parsed.requiredSkills   : [],
      niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills : [],
      salaryRange:      parsed.salaryRange      ?? '',
    };
  } catch (err) {
    console.error('[aiService] parseJobDescription failed:', err);
    throw createError(
      'AI could not parse that job description. Make sure you pasted the full text! 💭',
      422
    );
  }
}

// ── Generate resume bullet suggestions ─────────────────────────────────────

export async function generateResumeSuggestions(
  job: ParsedJob
): Promise<ResumeSuggestionsResult> {
  const client = getClient();
  const model  = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert resume coach. Generate exactly 4 resume bullet points for the role below.
Return ONLY a raw JSON object — no markdown, no code fences, no explanation.

Return exactly this shape:
{
  "bullets": [
    "bullet 1 text",
    "bullet 2 text",
    "bullet 3 text",
    "bullet 4 text"
  ]
}

Rules for each bullet:
- Start with a strong action verb: Led, Built, Reduced, Shipped, Designed, Scaled, Optimised, Implemented
- Include a realistic metric (e.g. reduced load time by 40%, increased conversion by 12%)
- Reference the specific skills listed — never write generic bullets
- Never start with "Worked on" or "Responsible for"

Role: ${job.role}
Company: ${job.company || 'a tech company'}
Seniority: ${job.seniority || 'Mid'}
Required skills: ${job.requiredSkills.length ? job.requiredSkills.join(', ') : 'software development'}
Nice-to-have: ${job.niceToHaveSkills.join(', ') || 'none listed'}`;

  try {
    const result = await model.generateContent(prompt);
    const raw    = result.response.text();
    const clean  = extractJSON(raw);
    const data   = JSON.parse(clean) as { bullets?: string[] };

    return { bullets: Array.isArray(data.bullets) ? data.bullets : [] };
  } catch (err) {
    console.error('[aiService] generateResumeSuggestions failed:', err);
    throw createError(
      'Could not generate resume bullets. Try again in a moment! 🎯',
      422
    );
  }
}
