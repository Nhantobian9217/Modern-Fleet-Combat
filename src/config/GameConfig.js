/**
 * GameConfig.js - Cấu hình Hệ thống & Môi trường Tác chiến Hải quân
 */

export const GameConfig = {
    // Kích thước khung nhìn màn hình
    width: 1280,
    height: 720,

    // Màu nền biển xanh thẫm
    oceanColor: 0x071526,
    gridColor: 0x0d3356,

    // BẢN ĐỒ CHIẾN TRƯỜNG RỘNG LỚN (Đã mở rộng lên 3200 x 2200)
    worldWidth: 3200,
    worldHeight: 2200,

    // Thu phóng Camera
    camera: {
        minZoom: 0.55,
        maxZoom: 1.35,
        defaultZoom: 0.85
    },

    // Ngân sách quân sự khởi điểm
    startingCredits: 1500,

    // Tầm quét Radar tàu mẹ cơ bản (Nâng cấp lên 950 cho phạm vi kiểm soát rộng hơn)
    radarRadius: 1950,

    // THỜI GIAN CHUẨN BỊ GIỮA CÁC ĐỢT (20 GIÂY)
    interWavePrepTime: 20000,

    // GIỚI HẠN MÁY BAY TỐI ĐA TRÊN TÀU SÂN BAY (4 PHI ĐỘI X 3 CHIẾC = 12 MÁY BAY)
    maxCarrierAircraft: 12,
    squadronCount: 4,
    squadronSize: 3,

    // GIỚI HẠN TÀU CON HỘ TỐNG ĐỒNG MINH (ĐỂ TRÁNH LAG & GIỮ CÂN BẰNG TÁC CHIẾN)
    allyLimits: {
        destroyer: 3,   // Tối đa 4 tàu khu trục Arleigh Burke
        cruiser: 2,     // Tối đa 3 tuần dương hạm Ticonderoga
        battleship: 2,  // Tối đa 2 thiết giáp hạm Iowa
        frigate: 3,     // Tối đa 4 hộ vệ hạm Constellation
        carrier: 2      // Tối đa 2 tàu sân bay hộ tống CVN-78
    },

    // HỆ THỐNG ĐÔ ĐỐC & KỸ NĂNG BỊ ĐỘNG (ADMIRAL SYSTEM)
    admirals: {
        duxe: {
            id: 'duxe',
            name: 'Đô đốc Hạm Đội Duxe',
            title: 'Chỉ huy Tác chiến (Combatant Commander)',
            desc: 'Tăng 20% tốc độ nạp đạn và sát thương bắn pháo cho toàn bộ chiến hạm.',
            cost: 0, // Khởi đầu miễn phí
            reloadBuff: 0.80, // Cooldown x 0.70 (bắn nhanh hơn 30%)
            allyDmgBuff: 1.20,
            bountyBuff: 1.0,
            radarBuff: 1.0,
            avatarIcon: '🎖'
        },
        cattnoriel: {
            id: 'cattnoriel',
            name: 'Đô đốc Cattnoriel',
            title: 'Chỉ huy hạm đội 5',
            desc: 'Tăng 25% sát thương cho toàn bộ tàu con và +20% tiền thưởng khi diệt địch.',
            cost: 7, // Mua trong Cửa hàng / Kho đồ
            reloadBuff: 1.0,
            allyDmgBuff: 1.25,
            bountyBuff: 1.20,
            radarBuff: 1.0,
            avatarIcon: '👑'
        },
        xtobian: {
            id: 'xtobian',
            name: 'Xtobian',
            title: 'Đô đốc Hạm đội (Supreme Commander)',
            desc: 'Tăng 50% tầm quét Radar, sát thương và Tăng 30% tiền thưởng, reload.',
            cost: 12,
            reloadBuff: 0.70,
            allyDmgBuff: 1.5,
            bountyBuff: 1.30,
            radarBuff: 1.5,
            avatarIcon: '⭐'
        }
    },

    // HỆ THỐNG ĐỘI HÌNH CHIẾN THUẬT HẠM ĐỘI (FLEET FORMATIONS)
    formations: {
        LINE: {
            id: 'LINE',
            name: 'Đội hình Hàng dọc (Column Line)',
            desc: 'Tập trung toàn lực hỏa lực pháo và tên lửa thẳng về phía trước (+10% sát thương đạn pháo).',
            dmgBuff: 1.10,
            speedBuff: 1.0,
            aaBuff: 1.0
        },
        WEDGE: {
            id: 'WEDGE',
            name: 'Đội hình Mũi tên (Arrow Wedge)',
            desc: 'Tăng tốc độ di chuyển và cơ động của hạm đội lên 25%.',
            dmgBuff: 1.0,
            speedBuff: 1.25,
            aaBuff: 1.0
        },
        CIRCLE: {
            id: 'CIRCLE',
            name: 'Vòng tròn Phòng thủ (Defense Screen)',
            desc: 'Tăng cường lưới lửa phòng không và bắn chặn tên lửa/máy bay thêm 40%.',
            dmgBuff: 1.0,
            speedBuff: 0.9,
            aaBuff: 1.40
        }
    },

    // CƠ CHẾ TỰ SỬA CHỮA (AUTO-REPAIR)
    autoRepair: {
        damageCooldown: 10000,    // 10 giây không nhận sát thương
        healPercentPerSec: 0.05  // Hồi phục 5% Máu tổng mỗi giây
    },

    // HỆ THỐNG THỜI TIẾT ĐỘNG (DYNAMIC WEATHER)
    weatherTypes: {
        CLEAR: {
            id: 'CLEAR',
            name: 'Trời Quang Biển Lặng',
            icon: '☀',
            radarMod: 1.0,
            speedMod: 1.0,
            bulletDrift: 0,
            desc: 'Điều kiện hải trình lý tưởng, tầm nhìn và hỏa lực đạt 100% hiệu suất.'
        },
        STORM: {
            id: 'STORM',
            name: 'Bão Tố Cuồng Phong',
            icon: '⛈',
            radarMod: 0.85,
            speedMod: 0.85, // Giảm 15% tốc độ tàu
            bulletDrift: 18, // Gió bão làm lệch đường đạn nhỏ
            rainCount: 160,
            desc: 'Mưa to bão lớn, sóng giật làm tàu đi chậm hơn và đạn pháo nhỏ bị lệch hướng.'
        },
        HEAVY_FOG: {
            id: 'HEAVY_FOG',
            name: 'Sương Mù Dày Đặc',
            icon: '🌫',
            radarMod: 0.70, // Giảm 30% tầm radar cả ta và địch
            speedMod: 0.95,
            bulletDrift: 0,
            desc: 'Sương mù che khuất tầm nhìn, radar cả 2 phe bị giảm mạnh 30% phạm vi khóa mục tiêu.'
        },
        ROUGH_SEAS: {
            id: 'ROUGH_SEAS',
            name: 'Sóng Lớn Cuồn Cuộn',
            icon: '🌊',
            radarMod: 0.95,
            speedMod: 0.80, // Giảm 20% tốc độ tàu
            bulletDrift: 8,
            desc: 'Sóng biển dữ dội làm giảm mạnh 20% tốc độ cơ động của hạm đội.'
        }
    },

    // HỆ THỐNG KỸ NĂNG CHỈ HUY CHỦ ĐỘNG (COMMANDER SKILLS)
    commanderSkills: {
        AIR_SUPERIORITY: {
            id: 'AIR_SUPERIORITY',
            name: 'Không Kích Yểm Trợ Khẩn Cấp (CAS)',
            icon: '🛩',
            cooldown: 15000, // 15s
            desc: 'Điều động khẩn cấp 1 phi đội 3 tiêm kích chi viện.'
        },
        EW_JAMMING: {
            id: 'EW_JAMMING',
            name: 'Tác Chiến Điện Tử (Radar Jam)',
            icon: '⚡',
            cooldown: 30000, // 30s
            duration: 20000, // 20s hiệu lực
            desc: 'Phát sóng áp chế điện tử làm mù toàn bộ radar địch, chặn địch bắn tên lửa trong 20 giây!'
        },
        OVERDRIVE_SUPPLY: {
            id: 'OVERDRIVE_SUPPLY',
            name: 'Tiếp Tế Siêu Tốc (Overdrive)',
            icon: '🚀',
            cooldown: 20000, // 20s
            duration: 15000, // 15s hiệu lực
            desc: 'Xóa bỏ toàn bộ thời gian hồi chiêu triệu hồi tàu và máy bay trong 15 giây.'
        }
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    }
};
