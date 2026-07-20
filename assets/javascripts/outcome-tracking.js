(() => {
  const SITE_ORIGIN = 'https://blog.l2do.com';
  const EVENT_ATTRIBUTE = 'data-umami-event';

  const locale = () => ((document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'zh');
  const normalizePath = (value) => {
    try {
      const url = new URL(value, window.location.href);
      if (url.origin !== window.location.origin && url.origin !== SITE_ORIGIN) return null;
      return url.pathname.replace(/\/+/g, '/');
    } catch {
      return null;
    }
  };
  const slug = (pathname) => pathname.split('/').filter(Boolean).pop() || 'home';

  const setEvent = (element, name, data = {}) => {
    if (!(element instanceof Element)) return;
    if (!element.hasAttribute(EVENT_ATTRIBUTE)) element.setAttribute(EVENT_ATTRIBUTE, name);
    const payload = { locale: locale(), ...data };
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      element.setAttribute(`data-umami-event-${key.replace(/[^\w-]/g, '-')}`, String(value));
    });
  };

  const track = (name, data = {}) => {
    if (typeof window.umami?.track !== 'function') return;
    window.umami.track(name, { locale: locale(), ...data });
  };

  const instrumentLinks = () => {
    const currentPath = window.location.pathname;
    const isHome = currentPath === '/' || currentPath === '/en/';

    document.querySelectorAll('a[href]').forEach((link) => {
      // Language controls are classified by instrumentControls. Their target can
      // also match a content rule, so exclude them before generic link matching.
      if (link.matches('.md-select__link[hreflang]')) return;

      const rawHref = link.getAttribute('href') || '';
      let url;
      try { url = new URL(rawHref, window.location.href); } catch { return; }
      const path = normalizePath(url.href);

      if (link.matches('[data-evidence-link]') || link.closest('[data-evidence-link]')) {
        setEvent(link, 'evidence_clicked', { evidence: link.getAttribute('data-evidence-link') || slug(url.pathname) });
        return;
      }

      if (link.matches('[data-collaboration-intent]') || link.closest('[data-collaboration-intent]')) {
        setEvent(link, 'collaboration_intent_clicked', { intent: link.getAttribute('data-collaboration-intent') || 'contact' });
        return;
      }

      if (/github\.com\/lzyred\/lzyred\.github\.io\/issues\/new/.test(url.href)) {
        setEvent(link, 'feedback_clicked', { location: link.closest('.l2do-article-header') ? 'article_header' : 'site' });
        return;
      }
      if (url.hostname === 'github.com') {
        setEvent(link, 'github_clicked', { destination: url.pathname.replace(/^\//, '') || 'github' });
        return;
      }
      if (!path) return;

      if (isHome) {
        const entry = path.match(/^\/(?:en\/)?(tasks|runbooks|ai)\/?$/)?.[1];
        if (entry) {
          setEvent(link, 'home_entry_clicked', { entry });
          return;
        }
      }

      if (/\/topics\/ai-full-stack\/codex-engineering-best-practices\/?$/.test(path)) {
        setEvent(link, 'ai_standard_opened', { content: 'codex-engineering-best-practices' });
        return;
      }

      if (link.closest('[data-runbook-item]') || /runbook\/?$/.test(path)) {
        setEvent(link, 'runbook_opened', { content: slug(path) });
        return;
      }

      const article = link.closest('.md-content');
      const isInternalTopic = /^\/(?:en\/)?topics\//.test(path);
      const isSamePage = path.replace(/\/$/, '') === currentPath.replace(/\/$/, '');
      const excluded = link.classList.contains('headerlink') || link.closest('.l2do-article-header');
      if (article && isInternalTopic && !isSamePage && !excluded) {
        setEvent(link, 'related_content_clicked', { content: slug(path) });
      }
    });
  };

  const instrumentControls = () => {
    document.querySelectorAll('[data-task-select]').forEach((button) => {
      setEvent(button, 'task_selected', { task: button.getAttribute('data-task-select') || 'unknown' });
    });

    document.querySelectorAll('[data-runbook-filter]').forEach((button) => {
      setEvent(button, 'runbook_search_used', {
        interaction: 'filter',
        domain: button.getAttribute('data-runbook-filter') || 'all',
      });
    });

    document.querySelectorAll('.md-select__link[hreflang]').forEach((link) => {
      const targetLocale = link.getAttribute('hreflang');
      if (targetLocale && targetLocale !== locale()) {
        setEvent(link, 'language_switched', { target_locale: targetLocale });
      }
    });
  };

  const initializeRunbookSearch = () => {
    document.querySelectorAll('[data-runbook-search]').forEach((input) => {
      if (!(input instanceof HTMLInputElement) || input.dataset.outcomeTrackingReady === 'true') return;
      input.dataset.outcomeTrackingReady = 'true';
      let timer;
      let recorded = false;
      input.addEventListener('input', () => {
        window.clearTimeout(timer);
        if (recorded || input.value.trim().length < 2) return;
        timer = window.setTimeout(() => {
          recorded = true;
          track('runbook_search_used', { interaction: 'text_search' });
        }, 600);
      });
    });
  };

  const initialize = () => {
    instrumentLinks();
    instrumentControls();
    initializeRunbookSearch();
  };

  if (typeof document$ !== 'undefined') document$.subscribe(initialize);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
