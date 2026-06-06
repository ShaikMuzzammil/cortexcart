import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const PRODUCTS = [
  // ── Tech ──────────────────────────────────────────────
  { name:'Ion 30K Titan Charger',    brand:'Ion',     category:'Tech',       price:129, originalPrice:159, stock:42, rating:4.8, reviewCount:312, description:'Ultra-fast 140W GaN charger, 30K mAh bank, dual USB-C.',       images:['https://images.unsplash.com/photo-1609592424858-7de65a53f4f1?w=600'], tags:['charger','portable','fast'], isFeatured:true, isDeal:true },
  { name:'NovaPods X Ultra',         brand:'Nova',    category:'Tech',       price:199, originalPrice:249, stock:18, rating:4.9, reviewCount:891, description:'Hybrid ANC + transparency, 36h total battery, IPX5.',          images:['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'], tags:['earbuds','anc','wireless'],  isFeatured:true, isDeal:false },
  { name:'PixelWatch Pro S',         brand:'Pixel',   category:'Tech',       price:349, originalPrice:399, stock:9,  rating:4.7, reviewCount:204, description:'Always-on AMOLED, GPS, blood-oxygen, 7-day battery.',          images:['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'], tags:['watch','smart','fitness'],  isFeatured:true, isDeal:true },
  { name:'StellarBuds Neo',          brand:'Stellar', category:'Tech',       price:89,  originalPrice:119, stock:55, rating:4.5, reviewCount:143, description:'Open-ear spatial audio, 28h playtime, bone conduction.',        images:['https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600'], tags:['earbuds','openear'],       isFeatured:false,isDeal:true },
  { name:'ArcMouse Ergo Pro',        brand:'Arc',     category:'Tech',       price:79,  originalPrice:99,  stock:30, rating:4.6, reviewCount:88,  description:'Vertical ergonomic mouse, silent clicks, rechargeable.',       images:['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600'], tags:['mouse','ergonomic'],       isFeatured:false,isDeal:false },
  { name:'ZenHub 12-Port Dock',      brand:'Zen',     category:'Tech',       price:149, originalPrice:179, stock:22, rating:4.7, reviewCount:67,  description:'12-in-1 dock: HDMI 4K, 100W PD, SD, Ethernet.',              images:['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600'], tags:['dock','usbc','hub'],       isFeatured:false,isDeal:false },
  { name:'LunaKey RGB 75%',          brand:'Luna',    category:'Tech',       price:169, originalPrice:199, stock:14, rating:4.8, reviewCount:229, description:'Hot-swap switches, per-key RGB, gasket mount, 75% layout.',    images:['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600'], tags:['keyboard','mechanical','rgb'], isFeatured:true,isDeal:false },
  { name:'ClearCam 4K Webcam',       brand:'Clear',   category:'Tech',       price:119, originalPrice:149, stock:37, rating:4.5, reviewCount:156, description:'4K/60fps, built-in ring light, AI auto-framing.',             images:['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600'], tags:['webcam','4k','streaming'],  isFeatured:false,isDeal:true },
  // ── Home ──────────────────────────────────────────────
  { name:'AuraLight Smart Lamp',     brand:'Aura',    category:'Home',       price:59,  originalPrice:79,  stock:60, rating:4.6, reviewCount:401, description:'16M colors, voice + app control, 3000 lumen output.',         images:['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'], tags:['smart','lighting'],        isFeatured:true, isDeal:true },
  { name:'BreezeQ Air Purifier',     brand:'Breeze',  category:'Home',       price:229, originalPrice:279, stock:11, rating:4.8, reviewCount:117, description:'HEPA H13 + UV-C, 800 sqft coverage, whisper-quiet.',          images:['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], tags:['purifier','hepa','air'],    isFeatured:true, isDeal:false },
  { name:'NestPad Wireless Charger', brand:'Nest',    category:'Home',       price:49,  originalPrice:65,  stock:80, rating:4.5, reviewCount:88,  description:'15W Qi2, simultaneous phone + watch + pods charging.',       images:['https://images.unsplash.com/photo-1586495777744-4e6232bf2fb7?w=600'], tags:['wireless','charger'],      isFeatured:false,isDeal:false },
  { name:'ChillZone Desk Fan',       brand:'Chill',   category:'Home',       price:45,  originalPrice:59,  stock:48, rating:4.4, reviewCount:63,  description:'Tower-style USB-C desk fan, 6 speeds, 180° oscillation.',     images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], tags:['fan','desk','cooling'],    isFeatured:false,isDeal:true },
  // ── Fashion ────────────────────────────────────────────
  { name:'VoltCarry Sling Bag',      brand:'Volt',    category:'Fashion',    price:89,  originalPrice:120, stock:25, rating:4.7, reviewCount:192, description:'Laser-cut ballistic nylon, hidden anti-theft pocket, USB-A pass-through.', images:['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], tags:['bag','travel','tech'],   isFeatured:true, isDeal:false },
  { name:'AlphaShell Rain Jacket',   brand:'Alpha',   category:'Fashion',    price:179, originalPrice:229, stock:15, rating:4.8, reviewCount:241, description:'3-layer Gore-Tex, pit-zips, inner hood, packable.',           images:['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'], tags:['jacket','waterproof'],     isFeatured:true, isDeal:true },
  { name:'FlowThread Joggers',       brand:'Flow',    category:'Fashion',    price:65,  originalPrice:85,  stock:40, rating:4.6, reviewCount:377, description:'4-way stretch fabric, tapered fit, zip pockets.',             images:['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600'], tags:['joggers','activewear'],    isFeatured:false,isDeal:false },
  { name:'UrbanRun Sneakers',        brand:'Urban',   category:'Fashion',    price:129, originalPrice:159, stock:22, rating:4.7, reviewCount:509, description:'Responsive foam, knit upper, recycled materials.',            images:['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], tags:['shoes','running'],         isFeatured:true, isDeal:true },
  { name:'CityTote Canvas Bag',      brand:'City',    category:'Fashion',    price:39,  originalPrice:55,  stock:70, rating:4.4, reviewCount:134, description:'Heavy-duty canvas, inner laptop sleeve, magnetic snap.',      images:['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600'], tags:['tote','bag','minimal'],    isFeatured:false,isDeal:false },
  { name:'ApexCap Performance Hat',  brand:'Apex',    category:'Fashion',    price:34,  originalPrice:45,  stock:55, rating:4.5, reviewCount:88,  description:'Moisture-wicking band, UPF 50+, one-size flex fit.',          images:['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600'], tags:['cap','hat','sport'],       isFeatured:false,isDeal:false },
  // ── Beauty ──────────────────────────────────────────────
  { name:'GlowKit Serum Pro',        brand:'Glow',    category:'Beauty',     price:79,  originalPrice:99,  stock:33, rating:4.8, reviewCount:622, description:'Vitamin C + Niacinamide serum, 30ml, clinical-grade.',        images:['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600'], tags:['serum','skincare','vitamin-c'],isFeatured:true,isDeal:true },
  { name:'ZenLift Face Roller',      brand:'Zen',     category:'Beauty',     price:29,  originalPrice:40,  stock:90, rating:4.4, reviewCount:281, description:'Dual rose quartz roller, stainless handle, improves circulation.', images:['https://images.unsplash.com/photo-1619451050621-83cb7aada2d7?w=600'], tags:['skincare','face'],        isFeatured:false,isDeal:false },
  { name:'PureRinse Scalp Scrub',    brand:'Pure',    category:'Beauty',     price:22,  originalPrice:30,  stock:120,rating:4.5, reviewCount:183, description:'Exfoliating AHA + coffee scrub, balances scalp pH.',          images:['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600'], tags:['haircare','scrub'],       isFeatured:false,isDeal:false },
  { name:'LuxeBalm SPF 50 Stick',   brand:'Luxe',    category:'Beauty',     price:18,  originalPrice:25,  stock:200,rating:4.6, reviewCount:97,  description:'Tinted mineral SPF 50 lip balm, 8hr wear, reef-safe.',        images:['https://images.unsplash.com/photo-1631730486572-226d1f595058?w=600'], tags:['lip','spf','mineral'],     isFeatured:false,isDeal:true },
  // ── Sports ──────────────────────────────────────────────
  { name:'CoreForce Resistance Set', brand:'Core',    category:'Sports',     price:49,  originalPrice:65,  stock:60, rating:4.7, reviewCount:548, description:'5-band set 10–50 lb, fabric-coated, carry bag included.',     images:['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600'], tags:['resistance','bands','gym'],isFeatured:true, isDeal:false },
  { name:'HydroFuel 40oz Bottle',    brand:'Hydro',   category:'Sports',     price:35,  originalPrice:45,  stock:110,rating:4.8, reviewCount:904, description:'Triple-wall insulation, 24h cold, leak-proof cap.',           images:['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'], tags:['bottle','hydration'],      isFeatured:false,isDeal:false },
  { name:'StrideX Pro Running Belt', brand:'Stride',  category:'Sports',     price:28,  originalPrice:38,  stock:75, rating:4.5, reviewCount:167, description:'Bounce-free waist belt, fits up to iPhone 15 Plus, reflective.', images:['https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600'], tags:['running','belt','sport'],  isFeatured:false,isDeal:false },
  { name:'GripPro Lifting Gloves',   brand:'Grip',    category:'Sports',     price:24,  originalPrice:35,  stock:95, rating:4.4, reviewCount:212, description:'Full-palm padding, wrist wrap, breathable mesh back.',        images:['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'], tags:['gloves','lifting','gym'],  isFeatured:false,isDeal:true },
  { name:'ZenYoga Non-Slip Mat',     brand:'Zen',     category:'Sports',     price:55,  originalPrice:70,  stock:40, rating:4.7, reviewCount:326, description:'6mm TPE foam, alignment lines, microfibre top, eco-cert.',   images:['https://images.unsplash.com/photo-1601925228133-9d9eddb97a75?w=600'], tags:['yoga','mat','exercise'],   isFeatured:true, isDeal:false },
  { name:'CycleTrack GPS Computer',  brand:'Cycle',   category:'Sports',     price:219, originalPrice:269, stock:12, rating:4.8, reviewCount:78,  description:'ANT+/BLE, mapping, climb segments, 20h battery.',            images:['https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600'], tags:['cycling','gps','sport'],   isFeatured:true, isDeal:true },
  // ── Food & Drink ─────────────────────────────────────────
  { name:'BrewMaster Pour Kit',      brand:'Brew',    category:'Food',       price:75,  originalPrice:95,  stock:28, rating:4.9, reviewCount:441, description:'Gooseneck kettle + scale + V60 in one gift box.',             images:['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'], tags:['coffee','brew','kitchen'], isFeatured:true, isDeal:false },
  { name:'SpiceVault 20-Jar Set',    brand:'Spice',   category:'Food',       price:59,  originalPrice:79,  stock:45, rating:4.7, reviewCount:186, description:'20 magnetic glass spice jars with label set, minimalist.',    images:['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600'], tags:['kitchen','spice','storage'],isFeatured:false,isDeal:false },
  { name:'ColdPress Pro Juicer',     brand:'Cold',    category:'Food',       price:189, originalPrice:239, stock:9,  rating:4.7, reviewCount:93,  description:'Slow-masticating 80 RPM, 1.5L yield/batch, 10yr motor warranty.', images:['https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600'], tags:['juicer','kitchen','health'],isFeatured:true,isDeal:true },
  { name:'GrainKing Rice Cooker',    brand:'Grain',   category:'Food',       price:99,  originalPrice:129, stock:20, rating:4.6, reviewCount:254, description:'Fuzzy-logic, 10-cup, multi-cook: rice, quinoa, porridge.',    images:['https://images.unsplash.com/photo-1585671542778-80a4592a8262?w=600'], tags:['rice','cooker','kitchen'],  isFeatured:false,isDeal:false },
  // ── Gaming ────────────────────────────────────────────────
  { name:'VortexPad Ultra Controller',brand:'Vortex',category:'Gaming',      price:79,  originalPrice:99,  stock:33, rating:4.8, reviewCount:712, description:'Hall-effect sticks, RGB, 40h wireless, PC + Switch.',        images:['https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600'], tags:['controller','gaming','wireless'],isFeatured:true,isDeal:true },
  { name:'EchoRGB Mouse Pad XL',     brand:'Echo',    category:'Gaming',     price:39,  originalPrice:55,  stock:60, rating:4.7, reviewCount:388, description:'900×400mm, 3mm stitched edge, ARGB lighting, non-slip base.',  images:['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600'], tags:['mousepad','rgb','gaming'],  isFeatured:false,isDeal:false },
  { name:'QuantumHeadset 7.1',       brand:'Quantum', category:'Gaming',     price:139, originalPrice:179, stock:18, rating:4.6, reviewCount:265, description:'Virtual 7.1 surround, 50mm drivers, noise-cancelling mic.',   images:['https://images.unsplash.com/photo-1583394293214-0e4f0ccdcd5b?w=600'], tags:['headset','gaming','7.1'],   isFeatured:true, isDeal:false },
  { name:'NeonClick Gaming Mouse',   brand:'Neon',    category:'Gaming',     price:59,  originalPrice:79,  stock:45, rating:4.7, reviewCount:433, description:'26K DPI, 95g ultra-light, 8 programmable buttons.',          images:['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600'], tags:['mouse','gaming','rgb'],     isFeatured:false,isDeal:true },
]

async function main() {
  console.log('🌱 Seeding CortexCart database…')

  // Admin user
  const adminPass = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where:  { email: 'admin@cortexcart.com' },
    update: {},
    create: { email: 'admin@cortexcart.com', name: 'Admin', password: adminPass, role: 'ADMIN', emailVerified: new Date() },
  })

  // Demo user
  const demoPass = await bcrypt.hash('demo1234', 12)
  await prisma.user.upsert({
    where:  { email: 'demo@cortexcart.com' },
    update: {},
    create: { email: 'demo@cortexcart.com', name: 'Demo User', password: demoPass, role: 'CUSTOMER', emailVerified: new Date() },
  })

  // Upsert products
  for (const p of PRODUCTS) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    await prisma.product.upsert({
      where:  { slug },
      update: { price: p.price, stock: p.stock },
      create: {
        name: p.name, slug, brand: p.brand, category: p.category,
        price: p.price, originalPrice: p.originalPrice,
        stock: p.stock, rating: p.rating, reviewCount: p.reviewCount,
        description: p.description, images: p.images, tags: p.tags,
        isFeatured: p.isFeatured, isDeal: p.isDeal, isActive: true,
      },
    })
  }

  console.log(`✅ Seeded ${PRODUCTS.length} products, 2 users`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
