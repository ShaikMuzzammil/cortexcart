import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// High quality Unsplash images per category
const ELECTRONICS_IMGS = [
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800',
]
const COMPUTING_IMGS = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
  'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=800',
]
const AUDIO_IMGS = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
]
const WEARABLES_IMGS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
  'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800',
  'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800',
]
const PHOTO_IMGS = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
]
const GAMING_IMGS = [
  'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800',
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
]

async function main() {
  console.log('🌱 Seeding CortexCart with 50+ products…')

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

  const [electronics, wearables, audio, computing, photography, gaming] = await Promise.all([
    prisma.category.upsert({ where:{ slug:'electronics'  }, update:{}, create:{ name:'Electronics',  slug:'electronics',  description:'Cutting-edge gadgets',   image:ELECTRONICS_IMGS[0] } }),
    prisma.category.upsert({ where:{ slug:'wearables'    }, update:{}, create:{ name:'Wearables',    slug:'wearables',    description:'Smart watches & fitness', image:WEARABLES_IMGS[0] } }),
    prisma.category.upsert({ where:{ slug:'audio'        }, update:{}, create:{ name:'Audio',        slug:'audio',        description:'Premium sound',           image:AUDIO_IMGS[0] } }),
    prisma.category.upsert({ where:{ slug:'computing'    }, update:{}, create:{ name:'Computing',    slug:'computing',    description:'Laptops & tablets',       image:COMPUTING_IMGS[0] } }),
    prisma.category.upsert({ where:{ slug:'photography'  }, update:{}, create:{ name:'Photography',  slug:'photography',  description:'Cameras & gear',          image:PHOTO_IMGS[0] } }),
    prisma.category.upsert({ where:{ slug:'gaming'       }, update:{}, create:{ name:'Gaming',       slug:'gaming',       description:'Gaming peripherals',      image:GAMING_IMGS[0] } }),
  ])

  const products = [
    // ── COMPUTING (9) ──────────────────────────────────────────────────────
    { slug:'nexus-ultra-pro-laptop',  name:'Nexus Ultra Pro 16"',       sku:'NXS-001', categoryId:computing.id,   isFeatured:true,  basePrice:3299, currentPrice:3299, comparePrice:3899, stock:24,  rating:4.9, reviewCount:847,  dynamicPrice:true,
      description:'The most advanced AI-powered laptop. 8K OLED, 48-hour battery, Neural Processing Unit. Built for creators who demand the absolute best.',
      images:[COMPUTING_IMGS[0],COMPUTING_IMGS[1],COMPUTING_IMGS[2]], tags:['laptop','ai','pro'], brand:'Nexus', attributes:{ Processor:'Cortex X5 Neural', RAM:'64GB', Storage:'4TB NVMe', Display:'8K OLED', Battery:'180Wh' } },
    { slug:'prism-tablet-ultra',      name:'Prism Tablet Ultra 13"',    sku:'PRS-001', categoryId:computing.id,   isFeatured:false, basePrice:1599, currentPrice:1449, comparePrice:1799, stock:45,  rating:4.8, reviewCount:1203,
      description:'OLED display rivalling professional monitors. 165Hz, 99% DCI-P3, 16,384-level pen input. Your creative studio redefined.',
      images:[COMPUTING_IMGS[3],COMPUTING_IMGS[0]], tags:['tablet','drawing','oled'], brand:'Prism', attributes:{ Display:'13" OLED 165Hz', Chip:'Prism M3', Storage:'1TB', Pen:'16384 levels' } },
    { slug:'apex-ultrabook-14',       name:'Apex UltraBook 14"',        sku:'APX-001', categoryId:computing.id,   isFeatured:false, basePrice:2199, currentPrice:1999, comparePrice:2499, stock:31,  rating:4.7, reviewCount:634,
      description:'Ultra-thin 10mm, 32-hour battery, lightest performance laptop at 880g. OLED 4K, 32GB RAM.',
      images:[COMPUTING_IMGS[1],COMPUTING_IMGS[2]], tags:['ultrabook','thin','4k'], brand:'Apex', attributes:{ Thickness:'10mm', Weight:'880g', Display:'14" 4K OLED', Battery:'32h' } },
    { slug:'nova-mini-pc-pro',        name:'Nova Mini PC Pro',           sku:'NOV-001', categoryId:computing.id,   isFeatured:false, basePrice:899,  currentPrice:799,  comparePrice:999,  stock:58,  rating:4.6, reviewCount:421,
      description:'Desktop-class performance in your palm. 12-core, 64GB RAM, dual 4K output.',
      images:[COMPUTING_IMGS[0]], tags:['mini-pc','desktop','compact'], brand:'Nova', attributes:{ CPU:'12-core 5.4GHz', RAM:'64GB DDR5', Storage:'2TB NVMe' } },
    { slug:'swift-chromebook-pro',    name:'Swift Chromebook Pro 15"',  sku:'SWF-001', categoryId:computing.id,   isFeatured:false, basePrice:699,  currentPrice:599,  comparePrice:799,  stock:72,  rating:4.4, reviewCount:892,
      description:'22-hour battery, blazing fast cloud-first performance. Perfect for students.',
      images:[COMPUTING_IMGS[1]], tags:['chromebook','student','lightweight'], brand:'Swift', attributes:{ Battery:'22h', Display:'15" FHD', RAM:'16GB', Storage:'256GB' } },
    { slug:'nexus-studio-monitor-27', name:'Nexus Studio Monitor 27"',  sku:'NSM-001', categoryId:computing.id,   isFeatured:false, basePrice:1299, currentPrice:1149, comparePrice:1499, stock:36,  rating:4.7, reviewCount:567,
      description:'4K OLED smart monitor. Ambient sensing auto-adjusts. Built-in wireless charging base.',
      images:[COMPUTING_IMGS[2]], tags:['monitor','4k','oled','smart'], brand:'Nexus', attributes:{ Size:'27" 4K OLED', Refresh:'165Hz' } },
    { slug:'keystone-mech-keyboard',  name:'Keystone Mech 75% KB',     sku:'KYS-001', categoryId:computing.id,   isFeatured:false, basePrice:189,  currentPrice:169,  comparePrice:229,  stock:143, rating:4.5, reviewCount:2341,
      description:'Hot-swappable mechanical keyboard. Aluminium body, per-key RGB, wireless.',
      images:[COMPUTING_IMGS[3]], tags:['keyboard','mechanical','wireless'], brand:'Keystone', attributes:{ Layout:'75%', Connectivity:'2.4GHz/BT/USB', RGB:'Per-key' } },
    { slug:'orbit-drawing-pad',       name:'Orbit Pro Drawing Pad',     sku:'ORB-002', categoryId:computing.id,   isFeatured:false, basePrice:399,  currentPrice:349,  comparePrice:449,  stock:67,  rating:4.6, reviewCount:1102,
      description:'8192-level pressure sensitivity, tilt recognition. Perfect for digital artists.',
      images:[COMPUTING_IMGS[0]], tags:['drawing','tablet','artist'], brand:'Orbit', attributes:{ Pressure:'8192 levels', Tilt:'60°' } },
    { slug:'lunar-gaming-mouse',      name:'Lunar Pro Gaming Mouse',    sku:'LNR-001', categoryId:computing.id,   isFeatured:false, basePrice:89,   currentPrice:79,   comparePrice:109,  stock:234, rating:4.6, reviewCount:4521,
      description:'25,600 DPI optical sensor, 8 programmable buttons, 70-hour battery, ultra-light 62g.',
      images:[COMPUTING_IMGS[3]], tags:['mouse','gaming','wireless'], brand:'Lunar', attributes:{ DPI:'25,600', Buttons:'8', Battery:'70h', Weight:'62g' } },

    // ── WEARABLES (9) ──────────────────────────────────────────────────────
    { slug:'aurora-smartwatch-x',     name:'Aurora SmartWatch X',       sku:'AUR-001', categoryId:wearables.id,   isFeatured:true,  basePrice:699,  currentPrice:649,  comparePrice:799,  stock:67,  rating:4.8, reviewCount:2341, dynamicPrice:true,
      description:'Military-grade health monitoring: real-time ECG, blood glucose prediction, stress analysis, 21-day battery.',
      images:WEARABLES_IMGS, tags:['smartwatch','health','fitness'], brand:'Aurora', attributes:{ Display:'2.1" AMOLED', Battery:'21 days', Waterproof:'200m', Sensors:'ECG, SpO2, Glucose' } },
    { slug:'helix-fitness-band',      name:'Helix Fitness Band Pro',    sku:'HLX-001', categoryId:wearables.id,   isFeatured:false, basePrice:189,  currentPrice:169,  comparePrice:229,  stock:312, rating:4.5, reviewCount:12043,
      description:'Slim, powerful. 14-day battery, SpO2, body temp, AI coaching.',
      images:[WEARABLES_IMGS[2],WEARABLES_IMGS[0]], tags:['fitness','tracker','affordable'], brand:'Helix', attributes:{ Battery:'14 days', Sensors:'SpO2, Temp, HR', Waterproof:'5ATM' } },
    { slug:'pulse-sport-watch',       name:'Pulse Sport Watch Ultra',   sku:'PLS-001', categoryId:wearables.id,   isFeatured:false, basePrice:549,  currentPrice:499,  comparePrice:649,  stock:89,  rating:4.7, reviewCount:3201,
      description:'Dual-band GPS, 100+ sport modes, altitude meter, 30-day battery. Titanium case.',
      images:[WEARABLES_IMGS[3],WEARABLES_IMGS[1]], tags:['sports','gps','titanium'], brand:'Pulse', attributes:{ GPS:'Dual-band', Battery:'30 days', Case:'Titanium', Sports:'100+ modes' } },
    { slug:'zen-wellness-ring',       name:'Zen Wellness Ring',         sku:'ZEN-001', categoryId:wearables.id,   isFeatured:false, basePrice:299,  currentPrice:269,  comparePrice:349,  stock:134, rating:4.6, reviewCount:1876,
      description:'Discreet titanium ring. HRV, sleep, SpO2, temperature 24/7. 7-day battery.',
      images:[WEARABLES_IMGS[0]], tags:['ring','wellness','sleep'], brand:'Zen', attributes:{ Material:'Titanium', Battery:'7 days', Weight:'4g' } },
    { slug:'kids-smartwatch-edu',     name:'EduWatch Kids Smartwatch',  sku:'EDU-001', categoryId:wearables.id,   isFeatured:false, basePrice:129,  currentPrice:109,  comparePrice:149,  stock:201, rating:4.4, reviewCount:4321,
      description:'GPS tracking, SOS button, calls, games. Durable waterproof design for kids.',
      images:[WEARABLES_IMGS[1]], tags:['kids','gps','safe'], brand:'EduWatch', attributes:{ GPS:'Real-time', SOS:'One-touch', Waterproof:'IP68', Battery:'3 days' } },
    { slug:'sensei-golf-watch',       name:'Sensei Golf GPS Watch',     sku:'SNS-001', categoryId:wearables.id,   isFeatured:false, basePrice:349,  currentPrice:299,  comparePrice:399,  stock:56,  rating:4.5, reviewCount:892,
      description:'40,000+ preloaded courses. Hazard distances, digital scorecard, swing analysis.',
      images:[WEARABLES_IMGS[3]], tags:['golf','gps','sport'], brand:'Sensei', attributes:{ Courses:'40,000+', Battery:'20h round' } },
    { slug:'flux-smart-glasses',      name:'Flux Smart AR Glasses',     sku:'FLX-002', categoryId:wearables.id,   isFeatured:true,  basePrice:899,  currentPrice:799,  comparePrice:999,  stock:29,  rating:4.3, reviewCount:421,
      description:'Lightweight AR glasses with heads-up navigation, notifications, 4-hour battery.',
      images:[WEARABLES_IMGS[0],WEARABLES_IMGS[2]], tags:['ar','glasses','smart'], brand:'Flux', attributes:{ Display:'AR overlay', Battery:'4h', Frame:'Titanium', Weight:'38g' } },
    { slug:'vibe-posture-sensor',     name:'Vibe Posture Corrector',    sku:'VIB-001', categoryId:wearables.id,   isFeatured:false, basePrice:89,   currentPrice:79,   comparePrice:109,  stock:387, rating:4.3, reviewCount:6543,
      description:'Lightweight clip-on sensor vibrates when you slouch. 14-day battery.',
      images:[WEARABLES_IMGS[2]], tags:['posture','health','sensor'], brand:'Vibe', attributes:{ Battery:'14 days', Weight:'8g', Wear:'Clip-on' } },
    { slug:'nexfit-sleep-tracker',    name:'NexFit Sleep Tracker Band', sku:'NFT-001', categoryId:wearables.id,   isFeatured:false, basePrice:59,   currentPrice:49,   comparePrice:79,   stock:523, rating:4.4, reviewCount:9872,
      description:'Advanced sleep stage analysis, snoring detection, smart alarm. 21-day battery. Ultra-slim 5mm.',
      images:[WEARABLES_IMGS[1]], tags:['sleep','health','slim'], brand:'NexFit', attributes:{ Battery:'21 days', Thickness:'5mm', Sensors:'SpO2, HRV, Temp' } },

    // ── AUDIO (9) ──────────────────────────────────────────────────────────
    { slug:'phantom-pro-headphones',  name:'Phantom Pro ANC',           sku:'PHN-001', categoryId:audio.id,       isFeatured:true,  basePrice:549,  currentPrice:499,  comparePrice:649,  stock:112, rating:4.9, reviewCount:5672,
      description:'Studio-reference: 50mm planar magnetic drivers, AI-adaptive ANC, 60-hour playtime.',
      images:AUDIO_IMGS, tags:['headphones','anc','audiophile'], brand:'Phantom', attributes:{ Drivers:'50mm Planar', Battery:'60h', ANC:'AI-adaptive', Codec:'LDAC, aptX HD' } },
    { slug:'nova-earbuds-x3',         name:'Nova Earbuds X3 Pro',       sku:'NOV-002', categoryId:audio.id,       isFeatured:false, basePrice:199,  currentPrice:179,  comparePrice:249,  stock:234, rating:4.7, reviewCount:8921,
      description:'6-mic array, hybrid ANC, 9mm graphene drivers, 36-hour total. Fit that never slips.',
      images:[AUDIO_IMGS[1],AUDIO_IMGS[0]], tags:['earbuds','anc','wireless'], brand:'Nova', attributes:{ ANC:'Hybrid 6-mic', Battery:'36h total', Drivers:'9mm Graphene' } },
    { slug:'bass-pro-speaker',        name:'Bass Pro Portable Speaker', sku:'BAS-001', categoryId:audio.id,       isFeatured:false, basePrice:299,  currentPrice:269,  comparePrice:349,  stock:89,  rating:4.6, reviewCount:3102,
      description:'360° spatial audio, 50W output, 28-hour battery, IP67 waterproof. Party anywhere.',
      images:[AUDIO_IMGS[2],AUDIO_IMGS[0]], tags:['speaker','portable','waterproof'], brand:'Bass', attributes:{ Power:'50W', Battery:'28h', Waterproof:'IP67', Audio:'360° Spatial' } },
    { slug:'crystal-studio-monitor',  name:'Crystal Studio Monitor',    sku:'CRY-001', categoryId:audio.id,       isFeatured:false, basePrice:449,  currentPrice:399,  comparePrice:549,  stock:43,  rating:4.8, reviewCount:1203,
      description:'Flat reference response for mixing and mastering. 8" woofer, 1" tweeter, 80W bi-amp.',
      images:[AUDIO_IMGS[3],AUDIO_IMGS[2]], tags:['studio','monitor','mixing'], brand:'Crystal', attributes:{ Woofer:'8"', Tweeter:'1"', Power:'80W', Freq:'35Hz–30kHz' } },
    { slug:'zen-sleep-headphones',    name:'Zen Sleep Headband',        sku:'ZSH-001', categoryId:audio.id,       isFeatured:false, basePrice:79,   currentPrice:69,   comparePrice:99,   stock:312, rating:4.5, reviewCount:7823,
      description:'Ultra-flat speakers in a soft headband. Sleep comfortably with music. 10-hour battery.',
      images:[AUDIO_IMGS[1]], tags:['sleep','headband','comfort'], brand:'Zen', attributes:{ Battery:'10h', Speaker:'Flat 5mm', Connection:'Bluetooth 5.3' } },
    { slug:'amp-dac-portable',        name:'Amp DAC Pro Portable',      sku:'AMP-001', categoryId:audio.id,       isFeatured:false, basePrice:329,  currentPrice:299,  comparePrice:399,  stock:67,  rating:4.7, reviewCount:1034,
      description:'Balanced 4.4mm output, 32-bit/768kHz, 10-hour battery. Audiophile-grade mobile DAC.',
      images:[AUDIO_IMGS[0]], tags:['dac','amplifier','audiophile'], brand:'Amp', attributes:{ Output:'4.4mm balanced', Bit:'32-bit/768kHz', Battery:'10h' } },
    { slug:'vox-karaoke-mic',         name:'Vox Wireless Karaoke Mic',  sku:'VOX-001', categoryId:audio.id,       isFeatured:false, basePrice:89,   currentPrice:75,   comparePrice:109,  stock:445, rating:4.3, reviewCount:5231,
      description:'Built-in speaker, Bluetooth, vocal effects, 6-hour battery. Portable karaoke.',
      images:[AUDIO_IMGS[2]], tags:['microphone','karaoke','wireless'], brand:'Vox', attributes:{ Battery:'6h', Effects:'8 vocal effects', Range:'10m BT' } },
    { slug:'spatial-soundbar',        name:'Spatial 3D Soundbar 400W',  sku:'SPS-001', categoryId:audio.id,       isFeatured:false, basePrice:699,  currentPrice:599,  comparePrice:799,  stock:38,  rating:4.8, reviewCount:1892,
      description:'Dolby Atmos, DTS:X, 11.1.4 object-based audio. HDMI eARC. Room correction AI.',
      images:[AUDIO_IMGS[3]], tags:['soundbar','dolby','atmos'], brand:'Spatial', attributes:{ Power:'400W', Channels:'11.1.4', Formats:'Dolby Atmos, DTS:X' } },
    { slug:'loop-earplug-pro',        name:'Loop Experience+ Earplugs', sku:'LOP-001', categoryId:audio.id,       isFeatured:false, basePrice:49,   currentPrice:39,   comparePrice:59,   stock:892, rating:4.6, reviewCount:18234,
      description:'Up to -18dB noise reduction. Wear anywhere — concerts, focus, sleep. DNR certified.',
      images:[AUDIO_IMGS[1]], tags:['earplugs','noise','focus'], brand:'Loop', attributes:{ Reduction:'-18dB', DNR:'Certified', Modes:'Experience, Quiet, Engage' } },

    // ── ELECTRONICS (9) ────────────────────────────────────────────────────
    { slug:'stellar-x4-drone',        name:'Stellar X4 Pro Drone',      sku:'STL-001', categoryId:electronics.id, isFeatured:true,  basePrice:1299, currentPrice:1199, comparePrice:1499, stock:34,  rating:4.8, reviewCount:1234, dynamicPrice:true,
      description:'8K camera, 45-min flight, AI obstacle avoidance, 15km range, ActiveTrack 5.0.',
      images:[ELECTRONICS_IMGS[0],ELECTRONICS_IMGS[1]], tags:['drone','4k','ai'], brand:'Stellar', attributes:{ Camera:'8K HDR', Flight:'45 min', Range:'15km', AI:'ActiveTrack 5.0' } },
    { slug:'ion-titan-charger',       name:'Ion 30K Titan Charger',     sku:'ION-001', categoryId:electronics.id, isFeatured:false, basePrice:129,  currentPrice:119,  comparePrice:159,  stock:312, rating:4.7, reviewCount:8921,
      description:'30,000mAh, 140W fast charge (charges laptop in 45 min), 3 ports simultaneous.',
      images:[ELECTRONICS_IMGS[2],ELECTRONICS_IMGS[0]], tags:['powerbank','fast-charge','travel'], brand:'Ion', attributes:{ Capacity:'30,000mAh', Power:'140W', Ports:'USB-C ×2, USB-A' } },
    { slug:'luma-projector-4k',       name:'Luma 4K Smart Projector',   sku:'LUM-001', categoryId:electronics.id, isFeatured:false, basePrice:1199, currentPrice:1099, comparePrice:1399, stock:27,  rating:4.7, reviewCount:892,
      description:'4K laser projection, 3000 lumens, Android TV built-in, auto-keystone, 120" image.',
      images:[ELECTRONICS_IMGS[1]], tags:['projector','4k','smart'], brand:'Luma', attributes:{ Resolution:'4K', Brightness:'3000lm', OS:'Android TV', Screen:'Up to 120"' } },
    { slug:'orbit-smart-lock',        name:'Orbit Smart Door Lock',     sku:'ORB-001', categoryId:electronics.id, isFeatured:false, basePrice:279,  currentPrice:249,  comparePrice:329,  stock:89,  rating:4.6, reviewCount:1203,
      description:'Fingerprint, face recognition, RFID, PIN, app control. Auto-lock. 18-month battery.',
      images:[ELECTRONICS_IMGS[0]], tags:['smart-home','security','lock'], brand:'Orbit', attributes:{ Unlock:'Fingerprint, Face, PIN, App', Battery:'18 months' } },
    { slug:'flash-robot-vacuum',      name:'Flash S20 Robot Vacuum',    sku:'FLS-001', categoryId:electronics.id, isFeatured:false, basePrice:649,  currentPrice:599,  comparePrice:799,  stock:61,  rating:4.6, reviewCount:2341,
      description:'AI room mapping, 8,000Pa suction, auto-empty base, mop & vacuum combo, 3h runtime.',
      images:[ELECTRONICS_IMGS[2]], tags:['robot','vacuum','smart-home'], brand:'Flash', attributes:{ Suction:'8,000Pa', Runtime:'3h', Auto:'Self-emptying', Navigation:'LiDAR AI' } },
    { slug:'solar-power-station',     name:'Solar Power Station 1200W', sku:'SOL-001', categoryId:electronics.id, isFeatured:false, basePrice:1499, currentPrice:1299, comparePrice:1799, stock:19,  rating:4.8, reviewCount:567,
      description:'1.2kWh LFP battery, 1800W output, solar + wall charge, 14 output ports. For camping, backup, van life.',
      images:[ELECTRONICS_IMGS[1]], tags:['solar','power','camping','backup'], brand:'Solar', attributes:{ Capacity:'1.2kWh', Output:'1800W', Ports:'14', Chemistry:'LiFePO4' } },
    { slug:'glow-led-strip-smart',    name:'Glow Smart LED Strip 10m',  sku:'GLO-001', categoryId:electronics.id, isFeatured:false, basePrice:79,   currentPrice:59,   comparePrice:99,   stock:567, rating:4.4, reviewCount:12043,
      description:'16 million colors, music sync, Matter-compatible, DIY cut-to-size, IP65. App control.',
      images:[ELECTRONICS_IMGS[0]], tags:['led','smart-home','rgb'], brand:'Glow', attributes:{ Length:'10m', Colors:'16M', Compatible:'Matter, Alexa, Google', IP:'IP65' } },
    { slug:'terra-air-purifier',      name:'Terra HEPA Air Purifier',   sku:'TER-001', categoryId:electronics.id, isFeatured:false, basePrice:299,  currentPrice:249,  comparePrice:349,  stock:93,  rating:4.7, reviewCount:1892,
      description:'H13 True HEPA + activated carbon. 600 sq ft coverage. PM2.5 sensor. Whisper-quiet 22dB.',
      images:[ELECTRONICS_IMGS[2]], tags:['air','purifier','health'], brand:'Terra', attributes:{ HEPA:'H13 True', Coverage:'600 sq ft', Noise:'22dB min', PM:'2.5 sensor' } },
    { slug:'flex-display-tablet',     name:'Flex Foldable Display 13"', sku:'FLX-001', categoryId:electronics.id, isFeatured:true,  basePrice:1899, currentPrice:1749, comparePrice:2199, stock:16,  rating:4.5, reviewCount:321,
      description:'World\'s first consumer foldable OLED display. Fold in half. 1600 nits, 120Hz, stylus.',
      images:[ELECTRONICS_IMGS[1],ELECTRONICS_IMGS[0]], tags:['foldable','oled','innovative'], brand:'Flex', attributes:{ Display:'13" Foldable OLED', Brightness:'1600 nits', Refresh:'120Hz' } },

    // ── PHOTOGRAPHY (8) ────────────────────────────────────────────────────
    { slug:'apex-mirrorless-pro',     name:'Apex R1 Mirrorless Pro',    sku:'APX-002', categoryId:photography.id, isFeatured:true,  basePrice:3999, currentPrice:3799, comparePrice:4499, stock:21,  rating:4.9, reviewCount:1234,
      description:'61MP full-frame BSI sensor, 8-stop IBIS, AI subject tracking, 8K30 video, dual card slots.',
      images:PHOTO_IMGS, tags:['mirrorless','fullframe','pro'], brand:'Apex', attributes:{ Sensor:'61MP Full-frame', IBIS:'8-stop', Video:'8K30', Burst:'20fps' } },
    { slug:'orbit-lens-50mm',         name:'Orbit 50mm f/1.2 Prime',    sku:'ORB-003', categoryId:photography.id, isFeatured:false, basePrice:1199, currentPrice:999,  comparePrice:1399, stock:43,  rating:4.8, reviewCount:892,
      description:'Legendary bokeh, nano-coating, weather-sealed. The go-to portrait lens.',
      images:[PHOTO_IMGS[1],PHOTO_IMGS[0]], tags:['lens','prime','portrait'], brand:'Orbit', attributes:{ Aperture:'f/1.2', Mount:'E-mount', Elements:'13 in 9', Weather:'Sealed' } },
    { slug:'vlogger-cam-4k',          name:'Vlogger Cam 4K Creator',    sku:'VLG-001', categoryId:photography.id, isFeatured:false, basePrice:749,  currentPrice:699,  comparePrice:899,  stock:78,  rating:4.6, reviewCount:3421,
      description:'Flip screen, 4K60, AI beauty mode, USB-C power delivery while recording, external mic port.',
      images:[PHOTO_IMGS[2]], tags:['vlog','4k','youtube'], brand:'Vlogger', attributes:{ Video:'4K 60fps', Screen:'Flip-out', AI:'Beauty mode', Power:'USB-C' } },
    { slug:'stable-gimbal-pro',       name:'Stable 3-Axis Gimbal Pro',  sku:'STB-001', categoryId:photography.id, isFeatured:false, basePrice:299,  currentPrice:249,  comparePrice:349,  stock:112, rating:4.7, reviewCount:4123,
      description:'12-hour battery, 3kg payload, auto face/object tracking, foldable design. Works with phone & camera.',
      images:[PHOTO_IMGS[0]], tags:['gimbal','stabilizer','video'], brand:'Stable', attributes:{ Battery:'12h', Payload:'3kg', Tracking:'AI face/object', Fold:'Compact' } },
    { slug:'photo-backdrop-kit',      name:'Pro Photo Backdrop Kit',    sku:'PHB-001', categoryId:photography.id, isFeatured:false, basePrice:189,  currentPrice:159,  comparePrice:229,  stock:156, rating:4.4, reviewCount:2341,
      description:'5 muslin backdrops + 2 LED panels + stand system. Complete studio setup under $200.',
      images:[PHOTO_IMGS[1]], tags:['studio','backdrop','lighting'], brand:'ProKit', attributes:{ Backdrops:'5 colors', Lights:'2x 45W LED', Stand:'Adjustable 2.4m' } },
    { slug:'drone-4k-mini',           name:'Pico Mini 4K Drone',        sku:'PCO-001', categoryId:photography.id, isFeatured:false, basePrice:549,  currentPrice:499,  comparePrice:649,  stock:67,  rating:4.5, reviewCount:1892,
      description:'249g (no registration needed), 4K/30fps, 30-min flight, 3-axis gimbal, wind resistance L5.',
      images:[PHOTO_IMGS[2],PHOTO_IMGS[0]], tags:['drone','mini','portable'], brand:'Pico', attributes:{ Weight:'249g', Camera:'4K/30fps', Flight:'30 min', Gimbal:'3-axis' } },
    { slug:'ring-light-18',           name:'Ring Light 18" Pro LED',    sku:'RNG-001', categoryId:photography.id, isFeatured:false, basePrice:129,  currentPrice:99,   comparePrice:159,  stock:234, rating:4.5, reviewCount:6234,
      description:'100W output, bi-color 2700–6500K, app control, 2m stand, phone holder, remote.',
      images:[PHOTO_IMGS[1]], tags:['ring-light','studio','streaming'], brand:'Ring', attributes:{ Power:'100W', Color:'2700–6500K', Control:'App + Remote', Stand:'2m' } },
    { slug:'photo-printer-instant',   name:'Snap Instant Photo Printer',sku:'SNP-001', categoryId:photography.id, isFeatured:false, basePrice:149,  currentPrice:129,  comparePrice:179,  stock:189, rating:4.4, reviewCount:3892,
      description:'Bluetooth, ZINK ink-free printing, 2x3" prints, 20-print battery, app filters.',
      images:[PHOTO_IMGS[0]], tags:['printer','instant','portable'], brand:'Snap', attributes:{ Size:'2×3"', Ink:'ZINK zero-ink', BT:'Bluetooth', Battery:'20 prints' } },

    // ── GAMING (8) ─────────────────────────────────────────────────────────
    { slug:'nexus-gaming-chair-x',    name:'Nexus Gaming Chair X Pro',  sku:'NGX-001', categoryId:gaming.id,      isFeatured:true,  basePrice:599,  currentPrice:549,  comparePrice:699,  stock:38,  rating:4.7, reviewCount:2341, dynamicPrice:true,
      description:'4D armrests, lumbar + neck massage, 180° recline, cold-foam padding, RGB base. Built for marathon sessions.',
      images:GAMING_IMGS, tags:['chair','rgb','ergonomic'], brand:'Nexus', attributes:{ Recline:'180°', Armrests:'4D adjustable', Massage:'Lumbar + Neck', Material:'PU leather' } },
    { slug:'phantom-controller-elite',name:'Phantom Elite Controller', sku:'PHN-002', categoryId:gaming.id,      isFeatured:false, basePrice:179,  currentPrice:159,  comparePrice:199,  stock:156, rating:4.8, reviewCount:7821,
      description:'Hall-effect sticks (no drift), rear paddles, adjustable triggers, 40h battery, PC + console.',
      images:[GAMING_IMGS[1],GAMING_IMGS[0]], tags:['controller','wireless','elite'], brand:'Phantom', attributes:{ Sticks:'Hall-effect', Battery:'40h', Triggers:'Adjustable', Compat:'PC, Xbox, PS' } },
    { slug:'arena-monitor-240hz',     name:'Arena Gaming Monitor 27"',  sku:'ARN-001', categoryId:gaming.id,      isFeatured:false, basePrice:699,  currentPrice:649,  comparePrice:799,  stock:54,  rating:4.7, reviewCount:1892,
      description:'IPS 240Hz, 0.5ms GtG, AMD FreeSync + Nvidia G-Sync, HDR600, 1ms MBR.',
      images:[GAMING_IMGS[2],GAMING_IMGS[3]], tags:['monitor','240hz','gaming'], brand:'Arena', attributes:{ Panel:'27" IPS', Refresh:'240Hz', Response:'0.5ms', HDR:'HDR600' } },
    { slug:'pulse-gaming-headset',    name:'Pulse 7.1 Gaming Headset',  sku:'PLS-002', categoryId:gaming.id,      isFeatured:false, basePrice:149,  currentPrice:129,  comparePrice:179,  stock:234, rating:4.6, reviewCount:5421,
      description:'3D 7.1 surround, AI noise cancellation mic, 50mm drivers, 30h wireless battery.',
      images:[GAMING_IMGS[0]], tags:['headset','surround','gaming'], brand:'Pulse', attributes:{ Surround:'7.1 Virtual', Drivers:'50mm', Battery:'30h', Mic:'AI Noise Cancel' } },
    { slug:'stream-deck-pro',         name:'Stream Deck Pro 32-Key',    sku:'STR-001', categoryId:gaming.id,      isFeatured:false, basePrice:249,  currentPrice:219,  comparePrice:299,  stock:89,  rating:4.8, reviewCount:3892,
      description:'32 LCD keys, infinite customisation, plugins for every streaming platform, scene switching.',
      images:[GAMING_IMGS[3]], tags:['streaming','deck','content'], brand:'Stream', attributes:{ Keys:'32 LCD', Software:'Plugin library', Compat:'OBS, XSplit, all platforms' } },
    { slug:'vr-headset-standalone',   name:'Immerse VR Standalone X',   sku:'IMR-001', categoryId:gaming.id,      isFeatured:false, basePrice:549,  currentPrice:499,  comparePrice:699,  stock:45,  rating:4.5, reviewCount:1234,
      description:'Standalone VR, 4K pancake lenses, 120Hz, 3.5h battery, 512GB storage, 6-DOF tracking.',
      images:[GAMING_IMGS[1]], tags:['vr','standalone','gaming'], brand:'Immerse', attributes:{ Display:'4K per eye', Refresh:'120Hz', Storage:'512GB', Battery:'3.5h' } },
    { slug:'capture-card-4k',         name:'Capture Pro 4K60 Card',     sku:'CAP-001', categoryId:gaming.id,      isFeatured:false, basePrice:199,  currentPrice:179,  comparePrice:249,  stock:134, rating:4.7, reviewCount:2341,
      description:'4K60 HDR capture, USB 3.2, ultra-low 35ms latency, works with PS5, Xbox, Switch.',
      images:[GAMING_IMGS[2]], tags:['capture','streaming','4k'], brand:'Capture', attributes:{ Resolution:'4K60 HDR', Latency:'35ms', Interface:'USB 3.2', Compat:'PS5, Xbox, Switch' } },
    { slug:'gaming-desk-mat-xl',      name:'XL Gaming Desk Mat 120cm',  sku:'GDM-001', categoryId:gaming.id,      isFeatured:false, basePrice:59,   currentPrice:49,   comparePrice:79,   stock:456, rating:4.5, reviewCount:8921,
      description:'120×60cm, 4mm thickness, non-slip rubber base, waterproof, stitched edges, RGB optional.',
      images:[GAMING_IMGS[3]], tags:['desk','mat','gaming'], brand:'Pad', attributes:{ Size:'120×60cm', Thickness:'4mm', Surface:'Micro-textured cloth', Base:'Non-slip rubber' } },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name:p.name, currentPrice:p.currentPrice, comparePrice:p.comparePrice||null,
        stock:p.stock, rating:p.rating, reviewCount:p.reviewCount,
        images:p.images, isFeatured:p.isFeatured, dynamicPrice:(p as any).dynamicPrice||false,
      },
      create: {
        slug:p.slug, name:p.name, sku:p.sku, categoryId:p.categoryId,
        isFeatured:p.isFeatured, basePrice:p.basePrice, currentPrice:p.currentPrice,
        comparePrice:p.comparePrice||null, stock:p.stock, rating:p.rating, reviewCount:p.reviewCount,
        description:p.description, images:p.images, tags:p.tags, brand:p.brand,
        attributes:p.attributes as any, dynamicPrice:(p as any).dynamicPrice||false,
        isActive:true,
      },
    })
  }

  console.log(`✅ Seeded ${products.length} products across 6 categories`)
  console.log('👤 Admin: admin@cortexcart.com / admin123')
  console.log('👤 Demo:  demo@cortexcart.com / customer123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
