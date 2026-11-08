/**
 * ShopScene.js - Cửa hàng Trang bị & Tùy biến Slot Vũ khí (Equipment Shop & Customization)
 * 
 * Tính năng chính:
 * 1. Quản lý 4 Slot vũ khí của Soái hạm Tàu Sân Bay CVN-78:
 *    - Slot 1 & 2: Pháo hạm (Mark 45 Mod 4 -> Mark 45 Mod 4M)
 *    - Slot 3: Tên lửa chống hạm ASM (Tomahawk Block V -> Tomahawk Block Va)
 *    - Slot 4: Hangar Không quân (F-35C Lightning II -> F/A-XX -> F/A-47 NGAD)
 * 2. Mua sắm trang bị bằng Xu Nâng cấp (Upgrade Tokens) tích lũy được sau các chiến dịch
 * 3. Tháo/Lắp trang bị tự do vào các Slot tương ứng
 */

import { SaveManager } from '../managers/SaveManager.js';
import { WeaponConfig } from '../config/WeaponConfig.js';
import { ShipConfig } from '../config/ShipConfig.js';
import { SoundManager } from '../managers/SoundManager.js';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.bg = this.add.tileSprite(width / 2, height / 2, width, height, 'ocean_tile');

        // Lưới chiến thuật
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x00d2ff, 0.1);
        for (let x = 60; x < width; x += 60) {
            grid.moveTo(x, 20); grid.lineTo(x, height - 20);
        }
        for (let y = 60; y < height; y += 60) {
            grid.moveTo(20, y); grid.lineTo(width - 20, y);
        }
        grid.strokePath();

        // Tiêu đề
        this.add.text(width / 2, 40, 'KHO VŨ KHÍ & TÙY BIẾN TRANG BỊ', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            letterSpacing: 2
        }).setOrigin(0.5);

        this.add.text(width / 2, 68, 'THAY THẾ & LẮP ĐẶT VŨ KHÍ', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#00d2ff'
        }).setOrigin(0.5);

        // Hiển thị Xu
        this.createTokenHUD(width - 180, 42);

        // 1. CỘT TRÁI: 4 SLOT HIỆN TẠI CỦA TÀU MẸ (SLOT OVERVIEW)
        this.createSlotPanel(260, 310);

        // 2. CỘT PHẢI: DANH SÁCH MẶT HÀNG TRONG KHO (CATALOG)
        this.createCatalogPanel(width - 400, 310);

        // Nút chân trang
        this.createFooter(width, height);
    }

    createTokenHUD(x, y) {
        const box = this.add.graphics();
        box.fillStyle(0x061527, 0.9);
        box.lineStyle(1.5, 0xf1c40f, 0.9);
        box.fillRoundedRect(-110, -20, 220, 40, 6);
        box.strokeRoundedRect(-110, -20, 220, 40, 6);

        this.tokenText = this.add.text(x, y, `⭐ XU NÂNG CẤP: ${SaveManager.getTokens()}`, {
            fontFamily: 'system-ui, monospace',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#f1c40f'
        }).setOrigin(0.5);

        const container = this.add.container(x, y);
        container.add(box);
    }

    createSlotPanel(centerX, centerY) {
        const panelW = 440;
        const panelH = 430;

        const bg = this.add.graphics();
        bg.fillStyle(0x061423, 0.94);
        bg.lineStyle(1.8, 0x00d2ff, 0.85);
        bg.fillRoundedRect(centerX - panelW / 2, centerY - panelH / 2, panelW, panelH, 8);
        bg.strokeRoundedRect(centerX - panelW / 2, centerY - panelH / 2, panelW, panelH, 8);

        this.add.text(centerX, centerY - panelH / 2 + 25, 'SLOT VŨ KHÍ TÀU MẸ', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff',
            letterSpacing: 1
        }).setOrigin(0.5);

        this.slotCards = [];
        const slotKeys = ['slot1', 'slot2', 'slot3', 'slot4'];
        const slotTitles = [
            { key: 'slot1', label: 'SLOT 1: PHÁO HẠM (MẠN TRÁI)', type: 'cannon' },
            { key: 'slot2', label: 'SLOT 2: PHÁO HẠM (MẠN PHẢI)', type: 'cannon' },
            { key: 'slot3', label: 'SLOT 3: TÊN LỬA CHỐNG HẠM', type: 'missile' },
            { key: 'slot4', label: 'SLOT 4: HANGAR PHI ĐỘI MÁY BAY', type: 'hangar' }
        ];

        slotTitles.forEach((slot, idx) => {
            const cardY = centerY - 130 + idx * 88;
            const card = this.createSingleSlotCard(centerX, cardY, panelW - 40, slot);
            this.slotCards.push(card);
        });
    }

    createSingleSlotCard(x, y, w, slotDef) {
        const h = 76;
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        const title = this.add.text(-w / 2 + 15, -24, slotDef.label, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#00d2ff'
        });

        const currentItemText = this.add.text(-w / 2 + 15, -4, '', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#ffffff'
        });

        const statsText = this.add.text(-w / 2 + 15, 16, '', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            color: '#bdc3c7'
        });

        container.add([bg, title, currentItemText, statsText]);

        const cardObj = { container, bg, title, currentItemText, statsText, w, h, slotDef };
        this.renderSlotCard(cardObj);
        return cardObj;
    }

    renderSlotCard(card) {
        const equippedId = SaveManager.getEquippedSlot(card.slotDef.key);
        let itemName = 'Chưa lắp';
        let stats = '';

        if (card.slotDef.type === 'cannon') {
            const cfg = WeaponConfig[equippedId] || WeaponConfig.ags155;
            itemName = cfg.name;
            stats = `Sát thương: ${cfg.damage} | Tầm: ${cfg.range}m | Nạp: ${cfg.cooldown}ms | Mục tiêu: Tàu chiến (Ship Only)`;
        } else if (card.slotDef.type === 'missile') {
            const cfg = WeaponConfig[equippedId] || WeaponConfig.tomahawk_carrier;
            itemName = cfg.name;
            stats = `Sát thương AoE: ${cfg.damage} | Tầm: ${cfg.range}m | Tốc độ: ${cfg.speed} | Máu: ${cfg.maxHp || 40}HP`;
        } else if (card.slotDef.type === 'hangar') {
            const cfg = ShipConfig.aircraft[equippedId] || ShipConfig.aircraft.fighter_jet;
            itemName = `${cfg.name} (Tối đa 12 chiếc - 4 Phi đội)`;
            stats = `Máu: ${cfg.maxHp}HP | Tốc độ: ${cfg.speed} | Tầm tác chiến: ${cfg.attackRange}m`;
        }

        card.currentItemText.setText(itemName);
        card.statsText.setText(stats);

        card.bg.clear();
        card.bg.fillStyle(0x0e273c, 0.9);
        card.bg.lineStyle(1.5, 0x1abc9c, 0.8);
        card.bg.fillRoundedRect(-card.w / 2, -card.h / 2, card.w, card.h, 6);
        card.bg.strokeRoundedRect(-card.w / 2, -card.h / 2, card.w, card.h, 6);
    }

    createCatalogPanel(centerX, centerY) {
        const panelW = 540;
        const panelH = 430;

        const bg = this.add.graphics();
        bg.fillStyle(0x061423, 0.94);
        bg.lineStyle(1.8, 0xf1c40f, 0.85);
        bg.fillRoundedRect(centerX - panelW / 2, centerY - panelH / 2, panelW, panelH, 8);
        bg.strokeRoundedRect(centerX - panelW / 2, centerY - panelH / 2, panelW, panelH, 8);

        this.add.text(centerX, centerY - panelH / 2 + 25, 'CỬA HÀNG TRANG BỊ & NÂNG CẤP VŨ KHÍ', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#f1c40f',
            letterSpacing: 1
        }).setOrigin(0.5);

        // Danh sách vũ khí nâng cấp bán trong Shop
        this.shopItems = [
            {
                id: 'ags155',
                name: 'Pháo hạm AGS-155 (155mm Tiên Tiến)',
                type: 'cannon',
                targetSlots: ['slot1', 'slot2'],
                cost: 4,
                desc: 'Sát thương cực mạnh, nạp nhanh, tầm bắn xa. Hệ thống tính góc đón đường bắn tàu địch chính xác tuyệt đối (Shiptarget Only).',
                color: 0x00d2ff
            },
            {
                id: 'cps',
                name: 'Tên lửa Siêu thanh CPS (Conventional Prompt Strike)',
                type: 'missile',
                targetSlots: ['slot3'],
                cost: 5,
                desc: 'Tốc độ siêu thanh Mach 5+, sát thương AoE hủy diệt. Sát thương tất cả mục tiêu!',
                color: 0x00f2fe
            },
            {
                id: 'fighter_faxx',
                name: 'Tiêm kích Thế hệ 6 F/A-XX',
                type: 'hangar',
                targetSlots: ['slot4'],
                cost: 3,
                desc: 'Tốc độ cao hơn F35, Máu trâu hơn, tầm tác chiến được nâng cấp. Thay thế toàn bộ tiêm kích F35C.',
                color: 0xf1c40f
            },
            {
                id: 'fighter_ngad',
                name: 'tiêm kích tương lai F/A-47 NGAD',
                type: 'hangar',
                targetSlots: ['slot4'],
                cost: 7,
                desc: 'Đỉnh cao không chiến tương lai! Máu 210 HP, tốc độ 390, tầm tác chiến 430m, kháng phòng không cực cao.',
                color: 0xff4757
            },
            {
                id: 'cattnoriel',
                name: 'Đô đốc Cattnoriel (Bổ nhiệm)',
                type: 'admiral',
                targetSlots: [],
                cost: 6,
                desc: '+25% sát thương tàu con đồng minh và +20% tiền thưởng khi diệt địch.',
                color: 0x9b59b6
            },
            {
                id: 'xtobian',
                name: 'Đô đốc Hạm Đội Xtobian',
                type: 'admiral',
                targetSlots: [],
                cost: 12,
                desc: 'tăng 50% tầm quét Radar, sát thương, tăng 30% tốc độ nạp đạn và tiền thưởng.',
                color: 0xf1c40f
            }
        ];

        // Container cuộn cho danh sách vật phẩm
        this.catalogListContainer = this.add.container(centerX, centerY - panelH / 2 + 50);

        // Vùng mặt nạ che (Mask) để không bị tràn ra ngoài khung
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(centerX - panelW / 2 + 10, centerY - panelH / 2 + 45, panelW - 20, panelH - 60);
        const mask = maskShape.createGeometryMask();
        this.catalogListContainer.setMask(mask);

        this.shopCards = [];
        const cardSpacing = 82;
        this.shopItems.forEach((item, idx) => {
            const cardY = 45 + idx * cardSpacing;
            const card = this.createSingleShopCard(0, cardY, panelW - 40, item);
            this.catalogListContainer.add(card.container);
            this.shopCards.push(card);
        });

        // Tính toán giới hạn cuộn
        const totalContentHeight = this.shopItems.length * cardSpacing + 20;
        const viewHeight = panelH - 65;
        this.minCatalogScrollY = centerY - panelH / 2 + 50 - Math.max(0, totalContentHeight - viewHeight);
        this.maxCatalogScrollY = centerY - panelH / 2 + 50;

        // Bắt sự kiện cuộn chuột (Mouse Wheel)
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (pointer.x >= centerX - panelW / 2 && pointer.x <= centerX + panelW / 2 &&
                pointer.y >= centerY - panelH / 2 && pointer.y <= centerY + panelH / 2) {
                const targetY = Phaser.Math.Clamp(
                    this.catalogListContainer.y - deltaY * 0.5,
                    this.minCatalogScrollY,
                    this.maxCatalogScrollY
                );
                this.catalogListContainer.y = targetY;
            }
        });
    }

    createSingleShopCard(x, y, w, item) {
        const h = 76;
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        const title = this.add.text(-w / 2 + 15, -24, item.name, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff'
        });

        const desc = this.add.text(-w / 2 + 15, -4, item.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            color: '#bdc3c7',
            wordWrap: { width: w - 170 }
        });

        // Nút Mua hoặc Lắp
        const btnContainer = this.add.container(w / 2 - 70, 0);
        const btnBg = this.add.graphics();
        const btnLabel = this.add.text(0, 0, '', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        btnContainer.add([btnBg, btnLabel]);
        btnContainer.setSize(120, 36);
        btnContainer.setInteractive({ useHandCursor: true });

        container.add([bg, title, desc, btnContainer]);

        const cardObj = { container, bg, title, desc, btnContainer, btnBg, btnLabel, w, h, item };
        this.renderShopCard(cardObj);

        btnContainer.on('pointerdown', () => {
            this.handleShopAction(item);
        });

        return cardObj;
    }

    renderShopCard(card) {
        const hasItem = SaveManager.hasItem(card.item.id);
        const tokens = SaveManager.getTokens();

        let isEquipped = false;
        if (card.item.type === 'admiral') {
            isEquipped = (SaveManager.getSelectedAdmiral() === card.item.id);
        } else {
            card.item.targetSlots.forEach(s => {
                if (SaveManager.getEquippedSlot(s) === card.item.id) isEquipped = true;
            });
        }

        card.bg.clear();
        card.bg.fillStyle(0x0e273c, 0.9);
        card.bg.lineStyle(1.5, card.item.color, 0.75);
        card.bg.fillRoundedRect(-card.w / 2, -card.h / 2, card.w, card.h, 6);
        card.bg.strokeRoundedRect(-card.w / 2, -card.h / 2, card.w, card.h, 6);

        card.btnBg.clear();
        if (isEquipped) {
            card.btnBg.fillStyle(0x27ae60, 0.9);
            card.btnLabel.setText(card.item.type === 'admiral' ? '✔ ĐANG BỔ NHIỆM' : '✔ ĐANG LẮP');
        } else if (hasItem) {
            card.btnBg.fillStyle(0x2980b9, 0.9);
            card.btnLabel.setText(card.item.type === 'admiral' ? '🎖 BỔ NHIỆM' : '⚙ LẮP VÀO TÀU');
        } else if (tokens >= card.item.cost) {
            card.btnBg.fillStyle(0xd35400, 0.9);
            card.btnLabel.setText(`MUA (-${card.item.cost}⭐)`);
        } else {
            card.btnBg.fillStyle(0x7f8c8d, 0.5);
            card.btnLabel.setText(`CẦN ${card.item.cost}⭐`);
        }
        card.btnBg.fillRoundedRect(-60, -16, 120, 32, 4);
    }

    handleShopAction(item) {
        const hasItem = SaveManager.hasItem(item.id);

        if (!hasItem) {
            if (SaveManager.buyItem(item.id, item.cost)) {
                SoundManager.playUpgrade();
                if (item.type === 'admiral') {
                    SaveManager.setSelectedAdmiral(item.id);
                } else if (item.targetSlots.length > 0) {
                    SaveManager.equipSlot(item.targetSlots[0], item.id);
                }
                this.refreshUI();
            } else {
                SoundManager.playClick();
            }
        } else {
            SoundManager.playEquip();
            if (item.type === 'admiral') {
                SaveManager.setSelectedAdmiral(item.id);
            } else if (item.type === 'cannon') {
                const cur1 = SaveManager.getEquippedSlot('slot1');
                if (cur1 !== item.id) {
                    SaveManager.equipSlot('slot1', item.id);
                } else {
                    SaveManager.equipSlot('slot2', item.id);
                }
            } else if (item.targetSlots.length > 0) {
                SaveManager.equipSlot(item.targetSlots[0], item.id);
            }
            this.refreshUI();
        }
    }

    refreshUI() {
        if (this.tokenText) {
            this.tokenText.setText(`⭐ XU NÂNG CẤP: ${SaveManager.getTokens()}`);
        }
        this.slotCards.forEach(c => this.renderSlotCard(c));
        this.shopCards.forEach(c => this.renderShopCard(c));
    }

    createFooter(width, height) {
        const btnY = height - 48;

        this.createFooterBtn(width * 0.2, btnY, '◀ QUAY VỀ MENU', 0x70a1ff, () => {
            this.scene.start('MenuScene');
        });

        this.createFooterBtn(width * 0.5, btnY, '⚙ TRUNG TÂM NÂNG CẤP', 0xf1c40f, () => {
            this.scene.start('UpgradeScene');
        });

        this.createFooterBtn(width * 0.8, btnY, '⚔ XUẤT TRẬN HẢI CHIẾN ▶', 0x2ecc71, () => {
            this.scene.start('BattleScene');
        });
    }

    createFooterBtn(x, y, text, color, callback) {
        const btn = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x0e273c, 0.9);
        bg.lineStyle(1.5, color, 0.8);
        bg.fillRoundedRect(-110, -18, 220, 36, 4);
        bg.strokeRoundedRect(-110, -18, 220, 36, 4);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.add([bg, label]);
        btn.setSize(220, 36);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setScale(1.04));
        btn.on('pointerout', () => btn.setScale(1.0));
        btn.on('pointerdown', () => {
            SoundManager.playClick();
            callback();
        });
    }

    update() {
        if (this.bg) {
            this.bg.tilePositionX += 0.25;
            this.bg.tilePositionY += 0.12;
        }
    }
}
