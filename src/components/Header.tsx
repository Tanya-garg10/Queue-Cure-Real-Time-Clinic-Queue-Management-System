/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, LayoutDashboard, Users, Clock, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  currentView: 'receptionist' | 'patient';
  onViewChange: (view: 'receptionist' | 'patient') => void;
  sseConnected: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({ 
  currentView, 
  onViewChange, 
  sseConnected, 
  darkMode, 
  onToggleDarkMode 
}: HeaderProps) {
  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${
      darkMode 
        ? 'border-slate-800 bg-slate-900/95 text-slate-100' 
        : 'border-slate-100 bg-white/95 text-slate-800'
    } backdrop-blur-md`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className={`font-sans text-lg font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              QueueCure <span className="text-blue-600">Pro</span>
            </span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`h-2 w-2 rounded-full ${sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className={`font-mono text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {sseConnected ? 'LIVE SYNC ACTIVE' : 'RECONNECTING...'}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Controls and Dark Mode Toggle */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 rounded-xl p-1 transition-colors duration-300 ${
            darkMode ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <button
              onClick={() => onViewChange('receptionist')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-250 ${
                currentView === 'receptionist'
                  ? darkMode
                    ? 'bg-slate-900 text-slate-100 shadow-md'
                    : 'bg-white text-slate-800 shadow-sm'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Reception Panel</span>
            </button>
            
            <button
              onClick={() => onViewChange('patient')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-250 ${
                currentView === 'patient'
                  ? darkMode
                    ? 'bg-slate-900 text-slate-100 shadow-md'
                    : 'bg-white text-slate-800 shadow-sm'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Patient Board</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 active:scale-95 ${
              darkMode 
                ? 'border-slate-800 bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300' 
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            id="btn-toggle-theme"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
