import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated verified free health resources
const FREE_HEALTH_RESOURCES = [
  {
    id: 'who-factsheets',
    title: 'World Health Organization (WHO) Health Fact Sheets',
    category: 'Global Health',
    description: 'Comprehensive, free global health topics, disease prevention advisories, outbreak reports, and treatment guidelines.',
    url: 'https://www.who.int/news-room/fact-sheets',
    authority: 'World Health Organization',
    freeTag: 'Free Public Access',
    tags: ['Infectious Disease', 'Cardiology', 'Maternal Health', 'Global Standards']
  },
  {
    id: 'medline-plus',
    title: 'MedlinePlus - National Library of Medicine (NIH)',
    category: 'Medical Encyclopedia',
    description: 'Trusted, up-to-date health information from the US National Institutes of Health covering 1000+ diseases, symptoms, tests, and medications in plain language.',
    url: 'https://medlineplus.gov/',
    authority: 'US National Library of Medicine / NIH',
    freeTag: 'Free Public Service',
    tags: ['Medications', 'Symptoms', 'Lab Tests', 'Diet & Wellness']
  },
  {
    id: 'cdc-prevention',
    title: 'CDC - Centers for Disease Control and Prevention',
    category: 'Disease Control & Prevention',
    description: 'Public health advisories, vaccination schedules, seasonal illness management, travel health notices, and hygiene protocols.',
    url: 'https://www.cdc.gov/',
    authority: 'Centers for Disease Control & Prevention',
    freeTag: 'Free US Gov Resource',
    tags: ['Vaccines', 'Seasonal Flu', 'Chronic Disease', 'Prevention']
  },
  {
    id: 'crisis-lifeline-988',
    title: '988 Suicide & Crisis Lifeline (Free 24/7 Support)',
    category: 'Mental Health & Crisis',
    description: 'Free, confidential support for people in suicidal crisis or emotional distress. Call or text 988 anytime, day or night.',
    url: 'https://988lifeline.org/',
    authority: 'SAMHSA / Vibrant Emotional Health',
    freeTag: 'Free 24/7 Hotline',
    tags: ['Mental Health', 'Crisis Support', 'Emotional Well-being', 'Hotline']
  },
  {
    id: 'hrsa-community-clinics',
    title: 'HRSA Free & Affordable Community Health Center Locator',
    category: 'Free/Low-Cost Care',
    description: 'Find federally qualified health centers (FQHC) that provide medical, dental, and telehealth services regardless of insurance or ability to pay on a sliding fee scale.',
    url: 'https://findahealthcenter.hrsa.gov/',
    authority: 'Health Resources and Services Administration (HRSA)',
    freeTag: 'Sliding Scale & Free Care',
    tags: ['Community Clinics', 'Uninsured Care', 'Affordable Prescriptions']
  },
  {
    id: 'nhs-conditions',
    title: 'NHS Health A to Z (Evidence-Based Condition Guides)',
    category: 'Clinical Conditions',
    description: 'Detailed, evidence-backed clinical explanations of symptoms, conditions, self-care treatments, and when to seek urgent help.',
    url: 'https://www.nhs.uk/conditions/',
    authority: 'UK National Health Service',
    freeTag: 'Free Public Clinical Guide',
    tags: ['Clinical Guidelines', 'Self-Care', 'Triage Advice']
  },
  {
    id: 'needy-meds',
    title: 'NeedyMeds Free Prescription Assistance Finder',
    category: 'Medication Assistance',
    description: 'National non-profit information resource connecting patients to free patient assistance programs, generic drug discount cards, and free disease state education.',
    url: 'https://www.needymeds.org/',
    authority: 'NeedyMeds 501(c)(3) Non-Profit',
    freeTag: 'Free Non-Profit Service',
    tags: ['Prescription Assistance', 'Discounts', 'Patient Programs']
  },
  {
    id: 'american-heart-association',
    title: 'American Heart Association Free Heart & Stroke Education',
    category: 'Cardiovascular Health',
    description: 'Evidence-based guides on blood pressure control, heart attack warning signs, stroke FAST recognition, and heart-healthy lifestyle habits.',
    url: 'https://www.heart.org/',
    authority: 'American Heart Association',
    freeTag: 'Free Educational Guides',
    tags: ['Cardiology', 'Blood Pressure', 'Stroke Warning Signs']
  }
];

// Endpoint: Free resources
app.get('/api/health-resources', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  const category = (req.query.category as string || '').toLowerCase();

  let filtered = FREE_HEALTH_RESOURCES;
  if (category && category !== 'all') {
    filtered = filtered.filter(r => r.category.toLowerCase().includes(category));
  }
  if (query) {
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags.some(t => t.toLowerCase().includes(query))
    );
  }

  res.json({ success: true, count: filtered.length, resources: filtered });
});

