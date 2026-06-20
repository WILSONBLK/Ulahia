const STORAGE_KEY = "ulahiam-pilot-state-v1";

const lang = {
  en: {
    tagline: "Simple shop book",
    heroTitle: "Know your sales, stock, profit, and people owing you.",
    heroBody:
      "Ulahia helps a small shop owner record sales fast, know what remains in the shop, and see profit before closing.",
    start: "Start selling",
    addGoods: "Add goods",
    read: "Read",
    todaySales: "Today sales",
    todayProfit: "Today profit",
    stockLeft: "Stock left",
    owing: "Owing",
    dashboard: "Home",
    sell: "Sell",
    stock: "Stock",
    customers: "Owing",
    reports: "Report",
    shopReady: "Mama Ngozi Store is ready",
    quickSale: "Tap goods when customer buys",
    quickSaleHint: "Stock goes down and profit shows by itself.",
    addFirstGoods: "Add first goods",
    recordFirstSale: "Record first sale",
    seeProfit: "See your profit",
    product: "Goods",
    cost: "Cost price",
    price: "Selling price",
    qty: "Quantity",
    save: "Save",
    cancel: "Cancel",
    customerName: "Customer name",
    phone: "Phone number",
    amount: "Amount",
    reason: "What did they buy?",
    addDebt: "Add owing",
    paid: "Paid",
    lowStock: "Low stock",
    private: "Private on this device",
    offline: "No internet. You can still use your last shop data.",
    reportText: "This is the money story for today.",
    demoReset: "Reset demo",
    trust: "Built for small Android phones, poor network, and busy shops."
  },
  pidgin: {
    tagline: "Simple shop book",
    heroTitle: "Know wetin you sell, wetin remain, profit, and who dey owe.",
    heroBody:
      "Ulahia help shop owner record sales fast, know goods wey remain, and see profit before shop close.",
    start: "Start to sell",
    addGoods: "Add goods",
    read: "Read",
    todaySales: "Sales today",
    todayProfit: "Profit today",
    stockLeft: "Goods remain",
    owing: "People owing",
    dashboard: "Home",
    sell: "Sell",
    stock: "Stock",
    customers: "Owing",
    reports: "Report",
    shopReady: "Mama Ngozi Store don ready",
    quickSale: "Tap goods when customer buy",
    quickSaleHint: "Stock go reduce and profit go show by itself.",
    addFirstGoods: "Add first goods",
    recordFirstSale: "Record first sale",
    seeProfit: "See your profit",
    product: "Goods",
    cost: "Cost price",
    price: "Selling price",
    qty: "Quantity",
    save: "Save",
    cancel: "Cancel",
    customerName: "Customer name",
    phone: "Phone number",
    amount: "Amount",
    reason: "Wetin dem buy?",
    addDebt: "Add owing",
    paid: "Paid",
    lowStock: "Goods dey finish",
    private: "Private for this phone",
    offline: "No internet. You still fit use your last shop data.",
    reportText: "Na today money story be this.",
    demoReset: "Reset demo",
    trust: "Built for small Android phones, weak network, and busy shops."
  },
  yo: {
    tagline: "Iwe itaja to rorun",
    heroTitle: "Mo tita, eru to ku, ere, ati awon to je gbese.",
    heroBody:
      "Ulahia ran onitaja lowo lati ko tita sile, mo eru to ku, ki o si ri ere ojo naa.",
    start: "Bẹrẹ tita",
    addGoods: "Fi eru kun",
    read: "Ka si mi",
    todaySales: "Tita oni",
    todayProfit: "Ere oni",
    stockLeft: "Eru to ku",
    owing: "Gbese",
    dashboard: "Ile",
    sell: "Ta",
    stock: "Eru",
    customers: "Gbese",
    reports: "Iroyin",
    shopReady: "Mama Ngozi Store ti setan",
    quickSale: "Te eru ti alabara ra",
    quickSaleHint: "Eru maa dinku, ere naa maa han.",
    addFirstGoods: "Fi eru akoko kun",
    recordFirstSale: "Ko tita akoko sile",
    seeProfit: "Wo ere re",
    product: "Eru",
    cost: "Owo rira",
    price: "Owo tita",
    qty: "Iye",
    save: "Fipamo",
    cancel: "Pa de",
    customerName: "Oruko alabara",
    phone: "Nomba foonu",
    amount: "Owo",
    reason: "Kini won ra?",
    addDebt: "Fi gbese kun",
    paid: "Sanwo",
    lowStock: "Eru n pari",
    private: "Ikoko lori ero yi",
    offline: "Ko si internet. O tun le lo data itaja re.",
    reportText: "Eyi ni itan owo oni.",
    demoReset: "Tun demo se",
    trust: "A se fun Android kekere, network kekere, ati itaja to n sise."
  },
  ig: {
    tagline: "Akwukwo shop di mfe",
    heroTitle: "Mara ihe rere, stock foduru, profit, na ndi ji ugwo.",
    heroBody:
      "Ulahia na enyere onye shop aka ide sales ngwa ngwa, mata ihe foduru, hu profit kwa ubochi.",
    start: "Malite ire",
    addGoods: "Tinye ngwa",
    read: "Gua",
    todaySales: "Sales taa",
    todayProfit: "Profit taa",
    stockLeft: "Stock foduru",
    owing: "Ndi ji ugwo",
    dashboard: "Home",
    sell: "Ree",
    stock: "Stock",
    customers: "Ugwo",
    reports: "Report",
    shopReady: "Mama Ngozi Store di njikere",
    quickSale: "Pia ngwa mgbe customer zuru",
    quickSaleHint: "Stock ga-ebelata, profit ga-aputa.",
    addFirstGoods: "Tinye ngwa mbu",
    recordFirstSale: "Dee sale mbu",
    seeProfit: "Hu profit gi",
    product: "Ngwa",
    cost: "Onu ahia izu",
    price: "Onu ahia ire",
    qty: "Ole",
    save: "Chekwaa",
    cancel: "Kagbuo",
    customerName: "Aha customer",
    phone: "Nomba phone",
    amount: "Ego",
    reason: "Gini ka ha zuru?",
    addDebt: "Tinye ugwo",
    paid: "Akwugo",
    lowStock: "Stock na-agwu",
    private: "Nkeonwe na device a",
    offline: "Internet adighi. I ka nwere ike iji data shop gi.",
    reportText: "Nke a bu akụkọ ego taa.",
    demoReset: "Reset demo",
    trust: "E wuru ya maka obere Android, network adighi ike, na shop na-eme ngwa."
  },
  ha: {
    tagline: "Littafin shago mai sauki",
    heroTitle: "San sayarwa, kaya da suka rage, riba, da masu bashi.",
    heroBody:
      "Ulahia na taimaka wa mai shago rubuta sayarwa da sauri, ganin kaya da suka rage, da ribar yau.",
    start: "Fara sayarwa",
    addGoods: "Kara kaya",
    read: "Karanta",
    todaySales: "Sayarwa yau",
    todayProfit: "Riba yau",
    stockLeft: "Kaya sun rage",
    owing: "Bashi",
    dashboard: "Gida",
    sell: "Sayar",
    stock: "Kaya",
    customers: "Bashi",
    reports: "Rahoto",
    shopReady: "Mama Ngozi Store ta shirya",
    quickSale: "Danna kaya idan customer ya saya",
    quickSaleHint: "Kaya zai ragu, riba zata bayyana.",
    addFirstGoods: "Kara kaya na farko",
    recordFirstSale: "Rubuta sayarwa ta farko",
    seeProfit: "Ga ribarka",
    product: "Kaya",
    cost: "Farashin siya",
    price: "Farashin sayarwa",
    qty: "Adadi",
    save: "Ajiye",
    cancel: "Soke",
    customerName: "Sunan customer",
    phone: "Lambar waya",
    amount: "Kudi",
    reason: "Me suka saya?",
    addDebt: "Kara bashi",
    paid: "An biya",
    lowStock: "Kaya na karewa",
    private: "Na sirri a wannan waya",
    offline: "Babu internet. Zaka iya amfani da bayanan shagoka.",
    reportText: "Wannan shine labarin kudin yau.",
    demoReset: "Reset demo",
    trust: "An gina shi domin kananan Android, network mara karfi, da shaguna masu aiki."
  }
};

