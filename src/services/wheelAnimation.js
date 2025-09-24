import { CONFIG } from '../config.js';

export class WheelAnimation {
  constructor(element, options = {}) {
    if (!element) {
      throw new Error('WheelAnimation requires a DOM element.');
    }
    this.el = element;
    this.duration = options.duration ?? CONFIG.ANIMATION_DURATION;
    this.highlightDuration = options.highlightDuration ?? CONFIG.HIGHLIGHT_DURATION;
    this.isSpinning = false;
  }

  getCurrentRotation() {
    const style = getComputedStyle(this.el);
    const matrix = style.transform;
    if (!matrix || matrix === 'none') {
      return 0;
    }
    const values = matrix.match(/matrix\(([-0-9.,\s]+)\)/);
    if (!values) {
      return 0;
    }
    const parts = values[1].split(',');
    const a = parseFloat(parts[0]);
    const b = parseFloat(parts[1]);
    const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    return (angle + 360) % 360;
  }

  spinToRime(rime) {
    if (this.isSpinning) {
      return Promise.reject(new Error('Wheel is already spinning'));
    }

    this.isSpinning = true;
    this.el.classList.add('is-spinning');

    const center = (rime.angleStart + rime.angleEnd) / 2;
    const randomTurns = 3 + Math.floor(Math.random() * 4);
    const baseRotation = 360 * randomTurns;
    const target = baseRotation - center;

    this.el.style.setProperty('--animation-duration', `${this.duration}ms`);
    requestAnimationFrame(() => {
      this.el.style.setProperty('--wheel-rotation', `${target}deg`);
    });

    return new Promise((resolve) => {
      window.setTimeout(() => {
        this.el.classList.remove('is-spinning');
        this.highlightSegment(rime);

        setTimeout(() => {
          this.isSpinning = false;
          resolve({ rime, finalRotation: target % 360 });
        }, this.highlightDuration);
      }, this.duration);
    });
  }

  highlightSegment(rime) {
    const segmentIndex = Math.floor(rime.angleStart / (360 / this.el.dataset.segments || 5));
    const segments = this.el.querySelectorAll('.wheel-segment');

    segments.forEach(segment => segment.classList.remove('highlighted'));

    if (segments[segmentIndex]) {
      segments[segmentIndex].classList.add('highlighted');
    }
  }

  updateSegments(rimes) {
    const segmentAngle = 360 / rimes.length;
    this.el.dataset.segments = rimes.length;

    const colors = [
      '#f94144', '#f3722c', '#f9c74f', '#90be6d', '#577590',
      '#43aa8b', '#277da1', '#f8961e', '#f94144', '#f3722c'
    ];

    const gradientStops = rimes.map((rime, index) => {
      const startAngle = segmentAngle * index;
      const endAngle = segmentAngle * (index + 1);
      const color = colors[index % colors.length];
      return `${color} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');

    this.el.style.background = `conic-gradient(${gradientStops})`;
  }
}
