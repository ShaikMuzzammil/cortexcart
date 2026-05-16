import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CortexCart...')

  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email:'admin@cortexcart.com' }, update:{},
    create: { email:'admin@cortexcart.com', name:'CortexCart Admin', password:adminHash, role:'ADMIN' },
  })

  const custHash = await bcrypt.hash('customer123', 12)
  await prisma.user.upsert({
    where: { email:'demo@cortexcart.com' }, update:{},
    create: { email:'demo@cortexcart.com', name:'Alex Rivera', password:custHash, role:'CUSTOMER', loyaltyPoints:450 },
  })

  const cats = await Promise.all([
    prisma.category.upsert({ where:{ slug:'electronics' }, update:{}, create:{ name:'Electronics', slug:'electronics', description:'Cutting-edge gadgets', image:'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' } }),
    prisma.category.upsert({ where:{ slug:'wearables'  }, update:{}, create:{ name:'Wearables',   slug:'wearables',   description:'Smart watches & fitness', image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' } }),
    prisma.category.upsert({ where:{ slug:'audio'      }, update:{}, create:{ name:'Audio',       slug:'audio',       description:'Premium sound', image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' } }),
    prisma.category.upsert({ where:{ slug:'computing'  }, update:{}, create:{ name:'Computing',   slug:'computing',   description:'Laptops & tablets', image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' } }),
    prisma.category.upsert({ where:{ slug:'photography'}, update:{}, create:{ name:'Photography', slug:'photography', description:'Cameras & gear', image:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' } }),
    prisma.category.upsert({ where:{ slug:'gaming'     }, update:{}, create:{ name:'Gaming',      slug:'gaming',      description:'Gaming peripherals', image:'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400' } }),
  ])
  const [electronics, wearables, audio, computing, photography, gaming] = cats

  const products = [
    { slug:'nexus-ultra-pro-laptop', name:'Nexus Ultra Pro 16"', description:'The most advanced AI-powered laptop with neural processing unit, 8K OLED display, and 48-hour battery. Built for creators who demand the absolute best.', basePrice:3299, currentPrice:3299, comparePrice:3899, images:['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800','https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800','https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800'], tags:['laptop','ai','pro'], brand:'Nexus', sku:'NXS-001', stock:24, rating:4.9, reviewCount:847, isFeatured:true, categoryId:computing.id, attributes:{ Processor:'Cortex X5 Neural', RAM:'64GB', Storage:'4TB NVMe', Display:'8K OLED', Battery:'180Wh' } },
    { slug:'aurora-smartwatch-x',    name:'Aurora SmartWatch X', description:'Military-grade health monitoring: real-time ECG, blood glucose prediction, stress analysis, and 21-day battery. Your most advanced health companion.', basePrice:699, currentPrice:649, comparePrice:799, images:['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'], tags:['smartwatch','health','fitness'], brand:'Aurora', sku:'AUR-001', stock:67, rating:4.8, reviewCount:2341, isFeatured:true, categoryId:wearables.id, attributes:{ Display:'2.1" AMOLED', Battery:'21 days', Waterproof:'200m', Sensors:'ECG, SpO2, Glucose' } },
    { slug:'phantom-pro-headphones', name:'Phantom Pro ANC', description:'Studio-reference sound with 50mm planar magnetic drivers, AI-adaptive noise cancellation, and 60-hour playtime. The audiophile standard.', basePrice:549, currentPrice:499, comparePrice:649, images:['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'], tags:['headphones','anc','audio'], brand:'Phantom', sku:'PHN-001', stock:112, rating:4.9, reviewCount:5672, isFeatured:true, categoryId:audio.id, attributes:{ Drivers:'50mm Planar', ANC:'AI Adaptive', Battery:'60 hours', Connectivity:'Bluetooth 5.4' } },
    { slug:'vortex-camera-z9',       name:'Vortex Z9 Pro Camera', description:'200MP full-frame mirrorless with computational AI, 8K120fps video, and 30fps burst. The definitive professional imaging tool.', basePrice:4299, currentPrice:4299, comparePrice:null, images:['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800','https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'], tags:['camera','mirrorless','pro'], brand:'Vortex', sku:'VTX-001', stock:8, rating:4.7, reviewCount:312, isFeatured:false, categoryId:photography.id, attributes:{ Sensor:'200MP Full-Frame', Video:'8K120fps RAW', ISO:'64–819200', AF:'AI 5000-point' } },
    { slug:'synapse-earbuds-pro',    name:'Synapse Earbuds Pro', description:'First earbuds with real-time translation in 47 languages, personalized sound profiles, and bone conduction backup. Hi-Res certified.', basePrice:329, currentPrice:299, comparePrice:399, images:['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800','https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'], tags:['earbuds','wireless','translation'], brand:'Synapse', sku:'SYN-001', stock:234, rating:4.6, reviewCount:8921, isFeatured:true, categoryId:audio.id, attributes:{ Drivers:'12mm Dynamic', Battery:'36h total', Features:'Live Translation', ANC:'Hybrid 6-mic' } },
    { slug:'prism-tablet-ultra',     name:'Prism Tablet Ultra 13"', description:'OLED display rivaling professional monitors. 165Hz, 99% DCI-P3, and 16,384-level pen input. Your creative studio, redefined.', basePrice:1599, currentPrice:1449, comparePrice:1799, images:['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'], tags:['tablet','drawing','oled'], brand:'Prism', sku:'PRS-001', stock:45, rating:4.8, reviewCount:1203, isFeatured:false, categoryId:computing.id, attributes:{ Display:'13" OLED 165Hz', Chip:'Prism M3', Storage:'1TB', Pen:'16384 pressure levels' } },
    { slug:'quantum-gaming-mouse',   name:'Quantum Edge Gaming Mouse', description:'36000 DPI, 0.1ms polling, AI recoil prediction, 48g magnesium chassis. The precision tool of esports champions.', basePrice:179, currentPrice:159, comparePrice:199, images:['https://images.unsplash.com/photo-1527814050087-3793815479db?w=800','https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800'], tags:['gaming','mouse','esports'], brand:'Quantum', sku:'QNT-001', stock:189, rating:4.7, reviewCount:3401, isFeatured:false, categoryId:gaming.id, attributes:{ DPI:'36000', Weight:'48g', Polling:'0.1ms', Frame:'Magnesium' } },
    { slug:'helix-fitness-band',     name:'Helix Fitness Band Pro', description:'Slim, powerful, affordable. 14-day battery, continuous SpO2, body temperature monitoring, and AI coaching that adapts to you.', basePrice:189, currentPrice:169, comparePrice:229, images:['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800','https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800'], tags:['fitness','tracker','health'], brand:'Helix', sku:'HLX-001', stock:312, rating:4.5, reviewCount:12043, isFeatured:false, categoryId:wearables.id, attributes:{ Battery:'14 days', Sensors:'SpO2, Temp, Heart', Waterproof:'5ATM', Display:'1.47" AMOLED' } },
    { slug:'echo-speaker-360',       name:'Echo 360 Spatial Speaker', description:'True omnidirectional 360° sound. Adaptive tuning auto-calibrates to your room. 40W, breathtaking spatial audio.', basePrice:449, currentPrice:399, comparePrice:499, images:['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800','https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'], tags:['speaker','audio','wireless'], brand:'Echo Labs', sku:'ECH-001', stock:78, rating:4.8, reviewCount:2107, isFeatured:true, categoryId:audio.id, attributes:{ Power:'40W', Drivers:'5 drivers 360°', Connectivity:'Wi-Fi 6, BT 5.3', Feature:'Room Adaptation AI' } },
    { slug:'carbon-keyboard-pro',    name:'Carbon MK Pro Keyboard', description:'Hall-effect magnetic switches with infinite durability. Gasket-mounted, per-key RGB, aluminum frame, wireless 40m range.', basePrice:259, currentPrice:229, comparePrice:299, images:['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800','https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800'], tags:['keyboard','mechanical','gaming'], brand:'Carbon', sku:'CBN-001', stock:143, rating:4.6, reviewCount:4231, isFeatured:false, categoryId:gaming.id, attributes:{ Switches:'Hall Effect Magnetic', Layout:'TKL', Connectivity:'2.4GHz/BT/USB-C', RGB:'16M per-key' } },
    { slug:'ion-portable-charger',   name:'Ion 30K Titan Charger', description:'30,000mAh GaN with 200W combined output. Charges a laptop fully in 45 minutes. 4 ports, digital display, aerospace aluminum.', basePrice:149, currentPrice:129, comparePrice:179, images:['https://images.unsplash.com/photo-1609592806808-48e6d1e77219?w=800'], tags:['charger','portable','gan'], brand:'Ion', sku:'ION-001', stock:445, rating:4.7, reviewCount:18430, isFeatured:false, categoryId:electronics.id, attributes:{ Capacity:'30,000mAh', Output:'200W Total', Ports:'4 (2xUSB-C, 2xUSB-A)', Tech:'GaN III' } },
    { slug:'stellar-drone-x4',       name:'Stellar X4 Pro Drone', description:'8K/60fps aerial cinema. 40-min flight, 15km range, AI subject tracking with cinematic shot modes. Folds to bottle size.', basePrice:2199, currentPrice:1999, comparePrice:2499, images:['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800','https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800'], tags:['drone','camera','aerial'], brand:'Stellar', sku:'STL-001', stock:19, rating:4.8, reviewCount:671, isFeatured:true, categoryId:photography.id, attributes:{ Camera:'8K/60fps', Flight:'40 min', Range:'15km', Obstacle:'6-direction sensing' } },
  ]

  for (const p of products) {
    await prisma.product.upsert({ where:{ sku:p.sku }, update:{ currentPrice:p.currentPrice, stock:p.stock }, create: p as any })
  }

  console.log('✅ Seeded successfully!')
  console.log('   👤 admin@cortexcart.com / admin123')
  console.log('   👤 demo@cortexcart.com  / customer123')
  console.log(`   📦 ${products.length} products`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
