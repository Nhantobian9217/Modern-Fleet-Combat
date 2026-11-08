/**
 * BootScene.js - Nạp tài nguyên & Khởi tạo Đồ họa Vector Độ nét siêu cao
 *
 * Phiên bản nâng cấp toàn diện:
 * 1. Tàu sân bay CVN-78: Boong phóng catapult rõ hơn, tháp đảo Island đồ sộ, anten radar,
 *    số hiệu CVN-78 nổi bật, đường tâm đường băng chéo, cáp hãm đà 3 sợi đỏ
 * 2. Tiêm kích F-35C: Chi tiết hơn, buồng lái rõ, động cơ phát sáng vàng cam
 * 3. Khu trục Arleigh Burke: Cột mast cao, 2 ống phóng ngư lôi ngang
 * 4. Tuần dương Ticonderoga: VLS trước và sau, ống khói đặc trưng
 * 5. Trùm KRAKEN: 4 tháp pháo lớn, lò phản ứng phát sáng đỏ thẫm
 * 6. Đại dương: Sóng gợn tinh tế hơn, màu sâu thẳm hơn
 * 7. Đảo lớn: Bãi cát vàng viền, lõi đá xám, núi rừng xanh
 * 8. Giàn khoan: Nền tảng kim loại rõ hơn, cần khoan cao, lửa đốt khí cam
 * 9. Texture MỚI: smoke_puff, explosion_flash, torpedo
 * 10. Loading screen đẹp hơn với progress bar "ĐANG TẢI HỆ THỐNG VŨ KHÍ HẢI QUÂN..."
 */

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- Nền loading screen tối ---
        const bg = this.add.graphics();
        bg.fillStyle(0x060d1a, 1);
        bg.fillRect(0, 0, width, height);

        // --- Tiêu đề hệ thống ---
        this.add.text(width / 2, height / 2 - 70, '⚓  HẢI QUÂN HIỆN ĐẠI  ⚓', {
            fontFamily: 'system-ui, -apple-system, monospace',
            fontSize: '22px',
            color: '#00d2ff',
            fontStyle: 'bold',
            stroke: '#003a5c',
            strokeThickness: 4
        }).setOrigin(0.5);

        // --- Label progress bar ---
        this.add.text(width / 2, height / 2 - 20, 'ĐANG TẢI HỆ THỐNG VŨ KHÍ HẢI QUÂN...', {
            fontFamily: 'system-ui, -apple-system, monospace',
            fontSize: '13px',
            color: '#74b9ff',
            fontStyle: 'bold',
            letterSpacing: 2
        }).setOrigin(0.5);

        // --- NẠP TOÀN BỘ FILE ÂM THANH (AUDIO ASSETS) TỪ THƯ MỤC ASSETS/AUDIO ---
        this.load.audio('sound_bgm_battlefield', 'assets/audio/sound_bgm_battlefield.mp3');
        this.load.audio('sound_bgm_boss', 'assets/audio/sound_bgm_boss.mp3');
        this.load.audio('sound_bgm_man_1', 'assets/audio/sound_bgm_man_1.mp3');
        this.load.audio('sound_bgm_man_cuoi', 'assets/audio/sound_bgm_man_cuoi.mp3');
        this.load.audio('sound_bgm_man_dac_biet', 'assets/audio/sound_bgm_man_dac_biet.mp3');
        this.load.audio('sound_bgm_man_hinh_chinh', 'assets/audio/sound_bgm_man_hinh_chinh.mp3');
        this.load.audio('music_game_lost', 'assets/audio/music_game_lost.ogg');
        this.load.audio('music_game_won', 'assets/audio/music_game_won.ogg');

        this.load.audio('sound_sfx_click', 'assets/audio/sound_sfx_click.mp3');
        this.load.audio('sound_sfx_destination', 'assets/audio/sound_sfx_destination.mp3');
        this.load.audio('sound_sfx_equip', 'assets/audio/sound_sfx_equip.mp3');
        this.load.audio('sound_sfx_missile', 'assets/audio/sound_sfx_missile.mp3');
        this.load.audio('sound_sfx_plane', 'assets/audio/sound_sfx_plane.mp3');
        this.load.audio('sound_sfx_unit', 'assets/audio/sound_sfx_unit.mp3');
        this.load.audio('sound_sfx_upgrade', 'assets/audio/sound_sfx_upgrade.mp3');
        this.load.audio('sound_sfx_star_1', 'assets/audio/sound_sfx_star_1.mp3');
        this.load.audio('sound_sfx_star_2', 'assets/audio/sound_sfx_star_2.mp3');
        this.load.audio('sound_sfx_star_3', 'assets/audio/sound_sfx_star_3.mp3');

        // --- NẠP HÌNH ẢNH CHIẾN HẠM, THÁP PHÁO VÀ TÊN LỬA TỪ ASSETS/ ---
        // 1. Thân tàu chiến
        this.load.image('campaign_fortress_hull', 'assets/ships/citadel/citadel.png');
        this.load.image('citadel_radar_dish', 'assets/ships/citadel/Radar_Dish.png');
        this.load.image('carrier_hull', 'assets/ships/cvn78/Ford.png');
        this.load.image('ally_frigate_hull', 'assets/ships/constallation/ffg_Body.png');
        this.load.image('ally_destroyer_hull', 'assets/ships/arleghiburke/Arleigh_Body.png');
        this.load.image('ally_cruiser_hull', 'assets/ships/Ticonderoga/Ticonderoga_Body.png');
        this.load.image('ally_battleship_hull', 'assets/ships/missouri/Missouri_Body.png');

        // 2. Tháp pháo tùy chỉnh (Custom Image Turrets theo INI)
        this.load.image('turret_frigate', 'assets/ships/constallation/ffg_Cannon.png');
        this.load.image('turret_destroyer', 'assets/ships/arleghiburke/Arleigh_Cannon.png');
        this.load.image('turret_cruiser_1', 'assets/ships/Ticonderoga/Cannon1.png');
        this.load.image('turret_cruiser_2', 'assets/ships/Ticonderoga/Cannon2.png');
        this.load.image('turret_battleship_1', 'assets/ships/missouri/Cannon1.png');
        this.load.image('turret_battleship_2', 'assets/ships/missouri/Cannon2.png');
        this.load.image('turret_battleship_3', 'assets/ships/missouri/Cannon3.png');

        // 3. Hệ thống tên lửa mới
        this.load.image('missile_cps', 'assets/weapons/missile/CPS.png');
        this.load.image('missile_harpoon3', 'assets/weapons/missile/Harpoon_block_3.png');
        this.load.image('missile_nsm', 'assets/weapons/missile/NSM.png');
        this.load.image('missile_agm84', 'assets/weapons/missile/Agm_84.png');
        this.load.image('missile_tomahawk4', 'assets/weapons/missile/tomahawk_block_4.png');
        this.load.image('missile_rim116', 'assets/weapons/missile/rim116.png');
        this.load.image('missile_rim162', 'assets/weapons/missile/rim162.png');
        this.load.image('missile_sm3', 'assets/weapons/missile/SM3_Block2a.png');
        this.load.image('missile_sm6', 'assets/weapons/missile/SM6_Block1b.png');

        // --- Khung progress bar ---
        const barBg = this.add.graphics();
        barBg.lineStyle(2, 0x00d2ff, 0.6);
        barBg.strokeRect(width / 2 - 162, height / 2 + 6, 324, 18);
        barBg.fillStyle(0x0a1929, 1);
        barBg.fillRect(width / 2 - 161, height / 2 + 7, 322, 16);

        // --- Thanh tiến trình fill ---
        const barFill = this.add.graphics();
        barFill.fillStyle(0x00d2ff, 1);
        barFill.fillRect(width / 2 - 160, height / 2 + 8, 320, 14);

        // --- Ánh sáng lướt trên thanh ---
        const shine = this.add.graphics();
        shine.fillStyle(0xffffff, 0.18);
        shine.fillRect(width / 2 - 160, height / 2 + 8, 320, 6);

        // --- Phiên bản build ---
        this.add.text(width / 2, height / 2 + 42, 'v.3667 — VAR COMBAT READY', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#2d6a8a'
        }).setOrigin(0.5);
    }

    create() {
        this.generateProceduralAssets();
        this.scene.start('TitleScene');
    }

    /**
     * Tạo toàn bộ texture thủ công bằng Phaser Graphics API.
     * Không dùng file ảnh ngoài — mọi thứ đều được vẽ bằng vector.
     */
    generateProceduralAssets() {
        this._genCarrierHull();
        this._genTwinFortressHull();
        this._genAllyFrigate();
        this._genAllyBattleship();
        this._genParkedJet();
        this._genCarrierTurretSmall();
        this._genMissiles();
        this._genFighterJet();
        this._genAdvancedFighterJets();
        this._genEnemyJet();
        this._genAllyDestroyer();
        this._genAllyCruiser();
        this._genAllyTurret();
        this._genEnemyCruiser();
        this._genEnemyMissileDestroyer();
        this._genEnemyAdvancedCruiser();
        this._genEnemyBattleship();
        this._genEnemyBossHull();
        this._genEnemySuperBossHull();
        this._genEnemyCarrierHull();
        this._genEnemyTurret();
        this._genIslandLarge();
        this._genIslandSmall();
        this._genOilRig();
        this._genWeatherParticles();
        this._genBullets();
        this._genOceanTile();
        // Texture mới
        this._genSmokePuff();
        this._genExplosionFlash();
        this._genTorpedo();
        this._genCombatJuiceEffects();
    }

    // ============================================================
    // 1. TÀU SÂN BAY HẠT NHÂN CVN-78 GERALD R. FORD (80x190 px)
    //    Nâng cấp: boong catapult rõ hơn, tháp đảo Island đồ sộ,
    //    anten radar chi tiết, số hiệu CVN-78, đường băng chéo,
    //    cáp hãm đà 3 sợi đỏ, đuôi tàu đặc trưng
    // ============================================================
    _genCarrierHull() {
        if (this.textures.exists('carrier_hull')) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // -- Thân tàu chính --
        g.fillStyle(0x1a2634, 1);
        g.lineStyle(2.5, 0x00d2ff, 0.95);
        g.beginPath();
        g.moveTo(40, 4);
        g.lineTo(72, 32);
        g.lineTo(76, 150);
        g.lineTo(60, 183);
        g.lineTo(14, 183);
        g.lineTo(4, 128);
        g.lineTo(8, 32);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // -- Mặt sàn đường băng cao su chống trượt --
        g.fillStyle(0x243342, 1);
        g.fillRect(16, 14, 48, 162);

        // -- Vạch kẻ sàn đường băng (Deck markings) --
        g.lineStyle(1, 0x2e4158, 0.6);
        for (let y = 30; y < 175; y += 18) {
            g.lineBetween(17, y, 63, y);
        }

        // -- Máy phóng Catapult 1 (dọc giữa, vàng đậm) --
        g.lineStyle(3, 0xf1c40f, 1);
        g.beginPath();
        g.moveTo(40, 10);
        g.lineTo(40, 80);
        g.strokePath();

        // -- Máy phóng Catapult 2 (dọc mạn trái, ngắn hơn) --
        g.lineStyle(2.5, 0xe67e22, 0.9);
        g.beginPath();
        g.moveTo(24, 22);
        g.lineTo(24, 75);
        g.strokePath();

        // -- BỆ PHÓNG TÊN LỬA TOMAHAWK VLS (SLOT 3 - Đuôi mạn phải) --
        g.fillStyle(0x0e2439, 1);
        g.lineStyle(1.5, 0x00d2ff, 1);
        g.fillRect(52, 140, 16, 22);
        g.strokeRect(52, 140, 16, 22);
        g.fillStyle(0x00f2fe, 0.85);
        for (let vx = 0; vx < 2; vx++) {
            for (let vy = 0; vy < 3; vy++) {
                g.fillRect(54 + vx * 6, 143 + vy * 6, 4, 4);
            }
        }

        // -- ĐẾ 2 THÁP PHÁO TỰ VỆ MARK 45 (SLOT 1 mạn trái & SLOT 2 mạn phải) --
        g.fillStyle(0x34495e, 1);
        g.lineStyle(1.5, 0x00d2ff, 0.9);
        g.fillCircle(18, 105, 8); // Đế pháo mạn trái
        g.strokeCircle(18, 105, 8);
        g.fillCircle(65, 55, 8);  // Đế pháo mạn phải
        g.strokeCircle(65, 55, 8);

        // -- VỊ TRÍ HANGAR KHOANG MÁY BAY (SLOT 4) --
        g.lineStyle(1.5, 0xf1c40f, 0.8);
        g.strokeRect(18, 85, 24, 50);

        // -- Đường tâm đường băng hạ cánh chéo (Angled deck centerline) --
        g.lineStyle(2, 0xffffff, 0.75);
        g.beginPath();
        g.moveTo(20, 178);
        g.lineTo(38, 52);
        g.strokePath();

        // -- Vạch kẻ đứt đoạn trên đường băng hạ cánh --
        g.lineStyle(1.5, 0xffffff, 0.55);
        for (let i = 0; i < 7; i++) {
            const y0 = 170 - i * 18;
            const y1 = y0 - 10;
            const x0 = 20 + (170 - y0) * 0.16;
            const x1 = 20 + (170 - y1) * 0.16;
            g.lineBetween(x0, y0, x1, y1);
        }

        // -- Cáp hãm đà (Arresting wires) 3 sợi đỏ ngang đuôi tàu --
        g.lineStyle(2, 0xe74c3c, 0.95);
        g.lineBetween(18, 145, 52, 151);
        g.lineBetween(18, 154, 52, 160);
        g.lineBetween(18, 163, 52, 169);

        // -- Thang máy nâng máy bay mạn phải (Deck elevator) --
        g.fillStyle(0x34495e, 1);
        g.lineStyle(1, 0x00d2ff, 0.5);
        g.fillRect(68, 46, 10, 24);
        g.strokeRect(68, 46, 10, 24);
        g.fillRect(68, 108, 10, 24);
        g.strokeRect(68, 108, 10, 24);

        // -- Thang máy mạn trái --
        g.fillRect(2, 70, 10, 20);
        g.strokeRect(2, 70, 10, 20);

        // -- Tháp đảo Island Superstructure (đồ sộ hơn) --
        g.fillStyle(0x4b6584, 1);
        g.lineStyle(2, 0x00d2ff, 1);
        g.fillRoundedRect(59, 85, 17, 52, 4);
        g.strokeRoundedRect(59, 85, 17, 52, 4);

        // Cửa sổ tháp
        g.fillStyle(0x00d2ff, 0.5);
        g.fillRect(62, 90, 11, 4);
        g.fillRect(62, 97, 11, 4);
        g.fillRect(62, 104, 11, 4);

        // -- Anten radar mảng pha 3D --
        g.fillStyle(0x00f2fe, 1);
        g.fillCircle(67, 82, 5);
        g.lineStyle(1.5, 0x00f2fe, 1);
        g.lineBetween(67, 77, 67, 68);   // cột anten
        g.lineBetween(62, 70, 72, 70);   // arm ngang
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(62, 70, 1.5);
        g.fillCircle(72, 70, 1.5);

        // -- Cần anten phụ (nhỏ) --
        g.lineStyle(1, 0x74b9ff, 0.7);
        g.lineBetween(63, 82, 58, 76);
        g.lineBetween(71, 82, 76, 76);

        // -- Số hiệu "CVN-78" trên boong (pixel art) --
        // Chữ "78" bằng fillRect thủ công
        g.fillStyle(0xffffff, 0.95);
        // Số 7
        g.fillRect(22, 24, 8, 2);
        g.fillRect(28, 24, 2, 5);
        g.fillRect(22, 29, 8, 2);
        // Số 8
        g.fillRect(34, 24, 8, 2);
        g.fillRect(34, 24, 2, 8);
        g.fillRect(40, 24, 2, 8);
        g.fillRect(34, 28, 8, 2);
        g.fillRect(34, 30, 2, 8);
        g.fillRect(40, 30, 2, 8);
        g.fillRect(34, 30, 8, 2);

        // -- Đuôi tàu đặc trưng (stern details) --
        g.fillStyle(0x2c3e50, 1);
        g.fillRect(20, 175, 36, 6);
        g.lineStyle(1, 0x00d2ff, 0.4);
        g.lineBetween(20, 176, 56, 176);
        g.lineBetween(20, 179, 56, 179);

        // -- Chân vịt / screw indicator --
        g.fillStyle(0x1abc9c, 0.7);
        g.fillCircle(30, 182, 3);
        g.fillCircle(46, 182, 3);

        g.generateTexture('carrier_hull', 80, 190);
        g.destroy();
    }

    // ============================================================
    // 2. MINI TIÊM KÍCH ĐỖ TRÊN BOONG (20x20 px)
    //    Nâng cấp: cánh tam giác delta rõ nét, buồng lái nhỏ
    // ============================================================
    _genParkedJet() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Thân chính
        g.fillStyle(0x57606f, 1);
        g.lineStyle(1, 0x00d2ff, 0.8);
        g.beginPath();
        g.moveTo(10, 1);    // Mũi
        g.lineTo(16, 9);
        g.lineTo(18, 16);   // Cánh phải sau
        g.lineTo(13, 18);
        g.lineTo(10, 17);   // Đuôi
        g.lineTo(7, 18);
        g.lineTo(2, 16);    // Cánh trái sau
        g.lineTo(4, 9);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Cánh delta rõ nét
        g.fillStyle(0x434a54, 0.85);
        g.fillTriangle(10, 3, 18, 15, 2, 15);

        // Buồng lái nhỏ
        g.fillStyle(0x00d2ff, 0.7);
        g.fillEllipse(10, 8, 5, 4);

        // Đuôi đứng
        g.fillStyle(0x636e72, 1);
        g.fillRect(9, 15, 2, 4);

        g.generateTexture('parked_jet', 20, 20);
        g.destroy();
    }

    // ============================================================
    // 3. PHÁO TỰ VỆ NHỎ TÀU SÂN BAY (18x24 px)
    // ============================================================
    _genCarrierTurretSmall() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x718093, 1);
        g.fillRect(7, 2, 4, 11);
        g.fillStyle(0x2f3640, 1);
        g.lineStyle(1.5, 0x00d2ff, 1);
        g.fillRoundedRect(3, 8, 12, 13, 3);
        g.strokeRoundedRect(3, 8, 12, 13, 3);
        g.fillStyle(0x00d2ff, 1);
        g.fillCircle(9, 14, 2.5);
        g.generateTexture('carrier_turret_small', 18, 24);
        g.destroy();
    }

    // ============================================================
    // 4. TÊN LỬA CÁC LOẠI (Vẽ đứng hướng lên trên Bắc / Y- để đồng bộ với asset tên lửa PNG)
    // ============================================================
    _genMissiles() {
        // Tomahawk phe ta (Trắng xanh công nghệ cao) - 12x28 px (Mũi hướng lên trên)
        const mPlayer = this.make.graphics({ x: 0, y: 0, add: false });
        mPlayer.fillStyle(0xf5f6fa, 1);
        mPlayer.fillRect(4, 6, 4, 18); // Thân tên lửa thẳng đứng
        mPlayer.fillStyle(0x00d2ff, 1);
        mPlayer.fillTriangle(6, 0, 2, 6, 10, 6); // Mũi hướng lên trên
        mPlayer.fillStyle(0x2f3640, 1);
        mPlayer.fillRect(0, 16, 12, 3); // Cánh ngang
        mPlayer.fillRect(2, 21, 8, 2);  // Cánh đuôi
        mPlayer.generateTexture('missile_player', 12, 28);
        mPlayer.destroy();

        // Tomahawk phe địch (Đỏ thẫm nguy hiểm) - 12x28 px (Mũi hướng lên trên)
        const mEnemy = this.make.graphics({ x: 0, y: 0, add: false });
        mEnemy.fillStyle(0x2f3640, 1);
        mEnemy.fillRect(4, 6, 4, 18);
        mEnemy.fillStyle(0xff3838, 1);
        mEnemy.fillTriangle(6, 0, 2, 6, 10, 6);
        mEnemy.fillRect(0, 16, 12, 3);
        mEnemy.generateTexture('missile_enemy', 12, 28);
        mEnemy.destroy();

        // Tên lửa tiêm kích - 8x20 px (Mũi hướng lên trên)
        const mAircraft = this.make.graphics({ x: 0, y: 0, add: false });
        mAircraft.fillStyle(0xffeaa7, 1);
        mAircraft.fillRect(2, 4, 4, 14);
        mAircraft.fillTriangle(4, 0, 1, 5, 7, 5);
        mAircraft.generateTexture('missile_aircraft', 8, 20);
        mAircraft.destroy();
    }

    // ============================================================
    // 5. TIÊM KÍCH HẠM TÀNG HÌNH F-35C (38x40 px)
    //    Nâng cấp: buồng lái rõ, động cơ phát sáng vàng cam
    // ============================================================
    _genFighterJet() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Thân chính tàng hình
        g.fillStyle(0x353b48, 1);
        g.lineStyle(1.5, 0x00d2ff, 0.9);
        g.beginPath();
        g.moveTo(19, 2);
        g.lineTo(29, 16);
        g.lineTo(37, 28);
        g.lineTo(27, 30);
        g.lineTo(24, 37);
        g.lineTo(19, 33);
        g.lineTo(14, 37);
        g.lineTo(11, 30);
        g.lineTo(1, 28);
        g.lineTo(9, 16);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Đường tâm thân
        g.lineStyle(1, 0x636e72, 0.5);
        g.lineBetween(19, 4, 19, 32);

        // Buồng lái cockpit (rõ nét)
        g.fillStyle(0x00d2ff, 0.6);
        g.fillEllipse(19, 13, 7, 9);
        g.lineStyle(1, 0x74b9ff, 0.8);
        g.strokeEllipse(19, 13, 7, 9);

        // Vách ngăn buồng lái
        g.lineStyle(0.8, 0xffffff, 0.5);
        g.lineBetween(19, 9, 19, 17);

        // Cánh tam giác delta mỏng
        g.fillStyle(0x2f3640, 0.85);
        g.fillTriangle(19, 4, 37, 27, 1, 27);

        // Tay lái phụ cánh đuôi
        g.fillStyle(0x434a54, 1);
        g.fillRect(13, 31, 6, 4);
        g.fillRect(19, 31, 6, 4);

        // Động cơ phát sáng vàng cam
        g.fillStyle(0xf39c12, 1);
        g.fillEllipse(19, 35, 8, 5);
        g.fillStyle(0xffeaa7, 0.7);
        g.fillEllipse(19, 35, 4, 3);

        g.generateTexture('fighter_jet', 38, 40);
        g.destroy();
    }

    _genAdvancedFighterJets() {
        // Tiêm kích F/A-XX (42x44 px) - Cánh vuốt ngược stealth
        const faxx = this.make.graphics({ x: 0, y: 0, add: false });
        faxx.fillStyle(0x2d3436, 1);
        faxx.lineStyle(1.8, 0x00f2fe, 0.95);
        faxx.beginPath();
        faxx.moveTo(21, 2);
        faxx.lineTo(33, 14);
        faxx.lineTo(41, 24);
        faxx.lineTo(31, 34);
        faxx.lineTo(26, 42);
        faxx.lineTo(21, 37);
        faxx.lineTo(16, 42);
        faxx.lineTo(11, 34);
        faxx.lineTo(1, 24);
        faxx.lineTo(9, 14);
        faxx.closePath();
        faxx.fillPath();
        faxx.strokePath();

        // Buồng lái cockpit vàng phản quang
        faxx.fillStyle(0xf1c40f, 0.8);
        faxx.fillEllipse(21, 14, 6, 11);
        // Động cơ phản lực kép xanh lục
        faxx.fillStyle(0x00d2ff, 1);
        faxx.fillCircle(17, 39, 3);
        faxx.fillCircle(25, 39, 3);
        faxx.generateTexture('jet_faxx', 42, 44);
        faxx.destroy();

        // Siêu tiêm kích F/A-47 NGAD (46x48 px) - Thiết kế cánh bay kim cương (Diamond wing)
        const ngad = this.make.graphics({ x: 0, y: 0, add: false });
        ngad.fillStyle(0x1e272e, 1);
        ngad.lineStyle(2, 0x2ecc71, 0.95);
        ngad.beginPath();
        ngad.moveTo(23, 1);
        ngad.lineTo(44, 22);
        ngad.lineTo(36, 36);
        ngad.lineTo(28, 46);
        ngad.lineTo(23, 42);
        ngad.lineTo(18, 46);
        ngad.lineTo(10, 36);
        ngad.lineTo(2, 22);
        ngad.closePath();
        ngad.fillPath();
        ngad.strokePath();

        // Cockpit tàng hình hạt nhân
        ngad.fillStyle(0x2ecc71, 0.85);
        ngad.fillEllipse(23, 15, 7, 12);
        // Động cơ plasma xanh ngọc
        ngad.fillStyle(0x2ed573, 1);
        ngad.fillCircle(19, 43, 3.5);
        ngad.fillCircle(27, 43, 3.5);
        ngad.generateTexture('jet_ngad', 46, 48);
        ngad.destroy();
    }

    _genEnemyJet() {
        if (this.textures.exists('enemy_jet')) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x2b0d10, 1);
        g.lineStyle(1.8, 0xff3838, 0.95);
        g.beginPath();
        g.moveTo(19, 2);
        g.lineTo(29, 16);
        g.lineTo(37, 28);
        g.lineTo(27, 30);
        g.lineTo(24, 37);
        g.lineTo(19, 33);
        g.lineTo(14, 37);
        g.lineTo(11, 30);
        g.lineTo(1, 28);
        g.lineTo(9, 16);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Buồng lái đỏ thẫm
        g.fillStyle(0xff4757, 0.7);
        g.fillEllipse(19, 13, 7, 9);
        g.lineStyle(1, 0xff6b81, 0.9);
        g.strokeEllipse(19, 13, 7, 9);

        // Động cơ phản lực lửa đỏ
        g.fillStyle(0xff4757, 1);
        g.fillEllipse(19, 35, 8, 5);
        g.fillStyle(0xffa502, 0.8);
        g.fillEllipse(19, 35, 4, 3);

        g.generateTexture('enemy_jet', 38, 40);
        g.destroy();
    }

    // ============================================================
    // 6. TÀU KHU TRỤC ARLEIGH BURKE (50x110 px)
    //    Nâng cấp: cột mast cao, 2 ống phóng ngư lôi ngang
    // ============================================================
    _genAllyDestroyer() {
        if (this.textures.exists('ally_destroyer_hull')) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Thân tàu
        g.fillStyle(0x1e272e, 1);
        g.lineStyle(1.8, 0x2ecc71, 0.95);
        g.beginPath();
        g.moveTo(25, 3);
        g.lineTo(44, 28);
        g.lineTo(46, 84);
        g.lineTo(37, 106);
        g.lineTo(13, 106);
        g.lineTo(4, 84);
        g.lineTo(6, 28);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Boong trên thân
        g.fillStyle(0x2c3e50, 0.7);
        g.fillRect(10, 28, 30, 62);

        // Cụm giếng phóng VLS Mk 41 (SLOT 2 Tên lửa Tomahawk)
        g.fillStyle(0x1abc9c, 0.9);
        g.lineStyle(1.2, 0x2ecc71, 0.9);
        g.fillRect(15, 28, 20, 14);
        g.strokeRect(15, 28, 20, 14);
        // Chi tiết VLS cell grid
        g.lineStyle(0.8, 0x16a085, 0.8);
        for (let i = 1; i < 4; i++) g.lineBetween(15 + i * 5, 28, 15 + i * 5, 42);
        g.lineBetween(15, 35, 35, 35);

        // Đế pháo hạm Mk 45 (SLOT 1 Pháo chính mũi tàu)
        g.fillStyle(0x7f8c8d, 1);
        g.lineStyle(1, 0x2ecc71, 0.9);
        g.fillCircle(25, 17, 7);
        g.strokeCircle(25, 17, 7);
        g.fillRect(24, 8, 2, 9);

        // Tháp điều khiển (Bridge)
        g.fillStyle(0x34495e, 1);
        g.lineStyle(1, 0x2ecc71, 0.7);
        g.fillRoundedRect(16, 50, 18, 16, 2);
        g.strokeRoundedRect(16, 50, 18, 16, 2);

        // Cột mast cao SPY-1 radar
        g.fillStyle(0x95a5a6, 1);
        g.fillRect(24, 36, 2, 22);     // cột chính
        g.fillRect(20, 38, 10, 2);     // cánh radar ngang
        g.fillStyle(0x2ecc71, 0.9);
        g.fillRect(20, 36, 10, 3);     // ăng-ten SPY-1
        // Cột phụ
        g.lineStyle(1, 0x7f8c8d, 0.6);
        g.lineBetween(25, 36, 22, 30);
        g.lineBetween(25, 36, 28, 30);

        // 2 ống phóng ngư lôi Mark 32 (ngang thân, đặc trưng Arleigh Burke)
        g.fillStyle(0x7f8c8d, 1);
        // Bên trái
        g.fillRect(5, 68, 10, 4);
        g.fillRect(5, 74, 10, 4);
        g.fillCircle(5, 70, 2);
        g.fillCircle(5, 76, 2);
        // Bên phải
        g.fillRect(35, 68, 10, 4);
        g.fillRect(35, 74, 10, 4);
        g.fillCircle(45, 70, 2);
        g.fillCircle(45, 76, 2);

        // Ống khói / exhaust
        g.fillStyle(0x2c3e50, 1);
        g.fillRect(20, 68, 10, 10);
        g.lineStyle(1, 0x2ecc71, 0.4);
        g.strokeRect(20, 68, 10, 10);

        g.generateTexture('ally_destroyer_hull', 50, 110);
        g.destroy();
    }

    // ============================================================
    // 7. TUẦN DƯƠNG TICONDEROGA (58x135 px)
    //    Nâng cấp: VLS trước và sau, ống khói đặc trưng rõ
    // ============================================================
    _genAllyCruiser() {
        if (this.textures.exists('ally_cruiser_hull')) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Thân chính
        g.fillStyle(0x192a56, 1);
        g.lineStyle(2.2, 0x1abc9c, 0.95);
        g.beginPath();
        g.moveTo(29, 4);
        g.lineTo(52, 30);
        g.lineTo(55, 103);
        g.lineTo(44, 130);
        g.lineTo(14, 130);
        g.lineTo(3, 103);
        g.lineTo(6, 30);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Boong trên
        g.fillStyle(0x1e3799, 0.5);
        g.fillRect(10, 30, 38, 88);

        // Cụm VLS trước Mk 41 (SLOT 3 Tên lửa Tomahawk)
        g.fillStyle(0x2ecc71, 0.95);
        g.lineStyle(1.2, 0x1abc9c, 0.9);
        g.fillRect(16, 28, 26, 16);
        g.strokeRect(16, 28, 26, 16);
        g.lineStyle(0.8, 0x16a085, 0.8);
        for (let i = 1; i < 5; i++) g.lineBetween(16 + i * 5, 28, 16 + i * 5, 44);

        // Cụm VLS sau Mk 41 (SLOT 4 Tên lửa Tomahawk)
        g.fillStyle(0x2ecc71, 0.95);
        g.lineStyle(1.2, 0x1abc9c, 0.9);
        g.fillRect(16, 92, 26, 16);
        g.strokeRect(16, 92, 26, 16);
        g.lineStyle(0.8, 0x16a085, 0.8);
        for (let i = 1; i < 5; i++) g.lineBetween(16 + i * 5, 92, 16 + i * 5, 108);

        // Đế pháo hạm mũi (SLOT 1) & Đế pháo hạm đuôi (SLOT 2)
        g.fillStyle(0x7f8c8d, 1);
        g.lineStyle(1.2, 0x1abc9c, 1);
        g.fillCircle(29, 16, 8);
        g.strokeCircle(29, 16, 8);
        g.fillCircle(29, 118, 8);
        g.strokeCircle(29, 118, 8);
        g.lineBetween(16, 36, 42, 36);

        // Cụm VLS sau
        g.fillStyle(0x2ecc71, 0.9);
        g.fillRect(16, 100, 26, 16);
        g.strokeRect(16, 100, 26, 16);
        g.lineStyle(0.8, 0x16a085, 0.8);
        for (let i = 1; i < 5; i++) g.lineBetween(16 + i * 5, 100, 16 + i * 5, 116);
        g.lineBetween(16, 108, 42, 108);

        // Pháo 5" Mk 45 mũi
        g.fillStyle(0x7f8c8d, 1);
        g.fillRect(25, 14, 8, 16);
        g.fillRect(23, 18, 12, 8);
        g.fillStyle(0xbdc3c7, 1);
        g.fillRect(28, 10, 2, 7);

        // Cầu chỉ huy
        g.fillStyle(0x273c75, 1);
        g.lineStyle(1.5, 0x1abc9c, 0.8);
        g.fillRoundedRect(17, 55, 24, 20, 3);
        g.strokeRoundedRect(17, 55, 24, 20, 3);

        // Cửa sổ bridge
        g.fillStyle(0x00d2ff, 0.4);
        g.fillRect(20, 59, 18, 4);
        g.fillRect(20, 65, 18, 4);

        // Radar SPY-1 trên cầu
        g.fillStyle(0x7f8c8d, 1);
        g.fillRect(28, 48, 2, 10);
        g.fillStyle(0x1abc9c, 0.9);
        g.fillRect(23, 47, 12, 4);
        g.fillStyle(0xdfe6e9, 1);
        g.fillCircle(29, 46, 3);

        // 2 Ống khói đặc trưng Ticonderoga (đặt giữa tàu)
        g.fillStyle(0x2c3e50, 1);
        g.lineStyle(1, 0x1abc9c, 0.5);
        g.fillRect(18, 79, 10, 14);
        g.strokeRect(18, 79, 10, 14);
        g.fillRect(30, 79, 10, 14);
        g.strokeRect(30, 79, 10, 14);
        // Đỉnh ống khói bo tròn
        g.fillStyle(0x7f8c8d, 1);
        g.fillEllipse(23, 79, 10, 4);
        g.fillEllipse(35, 79, 10, 4);

        g.generateTexture('ally_cruiser_hull', 58, 135);
        g.destroy();
    }

    // ============================================================
    // 8. THÁP PHÁO ĐỒNG MINH (30x36 px)
    // ============================================================
    _genAllyTurret() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x718093, 1);
        g.fillRect(13, 2, 4, 18);
        g.fillStyle(0x2f3640, 1);
        g.lineStyle(1.5, 0x2ecc71, 1);
        g.fillRoundedRect(7, 14, 16, 16, 3);
        g.strokeRoundedRect(7, 14, 16, 16, 3);
        g.fillStyle(0x2ecc71, 1);
        g.fillCircle(15, 22, 2);
        g.generateTexture('ally_turret', 30, 36);
        g.destroy();
    }

    // ============================================================
    // 8.1. HỘ VỆ HẠM CONSTELLATION ĐỒNG MINH (44x96 px)
    // ============================================================
    _genAllyFrigate() {
        if (this.textures.exists('ally_frigate_hull')) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x162a36, 1);
        g.lineStyle(2, 0x54a0ff, 0.95);
        g.beginPath();
        g.moveTo(22, 3);
        g.lineTo(38, 24);
        g.lineTo(40, 74);
        g.lineTo(32, 92);
        g.lineTo(12, 92);
        g.lineTo(4, 74);
        g.lineTo(6, 24);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Boong & Pháo mũi 57mm
        g.fillStyle(0x223d4f, 1);
        g.fillRect(12, 26, 20, 52);
        g.fillStyle(0x718093, 1);
        g.fillCircle(22, 20, 6);
        g.fillRect(21, 10, 2, 10);

        // Radar mảng pha tàng hình
        g.fillStyle(0x54a0ff, 0.85);
        g.fillRoundedRect(16, 42, 12, 14, 2);
        g.generateTexture('ally_frigate_hull', 44, 96);
        g.destroy();
    }

    // ============================================================
    // 8.2. THIẾT GIÁP HẠM IOWA HẠNG NẶNG ĐỒNG MINH (68x155 px)
    // ============================================================
    _genAllyBattleship() {
        if (this.textures.exists('ally_battleship_hull')) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x1a252f, 1);
        g.lineStyle(2.5, 0xff9f43, 0.95);
        g.beginPath();
        g.moveTo(34, 4);
        g.lineTo(60, 32);
        g.lineTo(64, 115);
        g.lineTo(52, 150);
        g.lineTo(16, 150);
        g.lineTo(4, 115);
        g.lineTo(8, 32);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Sàn gỗ teak đặc trưng thiết giáp hạm
        g.fillStyle(0x2c3e50, 0.9);
        g.fillRect(14, 28, 40, 108);

        // 3 Cụm Tháp pháo 3 nòng 406mm (2 mũi, 1 đuôi)
        const turretY = [28, 52, 126];
        turretY.forEach(ty => {
            g.fillStyle(0x7f8c8d, 1);
            g.lineStyle(1.5, 0xff9f43, 0.9);
            g.fillCircle(34, ty, 10);
            g.strokeCircle(34, ty, 10);
            // 3 nòng pháo
            g.fillStyle(0xdfe6e9, 1);
            const dir = (ty > 100) ? 1 : -1;
            g.fillRect(31, ty + (dir === -1 ? -16 : 8), 2, 10);
            g.fillRect(34, ty + (dir === -1 ? -18 : 8), 2, 12);
            g.fillRect(37, ty + (dir === -1 ? -16 : 8), 2, 10);
        });

        // Tháp chỉ huy bọc thép đồ sộ
        g.fillStyle(0x34495e, 1);
        g.fillRoundedRect(22, 74, 24, 30, 4);
        g.lineStyle(1.5, 0xff9f43, 0.8);
        g.strokeRoundedRect(22, 74, 24, 30, 4);

        g.generateTexture('ally_battleship_hull', 68, 155);
        g.destroy();
    }

    // ============================================================
    // 8.3. PHÁO ĐÀI HẢI QUÂN THÂN KÉP CHIẾN DỊCH (CATAMARAN FORTRESS) (140x220 px)
    // ============================================================
    _genTwinFortressHull() {
        if (this.textures.exists('campaign_fortress_hull')) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Nền móng pháo đài thân kép (Catamaran)
        g.fillStyle(0x0f1c29, 1);
        g.lineStyle(3, 0x00d2ff, 1);

        // Thân trái (Left Hull)
        g.beginPath();
        g.moveTo(35, 6);
        g.lineTo(60, 36);
        g.lineTo(62, 175);
        g.lineTo(48, 214);
        g.lineTo(16, 214);
        g.lineTo(6, 175);
        g.lineTo(10, 36);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Thân phải (Right Hull)
        g.beginPath();
        g.moveTo(105, 6);
        g.lineTo(130, 36);
        g.lineTo(134, 175);
        g.lineTo(124, 214);
        g.lineTo(92, 214);
        g.lineTo(78, 175);
        g.lineTo(80, 36);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Cầu nối thân đôi kiên cố ở giữa (Central Bastion Deck)
        g.fillStyle(0x192a3a, 1);
        g.fillRect(36, 45, 68, 135);
        g.lineStyle(2, 0x00d2ff, 0.9);
        g.strokeRect(36, 45, 68, 135);

        // Đường băng nhỏ tự vệ trên thân trái
        g.fillStyle(0x243342, 1);
        g.fillRect(16, 40, 36, 120);
        g.lineStyle(1.5, 0xf1c40f, 0.8);
        g.lineBetween(34, 45, 34, 150);

        // Sàn giếng phóng tên lửa VLS Thân Đôi trên thân phải (2 Cụm VLS)
        g.fillStyle(0x0a192f, 1);
        g.fillRect(88, 50, 36, 30);
        g.strokeRect(88, 50, 36, 30);
        g.fillRect(88, 120, 36, 30);
        g.strokeRect(88, 120, 36, 30);
        g.fillStyle(0x00f2fe, 0.9);
        for (let vx = 0; vx < 4; vx++) {
            for (let vy = 0; vy < 3; vy++) {
                g.fillRect(92 + vx * 8, 54 + vy * 8, 5, 5);
                g.fillRect(92 + vx * 8, 124 + vy * 8, 5, 5);
            }
        }

        // 4 Bệ Pháo tự vệ cố định
        const turretMounts = [
            { x: 26, y: 35 }, { x: 26, y: 175 },
            { x: 114, y: 35 }, { x: 114, y: 175 }
        ];
        turretMounts.forEach(tm => {
            g.fillStyle(0x34495e, 1);
            g.lineStyle(2, 0x00d2ff, 1);
            g.fillCircle(tm.x, tm.y, 11);
            g.strokeCircle(tm.x, tm.y, 11);
        });

        // Trung tâm chỉ huy AEGIS mảng pha tối thượng ở giữa
        g.fillStyle(0x2c3e50, 1);
        g.lineStyle(2.5, 0x2ed573, 1);
        g.fillRoundedRect(50, 90, 40, 45, 6);
        g.strokeRoundedRect(50, 90, 40, 45, 6);

        // Mái vòm Radar 3D
        g.fillStyle(0x00d2ff, 1);
        g.fillCircle(70, 112, 10);
        g.lineStyle(2, 0xffffff, 0.9);
        g.strokeCircle(70, 112, 10);

        g.generateTexture('campaign_fortress_hull', 140, 220);
        g.destroy();
    }

    // ============================================================
    // 9. TÀU TUẦN DƯƠNG ĐỊCH (46x100 px)
    // ============================================================
    _genEnemyCruiser() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x2c1f24, 1);
        g.lineStyle(2, 0xff4757, 1);
        g.beginPath();
        g.moveTo(23, 4);
        g.lineTo(40, 24);
        g.lineTo(42, 70);
        g.lineTo(36, 96);
        g.lineTo(10, 96);
        g.lineTo(4, 70);
        g.lineTo(6, 24);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Đường boong
        g.fillStyle(0x3d1520, 0.7);
        g.fillRect(8, 24, 30, 60);

        // Cụm tên lửa địch mũi tàu
        g.fillStyle(0xff4757, 0.8);
        g.fillRect(14, 24, 18, 8);
        g.lineStyle(0.8, 0xff6b81, 0.6);
        for (let i = 1; i < 3; i++) g.lineBetween(14 + i * 6, 24, 14 + i * 6, 32);

        // Cầu chỉ huy địch
        g.fillStyle(0x521520, 1);
        g.fillRoundedRect(14, 40, 18, 14, 2);
        g.generateTexture('enemy_cruiser_hull', 46, 100);
        g.destroy();
    }

    // ============================================================
    // 10. KHU TRỤC TÊN LỬA ĐỊCH (42x92 px)
    // ============================================================
    _genEnemyMissileDestroyer() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x351d22, 1);
        g.lineStyle(2, 0xff6b81, 1);
        g.beginPath();
        g.moveTo(21, 3);
        g.lineTo(38, 22);
        g.lineTo(40, 68);
        g.lineTo(32, 90);
        g.lineTo(10, 90);
        g.lineTo(2, 68);
        g.lineTo(4, 22);
        g.closePath();
        g.fillPath();
        g.strokePath();

        g.fillStyle(0xff4757, 1);
        g.fillRect(15, 20, 12, 6);
        g.lineStyle(0.8, 0xff6b81, 0.7);
        for (let i = 1; i < 3; i++) g.lineBetween(15 + i * 4, 20, 15 + i * 4, 26);

        // Ống phóng tên lửa dọc
        g.fillStyle(0x7f2030, 1);
        g.fillRect(16, 42, 10, 12);
        g.lineStyle(1, 0xff4757, 0.5);
        g.strokeRect(16, 42, 10, 12);
        g.generateTexture('enemy_missile_destroyer_hull', 42, 92);
        g.destroy();
    }

    // ============================================================
    // 11. TUẦN DƯƠNG TIÊN TIẾN ĐỊCH (54x118 px)
    // ============================================================
    _genEnemyAdvancedCruiser() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x1e1518, 1);
        g.lineStyle(2.5, 0xff0055, 1);
        g.beginPath();
        g.moveTo(27, 4);
        g.lineTo(48, 26);
        g.lineTo(52, 85);
        g.lineTo(40, 114);
        g.lineTo(14, 114);
        g.lineTo(2, 85);
        g.lineTo(6, 26);
        g.closePath();
        g.fillPath();
        g.strokePath();

        g.fillStyle(0xff0055, 1);
        g.fillRect(18, 22, 18, 8);
        g.fillRect(18, 86, 18, 8);
        g.lineStyle(0.8, 0xff6b81, 0.6);
        for (let i = 1; i < 4; i++) g.lineBetween(18 + i * 4, 22, 18 + i * 4, 30);

        g.fillStyle(0x7f0030, 1);
        g.fillRoundedRect(18, 50, 18, 22, 3);
        g.fillStyle(0xff0055, 0.3);
        g.fillCircle(27, 61, 6);
        g.generateTexture('enemy_advanced_cruiser_hull', 54, 118);
        g.destroy();
    }

    // ============================================================
    // 12. THIẾT GIÁP HẠM ĐỊCH (58x126 px)
    // ============================================================
    _genEnemyBattleship() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x21171a, 1);
        g.lineStyle(2.5, 0xff3838, 1);
        g.beginPath();
        g.moveTo(29, 4);
        g.lineTo(50, 26);
        g.lineTo(54, 86);
        g.lineTo(44, 122);
        g.lineTo(14, 122);
        g.lineTo(4, 86);
        g.lineTo(8, 26);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Tháp pháo 2 nòng mũi
        g.fillStyle(0x7f1a1a, 1);
        g.fillRoundedRect(20, 20, 18, 12, 2);
        g.fillStyle(0x95a5a6, 1);
        g.fillRect(22, 14, 3, 8);
        g.fillRect(33, 14, 3, 8);

        // Tháp pháo đuôi
        g.fillStyle(0x7f1a1a, 1);
        g.fillRoundedRect(20, 95, 18, 12, 2);
        g.fillStyle(0x95a5a6, 1);
        g.fillRect(22, 103, 3, 8);
        g.fillRect(33, 103, 3, 8);

        g.generateTexture('enemy_battleship_hull', 58, 126);
        g.destroy();
    }

    // ============================================================
    // 13. TRÙM CUỐI SIÊU THIẾT GIÁP HẠM KRAKEN (90x200 px)
    //     Nâng cấp: 4 tháp pháo lớn, lò phản ứng phát sáng đỏ thẫm
    // ============================================================
    _genEnemyBossHull() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Thân khổng lồ
        g.fillStyle(0x0d0508, 1);
        g.lineStyle(4, 0xff0033, 1);
        g.beginPath();
        g.moveTo(45, 4);
        g.lineTo(82, 38);
        g.lineTo(86, 150);
        g.lineTo(70, 194);
        g.lineTo(20, 194);
        g.lineTo(4, 150);
        g.lineTo(8, 38);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Sơn hắc ám trung tâm
        g.fillStyle(0x1a0308, 1);
        g.fillRect(20, 48, 50, 108);

        // --- Lò phản ứng hạt nhân phát sáng đỏ thẫm ---
        // Vùng phát nhiệt xung quanh
        g.fillStyle(0x400c16, 1);
        g.fillCircle(45, 100, 28);
        // Vòng plasma ngoài
        g.lineStyle(3, 0xc0392b, 0.8);
        g.strokeCircle(45, 100, 22);
        // Lõi lò phản ứng
        g.fillStyle(0xff0055, 0.9);
        g.fillCircle(45, 100, 16);
        // Ánh sáng trung tâm
        g.fillStyle(0xff6b81, 0.7);
        g.fillCircle(45, 100, 9);
        g.fillStyle(0xffd8e2, 0.5);
        g.fillCircle(45, 100, 4);
        // Tia plasma
        g.lineStyle(1.5, 0xff3030, 0.6);
        g.lineBetween(45, 78, 45, 122);
        g.lineBetween(23, 100, 67, 100);
        g.lineBetween(30, 85, 60, 115);
        g.lineBetween(60, 85, 30, 115);

        // --- 4 Tháp pháo đại bác khổng lồ ---
        // Tháp 1 (Mũi trái)
        g.fillStyle(0x5a1520, 1);
        g.lineStyle(1.5, 0xff3838, 0.9);
        g.fillRoundedRect(14, 40, 22, 14, 2);
        g.strokeRoundedRect(14, 40, 22, 14, 2);
        g.fillStyle(0xbdc3c7, 1);
        g.fillRect(16, 30, 4, 12);
        g.fillRect(28, 30, 4, 12);

        // Tháp 2 (Mũi phải)
        g.fillStyle(0x5a1520, 1);
        g.fillRoundedRect(54, 40, 22, 14, 2);
        g.strokeRoundedRect(54, 40, 22, 14, 2);
        g.fillStyle(0xbdc3c7, 1);
        g.fillRect(56, 30, 4, 12);
        g.fillRect(68, 30, 4, 12);

        // Tháp 3 (Đuôi trái)
        g.fillStyle(0x5a1520, 1);
        g.fillRoundedRect(14, 148, 22, 14, 2);
        g.strokeRoundedRect(14, 148, 22, 14, 2);
        g.fillStyle(0xbdc3c7, 1);
        g.fillRect(16, 160, 4, 12);
        g.fillRect(28, 160, 4, 12);

        // Tháp 4 (Đuôi phải)
        g.fillStyle(0x5a1520, 1);
        g.fillRoundedRect(54, 148, 22, 14, 2);
        g.strokeRoundedRect(54, 148, 22, 14, 2);
        g.fillStyle(0xbdc3c7, 1);
        g.fillRect(56, 160, 4, 12);
        g.fillRect(68, 160, 4, 12);

        // Cụm VLS đạn đạo trước và sau
        g.fillStyle(0xff0033, 1);
        g.fillRect(28, 28, 34, 10);
        g.fillRect(28, 164, 34, 10);
        g.lineStyle(0.8, 0xff6b81, 0.5);
        for (let i = 1; i < 7; i++) g.lineBetween(28 + i * 5, 28, 28 + i * 5, 38);
        for (let i = 1; i < 7; i++) g.lineBetween(28 + i * 5, 164, 28 + i * 5, 174);

        // Tháp điều khiển trung tâm
        g.fillStyle(0x2c0810, 1);
        g.lineStyle(2, 0xff0033, 0.8);
        g.fillRoundedRect(32, 56, 26, 28, 4);
        g.strokeRoundedRect(32, 56, 26, 28, 4);

        // Anten trùm boss
        g.fillStyle(0x95a5a6, 1);
        g.fillRect(44, 44, 2, 16);
        g.fillRect(38, 46, 14, 2);
        g.fillStyle(0xff0033, 0.9);
        g.fillCircle(45, 43, 4);

        // Chân vịt
        g.fillStyle(0x7f1a1a, 0.8);
        g.fillCircle(30, 196, 4);
        g.fillCircle(60, 196, 4);

        g.generateTexture('enemy_boss_hull', 90, 200);
        g.destroy();
    }

    // ============================================================
    // 13.1. SIÊU TRÙM CUỐI GHÉP ĐÔI MÀN 7 (KRAKEN TITAN FUSION) (150x230 px)
    //       Ghép 2 thân tàu Boss cũ song song, 8 tháp pháo, 2 lò phản ứng
    // ============================================================
    _genEnemySuperBossHull() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Thân đôi khổng lồ (Twin-hull dreadnought)
        g.fillStyle(0x0a0306, 1);
        g.lineStyle(4, 0xff0044, 1);

        // Mạn trái
        g.beginPath();
        g.moveTo(40, 6);
        g.lineTo(70, 38);
        g.lineTo(72, 175);
        g.lineTo(55, 222);
        g.lineTo(15, 222);
        g.lineTo(4, 175);
        g.lineTo(8, 38);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Mạn phải
        g.beginPath();
        g.moveTo(110, 6);
        g.lineTo(142, 38);
        g.lineTo(146, 175);
        g.lineTo(135, 222);
        g.lineTo(95, 222);
        g.lineTo(78, 175);
        g.lineTo(80, 38);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Cầu nối thân đôi ở giữa (Center Bridge platform)
        g.fillStyle(0x1f060c, 1);
        g.fillRect(35, 55, 80, 125);
        g.lineStyle(2, 0xff0055, 1);
        g.strokeRect(35, 55, 80, 125);

        // 2 Lò phản ứng hạt nhân kép (Twin Reactors)
        [40, 110].forEach(rx => {
            g.fillStyle(0x400c16, 1);
            g.fillCircle(rx, 115, 22);
            g.fillStyle(0xff0055, 0.95);
            g.fillCircle(rx, 115, 14);
            g.fillStyle(0xffd8e2, 0.7);
            g.fillCircle(rx, 115, 6);
        });

        // 8 Tháp pháo siêu đại bác (Twin-mounted Turrets)
        const turretPos = [
            { x: 18, y: 45 }, { x: 52, y: 45 }, { x: 98, y: 45 }, { x: 132, y: 45 },
            { x: 18, y: 175 }, { x: 52, y: 175 }, { x: 98, y: 175 }, { x: 132, y: 175 }
        ];

        turretPos.forEach(tp => {
            g.fillStyle(0x6b1525, 1);
            g.lineStyle(1.5, 0xff3838, 1);
            g.fillRoundedRect(tp.x - 10, tp.y - 8, 20, 16, 2);
            g.strokeRoundedRect(tp.x - 10, tp.y - 8, 20, 16, 2);
            g.fillStyle(0xecf0f1, 1);
            g.fillRect(tp.x - 5, tp.y - 16, 3, 10);
            g.fillRect(tp.x + 2, tp.y - 16, 3, 10);
        });

        // Bệ phóng VLS siêu cấp ở trung tâm
        g.fillStyle(0xff0033, 1);
        g.fillRect(50, 70, 50, 18);
        g.fillRect(50, 145, 50, 18);
        g.lineStyle(1, 0xff6b81, 0.8);
        for (let i = 1; i < 10; i++) {
            g.lineBetween(50 + i * 5, 70, 50 + i * 5, 88);
            g.lineBetween(50 + i * 5, 145, 50 + i * 5, 163);
        }

        // Cầu chỉ huy tối thượng ở giữa
        g.fillStyle(0x2c0810, 1);
        g.lineStyle(2.5, 0xff0055, 1);
        g.fillRoundedRect(60, 95, 30, 36, 4);
        g.strokeRoundedRect(60, 95, 30, 36, 4);

        g.generateTexture('enemy_super_boss_hull', 150, 230);
        g.destroy();
    }

    // ============================================================
    // 13.2. TÀU SÂN BAY ĐỊCH IRON TIDE (70x165 px)
    // ============================================================
    _genEnemyCarrierHull() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Thân tàu sân bay tàng hình đen đỏ
        g.fillStyle(0x0e0608, 1);
        g.lineStyle(2.5, 0xff0033, 0.9);
        g.beginPath();
        g.moveTo(35, 4);
        g.lineTo(65, 34);
        g.lineTo(67, 142);
        g.lineTo(54, 160);
        g.lineTo(16, 160);
        g.lineTo(3, 142);
        g.lineTo(5, 34);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Boong cất cánh (Flight Deck) màu than chì
        g.fillStyle(0x181014, 1);
        g.fillRect(10, 24, 50, 130);

        // Đường băng chéo & vạch sơn đỏ/vàng
        g.lineStyle(2, 0xff4757, 0.8);
        g.lineBetween(35, 26, 35, 148);
        g.lineStyle(1.5, 0xf1c40f, 0.7);
        g.lineBetween(22, 50, 22, 145);

        // Cáp hãm đà (Arrestor cables)
        g.lineStyle(1, 0x95a5a6, 0.7);
        g.lineBetween(14, 128, 56, 128);
        g.lineBetween(14, 135, 56, 135);
        g.lineBetween(14, 142, 56, 142);

        // Tháp chỉ huy đảo (Island superstructure) bên phải
        g.fillStyle(0x3d0b16, 1);
        g.lineStyle(1.5, 0xff0055, 1);
        g.fillRoundedRect(52, 60, 14, 34, 3);
        g.strokeRoundedRect(52, 60, 14, 34, 3);
        g.fillStyle(0xff0033, 1);
        g.fillRect(56, 52, 2, 10); // Anten radar

        // 4 Tháp pháo CIWS phòng không 4 góc
        const ciws = [
            { x: 8, y: 38 },
            { x: 62, y: 38 },
            { x: 8, y: 136 },
            { x: 62, y: 136 }
        ];
        ciws.forEach(pos => {
            g.fillStyle(0x5a1520, 1);
            g.fillCircle(pos.x, pos.y, 5);
            g.fillStyle(0xff4757, 1);
            g.fillRect(pos.x - 1, pos.y - 7, 2, 6);
        });

        g.generateTexture('enemy_carrier_hull', 70, 165);
        g.destroy();
    }

    // ============================================================
    // 14. THÁP PHÁO ĐỊCH (30x38 px)
    // ============================================================
    _genEnemyTurret() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x57606f, 1);
        g.fillRect(13, 2, 4, 18);
        g.fillStyle(0x352125, 1);
        g.lineStyle(1.5, 0xff4757, 1);
        g.fillRoundedRect(7, 14, 16, 18, 3);
        g.strokeRoundedRect(7, 14, 16, 18, 3);
        g.fillStyle(0xff4757, 1);
        g.fillCircle(15, 23, 2.5);
        g.generateTexture('enemy_turret', 30, 38);
        g.destroy();
    }

    // ============================================================
    // 15. ĐẢO LỚN (180x150 px)
    //     Nâng cấp: bãi cát vàng viền rõ, lõi đá xám, núi xanh rừng rậm
    // ============================================================
    _genIslandLarge() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Bãi cát vàng viền ngoài
        g.fillStyle(0xd4ac0d, 0.95);
        g.fillEllipse(90, 76, 172, 142);

        // Lớp cát nhạt hơn tiếp theo
        g.fillStyle(0xe8c547, 0.6);
        g.fillEllipse(90, 76, 155, 124);

        // Lõi đá xám trung tâm
        g.fillStyle(0x7f8c8d, 1);
        g.fillEllipse(90, 76, 132, 104);

        // Đá núi trung tâm tối hơn
        g.fillStyle(0x636e72, 1);
        g.fillEllipse(90, 76, 100, 78);

        // Núi rừng xanh (3 vùng cây)
        g.fillStyle(0x1e8449, 1);
        g.fillCircle(72, 62, 38);
        g.fillCircle(108, 72, 44);
        g.fillCircle(90, 82, 34);

        // Rừng cây đậm hơn ở tâm
        g.fillStyle(0x145a32, 1);
        g.fillCircle(78, 66, 24);
        g.fillCircle(104, 74, 28);
        g.fillCircle(90, 78, 20);

        // Ánh sáng lá cây
        g.fillStyle(0x58d68d, 0.3);
        g.fillCircle(76, 60, 12);
        g.fillCircle(106, 68, 14);

        // Đường bờ biển nhỏ (sóng viền trắng kem)
        g.lineStyle(2.5, 0xfdebd0, 0.5);
        g.strokeEllipse(90, 76, 166, 136);

        g.generateTexture('island_large', 180, 150);
        g.destroy();
    }

    // ============================================================
    // 16. ĐẢO NHỎ (110x90 px)
    // ============================================================
    _genIslandSmall() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xd4ac0d, 0.9);
        g.fillEllipse(55, 45, 102, 82);
        g.fillStyle(0x7f8c8d, 1);
        g.fillEllipse(55, 45, 80, 62);
        g.fillStyle(0x27ae60, 1);
        g.fillCircle(50, 42, 24);
        g.fillCircle(62, 46, 20);
        g.fillStyle(0x145a32, 1);
        g.fillCircle(55, 44, 14);
        g.lineStyle(2, 0xfdebd0, 0.4);
        g.strokeEllipse(55, 45, 96, 76);
        g.generateTexture('island_small', 110, 90);
        g.destroy();
    }

    // ============================================================
    // 17. GIÀN KHOAN DẦU (120x120 px)
    //     Nâng cấp: nền tảng kim loại rõ, cần khoan cao, lửa đốt khí cam
    // ============================================================
    _genOilRig() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Nền tảng nổi (pontoons)
        g.fillStyle(0x2c3e50, 1);
        g.lineStyle(2, 0x7f8c8d, 0.8);
        g.fillRect(5, 75, 110, 38);
        g.strokeRect(5, 75, 110, 38);

        // Dầm chéo gia cố nền tảng
        g.lineStyle(2, 0x7f8c8d, 0.6);
        g.lineBetween(5, 75, 115, 113);
        g.lineBetween(115, 75, 5, 113);
        g.lineBetween(60, 75, 60, 113);

        // Phao nổi bên trái
        g.fillStyle(0x34495e, 1);
        g.fillEllipse(25, 108, 36, 18);
        g.lineStyle(2, 0x7f8c8d, 0.7);
        g.strokeEllipse(25, 108, 36, 18);

        // Phao nổi bên phải
        g.fillStyle(0x34495e, 1);
        g.fillEllipse(95, 108, 36, 18);
        g.strokeEllipse(95, 108, 36, 18);

        // Sàn boong kim loại
        g.fillStyle(0x808b96, 1);
        g.fillRect(20, 55, 80, 24);
        g.lineStyle(1.5, 0x5d6d7e, 0.8);
        g.strokeRect(20, 55, 80, 24);

        // Lưới kẻ sàn
        g.lineStyle(1, 0x5d6d7e, 0.5);
        for (let x = 30; x < 100; x += 10) g.lineBetween(x, 55, x, 79);
        g.lineBetween(20, 67, 100, 67);

        // Cần khoan cao (derrick)
        g.fillStyle(0xd5d8dc, 1);
        g.fillRect(54, 8, 12, 50);       // cột chính
        g.lineStyle(2, 0x95a5a6, 1);
        g.lineBetween(54, 8, 40, 55);    // thanh xiên trái
        g.lineBetween(66, 8, 80, 55);    // thanh xiên phải
        g.lineBetween(54, 22, 44, 55);
        g.lineBetween(66, 22, 76, 55);
        g.lineBetween(54, 36, 48, 55);
        g.lineBetween(66, 36, 72, 55);
        // Đỉnh cần khoan
        g.fillStyle(0xf39c12, 1);
        g.fillRect(57, 4, 6, 8);
        g.fillStyle(0xe74c3c, 0.9);
        g.fillCircle(60, 3, 4);         // đèn cảnh báo hàng không

        // Máy bơm / pump jack
        g.fillStyle(0x5d6d7e, 1);
        g.fillRect(38, 60, 18, 8);
        g.fillRect(38, 63, 30, 4);

        // Bồn chứa (storage tank)
        g.fillStyle(0x2e86c1, 0.8);
        g.fillEllipse(90, 65, 26, 20);
        g.lineStyle(1.5, 0x1a5276, 0.8);
        g.strokeEllipse(90, 65, 26, 20);

        // Cột đốt khí (flare stack)
        g.fillStyle(0x7f8c8d, 1);
        g.fillRect(96, 28, 4, 30);
        // Lửa đốt khí màu cam / vàng
        g.fillStyle(0xe67e22, 0.95);
        g.fillEllipse(98, 22, 14, 16);
        g.fillStyle(0xf39c12, 0.8);
        g.fillEllipse(98, 18, 9, 11);
        g.fillStyle(0xffd32a, 0.6);
        g.fillEllipse(98, 14, 5, 7);
        // Khói nhẹ
        g.fillStyle(0xb2bec3, 0.2);
        g.fillCircle(100, 10, 5);
        g.fillCircle(103, 6, 3);

        g.generateTexture('oil_rig', 120, 120);
        g.destroy();
    }

    // ============================================================
    // 18. HẠT THỜI TIẾT (Mưa, Sương mù)
    // ============================================================
    _genWeatherParticles() {
        // Hạt mưa rơi
        const rainG = this.make.graphics({ x: 0, y: 0, add: false });
        rainG.lineStyle(1.5, 0x74b9ff, 0.7);
        rainG.lineBetween(0, 0, 4, 18);
        rainG.generateTexture('rain_drop', 6, 20);
        rainG.destroy();

        // Hạt sương mù
        const fogG = this.make.graphics({ x: 0, y: 0, add: false });
        fogG.fillStyle(0xdfe6e9, 0.15);
        fogG.fillCircle(30, 30, 30);
        fogG.generateTexture('fog_cloud', 60, 60);
        fogG.destroy();
    }

    // ============================================================
    // 19. ĐẠN THƯỜNG (bullet_player, bullet_enemy)
    // ============================================================
    _genBullets() {
        const bPlayer = this.make.graphics({ x: 0, y: 0, add: false });
        bPlayer.fillStyle(0x00d2ff, 1);
        bPlayer.fillCircle(6, 6, 4.5);
        bPlayer.fillStyle(0xffffff, 1);
        bPlayer.fillCircle(6, 6, 2);
        bPlayer.generateTexture('bullet_player', 12, 12);
        bPlayer.destroy();

        const bEnemy = this.make.graphics({ x: 0, y: 0, add: false });
        bEnemy.fillStyle(0xff4757, 1);
        bEnemy.fillCircle(6, 6, 4.5);
        bEnemy.fillStyle(0xffbe76, 1);
        bEnemy.fillCircle(6, 6, 2);
        bEnemy.generateTexture('bullet_enemy', 12, 12);
        bEnemy.destroy();
    }

    // ============================================================
    // 20. TILE ĐẠI DƯƠNG (128x128 px)
    //     Nâng cấp: sóng gợn tinh tế hơn, màu đại dương sâu thẳm
    // ============================================================
    _genOceanTile() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Nền đại dương sâu thẳm
        g.fillStyle(0x071520, 1);
        g.fillRect(0, 0, 128, 128);

        // Gợn sóng dài (long swells) — horizontal bands
        g.fillStyle(0x0a2030, 0.5);
        g.fillRect(0, 18, 128, 6);
        g.fillRect(0, 50, 128, 5);
        g.fillRect(0, 80, 128, 6);
        g.fillRect(0, 108, 128, 5);

        // Gợn sóng nhỏ (capillary waves) — dạng đường lượn
        g.lineStyle(1, 0x0e3a56, 0.5);
        // Hàng 1
        g.beginPath();
        g.moveTo(0, 12); g.lineTo(16, 9); g.lineTo(32, 12); g.lineTo(48, 9);
        g.lineTo(64, 12); g.lineTo(80, 9); g.lineTo(96, 12); g.lineTo(112, 9); g.lineTo(128, 12);
        g.strokePath();
        // Hàng 2
        g.beginPath();
        g.moveTo(0, 38); g.lineTo(20, 35); g.lineTo(40, 38); g.lineTo(60, 35);
        g.lineTo(80, 38); g.lineTo(100, 35); g.lineTo(120, 38); g.lineTo(128, 36);
        g.strokePath();
        // Hàng 3
        g.beginPath();
        g.moveTo(0, 68); g.lineTo(22, 65); g.lineTo(44, 68); g.lineTo(66, 65);
        g.lineTo(88, 68); g.lineTo(110, 65); g.lineTo(128, 67);
        g.strokePath();
        // Hàng 4
        g.beginPath();
        g.moveTo(0, 96); g.lineTo(18, 93); g.lineTo(36, 96); g.lineTo(54, 93);
        g.lineTo(72, 96); g.lineTo(90, 93); g.lineTo(108, 96); g.lineTo(128, 93);
        g.strokePath();

        // Điểm ánh sáng phản chiếu mặt trời (specular highlights)
        g.fillStyle(0x1a6a9e, 0.2);
        g.fillEllipse(32, 30, 22, 6);
        g.fillEllipse(90, 60, 18, 5);
        g.fillEllipse(55, 92, 24, 6);
        g.fillEllipse(110, 112, 16, 4);

        // Tia phản chiếu tinh tế
        g.fillStyle(0x3490c8, 0.1);
        g.fillEllipse(64, 64, 60, 14);

        // Bọt sóng nhỏ (foam dots)
        g.fillStyle(0x112b45, 0.6);
        g.fillCircle(20, 22, 2);
        g.fillCircle(70, 44, 1.5);
        g.fillCircle(100, 76, 2);
        g.fillCircle(40, 103, 1.5);

        g.generateTexture('ocean_tile', 128, 128);
        g.destroy();
    }

    // ============================================================
    // 21. [MỚI] SMOKE PUFF - Khói trắng mờ (20x20 px)
    //     Dùng cho hiệu ứng thiệt hại (modular damage smoke)
    // ============================================================
    _genSmokePuff() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Lớp ngoài khói nhạt
        g.fillStyle(0xdfe6e9, 0.12);
        g.fillCircle(10, 10, 10);

        // Lớp giữa đậm hơn
        g.fillStyle(0xb2bec3, 0.22);
        g.fillCircle(10, 10, 7);

        // Lõi khói trắng
        g.fillStyle(0xecf0f1, 0.35);
        g.fillCircle(10, 10, 4);

        // Điểm sáng tâm
        g.fillStyle(0xffffff, 0.2);
        g.fillCircle(9, 8, 2);

        g.generateTexture('smoke_puff', 20, 20);
        g.destroy();
    }

    // ============================================================
    // 22. [MỚI] EXPLOSION FLASH - Tia sáng nổ (32x32 px)
    //     Dùng cho hiệu ứng vụ nổ
    // ============================================================
    _genExplosionFlash() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Hào quang ngoài vàng nhạt
        g.fillStyle(0xffeaa7, 0.15);
        g.fillCircle(16, 16, 16);

        // Vòng cam
        g.fillStyle(0xf39c12, 0.3);
        g.fillCircle(16, 16, 12);

        // Lõi vàng trắng
        g.fillStyle(0xffd32a, 0.6);
        g.fillCircle(16, 16, 8);

        // Tia sáng (starburst rays)
        g.lineStyle(2, 0xffeaa7, 0.5);
        g.lineBetween(16, 2, 16, 10);
        g.lineBetween(16, 22, 16, 30);
        g.lineBetween(2, 16, 10, 16);
        g.lineBetween(22, 16, 30, 16);
        g.lineBetween(6, 6, 11, 11);
        g.lineBetween(21, 21, 26, 26);
        g.lineBetween(26, 6, 21, 11);
        g.lineBetween(11, 21, 6, 26);

        // Lõi trắng trung tâm
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(16, 16, 4);

        g.generateTexture('explosion_flash', 32, 32);
        g.destroy();
    }

    // ============================================================
    // 23. [MỚI] TORPEDO - Ngư lôi trắng bạc (10x24 px)
    //     Dùng cho vũ khí ngư lôi của tàu khu trục
    // ============================================================
    _genTorpedo() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Thân ngư lôi trắng bạc hình trụ
        g.fillStyle(0xdfe6e9, 1);
        g.fillRoundedRect(2, 3, 6, 18, 2);

        // Đường viền kim loại
        g.lineStyle(1, 0x95a5a6, 0.9);
        g.strokeRoundedRect(2, 3, 6, 18, 2);

        // Đầu đạn mũi nhọn (warhead)
        g.fillStyle(0xecf0f1, 1);
        g.fillTriangle(5, 0, 2, 5, 8, 5);

        // Dải màu phân biệt (identification band)
        g.fillStyle(0x3498db, 0.8);
        g.fillRect(2, 8, 6, 3);

        // Vây lái đuôi
        g.fillStyle(0xb2bec3, 1);
        g.fillRect(0, 18, 4, 4);  // cánh trái
        g.fillRect(6, 18, 4, 4);  // cánh phải

        // Động cơ đẩy đuôi
        g.fillStyle(0x74b9ff, 0.6);
        g.fillEllipse(5, 23, 4, 3);

        g.generateTexture('torpedo', 10, 24);
        g.destroy();
    }

    _genCombatJuiceEffects() {
        // 1. Foam Particle (Bọt nước trắng xóa đuôi tàu)
        const foam = this.make.graphics({ x: 0, y: 0, add: false });
        foam.fillStyle(0xffffff, 0.95);
        foam.fillCircle(8, 8, 7);
        foam.fillStyle(0xdff9fb, 0.7);
        foam.fillCircle(8, 8, 4);
        foam.generateTexture('foam_particle', 16, 16);
        foam.destroy();

        // 2. Water Ripple (Vòng tròn sóng lan tỏa khi đạn rơi xuống biển)
        const ripple = this.make.graphics({ x: 0, y: 0, add: false });
        ripple.lineStyle(2, 0x81ecec, 0.9);
        ripple.strokeCircle(24, 24, 22);
        ripple.lineStyle(1.5, 0xffffff, 0.6);
        ripple.strokeCircle(24, 24, 14);
        ripple.generateTexture('water_ripple', 48, 48);
        ripple.destroy();

        // 3. Muzzle Flash (Chớp lửa đầu nòng pháo)
        const muzzle = this.make.graphics({ x: 0, y: 0, add: false });
        muzzle.fillStyle(0xfffa65, 1);
        muzzle.fillCircle(12, 12, 10);
        muzzle.fillStyle(0xff3838, 0.8);
        muzzle.fillTriangle(12, 0, 4, 18, 20, 18);
        muzzle.fillStyle(0xffffff, 1);
        muzzle.fillCircle(12, 12, 5);
        muzzle.generateTexture('muzzle_flash', 24, 24);
        muzzle.destroy();

        // 4. Fire Particle (Ngọn lửa cháy dữ dội khi tàu dưới 20% máu)
        const fire = this.make.graphics({ x: 0, y: 0, add: false });
        fire.fillStyle(0xff4d4d, 0.9);
        fire.fillCircle(10, 10, 8);
        fire.fillStyle(0xfffa65, 0.95);
        fire.fillCircle(10, 8, 5);
        fire.generateTexture('fire_particle', 20, 20);
        fire.destroy();
    }
}
