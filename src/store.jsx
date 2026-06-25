import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { getOrCreateCloudMeta, pushState } from './sync.js'

const ACTIVE_KEY = 'ulahia-active-profile'
const profileKey = id => `ulahia-profile-${id}`

const starterState = {
  setupDone: false,
  language: 'pidgin',
  view: 'home',
  shop: { name: '', owner: '', phone: '' },
  products: [],
  transactions: [],
  customers: [],
  cart: [],
  inventoryPin: null,
  inventoryOtp: null,
  darkMode: false,
  highContrast: false,
  pinnedProducts: [],
}

// ─── Helper for transaction time offsets ─────────────────────────────────────
const h = n => new Date(Date.now() - n * 3600000).toISOString()

// ─── Products ─────────────────────────────────────────────────────────────────
const DEMO_PRODUCTS = [
  // Fixed — counted products
  { id: 'p1',  type: 'fixed', name: 'Indomie Onion',          cost: 260,  price: 350,  qty: 22, low: 8  },
  { id: 'p2',  type: 'fixed', name: 'Peak Milk Sachet',        cost: 110,  price: 150,  qty: 13, low: 10 },
  { id: 'p3',  type: 'fixed', name: 'Bread Small',             cost: 620,  price: 800,  qty: 6,  low: 5  },
  { id: 'p4',  type: 'fixed', name: 'Recharge Card ₦500',      cost: 485,  price: 500,  qty: 15, low: 7  },
  { id: 'p8',  type: 'fixed', name: 'Indomie Chicken',         cost: 280,  price: 400,  qty: 18, low: 8  },
  { id: 'p9',  type: 'fixed', name: 'Indomie Jollof',          cost: 280,  price: 400,  qty: 14, low: 8  },
  { id: 'p10', type: 'fixed', name: 'Milo Sachet (20g)',        cost: 70,   price: 100,  qty: 30, low: 15 },
  { id: 'p11', type: 'fixed', name: 'Ovaltine Sachet',         cost: 75,   price: 110,  qty: 20, low: 10 },
  { id: 'p12', type: 'fixed', name: 'Nescafe Sachet',          cost: 80,   price: 120,  qty: 25, low: 12 },
  { id: 'p13', type: 'fixed', name: 'Bigi Cola 50cl',          cost: 150,  price: 200,  qty: 24, low: 10 },
  { id: 'p14', type: 'fixed', name: 'Fanta 60cl',              cost: 200,  price: 250,  qty: 18, low: 8  },
  { id: 'p15', type: 'fixed', name: 'Sprite 60cl',             cost: 200,  price: 250,  qty: 15, low: 8  },
  { id: 'p16', type: 'fixed', name: 'Eva Water 75cl',          cost: 80,   price: 120,  qty: 36, low: 15 },
  { id: 'p17', type: 'fixed', name: 'Recharge Card ₦100',      cost: 97,   price: 100,  qty: 20, low: 10 },
  { id: 'p18', type: 'fixed', name: 'Recharge Card ₦200',      cost: 195,  price: 200,  qty: 18, low: 10 },
  { id: 'p19', type: 'fixed', name: 'Recharge Card ₦1000',     cost: 970,  price: 1000, qty: 8,  low: 5  },
  { id: 'p20', type: 'fixed', name: 'Gala Sausage Roll',       cost: 150,  price: 200,  qty: 20, low: 10 },
  { id: 'p21', type: 'fixed', name: 'Tom Tom Sweet (pack)',    cost: 200,  price: 300,  qty: 10, low: 5  },
  { id: 'p22', type: 'fixed', name: 'Maggi Cubes (10 pack)',   cost: 180,  price: 250,  qty: 15, low: 7  },
  { id: 'p23', type: 'fixed', name: 'Knorr Cubes (10 pack)',   cost: 180,  price: 250,  qty: 12, low: 7  },
  { id: 'p24', type: 'fixed', name: 'Lipton Tea (25 bags)',    cost: 650,  price: 900,  qty: 8,  low: 4  },
  { id: 'p25', type: 'fixed', name: 'Dettol Soap',             cost: 350,  price: 500,  qty: 10, low: 5  },
  { id: 'p26', type: 'fixed', name: 'Lux Soap',                cost: 280,  price: 400,  qty: 12, low: 5  },
  { id: 'p27', type: 'fixed', name: 'Omo Washing Powder Sm',   cost: 300,  price: 400,  qty: 14, low: 6  },
  { id: 'p28', type: 'fixed', name: 'Morning Fresh Dish Soap', cost: 400,  price: 600,  qty: 8,  low: 4  },
  { id: 'p29', type: 'fixed', name: 'Closeup Toothpaste Sm',   cost: 400,  price: 550,  qty: 9,  low: 4  },
  { id: 'p30', type: 'fixed', name: 'Vaseline Handcream Sm',   cost: 500,  price: 700,  qty: 6,  low: 3  },
  { id: 'p31', type: 'fixed', name: 'Titus Sardine (can)',     cost: 550,  price: 700,  qty: 12, low: 5  },
  { id: 'p32', type: 'fixed', name: 'Cabin Biscuit',           cost: 280,  price: 450,  qty: 15, low: 7  },
  { id: 'p33', type: 'fixed', name: 'Pringles Small',          cost: 800,  price: 1000, qty: 6,  low: 3  },
  { id: 'p34', type: 'fixed', name: 'Honeywell Spaghetti',     cost: 450,  price: 600,  qty: 10, low: 5  },
  { id: 'p35', type: 'fixed', name: 'Golden Penny Semovita 1kg', cost: 1800, price: 2200, qty: 5, low: 3 },
  { id: 'p36', type: 'fixed', name: 'Nasco Cornflakes 500g',   cost: 1500, price: 2000, qty: 4,  low: 2  },
  { id: 'p37', type: 'fixed', name: 'St Louis Sugar 1kg',      cost: 1800, price: 2200, qty: 7,  low: 4  },
  { id: 'p38', type: 'fixed', name: 'Vegetable Oil 1L',        cost: 2200, price: 2800, qty: 5,  low: 3  },
  { id: 'p39', type: 'fixed', name: 'Action Bitters Small',    cost: 350,  price: 500,  qty: 8,  low: 4  },
  { id: 'p40', type: 'fixed', name: 'Candle Pack Small',       cost: 400,  price: 600,  qty: 10, low: 5  },
  { id: 'p41', type: 'fixed', name: 'Golden Morn 500g',        cost: 1400, price: 1800, qty: 6,  low: 3  },
  { id: 'p42', type: 'fixed', name: 'Hollandia Yoghurt Sm',    cost: 280,  price: 400,  qty: 10, low: 5  },
  { id: 'p43', type: 'fixed', name: 'Coca-Cola 60cl',          cost: 200,  price: 250,  qty: 12, low: 8  },
  // Flexible — sold by ₦ amount
  { id: 'p5',  type: 'flexible', name: 'Rice',          invested: 50000 },
  { id: 'p6',  type: 'flexible', name: 'Pepper',        invested: 8000  },
  { id: 'p7',  type: 'flexible', name: 'Garri',         invested: 15000 },
  { id: 'p44', type: 'flexible', name: 'Tomatoes',      invested: 12000 },
  { id: 'p45', type: 'flexible', name: 'Palm Oil',      invested: 25000 },
  { id: 'p46', type: 'flexible', name: 'Groundnut Oil', invested: 20000 },
  { id: 'p47', type: 'flexible', name: 'Crayfish',      invested: 10000 },
  { id: 'p48', type: 'flexible', name: 'Beans',         invested: 18000 },
  { id: 'p49', type: 'flexible', name: 'Onions',        invested: 9000  },
]

