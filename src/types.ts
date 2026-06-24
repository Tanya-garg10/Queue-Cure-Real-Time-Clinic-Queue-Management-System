/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PatientStatus = 'waiting' | 'active' | 'completed' | 'skipped';

export interface Patient {
  id: string;
  tokenNumber: string;
  patientName: string;
  patientPhone: string;
  age: number;
  gender: string;
  symptoms: string;
  status: PatientStatus;
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
}

export interface QueueState {
  patients: Patient[];
  averageConsultationTime: number; // in minutes
  lastTokenCount: number; // to keep track of sequential token generation
}

export interface QueueStats {
  waitingCount: number;
  completedCount: number;
  activeToken: string | null;
  activePatientName: string | null;
  estimatedWaitTime: number; // for a new patient joining
}
