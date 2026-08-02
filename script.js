(function () {
  'use strict';

  /* ---------- 모바일 내비게이션 ---------- */
  const toggle = document.getElementById('navToggle');
  const menu = document.querySelector('.nav__menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- TOC 스크롤 연동 ---------- */
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  const sections = tocLinks
    .map(a => document.getElementById(a.dataset.target))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(a => {
          a.classList.toggle('is-active', a.dataset.target === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(s => io.observe(s));
  }

  /* ---------- 모달 ---------- */
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  let lastFocused = null;

  function esc(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function figure(fig) {
    if (!fig) return '';
    const inner = fig.img
      ? `<img src="${esc(fig.img)}" alt="">`
      : `<p class="m-fig__ph">${fig.placeholder}</p>`;
    return `<div class="m-fig">${inner}</div>
            <p class="m-cap">${esc(fig.caption)}</p>`;
  }

  function buildProject(p) {
    let html = `
      <div class="m-head">
        <p class="m-eyebrow">${esc(p.eyebrow)}</p>
        <h2 class="m-title">${esc(p.title)}</h2>
        <p class="m-cap">${esc(p.summary)}</p>
        <dl class="m-meta">
          ${p.meta.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
        </dl>
      </div>`;

    if (p.asis) {
      html += `<section class="m-sec">
        <p class="m-sec__label">AS-IS · 기존 구조</p>
        ${figure(p.asis)}
      </section>`;
    }

    if (p.problems && p.problems.length) {
      html += `<section class="m-sec">
        <p class="m-sec__label">PROBLEM · 무엇이 문제였나</p>
        <div class="m-list">
          ${p.problems.map(x => `<div><h4>${esc(x.h)}</h4><p>${esc(x.p)}</p></div>`).join('')}
        </div>
      </section>`;
    }

    if (p.tobe) {
      html += `<section class="m-sec">
        <p class="m-sec__label is-accent">TO-BE · 개선 구조</p>
        ${figure(p.tobe)}
      </section>`;
    }

    if (p.solutions && p.solutions.length) {
      html += `<section class="m-sec">
        <p class="m-sec__label is-accent">SOLUTION · 문제와 해결</p>
        <div class="m-map">
          ${p.solutions.map(([from, to]) => `
            <div class="m-map__row">
              <span class="m-map__from">${esc(from)}</span>
              <span class="m-map__ar" aria-hidden="true">&rarr;</span>
              <span class="m-map__to">${esc(to)}</span>
            </div>`).join('')}
        </div>
      </section>`;
    }

    if (p.impl && p.impl.length) {
      html += `<section class="m-sec">
        <p class="m-sec__label">DIRECT IMPLEMENTATION · 직접 구현</p>
        <ul class="m-impl">${p.impl.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      </section>`;
    }

    if (p.tests && p.tests.length) {
      html += `<section class="m-sec">
        <p class="m-sec__label is-accent">VALIDATION · 검증</p>
        <div class="m-tests">
          ${p.tests.map(t => `
            <div>
              <p class="m-test__name">${esc(t.name)}</p>
              <p class="m-test__cond">${esc(t.cond)}</p>
              <div class="m-test__nums">
                ${t.nums.map(([n, c]) => `
                  <div>
                    <p class="m-test__num">${esc(n)}</p>
                    <p class="m-test__cap">${esc(c)}</p>
                  </div>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </section>`;
    }

    if (p.result) {
      html += `<section class="m-sec">
        <p class="m-sec__label">RESULT · 결과</p>
        <p class="m-cap">${esc(p.result)}</p>
      </section>`;
    }

    return html;
  }

  function buildSkill(s) {
    return `
      <div class="m-head">
        <p class="m-eyebrow">SKILL</p>
        <h2 class="m-title">${esc(s.name)}</h2>
        <p class="m-skill__period">${esc(s.period)}</p>
        <p class="m-cap">${esc(s.body)}</p>
      </div>`;
  }

  function openModal(html) {
    lastFocused = document.activeElement;
    modalContent.innerHTML = html;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    modal.scrollTop = 0;
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-modal]').forEach(el => {
    const open = () => {
      const p = PROJECTS[el.dataset.modal];
      if (p) openModal(buildProject(p));
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  document.querySelectorAll('[data-skill]').forEach(el => {
    el.addEventListener('click', () => {
      const s = SKILLS[el.dataset.skill];
      if (s) openModal(buildSkill(s));
    });
  });

  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* 모달 내부 포커스 유지 */
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll(
      'button, a[href], input, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

})();
