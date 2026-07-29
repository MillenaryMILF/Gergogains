/* Shared helpers for the standalone tool pages.
   Deliberately tiny: segmented-control wiring, escaping, and numeric reads.
   No training logic lives here — that all stays in programming.js, which the
   tool pages call directly so the two can never drift apart. */
window.GGTool = (function () {
  function seg(id) {
    var el = document.querySelector('#' + id + ' button.sel');
    return el ? el.dataset.v : (document.querySelector('#' + id + ' button') || {}).dataset.v;
  }

  function onSeg(id, cb) {
    var host = document.getElementById(id);
    if (!host) return;
    host.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]');
      if (!b || !host.contains(b)) return;
      host.querySelectorAll('button').forEach(function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      cb(b.dataset.v);
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Reads a number and validates it against a sane range. Returns null when the
  // field is empty or outside the range, so callers can report one clear error
  // instead of rendering a result built on nonsense.
  function num(id, lo, hi) {
    var v = parseFloat((document.getElementById(id) || {}).value);
    if (!isFinite(v) || v < lo || v > hi) return null;
    return v;
  }

  return { seg: seg, onSeg: onSeg, esc: esc, num: num };
})();
