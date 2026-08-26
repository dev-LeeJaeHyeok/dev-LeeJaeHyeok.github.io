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

  if (sections.length) {
    let ticking = false;

    const setActive = id => {
      tocLinks.forEach(a => a.classList.toggle('is-active', a.dataset.target === id));
    };

    const updateToc = () => {
      ticking = false;

      // 문서 끝에서는 마지막 섹션(Contact)을 활성화한다.
      // 마지막 섹션은 판정선까지 올라오지 못하는 경우가 있어 별도 처리가 필요하다.
      const scrolled = window.scrollY + window.innerHeight;
      const bottomZone = Math.max(24, window.innerHeight * 0.08);
      if (scrolled >= document.documentElement.scrollHeight - bottomZone) {
        setActive(sections[sections.length - 1].id);
        return;
      }

      // 판정선(뷰포트 40%)을 지난 섹션 중 마지막 것이 현재 섹션.
      const line = window.innerHeight * 0.4;
      let current = sections[0];
      sections.forEach(s => {
        if (s.getBoundingClientRect().top <= line) current = s;
      });
      setActive(current.id);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateToc);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateToc();
  }

  /* ---------- 스킬 칩 등장 ---------- */
  const chipGroups = document.querySelectorAll('.chips');

  if (chipGroups.length) {
    if ('IntersectionObserver' in window) {
      const chipIo = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target); // 한 번만 재생한다
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: .15 });

      chipGroups.forEach(g => chipIo.observe(g));
    } else {
      // IO 미지원 환경에서는 애니메이션 없이 바로 노출
      document.body.classList.add('no-anim');
    }
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

  /* ---------- 인라인 아이콘 ----------
     글 안에 [[파일명]]을 쓰면 assets/img/icon/파일명.png 로 바뀐다.
     예) "PROBLEM · [[question_mark]] 무엇이 문제였나"
     크기를 키우려면 [[question_mark|lg]], 줄이려면 |sm.
     먼저 escape한 뒤 치환하므로 본문에 태그를 직접 쓸 일은 없다. */
  const ICON_DIR = 'assets/img/icon/';

  function rich(str) {
    return esc(str).replace(
      /\[\[([a-z0-9_-]+)(?:\|(sm|lg|after))?\]\]/gi,
      (_, name, mod) =>
        `<img class="ico${mod ? ' ico--' + mod : ''}" src="${ICON_DIR}${name}.png" alt="" aria-hidden="true">`
    );
  }

  /* 섹션 라벨 — 아이콘이나 문구를 바꾸려면 여기만 고치면 된다 */
  const SEC_LABEL = {
    asis:     'AS-IS · 기존 구조',
    problem:  '[[question_mark|lg]]무엇이 문제였나',

    tobe:     'TO-BE · 개선 구조',
    solution: '[[solution_mark|lg]]해결 과정',
    impl:     'DIRECT IMPLEMENTATION · 직접 구현',
    test:     'VALIDATION · 검증',
    result:   'RESULT · 결과'
  };

  /* 확대 가능한 이미지 한 장. 버튼으로 감싸 키보드 접근과 확대를 함께 해결한다 */
  function zoomable(src, label) {
    return `<div class="m-fig">
      <button type="button" class="m-fig__zoom" data-zoom="${esc(src)}"
              aria-label="${esc(label || '이미지')} 크게 보기">
        <img src="${esc(src)}" alt="" loading="lazy" decoding="async">
        <span class="m-fig__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
               stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>
          </svg>
        </span>
      </button>
    </div>`;
  }

  function figure(fig) {
    if (!fig) return '';
    const inner = fig.img
      ? zoomable(fig.img, fig.caption)
      : `<div class="m-fig"><p class="m-fig__ph">${fig.placeholder}</p></div>`;
    return `${inner}<p class="m-cap">${esc(fig.caption)}</p>`;
  }

  /* 블록 내부는 data.js에 적은 키 순서대로 그린다.
     { h, img, p } 로 쓰면 제목→이미지→설명,
     { img, p, h } 로 쓰면 이미지→설명→제목 순으로 나온다.
     (자바스크립트 객체는 문자열 키의 선언 순서를 그대로 유지한다) */
  const BLOCK_PART = {
    // STEP 표시는 블록이 둘 이상이고 그 블록의 첫 제목일 때만. h2 같은 소제목엔 안 붙는다
    h: (v, b, i, total, first) => `<div class="m-sol__head">
          ${total > 1 && first
            ? `<span class="m-sol__step">STEP ${String(i + 1).padStart(2, '0')}</span>`
            : ''}
          <h4 class="m-sol__block-title">${rich(v)}</h4>
        </div>`,
    img: (v, b) => zoomable(v, b.h),
    p:   (v) => `<p class="m-sol__block-desc">${rich(v)}</p>`
  };

  /* data.js로 그리는 프로젝트(proj2·proj3)용 최소 렌더러.
     옛 [문제, 해결] 배열도 블록으로 바꿔 같은 모양으로 그린다. */
  function toBlocks(s) {
    if (Array.isArray(s)) return { blocks: [{ h: s[0], p: s[1] }] };
    return s;
  }

  function blockParts(b, i, total) {
    return Object.keys(b).map(k => {
      const m = /^(h|img|p)(\d+)?$/.exec(k);
      if (!m || !b[k]) return '';
      const list = Array.isArray(b[k]) ? b[k] : [b[k]];
      return list.filter(Boolean)
        .map((v, n) => BLOCK_PART[m[1]](v, b, i, total, !m[2] && n === 0))
        .join('');
    }).join('');
  }

  function buildProject(p) {
    let html = `
      <div class="m-head">
        <p class="m-eyebrow">${esc(p.eyebrow)}</p>
        <h2 class="m-title">${esc(p.title)}</h2>
        <p class="m-summary">${rich(p.summary)}</p>
        <dl class="m-meta">
          ${p.meta.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
        </dl>
      </div>`;

    if (p.asis) {
      html += `<section class="m-sec">
        <p class="m-sec__label">${rich(SEC_LABEL.asis)}</p>
        ${figure(p.asis)}
      </section>`;
    }

    if (p.problems && p.problems.length) {
      html += `<section class="m-sec">
        <p class="m-sec__label">${rich(SEC_LABEL.problem)}</p>
        <div class="m-list">
          ${p.problems.map(x => `<div><h4>${rich(x.h)}</h4><p>${rich(x.p)}</p></div>`).join('')}
        </div>
      </section>`;
    }

//     if (p.tobe) {
//       html += `<section class="m-sec">
//         <p class="m-sec__label is-accent">${rich(SEC_LABEL.tobe)}</p>
//         ${figure(p.tobe)}
//       </section>`;
//     }
//
//     if (p.solution_test) {
//       html += `<section class="m-sec">
// <!--    <p class="m-sec__label is-accent">${rich(SEC_LABEL.tobe)}</p>-->
//     ${figure(p.solution_test)}
//     </section>`;
//     }

    if (p.solutions && p.solutions.length) {
      html += `<section class="m-sec">
        <p class="m-sec__label">${rich(SEC_LABEL.solution)}</p>
        <div class="m-sol">
          ${p.solutions.map(toBlocks).map((s, i) => `
            <article class="m-sol__item">
              <p class="m-sol__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>
              <div class="m-sol__body">
                ${s.for ? `<p class="m-sol__sub">${rich(s.for)}</p>` : ''}
                ${(s.blocks || []).map((b, bi, arr) => `
                  <div class="m-sol__block">${blockParts(b, bi, arr.length)}</div>`).join('')}
              </div>
            </article>`).join('')}
        </div>
      </section>`;
    }

    if (p.impl && p.impl.length) {
      html += `<section class="m-sec">
        <p class="m-sec__label">${rich(SEC_LABEL.impl)}</p>
        <ul class="m-impl">${p.impl.map(i => `<li>${rich(i)}</li>`).join('')}</ul>
      </section>`;
    }

    if (p.tests && p.tests.length) {
      html += `<section class="m-sec">
        <p class="m-sec__label is-accent">${rich(SEC_LABEL.test)}</p>
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
        <p class="m-sec__label">${rich(SEC_LABEL.result)}</p>
        <p class="m-cap">${rich(p.result)}</p>
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
    upgradeZoom(modalContent);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    modal.scrollTop = 0;
    // is-open 적용 직후 focus(). CSS에서 visibility를 즉시 전환하므로 동기 호출로 충분하다.
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.focus();
      // 마우스 클릭 시 브라우저가 뒤늦게 카드로 포커스를 되돌리는 경우에 대한 보정
      if (document.activeElement !== closeBtn) {
        requestAnimationFrame(() => closeBtn.focus());
      }
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');

    if (lastFocused && document.contains(lastFocused) && lastFocused.focus) {
      lastFocused.focus();
    }
    // 복원할 대상이 없으면 숨겨진 모달 안에 포커스가 남지 않도록 정리한다.
    if (modal.contains(document.activeElement)) document.activeElement.blur();
    lastFocused = null;
  }

  /* 템플릿에 쓴 <img data-zoom> 을 확대 버튼으로 감싼다.
     덕분에 index.html에는 <img> 한 줄만 쓰면 된다. */
  const ZOOM_MARK = `<span class="m-fig__mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
           stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>
      </svg>
    </span>`;

  function upgradeZoom(root) {
    root.querySelectorAll('img[data-zoom]').forEach(img => {
      const src = img.getAttribute('src');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'm-fig__zoom';
      btn.dataset.zoom = src;
      btn.setAttribute('aria-label', (img.alt || '이미지') + ' 크게 보기');
      img.removeAttribute('data-zoom');
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      img.parentNode.insertBefore(btn, img);
      btn.appendChild(img);
      btn.insertAdjacentHTML('beforeend', ZOOM_MARK);
    });
  }

  document.querySelectorAll('[data-modal]').forEach(el => {
    const open = () => {
      const key = el.dataset.modal;
      // index.html에 템플릿이 있으면 그쪽이 우선. 없으면 data.js로 그린다
      const tpl = document.getElementById('tpl-' + key);
      if (tpl) { openModal(tpl.innerHTML); return; }
      const p = PROJECTS[key];
      if (p) openModal(buildProject(p));
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  document.querySelectorAll('[data-skill]').forEach(el => {
    // 시각적 신호(+ 마커)는 aria-hidden이므로 접근성 이름으로 용도를 밝힌다
    const label = el.querySelector('.chip__name');
    if (label) el.setAttribute('aria-label', label.textContent.trim() + ' 상세 경험 보기');

    el.addEventListener('click', () => {
      const s = SKILLS[el.dataset.skill];
      if (s) openModal(buildSkill(s));
    });
  });

  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  /* ---------- 이미지 확대 ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  let lbLastFocused = null;

  function openLightbox(src, alt) {
    lbLastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    const btn = lightbox.querySelector('.lightbox__close');
    if (btn) btn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lbLastFocused && document.contains(lbLastFocused)) lbLastFocused.focus();
    if (lightbox.contains(document.activeElement)) document.activeElement.blur();
    lbLastFocused = null;
  }

  // 모달 내용은 스크립트가 매번 새로 그리므로 위임으로 받는다
  modalContent.addEventListener('click', e => {
    const zoom = e.target.closest('[data-zoom]');
    if (zoom) openLightbox(zoom.dataset.zoom, zoom.getAttribute('aria-label'));
  });

  lightbox.querySelectorAll('[data-lb-close]').forEach(el => {
    el.addEventListener('click', closeLightbox);
  });
  lightboxImg.addEventListener('click', closeLightbox);

  // 확대 상태에서는 포커스가 뒤쪽 모달로 새지 않게 막는다
  lightbox.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const btn = lightbox.querySelector('.lightbox__close');
    if (btn) btn.focus();
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    // 위에 떠 있는 것부터 닫는다
    if (lightbox.classList.contains('is-open')) { closeLightbox(); return; }
    if (modal.classList.contains('is-open')) closeModal();
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
