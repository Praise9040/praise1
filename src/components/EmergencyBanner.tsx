import React, { useState } from 'react';
import { AlertTriangle, Phone, ShieldAlert, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top compact banner */}
      <div className="bg-rose-50 border-b border-rose-200 text-rose-900 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between no-print">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <span className="font-semibold text-rose-800">Medical Emergency Notice:</span>
            <span className="hidden md:inline text-rose-700">
              If you have chest pain, severe shortness of breath, sudden numbness, or life-threatening symptoms, dial 911 (or local emergency) immediately.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsOpen(true)}
              className="underline text-rose-700 hover:text-rose-900 font-semibold cursor-pointer text-xs"
            >
              Emergency Warning Signs
            </button>
            <a
              href="tel:911"
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-md text-xs font-bold transition shadow-xs"
            >
              <Phone className="w-3 h-3" />
              Call 911
            </a>
            <a
              href="tel:988"
              className="hidden sm:inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-2.5 py-1 rounded-md text-xs font-bold transition shadow-xs"
              title="988 Suicide & Crisis Lifeline (Free 24/7)"
            >
              Call/Text 988
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-bold text-lg text-slate-900 font-heading">
                  When to Seek Immediate Emergency Care
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-sm text-slate-700">
              <p className="font-medium text-slate-800">
                Online mediCare AI Telehealth is for non-emergent triage and scheduled appointments. Do NOT wait for a telehealth consultation if you experience:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
                  <span className="font-bold text-rose-800 block mb-1">Heart & Lungs</span>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-900">
                    <li>Crushing chest pressure</li>
                    <li>Pain radiating to arm or jaw</li>
                    <li>Severe, sudden shortness of breath</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
                  <span className="font-bold text-rose-800 block mb-1">Neurological (FAST)</span>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-900">
                    <li>Facial drooping</li>
                    <li>Arm or leg weakness/numbness</li>
                    <li>Slurred speech or sudden confusion</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                  <span className="font-bold text-amber-800 block mb-1">Allergic & Bleeding</span>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-900">
                    <li>Swelling of lips, tongue, or throat</li>
                    <li>Uncontrollable bleeding</li>
                    <li>Sudden severe abdominal pain</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-lg">
                  <span className="font-bold text-teal-800 block mb-1">Mental Health Crisis</span>
                  <ul className="list-disc list-inside space-y-0.5 text-teal-900">
                    <li>Thoughts of self-harm or suicide</li>
                    <li>Free 24/7 Lifeline: Dial 988</li>
                    <li>Crisis Text Line: Text HOME to 741741</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Free 24/7 Public Hotlines</span>
              <div className="flex gap-2">
                <a
                  href="tel:988"
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold rounded-lg text-xs"
                >
                  Dial 988 Lifeline
                </a>
                <a
                  href="tel:911"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call 911 Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
