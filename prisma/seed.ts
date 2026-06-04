import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CortexCart GODMODE v2 ...')

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminHash    = await bcrypt.hash('admin123', 12)
  const customerHash = await bcrypt.hash('customer123', 12)

  await prisma.user.upsert({ where:{ email:'admin@cortexcart.com' }, update:{}, create:{ email:'admin@cortexcart.com', name:'CortexCart Admin', password:adminHash, role:'ADMIN' } })
  await prisma.user.upsert({ where:{ email:'demo@cortexcart.com' },  update:{}, create:{ email:'demo@cortexcart.com',  name:'Alex Rivera',       password:customerHash, role:'CUSTOMER', loyaltyPoints:450 } })

  // ── Categories ────────────────────────────────────────────────────────────
  const [electronics, wearables, audio, computing, photography, gaming] = await Promise.all([
    prisma.category.upsert({ where:{slug:'electronics'}, update:{}, create:{ name:'Electronics',  slug:'electronics',  description:'Cutting-edge tech gadgets',           image:'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' } }),
    prisma.category.upsert({ where:{slug:'wearables'},   update:{}, create:{ name:'Wearables',    slug:'wearables',    description:'Smart watches & fitness trackers',     image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' } }),
    prisma.category.upsert({ where:{slug:'audio'},       update:{}, create:{ name:'Audio',        slug:'audio',        description:'Premium headphones & speakers',        image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' } }),
    prisma.category.upsert({ where:{slug:'computing'},   update:{}, create:{ name:'Computing',    slug:'computing',    description:'Laptops, tablets & accessories',       image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' } }),
    prisma.category.upsert({ where:{slug:'photography'}, update:{}, create:{ name:'Photography',  slug:'photography',  description:'Cameras, lenses & studio gear',        image:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' } }),
    prisma.category.upsert({ where:{slug:'gaming'},      update:{}, create:{ name:'Gaming',       slug:'gaming',       description:'Gaming peripherals & accessories',     image:'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400' } }),
  ])

  // ── Products ──────────────────────────────────────────────────────────────
  const PRODUCTS: any[] = [
    // COMPUTING
    { slug:'nexus-ultra-pro-laptop',  name:'Nexus Ultra Pro 16"',        sku:'NXS-001', cat:computing.id,   featured:true,  baseP:3299, currP:3299, compP:3899, stock:24,  rate:4.9, rCnt:847,
      desc:'The most advanced AI-powered laptop with neural processing unit, 8K OLED display and 48-hour battery life.',
      imgs:['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800','https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800'],
      tags:['laptop','ai','pro','4k'], brand:'Nexus', attrs:{Processor:'Cortex X5 Neural 5.8GHz',RAM:'64GB DDR5',Storage:'4TB NVMe Gen5',Display:'16" 8K OLED 144Hz'} },
    { slug:'prism-tablet-ultra',       name:'Prism Tablet Ultra 13"',      sku:'PRS-001', cat:computing.id,   featured:false, baseP:1599, currP:1449, compP:1799, stock:45,  rate:4.8, rCnt:1203,
      desc:'Studio-grade 13" OLED display rivalling professional monitors. 165Hz, 99% DCI-P3, 16384-level stylus input.',
      imgs:['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'],
      tags:['tablet','drawing','oled','stylus'], brand:'Prism', attrs:{Display:'13" OLED 165Hz',Chip:'Prism M3 Ultra',Storage:'1TB NVMe'} },
    { slug:'apex-ultrabook-14',        name:'Apex UltraBook 14"',          sku:'APX-001', cat:computing.id,   featured:false, baseP:2199, currP:1999, compP:2499, stock:31,  rate:4.7, rCnt:634,
      desc:'Ultra-thin 10mm profile, 32-hour battery, lightest performance laptop at 880g. Perfect for professionals.',
      imgs:['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800','https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=800'],
      tags:['ultrabook','thin','lightweight'], brand:'Apex', attrs:{Thickness:'10mm',Weight:'880g',Display:'14" 4K OLED'} },
    { slug:'nova-mini-pc',             name:'Nova Mini PC Pro',             sku:'NOV-001', cat:computing.id,   featured:false, baseP:899,  currP:799,  compP:999,  stock:58,  rate:4.6, rCnt:421,
      desc:'Desktop-class performance in your palm. 12-core processor, 64GB RAM, dual 4K output.',
      imgs:['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'],
      tags:['mini-pc','desktop','compact'], brand:'Nova', attrs:{CPU:'12-core 5.4GHz',RAM:'64GB DDR5',Storage:'2TB NVMe'} },
    { slug:'studio-monitor-27',        name:'Studio Monitor 27" 4K OLED',  sku:'NSM-001', cat:computing.id,   featured:false, baseP:1299, currP:1149, compP:1499, stock:36,  rate:4.7, rCnt:567,
      desc:'Professional 4K OLED monitor with ambient sensing, built-in wireless charging base and USB-C hub.',
      imgs:['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
      tags:['monitor','4k','oled'], brand:'Nexus', attrs:{Size:'27" 4K OLED',Refresh:'165Hz',HDR:'HDR10+ 1000nit'} },
    { slug:'keystone-mech-kb',         name:'Keystone Mech 75% Keyboard',  sku:'KYS-001', cat:computing.id,   featured:false, baseP:189,  currP:169,  compP:229,  stock:143, rate:4.5, rCnt:2341,
      desc:'Compact 75% hot-swappable mechanical keyboard with aluminum body and per-key RGB.',
      imgs:['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800'],
      tags:['keyboard','mechanical','wireless'], brand:'Keystone', attrs:{Layout:'75%',Switches:'Hot-swap',RGB:'Per-key',Battery:'3000mAh'} },

    // ELECTRONICS
    { slug:'nexus-phone-ultra',        name:'Nexus Phone Ultra',            sku:'NPU-001', cat:electronics.id, featured:true,  baseP:1299, currP:1199, compP:1499, stock:89,  rate:4.9, rCnt:5423,
      desc:'Flagship phone with triple AI cameras, 6.8" LTPO4 AMOLED 120Hz, 200W fast charge and satellite SOS.',
      imgs:['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
      tags:['smartphone','flagship','5g','ai'], brand:'Nexus', attrs:{Display:'6.8" LTPO4 AMOLED 120Hz',Camera:'200MP AI triple',Battery:'5800mAh 200W'} },
    { slug:'prism-phone-air',          name:'Prism Phone Air',              sku:'PPA-001', cat:electronics.id, featured:false, baseP:899,  currP:849,  compP:999,  stock:124, rate:4.7, rCnt:2876,
      desc:'Ultra-thin 5.5mm profile. 50MP ProCamera, all-day 4800mAh battery, sapphire display.',
      imgs:['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
      tags:['smartphone','thin','elegant'], brand:'Prism', attrs:{Thickness:'5.5mm',Camera:'50MP f/1.7',Display:'6.1" OLED'} },
    { slug:'node-wifi7-router',        name:'Node Wi-Fi 7 Mesh Router',     sku:'NDR-001', cat:electronics.id, featured:false, baseP:499,  currP:449,  compP:599,  stock:67,  rate:4.8, rCnt:1876,
      desc:'Wi-Fi 7 BE19000 tri-band. Covers 10,000 sq ft zero dead zones with AI traffic shaping.',
      imgs:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
      tags:['router','wifi7','networking','mesh'], brand:'Node', attrs:{Standard:'Wi-Fi 7 BE19000',Speed:'19 Gbps',Coverage:'10,000 sq ft'} },
    { slug:'pixel-projector-4k',       name:'Pixel Laser Projector 4K',     sku:'PLJ-001', cat:electronics.id, featured:true,  baseP:2499, currP:2199, compP:2899, stock:19,  rate:4.8, rCnt:743,
      desc:'Laser projector 3000 ANSI lumens, auto-keystone, auto-focus, Android TV 11 built-in.',
      imgs:['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800'],
      tags:['projector','laser','home-theater','4k'], brand:'Pixel', attrs:{Lumens:'3000 ANSI',Resolution:'4K UHD',SmartOS:'Android TV 11'} },
    { slug:'nova-power-station-30k',   name:'Nova 30K Power Station',       sku:'NPB-030', cat:electronics.id, featured:false, baseP:149,  currP:119,  compP:179,  stock:156, rate:4.7, rCnt:4532,
      desc:'30,000mAh, 140W total output. Charges laptop + 3 phones simultaneously with digital display.',
      imgs:['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'],
      tags:['power-bank','travel','charging'], brand:'Nova', attrs:{Capacity:'30,000mAh',Output:'140W total',Ports:'4 ports USB-A/C'} },
    { slug:'ion-titan-charger',        name:'Ion 30K Titan Charger',        sku:'ION-030', cat:electronics.id, featured:false, baseP:129,  currP:99,   compP:149,  stock:3,   rate:4.8, rCnt:100,
      desc:'Compact 30,000mAh GaN 100W PD power bank with Qi wireless charging pad on top.',
      imgs:['https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800'],
      tags:['charger','power-bank','gan','wireless'], brand:'Ion', attrs:{Capacity:'30,000mAh',GaN:'100W PD',Wireless:'Qi 15W'} },
    { slug:'aura-smart-bulb-4pack',    name:'Aura Smart Bulb 4-Pack',       sku:'ASB-004', cat:electronics.id, featured:false, baseP:79,   currP:59,   compP:99,   stock:234, rate:4.5, rCnt:3421,
      desc:'16M colors, music sync, voice control, app scheduling. Transform any room instantly.',
      imgs:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
      tags:['smart-home','lighting','rgb'], brand:'Aura', attrs:{Colors:'16M',Wattage:'15W equiv 100W',Pack:'4 bulbs'} },

    // WEARABLES
    { slug:'nexus-watch-ultra',        name:'Nexus Watch Ultra',            sku:'NWU-001', cat:wearables.id,   featured:true,  baseP:799,  currP:699,  compP:899,  stock:43,  rate:4.9, rCnt:2341,
      desc:'Titanium build, ECG + SpO2 + glucose monitoring, 3-week battery, offline maps. Medical-grade sensors.',
      imgs:['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'],
      tags:['smartwatch','fitness','health','medical'], brand:'Nexus', attrs:{Build:'Titanium grade 5',Battery:'3 weeks',Sensors:'ECG SpO2 Glucose'} },
    { slug:'orbit-fitness-band-5',     name:'Orbit Fitness Band 5',         sku:'OFB-005', cat:wearables.id,   featured:false, baseP:149,  currP:119,  compP:179,  stock:187, rate:4.7, rCnt:5673,
      desc:'Slim AMOLED, 14-day battery, 100+ workout modes, advanced sleep coach and stress tracking.',
      imgs:['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800'],
      tags:['fitness','band','health','amoled'], brand:'Orbit', attrs:{Display:'AMOLED',Battery:'14 days',Modes:'100+ workouts'} },
    { slug:'prism-smartwatch-pro',     name:'Prism Smartwatch Pro',         sku:'PSP-001', cat:wearables.id,   featured:false, baseP:449,  currP:399,  compP:549,  stock:76,  rate:4.8, rCnt:1892,
      desc:'Sapphire crystal, stainless steel, always-on AMOLED. 7-day battery, precision multi-band GPS.',
      imgs:['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
      tags:['smartwatch','luxury','premium'], brand:'Prism', attrs:{Crystal:'Sapphire',Battery:'7 days',GPS:'Multi-band dual-frequency'} },
    { slug:'halo-smart-ring-2',        name:'Halo Smart Ring Gen 2',        sku:'HSR-002', cat:wearables.id,   featured:false, baseP:329,  currP:299,  compP:399,  stock:64,  rate:4.6, rCnt:1023,
      desc:'Discreet health tracking ring. HRV, SpO2, sleep quality, temperature sensing. 7-day battery.',
      imgs:['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'],
      tags:['ring','health','fitness'], brand:'Halo', attrs:{Battery:'7 days',Sensors:'HRV SpO2 Skin Temp',Material:'Titanium'} },
    { slug:'nexus-ar-glasses',         name:'Nexus AR Glasses Lite',        sku:'NAR-001', cat:wearables.id,   featured:true,  baseP:999,  currP:899,  compP:1199, stock:28,  rate:4.7, rCnt:456,
      desc:'Augmented reality glasses with navigation overlay, live translation, hands-free AI assistant.',
      imgs:['https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800'],
      tags:['ar','glasses','ai'], brand:'Nexus', attrs:{Display:'Waveguide AR 45° FOV',Battery:'8h active',Connectivity:'BT 5.3 + WiFi 6'} },
    { slug:'vibe-earbuds-pro3',        name:'Vibe Earbuds Pro 3',           sku:'VBE-003', cat:wearables.id,   featured:false, baseP:199,  currP:179,  compP:249,  stock:231, rate:4.7, rCnt:7834,
      desc:'45dB hybrid ANC, bone-conduction call mic, IPX5 waterproof, spatial audio, 36-hour total battery.',
      imgs:['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'],
      tags:['earbuds','anc','wireless','spatial'], brand:'Vibe', attrs:{ANC:'45dB hybrid',Battery:'9h + 27h case',IPX:'IPX5'} },

    // AUDIO
    { slug:'apex-headphones-max',      name:'Apex Headphones MAX',          sku:'APH-MAX', cat:audio.id,       featured:true,  baseP:449,  currP:399,  compP:549,  stock:67,  rate:4.9, rCnt:9823,
      desc:'50mm planar magnetic drivers, 45dB hybrid ANC, lossless Hi-Res Audio, 40-hour battery life.',
      imgs:['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800','https://images.unsplash.com/photo-1578319439584-104c94d37305?w=800'],
      tags:['headphones','anc','hifi','planar'], brand:'Apex', attrs:{Driver:'50mm Planar Magnetic',ANC:'45dB hybrid',Battery:'40h',Audio:'Hi-Res 192kHz/32bit'} },
    { slug:'bass-pro-tower-speakers',  name:'Bass Pro Tower Speakers',      sku:'BPS-001', cat:audio.id,       featured:false, baseP:899,  currP:799,  compP:1099, stock:24,  rate:4.8, rCnt:673,
      desc:'360° room-filling sound, 200W class-D amp, LDAC lossless streaming, built-in voice assistant.',
      imgs:['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'],
      tags:['speakers','hifi','wireless','ldac'], brand:'Bass Pro', attrs:{Power:'200W',Connectivity:'Wi-Fi + LDAC + AirPlay2',Codec:'LDAC/aptX HD'} },
    { slug:'vibe-soundbar-ultra',      name:'Vibe SoundBar Ultra 5.1',      sku:'VSB-001', cat:audio.id,       featured:false, baseP:599,  currP:499,  compP:749,  stock:38,  rate:4.7, rCnt:1234,
      desc:'Dolby Atmos + DTS:X 5.1 surround with wireless subwoofer. Cinematic audio at home.',
      imgs:['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'],
      tags:['soundbar','atmos','home-theater'], brand:'Vibe', attrs:{Format:'Dolby Atmos + DTS:X',Channels:'5.1.4',Power:'400W RMS'} },
    { slug:'studio-condenser-mic',     name:'Studio Condenser Pro Mic',     sku:'SCM-001', cat:audio.id,       featured:false, baseP:349,  currP:299,  compP:449,  stock:82,  rate:4.8, rCnt:4562,
      desc:'Large diaphragm condenser mic. 4 polar patterns, 32-bit float recording, USB-C & XLR dual.',
      imgs:['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800'],
      tags:['microphone','studio','streaming'], brand:'Studio Pro', attrs:{Patterns:'4 polar',Interface:'USB-C + XLR',Bit:'32-bit float'} },
    { slug:'hifi-dac-amp-portable',    name:'HiFi DAC/AMP Portable',        sku:'HDA-001', cat:audio.id,       featured:false, baseP:249,  currP:199,  compP:299,  stock:54,  rate:4.8, rCnt:2341,
      desc:'Balanced 4.4mm + 3.5mm output, 32-bit/768kHz, MQA full decoder, 11h battery, USB-C.',
      imgs:['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'],
      tags:['dac','amp','audiophile'], brand:'HiFi Labs', attrs:{Output:'4.4mm balanced + 3.5mm',Resolution:'32-bit/768kHz',MQA:'Full Decoder'} },

    // PHOTOGRAPHY
    { slug:'vortex-camera-z9',         name:'Vortex Z9 Pro Mirrorless',     sku:'VCZ-009', cat:photography.id, featured:true,  baseP:5499, currP:4999, compP:5999, stock:12,  rate:4.9, rCnt:456,
      desc:'90MP BSI-CMOS sensor, 30fps RAW burst, 8K30 ProRes video, dual card slots, 8-stop IBIS.',
      imgs:['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800','https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800'],
      tags:['camera','mirrorless','professional','8k'], brand:'Vortex', attrs:{Sensor:'90MP BSI-CMOS',Video:'8K ProRes RAW',IBIS:'8-stop',FPS:'30fps RAW'} },
    { slug:'snap-action-camera-pro',   name:'Snap Action Pro X',            sku:'SAP-001', cat:photography.id, featured:false, baseP:499,  currP:449,  compP:599,  stock:89,  rate:4.8, rCnt:7823,
      desc:'5.3K 60fps, 360° HorizonLock, 4-mic wind elimination, 90m waterproof rating.',
      imgs:['https://images.unsplash.com/photo-1512499617640-c2f999098c01?w=800'],
      tags:['action-camera','waterproof','4k','gopro'], brand:'Snap', attrs:{Resolution:'5.3K 60fps',Waterproof:'90m',Stabilization:'HorizonLock 360°'} },
    { slug:'optix-85mm-prime',         name:'Optix 85mm f/1.2 Prime',       sku:'OPX-085', cat:photography.id, featured:false, baseP:1799, currP:1599, compP:1999, stock:18,  rate:4.9, rCnt:892,
      desc:'Masterpiece portrait lens. 15-element nano-coated design, silent AF, cinematic 3D bokeh.',
      imgs:['https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800'],
      tags:['lens','portrait','prime','bokeh'], brand:'Optix', attrs:{Focal:'85mm',Aperture:'f/1.2',Elements:'15 in 12 groups',Coating:'Nano-AR'} },
    { slug:'stellar-drone-x4',         name:'Stellar Drone X4 Pro',         sku:'SDX-004', cat:photography.id, featured:true,  baseP:1899, currP:1699, compP:2199, stock:22,  rate:4.8, rCnt:1234,
      desc:'50MP Hasselblad sensor, 52-min flight time, omnidirectional obstacle sensing, 20km range.',
      imgs:['https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800'],
      tags:['drone','aerial','4k','hasselblad'], brand:'Stellar', attrs:{Camera:'50MP Hasselblad L-format',FlightTime:'52 min',Range:'20km O4+'} },
    { slug:'gimbal-pro-3axis',         name:'Gimbal Pro 3-Axis 4K',         sku:'GMP-001', cat:photography.id, featured:false, baseP:299,  currP:249,  compP:399,  stock:56,  rate:4.7, rCnt:3421,
      desc:'3-axis stabilization, 12h battery, AI subject tracking, timelapse, hyperlapse modes.',
      imgs:['https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=800'],
      tags:['gimbal','stabilizer','video','ai'], brand:'Gimbal Pro', attrs:{Axes:'3-axis',Payload:'2.5kg',Battery:'12h',AI:'Subject + face tracking'} },
    { slug:'lume-led-panel-600',       name:'Lume LED Panel 600',           sku:'LLP-600', cat:photography.id, featured:false, baseP:299,  currP:249,  compP:379,  stock:47,  rate:4.6, rCnt:876,
      desc:'Bi-color LED 600W equivalent, 2700–7500K tunable, CRI 97+, silent fan-free, app+DMX control.',
      imgs:['https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800'],
      tags:['lighting','led','studio','bi-color'], brand:'Lume', attrs:{Power:'600W equiv',ColorTemp:'2700–7500K',CRI:'97+',Control:'App + DMX'} },

    // GAMING
    { slug:'quantum-gaming-mouse',     name:'Quantum Gaming Mouse Pro',     sku:'QGM-001', cat:gaming.id,      featured:false, baseP:149,  currP:129,  compP:179,  stock:198, rate:4.9, rCnt:8923,
      desc:'40K DPI hero sensor, 100M click lifetime switches, 95h battery, 2.4GHz 1ms wireless.',
      imgs:['https://images.unsplash.com/photo-1527814050087-3793815479db?w=800'],
      tags:['mouse','gaming','wireless'], brand:'Quantum', attrs:{DPI:'40,000 hero sensor',Switches:'100M clicks',Battery:'95h',Wireless:'2.4GHz 1ms'} },
    { slug:'carbon-keyboard-tkl',      name:'Carbon Keyboard Pro TKL',      sku:'CKP-001', cat:gaming.id,      featured:false, baseP:229,  currP:199,  compP:279,  stock:134, rate:4.8, rCnt:5678,
      desc:'TKL optical-magnetic switches, 4000Hz polling, aircraft aluminium case, per-key RGB, PBT doubleshot.',
      imgs:['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800'],
      tags:['keyboard','gaming','mechanical'], brand:'Carbon', attrs:{Form:'TKL',Switches:'Optical-magnetic',Polling:'4000Hz',RGB:'Per-key'} },
    { slug:'titan-gaming-headset',     name:'Titan Gaming Headset 7.1',     sku:'TGH-001', cat:gaming.id,      featured:false, baseP:199,  currP:169,  compP:249,  stock:89,  rate:4.7, rCnt:6781,
      desc:'Virtual 7.1 surround, 50mm Graphene drivers, Discord-certified retractable mic, leatherette earcups.',
      imgs:['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800'],
      tags:['headset','gaming','surround'], brand:'Titan', attrs:{Surround:'7.1 Virtual',Drivers:'50mm Graphene',Mic:'Discord certified'} },
    { slug:'nexus-gaming-monitor-32',  name:'Nexus 32" Gaming Monitor',     sku:'NGM-032', cat:gaming.id,      featured:true,  baseP:899,  currP:799,  compP:1099, stock:34,  rate:4.8, rCnt:2341,
      desc:'4K OLED 240Hz, 0.03ms GtG response, HDMI 2.1, G-Sync + FreeSync Premium, 1000-nit peak.',
      imgs:['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
      tags:['monitor','gaming','oled','4k'], brand:'Nexus', attrs:{Panel:'32" 4K OLED',Refresh:'240Hz',ResponseTime:'0.03ms GtG',VRR:'G-Sync + FreeSync'} },
    { slug:'apex-gaming-chair-pro',    name:'Apex Gaming Chair Pro',        sku:'AGC-001', cat:gaming.id,      featured:false, baseP:599,  currP:499,  compP:749,  stock:27,  rate:4.6, rCnt:1897,
      desc:'4D adjustable armrests, cold-cure memory foam, lumbar + neck pillow, 165° recline.',
      imgs:['https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=800'],
      tags:['chair','gaming','ergonomic'], brand:'Apex', attrs:{Recline:'165°',Armrests:'4D adjustable',Foam:'Cold-cure memory'} },
    { slug:'vr-headset-pro',           name:'VR Headset Pro 4K',            sku:'VRP-001', cat:gaming.id,      featured:true,  baseP:699,  currP:599,  compP:849,  stock:41,  rate:4.7, rCnt:2134,
      desc:'4K per-eye pancake lenses, 120° FOV, 120Hz refresh, 6DOF inside-out tracking, standalone + PC mode.',
      imgs:['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800'],
      tags:['vr','gaming','immersive','metaverse'], brand:'VR Pro', attrs:{Display:'4K per eye pancake',FOV:'120°',Refresh:'120Hz',Tracking:'6DOF inside-out'} },
    { slug:'streamdeck-pro-15',        name:'StreamDeck Pro 15-key',        sku:'SDP-015', cat:gaming.id,      featured:false, baseP:149,  currP:129,  compP:179,  stock:67,  rate:4.8, rCnt:4523,
      desc:'15 customizable LCD keys, animated icons, multi-action macros, USB-C. Works with 1000+ apps.',
      imgs:['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800'],
      tags:['streaming','controller','productivity'], brand:'StreamDeck', attrs:{Keys:'15 LCD',Connectivity:'USB-C',Apps:'1000+ integrations'} },
    { slug:'nexus-controller-elite',   name:'Nexus Elite Controller',       sku:'NCE-001', cat:gaming.id,      featured:false, baseP:179,  currP:149,  compP:219,  stock:76,  rate:4.8, rCnt:3456,
      desc:'Hall-effect thumbsticks (zero drift), 60h battery, 4 back paddles, adjustable hair triggers.',
      imgs:['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800'],
      tags:['controller','gamepad','wireless'], brand:'Nexus', attrs:{Sticks:'Hall-effect no-drift',Battery:'60h',Paddles:'4 back paddles'} },
    { slug:'precision-gaming-pad-xxl', name:'Precision XXL Gaming Pad',     sku:'PGP-XXL', cat:gaming.id,      featured:false, baseP:59,   currP:49,   compP:79,   stock:289, rate:4.7, rCnt:11234,
      desc:'900x400mm desk-wide, micro-textured cloth surface, stitched anti-fray edges, 3mm thick.',
      imgs:['https://images.unsplash.com/photo-1527814050087-3793815479db?w=800'],
      tags:['mousepad','gaming','xl','desk'], brand:'Precision', attrs:{Size:'900x400mm',Thickness:'3mm',Surface:'Micro-textured cloth'} },
  ]

  let created = 0, skipped = 0
  for (const p of PRODUCTS) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (exists) { skipped++; continue }
    await prisma.product.create({
      data: {
        slug:             p.slug,
        sku:              p.sku,
        name:             p.name,
        description:      p.desc,
        brand:            p.brand || null,
        categoryId:       p.cat,
        images:           p.imgs,
        tags:             p.tags,
        basePrice:        p.baseP,
        currentPrice:     p.currP,
        comparePrice:     p.compP || null,
        stock:            p.stock,
        rating:           p.rate,
        reviewCount:      p.rCnt,
        isFeatured:       p.featured || false,
        isDeal:           p.currP < p.baseP,
        isActive:         true,
        attributes:       p.attrs as any,
      }
    })
    created++
  }

  console.log(`✅ Created ${created} products, skipped ${skipped} existing`)
  console.log('🎉 CortexCart GODMODE v2 seed complete! Admin: admin@cortexcart.com / admin123')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
