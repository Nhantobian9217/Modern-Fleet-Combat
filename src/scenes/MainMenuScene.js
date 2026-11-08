/**
 * MainMenuScene.js - Màn hình Menu Chính (Main Menu) - Kiến trúc Phân Tách Mới
 * 
 * Cung cấp điều hướng chọn chế độ chơi rõ ràng:
 * 1. CHIẾN DỊCH PHÒNG THỦ (CAMPAIGN RTS): Tàu mẹ Citadel cố định, thả quân Click-to-Move, địch đi theo Checkpoint
 * 2. CHẾ ĐỘ HÀNH ĐỘNG (ACTION MODE): Lái tàu tự do bằng phím WASD, xả pháo và tiêm kích
 * 3. SINH TỒN VÔ TẬN (ENDLESS SURVIVAL): Vượt qua các đợt hạm đội vô tận
 * 4. QUẢN LÝ HẠM ĐỘI & KHO VŨ KHÍ: Nâng cấp, thay slot vũ khí, chọn đô đốc
 */

import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class MainMenuScene extends Phaser.Scene {
    constructor(key = 'MainMenuScene') {
        super({ key: key });
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

        this.add.text(width / 2, 98, 'MODERN FLEET COMBAT: SHATTERED SEAS', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '38px',
            fontStyle: '900',
            color: '#ffffff',
            stroke: '#003d8a',
            strokeThickness: 4,
            shadow: { offsetX: 0, offsetY: 4, color: '#0052cc', blur: 12, fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, 138, 'SOÁI HẠM CITADEL  ·  HẢI CHIẾN CHIẾN THUẬT RTS  ·  CHẾ ĐỘ HÀNH ĐỘNG', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '11px',
            color: '#5dade2',
            letterSpacing: 3
        }).setOrigin(0.5);

        // 4. KHUNG PREVIEW CHIẾN HẠM TRUNG TÂM
        const previewCitadel = this.add.sprite(width / 2, 255, 'campaign_fortress_hull');
        previewCitadel.setScale(0.85);
        previewCitadel.setAngle(90); // Xoay ngang đẹp mắt
        previewCitadel.setDepth(2);

        // 2 Tháp pháo minh họa
        const turret1 = this.add.sprite(width / 2 - 35, 230, 'carrier_turret_small');
        const turret2 = this.add.sprite(width / 2 + 35, 230, 'carrier_turret_small');
        turret1.setScale(0.9);
        turret2.setScale(0.9);
        turret1.setDepth(3);
        turret2.setDepth(3);

        // Hiệu ứng thở nhẹ cho chiến hạm
        this.tweens.add({
            targets: [previewCitadel, turret1, turret2],
            y: '+=6',
            duration: 2000,
            yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Hiển thị Xu Nâng cấp hiện có (Góc trên phải)
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

        // Nút Reset Tiến Trình (Góc trên trái)
        this.createButton(100, 30, '🔄 RESET TIẾN TRÌNH', 0xff4757, () => {
            this.showResetConfirmDialog(width, height);
        }, 160);

        // 5. CÁC NÚT ĐIỀU HƯỚNG CHÍNH (Buttons)
        const btnCenterX = width / 2;
        const startY = 375;
        const gap = 52;

        // Chế độ 1: CHIẾN DỊCH PHÒNG THỦ CỐT TRUYỆN (RTS Tower Defense Căn cứ Citadel)
        this.createButton(btnCenterX - 145, startY, '🛡 CHIẾN DỊCH PHÒNG THỦ (RTS)', 0x00d2ff, () => {
            this.registry.set('gameMode', 'campaign');
            this.registry.set('isEndlessMode', false);
            this.scene.start('StageMapScene');
        }, 280);

        // Chế độ 2: CHẾ ĐỘ HÀNH ĐỘNG (ACTION WASD)
        this.createButton(btnCenterX + 145, startY, '⚡ CHẾ ĐỘ HÀNH ĐỘNG (ACTION WASD)', 0x2ed573, () => {
            this.registry.set('gameMode', 'action');
            this.registry.set('isEndlessMode', false);
            this.registry.set('selectedStage', 1);
            this.scene.start('ActionModeScene');
        }, 280);

        // Hàng 2: Quản lý hạm đội & Cửa hàng
        this.createButton(btnCenterX - 145, startY + gap, '🚢 QUẢN LÝ HẠM ĐỘI & ĐÔ ĐỐC', 0x1abc9c, () => {
            this.scene.start('FleetManageScene');
        }, 280);

        this.createButton(btnCenterX + 145, startY + gap, '🛒 KHO VŨ KHÍ & TRANG BỊ', 0xf39c12, () => {
            this.scene.start('ShopScene');
        }, 280);

        // Hàng 3: Sinh tồn vô tận
        this.createButton(btnCenterX, startY + gap * 2, '♾ SINH TỒN VÔ TẬN (ENDLESS SURVIVAL)', 0xff4757, () => {
            this.registry.set('gameMode', 'campaign');
            this.registry.set('isEndlessMode', true);
            this.registry.set('selectedStage', 1);
            this.scene.start('CampaignModeScene');
        }, 360);

        // 6. KHUNG HƯỚNG DẪN ĐIỀU KHIỂN
        const guideY = height - 55;
        const guideBg = this.add.graphics();
        guideBg.fillStyle(0x050e1d, 0.92);
        guideBg.lineStyle(1, 0x1f4068, 0.9);
        guideBg.fillRoundedRect(width / 2 - 450, guideY - 26, 900, 52, 6);
        guideBg.strokeRoundedRect(width / 2 - 450, guideY - 26, 900, 52, 6);

        this.add.text(width / 2, guideY - 10, '— HƯỚNG DẪN TÁC CHIẾN —', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#00d2ff',
            letterSpacing: 2
        }).setOrigin(0.5);

        this.add.text(width / 2, guideY + 8, 'CHIẾN DỊCH: Click chọn tàu con -> Click bản đồ để điều quân  |  HÀNH ĐỘNG: Phím [W][A][S][D] lái tàu  |  [Q] Tiêm kích  |  [1-5] Gọi tàu  |  [E] Tomahawk', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10.5px',
            color: '#74b9ff'
        }).setOrigin(0.5);
    }

    createButton(x, y, text, color, callback, width = 230) {
        const height = 40;
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x071526, 0.92);
        bg.lineStyle(1.5, color, 0.85);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);

        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, btnText]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(color, 0.35);
            bg.lineStyle(2, color, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
            btnText.setColor('#ffffff');
            this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 100 });
        });

        container.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x071526, 0.92);
            bg.lineStyle(1.5, color, 0.85);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
            this.tweens.add({ targets: container, scaleX: 1.0, scaleY: 1.0, duration: 100 });
        });

        container.on('pointerdown', () => {
            SoundManager.playClick();
            callback();
        });

        return container;
    }

    /**
     * Hộp thoại xác nhận Reset Tiến Trình Toàn Bộ
     */
    showResetConfirmDialog(width, height) {
        if (this.resetModal) this.resetModal.destroy();

        const modal = this.add.container(0, 0);
        modal.setDepth(100);
        this.resetModal = modal;

        // Lớp phủ mờ chặn tương tác bên dưới
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.82);
        overlay.setInteractive();

        // Khung hộp thoại
        const box = this.add.graphics();
        box.fillStyle(0x0a1420, 0.98);
        box.lineStyle(2, 0xff4757, 1);
        box.fillRoundedRect(width / 2 - 240, height / 2 - 140, 480, 280, 8);
        box.strokeRoundedRect(width / 2 - 240, height / 2 - 140, 480, 280, 8);

        const title = this.add.text(width / 2, height / 2 - 105, '⚠️ XÁC NHẬN ĐẶT LẠI TIẾN TRÌNH', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ff4757'
        }).setOrigin(0.5);

        const warningMsg = this.add.text(width / 2, height / 2 - 30, 
            'Bạn có chắc chắn muốn xóa toàn bộ tiến trình chiến dịch?\n\n' +
            '• Tiến trình sẽ quay trở về Màn 1 (Sector 01)\n' +
            '• Khóa lại tất cả tàu con (chỉ giữ lại Hộ Vệ Hạm)\n' +
            '• Đặt lại toàn bộ số sao đánh giá (3 sao) của các màn\n' +
            '• Đặt lại toàn bộ Xu nâng cấp và Trang bị về ban đầu', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            lineSpacing: 4,
            align: 'center',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        // Nút Xác nhận Reset (Đỏ)
        const confirmBtn = this.add.container(width / 2 - 100, height / 2 + 85);
        const cfBg = this.add.graphics();
        cfBg.fillStyle(0xc0392b, 0.95);
        cfBg.lineStyle(1.5, 0xff4757, 1);
        cfBg.fillRoundedRect(-85, -18, 170, 36, 4);
        cfBg.strokeRoundedRect(-85, -18, 170, 36, 4);
        const cfText = this.add.text(0, 0, 'XÁC NHẬN RESET', {
            fontFamily: 'system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        confirmBtn.add([cfBg, cfText]);
        confirmBtn.setSize(170, 36);
        confirmBtn.setInteractive({ useHandCursor: true });
        confirmBtn.on('pointerover', () => confirmBtn.setScale(1.05));
        confirmBtn.on('pointerout', () => confirmBtn.setScale(1.0));
        confirmBtn.on('pointerdown', () => {
            SoundManager.playClick();
            SaveManager.resetProgress();
            modal.destroy();
            this.scene.restart();
        });

        // Nút Hủy Bỏ (Xám xanh)
        const cancelBtn = this.add.container(width / 2 + 100, height / 2 + 85);
        const ccBg = this.add.graphics();
        ccBg.fillStyle(0x34495e, 0.95);
        ccBg.lineStyle(1.5, 0x7f8c8d, 1);
        ccBg.fillRoundedRect(-85, -18, 170, 36, 4);
        ccBg.strokeRoundedRect(-85, -18, 170, 36, 4);
        const ccText = this.add.text(0, 0, 'HỦY BỎ', {
            fontFamily: 'system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5);
        cancelBtn.add([ccBg, ccText]);
        cancelBtn.setSize(170, 36);
        cancelBtn.setInteractive({ useHandCursor: true });
        cancelBtn.on('pointerover', () => cancelBtn.setScale(1.05));
        cancelBtn.on('pointerout', () => cancelBtn.setScale(1.0));
        cancelBtn.on('pointerdown', () => {
            SoundManager.playClick();
            modal.destroy();
        });

        modal.add([overlay, box, title, warningMsg, confirmBtn, cancelBtn]);
    }

    update() {
        if (this.bg) {
            this.bg.tilePositionX += 0.3;
            this.bg.tilePositionY += 0.15;
        }
    }
}

// Giữ tương thích ngược với import MenuScene
export const MenuScene = MainMenuScene;
