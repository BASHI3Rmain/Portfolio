/* =========================================================
   SITE THEME SYSTEM — widget + persistence
   Include on every page along with theme.css. Also add the tiny
   inline anti-flash snippet at the very top of <head> (see
   theme-setup-README.md) so the saved theme applies before the
   page paints, instead of flashing light mode first.
   ========================================================= */
(function () {
  var STORAGE_KEY = 'site-theme';

  var THEMES = [
    { id: 'light',     label: 'Light',     swatch: '#0056b3' },
    { id: 'dark',      label: 'Dark',      swatch: '#4d9fff' },
    { id: 'cyberpunk', label: 'Cyberpunk', swatch: '#00fff2' },
    { id: 'minecraft', label: 'Minecraft', swatch: '#6aa84f' },
    { id: 'dracula',   label: 'Dracula',   swatch: '#ff79c6' },
    { id: 'synthwave', label: 'Synthwave', swatch: '#01cdfe' }
  ];

  function currentTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'light';
  }

  function applyTheme(id) {
    document.documentElement.setAttribute('data-theme', id);
  }

  function setTheme(id) {
    applyTheme(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* storage unavailable — theme just won't persist */ }
  }

  function buildWidget() {
    var btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Change site theme');
    btn.textContent = '🎨';

    var panel = document.createElement('div');
    panel.id = 'theme-panel';

    var title = document.createElement('div');
    title.className = 'theme-panel-title';
    title.textContent = 'Choose a theme';
    panel.appendChild(title);

    var active = currentTheme();

    THEMES.forEach(function (t) {
      var optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.className = 'theme-option' + (t.id === active ? ' active' : '');
      optBtn.dataset.themeId = t.id;

      var swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.background = t.swatch;

      optBtn.appendChild(swatch);
      optBtn.appendChild(document.createTextNode(t.label));

      optBtn.addEventListener('click', function () {
        setTheme(t.id);
        var opts = panel.querySelectorAll('.theme-option');
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove('active');
        optBtn.classList.add('active');
      });

      panel.appendChild(optBtn);
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('open');
      }
    });

    document.body.appendChild(btn);
    document.body.appendChild(panel);
  }

  // Apply immediately in case the anti-flash inline snippet wasn't added
  // to this page yet (harmless to do twice), then build the widget once
  // the DOM is ready.
  applyTheme(currentTheme());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
