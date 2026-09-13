import { clamp } from './math.js';
export const STYLE_MODS = {
    Streetfighting: { light: 1.08, heavy: 1.25, grapple: .98, speed: .98, submission: .75 },
    Kickboxing: { light: 1.12, heavy: 1.2, grapple: .82, speed: 1.05, submission: .7 },
    'Martial Arts': { light: 1.08, heavy: 1.05, grapple: .82, speed: 1.18, submission: .76 },
    Wrestling: { light: .88, heavy: 1.02, grapple: 1.35, speed: .9, submission: 1.02 },
    Submissions: { light: .86, heavy: .9, grapple: 1.1, speed: .94, submission: 1.42 }
};
export function statFactor(stats, key) { return .72 + clamp(stats[key], 0, 100) / 100 * .56; }
export function styleBlend(styles, key) { if (!styles.length) return 1; return styles.reduce((a, s) => a + STYLE_MODS[s][key], 0) / styles.length; }
export function strikeDamage(stats, styles, heavy) { const base = heavy ? 18 : 8.2; return base * statFactor(stats, heavy ? 'upperBody' : 'speed') * styleBlend(styles, heavy ? 'heavy' : 'light'); }
export function grappleDamage(stats, styles, strong) { return (strong ? 25 : 14) * statFactor(stats, 'upperBody') * styleBlend(styles, 'grapple'); }
export function moveSpeed(stats, styles) { return (2.7 + stats.speed / 100 * 2.1) * styleBlend(styles, 'speed'); }
export function damageAfterToughness(raw, toughness) { return raw * (1 - (clamp(toughness, 0, 100) / 100) * .31); }
export function consciousnessLoss(damage, kind) { const m = { light: 1.2, heavy: 1.52, grapple: 1.4, special: 2.05, environment: 1.72, weapon: 1.62 }[kind]; return damage * m; }
export function physicalLoss(damage, kind) { const m = { light: .31, heavy: .46, grapple: .43, special: .66, environment: .58, weapon: .52 }[kind]; return damage * m; }
export const canKO = (consciousness, physical, kind) => physical <= 2 || consciousness <= 0 && ['heavy', 'grapple', 'special', 'environment', 'weapon'].includes(kind);
