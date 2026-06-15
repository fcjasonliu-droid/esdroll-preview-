/* ================================================
   EDAR — Main JS
   Vanilla JS, no dependencies
   ================================================ */

// ---- Header scroll effect ----
const header = document.getElementById('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// ---- Mobile menu toggle ----
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('open'));
  });
}

// ---- Render product highlights (Home page) ----
async function loadJSON(path) {
  const r = await fetch(path);
  return r.json();
}

function productCard(p, showSample = true) {
  const tag = p.tag ? `<span class="product-tag" style="background:${p.tag_color || '#16a34a'}">${p.tag}</span>` : '';
  // Extended specs from p.specs object (optional)
  const specs = p.specs || {};
  const specsHTML = Object.keys(specs).length > 0
    ? `<details class="product-specs-extended">
         <summary>View full specifications</summary>
         <table>
           ${Object.entries(specs).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
         </table>
       </details>`
    : '';
  return `
    <article class="product-card">
      <div class="product-card-img">
        <img src="assets/img/${p.img}" alt="${p.name}" loading="lazy">
        ${tag}
        <div class="product-card-badge">${p.thickness}</div>
      </div>
      <div class="product-card-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <ul class="product-specs">
          <li><strong>Thickness:</strong> ${p.thickness}</li>
          <li><strong>Resistance:</strong> ${p.surface_resistance}</li>
          <li><strong>Color:</strong> ${p.color}</li>
        </ul>
        ${specsHTML}
        ${showSample ? `<button class="btn btn-outline" onclick="openSampleModal('${p.name}')" data-i18n="card.request_sample">Request Free Sample →</button>` : ''}
      </div>
    </article>
  `;
}

async function renderHomeProducts() {
  try {
    const products = await loadJSON('data/products.json');
    const highlights = document.getElementById('productHighlights');
    if (highlights) highlights.innerHTML = products.map(p => productCard(p, true)).join('');
  } catch (e) {
    console.error('Failed to load products:', e);
  }
}

