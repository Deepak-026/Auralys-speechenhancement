import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What audio formats are supported?',
    a: 'AURALYS supports .wav (WAV), .mp3 (MPEG Audio), and .opus (Opus) formats. The maximum file size is 100 MB.',
  },
  {
    q: 'How do I use AURALYS?',
    a: 'Open the app, click "New Enhancement" or drag and drop an audio file onto the upload area. Preview your original, configure enhancement settings (model, noise level), then click "Enhance Speech". When complete, compare original and enhanced audio and download the result.',
  },
  {
    q: 'How long does enhancement take?',
    a: 'Processing time depends on file length and your hardware. A 1-minute recording typically takes 10–60 seconds on CPU. GPU acceleration is not currently enabled in the default setup.',
  },
  {
    q: 'Why is my upload failing?',
    a: 'Common causes: unsupported format (only .wav, .mp3, .opus allowed), file exceeds 100 MB, or file is corrupted. Ensure the file plays correctly in a local media player first.',
  },
  {
    q: 'What does the noise reduction level do?',
    a: '"Auto" lets the model decide. "Low" applies minimal noise removal with maximum speech preservation. "High" aggressively removes noise but may slightly affect speech naturalness. For most recordings, "Auto" or "Medium" works best.',
  },
  {
    q: 'Is my audio stored permanently?',
    a: 'Upload files are deleted after processing. Enhanced output files are kept temporarily in the outputs folder. History entries are stored locally in history.json on the server.',
  },
  {
    q: 'What is SepFormer?',
    a: 'SepFormer is a Transformer-based speech separation model from SpeechBrain, trained on the WHAM! noise dataset. It excels at separating clean speech from realistic ambient noise like cafeteria noise, street noise, and music.',
  },
  {
    q: 'Why is the output quality lower than expected?',
    a: 'SpeechBrain\'s SepFormer works best on audio recorded at 16 kHz. Very low-quality inputs, heavily clipped audio, or non-speech sounds may yield less dramatic improvements. Try the "High" noise reduction setting for strongly noisy recordings.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-surface-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left
                   hover:bg-surface-elevated transition-colors duration-200"
      >
        <span className="font-medium text-white text-sm">{q}</span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-surface-border pt-4 animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30
                        flex items-center justify-center">
          <HelpCircle size={20} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Help & FAQ</h1>
          <p className="text-sm text-gray-400">Frequently asked questions about AURALYS</p>
        </div>
      </div>

      <div className="space-y-3">
        {FAQS.map((item) => (
          <FAQItem key={item.q} {...item} />
        ))}
      </div>

      <div className="card p-6 text-center">
        <p className="text-gray-400 text-sm mb-3">Still need help?</p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          Open an Issue on GitHub
        </a>
      </div>
    </div>
  );
}
