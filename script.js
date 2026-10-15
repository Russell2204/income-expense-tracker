const STORAGE_KEY = "salary-tracker";
const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

const MESSAGES = {
  ru: {
    eyebrow: "Личные финансы",
    appTitle: "Трекер доходов и расходов",
    monthNav: "Выбор месяца",
    prevMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
    sections: "Разделы",
    tabSummary: "Итоги",
    tabDays: "По дням",
    tabShare: "Доли",
    tabForm: "Операция",
    tabList: "Список",
    tabSettings: "Настройки",
    monthTotals: "Итоги месяца",
    income: "Доход",
    expense: "Расход",
    balance: "Баланс",
    daysTitle: "По дням месяца",
    shareTitle: "Доля дохода и расхода",
    newTitle: "Новая операция",
    editTitle: "Изменить операцию",
    type: "Тип",
    name: "Название",
    titlePlaceholder: "Зарплата, продукты…",
    amount: "Сумма",
    date: "Дата",
    add: "Добавить",
    save: "Сохранить",
    cancel: "Отмена",
    operations: "Операции",
    empty: "В этом месяце операций пока нет.",
    themeGroup: "Тема оформления",
    theme: "Тема",
    light: "Светлая",
    dark: "Тёмная",
    language: "Язык",
    languageGroup: "Язык",
    currency: "Валюта",
    saveCurrency: "Сохранить валюту",
    currencySaved: "Валюта сохранена.",
    deleteConfirm: "Удалить «{title}»?",
    formError: "Укажите название, дату и сумму больше нуля.",
    edit: "Изменить",
    delete: "Удалить",
    total: "всего",
    noData: "Нет данных",
    barLabel: "Доход и расход по дням"
  },
  uz: {
    eyebrow: "Shaxsiy moliya",
    appTitle: "Daromad va xarajatlar trekeri",
    monthNav: "Oyni tanlash",
    prevMonth: "Oldingi oy",
    nextMonth: "Keyingi oy",
    sections: "Bo'limlar",
    tabSummary: "Jami",
    tabDays: "Kunlar",
    tabShare: "Ulushlar",
    tabForm: "Amal",
    tabList: "Ro'yxat",
    tabSettings: "Sozlamalar",
    monthTotals: "Oylik natijalar",
    income: "Daromad",
    expense: "Xarajat",
    balance: "Balans",
    daysTitle: "Oy kunlari bo'yicha",
    shareTitle: "Daromad va xarajat ulushi",
    newTitle: "Yangi amal",
    editTitle: "Amalni tahrirlash",
    type: "Turi",
    name: "Nomi",
    titlePlaceholder: "Maosh, mahsulotlar…",
    amount: "Summa",
    date: "Sana",
    add: "Qo'shish",
    save: "Saqlash",
    cancel: "Bekor qilish",
    operations: "Amallar",
    empty: "Bu oyda hali amallar yo'q.",
    themeGroup: "Mavzu",
    theme: "Mavzu",
    light: "Yorug'",
    dark: "Qorong'i",
    language: "Til",
    languageGroup: "Til",
    currency: "Valyuta",
    saveCurrency: "Valyutani saqlash",
    currencySaved: "Valyuta saqlandi.",
    deleteConfirm: "«{title}» o'chirilsinmi?",
    formError: "Nom, sana va noldan katta summani kiriting.",
    edit: "O'zgartirish",
    delete: "O'chirish",
    total: "jami",
    noData: "Ma'lumot yo'q",
    barLabel: "Kunlar bo'yicha daromad va xarajat"
  }
};