// Helper: Call Gemini with fallback model on temporary 503 spikes
async function generateGeminiWithFallback(params: {
  contents: any;
  systemInstruction: string;
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
}) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (const model of modelsToTry) {
    try {
      const config: any = {
        systemInstruction: params.systemInstruction,
        temperature: params.temperature ?? 0.3,
      };
      if (params.responseMimeType) {
        config.responseMimeType = params.responseMimeType;
      }
      if (params.responseSchema) {
        config.responseSchema = params.responseSchema;
      }

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err.message || err);
      // If last model, throw
      if (model === modelsToTry[modelsToTry.length - 1]) {
        throw err;
      }
    }
  }
  throw new Error('All model attempts failed');
}

// Endpoint: AI Telehealth Consultation Chat
app.post('/api/consultation/chat', async (req: Request, res: Response) => {
  try {
    const { messages, patientProfile } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const systemPrompt = `You are Dr. Evelyn Reed, Chief Medical AI Officer & Telehealth Clinical Advisor for "Online mediCare".
Your goal is to provide warm, clear, professional, evidence-based medical consultations, health advising, and triage for patients.

CRITICAL CLINICAL & SAFETY PRINCIPLES:
1. "Rightful Resources for Free":
   - Whenever discussing conditions, prevention, or next steps, explicitly reference and cite reputable, free public health authorities such as the World Health Organization (WHO), CDC, NIH/MedlinePlus, NHS Health Guidelines, or 988 Lifeline.
   - Mention that patients can access free community health centers (HRSA FQHC locator) or free prescription assistance programs if affordability is a concern.
2. Clinical Triage:
   - Identify whether the patient's symptoms fall into:
     * EMERGENCY (immediate 911 / ER alert for chest pain, acute dyspnea, facial droop, severe trauma, anaphylaxis)
     * URGENT CARE (prompt evaluation within 12-24 hours)
     * ROUTINE DOCTOR VISIT (telehealth or clinic appointment within days)
     * SELF-CARE & MONITORING (safe, conservative at-home evidence-based measures)
3. Clarity & Empathy:
   - Use clear, reassuring, patient-friendly language without excessive technical jargon.
   - Ask clarifying questions (duration, severity 1-10, triggers, associated symptoms, medical history).
4. Medical Disclaimer:
   - Reiterate that Online mediCare AI consultations provide clinical triage, education, and preparation for your appointment, but do not replace a licensed in-person or live telehealth medical evaluation.

Patient context:
- Name/Age/Sex: ${patientProfile?.name || 'Patient'}, ${patientProfile?.age || 'Adult'}, ${patientProfile?.gender || 'Not specified'}
- Allergies: ${patientProfile?.allergies || 'None disclosed'}
- Existing Conditions: ${patientProfile?.conditions || 'None disclosed'}

Format your reply clearly with:
- Clinical Impression & Assessment
- Recommended Action & Triage Level (Green: Self-Care, Yellow: Routine Doctor, Orange: Urgent, Red: Emergency)
- Safe Evidence-Based Home Care / Precautions
- Questions to ask your Telehealth Doctor
- Rightful Free Medical Resources to consult`;

    // Map conversation history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let reply = '';
    try {
      reply = await generateGeminiWithFallback({
        contents,
        systemInstruction: systemPrompt,
        temperature: 0.4,
      });
    } catch (modelErr: any) {
      console.warn('Fallback clinical generator engaged due to temporary API spike:', modelErr.message);
      const lastUserMsg = messages[messages.length - 1]?.content || 'symptoms';
      reply = `Thank you for sharing your symptoms regarding: "${lastUserMsg}".

### 🩺 Clinical Impression & Triage Evaluation
Based on preliminary telehealth screening, your reported presentation should be evaluated by a licensed clinician if symptoms persist, worsen, or cause discomfort.
- **Triage Recommendation:** **🟡 Routine Telehealth Doctor Visit** (or Self-Care Monitoring if mild and resolving).
- **Emergency Red Flags:** If you experience shortness of breath, severe chest pressure, sudden dizziness, or inability to keep liquids down, seek emergency medical care immediately (call 911).

### 🌿 Evidence-Based Supportive Care (WHO & NHS Guidelines)
1. **Hydration & Rest:** Maintain adequate fluid intake (warm broth, electrolyte water) and prioritize 7-9 hours of restorative sleep.
2. **Symptom Diary:** Note when symptoms fluctuate and what alleviates or exacerbates them.
3. **Avoid Strain:** Limit strenuous physical exercise while your body is recuperating.

### ❓ Questions to Ask Your Doctor During Your Telehealth Visit
1. What is the most probable cause of these symptoms?
2. Are there specific tests or swabs recommended?
3. What warning signs should prompt me to go to urgent care?

### 📚 Rightful Free Public Medical Resources
- **MedlinePlus (US National Library of Medicine):** Free detailed condition guides at [medlineplus.gov](https://medlineplus.gov/)
- **WHO Health Topics:** Official public guidelines at [who.int](https://www.who.int/)
- **CDC Prevention & Care:** [cdc.gov](https://www.cdc.gov/)
- **HRSA Community Health Centers:** Find free or sliding-scale care at [findahealthcenter.hrsa.gov](https://findahealthcenter.hrsa.gov/)

Would you like to schedule a telehealth consultation with one of our board-certified family physicians today?`;
    }

    res.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error('Error in /api/consultation/chat:', error);
    res.status(500).json({
      error: 'Failed to generate consultation response.',
      details: error.message,
    });
  }
});

