// Standalone progressive enhancement: navigation does not depend on 3D or
// testimonial scripts succeeding. Without JS, mobile links stay accessible.
(() => {
  const toggle = document.getElementById('navToggle');
  const navigation = document.getElementById('mobileNavigation');
  const mobile = matchMedia('(max-width: 1100px)');
  if (!toggle || !navigation) return;
  navigation.hidden = true;
  toggle.hidden = false;

  function closeMenu(returnFocus = false) {
    toggle.setAttribute('aria-expanded', 'false');
    navigation.hidden = true;
    if (returnFocus) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    navigation.hidden = !open;
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu(true);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !navigation.hidden) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  document.addEventListener('click', event => {
    if (!toggle.contains(event.target) && !navigation.contains(event.target)) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!toggle.contains(event.target) && !navigation.contains(event.target)) closeMenu();
  });
  mobile.addEventListener('change', () => {
    const focusedLink = navigation.contains(document.activeElement);
    closeMenu(mobile.matches && focusedLink);
    if (!mobile.matches && focusedLink) document.querySelector('.nav-links a')?.focus({ preventScroll: true });
  });
  toggle.closest('.nav')?.classList.add('nav-enhanced');
})();
