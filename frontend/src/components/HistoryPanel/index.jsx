import React from 'react';
import { CheckCircle, XCircle, Clock, FileAudio, Trash2 } from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';

function statusIcon(status) {
  if (status === 'success') return <CheckCircle size={12} className="text-accent-green" />;
  if (status === 'error') return <XCircle size={12} className="text-accent-red" />;
  return <Clock size={12} className="text-accent-amber animate-pulse" />;
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export default function HistoryPanel({ history, onSelect, onDelete, collapsed = false }) {
  if (!history || history.length === 0) {
    return collapsed ? null : (
      <div className="px-3 py-2">
        <p className="text-xs text-gray-500 text-center py-2">No history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="group flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-surface-elevated
                     cursor-pointer transition-all duration-200"
          onClick={() => onSelect?.(entry)}
          title={entry.originalFilename}
        >
          <FileAudio size={14} className="text-gray-500 flex-shrink-0" />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-300 truncate">
                  {entry.originalFilename || entry.filename}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  {statusIcon(entry.status)}
                  <span>{relativeTime(entry.createdAt)}</span>
                </p>
              </div>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-accent-red
                             transition-all duration-200 flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
