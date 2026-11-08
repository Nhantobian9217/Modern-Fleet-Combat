/**
 * StageConfig.js - Cấu hình 10 Màn Chiến Dịch & Chế Độ Sinh Tồn Vô Tận
 *
 * CHIẾN DỊCH: "BÌNH MINH THẦN SẤM" (OPERATION THUNDER DAWN)
 * Năm 2031 - Hạm đội CVN-78 Gerald R. Ford đối đầu tổ chức khủng bố IRON TIDE
 *
 * Mỗi màn chơi gồm nhiều ĐỢT TẤN CÔNG (Waves). Kẻ thù xuất kích nối đuôi nhau (convoy)
 * Giữa các đợt có 20 GIÂY CHUẨN BỊ (hoặc bấm Bỏ Qua để xuất chiến ngay).
 *
 * QUY TẮC ĐỊA HÌNH & VẬT CẢN:
 * - Tàu mẹ ở x=450, y=1100. Đội hình đồng minh bố trí x=650-1000.
 * - Luồng di chuyển chính: Lane 0 (y=740), Lane 1 (y=1100), Lane 2 (y=1460).
 * - Vật cản CHỈ ĐƯỢC PHÉP xuất hiện ở x >= 1350 và tại các khoảng Y an toàn:
 *   + Vùng Bắc: y = 420 - 480
 *   + Vùng Giữa-Bắc: y = 910 - 930
 *   + Vùng Giữa-Nam: y = 1270 - 1290
 *   + Vùng Nam: y = 1710 - 1770
 */

