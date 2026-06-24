/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QueueState, Patient } from '../types';
import { Clock, Users, ArrowRight, CheckCircle, Search, HelpCircle, Activity } from 'lucide-react';

interface PatientViewProps {
  queueState: QueueState;
  darkMode?: boolean;
}

export default function PatientView({ queueState, darkMode = false }: PatientViewProps) {
  const [searchToken, setSearchToken] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<Patient | null>(null);
  const [searchError, setSearchError] = useState('');

  // Extract critical stats
  const activePatient = queueState.patients.find(p => p.status === 'active');
  const waitingPatients = queueState.patients.filter(p => p.status === 'waiting');
  const completedPatientsCount = queueState.patients.filter(p => p.status === 'completed').length;
  const avgTime = queueState.averageConsultationTime;

  // Upcoming patients list (next 3)
  const upcomingPatients = waitingPatients.slice(0, 3);

  // Search token logic
  const handleSearchToken = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchedPatient(null);

    if (!searchToken.trim()) {
      setSearchError('Please enter a token number.');
      return;
    }

    const tokenNormalized = searchToken.trim().toUpperCase();
    const patient = queueState.patients.find(
      p => p.tokenNumber.toUpperCase() === tokenNormalized
    );

    if (!patient) {
      setSearchError(`Token "${tokenNormalized}" was not found in today's registry.`);
      return;
    }

    setSearchedPatient(patient);
  };

  // Calculate position and wait time for a patient
  const getPatientPositionInfo = (patient: Patient) => {
    if (patient.status === 'active') {
      return { position: 0, waitTime: 0, message: 'You are currently being called! Please proceed to the doctor immediately.' };
    }
    if (patient.status === 'completed') {
      return { position: -1, waitTime: 0, message: 'Your checkup has already been completed.' };
    }
    if (patient.status === 'skipped') {
      return { position: -1, waitTime: 0, message: 'Your token was marked as skipped because you were not present.' };
    }

    // Find index of patient in the waiting sublist
    const indexInWaiting = waitingPatients.findIndex(p => p.id === patient.id);
    if (indexInWaiting === -1) {
      return { position: -1, waitTime: 0, message: 'Checking position...' };
    }

    const position = indexInWaiting + 1;
    const waitTime = indexInWaiting * avgTime;

    return {
      position,
      waitTime,
      message: `There are ${indexInWaiting} patient${indexInWaiting === 1 ? '' : 's'} ahead of you. Estimated wait time is approximately ${waitTime} minutes.`
    };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Dynamic Intro/Alert Banner */}
      <div className={`rounded-2xl border p-5 flex items-start space-x-4 transition ${
        darkMode 
          ? 'bg-blue-950/20 border-blue-900/40' 
          : 'bg-blue-50 border-blue-100'
      }`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h3 className={`font-sans text-sm font-bold ${darkMode ? 'text-blue-300' : 'text-blue-950'}`}>
            City Heart Wellness Centre — Real-Time Monitor
          </h3>
          <p className={`font-sans text-xs mt-1 leading-relaxed ${darkMode ? 'text-blue-400' : 'text-blue-700/90'}`}>
            Welcome! To ensure absolute physical distancing and reduce wait stress, our queue is updated live. 
            You do not need to refresh this page. Keep this tab open to monitor your slot in real time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Live Token Status Panel (Left/Center Column) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Main Visual Callboard */}
          <div className={`overflow-hidden rounded-2xl border transition ${
            darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
          } shadow-sm`}>
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Now Calling / Consulting</span>
              <span className="bg-white/20 text-[10px] px-3 py-1 font-mono font-bold rounded-full backdrop-blur-md">
                LIVE BROADCAST
              </span>
            </div>
            
            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="text-7xl font-black text-blue-500 tabular-nums animate-pulse">
                  {activePatient ? activePatient.tokenNumber : '--'}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    {activePatient ? activePatient.patientName : 'No Token Active'}
                  </h2>
                  <p className={`font-medium text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activePatient 
                      ? `${activePatient.gender} • ${activePatient.age} Years • ${activePatient.symptoms}` 
                      : 'Doctor is preparing for the next consultation.'}
                  </p>
                </div>
              </div>
              
              {activePatient && (
                <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border shrink-0 ${
                  darkMode 
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                }`}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold tracking-wide uppercase">IN DOCTOR'S CABIN</span>
                </div>
              )}
            </div>
          </div>

          {/* Search Personal Token Status */}
          <div className={`rounded-2xl border p-6 shadow-sm transition ${
            darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
          }`}>
            <h3 className={`font-sans text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'} mb-2`}>
              Check Your Queue Position
            </h3>
            <p className={`font-sans text-xs mb-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Enter the token number printed on your receipt (e.g., T1, T2) to see your real-time wait status.
            </p>

            <form onSubmit={handleSearchToken} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="Enter your Token Number (e.g. T4)"
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                  className={`w-full rounded-xl border py-3 pl-11 pr-4 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                  id="input-patient-token-search"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition text-sm shrink-0"
              >
                Track Slot
              </button>
            </form>

            {searchError && (
              <p className="mt-3 font-sans text-xs font-semibold text-rose-500">{searchError}</p>
            )}

            {/* Checked Patient Result */}
            {searchedPatient && (
              <div className={`mt-6 rounded-xl border p-5 space-y-4 ${
                darkMode ? 'border-blue-900 bg-blue-950/20' : 'border-blue-100 bg-blue-50/50'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${
                  darkMode ? 'border-blue-900/50' : 'border-blue-100/60'
                }`}>
                  <div>
                    <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</span>
                    <h4 className={`font-sans text-base font-bold mt-0.5 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {searchedPatient.patientName}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">Token</span>
                    <div className={`font-mono text-base font-extrabold mt-0.5 border px-2.5 py-0.5 rounded-lg ${
                      darkMode 
                        ? 'text-blue-400 bg-blue-950 border-blue-900' 
                        : 'text-blue-600 bg-white border-blue-100'
                    }`}>
                      {searchedPatient.tokenNumber}
                    </div>
                  </div>
                </div>

                {(() => {
                  const info = getPatientPositionInfo(searchedPatient);
                  return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {info.position >= 0 && (
                        <div className={`p-3 rounded-lg border text-center ${
                          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100/50'
                        }`}>
                          <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Position</span>
                          <span className={`font-sans text-2xl font-black block mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {info.position === 0 ? 'Now' : `#${info.position}`}
                          </span>
                        </div>
                      )}
                      {info.position >= 0 && (
                        <div className={`p-3 rounded-lg border text-center col-span-2 ${
                          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100/50'
                        }`}>
                          <span className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Wait Time</span>
                          <span className="font-sans text-xl font-bold text-blue-500 block mt-1">
                            {info.position === 0 ? 'Doctor is Ready' : `~${info.waitTime} mins`}
                          </span>
                        </div>
                      )}
                      <div className={`col-span-full font-sans text-xs font-medium p-3 rounded-lg border ${
                        darkMode ? 'text-slate-300 bg-slate-900/50 border-slate-800' : 'text-slate-600 bg-white/60 border-blue-50'
                      }`}>
                        {info.message}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Live Patient Display Monitor Sidebar (Right Column) */}
        <div className="w-full">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col h-full min-h-[480px]">
            <div className="flex items-center gap-2 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Live Patient Display</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Currently At Doctor</span>
              <div className="text-7xl font-black text-blue-400 mb-2 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                {activePatient ? activePatient.tokenNumber : '--'}
              </div>
              <p className="text-slate-400 font-medium text-xs truncate max-w-[240px]">
                {activePatient ? activePatient.patientName : 'No active consultation'}
              </p>
              
              <div className="h-px w-16 bg-slate-800 my-6"></div>
              
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Coming Up Next</span>
              
              <div className="w-full space-y-3">
                {upcomingPatients.length > 0 ? (
                  upcomingPatients.map((patient, idx) => (
                    <div 
                      key={patient.id} 
                      className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${
                        idx === 0 
                          ? 'bg-slate-800/80 border-slate-700' 
                          : 'bg-slate-800/30 border-transparent'
                      }`}
                    >
                      <div className="text-left">
                        <span className={`text-lg font-black ${idx === 0 ? 'text-teal-400' : 'text-slate-400'}`}>
                          {patient.tokenNumber}
                        </span>
                        <p className="text-slate-400 text-xs font-medium truncate max-w-[140px] mt-0.5">
                          {patient.patientName}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        idx === 0 
                          ? 'text-emerald-400 bg-emerald-500/10' 
                          : 'text-slate-500 bg-slate-800'
                      }`}>
                        {idx === 0 ? 'PREPARING' : 'WAITING'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs italic py-4">No patients are waiting in the queue.</div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">People Ahead</span>
                <span className="font-bold font-mono text-slate-300">{waitingPatients.length} Patients</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Avg. Consultation</span>
                <span className="font-bold font-mono text-slate-300">{avgTime} min</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Est. Total Wait</span>
                <span className="font-bold font-mono text-blue-400">{waitingPatients.length * avgTime} min</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