const incomeTotalEl = document.getElementById("income-total");
const expenseTotalEl = document.getElementById("expense-total");
const balanceTotalEl = document.getElementById("balance-total");
const monthLabelEl = document.getElementById("month-label");
const barChartEl = document.getElementById("bar-chart");
const donutChartEl = document.getElementById("donut-chart");
const listEl = document.getElementById("tx-list");
const emptyEl = document.getElementById("empty-state");
const form = document.getElementById("tx-form");
const formTitle = document.getElementById("form-title");
const formError = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const typeInput = document.getElementById("tx-type");
const titleInput = document.getElementById("tx-title");
const amountInput = document.getElementById("tx-amount");
const dateInput = document.getElementById("tx-date");
const settingsForm = document.getElementById("settings-form");
const currencyInput = document.getElementById("currency-input");
const settingsNote = document.getElementById("settings-note");
const themeLightBtn = document.getElementById("theme-light");
const themeDarkBtn = document.getElementById("theme-dark");
const langRuBtn = document.getElementById("lang-ru");
const langUzBtn = document.getElementById("lang-uz");

const state = loadState();
let view = currentMonthDate();
let editingId = null;

currencyInput.value = state.currency;
dateInput.value = todayString();
applyTheme();
applyLanguage();

document.getElementById("prev-month").addEventListener("click", () => shiftMonth(-1));
document.getElementById("next-month").addEventListener("click", () => shiftMonth(1));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const draft = readForm();
  if (!draft) return;

  if (editingId) {
    updateTransaction(editingId, draft);
  } else {
    createTransaction(draft);
  }
  resetForm();
  render();
  showTab("list");
});

cancelBtn.addEventListener("click", () => {
  resetForm();
});

themeLightBtn.addEventListener("click", () => setTheme("light"));
themeDarkBtn.addEventListener("click", () => setTheme("dark"));
langRuBtn.addEventListener("click", () => setLanguage("ru"));
langUzBtn.addEventListener("click", () => setLanguage("uz"));

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const currency = currencyInput.value.trim();
  if (!currency) return;
  state.currency = currency;
  saveState();
  currencyInput.value = currency;
  settingsNote.hidden = false;
  render();
});

document.querySelector(".tabs").addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (!tab) return;
  showTab(tab.dataset.tab);
});

listEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = button.dataset.id;
  if (button.dataset.action === "edit") startEdit(id);
  if (button.dataset.action === "delete") removeTransaction(id);
});

const TAB_ORDER = ["summary", "days", "share", "form", "list", "settings"];

function showTab(name) {
  const next = document.getElementById(`panel-${name}`);
  const current = document.querySelector(".tab-panel.is-active");
  if (!next || next === current) return;

  const from = TAB_ORDER.indexOf(current.id.replace("panel-", ""));
  const to = TAB_ORDER.indexOf(name);
  document.querySelector(".tab-stage").style.setProperty("--tab-dir", to >= from ? "1" : "-1");

  const tabBtn = document.querySelector(`.tab[data-tab="${name}"]`);
  if (tabBtn && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    tabBtn.classList.remove("is-pressed");
    void tabBtn.offsetWidth;
    tabBtn.classList.add("is-pressed");
  }

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset.tab === name));
  });
  document.querySelectorAll(".tab-panel.is-leaving").forEach((panel) => {
    panel.classList.remove("is-leaving");
    panel.hidden = true;
  });

  if (current) {
    current.classList.remove("is-active");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      current.hidden = true;
    } else {
      current.classList.add("is-leaving");
      current.addEventListener("animationend", () => {
        current.classList.remove("is-leaving");
        current.hidden = true;
      }, { once: true });
    }
  }

  next.hidden = false;
  next.classList.remove("is-active");
  void next.offsetWidth;
  next.classList.add("is-active");
}

function shiftMonth(delta) {
  view = new Date(view.getFullYear(), view.getMonth() + delta, 1);
  formError.hidden = true;
  render();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currency: "сум", theme: "light", lang: "ru", transactions: [] };
    const data = JSON.parse(raw);
    return {
      currency: typeof data.currency === "string" && data.currency.trim() ? data.currency : "сум",
      theme: data.theme === "dark" ? "dark" : "light",
      lang: data.lang === "uz" ? "uz" : "ru",
      transactions: Array.isArray(data.transactions) ? data.transactions : []
    };
  } catch {
    return { currency: "сум", theme: "light", lang: "ru", transactions: [] };
  }
}

