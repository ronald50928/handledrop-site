/**
 * HandleDrop - Shipping Calculator & Interactive Elements
 */

(function() {
  'use strict';

  // Shipping Calculator
  function initShippingCalculator() {
    const packageSize = document.getElementById('package-size');
    const tradesPerMonth = document.getElementById('trades-per-month');
    const tierSelect = document.getElementById('tier-select');
    const calcCost = document.getElementById('calc-cost');
    const calcRetail = document.getElementById('calc-retail');
    const calcSavings = document.getElementById('calc-savings');

    if (!packageSize || !tradesPerMonth || !tierSelect) return;

    const prices = {
      small: { free: 7, premium: 5, retail: 10 },
      medium: { free: 12, premium: 9, retail: 16 },
      large: { free: 19, premium: 14, retail: 26 }
    };

    function calculate() {
      const size = packageSize.value;
      const trades = parseInt(tradesPerMonth.value) || 1;
      const tier = tierSelect.value;

      let cost, retail;

      if (tier === 'premium') {
        // Premium: $5.99/mo + (trades-1) * discounted rate
        const additionalTrades = Math.max(0, trades - 1);
        cost = 5.99 + (additionalTrades * prices[size].premium);
      } else {
        // Free: trades * discounted rate
        cost = trades * prices[size].free;
      }

      retail = trades * prices[size].retail;
      const savings = retail - cost;

      calcCost.textContent = '$' + cost.toFixed(2);
      calcRetail.textContent = '$' + retail.toFixed(2);
      calcSavings.textContent = '$' + savings.toFixed(2) + '/month';
    }

    packageSize.addEventListener('change', calculate);
    tradesPerMonth.addEventListener('input', calculate);
    tierSelect.addEventListener('change', calculate);

    // Initial calculation
    calculate();
  }

  // Live Trades Feed Animator
  function initLiveTradesFeed() {
    const feedElement = document.getElementById('trades-feed');
    if (!feedElement) return;

    const trades = [
      { emoji: '👟', name: 'Jordan', location: 'NYC', from: 'Air Jordans', to: 'Nintendo Switch', time: '2 min' },
      { emoji: '🎸', name: 'Maria', location: 'LA', from: 'guitar', to: 'photography equipment', time: '15 min' },
      { emoji: '🧸', name: 'The Chen family', location: 'Chicago', from: 'kids\' toys', to: 'camping gear', time: '1 hour' },
      { emoji: '💻', name: 'David', location: 'Austin', from: 'MacBook', to: 'gaming PC', time: '2 hours' },
      { emoji: '📚', name: 'Emily', location: 'Boston', from: 'textbooks', to: 'furniture', time: '3 hours' },
      { emoji: '🎮', name: 'Mike', location: 'Seattle', from: 'PS5', to: 'vintage records', time: '4 hours' },
      { emoji: '👗', name: 'Lisa', location: 'Miami', from: 'designer clothes', to: 'kitchen appliances', time: '5 hours' },
      { emoji: '🎨', name: 'Carlos', location: 'Denver', from: 'art supplies', to: 'bicycle', time: '6 hours' }
    ];

    let currentIndex = 0;

    function addTrade() {
      const trade = trades[currentIndex];
      const tradeItem = document.createElement('div');
      tradeItem.className = 'trade-item';
      tradeItem.innerHTML = `
        <span class="trade-emoji">${trade.emoji}</span>
        <span class="trade-text"><strong>${trade.name} in ${trade.location}</strong> just traded ${trade.from} for ${trade.to}</span>
        <span class="trade-time">${trade.time} ago</span>
      `;

      feedElement.insertBefore(tradeItem, feedElement.firstChild);

      // Remove oldest if more than 5
      const items = feedElement.querySelectorAll('.trade-item');
      if (items.length > 5) {
        feedElement.removeChild(items[items.length - 1]);
      }

      currentIndex = (currentIndex + 1) % trades.length;
    }

    // Add new trade every 8 seconds
    setInterval(addTrade, 8000);
  }

  // Counter Animation
  function animateCounter(element, target, duration = 2000) {
    if (!element) return;

    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);

      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  // Initialize counters when they come into view
  function initCounters() {
    const counter = document.getElementById('trade-counter');
    if (!counter) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(counter, 4287);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(counter.parentElement);
  }

  // City Auto-Detection (simplified version)
  function initCityDetection() {
    const cityElement = document.getElementById('user-city');
    if (!cityElement) return;

    // In a real implementation, this would use geolocation API
    // For now, just show a placeholder
    const cities = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Austin', 'Seattle'];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    cityElement.textContent = randomCity;
  }

  // Testimonial Carousel (simplified auto-rotate)
  function initTestimonialCarousel() {
    const carousel = document.querySelector('.testimonial-carousel');
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.testimonial-card');
    if (cards.length <= 1) return;

    let currentSlide = 0;

    function rotateTestimonials() {
      cards.forEach((card, index) => {
        if (index === currentSlide) {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        } else {
          card.style.opacity = '0.6';
          card.style.transform = 'scale(0.95)';
        }
      });

      currentSlide = (currentSlide + 1) % cards.length;
    }

    // Rotate every 5 seconds
    setInterval(rotateTestimonials, 5000);
  }

  // Smooth Scroll for Anchor Links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Year in Footer
  function setCurrentYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // FAQ Accordion Enhancement
  function initFAQAccordion() {
    const details = document.querySelectorAll('.faq-details');
    details.forEach(detail => {
      detail.addEventListener('toggle', function() {
        if (this.open) {
          // Close other open details in the same section
          const parent = this.closest('.faq-list, .faq-grid');
          if (parent) {
            parent.querySelectorAll('.faq-details').forEach(other => {
              if (other !== this && other.open) {
                other.open = false;
              }
            });
          }
        }
      });
    });
  }

  // Initialize all components when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initShippingCalculator();
    initLiveTradesFeed();
    initCounters();
    initCityDetection();
    initTestimonialCarousel();
    initSmoothScroll();
    setCurrentYear();
    initFAQAccordion();

    console.log('HandleDrop interactive elements initialized');
  });

})();

