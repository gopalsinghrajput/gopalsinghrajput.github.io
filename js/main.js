(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var C = window.PORTFOLIO || { projects: {} };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Links from config ---------- */
  function setLink(key, url) {
    document.querySelectorAll('[data-link="' + key + '"]').forEach(function (el) {
      if (url) { el.href = url; el.hidden = false; } else if (key === 'github' || key === 'resume') { el.hidden = true; }
    });
  }
  setLink('linkedin', C.linkedin);
  setLink('github', C.github);
  setLink('resume', C.resumeUrl);
  setLink('whatsapp', C.whatsapp ? 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent('Hi Gopal, I saw your portfolio.') : '');
  if (C.resumeUrl) document.querySelector('[data-link="resume"]').setAttribute('download', '');

  var arrow = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  document.querySelectorAll('.project, .mini').forEach(function (card) {
    var p = (C.projects || {})[card.dataset.project] || {};
    var box = card.querySelector('.project__links');
    var html = '';
    if (p.live) html += '<a class="btn btn--solid magnetic" href="' + p.live + '" target="_blank" rel="noopener">Live demo ' + arrow + '</a>';
    // if (p.repo) html += '<a class="btn btn--ghost magnetic" href="' + p.repo + '" target="_blank" rel="noopener">Source code ' + arrow + '</a>';
    box.innerHTML = html;
  });

  /* ---------- Theme ---------- */
  var tbtn = document.getElementById('themeToggle');
  tbtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
  });

  /* ---------- Nav + progress + timeline ---------- */
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progressBar');
  var tl = document.getElementById('timeline');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 10);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    var r = tl.getBoundingClientRect();
    var prog = (window.innerHeight * 0.7 - r.top) / r.height;
    tl.style.setProperty('--tl', Math.max(0, Math.min(1, prog)).toFixed(3));
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* Active nav link */
  var links = document.querySelectorAll('.nav__links a');
  var sections = ['work', 'process', 'skills', 'experience', 'contact'].map(function (id) { return document.getElementById(id); });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) so.observe(s); });
  }

  /* ---------- Heading word split (for word-by-word reveal) ---------- */
  document.querySelectorAll('.split').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--d:' + i + '">' + w.replace(/</g, '&lt;') + '</span></span>';
    }).join(' ');
    if (!h.classList.contains('reveal')) h.classList.add('reveal-split');
  });

  /* ---------- Reveal + counters ---------- */
  function countUp(el) {
    var target = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce || target === 0) { el.textContent = pre + target + suf; return; }
    var start = performance.now(), dur = 1400;
    (function step(now) {
      var t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
      el.textContent = pre + Math.round(target * e) + suf;
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        var c = e.target.querySelector('[data-count]');
        if (c) countUp(c);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, .reveal-split').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .reveal-split').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Hero rotating word ---------- */
  var words = ['billing systems.', 'job portals.', 'booking apps.', 'CRM dashboards.', 'REST APIs.'];
  var rot = document.getElementById('rotator'), wi = 0;
  if (!reduce) {
    setTimeout(function () {
      setInterval(function () {
        rot.classList.add('is-out');
        setTimeout(function () { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove('is-out'); }, 230);
      }, 3200);
    }, 6000);
  }

  /* ---------- Terminal typing ---------- */
  var term = document.getElementById('terminal');
  var script = [
    { t: 'cmd', s: 'php artisan migrate --seed' },
    { t: 'out', s: '<span class="c-dim">  INFO  Running migrations.</span>' },
    { t: 'out', s: '  create_products_table <span class="c-dim">..........</span> <span class="c-ok">DONE</span>' },
    { t: 'out', s: '  create_invoices_table <span class="c-dim">..........</span> <span class="c-ok">DONE</span>' },
    { t: 'out', s: '' },
    { t: 'cmd', s: 'php artisan test' },
    { t: 'out', s: '  <span class="c-pass">PASS</span> Tests\\Feature\\InvoiceTest' },
    { t: 'out', s: '  <span class="c-ok">✓</span> creating invoice reduces stock and calculates gst' },
    { t: 'out', s: '  <span class="c-ok">✓</span> cannot sell more than stock' },
    { t: 'out', s: '  <span class="c-pass">PASS</span> Tests\\Feature\\BookingTest' },
    { t: 'out', s: '  <span class="c-ok">✓</span> same slot cannot be booked twice' },
    { t: 'out', s: '' },
    { t: 'out', s: '  <span class="c-key">Tests:</span>  <span class="c-ok">19 passed</span>' },
    { t: 'out', s: '' },
    { t: 'cmd', s: 'git push origin main' }
  ];
  function finalHTML() {
    return script.map(function (l) { return l.t === 'cmd' ? '<span class="c-prompt">$</span> ' + l.s : l.s; }).join('\n');
  }
  if (reduce) {
    term.innerHTML = finalHTML();
  } else {
    var done = '', li = 0;
    var typeLine = function () {
      if (li >= script.length) {
        term.innerHTML = done + '<span class="caret"></span>';
        setTimeout(function () { done = ''; li = 0; typeLine(); }, 4200);
        return;
      }
      var l = script[li];
      if (l.t === 'out') {
        done += l.s + '\n'; li++;
        term.innerHTML = done + '<span class="caret"></span>';
        setTimeout(typeLine, 120);
      } else {
        var i = 0;
        (function ch() {
          term.innerHTML = done + '<span class="c-prompt">$</span> ' + l.s.slice(0, i) + '<span class="caret"></span>';
          if (i++ < l.s.length) setTimeout(ch, 38 + Math.random() * 40);
          else { done += '<span class="c-prompt">$</span> ' + l.s + '\n'; li++; setTimeout(typeLine, 380); }
        })();
      }
    };
    term.innerHTML = '<span class="caret"></span>';
    setTimeout(typeLine, 900);
  }

  /* ---------- Screenshot switcher ---------- */
  document.querySelectorAll('.project').forEach(function (card) {
    var main = card.querySelector('[data-main]');
    var label = card.querySelector('.browser__bar p');
    card.querySelectorAll('.thumb').forEach(function (th) {
      th.addEventListener('click', function () {
        if (th.classList.contains('is-active')) return;
        card.querySelectorAll('.thumb').forEach(function (x) { x.classList.remove('is-active'); });
        th.classList.add('is-active');
        main.classList.add('is-swapping');
        setTimeout(function () {
          main.src = th.dataset.src; label.textContent = th.dataset.label;
          main.onload = function () { main.classList.remove('is-swapping'); };
          if (main.complete) main.classList.remove('is-swapping');
        }, 220);
      });
    });
  });

  /* ---------- Pointer effects (desktop only) ---------- */
  if (fine && !reduce) {
    var hero = document.getElementById('hero');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.querySelector('.hero__glow').style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.querySelector('.hero__glow').style.setProperty('--my', (e.clientY - r.top) + 'px');
    });

    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = 'rotateY(' + ((x - .5) * 7) + 'deg) rotateX(' + ((.5 - y) * 7) + 'deg) translateZ(0)';
        el.style.setProperty('--gx', x * 100 + '%'); el.style.setProperty('--gy', y * 100 + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--sx', (e.clientX - r.left) + 'px'); el.style.setProperty('--sy', (e.clientY - r.top) + 'px');
      });
    });

    var bindMagnet = function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    };
    document.querySelectorAll('.magnetic').forEach(bindMagnet);
  }

  /* ---------- Mobile menu ---------- */
  var mBtn = document.getElementById('menuBtn'), mMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    mBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }
  mBtn.addEventListener('click', function () { setMenu(mMenu.hidden); });
  mMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mMenu.hidden) { setMenu(false); mBtn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 720 && !mMenu.hidden) setMenu(false); });

  /* ---------- Marquee speeds up while scrolling ---------- */
  var mtrack = document.querySelector('.marquee__track');
  if (!reduce && mtrack && mtrack.getAnimations) {
    var lastY = window.scrollY, rate = 1;
    (function loop() {
      var y = window.scrollY, v = Math.min(6, Math.abs(y - lastY) / 8);
      lastY = y;
      rate += ((1 + v) - rate) * 0.08;
      mtrack.getAnimations().forEach(function (a) { a.playbackRate = rate; });
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Cursor glow + photo tilt (desktop only) ---------- */
  if (fine && !reduce) {
    var cur = document.querySelector('.cursor');
    window.addEventListener('pointermove', function (e) {
      cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      cur.classList.add('is-on');
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cur.classList.remove('is-on'); });

    var pt = document.getElementById('portrait');
    pt.addEventListener('pointermove', function (e) {
      var r = pt.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      pt.style.transform = 'perspective(900px) rotateY(' + (x * 12) + 'deg) rotateX(' + (-y * 12) + 'deg)';
    });
    pt.addEventListener('pointerleave', function () { pt.style.transform = ''; });
  }

  /* ---------- Project slider: arrows, drag, progress, autoplay, tap to open ---------- */
  var track = document.getElementById('sliderTrack');
  if (track) {
    var slider = document.getElementById('projectSlider');
    var prog = document.getElementById('sliderProgress');
    if (!fine) slider.querySelector('.slider__hint').textContent = 'Swipe · tap + on a card for details';
    var prevB = slider.querySelector('[data-slide="-1"]'), nextB = slider.querySelector('[data-slide="1"]');
    track.querySelectorAll('[data-repo]').forEach(function (a) {
      var p = (C.projects || {})[a.dataset.repo] || {};
      if (p.repo) a.href = p.repo; else a.hidden = true;
    });
    var step = function () { var s = track.querySelector('.slide'); return s ? s.getBoundingClientRect().width + 20 : 300; };
    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      var r = max > 0 ? track.scrollLeft / max : 1;
      var vis = track.clientWidth / track.scrollWidth;
      prog.style.transform = 'translateX(' + (r * (1 - vis) * 100 / vis) + '%) scaleX(1)';
      prog.style.width = (vis * 100) + '%';
      prevB.disabled = track.scrollLeft < 4;
      nextB.disabled = track.scrollLeft > max - 4;
      track.classList.toggle('is-end', track.scrollLeft > max - 4);
    };
    var go = function (dir) {
      var max = track.scrollWidth - track.clientWidth;
      if (dir > 0 && track.scrollLeft > max - 4) track.scrollTo({ left: 0 });
      else track.scrollBy({ left: dir * step() });
    };
    prevB.addEventListener('click', function () { go(-1); });
    nextB.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();

    // Mouse drag (touch already scrolls natively)
    var down = false, moved = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a, button')) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove('is-drag');
        var w = step(); track.scrollTo({ left: Math.round(track.scrollLeft / w) * w });
      }
    });

    // Tap "+" (touch screens) opens details; Escape closes
    track.querySelectorAll('.slide__toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = b.closest('.slide__card'), open = !card.classList.contains('is-open');
        track.querySelectorAll('.slide__card.is-open').forEach(function (c) { c.classList.remove('is-open'); c.querySelector('.slide__toggle').setAttribute('aria-expanded', 'false'); });
        card.classList.toggle('is-open', open);
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    // Spotlight follows the mouse inside a card
    if (fine) {
      track.querySelectorAll('.slide__card').forEach(function (c) {
        c.addEventListener('pointermove', function (e) {
          var r = c.getBoundingClientRect();
          c.style.setProperty('--sx', (e.clientX - r.left) + 'px'); c.style.setProperty('--sy', (e.clientY - r.top) + 'px');
        });
      });
    }

    // Gentle autoplay: only while visible, stops on hover / focus / touch / drag
    if (!reduce && 'IntersectionObserver' in window) {
      var paused = false, visible = false, timer;
      slider.addEventListener('pointerenter', function () { paused = true; });
      slider.addEventListener('pointerleave', function () { paused = false; });
      slider.addEventListener('focusin', function () { paused = true; });
      slider.addEventListener('focusout', function () { paused = false; });
      track.addEventListener('touchstart', function () { paused = true; clearInterval(timer); }, { passive: true });
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.4 }).observe(slider);
      timer = setInterval(function () { if (visible && !paused && !document.hidden) go(1); }, 4200);
    }
  }

  /* ---------- Copy email ---------- */
  var toast = document.getElementById('toast'), tt;
  function showToast(msg) { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 2000); }
  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.copy;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(function () { showToast('Email copied'); }, function () { location.href = 'mailto:' + v; });
      } else { location.href = 'mailto:' + v; }
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

