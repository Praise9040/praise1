import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Stethoscope,
  ShieldCheck,
  CalendarPlus,
  FileText,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Video,
  BookOpen,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { ConsultationMessage, StructuredTriageResult, TriageUrgency } from '../types';

interface AiConsultationRoomProps {
  onScheduleAppointment: (prefilledSymptoms?: string, prefilledSpecialty?: string) => void;
  onStartTelehealthCall: (doctorName?: string) => void;
  onViewSummary: (summaryText: string) => void;
}

export const AiConsultationRoom: React.FC<AiConsultationRoomProps> = ({
  onScheduleAppointment,
  onStartTelehealthCall,
  onViewSummary,
}) => {
  const [activeMode, setActiveMode] = useState<'chat' | 'triage_checker'>('chat');

  // Chat State
  const [messages, setMessages] = useState<ConsultationMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I am Dr. Evelyn Reed, your AI Chief Medical Advisor here at **Online mediCare**. 

I provide free 24/7 preliminary clinical triage, symptom exploration, and evidence-based health guidance using verified public resources (such as WHO, CDC, MedlinePlus, and NHS).

How can I assist you with your health today? You can type or click the microphone to speak your symptoms.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [latestTriage, setLatestTriage] = useState<TriageUrgency | null>(null);

  // Triage Checker Form State
  const [triageForm, setTriageForm] = useState({
    symptoms: '',
    duration: '2-3 days',
    severity: 5,
    age: '32',
    gender: 'Female',
    medicalHistory: 'None reported, no current prescription medications',
  });
  const [triageResult, setTriageResult] = useState<StructuredTriageResult | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech Recognition (Dictation) Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean text of markdown for speaking
    const clean = text.replace(/[*#_`]/g, '').slice(0, 400);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle Chat Submit
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputPrompt).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ConsultationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/consultation/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          patientProfile: {
            name: 'Consultation Patient',
            age: triageForm.age,
            gender: triageForm.gender,
            conditions: triageForm.medicalHistory,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server error');
      }

      const assistantMessage: ConsultationMessage = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Check for emergency keywords
      if (
        data.reply.toLowerCase().includes('emergency') ||
        data.reply.toLowerCase().includes('911') ||
        data.reply.toLowerCase().includes('immediate hospital')
      ) {
        setLatestTriage('EMERGENCY');
      } else if (data.reply.toLowerCase().includes('urgent care')) {
        setLatestTriage('URGENT');
      } else {
        setLatestTriage('ROUTINE');
      }

      if (speechEnabled) {
        speakText(data.reply);
      }
    } catch (err: any) {
      console.error('Chat consultation error:', err);
      const errorMessage: ConsultationMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'I apologize, but I encountered a momentary connection issue. For any severe or urgent symptoms, please contact emergency medical care or your primary care clinic immediately.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Structured Triage Submit
  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageForm.symptoms.trim() || isTriaging) return;

    setIsTriaging(true);
    setTriageResult(null);

    try {
      const response = await fetch('/api/consultation/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triageForm),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Triage failed');
      }

      setTriageResult(data.assessment);
      setLatestTriage(data.assessment.triageLevel);
    } catch (err: any) {
      console.error('Triage assessment error:', err);
      alert('Unable to complete automated triage. Please try again or start a live consultation.');
    } finally {
      setIsTriaging(false);
    }
  };

  // Generate Doctor's Summary / Care Plan
  const handleGenerateCarePlan = async () => {
    setIsLoading(true);
    try {
      const transcript = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      const response = await fetch('/api/consultation/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          patientName: 'Online mediCare Patient',
          chiefComplaint: messages.find((m) => m.role === 'user')?.content.slice(0, 100) || 'General Consultation',
        }),
      });

      const data = await response.json();
      if (data.success && data.summary) {
        onViewSummary(data.summary);
      } else {
        alert('Could not generate summary at this time.');
      }
    } catch (err) {
      console.error('Summary generation error:', err);
      alert('Failed to generate care plan summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Persistent dry cough with low-grade fever for 3 days',
    'Mild chest fluttering and dizziness when standing quickly',
    'New itchy red skin patch on forehead and cheeks',
    'Severe throbbing migraine with light sensitivity',
    'How do I access free community health clinics without insurance?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Top Value Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            24/7 Free Medical Advisory & Clinical Triage
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight mb-3">
            Realtime AI Medical Consultation & Rightful Health Guidance
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Consult Dr. Evelyn Reed for preliminary clinical evaluations, safe at-home guidance, and appointment readiness. All advice is backed by official evidence from the WHO, CDC, MedlinePlus, and NHS.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveMode('chat')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                activeMode === 'chat'
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Interactive AI Consultation Room
            </button>

            <button
              onClick={() => setActiveMode('triage_checker')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                activeMode === 'triage_checker'
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Structured Symptom Checker & Triage
            </button>

            <button
              onClick={() => onStartTelehealthCall('Dr. Evelyn Reed, MD')}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition shadow-md cursor-pointer ml-auto"
            >
              <Video className="w-4 h-4" />
              Launch Telehealth Video Call
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeMode === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left/Sidebar: Consultation Stats & Guidelines */}
          <div className="lg:col-span-1 space-y-4">
            {/* Doctor Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                    alt="Dr. Evelyn Reed"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/30"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dr. Evelyn Reed, MD</h3>
                  <p className="text-xs text-teal-600 font-semibold">Chief Medical AI Officer</p>
                  <p className="text-[11px] text-slate-400">Board-Certified Family Physician</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Consultation Fee</span>
                  <span className="font-bold text-emerald-600">100% Free & Confidential</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Clinical Knowledge</span>
                  <span className="font-medium text-slate-700">WHO / CDC / NIH Aligned</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Response Speed</span>
                  <span className="font-medium text-slate-700">Instant (~1.5s)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Read Advice Aloud</span>
                <button
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setSpeechEnabled(!speechEnabled);
                  }}
                  className={`p-2 rounded-lg transition cursor-pointer ${
                    speechEnabled ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400'
                  }`}
                  title="Toggle Speech Audio"
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Consultation Actions
              </h4>

              <button
                onClick={() => {
                  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
                  onScheduleAppointment(lastUserMsg, 'Primary Care & General Medicine');
                }}
                className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <CalendarPlus className="w-4 h-4 text-teal-600" />
                  Schedule Doctor Visit
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleGenerateCarePlan}
                disabled={messages.length <= 1 || isLoading}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  Download Clinical Care Plan
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onStartTelehealthCall('Dr. Evelyn Reed, MD')}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-600" />
                  Live Video Telehealth Room
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rightful Free Resources Quick Box */}
            <div className="bg-teal-900 text-white rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-teal-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Evidence-Based Guarantee</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Online mediCare connects you to official public medical resources at zero cost: MedlinePlus, CDC Guides, and HRSA Community Health Centers.
              </p>
            </div>
          </div>

          {/* Right/Center: Active Consultation Chat Window */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs h-[640px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">
                  Live Telehealth Consultation Channel
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">• Free Confidential Session</span>
              </div>

              {latestTriage && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    latestTriage === 'EMERGENCY'
                      ? 'bg-rose-100 text-rose-800 animate-bounce'
                      : latestTriage === 'URGENT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Triage: {latestTriage}
                </span>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((m) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    {isAssistant ? (
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        DR
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        ME
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-slate-50 text-slate-800 border border-slate-200/70 shadow-xs'
                          : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs'
                      }`}
                    >
                      {/* Markdown / line-break support */}
                      <div className="whitespace-pre-wrap space-y-2">
                        {m.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>

                      <div
                        className={`text-[10px] mt-2 flex items-center justify-between ${
                          isAssistant ? 'text-slate-400' : 'text-teal-100'
                        }`}
                      >
                        <span>{m.timestamp}</span>
                        {isAssistant && (
                          <button
                            onClick={() => speakText(m.content)}
                            className="hover:text-teal-600 flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <Volume2 className="w-3 h-3" />
                            Listen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    DR
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                    <span>Analyzing symptoms and reviewing clinical guidelines...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick symptom starter pills */}
            <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
              <span className="text-slate-400 font-semibold shrink-0 text-[11px]">Quick Prompts:</span>
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-lg text-slate-600 shrink-0 text-[11px] transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl transition cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title={isListening ? 'Stop Dictating' : 'Dictate Symptoms via Mic'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={isListening ? 'Listening to your symptoms...' : 'Describe your symptoms, how long you’ve had them, and questions...'}
                className="flex-1 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-inner"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isLoading}
                className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Structured Symptom Checker & Clinical Triage Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Triage Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Clinical Symptom Evaluation
                </h3>
                <p className="text-xs text-slate-500">
                  Structured assessment using WHO & MedlinePlus algorithms
                </p>
              </div>
            </div>

            <form onSubmit={handleTriageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Symptoms & Complaints *
                </label>
                <textarea
                  rows={3}
                  value={triageForm.symptoms}
                  onChange={(e) => setTriageForm({ ...triageForm, symptoms: e.target.value })}
                  placeholder="e.g. Throbbing front headache, sensitivity to sunlight, mild nausea, started yesterday afternoon..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={triageForm.duration}
                    onChange={(e) => setTriageForm({ ...triageForm, duration: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-500"
                  >
                    <option>Less than 24 hours</option>
                    <option>1-3 days</option>
                    <option>4-7 days</option>
                    <option>Over 1 week</option>
                    <option>Chronic / Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Severity: {triageForm.severity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={triageForm.severity}
                    onChange={(e) => setTriageForm({ ...triageForm, severity: Number(e.target.value) })}
                    className="w-full accent-teal-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Mild (1)</span>
                    <span>Moderate (5)</span>
                    <span>Severe (10)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={triageForm.age}
                    onChange={(e) => setTriageForm({ ...triageForm, age: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={triageForm.gender}
                    onChange={(e) => setTriageForm({ ...triageForm, gender: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-binary / Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medical History & Medications
                </label>
                <input
                  type="text"
                  value={triageForm.medicalHistory}
                  onChange={(e) => setTriageForm({ ...triageForm, medicalHistory: e.target.value })}
                  placeholder="e.g. Asthma, Hypertension, taking Lisinopril..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isTriaging}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTriaging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Clinical Triage Algorithm...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>Run Free Triage Assessment</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Triage Output Card */}
          <div className="lg:col-span-7">
            {triageResult ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 animate-in fade-in duration-300">
                {/* Header Triage Status */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Assessment Result
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">
                      Clinical Triage Evaluation
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      triageResult.triageLevel === 'EMERGENCY'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : triageResult.triageLevel === 'URGENT'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {triageResult.triageLevel}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {triageResult.summary}
                </p>

                {/* Possible Considerations */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Differential Considerations to Discuss with Clinician:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {triageResult.possibleConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200"
                      >
                        • {cond}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Immediate Safe Actions */}
                <div className="p-3.5 bg-teal-50 border border-teal-100 rounded-xl space-y-1.5 text-xs text-teal-950">
                  <span className="font-bold flex items-center gap-1 text-teal-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    Immediate Evidence-Based Self-Care Guidance:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                    {triageResult.immediateActions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>

                {/* Red Flags */}
                {triageResult.redFlagWarnings?.length > 0 && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-950">
                    <span className="font-bold flex items-center gap-1 text-rose-800">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Critical Red Flags (Seek Immediate Emergency Care if present):
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-rose-900 pl-1">
                      {triageResult.redFlagWarnings.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Rightful Free Resources Cited */}
                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    Rightful Free Clinical Resources for This Condition:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {triageResult.freeResources.map((res, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="font-bold text-slate-800 block text-xs">{res.name}</span>
                        <span className="text-[10px] text-teal-600 font-semibold block">{res.organization}</span>
                        <p className="text-[11px] text-slate-500 mt-1">{res.guidanceNote}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() =>
                      onScheduleAppointment(
                        `Symptoms: ${triageForm.symptoms}. Assessed Triage: ${triageResult.triageLevel}`,
                        triageResult.recommendedSpecialist
                      )
                    }
                    className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Schedule with {triageResult.recommendedSpecialist}
                  </button>

                  <button
                    onClick={() => onStartTelehealthCall('Dr. Evelyn Reed, MD')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer"
                  >
                    Enter Live Telehealth Suite
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[380px] bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm font-heading mb-1">
                  Ready for Clinical Triage
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Complete the patient presentation on the left and submit. The clinical engine evaluates severity, red flags, home care, and recommends the appropriate specialist.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
