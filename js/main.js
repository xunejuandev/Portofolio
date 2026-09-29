/* ============================================================
   SHIBUYA EDITORIAL ENGINEER ZINE — Main JavaScript Logic (Fixed)
   Yakobus Dimas | Backend Systems Engineer
   ============================================================ */

document.addEventListener('alpine:init', () => {

  Alpine.data('portfolioApp', () => ({
    mobileMenuOpen: false,
    activeSection: 'start',
    stamps: 0,
    stampsCollected: [false, false, false],

    init() {
      // 1. Initialize Scroll Reveal Animations
      this.setupReveal();

      // 2. Initialize Precision ScrollSpy Navigation
      this.setupScrollSpy();

      // 3. Initialize Hanko Stamp Collection Observers
      this.setupStampObserver();

      // 4. Handle initial location hash if present
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (['start', 'projects', 'log', 'status', 'mail'].includes(hash)) {
          this.activeSection = hash;
        }
      }
    },

    /**
     * Manually Collect a Specific Stamp (0: Hero, 1: Projects, 2: Arsenal)
     */
    collectStamp(idx) {
      if (idx >= 0 && idx < 3 && !this.stampsCollected[idx]) {
        this.stampsCollected[idx] = true;
        this.stamps = this.stampsCollected.filter(Boolean).length;
      }
    },

    /**
     * Smooth Scroll to Target Section
     */
    smoothScroll(e, targetId) {
      if (e) e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        this.activeSection = targetId;
        window.history.pushState(null, null, `#${targetId}`);
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },

    /**
     * Intersection Observer for Scroll Reveal Elements
     */
    setupReveal() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
        observer.observe(el);
      });
    },

    /**
     * Precision ScrollSpy — Scroll Listener with requestAnimationFrame Throttling
     */
    setupScrollSpy() {
      const sections = ['start', 'projects', 'log', 'status', 'mail'];
      let ticking = false;

      const updateActiveSection = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const viewportCheckPoint = window.scrollY + (window.innerHeight * 0.35);

            for (let i = sections.length - 1; i >= 0; i--) {
              const sectionEl = document.getElementById(sections[i]);
              if (sectionEl) {
                const top = sectionEl.offsetTop;
                if (viewportCheckPoint >= top) {
                  if (this.activeSection !== sections[i]) {
                    this.activeSection = sections[i];
                  }
                  break;
                }
              }
            }
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', updateActiveSection, { passive: true });
      updateActiveSection();
    },

    /**
     * Stamp Collection Tracker Observer (Zine Progression)
     */
    setupStampObserver() {
      const stampSections = [
        { id: 'start', index: 0 },
        { id: 'projects', index: 1 },
        { id: 'status', index: 2 }
      ];

      stampSections.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
          const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              this.collectStamp(item.index);
            }
          }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

          observer.observe(el);
        }
      });
    }

  }));

});
