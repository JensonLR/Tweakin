import { clamp } from '../core/math.js';
const P1 = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', light: 'KeyJ', heavy: 'KeyK', grapple: 'KeyL', block: 'KeyI', run: 'ShiftLeft', taunt: 'KeyU', pickup: 'KeyO' };
const P2 = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', light: 'Numpad1', heavy: 'Numpad2', grapple: 'Numpad3', block: 'Numpad0', run: 'NumpadEnter', taunt: 'Numpad4', pickup: 'Numpad5' };
export class InputManager {
    keys = new Set();
    prevKeys = new Set();
    gamepadPrev = new Map();
    touchAxis = { x: 0, y: 0 };
    touchHeld = { light: false, heavy: false, grapple: false, block: false, run: false, taunt: false, pickup: false };
    touchPulse = { light: false, heavy: false, grapple: false, block: false, run: false, taunt: false, pickup: false };
    constructor() {
        addEventListener('keydown', e => { if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault(); this.keys.add(e.code); });
        addEventListener('keyup', e => this.keys.delete(e.code));
        addEventListener('blur', () => this.clear());
        document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });
    }
    keyboard(map) {
        const held = (k) => this.keys.has(k);
        const pressed = (k) => this.keys.has(k) && !this.prevKeys.has(k);
        return { x: (held(map.right) ? 1 : 0) - (held(map.left) ? 1 : 0), y: (held(map.down) ? 1 : 0) - (held(map.up) ? 1 : 0), light: pressed(map.light), heavy: pressed(map.heavy), grapple: pressed(map.grapple), block: held(map.block), run: held(map.run), taunt: pressed(map.taunt), pickup: pressed(map.pickup) };
    }
    gamepad(index) {
        const gp = navigator.getGamepads?.()[index];
        if (!gp) return null;
        const old = this.gamepadPrev.get(index) ?? [];
        const pressed = (i) => !!gp.buttons[i]?.pressed && !old[i];
        const frame = { x: Math.abs(gp.axes[0] ?? 0) > .18 ? clamp(gp.axes[0] ?? 0, -1, 1) : 0, y: Math.abs(gp.axes[1] ?? 0) > .18 ? clamp(gp.axes[1] ?? 0, -1, 1) : 0, light: pressed(2), heavy: pressed(3), grapple: pressed(1), block: !!gp.buttons[4]?.pressed, run: !!gp.buttons[0]?.pressed, taunt: pressed(5), pickup: pressed(5) };
        this.gamepadPrev.set(index, gp.buttons.map(b => b.pressed));
        return frame;
    }
    setTouchAxis(x, y) { this.touchAxis.x = clamp(x, -1, 1); this.touchAxis.y = clamp(y, -1, 1); }
    setTouchButton(action, down) {
        if (down && !this.touchHeld[action]) this.touchPulse[action] = true;
        this.touchHeld[action] = down;
    }
    touch() {
        const t = { x: this.touchAxis.x, y: this.touchAxis.y, light: this.touchPulse.light, heavy: this.touchPulse.heavy, grapple: this.touchPulse.grapple, block: this.touchHeld.block, run: this.touchHeld.run, taunt: this.touchPulse.taunt, pickup: this.touchPulse.pickup };
        this.touchPulse.light = this.touchPulse.heavy = this.touchPulse.grapple = this.touchPulse.taunt = this.touchPulse.pickup = false;
        return t;
    }
    merge(a, b) { return { x: Math.abs(b.x) > Math.abs(a.x) ? b.x : a.x, y: Math.abs(b.y) > Math.abs(a.y) ? b.y : a.y, light: a.light || b.light, heavy: a.heavy || b.heavy, grapple: a.grapple || b.grapple, block: a.block || b.block, run: a.run || b.run, taunt: a.taunt || b.taunt, pickup: a.pickup || b.pickup }; }
    frame(slot) {
        const base = this.gamepad(slot) ?? this.keyboard(slot === 0 ? P1 : P2);
        return slot === 0 ? this.merge(base, this.touch()) : base;
    }
    endFrame() { this.prevKeys = new Set(this.keys); }
    clearTouch() { this.touchAxis.x = 0; this.touchAxis.y = 0; for (const k of Object.keys(this.touchHeld)) { this.touchHeld[k] = false; this.touchPulse[k] = false; } }
    clear() { this.keys.clear(); this.prevKeys.clear(); this.clearTouch(); }
}
