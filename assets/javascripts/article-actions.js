(() => {
  const initialize = () => {
    document.querySelectorAll('[data-copy-page-link]').forEach((button) => {
      if (button.dataset.ready === 'true') return;
      button.dataset.ready = 'true';
      button.addEventListener('click', async () => {
        const original = button.textContent;
        try {
          await navigator.clipboard.writeText(window.location.href);
          button.textContent = document.documentElement.lang?.startsWith('zh') ? '已复制' : 'Copied';
        } catch {
          window.prompt(document.documentElement.lang?.startsWith('zh') ? '复制页面链接' : 'Copy page link', window.location.href);
        }
        window.setTimeout(() => { button.textContent = original; }, 1400);
      });
    });

    document.querySelectorAll('[data-print-page]').forEach((button) => {
      if (button.dataset.ready === 'true') return;
      button.dataset.ready = 'true';
      button.addEventListener('click', () => window.print());
    });
  };

  if (typeof document$ !== 'undefined') document$.subscribe(initialize);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
