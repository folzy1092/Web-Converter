// popup/popup.js
const pentagonEl = document.getElementById('pentagon');
const bannerEl = document.getElementById('banner');
const settingsBtn = document.getElementById('settings-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const openWindowBtn = document.getElementById('open-window-btn');
const updateNowBtn = document.getElementById('update-now-btn');

let state = {
  selectedCurrencies: DEFAULT_SELECTED,
  baseCurrency: DEFAULT_BASE,
  ratesUSD: {},
  currencyNames: {},
  amount: 1000,
  popupTheme: DEFAULT_POPUP_THEME,
  tooltipTheme: DEFAULT_TOOLTIP_THEME,
};

const ICON_SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const ICON_MOON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function applyPopupTheme() {
  document.documentElement.dataset.theme = state.popupTheme;
  themeToggleBtn.innerHTML = state.popupTheme === 'dark' ? ICON_SUN : ICON_MOON;
  themeToggleBtn.title =
    state.popupTheme === 'dark' ? 'Светлая тема попапа' : 'Тёмная тема попапа';
}

themeToggleBtn.addEventListener('click', () => {
  state.popupTheme = state.popupTheme === 'dark' ? 'light' : 'dark';
  chrome.storage.local.set({ popupTheme: state.popupTheme });
  applyPopupTheme();
});

openWindowBtn.addEventListener('click', () => {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup/popup.html'),
    type: 'popup',
    width: 420,
    height: 480,
  });
});

updateNowBtn.addEventListener('click', async () => {
  updateNowBtn.disabled = true;
  updateNowBtn.classList.add('wc-spinning');
  try {
    const fresh = await fetchAndCacheRates(chrome.storage.local, fetch);
    state.ratesUSD = fresh.ratesUSD;
    state.currencyNames = fresh.currencyNames || {};
    hideBanner();
    renderPentagon();
  } catch (err) {
    showBanner('Не удалось обновить курс.');
  } finally {
    updateNowBtn.disabled = false;
    updateNowBtn.classList.remove('wc-spinning');
  }
});

function buildFlagEl(code) {
  const country = flagCountryFor(code);
  if (country) {
    const img = document.createElement('img');
    img.className = 'wc-flag-img';
    img.src = `https://flagcdn.com/${country.toLowerCase()}.svg`;
    img.alt = code.toUpperCase();
    img.onerror = () => {
      img.replaceWith(document.createTextNode(''));
    };
    return img;
  }

  if (CRYPTO_CODES.has(String(code || '').toLowerCase())) {
    const badge = document.createElement('span');
    badge.className = 'wc-coin-badge';
    badge.textContent = '$';
    return badge;
  }

  return document.createElement('span');
}

const MAX_AMOUNT = 1e15;

function parseAmountExpression(raw) {
  const terms = String(raw || '').split('+');
  let sum = 0;
  let any = false;
  for (const term of terms) {
    const cleaned = term.trim().replace(',', '.').replace(/[^0-9.]/g, '');
    if (!cleaned) continue;
    const n = parseFloat(cleaned);
    if (Number.isFinite(n)) {
      sum += n;
      any = true;
    }
  }
  if (!any) return 0;
  return Math.min(sum, MAX_AMOUNT);
}

function showBanner(text) {
  bannerEl.textContent = text;
  bannerEl.hidden = false;
}

function showRetryBanner(text) {
  bannerEl.textContent = '';

  const messageSpan = document.createElement('span');
  messageSpan.className = 'wc-banner-message';
  messageSpan.textContent = text;

  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'wc-retry-btn';
  retryBtn.textContent = 'Обновить';
  retryBtn.addEventListener('click', () => {
    init();
  });

  bannerEl.appendChild(messageSpan);
  bannerEl.appendChild(retryBtn);
  bannerEl.hidden = false;
}

function hideBanner() {
  bannerEl.hidden = true;
}

