/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReceptionistView from './components/ReceptionistView';
import PatientView from './components/PatientView';
import { QueueState } from './types';
import { Database, Wifi, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'receptionist' | 'patient'>('receptionist');
  const [sseConnected, setSseConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  // Sync Dark Mode class and storage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  // Initial default state
  const [queueState, setQueueState] = useState<QueueState>({
    patients: [],
    averageConsultationTime: 10,
    lastTokenCount: 0
  });

  // Connect to Real-time Server Sent Events (SSE)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      console.log('Establishing connection to live queue events stream...');
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        console.log('Successfully connected to live stream events!');
        setSseConnected(true);
        setErrorMessage('');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as QueueState;
          setQueueState(data);
        } catch (err) {
          console.error('Failed to parse queue state payload:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE connection error. Reconnecting in 3 seconds...', err);
        setSseConnected(false);
        if (eventSource) {
          eventSource.close();
        }
        // Retry after 3 seconds
        retryTimeout = setTimeout(connectSSE, 3000);
      };
    }

    connectSSE();

    // Cleanup connection on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  // REST API Actions

  // 1. Add patient
  const handleAddPatient = async (patientData: {
    patientName: string;
    patientPhone: string;
    age: number;
    gender: string;
    symptoms: string;
  }) => {
    try {
      const response = await fetch('/api/add-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add patient');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Network error, please try again.');
      throw err;
    }
  };

  // 2. Call next patient
  const handleNextToken = async () => {
    try {
      const response = await fetch('/api/next-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to call next token');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to call next patient.');
    }
  };

  // 3. Complete token
  const handleCompleteToken = async (id?: string) => {
    try {
      const response = await fetch('/api/complete-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) {
        throw new Error('Failed to complete consultation');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to complete patient session.');
    }
  };

  // 4. Skip/No-show token
  const handleSkipToken = async (id: string) => {
    try {
      const response = await fetch('/api/skip-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) {
        throw new Error('Failed to skip token');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to skip patient.');
    }
  };

  // 5. Update settings
  const handleUpdateSettings = async (avgTime: number) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ averageConsultationTime: avgTime })
      });
      if (!response.ok) {
        throw new Error('Failed to update consultation settings');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to update checkup settings.');
      throw err;
    }
  };

  // 6. Reset entire queue
  const handleResetQueue = async () => {
    try {
      const response = await fetch('/api/reset-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to reset patient queue');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to reset queue.');
    }
  };

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } font-sans`}>
      
      {/* Sticky Header */}
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        sseConnected={sseConnected}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Global Error Notice */}
      {errorMessage && (
        <div className={`border-y px-4 py-3 text-center flex items-center justify-center space-x-2 text-xs font-semibold ${
          darkMode ? 'bg-rose-950/40 border-rose-900 text-rose-300' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
          <button 
            onClick={() => setErrorMessage('')} 
            className="underline hover:opacity-80 font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentView === 'receptionist' ? (
          <ReceptionistView
            queueState={queueState}
            onAddPatient={handleAddPatient}
            onNextToken={handleNextToken}
            onCompleteToken={handleCompleteToken}
            onSkipToken={handleSkipToken}
            onUpdateSettings={handleUpdateSettings}
            onResetQueue={handleResetQueue}
            darkMode={darkMode}
          />
        ) : (
          <PatientView queueState={queueState} darkMode={darkMode} />
        )}
      </main>

      {/* Polished Bottom Status Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 z-40 border-t px-6 py-3 flex justify-between items-center text-[11px] font-medium transition-colors duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Clinic DB Offline Storage Active</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5">
            <span className={`h-2 w-2 rounded-full ${sseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>SSE Event Broadcast: {sseConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
        </div>
        <div className="text-slate-400 font-mono tracking-widest uppercase">
          v2.0.4 • Stable Build
        </div>
      </footer>
    </div>
  );
}
