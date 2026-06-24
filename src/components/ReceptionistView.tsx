/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Patient, QueueState } from '../types';
import StatCard from './StatCard';
import QueueListTable from './QueueListTable';
import AnalyticsSection from './AnalyticsSection';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Play, 
  CheckSquare, 
  Settings, 
  Activity, 
  Smile, 
  UserCheck 
} from 'lucide-react';

interface ReceptionistViewProps {
  queueState: QueueState;
  onAddPatient: (patientData: {
    patientName: string;
    patientPhone: string;
    age: number;
    gender: string;
    symptoms: string;
  }) => Promise<void>;
  onNextToken: () => Promise<void>;
  onCompleteToken: (id?: string) => Promise<void>;
  onSkipToken: (id: string) => Promise<void>;
  onUpdateSettings: (avgTime: number) => Promise<void>;
  onResetQueue: () => Promise<void>;
  darkMode?: boolean;
}

export default function ReceptionistView({
  queueState,
  onAddPatient,
  onNextToken,
  onCompleteToken,
  onSkipToken,
  onUpdateSettings,
  onResetQueue,
  darkMode = false
}: ReceptionistViewProps) {
  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [symptoms, setSymptoms] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings State
  const [avgConsultTime, setAvgConsultTime] = useState(queueState.averageConsultationTime.toString());
  const [settingsFeedback, setSettingsFeedback] = useState('');

  // Queue calculations
  const waitingPatientsCount = queueState.patients.filter((p) => p.status === 'waiting').length;
  const completedPatientsCount = queueState.patients.filter((p) => p.status === 'completed').length;
  const activePatient = queueState.patients.find((p) => p.status === 'active');

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!patientName.trim()) {
      setFormError('Patient name is required');
      setIsSubmitting(false);
      return;
    }

    const patientAge = age ? parseInt(age, 10) : 0;
    if (age && (isNaN(patientAge) || patientAge < 0 || patientAge > 125)) {
      setFormError('Please enter a valid age between 0 and 125');
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddPatient({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        age: patientAge,
        gender,
        symptoms: symptoms.trim() || 'General checkup'
      });

      // Reset form
      setPatientName('');
      setPatientPhone('');
      setAge('');
      setGender('Male');
      setSymptoms('');
    } catch (err) {
      setFormError('Failed to add patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedback('');
    const numericTime = Number(avgConsultTime);

    if (isNaN(numericTime) || numericTime <= 0) {
      setSettingsFeedback('Please enter a valid positive number');
      return;
    }

    try {
      await onUpdateSettings(numericTime);
      setSettingsFeedback('Updated successfully!');
      setTimeout(() => setSettingsFeedback(''), 3000);
    } catch (err) {
      setSettingsFeedback('Failed to update settings');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          id="card-active-token"
          title="Now Calling"
          value={activePatient ? activePatient.tokenNumber : 'None'}
          description={activePatient ? `Patient: ${activePatient.patientName}` : 'Waiting to call next patient'}
          icon={Activity}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          id="card-waiting-count"
          title="Waiting Line"
          value={waitingPatientsCount}
          description="Patients waiting for consultation"
          icon={Users}
          color="amber"
          darkMode={darkMode}
        />
        <StatCard
          id="card-completed-count"
          title="Completed Cases"
          value={completedPatientsCount}
          description="Successfully treated today"
          icon={UserCheck}
          color="emerald"
          darkMode={darkMode}
        />
        <StatCard
          id="card-average-time"
          title="Avg Checkup Time"
          value={`${queueState.averageConsultationTime} min`}
          description="Estimated consult per person"
          icon={Clock}
          color="slate"
          darkMode={darkMode}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Registration Column (Left) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Patient Registration */}
          <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${
            darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
          }`}>
            <div className={`flex items-center space-x-3 border-b pb-4 mb-5 ${
              darkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                darkMode ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-50 text-blue-600'
              }`}>
                <UserPlus className="h-5 w-5" />
              </div>
              <h3 className={`font-sans text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Register New Patient
              </h3>
            </div>

            <form onSubmit={handleSubmitPatient} className="space-y-4">
              {formError && (
                <div className={`rounded-xl p-3.5 border ${
                  darkMode ? 'bg-rose-950/30 border-rose-900/50' : 'bg-rose-50 border-rose-100'
                }`}>
                  <p className={`font-sans text-xs font-semibold ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>
                    {formError}
                  </p>
                </div>
              )}

              {/* Patient Name */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                  id="input-patient-name"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">Age (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="125"
                    placeholder="e.g. 35"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                    id="input-patient-age"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                    id="select-patient-gender"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                  id="input-patient-phone"
                />
              </div>

              {/* Symptoms */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">Symptoms / Reason</label>
                <textarea
                  placeholder="e.g. Cough, high fever, chest pain..."
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                  }`}
                  id="textarea-patient-symptoms"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 focus:outline-none transition active:scale-95 disabled:opacity-70"
                id="btn-submit-patient"
              >
                {isSubmitting ? 'Registering...' : 'Add Patient to Queue'}
              </button>
            </form>
          </div>

          {/* Quick Average Consultation Time Settings */}
          <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${
            darkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
          }`}>
            <div className={`flex items-center space-x-3 border-b pb-4 mb-5 ${
              darkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'
              }`}>
                <Settings className="h-5 w-5" />
              </div>
              <h3 className={`font-sans text-base font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Queue Settings</h3>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Consultation (mins)</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="10"
                    value={avgConsultTime}
                    onChange={(e) => setAvgConsultTime(e.target.value)}
                    className={`w-full rounded-xl border py-2.5 pl-3.5 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                      darkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' 
                        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                    id="input-avg-consultation-time"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="font-sans text-xs text-slate-400">mins</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-sans text-xs text-emerald-600 font-semibold">{settingsFeedback}</span>
                <button
                  type="submit"
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                    darkMode
                      ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  id="btn-save-settings"
                >
                  Save Time
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Call Patient & Core Queue Columns (Right) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Call Control Board */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl text-white">
            <h3 className="font-sans text-sm font-extrabold tracking-wider text-blue-400 uppercase">
              Reception Calling Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
              <div>
                {activePatient ? (
                  <div className="space-y-2">
                    <div className="font-sans text-xs text-slate-400 font-bold tracking-wider uppercase">Currently with Doctor</div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-4xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.25)]">{activePatient.tokenNumber}</span>
                      <span className="text-xl font-bold font-sans text-slate-100 truncate">{activePatient.patientName}</span>
                    </div>
                    <div className="font-sans text-xs text-slate-400">
                      Called at: {new Date(activePatient.calledAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-sans text-xs text-slate-400 font-bold tracking-wider uppercase">Current Clinic State</div>
                    <div className="font-sans text-xl font-bold text-slate-200">No Patient is Active</div>
                    <div className="font-sans text-xs text-slate-400">
                      {waitingPatientsCount > 0 
                        ? `${waitingPatientsCount} patients are waiting. Click "Call Next Patient" to start.` 
                        : 'Waiting list is currently empty.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Fast Controls */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 md:flex-col md:space-x-0 md:space-y-3 justify-end">
                <button
                  onClick={onNextToken}
                  disabled={waitingPatientsCount === 0}
                  className="flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 cursor-pointer transition shadow-lg shadow-blue-600/20 active:scale-95 animate-pulse"
                  id="btn-call-next"
                >
                  <Play className="h-4.5 w-4.5 fill-current" />
                  <span>Call Next Patient</span>
                </button>

                {activePatient && (
                  <button
                    onClick={() => onCompleteToken()}
                    className="flex items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-bold text-slate-100 hover:bg-slate-700 transition active:scale-95"
                    id="btn-complete-current"
                  >
                    <CheckSquare className="h-4.5 w-4.5" />
                    <span>Complete Consultation</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Queue Table */}
          <QueueListTable
            patients={queueState.patients}
            onComplete={(id) => onCompleteToken(id)}
            onSkip={(id) => onSkipToken(id)}
            onCallPatient={onNextToken}
            onReset={onResetQueue}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Analytics Visualization Section */}
      <div className={`pt-6 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <AnalyticsSection 
          patients={queueState.patients} 
          averageConsultationTime={queueState.averageConsultationTime} 
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