// ─── Customers ────────────────────────────────────────────────────────────────
const DEMO_CUSTOMERS = [
  { id: 'c1', name: 'Aunty Blessing',  phone: '0812 222 2222', totalBalance: 3200, transactions: [], payments: [] },
  { id: 'c2', name: 'Chinedu',         phone: '0806 111 1111', totalBalance: 1400, transactions: [], payments: [] },
  { id: 'c3', name: 'Mama Tope',       phone: '0807 333 3333', totalBalance: 4500, transactions: [], payments: [] },
  { id: 'c4', name: 'Mr. Emeka',       phone: '0813 444 4444', totalBalance: 2800, transactions: [], payments: [] },
  { id: 'c5', name: 'Ify',             phone: '0814 555 5555', totalBalance: 900,  transactions: [], payments: [] },
  { id: 'c6', name: 'Baba Kehinde',    phone: '0808 666 6666', totalBalance: 3750, transactions: [], payments: [] },
  { id: 'c7', name: 'Sisi Amara',      phone: '0811 777 7777', totalBalance: 1800, transactions: [], payments: [] },
  { id: 'c8', name: 'Uncle Femi',      phone: '0809 888 8888', totalBalance: 1200, transactions: [], payments: [] },
]

// ─── Transactions ─────────────────────────────────────────────────────────────
// Spread over ~10 days so Today / This Week / All Time all show meaningful data
const DEMO_TRANSACTIONS = [

  // ── TODAY ──
  { id: 'tx1',  time: h(0.5),
    items: [{ type:'fixed', productId:'p1', name:'Indomie Onion', price:350, cost:260, qty:3, subtotal:1050 },
            { type:'fixed', productId:'p2', name:'Peak Milk Sachet', price:150, cost:110, qty:2, subtotal:300 }],
    total:1350, profit:350, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1350, balance:0 },

  { id: 'tx2',  time: h(1),
    items: [{ type:'flexible', productId:'p5', name:'Rice', price:1000, cost:0, qty:1, subtotal:1000 },
            { type:'flexible', productId:'p6', name:'Pepper', price:300, cost:0, qty:1, subtotal:300 }],
    total:1300, profit:0, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:1300, balance:0 },

  { id: 'tx3',  time: h(1.5),
    items: [{ type:'fixed', productId:'p13', name:'Bigi Cola 50cl', price:200, cost:150, qty:2, subtotal:400 },
            { type:'fixed', productId:'p20', name:'Gala Sausage Roll', price:200, cost:150, qty:2, subtotal:400 }],
    total:800, profit:200, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:800, balance:0 },

  { id: 'tx4',  time: h(2),
    items: [{ type:'fixed', productId:'p4', name:'Recharge Card ₦500', price:500, cost:485, qty:2, subtotal:1000 }],
    total:1000, profit:30, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1000, balance:0 },

  { id: 'tx5',  time: h(2.5),
    items: [{ type:'fixed', productId:'p3', name:'Bread Small', price:800, cost:620, qty:1, subtotal:800 },
            { type:'fixed', productId:'p2', name:'Peak Milk Sachet', price:150, cost:110, qty:3, subtotal:450 }],
    total:1250, profit:300, mode:'debt', customerId:'c1', customerName:'Aunty Blessing', customerPhone:'0812 222 2222', amountPaid:0, balance:1250 },

  { id: 'tx6',  time: h(3),
    items: [{ type:'fixed', productId:'p10', name:'Milo Sachet (20g)', price:100, cost:70, qty:5, subtotal:500 },
            { type:'fixed', productId:'p11', name:'Ovaltine Sachet', price:110, cost:75, qty:3, subtotal:330 }],
    total:830, profit:255, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:830, balance:0 },

  { id: 'tx7',  time: h(3.5),
    items: [{ type:'flexible', productId:'p7', name:'Garri', price:1500, cost:0, qty:1, subtotal:1500 }],
    total:1500, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1500, balance:0 },

  { id: 'tx8',  time: h(4),
    items: [{ type:'fixed', productId:'p14', name:'Fanta 60cl', price:250, cost:200, qty:2, subtotal:500 },
            { type:'fixed', productId:'p15', name:'Sprite 60cl', price:250, cost:200, qty:1, subtotal:250 }],
    total:750, profit:150, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:750, balance:0 },

  { id: 'tx9',  time: h(5),
    items: [{ type:'fixed', productId:'p8', name:'Indomie Chicken', price:400, cost:280, qty:4, subtotal:1600 },
            { type:'fixed', productId:'p12', name:'Nescafe Sachet', price:120, cost:80, qty:3, subtotal:360 }],
    total:1960, profit:600, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:1960, balance:0 },

  { id: 'tx10', time: h(6),
    items: [{ type:'fixed', productId:'p18', name:'Recharge Card ₦200', price:200, cost:195, qty:3, subtotal:600 }],
    total:600, profit:15, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:600, balance:0 },

  { id: 'tx11', time: h(7),
    items: [{ type:'fixed', productId:'p37', name:'St Louis Sugar 1kg', price:2200, cost:1800, qty:1, subtotal:2200 },
            { type:'fixed', productId:'p35', name:'Golden Penny Semovita 1kg', price:2200, cost:1800, qty:1, subtotal:2200 }],
    total:4400, profit:800, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:4400, balance:0 },

  { id: 'tx12', time: h(8),
    items: [{ type:'fixed', productId:'p31', name:'Titus Sardine (can)', price:700, cost:550, qty:2, subtotal:1400 },
            { type:'fixed', productId:'p22', name:'Maggi Cubes (10 pack)', price:250, cost:180, qty:2, subtotal:500 }],
    total:1900, profit:440, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1900, balance:0 },

  { id: 'tx13', time: h(9),
    items: [{ type:'fixed', productId:'p16', name:'Eva Water 75cl', price:120, cost:80, qty:6, subtotal:720 }],
    total:720, profit:240, mode:'debt', customerId:'c2', customerName:'Chinedu', customerPhone:'0806 111 1111', amountPaid:0, balance:720 },

  // ── YESTERDAY ──
  { id: 'tx14', time: h(25),
    items: [{ type:'fixed', productId:'p1', name:'Indomie Onion', price:350, cost:260, qty:5, subtotal:1750 },
            { type:'fixed', productId:'p2', name:'Peak Milk Sachet', price:150, cost:110, qty:3, subtotal:450 }],
    total:2200, profit:570, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2200, balance:0 },

  { id: 'tx15', time: h(26),
    items: [{ type:'flexible', productId:'p5', name:'Rice', price:2000, cost:0, qty:1, subtotal:2000 }],
    total:2000, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2000, balance:0 },

  { id: 'tx16', time: h(27),
    items: [{ type:'fixed', productId:'p27', name:'Omo Washing Powder Sm', price:400, cost:300, qty:2, subtotal:800 },
            { type:'fixed', productId:'p25', name:'Dettol Soap', price:500, cost:350, qty:1, subtotal:500 }],
    total:1300, profit:350, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:1300, balance:0 },

  { id: 'tx17', time: h(28),
    items: [{ type:'fixed', productId:'p3', name:'Bread Small', price:800, cost:620, qty:2, subtotal:1600 }],
    total:1600, profit:360, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1600, balance:0 },

  { id: 'tx18', time: h(29),
    items: [{ type:'fixed', productId:'p4', name:'Recharge Card ₦500', price:500, cost:485, qty:3, subtotal:1500 },
            { type:'fixed', productId:'p17', name:'Recharge Card ₦100', price:100, cost:97, qty:5, subtotal:500 }],
    total:2000, profit:60, mode:'debt', customerId:'c3', customerName:'Mama Tope', customerPhone:'0807 333 3333', amountPaid:0, balance:2000 },

  { id: 'tx19', time: h(30),
    items: [{ type:'flexible', productId:'p48', name:'Beans', price:3000, cost:0, qty:1, subtotal:3000 }],
    total:3000, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:3000, balance:0 },

  { id: 'tx20', time: h(31),
    items: [{ type:'fixed', productId:'p20', name:'Gala Sausage Roll', price:200, cost:150, qty:5, subtotal:1000 },
            { type:'fixed', productId:'p13', name:'Bigi Cola 50cl', price:200, cost:150, qty:5, subtotal:1000 }],
    total:2000, profit:500, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2000, balance:0 },

  { id: 'tx21', time: h(32),
    items: [{ type:'fixed', productId:'p9', name:'Indomie Jollof', price:400, cost:280, qty:3, subtotal:1200 },
            { type:'fixed', productId:'p11', name:'Ovaltine Sachet', price:110, cost:75, qty:4, subtotal:440 }],
    total:1640, profit:500, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1640, balance:0 },

  { id: 'tx22', time: h(33),
    items: [{ type:'flexible', productId:'p45', name:'Palm Oil', price:1500, cost:0, qty:1, subtotal:1500 }],
    total:1500, profit:0, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:1500, balance:0 },

  { id: 'tx23', time: h(34),
    items: [{ type:'fixed', productId:'p25', name:'Dettol Soap', price:500, cost:350, qty:2, subtotal:1000 },
            { type:'fixed', productId:'p28', name:'Morning Fresh Dish Soap', price:600, cost:400, qty:1, subtotal:600 }],
    total:1600, profit:500, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1600, balance:0 },

  { id: 'tx24', time: h(35),
    items: [{ type:'flexible', productId:'p44', name:'Tomatoes', price:500, cost:0, qty:1, subtotal:500 },
            { type:'flexible', productId:'p6', name:'Pepper', price:200, cost:0, qty:1, subtotal:200 }],
    total:700, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:700, balance:0 },

  { id: 'tx25', time: h(36),
    items: [{ type:'fixed', productId:'p19', name:'Recharge Card ₦1000', price:1000, cost:970, qty:1, subtotal:1000 },
            { type:'fixed', productId:'p18', name:'Recharge Card ₦200', price:200, cost:195, qty:2, subtotal:400 }],
    total:1400, profit:40, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1400, balance:0 },

  // ── 2 DAYS AGO ──
  { id: 'tx26', time: h(49),
    items: [{ type:'fixed', productId:'p1', name:'Indomie Onion', price:350, cost:260, qty:8, subtotal:2800 }],
    total:2800, profit:720, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2800, balance:0 },

  { id: 'tx27', time: h(50),
    items: [{ type:'flexible', productId:'p5', name:'Rice', price:3000, cost:0, qty:1, subtotal:3000 },
            { type:'flexible', productId:'p7', name:'Garri', price:800, cost:0, qty:1, subtotal:800 }],
    total:3800, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:3800, balance:0 },

  { id: 'tx28', time: h(51),
    items: [{ type:'fixed', productId:'p38', name:'Vegetable Oil 1L', price:2800, cost:2200, qty:1, subtotal:2800 },
            { type:'fixed', productId:'p37', name:'St Louis Sugar 1kg', price:2200, cost:1800, qty:1, subtotal:2200 }],
    total:5000, profit:1000, mode:'debt', customerId:'c4', customerName:'Mr. Emeka', customerPhone:'0813 444 4444', amountPaid:0, balance:5000 },

  { id: 'tx29', time: h(52),
    items: [{ type:'fixed', productId:'p32', name:'Cabin Biscuit', price:450, cost:280, qty:3, subtotal:1350 },
            { type:'fixed', productId:'p21', name:'Tom Tom Sweet (pack)', price:300, cost:200, qty:2, subtotal:600 }],
    total:1950, profit:710, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1950, balance:0 },

  { id: 'tx30', time: h(53),
    items: [{ type:'fixed', productId:'p26', name:'Lux Soap', price:400, cost:280, qty:3, subtotal:1200 },
            { type:'fixed', productId:'p29', name:'Closeup Toothpaste Sm', price:550, cost:400, qty:2, subtotal:1100 }],
    total:2300, profit:660, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2300, balance:0 },

  { id: 'tx31', time: h(54),
    items: [{ type:'fixed', productId:'p14', name:'Fanta 60cl', price:250, cost:200, qty:4, subtotal:1000 },
            { type:'fixed', productId:'p15', name:'Sprite 60cl', price:250, cost:200, qty:3, subtotal:750 }],
    total:1750, profit:350, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:1750, balance:0 },

  { id: 'tx32', time: h(55),
    items: [{ type:'fixed', productId:'p42', name:'Hollandia Yoghurt Sm', price:400, cost:280, qty:3, subtotal:1200 },
            { type:'fixed', productId:'p10', name:'Milo Sachet (20g)', price:100, cost:70, qty:4, subtotal:400 }],
    total:1600, profit:480, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1600, balance:0 },

  { id: 'tx33', time: h(56),
    items: [{ type:'flexible', productId:'p49', name:'Onions', price:700, cost:0, qty:1, subtotal:700 }],
    total:700, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:700, balance:0 },

  { id: 'tx34', time: h(57),
    items: [{ type:'flexible', productId:'p47', name:'Crayfish', price:1000, cost:0, qty:1, subtotal:1000 },
            { type:'flexible', productId:'p45', name:'Palm Oil', price:2000, cost:0, qty:1, subtotal:2000 }],
    total:3000, profit:0, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:3000, balance:0 },

  { id: 'tx35', time: h(58),
    items: [{ type:'fixed', productId:'p33', name:'Pringles Small', price:1000, cost:800, qty:2, subtotal:2000 },
            { type:'fixed', productId:'p20', name:'Gala Sausage Roll', price:200, cost:150, qty:3, subtotal:600 }],
    total:2600, profit:550, mode:'debt', customerId:'c6', customerName:'Baba Kehinde', customerPhone:'0808 666 6666', amountPaid:0, balance:2600 },

  // ── 3 DAYS AGO ──
  { id: 'tx36', time: h(73),
    items: [{ type:'fixed', productId:'p1', name:'Indomie Onion', price:350, cost:260, qty:6, subtotal:2100 },
            { type:'fixed', productId:'p8', name:'Indomie Chicken', price:400, cost:280, qty:3, subtotal:1200 }],
    total:3300, profit:900, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:3300, balance:0 },

  { id: 'tx37', time: h(74),
    items: [{ type:'flexible', productId:'p5', name:'Rice', price:2500, cost:0, qty:1, subtotal:2500 },
            { type:'flexible', productId:'p6', name:'Pepper', price:500, cost:0, qty:1, subtotal:500 }],
    total:3000, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:3000, balance:0 },

  { id: 'tx38', time: h(75),
    items: [{ type:'fixed', productId:'p24', name:'Lipton Tea (25 bags)', price:900, cost:650, qty:2, subtotal:1800 }],
    total:1800, profit:500, mode:'debt', customerId:'c5', customerName:'Ify', customerPhone:'0814 555 5555', amountPaid:0, balance:1800 },

  { id: 'tx39', time: h(76),
    items: [{ type:'fixed', productId:'p36', name:'Nasco Cornflakes 500g', price:2000, cost:1500, qty:1, subtotal:2000 },
            { type:'fixed', productId:'p41', name:'Golden Morn 500g', price:1800, cost:1400, qty:1, subtotal:1800 }],
    total:3800, profit:900, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:3800, balance:0 },

  { id: 'tx40', time: h(77),
    items: [{ type:'fixed', productId:'p16', name:'Eva Water 75cl', price:120, cost:80, qty:12, subtotal:1440 }],
    total:1440, profit:480, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:1440, balance:0 },

  { id: 'tx41', time: h(78),
    items: [{ type:'fixed', productId:'p22', name:'Maggi Cubes (10 pack)', price:250, cost:180, qty:3, subtotal:750 },
            { type:'fixed', productId:'p23', name:'Knorr Cubes (10 pack)', price:250, cost:180, qty:2, subtotal:500 }],
    total:1250, profit:350, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1250, balance:0 },

  { id: 'tx42', time: h(79),
    items: [{ type:'fixed', productId:'p39', name:'Action Bitters Small', price:500, cost:350, qty:4, subtotal:2000 }],
    total:2000, profit:600, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2000, balance:0 },

  { id: 'tx43', time: h(80),
    items: [{ type:'fixed', productId:'p4', name:'Recharge Card ₦500', price:500, cost:485, qty:5, subtotal:2500 }],
    total:2500, profit:75, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2500, balance:0 },

  // ── 4 DAYS AGO ──
  { id: 'tx44', time: h(97),
    items: [{ type:'fixed', productId:'p35', name:'Golden Penny Semovita 1kg', price:2200, cost:1800, qty:2, subtotal:4400 },
            { type:'fixed', productId:'p37', name:'St Louis Sugar 1kg', price:2200, cost:1800, qty:2, subtotal:4400 }],
    total:8800, profit:1600, mode:'debt', customerId:'c3', customerName:'Mama Tope', customerPhone:'0807 333 3333', amountPaid:0, balance:8800 },

  { id: 'tx45', time: h(98),
    items: [{ type:'flexible', productId:'p7', name:'Garri', price:2000, cost:0, qty:1, subtotal:2000 },
            { type:'flexible', productId:'p49', name:'Onions', price:400, cost:0, qty:1, subtotal:400 }],
    total:2400, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2400, balance:0 },

  { id: 'tx46', time: h(99),
    items: [{ type:'fixed', productId:'p1', name:'Indomie Onion', price:350, cost:260, qty:4, subtotal:1400 },
            { type:'fixed', productId:'p2', name:'Peak Milk Sachet', price:150, cost:110, qty:6, subtotal:900 }],
    total:2300, profit:600, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2300, balance:0 },

  { id: 'tx47', time: h(100),
    items: [{ type:'fixed', productId:'p13', name:'Bigi Cola 50cl', price:200, cost:150, qty:8, subtotal:1600 },
            { type:'fixed', productId:'p14', name:'Fanta 60cl', price:250, cost:200, qty:4, subtotal:1000 }],
    total:2600, profit:600, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2600, balance:0 },

  { id: 'tx48', time: h(101),
    items: [{ type:'fixed', productId:'p27', name:'Omo Washing Powder Sm', price:400, cost:300, qty:3, subtotal:1200 },
            { type:'fixed', productId:'p30', name:'Vaseline Handcream Sm', price:700, cost:500, qty:2, subtotal:1400 }],
    total:2600, profit:700, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:2600, balance:0 },

  { id: 'tx49', time: h(102),
    items: [{ type:'flexible', productId:'p47', name:'Crayfish', price:2000, cost:0, qty:1, subtotal:2000 },
            { type:'flexible', productId:'p6', name:'Pepper', price:800, cost:0, qty:1, subtotal:800 }],
    total:2800, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2800, balance:0 },

  { id: 'tx50', time: h(103),
    items: [{ type:'fixed', productId:'p31', name:'Titus Sardine (can)', price:700, cost:550, qty:3, subtotal:2100 },
            { type:'fixed', productId:'p23', name:'Knorr Cubes (10 pack)', price:250, cost:180, qty:4, subtotal:1000 }],
    total:3100, profit:730, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:3100, balance:0 },

  { id: 'tx51', time: h(104),
    items: [{ type:'fixed', productId:'p40', name:'Candle Pack Small', price:600, cost:400, qty:3, subtotal:1800 }],
    total:1800, profit:600, mode:'debt', customerId:'c8', customerName:'Uncle Femi', customerPhone:'0809 888 8888', amountPaid:0, balance:1800 },

  // ── 5 DAYS AGO ──
  { id: 'tx52', time: h(121),
    items: [{ type:'fixed', productId:'p3', name:'Bread Small', price:800, cost:620, qty:3, subtotal:2400 },
            { type:'fixed', productId:'p42', name:'Hollandia Yoghurt Sm', price:400, cost:280, qty:4, subtotal:1600 }],
    total:4000, profit:1020, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:4000, balance:0 },

  { id: 'tx53', time: h(122),
    items: [{ type:'flexible', productId:'p5', name:'Rice', price:4000, cost:0, qty:1, subtotal:4000 }],
    total:4000, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:4000, balance:0 },

  { id: 'tx54', time: h(123),
    items: [{ type:'fixed', productId:'p19', name:'Recharge Card ₦1000', price:1000, cost:970, qty:3, subtotal:3000 }],
    total:3000, profit:90, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:3000, balance:0 },

  { id: 'tx55', time: h(124),
    items: [{ type:'fixed', productId:'p33', name:'Pringles Small', price:1000, cost:800, qty:1, subtotal:1000 },
            { type:'fixed', productId:'p32', name:'Cabin Biscuit', price:450, cost:280, qty:5, subtotal:2250 }],
    total:3250, profit:1050, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:3250, balance:0 },

  { id: 'tx56', time: h(125),
    items: [{ type:'flexible', productId:'p48', name:'Beans', price:2500, cost:0, qty:1, subtotal:2500 },
            { type:'flexible', productId:'p45', name:'Palm Oil', price:3000, cost:0, qty:1, subtotal:3000 }],
    total:5500, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:5500, balance:0 },

  { id: 'tx57', time: h(126),
    items: [{ type:'fixed', productId:'p25', name:'Dettol Soap', price:500, cost:350, qty:3, subtotal:1500 },
            { type:'fixed', productId:'p26', name:'Lux Soap', price:400, cost:280, qty:3, subtotal:1200 }],
    total:2700, profit:810, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2700, balance:0 },

  { id: 'tx58', time: h(127),
    items: [{ type:'fixed', productId:'p1', name:'Indomie Onion', price:350, cost:260, qty:10, subtotal:3500 }],
    total:3500, profit:900, mode:'debt', customerId:'c7', customerName:'Sisi Amara', customerPhone:'0811 777 7777', amountPaid:0, balance:3500 },

  // ── 6 DAYS AGO ──
  { id: 'tx59', time: h(145),
    items: [{ type:'fixed', productId:'p37', name:'St Louis Sugar 1kg', price:2200, cost:1800, qty:3, subtotal:6600 },
            { type:'fixed', productId:'p36', name:'Nasco Cornflakes 500g', price:2000, cost:1500, qty:2, subtotal:4000 }],
    total:10600, profit:2200, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:10600, balance:0 },

  { id: 'tx60', time: h(146),
    items: [{ type:'flexible', productId:'p7', name:'Garri', price:1000, cost:0, qty:1, subtotal:1000 },
            { type:'flexible', productId:'p5', name:'Rice', price:3000, cost:0, qty:1, subtotal:3000 }],
    total:4000, profit:0, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:4000, balance:0 },

  { id: 'tx61', time: h(147),
    items: [{ type:'fixed', productId:'p10', name:'Milo Sachet (20g)', price:100, cost:70, qty:10, subtotal:1000 },
            { type:'fixed', productId:'p11', name:'Ovaltine Sachet', price:110, cost:75, qty:5, subtotal:550 }],
    total:1550, profit:475, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:1550, balance:0 },

  { id: 'tx62', time: h(148),
    items: [{ type:'fixed', productId:'p9', name:'Indomie Jollof', price:400, cost:280, qty:6, subtotal:2400 },
            { type:'fixed', productId:'p12', name:'Nescafe Sachet', price:120, cost:80, qty:5, subtotal:600 }],
    total:3000, profit:920, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:3000, balance:0 },

  { id: 'tx63', time: h(149),
    items: [{ type:'fixed', productId:'p18', name:'Recharge Card ₦200', price:200, cost:195, qty:10, subtotal:2000 }],
    total:2000, profit:50, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:2000, balance:0 },

  { id: 'tx64', time: h(150),
    items: [{ type:'fixed', productId:'p28', name:'Morning Fresh Dish Soap', price:600, cost:400, qty:3, subtotal:1800 },
            { type:'fixed', productId:'p27', name:'Omo Washing Powder Sm', price:400, cost:300, qty:4, subtotal:1600 }],
    total:3400, profit:1000, mode:'debt', customerId:'c6', customerName:'Baba Kehinde', customerPhone:'0808 666 6666', amountPaid:0, balance:3400 },

  { id: 'tx65', time: h(151),
    items: [{ type:'fixed', productId:'p38', name:'Vegetable Oil 1L', price:2800, cost:2200, qty:2, subtotal:5600 }],
    total:5600, profit:1200, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:5600, balance:0 },

  // ── 7-10 DAYS AGO ──
  { id: 'tx66', time: h(193),
    items: [{ type:'flexible', productId:'p5', name:'Rice', price:5000, cost:0, qty:1, subtotal:5000 }],
    total:5000, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:5000, balance:0 },

  { id: 'tx67', time: h(194),
    items: [{ type:'fixed', productId:'p1', name:'Indomie Onion', price:350, cost:260, qty:12, subtotal:4200 },
            { type:'fixed', productId:'p2', name:'Peak Milk Sachet', price:150, cost:110, qty:8, subtotal:1200 }],
    total:5400, profit:1400, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:5400, balance:0 },

  { id: 'tx68', time: h(195),
    items: [{ type:'flexible', productId:'p45', name:'Palm Oil', price:4000, cost:0, qty:1, subtotal:4000 },
            { type:'flexible', productId:'p47', name:'Crayfish', price:1500, cost:0, qty:1, subtotal:1500 }],
    total:5500, profit:0, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:5500, balance:0 },

  { id: 'tx69', time: h(196),
    items: [{ type:'fixed', productId:'p3', name:'Bread Small', price:800, cost:620, qty:5, subtotal:4000 }],
    total:4000, profit:900, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:4000, balance:0 },

  { id: 'tx70', time: h(197),
    items: [{ type:'fixed', productId:'p39', name:'Action Bitters Small', price:500, cost:350, qty:6, subtotal:3000 },
            { type:'fixed', productId:'p21', name:'Tom Tom Sweet (pack)', price:300, cost:200, qty:4, subtotal:1200 }],
    total:4200, profit:1300, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:4200, balance:0 },

  { id: 'tx71', time: h(198),
    items: [{ type:'flexible', productId:'p48', name:'Beans', price:3500, cost:0, qty:1, subtotal:3500 },
            { type:'flexible', productId:'p44', name:'Tomatoes', price:1000, cost:0, qty:1, subtotal:1000 }],
    total:4500, profit:0, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:4500, balance:0 },

  { id: 'tx72', time: h(200),
    items: [{ type:'fixed', productId:'p35', name:'Golden Penny Semovita 1kg', price:2200, cost:1800, qty:3, subtotal:6600 },
            { type:'fixed', productId:'p41', name:'Golden Morn 500g', price:1800, cost:1400, qty:2, subtotal:3600 }],
    total:10200, profit:2000, mode:'debt', customerId:'c1', customerName:'Aunty Blessing', customerPhone:'0812 222 2222', amountPaid:0, balance:10200 },

  { id: 'tx73', time: h(217),
    items: [{ type:'fixed', productId:'p34', name:'Honeywell Spaghetti', price:600, cost:450, qty:6, subtotal:3600 },
            { type:'fixed', productId:'p31', name:'Titus Sardine (can)', price:700, cost:550, qty:4, subtotal:2800 }],
    total:6400, profit:1500, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:6400, balance:0 },

  { id: 'tx74', time: h(220),
    items: [{ type:'flexible', productId:'p46', name:'Groundnut Oil', price:3000, cost:0, qty:1, subtotal:3000 },
            { type:'flexible', productId:'p44', name:'Tomatoes', price:800, cost:0, qty:1, subtotal:800 }],
    total:3800, profit:0, mode:'transfer', customerId:null, customerName:'', customerPhone:'', amountPaid:3800, balance:0 },

  { id: 'tx75', time: h(225),
    items: [{ type:'fixed', productId:'p43', name:'Coca-Cola 60cl', price:250, cost:200, qty:8, subtotal:2000 },
            { type:'fixed', productId:'p14', name:'Fanta 60cl', price:250, cost:200, qty:6, subtotal:1500 },
            { type:'fixed', productId:'p15', name:'Sprite 60cl', price:250, cost:200, qty:4, subtotal:1000 }],
    total:4500, profit:900, mode:'cash', customerId:null, customerName:'', customerPhone:'', amountPaid:4500, balance:0 },
]