function t(key) {
  const pack = MESSAGES[state.lang] || MESSAGES.ru;
  return pack[key] || MESSAGES.ru[key] || key;
}

function formatMonth(date) {
  if (state.lang === "uz") return `${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

function setLanguage(lang) {
  state.lang = lang === "uz" ? "uz" : "ru";
  saveState();
  applyLanguage();
}

function applyLanguage() {
  const uz = state.lang === "uz";
  document.documentElement.lang = uz ? "uz" : "ru";
  document.title = t("appTitle");
  langRuBtn.setAttribute("aria-pressed", String(!uz));
  langUzBtn.setAttribute("aria-pressed", String(uz));
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const value = t(el.dataset.i18nPlaceholder);
    el.placeholder = value;
    el.setAttribute("placeholder", value);
  });
  formTitle.textContent = editingId ? t("editTitle") : t("newTitle");
  submitBtn.textContent = editingId ? t("save") : t("add");
  if (!formError.hidden) formError.textContent = t("formError");
  render();
}

function setTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  saveState();
  applyTheme();
  render();
}

function applyTheme() {
  const dark = state.theme === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeLightBtn.setAttribute("aria-pressed", String(!dark));
  themeDarkBtn.setAttribute("aria-pressed", String(dark));
}

function themeColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createTransaction(draft) {
  state.transactions.push({
    id: crypto.randomUUID(),
    ...draft
  });
  saveState();
}

function updateTransaction(id, draft) {
  const index = state.transactions.findIndex((item) => item.id === id);
  if (index === -1) return;
  state.transactions[index] = { ...state.transactions[index], ...draft };
  saveState();
}

function removeTransaction(id) {
  const item = state.transactions.find((entry) => entry.id === id);
  if (!item) return;
  if (!confirm(t("deleteConfirm").replace("{title}", item.title))) return;
  state.transactions = state.transactions.filter((entry) => entry.id !== id);
  if (editingId === id) resetForm();
  saveState();
  render();
}

function readForm() {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeInput.value === "expense" ? "expense" : "income";

  if (!title || !date || !Number.isFinite(amount) || amount <= 0) {
    formError.textContent = t("formError");
    formError.hidden = false;
    return null;
  }

  formError.hidden = true;
  return { type, title, amount, date };
}

function startEdit(id) {
  const item = state.transactions.find((entry) => entry.id === id);
  if (!item) return;
  editingId = id;
  typeInput.value = item.type;
  titleInput.value = item.title;
  amountInput.value = String(item.amount);
  dateInput.value = item.date;
  formTitle.textContent = t("editTitle");
  submitBtn.textContent = t("save");
  cancelBtn.hidden = false;
  formError.hidden = true;
  showTab("form");
}

function resetForm() {
  editingId = null;
  form.reset();
  dateInput.value = todayString();
  formTitle.textContent = t("newTitle");
  submitBtn.textContent = t("add");
  cancelBtn.hidden = true;
  formError.hidden = true;
}

function render() {
  const items = monthTransactions();
  const income = sumByType(items, "income");
  const expense = sumByType(items, "expense");

  monthLabelEl.textContent = formatMonth(view);
  incomeTotalEl.textContent = formatMoney(income);
  expenseTotalEl.textContent = formatMoney(expense);
  balanceTotalEl.textContent = formatMoney(income - expense);

  renderBarChart(items);
  renderDonut(income, expense);
  renderList(items);
}

function monthTransactions() {
  const year = view.getFullYear();
  const month = view.getMonth();
  return state.transactions
    .filter((item) => {
      const date = parseDate(item.date);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function renderList(items) {
  listEl.replaceChildren();
  emptyEl.hidden = items.length > 0;
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = `tx-item ${item.type}`;

    const title = document.createElement("div");
    title.className = "tx-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "tx-meta";
    meta.textContent = `${formatDate(item.date)} · ${item.type === "income" ? t("income") : t("expense")}`;

    const amount = document.createElement("div");
    amount.className = "tx-amount";
    amount.textContent = `${item.type === "expense" ? "−" : "+"}${formatMoney(item.amount)}`;

    const actions = document.createElement("div");
    actions.className = "tx-actions";
    actions.append(
      actionButton(t("edit"), "edit", item.id),
      actionButton(t("delete"), "delete", item.id)
    );

    li.append(title, amount, meta, actions);
    listEl.append(li);
  });
}

function actionButton(label, action, id) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

function renderBarChart(items) {
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const income = Array(days).fill(0);
  const expense = Array(days).fill(0);
  items.forEach((item) => {
    const index = parseDate(item.date).getDate() - 1;
    if (item.type === "income") income[index] += item.amount;
    else expense[index] += item.amount;
  });
  const max = Math.max(1, ...income, ...expense);
  const width = 640;
  const height = 248;
  const pad = 28;
  const base = height - 30;
  const group = (width - pad * 2) / days;
  const barW = Math.max(3, group * 0.34);
  const depthX = Math.max(4.5, barW * 0.95);
  const depthY = depthX * 0.62;
  const bars = [];
  const labels = [];

  for (let day = 0; day < days; day += 1) {
    const x = pad + day * group;
    const incomeH = (income[day] / max) * (base - 40);
    const expenseH = (expense[day] / max) * (base - 40);
    if (incomeH > 0.4) {
      bars.push(barPrism(x, base - incomeH, barW, incomeH, "url(#barIncome)", "#0e4a30", "#8ee0b0", depthX, depthY));
    }
    if (expenseH > 0.4) {
      bars.push(barPrism(x + group * 0.48, base - expenseH, barW, expenseH, "url(#barExpense)", "#7a3014", "#f7c3aa", depthX, depthY));
    }
    if (day === 0 || day === days - 1 || (day + 1) % 5 === 0) {
      labels.push(
        `<text x="${(x + group * 0.4).toFixed(2)}" y="${height - 8}" text-anchor="middle" font-size="11" fill="${themeColor("--muted")}">${day + 1}</text>`
      );
    }
  }

  barChartEl.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(t("barLabel"))}">
      <defs>
        <linearGradient id="barIncome" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stop-color="#6dcc96"></stop>
          <stop offset="0.55" stop-color="#1f7a4d"></stop>
          <stop offset="1" stop-color="#145c38"></stop>
        </linearGradient>
        <linearGradient id="barExpense" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stop-color="#f3a888"></stop>
          <stop offset="0.55" stop-color="#d4653a"></stop>
          <stop offset="1" stop-color="#9a3d1c"></stop>
        </linearGradient>
        <filter id="barShadow" x="-10%" y="-10%" width="130%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="1.6" flood-color="#1c1915" flood-opacity="0.18"></feDropShadow>
        </filter>
      </defs>
      <line x1="${pad}" y1="${base}" x2="${width - pad}" y2="${base}" stroke="${themeColor("--axis")}" stroke-width="1"></line>
      <g filter="url(#barShadow)">${bars.join("")}</g>
      ${labels.join("")}
    </svg>`;
}