export const StageConfig = [
    {
        id: 1,
        code: 'SECTOR 01',
        name: 'VỊNH TAN VỠ',
        subName: 'Shattered Strait',
        story: 'Hạm đội 5 UAN dưới quyền Đô đốc Cattnoriel đang tuần tra để bảo vệ các tuyến cáp ngầm thông tin Thái Bình Dương thì radar phát hiện những tính hiệu lạ.',
        desc: 'Hải phận cơ bản. Hạm đội địch tiến vào nối đuôi nhau theo đợt. Đây là bước khởi đầu của chiến dịch "Bình Minh Thần Sấm".',
        tokensReward: 3,
        startingCreditsBonus: 0,
        weather: 'CLEAR', // Trời quang
        waves: [
            // Đợt 1: 3 Tuần dương hạm hạng nhẹ nối đuôi nhau
            [
                { type: 'light_cruiser', offsetX: 180, offsetY: -220 },
                { type: 'light_cruiser', offsetX: 240, offsetY: 0 },
                { type: 'light_cruiser', offsetX: 180, offsetY: 220 },
                { type: 'light_cruiser', offsetX: 200, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 100, offsetY: 260 }
            ],
            // Đợt 2: Đội tàu xung kích với Thiết giáp hạm đầu sỏ
            [
                { type: 'light_cruiser', offsetX: 150, offsetY: -260 },
                { type: 'light_cruiser', offsetX: 200, offsetY: -120 },
                { type: 'heavy_battleship', offsetX: 260, offsetY: 0 },
                { type: 'light_cruiser', offsetX: 300, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 150, offsetY: 260 }
            ]
        ],
        obstacles: [
            { type: 'island_small', x: 1550, y: 460, radius: 55 },
            { type: 'oil_rig', x: 1750, y: 1280, radius: 60 },
            { type: 'island_large', x: 1950, y: 1740, radius: 75 }
        ]
    },
    {
        id: 2,
        code: 'SECTOR 02',
        name: 'RẠN SAN HÔ BÃO TÁP',
        subName: 'Coral Tempest',
        story: 'IRON TIDE triển khai phi đội tàu khu trục tên lửa chống hạm trong cơn bão. Chúng phục kích tại Rạn San Hô. Không có sự lựa chọn nào khác, Tổng Thống Sonnet hạ lệnh Đột phá ngay trong giông tố!',
        desc: 'Bão tố cuồng phong! IRON TIDE phục kích bằng tàu khu trục tên lửa giữa rạn san hô. Địch triển khai các nhóm tàu nối đuôi nhau trong giông bão.',
        tokensReward: 3,
        startingCreditsBonus: 300,
        weather: 'STORM', // Mưa bão sấm sét
        waves: [
            // Đợt 1: Đội tàu khu trục tên lửa & tuần dương hạm nhẹ
            [
                { type: 'light_cruiser', offsetX: 160, offsetY: -240 },
                { type: 'missile_destroyer', offsetX: 220, offsetY: -80 },
                { type: 'missile_destroyer', offsetX: 220, offsetY: 80 },
                { type: 'light_cruiser', offsetX: 360, offsetY: 240 },
                { type: 'light_cruiser', offsetX: 200, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 150, offsetY: 260 }
            ],
            // Đợt 2: Thiết giáp hạm kẹp sườn bởi 3 tàu khu trục tên lửa
            [
                { type: 'missile_destroyer', offsetX: 140, offsetY: -320 },
                { type: 'missile_destroyer', offsetX: 240, offsetY: -150 },
                { type: 'heavy_battleship', offsetX: 280, offsetY: 0 },
                { type: 'missile_destroyer', offsetX: 300, offsetY: 150 },
                { type: 'missile_destroyer', offsetX: 140, offsetY: 320 },
                { type: 'light_cruiser', offsetX: 200, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 150, offsetY: 200 }
            ]
        ],
        obstacles: [
            { type: 'island_large', x: 1450, y: 440, radius: 75 },
            { type: 'oil_rig', x: 1680, y: 920, radius: 60 },
            { type: 'island_small', x: 1950, y: 1280, radius: 55 },
            { type: 'island_large', x: 1600, y: 1740, radius: 75 }
        ]
    },
    {
        id: 3,
        code: 'SECTOR 03',
        name: 'VỰC THẲM BIỂN SÂU',
        subName: 'Abyssal Trench',
        story: 'Vượt qua bão tố, hạm đội bước vào vùng sương mù dày đặc tại Vực Thẳm Biển Sâu - nơi IRON TIDE đặt căn cứ tiếp nhiên liệu. Radar mờ dần, kẻ thù ẩn hiện trong màn đêm...',
        desc: 'Sương mù dày đặc làm giảm tầm quét radar của cả hai phe. IRON TIDE ẩn náu căn cứ tiếp liệu ngầm tại đây. 3 đợt tấn công nối tiếp ngày càng khốc liệt.',
        tokensReward: 4,
        startingCreditsBonus: 400,
        weather: 'HEAVY_FOG', // Sương mù dày đặc
        waves: [
            // Đợt 1
            [
                { type: 'missile_destroyer', offsetX: 160, offsetY: -260 },
                { type: 'advanced_cruiser', offsetX: 220, offsetY: 0 },
                { type: 'missile_destroyer', offsetX: 160, offsetY: 260 },
                { type: 'light_cruiser', offsetX: 120, offsetY: 0 },
                { type: 'light_cruiser', offsetX: 200, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 150, offsetY: 260 },
                { type: 'heavy_battleship', offsetX: 200, offsetY: 150 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 350 },
            ],
            // Đợt 2
            [
                { type: 'advanced_cruiser', offsetX: 150, offsetY: -280 },
                { type: 'missile_destroyer', offsetX: 190, offsetY: -120 },
                { type: 'heavy_battleship', offsetX: 260, offsetY: 0 },
                { type: 'missile_destroyer', offsetX: 190, offsetY: 120 },
                { type: 'advanced_cruiser', offsetX: 150, offsetY: 280 },
                { type: 'light_cruiser', offsetX: 200, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 150, offsetY: 260 },
            ],
            // Đợt 3
            [
                { type: 'missile_destroyer', offsetX: 120, offsetY: -350 },
                { type: 'heavy_battleship', offsetX: 100, offsetY: -150 },
                { type: 'advanced_cruiser', offsetX: 280, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 200, offsetY: 150 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 350 },
                { type: 'advanced_cruiser', offsetX: 160, offsetY: 0 },
                { type: 'light_cruiser', offsetX: 300, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 150, offsetY: 260 },
            ]
        ],
        obstacles: [
            { type: 'oil_rig', x: 1450, y: 440, radius: 60 },
            { type: 'island_small', x: 1800, y: 920, radius: 55 },
            { type: 'oil_rig', x: 1500, y: 1280, radius: 60 },
            { type: 'island_large', x: 1900, y: 1730, radius: 75 }
        ]
    },
    {
        id: 4,
        code: 'SECTOR 04',
        name: 'PHÁO ĐÀI QUẦN ĐẢO',
        subName: 'Archipelago Fortress',
        story: 'Tình báo từ Hạm Đội 3 xác nhận: IRON TIDE đang xây dựng pháo đài kiên cố trên quần đảo. Sóng lớn cuồn cuộn. Hải đồ cho thấy hàng chục hòn đảo nhỏ - cả cạm bẫy lẫn lợi thế chiến thuật!',
        desc: 'Sóng lớn dữ dội! IRON TIDE xây pháo đài giữa quần đảo. Các biên đội tuần dương hạm và thiết giáp hạm cơ động đánh phá theo 3 đợt.',
        tokensReward: 5,
        startingCreditsBonus: 600,
        weather: 'ROUGH_SEAS', // Sóng dữ dội
        waves: [
            // Đợt 1
            [
                { type: 'missile_destroyer', offsetX: 160, offsetY: -280 },
                { type: 'advanced_cruiser', offsetX: 220, offsetY: -100 },
                { type: 'advanced_cruiser', offsetX: 250, offsetY: 100 },
                { type: 'missile_destroyer', offsetX: 160, offsetY: 280 },
                { type: 'heavy_battleship', offsetX: 100, offsetY: 150 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 350 },
            ],
            // Đợt 2
            [
                { type: 'advanced_cruiser', offsetX: 160, offsetY: -260 },
                { type: 'missile_destroyer', offsetX: 200, offsetY: -120 },
                { type: 'heavy_battleship', offsetX: 70, offsetY: 0 },
                { type: 'missile_destroyer', offsetX: 250, offsetY: 120 },
                { type: 'advanced_cruiser', offsetX: 160, offsetY: 260 },
                { type: 'heavy_battleship', offsetX: 260, offsetY: -60 },
                { type: 'heavy_battleship', offsetX: 260, offsetY: 60 }
            ],
            // Đợt 3
            [
                { type: 'missile_destroyer', offsetX: 110, offsetY: -380 },
                { type: 'advanced_cruiser', offsetX: 140, offsetY: -200 },
                { type: 'heavy_battleship', offsetX: 260, offsetY: -60 },
                { type: 'heavy_battleship', offsetX: 290, offsetY: 60 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: 200 },
                { type: 'missile_destroyer', offsetX: 110, offsetY: 380 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: 150 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 350 },
            ]
        ],
        obstacles: [
            { type: 'island_large', x: 1400, y: 450, radius: 75 },
            { type: 'island_small', x: 2050, y: 460, radius: 55 },
            { type: 'oil_rig', x: 1700, y: 920, radius: 60 },
            { type: 'island_small', x: 1450, y: 1280, radius: 55 },
            { type: 'island_large', x: 1950, y: 1730, radius: 75 }
        ]
    },
    {
        id: 5,
        code: 'SECTOR 05 💀 BOSS 1',
        name: 'VÙNG NƯỚC TỬ THẦN (BOSS KRAKEN)',
        subName: 'Maelstrom Dreadnought',
        story: 'Chỉ huy tối cao của IRON TIDE điều động vũ khí bí mật: Siêu Thiết giáp hạm KRAKEN - Đô Đốc Hạm Đội Duxe trực tiếp hạ lệnh tiêu diệt kẻ thù',
        desc: 'Đại chiến Trùm Boss 1! Siêu Thiết giáp hạm KRAKEN của IRON TIDE xuất hiện trong giông bão cùng đội hộ vệ hùng hậu. Tiêu diệt KRAKEN để giải phóng vùng biển phía Nam!',
        tokensReward: 6,
        startingCreditsBonus: 1200,
        weather: 'STORM',
        waves: [
            // Đợt 1: Tiền trạm
            [
                { type: 'missile_destroyer', offsetX: 160, offsetY: -300 },
                { type: 'advanced_cruiser', offsetX: 200, offsetY: -100 },
                { type: 'advanced_cruiser', offsetX: 200, offsetY: 100 },
                { type: 'missile_destroyer', offsetX: 160, offsetY: 300 },
                { type: 'heavy_battleship', offsetX: 200, offsetY: 150 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 350 },
            ],
            // Đợt 2: Hộ vệ hạm
            [
                { type: 'advanced_cruiser', offsetX: 150, offsetY: -280 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: -120 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: 120 },
                { type: 'advanced_cruiser', offsetX: 150, offsetY: 280 },
                { type: 'missile_destroyer', offsetX: 180, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 200, offsetY: 150 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 350 },
            ],
            // Đợt 3: ĐẠI CHIẾN TRÙM KRAKEN XUẤT HIỆN!
            [
                { type: 'missile_destroyer', offsetX: 120, offsetY: -420 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: -260 },
                { type: 'heavy_battleship', offsetX: 240, offsetY: -120 },
                { type: 'dreadnought_boss', offsetX: 350, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 240, offsetY: 120 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: 260 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 420 },
                { type: 'heavy_battleship', offsetX: 200, offsetY: 150 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 350 },
            ]
        ],
        obstacles: [
            { type: 'island_small', x: 1500, y: 440, radius: 55 },
            { type: 'island_small', x: 2050, y: 440, radius: 55 },
            { type: 'oil_rig', x: 1750, y: 920, radius: 60 },
            { type: 'oil_rig', x: 1500, y: 1280, radius: 60 },
            { type: 'island_small', x: 1950, y: 1740, radius: 55 }
        ]
    },
    {
        id: 6,
        code: 'SECTOR 06',
        name: 'VỊNH BĂNG TÀNG HÌNH',
        subName: 'Stealth Ice Strait',
        story: 'Sau khi KRAKEN bị bắn chìm, tàn quân IRON TIDE rút lui về eo biển băng giá phía Bắc. Tại đây, chúng bất ngờ tung ra Tàu Sân Bay Chiến Lược tàng hình trang bị phi đội tiêm kích tập kích tầm xa!',
        desc: 'Màn sương mù lạnh giá che khuất tầm nhìn. Lần đầu tiên đối đầu với TÀU SÂN BAY ĐỊCH (Enemy Carrier) với khả năng tung phi đội máy bay không kích ném bom hạm đội!',
        tokensReward: 6,
        startingCreditsBonus: 1400,
        weather: 'HEAVY_FOG',
        waves: [
            // Đợt 1: Trinh sát tàng hình
            [
                { type: 'light_cruiser', offsetX: 160, offsetY: -280 },
                { type: 'missile_destroyer', offsetX: 200, offsetY: -120 },
                { type: 'missile_destroyer', offsetX: 200, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 160, offsetY: 280 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: 0 },
            ],
            // Đợt 2: Tàu sân bay địch xuất kích đợt đầu!
            [
                { type: 'missile_destroyer', offsetX: 150, offsetY: -320 },
                { type: 'advanced_cruiser', offsetX: 210, offsetY: -160 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: 0 },
                { type: 'advanced_cruiser', offsetX: 210, offsetY: 160 },
                { type: 'missile_destroyer', offsetX: 150, offsetY: 320 },
                { type: 'dreadnought_boss', offsetX: 350, offsetY: 0 },
            ],
            // Đợt 3: Hạm đội tấn công phối hợp hỏa lực
            [
                { type: 'missile_destroyer', offsetX: 130, offsetY: -380 },
                { type: 'heavy_battleship', offsetX: 220, offsetY: -180 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: 0 },
                { type: 'enemy_carrier', offsetX: 110, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 220, offsetY: 180 },
                { type: 'missile_destroyer', offsetX: 130, offsetY: 380 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: 0 },
                { type: 'dreadnought_boss', offsetX: 350, offsetY: 0 },
            ]
        ],
        obstacles: [
            { type: 'island_large', x: 1450, y: 440, radius: 75 },
            { type: 'oil_rig', x: 1850, y: 920, radius: 60 },
            { type: 'island_small', x: 1500, y: 1280, radius: 55 },
            { type: 'island_large', x: 1950, y: 1740, radius: 75 }
        ]
    },
    {
        id: 7,
        code: 'SECTOR 07',
        name: 'EO BIỂN LỬA ĐỎ',
        subName: 'Crimson Chokepoint',
        story: 'Hạm đội tiến vào Eo Biển Lửa Đỏ - hành lang chiến lược bị kiểm soát bởi pháo đài ven biển và các cụm tàu sân bay tuần tra của IRON TIDE. Sóng gió gầm vang trong sắc trời đỏ rực.',
        desc: 'Bão lửa rực cháy! Kẻ địch huy động các cụm tác chiến tàu sân bay kết hợp thiết giáp hạm hạng nặng nối đuôi nhau tràn qua eo biển hẹp.',
        tokensReward: 7,
        startingCreditsBonus: 1600,
        weather: 'STORM',
        waves: [
            // Đợt 1: Tuần dương hỏa lực cao
            [
                { type: 'missile_destroyer', offsetX: 160, offsetY: -320 },
                { type: 'advanced_cruiser', offsetX: 210, offsetY: -140 },
                { type: 'advanced_cruiser', offsetX: 210, offsetY: 140 },
                { type: 'missile_destroyer', offsetX: 160, offsetY: 320 },
                { type: 'heavy_battleship', offsetX: 270, offsetY: 0 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: 0 },
            ],
            // Đợt 2: Cụm tàu sân bay & hộ vệ
            [
                { type: 'missile_destroyer', offsetX: 140, offsetY: -360 },
                { type: 'heavy_battleship', offsetX: 220, offsetY: -180 },
                { type: 'enemy_carrier', offsetX: 310, offsetY: -60 },
                { type: 'enemy_carrier', offsetX: 310, offsetY: 60 },
                { type: 'heavy_battleship', offsetX: 220, offsetY: 180 },
                { type: 'missile_destroyer', offsetX: 140, offsetY: 360 },
                { type: 'dreadnought_boss', offsetX: 350, offsetY: 0 },
            ],
            // Đợt 3: Đợt tổng lực eo biển
            [
                { type: 'advanced_cruiser', offsetX: 160, offsetY: -380 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: -200 },
                { type: 'enemy_carrier', offsetX: 330, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: 200 },
                { type: 'advanced_cruiser', offsetX: 160, offsetY: 380 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: -100 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 100 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: 0 },
                { type: 'dreadnought_boss', offsetX: 350, offsetY: 0 },
            ]
        ],
        obstacles: [
            { type: 'island_small', x: 1400, y: 450, radius: 55 },
            { type: 'oil_rig', x: 1750, y: 920, radius: 60 },
            { type: 'island_large', x: 2050, y: 1280, radius: 75 },
            { type: 'island_small', x: 1600, y: 1740, radius: 55 }
        ]
    },
    {
        id: 8,
        code: 'SECTOR 08 💀 BOSS 2',
        name: 'ĐẠI CHIẾN HẠM ĐỘI HẮC HẢI',
        subName: 'Black Tide Armada',
        story: 'Tổng chỉ huy Hắc Hải của IRON TIDE xuất trận! Hắn thống lĩnh liên minh Hạm đội Tàu Sân Bay cùng Siêu Thiết giáp hạm KRAKEN hộ tống. Đây là bức tường thép bảo vệ căn cứ ngầm tối mật.',
        desc: 'Đại chiến Trùm Boss 2! Trận huyết chiến chống lại Siêu Thiết Giáp Hạm cùng song sát Tàu Sân Bay Địch. Bão tố dữ dội và những làn sóng không kích hủy diệt liên tiếp!',
        tokensReward: 8,
        startingCreditsBonus: 1800,
        weather: 'STORM',
        waves: [
            // Đợt 1: Tiền tiêu Hắc Hải
            [
                { type: 'missile_destroyer', offsetX: 160, offsetY: -320 },
                { type: 'advanced_cruiser', offsetX: 220, offsetY: -120 },
                { type: 'advanced_cruiser', offsetX: 220, offsetY: 120 },
                { type: 'missile_destroyer', offsetX: 160, offsetY: 320 },
                { type: 'dreadnought_boss', offsetX: 350, offsetY: 0 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: -220 },
            ],
            // Đợt 2: Song sát tàu sân bay xuất kích
            [
                { type: 'advanced_cruiser', offsetX: 160, offsetY: -320 },
                { type: 'enemy_carrier', offsetX: 290, offsetY: -150 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: 0 },
                { type: 'enemy_carrier', offsetX: 290, offsetY: 150 },
                { type: 'advanced_cruiser', offsetX: 160, offsetY: 320 },
                { type: 'dreadnought_boss', offsetX: 350, offsetY: 0 },
            ],
            // Đợt 3: Đợt tăng viện giáp thép
            [
                { type: 'missile_destroyer', offsetX: 140, offsetY: -380 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: -200 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: 200 },
                { type: 'missile_destroyer', offsetX: 140, offsetY: 380 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: 0 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: -220 },
            ],
            // Đợt 4: ĐẠI TRÙM KRAKEN + 2 TÀU SÂN BAY TỔNG TẤN CÔNG!
            [
                { type: 'missile_destroyer', offsetX: 120, offsetY: -420 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: -220 },
                { type: 'heavy_battleship', offsetX: 220, offsetY: -100 },
                { type: 'dreadnought_boss', offsetX: 380, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 220, offsetY: 100 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: 220 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 420 },
                { type: 'advanced_cruiser', offsetX: 170, offsetY: 0 },
                { type: 'dreadnought_boss', offsetX: 350, offsetY: 0 },
            ]
        ],
        obstacles: [
            { type: 'island_large', x: 1450, y: 440, radius: 75 },
            { type: 'island_small', x: 2000, y: 450, radius: 55 },
            { type: 'oil_rig', x: 1650, y: 920, radius: 60 },
            { type: 'oil_rig', x: 1950, y: 1280, radius: 60 },
            { type: 'island_large', x: 1500, y: 1740, radius: 75 }
        ]
    },
    {
        id: 9,
        code: 'SECTOR 09',
        name: 'CĂN CỨ NGẦM PHANTOM OMEGA',
        subName: 'Shadow Base Omega',
        story: 'Sau khi đập tan Hạm Đội Hắc Hải, tọa độ của Căn Cứ Ngầm Phantom Omega đã lộ diện. Đây là sào huyệt sâu nhất dưới lòng đại dương nơi IRON TIDE sản xuất vũ khí tận thế.',
        desc: 'Căn cứ ngầm tối mật được bảo vệ bởi 4 đợt phòng thủ dày đặc với thiết giáp hạm hạng nặng, tàu sân bay và mạng lưới tên lửa. Sương mù dày đặc bao trùm!',
        tokensReward: 9,
        startingCreditsBonus: 2200,
        weather: 'HEAVY_FOG',
        waves: [
            // Đợt 1: Đội lính gác cửa ngầm
            [
                { type: 'light_cruiser', offsetX: 170, offsetY: -300 },
                { type: 'missile_destroyer', offsetX: 220, offsetY: -120 },
                { type: 'missile_destroyer', offsetX: 220, offsetY: 120 },
                { type: 'light_cruiser', offsetX: 170, offsetY: 300 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: -220 },
                { type: 'enemy_carrier', offsetX: 100, offsetY: -220 },
                { type: 'dreadnought_boss', offsetX: 390, offsetY: 0 },
            ],
            // Đợt 2: Phòng thủ tầng giữa
            [
                { type: 'missile_destroyer', offsetX: 160, offsetY: -340 },
                { type: 'advanced_cruiser', offsetX: 220, offsetY: -160 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: 0 },
                { type: 'advanced_cruiser', offsetX: 220, offsetY: 160 },
                { type: 'missile_destroyer', offsetX: 160, offsetY: 340 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: -220 },
                { type: 'enemy_carrier', offsetX: 100, offsetY: -220 },
                { type: 'dreadnought_boss', offsetX: 390, offsetY: 0 },
            ],
            // Đợt 3: Quân đoàn nòng cốt căn cứ ngầm
            [
                { type: 'advanced_cruiser', offsetX: 150, offsetY: -320 },
                { type: 'heavy_battleship', offsetX: 240, offsetY: -160 },
                { type: 'heavy_battleship', offsetX: 240, offsetY: 160 },
                { type: 'advanced_cruiser', offsetX: 150, offsetY: 320 },
                { type: 'missile_destroyer', offsetX: 180, offsetY: 0 },
                { type: 'enemy_carrier', offsetX: 300, offsetY: -220 },
                { type: 'enemy_carrier', offsetX: 100, offsetY: -220 },
                { type: 'dreadnought_boss', offsetX: 390, offsetY: 0 },
            ],
            // Đợt 4: Tổng chỉ huy Phantom + Tàu sân bay + Thiết giáp hạm
            [
                { type: 'missile_destroyer', offsetX: 130, offsetY: -420 },
                { type: 'heavy_battleship', offsetX: 220, offsetY: -240 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: -100 },
                { type: 'dreadnought_boss', offsetX: 390, offsetY: 0 },
                { type: 'dreadnought_boss', offsetX: 190, offsetY: 0 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: 100 },
                { type: 'heavy_battleship', offsetX: 220, offsetY: 240 },
                { type: 'missile_destroyer', offsetX: 130, offsetY: 420 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: 0 }
            ]
        ],
        obstacles: [
            { type: 'island_small', x: 1450, y: 440, radius: 55 },
            { type: 'oil_rig', x: 1800, y: 450, radius: 60 },
            { type: 'island_large', x: 2050, y: 920, radius: 75 },
            { type: 'oil_rig', x: 1500, y: 1280, radius: 60 },
            { type: 'island_small', x: 1850, y: 1740, radius: 55 }
        ]
    },
    {
        id: 10,
        code: 'SECTOR 10 ★ FINAL',
        name: 'BÌNH MINH THẦN SẤM - TRẬN CHIẾN TỐI HẬU',
        subName: 'Operation Thunder Dawn - Endgame',
        story: 'Đây là giờ khắc quyết định vận mệnh toàn cầu. IRON TIDE dồn toàn bộ tàn lực vào Siêu Trùm Ghép Đôi KRAKEN TITAN FUSION cùng đại hạm đội tàu sân bay và thiết giáp hạm. Bình minh đang hé rạng - và Citadel sẽ là ánh sáng diệt sạch bóng tối!',
        desc: 'Trận chiến cuối cùng! 5 đợt đại chiến vô tiền khoáng hậu với Siêu Trùm KRAKEN TITAN FUSION, các cụm Tàu Sân Bay Địch và hàng chục chiến hạm hộ vệ. Đỉnh cao thử thách chiến thuật!',
        tokensReward: 12,
        startingCreditsBonus: 2500,
        weather: 'ROUGH_SEAS', // Sóng dữ dội tối đa
        waves: [
            // Đợt 1: Tiền phong cảm tử
            [
                { type: 'missile_destroyer', offsetX: 170, offsetY: -350 },
                { type: 'light_cruiser', offsetX: 200, offsetY: -160 },
                { type: 'advanced_cruiser', offsetX: 240, offsetY: 0 },
                { type: 'dreadnought_boss', offsetX: 390, offsetY: 0 },
                { type: 'light_cruiser', offsetX: 200, offsetY: 160 },
                { type: 'missile_destroyer', offsetX: 170, offsetY: 350 }
            ],
            // Đợt 2: Cụm tàu sân bay & thiết giáp hạm
            [
                { type: 'missile_destroyer', offsetX: 150, offsetY: -380 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: -200 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: 200 },
                { type: 'missile_destroyer', offsetX: 150, offsetY: 380 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: 0 },
                { type: 'dreadnought_boss', offsetX: 390, offsetY: 0 },
            ],
            // Đợt 3: KRAKEN TIÊN PHONG + Tàu sân bay
            [
                { type: 'missile_destroyer', offsetX: 140, offsetY: -420 },
                { type: 'enemy_carrier', offsetX: 290, offsetY: -240 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: -120 },
                { type: 'dreadnought_boss', offsetX: 370, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 230, offsetY: 120 },
                { type: 'advanced_cruiser', offsetX: 190, offsetY: 240 },
                { type: 'missile_destroyer', offsetX: 140, offsetY: 420 },
                { type: 'dreadnought_boss', offsetX: 390, offsetY: 0 },
            ],
            // Đợt 4: SONG SÁT TÀU SÂN BAY + KRAKEN HỘ TỐNG
            [
                { type: 'advanced_cruiser', offsetX: 160, offsetY: -420 },
                { type: 'enemy_carrier', offsetX: 310, offsetY: -220 },
                { type: 'heavy_battleship', offsetX: 240, offsetY: -100 },
                { type: 'dreadnought_boss', offsetX: 380, offsetY: 0 },
                { type: 'heavy_battleship', offsetX: 240, offsetY: 100 },
                { type: 'enemy_carrier', offsetX: 310, offsetY: 220 },
                { type: 'advanced_cruiser', offsetX: 160, offsetY: 420 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 0 },
                { type: 'dreadnought_boss', offsetX: 390, offsetY: 0 },
            ],
            // Đợt 5: KRAKEN TITAN FUSION - SIÊU TRÙM GHÉP ĐÔI CUỐI CÙNG!
            [
                { type: 'missile_destroyer', offsetX: 120, offsetY: -460 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: -320 },
                { type: 'heavy_battleship', offsetX: 240, offsetY: -180 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: -90 },
                { type: 'super_boss_titan', offsetX: 430, offsetY: -300 },
                { type: 'advanced_cruiser', offsetX: 180, offsetY: 90 },
                { type: 'heavy_battleship', offsetX: 240, offsetY: 180 },
                { type: 'enemy_carrier', offsetX: 320, offsetY: 320 },
                { type: 'missile_destroyer', offsetX: 120, offsetY: 460 },
                { type: 'super_boss_titan', offsetX: 100, offsetY: 200 },
            ]
        ],
        obstacles: [
            { type: 'island_large', x: 1450, y: 440, radius: 75 },
            { type: 'island_small', x: 2100, y: 450, radius: 55 },
            { type: 'oil_rig', x: 1750, y: 920, radius: 60 },
            { type: 'oil_rig', x: 1450, y: 1280, radius: 60 },
            { type: 'island_small', x: 2000, y: 1280, radius: 55 },
            { type: 'island_large', x: 1800, y: 1740, radius: 75 }
        ]
    }
];