function renderPentagon() {
  pentagonEl.innerHTML = '';

  const ringCurrencies = state.selectedCurrencies.filter((c) => c !== state.baseCurrency);
  const positions = pickRingPositions(ringCurrencies.length, 380, 76);
  const nodeSize = 76;
  const centerPoint = 190;

  const svgNS = 'http://www.w3.org/2000/svg';
  const linesSvg = document.createElementNS(svgNS, 'svg');
  linesSvg.setAttribute('class', 'wc-pentagon-lines');
  linesSvg.setAttribute('viewBox', '0 0 380 380');
  pentagonEl.appendChild(linesSvg);

  ringCurrencies.forEach((code, i) => {
    const pos = positions[i];
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('class', 'wc-pentagon-line');
    line.setAttribute('x1', centerPoint);
    line.setAttribute('y1', centerPoint);
    line.setAttribute('x2', pos.left + nodeSize / 2);
    line.setAttribute('y2', pos.top + nodeSize / 2);
    linesSvg.appendChild(line);

    const node = document.createElement('div');
    node.className = 'wc-node';
    node.dataset.code = code;
    node.style.top = `${positions[i].top}px`;
    node.style.left = `${positions[i].left}px`;

    const converted = convertAmount(state.amount, state.baseCurrency, code, state.ratesUSD);

    const flagDiv = buildFlagEl(code);

    const codeDiv = document.createElement('div');
    codeDiv.className = 'wc-code';
    codeDiv.textContent = code.toUpperCase();

    const valueDiv = document.createElement('div');
    valueDiv.className = 'wc-value';
    valueDiv.textContent = formatAmount(converted);

    node.appendChild(flagDiv);
    node.appendChild(codeDiv);
    node.appendChild(valueDiv);

    node.addEventListener('click', () => {
      const currentConverted = convertAmount(state.amount, state.baseCurrency, code, state.ratesUSD);
      state.amount = currentConverted == null ? state.amount : Math.round(currentConverted * 100) / 100;
      state.baseCurrency = code;
      chrome.storage.local.set({ baseCurrency: code });
      renderPentagon();
    });

    pentagonEl.appendChild(node);
  });

  const center = document.createElement('div');
  center.className = 'wc-node wc-node-center';

  const centerFlag = buildFlagEl(state.baseCurrency);

  const centerCode = document.createElement('div');
  centerCode.className = 'wc-code';
  centerCode.textContent = state.baseCurrency.toUpperCase();

  const centerInput = document.createElement('input');
  centerInput.className = 'wc-input';
  centerInput.id = 'amount-input';
  centerInput.inputMode = 'decimal';
  centerInput.maxLength = 24;

  center.appendChild(centerFlag);
  center.appendChild(centerCode);
  center.appendChild(centerInput);
  pentagonEl.appendChild(center);

  const input = document.getElementById('amount-input');
  input.value = state.amount;
  input.addEventListener('input', () => {
    state.amount = parseAmountExpression(input.value);
    updateRingValues();
  });
}

function updateRingValues() {
  const nodes = pentagonEl.querySelectorAll('.wc-node[data-code]');
  nodes.forEach((node) => {
    const code = node.dataset.code;
    const converted = convertAmount(state.amount, state.baseCurrency, code, state.ratesUSD);
    const valueEl = node.querySelector('.wc-value');
    if (valueEl) valueEl.textContent = formatAmount(converted);
  });
}

async function init() {
  const stored = await chrome.storage.local.get([
    'selectedCurrencies',
    'baseCurrency',
    'ratesUSD',
    'currencyNames',
    'ratesTimestamp',
    'popupTheme',
    'tooltipTheme',
  ]);

  state.selectedCurrencies = stored.selectedCurrencies || DEFAULT_SELECTED;
  state.baseCurrency = stored.baseCurrency || DEFAULT_BASE;
  state.popupTheme = stored.popupTheme || DEFAULT_POPUP_THEME;
  state.tooltipTheme = stored.tooltipTheme || DEFAULT_TOOLTIP_THEME;
  applyPopupTheme();
  updateTooltipThemeButtons();

  if (!stored.selectedCurrencies) {
    await chrome.storage.local.set({ selectedCurrencies: DEFAULT_SELECTED, baseCurrency: DEFAULT_BASE });
  }

  let rates = stored;
  if (!stored.ratesUSD || isStale(stored.ratesTimestamp)) {
    try {
      rates = await ensureFreshRates(chrome.storage.local, fetch);
    } catch (err) {
      rates = stored;
    }
  }

  if (!rates.ratesUSD) {
    showRetryBanner('Нет данных о курсах.');
    return;
  }

  if (rates.stale) {
    const t = new Date(rates.ratesTimestamp);
    showBanner(`Курс на ${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}, обновить не удалось`);
  } else {
    hideBanner();
  }

  state.ratesUSD = rates.ratesUSD;
  state.currencyNames = rates.currencyNames || {};

  renderPentagon();
}

