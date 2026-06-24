/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Patient } from '../types';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Clock, BarChart3, Info } from 'lucide-react';

interface AnalyticsSectionProps {
  patients: Patient[];
  averageConsultationTime: number;
  darkMode?: boolean;
}

interface HourlyData {
  hourStr: string;
  hour: number;
  patientsRegistered: number;
  avgWaitTime: number; // in minutes
}

export default function AnalyticsSection({ 
  patients, 
  averageConsultationTime,
  darkMode = false
}: AnalyticsSectionProps) {
  // Compute analytics hourly data
  const hourlyReport = useMemo(() => {
    // Standard clinic hours: 9:00 to 18:00 (6 PM)
    const hours = Array.from({ length: 10 }, (_, i) => i + 9); // [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

    const report: HourlyData[] = hours.map(hour => {
      const label = hour === 12 
        ? '12 PM' 
        : hour > 12 
          ? `${hour - 12} PM` 
          : `${hour} AM`;

      // Filter patients registered in this hour today
      const patientsInHour = patients.filter(p => {
        const date = new Date(p.createdAt);
        return date.getHours() === hour;
      });

      // Calculate actual wait times if completed/called, otherwise estimate
      let totalWait = 0;
      patientsInHour.forEach((p, idx) => {
        if (p.calledAt && p.createdAt) {
          const diffMs = new Date(p.calledAt).getTime() - new Date(p.createdAt).getTime();
          const diffMins = Math.max(1, Math.round(diffMs / 60000));
          totalWait += diffMins;
        } else {
          // If not called yet, use positional estimation as baseline
          totalWait += idx * averageConsultationTime;
        }
      });

      const avgWait = patientsInHour.length > 0 
        ? Math.round(totalWait / patientsInHour.length) 
        : 0;

      return {
        hourStr: label,
        hour,
        patientsRegistered: patientsInHour.length,
        avgWaitTime: avgWait
      };
    });

    // Check if we have any active data, if not provide a subtle, beautiful placeholder curve to teach the user
    const hasData = patients.length > 0;
    
    if (!hasData) {
      // Provide high-fidelity baseline mockup trends representing a standard clinic day so the charts look professional immediately
      const demoPatterns = [
        { hourStr: '9 AM', hour: 9, patientsRegistered: 4, avgWaitTime: 15 },
        { hourStr: '10 AM', hour: 10, patientsRegistered: 8, avgWaitTime: 25 },
        { hourStr: '11 AM', hour: 11, patientsRegistered: 12, avgWaitTime: 40 },
        { hourStr: '12 PM', hour: 12, patientsRegistered: 6, avgWaitTime: 30 },
        { hourStr: '1 PM', hour: 13, patientsRegistered: 3, avgWaitTime: 10 },
        { hourStr: '2 PM', hour: 14, patientsRegistered: 7, avgWaitTime: 20 },
        { hourStr: '3 PM', hour: 15, patientsRegistered: 9, avgWaitTime: 35 },
        { hourStr: '4 PM', hour: 16, patientsRegistered: 11, avgWaitTime: 45 },
        { hourStr: '5 PM', hour: 17, patientsRegistered: 5, avgWaitTime: 25 },
        { hourStr: '6 PM', hour: 18, patientsRegistered: 2, avgWaitTime: 12 }
      ];
      return { data: demoPatterns, isDemo: true };
    }

    return { data: report, isDemo: false };
  }, [patients, averageConsultationTime]);

  const totalRegisteredToday = patients.length;
  const averageWaitTimeToday = useMemo(() => {
    if (patients.length === 0) return 24; // Baseline default demo
    let total = 0;
    let count = 0;
    patients.forEach((p, idx) => {
      if (p.calledAt) {
        const diff = new Date(p.calledAt).getTime() - new Date(p.createdAt).getTime();
        total += Math.max(1, Math.round(diff / 60000));
        count++;
      } else if (p.status === 'waiting') {
        total += idx * averageConsultationTime;
        count++;
      }
    });
    return count > 0 ? Math.round(total / count) : 0;
  }, [patients, averageConsultationTime]);

  // Find peak hour
  const peakHourInfo = useMemo(() => {
    let maxPatients = 0;
    let peakLabel = 'None';
    hourlyReport.data.forEach(item => {
      if (item.patientsRegistered > maxPatients) {
        maxPatients = item.patientsRegistered;
        peakLabel = item.hourStr;
      }
    });
    return { label: peakLabel, count: maxPatients };
  }, [hourlyReport]);

  return (
    <div className={`rounded-2xl border p-6 shadow-sm space-y-6 transition-colors duration-300 ${
      darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
    }`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 ${
        darkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className={`font-sans text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              Queue Analytics & Trends
            </h3>
          </div>
          <p className={`font-sans text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time visual monitoring of patient traffic, bottlenecks, and service performance.
          </p>
        </div>

        {hourlyReport.isDemo && (
          <div className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 border self-start sm:self-center ${
            darkMode ? 'bg-amber-950/40 border-amber-900 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-700'
          }`}>
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider">
              Showing baseline sample curves
            </span>
          </div>
        )}
      </div>

      {/* Analytics Mini Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`rounded-xl p-4 border transition ${
          darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Traffic Hour</span>
          <span className={`font-sans text-lg font-extrabold block mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {peakHourInfo.count > 0 ? `${peakHourInfo.label} (${peakHourInfo.count} pts)` : 'N/A'}
          </span>
          <span className={`font-sans text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Hour with maximum patient inflow
          </span>
        </div>

        <div className={`rounded-xl p-4 border transition ${
          darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Service Wait</span>
          <span className="font-sans text-lg font-extrabold text-blue-500 block mt-1">
            ~{averageWaitTimeToday} mins
          </span>
          <span className={`font-sans text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Average overall clinic waiting time
          </span>
        </div>

        <div className={`rounded-xl p-4 border transition ${
          darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inflow Volume</span>
          <span className="font-sans text-lg font-extrabold text-emerald-500 block mt-1">
            {totalRegisteredToday} Patient Registrations
          </span>
          <span className={`font-sans text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Recorded registrations today
          </span>
        </div>
      </div>

      {/* Charts Visualization Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Patient Inflow Curve */}
        <div className={`rounded-xl border p-4 space-y-4 transition ${
          darkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className={`font-sans text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Patient Inflow (Hourly)
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">REGISTERED COUNT</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyReport.data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                <XAxis 
                  dataKey="hourStr" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#1e293b', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    border: darkMode ? '1px solid #334155' : 'none',
                    fontFamily: 'sans-serif',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="patientsRegistered" 
                  name="Patients"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorInflow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Wait Time (Bar Chart) */}
        <div className={`rounded-xl border p-4 space-y-4 transition ${
          darkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span className={`font-sans text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Service Wait Times (mins)
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">AVERAGE MINUTES</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyReport.data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
                <XAxis 
                  dataKey="hourStr" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: darkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#0f172a' : '#1e293b', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    border: darkMode ? '1px solid #334155' : 'none',
                    fontFamily: 'sans-serif',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value} minutes`, 'Avg Wait']}
                />
                <Bar 
                  dataKey="avgWaitTime" 
                  name="Avg Wait Time"
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
