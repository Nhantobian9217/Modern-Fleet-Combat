/**
 * TitleScene.js - Màn hình Khởi động Ngoài cùng (Landing / Title Screen)
 * 
 * Hiển thị Tên trò chơi: MODERN FLEET COMBAT
 * và Nút Bắt đầu (START) để tiến vào Menu Lựa chọn Chế độ & Quản lý Hạm đội.
 */

import { SoundManager } from '../managers/SoundManager.js';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        SoundManager.ensureContext();
        SoundManager.playMainMenuBGM();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 1. Nền đại dương sâu thẳm
        this.bg = this.add.tileSprite(width / 2, height / 2, width, height, 'ocean_tile');

        // Lưới tọa độ chiến thuật
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x00d2ff, 0.08);
        for (let x = 80; x < width; x += 80) {
            grid.moveTo(x, 0); grid.lineTo(x, height);
        }
        for (let y = 80; y < height; y += 80) {
            grid.moveTo(0, y); grid.lineTo(width, y);
        }
        grid.strokePath();

        // 2. Vòng tròn quét Radar định vị hạm đội
        this.radarRing = this.add.circle(width / 2, height / 2, 60, 0x00d2ff, 0.05);
        this.radarRing.setStrokeStyle(1.5, 0x00d2ff, 0.25);
        this.tweens.add({
            targets: this.radarRing,
            radius: 500,
            alpha: 0,
            duration: 3600,
            repeat: -1,
            ease: 'Cubic.out'
        });

        // 3. Logo / Tàu sân bay nổi bật ở nền giữa
        const carrierBackdrop = this.add.sprite(width / 2, height / 2 - 20, 'carrier_hull');
        carrierBackdrop.setScale(1.6);
        carrierBackdrop.setAlpha(0.22);
        carrierBackdrop.setAngle(25);

        // 4. TIÊU ĐỀ CHÍNH CỦA GAME
        const titleBadge = this.add.text(width / 2, height * 0.28, '⚓ NAVAL TACTICAL COMMAND SIMULATOR ⚓', {
            fontFamily: 'monospace',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#00d2ff',
            letterSpacing: 4
        }).setOrigin(0.5);

        const mainTitle = this.add.text(width / 2, height * 0.38, 'MODERN FLEET COMBAT', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '48px',
            fontStyle: '900',
            color: '#ffffff',
            stroke: '#00d2ff',
            strokeThickness: 3,
            letterSpacing: 6,
            shadow: { offsetX: 0, offsetY: 8, color: '#00f2fe', blur: 24, stroke: true, fill: true }
        }).setOrigin(0.5);

        const subTitle = this.add.text(width / 2, height * 0.48, 'CHIẾN HẠM HẢI QUÂN HIỆN ĐẠI • TÁC CHIẾN HÀNG HẢI CHIẾN LƯỢC', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#74b9ff',
            letterSpacing: 2
        }).setOrigin(0.5);

        // Hiệu ứng thở nhẹ cho tiêu đề
        this.tweens.add({
            targets: mainTitle,
            scale: 1.03,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 5. NÚT START TRUNG TÂM
        this.createStartButton(width / 2, height * 0.68);

        // 6. THÔNG TIN PHIÊN BẢN & BẢN QUYỀN
        this.add.text(width / 2, height - 35, 'PHASER 3 ENGINE • BẢN CẬP NHẬT TOÀN DIỆN V2.5 • SẴN SÀNG TÁC CHIẾN', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#57606f'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        if (this.bg) {
            this.bg.tilePositionY += 0.3;
            this.bg.tilePositionX += 0.2;
        }
    }

    createStartButton(x, y) {
        const btn = this.add.container(x, y);

        const btnW = 280;
        const btnH = 64;

        const glowBg = this.add.graphics();
        glowBg.fillStyle(0x00d2ff, 0.15);
        glowBg.fillRoundedRect(-btnW / 2 - 8, -btnH / 2 - 8, btnW + 16, btnH + 16, 12);

        const bg = this.add.graphics();
        bg.fillStyle(0x0984e3, 0.95);
        bg.lineStyle(2.5, 0x00d2ff, 1);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);

        const label = this.add.text(0, 0, '▶ START / BẮT ĐẦU', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '20px',
            fontStyle: '900',
            color: '#ffffff',
            letterSpacing: 2
        }).setOrigin(0.5);

        btn.add([glowBg, bg, label]);
        btn.setSize(btnW, btnH);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setScale(1.06);
            bg.clear();
            bg.fillStyle(0x00cec9, 1);
            bg.lineStyle(3, 0xffffff, 1);
            bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
            bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        });

        btn.on('pointerout', () => {
            btn.setScale(1.0);
            bg.clear();
            bg.fillStyle(0x0984e3, 0.95);
            bg.lineStyle(2.5, 0x00d2ff, 1);
            bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
            bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 8);
        });

        btn.on('pointerdown', () => {
            SoundManager.playClick();
            this.cameras.main.flash(400, 0, 210, 255, 0.3);
            this.time.delayedCall(250, () => {
                this.scene.start('MenuScene');
            });
        });

        // Nhấp nháy nhẹ viền
        this.tweens.add({
            targets: glowBg,
            alpha: 0.3,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
}
