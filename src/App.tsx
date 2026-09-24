import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmergencyBanner } from './components/EmergencyBanner';
import { AiConsultationRoom } from './components/AiConsultationRoom';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { TelehealthRoom } from './components/TelehealthRoom';
import { FreeHealthResources } from './components/FreeHealthResources';
import { MyAppointments } from './components/MyAppointments';
import { ClinicalSummaryModal } from './components/ClinicalSummaryModal';
import { Appointment } from './types';
import { DOCTORS } from './data/doctors';

const STORAGE_KEY = 'online_medicare_appointments_v1';

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-839201',
    doctorId: 'doc-1',
    doctorName: 'Dr. Evelyn Reed, MD',
    doctorSpecialty: 'Primary Care & General Medicine',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    patientName: 'Alex Mercer',
    patientEmail: 'alex.mercer@example.com',
    patientPhone: '(555) 234-8910',
    patientAge: '34',
    patientGender: 'Non-binary',
    date: '2026-09-25',
    timeSlot: '10:30 AM',
    type: 'video',
    status: 'confirmed',
    symptoms: 'Follow-up regarding seasonal allergies, mild cough, and blood pressure monitoring.',
    createdAt: '2026-09-24T08:00:00Z',
  },
  {
    id: 'APT-410982',
    doctorId: 'doc-4',
    doctorName: 'Dr. Priya Sharma, MD',
    doctorSpecialty: 'Dermatology & Skin',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839846-993630f9a263?auto=format&fit=crop&q=80&w=300',
    patientName: 'Alex Mercer',
    patientEmail: 'alex.mercer@example.com',
    patientPhone: '(555) 234-8910',
    patientAge: '34',
    patientGender: 'Non-binary',
    date: '2026-09-18',
    timeSlot: '01:30 PM',
    type: 'video',
    status: 'completed',
    symptoms: 'Mild localized eczema rash on forearms triggered by dry climate.',
    createdAt: '2026-09-18T10:00:00Z',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'consultation' | 'schedule' | 'telehealth' | 'resources' | 'appointments'
  >('consultation');

  // Appointments state with LocalStorage persistence
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse appointments from localStorage:', e);
    }
    return INITIAL_APPOINTMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointments to localStorage:', e);
    }
  }, [appointments]);

  // Prefill states for seamless handoff between AI Consultation and Scheduling
  const [prefilledSymptoms, setPrefilledSymptoms] = useState<string>('');
  const [prefilledSpecialty, setPrefilledSpecialty] = useState<string>('');

  // Active appointment for Telehealth Video Room
  const [activeTelehealthAppointment, setActiveTelehealthAppointment] = useState<Appointment | null>(
    null
  );

  // Clinical Summary Modal state
  const [summaryModalContent, setSummaryModalContent] = useState<string | null>(null);

  // Handle scheduling handoff from AI Consultation
  const handleScheduleFromConsultation = (symptoms?: string, specialty?: string) => {
    if (symptoms) setPrefilledSymptoms(symptoms);
    if (specialty) setPrefilledSpecialty(specialty);
    setActiveTab('schedule');
  };

  // Handle starting a live telehealth video call
  const handleStartTelehealthCall = (doctorName?: string) => {
    const matchedDoctor = DOCTORS.find((d) => d.name === doctorName) || DOCTORS[0];
    const instantAppointment: Appointment = {
      id: `LIVE-${Math.floor(100000 + Math.random() * 900000)}`,
      doctorId: matchedDoctor.id,
      doctorName: matchedDoctor.name,
      doctorSpecialty: matchedDoctor.specialty,
      doctorAvatar: matchedDoctor.avatar,
      patientName: 'Alex Mercer',
      patientEmail: 'alex.mercer@example.com',
      patientPhone: '(555) 234-8910',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Now (Immediate Telehealth)',
      type: 'video',
      status: 'in_progress',
      symptoms: prefilledSymptoms || 'Realtime AI Telehealth Clinical Consultation',
      createdAt: new Date().toISOString(),
    };

    setActiveTelehealthAppointment(instantAppointment);
    setActiveTab('telehealth');
  };

  // Enter telehealth from an existing appointment
  const handleEnterTelehealthRoom = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId) || appointments[0];
    setActiveTelehealthAppointment(apt);
    setActiveTab('telehealth');
  };

  // Add new appointment
  const handleAppointmentBooked = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  // Cancel appointment
  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Emergency Notice */}
      <EmergencyBanner />

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appointmentsCount={appointments.filter((a) => a.status === 'confirmed').length}
        onQuickBook={() => {
          setPrefilledSymptoms('');
          setPrefilledSpecialty('');
          setActiveTab('schedule');
        }}
      />

      {/* Main Body Content based on active tab */}
      <main className="flex-1">
        {activeTab === 'consultation' && (
          <AiConsultationRoom
            onScheduleAppointment={handleScheduleFromConsultation}
            onStartTelehealthCall={handleStartTelehealthCall}
            onViewSummary={(summary) => setSummaryModalContent(summary)}
          />
        )}

        {activeTab === 'schedule' && (
          <AppointmentScheduler
            onAppointmentBooked={handleAppointmentBooked}
            prefilledSymptoms={prefilledSymptoms}
            prefilledSpecialty={prefilledSpecialty}
            onEnterTelehealthRoom={handleEnterTelehealthRoom}
          />
        )}

        {activeTab === 'telehealth' && (
          <TelehealthRoom
            appointment={activeTelehealthAppointment}
            onEndCall={() => {
              setActiveTab('appointments');
            }}
            onGenerateSummary={() => {
              const summaryText = `ONLINE MEDICARE TELEHEALTH CLINICAL ENCOUNTER SUMMARY\n=======================================================\nPatient: Alex Mercer | Date: ${new Date().toLocaleDateString()}\nClinician: ${
                activeTelehealthAppointment?.doctorName || 'Dr. Evelyn Reed, MD'
              }\nSpecialty: ${
                activeTelehealthAppointment?.doctorSpecialty || 'Primary Care & Telehealth Chief'
              }\n\n1. SUBJECTIVE & CHIEF COMPLAINT:\n${
                activeTelehealthAppointment?.symptoms || 'Patient presented for remote telehealth evaluation.'
              }\n\n2. OBJECTIVE TELEMETRY LOGGED:\n- Heart Rate: 74 BPM (Normal sinus rhythm)\n- Blood Pressure: 118/76 mmHg (Normotensive)\n- Oxygen Saturation: 99% on room air\n- Temperature: 98.6°F (Afebrile)\n\n3. ASSESSMENT & CLINICAL TRIAGE:\n- Condition stable; symptoms are consistent with mild non-emergent presentation.\n- Follow-up care recommended within 7-14 days if symptoms persist.\n\n4. PATIENT CARE PLAN & HOME MEASURES:\n- Adequate oral hydration (2.5L water daily).\n- Rest and avoid physical overexertion.\n- Maintain symptom tracking journal.\n\n5. RIGHTFUL FREE AUTHORITATIVE RESOURCES:\n- World Health Organization (WHO) Health Guidance: https://www.who.int/\n- MedlinePlus National Library of Medicine: https://medlineplus.gov/\n- HRSA Free Community Health Clinic Locator: https://findahealthcenter.hrsa.gov/\n- 988 Suicide & Crisis Lifeline (Free 24/7): Dial 988\n\nDISCLAIMER: Online mediCare telehealth documentation is provided for clinical continuity. For medical emergencies, always dial 911 immediately.`;
              setSummaryModalContent(summaryText);
            }}
          />
        )}

        {activeTab === 'resources' && <FreeHealthResources />}

        {activeTab === 'appointments' && (
          <MyAppointments
            appointments={appointments}
            onCancelAppointment={handleCancelAppointment}
            onJoinTelehealth={handleEnterTelehealthRoom}
            onScheduleNew={() => setActiveTab('schedule')}
            onViewSummary={(summary) => setSummaryModalContent(summary)}
          />
        )}
      </main>

      {/* Clinical Summary View / Print Modal */}
      {summaryModalContent && (
        <ClinicalSummaryModal
          summaryText={summaryModalContent}
          onClose={() => setSummaryModalContent(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 no-print text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <span className="text-white font-extrabold text-lg font-heading block">
                Online <span className="text-teal-400">mediCare</span>
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Accessible, high-fidelity telehealth appointments and AI-powered clinical triage grounded in free, rightful public health resources.
              </p>
            </div>

            <div>
              <span className="text-white font-bold text-xs uppercase tracking-wider block mb-3">
                Clinical Services
              </span>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('consultation')} className="hover:text-white cursor-pointer">
                    24/7 AI Doctor Consultation
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('schedule')} className="hover:text-white cursor-pointer">
                    Find Board-Certified Specialists
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('telehealth')} className="hover:text-white cursor-pointer">
                    Live Video Consultation Room
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('appointments')} className="hover:text-white cursor-pointer">
                    Medical Records & Care Plans
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-white font-bold text-xs uppercase tracking-wider block mb-3">
                Rightful Free Resources
              </span>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="https://www.who.int/" target="_blank" rel="noreferrer" className="hover:text-white">
                    World Health Organization (WHO)
                  </a>
                </li>
                <li>
                  <a href="https://medlineplus.gov/" target="_blank" rel="noreferrer" className="hover:text-white">
                    MedlinePlus (US NIH)
                  </a>
                </li>
                <li>
                  <a href="https://www.cdc.gov/" target="_blank" rel="noreferrer" className="hover:text-white">
                    Centers for Disease Control (CDC)
                  </a>
                </li>
                <li>
                  <a href="https://988lifeline.org/" target="_blank" rel="noreferrer" className="hover:text-white">
                    988 Suicide & Crisis Lifeline
                  </a>
                </li>
                <li>
                  <a href="https://findahealthcenter.hrsa.gov/" target="_blank" rel="noreferrer" className="hover:text-white">
                    HRSA Free Community Health Centers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-white font-bold text-xs uppercase tracking-wider block mb-3">
                Emergency & Safety
              </span>
              <p className="text-[11px] leading-relaxed text-slate-400 mb-2">
                If you have an immediate medical emergency, please dial <strong>911</strong> or visit your nearest hospital emergency department immediately.
              </p>
              <div className="flex gap-2">
                <a
                  href="tel:911"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                >
                  Call 911
                </a>
                <a
                  href="tel:988"
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs"
                >
                  Call 988 Lifeline
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <span>© {new Date().getFullYear()} Online mediCare. Free Health Information & Telehealth Platform.</span>
            <span>HIPAA-Compliant Encrypted Channel • Non-Commercial Medical Knowledge Access</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
