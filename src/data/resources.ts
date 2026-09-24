import { HealthResource } from '../types';

export const HEALTH_RESOURCES: HealthResource[] = [
  {
    id: 'who-factsheets',
    title: 'World Health Organization (WHO) Health Fact Sheets',
    category: 'Global Guidelines',
    description: 'Gold-standard global health topics, communicable and non-communicable disease guidance, outbreak advisories, and evidence-based prevention guidelines.',
    url: 'https://www.who.int/news-room/fact-sheets',
    authority: 'World Health Organization',
    freeTag: 'Free Worldwide Access',
    tags: ['Infectious Disease', 'Cardiovascular', 'Maternal Health', 'Global Standards']
  },
  {
    id: 'medline-plus',
    title: 'MedlinePlus - National Library of Medicine (NIH)',
    category: 'Medical Encyclopedia',
    description: 'Trusted, up-to-date health information from the US National Institutes of Health covering 1,000+ diseases, symptoms, tests, and medications in plain language.',
    url: 'https://medlineplus.gov/',
    authority: 'US National Library of Medicine / NIH',
    freeTag: 'Free Public Service',
    tags: ['Medications', 'Symptoms', 'Lab Tests', 'Diet & Wellness']
  },
  {
    id: 'cdc-prevention',
    title: 'CDC - Centers for Disease Control and Prevention',
    category: 'Public Health & Disease',
    description: 'Official clinical advisories, seasonal illness guidelines, travel immunization updates, and preventative screening recommendations.',
    url: 'https://www.cdc.gov/',
    authority: 'Centers for Disease Control & Prevention',
    freeTag: 'Free US Gov Resource',
    tags: ['Vaccines', 'Seasonal Flu', 'Chronic Disease', 'Prevention']
  },
  {
    id: 'crisis-lifeline-988',
    title: '988 Suicide & Crisis Lifeline (Free 24/7 Support)',
    category: 'Mental Health & Crisis',
    description: 'Free, confidential support for people in suicidal crisis or emotional distress. Call or text 988 anytime, day or night, anywhere in the United States and Canada.',
    url: 'https://988lifeline.org/',
    authority: 'SAMHSA / Vibrant Emotional Health',
    freeTag: 'Free 24/7 Hotline',
    tags: ['Mental Health', 'Crisis Support', 'Emotional Well-being', 'Hotline']
  },
  {
    id: 'hrsa-community-clinics',
    title: 'HRSA Free & Affordable Community Health Center Locator',
    category: 'Free & Sliding Scale Clinics',
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
    description: 'Detailed, evidence-backed clinical explanations of symptoms, conditions, self-care treatments, and when to seek urgent hospital help.',
    url: 'https://www.nhs.uk/conditions/',
    authority: 'UK National Health Service',
    freeTag: 'Free Public Clinical Guide',
    tags: ['Clinical Guidelines', 'Self-Care', 'Triage Advice']
  },
  {
    id: 'needy-meds',
    title: 'NeedyMeds Free Prescription Assistance Finder',
    category: 'Prescription Assistance',
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
    description: 'Evidence-based guides on blood pressure control, heart attack warning signs, stroke F.A.S.T. recognition, and heart-healthy lifestyle habits.',
    url: 'https://www.heart.org/',
    authority: 'American Heart Association',
    freeTag: 'Free Educational Guides',
    tags: ['Cardiology', 'Blood Pressure', 'Stroke Warning Signs']
  },
  {
    id: 'diabetes-association',
    title: 'American Diabetes Association Free Wellness Resources',
    category: 'Chronic Care & Diabetes',
    description: 'Evidence-based guides for blood glucose tracking, pre-diabetes risk assessments, dietary nutrition plans, and foot care guidance.',
    url: 'https://diabetes.org/',
    authority: 'American Diabetes Association',
    freeTag: 'Free Educational Tools',
    tags: ['Diabetes', 'Blood Sugar', 'Nutrition', 'Endocrinology']
  }
];
