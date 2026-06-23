import React from 'react';
import { User, Cpu, Code2, Layers, Sparkles } from 'lucide-react';

const TECH_STACK = [
  { name: 'React + Vite', desc: 'Fast, modern frontend framework', icon: Code2, color: 'text-accent-cyan' },
  { name: 'TailwindCSS', desc: 'Utility-first styling system', icon: Layers, color: 'text-accent-purple' },
  { name: 'Node.js + Express', desc: 'Robust REST API backend', icon: Code2, color: 'text-accent-green' },
  { name: 'Python + SpeechBrain', desc: 'AI speech enhancement engine', icon: Cpu, color: 'text-primary-400' },
  { name: 'SepFormer Model', desc: 'Pretrained on WHAM! noise dataset', icon: Sparkles, color: 'text-accent-amber' },
];

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20
                        border border-primary-500/30 mb-4">
          <img src="/logo.svg" alt="AURALYS" className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          About <span className="text-gradient">AURALYS</span>
        </h1>
        <p className="text-gray-400">Hear Every Detail</p>
      </div>

      {/* What is AURALYS */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-3">What is AURALYS?</h2>
        <p className="text-gray-400 leading-relaxed text-sm">
          AURALYS is an AI-powered speech enhancement web application that uses deep learning to
          reduce background noise and improve speech clarity in audio recordings. Whether you have
          a noisy meeting recording, a podcast with ambient noise, or a voice memo captured in a
          challenging environment — AURALYS transforms it into clean, professional-quality audio.
        </p>
      </div>

      {/* How it works */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: '01', title: 'Upload', desc: 'Drop your .wav, .mp3, or .opus audio file.' },
            { step: '02', title: 'Preprocess', desc: 'The engine validates, decodes, and normalizes your audio to the model\'s required format (16 kHz mono Float32).' },
            { step: '03', title: 'Enhance', desc: 'The SpeechBrain SepFormer model runs inference to separate clean speech from noise.' },
            { step: '04', title: 'Download', desc: 'Post-processed, normalized WAV output is ready for download and comparison.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30
                              flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-400">{step}</span>
              </div>
              <div>
                <p className="font-medium text-white text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TECH_STACK.map(({ name, desc, icon: Icon, color }) => (
            <div key={name} className="stat-card flex items-start gap-3">
              <Icon size={18} className={`${color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current user */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Current User</h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-elevated border border-surface-border
                          flex items-center justify-center">
            <User size={22} className="text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-white">Guest User</p>
            <p className="text-xs text-gray-500">Not signed in · Authentication coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
