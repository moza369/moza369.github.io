document.addEventListener('DOMContentLoaded', () => {
  // a) THEME TOGGLE
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeBtn.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    const sun = document.querySelector('.icon-sun');
    const moon = document.querySelector('.icon-moon');
    if (sun && moon) {
      sun.style.display = theme === 'dark' ? 'block' : 'none';
      moon.style.display = theme === 'dark' ? 'none' : 'block';
    }
  }

  // b) MOBILE MENU
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // c) CODE COPY
  document.querySelectorAll('.highlight').forEach(highlight => {
    const pre = highlight.querySelector('pre');
    if (!pre) return;
    const btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      const text = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }).catch(() => {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
    });
    highlight.style.position = 'relative';
    highlight.appendChild(btn);
  });

  // d) SEARCH
  const searchBtn = document.getElementById('search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchClose = document.getElementById('search-close');
  let fuse = null;

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('active');
    searchInput.value = '';
    searchResults.innerHTML = '<p class="search-placeholder">Type to search...</p>';
    searchInput.focus();

    if (!fuse) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
      script.onload = () => {
        fetch('/index.json')
          .then(res => res.json())
          .then(data => {
            fuse = new Fuse(data, {
              keys: [
                { name: 'title', weight: 0.4 },
                { name: 'description', weight: 0.3 },
                { name: 'content', weight: 0.2 },
                { name: 'tags', weight: 0.05 },
                { name: 'categories', weight: 0.05 }
              ],
              includeMatches: true,
              threshold: 0.3,
              minMatchCharLength: 2
            });
          });
      };
      document.head.appendChild(script);
    }
  }

  function closeSearch() {
    if (searchOverlay) searchOverlay.classList.remove('active');
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);

  // Close search on overlay backdrop click
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
      closeSearch();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (!fuse) return;
      const query = e.target.value.trim();
      if (!query) {
        searchResults.innerHTML = '<p class="search-placeholder">Type to search...</p>';
        return;
      }
      const results = fuse.search(query).slice(0, 10);
      if (results.length === 0) {
        searchResults.innerHTML = '<p class="search-placeholder">No results found.</p>';
        return;
      }
      searchResults.innerHTML = results.map(result => {
        const item = result.item;
        const cats = item.categories ? item.categories.join(', ') : '';
        return `<div class="search-result-item">
          <a href="${item.url}">
            <div class="search-result-title">${item.title}</div>
            <div class="search-result-desc">${item.description || ''}</div>
            <div class="search-result-meta">
              <span>${item.date || ''}</span>
              ${cats ? `<span>${cats}</span>` : ''}
            </div>
          </a>
        </div>`;
      }).join('');
    });
  }

  // e) TOC SCROLLSPY — only observe headings inside .article-content
  const tocLinks = document.querySelectorAll('#TableOfContents a');
  const articleContent = document.querySelector('.article-content');
  if (tocLinks.length > 0 && articleContent) {
    const headings = articleContent.querySelectorAll('h2[id], h3[id], h4[id]');
    if (headings.length > 0) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            tocLinks.forEach(link => link.classList.remove('toc-active'));
            const tocLink = document.querySelector(`#TableOfContents a[href="#${CSS.escape(id)}"]`);
            if (tocLink) tocLink.classList.add('toc-active');
          }
        });
      }, { rootMargin: '-80px 0px -80% 0px' });

      headings.forEach(h => observer.observe(h));
    }
  }

  // f) SMOOTH SCROLL — with header offset and edge case protection
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const header = document.querySelector('.site-header');
          const headerOffset = header ? header.offsetHeight : 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 16;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } catch (err) {
        // Invalid selector, ignore
      }
    });
  });

  // g) READING PROGRESS BAR
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const article = document.querySelector('.article-content');
      if (!article) return;
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrolled = window.scrollY - articleTop + windowHeight * 0.3;
      const progress = Math.min(Math.max(scrolled / articleHeight, 0), 1);
      progressBar.style.transform = `scaleX(${progress})`;
    }, { passive: true });
  }

  // h) CODE BLOCK LANGUAGE LABELS
  document.querySelectorAll('.highlight').forEach(block => {
    const codeEl = block.querySelector('code');
    if (!codeEl) return;
    // Hugo adds class like "language-python" or Chroma adds data-lang
    let lang = '';
    const classes = codeEl.className.split(' ');
    for (const cls of classes) {
      if (cls.startsWith('language-')) {
        lang = cls.replace('language-', '');
        break;
      }
    }
    // Fallback: check parent pre or the highlight div itself
    if (!lang) {
      const preEl = block.querySelector('pre');
      if (preEl) {
        const preClasses = preEl.className.split(' ');
        for (const cls of preClasses) {
          if (cls.startsWith('language-')) {
            lang = cls.replace('language-', '');
            break;
          }
        }
      }
    }
    // Fallback: parse from highlight shortcode class
    if (!lang) {
      const highlightClasses = block.className.split(' ');
      for (const cls of highlightClasses) {
        if (cls !== 'highlight' && cls.length > 0) {
          lang = cls;
          break;
        }
      }
    }
    if (lang) {
      const label = document.createElement('span');
      label.className = 'code-lang-label';
      label.textContent = lang;
      block.style.position = 'relative';
      block.appendChild(label);
    }
  });

  // i) SHARE COPY BUTTON
  const shareCopyBtn = document.getElementById('share-copy-btn');
  if (shareCopyBtn) {
    shareCopyBtn.addEventListener('click', () => {
      const url = shareCopyBtn.dataset.url || window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        shareCopyBtn.classList.add('copied');
        setTimeout(() => shareCopyBtn.classList.remove('copied'), 2000);
      });
    });
  }

  // j) SCROLL REVEAL ANIMATIONS
  const revealSelectors = [
    '.stats-section',
    '.featured-section',
    '.latest-section',
    '.explore-section',
    '.about-preview',
    '.section-heading',
    '.article-card',
    '.explore-card',
    '.about-section',
    '.about-card',
    '.achievement-section',
    '.cert-item',
    '.project-page .project-header',
    '.project-page .project-cover',
    '.project-page .project-content',
    '.list-header',
    '.article-header',
    '.article-cover',
    '.article-footer',
    '.related-posts',
    '.connect-card',
    '.timeline-item',
    '.skill-category',
  ];

  // Add reveal class to elements
  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
        el.classList.add('reveal');
        el.style.setProperty('--i', i);
      }
    });
  });

  // Add stagger class to grids
  document.querySelectorAll('.article-grid, .explore-grid, .cert-grid, .connect-grid, .skills-group, .about-cards, .about-timeline').forEach(grid => {
    grid.classList.add('stagger-children');
  });

  // Intersection Observer for reveals
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  // k) STATS COUNTER ANIMATION
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const num = parseInt(text, 10);
          if (!isNaN(num) && num > 0) {
            animateCount(el, num, text.replace(String(num), ''));
          }
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => countObserver.observe(el));
  }

  function animateCount(el, target, suffix) {
    const duration = 1200;
    const start = performance.now();
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(easeOutQuart(progress) * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  // l) SCROLL TO TOP BUTTON
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-top';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  scrollTopBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(scrollTopBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
