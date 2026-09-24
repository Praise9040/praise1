export type TriageUrgency = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'SELF_CARE';

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  avatar: string;
  bio: string;
  languages: string[];
  hospitalAffiliation: string;
  consultationFee: string;
  isCommunityFreeEligible: boolean;
  isOnlineNow: boolean;
  availableDays: string[];
  timeSlots: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge?: string;
  patientGender?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  type: 'video' | 'audio' | 'in_person';
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  symptoms: string;
  clinicalNotes?: string;
  summaryId?: string;
  createdAt: string;
}

export interface ConsultationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  triageLevel?: TriageUrgency;
  resourcesCited?: Array<{
    name: string;
    organization: string;
    guidanceNote?: string;
    url?: string;
  }>;
}

export interface StructuredTriageResult {
  triageLevel: TriageUrgency;
  urgencyBadgeColor: string;
  summary: string;
  possibleConditions: string[];
  recommendedSpecialist: string;
  immediateActions: string[];
  redFlagWarnings: string[];
  questionsForDoctor: string[];
  freeResources: Array<{
    name: string;
    organization: string;
    guidanceNote: string;
  }>;
}

export interface HealthResource {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  authority: string;
  freeTag: string;
  tags: string[];
}

export interface PatientProfile {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  emergencyContact: string;
}
