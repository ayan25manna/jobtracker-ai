"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJobDescription = parseJobDescription;
exports.generateResumeSuggestions = generateResumeSuggestions;
const generative_ai_1 = require("@google/generative-ai");
const errorHandler_1 = require("../middleware/errorHandler");
// Lazy-init client
let geminiClient = null;
function getClient() {
    if (!geminiClient) {
        if (!process.env.GEMINI_API_KEY) {
            throw (0, errorHandler_1.createError)('Gemini API key not configured. Add GEMINI_API_KEY to .env! 🔑', 500);
        }
        geminiClient = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return geminiClient;
}
// ── Parse job description ───────────────────────────────────────────────────
async function parseJobDescription(jd) {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    company: { type: generative_ai_1.SchemaType.STRING },
                    role: { type: generative_ai_1.SchemaType.STRING },
                    seniority: { type: generative_ai_1.SchemaType.STRING },
                    location: { type: generative_ai_1.SchemaType.STRING },
                    requiredSkills: { type: generative_ai_1.SchemaType.ARRAY, items: { type: generative_ai_1.SchemaType.STRING } },
                    niceToHaveSkills: { type: generative_ai_1.SchemaType.ARRAY, items: { type: generative_ai_1.SchemaType.STRING } },
                    salaryRange: { type: generative_ai_1.SchemaType.STRING },
                },
                required: ['company', 'role', 'seniority', 'location', 'requiredSkills', 'niceToHaveSkills', 'salaryRange'],
            },
        },
    });
    const prompt = `You are a job description parser.
Extract the following from the job description below and return as JSON:
- company: company name (empty string if not found)
- role: exact job title
- seniority: Junior / Mid / Senior / Staff / Principal (infer if not stated)
- location: city, Remote, or Hybrid
- requiredSkills: array of must-have technical skills
- niceToHaveSkills: array of preferred/optional skills
- salaryRange: salary range string (empty string if not mentioned)

Job description:
${jd.slice(0, 6000)}`;
    try {
        const result = await model.generateContent(prompt);
        const raw = result.response.text();
        const parsed = JSON.parse(raw);
        parsed.requiredSkills = parsed.requiredSkills ?? [];
        parsed.niceToHaveSkills = parsed.niceToHaveSkills ?? [];
        return parsed;
    }
    catch {
        throw (0, errorHandler_1.createError)('AI returned something unexpected. Paste a proper job description! 💭', 422);
    }
}
// ── Generate resume bullet suggestions ─────────────────────────────────────
async function generateResumeSuggestions(job) {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: generative_ai_1.SchemaType.OBJECT,
                properties: {
                    bullets: { type: generative_ai_1.SchemaType.ARRAY, items: { type: generative_ai_1.SchemaType.STRING } },
                },
                required: ['bullets'],
            },
        },
    });
    const prompt = `You are an expert resume coach. Generate exactly 4 strong resume bullet points
tailored specifically for this job role. Return as JSON with a "bullets" array.

Rules:
- Start every bullet with a strong action verb (Led, Built, Reduced, Shipped, Designed, Scaled…)
- Include realistic metrics (e.g. reduced load time by 40%, grew conversion by 12%)
- Reference the specific skills listed below — do NOT write generic bullets
- Never start with "Worked on" or "Responsible for"

Role: ${job.role}
Company: ${job.company}
Seniority: ${job.seniority}
Required skills: ${job.requiredSkills.join(', ')}
Nice-to-have: ${job.niceToHaveSkills.join(', ')}`;
    try {
        const result = await model.generateContent(prompt);
        const raw = result.response.text();
        const data = JSON.parse(raw);
        return { bullets: data.bullets ?? [] };
    }
    catch {
        throw (0, errorHandler_1.createError)('AI lost its mind generating bullets. Try again? 🎯', 422);
    }
}
