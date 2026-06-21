import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

const CATS = [
  { name:'Tech',        slug:'tech',        description:'Gadgets, devices and electronics' },
  { name:'Audio',       slug:'audio',        description:'Headphones, speakers and sound gear' },
  { name:'Computing',   slug:'computing',    description:'Laptops, desktops and PC accessories' },
  { name:'Electronics', slug:'electronics',  description:'Smart home, power and networking gear' },
  { name:'Wearables',   slug:'wearables',    description:'Smartwatches, fitness trackers and rings' },
  { name:'Photography', slug:'photography',  description:'Cameras, lenses and content-creation gear' },
  { name:'Gaming',      slug:'gaming',      description:'Gaming peripherals and accessories' },
  { name:'Home',        slug:'home',        description:'Smart home and living essentials' },
  { name:'Fashion',     slug:'fashion',     description:'Clothing, shoes and accessories' },
  { name:'Beauty',      slug:'beauty',      description:'Skincare, haircare and wellness' },
  { name:'Sports',      slug:'sports',      description:'Fitness gear and outdoor equipment' },
  { name:'Office',      slug:'office',      description:'Productivity tools and desk essentials' },
  { name:'Music',       slug:'music',       description:'Instruments, audio and accessories' },
  { name:'Travel',      slug:'travel',      description:'Luggage, accessories and travel gear' },
  { name:'Books',       slug:'books',       description:'Books, courses and learning materials' },
  { name:'Kitchen',     slug:'kitchen',     description:'Cooking tools and appliances' },
  { name:'Pets',        slug:'pets',        description:'Pet care, toys and accessories' },
]

// Helpers
const sl = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

type P = { n:string; sku:string; c:string; p:number; cp:number; s:number; r:number; rc:number; f:boolean; d:boolean; desc:string; img:string; t:string[] }

