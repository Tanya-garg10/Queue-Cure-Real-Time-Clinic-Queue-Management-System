/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Patient, QueueState } from './src/types';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'queue-db.json');

app.use(express.json());

// Initialize Queue State
let state: QueueState = {
  patients: [],
  averageConsultationTime: 10, // Default 10 minutes per patient
  lastTokenCount: 0
};

// Load state from file if exists
function loadState() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      state = JSON.parse(data);
      console.log('Successfully loaded state from file. Patients count:', state.patients.length);
    } else {
      saveState();
    }
  } catch (error) {
    console.error('Error loading state, initializing empty:', error);
  }
}

// Save state to file
function saveState() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving state to file:', error);
  }
}

loadState();

// SSE (Server-Sent Events) clients list
let sseClients: express.Response[] = [];

// Helper to broadcast changes to all SSE clients
function broadcastStateUpdate() {
  const payload = `data: ${JSON.stringify(state)}\n\n`;
  console.log(`Broadcasting queue update to ${sseClients.length} clients...`);
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch (err) {
      console.error('Failed to write to SSE client, connection might be dead:', err);
    }
  });
}

// Event stream endpoint for Real-Time Sync
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });
  
  // Send initial state immediately
  res.write(`data: ${JSON.stringify(state)}\n\n`);
  
  sseClients.push(res);
  console.log(`New client connected to real-time events. Total clients: ${sseClients.length}`);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
    console.log(`Client disconnected. Total remaining clients: ${sseClients.length}`);
  });
});

// REST APIs

// 1. Get current queue state
app.get('/api/queue', (req, res) => {
  res.json(state);
});

// 2. Add patient (Generate Token)
app.post('/api/add-patient', (req, res) => {
  const { patientName, patientPhone, age, gender, symptoms } = req.body;

  if (!patientName) {
    res.status(400).json({ error: 'Patient name is required' });
    return;
  }

  // Token sequential count increment
  state.lastTokenCount += 1;
  const tokenNumber = `T${state.lastTokenCount}`;

  const newPatient: Patient = {
    id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tokenNumber,
    patientName,
    patientPhone: patientPhone || '',
    age: Number(age) || 0,
    gender: gender || 'Other',
    symptoms: symptoms || 'General Checkup',
    status: 'waiting',
    createdAt: new Date().toISOString()
  };

  state.patients.push(newPatient);
  saveState();
  broadcastStateUpdate();

  res.status(201).json({ message: 'Patient added successfully', patient: newPatient });
});

// 3. Call next patient (Active state transition)
app.post('/api/next-token', (req, res) => {
  // Find currently active patient(s) and mark them as completed
  const activePatients = state.patients.filter(p => p.status === 'active');
  activePatients.forEach(p => {
    p.status = 'completed';
    p.completedAt = new Date().toISOString();
  });

  // Find the first waiting patient and set them to active
  const nextPatient = state.patients.find(p => p.status === 'waiting');
  if (nextPatient) {
    nextPatient.status = 'active';
    nextPatient.calledAt = new Date().toISOString();
  }

  saveState();
  broadcastStateUpdate();

  res.json({ 
    message: nextPatient ? `Calling token ${nextPatient.tokenNumber}` : 'No patients in waiting line.',
    activePatient: nextPatient || null
  });
});

// 4. Mark specific token as completed
app.post('/api/complete-token', (req, res) => {
  const { id } = req.body;
  
  let targetPatient: Patient | undefined;
  
  if (id) {
    targetPatient = state.patients.find(p => p.id === id);
  } else {
    // If no ID is provided, complete the currently active patient
    targetPatient = state.patients.find(p => p.status === 'active');
  }

  if (!targetPatient) {
    res.status(404).json({ error: 'No active or specified patient found to complete.' });
    return;
  }

  targetPatient.status = 'completed';
  targetPatient.completedAt = new Date().toISOString();
  
  saveState();
  broadcastStateUpdate();

  res.json({ message: `Token ${targetPatient.tokenNumber} completed successfully.`, patient: targetPatient });
});

// 5. Skip/No-show specific token
app.post('/api/skip-token', (req, res) => {
  const { id } = req.body;

  let targetPatient: Patient | undefined;
  if (id) {
    targetPatient = state.patients.find(p => p.id === id);
  } else {
    targetPatient = state.patients.find(p => p.status === 'active');
  }

  if (!targetPatient) {
    res.status(404).json({ error: 'No active or specified patient found to skip.' });
    return;
  }

  targetPatient.status = 'skipped';
  saveState();
  broadcastStateUpdate();

  res.json({ message: `Token ${targetPatient.tokenNumber} marked as skipped.`, patient: targetPatient });
});

// 6. Update average consultation time setting
app.post('/api/settings', (req, res) => {
  const { averageConsultationTime } = req.body;
  const newTime = Number(averageConsultationTime);

  if (isNaN(newTime) || newTime <= 0) {
    res.status(400).json({ error: 'Invalid consultation time' });
    return;
  }

  state.averageConsultationTime = newTime;
  saveState();
  broadcastStateUpdate();

  res.json({ message: 'Settings updated successfully', averageConsultationTime: state.averageConsultationTime });
});

// 7. Reset queue completely (Clear patients, reset token counters)
app.post('/api/reset-queue', (req, res) => {
  state.patients = [];
  state.lastTokenCount = 0;
  saveState();
  broadcastStateUpdate();
  res.json({ message: 'Queue and token counters reset successfully' });
});


// Start server and handle Vite development mode / Static file server in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully booted and listening on http://localhost:${PORT}`);
  });
}

startServer();
