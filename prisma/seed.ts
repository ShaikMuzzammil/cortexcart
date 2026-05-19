import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CortexCart...')

  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@cortexcart.com' }, update: {},
    create: { email: 'admin@cortexcart.com', name: 'CortexCart Admin', password: adminHash, role: 'ADMIN' },
  })
  const custHash = await bcrypt.hash('customer123', 12)
  await prisma.user.upsert({
    where: { email: 'demo@cortexcart.com' }, update: {},
    create: { email: 'demo@cortexcart.com', name: 'Alex Rivera', password: custHash, role: 'CUSTOMER', loyaltyPoints: 450 },
  })

  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'electronics'  }, update: {}, create: { name: 'Electronics',  slug: 'electronics',  description: 'Cutting-edge gadgets',    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' } }),
    prisma.category.upsert({ where: { slug: 'wearables'    }, update: {}, create: { name: 'Wearables',    slug: 'wearables',    description: 'Smart watches & fitness',  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' } }),
    prisma.category.upsert({ where: { slug: 'audio'        }, update: {}, create: { name: 'Audio',        slug: 'audio',        description: 'Premium sound',             image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' } }),
    prisma.category.upsert({ where: { slug: 'computing'    }, update: {}, create: { name: 'Computing',    slug: 'computing',    description: 'Laptops & tablets',         image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' } }),
    prisma.category.upsert({ where: { slug: 'photography'  }, update: {}, create: { name: 'Photography',  slug: 'photography',  description: 'Cameras & gear',            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' } }),
    prisma.category.upsert({ where: { slug: 'gaming'       }, update: {}, create: { name: 'Gaming',       slug: 'gaming',       description: 'Gaming peripherals',        image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400' } }),
  ])
  const [electronics, wearables, audio, computing, photography, gaming] = cats

  const products = [
    // ── COMPUTING ───────────────────────────────────────────────────────────
    {
      slug:'nexus-ultra-pro-laptop', name:'Nexus Ultra Pro 16"', sku:'NXS-001',
      description:'The most advanced AI-powered laptop with neural processing unit, 8K OLED display, and 48-hour battery. Built for creators who demand the absolute best.',
      basePrice:3299, currentPrice:3299, comparePrice:3899, stock:24, rating:4.9, reviewCount:847, isFeatured:true, categoryId:computing.id,
      images:['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800','https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800','https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800','https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800'],
      tags:['laptop','ai','pro','creator'], brand:'Nexus',
      attributes:{ Processor:'Cortex X5 Neural', RAM:'64GB', Storage:'4TB NVMe', Display:'8K OLED', Battery:'180Wh' },
    },
    {
      slug:'prism-tablet-ultra', name:'Prism Tablet Ultra 13"', sku:'PRS-001',
      description:'OLED display rivalling professional monitors. 165Hz, 99% DCI-P3, and 16,384-level pen input. Your creative studio, redefined.',
      basePrice:1599, currentPrice:1449, comparePrice:1799, stock:45, rating:4.8, reviewCount:1203, isFeatured:false, categoryId:computing.id,
      images:['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800','https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'],
      tags:['tablet','drawing','oled','creative'], brand:'Prism',
      attributes:{ Display:'13" OLED 165Hz', Chip:'Prism M3', Storage:'1TB', Pen:'16384 pressure levels' },
    },
    {
      slug:'apex-ultrabook-14', name:'Apex UltraBook 14"', sku:'APX-001',
      description:'Ultra-thin 10mm profile with 32-hour battery. The lightest performance laptop ever made at 880g. OLED 4K, 32GB RAM.',
      basePrice:2199, currentPrice:1999, comparePrice:2499, stock:31, rating:4.7, reviewCount:634, isFeatured:false, categoryId:computing.id,
      images:['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800','https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=800'],
      tags:['ultrabook','thin','lightweight','oled'], brand:'Apex',
      attributes:{ Thickness:'10mm', Weight:'880g', Display:'14" 4K OLED', Battery:'32 hours', RAM:'32GB' },
    },
    {
      slug:'nova-mini-pc', name:'Nova Mini PC Pro', sku:'NOV-001',
      description:'Desktop-class performance in a palm-sized form factor. 12-core processor, 64GB RAM, dual 4K output, whisper-quiet cooling.',
      basePrice:899, currentPrice:799, comparePrice:999, stock:58, rating:4.6, reviewCount:421, isFeatured:false, categoryId:computing.id,
      images:['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800','https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800'],
      tags:['mini-pc','desktop','compact'], brand:'Nova',
      attributes:{ CPU:'12-core 5.4GHz', RAM:'64GB DDR5', Storage:'2TB NVMe', Video:'Dual 4K@144Hz' },
    },
    // ── WEARABLES ────────────────────────────────────────────────────────────
    {
      slug:'aurora-smartwatch-x', name:'Aurora SmartWatch X', sku:'AUR-001',
      description:'Military-grade health monitoring: real-time ECG, blood glucose prediction, stress analysis, and 21-day battery. Your most advanced health companion.',
      basePrice:699, currentPrice:649, comparePrice:799, stock:67, rating:4.8, reviewCount:2341, isFeatured:true, categoryId:wearables.id,
      images:['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'],
      tags:['smartwatch','health','fitness'], brand:'Aurora',
      attributes:{ Display:'2.1" AMOLED', Battery:'21 days', Waterproof:'200m', Sensors:'ECG, SpO2, Glucose' },
    },
    {
      slug:'helix-fitness-band', name:'Helix Fitness Band Pro', sku:'HLX-001',
      description:'Slim, powerful, affordable. 14-day battery, continuous SpO2, body temperature monitoring, and AI coaching that adapts to you.',
      basePrice:189, currentPrice:169, comparePrice:229, stock:312, rating:4.5, reviewCount:12043, isFeatured:false, categoryId:wearables.id,
      images:['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800','https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800'],
      tags:['fitness','tracker','health','affordable'], brand:'Helix',
      attributes:{ Battery:'14 days', Sensors:'SpO2, Temp, Heart', Waterproof:'5ATM', Display:'1.47" AMOLED' },
    },
    {
      slug:'pulse-sport-watch', name:'Pulse Sport Watch Ultra', sku:'PLS-001',
      description:'Built for extreme athletes. Dual-band GPS, 100+ sport modes, altitude meter, and 30-day battery. Titanium case, scratch-proof sapphire glass.',
      basePrice:549, currentPrice:499, comparePrice:649, stock:89, rating:4.7, reviewCount:3201, isFeatured:false, categoryId:wearables.id,
      images:['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800','https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800'],
      tags:['sports','gps','athlete','titanium'], brand:'Pulse',
      attributes:{ GPS:'Dual-band', Battery:'30 days', Case:'Titanium', Glass:'Sapphire', Sports:'100+ modes' },
    },
    {
      slug:'zen-wellness-ring', name:'Zen Wellness Ring', sku:'ZEN-001',
      description:'The most discreet health tracker. Slim titanium ring monitors HRV, sleep stages, SpO2, and skin temperature 24/7. 7-day battery.',
      basePrice:299, currentPrice:269, comparePrice:349, stock:134, rating:4.6, reviewCount:1876, isFeatured:false, categoryId:wearables.id,
      images:['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800'],
      tags:['ring','wellness','sleep','discreet'], brand:'Zen',
      attributes:{ Material:'Titanium', Battery:'7 days', Sensors:'HRV, SpO2, Temp, Sleep', Weight:'4g' },
    },
    // ── AUDIO ────────────────────────────────────────────────────────────────
    {
      slug:'phantom-pro-headphones', name:'Phantom Pro ANC', sku:'PHN-001',
      description:'Studio-reference sound with 50mm planar magnetic drivers, AI-adaptive noise cancellation, and 60-hour playtime. The audiophile standard.',
      basePrice:549, currentPrice:499, comparePrice:649, stock:112, rating:4.9, reviewCount:5672, isFeatured:true, categoryId:audio.id,
      images:['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800','https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'],
      tags:['headphones','anc','planar','audiophile'], brand:'Phantom',
      attributes:{ Drivers:'50mm Planar', ANC:'AI Adaptive', Battery:'60 hours', Connectivity:'Bluetooth 5.4' },
    },
    {
      slug:'synapse-earbuds-pro', name:'Synapse Earbuds Pro', sku:'SYN-001',
      description:'First earbuds with real-time translation in 47 languages, personalized sound profiles, and bone conduction backup. Hi-Res certified.',
      basePrice:329, currentPrice:299, comparePrice:399, stock:234, rating:4.6, reviewCount:8921, isFeatured:true, categoryId:audio.id,
      images:['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800','https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
      tags:['earbuds','wireless','translation','hi-res'], brand:'Synapse',
      attributes:{ Drivers:'12mm Dynamic', Battery:'36h total', Features:'Live Translation', ANC:'Hybrid 6-mic' },
    },
    {
      slug:'echo-speaker-360', name:'Echo 360 Spatial Speaker', sku:'ECH-001',
      description:'True omnidirectional 360° sound. Adaptive tuning auto-calibrates to your room acoustics. 40W, Wi-Fi 6, breathtaking spatial audio.',
      basePrice:449, currentPrice:399, comparePrice:499, stock:78, rating:4.8, reviewCount:2107, isFeatured:true, categoryId:audio.id,
      images:['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800','https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'],
      tags:['speaker','spatial','wireless','smart'], brand:'Echo Labs',
      attributes:{ Power:'40W', Drivers:'5 drivers 360°', Connectivity:'Wi-Fi 6, BT 5.3', Feature:'Room Adaptation AI' },
    },
    {
      slug:'bass-studio-monitor', name:'Bass Studio Monitor Pro', sku:'BSM-001',
      description:'Professional nearfield monitors with DSP room correction. Flat frequency response 30Hz–25kHz. USB-C audio interface built in.',
      basePrice:799, currentPrice:699, comparePrice:899, stock:42, rating:4.7, reviewCount:891, isFeatured:false, categoryId:audio.id,
      images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
      tags:['studio','monitor','professional','dsp'], brand:'Bass Labs',
      attributes:{ Frequency:'30Hz–25kHz', Power:'150W biamp', Interface:'USB-C 24-bit/96kHz', DSP:'Room correction' },
    },
    {
      slug:'sonic-dac-amp', name:'Sonic DAC/AMP Stack', sku:'SON-001',
      description:'Reference-grade desktop DAC and amplifier. ES9038PRO chip, THD+N -120dB, balanced XLR output, MQA decoder. Powers any headphone.',
      basePrice:599, currentPrice:549, comparePrice:699, stock:29, rating:4.8, reviewCount:634, isFeatured:false, categoryId:audio.id,
      images:['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'],
      tags:['dac','amp','audiophile','balanced'], brand:'Sonic',
      attributes:{ DAC:'ES9038PRO', THD:'-120dB', Output:'Balanced XLR + SE', Decoder:'MQA full unfold' },
    },
    // ── ELECTRONICS ──────────────────────────────────────────────────────────
    {
      slug:'ion-portable-charger', name:'Ion 30K Titan Charger', sku:'ION-001',
      description:'30,000mAh GaN with 200W combined output. Charges a laptop fully in 45 minutes. 4 ports, digital display, aerospace aluminium shell.',
      basePrice:149, currentPrice:129, comparePrice:179, stock:445, rating:4.7, reviewCount:18430, isFeatured:false, categoryId:electronics.id,
      images:['https://images.unsplash.com/photo-1609592806808-48e6d1e77219?w=800'],
      tags:['charger','portable','gan','powerbank'], brand:'Ion',
      attributes:{ Capacity:'30,000mAh', Output:'200W Total', Ports:'4 (2xUSB-C, 2xUSB-A)', Tech:'GaN III' },
    },
    {
      slug:'flux-wireless-charger', name:'Flux 65W Wireless Pad', sku:'FLX-001',
      description:'World\'s fastest wireless charging pad at 65W. Charges iPhone, Android, AirPods, and Apple Watch simultaneously. Titanium surface.',
      basePrice:129, currentPrice:109, comparePrice:149, stock:267, rating:4.5, reviewCount:5621, isFeatured:false, categoryId:electronics.id,
      images:['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'],
      tags:['wireless','charging','magsafe','fast'], brand:'Flux',
      attributes:{ Power:'65W max', Devices:'3 simultaneous', Surface:'Titanium', Compatible:'iPhone/Android/AW' },
    },
    {
      slug:'lumix-smart-display', name:'Lumix Smart Display 27"', sku:'LMX-001',
      description:'4K OLED smart monitor with built-in AI assistant, wireless charging base, and ambient sensing that adjusts brightness automatically.',
      basePrice:1299, currentPrice:1149, comparePrice:1499, stock:36, rating:4.7, reviewCount:892, isFeatured:false, categoryId:electronics.id,
      images:['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
      tags:['monitor','smart','oled','4k'], brand:'Lumix',
      attributes:{ Size:'27" 4K OLED', Refresh:'165Hz', HDR:'HDR10+', Features:'Wireless charging base' },
    },
    {
      slug:'orbit-smart-hub', name:'Orbit Smart Home Hub', sku:'ORB-001',
      description:'Control your entire smart home with one device. Supports 50,000+ devices, built-in Thread, Matter, Zigbee, and Z-Wave. AI automation.',
      basePrice:229, currentPrice:199, comparePrice:279, stock:183, rating:4.6, reviewCount:3241, isFeatured:false, categoryId:electronics.id,
      images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
      tags:['smarthome','hub','automation','matter'], brand:'Orbit',
      attributes:{ Protocols:'Thread, Matter, Zigbee, Z-Wave', Devices:'50,000+', CPU:'Quad-core 2.0GHz', RAM:'4GB' },
    },
    // ── PHOTOGRAPHY ──────────────────────────────────────────────────────────
    {
      slug:'vortex-camera-z9', name:'Vortex Z9 Pro Camera', sku:'VTX-001',
      description:'200MP full-frame mirrorless with computational AI, 8K120fps video, and 30fps burst. The definitive professional imaging tool.',
      basePrice:4299, currentPrice:4299, comparePrice:null, stock:8, rating:4.7, reviewCount:312, isFeatured:false, categoryId:photography.id,
      images:['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800','https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800','https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'],
      tags:['camera','mirrorless','professional','8k'], brand:'Vortex',
      attributes:{ Sensor:'200MP Full-Frame', Video:'8K120fps RAW', ISO:'64–819200', AF:'AI 5000-point' },
    },
    {
      slug:'stellar-drone-x4', name:'Stellar X4 Pro Drone', sku:'STL-001',
      description:'8K/60fps aerial cinema. 40-min flight, 15km range, AI subject tracking with cinematic shot modes. Folds to bottle size.',
      basePrice:2199, currentPrice:1999, comparePrice:2499, stock:19, rating:4.8, reviewCount:671, isFeatured:true, categoryId:photography.id,
      images:['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800','https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800'],
      tags:['drone','aerial','cinema','8k'], brand:'Stellar',
      attributes:{ Camera:'8K/60fps', Flight:'40 min', Range:'15km', Obstacle:'6-direction sensing' },
    },
    {
      slug:'lens-85mm-prime', name:'OptiX 85mm f/1.2 Prime', sku:'OPT-001',
      description:'The legendary portrait lens. Razor-sharp at f/1.2 with bokeh that painters dream of. Nano-coating eliminates ghosting. Full-frame.',
      basePrice:2499, currentPrice:2199, comparePrice:2799, stock:14, rating:4.9, reviewCount:1043, isFeatured:false, categoryId:photography.id,
      images:['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'],
      tags:['lens','portrait','prime','bokeh'], brand:'OptiX',
      attributes:{ Focal:'85mm', Aperture:'f/1.2', Elements:'14 in 11 groups', Filter:'82mm', Mount:'Universal EF/Z/E/RF' },
    },
    {
      slug:'flash-pro-strobe', name:'FlashPro 600 Studio Strobe', sku:'FLH-001',
      description:'600Ws studio strobe with HSS, TTL, and built-in 2.4GHz radio. 0.05s recycle time. Bowens S-mount. Runs on battery or AC.',
      basePrice:699, currentPrice:599, comparePrice:799, stock:27, rating:4.6, reviewCount:412, isFeatured:false, categoryId:photography.id,
      images:['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
      tags:['strobe','studio','flash','portable'], brand:'FlashPro',
      attributes:{ Power:'600Ws', Recycle:'0.05s', Radio:'2.4GHz built-in', Mount:'Bowens S', Power_source:'AC/Battery' },
    },
    // ── GAMING ───────────────────────────────────────────────────────────────
    {
      slug:'quantum-gaming-mouse', name:'Quantum Edge Gaming Mouse', sku:'QNT-001',
      description:'36000 DPI, 0.1ms polling, AI recoil prediction, 48g magnesium chassis. The precision tool of esports champions.',
      basePrice:179, currentPrice:159, comparePrice:199, stock:189, rating:4.7, reviewCount:3401, isFeatured:false, categoryId:gaming.id,
      images:['https://images.unsplash.com/photo-1527814050087-3793815479db?w=800','https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800'],
      tags:['gaming','mouse','esports','lightweight'], brand:'Quantum',
      attributes:{ DPI:'36,000', Weight:'48g', Polling:'0.1ms (8000Hz)', Frame:'Magnesium alloy' },
    },
    {
      slug:'carbon-keyboard-pro', name:'Carbon MK Pro Keyboard', sku:'CBN-001',
      description:'Hall-effect magnetic switches with infinite durability. Gasket-mounted, per-key RGB, aluminium frame, wireless 40m range.',
      basePrice:259, currentPrice:229, comparePrice:299, stock:143, rating:4.6, reviewCount:4231, isFeatured:false, categoryId:gaming.id,
      images:['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800','https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800'],
      tags:['keyboard','mechanical','hall-effect','rgb'], brand:'Carbon',
      attributes:{ Switches:'Hall Effect Magnetic', Layout:'TKL 87-key', Connectivity:'2.4GHz/BT/USB-C', RGB:'16M per-key' },
    },
    {
      slug:'titan-gaming-headset', name:'Titan Pro Gaming Headset', sku:'TTN-001',
      description:'7.1 surround with AI noise-cancelling mic. 50mm drivers tuned for positional audio. 40-hour wireless battery. Tournament-ready.',
      basePrice:229, currentPrice:199, comparePrice:269, stock:167, rating:4.7, reviewCount:2891, isFeatured:false, categoryId:gaming.id,
      images:['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'],
      tags:['headset','gaming','surround','wireless'], brand:'Titan',
      attributes:{ Drivers:'50mm', Surround:'7.1 virtual', Mic:'AI noise-cancel', Battery:'40 hours', Connectivity:'2.4GHz + BT' },
    },
    {
      slug:'apex-gaming-chair', name:'Apex Pro Gaming Chair', sku:'APC-001',
      description:'Ergonomic racing chair with lumbar massage, 4D armrests, and cold-foam cushioning. Supports up to 180kg. 180° recline.',
      basePrice:599, currentPrice:499, comparePrice:699, stock:34, rating:4.5, reviewCount:1632, isFeatured:false, categoryId:gaming.id,
      images:['https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800'],
      tags:['chair','ergonomic','gaming','massage'], brand:'Apex',
      attributes:{ Material:'PU Leather + Cold foam', Armrests:'4D adjustable', Recline:'180°', Massage:'Lumbar 3-mode', Capacity:'180kg' },
    },
    {
      slug:'nexus-gaming-monitor', name:'Nexus 32" 4K Gaming Monitor', sku:'NGM-001',
      description:'4K OLED at 240Hz. 0.03ms response time, DisplayHDR 1000, NVIDIA G-Sync Ultimate. Built for competitive gaming.',
      basePrice:1299, currentPrice:1149, comparePrice:1499, stock:51, rating:4.8, reviewCount:2134, isFeatured:true, categoryId:gaming.id,
      images:['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
      tags:['monitor','oled','240hz','gaming'], brand:'Nexus',
      attributes:{ Size:'32" 4K OLED', Refresh:'240Hz', Response:'0.03ms', HDR:'DisplayHDR 1000', Sync:'G-Sync Ultimate' },
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where:  { sku: p.sku },
      update: { currentPrice: p.currentPrice, stock: p.stock },
      create: p as any,
    })
  }

  console.log('✅ Seeded successfully!')
  console.log(`   👤 admin@cortexcart.com / admin123`)
  console.log(`   👤 demo@cortexcart.com  / customer123`)
  console.log(`   📦 ${products.length} products across 6 categories`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
