const updateTheme = () => {
  const colorScheme = document.querySelector('meta[name="color-scheme"]')?.getAttribute('content') || 'light';
  const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
  const hasDark = colorScheme?.includes('dark');
  const hasLight = colorScheme?.includes('light');
  const isDark = (hasDark && hasLight) ? prefersDark : hasDark;

  document.documentElement.classList.remove('theme-light', 'theme-dark');
  document.documentElement.classList.add(`theme-${isDark ? 'dark' : 'light'}`);
};

updateTheme();

globalThis.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

new MutationObserver(updateTheme).observe(
  document.querySelector('meta[name="color-scheme"]'),
  { attributes: true, attributeFilter: ['content'] },
);

// iOS active state
document.addEventListener('touchstart', () => {}, { passive: true });

// Field sizing polyfill

(() => {
  if (CSS.supports('field-sizing', 'content')) return;

  const adjustSize = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const polyfillFieldSizing = () => {
    document.querySelectorAll('textarea').forEach(adjustSize);

    document.querySelectorAll('textarea').forEach((textarea) => {
      textarea.addEventListener('input', () => adjustSize(textarea));
    });
  };

  const observer = new MutationObserver(() => polyfillFieldSizing());

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  document.addEventListener('DOMContentLoaded', polyfillFieldSizing);
})();