/**
 * Sinh ngẫu nhiên đợt địch cho Chế Độ Sinh Tồn Vô Tận (Endless Survival Mode)
 */
export function generateEndlessWave(waveNumber) {
    const fleet = [];
    const count = Math.min(10, 3 + Math.floor(waveNumber * 0.8));

    // Cứ mỗi 5 đợt sẽ xuất hiện 1 Siêu Boss KRAKEN
    const isBossWave = (waveNumber % 5 === 0);

    if (isBossWave) {
        fleet.push({ type: 'dreadnought_boss', offsetX: 260, offsetY: 0 });
        if (waveNumber >= 10) {
            fleet.push({ type: 'enemy_carrier', offsetX: 200, offsetY: -200 });
            fleet.push({ type: 'super_boss_titan', offsetX: 200, offsetY: 200 });
        } else {
            fleet.push({ type: 'advanced_cruiser', offsetX: 80, offsetY: -240 });
            fleet.push({ type: 'advanced_cruiser', offsetX: 80, offsetY: 240 });
        }
        for (let i = 0; i < Math.min(4, waveNumber); i++) {
            const side = (i % 2 === 0 ? -1 : 1);
            fleet.push({ type: 'missile_destroyer', offsetX: -80, offsetY: side * (320 + i * 40) });
        }
    } else {
        const types = ['light_cruiser', 'missile_destroyer', 'heavy_battleship', 'advanced_cruiser'];
        if (waveNumber >= 4) {
            types.push('enemy_carrier');
        }
        const maxTypeIdx = Math.min(types.length - 1, 1 + Math.floor(waveNumber / 2));

        for (let i = 0; i < count; i++) {
            const chosenType = types[Math.floor(Math.random() * (maxTypeIdx + 1))];
            const side = (i % 2 === 0 ? -1 : 1);
            const distY = side * (70 + i * 75);
            const distX = (Math.random() * 180 - 90);
            fleet.push({ type: chosenType, offsetX: distX, offsetY: distY });
        }
    }

    return {
        waveNumber,
        isBossWave,
        fleet,
        bountyReward: 350 + waveNumber * 120
    };
}
