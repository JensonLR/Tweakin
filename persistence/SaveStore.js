import { getFighterDef } from '../data/roster.js';
const DB = 'tweakin-save-v1', STORE = 'kv';
export const DEFAULT_SETTINGS = { masterVolume: .8, musicVolume: .36, sfxVolume: .82, cameraShake: .7, quality: 'high', showFps: false, reducedMotion: false };
export function newCareer(fighterId) {
  const f = getFighterDef(fighterId);
  return { version: 1, fighterId, circuitIndex: 0, credits: 1200, development: 3, wins: 0, losses: 0, unlockedArenas: ['underpass', 'iron-gym', 'foundry'], unlockedMatchTypes: ['One on One'], learnedStyles: [...f.styles], stats: { ...f.stats }, charismaBonus: 0, cosmetics: [], messages: [{ id: 'm0', text: 'Circuit registration confirmed. Win fights. Build momentum. Take the room.', read: false }] };
}
const emptyProfile=()=>({matches:0,wins:0,losses:0,kos:0,totalDamage:0,totalHits:0,bestCombo:0,specials:0,weaponHits:0,byFighter:{}});
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
  async history() { return this.get('history', []); }
  async profile() { return this.get('profile', emptyProfile()); }
  async clearHistory() { await this.set('history', []); await this.set('profile', emptyProfile()); }
  async recordMatch(match) {
    if (!match?.fighters?.length || match.config?.mode === 'training') return;
    const fighters = match.fighters.map(f => ({
      id: f.def.id, name: f.def.shortName, slot: f.slot, ko: !!f.ko,
      physical: Math.round(f.physical), consciousness: Math.round(f.consciousness),
      metrics: { ...(f.metrics || {}) }
    }));
    const playerSlot = match.config?.humanSlots?.[0] ?? 0;
    const player = fighters.find(f => f.slot === playerSlot) || fighters[0];
    const won = match.winner?.slot === playerSlot;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      at: new Date().toISOString(), mode: match.config?.mode || 'fight', rule: match.config?.matchType || 'One on One',
      arenaId: match.config?.arenaId || '', duration: Math.max(0, Math.round(match.elapsed || 0)),
      winnerId: match.winner?.def?.id || null, playerSlot, won, fighters
    };
    const history = await this.history(); history.unshift(entry); if (history.length > 50) history.length = 50; await this.set('history', history);
    const p = await this.profile(), m = player.metrics || {}; p.matches++; won ? p.wins++ : p.losses++; if (match.winner?.slot === playerSlot && match.fighters.some(f => f.slot !== playerSlot && f.ko)) p.kos++;
    p.totalDamage += Math.round(m.damage || 0); p.totalHits += Math.round(m.hits || 0); p.bestCombo = Math.max(p.bestCombo || 0, Math.round(m.bestCombo || 0)); p.specials += Math.round(m.specials || 0); p.weaponHits += Math.round(m.weapons || 0);
    const fp = p.byFighter[player.id] || { matches:0,wins:0,losses:0,damage:0,bestCombo:0 }; fp.matches++; won ? fp.wins++ : fp.losses++; fp.damage += Math.round(m.damage || 0); fp.bestCombo = Math.max(fp.bestCombo, Math.round(m.bestCombo || 0)); p.byFighter[player.id] = fp;
    await this.set('profile', p);
  }
  async exportAll() { return JSON.stringify({ career: await this.career(), settings: await this.settings(), history: await this.history(), profile: await this.profile(), exported: new Date().toISOString() }, null, 2); }
  async importAll(text) { const v = JSON.parse(text); if (v.career) await this.saveCareer(v.career); if (v.settings) await this.saveSettings(v.settings); if (Array.isArray(v.history)) await this.set('history', v.history.slice(0,50)); if (v.profile) await this.set('profile', v.profile); }
}