const starterState = {
  language: "pidgin",
  view: "dashboard",
  shop: { name: "Mama Ngozi Store", owner: "Ngozi", phone: "0803 000 0000" },
  products: [
    { id: "p1", name: "Indomie Onion", cost: 260, price: 350, qty: 22, low: 8 },
    { id: "p2", name: "Peak Milk Sachet", cost: 110, price: 150, qty: 13, low: 10 },
    { id: "p3", name: "Bread Small", cost: 620, price: 800, qty: 6, low: 5 },
    { id: "p4", name: "Pure Water Bag", cost: 250, price: 350, qty: 9, low: 5 },
    { id: "p5", name: "Groundnut Oil Cup", cost: 480, price: 650, qty: 4, low: 5 },
    { id: "p6", name: "Recharge Card 500", cost: 485, price: 500, qty: 15, low: 7 }
  ],
  sales: [
    { id: "s1", productId: "p1", name: "Indomie Onion", qty: 3, total: 1050, profit: 270, time: new Date().toISOString() },
    { id: "s2", productId: "p3", name: "Bread Small", qty: 1, total: 800, profit: 180, time: new Date().toISOString() },
    { id: "s3", productId: "p2", name: "Peak Milk Sachet", qty: 2, total: 300, profit: 80, time: new Date().toISOString() }
  ],
  debts: [
    { id: "d1", name: "Aunty Blessing", phone: "0812 222 2222", amount: 1450, reason: "Bread, milk, noodles", paid: false },
    { id: "d2", name: "Chinedu", phone: "0806 111 1111", amount: 700, reason: "Pure water and oil", paid: false }
  ],
  onboarding: { goods: true, sale: true, profit: true }
};