// ---- Render specs grid ----
async function renderSpecs() {
  const grid = document.getElementById('specsGrid');
  if (!grid) return;
  try {
    const s = await loadJSON('data/specs.json');
    const groups = s.groups || [];
    const lang = document.documentElement.lang || 'en';
    grid.innerHTML = groups.map(g => `
      <div class="spec-item">
        <div class="spec-icon">${g.icon_svg || ''}</div>
        <div class="spec-title">${lang === 'zh' ? g.title_zh : g.title}</div>
        <div class="spec-primary">
          <div class="spec-value">${g.primary}</div>
          <div class="spec-label">${lang === 'zh' ? g.primary_label_zh : g.primary_label}</div>
        </div>
        <ul class="spec-rows">
          ${(g.rows || []).map(r => `
            <li>
              <span class="spec-row-label">${lang === 'zh' ? r.label_zh : r.label}</span>
              <span class="spec-row-value">${r.value}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to load specs:', e);
  }
}

// ---- Sample modal ----
window.openSampleModal = function (productName) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop open';
  backdrop.innerHTML = `
    <div class="modal" style="position:relative;">
      <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">×</button>
      <h3>Request Free Sample</h3>
      <p>Product: <strong>${productName}</strong></p>
      <form class="form" onsubmit="event.preventDefault(); handleSampleSubmit('${productName}', this);">
        <div class="form-group" style="margin-bottom:16px;">
          <label>Your Name *</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label>Email *</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label>Company / Country</label>
          <input type="text" name="company">
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label>Shipping Address (for free sample)</label>
          <textarea name="address" rows="2"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Submit Sample Request →</button>
      </form>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) backdrop.remove();
  });
};

// ---- Toast notification ----
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---- Form validation ----
function validateQuoteForm(form) {
  const required = ['qf-name', 'qf-email'];
  let valid = true;
  // Clear previous errors
  form.querySelectorAll('.form-error').forEach(e => e.remove());
  form.querySelectorAll('.form-group.has-error').forEach(e => e.classList.remove('has-error'));
  // Check required fields
  for (const id of required) {
    const el = form.querySelector('#' + id);
    if (!el || !el.value.trim()) {
      valid = false;
      showFieldError(el, 'This field is required');
    }
  }
  // Email format
  const email = form.querySelector('#qf-email');
  if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    valid = false;
    showFieldError(email, 'Please enter a valid email address');
  }
  return valid;
}
function showFieldError(el, msg) {
  if (!el) return;
  const grp = el.closest('.form-group');
  if (!grp) return;
  grp.classList.add('has-error');
  const err = document.createElement('span');
  err.className = 'form-error';
  err.textContent = msg;
  grp.appendChild(err);
}

// ---- Form submissions ----
window.handleQuoteSubmit = function (form) {
  // Client validation
  if (!validateQuoteForm(form)) {
    // Focus first error
    const firstError = form.querySelector('.form-group.has-error input');
    if (firstError) firstError.focus();
    return false;
  }
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  // Loading state
  btn.disabled = true;
  btn.textContent = 'Sending...';
  btn.classList.add('is-loading');

  // Let the form submit natively to FormSubmit
  return true;
};

window.handleSampleSubmit = function (product, form) {
  const data = Object.fromEntries(new FormData(form));
  console.log('Sample request:', product, data);
  showToast('Sample request submitted! We will ship within 3–5 business days.', 'success');
  form.closest('.modal-backdrop').remove();
};

// ---- Smooth scroll for hash links ----
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href === '#' || href === '#!') return;
  const target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// ---- Back to top button ----
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- Video lightbox (in-page YouTube embed, no external jump) ----
function initVideoLightbox() {
  const box = document.getElementById('videoLightbox');
  if (!box) return;
  const ytId = box.getAttribute('data-youtube-id');
  if (!ytId) return;
  const open = () => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.style.zIndex = '9999';
    backdrop.innerHTML = `
      <div style="position:relative;width:90vw;max-width:960px;aspect-ratio:16/9;background:#000;border-radius:8px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
        <button type="button" aria-label="Close" style="position:absolute;top:-40px;right:0;background:transparent;color:white;border:none;font-size:32px;cursor:pointer;line-height:1;">×</button>
        <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="width:100%;height:100%;"></iframe>
      </div>
    `;
    document.body.appendChild(backdrop);
    const close = () => backdrop.remove();
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    backdrop.querySelector('button').addEventListener('click', close);
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
  };
  box.addEventListener('click', open);
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderHomeProducts();
  renderSpecs();
  initScrollAnimations();
  initVideoLightbox();
});

// ---- Scroll reveal animations ----
function initScrollAnimations() {
  // Add reveal class to elements that should animate in
  const targets = document.querySelectorAll('.feature-card, .product-card, .app-card, .testimonial-card, .user-logo, .stat-item, .material-card');
  targets.forEach(el => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('reveal-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// ---- Auto-fit user logos: 让所有 logo 视觉面积一致 ----
// 策略：所有 logo 渲染到同一"目标视觉面积"（≈ 5000 px²，宽 × 高）
// 竖图（窄）按高度撑 → 较宽；正方图按面积算 → 中等；宽图按高度截
(function fitUserLogos() {
  const imgs = document.querySelectorAll('.users-grid .user-logo img');
  if (!imgs.length) return;

  const TARGET_AREA = 5000;  // 目标像素面积
  const MAX_W = 150;         // 视觉宽度上限
  const MAX_H = 62;          // 视觉高度上限（cell 90-padding 28=62）
  const MIN_W = 90;          // 视觉宽度下限
  const MIN_H = 35;          // 视觉高度下限

// 2026-06-12 视觉统一：改由 CSS (style.css .user-logo img 130×50) 接管，禁用 JS inline style
function fit() { /* no-op: 视觉统一由 CSS 强制 130×50 框控制 */ }

  // 立即 fit + 兜底多次 fit（确保覆盖所有场景）
  fit();
  setTimeout(fit, 50);
  setTimeout(fit, 200);
  setTimeout(fit, 500);
  setTimeout(fit, 1000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fit);
  }
  window.addEventListener('load', fit);
  window.addEventListener('resize', () => setTimeout(fit, 100));
})();
