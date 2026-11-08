/**
 * MenuScene.js - Màn hình Menu Chính (Main Menu) - Phiên bản Nâng cấp
 * 
 * Thiết kế theo phong cách Giao diện Chỉ huy Chiến thuật Hải quân Hiện đại.
 * Cung cấp đầy đủ: Xuất Trận, Hải đồ Chiến dịch, Quản lý Hạm đội,
 * Chế độ Sinh tồn Vô tận, Trung tâm Nâng cấp.
 */

import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        SoundManager.ensureContext();
        SoundManager.playMainMenuBGM();
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 1. Nền biển chuyển động nhẹ (Background Ocean Tile)
        this.bg = this.add.tileSprite(width / 2, height / 2, width, height, 'ocean_tile');

        // Lưới radar chiến thuật
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x00d2ff, 0.06);
        for (let x = 80; x < width; x += 80) {
            grid.moveTo(x, 0); grid.lineTo(x, height);
        }
        for (let y = 80; y < height; y += 80) {
            grid.moveTo(0, y); grid.lineTo(width, y);
        }
        grid.strokePath();

        // 2. Hiệu ứng quét Radar vòng tròn (Tactical Radar Sweep)
        this.radarRing = this.add.circle(width / 2, height / 2, 80, 0x00d2ff, 0.04);
        this.radarRing.setStrokeStyle(1.5, 0x00d2ff, 0.2);
        this.tweens.add({
            targets: this.radarRing,
            radius: 420,
            alpha: 0,
            duration: 3200,
            repeat: -1,
            ease: 'Cubic.out'
        });

        // Vòng radar thứ 2 lệch pha
        const ring2 = this.add.circle(width / 2, height / 2, 80, 0x00d2ff, 0.02);
        ring2.setStrokeStyle(1, 0x00d2ff, 0.12);
        this.tweens.add({
            targets: ring2,
            radius: 420,
            alpha: 0,
            duration: 3200,
            delay: 1600,
            repeat: -1,
            ease: 'Cubic.out'
        });

        // 3. TIÊU ĐỀ GAME (Game Title)
        // Đường kẻ trang trí trên
        const topLine = this.add.graphics();
        topLine.lineStyle(1.5, 0x00d2ff, 0.5);
        topLine.moveTo(width / 2 - 280, 75);
        topLine.lineTo(width / 2 + 280, 75);
        topLine.strokePath();

        this.add.text(width / 2, 58, '— CHIẾN DỊCH BÌNH MINH THẦN SẤM —', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            color: '#00d2ff',
            letterSpacing: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, 98, 'FLEET COMBAT: SHATTERED SEAS', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '42px',
            fontStyle: '900',
            color: '#ffffff',
            stroke: '#003d8a',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 4, color: '#0052cc', blur: 12, fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, 138, 'OPERATION THUNDER DAWN  ·  7 SECTORS  ·  ENDLESS SURVIVAL', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '11px',
            color: '#5dade2',
            letterSpacing: 3
        }).setOrigin(0.5);

        // Đường kẻ trang trí dưới
        const midLine = this.add.graphics();
        midLine.lineStyle(1, 0x1f4068, 0.8);
        midLine.moveTo(width / 2 - 320, 155);
        midLine.lineTo(width / 2 + 320, 155);
        midLine.strokePath();

        // 4. Minh họa Tàu sân bay mẹ & Tiêm kích tại trung tâm menu
        const previewCarrier = this.add.sprite(width / 2, 270, 'carrier_hull');
        previewCarrier.setScale(1.08);

        // 2 khẩu pháo tự vệ nhỏ
        const turret1 = this.add.sprite(width / 2 - 22, 285, 'carrier_turret_small');
        const turret2 = this.add.sprite(width / 2 + 24, 274, 'carrier_turret_small');

        const previewJet1 = this.add.sprite(width / 2 - 95, 232, 'fighter_jet');
        previewJet1.setScale(0.88); previewJet1.angle = -22;

        const previewJet2 = this.add.sprite(width / 2 + 100, 232, 'fighter_jet');
        previewJet2.setScale(0.88); previewJet2.angle = 22;

        const previewJet3 = this.add.sprite(width / 2 - 138, 215, 'fighter_jet');
        previewJet3.setScale(0.65); previewJet3.angle = -15; previewJet3.setAlpha(0.7);

        const previewJet4 = this.add.sprite(width / 2 + 142, 215, 'fighter_jet');
        previewJet4.setScale(0.65); previewJet4.angle = 15; previewJet4.setAlpha(0.7);

        // Hiệu ứng thở nhẹ cho chiến hạm
        this.tweens.add({
            targets: [previewCarrier, turret1, turret2],
            y: '+=7',
            duration: 2000,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: [previewJet1, previewJet2],
            y: '+=11',
            duration: 1300,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: [previewJet3, previewJet4],
            y: '+=8',
            duration: 1700,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 400
        });

        // Hiển thị Xu Nâng cấp hiện có
        const tokens = SaveManager.getTokens ? SaveManager.getTokens() : 0;
        const tokenBg = this.add.graphics();
        tokenBg.fillStyle(0x0a1929, 0.9);
        tokenBg.lineStyle(1, 0xf1c40f, 0.7);
        tokenBg.fillRoundedRect(width - 200, 12, 188, 36, 5);
        tokenBg.strokeRoundedRect(width - 200, 12, 188, 36, 5);
        this.add.text(width - 106, 30, `⭐ XU NÂNG CẤP: ${tokens}`, {
            fontFamily: 'system-ui, monospace',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#f1c40f'
        }).setOrigin(0.5);

        // 5. CÁC NÚT ĐIỀU HƯỚNG CHÍNH (Buttons) - 2 cột
        const btnCenterX = width / 2;
        const startY = 380;
        const gap = 50;

        // Chế độ 1: CHIẾN DỊCH PHÒNG THỦ CỐT TRUYỆN (RTS Tower Defense Căn cứ pháo đài)
        this.createButton(btnCenterX - 140, startY, '🛡 CHIẾN DỊCH PHÒNG THỦ (RTS)', 0x00d2ff, () => {
            this.registry.set('gameMode', 'campaign');
            this.registry.set('isEndlessMode', false);
            this.scene.start('StageMapScene');
        }, 270);

        // Chế độ 2: CHẾ ĐỘ HÀNH ĐỘNG (ACTION MODE - Tự do lái CVN-78 bằng WASD)
        this.createButton(btnCenterX + 140, startY, '⚡ CHẾ ĐỘ HÀNH ĐỘNG (ACTION WASD)', 0x2ed573, () => {
            this.registry.set('gameMode', 'action');
            this.registry.set('isEndlessMode', false);
            this.registry.set('selectedStage', 1);
            this.scene.start('ActionModeScene');
        }, 270);

        // Hàng 2: Quản lý hạm đội & Cửa hàng
        this.createButton(btnCenterX - 140, startY + gap, '🚢 QUẢN LÝ HẠM ĐỘI & ĐÔ ĐỐC', 0x1abc9c, () => {
            this.scene.start('FleetManageScene');
        }, 270);

        this.createButton(btnCenterX + 140, startY + gap, '🛒 KHO VŨ KHÍ & TRANG BỊ', 0xf39c12, () => {
            this.scene.start('ShopScene');
        }, 270);

        // Hàng 3: Sinh tồn vô tận
        this.createButton(btnCenterX, startY + gap * 2, '♾ SINH TỒN VÔ TẬN (ENDLESS SURVIVAL)', 0xff4757, () => {
            this.registry.set('gameMode', 'campaign');
            this.registry.set('isEndlessMode', true);
            this.registry.set('selectedStage', 1);
            this.scene.start('CampaignModeScene');
        }, 360);

        // 6. KHUNG HƯỚNG DẪN ĐIỀU KHIỂN
        const guideY = height - 68;
        const guideBg = this.add.graphics();
        guideBg.fillStyle(0x050e1d, 0.92);
        guideBg.lineStyle(1, 0x1f4068, 0.9);
        guideBg.fillRoundedRect(width / 2 - 430, guideY - 34, 860, 68, 6);
        guideBg.strokeRoundedRect(width / 2 - 430, guideY - 34, 860, 68, 6);

        this.add.text(width / 2, guideY - 16, '— HƯỚNG DẪN TÁC CHIẾN —', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#00d2ff',
            letterSpacing: 3
        }).setOrigin(0.5);

        this.add.text(width / 2, guideY + 7, '[WASD] Di chuyển   [E] Tomahawk   [F] Kỹ năng Chỉ huy   [1..4] Triệu hồi   [Z/X] Thu phóng   [Click] Hướng tàu', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#c8d6e5'
        }).setOrigin(0.5);

        // Nhãn phiên bản góc dưới trái
        this.add.text(14, height - 14, 'v2.0 — OPERATION THUNDER DAWN EDITION', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#34495e'
        });
    }

    update() {
        if (this.bg) {
            this.bg.tilePositionX += 0.3;
            this.bg.tilePositionY += 0.15;
        }
    }

    /**
     * Tạo nút bấm phong cách quân sự hiện đại có hiệu ứng Hover & Click
     * @param {number} x - Tọa độ X trung tâm nút
     * @param {number} y - Tọa độ Y trung tâm nút
     * @param {string} text - Chữ hiển thị
     * @param {number} accentColor - Màu viền và hover
     * @param {Function} callback - Hành động khi nhấn
     * @param {number} [btnWidth=380] - Chiều rộng nút
     */
    createButton(x, y, text, accentColor, callback, btnWidth = 380) {
        const btnHeight = 44;
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        const drawBg = (hovered) => {
            bg.clear();
            bg.fillStyle(hovered ? accentColor : 0x0b1e31, hovered ? 0.22 : 0.9);
            bg.lineStyle(hovered ? 2 : 1.5, accentColor, hovered ? 1 : 0.75);
            bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 5);
            bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 5);
        };
        drawBg(false);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, label]);
        container.setSize(btnWidth, btnHeight);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => { drawBg(true); container.setScale(1.03); });
        container.on('pointerout', () => { drawBg(false); container.setScale(1.0); });
        container.on('pointerdown', () => {
            SoundManager.playClick();
            container.setScale(0.97);
            callback();
        });

        return container;
    }
}
