import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Tech',    slug: 'tech',    description: 'Gadgets, devices and electronics' },
  { name: 'Home',    slug: 'home',    description: 'Smart home and living essentials' },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes and accessories' },
  { name: 'Beauty',  slug: 'beauty',  description: 'Skincare, haircare and wellness' },
  { name: 'Sports',  slug: 'sports',  description: 'Fitness gear and outdoor equipment' },
  { name: 'Food',    slug: 'food',    description: 'Kitchen tools and food products' },
  { name: 'Gaming',  slug: 'gaming',  description: 'Gaming peripherals and accessories' },
]

// ── Products ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // Tech
  { name:'Ion 30K Titan Charger',      sku:'ION-30K-001', cat:'tech',    base:129, compare:159, stock:42, rating:4.8, rCount:312, featured:true,  deal:true,  desc:'Ultra-fast 140W GaN charger, 30K mAh bank, dual USB-C PD ports.',          images:['https://images.unsplash.com/photo-1609592424858-7de65a53f4f1?w=600'], tags:['charger','portable','fast-charge'] },
  { name:'NovaPods X Ultra',           sku:'NOV-POD-002', cat:'tech',    base:199, compare:249, stock:18, rating:4.9, rCount:891, featured:true,  deal:false, desc:'Hybrid ANC + transparency mode, 36h total battery, IPX5 waterproof.',      images:['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'], tags:['earbuds','anc','wireless'] },
  { name:'PixelWatch Pro S',           sku:'PIX-WCH-003', cat:'tech',    base:349, compare:399, stock:9,  rating:4.7, rCount:204, featured:true,  deal:true,  desc:'Always-on AMOLED, GPS, blood-oxygen sensor, 7-day battery life.',          images:['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'], tags:['smartwatch','gps','fitness'] },
  { name:'StellarBuds Neo',            sku:'STL-BUD-004', cat:'tech',    base:89,  compare:119, stock:55, rating:4.5, rCount:143, featured:false, deal:true,  desc:'Open-ear spatial audio, 28h playtime, bone conduction technology.',        images:['https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600'], tags:['earbuds','open-ear','bone-conduction'] },
  { name:'ArcMouse Ergo Pro',          sku:'ARC-MSE-005', cat:'tech',    base:79,  compare:99,  stock:30, rating:4.6, rCount:88,  featured:false, deal:false, desc:'Vertical ergonomic design, silent clicks, rechargeable via USB-C.',        images:['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600'], tags:['mouse','ergonomic','silent'] },
  { name:'ZenHub 12-Port Dock',        sku:'ZEN-DOC-006', cat:'tech',    base:149, compare:179, stock:22, rating:4.7, rCount:67,  featured:false, deal:false, desc:'12-in-1 USB-C hub: dual HDMI 4K, 100W PD, SD card, Gigabit Ethernet.',   images:['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600'], tags:['dock','usb-c','hub','4k'] },
  { name:'LunaKey RGB 75%',            sku:'LUN-KBD-007', cat:'tech',    base:169, compare:199, stock:14, rating:4.8, rCount:229, featured:true,  deal:false, desc:'Hot-swap switches, per-key RGB, gasket mount, compact 75% layout.',        images:['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600'], tags:['keyboard','mechanical','rgb','75-percent'] },
  { name:'ClearCam 4K Webcam',         sku:'CLR-CAM-008', cat:'tech',    base:119, compare:149, stock:37, rating:4.5, rCount:156, featured:false, deal:true,  desc:'4K 60fps, built-in LED ring light, AI auto-framing and noise cancel.',    images:['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600'], tags:['webcam','4k','streaming','ring-light'] },
  // Home
  { name:'AuraLight Smart Lamp',       sku:'AUR-LMP-009', cat:'home',    base:59,  compare:79,  stock:60, rating:4.6, rCount:401, featured:true,  deal:true,  desc:'16M colors, voice + app control, scenes, 3000 lumen max output.',          images:['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'], tags:['smart-home','lighting','voice-control'] },
  { name:'BreezeQ Air Purifier',       sku:'BRZ-APR-010', cat:'home',    base:229, compare:279, stock:11, rating:4.8, rCount:117, featured:true,  deal:false, desc:'HEPA H13 + UV-C, covers 800 sq ft, whisper-quiet 25dB, auto-mode.',       images:['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], tags:['air-purifier','hepa','quiet'] },
  { name:'NestPad Wireless Charger',   sku:'NST-CHR-011', cat:'home',    base:49,  compare:65,  stock:80, rating:4.5, rCount:88,  featured:false, deal:false, desc:'15W Qi2, 3-in-1 simultaneous phone + watch + earbuds charging pad.',      images:['https://images.unsplash.com/photo-1586495777744-4e6232bf2fb7?w=600'], tags:['wireless-charger','qi2','desk'] },
  { name:'ChillZone Tower Fan',        sku:'CHL-FAN-012', cat:'home',    base:45,  compare:59,  stock:48, rating:4.4, rCount:63,  featured:false, deal:true,  desc:'USB-C powered tower fan, 6 speeds, 180-degree oscillation, whisper mode.',images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], tags:['fan','desk','cooling','quiet'] },
  // Fashion
  { name:'VoltCarry Sling Bag',        sku:'VLT-SLG-013', cat:'fashion', base:89,  compare:120, stock:25, rating:4.7, rCount:192, featured:true,  deal:false, desc:'Ballistic nylon, hidden anti-theft pocket, USB-A external pass-through.',  images:['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], tags:['bag','travel','sling','anti-theft'] },
  { name:'AlphaShell Rain Jacket',     sku:'ALP-JKT-014', cat:'fashion', base:179, compare:229, stock:15, rating:4.8, rCount:241, featured:true,  deal:true,  desc:'3-layer Gore-Tex, underarm vents, removable hood, packable design.',      images:['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'], tags:['jacket','waterproof','gore-tex','packable'] },
  { name:'FlowThread Joggers',         sku:'FLW-JGR-015', cat:'fashion', base:65,  compare:85,  stock:40, rating:4.6, rCount:377, featured:false, deal:false, desc:'4-way stretch, tapered fit, deep zip pockets, moisture-wicking.',          images:['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600'], tags:['joggers','activewear','stretch'] },
  { name:'UrbanRun Sneakers',          sku:'URB-SNK-016', cat:'fashion', base:129, compare:159, stock:22, rating:4.7, rCount:509, featured:true,  deal:true,  desc:'Responsive foam midsole, recycled knit upper, wide toe box, reflective.',  images:['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], tags:['shoes','running','recycled','responsive'] },
  { name:'CityTote Canvas Bag',        sku:'CTY-TOT-017', cat:'fashion', base:39,  compare:55,  stock:70, rating:4.4, rCount:134, featured:false, deal:false, desc:'Heavy-duty 16oz canvas, inner laptop sleeve up to 15in, magnetic snap.',  images:['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600'], tags:['tote','canvas','laptop','minimal'] },
  // Beauty
  { name:'GlowKit Vitamin C Serum',   sku:'GLW-SRM-018', cat:'beauty',  base:79,  compare:99,  stock:33, rating:4.8, rCount:622, featured:true,  deal:true,  desc:'20% Vitamin C + Niacinamide, 30ml, clinical-grade brightening serum.',    images:['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600'], tags:['serum','vitamin-c','brightening','skincare'] },
  { name:'ZenLift Rose Quartz Roller', sku:'ZEN-RLR-019', cat:'beauty',  base:29,  compare:40,  stock:90, rating:4.4, rCount:281, featured:false, deal:false, desc:'Dual rose quartz stones, stainless steel handle, improves circulation.',  images:['https://images.unsplash.com/photo-1619451050621-83cb7aada2d7?w=600'], tags:['skincare','face-roller','rose-quartz'] },
  { name:'PureRinse AHA Scalp Scrub',  sku:'PUR-SCR-020', cat:'beauty',  base:22,  compare:30,  stock:120,rating:4.5, rCount:183, featured:false, deal:false, desc:'Exfoliating AHA + coffee blend, balances scalp pH, 250ml bottle.',        images:['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600'], tags:['haircare','scalp','exfoliant','aha'] },
  // Sports
  { name:'CoreForce Resistance Set',   sku:'COR-RES-021', cat:'sports',  base:49,  compare:65,  stock:60, rating:4.7, rCount:548, featured:true,  deal:false, desc:'5-band set 10-50 lb resistance, fabric-coated latex, carry bag included.', images:['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600'], tags:['resistance-bands','gym','home-workout'] },
  { name:'HydroFuel 40oz Bottle',      sku:'HYD-BTL-022', cat:'sports',  base:35,  compare:45,  stock:110,rating:4.8, rCount:904, featured:false, deal:false, desc:'Triple-wall vacuum insulation, 24h cold / 12h hot, leak-proof lid.',      images:['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'], tags:['water-bottle','insulated','hydration'] },
  { name:'ZenYoga Non-Slip Mat',       sku:'ZEN-MAT-023', cat:'sports',  base:55,  compare:70,  stock:40, rating:4.7, rCount:326, featured:true,  deal:false, desc:'6mm TPE foam, alignment marker lines, microfibre top layer, eco-cert.',   images:['https://images.unsplash.com/photo-1601925228133-9d9eddb97a75?w=600'], tags:['yoga','mat','non-slip','eco'] },
  { name:'CycleTrack GPS Computer',    sku:'CYC-GPS-024', cat:'sports',  base:219, compare:269, stock:12, rating:4.8, rCount:78,  featured:true,  deal:true,  desc:'ANT+/BLE, color mapping display, climb segments, 20h GPS battery life.',  images:['https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600'], tags:['cycling','gps','ant-plus','navigation'] },
  { name:'GripPro Lifting Gloves',     sku:'GRP-GLV-025', cat:'sports',  base:24,  compare:35,  stock:95, rating:4.4, rCount:212, featured:false, deal:true,  desc:'Full-palm padding, wrist support wrap, breathable mesh back, S-XXL.',     images:['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'], tags:['gloves','lifting','gym','wrist-support'] },
  // Food
  { name:'BrewMaster Pour Kit',        sku:'BRW-KIT-026', cat:'food',    base:75,  compare:95,  stock:28, rating:4.9, rCount:441, featured:true,  deal:false, desc:'Gooseneck kettle + precision scale + Hario V60 dripper, gift-boxed.',     images:['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'], tags:['coffee','pour-over','gift','pour-kit'] },
  { name:'SpiceVault 20-Jar Set',      sku:'SPC-JRS-027', cat:'food',    base:59,  compare:79,  stock:45, rating:4.7, rCount:186, featured:false, deal:false, desc:'20 magnetic glass spice jars, includes label stickers, minimalist design.',images:['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600'], tags:['spice','kitchen','storage','magnetic'] },
  { name:'ColdPress Pro Juicer',       sku:'CLD-JCR-028', cat:'food',    base:189, compare:239, stock:9,  rating:4.7, rCount:93,  featured:true,  deal:true,  desc:'Slow-masticating 80 RPM motor, 1.5L yield per batch, 10-year warranty.',  images:['https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600'], tags:['juicer','cold-press','slow-masticating'] },
  { name:'GrainKing Rice Cooker',      sku:'GRN-RCK-029', cat:'food',    base:99,  compare:129, stock:20, rating:4.6, rCount:254, featured:false, deal:false, desc:'Fuzzy-logic AI, 10-cup capacity, multi-cook: rice, quinoa, slow-cook.',   images:['https://images.unsplash.com/photo-1585671542778-80a4592a8262?w=600'], tags:['rice-cooker','fuzzy-logic','multi-cook'] },
  // Gaming
  { name:'VortexPad Ultra Controller', sku:'VRT-CTL-030', cat:'gaming',  base:79,  compare:99,  stock:33, rating:4.8, rCount:712, featured:true,  deal:true,  desc:'Hall-effect analog sticks, per-button RGB, 40h wireless, PC + Switch.',   images:['https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600'], tags:['controller','gaming','hall-effect','wireless'] },
  { name:'EchoRGB XL Mouse Pad',       sku:'ECH-MPD-031', cat:'gaming',  base:39,  compare:55,  stock:60, rating:4.7, rCount:388, featured:false, deal:false, desc:'900×400mm extended, 3mm stitched edge, ARGB lighting strip, non-slip.',  images:['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600'], tags:['mousepad','rgb','xl','extended'] },
  { name:'QuantumHeadset 7.1',         sku:'QNT-HST-032', cat:'gaming',  base:139, compare:179, stock:18, rating:4.6, rCount:265, featured:true,  deal:false, desc:'Virtual 7.1 surround sound, 50mm drivers, noise-cancel boom mic.',        images:['https://images.unsplash.com/photo-1583394293214-0e4f0ccdcd5b?w=600'], tags:['headset','surround','7.1','noise-cancel'] },
  { name:'NeonClick Gaming Mouse',     sku:'NEN-MSE-033', cat:'gaming',  base:59,  compare:79,  stock:45, rating:4.7, rCount:433, featured:false, deal:true,  desc:'26K DPI optical sensor, 95g ultra-light shell, 8 programmable buttons.', images:['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600'], tags:['mouse','gaming','optical','lightweight'] },
  { name:'StreamDeck Mini Pro',        sku:'STR-DCK-034', cat:'gaming',  base:109, compare:139, stock:20, rating:4.8, rCount:178, featured:true,  deal:false, desc:'15 customizable LCD keys, plugin ecosystem, macros, stream scenes.',      images:['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600'], tags:['streaming','macro-pad','lcd','automation'] },
  { name:'ChairBack Lumbar Support',   sku:'CHR-LMB-035', cat:'gaming',  base:45,  compare:60,  stock:70, rating:4.5, rCount:215, featured:false, deal:false, desc:'Memory foam lumbar cushion, adjustable strap, ergonomic 3D contour.',     images:['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600'], tags:['ergonomic','lumbar','chair','memory-foam'] },
]

async function main() {
  console.log('🌱 Seeding CortexCart…')

  // ── Users ────────────────────────────────────────────────────────────────
  const adminPass   = await bcrypt.hash('admin123', 12)
  const demoPass    = await bcrypt.hash('demo1234', 12)

  await prisma.user.upsert({
    where:  { email: 'admin@cortexcart.com' },
    update: {},
    create: { email:'admin@cortexcart.com', name:'Admin', password:adminPass, role:'ADMIN', emailVerified:new Date() },
  })
  await prisma.user.upsert({
    where:  { email: 'demo@cortexcart.com' },
    update: {},
    create: { email:'demo@cortexcart.com', name:'Demo User', password:demoPass, role:'CUSTOMER', emailVerified:new Date() },
  })
  console.log('✅ Users seeded')

  // ── Categories ───────────────────────────────────────────────────────────
  const categoryMap: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const record = await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    })
    categoryMap[cat.slug] = record.id
  }
  console.log(`✅ ${CATEGORIES.length} categories seeded`)

  // ── Products ─────────────────────────────────────────────────────────────
  let created = 0
  for (const p of PRODUCTS) {
    const slug       = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const categoryId = categoryMap[p.cat]
    if (!categoryId) { console.warn(`⚠ No category for ${p.cat}`); continue }

    await prisma.product.upsert({
      where:  { slug },
      update: {
        basePrice:    p.base,
        currentPrice: p.base,
        comparePrice: p.compare,
        stock:        p.stock,
      },
      create: {
        slug,
        sku:          p.sku,
        name:         p.name,
        description:  p.desc,
        brand:        p.name.split(' ')[0],
        categoryId,
        images:       p.images,
        tags:         p.tags,
        basePrice:    p.base,
        currentPrice: p.base,
        comparePrice: p.compare,
        stock:        p.stock,
        rating:       p.rating,
        reviewCount:  p.rCount,
        isFeatured:   p.featured,
        isDeal:       p.deal,
        isActive:     true,
      },
    })
    created++
  }
  console.log(`✅ ${created} products seeded`)
  console.log('🎉 Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
