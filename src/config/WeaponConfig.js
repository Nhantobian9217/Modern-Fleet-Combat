/**
 * WeaponConfig.js - Bảng chỉ số Hỏa lực & Tên lửa Tomahawk
 * 
 * - Tên lửa Tomahawk bay trên trời nên XUYÊN QUA ĐỊA HÌNH (flyOverTerrain: true)
 * - Tốc độ đạn và tên lửa được điều chỉnh chậm lại để tăng tính chiến thuật và dễ quan sát
 */

export const WeaponConfig = {
    // ==========================================
    // 1. TÊN LỬA ĐẶC BIỆT SOÁI HẠM CITADEL (CPS - HYPERSONIC AOE HIT CẢ TÀU LẪN MÁY BAY)
    // ==========================================
    cps: {
        id: 'cps',
        name: 'Tên lửa Siêu thanh CPS (Conventional Prompt Strike)',
        damage: 3210,
        aoeRadius: 480,
        speed: 5000,               // Mach 5+ Siêu thanh
        range: 2200,
        cooldown: 10000,
        turnSpeed: 250,
        flyOverTerrain: true,
        bulletColor: 0x00f2fe,
        maxHp: 5500,
        targetType: 'all',        // AOE HIT CẢ TÀU CHIẾN LẪN MÁY BAY / TÊN LỬA ĐỊCH!
        textureKey: 'missile_cps',
        spriteScale: 1.1
    },

    // ==========================================
    // 2. TÊN LỬA PHÒNG KHÔNG (AIR TARGET ONLY - CHỈ BẮN TÊN LỬA VÀ MÁY BAY, KHÔNG BẮN TÀU)
    // ==========================================
    rim116: {
        id: 'rim116',
        name: 'Tên lửa Đánh chặn Tầm gần RIM-116 RAM',
        damage: 200,
        aoeRadius: 135,
        speed: 1080,
        radarRange: 550,          // Tầm quét phát hiện từ xa
        weaponRange: 480,         // Tầm bắn thực tế (chỉ khai hỏa khi dist <= 380)
        range: 480,
        cooldown: 2000,
        turnSpeed: 300,
        flyOverTerrain: true,
        bulletColor: 0x54a0ff,
        maxHp: 1600,
        targetType: 'air_only',   // AIR TARGET ONLY
        textureKey: 'missile_rim116',
        spriteScale: 1.0
    },

    rim162: {
        id: 'rim162',
        name: 'Tên lửa Phòng không RIM-162 ESSM',
        damage: 250,
        aoeRadius: 145,
        speed: 1150,
        radarRange: 750,          // Tầm quét radar
        weaponRange: 750,         // Tầm bắn thực tế (khai hỏa khi dist <= 520)
        range: 750,
        cooldown: 3000,
        turnSpeed: 380,
        flyOverTerrain: true,
        bulletColor: 0x2ed573,
        maxHp: 1800,
        targetType: 'air_only',   // AIR TARGET ONLY
        textureKey: 'missile_rim162',
        spriteScale: 1.0
    },

    sm3: {
        id: 'sm3',
        name: 'Tên lửa Đánh chặn Siêu tầm xa SM-3 Block IIA',
        damage: 400,
        aoeRadius: 200,
        speed: 1260,
        radarRange: 950,          // Tầm quét radar
        weaponRange: 920,         // Tầm bắn thực tế (khai hỏa khi dist <= 750)
        range: 920,
        cooldown: 5000,
        turnSpeed: 370,
        flyOverTerrain: true,
        bulletColor: 0x00d2d3,
        maxHp: 1900,
        targetType: 'air_only',   // AIR TARGET ONLY
        textureKey: 'missile_sm3',
        spriteScale: 1.0
    },

    sm6: {
        id: 'sm6',
        name: 'Tên lửa Đa nhiệm SM-6 Block IB',
        damage: 600,
        aoeRadius: 250,
        speed: 1540,
        radarRange: 1100,         // Tầm quét radar
        weaponRange: 1100,         // Tầm bắn thực tế (khai hỏa khi dist <= 800)
        range: 1100,
        cooldown: 8000,
        turnSpeed: 375,
        flyOverTerrain: true,
        bulletColor: 0x1dd1a1,
        maxHp: 2400,
        targetType: 'air_only',   // AIR TARGET ONLY
        textureKey: 'missile_sm6',
        spriteScale: 1.0
    },

    // ==========================================
    // 3. TÊN LỬA CHỐNG HẠM (SHIP TARGET ONLY - CHỈ BẮN TÀU CHIẾN, KHÔNG BẮN ĐƯỢC MỤC TIÊU BAY)
    // ==========================================
    harpoon_block3: {
        id: 'harpoon_block3',
        name: 'Tên lửa Diệt hạm Harpoon Block III',
        damage: 450,
        aoeRadius: 150,
        speed: 515,
        range: 850,
        cooldown: 10000,
        turnSpeed: 230,
        flyOverTerrain: true,
        bulletColor: 0xff9f43,
        maxHp: 210,
        targetType: 'ship_only',  // SHIP TARGET ONLY
        textureKey: 'missile_harpoon3',
        spriteScale: 0.1
    },

    nsm: {
        id: 'nsm',
        name: 'Tên lửa Chống hạm Tàng hình NSM (Naval Strike Missile)',
        damage: 380,
        aoeRadius: 120,
        speed: 565,
        range: 900,
        cooldown: 5000,
        turnSpeed: 240,
        flyOverTerrain: true,
        bulletColor: 0xee5253,
        maxHp: 150,
        targetType: 'ship_only',  // SHIP TARGET ONLY
        textureKey: 'missile_nsm',
        spriteScale: 0.1
    },

    agm84: {
        id: 'agm84',
        name: 'Tên lửa Diệt hạm Không đối hải AGM-84',
        damage: 350,
        aoeRadius: 115,
        speed: 515,
        range: 750,
        cooldown: 10000,
        turnSpeed: 250,
        flyOverTerrain: true,
        bulletColor: 0xfeca57,
        maxHp: 100,
        targetType: 'ship_only',  // SHIP TARGET ONLY
        textureKey: 'missile_agm84',
        spriteScale: 1.0
    },

    tomahawk_block_4: {
        id: 'tomahawk_block_4',
        name: 'Tên lửa Hành trình Tomahawk Block IV',
        damage: 600,
        aoeRadius: 200,
        speed: 486,
        range: 1250,
        cooldown: 10000,
        turnSpeed: 220,
        flyOverTerrain: true,
        bulletColor: 0x10ac84,
        maxHp: 250,
        targetType: 'ship_only',  // SHIP TARGET ONLY
        textureKey: 'missile_tomahawk4',
        spriteScale: 0.8
    },

    // Tương thích ngược: tomahawk_carrier chuyển tiếp sang CPS
    tomahawk_carrier: {
        id: 'cps',
        name: 'Tên lửa Siêu thanh CPS (Conventional Prompt Strike)',
        damage: 2250,
        aoeRadius: 250,
        speed: 1000,
        range: 2200,
        cooldown: 10000,
        turnSpeed: 250,
        flyOverTerrain: true,
        bulletColor: 0x00f2fe,
        maxHp: 1450,
        targetType: 'all',
        textureKey: 'missile_cps',
        spriteScale: 1.1
    },

    // Loại bỏ tomahawk_block_va (chuyển tiếp sang CPS an toàn)
    tomahawk_block_va: {
        id: 'cps',
        name: 'Tên lửa Siêu thanh CPS',
        damage: 2250,
        aoeRadius: 250,
        speed: 1000,
        range: 2200,
        cooldown: 10000,
        turnSpeed: 250,
        flyOverTerrain: true,
        bulletColor: 0x00f2fe,
        maxHp: 1450,
        targetType: 'all',
        textureKey: 'missile_cps',
        spriteScale: 1.1
    },

    tomahawk_destroyer: {
        id: 'tomahawk_destroyer',
        name: 'Tên lửa Tomahawk Block IV (Khu Trục)',
        damage: 460,
        aoeRadius: 200,
        speed: 486,
        range: 1050,
        cooldown: 10000,
        turnSpeed: 220,
        flyOverTerrain: true,
        bulletColor: 0x2ecc71,
        maxHp: 195
    },

    tomahawk_cruiser: {
        id: 'tomahawk_cruiser',
        name: 'Tên lửa Tomahawk Block V (Tuần Dương)',
        damage: 485,
        aoeRadius: 225,
        speed: 515,
        range: 1250,
        cooldown: 10000,
        turnSpeed: 220,
        flyOverTerrain: true,
        bulletColor: 0x1abc9c,
        maxHp: 195
    },

    tomahawk_aircraft: {
        id: 'tomahawk_aircraft',
        name: 'Tên lửa Chống hạm AGM-84 (Tiêm Kích)',
        damage: 145,
        aoeRadius: 175,
        speed: 861,
        range: 750,
        cooldown: 5000,
        turnSpeed: 250,
        flyOverTerrain: true,
        bulletColor: 0xffeaa7,
        maxHp: 295,
        targetType: 'ship_only',
        textureKey: 'missile_agm84',
        spriteScale: 0.8
    },

    tomahawk_enemy: {
        id: 'tomahawk_enemy',
        name: 'Tên lửa Diệt hạm Địch (Ship Target Only)',
        damage: 420,
        aoeRadius: 90,
        speed: 840,
        range: 1050,
        cooldown: 7000,
        turnSpeed: 230,
        flyOverTerrain: true,
        bulletColor: 0xff3838,
        maxHp: 360,
        targetType: 'ship_only'
    },

    tomahawk_boss: {
        id: 'tomahawk_boss',
        name: 'Đại Tên lửa Diệt hạm KRAKEN (Ship Target Only)',
        damage: 650,
        aoeRadius: 120,
        speed: 560,
        range: 1350,
        cooldown: 8000,
        turnSpeed: 230,
        flyOverTerrain: true,
        bulletColor: 0xff0055,
        maxHp: 1000,
        targetType: 'ship_only'
    },

    tomahawk_super_boss: {
        id: 'tomahawk_super_boss',
        name: 'Siêu Tên lửa Diệt hạm Hạt nhân KRAKEN TITAN',
        damage: 1000,
        aoeRadius: 250,
        speed: 560,
        range: 1600,
        cooldown: 9000,
        turnSpeed: 240,
        flyOverTerrain: true,
        bulletColor: 0xff0033,
        maxHp: 3000,
        targetType: 'ship_only'
    },

    enemy_anti_air_missile: {
        id: 'enemy_anti_air_missile',
        name: 'Tên lửa Phòng không Hạm đội Địch (Air Target Only)',
        damage: 360,
        aoeRadius: 100,
        speed: 1520,
        range: 1050,
        radarRange: 1050,
        weaponRange: 1050,
        cooldown: 1000,
        turnSpeed: 300,
        flyOverTerrain: true,
        bulletColor: 0xff3838,
        maxHp: 800,
        targetType: 'air_only',
        textureKey: 'missile_rim162',
        spriteScale: 1.2
    },

    // ==========================================
    // 2. PHÁO HẢI QUÂN & HỆ THỐNG PHÒNG KHÔNG
    // ==========================================
    ags155: {
        id: 'ags155',
        name: 'Pháo hạm AGS-155 (155mm Tiên Tiến)',
        damage: 115,
        bulletSpeed: 1060,
        radarRange: 850,           // Tầm phát hiện và xoay nòng theo dõi
        weaponRange: 540,          // Tầm khai hỏa thực tế (chỉ fire khi dist <= 540)
        range: 580,
        cooldown: 480,             // Tốc độ bắn ổn định
        barrels: 1,
        bulletRadius: 4.2,
        bulletColor: 0x38ef7d,
        splashRadius: 45,
        antiAir: false,            // LOẠI BỎ KHẢ NĂNG BẮN HẠ TÊN LỬA VÀ MÁY BAY (SHIP TARGET ONLY)
        targetType: 'ship_only',   // Chỉ bắn tàu nổi
        spreadVariance: 0      // Góc tản đạn cực nhỏ trong khoảng ±1 đến ±2 độ (≈ ±1.5°)
    },

    mark45_mod4: {
        id: 'ags155',
        name: 'Pháo hạm AGS-155 (155mm Tiên Tiến)',
        damage: 115,
        bulletSpeed: 1060,
        range: 850,
        cooldown: 480,
        barrels: 1,
        bulletRadius: 4.2,
        bulletColor: 0x38ef7d,
        splashRadius: 45,
        antiAir: false,
        targetType: 'ship_only',
        spreadVariance: 0
    },

    mark45_mod4m: {
        id: 'ags155',
        name: 'Pháo hạm AGS-155 (155mm Tiên Tiến)',
        damage: 115,
        bulletSpeed: 1060,
        range: 850,
        cooldown: 480,
        barrels: 1,
        bulletRadius: 4.2,
        bulletColor: 0x38ef7d,
        splashRadius: 45,
        antiAir: false,
        targetType: 'ship_only',
        spreadVariance: 0
    },

    carrier_defense_cannon: {
        id: 'ags155',
        name: 'Pháo hạm AGS-155 (155mm)',
        damage: 115,
        bulletSpeed: 1060,
        range: 850,
        cooldown: 480,
        barrels: 1,
        bulletRadius: 4.2,
        bulletColor: 0x38ef7d,
        splashRadius: 45,
        antiAir: false,
        targetType: 'ship_only',
        spreadVariance: 0
    },

    ciws_20mm_phalanx: {
        id: 'ciws_20mm_phalanx',
        name: 'Pháo cao tốc 20mm CIWS Phalanx (Đánh chặn Tên lửa & Máy bay)',
        damage: 25,
        bulletSpeed: 1150,
        radarRange: 400,           // Tầm phát hiện radar cảnh giới UI (400px)
        weaponRange: 250,          // Tầm bắn khai hỏa thực tế của súng (120px)
        range: 250,                // Tầm đạn bay tối đa
        cooldown: 80,              // Khai hỏa cực nhanh (12 phát/giây)
        barrels: 1,
        bulletRadius: 2.2,
        bulletColor: 0xfffa65,
        splashRadius: 10,
        antiAir: true,
        targetType: 'air_only',    // CHỈ BẮN TÊN LỬA VÀ MÁY BAY ĐỊCH (AIR TARGET ONLY)
        spreadVariance: 0      // Độ chính xác cực cao (±0.8 độ)
    },

    ciws_30mm_gatling: {
        id: 'ciws_20mm_phalanx',
        name: 'Pháo cao tốc 20mm CIWS Phalanx (Đánh chặn Tên lửa & Máy bay)',
        damage: 24,
        bulletSpeed: 1150,
        radarRange: 400,
        weaponRange: 220,
        range: 230,
        cooldown: 80,
        barrels: 1,
        bulletRadius: 2.2,
        bulletColor: 0xfffa65,
        splashRadius: 8,
        antiAir: true,
        targetType: 'air_only',
        spreadVariance: 0
    },

    ally_battleship_cannon: {
        id: 'ally_battleship_cannon',
        name: 'Siêu hải pháo 406mm Mark 7 (Thiết giáp hạm)',
        damage: 360,
        bulletSpeed: 960,
        range: 950,
        cooldown: 5000,
        barrels: 3,
        barrelSpacing: 8,
        bulletRadius: 5.5,
        bulletColor: 0xff9f43,
        splashRadius: 105,
        antiAir: false,
        spreadVariance: 0
    },

    ally_frigate_cannon: {
        id: 'ally_frigate_cannon',
        name: 'Pháo hạm đa năng 57mm Mk 110 (Hộ vệ hạm)',
        damage: 28,
        bulletSpeed: 960,
        range: 660,
        cooldown: 400,
        barrels: 1,
        bulletRadius: 2.8,
        bulletColor: 0x54a0ff,
        splashRadius: 25,
        antiAir: true,
        spreadVariance: 0
    },

    aircraft_gatling: {
        id: 'aircraft_gatling',
        name: 'Pháo tự động 25mm GAU-22/A',
        damage: 64,
        bulletSpeed: 620,
        range: 460,
        cooldown: 250,
        barrels: 1,
        bulletRadius: 2.5,
        bulletColor: 0xffeaa7,
        splashRadius: 10,
        spreadVariance: 0
    },

    ally_rapid_cannon: {
        id: 'ally_rapid_cannon',
        name: 'Pháo cao tốc Mk 45 (Khu trục)',
        damage: 45,
        bulletSpeed: 640,
        range: 540,
        cooldown: 500,
        barrels: 1,
        bulletRadius: 3.5,
        bulletColor: 0x2ecc71,
        splashRadius: 24,
        spreadVariance: 0
    },

    ally_heavy_cannon: {
        id: 'ally_heavy_cannon',
        name: 'Đại bác hạm đôi 203mm (Tuần dương)',
        damage: 290,
        bulletSpeed: 710,
        range: 680,
        cooldown: 1100,
        barrels: 2,
        barrelSpacing: 10,
        bulletRadius: 5,
        bulletColor: 0x1dd1a1,
        splashRadius: 24,
        spreadVariance: 0
    },

    enemy_light_cannon: {
        id: 'enemy_light_cannon',
        name: 'Pháo hạm địch 127mm',
        damage: 145,
        bulletSpeed: 920,
        range: 650,
        cooldown: 650,
        barrels: 2,
        bulletRadius: 3.5,
        bulletColor: 0xff4757,
        splashRadius: 15,
        antiAir: false,
        targetType: 'ship_only',
        spreadVariance: 0
    },

    enemy_heavy_cannon: {
        id: 'enemy_heavy_cannon',
        name: 'Đại bác hạm địch hạng nặng 380mm',
        damage: 320,
        bulletSpeed: 1020,
        range: 820,
        cooldown: 800,
        barrels: 2,
        barrelSpacing: 12,
        bulletRadius: 5.5,
        bulletColor: 0xff6b4a,
        splashRadius: 30,
        antiAir: false,
        targetType: 'ship_only',
        spreadVariance: 0
    },

    enemy_super_cannon: {
        id: 'enemy_super_cannon',
        name: 'Cụm Tứ Siêu Pháo Hạt Nhân 460mm',
        damage: 650,
        bulletSpeed: 1150,
        range: 1150,
        cooldown: 850,
        barrels: 4,
        barrelSpacing: 10,
        bulletRadius: 6.5,
        bulletColor: 0xff0044,
        splashRadius: 45,
        antiAir: false,
        targetType: 'ship_only',
        spreadVariance: 0
    }
};
