/* Adaptaciones de interacción limitadas a celulares, incluida la orientación horizontal. */
(() => {
  const mobileMedia = window.matchMedia(
    '(max-width: 840px), (max-width: 960px) and (orientation: landscape) and (max-height: 500px)'
  );

  window.isMobileLayout = () => mobileMedia.matches;

  window.syncMobileLayout = () => {
    const logged = getLoggedUser();
    const home = mobileMedia.matches && logged ? '#aula-virtual-section' : '#inicio';
    document.querySelector('[data-mobile-home]')?.setAttribute('href', home);
    document.querySelector('.logo-area')?.setAttribute('href', home);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const helpModal = document.getElementById('help-modal');
    document.getElementById('btn-mobile-help')?.addEventListener('click', () => openModal(helpModal));

    document.querySelectorAll('[data-mobile-control]').forEach(button => {
      button.addEventListener('click', () => {
        closeModal(helpModal);
        document.getElementById(button.dataset.mobileControl)?.click();
      });
    });

    document.querySelectorAll('[data-mobile-action]').forEach(button => {
      button.addEventListener('click', () => {
        closeModal(helpModal);
        if (button.dataset.mobileAction === 'letters') {
          document.querySelector('.top-accessibility-bar')?.scrollIntoView({ block: 'start' });
          document.getElementById('btn-font-normal')?.focus({ preventScroll: true });
        } else if (button.dataset.mobileAction === 'family') {
          openModal(document.getElementById('guia-familiares-modal'));
          window.switchGuiaTab('decalogo');
        } else if (button.dataset.mobileAction === 'security') {
          document.getElementById('seguridad-section')?.scrollIntoView({ block: 'start' });
        }
      });
    });

    // El enlace de inicio acompaña la sesión al girar el celular o volver al escritorio.
    mobileMedia.addEventListener('change', window.syncMobileLayout);
    window.syncMobileLayout();
  });
})();
