import { AuthoredViewer } from './AuthoredViewer.js';

export class UIShowcaseV2 {
  constructor(root, game) {
    this.root = root;
    this.game = game;
    this.viewer = new AuthoredViewer(root);
    this.lastId = '';
    this.renderHost = document.getElementById('render-host');
    this.clickHandler = (event) => {
      const row = event.target.closest?.('[data-rid]');
      if (row?.dataset?.rid) this.focus(row.dataset.rid);
    };
    root.addEventListener('click', this.clickHandler, true);
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(root, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
    this.sync();
  }

  focus(id) {
    if (!id || !this.root.classList.contains('roster')) return;
    this.lastId = id;
    this.game.menuBackdrop?.clearFocus?.();
    if (this.renderHost) this.renderHost.style.opacity = '0';
    this.viewer.focus(id);
  }

  sync() {
    if (!this.root.classList.contains('roster')) {
      this.lastId = '';
      this.viewer.clear();
      this.game.menuBackdrop?.clearFocus?.();
      if (this.renderHost) this.renderHost.style.opacity = '';
      return;
    }
    if (this.renderHost) this.renderHost.style.opacity = '0';
    const row = this.root.querySelector('[data-rid].active') || this.root.querySelector('[data-rid]');
    const id = row?.dataset?.rid;
    if (id && id !== this.lastId) this.focus(id);
  }

  destroy() {
    this.observer?.disconnect();
    this.root.removeEventListener('click', this.clickHandler, true);
    this.viewer.destroy();
    this.game.menuBackdrop?.clearFocus?.();
    if (this.renderHost) this.renderHost.style.opacity = '';
  }
}