const demoState = {
  setupDone: true,
  language: 'pidgin',
  view: 'home',
  shop: { name: 'Mama Ngozi Store', owner: 'Ngozi', phone: '0803 000 0000' },
  products: DEMO_PRODUCTS,
  transactions: DEMO_TRANSACTIONS,
  customers: DEMO_CUSTOMERS,
  cart: [],
  inventoryPin: null,
  inventoryOtp: null,
  darkMode: false,
  highContrast: false,
  pinnedProducts: [],
}

function loadState(profileId) {
  try {
    // One-time migration: move old single-key data into the 'main' profile
    if (!localStorage.getItem(profileKey('main')) && !localStorage.getItem(ACTIVE_KEY)) {
      const old = localStorage.getItem('ulahia-state-v1')
      if (old) localStorage.setItem(profileKey('main'), old)
    }

    const raw = localStorage.getItem(profileKey(profileId))
    if (!raw) throw new Error('empty')
    const saved = JSON.parse(raw)
    if (saved && Array.isArray(saved.products)) {
      if (!saved.transactions) {
        saved.transactions = (saved.sales || []).map(s => ({
          id: s.id,
          time: s.time,
          items: [{
            type: 'fixed',
            productId: s.productId,
            name: s.name,
            price: s.qty > 0 ? Math.round(s.total / s.qty) : s.total,
            cost: s.qty > 0 ? Math.round((s.total - s.profit) / s.qty) : 0,
            qty: s.qty,
            subtotal: s.total,
          }],
          total: s.total,
          profit: s.profit,
          mode: 'cash',
          customerId: null,
          customerName: '',
          customerPhone: '',
          amountPaid: s.total,
          balance: 0,
        }))
      }
      if (!saved.customers) {
        saved.customers = (saved.debts || [])
          .filter(d => !d.paid)
          .map(d => ({
            id: d.id,
            name: d.name,
            phone: d.phone || '',
            totalBalance: d.amount,
            transactions: [],
            payments: [],
          }))
      }
      if (!saved.cart) saved.cart = []
      if (saved.inventoryPin === undefined) saved.inventoryPin = null
      if (saved.inventoryOtp === undefined) saved.inventoryOtp = null
      saved.cart = saved.cart.map(i =>
        i.cartItemId ? i : { ...i, cartItemId: i.productId || crypto.randomUUID() }
      )
      if (saved.setupDone === undefined) saved.setupDone = true
      if (saved.darkMode === undefined) saved.darkMode = false
      if (saved.highContrast === undefined) saved.highContrast = false
      if (!saved.pinnedProducts) saved.pinnedProducts = []
      saved.products = saved.products.map(p => p.type ? p : { ...p, type: 'fixed' })
      saved.transactions = saved.transactions.map(t => ({
        ...t,
        items: t.items.map(i => i.type ? i : { ...i, type: 'fixed' }),
      }))
      return saved
    }
  } catch { /* ignore */ }
  return profileId === 'demo' ? structuredClone(demoState) : structuredClone(starterState)
}