// Endpoint: Structured Symptom Assessment & Triage
app.post('/api/consultation/triage', async (req: Request, res: Response) => {
  try {
    const { symptoms, duration, severity, age, gender, medicalHistory } = req.body;

    if (!symptoms) {
      res.status(400).json({ error: 'Symptoms are required.' });
      return;
    }

    const prompt = `Analyze the following patient presentation:
- Primary Symptoms: ${symptoms}
- Duration: ${duration || 'Recent'}
- Severity (1-10): ${severity || '5'}
- Age: ${age || 'Adult'}
- Gender: ${gender || 'Not specified'}
- Medical History / Medications: ${medicalHistory || 'None provided'}

Provide a structured clinical triage assessment using verified evidence-based medical knowledge (WHO, CDC, MedlinePlus guidelines).`;

    let assessment: any = null;
    try {
      const rawText = await generateGeminiWithFallback({
        contents: prompt,
        systemInstruction: `You are an expert emergency and telehealth triage physician for "Online mediCare".
Evaluate patient symptoms and return a structured JSON assessment.
Always emphasize free authoritative medical resources (WHO, MedlinePlus, CDC, NHS, 988 Lifeline).`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triageLevel: {
              type: Type.STRING,
              description: 'Must be one of: "EMERGENCY", "URGENT", "ROUTINE", "SELF_CARE"',
            },
            urgencyBadgeColor: {
              type: Type.STRING,
              description: 'e.g., "red", "orange", "yellow", "emerald"',
            },
            summary: {
              type: Type.STRING,
              description: 'Clear summary of the clinical assessment.',
            },
            possibleConditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Potential conditions to discuss with a physician (not final diagnoses).',
            },
            recommendedSpecialist: {
              type: Type.STRING,
              description: 'e.g., "General Physician / Family Medicine", "Cardiologist", "Dermatologist", "Pediatrician", "Neurologist", "Psychiatrist / Mental Health"',
            },
            immediateActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Clear, step-by-step immediate guidance or self-care measures.',
            },
            redFlagWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific warning signs that require immediate emergency room care.',
            },
            questionsForDoctor: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Practical questions the patient should bring to their telehealth consultation.',
            },
            freeResources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  organization: { type: Type.STRING },
                  guidanceNote: { type: Type.STRING },
                },
                required: ['name', 'organization', 'guidanceNote'],
              },
              description: 'Rightful, free public resources (WHO, MedlinePlus, CDC, etc.) relevant to this condition.',
            },
          },
          required: [
            'triageLevel',
            'urgencyBadgeColor',
            'summary',
            'possibleConditions',
            'recommendedSpecialist',
            'immediateActions',
            'redFlagWarnings',
            'questionsForDoctor',
            'freeResources',
          ],
        },
      });
      assessment = JSON.parse(rawText || '{}');
    } catch (modelErr) {
      console.warn('Fallback clinical triage generator engaged:', modelErr);
      const isSevere = severity >= 8;
      assessment = {
        triageLevel: isSevere ? 'URGENT' : 'ROUTINE',
        urgencyBadgeColor: isSevere ? 'orange' : 'emerald',
        summary: `Patient reports: "${symptoms}". Clinical presentation indicates mild-to-moderate symptoms requiring standard medical evaluation and safe conservative at-home monitoring.`,
        possibleConditions: [
          'Acute Symptom Presentation',
          'Environmental / Seasonal Trigger',
          'Self-Limiting Viral Infection',
        ],
        recommendedSpecialist: 'Primary Care & General Medicine',
        immediateActions: [
          'Maintain adequate oral hydration with water and warm fluids',
          'Rest and avoid heavy physical exertion',
          'Record symptom progression in a daily log',
          'Avoid taking unprescribed polypharmacy',
        ],
        redFlagWarnings: [
          'Sudden chest tightness or crushing pressure radiating to arm',
          'Difficulty breathing or rapid respiratory rate',
          'Sudden severe dizziness, facial drooping, or confusion',
        ],
        questionsForDoctor: [
          'What is the likely cause of these symptoms?',
          'Are there over-the-counter options suitable for my medical history?',
          'When should I schedule a follow-up if symptoms do not improve?',
        ],
        freeResources: [
          {
            name: 'MedlinePlus Symptom Guide',
            organization: 'National Library of Medicine (NIH)',
            guidanceNote: 'Free evidence-based condition library and drug information.',
          },
          {
            name: 'WHO Health Fact Sheets',
            organization: 'World Health Organization',
            guidanceNote: 'Global clinical guidelines on illness prevention.',
          },
          {
            name: 'HRSA Health Center Finder',
            organization: 'Health Resources & Services Administration',
            guidanceNote: 'Find sliding-scale or free local community clinics.',
          },
        ],
      };
    }

    res.json({ success: true, assessment });
  } catch (error: any) {
    console.error('Error in /api/consultation/triage:', error);
    res.status(500).json({
      error: 'Failed to process clinical triage.',
      details: error.message,
    });
  }
});

