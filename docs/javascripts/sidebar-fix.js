// Fix for sidebar rendering issues with Material for MkDocs
(function() {
  'use strict';

  // Ensure sidebar navigation is properly initialized
  document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.md-sidebar--primary');
    if (sidebar) {
      // Trigger any pending rendering
      sidebar.offsetHeight;
    }
  });
})();
