import { THREE } from '../vendor/three.js';
import { EMPTY_INPUT } from '../core/types.js';
import { InputManager } from './Input.js';
import { CombatMatch } from './CombatMatch.js';
import { PresentationDirector } from './PresentationDirector.js';
import { MenuBackdrop } from './MenuBackdrop.js';
import { DOMFX } from './DOMFX.js';
import { PostFX } from './PostFX.js';
import { AudioEngine } from '../audio/AudioEngine.js';
export class Game {
    renderer;camera;input = new InputManager();audio = new AudioEngine();match = null;presentation = null;menuBackdrop = null;domfx = null;postFX = null;settings;net = null;running = true;acc = 0;prev = performance.now() / 1000;fps = 60;fpsAccum = 0;fpsFrames = 0;errors = [];hooks = {};host;raf = 0;fixed = 1 / 60;pause = false;lastSnapshotSend = 0;mobile = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || innerWidth < 900;
    constructor(host, settings) {
        this.host = host;this.settings = settings;
        this.renderer = new THREE.WebGLRenderer({ antialias: settings.quality !== 'low', powerPreference: 'high-performance', alpha: false, stencil:false });
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.25 : settings.quality === 'high' ? 2 : 1.5));this.renderer.setSize(innerWidth, innerHeight);this.renderer.shadowMap.enabled = settings.quality !== 'low';this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;this.renderer.outputColorSpace = THREE.SRGBColorSpace;this.renderer.toneMapping = THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure = 1.06;
        host.innerHTML = '';host.appendChild(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, .06, 100);this.camera.position.set(0, 5.4, 8);
        this.presentation = new PresentationDirector(this.renderer,this.camera,this.mobile);this.menuBackdrop=new MenuBackdrop();this.domfx=new DOMFX();this.postFX=new PostFX(this.renderer,this.mobile,settings.quality);this.postFX.resize(innerWidth,innerHeight);
        addEventListener('resize', () => this.resize());addEventListener('error', e => this.errors.push(String(e.message)));this.audio.setVolumes(settings.masterVolume, settings.musicVolume, settings.sfxVolume);this.loop();
    }
    setHooks(h) { this.hooks = h; }
    start(config) {
        this.presentation?.dispose();this.match?.dispose();
        this.match = new CombatMatch(config, this.audio, {onMessage: (t, d) => this.hooks.onMessage?.(t, d),onKO: () => {},onEnd: () => this.hooks.onEnd?.(this.match),onSpecial: (f, n) => this.hooks.onSpecial?.(f.def.name, n),onImpact: (pos,kind,blocked,a,t)=>{this.presentation?.impact(pos,kind,blocked,a,t);this.domfx?.hit(kind,blocked)}});
        this.presentation?.attach(this.match);this.domfx?.intro(this.match);this.audio.startMusic();this.acc = 0;this.pause = false;this.renderer.domElement.focus?.();
    }
    stop() { this.presentation?.dispose(); this.match?.dispose(); this.match = null; this.domfx?.clear(); this.audio.stopMusic(); }
    setPaused(v) { this.pause = v; }
    setNetwork(net) { this.net = net; }
    loop = () => {
        if (!this.running) return;this.raf = requestAnimationFrame(this.loop);
        const now = performance.now() / 1000;const dt = Math.min(.1, now - this.prev);this.prev = now;this.fpsAccum += dt;this.fpsFrames++;
        if (this.fpsAccum > .5) { this.fps = this.fpsFrames / this.fpsAccum; this.fpsAccum = 0; this.fpsFrames = 0; }
        this.audio.update();
        if (!this.pause && this.match) {
            this.acc += dt;let steps = 0;while (this.acc >= this.fixed && steps < 5) { this.step(this.fixed); this.acc -= this.fixed; steps++; }
            this.match.tickCinematic(dt);this.presentation?.update(dt);this.updateCamera(dt);this.postFX.render(this.match.scene,this.camera,dt,this.match.cameraShake,Math.min(1,this.match.cinematicTime));this.hooks.onHud?.(this.match);
        } else if(!this.match) {
            this.camera.fov += (47-this.camera.fov)*(1-Math.exp(-dt*4));this.camera.updateProjectionMatrix();this.menuBackdrop?.update(dt,this.camera);this.renderer.toneMappingExposure=1.02;this.postFX.render(this.menuBackdrop.scene,this.camera,dt,0,.14);
        }
        this.input.endFrame();this.exposeDebug();
    };
    step(dt) {
        if (!this.match) return;const inputs = this.match.fighters.map(() => ({ ...EMPTY_INPUT }));
        for (const slot of this.match.config.humanSlots) {if (this.net) {const mine = this.net.localSlot;if (slot === mine) inputs[slot] = this.input.frame(0);else inputs[slot] = this.net.getRemoteInput(slot);} else inputs[slot] = this.input.frame(slot);}
        if (this.net) {this.net.sendLocalInput(inputs[this.net.localSlot] ?? { ...EMPTY_INPUT }, this.match.frame);if (this.net.isHost) {this.match.update(dt, inputs);this.lastSnapshotSend += dt;if (this.lastSnapshotSend > 1 / 20) {this.lastSnapshotSend = 0;this.net.broadcastSnapshot({ frame: this.match.frame, remaining: this.match.remaining, fighters: this.match.snapshots() });}} else {const snap = this.net.consumeSnapshot();if (snap) { this.match.remaining = snap.remaining; this.match.applySnapshots(snap.fighters); }}} else this.match.update(dt, inputs);
    }
    updateCamera(dt) {
        if (!this.match) return;const target = this.match.getCameraTarget();let tx = target.x, tz = target.z, ty = target.y, distance = target.distance, angle = 0, fov=44;
        if (target.cinematic) {const [a, b] = target.cinematic;tx = (a.group.position.x + b.group.position.x) / 2;tz = (a.group.position.z + b.group.position.z) / 2;distance = 3.9;angle = a.yaw + .64 + Math.sin(this.match.cinematicTime*4)*.08;ty=1.4;fov=38;} else if (this.match.fighters[0] && this.match.fighters[1]) {const a = this.match.fighters[0], b = this.match.fighters[1];angle = Math.atan2(b.group.position.x - a.group.position.x, b.group.position.z - a.group.position.z) + Math.PI / 2;fov=42+Math.min(7,(distance-5.2)*1.4);}
        const shake = this.settings.reducedMotion ? 0 : this.match.cameraShake * this.settings.cameraShake;const sx = (Math.random() - .5) * shake * .19, sy = (Math.random() - .5) * shake * .14;
        const desired = new THREE.Vector3(tx + Math.sin(angle) * distance + sx, 3.15 + distance * .22 + sy, tz + Math.cos(angle) * distance + sx);this.camera.position.lerp(desired, 1 - Math.exp(-dt * (target.cinematic?8.5:5.4)));this.camera.fov += (fov-this.camera.fov)*(1-Math.exp(-dt*7));this.camera.updateProjectionMatrix();this.camera.lookAt(new THREE.Vector3(tx, ty, tz));
    }
    resize() {const w = innerWidth, h = innerHeight;this.camera.aspect = w / h;this.camera.updateProjectionMatrix();this.renderer.setSize(w, h);this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.25 : this.settings.quality === 'high' ? 2 : 1.5));this.postFX?.resize(w,h);}
    updateSettings(s) { this.settings = s; this.audio.setVolumes(s.masterVolume, s.musicVolume, s.sfxVolume); this.resize(); }
    exposeDebug() {const d = this.match?.debug(this.fps, this.errors.slice(-10), this.net?.debug() ?? {}) ?? { mode: 'menu', arena: '', fps: this.fps, errors: this.errors.slice(-10), network: this.net?.debug() ?? {}, fighters: [], frame: 0 };window.__TWEAKIN_DEBUG__ = d;window.__TWEAKIN_GAME__ = this;}
    destroy() { this.running = false; cancelAnimationFrame(this.raf); this.stop();this.menuBackdrop?.dispose();this.postFX?.dispose(); this.renderer.dispose(); this.renderer.domElement.remove(); }
}
