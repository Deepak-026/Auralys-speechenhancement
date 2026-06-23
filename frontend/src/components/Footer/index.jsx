import React from 'react';
import { Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-border px-6 py-4 text-center">
      <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5 flex-wrap">
        <span>© 2025 AURALYS</span>
        <span className="opacity-40">·</span>
        <span className="text-gradient font-semibold">Hear Every Detail</span>
        <span className="opacity-40">·</span>
        <span className="flex items-center gap-1">
          Built with <Heart size={11} className="text-accent-red" /> using SpeechBrain
        </span>
        <span className="opacity-40">·</span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          <Github size={11} />
          GitHub
        </a>
      </p>
    </footer>
  );
}
