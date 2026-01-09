document.addEventListener('DOMContentLoaded', function() {
  // Fix for Material's instant navigation mode
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-md-page') {
        // Ensure sidebar is visible
        const sidebar = document.querySelector('.md-sidebar--primary');
        if (sidebar) {
          sidebar.style.display = '';
        }
      }
    });
  });

  // Start observing
  const target = document.querySelector('[data-md-component="container"]');
  if (target) {
    observer.observe(target, {
      attributes: true,
      attributeFilter: ['data-md-page']
    });
  }

  // Navigation accordion behavior
  document.querySelectorAll('.md-nav__link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const parent = this.parentElement;
      if (parent.classList.contains('md-nav__item--nested')) {
        const siblings = Array.from(parent.parentElement.children);
        siblings.forEach(function(sibling) {
          if (sibling !== parent && sibling.classList.contains('md-nav__item--active')) {
            sibling.classList.remove('md-nav__item--active');
          }
        });
      }
    });
  });
});
