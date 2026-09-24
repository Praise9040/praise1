import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  Star,
  Check,
  Search,
  Filter,
  User,
  ShieldCheck,
  ChevronRight,
  CalendarCheck,
  X,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { Doctor, Appointment } from '../types';
import { DOCTORS, SPECIALTIES } from '../data/doctors';

interface AppointmentSchedulerProps {
  onAppointmentBooked: (appointment: Appointment) => void;
  prefilledSymptoms?: string;
  prefilledSpecialty?: string;
  onEnterTelehealthRoom: (appointmentId: string) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  onAppointmentBooked,
  prefilledSymptoms = '',
  prefilledSpecialty = '',
  onEnterTelehealthRoom,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    prefilledSpecialty || 'All Specialties'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFreeCommunity, setOnlyFreeCommunity] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Booking Modal State
  const [bookingType, setBookingType] = useState<'video' | 'audio' | 'in_person'>('video');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-25');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('32');
  const [patientGender, setPatientGender] = useState('Female');
  const [visitSymptoms, setVisitSymptoms] = useState(prefilledSymptoms || '');
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Generate next 7 dates for easy selection
  const upcomingDates = [
    { label: 'Today', date: '2026-09-24' },
    { label: 'Tomorrow', date: '2026-09-25' },
    { label: 'Friday', date: '2026-09-26' },
    { label: 'Saturday', date: '2026-09-27' },
    { label: 'Monday', date: '2026-09-29' },
    { label: 'Tuesday', date: '2026-09-30' },
  ];

  // Filter doctors
  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesSpecialty =
      selectedSpecialty === 'All Specialties' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
      selectedSpecialty.toLowerCase().includes(doc.specialty.toLowerCase());

    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospitalAffiliation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFree = !onlyFreeCommunity || doc.isCommunityFreeEligible;

    return matchesSpecialty && matchesSearch && matchesFree;
  });

  const handleOpenBooking = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedTime(doc.timeSlots[0] || '10:00 AM');
    if (!visitSymptoms && prefilledSymptoms) {
      setVisitSymptoms(prefilledSymptoms);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !patientName || !patientEmail) return;

    const newAppointment: Appointment = {
      id: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialty,
      doctorAvatar: selectedDoctor.avatar,
      patientName,
      patientEmail,
      patientPhone: patientPhone || '(555) 019-2831',
      patientAge,
      patientGender,
      date: selectedDate,
      timeSlot: selectedTime,
      type: bookingType,
      status: 'confirmed',
      symptoms: visitSymptoms || 'Routine Clinical Consultation',
      createdAt: new Date().toISOString(),
    };

    onAppointmentBooked(newAppointment);
    setConfirmedBooking(newAppointment);
  };

  const downloadCalendarIcs = (apt: Appointment) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Online mediCare//Telehealth Appointment//EN
