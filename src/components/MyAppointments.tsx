import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Shield,
  Download,
  CalendarCheck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Appointment, PatientProfile } from '../types';

interface MyAppointmentsProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
  onJoinTelehealth: (id: string) => void;
  onScheduleNew: () => void;
  onViewSummary: (summaryText: string) => void;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({
  appointments,
  onCancelAppointment,
  onJoinTelehealth,
  onScheduleNew,
  onViewSummary,
}) => {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed'>('all');

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'confirmed') return apt.status === 'confirmed';
    if (filter === 'completed') return apt.status === 'completed';
    return true;
  });

  const downloadCalendarIcs = (apt: Appointment) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Online mediCare//Telehealth//EN
BEGIN:VEVENT
SUMMARY:Telehealth Appointment: ${apt.doctorName}
DESCRIPTION:Online mediCare consultation with ${apt.doctorName} (${apt.doctorSpecialty}). Symptoms: ${apt.symptoms}
DTSTART:20260925T140000Z
DTEND:20260925T143000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointment-${apt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            My Appointments & Medical Records
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage your booked consultations, join encrypted telehealth video visits, and download clinical encounter summaries.
          </p>
        </div>

        <button
          onClick={onScheduleNew}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-2 self-start cursor-pointer"
        >
          <CalendarCheck className="w-4 h-4" />
          Schedule New Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer ${
            filter === 'all' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Records ({appointments.length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer ${
            filter === 'confirmed' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Upcoming / Confirmed
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer ${
            filter === 'completed' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Completed Visits
        </button>
      </div>

      {/* Appointment Cards List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <img
                  src={apt.doctorAvatar}
                  alt={apt.doctorName}
                  className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                />

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base font-heading">
                      {apt.doctorName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : apt.status === 'completed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md uppercase">
                      {apt.type} Telehealth
                    </span>
                  </div>

                  <p className="text-xs text-teal-600 font-semibold">{apt.doctorSpecialty}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.timeSlot}
                    </span>
                    <span className="text-slate-400">Ref: #{apt.id}</span>
                  </div>

                  {apt.symptoms && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong className="text-slate-700">Chief Complaint:</strong> {apt.symptoms}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                {apt.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => onJoinTelehealth(apt.id)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Video Room
                    </button>

                    <button
                      onClick={() => downloadCalendarIcs(apt)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
                      title="Download Calendar (.ics) invitation"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onCancelAppointment(apt.id)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {apt.status === 'completed' && (
                  <button
                    onClick={() =>
                      onViewSummary(
                        `ONLINE MEDICARE TELEHEALTH CLINICAL SUMMARY\nDoctor: ${apt.doctorName} (${apt.doctorSpecialty})\nDate: ${apt.date}\nChief Complaint: ${apt.symptoms}\nAssessment: Condition stabilized. Follow-up recommended in 2 weeks.\nFree Resources: MedlinePlus and CDC guidelines provided.`
                      )
                    }
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    View Care Plan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
            No Scheduled Appointments Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            You don't have any appointments matching this view. Book a free consultation with our verified doctors or consult Dr. Evelyn Reed.
          </p>
          <button
            onClick={onScheduleNew}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Find & Book a Doctor Now
          </button>
        </div>
      )}

      {/* Patient Health Privacy Card */}
      <div className="mt-10 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-3">
        <Shield className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 block mb-0.5">
            Your Health Data & Telehealth Privacy Protection
          </span>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Online mediCare encrypts all patient consultations and appointment records end-to-end. We never sell medical data to third parties. If you need copies sent directly to your primary care clinic, you can download or print your clinical encounter summary at any time.
          </p>
        </div>
      </div>
    </div>
  );
};
