import { Game } from './game/Game.js';
import { AppUI } from './ui/AppUI.js';
import { UIShowcaseV2 } from './ui/UIShowcaseV2.js';
import { ExtraModes } from './ui/ExtraModes.js';
import { CareerStory } from './ui/CareerStory.js';
import { HUDPortraits } from './ui/HUDPortraits.js';
import { UXEnhancements } from './ui/UXEnhancements.js';
import { SaveStore, DEFAULT_SETTINGS } from './persistence/SaveStore.js';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function boot() {
    const started=performance.now();
    const host = document.querySelector('#render-host');
    const root = document.querySelector('#ui-root');
    if (!host || !root) throw new Error('TWEAKIN boot targets missing');
    const store = new SaveStore();
    const saved = await store.settings().catch(() => DEFAULT_SETTINGS);
    const isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || innerWidth < 900;
    const lowMemory = Number(navigator.deviceMemory || 8) <= 4;
    const settings = isTouch ? { ...saved, quality: lowMemory ? 'low' : 'medium', cameraShake: Math.min(saved.cameraShake, .62) } : saved;
    document.documentElement.classList.toggle('touch-device', isTouch);
    document.documentElement.classList.toggle('high-end-device', !lowMemory);
    const game = new Game(host, settings);
    const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
    let seen=false;try{seen=sessionStorage.getItem('tweakinBootSeen')==='1';sessionStorage.setItem('tweakinBootSeen','1')}catch{}
    const minimum=reduced?160:(seen?520:1180),remain=minimum-(performance.now()-started);if(remain>0)await sleep(remain);
    const bootShell=root.querySelector('.boot-shell');if(bootShell){bootShell.classList.add('boot-exit');await sleep(reduced?20:240)}
    const ui = new AppUI(root, game, store);
    await ui.init();
    window.__TWEAKIN_SHOWCASE__ = new UIShowcaseV2(root, game);
    window.__TWEAKIN_EXTRA_MODES__ = new ExtraModes(ui);
    window.__TWEAKIN_CAREER_STORY__ = new CareerStory(ui);
    window.__TWEAKIN_HUD_PORTRAITS__ = new HUDPortraits(root);
    window.__TWEAKIN_UX__ = new UXEnhancements(root, game);
}
boot().catch((err) => {
    console.error(err);
    const root = document.querySelector('#ui-root');
    if (root) root.innerHTML = `<div class="panel-screen"><div class="content-scroll" style="display:grid;place-items:center"><div class="detail-panel" style="max-width:720px"><div class="page-title">BOOT FAILURE</div><p class="page-desc">${String(err?.message || err)}</p><p class="page-desc" style="margin-top:12px">TWEAKIN needs a modern browser with WebGL and network access for the Three.js runtime. Reload with a data connection.</p></div></div></div>`;
});
