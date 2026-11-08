/**
 * UnitData.js - Hệ Thống Cấu Hình Dữ Liệu Tập Trung (Centralized Unit & Combat Config)
 * 
 * Quản lý toàn bộ thông số chiến đấu của:
 * - Soái Hạm Citadel (Tàu mẹ phòng thủ cố định) & CVN-78 Gerald R. Ford (Action Mode)
 * - 5 Lớp Tàu Con Đồng Minh: Hộ vệ hạm, Khu trục hạm, Tuần dương hạm, Thiết giáp hạm, Tàu sân bay
 * - Không quân Tiêm kích: F-35C, F/A-XX, F/A-47 NGAD
 * - Toàn bộ Hạm đội Kẻ địch, Boss
 * 
 * Toàn bộ các Class/Scene truy xuất chỉ số từ file này để đảm bảo đồng bộ tuyệt đối.
 */

export const UnitData = {
    // ==========================================
    // 1. TÀU MẸ / SOÁI HẠM CITADEL & CVN-78
    // ==========================================
    mothership: {
        // Soái hạm Citadel: Pháo đài Trên Biển (Thân kép)
        citadel: {
            id: 'carrier_fortress',
            name: 'Soái Hạm Citadel',
            title: 'Pháo Đài Trên Biển',
            maxHp: 3000,
            speed: 0,                   // ĐỨNG YÊN HOÀN TOÀN TRONG CHẾ ĐỘ CHIẾN DỊCH
            acceleration: 0,
            turnSpeed: 0,
            armor: 50,                  // Lớp giáp composite pháo đài cực dày
            stationary: true,
            radarRadius: 1200,
            autoCannons: 1,             // 1 Khẩu pháo AGS-155 tự động + 4 CIWS 20mm
            cannonDamage: 95,
            cannonRange: 850,
            cannonCooldown: 500,
            missileSlots: 2,
            missileWeapon: 'cps',       // Tên lửa siêu thanh đặc biệt CPS
            missileDamage: 3210,
            missileRange: 2200,
            missileCooldown: 15000,
            antiAirMissiles: ['sm6', 'sm3', 'rim162', 'rim162', 'rim116', 'rim116'],
            maxHangarJets: 12,          // Sức chứa tối đa 12 tiêm kích (F-35C, FA-XX, NGAD)
            defaultStarterJets: 0,
            repairAmount: 550,
            repairCost: 400,
            repairCooldown: 15000
        },

        // Soái hạm CVN-78 Gerald R. Ford (Chế độ Hành động - Action Mode WASD)
        cvn78: {
            id: 'carrier_cvn78',
            name: 'Soái Hạm Citadel (CVN-78)',
            title: 'Siêu Tàu Sân Bay Hạt Nhân',
            maxHp: 2000,
            speed: 105,                 // Tự do điều khiển bằng phím WASD
            acceleration: 60,
            turnSpeed: 45,
            drag: 40,
            armor: 28,
            stationary: false,
            radarRadius: 1520,
            autoCannons: 2,
            cannonDamage: 85,
            cannonRange: 850,
            cannonCooldown: 500,
            missileSlots: 1,
            missileWeapon: 'cps',
            missileDamage: 3210,
            missileRange: 2200,
            missileCooldown: 12000,
            antiAirMissiles: ['sm3', 'rim162', 'rim162', 'rim116', 'rim116'],
            maxHangarJets: 12,
            defaultStarterJets: 0,
            repairAmount: 550,
            repairCost: 400,
            repairCooldown: 15000
        }
    },

    // ==========================================
    // 2. HẠM ĐỘI TÀU CON ĐỒNG MINH (5 LỚP TÀU CHIẾN THUẬT THEO INI)
    // ==========================================
    allies: {
        // [1] Hộ vệ hạm Constellation (FFG-62)
        frigate: {
            id: 'ally_frigate',
            name: 'Hộ vệ hạm Constellation',
            code: 'FFG-62',
            role: 'Hộ Vệ Phòng Không / Cơ Động',
            cost: 600,
            summonCooldown: 12000,
            limit: 3,
            maxHp: 650,
            speed: 160,
            turnSpeed: 95,
            armor: 15,
            radarRadius: 850,
            attackRange: 660,
            preferredDistance: 280,
            damage: 85,
            weapon: 'ags155',
            fireCooldown: 320,
            missileSlots: 2,
            antiShipMissiles: ['harpoon_block3', 'tomahawk_block_4'],
            antiAirMissiles: ['rim116', 'rim116', 'rim116', 'rim116'],
            missileCooldown: 8000,
            stopThreshold: 15
        },

        // [2] Tàu khu trục Arleigh Burke Flight III
        destroyer: {
            id: 'ally_destroyer',
            name: 'Tàu khu trục Arleigh Burke',
            code: 'DDG-51',
            role: 'Khu Trục / Săn Tên Lửa',
            cost: 950,
            summonCooldown: 15000,
            limit: 3,
            maxHp: 950,
            speed: 140,
            turnSpeed: 85,
            armor: 20,
            radarRadius: 900,
            attackRange: 750,
            preferredDistance: 320,
            damage: 85,
            weapon: 'ags155',
            fireCooldown: 350,
            missileSlots: 3,
            antiShipMissiles: ['nsm', 'nsm', 'nsm'],
            antiAirMissiles: ['sm3', 'rim116', 'rim116', 'rim116', 'rim116'],
            missileCooldown: 8500,
            stopThreshold: 15
        },

        // [3] Tuần dương hạm Ticonderoga
        cruiser: {
            id: 'ally_cruiser',
            name: 'Tuần dương hạm Ticonderoga',
            code: 'CG-47',
            role: 'Tuần Dương / Hỏa Lực Tầm Xa',
            cost: 1500,
            summonCooldown: 20000,
            limit: 2,
            maxHp: 1020,
            speed: 115,
            turnSpeed: 60,
            armor: 30,
            radarRadius: 1000,
            attackRange: 800,
            preferredDistance: 400,
            damage: 85,
            weapon: 'ags155',
            fireCooldown: 350,
            missileSlots: 3,
            antiShipMissiles: ['tomahawk_block_4', 'nsm', 'harpoon_block3'],
            antiAirMissiles: ['sm3', 'rim162', 'rim162', 'rim116', 'rim116'],
            missileCooldown: 9000,
            stopThreshold: 15
        },

        // [4] Thiết giáp hạm Missouri (BB-63)
        battleship: {
            id: 'ally_battleship',
            name: 'Thiết giáp hạm Missouri',
            code: 'BB-63',
            role: 'Thiết Giáp / Pháo Hạng Nặng',
            cost: 2000,
            summonCooldown: 25000,
            limit: 2,
            maxHp: 1500,
            speed: 95,
            turnSpeed: 45,
            armor: 40,
            radarRadius: 900,
            attackRange: 850,
            preferredDistance: 450,
            damage: 260,
            weapon: 'ally_battleship_cannon',
            fireCooldown: 2600,
            missileSlots: 2,
            antiShipMissiles: ['tomahawk_block_4', 'harpoon_block3'],
            antiAirMissiles: ['rim116', 'rim116', 'rim116', 'rim116', 'rim162', 'rim162'],
            missileCooldown: 9500,
            stopThreshold: 15
        },

        // [5] Tàu sân bay hộ tống CVN-78 Ford
        carrier: {
            id: 'ally_carrier',
            name: 'Tàu sân bay Ford',
            code: 'CVN-78',
            role: 'Tàu Sân Bay / CIWS 20mm & Không Kích',
            cost: 3000,
            summonCooldown: 30000,
            limit: 2,
            maxHp: 1200,
            speed: 100,
            turnSpeed: 50,
            armor: 30,
            radarRadius: 1500,
            radarRange: 1500,
            weaponRange: 120,
            attackRange: 1500,
            preferredDistance: 380,
            damage: 24,
            weapon: 'ciws_20mm_phalanx',
            fireCooldown: 80,
            missileSlots: 5,
            antiAirMissiles: ['sm3', 'rim162', 'rim162', 'rim116', 'rim116'],
            missileCooldown: 6000,
            escortJetsCount: 9,
            stopThreshold: 15
        }
    },

    // ==========================================
    // 3. KHÔNG QUÂN TIÊM KÍCH HẠM
    // ==========================================
    aircraft: {
        fighter_f35c: {
            id: 'fighter_f35c',
            name: 'Tiêm kích tàng hình F-35C Lightning II',
            cost: 450,
            squadronCost: 1350,          // 3 chiếc x $300
            summonCooldown: 8000,
            maxHp: 130,
            speed: 300,
            turnSpeed: 180,
            damage: 24,
            fireCooldown: 300,
            missileDamage: 150,
            missileRange: 550,
            missileCooldown: 10000,
            flightDuration: 30000,
            refuelDuration: 4000,
            attackRange: 450,
            textureKey: 'fighter_jet'
        },
        fighter_faxx: {
            id: 'fighter_faxx',
            name: 'Tiêm kích Thế hệ 6 F/A-XX',
            cost: 550,
            squadronCost: 1650,
            summonCooldown: 10000,
            maxHp: 165,
            speed: 340,
            turnSpeed: 210,
            damage: 34,
            fireCooldown: 250,
            missileDamage: 200,
            missileRange: 600,
            missileCooldown: 10000,
            flightDuration: 36000,
            refuelDuration: 3500,
            attackRange: 550,
            textureKey: 'jet_faxx'
        },
        fighter_ngad: {
            id: 'fighter_ngad',
            name: 'Siêu tiêm kích F/A-47 NGAD',
            cost: 650,
            squadronCost: 1950,
            summonCooldown: 10000,
            maxHp: 230,
            speed: 400,
            turnSpeed: 240,
            damage: 48,
            fireCooldown: 250,
            missileDamage: 250,
            missileRange: 680,
            missileCooldown: 10000,
            flightDuration: 42000,
            refuelDuration: 3000,
            attackRange: 650,
            textureKey: 'jet_ngad'
        }
    },

    // ==========================================
    // 4. HẠM ĐỘI KẺ ĐỊCH (ENEMY FLEET)
    // ==========================================
    enemies: {
        scout_boat: {
            name: 'Tàu tuần tra cơ động',
            maxHp: 460,
            speed: 110,
            turnSpeed: 75,
            armor: 10,
            attackRange: 420,
            preferredDistance: 250,
            damage: 18,
            fireCooldown: 1000,
            bounty: 250,
            scoreValue: 200
        },
        corvette: {
            name: 'Tàu hộ tống Corvette',
            maxHp: 440,
            speed: 95,
            turnSpeed: 70,
            armor: 15,
            attackRange: 450,
            preferredDistance: 320,
            damage: 28,
            fireCooldown: 1200,
            bounty: 300,
            scoreValue: 250
        },
        cruiser: {
            name: 'Tuần dương hạm Địch',
            maxHp: 750,
            speed: 85,
            turnSpeed: 55,
            armor: 20,
            attackRange: 550,
            preferredDistance: 380,
            damage: 42,
            fireCooldown: 1500,
            missileSlots: 3,
            missileDamage: 320,
            missileCooldown: 10000,
            bounty: 600,
            scoreValue: 300
        },
        heavy_battleship: {
            name: 'Thiết giáp hạm Đối phương',
            maxHp: 1550,
            speed: 45,
            turnSpeed: 40,
            armor: 40,
            attackRange: 800,
            preferredDistance: 450,
            damage: 120,
            fireCooldown: 2000,
            missileSlots: 3,
            missileDamage: 450,
            missileCooldown: 15000,
            bounty: 400,
            scoreValue: 500
        },
        enemy_carrier: {
            name: 'Tàu sân bay Hắc Hải Iron Tide',
            maxHp: 2800,
            speed: 50,
            turnSpeed: 45,
            armor: 40,
            attackRange: 900,
            preferredDistance: 480,
            damage: 50,
            fireCooldown: 180,
            missileSlots: 4,
            missileDamage: 320,
            missileCooldown: 7500,
            bounty: 400,
            scoreValue: 900
        },
        submarine: {
            name: 'Tàu ngầm Tấn công',
            maxHp: 520,
            speed: 120,
            turnSpeed: 60,
            armor: 15,
            attackRange: 600,
            preferredDistance: 350,
            damage: 35,
            fireCooldown: 2200,
            missileSlots: 2,
            missileDamage: 350,
            missileCooldown: 11500,
            bounty: 400,
            scoreValue: 400
        },
        destroyer: {
            name: 'Tàu khu trục Đối phương',
            maxHp: 680,
            speed: 95,
            turnSpeed: 65,
            armor: 18,
            attackRange: 550,
            preferredDistance: 340,
            damage: 36,
            fireCooldown: 1000,
            missileSlots: 4,
            missileDamage: 280,
            missileCooldown: 7500,
            bounty: 300,
            scoreValue: 300
        },
        kraken: {
            name: 'Siêu Boss Thần Trùng KRAKEN',
            maxHp: 4500,
            speed: 45,
            turnSpeed: 30,
            armor: 50,
            attackRange: 950,
            preferredDistance: 500,
            damage: 220,
            fireCooldown: 1200,
            missileSlots: 10,
            missileDamage: 650,
            missileCooldown: 10000,
            bounty: 600,
            scoreValue: 3000
        },
        dreadnought_boss: {
            name: 'Kỳ hạm Dreadnought Leviathan',
            maxHp: 5200,
            speed: 40,
            turnSpeed: 28,
            armor: 50,
            attackRange: 1000,
            preferredDistance: 550,
            damage: 280,
            fireCooldown: 1300,
            missileSlots: 10,
            missileDamage: 700,
            missileCooldown: 10000,
            bounty: 600,
            scoreValue: 4500
        },
        super_boss_titan: {
            name: 'Thần hạm Nemesis Titan',
            maxHp: 8000,
            speed: 55,
            turnSpeed: 25,
            armor: 60,
            attackRange: 1100,
            preferredDistance: 600,
            damage: 360,
            fireCooldown: 1000,
            missileSlots: 10,
            missileDamage: 850,
            missileCooldown: 1000,
            bounty: 600,
            scoreValue: 10000
        }
    }
};
