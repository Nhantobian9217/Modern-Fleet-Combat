/**
 * UpgradeScene.js - Trung tâm Nâng cấp Hạm đội Vĩnh viễn (Fleet Upgrade Terminal)
 * 
 * - Quản lý Xu nâng cấp (Upgrade Tokens) tích lũy được sau mỗi trận thắng (+3 xu/trận)
 * - 4 Hạng mục nâng cấp (mỗi hạng mục tối đa 10 cấp, mỗi cấp +5% sức mạnh):
 *   1. Tầm quét Radar & Khóa tên lửa
 *   2. Sát thương Pháo & Tên lửa Tomahawk
 *   3. Lượng máu tối đa của Tàu sân bay mẹ
 *   4. Tốc độ di chuyển & Khởi động động cơ
 * - Nút Tẩy điểm hoàn trả toàn bộ xu để người chơi tự do thử nghiệm build khác nhau
 */

import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 1. Nền hải quân công nghệ cao
        this.bg = this.add.tileSprite(width / 2, height / 2, width, height, 'ocean_tile');

        // Lưới tactical grid
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x00d2ff, 0.12);
        for (let x = 60; x < width; x += 60) {
            grid.moveTo(x, 20);
            grid.lineTo(x, height - 20);
        }
        for (let y = 60; y < height; y += 60) {
            grid.moveTo(20, y);
            grid.lineTo(width - 20, y);
        }
        grid.strokePath();

        // 2. TIÊU ĐỀ TERMINAL
        this.add.text(width / 2, 50, 'TRUNG TÂM NÂNG CẤP HẠM ĐỘI (FLEET UPGRADE TERMINAL)', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#ffffff',
            letterSpacing: 2
        }).setOrigin(0.5);

        this.add.text(width / 2, 82, 'NÂNG CẤP HIỆU LỰC VĨNH VIỄN CHO MỌI CHIẾN DỊCH (MỖI CẤP +5%)', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            color: '#00d2ff'
        }).setOrigin(0.5);

        // 3. HIỂN THỊ XU NÂNG CẤP TÍCH LŨY
        this.createTokenDisplay(width / 2, 130);

        // 4. BỐN KHUNG NÂNG CẤP (UPGRADE CARDS)
        this.cards = [];
        const cardWidth = 260;
        const spacing = 280;
        const startX = width / 2 - (spacing * 1.5);
        const cardY = 320;

        const statDefs = [
            {
                key: 'radar',
                title: 'TẦM QUÉT RADAR',
                sub: 'Radar & Khóa Tên lửa',
                desc: 'Mở rộng bán kính dẫn bắn tên lửa Tomahawk và tầm tác chiến tiêm kích F-35C.',
                color: 0x00d2ff,
                icon: '📡'
            },
            {
                key: 'damage',
                title: 'HỎA LỰC TÁC CHIẾN',
                sub: 'Sát thương Pháo & Tên lửa',
                desc: 'Tăng sức công phá của pháo hạm, súng máy tiêm kích và tên lửa Tomahawk AoE.',
                color: 0xff4757,
                icon: '💥'
            },
            {
                key: 'hp',
                title: 'ĐỘ BỀN THÂN TÀU',
                sub: 'Máu Tối Đa Tàu Mẹ',
                desc: 'Gia cố giáp hợp kim giúp tăng lượng HP tối đa của tàu sân bay CVN-78.',
                color: 0x2ecc71,
                icon: '🛡'
            },
            {
                key: 'speed',
                title: 'CÔNG SUẤT ĐỘNG CƠ',
                sub: 'Tốc độ & Cơ động',
                desc: 'Nâng cấp lò phản ứng hạt nhân giúp tăng tốc độ di chuyển và độ nhạy bẻ lái.',
                color: 0xf1c40f,
                icon: '⚡'
            }
        ];

        statDefs.forEach((def, index) => {
            const cardX = startX + index * spacing;
            const card = this.createStatUpgradeCard(cardX, cardY, cardWidth, def);
            this.cards.push(card);
        });

        // 5. CÁC NÚT ĐIỀU HƯỚNG DƯỚI ĐÁY
        this.createBottomButtons(width, height);
    }

    createTokenDisplay(x, y) {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x061527, 0.9);
        bg.lineStyle(2, 0xf1c40f, 0.9);
        bg.fillRoundedRect(-180, -22, 360, 44, 6);
        bg.strokeRoundedRect(-180, -22, 360, 44, 6);

        this.tokenText = this.add.text(0, 0, `⬡ XU NÂNG CẤP HIỆN CÓ: ${SaveManager.getTokens()}`, {
            fontFamily: 'system-ui, monospace',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#f1c40f'
        }).setOrigin(0.5);

        container.add([bg, this.tokenText]);
    }

    createStatUpgradeCard(x, y, width, def) {
        const height = 300;
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x061527, 0.92);
        bg.lineStyle(1.5, def.color, 0.8);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

        // Icon & Tiêu đề
        const iconText = this.add.text(0, -115, def.icon, { fontSize: '28px' }).setOrigin(0.5);

        const titleText = this.add.text(0, -80, def.title, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        const subText = this.add.text(0, -60, def.sub, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: Phaser.Display.Color.IntegerToColor(def.color).rgba
        }).setOrigin(0.5);

        // Thanh 10 nấc cấp độ (10 Level Pips)
        const pipsGraphics = this.add.graphics();

        const levelLabel = this.add.text(0, 5, '', {
            fontFamily: 'monospace',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        const descText = this.add.text(0, 48, def.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#a4b0be',
            align: 'center',
            wordWrap: { width: width - 24 }
        }).setOrigin(0.5);

        // Nút nâng cấp
        const btnUpgrade = this.add.container(0, 112);
        const btnBg = this.add.graphics();
        const btnLabel = this.add.text(0, 0, 'NÂNG CẤP (-1 XU)', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        btnUpgrade.add([btnBg, btnLabel]);
        btnUpgrade.setSize(width - 40, 36);
        btnUpgrade.setInteractive({ useHandCursor: true });

        btnUpgrade.on('pointerdown', () => {
            if (SaveManager.upgradeStat(def.key)) {
                SoundManager.playUpgrade();
                this.updateAllCards();
                // Hiệu ứng nháy xanh
                this.tweens.add({
                    targets: container,
                    scale: 1.04,
                    duration: 100,
                    yoyo: true
                });
            } else {
                SoundManager.playClick();
            }
        });

        container.add([bg, iconText, titleText, subText, pipsGraphics, levelLabel, descText, btnUpgrade]);

        const cardObj = {
            def,
            container,
            pipsGraphics,
            levelLabel,
            btnBg,
            btnLabel,
            width,
            height
        };

        this.renderCardState(cardObj);
        return cardObj;
    }

    renderCardState(card) {
        const lvl = SaveManager.getUpgradeLevel(card.def.key);
        const tokens = SaveManager.getTokens();
        const isMax = lvl >= 10;
        const canAfford = tokens >= 1 && !isMax;

        // Vẽ 10 ô cấp độ
        card.pipsGraphics.clear();
        const pipW = 16;
        const pipH = 10;
        const gap = 5;
        const startX = -((10 * (pipW + gap) - gap) / 2);
        const pipY = -30;

        for (let i = 0; i < 10; i++) {
            const px = startX + i * (pipW + gap);
            if (i < lvl) {
                card.pipsGraphics.fillStyle(card.def.color, 1);
            } else {
                card.pipsGraphics.fillStyle(0x1a2634, 1);
            }
            card.pipsGraphics.fillRoundedRect(px, pipY, pipW, pipH, 2);
            card.pipsGraphics.lineStyle(1, 0x415b76, 0.5);
            card.pipsGraphics.strokeRoundedRect(px, pipY, pipW, pipH, 2);
        }

        const bonusPercent = lvl * 5;
        card.levelLabel.setText(`CẤP ${lvl}/10 (+${bonusPercent}%)`);

        // Vẽ nút nâng cấp
        card.btnBg.clear();
        if (isMax) {
            card.btnBg.fillStyle(0x27ae60, 0.85);
            card.btnLabel.setText('ĐÃ ĐẠT TỐI ĐA (MAX)');
        } else if (canAfford) {
            card.btnBg.fillStyle(card.def.color, 0.85);
            card.btnLabel.setText('NÂNG CẤP (-1 XU)');
        } else {
            card.btnBg.fillStyle(0x2c3e50, 0.5);
            card.btnLabel.setText('THIẾU XU (CẦN 1)');
        }
        card.btnBg.fillRoundedRect(-(card.width - 40) / 2, -18, card.width - 40, 36, 4);
    }

    updateAllCards() {
        this.tokenText.setText(`⬡ XU NÂNG CẤP HIỆN CÓ: ${SaveManager.getTokens()}`);
        this.cards.forEach(card => this.renderCardState(card));
    }

    createBottomButtons(width, height) {
        const btnY = height - 55;

        // 1. Nút Tẩy điểm nâng cấp
        this.createFooterButton(width * 0.2, btnY, '🔄 TẨY ĐIỂM HOÀN XU', 0xe74c3c, () => {
            const refunded = SaveManager.resetUpgrades();
            this.updateAllCards();
        });

        // 2. Nút Cửa hàng Slot vũ khí
        this.createFooterButton(width * 0.42, btnY, '🛒 KHO VŨ KHÍ & SLOT', 0x1abc9c, () => {
            this.scene.start('ShopScene');
        });

        // 3. Nút Quay về Menu
        this.createFooterButton(width * 0.64, btnY, '◀ QUAY VỀ MENU', 0x70a1ff, () => {
            this.scene.start('MenuScene');
        });

        // 4. Nút Vào Hải đồ Chiến dịch
        this.createFooterButton(width * 0.86, btnY, '🗺 HẢI ĐỒ CHIẾN DỊCH ▶', 0x2ecc71, () => {
            this.scene.start('StageMapScene');
        });
    }

    createFooterButton(x, y, text, color, callback) {
        const btn = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x0a192f, 0.9);
        bg.lineStyle(1.5, color, 0.8);
        bg.fillRoundedRect(-110, -20, 220, 40, 4);
        bg.strokeRoundedRect(-110, -20, 220, 40, 4);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.add([bg, label]);
        btn.setSize(220, 40);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setScale(1.05);
            bg.clear();
            bg.fillStyle(color, 0.3);
            bg.lineStyle(2, color, 1);
            bg.fillRoundedRect(-110, -20, 220, 40, 4);
            bg.strokeRoundedRect(-110, -20, 220, 40, 4);
        });

        btn.on('pointerout', () => {
            btn.setScale(1.0);
            bg.clear();
            bg.fillStyle(0x0a192f, 0.9);
            bg.lineStyle(1.5, color, 0.8);
            bg.fillRoundedRect(-110, -20, 220, 40, 4);
            bg.strokeRoundedRect(-110, -20, 220, 40, 4);
        });

        btn.on('pointerdown', () => {
            SoundManager.playClick();
            callback();
        });
    }
}
