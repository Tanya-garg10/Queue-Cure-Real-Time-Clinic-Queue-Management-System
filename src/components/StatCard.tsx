/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color: 'teal' | 'amber' | 'slate' | 'rose' | 'emerald' | 'blue';
  darkMode?: boolean;
}

export default function StatCard({ 
  id, 
  title, 
  value, 
  description, 
  icon: Icon, 
  color,
  darkMode = false
}: StatCardProps) {
  const colorMaps = {
    blue: {
      bg: darkMode ? 'bg-blue-950/40' : 'bg-blue-50',
      text: darkMode ? 'text-blue-400' : 'text-blue-600',
      border: darkMode ? 'border-slate-800' : 'border-blue-100',
    },
    teal: {
      bg: darkMode ? 'bg-teal-950/40' : 'bg-teal-50',
      text: darkMode ? 'text-teal-400' : 'text-teal-600',
      border: darkMode ? 'border-slate-800' : 'border-teal-100',
    },
    amber: {
      bg: darkMode ? 'bg-amber-950/40' : 'bg-amber-50',
      text: darkMode ? 'text-amber-400' : 'text-amber-600',
      border: darkMode ? 'border-slate-800' : 'border-amber-100',
    },
    slate: {
      bg: darkMode ? 'bg-slate-800/60' : 'bg-slate-50',
      text: darkMode ? 'text-slate-300' : 'text-slate-600',
      border: darkMode ? 'border-slate-800' : 'border-slate-100',
    },
    rose: {
      bg: darkMode ? 'bg-rose-950/40' : 'bg-rose-50',
      text: darkMode ? 'text-rose-400' : 'text-rose-600',
      border: darkMode ? 'border-slate-800' : 'border-rose-100',
    },
    emerald: {
      bg: darkMode ? 'bg-emerald-950/40' : 'bg-emerald-50',
      text: darkMode ? 'text-emerald-400' : 'text-emerald-600',
      border: darkMode ? 'border-slate-800' : 'border-emerald-100',
    }
  };

  const selectedColor = colorMaps[color] || colorMaps.slate;

  return (
    <div 
      id={id} 
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
        darkMode 
          ? 'border-slate-800 bg-slate-900 text-slate-100' 
          : 'border-slate-200 bg-white text-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="font-sans text-xs font-bold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <p className={`font-sans text-3xl font-extrabold tracking-tight ${
            darkMode ? 'text-slate-100' : 'text-slate-800'
          }`}>
            {value}
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${selectedColor.bg} ${selectedColor.text}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className={`mt-4 font-mono text-[11px] ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {description}
      </p>
    </div>
  );
}