function barPrism(x, y, w, h, face, side, top, dx, dy) {
  const right = x + w;
  const bottom = y + h;
  const points = (pairs) => pairs.map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join(" ");
  return `
    <polygon points="${points([[right, y], [right + dx, y - dy], [right + dx, bottom - dy], [right, bottom]])}" fill="${side}"></polygon>
    <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${face}"></rect>
    <polygon points="${points([[x, y], [x + dx, y - dy], [right + dx, y - dy], [right, y]])}" fill="${top}"></polygon>`;
}

function renderDonut(income, expense) {
  const total = income + expense;
  const cx = 120;
  const cy = 92;
  const radius = 68;
  const width = 28;
  const depth = 18;
  const circ = 2 * Math.PI * radius;
  const incomeLen = total === 0 ? circ : (income / total) * circ;
  const expenseLen = total === 0 ? 0 : circ - incomeLen;
  const label = total === 0 ? t("noData") : formatMoney(total);
  const sides = [];

  for (let step = depth; step >= 1; step -= 1) {
    const y = cy + step;
    const shade = 0.42 + (step / depth) * 0.28;
    if (total === 0) {
      sides.push(ringArc(cx, y, radius, width - 4, shadeColor("#b7ad9f", shade), circ, 0, 0));
    } else {
      sides.push(ringArc(cx, y, radius, width - 4, shadeColor("#1f7a4d", shade), incomeLen, circ - incomeLen, 0));
      sides.push(ringArc(cx, y, radius, width - 4, shadeColor("#c4522a", shade), expenseLen, circ - expenseLen, -incomeLen));
    }
  }

  const face = total === 0
    ? ringArc(cx, cy, radius, width, "url(#donutEmpty)", circ, 0, 0)
    : ringArc(cx, cy, radius, width, "url(#donutIncome)", incomeLen, circ - incomeLen, 0)
      + ringArc(cx, cy, radius, width, "url(#donutExpense)", expenseLen, circ - expenseLen, -incomeLen);

  donutChartEl.innerHTML = `
    <svg viewBox="0 0 240 236" role="img" aria-label="${escapeXml(t("shareTitle"))}">
      <defs>
        <linearGradient id="donutIncome" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stop-color="#6dcc96"></stop>
          <stop offset="0.45" stop-color="#24925c"></stop>
          <stop offset="1" stop-color="#146342"></stop>
        </linearGradient>
        <linearGradient id="donutExpense" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0" stop-color="#f09a74"></stop>
          <stop offset="0.5" stop-color="#d4653a"></stop>
          <stop offset="1" stop-color="#9a3d1c"></stop>
        </linearGradient>
        <linearGradient id="donutEmpty" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${themeColor("--empty-0")}"></stop>
          <stop offset="1" stop-color="${themeColor("--empty-1")}"></stop>
        </linearGradient>
        <radialGradient id="donutWell" cx="42%" cy="36%" r="68%">
          <stop offset="0" stop-color="${themeColor("--well-0")}"></stop>
          <stop offset="72%" stop-color="${themeColor("--well-1")}"></stop>
          <stop offset="100%" stop-color="${themeColor("--well-2")}"></stop>
        </radialGradient>
        <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="5" flood-color="#1c1915" flood-opacity="0.2"></feDropShadow>
        </filter>
      </defs>
      <g filter="url(#donutShadow)">
        ${sides.join("")}
        ${face}
        <circle cx="${cx}" cy="${cy + 3}" r="${radius - width / 2 - 2}" fill="rgba(28,25,21,0.08)"></circle>
        <circle cx="${cx}" cy="${cy}" r="${radius - width / 2 - 1}" fill="url(#donutWell)"></circle>
        <circle cx="${cx}" cy="${cy}" r="${radius - 2}" fill="none" stroke="#ffffff" stroke-width="8"
          stroke-dasharray="${(circ * 0.18).toFixed(2)} ${circ.toFixed(2)}" stroke-linecap="round"
          opacity="0.38" transform="rotate(-118 ${cx} ${cy})"></circle>
      </g>
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="13" fill="${themeColor("--muted")}">${escapeXml(t("total"))}</text>
      <text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="14" fill="${themeColor("--ink")}">${escapeXml(label)}</text>
    </svg>`;
}

function ringArc(cx, cy, radius, width, color, dash, gap, offset) {
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${offset}" transform="rotate(-90 ${cx} ${cy})"></circle>`;
}

function shadeColor(hex, factor) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift) => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * factor)));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function sumByType(items, type) {
  return items.reduce((sum, item) => item.type === type ? sum + Number(item.amount) : sum, 0);
}

function formatMoney(value) {
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
  return `${formatted} ${state.currency}`;
}

function formatDate(value) {
  const date = parseDate(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

function parseDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function currentMonthDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
