# Web Converter

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Manifest V3](https://img.shields.io/badge/manifest-v3-orange.svg)
![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

Расширение для браузера — конвертер валют и криптовалют для Brave, Chrome, Edge и Firefox.

## Возможности

**Попап** — до 7 валют по кругу вокруг центральной. Меняешь сумму в центре — остальные пересчитываются мгновенно. Клик по любой валюте в кольце делает её новой базой. Поиск по 150+ фиатным валютам и топ-20 криптовалютам (BTC, ETH, USDT, USDC и др.) — в настройках по значку шестерёнки.

**Конвертация на странице** — выдели цену (`$1,099`, `1 099 ₽`, `€99.90`) в тексте любого сайта — рядом появится подсказка с конвертацией в остальные выбранные валюты.

Курсы обновляются каждые 6 часов через [fawazahmed0/currency-api](https://github.com/fawazahmed0/currency-api), флаги — через [flagcdn.com](https://flagcdn.com). Без сборки, без npm-зависимостей.

## Установка

### Brave / Chrome / Edge

1. Скачай [`install-from-github.bat`](install-from-github.bat) (правой кнопкой мыши → «Сохранить ссылку как»)
2. Запусти — скрипт скачает актуальную версию, перезапустит браузер с уже загруженным расширением
3. Появится предупреждение «Disable developer mode extensions» — разверни его и выбери **Keep**

Расширение остаётся в браузере насовсем. Файлы хранятся в `%LOCALAPPDATA%\WebConverter`.

<details>
<summary>Установка вручную</summary>

`brave://extensions` (или `chrome://extensions`) → включить Developer mode → **Load unpacked** → выбрать папку с этим репозиторием.

</details>

### Firefox

Firefox требует подпись Mozilla для постоянной установки расширения.

- **Временно** (слетает при перезапуске Firefox): `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → выбрать `manifest.firefox.json`
- **Насовсем**: расширение подписано через [addons.mozilla.org](https://addons.mozilla.org) (бесплатно, self-distribution) — итоговый `.xpi` устанавливается перетаскиванием в окно Firefox

## Права доступа

| Permission | Зачем |
|---|---|
| `storage` | Хранить выбранные валюты и кэш курсов локально |
| `alarms` | Обновлять курсы раз в 6 часов в фоне |
| `cdn.jsdelivr.net`, `flagcdn.com` | Загрузка курсов валют и SVG-флагов |
| Доступ ко всем сайтам | Показывать подсказку конвертации при выделении цены на странице |

Расширение не собирает и не передаёт никаких персональных данных — подробнее в [privacy policy](docs/privacy-policy.html).

## Разработка

```bash
npm test
```

43 юнит-теста (`node --test`, встроенный в Node.js), без внешних тестовых зависимостей.

```
shared/     — переиспользуемая логика (конвертация, флаги, курсы, крипто-список)
content/    — content script и парсер цен для конвертации на странице
popup/      — попап расширения
background.js — фоновое обновление курсов
```

## Лицензия

[MIT](LICENSE)
