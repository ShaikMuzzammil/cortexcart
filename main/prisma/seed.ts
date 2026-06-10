import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

const CATS = [
  { name:'Tech',     slug:'tech',     description:'Gadgets, devices and electronics' },
  { name:'Home',     slug:'home',     description:'Smart home and living essentials' },
  { name:'Fashion',  slug:'fashion',  description:'Clothing, shoes and accessories' },
  { name:'Beauty',   slug:'beauty',   description:'Skincare, haircare and wellness' },
  { name:'Sports',   slug:'sports',   description:'Fitness gear and outdoor equipment' },
  { name:'Food',     slug:'food',     description:'Kitchen tools and gourmet products' },
  { name:'Gaming',   slug:'gaming',   description:'Gaming peripherals and accessories' },
  { name:'Office',   slug:'office',   description:'Productivity tools and desk essentials' },
  { name:'Music',    slug:'music',    description:'Instruments, audio gear and accessories' },
  { name:'Travel',   slug:'travel',   description:'Luggage, accessories and travel gear' },
]

const PRODUCTS = [
  // ── TECH (15) ────────────────────────────────────────────────────────────
  {n:'Ion 30K Titan Charger',       sku:'ION-30K-001',c:'tech',   p:129,cp:159,s:42,r:4.8,rc:312,f:true, d:true, desc:'Ultra-fast 140W GaN charger bank, dual USB-C PD, folds flat.',     img:'https://images.unsplash.com/photo-1609592424858-7de65a53f4f1?w=600',t:['charger','power-bank','gan']},
  {n:'NovaPods X Ultra',            sku:'NOV-POD-002',c:'tech',   p:199,cp:249,s:18,r:4.9,rc:891,f:true, d:false,desc:'Hybrid ANC earbuds, 36h battery, IPX5 waterproof.',              img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',t:['earbuds','anc','wireless']},
  {n:'PixelWatch Pro S',             sku:'PIX-WCH-003',c:'tech',   p:349,cp:399,s:9, r:4.7,rc:204,f:true, d:true, desc:'AMOLED smartwatch, GPS, blood-oxygen, 7-day battery.',           img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',t:['smartwatch','gps','fitness']},
  {n:'StellarBuds Neo',              sku:'STL-BUD-004',c:'tech',   p:89, cp:119,s:55,r:4.5,rc:143,f:false,d:true, desc:'Open-ear spatial audio, 28h playtime, bone conduction.',         img:'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600',t:['earbuds','open-ear']},
  {n:'ArcMouse Ergo Pro',            sku:'ARC-MSE-005',c:'tech',   p:79, cp:99, s:30,r:4.6,rc:88, f:false,d:false,desc:'Vertical ergonomic mouse, silent clicks, rechargeable.',         img:'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',t:['mouse','ergonomic']},
  {n:'ZenHub 12-Port Dock',          sku:'ZEN-DOC-006',c:'tech',   p:149,cp:179,s:22,r:4.7,rc:67, f:false,d:false,desc:'12-in-1 USB-C hub, 4K HDMI, 100W PD, Gigabit Ethernet.',       img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['dock','usb-c','hub']},
  {n:'LunaKey RGB 75%',              sku:'LUN-KBD-007',c:'tech',   p:169,cp:199,s:14,r:4.8,rc:229,f:true, d:false,desc:'Hot-swap mechanical keyboard, per-key RGB, gasket mount.',      img:'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',t:['keyboard','mechanical','rgb']},
  {n:'ClearCam 4K Webcam',           sku:'CLR-CAM-008',c:'tech',   p:119,cp:149,s:37,r:4.5,rc:156,f:false,d:true, desc:'4K/60fps webcam, AI auto-framing, built-in ring light.',        img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600',t:['webcam','4k','streaming']},
  {n:'FluxPad Drawing Tablet',       sku:'FLX-TAB-009',c:'tech',   p:139,cp:179,s:20,r:4.6,rc:112,f:false,d:true, desc:'10x6" active area, 8192 pressure levels, wireless stylus.',    img:'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=600',t:['tablet','drawing','stylus']},
  {n:'SonicBar 2.1 Soundbar',        sku:'SON-BAR-010',c:'tech',   p:189,cp:239,s:16,r:4.7,rc:198,f:true, d:true, desc:'2.1 soundbar with wireless subwoofer, Dolby Atmos, HDMI ARC.', img:'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600',t:['soundbar','dolby','speaker']},
  {n:'NanoRouter WiFi 6E',           sku:'NAN-RTR-011',c:'tech',   p:219,cp:279,s:12,r:4.8,rc:87, f:false,d:false,desc:'WiFi 6E tri-band router, 6GHz, 10Gbps WAN, OFDMA.',            img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',t:['router','wifi6','networking']},
  {n:'PrismaLED Strip Kit',          sku:'PRI-LED-012',c:'tech',   p:49, cp:65, s:85,r:4.5,rc:341,f:false,d:false,desc:'5m RGBIC smart LED strip, music sync, app control.',            img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['led','smart-home','rgb']},
  {n:'OmniCharge 20 Pro',            sku:'OMN-CHR-013',c:'tech',   p:159,cp:199,s:25,r:4.7,rc:143,f:false,d:true, desc:'20000mAh power bank, AC outlet, 100W PD, wireless charge.',   img:'https://images.unsplash.com/photo-1586495777744-4e6232bf2fb7?w=600',t:['power-bank','ac-outlet','wireless']},
  {n:'VisionMate USB Monitor',       sku:'VIS-MON-014',c:'tech',   p:259,cp:319,s:10,r:4.6,rc:76, f:true, d:false,desc:'15.6" portable IPS, USB-C, HDR, 1920×1080, 500 nits.',        img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',t:['monitor','portable','usb-c']},
  {n:'SpeedDrive SSD 1TB',           sku:'SPD-SSD-015',c:'tech',   p:99, cp:129,s:50,r:4.9,rc:512,f:false,d:true, desc:'NVMe Gen4 SSD, 7400MB/s read, 1TB, M.2 2280.',               img:'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600',t:['ssd','storage','nvme']},
  // ── HOME (10) ────────────────────────────────────────────────────────────
  {n:'AuraLight Smart Lamp',         sku:'AUR-LMP-016',c:'home',   p:59, cp:79, s:60,r:4.6,rc:401,f:true, d:true, desc:'16M colors, voice + app control, 3000 lumen.',               img:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',t:['lamp','smart-home','lighting']},
  {n:'BreezeQ Air Purifier',         sku:'BRZ-APR-017',c:'home',   p:229,cp:279,s:11,r:4.8,rc:117,f:true, d:false,desc:'HEPA H13 + UV-C, 800 sqft, whisper-quiet 25dB.',              img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',t:['air-purifier','hepa','health']},
  {n:'NestPad Wireless Charger',     sku:'NST-CHR-018',c:'home',   p:49, cp:65, s:80,r:4.5,rc:88, f:false,d:false,desc:'15W Qi2, charges phone + watch + earbuds simultaneously.',    img:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600',t:['wireless-charger','qi2','desk']},
  {n:'ChillZone Tower Fan',          sku:'CHL-FAN-019',c:'home',   p:45, cp:59, s:48,r:4.4,rc:63, f:false,d:true, desc:'6-speed tower fan, 180° oscillation, USB-C powered.',        img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['fan','cooling','desk']},
  {n:'DriftFrame Digital Canvas',    sku:'DRF-FRM-020',c:'home',   p:179,cp:229,s:20,r:4.7,rc:89, f:true, d:false,desc:'10" digital art frame, cloud sync, motion sensor sleep.',     img:'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600',t:['digital-frame','art','wifi']},
  {n:'ZenAir Diffuser Pro',          sku:'ZEN-DIF-021',c:'home',   p:69, cp:89, s:55,r:4.6,rc:234,f:false,d:false,desc:'Ultrasonic aromatherapy diffuser, 500ml, 12-color LED.',       img:'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600',t:['diffuser','aromatherapy','wellness']},
  {n:'HaloScale Smart Body Scale',   sku:'HAL-SCL-022',c:'home',   p:79, cp:99, s:40,r:4.5,rc:312,f:false,d:false,desc:'17-metric body scale, BMI, Bluetooth, syncs health apps.',    img:'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',t:['scale','health','bluetooth']},
  {n:'LumaRing Selfie Light',        sku:'LUM-RNG-023',c:'home',   p:35, cp:49, s:90,r:4.4,rc:521,f:false,d:true, desc:'10" ring light, 3 color modes, adjustable brightness, clip.', img:'https://images.unsplash.com/photo-1598899247449-76fd46c6c41a?w=600',t:['ring-light','selfie','photography']},
  {n:'BrewBot Smart Coffee Maker',   sku:'BRW-COF-024',c:'home',   p:149,cp:199,s:18,r:4.8,rc:267,f:true, d:true, desc:'Programmable smart coffee maker, built-in grinder, app control.',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',t:['coffee','smart-home','brewing']},
  {n:'StormSeal Draft Stopper Set',  sku:'STM-DFT-025',c:'home',   p:29, cp:39, s:120,r:4.3,rc:89,f:false,d:false,desc:'Under-door draft stopper set, 3 pack, energy saving.',        img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['home','energy-saving','insulation']},
  // ── FASHION (12) ─────────────────────────────────────────────────────────
  {n:'VoltCarry Sling Bag',          sku:'VLT-SLG-026',c:'fashion',p:89, cp:120,s:25,r:4.7,rc:192,f:true, d:false,desc:'Ballistic nylon, anti-theft pocket, USB-A passthrough.',      img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',t:['bag','sling','anti-theft']},
  {n:'AlphaShell Rain Jacket',       sku:'ALP-JKT-027',c:'fashion',p:179,cp:229,s:15,r:4.8,rc:241,f:true, d:true, desc:'3-layer Gore-Tex, pit-zips, removable hood, packable.',      img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',t:['jacket','waterproof','gore-tex']},
  {n:'FlowThread Joggers',           sku:'FLW-JGR-028',c:'fashion',p:65, cp:85, s:40,r:4.6,rc:377,f:false,d:false,desc:'4-way stretch, tapered fit, deep zip pockets.',               img:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',t:['joggers','activewear','stretch']},
  {n:'UrbanRun Sneakers',            sku:'URB-SNK-029',c:'fashion',p:129,cp:159,s:22,r:4.7,rc:509,f:true, d:true, desc:'Responsive foam, recycled knit upper, reflective accents.',   img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',t:['shoes','running','recycled']},
  {n:'CityTote Canvas Bag',          sku:'CTY-TOT-030',c:'fashion',p:39, cp:55, s:70,r:4.4,rc:134,f:false,d:false,desc:'Heavy canvas, inner laptop sleeve 15", magnetic snap.',       img:'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600',t:['tote','canvas','laptop']},
  {n:'ApexCap UPF50 Hat',            sku:'APX-CAP-031',c:'fashion',p:34, cp:45, s:55,r:4.5,rc:88, f:false,d:false,desc:'Moisture-wicking, UPF 50+, one-size flex fit.',              img:'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600',t:['cap','upf50','sport']},
  {n:'NovaFlex Compression Tee',     sku:'NOV-TEE-032',c:'fashion',p:45, cp:60, s:60,r:4.5,rc:203,f:false,d:false,desc:'4-way stretch compression top, moisture-wick, UV protection.',img:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',t:['tee','compression','activewear']},
  {n:'PolarFleece Zip Hoodie',       sku:'POL-HDI-033',c:'fashion',p:89, cp:119,s:35,r:4.6,rc:156,f:false,d:true, desc:'Heavyweight 340gsm fleece, full-zip, kangaroo pocket.',      img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',t:['hoodie','fleece','winter']},
  {n:'DriftBand Watch Strap',        sku:'DRF-STR-034',c:'fashion',p:29, cp:45, s:100,r:4.4,rc:67,f:false,d:false,desc:'Premium silicone band, fits Apple Watch & Samsung 22mm.',    img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',t:['watch-band','silicone','accessory']},
  {n:'ThermalTech Insulated Vest',   sku:'THM-VST-035',c:'fashion',p:79, cp:109,s:28,r:4.6,rc:112,f:true, d:false,desc:'Lightweight puffer vest, 800-fill down, packable.',          img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',t:['vest','down','lightweight']},
  {n:'GridMesh Gym Shorts',          sku:'GRD-SHT-036',c:'fashion',p:35, cp:50, s:75,r:4.5,rc:289,f:false,d:false,desc:'7" inseam, mesh lining, zip pocket, anti-odor fabric.',      img:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',t:['shorts','gym','mesh']},
  {n:'StormWalk Hiking Boots',       sku:'STM-BOT-037',c:'fashion',p:159,cp:199,s:18,r:4.7,rc:178,f:true, d:true, desc:'Waterproof leather + mesh, Vibram sole, ankle support.',     img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',t:['boots','hiking','waterproof']},
  // ── BEAUTY (8) ───────────────────────────────────────────────────────────
  {n:'GlowKit Vitamin C Serum',      sku:'GLW-SRM-038',c:'beauty', p:79, cp:99, s:33,r:4.8,rc:622,f:true, d:true, desc:'20% Vit-C + Niacinamide, 30ml, clinical-grade brightening.', img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',t:['serum','vitamin-c','skincare']},
  {n:'ZenLift Rose Quartz Roller',   sku:'ZEN-RLR-039',c:'beauty', p:29, cp:40, s:90,r:4.4,rc:281,f:false,d:false,desc:'Dual rose quartz, stainless handle, improves circulation.',   img:'https://images.unsplash.com/photo-1619451050621-83cb7aada2d7?w=600',t:['face-roller','rose-quartz','skincare']},
  {n:'PureRinse AHA Scalp Scrub',    sku:'PUR-SCR-040',c:'beauty', p:22, cp:30, s:120,r:4.5,rc:183,f:false,d:false,desc:'AHA + coffee blend, balances scalp pH, 250ml.',             img:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600',t:['haircare','scalp','exfoliant']},
  {n:'LuxeBalm SPF50 Lip Stick',     sku:'LUX-LIP-041',c:'beauty', p:18, cp:25, s:200,r:4.6,rc:97, f:false,d:true, desc:'Tinted mineral SPF 50, 8hr wear, reef-safe formula.',       img:'https://images.unsplash.com/photo-1631730486572-226d1f595058?w=600',t:['lip','spf','mineral']},
  {n:'DermaPro Microneedling Pen',   sku:'DRM-PEN-042',c:'beauty', p:89, cp:129,s:25,r:4.5,rc:134,f:false,d:true, desc:'0.25-2.5mm titanium tips, 6-speed, stimulates collagen.',    img:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',t:['skincare','collagen','microneedling']},
  {n:'AquaGlow Hyaluronic Cream',    sku:'AQU-CRM-043',c:'beauty', p:45, cp:59, s:65,r:4.7,rc:312,f:false,d:false,desc:'Multi-weight HA, ceramides, 72hr hydration, all skin types.',img:'https://images.unsplash.com/photo-1556228720-da5eda9ccb00?w=600',t:['moisturizer','hyaluronic','hydrating']},
  {n:'VelvetMatte Lip Liner Set',    sku:'VLV-LNR-044',c:'beauty', p:32, cp:45, s:150,r:4.5,rc:89, f:false,d:false,desc:'12-shade velvet matte liner set, long-wear, smudge-proof.', img:'https://images.unsplash.com/photo-1631730486572-226d1f595058?w=600',t:['lips','liner','matte']},
  {n:'NaturalGlo Bronzer Palette',   sku:'NAT-BRZ-045',c:'beauty', p:55, cp:75, s:45,r:4.6,rc:178,f:true, d:false,desc:'6-shade bronzer, highlight & contour, buildable coverage.',  img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',t:['bronzer','contour','makeup']},
  // ── SPORTS (10) ──────────────────────────────────────────────────────────
  {n:'CoreForce Resistance Set',     sku:'COR-RES-046',c:'sports', p:49, cp:65, s:60,r:4.7,rc:548,f:true, d:false,desc:'5-band set 10-50 lb, fabric-coated, carry bag.',              img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['resistance-bands','gym','workout']},
  {n:'HydroFuel 40oz Bottle',        sku:'HYD-BTL-047',c:'sports', p:35, cp:45, s:110,r:4.8,rc:904,f:false,d:false,desc:'Triple-wall vacuum, 24h cold, leak-proof straw lid.',       img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',t:['water-bottle','insulated','gym']},
  {n:'ZenYoga Non-Slip Mat',         sku:'ZEN-MAT-048',c:'sports', p:55, cp:70, s:40,r:4.7,rc:326,f:true, d:false,desc:'6mm TPE foam, alignment lines, microfibre top, eco-cert.',   img:'https://images.unsplash.com/photo-1601925228133-9d9eddb97a75?w=600',t:['yoga','mat','eco']},
  {n:'CycleTrack GPS Computer',      sku:'CYC-GPS-049',c:'sports', p:219,cp:269,s:12,r:4.8,rc:78, f:true, d:true, desc:'ANT+/BLE, color map display, climb segments, 20h battery.', img:'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600',t:['cycling','gps','navigation']},
  {n:'GripPro Lifting Gloves',       sku:'GRP-GLV-050',c:'sports', p:24, cp:35, s:95,r:4.4,rc:212,f:false,d:true, desc:'Full-palm padding, wrist support, breathable mesh.',         img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',t:['gloves','lifting','gym']},
  {n:'PulseX Heart Rate Monitor',    sku:'PLS-HRM-051',c:'sports', p:79, cp:99, s:35,r:4.6,rc:167,f:false,d:false,desc:'Chest strap HRM, ANT+/BLE dual, 99.7% EKG accuracy.',       img:'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',t:['heart-rate','monitor','cycling']},
  {n:'StrideX Pro Running Belt',     sku:'STR-BLT-052',c:'sports', p:28, cp:38, s:75,r:4.5,rc:167,f:false,d:false,desc:'Bounce-free waist belt, fits iPhone 15 Plus, reflective.',   img:'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600',t:['running','belt','sport']},
  {n:'TitanBell Adjustable Dumbbell',sku:'TTN-DBL-053',c:'sports', p:299,cp:399,s:8, r:4.9,rc:312,f:true, d:true, desc:'5-52.5 lb adjustable dumbbell, replaces 15 weights.',        img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',t:['dumbbell','adjustable','strength']},
  {n:'AeroJump Pro Jump Rope',       sku:'AER-JMP-054',c:'sports', p:39, cp:55, s:80,r:4.6,rc:234,f:false,d:false,desc:'Ball-bearing handles, digital counter, 3m steel cable.',     img:'https://images.unsplash.com/photo-1601926638399-e9b8e0649de5?w=600',t:['jump-rope','cardio','crossfit']},
  {n:'FrostRoll Cryo Massage Roller',sku:'FRS-RLL-055',c:'sports', p:59, cp:79, s:45,r:4.5,rc:189,f:false,d:false,desc:'Stainless cryo-roller, stays cold 6hrs, 3 texture zones.',   img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',t:['massage','recovery','cryo']},
  // ── FOOD (8) ─────────────────────────────────────────────────────────────
  {n:'BrewMaster Pour Kit',          sku:'BRW-KIT-056',c:'food',   p:75, cp:95, s:28,r:4.9,rc:441,f:true, d:false,desc:'Gooseneck kettle + scale + V60 dripper, gift-boxed.',         img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',t:['coffee','pour-over','gift']},
  {n:'SpiceVault 20-Jar Set',        sku:'SPC-JRS-057',c:'food',   p:59, cp:79, s:45,r:4.7,rc:186,f:false,d:false,desc:'Magnetic glass jars, label stickers, minimalist rack.',       img:'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600',t:['spice','kitchen','storage']},
  {n:'ColdPress Pro Juicer',         sku:'CLD-JCR-058',c:'food',   p:189,cp:239,s:9, r:4.7,rc:93, f:true, d:true, desc:'80 RPM masticating juicer, 1.5L batch, 10yr warranty.',      img:'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600',t:['juicer','cold-press','health']},
  {n:'GrainKing Rice Cooker',        sku:'GRN-RCK-059',c:'food',   p:99, cp:129,s:20,r:4.6,rc:254,f:false,d:false,desc:'Fuzzy-logic, 10-cup, rice/quinoa/slow-cook modes.',           img:'https://images.unsplash.com/photo-1585671542778-80a4592a8262?w=600',t:['rice-cooker','kitchen','multi-cook']},
  {n:'BladeZen Chef Knife 8"',       sku:'BLD-KNF-060',c:'food',   p:119,cp:159,s:30,r:4.8,rc:342,f:true, d:false,desc:'VG-10 Damascus steel, G10 handle, 62 HRC hardness.',        img:'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=600',t:['knife','chef','damascus']},
  {n:'FermentPro Crock Set',         sku:'FRM-CRK-061',c:'food',   p:85, cp:109,s:22,r:4.7,rc:89, f:false,d:false,desc:'2L ceramic fermentation crock, airlock lid, weights.',       img:'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600',t:['fermentation','crock','kitchen']},
  {n:'NutriBlend Pro 900W',          sku:'NTR-BLD-062',c:'food',   p:149,cp:199,s:18,r:4.7,rc:421,f:true, d:true, desc:'900W blender, 6 stainless blades, self-clean, 64oz jar.',    img:'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600',t:['blender','smoothie','kitchen']},
  {n:'WokMaster Carbon Steel Wok',   sku:'WOK-PAN-063',c:'food',   p:79, cp:99, s:35,r:4.8,rc:234,f:false,d:false,desc:'14" hand-hammered carbon steel wok, wooden handle, lid.',    img:'https://images.unsplash.com/photo-1585671542778-80a4592a8262?w=600',t:['wok','carbon-steel','cooking']},
  // ── GAMING (10) ──────────────────────────────────────────────────────────
  {n:'VortexPad Ultra Controller',   sku:'VRT-CTL-064',c:'gaming', p:79, cp:99, s:33,r:4.8,rc:712,f:true, d:true, desc:'Hall-effect sticks, per-button RGB, 40h wireless.',         img:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600',t:['controller','gaming','wireless']},
  {n:'EchoRGB XL Mouse Pad',         sku:'ECH-MPD-065',c:'gaming', p:39, cp:55, s:60,r:4.7,rc:388,f:false,d:false,desc:'900×400mm, stitched edge, ARGB strip, non-slip base.',       img:'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600',t:['mousepad','rgb','xl']},
  {n:'QuantumHeadset 7.1',           sku:'QNT-HST-066',c:'gaming', p:139,cp:179,s:18,r:4.6,rc:265,f:true, d:false,desc:'Virtual 7.1, 50mm drivers, noise-cancel boom mic.',         img:'https://images.unsplash.com/photo-1583394293214-0e4f0ccdcd5b?w=600',t:['headset','surround','gaming']},
  {n:'NeonClick Gaming Mouse',       sku:'NEN-MSE-067',c:'gaming', p:59, cp:79, s:45,r:4.7,rc:433,f:false,d:true, desc:'26K DPI, 95g, 8 programmable buttons, 70hr battery.',       img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600',t:['mouse','gaming','lightweight']},
  {n:'StreamDeck Mini Pro',          sku:'STR-DCK-068',c:'gaming', p:109,cp:139,s:20,r:4.8,rc:178,f:true, d:false,desc:'15 LCD keys, plugin ecosystem, macro automation.',           img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['stream-deck','macro','streaming']},
  {n:'ChairBack Lumbar Support',     sku:'CHR-LMB-069',c:'gaming', p:45, cp:60, s:70,r:4.5,rc:215,f:false,d:false,desc:'Memory foam lumbar cushion, adjustable strap, 3D contour.', img:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',t:['lumbar','ergonomic','chair']},
  {n:'ProGrip Controller Stand',     sku:'PRO-STD-070',c:'gaming', p:29, cp:39, s:100,r:4.4,rc:134,f:false,d:false,desc:'Dual controller charging stand, USB-C, LED indicator.',    img:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600',t:['controller','stand','charging']},
  {n:'CaptureX 4K Capture Card',     sku:'CAP-CRD-071',c:'gaming', p:149,cp:199,s:15,r:4.7,rc:89, f:false,d:true, desc:'4K30 / 1080p60 capture, HDMI passthrough, zero-lag.',       img:'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600',t:['capture-card','streaming','4k']},
  {n:'RapidFire Mechanical Numpad',  sku:'RPD-NPD-072',c:'gaming', p:49, cp:65, s:40,r:4.5,rc:112,f:false,d:false,desc:'21-key hot-swap numpad, RGB, Gateron switches.',             img:'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',t:['numpad','mechanical','rgb']},
  {n:'MegaLift Monitor Arm',         sku:'MGA-ARM-073',c:'gaming', p:89, cp:119,s:25,r:4.7,rc:201,f:false,d:false,desc:'Full-motion arm, fits 17-32" monitors, VESA 75/100.',       img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',t:['monitor-arm','vesa','ergonomic']},
  // ── OFFICE (8) ───────────────────────────────────────────────────────────
  {n:'VertDesk Standing Desk',       sku:'VRT-DSK-074',c:'office', p:499,cp:649,s:5, r:4.8,rc:134,f:true, d:true, desc:'Electric sit-stand desk, 3-stage lift, memory presets.',     img:'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600',t:['standing-desk','ergonomic','office']},
  {n:'FlowDesk Organizer Set',       sku:'FLW-ORG-075',c:'office', p:69, cp:89, s:55,r:4.6,rc:178,f:false,d:false,desc:'6-piece bamboo desk organizer, wireless charger tray.',      img:'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=600',t:['organizer','bamboo','desk']},
  {n:'LumaPad LED Desk Mat',         sku:'LUM-MAT-076',c:'office', p:59, cp:79, s:45,r:4.5,rc:234,f:false,d:false,desc:'900×400mm leather desk mat, ARGB edges, wireless charge.',   img:'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600',t:['desk-mat','led','wireless']},
  {n:'ArcArm Laptop Stand',          sku:'ARC-LST-077',c:'office', p:79, cp:99, s:40,r:4.7,rc:312,f:false,d:true, desc:'Adjustable aluminum laptop stand, 6 height levels, foldable.',img:'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600',t:['laptop-stand','aluminum','ergonomic']},
  {n:'InkFlow Gel Pen Set',          sku:'INK-PEN-078',c:'office', p:19, cp:25, s:200,r:4.4,rc:89, f:false,d:false,desc:'12-pack 0.5mm smooth gel pens, archival ink, gift box.',    img:'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=600',t:['pen','gel','stationery']},
  {n:'NoisePod Office Soundproof',   sku:'NIS-POD-079',c:'office', p:39, cp:55, s:60,r:4.3,rc:67, f:false,d:false,desc:'Foldable acoustic panel, 50dB NRC, easy wall mount.',        img:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',t:['acoustic','soundproof','office']},
  {n:'BreakTimer Smart Desk Clock',  sku:'BRK-CLK-080',c:'office', p:49, cp:65, s:35,r:4.5,rc:112,f:false,d:false,desc:'Pomodoro desk clock, e-ink display, silent, USB-C charged.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['clock','pomodoro','productivity']},
  {n:'CableKeep Magnetic Manager',   sku:'CBL-MGR-081',c:'office', p:25, cp:35, s:150,r:4.5,rc:156,f:false,d:false,desc:'10-hook magnetic cable manager, sticks to any surface.',    img:'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=600',t:['cable-management','magnetic','desk']},
  // ── MUSIC (7) ────────────────────────────────────────────────────────────
  {n:'SoundLab USB Audio Interface',  sku:'SND-INT-082',c:'music',  p:149,cp:199,s:18,r:4.8,rc:234,f:true, d:false,desc:'2-in/2-out, 24-bit/192kHz, ultra-low latency, bus-powered.',img:'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',t:['audio-interface','recording','usb']},
  {n:'CondensoPro XLR Microphone',   sku:'CON-MIC-083',c:'music',  p:199,cp:259,s:12,r:4.9,rc:312,f:true, d:true, desc:'Large-diaphragm condenser, cardioid + omni, shockmount.',    img:'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600',t:['microphone','condenser','xlr']},
  {n:'BeatPad MK2 MIDI Controller',  sku:'BPD-MDI-084',c:'music',  p:129,cp:169,s:15,r:4.7,rc:178,f:false,d:false,desc:'16 velocity-sensitive pads, 8 knobs, USB-MIDI, USB-C.',      img:'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',t:['midi','pads','music-production']},
  {n:'SilkStrings Capo & Pick Set',  sku:'SLK-CAP-085',c:'music',  p:19, cp:28, s:200,r:4.6,rc:89, f:false,d:false,desc:'Aircraft aluminum capo + 12 premium picks, travel case.',  img:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',t:['guitar','capo','picks']},
  {n:'AuraCans Studio Headphones',   sku:'AUR-HPH-086',c:'music',  p:249,cp:319,s:10,r:4.8,rc:267,f:true, d:false,desc:'Closed-back, 40mm beryllium drivers, 5Hz-35kHz, foldable.', img:'https://images.unsplash.com/photo-1583394293214-0e4f0ccdcd5b?w=600',t:['headphones','studio','audiophile']},
  {n:'StringMaster Tuner Clip',      sku:'STR-TUN-087',c:'music',  p:24, cp:35, s:150,r:4.7,rc:134,f:false,d:false,desc:'Chromatic clip tuner, 440Hz ref, 0.02 cent accuracy.',      img:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',t:['tuner','guitar','chromatic']},
  {n:'PolyPad 9" Practice Drum Pad', sku:'PLY-PAD-088',c:'music',  p:69, cp:89, s:30,r:4.6,rc:89, f:false,d:false,desc:'Double-sided natural rubber, 9", low-rebound, silent.',      img:'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',t:['drums','practice-pad','silent']},
  // ── TRAVEL (7) ───────────────────────────────────────────────────────────
  {n:'NomadPack 40L Travel Pack',    sku:'NMD-PCK-089',c:'travel', p:189,cp:249,s:15,r:4.8,rc:267,f:true, d:true, desc:'40L carry-on backpack, TSA-friendly, laptop sleeve, hidden.',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',t:['backpack','carry-on','travel']},
  {n:'PixelCard Ultra Slim Wallet',  sku:'PIX-WLT-090',c:'travel', p:49, cp:65, s:80,r:4.7,rc:512,f:false,d:false,desc:'RFID-blocking, carbon fiber, holds 8 cards, cash strap.',    img:'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',t:['wallet','rfid','slim']},
  {n:'SleepMask Pro Travel Set',     sku:'SLP-MSK-091',c:'travel', p:35, cp:49, s:100,r:4.6,rc:234,f:false,d:false,desc:'Contoured memory foam mask + earplugs + carry pouch.',      img:'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600',t:['sleep-mask','travel','wellness']},
  {n:'PackCube Compression Set 4pc', sku:'PCK-CBE-092',c:'travel', p:49, cp:65, s:70,r:4.8,rc:389,f:false,d:false,desc:'4-piece packing cubes, water-resistant, compression zip.',   img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',t:['packing-cubes','luggage','travel']},
  {n:'UniversalPlug Adapter Pro',    sku:'UNV-PLG-093',c:'travel', p:39, cp:55, s:90,r:4.7,rc:312,f:false,d:false,desc:'220-country plug adapter, 3 USB-A + 1 USB-C, 2 AC sockets.',img:'https://images.unsplash.com/photo-1609592424858-7de65a53f4f1?w=600',t:['adapter','travel','international']},
  {n:'PocketScale Digital Luggage',  sku:'PCK-SCL-094',c:'travel', p:25, cp:35, s:120,r:4.5,rc:178,f:false,d:false,desc:'110lb/50kg digital luggage scale, tare, backlit, portable.', img:'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600',t:['luggage-scale','portable','travel']},
  {n:'AquaFilter Travel Bottle',     sku:'AQU-BTL-095',c:'travel', p:45, cp:59, s:65,r:4.7,rc:223,f:false,d:true, desc:'Water filter bottle, removes 99.99% bacteria, 650ml.',      img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',t:['water-filter','bottle','travel']},
  // ── EXTRA TECH + GAMING (5 more to reach 100) ────────────────────────────
  {n:'HoloLens Smart AR Glasses',    sku:'HOL-GLS-096',c:'tech',   p:299,cp:399,s:5, r:4.6,rc:45, f:true, d:true, desc:'AR smart glasses, 1080p camera, gesture control, 6hr.',      img:'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=600',t:['ar-glasses','smart','wearable']},
  {n:'FusionHub Smart Power Strip',  sku:'FUS-PST-097',c:'tech',   p:79, cp:99, s:45,r:4.7,rc:234,f:false,d:false,desc:'8-outlet smart strip, voice control, surge protection, USB.', img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600',t:['power-strip','smart-home','surge']},
  {n:'SkyDrone Mini 4K',             sku:'SKY-DRN-098',c:'tech',   p:249,cp:329,s:8, r:4.7,rc:112,f:true, d:true, desc:'Foldable drone, 4K/60fps, 3-axis gimbal, 38min flight.',     img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',t:['drone','4k','photography']},
  {n:'ClickBot Mechanical Macropad', sku:'CLK-MPD-099',c:'gaming', p:59, cp:79, s:35,r:4.6,rc:89, f:false,d:false,desc:'6-key customizable macropad, hot-swap, RGB, rotary encoder.',img:'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600',t:['macropad','mechanical','rgb']},
  {n:'ZeroG Float Arm Pro',          sku:'ZRG-ARM-100',c:'office', p:129,cp:169,s:20,r:4.8,rc:156,f:true, d:false,desc:'Zero-gravity monitor arm, 6-15kg load, 360° swivel.',        img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',t:['monitor-arm','ergonomic','zero-gravity']},
]

async function main() {
  console.log('🌱 Seeding CortexCart with 100 products...')

  await prisma.user.upsert({ where:{email:'admin@cortexcart.com'}, update:{},
    create:{email:'admin@cortexcart.com',name:'Admin',password:await bcrypt.hash('admin123',12),role:'ADMIN',emailVerified:new Date()}})
  await prisma.user.upsert({ where:{email:'demo@cortexcart.com'}, update:{},
    create:{email:'demo@cortexcart.com',name:'Demo User',password:await bcrypt.hash('demo1234',12),role:'CUSTOMER',emailVerified:new Date()}})

  const catMap: Record<string,string> = {}
  for (const c of CATS) {
    const r = await prisma.category.upsert({ where:{slug:c.slug}, update:{name:c.name},
      create:{name:c.name,slug:c.slug,description:c.description}})
    catMap[c.slug] = r.id
  }
  console.log(`✅ ${CATS.length} categories`)

  let count = 0
  for (const p of PRODUCTS) {
    const slug = p.n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
    const cid  = catMap[p.c]
    if (!cid) continue
    await prisma.product.upsert({ where:{slug},
      update:{basePrice:p.p,currentPrice:p.p,comparePrice:p.cp,stock:p.s},
      create:{slug,sku:p.sku,name:p.n,description:p.desc,brand:p.n.split(' ')[0],
              categoryId:cid,images:[p.img],tags:p.t,
              basePrice:p.p,currentPrice:p.p,comparePrice:p.cp,
              stock:p.s,rating:p.r,reviewCount:p.rc,
              isFeatured:p.f,isDeal:p.d,isActive:true}})
    count++
  }
  console.log(`✅ ${count} products seeded!`)
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect())
