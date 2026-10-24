/**
 * Spatial UI Controller for Peerbot
 * Powers visionOS-style 3D spatial tilt, reactive specular glass glare,
 * volumetric parallax layering, and floating spatial HUD callouts.
 */

export class SpatialUI {
  constructor() {
    this.tiltElements = [];
    this.rafId = null;
    this.init();
  }

  init() {
    this.initTiltCards();
    this.initCanvasParallax();
    this.initCornerReticles();
  }

  /**
   * Initializes 3D interactive spatial tilt with dynamic specular glass glare
   */
  initTiltCards() {
    const selector = '.spatial-card, [data-spatial-tilt], .showcase-frame, .hw-badge, .workflow-display-box, .console-device-card, .arch-layer-card';
    const cards = document.querySelectorAll(selector);

    cards.forEach((card) => {
      // Create reactive specular glare layer if not present
      if (!card.querySelector('.spatial-glare')) {
        const glare = document.createElement('div');
        glare.className = 'spatial-glare';
        card.appendChild(glare);
      }

      card.addEventListener('pointerenter', () => {
        card.classList.add('spatial-active');
      });

      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Subtle tilt angle: max 7 degrees for refined elegance
        const tiltX = ((y - centerY) / centerY) * -7;
        const tiltY = ((x - centerX) / centerX) * 7;

        const pctX = ((x / rect.width) * 100).toFixed(1);
        const pctY = ((y / rect.height) * 100).toFixed(1);

        card.style.setProperty('--glare-x', `${pctX}%`);
        card.style.setProperty('--glare-y', `${pctY}%`);
        card.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(8px)`;
      });

      card.addEventListener('pointerleave', () => {
        card.classList.remove('spatial-active');
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    });
  }

  /**
   * Dynamic volumetric parallax for floating spatial HUD badges around 3D model
   */
  initCanvasParallax() {
    const container = document.querySelector('.naked-canvas-container');
    const badges = document.querySelectorAll('.hw-badge');
    if (!container || badges.length === 0) return;

    container.addEventListener('pointermove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      badges.forEach((badge, index) => {
        if (badge.classList.contains('spatial-active')) return;
        // Varying depth coefficients for real spatial layering
        const depth = (index % 3 + 1) * 12;
        const offsetX = (x * depth).toFixed(2);
        const offsetY = (y * depth).toFixed(2);
        badge.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0px)`;
      });
    });

    container.addEventListener('pointerleave', () => {
      badges.forEach((badge) => {
        if (!badge.classList.contains('spatial-active')) {
          badge.style.transform = 'translate3d(0px, 0px, 0px)';
        }
      });
    });
  }

  /**
   * Injects delicate visionOS corner crosshairs / registration marks on spatial cards
   */
  initCornerReticles() {
    const cards = document.querySelectorAll('.spatial-reticle, .naked-canvas-container, .workflow-display-box');
    cards.forEach((card) => {
      if (card.querySelector('.reticle-tl')) return;

      const tl = document.createElement('span');
      tl.className = 'spatial-crosshair reticle-tl';
      const tr = document.createElement('span');
      tr.className = 'spatial-crosshair reticle-tr';
      const bl = document.createElement('span');
      bl.className = 'spatial-crosshair reticle-bl';
      const br = document.createElement('span');
      br.className = 'spatial-crosshair reticle-br';

      card.appendChild(tl);
      card.appendChild(tr);
      card.appendChild(bl);
      card.appendChild(br);
    });
  }
}