/* ---- e-mail copy + mailbox prefill (added) ---- */
(function () {
  var toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }

  function copyEmail(email) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(email).then(function () { showToast('E-mail copied: ' + email); });
    }
    var temp = document.createElement('textarea');
    temp.value = email;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showToast('E-mail copied: ' + email);
    return Promise.resolve();
  }

  var subject = 'Interview / Joining — Gopal Singh';
  var body = 'Hi Gopal,\n\nI saw your portfolio and would like to discuss a role.\n\nRole: \nCompany: \nInterview date & time: \nJoining date: \n\nThanks,';

  document.querySelectorAll('[data-copy-email]').forEach(function (el) {
    el.addEventListener('click', function (event) {
      var email = el.getAttribute('data-copy-email');

      if (el.tagName === 'BUTTON') {
        event.preventDefault();
        copyEmail(email);
        return;
      }

      event.preventDefault();
      copyEmail(email).then(function () {
        var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(email)
          + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        window.open(gmail, '_blank', 'noopener');
      });
    });
  });
})();


// Global Copy to Clipboard with Toast
window.copyToClipboard = function(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('✓ Copied to clipboard: ' + text);
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
};

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('✓ Copied to clipboard: ' + text);
}

document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-copy]');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    var val = btn.getAttribute('data-copy');
    if (val) window.copyToClipboard(val);
  }
});
