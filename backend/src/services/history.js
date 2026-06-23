const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, '../data/history.json');
const MAX_ENTRIES = 50;

function readHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
      fs.writeFileSync(HISTORY_FILE, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

function addEntry(entry) {
  const history = readHistory();
  history.unshift(entry);
  if (history.length > MAX_ENTRIES) {
    history.splice(MAX_ENTRIES);
  }
  writeHistory(history);
  return entry;
}

function updateEntry(id, updates) {
  const history = readHistory();
  const idx = history.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  history[idx] = { ...history[idx], ...updates };
  writeHistory(history);
  return history[idx];
}

function getEntry(id) {
  const history = readHistory();
  return history.find((e) => e.id === id) || null;
}

function getRecentEntries(limit = 6) {
  const history = readHistory();
  return history.slice(0, limit);
}

function deleteEntry(id) {
  const history = readHistory();
  const idx = history.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  const [removed] = history.splice(idx, 1);
  writeHistory(history);
  return removed;
}

function getAllEntries() {
  return readHistory();
}

module.exports = {
  addEntry,
  updateEntry,
  getEntry,
  getRecentEntries,
  deleteEntry,
  getAllEntries,
};
