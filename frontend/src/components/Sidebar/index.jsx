import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PlusCircle, Clock, BookOpen, Info, Settings,
  HelpCircle, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { deleteHistoryEntry } from '../../services/history';
import HistoryPanel from '../HistoryPanel';

const NAV_ITEMS = [
  { id: 'new', label: 'New Enhancement', icon: PlusCircle, path: '/', action: 'new' },
  { id: 'history', label: 'History', icon: Clock, path: null, action: 'history' },
  { id: 'docs', label: 'Documentation', icon: BookOpen, path: null, action: 'docs' },
  { id: 'about', label: 'About', icon: Info, path: '/about' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'help', label: 'Help', icon: HelpCircle, path: '/help' },
];

export default function Sidebar({ onNewEnhancement, onLoadHistory }) {
  const { sidebarOpen, setSidebarOpen, history, refreshHistory } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showHistory, setShowHistory] = React.useState(true);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleNavClick = (item) => {
    if (item.action === 'new') {
      onNewEnhancement?.();
      navigate('/');
      if (isMobile) setSidebarOpen(false);
    } else if (item.action === 'docs') {
      window.open('https://github.com', '_blank');
    } else if (item.action === 'history') {
      setShowHistory((v) => !v);
    } else if (item.path) {
      navigate(item.path);
      if (isMobile) setSidebarOpen(false);
    }
  };

  const isActive = (item) => item.path && item.path !== '/'
    ? location.pathname === item.path
    : item.action === 'new' && location.pathname === '/';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Header */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-surface-border
                        ${sidebarOpen ? '' : 'justify-center'}`}>
        <img src="/logo.svg" alt="AURALYS" className="w-8 h-8 flex-shrink-0" />
        {sidebarOpen && (
          <div>
            <h1 className="font-bold text-white text-sm tracking-widest">AURALYS</h1>
            <p className="text-xs text-gray-500">Hear Every Detail</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <React.Fragment key={item.id}>
              <button
                onClick={() => handleNavClick(item)}
                title={!sidebarOpen ? item.label : undefined}
                className={`nav-item w-full text-left ${active ? 'nav-item-active' : ''}
                            ${!sidebarOpen ? 'justify-center px-2' : ''}`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>

              {/* Inline history panel */}
              {item.action === 'history' && sidebarOpen && showHistory && (
                <div className="ml-2 mt-1 mb-1">
                  <HistoryPanel
                    history={history.slice(0, 6)}
                    onSelect={(entry) => {
                      onLoadHistory?.(entry);
                      navigate('/');
                    }}
                    onDelete={async (id) => {
                      await deleteHistoryEntry(id);
                      await refreshHistory();
                    }}
                    collapsed={false}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="p-3 border-t border-surface-border hidden md:block">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="nav-item w-full justify-center"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          {sidebarOpen && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40
                    bg-surface-card border-r border-surface-border
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${sidebarOpen ? 'w-[280px]' : 'w-[68px]'}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-[280px] flex flex-col bg-surface-card border-r border-surface-border">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