BEGIN:VEVENT
SUMMARY:Online mediCare Telehealth: ${apt.doctorName}
DESCRIPTION:Telehealth consultation with ${apt.doctorName} (${apt.doctorSpecialty}). Symptoms: ${apt.symptoms}
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
      
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200 mb-2">
              <CalendarCheck className="w-3.5 h-3.5" />
              Verified Board-Certified Specialists
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Online Medical Appointment Scheduling
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
              Book same-day or future telehealth video consultations and in-person clinic visits. All community members are eligible for free or grant-assisted care.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyFreeCommunity(!onlyFreeCommunity)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                onlyFreeCommunity
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Free / Community Access Only
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, condition, or hospital..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-teal-500 focus:outline-none shadow-xs"
            />
          </div>

          <div className="sm:col-span-6 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-teal-500 focus:outline-none shadow-xs font-medium text-slate-700"
            >
              {SPECIALTIES.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            <div className="p-5">
              {/* Doctor Head */}
              <div className="flex items-start gap-4 mb-3.5">
                <div className="relative shrink-0">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-200"
                  />
                  {doc.isOnlineNow && (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-md ring-2 ring-white">
                      Online
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-base truncate font-heading">
                      {doc.name}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-teal-600 truncate">{doc.specialty}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {doc.hospitalAffiliation}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="flex items-center text-amber-500 font-bold text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                      {doc.rating} ({doc.reviewCount})
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 text-[11px]">
                      {doc.experienceYears}+ yrs exp
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                {doc.bio}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {doc.isCommunityFreeEligible && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                    Free Community Tier
                  </span>
                )}
                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-md text-[10px] font-medium">
                  HD Video Telehealth
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px]">
                  {doc.languages.join(', ')}
                </span>
              </div>

              {/* Time Slots Preview */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Next Available Slots:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {doc.timeSlots.slice(0, 3).map((slot, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-medium"
                    >
                      {slot}
                    </span>
                  ))}
                  {doc.timeSlots.length > 3 && (
                    <span className="text-[10px] text-teal-600 font-semibold self-center">
                      +{doc.timeSlots.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Book Button */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                <span className="text-xs font-bold text-slate-800">
                  {doc.consultationFee.includes('Free') ? (
                    <span className="text-emerald-700 font-extrabold">100% Free Access</span>
                  ) : (
                    doc.consultationFee
                  )}
                </span>
              </div>

              <button
                onClick={() => handleOpenBooking(doc)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Book Visit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-500 text-sm">No doctors match your current search criteria.</p>
          <button
            onClick={() => {
              setSelectedSpecialty('All Specialties');
              setSearchQuery('');
              setOnlyFreeCommunity(false);
            }}
            className="mt-3 px-4 py-2 bg-teal-50 text-teal-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedDoctor && !confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctor.avatar}
                  alt={selectedDoctor.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">
                    Schedule with {selectedDoctor.name}
                  </h3>
                  <p className="text-xs text-teal-600 font-semibold">{selectedDoctor.specialty}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="py-4 space-y-4">
              {/* Consultation Format */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Consultation Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType('video')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      bookingType === 'video'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-800 font-bold ring-1 ring-teal-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 text-xs'
                    }`}
                  >
                    <Video className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                    <span className="text-xs block">Video Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('audio')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      bookingType === 'audio'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-800 font-bold ring-1 ring-teal-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 text-xs'
                    }`}
                  >
                    <Phone className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                    <span className="text-xs block">Audio Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('in_person')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      bookingType === 'in_person'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-800 font-bold ring-1 ring-teal-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 text-xs'
                    }`}
                  >
                    <Building className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                    <span className="text-xs block">In-Person</span>
                  </button>
                </div>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Appointment Date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {upcomingDates.map((item) => (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => setSelectedDate(item.date)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        selectedDate === item.date
                          ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold ring-1 ring-teal-500'
                          : 'border-slate-200 bg-slate-50 text-slate-600 text-xs'
                      }`}
                    >
                      <span className="text-[10px] block text-slate-400">{item.label}</span>
                      <span className="text-xs font-bold block">{item.date.slice(5)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Available Time Slot
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedDoctor.timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`p-2 rounded-xl border text-center text-xs transition cursor-pointer ${
                        selectedTime === slot
                          ? 'border-teal-500 bg-teal-600 text-white font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="(555) 019-2831"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-binary</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Symptoms / Chief Complaint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Consultation / Symptoms
                </label>
                <textarea
                  rows={2}
                  value={visitSymptoms}
                  onChange={(e) => setVisitSymptoms(e.target.value)}
                  placeholder="Describe your primary reason for booking or questions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Free Care notice */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Zero-Cost Guarantee:</strong> This telehealth consultation is covered under Online mediCare's Community Health Initiative.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Confirm & Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-teal-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest block mb-1">
              Appointment Confirmed
            </span>
            <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
              You're Scheduled with {confirmedBooking.doctorName}
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Appointment ID:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-bold text-slate-800">
                  {confirmedBooking.date} at {confirmedBooking.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="font-bold text-teal-700 uppercase">
                  {confirmedBooking.type} Telehealth
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.patientName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onEnterTelehealthRoom(confirmedBooking.id);
                  setConfirmedBooking(null);
                  setSelectedDoctor(null);
                }}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                Enter Virtual Telehealth Room Now
              </button>

              <button
                onClick={() => downloadCalendarIcs(confirmedBooking)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                Add to Calendar (.ics)
              </button>

              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setSelectedDoctor(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 mt-2 font-medium"
              >
                Close & Return to Doctors
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
