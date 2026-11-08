/**
 * FleetManageScene.js - Giao diện Quản lý Hạm đội & Kỹ năng Chỉ huy
 * 
 * Tính năng chính:
 * 1. Xem hình ảnh minh họa chi tiết từng lớp tàu chiến (CVN-78, Khu trục, Tuần dương, F-35C)
 * 2. Bảng so sánh chỉ số trực quan (Máu, Giáp, Tốc độ, Tầm hỏa lực, Tên lửa Tomahawk)
 * 3. Cho phép người chơi chọn 1 trong 3 Kỹ Năng Chỉ Huy Đặc Biệt trước trận đấu!
 */

import { ShipConfig } from '../config/ShipConfig.js';
import { GameConfig } from '../config/GameConfig.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class FleetManageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FleetManageScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.bg = this.add.tileSprite(width / 2, height / 2, width, height, 'ocean_tile');

        // Lưới tactical
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

        // Tiêu đề
        this.add.text(width / 2, 45, 'QUẢN LÝ HẠM ĐỘI & KỸ NĂNG CHỈ HUY (FLEET COMMAND)', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            letterSpacing: 2
        }).setOrigin(0.5);

        this.add.text(width / 2, 75, 'SO SÁNH THÔNG SỐ CHIẾN HẠM & CHỌN KỸ NĂNG CHỦ ĐỘNG CHO TRẬN ĐẤU', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#00d2ff'
        }).setOrigin(0.5);

        // Danh sách các tàu và tiêm kích để xem và quản lý
        this.shipList = [
            { key: 'fortress', name: 'Soái Hạm Citadel', type: 'Căn cứ phòng thủ Chiến dịch', sprite: 'campaign_fortress_hull', data: ShipConfig.campaign_fortress },
            { key: 'carrier', name: 'Soái hạm Citadel (CVN-78)', type: 'Soái hạm Hộ tống / Hành động', sprite: 'carrier_hull', data: ShipConfig.player },
            { key: 'battleship', name: 'Thiết giáp hạm Iowa', type: 'Pháo hạm hạng nặng 406mm', sprite: 'ally_battleship_hull', data: ShipConfig.allies.battleship },
            { key: 'cruiser', name: 'Tuần dương Ticonderoga', type: 'Tuần dương hạm tên lửa', sprite: 'ally_cruiser_hull', data: ShipConfig.allies.cruiser },
            { key: 'destroyer', name: 'Khu trục Arleigh Burke', type: 'Tàu khu trục hộ tống', sprite: 'ally_destroyer_hull', data: ShipConfig.allies.destroyer },
            { key: 'frigate', name: 'Hộ vệ hạm Constellation', type: 'Phòng không cơ động cao', sprite: 'ally_frigate_hull', data: ShipConfig.allies.frigate },
            { key: 'jet', name: 'Tiêm kích F-35C', type: 'Không kích tàng hình', sprite: 'fighter_jet', data: ShipConfig.aircraft.fighter_jet },
            { key: 'jet_faxx', name: 'Tiêm kích F/A-XX', type: 'Thế hệ 6 Stealth', sprite: 'jet_faxx', data: ShipConfig.aircraft.fighter_faxx },
            { key: 'jet_ngad', name: 'Siêu tiêm kích F/A-47 NGAD', type: 'Ưu thế trên không VIP', sprite: 'jet_ngad', data: ShipConfig.aircraft.fighter_ngad }
        ];

        this.selectedShipIndex = 0;

        // 1. CỘT TRÁI: DANH SÁCH CHỌN TÀU (TABS)
        this.createShipTabs(80, 110);

        // 2. KHUNG GIỮA: MINH HỌA TÀU & VŨ KHÍ
        this.createShipPreviewBox(width * 0.45, 330);

        // 3. CỘT PHẢI: BẢNG CHỌN KỸ NĂNG CHỈ HUY (COMMANDER SKILLS)
        this.createCommanderSkillBox(width - 290, 120);

        // 4. KHUNG CHỌN ĐỘI HÌNH CHIẾN THUẬT (FLEET FORMATIONS)
        this.createFormationSelector(width * 0.45, height - 105);

        // Nút điều hướng chân trang
        this.createFooterButtons(width, height);
    }

    createShipTabs(x, y) {
        this.tabContainers = [];

        this.shipList.forEach((ship, index) => {
            const tabY = y + index * 56;
            const tab = this.add.container(x, tabY);

            const bg = this.add.graphics();
            const title = this.add.text(12, 8, ship.name, {
                fontFamily: 'system-ui, sans-serif',
                fontSize: '12px',
                fontStyle: 'bold',
                color: '#ffffff'
            });

            const type = this.add.text(12, 28, ship.type, {
                fontFamily: 'system-ui, sans-serif',
                fontSize: '10px',
                color: '#74b9ff'
            });

            tab.add([bg, title, type]);
            tab.setSize(220, 50);
            tab.setInteractive({ useHandCursor: true });

            tab.on('pointerdown', () => {
                this.selectedShipIndex = index;
                this.updateShipTabs();
                this.updateShipPreview();
            });

            this.tabContainers.push({ tab, bg, index });
        });

        this.updateShipTabs();
    }

    updateShipTabs() {
        this.tabContainers.forEach(item => {
            const isSelected = (item.index === this.selectedShipIndex);
            item.bg.clear();
            if (isSelected) {
                item.bg.fillStyle(0x0e273c, 0.95);
                item.bg.lineStyle(2, 0x00d2ff, 1);
            } else {
                item.bg.fillStyle(0x061423, 0.7);
                item.bg.lineStyle(1, 0x2f3640, 0.7);
            }
            item.bg.fillRoundedRect(0, 0, 220, 50, 6);
            item.bg.strokeRoundedRect(0, 0, 220, 50, 6);
        });
    }

    createShipPreviewBox(centerX, centerY) {
        this.previewContainer = this.add.container(centerX, centerY);

        const boxW = 460;
        const boxH = 430;

        const bg = this.add.graphics();
        bg.fillStyle(0x061423, 0.92);
        bg.lineStyle(2, 0x1f4068, 0.9);
        bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
        bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);

        this.previewSprite = this.add.sprite(0, -90, 'carrier_hull');
        this.previewSprite.setScale(1.2);

        this.previewTitle = this.add.text(0, 15, '', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.previewSub = this.add.text(0, 38, '', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#00d2ff'
        }).setOrigin(0.5);

        // Thanh so sánh thông số (Comparison Stat Bars)
        this.statBarsGraphics = this.add.graphics();

        this.previewContainer.add([bg, this.previewSprite, this.previewTitle, this.previewSub, this.statBarsGraphics]);

        this.updateShipPreview();
    }

    updateShipPreview() {
        const ship = this.shipList[this.selectedShipIndex];
        this.previewSprite.setTexture(ship.sprite);
        this.previewTitle.setText(ship.name);

        const allyReqs = { frigate: 1, destroyer: 2, cruiser: 3, battleship: 4, carrier: 5 };
        const reqStage = allyReqs[ship.key];
        const isUnlocked = reqStage ? (SaveManager.isAllyUnlocked ? SaveManager.isAllyUnlocked(ship.key) : true) : true;
        const statusText = reqStage
            ? (isUnlocked ? `✔ ĐÃ MỞ KHÓA (Triệu hồi: $${ship.data.cost})` : `🔒 KHÓA (Vượt Màn ${reqStage - 1} để mở)`)
            : ship.type;
        this.previewSub.setText(statusText);
        this.previewSub.setColor(isUnlocked ? '#00d2ff' : '#e74c3c');

        if (ship.key === 'jet') {
            this.previewSprite.setScale(2.2);
        } else if (ship.key === 'carrier') {
            this.previewSprite.setScale(1.15);
        } else {
            this.previewSprite.setScale(1.3);
        }

        // Vẽ thanh so sánh thông số (HP, Giáp, Tốc độ, Hỏa lực Tomahawk)
        this.statBarsGraphics.clear();

        const stats = [
            { label: 'Máu tối đa (HP)', val: ship.data.maxHp, max: 2400, color: 0x2ecc71, text: `${ship.data.maxHp} HP` },
            { label: 'Giáp hợp kim', val: ship.data.armor || 5, max: 35, color: 0x3498db, text: `${ship.data.armor || 5} Giáp` },
            { label: 'Tốc độ hải hành', val: ship.data.speed, max: 320, color: 0xf1c40f, text: `${ship.data.speed} knots` },
            { label: 'Slot Tên lửa Tomahawk', val: ship.data.missileSlots || 1, max: 2, color: 0xe74c3c, text: `${ship.data.missileSlots || 1} Khẩu VLS` }
        ];

        const startY = 70;
        const barW = 260;
        const barH = 12;

        stats.forEach((st, idx) => {
            const py = startY + idx * 34;

            // Nhãn chỉ số
            this.statBarsGraphics.lineStyle(1, 0x415b76, 0.5);
            this.statBarsGraphics.fillStyle(0x1e272e, 1);
            this.statBarsGraphics.fillRoundedRect(-barW / 2, py + 12, barW, barH, 2);
            this.statBarsGraphics.strokeRoundedRect(-barW / 2, py + 12, barW, barH, 2);

            const fillW = Math.max(8, (st.val / st.max) * barW);
            this.statBarsGraphics.fillStyle(st.color, 1);
            this.statBarsGraphics.fillRoundedRect(-barW / 2, py + 12, fillW, barH, 2);
        });
    }

    createCommanderSkillBox(x, y) {
        const width = 340;
        const container = this.add.container(x, y);

        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x061423, 0.95);
        headerBg.lineStyle(2, 0xf1c40f, 0.9);
        headerBg.fillRoundedRect(0, 0, width, 430, 8);
        headerBg.strokeRoundedRect(0, 0, width, 430, 8);

        const title = this.add.text(width / 2, 22, 'CHỌN KỸ NĂNG CHỈ HUY [PHÍM F]', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#f1c40f'
        }).setOrigin(0.5);

        const sub = this.add.text(width / 2, 42, 'Chọn 1 kỹ năng chủ động đem vào trận đấu', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#a4b0be'
        }).setOrigin(0.5);

        container.add([headerBg, title, sub]);

        // 3 Thẻ Kỹ năng
        const skills = Object.values(GameConfig.commanderSkills);
        this.skillCards = [];

        skills.forEach((sk, idx) => {
            const cardY = 65 + idx * 115;
            const card = this.createSingleSkillCard(15, cardY, width - 30, sk);
            container.add(card.container);
            this.skillCards.push(card);
        });

        this.updateSelectedSkillVisuals();
    }

    createSingleSkillCard(x, y, w, skill) {
        const h = 100;
        const container = this.add.container(x, y);

        const bg = this.add.graphics();

        const icon = this.add.text(12, 12, skill.icon, { fontSize: '24px' });
        const name = this.add.text(48, 12, skill.name, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff'
        });

        const cdLabel = this.add.text(48, 30, `Hồi chiêu: ${skill.cooldown / 1000}s`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#f1c40f'
        });

        const desc = this.add.text(12, 50, skill.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            color: '#bdc3c7',
            wordWrap: { width: w - 24 }
        });

        container.add([bg, icon, name, cdLabel, desc]);
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerdown', () => {
            SoundManager.playEquip();
            SaveManager.setSelectedSkill(skill.id);
            this.updateSelectedSkillVisuals();
        });

        return { container, bg, skill, w, h };
    }

    updateSelectedSkillVisuals() {
        const currentSkillId = SaveManager.getSelectedSkill();
        this.skillCards.forEach(card => {
            const isSelected = (card.skill.id === currentSkillId);
            card.bg.clear();
            if (isSelected) {
                card.bg.fillStyle(0x0e273c, 0.95);
                card.bg.lineStyle(2, 0x2ecc71, 1);
            } else {
                card.bg.fillStyle(0x0a141e, 0.7);
                card.bg.lineStyle(1, 0x415b76, 0.5);
            }
            card.bg.fillRoundedRect(0, 0, card.w, card.h, 6);
            card.bg.strokeRoundedRect(0, 0, card.w, card.h, 6);
        });
    }

    /**
     * KHUNG CHỌN ĐỘI HÌNH CHIẾN THUẬT HẠM ĐỘI (FLEET FORMATIONS)
     */
    createFormationSelector(centerX, centerY) {
        const width = 460;
        const height = 80;
        const container = this.add.container(centerX, centerY);

        const bg = this.add.graphics();
        bg.fillStyle(0x061423, 0.94);
        bg.lineStyle(1.5, 0x00d2ff, 0.85);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);

        const title = this.add.text(0, -26, 'SƠ ĐỒ ĐỘI HÌNH CHIẾN THUẬT HẠM ĐỘI', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#00d2ff'
        }).setOrigin(0.5);

        container.add([bg, title]);

        const forms = Object.values(GameConfig.formations || {});
        this.formationBtns = [];

        forms.forEach((form, idx) => {
            const btnX = -150 + idx * 150;
            const btnY = 8;
            const btnContainer = this.add.container(btnX, btnY);

            const bBg = this.add.graphics();
            const bTxt = this.add.text(0, 0, form.name.split(' (')[0], {
                fontFamily: 'system-ui, sans-serif',
                fontSize: '10px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);

            btnContainer.add([bBg, bTxt]);
            btnContainer.setSize(135, 28);
            btnContainer.setInteractive({ useHandCursor: true });

            btnContainer.on('pointerdown', () => {
                SoundManager.playEquip();
                SaveManager.setSelectedFormation(form.id);
                this.updateFormationVisuals();
            });

            container.add(btnContainer);
            this.formationBtns.push({ btnContainer, bBg, form });
        });

        this.updateFormationVisuals();
    }

    updateFormationVisuals() {
        const curForm = SaveManager.getSelectedFormation ? SaveManager.getSelectedFormation() : 'LINE';
        if (!this.formationBtns) return;

        this.formationBtns.forEach(item => {
            const isSel = (item.form.id === curForm);
            item.bBg.clear();
            if (isSel) {
                item.bBg.fillStyle(0x27ae60, 0.95);
                item.bBg.lineStyle(1.5, 0x2ecc71, 1);
            } else {
                item.bBg.fillStyle(0x0e273c, 0.7);
                item.bBg.lineStyle(1, 0x415b76, 0.5);
            }
            item.bBg.fillRoundedRect(-65, -14, 130, 28, 4);
            item.bBg.strokeRoundedRect(-65, -14, 130, 28, 4);
        });
    }

    createFooterButtons(width, height) {
        const btnY = height - 50;

        this.createFooterBtn(width * 0.2, btnY, '◀ VỀ MENU', 0x70a1ff, () => {
            this.scene.start('MenuScene');
        });

        this.createFooterBtn(width * 0.5, btnY, '⚙ TRUNG TÂM NÂNG CẤP', 0xf1c40f, () => {
            this.scene.start('UpgradeScene');
        });

        this.createFooterBtn(width * 0.8, btnY, '🗺 VÀO HẢI ĐỒ CHIẾN DỊCH ▶', 0x2ecc71, () => {
            this.scene.start('StageMapScene');
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
}
