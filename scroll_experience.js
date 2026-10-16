/**
 * scroll_experience.js - GSAP & ScrollTrigger 3D Rotating Windows & Section Transitions
 * Professor Jyotiprakash Mishra — Immersive Research Portfolio
 *
 * Implements:
 * - Multi-section 3D scroll transitions
 * - Subtle 3D window rotation and depth shifts on scroll
 * - Staggered entrance reveals for academic cards
 * - Integration with the 22-Card Rolodex Ring
 * - Non-blocking, reduced-motion aware, and cleanly disposable
 */

(function () {
  'use strict';

  function initScrollExperience() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded, skipping scroll transitions.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    // Staggered reveals for all section cards and headers
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((sec) => {
      const header = sec.querySelector('.section-header');
      const cards = sec.querySelectorAll('.scroll-card');

      if (header) {
        gsap.from(header, {
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 35,
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      if (cards && cards.length > 0) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: sec,
            start: 'top 78%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 45,
          rotationX: 8,
          stagger: 0.08,
          duration: 0.85,
          ease: 'power3.out'
        });
      }
    });

    // 3D Parallax effect on the Hero Rolodex Ring as user scrolls down
    const ringStage = document.getElementById('rolodexStage');
    if (ringStage) {
      gsap.to(ringStage, {
        scrollTrigger: {
          trigger: '#heroSection',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        },
        scale: 0.92,
        opacity: 0.25,
        y: 80,
        ease: 'none'
      });
    }

    // Floating micro-animations for badges
    gsap.to('.cyber-badge', {
      y: -3,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.15
    });
  }

  window.initScrollExperience = initScrollExperience;
})();
