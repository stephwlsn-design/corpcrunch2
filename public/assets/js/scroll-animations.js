// Scroll Animation Observer
if (typeof window !== 'undefined') {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with animate-on-view class
  document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-view');
    animatedElements.forEach(el => observer.observe(el));
  });

  // Also observe elements added dynamically
  const observeNewElements = () => {
    const newElements = document.querySelectorAll('.animate-on-view:not(.observed)');
    newElements.forEach(el => {
      el.classList.add('observed');
      observer.observe(el);
    });
  };

  // Check for new elements periodically
  setInterval(observeNewElements, 500);
}

