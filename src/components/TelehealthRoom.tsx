import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Activity,
  Heart,
  FileText,
  ShieldCheck,
  Send,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Thermometer,
  Maximize2,
  Clock,
} from 'lucide-react';
import { Appointment } from '../types';

interface TelehealthRoomProps {
  appointment?: Appointment | null;
  onEndCall: () => void;
  onGenerateSummary: () => void;
}

export const TelehealthRoom: React.FC<TelehealthRoomProps> = ({
  appointment,
  onEndCall,
  onGenerateSummary,
}) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // In-call chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'Dr. Evelyn Reed, MD',
      text: 'Good day! I have reviewed your preliminary symptoms. How are you feeling right now?',
      time: 'Just now',
    },
    {
      sender: 'Dr. Evelyn Reed, MD',
      text: 'Note: All our clinical recommendations are backed by WHO/CDC guidelines and accessible free of charge.',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);

  // Vitals simulation
  const [heartRate, setHeartRate] = useState(74);
  const [oxygenSat, setOxygenSat] = useState(99);
  const [bloodPressure, setBloodPressure] = useState('118/76');

  // Video stream ref
  const userVideoRef = useRef<HTMLVideoElement>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subtle fluctuation in telemetry to feel authentic
  useEffect(() => {
    const vitalsInterval = setInterval(() => {
      setHeartRate((prev) => Math.min(88, Math.max(68, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(vitalsInterval);
  }, []);

  // Camera stream handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (videoEnabled && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          console.log('Webcam not accessible, using avatar simulation.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoEnabled]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'You (Patient)',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
    setIsDoctorTyping(true);

    // Doctor simulated response using clinical knowledge
    setTimeout(() => {
      setIsDoctorTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'Dr. Evelyn Reed, MD',
          text: `Understood. Based on that, I'm documenting this in your encounter notes. Make sure to stay hydrated, avoid strain, and consult the MedlinePlus guideline I've attached to your summary.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1800);
  };

  const doctorName = appointment?.doctorName || 'Dr. Evelyn Reed, MD';
  const doctorSpecialty = appointment?.doctorSpecialty || 'Primary Care & Telehealth Chief';
  const doctorAvatar =
    appointment?.doctorAvatar ||
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Telehealth Room Header */}
      <div className="bg-slate-900 text-white rounded-2xl px-5 py-3.5 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-heading flex items-center gap-2">
              <span>Encrypted Telehealth Room</span>
              <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                HIPAA & SOC-2 Compliant
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Consulting: <span className="text-white font-medium">{doctorName}</span> ({doctorSpecialty})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{formatDuration(callDuration)}</span>
          </div>

          <button
            onClick={onGenerateSummary}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Generate</span> Care Plan
          </button>
        </div>
      </div>

      {/* Main Video & Telemetry Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left/Center: Video Feeds & Call Controls */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Main Video Screen */}
          <div className="relative aspect-video sm:aspect-16/10 bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            
            {/* Doctor Feed */}
            <div className="relative w-full h-full">
              <img
                src={doctorAvatar}
                alt={doctorName}
                className="w-full h-full object-cover filter brightness-95"
              />

              {/* Doctor HUD Overlay */}
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold font-heading">{doctorName}</span>
                <span className="text-[10px] text-teal-300 hidden sm:inline">1080p Telehealth Feed</span>
              </div>

              {/* Right Vitals HUD in Video */}
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-white/10 p-2.5 rounded-xl text-white text-[11px] space-y-1 hidden sm:block">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                  <Heart className="w-3 h-3 animate-pulse" />
                  <span>{heartRate} BPM</span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-300 font-mono">
                  <Activity className="w-3 h-3" />
                  <span>{bloodPressure}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-300 font-mono">
                  <span>SpO2: {oxygenSat}%</span>
                </div>
              </div>
            </div>

            {/* Self / Patient Picture-in-Picture */}
            <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-teal-500/80 shadow-2xl">
              {videoEnabled ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                  <VideoOff className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                You (Patient)
              </div>
            </div>
          </div>

          {/* Call Controls Bar */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-3 rounded-2xl transition cursor-pointer ${
                  micEnabled
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-rose-600 text-white'
                }`}
                title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3 rounded-2xl transition cursor-pointer ${
                  videoEnabled
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-rose-600 text-white'
                }`}
                title={videoEnabled ? 'Stop Video' : 'Start Video'}
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-2xl transition cursor-pointer hidden sm:flex ${
                  isScreenSharing ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title="Share Medical Records / Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onEndCall}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Telehealth Visit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Patient Telemetry & Live Clinical Chat */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Realtime Patient Telemetry Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                Live Patient Telemetry
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                Normal Range
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Heart Rate</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  {heartRate} <span className="text-[10px] font-normal text-slate-400">BPM</span>
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                <span className="font-bold text-slate-900 text-sm">{bloodPressure}</span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Oxygen Saturation</span>
                <span className="font-bold text-slate-900 text-sm">{oxygenSat}% SpO2</span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Body Temperature</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  98.6°F
                </span>
              </div>
            </div>
          </div>

          {/* In-Call Consultation Chat */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col h-[400px] overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">In-Call Clinical Dialogue</span>
              <span className="text-[10px] text-teal-600 font-semibold">Instant Notes</span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.map((msg, i) => {
                const isPatient = msg.sender.includes('You');
                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl ${
                      isPatient
                        ? 'bg-teal-50 text-teal-950 ml-6 border border-teal-100'
                        : 'bg-slate-50 text-slate-800 mr-6 border border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-slate-700">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                );
              })}

              {isDoctorTyping && (
                <div className="text-[11px] text-slate-400 italic">
                  {doctorName} is typing clinical recommendation...
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="p-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message doctor during visit..."
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
