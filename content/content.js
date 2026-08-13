// content/content.js
(function () {
  let tooltipEl = null;

  function removeTooltip() {
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  }

  function buildFlagEl(code) {
    const country = flagCountryFor(code);
    if (country) {
      const img = document.createElement('img');
      img.className = 'wc-tooltip-flag-img';
      img.src = `https://flagcdn.com/${country.toLowerCase()}.svg`;
      img.alt = code.toUpperCase();
      img.onerror = () => {
        img.replaceWith(document.createTextNode(''));
      };
      return img;
    }

    if (CRYPTO_CODES.has(String(code || '').toLowerCase())) {
      const badge = document.createElement('span');
      badge.className = 'wc-tooltip-coin-badge';
      badge.textContent = '$';
      return badge;
    }

    return document.createElement('span');
  }

  function showTooltip(rect, sourceCode, amount, ratesUSD, selectedCurrencies) {
    removeTooltip();

    const source = String(sourceCode).toLowerCase();
    const targets = selectedCurrencies
      .map((c) => String(c).toLowerCase())
      .filter((c) => c !== source);
    if (targets.length === 0) return;

    const el = document.createElement('div');
    el.className = 'wc-tooltip';

    for (const code of targets) {
      const converted = convertAmount(amount, source, code, ratesUSD);
      if (converted == null) continue;
      const row = document.createElement('div');
      row.className = 'wc-tooltip-row';

      const codeSpan = document.createElement('span');
      codeSpan.className = 'wc-tooltip-code';
      codeSpan.textContent = code.toUpperCase();

      const amountSpan = document.createElement('span');
      amountSpan.className = 'wc-tooltip-amount';
      amountSpan.textContent = formatAmount(converted);

      row.appendChild(buildFlagEl(code));
      row.appendChild(codeSpan);
      row.appendChild(amountSpan);
      el.appendChild(row);
    }

    if (!el.childElementCount) return;

    document.body.appendChild(el);
    const top = window.scrollY + rect.bottom + 6;
    const left = window.scrollX + rect.left;
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;

    tooltipEl = el;
  }

  async function handleSelectionChange() {
    const selection = window.getSelection();
    const text = selection ? selection.toString() : '';

    if (!text.trim()) {
      removeTooltip();
      return;
    }

    const parsed = parsePrice(text);
    if (!parsed) {
      removeTooltip();
      return;
    }

    const { ratesUSD, selectedCurrencies } = await chrome.storage.local.get([
      'ratesUSD',
      'selectedCurrencies',
    ]);
    if (!ratesUSD) {
      removeTooltip();
      return;
    }

    const currentSelection = window.getSelection();
    if (!currentSelection || !currentSelection.rangeCount) return;

    const range = currentSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showTooltip(rect, parsed.code, parsed.amount, ratesUSD, selectedCurrencies || DEFAULT_SELECTED);
  }

  document.addEventListener('selectionchange', () => {
    handleSelectionChange();
  });

  document.addEventListener('mousedown', (e) => {
    if (tooltipEl && !tooltipEl.contains(e.target)) removeTooltip();
  });
})();
