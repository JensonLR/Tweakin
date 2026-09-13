import { EMPTY_INPUT } from '../core/types.js';
import { clamp, seeded, hash } from '../core/math.js';
export class FighterAI {
    difficulty;
    nextThink = 0;
    action = { ...EMPTY_INPUT };
    rng;
    strafe = 1;
    constructor(difficulty = .6, seed = 'ai') {
        this.difficulty = clamp(difficulty, .05, 1);
        this.rng = seeded(hash(seed));
    }
    update(dt, self, targets, arena) {
        this.nextThink -= dt;
        const live = targets.filter(t => !t.ko && t !== self);
        if (!live.length) return { ...EMPTY_INPUT };
        const target = live.sort((a, b) => dist(self, a) - dist(self, b))[0];
        const d = dist(self, target);
        if (this.nextThink <= 0) {
            this.nextThink = .08 + (1 - this.difficulty) * .2 + this.rng() * .09;
            this.action = { ...EMPTY_INPUT };
            const danger = self.danger(), oppDanger = target.danger();
            const nearWall = !!arena.environmentAnchor(target.group.position.x, target.group.position.z);
            if (self.momentum >= 100 && this.rng() < .72) { this.action.taunt = true; return this.action; }
            if (self.specialTime > 0 && d < 1.45 && this.rng() < .78) { this.action.grapple = true; this.action.heavy = true; return this.action; }
            if (target.state === 'StrikeStartup' || target.state === 'StrikeActive') {
                if (this.rng() < .28 + this.difficulty * .58) { this.action.block = true; return this.action; }
            }
            if (d > 2.1) { this.action.y = -1; this.action.x = (this.rng() - .5) * .45; this.action.run = d > 4.3; }
            else if (d < .7) {
                if (this.rng() < .27) { this.action.y = 1; this.action.x = this.strafe; }
                else if (this.rng() < .5 + .24 * this.difficulty) this.action.grapple = true;
                else this.action.light = true;
            } else {
                const roll = this.rng();
                if (oppDanger && roll < .42) this.action.heavy = true;
                else if (nearWall && roll < .48) this.action.grapple = true;
                else if (roll < .34) this.action.light = true;
                else if (roll < .55) this.action.heavy = true;
                else if (roll < .72) this.action.grapple = true;
                else { this.strafe *= -1; this.action.x = this.strafe; this.action.y = -.18; }
            }
            if (danger && this.rng() < .24) { this.action.block = true; this.action.y = .55; }
            if (!self.heldWeapon && arena.nearestWeapon(self.group.position.x, self.group.position.z) && this.rng() < .35) this.action.pickup = true;
            if (self.heldWeapon && d < 1.5 && this.rng() < .45) this.action.heavy = true;
        }
        return { ...this.action };
    }
}
const dist = (a, b) => Math.hypot(a.group.position.x - b.group.position.x, a.group.position.z - b.group.position.z);
