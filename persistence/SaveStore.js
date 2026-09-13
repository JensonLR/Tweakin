import { getFighterDef } from '../data/roster.js';
const DB = 'tweakin-save-v1', STORE = 'kv';
export const DEFAULT_SETTINGS = { masterVolume: .8, musicVolume: .36, sfxVolume: .82, cameraShake: .7, quality: 'high', showFps: false, reducedMotion: false };
export function newCareer(fighterId) {
  const f = getFighterDef(fighterId);
  return { version: 1, fighterId, circuitIndex: 0, credits: 1200, development: 3, wins: 0, losses: 0, unlockedArenas: ['underpass', 'iron-gym', 'foundry'], unlockedMatchTypes: ['One on One'], learnedStyles: [...f.styles], stats: { ...f.stats }, charismaBonus: 0, cosmetics: [], messages: [{ id: 'm0', text: 'Circuit registration confirmed. Win fights. Build momentum. Take the room.', read: false }] };
}
export class SaveStore {
  fallback = new Map();
  db() { return new Promise((resolve, reject) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE); }; r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
  async get(key, def) { try { const db = await this.db(); return await new Promise((resolve) => { const tx = db.transaction(STORE, 'readonly'), r = tx.objectStore(STORE).get(key); r.onsuccess = () => resolve(r.result ?? def); r.onerror = () => resolve(def); }); } catch { try { const v = localStorage.getItem(`tweakin:${key}`); return v ? JSON.parse(v) : (this.fallback.get(key) ?? def); } catch { return this.fallback.get(key) ?? def; } } }
  async set(key, value) { this.fallback.set(key, value); try { const db = await this.db(); await new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(value, key); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); } catch { localStorage.setItem(`tweakin:${key}`, JSON.stringify(value)); } }
  async settings() { return this.get('settings', DEFAULT_SETTINGS); }
  async saveSettings(s) { await this.set('settings', s); }
  async career() { return this.get('career', null); }
  async saveCareer(c) { await this.set('career', c); }
  async resetCareer() { await this.set('career', null); }
  async exportAll() { return JSON.stringify({ career: await this.career(), settings: await this.settings(), exported: new Date().toISOString() }, null, 2); }
  async importAll(text) { const v = JSON.parse(text); if (v.career) await this.saveCareer(v.career); if (v.settings) await this.saveSettings(v.settings); }
}
