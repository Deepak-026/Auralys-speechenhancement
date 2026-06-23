import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationCenter from './components/NotificationCenter';
import Home from './pages/Home';
import About from './pages/About';
import Help from './pages/Help';
import Settings from './pages/Settings';
import { useApp } from './context/AppContext';

function Layout() {
  const { sidebarOpen } = useApp();
  const [resetSignal, setResetSignal] = useState(0);
  const [historyEntry, setHistoryEntry] = useState(null);

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar
        onNewEnhancement={() => { setResetSignal((s) => s + 1); setHistoryEntry(null); }}
        onLoadHistory={(entry) => setHistoryEntry(entry)}
      />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
                    ${sidebarOpen ? 'md:ml-[280px]' : 'md:ml-[68px]'}`}
      >
        <Navbar />
        <main className="flex-1 pt-16">
          <Outlet context={{ resetSignal, historyEntry }} />
        </main>
        <Footer />
      </div>

      <NotificationCenter />
    </div>
  );
}

function HomeWrapper() {
  const { resetSignal, historyEntry } = useOutletContext();
  return <Home resetSignal={resetSignal} historyEntry={historyEntry} />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomeWrapper /> },
      { path: 'about', element: <About /> },
      { path: 'help', element: <Help /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
