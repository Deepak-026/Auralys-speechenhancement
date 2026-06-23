import React from 'react';
import Routes from './routes';
import { AppProvider } from './context/AppContext';
import './styles/globals.css';

export default function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  );
}
