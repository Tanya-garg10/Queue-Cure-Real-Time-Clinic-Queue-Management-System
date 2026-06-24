/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';
import { Search, UserCheck, Trash2, Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle, Download } from 'lucide-react';

interface QueueListTableProps {
  patients: Patient[];
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onCallPatient: () => void;
  onReset: () => void;
  darkMode?: boolean;
}

export default function QueueListTable({
  patients,
  onComplete,
  onSkip,
  onCallPatient,
  onReset,
  darkMode = false
}: QueueListTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Filter & search patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientPhone.includes(searchTerm);

    const matchesFilter = statusFilter === 'all' ? true : patient.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset animate-pulse ${
            darkMode 
              ? 'bg-blue-950/50 text-blue-300 ring-blue-500/30' 
              : 'bg-blue-50 text-blue-700 ring-blue-600/20'
          }`}>
            <Clock className="h-3 w-3" />
            <span>Active</span>
          </span>
        );
      case 'waiting':
        return (
          <span className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            darkMode 
              ? 'bg-amber-950/50 text-amber-300 ring-amber-500/30' 
              : 'bg-amber-50 text-amber-700 ring-amber-600/10'
          }`}>
            <Clock className="h-3 w-3" />
            <span>Waiting</span>
          </span>
        );
      case 'completed':
        return (
          <span className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            darkMode 
              ? 'bg-emerald-950/50 text-emerald-300 ring-emerald-500/30' 
              : 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
          }`}>
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      case 'skipped':
        return (
          <span className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            darkMode 
              ? 'bg-rose-950/50 text-rose-300 ring-rose-500/30' 
              : 'bg-rose-50 text-rose-700 ring-rose-600/10'
          }`}>
            <XCircle className="h-3 w-3" />
            <span>Skipped</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportCSV = () => {
    if (patients.length === 0) return;
    const headers = ['Token Number', 'Patient Name', 'Phone', 'Age', 'Gender', 'Symptoms', 'Status', 'Registered At', 'Called At', 'Completed At'];
    const rows = patients.map(p => [
      p.tokenNumber,
      `"${p.patientName.replace(/"/g, '""')}"`,
      p.patientPhone,
      p.age,
      p.gender,
      `"${p.symptoms.replace(/"/g, '""')}"`,
      p.status,
      new Date(p.createdAt).toLocaleString(),
      p.calledAt ? new Date(p.calledAt).toLocaleString() : '',
      p.completedAt ? new Date(p.completedAt).toLocaleString() : ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `patient_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
  };

  const handleExportJSON = () => {
    if (patients.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patients, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `patient_queue_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  return (
    <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${
      darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
    }`}>
      {/* Table Toolbar / Controls */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4 mb-6">
        <div>
          <h3 className={`font-sans text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Clinic Patient Queue</h3>
          <p className={`font-mono text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Patients Registered Today: {patients.length}
          </p>
        </div>

        {/* Action Controls (Export and Reset) */}
        <div className="flex items-center space-x-2 relative">
          
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className={`flex items-center space-x-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition active:scale-95 ${
                darkMode
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              id="btn-export-queue-dropdown"
              disabled={patients.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Queue</span>
            </button>

            {showExportDropdown && (
              <div className={`absolute right-0 mt-2 w-44 rounded-xl border shadow-xl z-20 p-1.5 space-y-1 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'
              }`}>
                <button
                  onClick={handleExportCSV}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition ${
                    darkMode ? 'hover:bg-slate-700 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  Download as CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition ${
                    darkMode ? 'hover:bg-slate-700 hover:text-white' : 'hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  Download as JSON
                </button>
              </div>
            )}
          </div>

          {/* Clear/Reset Database */}
          <div className="flex items-center space-x-2">
            {showConfirmReset ? (
              <div className={`flex items-center space-x-1.5 rounded-xl p-1 ring-1 ${
                darkMode ? 'bg-rose-950/40 ring-rose-900' : 'bg-rose-50 ring-rose-100'
              }`}>
                <span className={`font-sans text-xs font-medium px-2 ${darkMode ? 'text-rose-300' : 'text-rose-700'}`}>Reset queue?</span>
                <button
                  onClick={() => {
                    onReset();
                    setShowConfirmReset(false);
                  }}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold border ${
                    darkMode 
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  darkMode
                    ? 'border-slate-700 bg-slate-800 text-slate-400 hover:border-rose-900 hover:text-rose-400'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-rose-100 hover:text-rose-600'
                }`}
                id="btn-reset-queue"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Board</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Inputs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div className="relative col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by patient name, phone, or token (e.g. T1)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border py-2.5 pl-10 pr-4 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
            }`}
            id="input-queue-search"
          />
        </div>

        {/* Status Filters */}
        <div className={`flex space-x-1.5 overflow-x-auto rounded-xl p-1 transition ${
          darkMode ? 'bg-slate-800' : 'bg-slate-100'
        }`}>
          {(['all', 'waiting', 'active', 'completed', 'skipped'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize tracking-wide transition ${
                statusFilter === filter
                  ? darkMode
                    ? 'bg-slate-900 text-slate-100 shadow-sm'
                    : 'bg-white text-slate-800 shadow-sm'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table */}
      <div className={`overflow-x-auto rounded-xl border ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className={darkMode ? 'bg-slate-800/70' : 'bg-slate-50/70'}>
            <tr>
              <th scope="col" className={`px-4 py-3 text-left font-sans text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Token
              </th>
              <th scope="col" className={`px-4 py-3 text-left font-sans text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Patient Info
              </th>
              <th scope="col" className={`px-4 py-3 text-left font-sans text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Symptoms / Checkup
              </th>
              <th scope="col" className={`px-4 py-3 text-left font-sans text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Registered
              </th>
              <th scope="col" className={`px-4 py-3 text-left font-sans text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Status
              </th>
              <th scope="col" className={`px-4 py-3 text-right font-sans text-xs font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 transition-colors duration-300 ${
            darkMode ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white'
          }`}>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className={`transition ${
                  darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'
                }`}>
                  {/* Token Number */}
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`font-mono text-sm font-extrabold px-2.5 py-1 rounded-lg border ${
                      darkMode 
                        ? 'text-blue-400 bg-blue-950/40 border-blue-900/50' 
                        : 'text-blue-600 bg-blue-50 border-blue-100'
                    }`}>
                      {patient.tokenNumber}
                    </span>
                  </td>

                  {/* Patient Info */}
                  <td className="px-4 py-4">
                    <div className={`font-sans text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {patient.patientName}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`font-sans text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {patient.age} yrs • {patient.gender}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={`font-mono text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {patient.patientPhone || 'No Phone'}
                      </span>
                    </div>
                  </td>

                  {/* Symptoms */}
                  <td className={`px-4 py-4 font-sans text-xs max-w-xs truncate ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {patient.symptoms}
                  </td>

                  {/* Registered Timestamp */}
                  <td className={`whitespace-nowrap px-4 py-4 font-mono text-[11px] ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>

                  {/* Status Badge */}
                  <td className="whitespace-nowrap px-4 py-4">
                    {getStatusBadge(patient.status)}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-4 py-4 text-right text-xs font-medium">
                    <div className="flex items-center justify-end space-x-1.5">
                      {patient.status === 'waiting' && (
                        <>
                          <button
                            onClick={() => onSkip(patient.id)}
                            className={`rounded-lg p-1 transition ${
                              darkMode 
                                ? 'text-slate-400 hover:bg-rose-950/50 hover:text-rose-400' 
                                : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                            title="Mark as Skipped"
                          >
                            <XCircle className="h-4.5 w-4.5" />
                          </button>
                        </>
                      )}
                      {patient.status === 'active' && (
                        <>
                          <button
                            onClick={() => onComplete(patient.id)}
                            className={`flex items-center space-x-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                              darkMode 
                                ? 'bg-blue-950/80 text-blue-300 hover:bg-blue-900/80' 
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                            title="Complete Consultation"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Complete</span>
                          </button>
                          <button
                            onClick={() => onSkip(patient.id)}
                            className={`flex items-center space-x-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                              darkMode 
                                ? 'bg-rose-950/80 text-rose-300 hover:bg-rose-900/80' 
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                            title="Skip / No Show"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Skip</span>
                          </button>
                        </>
                      )}
                      {(patient.status === 'completed' || patient.status === 'skipped') && (
                        <span className={`font-mono text-[10px] italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          No actions
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className={`h-8 w-8 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
                    <p className={`font-sans text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No patients found</p>
                    <p className={`font-mono text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Try adjusting your filters or adding a new patient.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