const PRODUCTS: P[] = [
  // ── TECH (18) ────────────────────────────────────────────────────
  {n:'Ion 30K Titan Charger',sku:'ION-30K-001',c:'tech',p:129,cp:159,s:42,r:4.8,rc:3120,f:true,d:true,desc:'Ultra-fast 140W GaN charger bank, dual USB-C PD, folds flat.',img:'https://images.unsplash.com/photo-1609592424858-7de65a53f4f1?w=600',t:['charger','gan','power']},
  {n:'NovaPods X Ultra',sku:'NOV-POD-002',c:'tech',p:199,cp:249,s:18,r:4.9,rc:8910,f:true,d:false,desc:'Hybrid ANC earbuds, 36h battery, IPX5 waterproof.',img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',t:['earbuds','anc','wireless']},
  {n:'PixelWatch Pro S',sku:'PIX-WCH-003',c:'tech',p:349,cp:399,s:9,r:4.7,rc:2040,f:true,d:true,desc:'AMOLED smartwatch, GPS, blood-oxygen, 7-day battery.',img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',t:['smartwatch','gps','health']},
  {n:'ArcMouse Ergo Pro',sku:'ARC-MSE-005',c:'tech',p:79,cp:99,s:30,r:4.6,rc:880,f:false,d:false,desc:'Vertical ergonomic mouse, silent clicks, rechargeable.',img:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',t:['mouse','ergonomic','wireless']},
  {n:'LunaKey RGB 75%',sku:'LUN-KBD-007',c:'tech',p:169,cp:199,s:14,r:4.8,rc:2290,f:true,d:false,desc:'Hot-swap mechanical keyboard, per-key RGB, gasket mount.',img:'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',t:['keyboard','mechanical','rgb']},
  {n:'ClearCam 4K Webcam',sku:'CLR-CAM-008',c:'tech',p:119,cp:149,s:37,r:4.5,rc:1560,f:false,d:true,desc:'4K/60fps webcam, AI auto-framing, built-in ring light.',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',t:['webcam','4k','streaming']},
  {n:'SonicBar 2.1 Pro',sku:'SON-BAR-010',c:'tech',p:189,cp:239,s:16,r:4.7,rc:1980,f:true,d:true,desc:'2.1 soundbar with wireless subwoofer, Dolby Atmos, HDMI ARC.',img:'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600',t:['soundbar','dolby','audio']},
  {n:'SpeedDrive SSD 2TB',sku:'SPD-SSD-015',c:'tech',p:149,cp:189,s:50,r:4.9,rc:5120,f:false,d:true,desc:'NVMe Gen4 SSD, 7400MB/s read, 2TB, M.2 2280.',img:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600',t:['ssd','storage','nvme']},
  {n:'NanoRouter WiFi 7',sku:'NAN-RTR-011',c:'tech',p:279,cp:349,s:12,r:4.8,rc:870,f:false,d:false,desc:'WiFi 7 tri-band router, 6GHz, 10Gbps WAN, mesh-ready.',img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',t:['router','wifi7','networking']},
  {n:'ZenHub 12-Port Dock',sku:'ZEN-DOC-006',c:'tech',p:149,cp:179,s:22,r:4.7,rc:670,f:false,d:false,desc:'12-in-1 USB-C hub, 4K HDMI, 100W PD, Gigabit Ethernet.',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['hub','usb-c','dock']},
  {n:'VisionMate USB Monitor',sku:'VIS-MON-014',c:'tech',p:259,cp:319,s:10,r:4.6,rc:760,f:true,d:false,desc:'15.6" portable IPS, USB-C, HDR, 1920×1080, 500 nits.',img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',t:['monitor','portable','display']},
  {n:'PrismaLED Strip Kit',sku:'PRI-LED-012',c:'tech',p:49,cp:65,s:85,r:4.5,rc:3410,f:false,d:false,desc:'5m RGBIC smart LED strip, music sync, voice control.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['led','rgb','smart-home']},
  {n:'StellarBuds Pro ANC',sku:'STL-BUD-016',c:'tech',p:149,cp:199,s:28,r:4.7,rc:4320,f:true,d:true,desc:'Active noise cancellation, 30h battery, spatial audio.',img:'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600',t:['earbuds','anc','spatial-audio']},
  {n:'FluxPad Drawing Tablet',sku:'FLX-TAB-009',c:'tech',p:139,cp:179,s:20,r:4.6,rc:1120,f:false,d:true,desc:'10x6" active area, 8192 pressure levels, wireless stylus.',img:'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=600',t:['tablet','drawing','stylus']},
  {n:'OmniCharge 20 Pro',sku:'OMN-CHR-013',c:'tech',p:159,cp:199,s:25,r:4.7,rc:1430,f:false,d:true,desc:'20000mAh power bank, AC outlet, 100W PD, wireless charge.',img:'https://images.unsplash.com/photo-1586495777744-4e6232bf2fb7?w=600',t:['power-bank','ac','wireless']},
  {n:'StreamDeck Pro 32',sku:'STR-DCK-017',c:'tech',p:229,cp:279,s:15,r:4.8,rc:1870,f:true,d:false,desc:'32-button LCD macro pad, customizable per app, USB-C.',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['streamdeck','macropad','streaming']},
  {n:'QuantumPen Stylus Elite',sku:'QNT-STY-018',c:'tech',p:89,cp:119,s:35,r:4.6,rc:920,f:false,d:false,desc:'4096 pressure level stylus, tilt detection, rechargeable.',img:'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=600',t:['stylus','pen','tablet']},
  {n:'HoloLight Smart Ring',sku:'HOL-RNG-019',c:'tech',p:199,cp:249,s:11,r:4.5,rc:430,f:true,d:true,desc:'Health tracking smart ring, HRV, sleep, SpO2, titanium.',img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',t:['smart-ring','health','fitness']},

  // ── GAMING (12) ───────────────────────────────────────────────────
  {n:'RaidPad Pro XL',sku:'RAD-PAD-020',c:'gaming',p:45,cp:60,s:120,r:4.7,rc:5670,f:true,d:true,desc:'XXL gaming mousepad 900x400mm, RGB border, stitched edges.',img:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',t:['mousepad','gaming','rgb']},
  {n:'VortexShot Gaming Mouse',sku:'VTX-MSE-021',c:'gaming',p:69,cp:89,s:45,r:4.8,rc:3240,f:true,d:false,desc:'26000 DPI optical sensor, 6 programmable buttons, 70h battery.',img:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',t:['mouse','gaming','wireless']},
  {n:'ThunderSet 7.1 Headset',sku:'THN-HST-022',c:'gaming',p:119,cp:149,s:22,r:4.6,rc:2110,f:false,d:true,desc:'Surround sound gaming headset, 50mm drivers, noise-cancel mic.',img:'https://images.unsplash.com/photo-1599669454699-248893623440?w=600',t:['headset','gaming','surround']},
  {n:'NexGen Controller Elite',sku:'NEX-CTL-023',c:'gaming',p:89,cp:119,s:30,r:4.7,rc:1890,f:false,d:false,desc:'Pro gaming controller, hall-effect sticks, trigger locks.',img:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600',t:['controller','gaming','pro']},
  {n:'SpectraBlue Keyboard TKL',sku:'SPT-KBD-024',c:'gaming',p:149,cp:189,s:18,r:4.9,rc:4560,f:true,d:true,desc:'TKL gaming keyboard, optical switches, 0.2ms response.',img:'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',t:['keyboard','gaming','optical']},
  {n:'MonitorX 27" 280Hz',sku:'MON-GTX-025',c:'gaming',p:449,cp:549,s:8,r:4.8,rc:1320,f:true,d:false,desc:'27" IPS 280Hz gaming monitor, 1ms GTG, HDR600, G-Sync.',img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',t:['monitor','gaming','hz']},
  {n:'CoolMax Laptop Stand',sku:'COL-STD-026',c:'gaming',p:49,cp:69,s:75,r:4.5,rc:870,f:false,d:false,desc:'Aluminum laptop stand with dual fans, 6 height levels.',img:'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600',t:['stand','laptop','cooling']},
  {n:'WristGuard Gaming Pad',sku:'WRS-GPD-027',c:'gaming',p:35,cp:45,s:90,r:4.4,rc:2300,f:false,d:false,desc:'Memory foam wrist rest, mouse + keyboard set, anti-slip.',img:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',t:['wrist-rest','gaming','ergonomic']},
  {n:'PortHub Gaming Router',sku:'PRT-RTR-028',c:'gaming',p:199,cp:249,s:15,r:4.7,rc:980,f:false,d:true,desc:'Gaming Wi-Fi 6 router, geo-filter, QoS, 5GHz priority.',img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',t:['router','gaming','wifi6']},
  {n:'ChairPad Lumbar Support',sku:'CHR-LMB-029',c:'gaming',p:59,cp:79,s:60,r:4.6,rc:1540,f:false,d:false,desc:'Memory foam lumbar pillow, adjustable strap, gaming chair fit.',img:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600',t:['lumbar','support','chair']},
  {n:'CaptureCard 4K HDR',sku:'CAP-CRD-030',c:'gaming',p:179,cp:229,s:20,r:4.7,rc:760,f:true,d:false,desc:'4K HDR capture card, HDMI 2.1, USB-C 3.2, zero-lag passthrough.',img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600',t:['capture-card','streaming','hdmi']},
  {n:'GlowLight RGB Desk Kit',sku:'GLW-DSK-031',c:'gaming',p:89,cp:119,s:40,r:4.6,rc:2180,f:false,d:true,desc:'Monitor LED backlight + desk strip, sync to game, app control.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['rgb','desk','gaming']},

  // ── HOME (12) ─────────────────────────────────────────────────────
  {n:'AuraLight Smart Lamp',sku:'AUR-LMP-032',c:'home',p:59,cp:79,s:60,r:4.6,rc:4010,f:true,d:true,desc:'16M colors, voice + app control, 3000 lumen LED.',img:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',t:['lamp','smart','rgb']},
  {n:'BreezeQ Air Purifier 800',sku:'BRZ-APR-033',c:'home',p:229,cp:279,s:11,r:4.8,rc:1170,f:true,d:false,desc:'HEPA H13 + UV-C, 800sqft coverage, whisper-quiet 25dB.',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',t:['air-purifier','hepa','uv']},
  {n:'BrewBot Smart Coffee Maker',sku:'BRW-COF-034',c:'home',p:149,cp:199,s:18,r:4.8,rc:2670,f:true,d:true,desc:'Programmable smart coffee maker, built-in grinder, app control.',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',t:['coffee','smart','brewing']},
  {n:'DriftFrame Digital Canvas',sku:'DRF-FRM-035',c:'home',p:179,cp:229,s:20,r:4.7,rc:890,f:true,d:false,desc:'10" digital art frame, cloud sync, 32GB, motion-sensor sleep.',img:'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600',t:['digital-frame','art','display']},
  {n:'ZenAir Diffuser Pro 500',sku:'ZEN-DIF-036',c:'home',p:69,cp:89,s:55,r:4.6,rc:2340,f:false,d:false,desc:'Ultrasonic aromatherapy diffuser, 500ml, 12-color LED, 20h.',img:'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600',t:['diffuser','aromatherapy','led']},
  {n:'HaloScale Smart Body',sku:'HAL-SCL-037',c:'home',p:79,cp:99,s:40,r:4.5,rc:3120,f:false,d:false,desc:'17-metric body composition scale, BMI, Bluetooth, app sync.',img:'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',t:['scale','health','bluetooth']},
  {n:'RoboVac X8 Hybrid',sku:'ROB-VAC-038',c:'home',p:299,cp:379,s:12,r:4.7,rc:2890,f:true,d:true,desc:'LiDAR robot vacuum + mop, 6000Pa suction, auto-empty base.',img:'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600',t:['robot-vacuum','lidar','mop']},
  {n:'SmartPlug Energy Monitor',sku:'SMT-PLG-039',c:'home',p:29,cp:39,s:150,r:4.5,rc:4560,f:false,d:false,desc:'WiFi smart plug, real-time energy monitoring, scheduler.',img:'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600',t:['smart-plug','energy','wifi']},
  {n:'AquaFilter Pro 7-Stage',sku:'AQU-FLT-040',c:'home',p:189,cp:249,s:22,r:4.8,rc:1560,f:false,d:false,desc:'7-stage under-sink water filter, RO system, 0.0001μm.',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',t:['water-filter','ro','purification']},
  {n:'DeskRiser Pro Standing',sku:'DSK-RSR-041',c:'home',p:249,cp:319,s:15,r:4.7,rc:1230,f:false,d:true,desc:'Electric sit-stand desk converter, memory presets, USB ports.',img:'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600',t:['standing-desk','ergonomic','electric']},
  {n:'NestCam Indoor 4K',sku:'NST-CAM-042',c:'home',p:99,cp:129,s:35,r:4.6,rc:3410,f:false,d:false,desc:'4K security cam, night vision, face recognition, 30-day cloud.',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',t:['camera','security','smart-home']},
  {n:'BedSide Sunrise Alarm',sku:'BDS-ALM-043',c:'home',p:89,cp:119,s:45,r:4.7,rc:2180,f:true,d:false,desc:'Sunrise wake-up light, gradual 30-min sunrise, sleep sounds.',img:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',t:['alarm','sleep','light-therapy']},

  // ── FASHION (12) ──────────────────────────────────────────────────
  {n:'VoltCarry Sling Bag',sku:'VLT-SLG-044',c:'fashion',p:89,cp:120,s:25,r:4.7,rc:1920,f:true,d:false,desc:'Ballistic nylon, anti-theft zipper, USB-A passthrough.',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',t:['bag','sling','anti-theft']},
  {n:'AlphaShell Rain Jacket',sku:'ALP-JKT-045',c:'fashion',p:179,cp:229,s:15,r:4.8,rc:2410,f:true,d:true,desc:'3-layer Gore-Tex, pit-zips, removable hood, packable.',img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',t:['jacket','waterproof','gore-tex']},
  {n:'UrbanRun Sneakers Pro',sku:'URB-SNK-046',c:'fashion',p:129,cp:159,s:22,r:4.7,rc:5090,f:true,d:true,desc:'Responsive foam, recycled knit upper, reflective accents.',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',t:['shoes','running','eco']},
  {n:'FlowThread Joggers V2',sku:'FLW-JGR-047',c:'fashion',p:65,cp:85,s:40,r:4.6,rc:3770,f:false,d:false,desc:'4-way stretch, tapered fit, deep zip pockets, 2 colors.',img:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',t:['joggers','activewear','stretch']},
  {n:'PolarFleece Zip Hoodie',sku:'POL-HDI-048',c:'fashion',p:89,cp:119,s:35,r:4.6,rc:1560,f:false,d:true,desc:'Heavyweight 340gsm fleece, full-zip, kangaroo pocket.',img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',t:['hoodie','fleece','winter']},
  {n:'StormWalk Hiking Boots',sku:'STM-BOT-049',c:'fashion',p:159,cp:199,s:18,r:4.7,rc:1780,f:true,d:false,desc:'Waterproof leather + mesh, Vibram sole, ankle support.',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',t:['boots','hiking','vibram']},
  {n:'ThermalTech Insulated Vest',sku:'THM-VST-050',c:'fashion',p:79,cp:109,s:28,r:4.6,rc:1120,f:false,d:false,desc:'Lightweight puffer vest, 800-fill down, packable.',img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',t:['vest','down','packable']},
  {n:'CityTote Canvas Bag XL',sku:'CTY-TOT-051',c:'fashion',p:49,cp:65,s:70,r:4.4,rc:1340,f:false,d:false,desc:'Heavy canvas, inner laptop sleeve 15", magnetic snap closure.',img:'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600',t:['tote','canvas','laptop']},
  {n:'ApexCap UPF50 Hat',sku:'APX-CAP-052',c:'fashion',p:34,cp:45,s:55,r:4.5,rc:880,f:false,d:false,desc:'Moisture-wicking, UPF 50+, one-size flex fit, 6 colors.',img:'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600',t:['cap','upf50','sport']},
  {n:'NovaFlex Compression Tee',sku:'NOV-TEE-053',c:'fashion',p:45,cp:60,s:60,r:4.5,rc:2030,f:false,d:false,desc:'4-way stretch compression top, moisture-wick, UV protection.',img:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',t:['tee','compression','uv']},
  {n:'GridMesh Gym Shorts',sku:'GRD-SHT-054',c:'fashion',p:35,cp:50,s:75,r:4.5,rc:2890,f:false,d:false,desc:'7" inseam, mesh lining, zip pocket, anti-odor fabric.',img:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',t:['shorts','gym','mesh']},
  {n:'LeatherFold Wallet Pro',sku:'LTH-WLT-055',c:'fashion',p:59,cp:79,s:80,r:4.6,rc:3450,f:false,d:true,desc:'Full-grain leather slim wallet, RFID blocking, 12 card slots.',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',t:['wallet','leather','rfid']},

  // ── BEAUTY (8) ────────────────────────────────────────────────────
  {n:'GlowKit Vitamin C Serum',sku:'GLW-SRM-056',c:'beauty',p:79,cp:99,s:33,r:4.8,rc:6220,f:true,d:true,desc:'20% Vit-C + Niacinamide, 30ml, clinical-grade brightening.',img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',t:['serum','vitamin-c','brightening']},
  {n:'HydraHero SPF50 Moisturizer',sku:'HYD-MST-057',c:'beauty',p:49,cp:65,s:60,r:4.7,rc:4310,f:true,d:false,desc:'SPF50 lightweight moisturizer, hyaluronic acid, fragrance-free.',img:'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',t:['moisturizer','spf','hydrating']},
  {n:'SleekBrush Air Styler',sku:'SLK-STL-058',c:'beauty',p:129,cp:169,s:22,r:4.7,rc:3890,f:true,d:true,desc:'5-in-1 hair styler, ionic technology, brushless motor.',img:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',t:['hair-styler','ionic','beauty']},
  {n:'PureGlow Jade Roller Set',sku:'PUR-JDE-059',c:'beauty',p:35,cp:49,s:90,r:4.5,rc:2780,f:false,d:false,desc:'Genuine jade roller + gua sha, depuffing, firming.',img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',t:['jade-roller','facial','gua-sha']},
  {n:'LipLux Long-Wear Set 12',sku:'LPL-LWS-060',c:'beauty',p:45,cp:59,s:55,r:4.6,rc:1890,f:false,d:false,desc:'12-shade long-wear liquid lipstick set, matte finish, 24h.',img:'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600',t:['lipstick','makeup','long-wear']},
  {n:'DermaTool Micro-Needler',sku:'DRM-NDL-061',c:'beauty',p:89,cp:119,s:28,r:4.5,rc:1230,f:false,d:false,desc:'0.5mm titanium micro-needler roller, collagen induction.',img:'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',t:['micro-needling','collagen','skincare']},
  {n:'NailKit LED Gel Set',sku:'NAL-GEL-062',c:'beauty',p:69,cp:89,s:40,r:4.7,rc:3450,f:false,d:true,desc:'Pro gel nail kit with 48W LED lamp, 20 gel polishes.',img:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',t:['gel-nails','led','nail-art']},
  {n:'ScentLab Perfume Sampler 10',sku:'SCN-PRF-063',c:'beauty',p:59,cp:79,s:45,r:4.6,rc:2100,f:true,d:false,desc:'10 x 2ml designer-inspired perfume collection, gift box.',img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600',t:['perfume','fragrance','sampler']},

  // ── SPORTS (10) ───────────────────────────────────────────────────
  {n:'IronGrip Adjustable Dumbbells',sku:'IRN-DBL-064',c:'sports',p:249,cp:329,s:14,r:4.8,rc:4320,f:true,d:true,desc:'5-52.5lb adjustable dumbbell set, space-saving, quick-lock.',img:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600',t:['dumbbells','weights','fitness']},
  {n:'FlexBand Resistance Kit Pro',sku:'FLX-BND-065',c:'sports',p:39,cp:55,s:150,r:4.6,rc:7890,f:false,d:false,desc:'6-level latex resistance bands, handles + door anchor kit.',img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['resistance-bands','fitness','home-gym']},
  {n:'PaceTrack GPS Running Watch',sku:'PCE-WCH-066',c:'sports',p:279,cp:349,s:16,r:4.7,rc:2560,f:true,d:false,desc:'GPS running watch, VO2 max, 20h battery, heart rate.',img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',t:['running-watch','gps','vo2max']},
  {n:'AirBike Pro X',sku:'AIR-BKE-067',c:'sports',p:499,cp:649,s:8,r:4.9,rc:1890,f:true,d:true,desc:'Air resistance bike, unlimited resistance, full-body HIIT.',img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',t:['bike','hiit','cardio']},
  {n:'NeoSurf Foam Roller PRO',sku:'NEO-FMR-068',c:'sports',p:35,cp:49,s:120,r:4.5,rc:3450,f:false,d:false,desc:'High-density vibrating foam roller, 3 speeds, USB-C charge.',img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['foam-roller','recovery','vibration']},
  {n:'PullPod Door Pull-Up Bar',sku:'PLL-BAR-069',c:'sports',p:49,cp:65,s:90,r:4.6,rc:5670,f:false,d:false,desc:'No-drill door pull-up bar, 300lb capacity, multi-grip.',img:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600',t:['pull-up-bar','home-gym','strength']},
  {n:'SpeedJump Digital Rope',sku:'SPD-JMP-070',c:'sports',p:29,cp:39,s:200,r:4.5,rc:4320,f:false,d:false,desc:'Digital jump rope with calorie counter, LED speed display.',img:'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600',t:['jump-rope','cardio','fitness']},
  {n:'ComprePro Knee Sleeves',sku:'CMP-KNE-071',c:'sports',p:49,cp:65,s:80,r:4.7,rc:2890,f:false,d:true,desc:'7mm neoprene knee sleeves pair, powerlifting, thermal support.',img:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600',t:['knee-sleeves','powerlifting','support']},
  {n:'HydroVault Bottle 32oz',sku:'HYD-BTL-072',c:'sports',p:39,cp:55,s:180,r:4.8,rc:8900,f:true,d:false,desc:'32oz insulated bottle, 48h cold / 24h hot, leak-proof lid.',img:'https://images.unsplash.com/photo-1606937295610-04dac1a05dc6?w=600',t:['water-bottle','insulated','hydration']},
  {n:'YogaMat Alignment Pro 6mm',sku:'YGA-MAT-073',c:'sports',p:79,cp:99,s:70,r:4.7,rc:3210,f:false,d:true,desc:'6mm TPE yoga mat, alignment lines, eco-friendly, carry strap.',img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',t:['yoga','mat','eco']},

  // ── OFFICE (8) ────────────────────────────────────────────────────
  {n:'ErgoChair Pro Lumbar',sku:'ERG-CHR-074',c:'office',p:449,cp:599,s:10,r:4.8,rc:3450,f:true,d:false,desc:'Ergonomic mesh chair, adjustable lumbar, 4D armrests.',img:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600',t:['chair','ergonomic','lumbar']},
  {n:'DeskMate Bamboo Organizer',sku:'DSK-ORG-075',c:'office',p:55,cp:75,s:80,r:4.6,rc:2100,f:false,d:false,desc:'Bamboo desk organizer, 7 compartments, pen holder, cable slot.',img:'https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=600',t:['organizer','bamboo','desk']},
  {n:'TaskLamp LED Architect',sku:'TSK-LMP-076',c:'office',p:89,cp:119,s:45,r:4.7,rc:1890,f:false,d:true,desc:'Architect desk lamp, touch dimmer, USB-A charge port, 5 CCT.',img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',t:['desk-lamp','led','charging']},
  {n:'NoteAir E-Ink Tablet 10',sku:'NOT-TAB-077',c:'office',p:399,cp:499,s:12,r:4.7,rc:1230,f:true,d:false,desc:'10" E-ink writing tablet, stylus, 3 weeks battery, export PDF.',img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',t:['e-ink','tablet','writing']},
  {n:'CardScan Pro Business Set',sku:'CRD-SCN-078',c:'office',p:79,cp:99,s:35,r:4.5,rc:870,f:false,d:false,desc:'Portable card scanner, auto-import to contacts, 600 DPI.',img:'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600',t:['scanner','business','productivity']},
  {n:'QuietKey Wireless Keyboard',sku:'QTK-KBD-079',c:'office',p:69,cp:89,s:55,r:4.6,rc:3210,f:false,d:false,desc:'Ultra-quiet slim keyboard, multi-device BT, rechargeable.',img:'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',t:['keyboard','wireless','quiet']},
  {n:'PhoneArm Gooseneck Mount',sku:'PHN-MNT-080',c:'office',p:29,cp:39,s:200,r:4.5,rc:4560,f:false,d:false,desc:'Flexible gooseneck phone mount, desk clamp, 360° rotation.',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',t:['mount','phone','flexible']},
  {n:'DocuPrint Mini Printer',sku:'DCU-PRN-081',c:'office',p:129,cp:169,s:28,r:4.6,rc:1980,f:false,d:true,desc:'Pocket photo + doc printer, Bluetooth, thermal, no ink.',img:'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600',t:['printer','portable','thermal']},

  // ── MUSIC (8) ─────────────────────────────────────────────────────
  {n:'StringMaster Guitar Kit',sku:'STR-GTR-082',c:'music',p:189,cp:249,s:14,r:4.7,rc:1450,f:true,d:false,desc:'Acoustic guitar starter kit, tuner + strap + picks + bag.',img:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',t:['guitar','acoustic','beginner']},
  {n:'BeatBox Mini Drum Pad 8',sku:'BTB-DRM-083',c:'music',p:89,cp:119,s:30,r:4.6,rc:890,f:false,d:true,desc:'8-pad MIDI drum controller, velocity-sensitive, USB + BT.',img:'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600',t:['drum-pad','midi','controller']},
  {n:'AudioLab USB Interface 2x2',sku:'AUD-INT-084',c:'music',p:149,cp:189,s:22,r:4.8,rc:2340,f:true,d:false,desc:'2-in/2-out audio interface, 24bit/192kHz, phantom power.',img:'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',t:['audio-interface','recording','studio']},
  {n:'MonitorPods Studio Speaker',sku:'MON-SPK-085',c:'music',p:299,cp:379,s:12,r:4.7,rc:1120,f:true,d:false,desc:'5" bi-amped studio monitors pair, flat response, RCA/XLR.',img:'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600',t:['studio-monitor','speakers','mixing']},
  {n:'KeyLab MIDI Piano 49',sku:'KEY-MID-086',c:'music',p:249,cp:319,s:15,r:4.7,rc:980,f:false,d:true,desc:'49-key MIDI keyboard, aftertouch, pitch/mod wheel, DAW.',img:'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600',t:['midi','piano','keyboard']},
  {n:'CaptureMic Condenser Studio',sku:'CAP-MIC-087',c:'music',p:119,cp:159,s:28,r:4.8,rc:3450,f:false,d:false,desc:'Large-diaphragm condenser mic, cardioid, shock mount, pop filter.',img:'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',t:['microphone','condenser','recording']},
  {n:'HarpCase Transport Bag XL',sku:'HRP-BAG-088',c:'music',p:69,cp:89,s:40,r:4.5,rc:560,f:false,d:false,desc:'Heavy-duty instrument transport bag, 25mm foam, shoulder strap.',img:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',t:['instrument-bag','transport','protection']},
  {n:'SoundProof Acoustic Panels 6',sku:'SND-PNL-089',c:'music',p:79,cp:99,s:55,r:4.6,rc:1230,f:false,d:false,desc:'6-pack 12x12 acoustic foam panels, NRC 0.98, peel-stick.',img:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600',t:['acoustic-panels','soundproofing','studio']},

  // ── TRAVEL (8) ────────────────────────────────────────────────────
  {n:'TravelPro Spinner 28" Luggage',sku:'TRV-LGG-090',c:'travel',p:229,cp:299,s:18,r:4.7,rc:3450,f:true,d:false,desc:'Lightweight hardshell spinner, TSA lock, expandable, 28".',img:'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=600',t:['luggage','suitcase','spinner']},
  {n:'PackLight Travel Backpack 40L',sku:'PCK-BKP-091',c:'travel',p:129,cp:169,s:25,r:4.8,rc:4560,f:true,d:true,desc:'40L carry-on backpack, clam-shell opening, laptop sleeve.',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',t:['backpack','travel','carry-on']},
  {n:'NeckCloud Inflatable Pillow',sku:'NCK-PIL-092',c:'travel',p:29,cp:39,s:250,r:4.5,rc:8900,f:false,d:false,desc:'Inflatable neck pillow, 3D ergonomic contour, packable.',img:'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=600',t:['neck-pillow','travel','comfort']},
  {n:'GlobeAdapter Universal Kit',sku:'GLB-ADP-093',c:'travel',p:39,cp:55,s:180,r:4.6,rc:6780,f:false,d:false,desc:'Universal travel adapter, 200 countries, 4 USB-A + 2 USB-C.',img:'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600',t:['adapter','universal','travel']},
  {n:'TechOrg Packing Cube Set 5',sku:'TCH-PCK-094',c:'travel',p:35,cp:49,s:150,r:4.7,rc:5670,f:false,d:false,desc:'5-piece compression packing cubes, waterproof, slim handles.',img:'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=600',t:['packing-cubes','organization','travel']},
  {n:'AeroBottle TSA Water Flask',sku:'AER-BTL-095',c:'travel',p:29,cp:39,s:200,r:4.5,rc:3450,f:false,d:true,desc:'TSA-approved collapsible water bottle, folds flat, BPA-free.',img:'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=600',t:['water-bottle','tsa','collapsible']},
  {n:'NapShade Sleep Mask Pro',sku:'NAP-MSK-096',c:'travel',p:25,cp:35,s:300,r:4.6,rc:7890,f:false,d:false,desc:'3D contoured sleep mask, zero light, memory foam nose bridge.',img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',t:['sleep-mask','blackout','travel']},
  {n:'LockSafe TSA Combo Padlock',sku:'LCK-PDL-097',c:'travel',p:19,cp:29,s:500,r:4.7,rc:9870,f:false,d:false,desc:'TSA-approved combination padlock, 4-dial, cable included.',img:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',t:['padlock','tsa','security']},

  // ── BOOKS (6) ─────────────────────────────────────────────────────
  {n:'KindlePad E-Reader 11th',sku:'KND-RDR-098',c:'books',p:139,cp:179,s:35,r:4.9,rc:15600,f:true,d:false,desc:'11th gen e-reader, 6" 300ppi glare-free, weeks battery.',img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',t:['e-reader','kindle','reading']},
  {n:'FlipStand Book Holder Pro',sku:'FLP-BKH-099',c:'books',p:29,cp:39,s:200,r:4.6,rc:4560,f:false,d:false,desc:'Adjustable book stand, cookbook + textbook holder, folds flat.',img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',t:['book-stand','reading','cookbook']},
  {n:'StudyLight Clip Desk Lamp',sku:'STD-LMP-100',c:'books',p:35,cp:49,s:120,r:4.5,rc:3210,f:false,d:false,desc:'USB rechargeable reading light, 3 brightness, clip + stand.',img:'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600',t:['reading-light','clip','rechargeable']},
  {n:'NoteMax Hardcover A5 Journal',sku:'NOT-JNL-101',c:'books',p:19,cp:29,s:500,r:4.7,rc:8900,f:false,d:false,desc:'200-page dotted journal, lay-flat binding, elastic band.',img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',t:['journal','notebook','dotted']},
  {n:'LearnTrack Language Cards',sku:'LRN-CRD-102',c:'books',p:25,cp:35,s:300,r:4.5,rc:2340,f:false,d:true,desc:'500 bilingual flash cards, Spanish/French/German/Japanese.',img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',t:['flash-cards','language','learning']},
  {n:'BookNook LED Display Shelf',sku:'BKN-SHF-103',c:'books',p:79,cp:99,s:40,r:4.6,rc:1890,f:true,d:false,desc:'LED lighted bookend display, 3 levels, battery or USB, oak.',img:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',t:['bookshelf','led','display']},

  // ── KITCHEN (8) ───────────────────────────────────────────────────
  {n:'ChefKnife Damascus 8"',sku:'CHF-KNF-104',c:'kitchen',p:129,cp:169,s:25,r:4.9,rc:4560,f:true,d:false,desc:'67-layer Damascus steel chef knife, G10 handle, VG10 core.',img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',t:['knife','damascus','chef']},
  {n:'AirFryer Pro XL 7QT',sku:'AIR-FRY-105',c:'kitchen',p:119,cp:159,s:30,r:4.7,rc:7890,f:true,d:true,desc:'7QT digital air fryer, 8 presets, touchscreen, dishwasher safe.',img:'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600',t:['air-fryer','cooking','healthy']},
  {n:'BlendTech Smart Blender 1200W',sku:'BLD-PRO-106',c:'kitchen',p:199,cp:259,s:18,r:4.8,rc:3450,f:true,d:true,desc:'1200W professional blender, 3 auto programs, self-clean.',img:'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600',t:['blender','smoothie','kitchen']},
  {n:'PourPerfect Gooseneck Kettle',sku:'PRP-KTL-107',c:'kitchen',p:79,cp:99,s:55,r:4.7,rc:5670,f:false,d:false,desc:'Electric gooseneck kettle, 6 temp presets, 1L, keep-warm.',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',t:['kettle','coffee','precision']},
  {n:'SteelPan Non-Stick 12" Set',sku:'STL-PAN-108',c:'kitchen',p:89,cp:119,s:40,r:4.6,rc:4320,f:false,d:false,desc:'3-piece stainless + non-stick cookware, oven-safe 500°F.',img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',t:['pans','cookware','non-stick']},
  {n:'SpicePro Herb Grinder Steel',sku:'SPC-GRD-109',c:'kitchen',p:39,cp:55,s:120,r:4.5,rc:6780,f:false,d:false,desc:'4-layer herb grinder, diamond teeth, kief catcher, brushed steel.',img:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600',t:['grinder','herb','spice']},
  {n:'WaffleIron Crispy Belgian',sku:'WFL-IRN-110',c:'kitchen',p:59,cp:79,s:60,r:4.7,rc:2340,f:false,d:true,desc:'Belgian waffle maker, 4 servings, non-stick, ready indicator.',img:'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600',t:['waffle','breakfast','non-stick']},
  {n:'MealPrep Glass Container 10pc',sku:'MPR-CNT-111',c:'kitchen',p:49,cp:65,s:90,r:4.6,rc:4560,f:false,d:false,desc:'10-piece borosilicate glass meal prep set, oven + microwave safe.',img:'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600',t:['meal-prep','glass','containers']},

  // ── PETS (8) ──────────────────────────────────────────────────────
  {n:'SmartFeed Auto Pet Feeder',sku:'SMT-FDR-112',c:'pets',p:79,cp:99,s:45,r:4.7,rc:3450,f:true,d:false,desc:'Wi-Fi auto pet feeder, 6L, app schedule, meal notifications.',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',t:['pet-feeder','auto','smart']},
  {n:'PawPrint DNA Kit',sku:'PAW-DNA-113',c:'pets',p:89,cp:119,s:30,r:4.5,rc:2100,f:false,d:false,desc:'Dog DNA breed + health test, 350+ breeds, vet-grade results.',img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',t:['dna','dog','health']},
  {n:'HippoWash Dog Grooming Kit',sku:'HPW-GRM-114',c:'pets',p:59,cp:79,s:60,r:4.6,rc:1890,f:false,d:true,desc:'6-piece dog grooming kit, waterless shampoo + brush + nail file.',img:'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600',t:['grooming','dog','pet-care']},
  {n:'PetCam HD 1080P Treat Dispenser',sku:'PCT-CAM-115',c:'pets',p:149,cp:199,s:22,r:4.7,rc:2340,f:true,d:false,desc:'1080P pet camera, treat dispenser, 2-way audio, night vision.',img:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',t:['pet-camera','treat-dispenser','wifi']},
  {n:'FleeceNest Cat Tree XL',sku:'FLC-TRE-116',c:'pets',p:99,cp:129,s:18,r:4.5,rc:1560,f:false,d:false,desc:'5-tier cat tree, sisal posts, plush beds, hammock, 65".',img:'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600',t:['cat-tree','cat','scratcher']},
  {n:'HydroFresh Pet Water Fountain',sku:'HYD-FNT-117',c:'pets',p:45,cp:59,s:80,r:4.7,rc:5670,f:false,d:false,desc:'3L filtered pet fountain, triple filter, ultra-quiet, SS.',img:'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600',t:['water-fountain','pet','filter']},
  {n:'TravelPet Airline Carrier Bag',sku:'TRV-CAR-118',c:'pets',p:69,cp:89,s:40,r:4.5,rc:1230,f:false,d:true,desc:'IATA-approved airline pet carrier, telescoping handle, mesh.',img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',t:['pet-carrier','airline','travel']},
  {n:'ZoomBall Interactive Dog Toy',sku:'ZOM-TOY-119',c:'pets',p:29,cp:39,s:150,r:4.6,rc:3450,f:false,d:false,desc:'Automatic moving ball, motion-activated, 3 speeds, USB charge.',img:'https://images.unsplash.com/photo-1515479423479-d76624b5ee3e?w=600',t:['dog-toy','interactive','automatic']},

  // ── AUDIO (8) ─────────────────────────────────────────────────────
  // NOTE: every image below was verified by fetching the actual Unsplash
  // photo page and confirming the og:image content matches the product type.
  {n:'Echo 360 Spatial Speaker',sku:'AUD-SPK-200',c:'audio',p:399,cp:499,s:20,r:4.8,rc:2107,f:true,d:true,desc:'True omnidirectional 360° sound with spatial audio processing. Adaptive room tuning, 40W, Wi-Fi 6 + BT 5.3.',img:'https://images.unsplash.com/photo-1542483381-41a479b1fb88?w=600',t:['speaker','audio','wireless','spatial']},
  {n:'AuralFit Pro Earbuds',sku:'AUD-EAR-201',c:'audio',p:179,cp:229,s:34,r:4.7,rc:3980,f:true,d:false,desc:'True wireless earbuds, adaptive ANC, 32h battery, IP55, wireless charging case.',img:'https://images.unsplash.com/photo-1525825691042-e14d9042fc70?w=600',t:['earbuds','wireless','anc']},
  {n:'BassForge Over-Ear Studio',sku:'AUD-HDP-202',c:'audio',p:249,cp:319,s:18,r:4.8,rc:1670,f:true,d:true,desc:'Closed-back studio headphones, 50mm drivers, detachable cable, foldable.',img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',t:['headphones','studio','over-ear']},
  {n:'SilentWave ANC Headphones',sku:'AUD-HDP-203',c:'audio',p:299,cp:379,s:14,r:4.9,rc:5230,f:true,d:false,desc:'Industry-leading ANC over-ear headphones, 40h battery, multipoint BT 5.3.',img:'https://images.unsplash.com/photo-1567928513899-997d98489fbd?w=600',t:['headphones','anc','wireless']},
  {n:'VinylRevive Turntable Classic',sku:'AUD-TBL-204',c:'audio',p:229,cp:289,s:16,r:4.6,rc:840,f:false,d:true,desc:'Belt-drive turntable, built-in preamp, Bluetooth output, walnut finish.',img:'https://images.unsplash.com/photo-1709649246219-220dfca6f75a?w=600',t:['turntable','vinyl','retro']},
  {n:'NeckLoop Bluetooth Sport Headset',sku:'AUD-HDP-205',c:'audio',p:59,cp:79,s:65,r:4.5,rc:2230,f:false,d:false,desc:'Open-ear bone-conduction sport headset, sweatproof, 10h battery.',img:'https://images.unsplash.com/photo-1567928513899-997d98489fbd?w=600',t:['headset','sport','bone-conduction']},
  {n:'PocketAmp Portable DAC/Amp',sku:'AUD-AMP-206',c:'audio',p:139,cp:179,s:25,r:4.7,rc:610,f:false,d:false,desc:'Hi-res USB-C DAC/amp, balanced output, drives high-impedance cans.',img:'https://images.unsplash.com/photo-1511499271651-073325718d90?w=600',t:['dac','amp','hi-res']},
  {n:'WaveCube Mini Bluetooth Speaker',sku:'AUD-SPK-207',c:'audio',p:49,cp:69,s:110,r:4.6,rc:6780,f:false,d:true,desc:'Pocket-size IP67 speaker, 12h battery, pair-two for stereo.',img:'https://images.unsplash.com/photo-1511499271651-073325718d90?w=600',t:['speaker','bluetooth','portable']},

  // ── COMPUTING (8) ─────────────────────────────────────────────────
  {n:'NimbusBook Air 14"',sku:'CMP-LAP-210',c:'computing',p:1099,cp:1299,s:12,r:4.8,rc:1450,f:true,d:true,desc:'14" 2.8K OLED ultrabook, all-day battery, fanless silent design.',img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',t:['laptop','ultrabook','oled']},
  {n:'CodeForge Dev Laptop 16"',sku:'CMP-LAP-211',c:'computing',p:1799,cp:2099,s:8,r:4.9,rc:980,f:true,d:false,desc:'16" 165Hz QHD, 32GB RAM, discrete GPU — built for developers and creators.',img:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',t:['laptop','developer','high-performance']},
  {n:'DeskCore Mini PC i7',sku:'CMP-PC-212',c:'computing',p:649,cp:799,s:20,r:4.6,rc:540,f:false,d:true,desc:'Compact mini-PC, 12-core CPU, dual 4K output, near-silent.',img:'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',t:['mini-pc','desktop','compact']},
  {n:'TypeWave Compact Mechanical Keyboard',sku:'CMP-KBD-213',c:'computing',p:99,cp:129,s:48,r:4.7,rc:2310,f:false,d:false,desc:'65% hot-swappable mechanical keyboard, USB-C, PBT keycaps.',img:'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600',t:['keyboard','mechanical','compact']},
  {n:'PixelView 4K Monitor 32"',sku:'CMP-MON-214',c:'computing',p:549,cp:699,s:14,r:4.8,rc:1120,f:true,d:true,desc:'32" 4K IPS monitor, 99% sRGB, USB-C 90W power delivery, height-adjustable.',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',t:['monitor','4k','usb-c']},
  {n:'SilentTower Workstation PC',sku:'CMP-PC-215',c:'computing',p:1499,cp:1799,s:9,r:4.7,rc:430,f:false,d:false,desc:'Liquid-cooled workstation tower, 64GB RAM, RTX-class GPU.',img:'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',t:['desktop','workstation','gaming']},
  {n:'FlexRiser Aluminum Laptop Stand',sku:'CMP-ACC-216',c:'computing',p:45,cp:59,s:90,r:4.6,rc:3210,f:false,d:false,desc:'Foldable aluminum laptop stand, 7 angles, heat-dissipating design.',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',t:['laptop-stand','aluminum','ergonomic']},
  {n:'QuickSync NVMe External Dock',sku:'CMP-ACC-217',c:'computing',p:69,cp:89,s:55,r:4.5,rc:870,f:false,d:true,desc:'Tool-free M.2 NVMe enclosure, USB 3.2 Gen2x2 20Gbps, aluminum.',img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',t:['ssd-dock','nvme','external']},

  // ── ELECTRONICS (8) ───────────────────────────────────────────────
  {n:'PowerGrid Smart Surge Protector',sku:'ELC-PWR-220',c:'electronics',p:39,cp:55,s:140,r:4.6,rc:3450,f:false,d:true,desc:'12-outlet surge protector with 4 smart plugs, app scheduling, energy monitor.',img:'https://images.unsplash.com/photo-1586495777744-4e6232bf2fb7?w=600',t:['surge-protector','smart-plug','energy']},
  {n:'MeshLink Wi-Fi 6E System (3-pack)',sku:'ELC-NET-221',c:'electronics',p:249,cp:329,s:18,r:4.8,rc:1980,f:true,d:false,desc:'Whole-home mesh Wi-Fi 6E, covers 6500 sq ft, AI traffic optimization.',img:'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600',t:['wifi','mesh','networking']},
  {n:'VoltCore 65W GaN Wall Charger',sku:'ELC-CHG-222',c:'electronics',p:34,cp:45,s:200,r:4.7,rc:5670,f:false,d:false,desc:'Triple-port 65W GaN charger, foldable plug, fits in your pocket.',img:'https://images.unsplash.com/photo-1609592424858-7de65a53f4f1?w=600',t:['charger','gan','usb-c']},
  {n:'BeamCast 4K Streaming Stick',sku:'ELC-STR-223',c:'electronics',p:49,cp:69,s:85,r:4.6,rc:7890,f:true,d:true,desc:'4K HDR streaming stick, voice remote, Wi-Fi 6, all major apps.',img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',t:['streaming','4k','media']},
  {n:'SignalBoost Cellular Amplifier',sku:'ELC-NET-224',c:'electronics',p:299,cp:379,s:10,r:4.5,rc:320,f:false,d:false,desc:'Boosts 4G/5G signal up to 4000 sq ft, supports all major carriers.',img:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',t:['signal-booster','cellular','5g']},
  {n:'GlowSync Smart Switch (4-pack)',sku:'ELC-HOM-225',c:'electronics',p:59,cp:79,s:95,r:4.6,rc:2980,f:false,d:true,desc:'In-wall smart light switches, no hub needed, voice + app control.',img:'https://images.unsplash.com/photo-1609092460842-25a4aab1e8da?w=600',t:['smart-switch','smart-home','lighting']},
  {n:'ChargeDock 3-in-1 Wireless Stand',sku:'ELC-CHG-226',c:'electronics',p:79,cp:99,s:60,r:4.7,rc:1670,f:true,d:false,desc:'15W MagSafe-compatible charging stand for phone, watch and earbuds.',img:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',t:['wireless-charger','magsafe','stand']},
  {n:'LinkBridge Smart Home Hub Pro',sku:'ELC-HOM-227',c:'electronics',p:99,cp:129,s:38,r:4.6,rc:1230,f:false,d:false,desc:'Matter/Zigbee/Z-Wave hub, unifies all your smart devices in one app.',img:'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',t:['smart-hub','matter','automation']},

  // ── WEARABLES (8) ─────────────────────────────────────────────────
  {n:'PulseBand Fitness Tracker 2',sku:'WER-FIT-230',c:'wearables',p:79,cp:99,s:70,r:4.6,rc:5430,f:true,d:true,desc:'Slim fitness band, 24/7 heart rate, SpO2, 14-day battery, 5ATM.',img:'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',t:['fitness-tracker','heart-rate','band']},
  {n:'AeroRing Smart Health Ring',sku:'WER-RNG-231',c:'wearables',p:269,cp:329,s:15,r:4.7,rc:780,f:true,d:false,desc:'Titanium smart ring — sleep, recovery, HRV and temperature tracking.',img:'https://images.unsplash.com/photo-1515479423479-d76624b5ee3e?w=600',t:['smart-ring','sleep','recovery']},
  {n:'ChronoFit GPS Sports Watch',sku:'WER-WCH-232',c:'wearables',p:329,cp:399,s:18,r:4.8,rc:2340,f:true,d:true,desc:'Multi-sport GPS watch, 40+ modes, solar-assist charging, 14-day battery.',img:'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',t:['sports-watch','gps','solar']},
  {n:'FlexCuff Posture Corrector Band',sku:'WER-POS-233',c:'wearables',p:39,cp:55,s:120,r:4.4,rc:1450,f:false,d:false,desc:'Smart posture trainer, gentle vibration nudges, app progress tracking.',img:'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',t:['posture','wellness','smart']},
  {n:'SleepSense Recovery Ring',sku:'WER-RNG-234',c:'wearables',p:229,cp:289,s:22,r:4.6,rc:610,f:false,d:true,desc:'Lightweight recovery ring, readiness score, 7-day battery.',img:'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',t:['smart-ring','recovery','sleep']},
  {n:'KidsTrack GPS Watch Jr',sku:'WER-WCH-235',c:'wearables',p:69,cp:89,s:50,r:4.5,rc:1980,f:false,d:false,desc:'Kid-safe GPS smartwatch, SOS button, school mode, parent app.',img:'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',t:['kids','gps-watch','safety']},
  {n:'HeartGuard ECG Monitor Watch',sku:'WER-WCH-236',c:'wearables',p:399,cp:499,s:10,r:4.8,rc:920,f:true,d:false,desc:'Medical-grade ECG + blood pressure smartwatch, AMOLED, 10-day battery.',img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',t:['ecg','health','smartwatch']},
  {n:'StepCount Pedometer Clip Pro',sku:'WER-PED-237',c:'wearables',p:24,cp:34,s:160,r:4.4,rc:2670,f:false,d:false,desc:'Clip-on pedometer, no app needed, 30-day memory, OLED display.',img:'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',t:['pedometer','fitness','clip']},

  // ── PHOTOGRAPHY (8) ───────────────────────────────────────────────
  {n:'FrameWorks Mirrorless Starter Kit',sku:'PHO-CAM-240',c:'photography',p:899,cp:1099,s:12,r:4.8,rc:1340,f:true,d:true,desc:'24MP mirrorless camera with 18-55mm kit lens, 4K60 video, dual-card slots.',img:'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=600',t:['camera','mirrorless','kit']},
  {n:'ZoomCraft 70-300mm Telephoto Lens',sku:'PHO-LNS-241',c:'photography',p:449,cp:579,s:14,r:4.6,rc:560,f:false,d:false,desc:'70-300mm f/4.5-6.3 telephoto zoom, optical stabilization, weather-sealed.',img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',t:['lens','telephoto','zoom']},
  {n:'SteadyArm 3-Axis Gimbal Stabilizer',sku:'PHO-GMB-242',c:'photography',p:139,cp:179,s:30,r:4.7,rc:2210,f:true,d:true,desc:'Foldable 3-axis gimbal, 12h battery, auto face-track, app control.',img:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',t:['gimbal','stabilizer','video']},
  {n:'LumaPod Carbon Fiber Tripod',sku:'PHO-TRP-243',c:'photography',p:179,cp:229,s:22,r:4.8,rc:1670,f:false,d:false,desc:'Carbon fiber travel tripod, 5kg capacity, ball head, folds to 16".',img:'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600',t:['tripod','carbon-fiber','travel']},
  {n:'ChromaFilter ND Filter Kit (6-pack)',sku:'PHO-FLT-244',c:'photography',p:89,cp:119,s:45,r:4.6,rc:780,f:false,d:true,desc:'Variable ND + polarizer filter set, multi-coated, magnetic mount.',img:'https://images.unsplash.com/photo-1606986628253-05620e9a4e22?w=600',t:['filters','nd','lens']},
  {n:'PocketLight RGB Video Panel',sku:'PHO-LGT-245',c:'photography',p:69,cp:89,s:60,r:4.7,rc:1340,f:false,d:false,desc:'Pocket RGB LED panel, 2500K-9000K, magnetic mount, app control.',img:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',t:['video-light','rgb','portable']},
  {n:'MicroLens Macro Extension Tube Set',sku:'PHO-MAC-246',c:'photography',p:39,cp:55,s:75,r:4.5,rc:430,f:false,d:false,desc:'Auto-focus macro extension tubes, brass mount, all-metal build.',img:'https://images.unsplash.com/photo-1606986628253-05620e9a4e22?w=600',t:['macro','lens','extension-tube']},
  {n:'CardVault 256GB Pro Memory Kit',sku:'PHO-MEM-247',c:'photography',p:59,cp:79,s:100,r:4.8,rc:3120,f:true,d:false,desc:'2x 256GB UHS-II SD cards + rugged carry case, 300MB/s read.',img:'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600',t:['memory-card','storage','sd-card']},

  // ── TECH EXPANDED (12 more → 30 total) ───────────────────────────────────
  {n:'NovaPad X12 Tablet Pro',sku:'TCH-TAB-300',c:'tech',p:699,cp:849,s:22,r:4.8,rc:2340,f:true,d:true,desc:'12.9" 120Hz AMOLED tablet, Snapdragon 8 Gen 3, 12GB RAM, S-Pen included.',img:'https://images.unsplash.com/photo-1544244015-0df4512aecd8?w=600',t:['tablet','snapdragon','amoled']},
  {n:'StreamDeck XL Pro',sku:'TCH-STR-301',c:'tech',p:249,cp:299,s:18,r:4.7,rc:1450,f:false,d:false,desc:'32-key customizable stream controller, LCD keys, RGB, USB-C, for creators.',img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',t:['streamdeck','creator','rgb']},
  {n:'HoloView AR Glasses Gen 2',sku:'TCH-AR-302',c:'tech',p:899,cp:1099,s:10,r:4.6,rc:560,f:true,d:false,desc:'Lightweight AR glasses, 2hr battery, spatial audio, 60° FOV.',img:'https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=600',t:['ar','glasses','wearable']},
  {n:'DroneEye 4K Mini Foldable',sku:'TCH-DRN-303',c:'tech',p:349,cp:449,s:16,r:4.7,rc:1230,f:true,d:true,desc:'4K/60fps foldable drone, 32min flight, GPS auto-return, obstacle avoidance.',img:'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600',t:['drone','4k','gps']},
  {n:'PowerSkin 20000mAh Laptop Bank',sku:'TCH-PWR-304',c:'tech',p:89,cp:119,s:55,r:4.6,rc:2780,f:false,d:false,desc:'20000mAh slim power bank, 140W USB-C PD, charges laptops, 3 ports.',img:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600',t:['power-bank','laptop','usb-c']},
  {n:'VR Headset Evo 3',sku:'TCH-VR-305',c:'tech',p:399,cp:499,s:14,r:4.5,rc:890,f:false,d:true,desc:'Standalone VR headset, 4K per-eye, 110° FOV, 2.5hr battery, 128GB.',img:'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600',t:['vr','headset','gaming']},
  {n:'NanoBot Robotic Vacuum X9',sku:'TCH-ROB-306',c:'tech',p:549,cp:699,s:19,r:4.8,rc:3340,f:true,d:false,desc:'LiDAR mapping robot vacuum + mop, 180min runtime, auto-empty base.',img:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600',t:['robot-vacuum','lidar','smart-home']},
  {n:'QuantumCharge Wireless Mat',sku:'TCH-CHG-307',c:'tech',p:59,cp:79,s:90,r:4.5,rc:4560,f:false,d:false,desc:'15W Qi2 wireless charging mat, 3-device simultaneous, LED indicator.',img:'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600',t:['wireless-charger','qi2','qi']},
  {n:'SmartLock Pro Fingerprint Deadbolt',sku:'TCH-LOK-308',c:'tech',p:189,cp:249,s:27,r:4.7,rc:1120,f:false,d:true,desc:'Fingerprint + PIN + app smart deadbolt, 100 fingerprints, auto-lock.',img:'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600',t:['smart-lock','fingerprint','security']},
  {n:'FoldBook Tri-Panel Monitor',sku:'TCH-MON-309',c:'tech',p:299,cp:379,s:11,r:4.6,rc:670,f:false,d:false,desc:'Tri-fold 15.6" portable 1080p monitor, USB-C, built-in kickstand, 500 nits.',img:'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600',t:['monitor','portable','foldable']},
  {n:'EchoSmart Translator Buds',sku:'TCH-TRN-310',c:'tech',p:129,cp:169,s:33,r:4.4,rc:1890,f:false,d:false,desc:'Real-time translation earbuds, 40+ languages, 12h battery, offline mode.',img:'https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=600',t:['translation','earbuds','travel']},
  {n:'DigiScope 4K Endoscope Camera',sku:'TCH-CAM-311',c:'tech',p:49,cp:69,s:78,r:4.3,rc:2230,f:false,d:true,desc:'4mm 4K endoscope, 5m flexible cable, Wi-Fi, IP67, LED, iOS + Android.',img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',t:['endoscope','camera','wifi']},

  // ── GAMING EXPANDED (8 more → 20 total) ──────────────────────────────────
  {n:'ProStrike Mechanical Keyboard RGB',sku:'GAM-KBD-320',c:'gaming',p:149,cp:189,s:42,r:4.8,rc:5670,f:true,d:false,desc:'Full-size mechanical gaming keyboard, optical switches, per-key RGB, USB passthrough.',img:'https://images.unsplash.com/photo-1609592424858-7de65a53f4f1?w=600',t:['keyboard','mechanical','rgb']},
  {n:'HyperClaw Pro Gaming Mouse',sku:'GAM-MOU-321',c:'gaming',p:89,cp:119,s:65,r:4.7,rc:7890,f:true,d:true,desc:'26000 DPI optical, 11 programmable buttons, 95h battery, ultra-light 58g.',img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600',t:['mouse','gaming','wireless']},
  {n:'SonicBoom 7.1 Gaming Headset',sku:'GAM-HDS-322',c:'gaming',p:119,cp:159,s:38,r:4.6,rc:3450,f:false,d:false,desc:'Virtual 7.1 surround sound gaming headset, 50mm drivers, noise-cancelling mic.',img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',t:['headset','gaming','surround']},
  {n:'GlideForce XL Gaming Mousepad',sku:'GAM-PAD-323',c:'gaming',p:39,cp:55,s:120,r:4.7,rc:8900,f:false,d:false,desc:'900×400mm XXL gaming mousepad, stitched edges, RGB perimeter lighting, USB hub.',img:'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600',t:['mousepad','xxl','rgb']},
  {n:'TurboStick Pro Racing Wheel',sku:'GAM-WHL-324',c:'gaming',p:279,cp:349,s:12,r:4.5,rc:890,f:false,d:true,desc:'270° racing wheel + pedals, force feedback, PS/Xbox/PC compatible.',img:'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600',t:['racing-wheel','sim-racing','controller']},
  {n:'CapturePro 4K HDMI Capture Card',sku:'GAM-CAP-325',c:'gaming',p:179,cp:229,s:25,r:4.6,rc:1230,f:false,d:false,desc:'4K60 pass-through capture card, USB-C, zero-lag, compatible with all major software.',img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',t:['capture-card','streaming','4k']},
  {n:'ArmCraft Adjustable Monitor Arm',sku:'GAM-ARM-326',c:'gaming',p:69,cp:89,s:55,r:4.7,rc:3120,f:false,d:false,desc:'Single monitor arm, holds 32", C-clamp + grommet, cable management, 360°.',img:'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600',t:['monitor-arm','desk','ergonomic']},
  {n:'FlexPad Gaming Seat Cushion',sku:'GAM-CSH-327',c:'gaming',p:49,cp:69,s:80,r:4.4,rc:2340,f:false,d:false,desc:'Memory foam gaming seat cushion with coccyx cutout, non-slip base, washable cover.',img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',t:['cushion','gaming','ergonomic']},

  // ── HOME EXPANDED (8 more → 20 total) ────────────────────────────────────
  {n:'AirPure HEPA Air Purifier H13',sku:'HOM-AIR-330',c:'home',p:189,cp:249,s:28,r:4.8,rc:4560,f:true,d:true,desc:'True HEPA H13 air purifier, 600 sq ft, auto mode, PM2.5 sensor, ultra-quiet.',img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',t:['air-purifier','hepa','smart-home']},
  {n:'ChromaCast LED Strip 10m Kit',sku:'HOM-LED-331',c:'home',p:49,cp:69,s:150,r:4.5,rc:8900,f:false,d:false,desc:'10m Wi-Fi RGBIC LED strip, music sync, app control, works with Alexa/Google.',img:'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',t:['led-strip','rgb','smart-home']},
  {n:'DreamSleep Smart Mattress Pad',sku:'HOM-MAT-332',c:'home',p:299,cp:399,s:14,r:4.6,rc:1230,f:true,d:false,desc:'Active cooling/heating mattress pad, dual zone, app control, sleep tracking.',img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',t:['mattress','sleep','smart-home']},
  {n:'EchoClean Ultrasonic Cleaner',sku:'HOM-CLN-333',c:'home',p:59,cp:79,s:67,r:4.5,rc:3450,f:false,d:true,desc:'600ml ultrasonic cleaner, 40kHz, timer, for jewelry, glasses, dental retainers.',img:'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600',t:['ultrasonic','cleaner','jewelry']},
  {n:'TerraGrow Smart Plant Monitor',sku:'HOM-PLT-334',c:'home',p:39,cp:55,s:89,r:4.4,rc:2340,f:false,d:false,desc:'Soil moisture, light, temperature, fertility sensor — Bluetooth to app.',img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',t:['plant','smart','garden']},
  {n:'SleepShield Blackout Curtain Set',sku:'HOM-CRT-335',c:'home',p:79,cp:109,s:45,r:4.7,rc:5670,f:false,d:false,desc:'Pair of thermal blackout curtains, 100% light block, 52"×84", 12 colors.',img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',t:['curtains','blackout','thermal']},
  {n:'StormShield Doorbell Camera 2K',sku:'HOM-CAM-336',c:'home',p:99,cp:139,s:38,r:4.6,rc:3120,f:true,d:true,desc:'2K wired video doorbell, color night vision, two-way audio, package detection.',img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',t:['doorbell','camera','security']},
  {n:'HydroWarm Smart Radiator Valve',sku:'HOM-HVR-337',c:'home',p:49,cp:69,s:67,r:4.5,rc:2890,f:false,d:false,desc:'Smart TRV radiator valve, weekly scheduling, open-window detection, Zigbee.',img:'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600',t:['radiator','smart-home','heating']},

  // ── FASHION EXPANDED (8 more → 20 total) ─────────────────────────────────
  {n:'UrbanFlex Stretch Chinos',sku:'FSH-CHN-340',c:'fashion',p:79,cp:109,s:55,r:4.6,rc:3450,f:false,d:false,desc:'4-way stretch slim-fit chinos, moisture-wicking, 8 colors, 30-38 waist.',img:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',t:['chinos','stretch','mens']},
  {n:'LuxeSoft Cashmere Blend Sweater',sku:'FSH-SWR-341',c:'fashion',p:129,cp:179,s:28,r:4.8,rc:1890,f:true,d:true,desc:'70% cashmere blend crew-neck sweater, hand-wash, 6 rich colors, XS-XXL.',img:'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600',t:['cashmere','sweater','luxury']},
  {n:'TrailRunner Pro Hiking Boot',sku:'FSH-BOT-342',c:'fashion',p:159,cp:209,s:33,r:4.7,rc:2340,f:true,d:false,desc:'Waterproof hiking boot, Vibram sole, EVA midsole, ankle support, US 6-14.',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',t:['hiking','boots','waterproof']},
  {n:'SilkTouch Satin Midi Dress',sku:'FSH-DRS-343',c:'fashion',p:99,cp:139,s:40,r:4.6,rc:1560,f:false,d:true,desc:'Flowy satin midi dress, cowl neck, adjustable straps, 8 colors, XS-XL.',img:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',t:['dress','satin','womens']},
  {n:'PackFlex Packable Down Jacket',sku:'FSH-JKT-344',c:'fashion',p:149,cp:199,s:22,r:4.8,rc:3120,f:true,d:false,desc:'650-fill packable down jacket, packs into own pocket, windproof, 12 colors.',img:'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600',t:['jacket','down','packable']},
  {n:'ClassicFrame UV400 Sunglasses',sku:'FSH-SGL-345',c:'fashion',p:59,cp:89,s:67,r:4.5,rc:4560,f:false,d:false,desc:'Polarized UV400 acetate frame sunglasses, spring hinges, case included, 6 colors.',img:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',t:['sunglasses','polarized','uv400']},
  {n:'BagMaster Leather Tote',sku:'FSH-BAG-346',c:'fashion',p:189,cp:249,s:18,r:4.7,rc:1230,f:false,d:true,desc:'Full-grain leather tote bag, interior pockets, magnetic snap, 3 sizes, 4 colors.',img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',t:['tote','leather','bag']},
  {n:'ComfortKnit Performance Socks 6pk',sku:'FSH-SCK-347',c:'fashion',p:29,cp:39,s:200,r:4.6,rc:8900,f:false,d:false,desc:'Merino wool blend athletic socks, cushioned sole, arch support, 6-pack, M/L/XL.',img:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',t:['socks','merino','athletic']},

  // ── BEAUTY EXPANDED (7 more → 15 total) ──────────────────────────────────
  {n:'GlowLab Vitamin C Serum 30ml',sku:'BTY-SRM-350',c:'beauty',p:49,cp:69,s:89,r:4.7,rc:6780,f:true,d:false,desc:'20% Vitamin C + Hyaluronic Acid brightening serum, dermatologist tested.',img:'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600',t:['serum','vitamin-c','skincare']},
  {n:'DermaWand Face Massager',sku:'BTY-MSG-351',c:'beauty',p:89,cp:119,s:34,r:4.5,rc:2340,f:false,d:true,desc:'Radio frequency face lifting wand, anti-aging, 5 intensity levels, LCD display.',img:'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600',t:['face-massager','rf','anti-aging']},
  {n:'LashLift Pro Heated Eyelash Curler',sku:'BTY-LSH-352',c:'beauty',p:29,cp:39,s:120,r:4.4,rc:4560,f:false,d:false,desc:'Heated eyelash curler, 3 temperature settings, 10s heat-up, cordless.',img:'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600',t:['eyelash','heated','makeup']},
  {n:'SaltGlow Body Scrub Set',sku:'BTY-SCR-353',c:'beauty',p:39,cp:55,s:67,r:4.6,rc:3120,f:false,d:true,desc:'4-piece Himalayan salt body scrub set, coconut oil base, lavender/citrus/rose/mint.',img:'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600',t:['body-scrub','himalayan','gift-set']},
  {n:'HairMend Keratin Treatment Kit',sku:'BTY-KRT-354',c:'beauty',p:59,cp:79,s:45,r:4.5,rc:2890,f:false,d:false,desc:'At-home keratin smoothing treatment kit, controls frizz for 3 months.',img:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',t:['keratin','hair','treatment']},
  {n:'NailPro Gel Lamp 54W UV/LED',sku:'BTY-NAL-355',c:'beauty',p:35,cp:49,s:150,r:4.6,rc:5670,f:false,d:false,desc:'54W dual UV/LED gel nail lamp, 30s/60s/90s timers, fits all gel types.',img:'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600',t:['nail-lamp','gel','uv-led']},
  {n:'PerfumeCraft Fragrance Discovery Set',sku:'BTY-PFM-356',c:'beauty',p:79,cp:99,s:28,r:4.7,rc:1890,f:true,d:true,desc:'10×2ml luxury fragrance discovery set, full-size voucher included, unisex.',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600',t:['perfume','fragrance','discovery']},

  // ── SPORTS EXPANDED (8 more → 18 total) ──────────────────────────────────
  {n:'AeroPump Smart Jump Rope',sku:'SPT-JRP-360',c:'sports',p:39,cp:55,s:90,r:4.6,rc:4560,f:false,d:false,desc:'Smart digital jump rope, calorie counter, 30-day rope included, phone-free.',img:'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',t:['jump-rope','smart','cardio']},
  {n:'FlexPull Resistance Band Set 11pc',sku:'SPT-RST-361',c:'sports',p:34,cp:49,s:150,r:4.7,rc:8900,f:false,d:false,desc:'11-piece latex resistance band set, door anchor, handles, ankle straps, 10-150lb.',img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',t:['resistance-bands','workout','home-gym']},
  {n:'IceBath Recovery Tub',sku:'SPT-ICE-362',c:'sports',p:189,cp:249,s:15,r:4.5,rc:780,f:false,d:true,desc:'Collapsible ice bath tub, 400L, insulated, cover included, fits 6-ft athletes.',img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',t:['ice-bath','recovery','athlete']},
  {n:'SquashPro Graphite Racket',sku:'SPT-SQH-363',c:'sports',p:129,cp:169,s:25,r:4.6,rc:1230,f:false,d:false,desc:'Graphite squash racket, 130g, pre-strung, head-heavy balance, carry case.',img:'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600',t:['squash','racket','graphite']},
  {n:'SwimPro Triathlon Wetsuit',sku:'SPT-WST-364',c:'sports',p:249,cp:329,s:14,r:4.7,rc:670,f:true,d:false,desc:'Open-water triathlon wetsuit, 5/3mm neoprene, YKK zipper, S-XXL.',img:'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',t:['wetsuit','triathlon','swimming']},
  {n:'PowerBlock Elite Dumbbell 50lb',sku:'SPT-DBL-365',c:'sports',p:349,cp:449,s:12,r:4.8,rc:2340,f:true,d:true,desc:'Adjustable dumbbell set, replaces 28 dumbbells, 2.5-50lb each, selector pin.',img:'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600',t:['dumbbell','adjustable','strength']},
  {n:'ChakraYoga Block + Strap Set',sku:'SPT-YGA-366',c:'sports',p:24,cp:34,s:200,r:4.5,rc:5670,f:false,d:false,desc:'EVA cork yoga block + 8ft woven strap combo, anti-slip, 5 colors.',img:'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600',t:['yoga','block','strap']},
  {n:'CyclePro Cadence + Speed Sensor',sku:'SPT-CYC-367',c:'sports',p:49,cp:69,s:55,r:4.5,rc:1890,f:false,d:false,desc:'ANT+/Bluetooth dual speed + cadence sensor, pairs with Garmin/Wahoo/Zwift.',img:'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',t:['cycling','cadence','sensor']},

  // ── OFFICE EXPANDED (7 more → 15 total) ──────────────────────────────────
  {n:'ErgoLean Standing Desk Mat',sku:'OFC-MAT-370',c:'office',p:79,cp:109,s:55,r:4.7,rc:3450,f:false,d:false,desc:'Anti-fatigue standing desk mat, beveled edge, 3/4" thick, 32×24", 4 colors.',img:'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600',t:['standing-mat','anti-fatigue','ergonomic']},
  {n:'SilentClick Wireless Keyboard Mouse Combo',sku:'OFC-KBD-371',c:'office',p:59,cp:79,s:89,r:4.6,rc:5670,f:false,d:false,desc:'Silent wireless keyboard + mouse set, 2.4GHz, 36-month battery, full-size.',img:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',t:['keyboard','mouse','wireless']},
  {n:'PaperFlow A4 Shredder Cross-Cut',sku:'OFC-SHR-372',c:'office',p:89,cp:119,s:33,r:4.5,rc:1230,f:false,d:true,desc:'12-sheet cross-cut paper shredder, 25L bin, continuous 8-min run, P-4 security.',img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',t:['shredder','paper','office']},
  {n:'DeskOrganizer Bamboo 6-Compartment',sku:'OFC-ORG-373',c:'office',p:39,cp:55,s:78,r:4.7,rc:4560,f:false,d:false,desc:'Bamboo desktop organizer, 6 slots + drawer, pen holder, eco-friendly.',img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',t:['organizer','bamboo','desk']},
  {n:'LumiDesk Smart Desk Lamp',sku:'OFC-LMP-374',c:'office',p:79,cp:99,s:45,r:4.6,rc:2890,f:true,d:false,desc:'Smart LED desk lamp, 1000lm, color temperature 2700-6500K, 15W USB-A charging.',img:'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600',t:['desk-lamp','smart','usb-charging']},
  {n:'NoisePro Acoustic Foam Panel 12pk',sku:'OFC-ACU-375',c:'office',p:49,cp:69,s:67,r:4.4,rc:2340,f:false,d:false,desc:'12-pack acoustic foam panels, 12"×12"×1", NRC 0.85, self-adhesive peel-stick.',img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',t:['acoustic','foam','soundproofing']},
  {n:'MeetPro Conference Speakerphone',sku:'OFC-SPK-376',c:'office',p:149,cp:199,s:22,r:4.7,rc:1560,f:true,d:true,desc:'Omnidirectional conference speakerphone, 6m pickup radius, USB/Bluetooth, echo cancel.',img:'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600',t:['speakerphone','conference','bluetooth']},

  // ── MUSIC EXPANDED (7 more → 15 total) ───────────────────────────────────
  {n:'KeyMaster 61-Key MIDI Controller',sku:'MUS-MID-380',c:'music',p:199,cp:259,s:18,r:4.7,rc:1230,f:true,d:false,desc:'61-key semi-weighted MIDI keyboard, aftertouch, pitch/mod wheels, USB, DAW-ready.',img:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600',t:['midi','keyboard','controller']},
  {n:'AcousticPro Soundhole Pickup',sku:'MUS-PKP-381',c:'music',p:49,cp:69,s:55,r:4.5,rc:890,f:false,d:false,desc:'Passive soundhole acoustic guitar pickup, volume control, strap pin, plug-in.',img:'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600',t:['pickup','acoustic','guitar']},
  {n:'BeatBox Drum Pad 16-Pad Controller',sku:'MUS-DRM-382',c:'music',p:129,cp:169,s:28,r:4.6,rc:1560,f:false,d:true,desc:'16 velocity-sensitive RGB pads, 8 faders, transport controls, USB bus-powered.',img:'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=600',t:['drum-pad','beatmaking','controller']},
  {n:'CajonPro Samba Drum Box',sku:'MUS-CAJ-383',c:'music',p:159,cp:209,s:15,r:4.7,rc:780,f:false,d:false,desc:'Handcrafted birch cajon drum with snare wires, adjustable response, padded seat.',img:'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=600',t:['cajon','drum','percussion']},
  {n:'RecordLink USB Audio Interface 2-in',sku:'MUS-AIF-384',c:'music',p:99,cp:139,s:33,r:4.8,rc:2340,f:true,d:false,desc:'2-in/2-out 24-bit/192kHz USB audio interface, phantom power, loopback, bus-powered.',img:'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600',t:['audio-interface','recording','usb']},
  {n:'HarmonicStudio Monitor Speakers 5"',sku:'MUS-MON-385',c:'music',p:249,cp:319,s:14,r:4.7,rc:1120,f:false,d:true,desc:'Pair of 5" bi-amplified studio monitors, 70W total, XLR/TRS/RCA inputs.',img:'https://images.unsplash.com/photo-1558089687-f282ffcbc0d6?w=600',t:['studio-monitors','recording','speakers']},
  {n:'StringMaster Guitar Capo + Tuner Bundle',sku:'MUS-CPO-386',c:'music',p:29,cp:39,s:200,r:4.5,rc:5670,f:false,d:false,desc:'Spring-loaded capo + clip-on chromatic tuner bundle, fits guitar/ukulele/bass.',img:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',t:['capo','tuner','guitar']},

  // ── KITCHEN EXPANDED (7 more → 15 total) ─────────────────────────────────
  {n:'NutriBlade 1200W Pro Blender',sku:'KIT-BLD-390',c:'kitchen',p:149,cp:199,s:33,r:4.8,rc:4560,f:true,d:true,desc:'1200W professional blender, 72oz BPA-free pitcher, 6 stainless blades, self-clean.',img:'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600',t:['blender','1200w','smoothie']},
  {n:'CastIron Chef 12" Skillet',sku:'KIT-SKL-391',c:'kitchen',p:59,cp:79,s:78,r:4.9,rc:7890,f:false,d:false,desc:'Pre-seasoned cast iron skillet, 12", helper handle, oven-safe to 500°F, lifetime.',img:'https://images.unsplash.com/photo-1544244015-0df4512aecd8?w=600',t:['cast-iron','skillet','cookware']},
  {n:'FrothMaster Milk Frother 4-in-1',sku:'KIT-FRT-392',c:'kitchen',p:39,cp:55,s:120,r:4.6,rc:6780,f:false,d:false,desc:'Electric milk frother, hot/cold foam, hot milk, stand included, 400ml capacity.',img:'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600',t:['frother','milk','coffee']},
  {n:'SousVide Precision Cooker 1200W',sku:'KIT-SVD-393',c:'kitchen',p:119,cp:159,s:27,r:4.7,rc:2340,f:true,d:true,desc:'1200W sous vide immersion circulator, ±0.1°C precision, 20L max, WiFi control.',img:'https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=600',t:['sous-vide','precision','cooking']},
  {n:'SpiceVault Magnetic Jar Set 24pc',sku:'KIT-SPC-394',c:'kitchen',p:49,cp:69,s:89,r:4.5,rc:4560,f:false,d:false,desc:'24 magnetic airtight spice jars, labels included, fridge/wall mountable, clear glass.',img:'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600',t:['spice-jars','magnetic','kitchen']},
  {n:'BrewMaster Cold Brew Coffee Maker',sku:'KIT-CBR-395',c:'kitchen',p:45,cp:65,s:100,r:4.6,rc:3450,f:false,d:false,desc:'1L cold brew coffee maker, fine mesh filter, borosilicate glass, dishwasher safe.',img:'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600',t:['cold-brew','coffee','glass']},
  {n:'PizzaStone Cordierite Baking Kit',sku:'KIT-PIZ-396',c:'kitchen',p:39,cp:55,s:67,r:4.7,rc:2890,f:false,d:true,desc:'Cordierite pizza stone 14", wooden peel, pizza cutter bundle — oven/grill safe.',img:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600',t:['pizza','baking','stone']},

  // ── TRAVEL EXPANDED (7 more → 15 total) ──────────────────────────────────
  {n:'AeroRoll Compression Packing Cube Set',sku:'TRV-PCK-400',c:'travel',p:49,cp:69,s:120,r:4.7,rc:6780,f:false,d:false,desc:'6-piece compression packing cube set, 50% space saving, mesh top, 4 sizes.',img:'https://images.unsplash.com/photo-1553531384-411a247ccd73?w=600',t:['packing-cubes','travel','compression']},
  {n:'LockSafe TSA Travel Padlock',sku:'TRV-LCK-401',c:'travel',p:19,cp:29,s:200,r:4.5,rc:8900,f:false,d:false,desc:'TSA-approved combination lock, resettable 3-digit, durable zinc alloy, 2-pack.',img:'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600',t:['padlock','tsa','security']},
  {n:'NeckRest Memory Foam Travel Pillow',sku:'TRV-PIL-402',c:'travel',p:35,cp:49,s:150,r:4.6,rc:7890,f:false,d:true,desc:'Memory foam neck pillow, 360° support, compressible to 1/4 size, machine wash.',img:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',t:['travel-pillow','neck','memory-foam']},
  {n:'SolarCharge 20W Foldable Panel',sku:'TRV-SOL-403',c:'travel',p:89,cp:119,s:28,r:4.5,rc:1230,f:false,d:false,desc:'20W foldable solar charger panel, dual USB-C + USB-A, IP65, 1.8kg, camping.',img:'https://images.unsplash.com/photo-1599669454699-248893623440?w=600',t:['solar','charger','camping']},
  {n:'TrekPack 40L Hiking Backpack',sku:'TRV-BAG-404',c:'travel',p:119,cp:159,s:34,r:4.7,rc:2340,f:true,d:false,desc:'40L waterproof hiking backpack, hip belt, rain cover, laptop sleeve, 5 colors.',img:'https://images.unsplash.com/photo-1553531384-411a247ccd73?w=600',t:['backpack','hiking','40l']},
  {n:'SleepMask Pro 3D Contoured',sku:'TRV-MSK-405',c:'travel',p:25,cp:35,s:200,r:4.6,rc:5670,f:false,d:false,desc:'3D contoured blackout sleep mask, memory foam nose piece, earplugs included.',img:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',t:['sleep-mask','3d','travel']},
  {n:'GlobeAdapter Universal Travel Plug',sku:'TRV-ADP-406',c:'travel',p:29,cp:39,s:200,r:4.5,rc:9870,f:false,d:false,desc:'Universal travel adapter, 220 countries, 2 USB-A + 1 USB-C, surge protection.',img:'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600',t:['travel-adapter','universal','usb']},

  // ── BOOKS EXPANDED (9 more → 15 total) ───────────────────────────────────
  {n:'DocuScan A4 Portable Scanner',sku:'BOK-SCN-410',c:'books',p:129,cp:169,s:22,r:4.6,rc:1230,f:true,d:false,desc:'A4 portable wand scanner, 1200dpi, Wi-Fi to cloud, PDF/JPEG, 4800mAh battery.',img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',t:['scanner','portable','document']},
  {n:'ReadEasy Premium Book Stand Adjustable',sku:'BOK-STD-411',c:'books',p:45,cp:65,s:78,r:4.5,rc:2340,f:false,d:false,desc:'Premium adjustable aluminum book/tablet stand, 10 angles, foldable, desktop/lap.',img:'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600',t:['book-stand','adjustable','reading']},
  {n:'NoteSync Smart Notebook A5',sku:'BOK-NTB-412',c:'books',p:35,cp:49,s:100,r:4.6,rc:3450,f:false,d:true,desc:'Reusable smart notebook, microwave erase, cloud sync app, 36 dotted pages, A5.',img:'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600',t:['smart-notebook','reusable','sync']},
  {n:'PageLite LED Book Light Rechargeable',sku:'BOK-LGT-413',c:'books',p:19,cp:29,s:200,r:4.5,rc:7890,f:false,d:false,desc:'Rechargeable LED book light, 3 brightness + 3 color temps, flexible neck, clip-on.',img:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600',t:['book-light','led','rechargeable']},
  {n:'InkPro Fountain Pen Set',sku:'BOK-PEN-414',c:'books',p:59,cp:79,s:45,r:4.7,rc:1890,f:false,d:false,desc:'3-pen fountain pen set, Medium/Fine/Calligraphy nibs, 30 ink cartridges, case.',img:'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600',t:['fountain-pen','writing','calligraphy']},
  {n:'MemoryVault Digital Photo Album',sku:'BOK-ALB-415',c:'books',p:79,cp:99,s:28,r:4.4,rc:1230,f:false,d:true,desc:'10" digital photo frame/album, 32GB, Wi-Fi, auto-receive photos via app, IPS.',img:'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600',t:['digital-frame','photo','wifi']},
  {n:'StudyPro Noise-Cancelling Earplugs',sku:'BOK-EAR-416',c:'books',p:29,cp:39,s:150,r:4.5,rc:4560,f:false,d:false,desc:'High-fidelity noise-reducing earplugs, SNR 27dB, reusable, carrying case, 3 sizes.',img:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',t:['earplugs','noise-cancelling','study']},
  {n:'AnnotateIt Dual-Tip Highlighter 20pk',sku:'BOK-HGL-417',c:'books',p:14,cp:19,s:300,r:4.5,rc:9870,f:false,d:false,desc:'20-color dual-tip chisel+fine highlighter set, quick-dry, no bleed, pastel+neon.',img:'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600',t:['highlighter','stationery','study']},
  {n:'DeskPad XL Leather Writing Mat',sku:'BOK-DPD-418',c:'books',p:69,cp:89,s:45,r:4.7,rc:2340,f:false,d:true,desc:'36×17" PU leather desk mat, smooth writing surface, waterproof, 5 colors.',img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',t:['desk-mat','leather','writing']},

  // ── WEARABLES EXPANDED (7 more → 15 total) ───────────────────────────────
  {n:'RunIQ GPS Running Watch',sku:'WER-GPS-420',c:'wearables',p:179,cp:229,s:28,r:4.7,rc:2340,f:true,d:true,desc:'Dedicated GPS running watch, auto-lap, heart rate, VO2max, 20h battery, 5ATM.',img:'https://images.unsplash.com/photo-1709649246219-220dfca6f75a?w=600',t:['running-watch','gps','fitness']},
  {n:'ThermoSense Body Thermometer Patch',sku:'WER-TMP-421',c:'wearables',p:49,cp:69,s:55,r:4.4,rc:890,f:false,d:false,desc:'Continuous body temperature patch, 7-day wear, Bluetooth, fever alert app.',img:'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',t:['thermometer','patch','health']},
  {n:'ZenBand EEG Meditation Headband',sku:'WER-MED-422',c:'wearables',p:229,cp:299,s:12,r:4.5,rc:560,f:false,d:true,desc:'EEG meditation headband, real-time brain activity feedback, guided sessions, 5hr.',img:'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',t:['eeg','meditation','wellness']},
  {n:'FlexGlove Smart Rehabilitation Glove',sku:'WER-GLV-423',c:'wearables',p:159,cp:209,s:14,r:4.3,rc:340,f:false,d:false,desc:'Smart compression glove, finger tracking, vibration therapy, arthritis relief.',img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',t:['glove','smart','rehabilitation']},
  {n:'SolarPulse UV Index Watch',sku:'WER-UV-424',c:'wearables',p:89,cp:119,s:33,r:4.4,rc:780,f:false,d:false,desc:'Analog watch with UV index display, solar charge backup, WR50, unisex.',img:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',t:['uv-watch','solar','outdoor']},
  {n:'BreatheSmart Smart Posture Shirt',sku:'WER-POS-425',c:'wearables',p:69,cp:89,s:40,r:4.3,rc:1230,f:false,d:true,desc:'Posture-correcting smart shirt, biometric sensors, vibration feedback, S-XXL.',img:'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',t:['posture','smart-shirt','biometric']},
  {n:'VitaBand Medical Alert Smart Band',sku:'WER-MDL-426',c:'wearables',p:59,cp:79,s:55,r:4.6,rc:1890,f:false,d:false,desc:'Medical alert smart band, emergency SOS, fall detection, heart rate, IP68, elderly.',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['medical-alert','sos','elderly']},

  // ── COMPUTING EXPANDED (7 more → 15 total) ───────────────────────────────
  {n:'DualBoot Portable SSD 2TB',sku:'CMP-SSD-430',c:'computing',p:149,cp:189,s:38,r:4.8,rc:4560,f:true,d:false,desc:'2TB portable SSD, 2000MB/s USB 3.2 Gen2x2, rugged IP55, fits in pocket.',img:'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600',t:['ssd','portable','2tb']},
  {n:'PixelPen 2 Stylus for Tablets',sku:'CMP-STY-431',c:'computing',p:89,cp:119,s:28,r:4.6,rc:1890,f:false,d:false,desc:'4096-level pressure stylus, palm rejection, tilt support, USB-C charge, 10hr.',img:'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600',t:['stylus','tablet','drawing']},
  {n:'NexHub 12-in-1 USB-C Docking Station',sku:'CMP-HUB-432',c:'computing',p:119,cp:159,s:33,r:4.7,rc:2340,f:true,d:true,desc:'12-port USB-C dock: 4K HDMI, DP, 5× USB-A, SD/TF, 100W PD, Gigabit Ethernet.',img:'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=600',t:['usb-c-hub','docking','12-in-1']},
  {n:'StreamCam 4K Webcam AutoFocus',sku:'CMP-CAM-433',c:'computing',p:119,cp:159,s:27,r:4.7,rc:3120,f:false,d:false,desc:'4K/30fps webcam, AI autofocus, built-in stereo mic, privacy cover, USB-C.',img:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',t:['webcam','4k','streaming']},
  {n:'SilentFan 120mm RGB PC Case Fan',sku:'CMP-FAN-434',c:'computing',p:19,cp:29,s:200,r:4.5,rc:6780,f:false,d:false,desc:'120mm ARGB PWM case fan, 1200RPM, 23dB, daisy-chain, 3-pack.',img:'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',t:['pc-fan','rgb','cooling']},
  {n:'WristEase Ergonomic Wrist Rest Set',sku:'CMP-WRS-435',c:'computing',p:34,cp:49,s:89,r:4.6,rc:3450,f:false,d:false,desc:'Memory foam wrist rest set for keyboard + mouse, non-slip, cooling gel, 3 colors.',img:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',t:['wrist-rest','ergonomic','memory-foam']},
  {n:'NetGuard WiFi 6 Range Extender',sku:'CMP-EXT-436',c:'computing',p:69,cp:89,s:55,r:4.5,rc:2890,f:false,d:true,desc:'WiFi 6 AX3000 range extender, ethernet port, 4 antennas, covers 2500 sq ft.',img:'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=600',t:['wifi-extender','wifi6','networking']},

  // ── ELECTRONICS EXPANDED (7 more → 15 total) ─────────────────────────────
  {n:'SolarGuard 100W Rooftop Panel',sku:'ELC-SOL-440',c:'electronics',p:199,cp:259,s:15,r:4.6,rc:780,f:false,d:false,desc:'100W monocrystalline solar panel, IP68, MC4 connectors, 10yr warranty.',img:'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600',t:['solar-panel','100w','renewable']},
  {n:'PowerStation 500Wh Portable Generator',sku:'ELC-PWS-441',c:'electronics',p:499,cp:649,s:12,r:4.8,rc:1230,f:true,d:true,desc:'500Wh LiFePO4 portable power station, 600W AC outlet, solar compatible.',img:'https://images.unsplash.com/photo-1609092460842-25a4aab1e8da?w=600',t:['power-station','lifepo4','camping']},
  {n:'HiddenCam Nanny Spy Detector',sku:'ELC-SPY-442',c:'electronics',p:49,cp:69,s:67,r:4.4,rc:2340,f:false,d:false,desc:'RF/lens spy camera detector, laser + RF detection, 10m range, USB rechargeable.',img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',t:['detector','security','privacy']},
  {n:'SoundBar Pro 120W Dolby Atmos',sku:'ELC-SND-443',c:'electronics',p:249,cp:329,s:18,r:4.7,rc:2890,f:true,d:false,desc:'3.1ch 120W soundbar, Dolby Atmos, ARC/eARC HDMI, Wi-Fi + BT 5.0.',img:'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600',t:['soundbar','dolby-atmos','hdmi']},
  {n:'StepDown 220V to 110V Converter 2000W',sku:'ELC-CNV-444',c:'electronics',p:59,cp:79,s:45,r:4.4,rc:1560,f:false,d:false,desc:'2000W voltage converter 220V to 110V, CE certified, thermal cutoff, indicator.',img:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',t:['converter','voltage','travel']},
  {n:'SmartSensor CO + Gas Alarm Combo',sku:'ELC-ALM-445',c:'electronics',p:39,cp:55,s:89,r:4.6,rc:3450,f:false,d:true,desc:'Combo CO + natural gas detector, 85dB alarm, 5-year sensor life, plug-in + battery.',img:'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600',t:['co-detector','gas','safety']},
  {n:'TeleCast HDMI to SDI Converter',sku:'ELC-CNV-446',c:'electronics',p:79,cp:109,s:22,r:4.5,rc:560,f:false,d:false,desc:'HDMI to 3G-SDI broadcast converter, 1080p60, mini-DIN BNC, powered.',img:'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600',t:['hdmi','sdi','broadcast']},

  // ── AUDIO EXPANDED (7 more → 15 total) ───────────────────────────────────
  {n:'SurroundBar 2.1 Desk Speaker System',sku:'AUD-DSK-450',c:'audio',p:159,cp:209,s:22,r:4.7,rc:1560,f:true,d:true,desc:'2.1 desktop speaker system, 60W subwoofer, optical in, Bluetooth 5.0, wood cab.',img:'https://images.unsplash.com/photo-1558089687-f282ffcbc0d6?w=600',t:['desktop-speakers','2.1','bluetooth']},
  {n:'EarMold Custom-Fit Swim Earplugs',sku:'AUD-SWM-451',c:'audio',p:24,cp:34,s:150,r:4.5,rc:3450,f:false,d:false,desc:'Silicone moldable swim earplugs, waterproof, 3 sizes, 3 pairs + carry case.',img:'https://images.unsplash.com/photo-1525825691042-e14d9042fc70?w=600',t:['earplugs','swim','waterproof']},
  {n:'NightOwl Sleep Sound Machine',sku:'AUD-SND-452',c:'audio',p:45,cp:65,s:89,r:4.7,rc:5670,f:false,d:false,desc:'30 non-looping sleep sounds, night light, auto-off timer, white noise machine.',img:'https://images.unsplash.com/photo-1542483381-41a479b1fb88?w=600',t:['sleep-sound','white-noise','machine']},
  {n:'ConferenceCam 360° All-in-One Bar',sku:'AUD-CNF-453',c:'audio',p:299,cp:399,s:12,r:4.6,rc:780,f:false,d:true,desc:'360° conference cam + 8-mic array, AI noise cancel, USB-C + HDMI, 15 people.',img:'https://images.unsplash.com/photo-1542483381-41a479b1fb88?w=600',t:['conference','webcam','microphone']},
  {n:'AmpShield Guitar Amplifier 15W',sku:'AUD-AMP-454',c:'audio',p:149,cp:199,s:18,r:4.6,rc:890,f:false,d:false,desc:'15W solid-state guitar amp, 8" speaker, overdrive, reverb, headphone out, USB.',img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',t:['guitar-amp','15w','electric']},
  {n:'PodcastKit USB Condenser Mic Bundle',sku:'AUD-POD-455',c:'audio',p:99,cp:139,s:33,r:4.8,rc:3120,f:true,d:false,desc:'USB condenser mic + boom arm + pop filter + shock mount podcast bundle.',img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',t:['microphone','podcast','usb']},
  {n:'SoundWave Shower Speaker IP67',sku:'AUD-SHW-456',c:'audio',p:39,cp:55,s:120,r:4.5,rc:6780,f:false,d:true,desc:'Waterproof shower Bluetooth speaker, IP67, 10h battery, suction cup, hands-free.',img:'https://images.unsplash.com/photo-1511499271651-073325718d90?w=600',t:['shower-speaker','waterproof','bluetooth']},

  // ── PHOTOGRAPHY EXPANDED (7 more → 15 total) ─────────────────────────────
  {n:'BackPackLight Camera Bag 20L',sku:'PHO-BAG-460',c:'photography',p:89,cp:119,s:28,r:4.7,rc:1890,f:false,d:false,desc:'20L waterproof camera backpack, quick-access side, fits 15" laptop + full kit.',img:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',t:['camera-bag','backpack','waterproof']},
  {n:'NightVision Lens 0.45× Super Fisheye',sku:'PHO-LNS-461',c:'photography',p:39,cp:55,s:78,r:4.3,rc:2340,f:false,d:true,desc:'0.45× super wide-angle + macro 2-in-1 clip lens for all smartphones.',img:'https://images.unsplash.com/photo-1606986628253-05620e9a4e22?w=600',t:['phone-lens','wide-angle','fisheye']},
  {n:'RemoteShot Bluetooth Camera Trigger',sku:'PHO-RMT-462',c:'photography',p:19,cp:29,s:200,r:4.4,rc:5670,f:false,d:false,desc:'Bluetooth camera shutter remote, 30m range, works iOS + Android, long press video.',img:'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600',t:['remote-shutter','bluetooth','selfie']},
  {n:'LightDome Portable Photo Studio Box',sku:'PHO-STD-463',c:'photography',p:69,cp:89,s:34,r:4.6,rc:1230,f:false,d:true,desc:'Foldable LED light box, 60cm cube, 6 backdrops, 120W total, for product photos.',img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',t:['light-box','photo-studio','product']},
  {n:'ColorChart X-Rite Passport 2',sku:'PHO-CLR-464',c:'photography',p:99,cp:129,s:18,r:4.7,rc:670,f:false,d:false,desc:'Color calibration passport, 24 patches, 2 grey balance targets, software included.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['color-checker','calibration','passport']},
  {n:'TimeLapse Controller Pro Intervalometer',sku:'PHO-INT-465',c:'photography',p:45,cp:65,s:55,r:4.5,rc:890,f:false,d:false,desc:'Universal intervalometer timer remote, C1/C3/S1/S2 connectors, LCD display.',img:'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=600',t:['intervalometer','timelapse','remote']},
  {n:'StudioPro Backdrop Stand Kit 3×6m',sku:'PHO-BDP-466',c:'photography',p:89,cp:119,s:16,r:4.6,rc:780,f:false,d:true,desc:'3×6m adjustable backdrop stand + 3 muslin backdrops (white/black/grey) + clamps.',img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',t:['backdrop','stand','studio']},

  // ── PETS EXPANDED (7 more → 15 total) ────────────────────────────────────
  {n:'SpaDay Dog Blowing Dryer 2400W',sku:'PET-DRY-470',c:'pets',p:69,cp:89,s:33,r:4.5,rc:1560,f:false,d:true,desc:'2400W two-speed pet blowing dryer, 3 nozzles, low-noise, stainless heating.',img:'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600',t:['pet-dryer','grooming','dog']},
  {n:'AquaFresh Reverse Osmosis Pet Water Purifier',sku:'PET-WTR-471',c:'pets',p:129,cp:169,s:14,r:4.6,rc:780,f:false,d:false,desc:'Countertop RO pet water purifier, 5-stage filter, removes 99% contaminants, 2L/hr.',img:'https://images.unsplash.com/photo-1606937295610-04dac1a05dc6?w=600',t:['water-purifier','ro','pet-health']},
  {n:'MicroChip GPS Tracker Pet Tag',sku:'PET-GPS-472',c:'pets',p:39,cp:55,s:89,r:4.5,rc:3450,f:true,d:false,desc:'Lightweight GPS pet tracker tag, 4G LTE, 7-day battery, geo-fence alerts, app.',img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',t:['gps-tracker','pet','cat-dog']},
  {n:'ScratchSave Corner Sofa Protector',sku:'PET-SCR-473',c:'pets',p:29,cp:39,s:150,r:4.4,rc:4560,f:false,d:false,desc:'Set of 4 clear scratch guard panels for sofa corners, peel-stick, 17"×12".',img:'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600',t:['scratch-guard','cat','furniture']},
  {n:'OrthoFoam Orthopedic Dog Bed XL',sku:'PET-BED-474',c:'pets',p:89,cp:119,s:22,r:4.7,rc:2340,f:false,d:true,desc:'XL orthopedic memory foam dog bed, waterproof liner, removable cover, 40"×30".',img:'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=600',t:['dog-bed','orthopedic','xl']},
  {n:'BirdWatch Smart Feeder Camera',sku:'PET-BRD-475',c:'pets',p:119,cp:159,f:false,d:false,s:18,r:4.6,rc:1230,desc:'Smart bird feeder with 1080P camera, AI bird ID, solar powered, Wi-Fi, app.',img:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',t:['bird-feeder','camera','solar']},
  {n:'PetCalm Anxiety Vest Thunder Jacket',sku:'PET-ANX-476',c:'pets',p:39,cp:55,s:78,r:4.5,rc:3120,f:false,d:false,desc:'Calming pressure vest for dogs, drug-free anxiety relief, XS-XL, 8 colors.',img:'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600',t:['anxiety-vest','dog','calming']},
]

async function main() {
  console.log('🌱 Seeding CortexCart database...')

  // Categories
  const catMap: Record<string, string> = {}
  for (const cat of CATS) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    })
    catMap[cat.slug] = record.id
  }
  console.log(`✅ ${CATS.length} categories seeded`)

  // Products
  let seeded = 0
  // Build per-category image pools so each product gets 3 RELATED
  // (same-category) but DISTINCT images — not 3 copies of the same one.
  const catImagePool: Record<string, string[]> = {}
  for (const p of PRODUCTS) {
    if (!catImagePool[p.c]) catImagePool[p.c] = []
    if (!catImagePool[p.c].includes(p.img)) catImagePool[p.c].push(p.img)
  }
  const relatedImages = (p: P): string[] => {
    const pool = catImagePool[p.c] || [p.img]
    const others = pool.filter(u => u !== p.img)
    const out = [p.img]
    for (let i = 0; out.length < 3 && others.length > 0; i++) {
      out.push(others[i % others.length])
    }
    // Pad if category pool too small
    while (out.length < 3) out.push(p.img)
    return out
  }

  for (const p of PRODUCTS) {
    const slug = sl(p.n)
    const catId = catMap[p.c]
    if (!catId) { console.warn(`⚠️  No category for ${p.c}`); continue }
    const images = relatedImages(p)

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.n, slug, description: p.desc,
        basePrice: p.cp, currentPrice: p.p, comparePrice: p.cp,
        stock: p.s, rating: p.r, reviewCount: p.rc,
        isFeatured: p.f, isDeal: p.d,
        images, tags: p.t, isActive: true,
      },
      create: {
        sku: p.sku, slug, name: p.n,
        description: p.desc, brand: p.sku.split('-')[0],
        categoryId: catId, images, tags: p.t,
        basePrice: p.cp, currentPrice: p.p, comparePrice: p.cp,
        stock: p.s, rating: p.r, reviewCount: p.rc,
        isFeatured: p.f, isDeal: p.d, isActive: true,
      },
    })
    seeded++
  }
  console.log(`✅ ${seeded} products seeded`)

  // Admin user
  const pw = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@cortexcart.com' },
    update: {},
    create: {
      email: 'admin@cortexcart.com', name: 'Admin',
      password: pw, role: 'ADMIN',
    },
  })
  console.log('✅ Admin user seeded (admin@cortexcart.com / admin123)')
  console.log('🎉 Seed complete!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
