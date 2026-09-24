import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  HeartHandshake,
  FileCheck,
  Building,
  Phone,
  Pill,
  Sparkles,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { HEALTH_RESOURCES } from '../data/resources';
import { HealthResource } from '../types';

export const FreeHealthResources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Global Guidelines',
    'Medical Encyclopedia',
    'Public Health & Disease',
    'Mental Health & Crisis',
    'Free & Sliding Scale Clinics',
    'Prescription Assistance',
    'Cardiovascular Health',
    'Chronic Care & Diabetes',
  ];

  const filteredResources = HEALTH_RESOURCES.filter((res) => {
    const matchesCat = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesQuery =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Rightful & 100% Free Public Health Knowledge
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading mb-2">
            Free Official Medical & Clinical Resources
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Online mediCare is built on the philosophy that life-saving health education and clinical guidelines should be free and accessible to everyone. Browse gold-standard authorities including the World Health Organization, CDC, MedlinePlus (NIH), and free community healthcare networks.
          </p>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, diseases, medications, free clinic locators..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:border-teal-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Verified Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
          >
            <div>
              {/* Category & Authority */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 uppercase">
                  {res.category}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {res.freeTag}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-900 text-base font-heading mb-1.5 leading-snug">
                {res.title}
              </h3>

              {/* Authority */}
              <p className="text-xs text-slate-400 font-semibold mb-3">
                Authority: <span className="text-slate-700">{res.authority}</span>
              </p>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {res.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {res.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Visit Resource CTA */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Free Access</span>
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 transition group cursor-pointer"
              >
                <span>Open Rightful Resource</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Free Community Care Assistance Section */}
      <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <HeartHandshake className="w-3.5 h-3.5" />
              Community Health Equity Guarantee
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              Need In-Person Care or Low-Cost Prescriptions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              If you or a family member are uninsured or facing financial hardship, the United States HRSA network operates over 1,400 community health centers offering comprehensive care, dental, and pharmacy on a sliding fee scale.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://findahealthcenter.hrsa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Building className="w-4 h-4" />
              Find Free / Sliding Scale Clinic
            </a>
            <a
              href="https://www.needymeds.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Pill className="w-4 h-4 text-teal-600" />
              Prescription Savings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