let state = loadState();
let toastTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.products)) return saved;
  } catch (error) {
    console.warn(error);
  }
  return structuredClone(starterState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function t(key) {
  return (lang[state.language] && lang[state.language][key]) || lang.en[key] || key;
}

function money(value) {
  return "NGN " + Number(value || 0).toLocaleString("en-NG");
}

function todaySales() {
  return state.sales.reduce((sum, sale) => sum + sale.total, 0);
}

function todayProfit() {
  return state.sales.reduce((sum, sale) => sum + sale.profit, 0);
}

function totalStock() {
  return state.products.reduce((sum, product) => sum + product.qty, 0);
}

function totalDebt() {
  return state.debts.filter((debt) => !debt.paid).reduce((sum, debt) => sum + debt.amount, 0);
}

function lowStockCount() {
  return state.products.filter((product) => product.qty <= product.low).length;
}

function setView(view) {
  state.view = view;
  saveState();
  render();
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showToast("Voice reading is not available on this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

function sellProduct(id) {
  const product = state.products.find((item) => item.id === id);
  if (!product || product.qty <= 0) return;
  product.qty -= 1;
  state.sales.unshift({
    id: crypto.randomUUID(),
    productId: product.id,
    name: product.name,
    qty: 1,
    total: product.price,
    profit: product.price - product.cost,
    time: new Date().toISOString()
  });
  state.onboarding.sale = true;
  state.onboarding.profit = true;
  saveState();
  render();
  showToast(`${product.name} sold. Profit: ${money(product.price - product.cost)}`);
}

function addProduct(form) {
  const data = new FormData(form);
  const product = {
    id: crypto.randomUUID(),
    name: data.get("name").trim(),
    cost: Number(data.get("cost")),
    price: Number(data.get("price")),
    qty: Number(data.get("qty")),
    low: Number(data.get("low") || 5)
  };
  if (!product.name || product.price <= 0 || product.qty < 0) return;
  state.products.unshift(product);
  state.onboarding.goods = true;
  saveState();
  closeModal();
  render();
  showToast(`${product.name} added.`);
}

function addDebt(form) {
  const data = new FormData(form);
  const debt = {
    id: crypto.randomUUID(),
    name: data.get("name").trim(),
    phone: data.get("phone").trim(),
    amount: Number(data.get("amount")),
    reason: data.get("reason").trim(),
    paid: false
  };
  if (!debt.name || debt.amount <= 0) return;
  state.debts.unshift(debt);
  saveState();
  closeModal();
  render();
  showToast(`${debt.name} added to owing book.`);
}

function markPaid(id) {
  const debt = state.debts.find((item) => item.id === id);
  if (!debt) return;
  debt.paid = true;
  saveState();
  render();
  showToast(`${debt.name} marked paid.`);
}

function resetDemo() {
  state = structuredClone(starterState);
  saveState();
  render();
  showToast("Demo shop reset.");
}

function openProductModal() {
  openModal(`
    <h3>${t("addGoods")}</h3>
    <form id="productForm" class="form-grid">
      <label class="label wide">${t("product")}<input class="field" name="name" placeholder="e.g. Golden Penny Spaghetti" required /></label>
      <label class="label">${t("cost")}<input class="field" name="cost" type="number" min="0" placeholder="750" required /></label>
      <label class="label">${t("price")}<input class="field" name="price" type="number" min="1" placeholder="950" required /></label>
      <label class="label">${t("qty")}<input class="field" name="qty" type="number" min="0" placeholder="12" required /></label>
      <label class="label">${t("lowStock")}<input class="field" name="low" type="number" min="1" placeholder="5" /></label>
      <div class="row wide">
        <button class="button" type="submit">${t("save")}</button>
        <button class="button light" type="button" data-close>${t("cancel")}</button>
      </div>
    </form>
  `);
  document.querySelector("#productForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addProduct(event.currentTarget);
  });
}

function openDebtModal() {
  openModal(`
    <h3>${t("addDebt")}</h3>
    <form id="debtForm" class="form-grid">
      <label class="label">${t("customerName")}<input class="field" name="name" placeholder="e.g. Aunty Grace" required /></label>
      <label class="label">${t("phone")}<input class="field" name="phone" placeholder="0803 xxx xxxx" /></label>
      <label class="label">${t("amount")}<input class="field" name="amount" type="number" min="1" placeholder="1200" required /></label>
      <label class="label">${t("reason")}<input class="field" name="reason" placeholder="Rice and oil" /></label>
      <div class="row wide">
        <button class="button" type="submit">${t("save")}</button>
        <button class="button light" type="button" data-close>${t("cancel")}</button>
      </div>
    </form>
  `);
  document.querySelector("#debtForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addDebt(event.currentTarget);
  });
}

function openModal(html) {
  const backdrop = document.querySelector(".modal-backdrop");
  backdrop.innerHTML = `<div class="modal">${html}</div>`;
  backdrop.classList.add("is-open");
  backdrop.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModal));
}

