import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

const CATS = [
  { name:'Tech',      slug:'tech',      description:'Gadgets, devices and electronics' },
  { name:'Gaming',    slug:'gaming',    description:'Gaming peripherals and accessories' },
  { name:'Home',      slug:'home',      description:'Smart home and living essentials' },
  { name:'Fashion',   slug:'fashion',   description:'Clothing, shoes and accessories' },
  { name:'Beauty',    slug:'beauty',    description:'Skincare, haircare and wellness' },
  { name:'Sports',    slug:'sports',    description:'Fitness gear and outdoor equipment' },
  { name:'Office',    slug:'office',    description:'Productivity tools and desk essentials' },
  { name:'Music',     slug:'music',     description:'Instruments, audio and accessories' },
  { name:'Travel',    slug:'travel',    description:'Luggage, accessories and travel gear' },
  { name:'Books',     slug:'books',     description:'Books, courses and learning materials' },
  { name:'Kitchen',   slug:'kitchen',   description:'Cooking tools and appliances' },
  { name:'Pets',      slug:'pets',      description:'Pet care, toys and accessories' },
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
  {n:'CoolMax Laptop Stand',sku:'COL-STD-026',c:'gaming',p:49,cp:69,s:75,r:4.5,rc:870,f:false,d:false,desc:'Aluminum laptop stand with dual fans, 6 height levels.',img:'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=600',t:['stand','laptop','cooling']},
  {n:'WristGuard Gaming Pad',sku:'WRS-GPD-027',c:'gaming',p:35,cp:45,s:90,r:4.4,rc:2300,f:false,d:false,desc:'Memory foam wrist rest, mouse + keyboard set, anti-slip.',img:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',t:['wrist-rest','gaming','ergonomic']},
  {n:'PortHub Gaming Router',sku:'PRT-RTR-028',c:'gaming',p:199,cp:249,s:15,r:4.7,rc:980,f:false,d:true,desc:'Gaming Wi-Fi 6 router, geo-filter, QoS, 5GHz priority.',img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',t:['router','gaming','wifi6']},
  {n:'ChairPad Lumbar Support',sku:'CHR-LMB-029',c:'gaming',p:59,cp:79,s:60,r:4.6,rc:1540,f:false,d:false,desc:'Memory foam lumbar pillow, adjustable strap, gaming chair fit.',img:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600',t:['lumbar','support','chair']},
  {n:'CaptureCard 4K HDR',sku:'CAP-CRD-030',c:'gaming',p:179,cp:229,s:20,r:4.7,rc:760,f:true,d:false,desc:'4K HDR capture card, HDMI 2.1, USB-C 3.2, zero-lag passthrough.',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['capture-card','streaming','hdmi']},
  {n:'GlowLight RGB Desk Kit',sku:'GLW-DSK-031',c:'gaming',p:89,cp:119,s:40,r:4.6,rc:2180,f:false,d:true,desc:'Monitor LED backlight + desk strip, sync to game, app control.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['rgb','desk','gaming']},

  // ── HOME (12) ─────────────────────────────────────────────────────
  {n:'AuraLight Smart Lamp',sku:'AUR-LMP-032',c:'home',p:59,cp:79,s:60,r:4.6,rc:4010,f:true,d:true,desc:'16M colors, voice + app control, 3000 lumen LED.',img:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',t:['lamp','smart','rgb']},
  {n:'BreezeQ Air Purifier 800',sku:'BRZ-APR-033',c:'home',p:229,cp:279,s:11,r:4.8,rc:1170,f:true,d:false,desc:'HEPA H13 + UV-C, 800sqft coverage, whisper-quiet 25dB.',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',t:['air-purifier','hepa','uv']},
  {n:'BrewBot Smart Coffee Maker',sku:'BRW-COF-034',c:'home',p:149,cp:199,s:18,r:4.8,rc:2670,f:true,d:true,desc:'Programmable smart coffee maker, built-in grinder, app control.',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',t:['coffee','smart','brewing']},
  {n:'DriftFrame Digital Canvas',sku:'DRF-FRM-035',c:'home',p:179,cp:229,s:20,r:4.7,rc:890,f:true,d:false,desc:'10" digital art frame, cloud sync, 32GB, motion-sensor sleep.',img:'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600',t:['digital-frame','art','display']},
  {n:'ZenAir Diffuser Pro 500',sku:'ZEN-DIF-036',c:'home',p:69,cp:89,s:55,r:4.6,rc:2340,f:false,d:false,desc:'Ultrasonic aromatherapy diffuser, 500ml, 12-color LED, 20h.',img:'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600',t:['diffuser','aromatherapy','led']},
  {n:'HaloScale Smart Body',sku:'HAL-SCL-037',c:'home',p:79,cp:99,s:40,r:4.5,rc:3120,f:false,d:false,desc:'17-metric body composition scale, BMI, Bluetooth, app sync.',img:'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',t:['scale','health','bluetooth']},
  {n:'RoboVac X8 Hybrid',sku:'ROB-VAC-038',c:'home',p:299,cp:379,s:12,r:4.7,rc:2890,f:true,d:true,desc:'LiDAR robot vacuum + mop, 6000Pa suction, auto-empty base.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['robot-vacuum','lidar','mop']},
  {n:'SmartPlug Energy Monitor',sku:'SMT-PLG-039',c:'home',p:29,cp:39,s:150,r:4.5,rc:4560,f:false,d:false,desc:'WiFi smart plug, real-time energy monitoring, scheduler.',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['smart-plug','energy','wifi']},
  {n:'AquaFilter Pro 7-Stage',sku:'AQU-FLT-040',c:'home',p:189,cp:249,s:22,r:4.8,rc:1560,f:false,d:false,desc:'7-stage under-sink water filter, RO system, 0.0001μm.',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',t:['water-filter','ro','purification']},
  {n:'DeskRiser Pro Standing',sku:'DSK-RSR-041',c:'home',p:249,cp:319,s:15,r:4.7,rc:1230,f:false,d:true,desc:'Electric sit-stand desk converter, memory presets, USB ports.',img:'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=600',t:['standing-desk','ergonomic','electric']},
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
  {n:'DermaTool Micro-Needler',sku:'DRM-NDL-061',c:'beauty',p:89,cp:119,s:28,r:4.5,rc:1230,f:false,d:false,desc:'0.5mm titanium micro-needler roller, collagen induction.',img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',t:['micro-needling','collagen','skincare']},
  {n:'NailKit LED Gel Set',sku:'NAL-GEL-062',c:'beauty',p:69,cp:89,s:40,r:4.7,rc:3450,f:false,d:true,desc:'Pro gel nail kit with 48W LED lamp, 20 gel polishes.',img:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',t:['gel-nails','led','nail-art']},
  {n:'ScentLab Perfume Sampler 10',sku:'SCN-PRF-063',c:'beauty',p:59,cp:79,s:45,r:4.6,rc:2100,f:true,d:false,desc:'10 x 2ml designer-inspired perfume collection, gift box.',img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',t:['perfume','fragrance','sampler']},

  // ── SPORTS (10) ───────────────────────────────────────────────────
  {n:'IronGrip Adjustable Dumbbells',sku:'IRN-DBL-064',c:'sports',p:249,cp:329,s:14,r:4.8,rc:4320,f:true,d:true,desc:'5-52.5lb adjustable dumbbell set, space-saving, quick-lock.',img:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600',t:['dumbbells','weights','fitness']},
  {n:'FlexBand Resistance Kit Pro',sku:'FLX-BND-065',c:'sports',p:39,cp:55,s:150,r:4.6,rc:7890,f:false,d:false,desc:'6-level latex resistance bands, handles + door anchor kit.',img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['resistance-bands','fitness','home-gym']},
  {n:'PaceTrack GPS Running Watch',sku:'PCE-WCH-066',c:'sports',p:279,cp:349,s:16,r:4.7,rc:2560,f:true,d:false,desc:'GPS running watch, VO2 max, 20h battery, heart rate.',img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',t:['running-watch','gps','vo2max']},
  {n:'AirBike Pro X',sku:'AIR-BKE-067',c:'sports',p:499,cp:649,s:8,r:4.9,rc:1890,f:true,d:true,desc:'Air resistance bike, unlimited resistance, full-body HIIT.',img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',t:['bike','hiit','cardio']},
  {n:'NeoSurf Foam Roller PRO',sku:'NEO-FMR-068',c:'sports',p:35,cp:49,s:120,r:4.5,rc:3450,f:false,d:false,desc:'High-density vibrating foam roller, 3 speeds, USB-C charge.',img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['foam-roller','recovery','vibration']},
  {n:'PullPod Door Pull-Up Bar',sku:'PLL-BAR-069',c:'sports',p:49,cp:65,s:90,r:4.6,rc:5670,f:false,d:false,desc:'No-drill door pull-up bar, 300lb capacity, multi-grip.',img:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600',t:['pull-up-bar','home-gym','strength']},
  {n:'SpeedJump Digital Rope',sku:'SPD-JMP-070',c:'sports',p:29,cp:39,s:200,r:4.5,rc:4320,f:false,d:false,desc:'Digital jump rope with calorie counter, LED speed display.',img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['jump-rope','cardio','fitness']},
  {n:'ComprePro Knee Sleeves',sku:'CMP-KNE-071',c:'sports',p:49,cp:65,s:80,r:4.7,rc:2890,f:false,d:true,desc:'7mm neoprene knee sleeves pair, powerlifting, thermal support.',img:'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600',t:['knee-sleeves','powerlifting','support']},
  {n:'HydroVault Bottle 32oz',sku:'HYD-BTL-072',c:'sports',p:39,cp:55,s:180,r:4.8,rc:8900,f:true,d:false,desc:'32oz insulated bottle, 48h cold / 24h hot, leak-proof lid.',img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['water-bottle','insulated','hydration']},
  {n:'YogaMat Alignment Pro 6mm',sku:'YGA-MAT-073',c:'sports',p:79,cp:99,s:70,r:4.7,rc:3210,f:false,d:true,desc:'6mm TPE yoga mat, alignment lines, eco-friendly, carry strap.',img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',t:['yoga','mat','eco']},

  // ── OFFICE (8) ────────────────────────────────────────────────────
  {n:'ErgoChair Pro Lumbar',sku:'ERG-CHR-074',c:'office',p:449,cp:599,s:10,r:4.8,rc:3450,f:true,d:false,desc:'Ergonomic mesh chair, adjustable lumbar, 4D armrests.',img:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600',t:['chair','ergonomic','lumbar']},
  {n:'DeskMate Bamboo Organizer',sku:'DSK-ORG-075',c:'office',p:55,cp:75,s:80,r:4.6,rc:2100,f:false,d:false,desc:'Bamboo desk organizer, 7 compartments, pen holder, cable slot.',img:'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=600',t:['organizer','bamboo','desk']},
  {n:'TaskLamp LED Architect',sku:'TSK-LMP-076',c:'office',p:89,cp:119,s:45,r:4.7,rc:1890,f:false,d:true,desc:'Architect desk lamp, touch dimmer, USB-A charge port, 5 CCT.',img:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',t:['desk-lamp','led','charging']},
  {n:'NoteAir E-Ink Tablet 10',sku:'NOT-TAB-077',c:'office',p:399,cp:499,s:12,r:4.7,rc:1230,f:true,d:false,desc:'10" E-ink writing tablet, stylus, 3 weeks battery, export PDF.',img:'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=600',t:['e-ink','tablet','writing']},
  {n:'CardScan Pro Business Set',sku:'CRD-SCN-078',c:'office',p:79,cp:99,s:35,r:4.5,rc:870,f:false,d:false,desc:'Portable card scanner, auto-import to contacts, 600 DPI.',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['scanner','business','productivity']},
  {n:'QuietKey Wireless Keyboard',sku:'QTK-KBD-079',c:'office',p:69,cp:89,s:55,r:4.6,rc:3210,f:false,d:false,desc:'Ultra-quiet slim keyboard, multi-device BT, rechargeable.',img:'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',t:['keyboard','wireless','quiet']},
  {n:'PhoneArm Gooseneck Mount',sku:'PHN-MNT-080',c:'office',p:29,cp:39,s:200,r:4.5,rc:4560,f:false,d:false,desc:'Flexible gooseneck phone mount, desk clamp, 360° rotation.',img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',t:['mount','phone','flexible']},
  {n:'DocuPrint Mini Printer',sku:'DCU-PRN-081',c:'office',p:129,cp:169,s:28,r:4.6,rc:1980,f:false,d:true,desc:'Pocket photo + doc printer, Bluetooth, thermal, no ink.',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['printer','portable','thermal']},

  // ── MUSIC (8) ─────────────────────────────────────────────────────
  {n:'StringMaster Guitar Kit',sku:'STR-GTR-082',c:'music',p:189,cp:249,s:14,r:4.7,rc:1450,f:true,d:false,desc:'Acoustic guitar starter kit, tuner + strap + picks + bag.',img:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',t:['guitar','acoustic','beginner']},
  {n:'BeatBox Mini Drum Pad 8',sku:'BTB-DRM-083',c:'music',p:89,cp:119,s:30,r:4.6,rc:890,f:false,d:true,desc:'8-pad MIDI drum controller, velocity-sensitive, USB + BT.',img:'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600',t:['drum-pad','midi','controller']},
  {n:'AudioLab USB Interface 2x2',sku:'AUD-INT-084',c:'music',p:149,cp:189,s:22,r:4.8,rc:2340,f:true,d:false,desc:'2-in/2-out audio interface, 24bit/192kHz, phantom power.',img:'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',t:['audio-interface','recording','studio']},
  {n:'MonitorPods Studio Speaker',sku:'MON-SPK-085',c:'music',p:299,cp:379,s:12,r:4.7,rc:1120,f:true,d:false,desc:'5" bi-amped studio monitors pair, flat response, RCA/XLR.',img:'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600',t:['studio-monitor','speakers','mixing']},
  {n:'KeyLab MIDI Piano 49',sku:'KEY-MID-086',c:'music',p:249,cp:319,s:15,r:4.7,rc:980,f:false,d:true,desc:'49-key MIDI keyboard, aftertouch, pitch/mod wheel, DAW.',img:'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600',t:['midi','piano','keyboard']},
  {n:'CaptureMic Condenser Studio',sku:'CAP-MIC-087',c:'music',p:119,cp:159,s:28,r:4.8,rc:3450,f:false,d:false,desc:'Large-diaphragm condenser mic, cardioid, shock mount, pop filter.',img:'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',t:['microphone','condenser','recording']},
  {n:'HarpCase Transport Bag XL',sku:'HRP-BAG-088',c:'music',p:69,cp:89,s:40,r:4.5,rc:560,f:false,d:false,desc:'Heavy-duty instrument transport bag, 25mm foam, shoulder strap.',img:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',t:['instrument-bag','transport','protection']},
  {n:'SoundProof Acoustic Panels 6',sku:'SND-PNL-089',c:'music',p:79,cp:99,s:55,r:4.6,rc:1230,f:false,d:false,desc:'6-pack 12x12 acoustic foam panels, NRC 0.98, peel-stick.',img:'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',t:['acoustic-panels','soundproofing','studio']},

  // ── TRAVEL (8) ────────────────────────────────────────────────────
  {n:'TravelPro Spinner 28" Luggage',sku:'TRV-LGG-090',c:'travel',p:229,cp:299,s:18,r:4.7,rc:3450,f:true,d:false,desc:'Lightweight hardshell spinner, TSA lock, expandable, 28".',img:'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=600',t:['luggage','suitcase','spinner']},
  {n:'PackLight Travel Backpack 40L',sku:'PCK-BKP-091',c:'travel',p:129,cp:169,s:25,r:4.8,rc:4560,f:true,d:true,desc:'40L carry-on backpack, clam-shell opening, laptop sleeve.',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',t:['backpack','travel','carry-on']},
  {n:'NeckCloud Inflatable Pillow',sku:'NCK-PIL-092',c:'travel',p:29,cp:39,s:250,r:4.5,rc:8900,f:false,d:false,desc:'Inflatable neck pillow, 3D ergonomic contour, packable.',img:'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=600',t:['neck-pillow','travel','comfort']},
  {n:'GlobeAdapter Universal Kit',sku:'GLB-ADP-093',c:'travel',p:39,cp:55,s:180,r:4.6,rc:6780,f:false,d:false,desc:'Universal travel adapter, 200 countries, 4 USB-A + 2 USB-C.',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['adapter','universal','travel']},
  {n:'TechOrg Packing Cube Set 5',sku:'TCH-PCK-094',c:'travel',p:35,cp:49,s:150,r:4.7,rc:5670,f:false,d:false,desc:'5-piece compression packing cubes, waterproof, slim handles.',img:'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=600',t:['packing-cubes','organization','travel']},
  {n:'AeroBottle TSA Water Flask',sku:'AER-BTL-095',c:'travel',p:29,cp:39,s:200,r:4.5,rc:3450,f:false,d:true,desc:'TSA-approved collapsible water bottle, folds flat, BPA-free.',img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['water-bottle','tsa','collapsible']},
  {n:'NapShade Sleep Mask Pro',sku:'NAP-MSK-096',c:'travel',p:25,cp:35,s:300,r:4.6,rc:7890,f:false,d:false,desc:'3D contoured sleep mask, zero light, memory foam nose bridge.',img:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600',t:['sleep-mask','blackout','travel']},
  {n:'LockSafe TSA Combo Padlock',sku:'LCK-PDL-097',c:'travel',p:19,cp:29,s:500,r:4.7,rc:9870,f:false,d:false,desc:'TSA-approved combination padlock, 4-dial, cable included.',img:'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=600',t:['padlock','tsa','security']},

  // ── BOOKS (6) ─────────────────────────────────────────────────────
  {n:'KindlePad E-Reader 11th',sku:'KND-RDR-098',c:'books',p:139,cp:179,s:35,r:4.9,rc:15600,f:true,d:false,desc:'11th gen e-reader, 6" 300ppi glare-free, weeks battery.',img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',t:['e-reader','kindle','reading']},
  {n:'FlipStand Book Holder Pro',sku:'FLP-BKH-099',c:'books',p:29,cp:39,s:200,r:4.6,rc:4560,f:false,d:false,desc:'Adjustable book stand, cookbook + textbook holder, folds flat.',img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',t:['book-stand','reading','cookbook']},
  {n:'StudyLight Clip Desk Lamp',sku:'STD-LMP-100',c:'books',p:35,cp:49,s:120,r:4.5,rc:3210,f:false,d:false,desc:'USB rechargeable reading light, 3 brightness, clip + stand.',img:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',t:['reading-light','clip','rechargeable']},
  {n:'NoteMax Hardcover A5 Journal',sku:'NOT-JNL-101',c:'books',p:19,cp:29,s:500,r:4.7,rc:8900,f:false,d:false,desc:'200-page dotted journal, lay-flat binding, elastic band.',img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',t:['journal','notebook','dotted']},
  {n:'LearnTrack Language Cards',sku:'LRN-CRD-102',c:'books',p:25,cp:35,s:300,r:4.5,rc:2340,f:false,d:true,desc:'500 bilingual flash cards, Spanish/French/German/Japanese.',img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',t:['flash-cards','language','learning']},
  {n:'BookNook LED Display Shelf',sku:'BKN-SHF-103',c:'books',p:79,cp:99,s:40,r:4.6,rc:1890,f:true,d:false,desc:'LED lighted bookend display, 3 levels, battery or USB, oak.',img:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',t:['bookshelf','led','display']},

  // ── KITCHEN (8) ───────────────────────────────────────────────────
  {n:'ChefKnife Damascus 8"',sku:'CHF-KNF-104',c:'kitchen',p:129,cp:169,s:25,r:4.9,rc:4560,f:true,d:false,desc:'67-layer Damascus steel chef knife, G10 handle, VG10 core.',img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',t:['knife','damascus','chef']},
  {n:'AirFryer Pro XL 7QT',sku:'AIR-FRY-105',c:'kitchen',p:119,cp:159,s:30,r:4.7,rc:7890,f:true,d:true,desc:'7QT digital air fryer, 8 presets, touchscreen, dishwasher safe.',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',t:['air-fryer','cooking','healthy']},
  {n:'BlendTech Smart Blender 1200W',sku:'BLD-PRO-106',c:'kitchen',p:199,cp:259,s:18,r:4.8,rc:3450,f:true,d:true,desc:'1200W professional blender, 3 auto programs, self-clean.',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',t:['blender','smoothie','kitchen']},
  {n:'PourPerfect Gooseneck Kettle',sku:'PRP-KTL-107',c:'kitchen',p:79,cp:99,s:55,r:4.7,rc:5670,f:false,d:false,desc:'Electric gooseneck kettle, 6 temp presets, 1L, keep-warm.',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',t:['kettle','coffee','precision']},
  {n:'SteelPan Non-Stick 12" Set',sku:'STL-PAN-108',c:'kitchen',p:89,cp:119,s:40,r:4.6,rc:4320,f:false,d:false,desc:'3-piece stainless + non-stick cookware, oven-safe 500°F.',img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',t:['pans','cookware','non-stick']},
  {n:'SpicePro Herb Grinder Steel',sku:'SPC-GRD-109',c:'kitchen',p:39,cp:55,s:120,r:4.5,rc:6780,f:false,d:false,desc:'4-layer herb grinder, diamond teeth, kief catcher, brushed steel.',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',t:['grinder','herb','spice']},
  {n:'WaffleIron Crispy Belgian',sku:'WFL-IRN-110',c:'kitchen',p:59,cp:79,s:60,r:4.7,rc:2340,f:false,d:true,desc:'Belgian waffle maker, 4 servings, non-stick, ready indicator.',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',t:['waffle','breakfast','non-stick']},
  {n:'MealPrep Glass Container 10pc',sku:'MPR-CNT-111',c:'kitchen',p:49,cp:65,s:90,r:4.6,rc:4560,f:false,d:false,desc:'10-piece borosilicate glass meal prep set, oven + microwave safe.',img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',t:['meal-prep','glass','containers']},

  // ── PETS (8) ──────────────────────────────────────────────────────
  {n:'SmartFeed Auto Pet Feeder',sku:'SMT-FDR-112',c:'pets',p:79,cp:99,s:45,r:4.7,rc:3450,f:true,d:false,desc:'Wi-Fi auto pet feeder, 6L, app schedule, meal notifications.',img:'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',t:['pet-feeder','auto','smart']},
  {n:'PawPrint DNA Kit',sku:'PAW-DNA-113',c:'pets',p:89,cp:119,s:30,r:4.5,rc:2100,f:false,d:false,desc:'Dog DNA breed + health test, 350+ breeds, vet-grade results.',img:'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',t:['dna','dog','health']},
  {n:'HippoWash Dog Grooming Kit',sku:'HPW-GRM-114',c:'pets',p:59,cp:79,s:60,r:4.6,rc:1890,f:false,d:true,desc:'6-piece dog grooming kit, waterless shampoo + brush + nail file.',img:'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',t:['grooming','dog','pet-care']},
  {n:'PetCam HD 1080P Treat Dispenser',sku:'PCT-CAM-115',c:'pets',p:149,cp:199,s:22,r:4.7,rc:2340,f:true,d:false,desc:'1080P pet camera, treat dispenser, 2-way audio, night vision.',img:'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',t:['pet-camera','treat-dispenser','wifi']},
  {n:'FleeceNest Cat Tree XL',sku:'FLC-TRE-116',c:'pets',p:99,cp:129,s:18,r:4.5,rc:1560,f:false,d:false,desc:'5-tier cat tree, sisal posts, plush beds, hammock, 65".',img:'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',t:['cat-tree','cat','scratcher']},
  {n:'HydroFresh Pet Water Fountain',sku:'HYD-FNT-117',c:'pets',p:45,cp:59,s:80,r:4.7,rc:5670,f:false,d:false,desc:'3L filtered pet fountain, triple filter, ultra-quiet, SS.',img:'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',t:['water-fountain','pet','filter']},
  {n:'TravelPet Airline Carrier Bag',sku:'TRV-CAR-118',c:'pets',p:69,cp:89,s:40,r:4.5,rc:1230,f:false,d:true,desc:'IATA-approved airline pet carrier, telescoping handle, mesh.',img:'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',t:['pet-carrier','airline','travel']},
  {n:'ZoomBall Interactive Dog Toy',sku:'ZOM-TOY-119',c:'pets',p:29,cp:39,s:150,r:4.6,rc:3450,f:false,d:false,desc:'Automatic moving ball, motion-activated, 3 speeds, USB charge.',img:'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',t:['dog-toy','interactive','automatic']},
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
  for (const p of PRODUCTS) {
    const slug = sl(p.n)
    const catId = catMap[p.c]
    if (!catId) { console.warn(`⚠️  No category for ${p.c}`); continue }

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.n, slug, description: p.desc,
        basePrice: p.cp, currentPrice: p.p, comparePrice: p.cp,
        stock: p.s, rating: p.r, reviewCount: p.rc,
        isFeatured: p.f, isDeal: p.d,
        images: [p.img, p.img, p.img],
        tags: p.t, isActive: true,
      },
      create: {
        sku: p.sku, slug, name: p.n,
        description: p.desc, brand: p.sku.split('-')[0],
        categoryId: catId, images: [p.img, p.img, p.img], tags: p.t,
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
