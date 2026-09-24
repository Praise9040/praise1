import React from 'react';
import {
  Activity,
  CalendarCheck,
  Video,
  BookOpen,
  ClipboardList,
  Sparkles,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'consultation' | 'schedule' | 'telehealth' | 'resources' | 'appointments';
  setActiveTab: (tab: 'consultation' | 'schedule' | 'telehealth' | 'resources' | 'appointments') => void;
  appointmentsCount: number;
  onQuickBook: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  appointmentsCount,
  onQuickBook,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('consultation')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
                  Online <span className="text-teal-600">mediCare</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60 uppercase tracking-wider">
                  <ShieldCheck className="w-2.5 h-2.5 text-teal-600" /> Free Telehealth
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Clinical Scheduling & AI Medical Advisory
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => setActiveTab('consultation')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'consultation'
                  ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span>AI Doctor & Triage</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                24/7 Free
              </span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-teal-600" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => setActiveTab('telehealth')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'telehealth'
                  ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Video className="w-4 h-4 text-teal-600" />
              <span>Virtual Room</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'resources'
                  ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Free Health Resources</span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">
                WHO/CDC
              </span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-teal-50 text-teal-700 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-teal-600" />
              <span>My Records</span>
              {appointmentsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                  {appointmentsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onQuickBook}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition transform active:scale-98 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Schedule Visit</span>
            </button>

            <button
              onClick={() => setActiveTab('consultation')}
              className="inline-flex sm:hidden items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Doctor</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-100 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => setActiveTab('consultation')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'consultation' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'
            }`}
          >
            🩺 AI Doctor
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'
            }`}
          >
            📅 Doctors
          </button>
          <button
            onClick={() => setActiveTab('telehealth')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'telehealth' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'
            }`}
          >
            📹 Telehealth
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'resources' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'
            }`}
          >
            📚 Resources
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'appointments' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'
            }`}
          >
            📋 Records ({appointmentsCount})
          </button>
        </div>
      </div>
    </header>
  );
};