function closeModal() {
  const backdrop = document.querySelector(".modal-backdrop");
  backdrop.classList.remove("is-open");
  backdrop.innerHTML = "";
}

function statCards() {
  return `
    <div class="stats">
      <div class="stat"><span>${t("todaySales")}</span><strong>${money(todaySales())}</strong></div>
      <div class="stat"><span>${t("todayProfit")}</span><strong class="amount good">${money(todayProfit())}</strong></div>
      <div class="stat"><span>${t("stockLeft")}</span><strong>${totalStock()}</strong></div>
      <div class="stat ${lowStockCount() ? "warn" : ""}"><span>${t("lowStock")}</span><strong>${lowStockCount()}</strong></div>
    </div>
  `;
}

function productCards() {
  if (!state.products.length) return `<div class="empty">${t("addFirstGoods")}</div>`;
  return state.products
    .map((product) => {
      const profit = product.price - product.cost;
      const stockClass = product.qty === 0 ? "bad" : product.qty <= product.low ? "warn" : "";
      return `
        <article class="card">
          <div class="product-top">
            <div>
              <h3 class="product-name">${product.name}</h3>
              <span>${money(product.price)} - profit ${money(profit)}</span>
            </div>
            <span class="pill ${stockClass}">${product.qty} left</span>
          </div>
          <button class="sale-button" ${product.qty <= 0 ? "disabled" : ""} data-sell="${product.id}">
            Sell 1 - ${money(product.price)}
          </button>
        </article>
      `;
    })
    .join("");
}

function debtList() {
  const debts = state.debts.filter((debt) => !debt.paid);
  if (!debts.length) return `<div class="empty">Nobody dey owe now.</div>`;
  return debts
    .map(
      (debt) => `
        <div class="debt-row">
          <div>
            <strong>${debt.name}</strong>
            <span>${debt.reason || debt.phone || "No note"}</span>
          </div>
          <div class="row">
            <strong class="amount bad">${money(debt.amount)}</strong>
            <button class="button secondary" data-paid="${debt.id}">${t("paid")}</button>
          </div>
        </div>
      `
    )
    .join("");
}

