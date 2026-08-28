import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mic, Play, Pause, RotateCcw, Sparkles, Key, Check, AlertCircle, X, ShieldAlert, Cpu, PieChart, Layers, Zap } from 'lucide-react';
import { ELEVENLABS_VOICES, VoiceNarrateRequest, VoiceNarrateResponse, VoiceTopic, VoiceOption } from '@finova/shared';

interface VoiceCopilotProps {
  currentContext?: {
    activeTab?: string;
    topsisMatch?: any;
    verishieldAlert?: any;
    syndicationData?: any;
    chaosData?: any;
  };
  triggerTopic?: VoiceTopic | null;
  onClearTrigger?: () => void;
}

export const VoiceCopilot: React.FC<VoiceCopilotProps> = ({
  currentContext,
  triggerTopic,
  onClearTrigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(ELEVENLABS_VOICES[0].id);
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState<string>('Welcome to Finova AI Voice Intelligence powered by ElevenLabs Neural Speech. Select a briefing or ask the Copilot to analyze active deals.');
  const [engineUsed, setEngineUsed] = useState<'ELEVENLABS_API' | 'BROWSER_SYNTHESIS_FALLBACK'>('BROWSER_SYNTHESIS_FALLBACK');
  const [activeTopic, setActiveTopic] = useState<VoiceTopic | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load API Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('FINOVA_ELEVENLABS_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Handle external trigger requests from other components
  useEffect(() => {
    if (triggerTopic) {
      setIsOpen(true);
      handleNarrateTopic(triggerTopic);
      if (onClearTrigger) onClearTrigger();
    }
  }, [triggerTopic]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('FINOVA_ELEVENLABS_KEY', key);
    setShowKeyModal(false);
  };

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playAudio = (audioBase64?: string, fallbackText?: string) => {
    stopAllAudio();

    if (audioBase64) {
      const audio = new Audio(audioBase64);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        if (fallbackText) playBrowserSpeech(fallbackText);
      };

      audio.play().catch(e => {
        console.warn('Direct audio play blocked or failed:', e);
        if (fallbackText) playBrowserSpeech(fallbackText);
      });
    } else if (fallbackText) {
      playBrowserSpeech(fallbackText);
    }
  };

  const playBrowserSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick English neural/premium voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleNarrateTopic = async (topic: VoiceTopic, customPayload?: any) => {
    stopAllAudio();
    setIsLoading(true);
    setActiveTopic(topic);

    let contextData = customPayload;
    if (!contextData) {
      if (topic === 'TOPSIS_DEAL') contextData = currentContext?.topsisMatch;
      if (topic === 'VERISHIELD_ALERT') contextData = currentContext?.verishieldAlert;
      if (topic === 'SYNDICATION_ANALYSIS') contextData = currentContext?.syndicationData;
      if (topic === 'CHAOS_REPORT') contextData = currentContext?.chaosData;
    }

    try {
      const res = await fetch('/api/voice/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          voiceId: selectedVoice,
          apiKey: apiKey.trim(),
          contextData
        } as VoiceNarrateRequest)
      });

      const data: VoiceNarrateResponse = await res.json();
      if (data.success) {
        setTranscript(data.scriptText);
        setEngineUsed(data.engine);
        playAudio(data.audioBase64, data.scriptText);
      }
    } catch (err) {
      console.error('Failed to generate narration:', err);
      const fallbackScript = `Finova AI Voice Copilot. Live financial consensus verified and ready.`;
      setTranscript(fallbackScript);
      playBrowserSpeech(fallbackScript);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Copilot Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl transition-all border ${
            isOpen
              ? 'bg-accent text-black border-accent font-semibold shadow-glow-accent'
              : 'bg-surface/90 text-white border-surface-border hover:border-accent/60 backdrop-blur-xl hover:shadow-glow-accent/40'
          }`}
        >
          <div className="relative">
            <Mic className={`w-5 h-5 ${isPlaying ? 'text-black animate-bounce' : 'text-accent'}`} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-left font-mono">
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>ElevenLabs Voice AI</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 font-sans">v2.5</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {isPlaying ? 'Speaking intelligence...' : 'Tap for Voice Copilot'}
            </div>
          </div>
        </button>
      </div>

      {/* Floating Voice Assistant Modal / Tray */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[460px] glass-panel border border-accent/40 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl animate-fade-in text-white">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-border/80 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-purple flex items-center justify-center text-black font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide font-mono flex items-center gap-2">
                  FINOVA AUDIO INTELLIGENCE
                </h3>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span>ElevenLabs Neural Copilot</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowKeyModal(true)}
                className={`p-2 rounded-xl border transition-colors ${
                  apiKey
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : 'border-surface-border text-slate-400 hover:text-white hover:bg-surface'
                }`}
                title="Configure ElevenLabs API Key"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl border border-surface-border text-slate-400 hover:text-white hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Selector & Engine Status */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">SELECT NARRATOR VOICE</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-surface-light border border-surface-border rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-accent focus:outline-none font-mono"
              >
                {ELEVENLABS_VOICES.map((v: VoiceOption) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">ACTIVE ENGINE</label>
              <div className="flex items-center gap-1.5 bg-surface-light border border-surface-border rounded-xl px-2.5 py-1.5 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-accent' : 'bg-emerald-400'}`} />
                <span className="truncate text-slate-300">
                  {apiKey ? 'ElevenLabs API (Live)' : 'Neural Speech Engine'}
                </span>
              </div>
            </div>
          </div>

          {/* Waveform Visualizer & Live Transcript */}
          <div className="bg-background/80 border border-surface-border rounded-2xl p-4 mb-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-accent" /> Live Audio Transcript
              </span>

              {/* Animated Waveform Bars */}
              {isPlaying ? (
                <div className="flex items-center gap-1 h-3.5">
                  <span className="w-1 bg-accent rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3"></span>
                  <span className="w-1 bg-accent rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-4"></span>
                  <span className="w-1 bg-accent rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-2"></span>
                  <span className="w-1 bg-accent rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3.5"></span>
                  <span className="w-1 bg-accent rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2.5"></span>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">STANDBY</span>
              )}
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans min-h-[60px] italic">
              "{transcript}"
            </p>

            {/* Audio Controls */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-surface-border/60">
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <button
                    onClick={stopAllAudio}
                    className="flex items-center gap-1.5 px-3 py-1 bg-danger/20 border border-danger/40 text-danger rounded-lg text-xs font-mono font-medium hover:bg-danger/30 transition-colors"
                  >
                    <Pause className="w-3 h-3" /> Stop Audio
                  </button>
                ) : (
                  <button
                    onClick={() => playAudio(undefined, transcript)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-accent/20 border border-accent/40 text-accent rounded-lg text-xs font-mono font-medium hover:bg-accent/30 transition-colors"
                  >
                    <Play className="w-3 h-3" /> Replay Script
                  </button>
                )}
              </div>

              <span className="text-[10px] font-mono text-slate-500">
                {isLoading ? 'Synthesizing voice stream...' : isPlaying ? 'Audio streaming' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Quick Domain Briefing Triggers */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              INSTANT FINANCIAL BRIEFINGS
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isLoading}
                onClick={() => handleNarrateTopic('TOPSIS_DEAL')}
                className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-surface-border hover:border-accent/50 hover:bg-accent/10 transition-all text-left text-xs text-slate-200"
              >
                <Cpu className="w-4 h-4 text-accent shrink-0" />
                <div className="truncate">
                  <div className="font-semibold truncate">TOPSIS Deal Win</div>
                  <div className="text-[9px] font-mono text-slate-400">Explain Best Match</div>
                </div>
              </button>

              <button
                disabled={isLoading}
                onClick={() => handleNarrateTopic('VERISHIELD_ALERT')}
                className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-surface-border hover:border-purple/50 hover:bg-purple/10 transition-all text-left text-xs text-slate-200"
              >
                <ShieldAlert className="w-4 h-4 text-purple shrink-0" />
                <div className="truncate">
                  <div className="font-semibold truncate">VeriShield Audit</div>
                  <div className="text-[9px] font-mono text-slate-400">Security Certificate</div>
                </div>
              </button>

              <button
                disabled={isLoading}
                onClick={() => handleNarrateTopic('PORTFOLIO_BRIEFING')}
                className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-surface-border hover:border-blue-400/50 hover:bg-blue-400/10 transition-all text-left text-xs text-slate-200"
              >
                <PieChart className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="truncate">
                  <div className="font-semibold truncate">Portfolio Twin</div>
                  <div className="text-[9px] font-mono text-slate-400">Morning Executive Brief</div>
                </div>
              </button>

              <button
                disabled={isLoading}
                onClick={() => handleNarrateTopic('SYNDICATION_ANALYSIS')}
                className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-surface-border hover:border-amber-400/50 hover:bg-amber-400/10 transition-all text-left text-xs text-slate-200"
              >
                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="font-semibold truncate">Syndication Vault</div>
                  <div className="text-[9px] font-mono text-slate-400">Tranche Waterfall</div>
                </div>
              </button>
            </div>

            <button
              disabled={isLoading}
              onClick={() => handleNarrateTopic('CHAOS_REPORT')}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-surface border border-danger/30 hover:border-danger/60 hover:bg-danger/10 transition-all text-xs text-danger font-mono font-medium mt-1"
            >
              <Zap className="w-3.5 h-3.5 text-danger" />
              <span>Adversarial Chaos Stress Report</span>
            </button>
          </div>
        </div>
      )}

      {/* ElevenLabs API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel border border-accent/40 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono">ElevenLabs API Setup</h3>
                  <div className="text-xs text-slate-400">Ultra-Realistic Neural Financial Voices</div>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Paste your personal <strong>ElevenLabs API Key</strong> to enable zero-latency, studio-grade AI audio narration across the entire Finova ecosystem.
            </p>

            <div className="mb-4">
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                ELEVENLABS API KEY (xi-api-key)
              </label>
              <input
                type="password"
                placeholder="sk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-surface-light border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-accent focus:outline-none"
              />
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Keys are stored locally in your browser storage and never logged.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => saveApiKey('')}
                className="px-4 py-2 rounded-xl text-xs font-mono border border-surface-border text-slate-400 hover:text-white hover:bg-surface"
              >
                Clear Key (Use Neural Fallback)
              </button>
              <button
                onClick={() => saveApiKey(apiKey)}
                className="px-5 py-2 rounded-xl text-xs font-mono font-semibold bg-accent text-black hover:shadow-glow-accent transition-all"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
