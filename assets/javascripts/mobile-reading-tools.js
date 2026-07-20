(() => {
  let observer;
  let listeners;

  const bind = (tools) => {
    if (tools.dataset.readingIntentReady === 'true') return true;
    tools.dataset.readingIntentReady = 'true';

    listeners?.abort();
    listeners = new AbortController();
    const { signal } = listeners;

    let previousY = window.scrollY;
    let frame = 0;

    const setVisible = (visible) => {
      tools.classList.toggle('is-visible', visible);
      tools.setAttribute('aria-hidden', String(!visible));
    };

    const update = () => {
      frame = 0;
      const currentY = window.scrollY;
      const delta = currentY - previousY;
      const pageHeight = document.documentElement.scrollHeight;
      const nearTop = currentY < 140;
      const nearBottom = currentY + window.innerHeight >= pageHeight - 180;
      const scrollingUp = delta < -8;
      const visible = !nearTop && (scrollingUp || nearBottom || tools.matches(':focus-within'));

      setVisible(visible);
      previousY = currentY;
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    tools.addEventListener('focusin', () => setVisible(true), { signal });
    tools.addEventListener('focusout', schedule, { signal });
    window.addEventListener('scroll', schedule, { passive: true, signal });
    window.addEventListener('resize', schedule, { signal });
    update();
    return true;
  };

  const initialize = () => {
    const tools = document.querySelector('.l2do-mobile-tools');
    if (!tools) return false;
    return bind(tools);
  };

  const watch = () => {
    observer?.disconnect();
    if (initialize()) return;

    observer = new MutationObserver(() => {
      if (!initialize()) return;
      observer.disconnect();
      observer = undefined;
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  if (typeof document$ !== 'undefined') document$.subscribe(watch);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
})();
