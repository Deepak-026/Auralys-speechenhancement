import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack } from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';

export default function AudioPlayer({ src, label, className = '' }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    audio.src = src;
    audio.load();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(false);

    const onLoaded = () => {
      setDuration(audio.duration || 0);
      setLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setPlaying(false);
    const onError = () => { setError(true); setLoading(false); };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setError(true));
    }
  }, [playing]);

  const handleProgressClick = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = pct * duration;
  }, [duration]);

  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      setMuted(v === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
  }, [muted]);

  const restart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-surface-elevated border border-surface-border rounded-xl p-4 ${className}`}>
      <audio ref={audioRef} preload="metadata" />

      {label && (
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      )}

      {error ? (
        <p className="text-accent-red text-sm text-center py-2">Failed to load audio.</p>
      ) : (
        <>
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="w-full h-2 bg-surface-border rounded-full cursor-pointer mb-4 group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-accent-purple rounded-full relative transition-all duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={restart}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-border"
              title="Restart"
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={togglePlay}
              disabled={!src || loading}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-600 hover:bg-primary-500
                         text-white transition-all duration-200 active:scale-90 disabled:opacity-50 flex-shrink-0"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : playing ? (
                <Pause size={16} />
              ) : (
                <Play size={16} className="ml-0.5" />
              )}
            </button>

            {/* Time */}
            <div className="flex-1 text-xs font-mono text-gray-400 tabular-nums">
              <span className="text-white">{formatDuration(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 accent-primary-500 cursor-pointer"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