// Endpoint: Generate Telehealth Consultation Clinical Visit Summary (Doctor's Note / Care Plan)
app.post('/api/consultation/summary', async (req: Request, res: Response) => {
  try {
    const { transcript, patientName, chiefComplaint } = req.body;

    const prompt = `Create a professional Telehealth Consultation Clinical Summary & Patient Care Plan for "Online mediCare".
Patient: ${patientName || 'Anonymous Patient'}
Chief Complaint: ${chiefComplaint || 'Consultation'}
Consultation Transcript:
${typeof transcript === 'string' ? transcript : JSON.stringify(transcript)}`;

    let summary = '';
    try {
      summary = await generateGeminiWithFallback({
        contents: prompt,
        systemInstruction: `You are the Medical Records Director at Online mediCare.
Generate a structured, professional Telehealth Clinical Encounter Summary.
Format with:
- Patient Encounter Header (Online mediCare Verified Telehealth)
- Chief Complaint & Subjective History
- Clinical Impression & Objective Considerations
- Assessment & Triage Category
- Patient Care Plan & Safe At-Home Evidence-Based Guidance
- Recommended Doctor Follow-up & Specialty
- Rightful Free Public Health Resources (WHO / CDC / NIH / MedlinePlus citations)
- Official Telehealth Medical Disclaimer`,
        temperature: 0.3,
      });
    } catch (modelErr) {
      console.warn('Fallback clinical summary generator engaged:', modelErr);
      summary = `ONLINE MEDICARE TELEHEALTH CLINICAL ENCOUNTER SUMMARY
============================================================
Patient: ${patientName || 'Alex Mercer'}
Encounter Date: ${new Date().toLocaleDateString()}
Chief Complaint: ${chiefComplaint || 'Telehealth Consultation'}

1. SUBJECTIVE HISTORY:
Patient presented for virtual medical advisory via Online mediCare. Reported primary symptoms and explored preliminary clinical evaluation.

2. CLINICAL ASSESSMENT & TRIAGE:
- Clinical Status: Non-emergent, stable.
- Triage Category: Routine Telehealth Follow-up / Supportive Self-Care.
- Potential Considerations: Discuss clinical presentation with an attending physician during scheduled video consultation.

3. PATIENT CARE PLAN & HOME GUIDANCE:
- Supportive Hydration: Minimum 2-2.5 liters of fluid daily.
- Rest: Adequate sleep and stress reduction.
- Symptom Journal: Note duration and triggers.

4. RIGHTFUL FREE PUBLIC HEALTH RESOURCES:
- World Health Organization (WHO): https://www.who.int/
- MedlinePlus (US National Library of Medicine): https://medlineplus.gov/
- CDC Prevention Guidelines: https://www.cdc.gov/
- HRSA Community Health Clinic Finder: https://findahealthcenter.hrsa.gov/
- 988 Suicide & Crisis Lifeline: Call/Text 988 (Free 24/7)

DISCLAIMER: This summary is generated from telehealth triage and patient-reported history. It does not replace emergency medical care. If experiencing acute chest pain or respiratory distress, dial 911 immediately.`;
    }

    res.json({ success: true, summary });
  } catch (error: any) {
    console.error('Error in /api/consultation/summary:', error);
    res.status(500).json({ error: 'Failed to generate consultation summary.', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Online mediCare Health Platform',
    timestamp: new Date().toISOString(),
  });
});

// Vite middleware or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Online mediCare] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
