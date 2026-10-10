/* Light / dark theme for chaparraldrai.com.
   Load this in <head> (no defer) so the saved choice applies before the page paints.
   - The choice lives in localStorage under "theme" ("dark" or "light"); dark is the default.
   - Sets <html data-theme="..."> so each page's CSS (and the Alla chat widget) can follow it.
   - Wires up any button with id="themeToggle" and keeps its aria-pressed in sync.
   - Other scripts can react with Theme.onChange(fn); Theme.get() returns the current theme. */
(function () {
  var KEY = "theme";
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var darkMeta = meta ? meta.getAttribute("content") : null;
  var listeners = [];

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(t) { try { localStorage.setItem(KEY, t); } catch (e) { /* private mode: still works for this page */ } }
  function clean(t) { return t === "light" ? "light" : "dark"; }

  function apply(t, notify) {
    t = clean(t);
    root.setAttribute("data-theme", t);
    root.style.colorScheme = t;
    if (meta) meta.setAttribute("content", t === "light" ? "#FFFFFF" : darkMeta);
    var b = document.getElementById("themeToggle");
    if (b) b.setAttribute("aria-pressed", t === "light" ? "true" : "false");
    if (notify) listeners.forEach(function (fn) { try { fn(t); } catch (e) {} });
  }

  apply(read(), false);

  /* Toggle button styles live here so every page gets the same control. */
  var sun = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='4.2'/%3E%3Cpath d='M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6'/%3E%3C/svg%3E\")";
  var moon = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linejoin='round'%3E%3Cpath d='M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7z'/%3E%3C/svg%3E\")";
  var css =
    ".theme-toggle{display:inline-grid;place-items:center;flex:none;width:36px;height:36px;padding:0;border-radius:10px;cursor:pointer;" +
    "color:#38B6F0;border:1px solid rgba(56,182,240,.45);background:rgba(56,182,240,.08);box-shadow:0 0 18px -6px rgba(56,182,240,.55);" +
    "transition:border-color .25s ease,box-shadow .25s ease}" +
    ".theme-toggle:hover{border-color:currentColor;box-shadow:0 0 22px -4px rgba(56,182,240,.7)}" +
    ".theme-toggle::before{content:'';width:17px;height:17px;background:currentColor;" +
    "-webkit-mask:" + sun + " center/contain no-repeat;mask:" + sun + " center/contain no-repeat}" +
    "html[data-theme=light] .theme-toggle{color:#0779B3;border-color:rgba(7,121,179,.4);background:rgba(7,121,179,.06);box-shadow:none}" +
    "html[data-theme=light] .theme-toggle::before{-webkit-mask-image:" + moon + ";mask-image:" + moon + "}" +
    "@media(max-width:760px){.theme-toggle{width:31px;height:31px;border-radius:9px}.theme-toggle::before{width:15px;height:15px}" +
    /* make room in the phone nav bar for the extra button (same nav markup on every page) */
    ".nav{gap:8px!important;padding-left:12px!important}.brand{gap:8px!important}.brand img{width:30px!important;height:27px!important}" +
    ".brand span{font-size:11.5px!important;letter-spacing:.12em!important}.lang-toggle span{padding:5px 7px!important}.nav-toggle{padding:7px 10px!important}}" +
    "@media(max-width:380px){.brand span{font-size:10.5px!important;letter-spacing:.07em!important}}" +
    "@media(max-width:340px){.nav{gap:6px!important}.brand span{font-size:10px!important;letter-spacing:.02em!important}.lang-toggle span{padding:5px!important}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  window.Theme = {
    get: function () { return clean(root.getAttribute("data-theme")); },
    set: function (t) { save(clean(t)); apply(t, true); },
    toggle: function () { this.set(this.get() === "light" ? "dark" : "light"); },
    onChange: function (fn) { listeners.push(fn); }
  };

  function bind() {
    var b = document.getElementById("themeToggle");
    if (!b || b.dataset.bound) return;
    b.dataset.bound = "1";
    b.setAttribute("aria-pressed", window.Theme.get() === "light" ? "true" : "false");
    b.addEventListener("click", function () { window.Theme.toggle(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();

  /* Keep other open tabs in step. */
  window.addEventListener("storage", function (e) { if (e.key === KEY) apply(e.newValue, true); });
})();