(function(){
  "use strict";

  function ensureFab(){
    var fab = document.getElementById('goTopFab');
    if (!fab) return null;

    // Visibility based on scroll
    var toggle = function(){
      if (window.scrollY > 300) fab.classList.add('is-visible');
      else fab.classList.remove('is-visible');
    };

    window.addEventListener('scroll', toggle, {passive:true});
    toggle();

    fab.addEventListener('click', function(){
      window.scrollTo({top:0, behavior:'smooth'});
    });

    return fab;
  }

  function initMaterialFields(){
    // Support floating labels for <select> elements inside .md-field
    var selects = document.querySelectorAll('.md-field select');
    selects.forEach(function(sel){
      var sync = function(){
        // Add a class to help CSS float label when select has a value
        if (sel.value && sel.value !== '') sel.classList.add('md-has-value');
        else sel.classList.remove('md-has-value');
      };
      sel.addEventListener('change', sync);
      sync();
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    ensureFab();
    initMaterialFields();
  });
})();
