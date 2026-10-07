/* ---------- language toggle (EN / ES), shared by every page ----------
   English stays in each page's markup. The page passes its Spanish strings to
   I18N.init(), keyed by the exact English text, so anything missing simply
   stays in English. The choice is saved per browser and carries across pages.

   - Text nodes, placeholders, aria-labels, titles, <title> and meta
     descriptions are swapped automatically. Runs of whitespace in the English
     are collapsed before lookup, so keys can be written on one line.
   - [data-i18n-html]: the element's inner HTML is the key, for sentences whose
     word order changes around a link or other markup.
   - [data-i18n-skip], [data-split]: left alone; page code renders these itself
     with I18N.t() and re-renders them from I18N.onChange().
   - I18N.t('Only {n} left', {n: 3}) fills {placeholders} after lookup. */
window.I18N = (function () {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'SVG', 'NOSCRIPT']);
  const listeners = [];
  let ES = {}, SUFFIX_ES = {};
  let lang = 'en';
  try { lang = localStorage.getItem('lang') === 'es' ? 'es' : 'en'; } catch (e) {}

  function tr(en, vars) {
    let s = (lang === 'es' && ES[en]) || en;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  }

  const norm = s => s.trim().replace(/\s+/g, ' ');

  function walk(root, fn) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (SKIP.has(n.parentNode.nodeName.toUpperCase()) ||
        n.parentNode.closest('[data-split],[data-i18n-skip],[data-i18n-html]') || !n.nodeValue.trim())
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    for (let n; (n = w.nextNode());) fn(n);
  }

  function apply() {
    document.documentElement.lang = lang;
    const title = document.querySelector('title');
    title.__en = title.__en || title.textContent;
    title.textContent = tr(title.__en);
    document.querySelectorAll('meta[name=description],meta[property="og:description"]').forEach(m => {
      m.__en = m.__en || m.content; m.content = tr(m.__en);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      if (el.__en === undefined) el.__en = norm(el.innerHTML);
      el.innerHTML = tr(el.__en);
    });
    walk(document.body, n => {
      if (n.__en === undefined) n.__en = norm(n.nodeValue);
      const out = tr(n.__en);
      if (n.__out === out && n.nodeValue.includes(out)) return;
      n.nodeValue = n.nodeValue.replace(/\S[\s\S]*\S|\S/, () => out);
      n.__out = out;
    });
    document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el => {
      if (el.closest('[data-i18n-skip]')) return;
      ['placeholder', 'aria-label', 'title'].forEach(a => {
        if (!el.hasAttribute(a)) return;
        el['__en_' + a] = el['__en_' + a] || el.getAttribute(a);
        el.setAttribute(a, tr(el['__en_' + a]));
      });
    });
    document.querySelectorAll('[data-suffix]').forEach(el => {
      el.__sfx = el.__sfx || el.dataset.suffix;
      const was = el.dataset.suffix;
      el.dataset.suffix = lang === 'es' && SUFFIX_ES[el.__sfx] || el.__sfx;
      if (/^\d/.test(el.textContent) && el.textContent.endsWith(was) && was !== el.dataset.suffix)
        el.textContent = el.textContent.slice(0, el.textContent.length - was.length) + el.dataset.suffix;
    });
    document.querySelectorAll('#langToggle span').forEach(s => s.classList.toggle('on', s.dataset.l === lang));
    listeners.forEach(f => f(lang));
  }

  function set(l) {
    lang = l === 'es' ? 'es' : 'en';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    apply();
  }

  function init(dict, opts) {
    ES = dict || {};
    SUFFIX_ES = (opts && opts.suffix) || {};
    const btn = document.getElementById('langToggle');
    if (btn) btn.addEventListener('click', () => set(lang === 'es' ? 'en' : 'es'));
  }

  return { init, t: tr, get lang() { return lang; }, apply, onChange: f => listeners.push(f) };
})();
