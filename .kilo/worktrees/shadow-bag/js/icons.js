/**
 * Sugar Bliss Bakery — SVG Icon Loader
 * Injects the SVG sprite into every page and exposes a helper function.
 */

(function () {
  'use strict';

  /* ── Inject sprite into DOM ── */
  fetch('icons/sprite.svg')
    .then(r => r.text())
    .then(svg => {
      const div = document.createElement('div');
      div.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
      div.setAttribute('aria-hidden', 'true');
      div.innerHTML = svg;
      document.body.insertBefore(div, document.body.firstChild);
    })
    .catch(() => {/* sprite missing — graceful degradation */});

  /**
   * Create an SVG <use> icon element.
   * @param {string} id    - icon id without the # prefix
   * @param {string} size  - CSS class: 'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl'
   * @param {string} [extraClasses] - additional class string
   * @returns {string} SVG HTML string
   */
  window.svgIcon = function (id, size = 'lg', extraClasses = '') {
    return `<svg class="icon icon-${size}${extraClasses ? ' ' + extraClasses : ''}" aria-hidden="true" focusable="false"><use href="icons/sprite.svg#icon-${id}"></use></svg>`;
  };
})();
