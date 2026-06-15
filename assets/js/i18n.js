/* ================================================
   EDAR — i18n (Internationalization) Engine
   Pure vanilla JS, no dependencies
   - 加载多语言 JSON
   - 运行时切换 DOM 文本
   - localStorage 记忆
   - 浏览器语言自动检测（首次）
   - Fallback 链（缺翻译时 fallback 到 en）
   ================================================ */

(function () {
  const STORAGE_KEY = 'edar_lang';
  const SUPPORTED = ['en', 'zh', 'es', 'ja', 'ko', 'de', 'fr', 'vi'];
  const FALLBACK = 'en';
  const I18N_BASE = 'assets/i18n/';

  // 内存缓存：{ lang: { key: value } }
  const cache = {};
  // 当前语言
  let currentLang = FALLBACK;

  // ---------- 工具函数 ----------
  function detectInitialLang() {
    // 1. localStorage 优先
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;

    // 2. URL 参数 ?lang=xx
    const url = new URL(window.location.href);
    const urlLang = url.searchParams.get('lang');
    if (urlLang && SUPPORTED.includes(urlLang)) return urlLang;

    // 3. 浏览器语言
    const browser = (navigator.language || 'en').toLowerCase();
    // zh-CN, zh-TW, zh-Hans, zh-Hant
    if (browser.startsWith('zh')) return 'zh';
    if (browser.startsWith('ja')) return 'ja';
    if (browser.startsWith('ko')) return 'ko';
    if (browser.startsWith('es')) return 'es';
    if (browser.startsWith('de')) return 'de';
    if (browser.startsWith('fr')) return 'fr';
    if (browser.startsWith('vi')) return 'vi';
    return FALLBACK;
  }

  async function loadLang(lang) {
    if (cache[lang]) return cache[lang];
    try {
      // 加 cache-busting 防止开发期 cache
      const r = await fetch(I18N_BASE + lang + '.json?_=' + Date.now());
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      cache[lang] = data;
      return data;
    } catch (e) {
      console.warn('[i18n] load failed:', lang, e);
      cache[lang] = {};
      return {};
    }
  }

  // 深度 key 解析：先查顶层直接 match，再按 . 切分走层级
  function lookup(obj, key) {
    if (obj == null) return undefined;
    // 1. 顶层直接 match（支持 "nav.home" 这类带点 key）
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
    // 2. 按 . 切分走层级
    const parts = key.split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = cur[p];
    }
    return cur;
  }

  // 多语言 fallback
  async function t(key, lang) {
    lang = lang || currentLang;
    const data = await loadLang(lang);
    let v = lookup(data, key);
    if (v != null) return v;
    // fallback 到英文
    if (lang !== FALLBACK) {
      const en = await loadLang(FALLBACK);
      v = lookup(en, key);
      if (v != null) return v;
    }
    return key;  // 最后返回 key 本身
  }

  // 应用翻译到 DOM
  async function apply(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // 更新 URL（不刷新）
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);

    // 替换 [data-i18n]
    const nodes = document.querySelectorAll('[data-i18n]');
    for (const node of nodes) {
      const key = node.getAttribute('data-i18n');
      const v = await t(key, lang);
      // 支持 data-i18n-attr 单独翻译属性（如 placeholder, title, aria-label）
      node.textContent = v;
    }

    // 替换 [data-i18n-attr] 的属性
    const attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (const node of attrNodes) {
      const spec = node.getAttribute('data-i18n-attr');
      // spec 格式: "placeholder:hero.placeholder;title:hero.title"
      const pairs = spec.split(';').map(s => s.trim()).filter(Boolean);
      for (const pair of pairs) {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (!attr || !key) continue;
        const v = await t(key, lang);
        node.setAttribute(attr, v);
      }
    }

    // 触发自定义事件（让页面其他逻辑响应）
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));

    // 更新切换按钮的激活状态 + 当前语言标签
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      const isCurrent = btn.getAttribute('data-lang-switch') === lang;
      btn.classList.toggle('active', isCurrent);
    });
    // 更新 toggle 按钮显示（EN / 中 / 等）
    const currentLabel = {
      en: 'EN', zh: '中', es: 'ES', ja: 'JP', ko: 'KR', de: 'DE', fr: 'FR', vi: 'VI'
    }[lang] || lang.toUpperCase();
    const currentSpan = document.querySelector('.lang-current');
    if (currentSpan) currentSpan.textContent = currentLabel;
  }

  // 公共 API：window.i18n
  window.i18n = {
    t,
    apply,
    get lang() { return currentLang; },
    SUPPORTED,
  };

  // ---------- 自动初始化 ----------
  // 等 DOM ready
  function init() {
    const initial = detectInitialLang();
    apply(initial);

    // 绑定切换按钮（下拉菜单项）
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang-switch]');
      if (!btn) return;
      e.preventDefault();
      const lang = btn.getAttribute('data-lang-switch');
      if (SUPPORTED.includes(lang)) {
        apply(lang);
        // 切换后关闭下拉
        document.querySelectorAll('.lang-switcher.open').forEach(s => s.classList.remove('open'));
        const toggle = document.getElementById('langToggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // 下拉开关
    const toggle = document.getElementById('langToggle');
    const switcher = document.querySelector('.lang-switcher');
    if (toggle && switcher) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = switcher.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      // 点外部关闭
      document.addEventListener('click', (e) => {
        if (!switcher.contains(e.target)) {
          switcher.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      // ESC 关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          switcher.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
