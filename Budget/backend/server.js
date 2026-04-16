import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_PATH = join(process.cwd(), 'data', 'entries.json');

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

function readEntries() {
  try {
    const data = readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  writeFileSync(DATA_PATH, JSON.stringify(entries, null, 2));
}

app.get('/entries', (req, res) => {
  const entries = readEntries();
  res.json(entries);
});

app.post('/entries', (req, res) => {
  const entries = readEntries();
  const newEntry = {
    id: Date.now(),
    ...req.body
  };
  entries.push(newEntry);
  writeEntries(entries);
  res.status(201).json(newEntry);
});

app.delete('/entries/:id', (req, res) => {
  const entries = readEntries();
  const id = parseInt(req.params.id);
  const filtered = entries.filter(e => e.id !== id);
  if (filtered.length === entries.length) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  writeEntries(filtered);
  res.status(204).send();
});

const server = app.listen(PORT, () => {
  console.log(`Budget backend running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing backend or set a different PORT when starting.`);
    process.exit(1);
  }
  throw err;
});

