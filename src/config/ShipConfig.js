/**
 * ShipConfig.js - Bảng chỉ số Chiến Hạm, Không quân & Cơ chế Hư hỏng Bộ phận (Modular Damage)
 * Tích hợp hệ thống dữ liệu tập trung UnitData.js
 */

import { UnitData } from './UnitData.js';

export const ShipConfig = {
    // ==========================================
    // 1. TÀU MẸ CHIẾN DỊCH: CĂN CỨ PHÁO ĐÀI HẢI QUÂN THÂN KÉP (STATIONARY FORTRESS)
    // ==========================================
    campaign_fortress: {
        id: 'carrier_fortress',
        name: UnitData.mothership.citadel.name,
        maxHp: UnitData.mothership.citadel.maxHp, // Pháo đài siêu bền bỉ
        speed: UnitData.mothership.citadel.speed, // KHÔNG DI CHUYỂN BẰNG WASD
        acceleration: 0,
        turnSpeed: 0,
        drag: 999,
        armor: UnitData.mothership.citadel.armor, // Giáp pháo đài cực dày
        stationary: true,                        // Cờ đứng yên hoàn toàn
        maxAircraft: UnitData.mothership.citadel.maxHangarJets, // Giới hạn máy bay tự vệ
        squadronSize: 3,
        autoCannons: UnitData.mothership.citadel.autoCannons,   // 4 khẩu pháo tự động
        cannonWeapon: 'ags155',
        missileSlots: UnitData.mothership.citadel.missileSlots, // Sở hữu bệ tên lửa Siêu thanh CPS
        missileWeapon: 'cps',
        missileCooldown: UnitData.mothership.citadel.missileCooldown,
        antiAirMissiles: UnitData.mothership.citadel.antiAirMissiles,
        slots: {
            slot1: { type: 'cannon', current: 'ags155', name: 'Tháp pháo AGS-155 Mạn Trái 1' },
            slot2: { type: 'cannon', current: 'ags155', name: 'Tháp pháo AGS-155 Mạn Trái 2' },
            slot3: { type: 'cannon', current: 'ags155', name: 'Tháp pháo AGS-155 Mạn Phải 1' },
            slot4: { type: 'cannon', current: 'ags155', name: 'Tháp pháo AGS-155 Mạn Phải 2' },
            slot5: { type: 'missile', current: 'cps', name: 'Giếng phóng Siêu thanh CPS 1' },
            slot6: { type: 'missile', current: 'cps', name: 'Giếng phóng Siêu thanh CPS 2' },
            slot7: { type: 'hangar', current: 'fighter_ngad', capacity: 12, squadrons: 4, name: 'Hangar Tự Vệ Thân Đôi' }
        },
        modules: {
            hull_left: { name: 'Thân Trái Catamaran', maxHp: 3200 },
            hull_right: { name: 'Thân Phải Catamaran', maxHp: 3200 },
            turrets: { name: '4 Tháp Pháo Phòng Thủ', maxHp: 2100 },
            radar: { name: 'Tháp Radar Mảng Pha AEGIS', maxHp: 2950 }
        }
    },

    // TÀU MẸ CHẾ ĐỘ ACTION MODE: SOÁI HẠM CITADEL (CVN-78) (LÁI TỰ DO WASD)
    player: {
        id: 'carrier_cvn78',
        name: UnitData.mothership.cvn78.name,
        maxHp: UnitData.mothership.cvn78.maxHp,
        speed: UnitData.mothership.cvn78.speed, // Lái tự do bằng WASD
        acceleration: UnitData.mothership.cvn78.acceleration,
        turnSpeed: UnitData.mothership.cvn78.turnSpeed,
        drag: UnitData.mothership.cvn78.drag,
        armor: UnitData.mothership.cvn78.armor,
        stationary: false,
        maxAircraft: UnitData.mothership.cvn78.maxHangarJets,
        squadronSize: 4,
        autoCannons: UnitData.mothership.cvn78.autoCannons,
        cannonWeapon: 'ags155',
        missileSlots: UnitData.mothership.cvn78.missileSlots,
        missileWeapon: 'cps',
        missileCooldown: UnitData.mothership.cvn78.missileCooldown,
        antiAirMissiles: UnitData.mothership.cvn78.antiAirMissiles,
        slots: {
            slot1: { type: 'cannon', current: 'ags155', name: 'Tháp pháo AGS-155 Mạn Trái (Port)' },
            slot2: { type: 'cannon', current: 'ags155', name: 'Tháp pháo AGS-155 Mạn Phải (Starboard)' },
            slot3: { type: 'missile', current: 'cps', name: 'Giếng phóng Tên lửa Siêu thanh CPS (VLS)' },
            slot4: { type: 'hangar', current: 'fighter_ngad', capacity: 12, squadrons: 4, name: 'Khoang chứa Máy bay Hangar' }
        },
        modules: {
            engine: { name: 'Động cơ & Chân vịt', maxHp: 1550, effect: 'Giảm 50% tốc độ di chuyển' },
            turrets: { name: 'Tháp pháo phòng thủ', maxHp: 2500, effect: 'Giảm 60% tốc độ bắn pháo' },
            radar: { name: 'Tháp Radar mảng pha', maxHp: 2450, effect: 'Giảm 35% tầm quét radar' }
        }
    },

    // ==========================================
    // 2. CÁC DÒNG MÁY BAY TIÊM KÍCH CỦA TÀU SÂN BAY
    // ==========================================
    aircraft: {
        fighter_jet: {
            id: 'fighter_f35c',
            name: UnitData.aircraft.fighter_f35c.name,
            cost: UnitData.aircraft.fighter_f35c.cost,
            summonCooldown: UnitData.aircraft.fighter_f35c.summonCooldown,
            maxHp: UnitData.aircraft.fighter_f35c.maxHp,
            speed: UnitData.aircraft.fighter_f35c.speed,
            turnSpeed: UnitData.aircraft.fighter_f35c.turnSpeed,
            weapon: 'aircraft_gatling',
            missileWeapon: 'tomahawk_aircraft',
            flightDuration: UnitData.aircraft.fighter_f35c.flightDuration,
            refuelDuration: UnitData.aircraft.fighter_f35c.refuelDuration,
            attackRange: UnitData.aircraft.fighter_f35c.attackRange,
            patrolRadius: 420,
            textureKey: 'fighter_jet'
        },
        fighter_f35c: {
            id: 'fighter_f35c',
            name: UnitData.aircraft.fighter_f35c.name,
            cost: UnitData.aircraft.fighter_f35c.cost,
            summonCooldown: UnitData.aircraft.fighter_f35c.summonCooldown,
            maxHp: UnitData.aircraft.fighter_f35c.maxHp,
            speed: UnitData.aircraft.fighter_f35c.speed,
            turnSpeed: UnitData.aircraft.fighter_f35c.turnSpeed,
            weapon: 'aircraft_gatling',
            missileWeapon: 'tomahawk_aircraft',
            flightDuration: UnitData.aircraft.fighter_f35c.flightDuration,
            refuelDuration: UnitData.aircraft.fighter_f35c.refuelDuration,
            attackRange: UnitData.aircraft.fighter_f35c.attackRange,
            patrolRadius: 420,
            textureKey: 'fighter_jet'
        },
        fighter_faxx: {
            id: 'fighter_faxx',
            name: UnitData.aircraft.fighter_faxx.name,
            cost: UnitData.aircraft.fighter_faxx.cost,
            summonCooldown: UnitData.aircraft.fighter_faxx.summonCooldown,
            maxHp: UnitData.aircraft.fighter_faxx.maxHp,
            speed: UnitData.aircraft.fighter_faxx.speed,
            turnSpeed: UnitData.aircraft.fighter_faxx.turnSpeed,
            weapon: 'aircraft_gatling',
            missileWeapon: 'tomahawk_aircraft',
            flightDuration: UnitData.aircraft.fighter_faxx.flightDuration,
            refuelDuration: UnitData.aircraft.fighter_faxx.refuelDuration,
            attackRange: UnitData.aircraft.fighter_faxx.attackRange,
            patrolRadius: 480,
            textureKey: 'jet_faxx'
        },
        fighter_ngad: {
            id: 'fighter_ngad',
            name: UnitData.aircraft.fighter_ngad.name,
            cost: UnitData.aircraft.fighter_ngad.cost,
            summonCooldown: UnitData.aircraft.fighter_ngad.summonCooldown,
            maxHp: UnitData.aircraft.fighter_ngad.maxHp,
            speed: UnitData.aircraft.fighter_ngad.speed,
            turnSpeed: UnitData.aircraft.fighter_ngad.turnSpeed,
            weapon: 'aircraft_gatling',
            missileWeapon: 'tomahawk_aircraft',
            flightDuration: UnitData.aircraft.fighter_ngad.flightDuration,
            refuelDuration: UnitData.aircraft.fighter_ngad.refuelDuration,
            attackRange: UnitData.aircraft.fighter_ngad.attackRange,
            patrolRadius: 540,
            textureKey: 'jet_ngad'
        }
    },

    // ==========================================
    // 3. HẠM ĐỘI TÀU CON HỘ TỐNG ĐỒNG MINH (5 LỚP TÀU CHIẾN THUẬT)
    // ==========================================
    allies: {
        // Tàu Hộ vệ hạm Constellation (Phòng không, bắn nhanh, chi phí rẻ)
        frigate: {
            id: 'ally_frigate',
            name: UnitData.allies.frigate.name,
            role: UnitData.allies.frigate.role,
            cost: UnitData.allies.frigate.cost,
            summonCooldown: UnitData.allies.frigate.summonCooldown,
            maxHp: UnitData.allies.frigate.maxHp,
            speed: UnitData.allies.frigate.speed,
            turnSpeed: UnitData.allies.frigate.turnSpeed,
            armor: UnitData.allies.frigate.armor,
            attackRange: UnitData.allies.frigate.attackRange,
            preferredDistance: UnitData.allies.frigate.preferredDistance,
            weapon: 'ags155',
            fireCooldown: UnitData.allies.frigate.fireCooldown,
            missileSlots: 4,
            missileWeapon: 'harpoon_block3',
            antiAirMissiles: UnitData.allies.frigate.antiAirMissiles,
            missileCooldown: UnitData.allies.frigate.missileCooldown,
            slots: {
                slot1: { type: 'cannon', current: 'ags155', name: 'Pháo hạm AGS-155' },
                slot2: { type: 'missile', current: 'harpoon_block3', name: 'Tên lửa Harpoon Block III' },
                slot3: { type: 'missile', current: 'rim116', name: 'Tên lửa Phòng không RIM-116' }
            },
            modules: {
                engine: { name: 'Động cơ', maxHp: 130 },
                turrets: { name: 'Pháo hạm', maxHp: 320 }
            }
        },

        // Tàu Khu trục Arleigh Burke (Cơ động, cân bằng, săn tên lửa)
        destroyer: {
            id: 'ally_destroyer',
            name: UnitData.allies.destroyer.name,
            role: UnitData.allies.destroyer.role,
            cost: UnitData.allies.destroyer.cost,
            summonCooldown: UnitData.allies.destroyer.summonCooldown,
            maxHp: UnitData.allies.destroyer.maxHp,
            speed: UnitData.allies.destroyer.speed,
            turnSpeed: UnitData.allies.destroyer.turnSpeed,
            armor: UnitData.allies.destroyer.armor,
            attackRange: UnitData.allies.destroyer.attackRange,
            preferredDistance: UnitData.allies.destroyer.preferredDistance,
            weapon: 'ags155',
            fireCooldown: UnitData.allies.destroyer.fireCooldown,
            missileSlots: 5,
            missileWeapon: 'nsm',
            antiAirMissiles: UnitData.allies.destroyer.antiAirMissiles,
            missileCooldown: UnitData.allies.destroyer.missileCooldown,
            slots: {
                slot1: { type: 'cannon', current: 'ags155', name: 'Pháo hạm AGS-155 (155mm)' },
                slot2: { type: 'missile', current: 'nsm', name: 'Tên lửa Chống hạm NSM' },
                slot3: { type: 'missile', current: 'rim162', name: 'Tên lửa Phòng không RIM-162' }
            },
            modules: {
                engine: { name: 'Động cơ', maxHp: 180 },
                turrets: { name: 'Pháo hạm', maxHp: 570 },
                radar: { name: 'Radar', maxHp: 140 }
            }
        },

        // Tuần dương hạm Ticonderoga (Hỏa lực tầm xa)
        cruiser: {
            id: 'ally_cruiser',
            name: UnitData.allies.cruiser.name,
            role: UnitData.allies.cruiser.role,
            cost: UnitData.allies.cruiser.cost,
            summonCooldown: UnitData.allies.cruiser.summonCooldown,
            maxHp: UnitData.allies.cruiser.maxHp,
            speed: UnitData.allies.cruiser.speed,
            turnSpeed: UnitData.allies.cruiser.turnSpeed,
            armor: UnitData.allies.cruiser.armor,
            attackRange: UnitData.allies.cruiser.attackRange,
            preferredDistance: UnitData.allies.cruiser.preferredDistance,
            weapon: 'ags155',
            fireCooldown: UnitData.allies.cruiser.fireCooldown,
            missileSlots: 6,
            missileWeapon: 'tomahawk_block_4',
            antiAirMissiles: UnitData.allies.cruiser.antiAirMissiles,
            missileCooldown: UnitData.allies.cruiser.missileCooldown,
            slots: {
                slot1: { type: 'cannon', current: 'ags155', name: 'Pháo hạm Mũi AGS-155' },
                slot2: { type: 'cannon', current: 'ags155', name: 'Pháo hạm Đuôi AGS-155' },
                slot3: { type: 'missile', current: 'tomahawk_block_4', name: 'Cụm VLS Tomahawk Block IV' },
                slot4: { type: 'missile', current: 'nsm', name: 'Tên lửa Chống hạm NSM' },
                slot5: { type: 'missile', current: 'rim162', name: 'Tên lửa Phòng không RIM-162' }
            },
            modules: {
                engine: { name: 'Động cơ', maxHp: 600 },
                turrets: { name: 'Pháo hạm', maxHp: 480 },
                radar: { name: 'Radar', maxHp: 440 }
            }
        },

        // Thiết giáp hạm Missouri (BB-63) (Pháo hạng nặng 406mm, giáp siêu dày)
        battleship: {
            id: 'ally_battleship',
            name: UnitData.allies.battleship.name,
            role: UnitData.allies.battleship.role,
            cost: UnitData.allies.battleship.cost,
            summonCooldown: UnitData.allies.battleship.summonCooldown,
            maxHp: UnitData.allies.battleship.maxHp,
            speed: UnitData.allies.battleship.speed,
            turnSpeed: UnitData.allies.battleship.turnSpeed,
            armor: UnitData.allies.battleship.armor,
            attackRange: UnitData.allies.battleship.attackRange,
            preferredDistance: UnitData.allies.battleship.preferredDistance,
            weapon: 'ally_battleship_cannon',
            fireCooldown: UnitData.allies.battleship.fireCooldown,
            missileSlots: 6,
            missileWeapon: 'tomahawk_block_4',
            antiAirMissiles: UnitData.allies.battleship.antiAirMissiles,
            missileCooldown: UnitData.allies.battleship.missileCooldown,
            slots: {
                slot1: { type: 'cannon', current: 'ally_battleship_cannon', name: 'Tháp pháo 1 406mm Mark 7' },
                slot2: { type: 'cannon', current: 'ally_battleship_cannon', name: 'Tháp pháo 2 406mm Mark 7' },
                slot3: { type: 'cannon', current: 'ally_battleship_cannon', name: 'Tháp pháo 3 406mm Mark 7' },
                slot4: { type: 'missile', current: 'tomahawk_block_4', name: 'Tên lửa Tomahawk Block IV' },
                slot5: { type: 'missile', current: 'harpoon_block3', name: 'Tên lửa Harpoon Block III' },
                slot6: { type: 'missile', current: 'rim162', name: 'Tên lửa Phòng không RIM-162' }
            },
            modules: {
                engine: { name: 'Động cơ Nồi hơi', maxHp: 450 },
                turrets: { name: '3 Tháp pháo 406mm', maxHp: 1500 }
            }
        },

        // Tàu sân bay hộ tống Ford (CVN-78) (4 pháo 20mm CIWS, 9 tiêm kích, phòng không RIM-162 / RIM-116 / SM-3)
        carrier: {
            id: 'ally_carrier',
            name: UnitData.allies.carrier.name,
            role: UnitData.allies.carrier.role,
            cost: UnitData.allies.carrier.cost,
            summonCooldown: UnitData.allies.carrier.summonCooldown,
            maxHp: UnitData.allies.carrier.maxHp,
            speed: UnitData.allies.carrier.speed,
            turnSpeed: UnitData.allies.carrier.turnSpeed,
            armor: UnitData.allies.carrier.armor,
            attackRange: UnitData.allies.carrier.attackRange,
            preferredDistance: UnitData.allies.carrier.preferredDistance,
            weapon: 'ciws_20mm_phalanx',
            radarRange: 400,
            weaponRange: 400,
            fireCooldown: UnitData.allies.carrier.fireCooldown,
            missileSlots: 4,
            missileWeapon: 'rim162',
            antiAirMissiles: UnitData.allies.carrier.antiAirMissiles,
            missileCooldown: UnitData.allies.carrier.missileCooldown,
            maxHp: UnitData.allies.carrier.maxHp,
            speed: UnitData.allies.carrier.speed,
            turnSpeed: UnitData.allies.carrier.turnSpeed,
            armor: UnitData.allies.carrier.armor,
            attackRange: UnitData.allies.carrier.attackRange,
            preferredDistance: UnitData.allies.carrier.preferredDistance,
            weapon: 'ciws_20mm_phalanx',
            fireCooldown: UnitData.allies.carrier.fireCooldown,
            missileSlots: 4,
            missileWeapon: 'rim162',
            missileCooldown: UnitData.allies.carrier.missileCooldown,
            slots: {
                slot1: { type: 'missile', current: 'rim162', name: 'Tên lửa Phòng không RIM-162' },
                slot2: { type: 'missile', current: 'rim116', name: 'Tên lửa Phòng không RIM-116' },
                slot3: { type: 'missile', current: 'sm3', name: 'Tên lửa Đánh chặn SM-3' },
                slot4: { type: 'hangar', current: 'fighter_f35c', capacity: 9, squadrons: 3, name: 'Hangar Tiêm Kích F-35C' }
            },
            summonCooldown: UnitData.allies.carrier.summonCooldown,
            maxHp: UnitData.allies.carrier.maxHp,
            speed: UnitData.allies.carrier.speed,
            turnSpeed: UnitData.allies.carrier.turnSpeed,
            armor: UnitData.allies.carrier.armor,
            attackRange: UnitData.allies.carrier.attackRange,
            preferredDistance: UnitData.allies.carrier.preferredDistance,
            weapon: 'ciws_20mm_phalanx',
            radarRange: 400,
            weaponRange: 400,
            fireCooldown: UnitData.allies.carrier.fireCooldown,
            missileSlots: 0,
            maxAircraft: UnitData.allies.carrier.escortJetsCount, // ĐỦ 9 TIÊM KÍCH
            squadronSize: 3,
            modules: {
                engine: { name: 'Động cơ Hạt nhân', maxHp: 900 },
                turrets: { name: '4 Pháo CIWS 20mm Phalanx', maxHp: 980 },
                hangar: { name: 'Hangar Boong Phóng', maxHp: 1250 }
            }
        }
    },

    // ==========================================
    // 4. HẠM ĐỘI ĐỐI PHƯƠNG
    // ==========================================
    enemies: {
        light_cruiser: {
            id: 'enemy_light_cruiser',
            name: 'Tuần dương hạm Viper',
            maxHp: 750,
            speed: 120,
            turnSpeed: 75,
            armor: 24,
            attackRange: 500,
            preferredDistance: 380,
            weapon: 'enemy_light_cannon',
            fireCooldown: 850,
            missileSlots: 2,
            missileWeapon: 'tomahawk_enemy',
            missileCooldown: 7000,
            antiAirMissileSlots: 1,
            antiAirMissileWeapon: 'enemy_anti_air_missile',
            antiAirCooldown: 6000,
            bounty: 400,
            scoreValue: 250,
            modules: {
                engine: { name: 'Động cơ', maxHp: 160 },
                turrets: { name: 'Pháo', maxHp: 150 }
            }
        },

        missile_destroyer: {
            id: 'enemy_missile_destroyer',
            name: 'Khu trục tên lửa Spectre',
            maxHp: 820,
            speed: 135,
            turnSpeed: 85,
            armor: 18,
            attackRange: 560,
            preferredDistance: 380,
            weapon: 'enemy_light_cannon',
            fireCooldown: 800,
            missileSlots: 4,
            missileWeapon: 'tomahawk_enemy',
            missileCooldown: 10000,
            antiAirMissileSlots: 2,
            antiAirMissileWeapon: 'enemy_anti_air_missile',
            antiAirCooldown: 5000,
            bounty: 450,
            scoreValue: 350,
            modules: {
                engine: { name: 'Động cơ', maxHp: 190 },
                turrets: { name: 'Pháo', maxHp: 180 },
                radar: { name: 'Radar', maxHp: 150 }
            }
        },

        heavy_battleship: {
            id: 'enemy_heavy_battleship',
            name: 'Thiết giáp hạm Goliath',
            maxHp: 1450,
            speed: 85,
            turnSpeed: 50,
            armor: 28,
            attackRange: 650,
            preferredDistance: 450,
            weapon: 'enemy_heavy_cannon',
            fireCooldown: 1200,
            missileSlots: 3,
            missileWeapon: 'tomahawk_enemy',
            missileCooldown: 10500,
            antiAirMissileSlots: 2,
            antiAirMissileWeapon: 'enemy_anti_air_missile',
            antiAirCooldown: 5000,
            bounty: 700,
            scoreValue: 450,
            modules: {
                engine: { name: 'Động cơ', maxHp: 320 },
                turrets: { name: 'Đại bác', maxHp: 320 }
            }
        },

        advanced_cruiser: {
            id: 'enemy_advanced_cruiser',
            name: 'Tuần dương hạm Tàng hình Chimera',
            maxHp: 1350,
            speed: 105,
            turnSpeed: 60,
            armor: 26,
            attackRange: 680,
            preferredDistance: 440,
            weapon: 'enemy_heavy_cannon',
            fireCooldown: 1000,
            missileSlots: 4,
            missileWeapon: 'tomahawk_enemy',
            missileCooldown: 10000,
            antiAirMissileSlots: 3,
            antiAirMissileWeapon: 'enemy_anti_air_missile',
            antiAirCooldown: 4500,
            bounty: 750,
            scoreValue: 600,
            modules: {
                engine: { name: 'Động cơ', maxHp: 360 },
                turrets: { name: 'Đại bác', maxHp: 340 },
                radar: { name: 'Radar', maxHp: 280 }
            }
        },

        // TÀU SÂN BAY ĐỊCH (IRON TIDE FLEET CARRIER)
        enemy_carrier: {
            id: 'enemy_carrier',
            name: 'Tàu sân bay Hắc Hải Iron Tide',
            maxHp: 3200,
            speed: 90,
            turnSpeed: 45,
            armor: 28,
            attackRange: 650,
            preferredDistance: 480,
            weapon: 'enemy_light_cannon',
            fireCooldown: 700,
            missileSlots: 3,
            missileWeapon: 'tomahawk_enemy',
            missileCooldown: 10000,
            antiAirMissileSlots: 4,
            antiAirMissileWeapon: 'enemy_anti_air_missile',
            antiAirCooldown: 6000,
            bounty: 950,
            scoreValue: 800,
            modules: {
                engine: { name: 'Động cơ Nồi hơi', maxHp: 650 },
                turrets: { name: 'Pháo CIWS & Boong tàu', maxHp: 650 },
                radar: { name: 'Radar Dẫn đường', maxHp: 500 }
            }
        },

        // TRÙM SIÊU THIẾT GIÁP HẠM KRAKEN (MÀN 5)
        dreadnought_boss: {
            id: 'enemy_dreadnought_boss',
            name: 'Siêu Thiết giáp hạm Hạt nhân KRAKEN',
            maxHp: 5200,
            speed: 65,
            turnSpeed: 35,
            armor: 38,
            attackRange: 700,
            preferredDistance: 480,
            weapon: 'enemy_heavy_cannon',
            fireCooldown: 900,
            missileSlots: 6,
            missileWeapon: 'tomahawk_boss',
            missileCooldown: 9000,
            antiAirMissileSlots: 6,
            antiAirMissileWeapon: 'enemy_anti_air_missile',
            antiAirCooldown: 5000,
            bounty: 2500,
            scoreValue: 2500,
            modules: {
                engine: { name: 'Lò phản ứng chính', maxHp: 1400 },
                turrets: { name: 'Cụm siêu đại bác', maxHp: 1300 },
                radar: { name: 'Tháp chỉ huy tối thượng', maxHp: 1000 }
            }
        },

        // TRÙM CUỐI SIÊU CẤP MÀN 7: KRAKEN TITAN GHÉP ĐÔI (VŨ KHÍ GẤP ĐÔI)
        super_boss_titan: {
            id: 'enemy_super_boss_titan',
            name: 'KRAKEN TITAN FUSION (SIÊU HẠM GHÉP ĐÔI)',
            maxHp: 9600,
            speed: 60,
            turnSpeed: 30,
            armor: 45,
            attackRange: 800,
            preferredDistance: 460,
            weapon: 'enemy_super_cannon',
            fireCooldown: 850,
            missileSlots: 10,
            missileWeapon: 'tomahawk_super_boss',
            missileCooldown: 10000,
            antiAirMissileSlots: 8,
            antiAirMissileWeapon: 'enemy_anti_air_missile',
            antiAirCooldown: 5000,
            bounty: 6000,
            scoreValue: 6000,
            modules: {
                engine: { name: 'Lò phản ứng nhiệt hạch kép', maxHp: 2800 },
                turrets: { name: '8 Tháp siêu pháo kép', maxHp: 2600 },
                radar: { name: 'Hệ thống radar tác chiến tích hợp', maxHp: 2200 }
            }
        }
    }
};
