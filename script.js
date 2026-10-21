/**
 * DEHRADUN DEFENCE INSTITUTE - OFFICIAL APPLICATION SCRIPT
 * Functionality: Smooth Scroll, Navigation, GSAP ScrollTrigger Animations,
 *                Course Details Modal, Admissions Modal, and Form Validation.
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================================
     1. DOM REFERENCES
     ========================================================================= */
  const header = document.getElementById('header');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const backToTopBtn = document.getElementById('backToTop');
  const currentYearSpan = document.getElementById('currentYear');

  // Modals
  const enquiryModal = document.getElementById('enquiryModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openEnquiryButtons = document.querySelectorAll('.open-enquiry-modal');

  const programDetailModal = document.getElementById('programDetailModal');
  const detailModalCloseBtn = document.getElementById('detailModalCloseBtn');
  const detailModalContent = document.getElementById('detailModalContent');
  const programTriggers = document.querySelectorAll('.program-modal-trigger');

  // Form Elements
  const enquiryForm = document.getElementById('enquiryForm');
  const formSuccessMessage = document.getElementById('formSuccessMessage');
  const resetFormBtn = document.getElementById('resetFormBtn');
  const submitBtn = document.getElementById('submitBtn');

  /* =========================================================================
     2. COPYRIGHT YEAR
     ========================================================================= */
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* =========================================================================
     3b. HERO BACKGROUND SLIDER (slider-img-01 / 02 / 03)
     ========================================================================= */
  const heroSlider = document.getElementById('heroSlider');
  const heroSlides = heroSlider ? heroSlider.querySelectorAll('.hero-slide') : [];
  const heroTextSlides = document.querySelectorAll('.hero-text-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');
  const heroCurrent = document.getElementById('heroCurrent');
  const heroUI = document.querySelector('.hero-slider-ui');
  const heroSection = document.getElementById('hero');

  if (heroSlider && heroSlides.length > 1) {
    let heroIndex = 0;
    let heroTimer = null;
    const HERO_DELAY = 5500;
    let heroPaused = false;

    function padNum(n) {
      return (n + 1).toString().padStart(2, '0');
    }

    function renderHeroDots() {
      heroDots.forEach(function (dot, i) {
        const active = i === heroIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
        dot.setAttribute('tabindex', active ? '0' : '-1');
        // Restart progress-bar animation on active dot
        const bar = dot.querySelector('.hero-dot-bar');
        if (bar && active && !prefersReducedMotion && !heroPaused) {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = '';
        }
      });
      if (heroCurrent) heroCurrent.textContent = padNum(heroIndex);
    }

    function showHeroSlide(next) {
      const total = heroSlides.length;
      const prev = heroIndex;
      heroIndex = ((next % total) + total) % total;
      if (prev === heroIndex) {
        renderHeroDots();
        return;
      }
      heroSlides[prev].classList.add('is-leaving');
      heroSlides[prev].classList.remove('is-active');
      heroSlides[prev].setAttribute('aria-hidden', 'true');
      heroSlides[heroIndex].classList.add('is-active');
      heroSlides[heroIndex].removeAttribute('aria-hidden');
      setTimeout(function () {
        heroSlides[prev].classList.remove('is-leaving');
      }, 1200);
      // Sync per-slide text content
      if (heroTextSlides.length) {
        heroTextSlides.forEach(function (t, i) {
          const active = i === heroIndex;
          t.classList.toggle('is-active', active);
          if (active) {
            t.removeAttribute('aria-hidden');
            t.removeAttribute('inert');
          } else {
            t.setAttribute('aria-hidden', 'true');
            t.setAttribute('inert', '');
          }
        });
      }
      renderHeroDots();
    }

    function startHeroAutoplay() {
      stopHeroAutoplay();
      if (prefersReducedMotion || heroPaused) return;
      heroTimer = setInterval(function () {
        if (!document.hidden) showHeroSlide(heroIndex + 1);
      }, HERO_DELAY);
    }

    function stopHeroAutoplay() {
      if (heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
      }
    }

    function restartHeroAutoplay() {
      // Re-trigger dot progress animation
      renderHeroDots();
      startHeroAutoplay();
    }

    if (heroNext) {
      heroNext.addEventListener('click', function () {
        showHeroSlide(heroIndex + 1);
        restartHeroAutoplay();
      });
    }
    if (heroPrev) {
      heroPrev.addEventListener('click', function () {
        showHeroSlide(heroIndex - 1);
        restartHeroAutoplay();
      });
    }

    heroDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const n = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(n)) {
          showHeroSlide(n);
          restartHeroAutoplay();
        }
      });
      dot.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const n = (heroIndex + dir + heroSlides.length) % heroSlides.length;
          showHeroSlide(n);
          restartHeroAutoplay();
          if (heroDots[n]) heroDots[n].focus();
        }
      });
    });

    // Pause on hover / focus, resume on leave (desktop UX)
    if (heroSection) {
      heroSection.addEventListener('mouseenter', function () {
        heroPaused = true;
        stopHeroAutoplay();
        if (heroUI) heroUI.classList.add('is-paused');
      });
      heroSection.addEventListener('mouseleave', function () {
        heroPaused = false;
        if (heroUI) heroUI.classList.remove('is-paused');
        startHeroAutoplay();
        renderHeroDots();
      });
    }

    // Touch swipe support
    let touchX = null;
    heroSection.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    heroSection.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) {
        showHeroSlide(heroIndex + (dx < 0 ? 1 : -1));
        restartHeroAutoplay();
      }
      touchX = null;
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopHeroAutoplay();
      else if (!heroPaused) startHeroAutoplay();
    });

    renderHeroDots();
    startHeroAutoplay();
  }

  // Initial inert state for hidden text slides (so keyboard skips them)
  if (heroTextSlides.length) {
    heroTextSlides.forEach(function (t, i) {
      if (i !== 0) t.setAttribute('inert', '');
    });
  }

  /* =========================================================================
     3. STICKY HEADER & SCROLL BEHAVIOR
     ========================================================================= */
  function handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =========================================================================
     3b. FLOAT ACTION MENU (Indian Flag Toggle)
     ========================================================================= */
  const floatMenu = document.getElementById('floatMenu');
  const floatMenuToggle = document.getElementById('floatMenuToggle');

  function closeFloatMenu() {
    if (!floatMenu || !floatMenuToggle) return;
    floatMenu.classList.remove('open');
    floatMenuToggle.setAttribute('aria-expanded', 'false');
    floatMenuToggle.setAttribute('aria-label', 'Open quick contact menu');
  }

  if (floatMenu && floatMenuToggle) {
    floatMenuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = floatMenu.classList.toggle('open');
      floatMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      floatMenuToggle.setAttribute(
        'aria-label',
        isOpen ? 'Close quick contact menu' : 'Open quick contact menu'
      );
    });

    document.addEventListener('click', function (e) {
      if (floatMenu.classList.contains('open') && !floatMenu.contains(e.target)) {
        closeFloatMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && floatMenu.classList.contains('open')) {
        closeFloatMenu();
        floatMenuToggle.focus();
      }
    });
  }

  /* =========================================================================
     4. MOBILE DRAWER MENU
     ========================================================================= */
  function openMobileNav() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) closeMobileNav();
      else openMobileNav();
    });

    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileNav);
    if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMobileNav);

    mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileNav();
      }
    });
  }

  /* =========================================================================
     5. ENQUIRY MODAL (ENROLL NOW POPUP)
     ========================================================================= */
  function openEnquiry() {
    if (enquiryModal) {
      enquiryModal.classList.add('active');
      enquiryModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeEnquiry() {
    if (enquiryModal) {
      enquiryModal.classList.remove('active');
      enquiryModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  openEnquiryButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      closeMobileNav();
      openEnquiry();
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeEnquiry);
  }

  if (enquiryModal) {
    enquiryModal.addEventListener('click', function (e) {
      if (e.target === enquiryModal) closeEnquiry();
    });
  }

  /* =========================================================================
     6. PROGRAM DETAIL MODAL (SYLLABUS & ELIGIBILITY)
     ========================================================================= */
  const programDetails = {
    nda: {
      title: 'NDA (National Defence Academy)',
      sub: 'Join the Army, Navy & Air Force after 10+2',
      badge: 'UPSC ENTRANCE EXAMINATION',
      points: [
        'Paper I: Mathematics (300 Marks) - Comprehensive 11th & 12th syllabus coverage.',
        'Paper II: General Ability Test / GAT (600 Marks) - English, Physics, Chemistry, Indian History, Geography & Current Affairs.',
        'Daily OMR practice tests and negative marking elimination drills.',
        'Integrated SSB screening and physical fitness conditioning.'
      ]
    },
    cds: {
      title: 'CDS (Combined Defence Services)',
      sub: 'Become a Commissioned Officer (IMA, INA, AFA, OTA)',
      badge: 'GRADUATES & FINAL YEAR STUDENTS',
      points: [
        'In-depth coaching for English Comprehension, Elementary Mathematics, and General Knowledge.',
        'Dedicated OTA stream with double-paper focus (English + GK).',
        'Daily national security analysis, international relations, and constitutional law modules.',
        'One-on-one performance reviews and mistake log tracking.'
      ]
    },
    ssb: {
      title: 'SSB 5-Day Interview Training Wing',
      sub: 'Master the Two-Stage Board Evaluation & 15 OLQs',
      badge: 'PERSONALITY • INTELLIGENCE • LEADERSHIP',
      points: [
        'Stage 1: OIR (Officer Intelligence Rating) and PPDT screening with group discussion.',
        'Stage 2: Complete psychological battery (TAT, WAT, SRT, Self Description).',
        'GTO Ground Tasks: Progressive Group Task, Command Task, Snake Race, and Lecturette.',
        'Mock Personal Interviews simulating real board interviewing officers.'
      ]
    },
    afcat: {
      title: 'AFCAT (Air Force Common Admission Test)',
      sub: 'Fly High with the Indian Air Force',
      badge: 'FLYING & GROUND DUTY BRANCHES',
      points: [
        'Computer-Based Exam (CBT) training covering Verbal, Numerical, Reasoning, and Military Aptitude.',
        'Speed-maths shortcuts and spatial pattern recognition tricks.',
        'Comprehensive General Awareness and defence aviation history.',
        'AFSB Interview orientation upon clearing the cut-off.'
      ]
    }
  };

  function openProgramModal(programKey) {
    const data = programDetails[programKey] || programDetails.nda;
    if (!detailModalContent) return;

    detailModalContent.innerHTML = `
      <div class="modal-form-header">
        <span class="modal-badge">${data.badge}</span>
        <h3 class="modal-title">${data.title}</h3>
        <p class="modal-subtitle">${data.sub}</p>
      </div>
      <div style="margin: 20px 0;">
        <h4 style="font-size:1rem; font-weight:800; color:#FFFFFF; margin-bottom:12px;">Key Syllabus & Modules:</h4>
        <ul style="display:flex; flex-direction:column; gap:10px;">
          ${data.points.map(pt => `<li style="font-size:0.88rem; color:#CBDCEE; position:relative; padding-left:18px;"><span style="position:absolute; left:0; color:#FF6B00;">✓</span>${pt}</li>`).join('')}
        </ul>
      </div>
      <div style="margin-top:24px; padding-top:16px; border-top:1px solid rgba(203,220,238,0.2); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <span style="font-size:0.85rem; color:#E5F0FC; font-weight:700;">Batches commencing every Monday</span>
        <button type="button" class="btn btn-pill-enroll open-enquiry-from-detail">ENROLL NOW ↗</button>
      </div>
    `;

    const detailEnrollBtn = detailModalContent.querySelector('.open-enquiry-from-detail');
    if (detailEnrollBtn) {
      detailEnrollBtn.addEventListener('click', function () {
        closeProgramDetailModal();
        openEnquiry();
      });
    }

    if (programDetailModal) {
      programDetailModal.classList.add('active');
      programDetailModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProgramDetailModal() {
    if (programDetailModal) {
      programDetailModal.classList.remove('active');
      programDetailModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  programTriggers.forEach(function (card) {
    card.addEventListener('click', function () {
      const key = card.getAttribute('data-program') || 'nda';
      openProgramModal(key);
    });

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const key = card.getAttribute('data-program') || 'nda';
        openProgramModal(key);
      }
    });
  });

  if (detailModalCloseBtn) {
    detailModalCloseBtn.addEventListener('click', closeProgramDetailModal);
  }

  if (programDetailModal) {
    programDetailModal.addEventListener('click', function (e) {
      if (e.target === programDetailModal) closeProgramDetailModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeEnquiry();
      closeProgramDetailModal();
    }
  });

  /* =========================================================================
     7. ENQUIRY FORM VALIDATION
     ========================================================================= */
  if (enquiryForm) {
    const nameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phoneNumber');
    const emailInput = document.getElementById('emailAddress');
    const progSelect = document.getElementById('programSelect');

    function checkValid(field, cond) {
      const parent = field.closest('.form-group');
      if (!cond) {
        parent.classList.add('has-error');
        return false;
      } else {
        parent.classList.remove('has-error');
        return true;
      }
    }

    [nameInput, phoneInput, emailInput, progSelect].forEach(function (inp) {
      if (inp) {
        inp.addEventListener('input', function () {
          inp.closest('.form-group').classList.remove('has-error');
        });
      }
    });

    enquiryForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;
      if (!checkValid(nameInput, nameInput.value.trim().length >= 2)) valid = false;
      if (!checkValid(phoneInput, phoneInput.value.trim().replace(/\D/g, '').length === 10)) valid = false;
      if (!checkValid(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()))) valid = false;
      if (!checkValid(progSelect, progSelect.value !== '')) valid = false;

      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'SUBMITTING...';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'SUBMIT APPLICATION';
        enquiryForm.style.display = 'none';
        formSuccessMessage.removeAttribute('hidden');
      }, 600);
    });

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', function () {
        enquiryForm.reset();
        enquiryForm.style.display = 'flex';
        formSuccessMessage.setAttribute('hidden', '');
        nameInput.focus();
      });
    }
  }

  /* =========================================================================
     8. GSAP SCROLLTRIGGER ANIMATIONS
     ========================================================================= */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    // Recalc triggers after heavy images/fonts load — prevents sections stuck at opacity 0
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }

    // NOTE: course cards intentionally have NO scroll-hide animation —
    // they must stay visible even if a trigger mis-fires (hover zoom + pill reveal handle the flair).

    // Hero entrance (container-level only — per-slide text animates via CSS .is-active)
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.site-header', { y: -30, opacity: 0, duration: 0.7 })
      .from('.hero-editorial-col', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
      .from('.hero-slider-ui', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-down-chevron', { opacity: 0, duration: 0.6 }, '-=0.3');

    // Wings Ribbon
    gsap.from('.wing-item', {
      scrollTrigger: { trigger: '.wings-ribbon-section', start: 'top 90%' },
      y: 20,
      opacity: 0,
      stagger: 0.08,
      duration: 0.5,
      ease: 'power2.out'
    });

    // About section
    gsap.from('.about-content-col', {
      scrollTrigger: { trigger: '.about-section', start: 'top 80%' },
      x: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
    gsap.from('.about-bg-img', {
      scrollTrigger: { trigger: '.about-section', start: 'top 80%' },
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    });
    gsap.from('.pillar-box', {
      scrollTrigger: { trigger: '.about-pillars-grid', start: 'top 85%' },
      y: 24,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Courses cards — incoming + outgoing on vertical scroll (batch, reversible)
    gsap.set('.course-visual-card', { y: 44, opacity: 0 });
    ScrollTrigger.batch('.course-visual-card', {
      start: 'top 92%',
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', overwrite: true });
      },
      onLeave: function (batch) {
        gsap.to(batch, { y: -30, opacity: 0, stagger: 0.05, duration: 0.45, ease: 'power2.in', overwrite: true });
      },
      onEnterBack: function (batch) {
        gsap.to(batch, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out', overwrite: true });
      },
      onLeaveBack: function (batch) {
        gsap.to(batch, { y: 44, opacity: 0, stagger: 0.05, duration: 0.45, ease: 'power2.in', overwrite: true });
      }
    });

    // Facilities cards — incoming + outgoing on scroll (batch, reversible)
    gsap.set('.facility-card', { y: 30, opacity: 0 });
    ScrollTrigger.batch('.facility-card', {
      start: 'top 92%',
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity' });
      },
      onLeave: function (batch) {
        gsap.to(batch, { y: -24, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power2.in', overwrite: true });
      },
      onEnterBack: function (batch) {
        gsap.to(batch, { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity' });
      },
      onLeaveBack: function (batch) {
        gsap.to(batch, { y: 30, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power2.in', overwrite: true });
      }
    });

    // Results section
    gsap.from('.student-card', {
      scrollTrigger: { trigger: '.students-grid', start: 'top 85%' },
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    // Success stats section
    gsap.from('.success-copy', {
      scrollTrigger: { trigger: '.success-stats-section', start: 'top 80%' },
      x: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
    gsap.from('.stat-card', {
      scrollTrigger: { trigger: '.success-stats-grid', start: 'top 85%' },
      opacity: 0,
      stagger: 0.12,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Why choose us
    gsap.from('.why-top-copy > *', {
      scrollTrigger: { trigger: '.why-us-section', start: 'top 80%' },
      y: 26,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power2.out'
    });
    gsap.from('.why-item', {
      scrollTrigger: { trigger: '.why-bottom-grid', start: 'top 85%' },
      y: 34,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    // Testimonials
    gsap.from('.testimonial-card', {
      scrollTrigger: { trigger: '.testimonials-grid', start: 'top 85%' },
      y: 36,
      opacity: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    // Training process
    gsap.from('.process-step', {
      scrollTrigger: { trigger: '.process-steps', start: 'top 85%' },
      y: 36,
      opacity: 0,
      stagger: 0.14,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    // Blog cards
    gsap.from('.blog-card', {
      scrollTrigger: { trigger: '.blog-cards-scroll', start: 'top 85%' },
      y: 36,
      opacity: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'transform'
    });

    // Gallery Polaroids
    gsap.from('.stack-card', {
      scrollTrigger: { trigger: '.gallery-stack-col', start: 'top 85%' },
      scale: 0.85,
      opacity: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'transform'
    });
  }

  /* =========================================================================
     8b. COURSES CAROUSEL (arrow buttons + progress bar)
     ========================================================================= */
  const coursesTrack = document.querySelector('.courses-cards-scroll');
  const coursesPrev = document.getElementById('coursesPrev');
  const coursesNext = document.getElementById('coursesNext');
  const coursesBar = document.getElementById('coursesBar');
  if (coursesTrack) {
    function courseStep() {
      const card = coursesTrack.querySelector('.course-visual-card');
      return card ? card.getBoundingClientRect().width + 20 : 320;
    }
    function updateCoursesBar() {
      if (!coursesBar) return;
      const max = coursesTrack.scrollWidth - coursesTrack.clientWidth;
      coursesBar.style.width = (max > 0 ? (coursesTrack.scrollLeft / max) * 100 : 100) + '%';
    }
    if (coursesPrev) {
      coursesPrev.addEventListener('click', function () {
        coursesTrack.scrollBy({ left: -courseStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }
    if (coursesNext) {
      coursesNext.addEventListener('click', function () {
        coursesTrack.scrollBy({ left: courseStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }
    coursesTrack.addEventListener('scroll', updateCoursesBar, { passive: true });
    window.addEventListener('resize', updateCoursesBar);
    updateCoursesBar();
  }

  /* =========================================================================
     7c. INFRA 3D SHOWCASE TILT (desktop hover only)
     ========================================================================= */
  {
    const campusScene = document.querySelector('.campus-scene');
    const infraCards = document.querySelectorAll('.facility-cards .facility-card');
    const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (campusScene && fineHover) {
      campusScene.addEventListener('mousemove', function (event) {
        const rect = campusScene.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        campusScene.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 5) + 'deg)';
      });
      campusScene.addEventListener('mouseleave', function () {
        campusScene.style.transform = '';
      });
    }
    infraCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.filter = 'brightness(1.15)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.filter = '';
      });
    });
  }

    /* =========================================================================
       8c. BLOG CAROUSEL (arrows + progress bar)
       ========================================================================= */
    const blogTrack = document.querySelector('.blog-cards-scroll');
    const blogPrev = document.getElementById('blogPrev');
    const blogNext = document.getElementById('blogNext');
    const blogBar = document.getElementById('blogBar');
    if (blogTrack) {
      function blogStep() {
        const card = blogTrack.querySelector('.blog-card');
        return card ? card.getBoundingClientRect().width + 20 : 320;
      }
      function updateBlogBar() {
        if (!blogBar) return;
        const max = blogTrack.scrollWidth - blogTrack.clientWidth;
        blogBar.style.width = (max > 0 ? (blogTrack.scrollLeft / max) * 100 : 100) + '%';
      }
      if (blogPrev) {
        blogPrev.addEventListener('click', function () {
          blogTrack.scrollBy({ left: -blogStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
      }
      if (blogNext) {
        blogNext.addEventListener('click', function () {
          blogTrack.scrollBy({ left: blogStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
      }
      blogTrack.addEventListener('scroll', updateBlogBar, { passive: true });
      window.addEventListener('resize', updateBlogBar);
      updateBlogBar();
    }

    /* =========================================================================
      10. IN-PAGE SMOOTH SCROLLING
      ========================================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        const headerOffset = 90;
        const elPos = el.getBoundingClientRect().top;
        const offsetPos = elPos + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPos,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });

})();