function salesList() {
  if (!state.sales.length) return `<div class="empty">${t("recordFirstSale")}</div>`;
  return state.sales
    .slice(0, 8)
    .map(
      (sale) => `
        <div class="list-row">
          <div>
            <strong>${sale.name}</strong>
            <span>${new Date(sale.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div>
            <strong>${money(sale.total)}</strong>
            <span>Profit ${money(sale.profit)}</span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderDashboard() {
  const speechText = `${t("heroTitle")} ${t("heroBody")}`;
  return `
    <section class="hero">
      <div class="hero-text">
        <span class="section-kicker">${t("tagline")}</span>
        <h1>${t("heroTitle")}</h1>
        <p>${t("heroBody")}</p>
        <div class="hero-actions">
          <button class="button" data-view="sell">${t("start")}</button>
          <button class="button secondary" data-open-product>${t("addGoods")}</button>
          <button class="button light" data-speak="${encodeURIComponent(speechText)}">${t("read")}</button>
        </div>
        <p class="trust-note">${t("trust")}</p>
      </div>
      <div class="phone-preview" aria-label="Mobile app preview">
        <div class="phone-screen">
          <div class="phone-head"><span>${state.shop.name}</span><span>${t("private")}</span></div>
          <div class="phone-total"><span>${t("todayProfit")}</span><strong>${money(todayProfit())}</strong></div>
          <div class="phone-grid">
            <div class="mini-card"><span>${t("todaySales")}</span><strong>${money(todaySales())}</strong></div>
            <div class="mini-card"><span>${t("stockLeft")}</span><strong>${totalStock()}</strong></div>
            <div class="mini-card"><span>${t("owing")}</span><strong>${money(totalDebt())}</strong></div>
            <div class="mini-card"><span>${t("lowStock")}</span><strong>${lowStockCount()}</strong></div>
          </div>
        </div>
      </div>
    </section>
    ${statCards()}
    <section class="section two-col">
      <div class="panel">
        <div class="section-head"><h2>${t("quickSale")}</h2><button class="button secondary" data-view="sell">${t("sell")}</button></div>
        <p>${t("quickSaleHint")}</p>
        <div class="grid">${productCards()}</div>
      </div>
      <div class="panel">
        <div class="section-head"><h2>${t("addFirstGoods")}</h2></div>
        <div class="onboarding">
          ${step(1, t("addFirstGoods"), state.onboarding.goods)}
          ${step(2, t("recordFirstSale"), state.onboarding.sale)}
          ${step(3, t("seeProfit"), state.onboarding.profit)}
        </div>
      </div>
    </section>
  `;
}

function step(number, text, done) {
  return `
    <div class="step">
      <span class="step-number">${done ? "OK" : number}</span>
      <strong>${text}</strong>
    </div>
  `;
}

function renderSell() {
  return `
    <section class="section">
      <div class="section-head">
        <div><span class="section-kicker">${state.shop.name}</span><h2>${t("quickSale")}</h2><p>${t("quickSaleHint")}</p></div>
        <button class="button" data-open-product>${t("addGoods")}</button>
      </div>
      ${statCards()}
      <div class="section grid">${productCards()}</div>
    </section>
  `;
}

function renderStock() {
  return `
    <section class="section">
      <div class="section-head">
        <div><span class="section-kicker">${t("stock")}</span><h2>${t("stockLeft")}: ${totalStock()}</h2></div>
        <button class="button" data-open-product>${t("addGoods")}</button>
      </div>
      <div class="list">
        ${state.products
          .map((product) => {
            const percent = Math.max(4, Math.min(100, (product.qty / Math.max(product.low * 3, 1)) * 100));
            return `
              <div class="panel">
                <div class="product-top">
                  <div><strong>${product.name}</strong><p>${money(product.cost)} cost - ${money(product.price)} selling</p></div>
                  <span class="pill ${product.qty <= product.low ? "warn" : ""}">${product.qty} left</span>
                </div>
                <div class="progress"><span style="width:${percent}%"></span></div>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderCustomers() {
  return `
    <section class="section">
      <div class="section-head">
        <div><span class="section-kicker">${t("customers")}</span><h2>${t("owing")}: ${money(totalDebt())}</h2></div>
        <button class="button" data-open-debt>${t("addDebt")}</button>
      </div>
      <div class="list">${debtList()}</div>
    </section>
  `;
}

function renderReports() {
  return `
    <section class="section">
      <div class="section-head">
        <div><span class="section-kicker">${t("reports")}</span><h2>${t("reportText")}</h2></div>
        <button class="button light" data-reset>${t("demoReset")}</button>
      </div>
      ${statCards()}
      <div class="two-col section">
        <div class="panel"><h2>${t("todaySales")}</h2><div class="list">${salesList()}</div></div>
        <div class="panel"><h2>${t("owing")}</h2><div class="list">${debtList()}</div></div>
      </div>
    </section>
  `;
}

function nav() {
  const items = [
    ["dashboard", t("dashboard"), "Home"],
    ["sell", t("sell"), "Sell"],
    ["stock", t("stock"), "Stock"],
    ["customers", t("customers"), "Debt"],
    ["reports", t("reports"), "Report"]
  ];
  return items
    .map(
      ([id, label, icon]) => `
        <button class="nav-button ${state.view === id ? "is-active" : ""}" data-view="${id}">
          <span>${icon}</span><span>${label}</span>
        </button>
      `
    )
    .join("");
}

function mobileNav() {
  const items = [
    ["dashboard", t("dashboard"), "🏠"],
    ["sell", t("sell"), "💰"],
    ["stock", t("stock"), "📦"],
    ["customers", t("customers"), "👥"],
    ["reports", t("reports"), "📊"]
  ];
  return items
    .map(
      ([id, label, icon]) => `
        <button class="${state.view === id ? "is-active" : ""}" data-view="${id}">
          <span class="nav-icon">${icon}</span>
          <span class="nav-label">${label}</span>
        </button>
      `
    )
    .join("");
}

function renderMain() {
  if (state.view === "sell") return renderSell();
  if (state.view === "stock") return renderStock();
  if (state.view === "customers") return renderCustomers();
  if (state.view === "reports") return renderReports();
  return renderDashboard();
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.querySelectorAll("[data-sell]").forEach((button) => {
    button.addEventListener("click", () => sellProduct(button.dataset.sell));
  });
  document.querySelectorAll("[data-paid]").forEach((button) => {
    button.addEventListener("click", () => markPaid(button.dataset.paid));
  });
  document.querySelectorAll("[data-open-product]").forEach((button) => button.addEventListener("click", openProductModal));
  document.querySelectorAll("[data-open-debt]").forEach((button) => button.addEventListener("click", openDebtModal));
  document.querySelectorAll("[data-reset]").forEach((button) => button.addEventListener("click", resetDemo));
  document.querySelectorAll("[data-speak]").forEach((button) => {
    button.addEventListener("click", () => speak(decodeURIComponent(button.dataset.speak)));
  });
  const language = document.querySelector("#language");
  language.addEventListener("change", () => {
    state.language = language.value;
    saveState();
    render();
  });
}

function render() {
  document.querySelector("#app").innerHTML = `
    <div class="offline">${t("offline")} <button class="button light" onclick="window.location.reload()">Try again</button></div>
    <header class="topbar">
      <div class="brand">
        <span class="mark">U</span>
        <div><strong>Ulahia</strong><span>${t("tagline")}</span></div>
      </div>
      <div class="top-actions">
        <select id="language" class="select" aria-label="Language">
          <option value="pidgin" ${state.language === "pidgin" ? "selected" : ""}>Pidgin</option>
          <option value="en" ${state.language === "en" ? "selected" : ""}>English</option>
          <option value="yo" ${state.language === "yo" ? "selected" : ""}>Yoruba</option>
          <option value="ig" ${state.language === "ig" ? "selected" : ""}>Igbo</option>
          <option value="ha" ${state.language === "ha" ? "selected" : ""}>Hausa</option>
        </select>
        <button class="icon-button" data-speak="${encodeURIComponent(t("heroTitle"))}" title="${t("read")}">Audio</button>
      </div>
    </header>
    <div class="layout">
      <aside class="sidebar">${nav()}</aside>
      <main class="main">${renderMain()}</main>
    </div>
    <nav class="tabs-mobile">${mobileNav()}</nav>
    <div class="toast"></div>
    <div class="modal-backdrop"></div>
  `;
  document.querySelector(".offline").classList.toggle("is-visible", !navigator.onLine);
  bindEvents();
}

window.addEventListener("online", render);
window.addEventListener("offline", render);
render();