const pentagonView = document.getElementById('pentagon-view');
const settingsView = document.getElementById('settings-view');
const settingsSearch = document.getElementById('settings-search');
const settingsList = document.getElementById('settings-list');
const settingsError = document.getElementById('settings-error');

let pendingSelection = new Set();

function appendSettingsRow(code, name) {
  const row = document.createElement('label');
  row.className = 'wc-list-row';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.dataset.code = code;
  checkbox.checked = pendingSelection.has(code);

  const codeSpan = document.createElement('span');
  codeSpan.className = 'wc-code';
  codeSpan.textContent = code.toUpperCase();

  const nameSpan = document.createElement('span');
  nameSpan.className = 'wc-list-name';
  nameSpan.textContent = name;

  row.appendChild(checkbox);
  row.appendChild(buildFlagEl(code));
  row.appendChild(codeSpan);
  row.appendChild(nameSpan);

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) pendingSelection.add(code);
    else pendingSelection.delete(code);
  });

  settingsList.appendChild(row);
}

function renderSettingsList(filter) {
  const query = (filter || '').trim().toLowerCase();
  settingsList.innerHTML = '';

  const matches = (code, name) =>
    !query || code.includes(query) || name.toLowerCase().includes(query);

  const fiatCodes = Object.keys(CURRENCY_COUNTRY)
    .filter((code) => state.currencyNames[code])
    .filter((code) => matches(code, state.currencyNames[code]))
    .sort();

  const cryptoEntries = CRYPTO_LIST.filter((c) => state.currencyNames[c.code]).filter((c) =>
    matches(c.code, c.name)
  );

  if (fiatCodes.length) {
    const heading = document.createElement('div');
    heading.className = 'wc-list-heading';
    heading.textContent = 'Валюты';
    settingsList.appendChild(heading);
    fiatCodes.forEach((code) => appendSettingsRow(code, state.currencyNames[code]));
  }

  if (cryptoEntries.length) {
    const heading = document.createElement('div');
    heading.className = 'wc-list-heading';
    heading.textContent = 'Криптовалюта';
    settingsList.appendChild(heading);
    cryptoEntries.forEach(({ code, name }) => appendSettingsRow(code, name));
  }
}

const tooltipThemeLightBtn = document.getElementById('tooltip-theme-light');
const tooltipThemeDarkBtn = document.getElementById('tooltip-theme-dark');

function updateTooltipThemeButtons() {
  tooltipThemeLightBtn.classList.toggle('active', state.tooltipTheme === 'light');
  tooltipThemeDarkBtn.classList.toggle('active', state.tooltipTheme === 'dark');
}

function setTooltipTheme(theme) {
  state.tooltipTheme = theme;
  chrome.storage.local.set({ tooltipTheme: theme });
  updateTooltipThemeButtons();
}

tooltipThemeLightBtn.addEventListener('click', () => setTooltipTheme('light'));
tooltipThemeDarkBtn.addEventListener('click', () => setTooltipTheme('dark'));

function openSettings() {
  pendingSelection = new Set(state.selectedCurrencies);
  settingsError.hidden = true;
  settingsSearch.value = '';
  renderSettingsList('');
  pentagonView.hidden = true;
  settingsView.hidden = false;
}

function closeSettings() {
  settingsView.hidden = true;
  pentagonView.hidden = false;
}

settingsBtn.addEventListener('click', openSettings);
document.getElementById('settings-cancel').addEventListener('click', closeSettings);

settingsSearch.addEventListener('input', () => renderSettingsList(settingsSearch.value));

document.getElementById('settings-save').addEventListener('click', async () => {
  const chosen = Array.from(pendingSelection);
  if (chosen.length < 3 || chosen.length > 7) {
    settingsError.textContent = 'Выбери от 3 до 7 валют.';
    settingsError.hidden = false;
    return;
  }

  state.selectedCurrencies = chosen;
  if (!chosen.includes(state.baseCurrency)) state.baseCurrency = chosen[0];

  await chrome.storage.local.set({
    selectedCurrencies: state.selectedCurrencies,
    baseCurrency: state.baseCurrency,
  });

  closeSettings();
  renderPentagon();
});

init();
