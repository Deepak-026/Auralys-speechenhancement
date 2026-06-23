import React from 'react';
import { Sparkles, Upload } from 'lucide-react';

function WaveformIllustration() {
  const bars = [4, 8, 14, 10, 18, 24, 16, 28, 22, 30, 26, 30, 24, 20, 28, 18, 14, 10, 8, 4];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 opacity-10">
        {bars.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h * 3}px`, animationDelay: `${i * 0.06}s` }}
            className={`w-2 rounded-t-sm bg-gradient-to-t from-primary-600 to-accent-purple
                        animate-wave-${(i % 5) + 1}`}
          />
        ))}
      </div>
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-accent-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-accent-cyan/8 rounded-full blur-3xl" />
    </div>
  );
}

export default function Hero({ onUploadClick }) {
  return (
    <section className="relative min-h-[40vh] flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden">
      <WaveformIllustration />

      <div className="relative z-10 max-w-2xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-600/20
                        border border-primary-500/30 text-primary-400 text-xs font-medium mb-6">
          <Sparkles size={12} />
          Powered by SpeechBrain · Deep Learning
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-gradient">AI Speech</span>
          <br />
          <span className="text-white">Enhancement</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl mb-8 leading-relaxed max-w-lg mx-auto">
          Upload noisy audio recordings and improve speech clarity using deep learning.
          Studio-quality output in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onUploadClick}
            className="btn-primary flex items-center gap-2 text-base px-8 py-4"
          >
            <Upload size={20} />
            Upload Audio File
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-sm"
          >
            View Documentation →
          </a>
        </div>

        {/* Format hints */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-500">
          <span>Supports</span>
          {['.wav', '.mp3', '.opus'].map((f) => (
            <span key={f} className="px-2 py-0.5 bg-surface-elevated border border-surface-border
                                      rounded-md font-mono text-gray-400">
              {f}
            </span>
          ))}
          <span>· Max 100 MB</span>
        </div>
      </div>
    </section>
  );
}