function reducer(state, action) {
  switch (action.type) {

    case 'COMPLETE_SETUP':
      return { ...state, setupDone: true, shop: action.payload, view: 'home' }

    case 'UPDATE_SHOP':
      return { ...state, shop: { ...state.shop, ...action.payload } }

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload }

    case 'SET_VIEW':
      return { ...state, view: action.payload }

    case 'ADD_TO_CART': {
      const product = state.products.find(p => p.id === action.payload)
      if (!product || product.type === 'flexible') return state
      const existing = state.cart.find(i => i.productId === product.id)
      const currentQty = existing?.qty || 0
      if (currentQty >= product.qty) return state
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          { cartItemId: product.id, type: 'fixed', productId: product.id, name: product.name, price: product.price, cost: product.cost, qty: 1, subtotal: product.price },
        ],
      }
    }

    case 'ADD_FLEXIBLE_TO_CART': {
      const { productId, name, amount } = action.payload
      const amt = Number(amount)
      if (!amt || amt <= 0) return state
      return {
        ...state,
        cart: [
          ...state.cart,
          { cartItemId: crypto.randomUUID(), type: 'flexible', productId, name, price: amt, cost: 0, qty: 1, subtotal: amt },
        ],
      }
    }

    case 'UPDATE_CART_QTY': {
      const { cartItemId, qty } = action.payload
      if (qty <= 0) {
        return { ...state, cart: state.cart.filter(i => i.cartItemId !== cartItemId) }
      }
      const item = state.cart.find(i => i.cartItemId === cartItemId)
      const product = item ? state.products.find(p => p.id === item.productId) : null
      const maxQty = !product || product.type === 'flexible' ? Infinity : product.qty
      return {
        ...state,
        cart: state.cart.map(i =>
          i.cartItemId === cartItemId ? { ...i, qty: Math.min(qty, maxQty) } : i
        ),
      }
    }

    case 'CLEAR_CART':
      return { ...state, cart: [] }

    case 'COMPLETE_TRANSACTION': {
      const { items, total, profit, mode, customer, amountPaid, balance } = action.payload

      const products = state.products.map(p => {
        if (p.type === 'flexible') return p
        const totalQty = items
          .filter(i => i.productId === p.id && i.type === 'fixed')
          .reduce((sum, i) => sum + i.qty, 0)
        if (!totalQty) return p
        return { ...p, qty: Math.max(0, p.qty - totalQty) }
      })

      const transaction = {
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        items,
        total,
        profit,
        mode,
        customerId: customer?.id || null,
        customerName: customer?.name || '',
        customerPhone: customer?.phone || '',
        amountPaid,
        balance,
      }

      let customers = state.customers
      if (mode === 'debt' && customer?.name && balance > 0) {
        const existingIdx = customer.id
          ? customers.findIndex(c => c.id === customer.id)
          : -1

        if (existingIdx >= 0) {
          customers = customers.map((c, i) =>
            i === existingIdx
              ? { ...c, totalBalance: c.totalBalance + balance, transactions: [transaction.id, ...c.transactions] }
              : c
          )
        } else {
          customers = [
            {
              id: crypto.randomUUID(),
              name: customer.name,
              phone: customer.phone || '',
              totalBalance: balance,
              transactions: [transaction.id],
              payments: [],
            },
            ...customers,
          ]
        }
      }

      return { ...state, products, transactions: [transaction, ...state.transactions], customers, cart: [] }
    }

    case 'ADD_PAYMENT': {
      const { customerId, amount, note } = action.payload
      const payment = {
        id: crypto.randomUUID(),
        amount: Number(amount),
        time: new Date().toISOString(),
        note: note || '',
      }
      return {
        ...state,
        customers: state.customers.map(c =>
          c.id === customerId
            ? { ...c, totalBalance: Math.max(0, c.totalBalance - Number(amount)), payments: [payment, ...c.payments] }
            : c
        ),
      }
    }

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [{ id: crypto.randomUUID(), ...action.payload }, ...state.products],
      }

    case 'RESTOCK_PRODUCT': {
      const { productId, qty, amount } = action.payload
      return {
        ...state,
        products: state.products.map(p => {
          if (p.id !== productId) return p
          if (p.type === 'flexible') return { ...p, invested: p.invested + Number(amount || 0) }
          return { ...p, qty: p.qty + Number(qty || 0) }
        }),
      }
    }

    case 'BULK_RESTOCK':
      return {
        ...state,
        products: state.products.map(p => {
          const u = action.payload.find(u => u.productId === p.id)
          if (!u) return p
          if (p.type === 'flexible' && Number(u.amount) > 0) return { ...p, invested: p.invested + Number(u.amount) }
          if (p.type !== 'flexible' && Number(u.qty) > 0) return { ...p, qty: p.qty + Number(u.qty) }
          return p
        }),
      }

    case 'SET_BARCODE':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.productId ? { ...p, barcode: action.payload.barcode } : p
        ),
      }

    case 'EDIT_PRODUCT': {
      const { id, ...updates } = action.payload
      return {
        ...state,
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
      }
    }

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      }

    case 'IMPORT_STATE': {
      const imported = action.payload
      if (!imported || !Array.isArray(imported.products)) return state
      return { ...starterState, ...imported, view: 'home', cart: [] }
    }

    case 'RESET_DEMO':
      return structuredClone(demoState)

    case 'LOAD_PROFILE':
      return action.payload

    case 'SET_INVENTORY_PIN':
      return { ...state, inventoryPin: action.payload }

    case 'SET_INVENTORY_OTP':
      return { ...state, inventoryOtp: action.payload }

    case 'CLEAR_INVENTORY_OTP':
      return { ...state, inventoryOtp: null }

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode }

    case 'TOGGLE_HIGH_CONTRAST':
      return { ...state, highContrast: !state.highContrast }

    case 'TOGGLE_PIN_PRODUCT': {
      const id = action.payload
      const pinned = state.pinnedProducts || []
      return {
        ...state,
        pinnedProducts: pinned.includes(id) ? pinned.filter(p => p !== id) : [...pinned, id],
      }
    }

    case 'RESTORE_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] }

    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [activeProfile, setActiveProfile] = useState(
    () => localStorage.getItem(ACTIVE_KEY) || 'main'
  )
  const [state, dispatch] = useReducer(reducer, null, () => loadState(activeProfile))

  useEffect(() => {
    localStorage.setItem(profileKey(activeProfile), JSON.stringify(state))
  }, [state, activeProfile])

  // Cloud sync: debounced push on every main-profile state change
  useEffect(() => {
    if (activeProfile !== 'main' || !state.setupDone) return
    const meta = getOrCreateCloudMeta()
    const timer = setTimeout(() => {
      pushState(meta.profileId, meta.recoveryCode, state)
    }, 2000)
    return () => clearTimeout(timer)
  }, [state, activeProfile])

  function switchProfile(targetId) {
    if (targetId === activeProfile) return
    // Save current profile synchronously before switching
    localStorage.setItem(profileKey(activeProfile), JSON.stringify(state))
    localStorage.setItem(ACTIVE_KEY, targetId)
    setActiveProfile(targetId)
    dispatch({ type: 'LOAD_PROFILE', payload: loadState(targetId) })
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, activeProfile, switchProfile }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}
