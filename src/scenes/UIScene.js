/**
 * UIScene.js - Giao diện Tác chiến, Thanh Chuẩn bị 15s & Triệu hồi Cooldown
 */

import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';
import { ShipConfig } from '../config/ShipConfig.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const runningScenes = this.scene.manager.getScenes(true);
        this.battleScene = runningScenes.find(s => s.scene.key === 'CampaignModeScene' || s.scene.key === 'ActionModeScene' || s.scene.key === 'BattleScene')
            || this.scene.get('CampaignModeScene')
            || this.scene.get('ActionModeScene')
            || this.scene.get('BattleScene');

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.currentCredits = 1500;
        this.commandCards = [];
        this.cooldownStates = {};

        // 1. HUD GÓC TRÊN TRÁI: SOÁI HẠM CVN-78
        this.createCarrierStatusHUD(24, 20);

        // 2. HUD GÓC TRÊN PHẢI: NGÂN SÁCH, ĐIỂM & MỤC TIÊU
        this.createEconomyMissionHUD(width - 270, 20);

        // 3. KHUNG ĐẾM NGƯỢC 15S CHUẨN BỊ Ở ĐỈNH GIỮA MÀN HÌNH
        this.createPreparationBanner(width / 2, 38);

        // 4. THANH LỆNH TRIỆU HỒI & TÊN LỬA TOMAHAWK Ở ĐÁY MÀN HÌNH
        this.createFleetCommandBar(width / 2, height - 52);

        // 5. NÚT KỸ NĂNG CHỈ HUY [F] GÓC DƯỚI PHẢI
        this.createCommanderSkillButton(width - 90, height - 90);

        // 6. BẢNG TRẠNG THÁI HƯ HỎNG BỘ PHẬN GÓC TRÊN TRÁI (dưới HP bar)
        this.createModularDamageHUD(24, 100);

        // 7. NÚT TẠM DỪNG (PAUSE ||) GÓC TRÊN PHẢI & OVERLAY TẠM DỪNG
        this.createPauseSystem(width - 50, 48);

        // 8. KHUNG HỘI THOẠI CỐT TRUYỆN (CIC NARRATIVE BRIEFING)
        this.createNarrativeBriefingModal();

        // 9. MINI MAP VÀ THÔNG BÁO NHIỆM VỤ PHỤ
        this.createSideMissionHUD(24, 175);

        this.registerEvents();
    }

    createCarrierStatusHUD(x, y) {
        const hudBox = this.add.graphics();
        hudBox.fillStyle(0x061527, 0.88);
        hudBox.lineStyle(1.5, 0x00d2ff, 0.8);
        hudBox.fillRoundedRect(x, y, 280, 72, 6);
        hudBox.strokeRoundedRect(x, y, 280, 72, 6);

        this.shipNameText = this.add.text(x + 12, y + 8, 'SOÁI HẠM CITADEL', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#00d2ff',
            letterSpacing: 1
        });

        this.hudHpBg = this.add.graphics();
        this.hudHpBg.fillStyle(0x1e272e, 1);
        this.hudHpBg.fillRoundedRect(x + 12, y + 32, 256, 14, 3);

        this.hudHpFill = this.add.graphics();
        this.hudHpFill.fillStyle(0x2ecc71, 1);
        this.hudHpFill.fillRoundedRect(x + 12, y + 32, 256, 14, 3);

        this.hpNumericText = this.add.text(x + 140, y + 52, '2200 / 2200 HP', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#a4b0be'
        }).setOrigin(0.5, 0);
    }

    createEconomyMissionHUD(x, y) {
        const box = this.add.graphics();
        box.fillStyle(0x061527, 0.88);
        box.lineStyle(1.5, 0xf1c40f, 0.8);
        box.fillRoundedRect(x - 60, y, 226, 72, 6);
        box.strokeRoundedRect(x - 60, y, 226, 72, 6);

        this.creditsText = this.add.text(x - 48, y + 8, 'NGÂN SÁCH: $1,500', {
            fontFamily: 'system-ui, monospace',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#f1c40f'
        });

        this.enemyCountText = this.add.text(x - 48, y + 30, 'Tàu địch: Chờ xuất trận...', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#ff6b81'
        });

        this.scoreText = this.add.text(x - 48, y + 50, 'Điểm: 0', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#2ed573'
        });
    }

    createPreparationBanner(x, y) {
        this.prepContainer = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x0a192f, 0.92);
        bg.lineStyle(1.5, 0x00d2ff, 0.9);
        bg.fillRoundedRect(-220, -20, 440, 40, 6);
        bg.strokeRoundedRect(-220, -20, 440, 40, 6);

        this.prepTimerText = this.add.text(-60, 0, 'CHUẨN BỊ: 15s', {
            fontFamily: 'system-ui, monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#00f2fe'
        }).setOrigin(0.5);

        // Nút Skip bỏ qua thời gian chờ
        const skipBtn = this.add.container(120, 0);
        const skipBg = this.add.graphics();
        skipBg.fillStyle(0x00d2ff, 0.25);
        skipBg.lineStyle(1, 0x00d2ff, 0.8);
        skipBg.fillRoundedRect(-60, -14, 120, 28, 4);
        skipBg.strokeRoundedRect(-60, -14, 120, 28, 4);

        const skipLabel = this.add.text(0, 0, 'XUẤT TRẬN ⏩', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        skipBtn.add([skipBg, skipLabel]);
        skipBtn.setSize(120, 28);
        skipBtn.setInteractive({ useHandCursor: true });
        skipBtn.on('pointerdown', () => {
            if (this.battleScene && typeof this.battleScene.startCurrentWaveEnemies === 'function') {
                this.battleScene.startCurrentWaveEnemies();
            }
        });

        this.prepContainer.add([bg, this.prepTimerText, skipBtn]);
    }

    createFleetCommandBar(centerX, centerY) {
        const totalW = 1220;
        const totalH = 76;

        const dockBg = this.add.graphics();
        dockBg.fillStyle(0x051322, 0.94);
        dockBg.lineStyle(1.5, 0x1f4068, 0.85);
        dockBg.fillRoundedRect(centerX - totalW / 2, centerY - totalH / 2, totalW, totalH, 8);
        dockBg.strokeRoundedRect(centerX - totalW / 2, centerY - totalH / 2, totalW, totalH, 8);

        // Hiển thị giới hạn số lượng tàu hạm đội hộ tống (5 + số màn)
        const badgeBg = this.add.graphics();
        badgeBg.fillStyle(0x0a192f, 0.88);
        badgeBg.lineStyle(1, 0x00d2ff, 0.6);
        badgeBg.fillRoundedRect(centerX - 140, centerY - totalH / 2 - 21, 280, 20, 4);
        badgeBg.strokeRoundedRect(centerX - 140, centerY - totalH / 2 - 21, 280, 20, 4);

        this.fleetCountText = this.add.text(centerX, centerY - totalH / 2 - 11, 'HẠM ĐỘI HỘ TỐNG: 0/6 TÀU', {
            fontFamily: 'system-ui, monospace',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#00d2ff'
        }).setOrigin(0.5);

        // ĐỒNG BỘ TÊN VŨ KHÍ TỪ SHOP/SAVEMANAGER
        const equippedJetKey = SaveManager.getEquippedSlot ? (SaveManager.getEquippedSlot('slot4') || 'fighter_f35c') : 'fighter_f35c';
        const jetNames = {
            fighter_f35c: 'TIÊM KÍCH F-35C',
            fighter_faxx: 'TIÊM KÍCH F/A-XX',
            fighter_ngad: 'TIÊM KÍCH F/A 47-NGAD'
        };
        const jetLabel = jetNames[equippedJetKey] || 'TIÊM KÍCH HẠM';

        const equippedMissileKey = SaveManager.getEquippedSlot ? (SaveManager.getEquippedSlot('slot3') || 'cps') : 'cps';
        const missileLabel = '[SPACE] TÊN LỬA CPS';

        // 8 Nút Lệnh Tác Chiến Hạm Đội Đầy Đủ
        const cardDefs = [
            {
                id: 'jet',
                title: `[Q] ${jetLabel}`,
                cost: 900,
                desc: 'Phi đội 3 chiếc',
                color: 0x00d2ff,
                stageReq: 1,
                action: () => this.battleScene.summonAircraft()
            },
            {
                id: 'frigate',
                title: '[1] HỘ VỆ HẠM (Max 3)',
                cost: (ShipConfig.allies && ShipConfig.allies.frigate) ? ShipConfig.allies.frigate.cost : 600,
                desc: 'AGS-155 + Harpoon block 3',
                color: 0x00cec9,
                stageReq: 1,
                action: () => this.battleScene.summonAlly('frigate')
            },
            {
                id: 'destroyer',
                title: '[2] KHU TRỤC HẠM (Max 3)',
                cost: (ShipConfig.allies && ShipConfig.allies.destroyer) ? ShipConfig.allies.destroyer.cost : 900,
                desc: 'AGS-155 + NSM + RIM-162',
                color: 0x2ecc71,
                stageReq: 2,
                action: () => this.battleScene.summonAlly('destroyer')
            },
            {
                id: 'cruiser',
                title: '[3] TUẦN DƯƠNG HẠM (Max 2)',
                cost: (ShipConfig.allies && ShipConfig.allies.cruiser) ? ShipConfig.allies.cruiser.cost : 1500,
                desc: '2x Tomahawk Tầm Xa',
                color: 0x1abc9c,
                stageReq: 3,
                action: () => this.battleScene.summonAlly('cruiser')
            },
            {
                id: 'battleship',
                title: '[4] THIẾT GIÁP HẠM (Max 2)',
                cost: (ShipConfig.allies && ShipConfig.allies.battleship) ? ShipConfig.allies.battleship.cost : 2000,
                desc: 'Pháo nặng 406mm',
                color: 0xe74c3c,
                stageReq: 4,
                action: () => this.battleScene.summonAlly('battleship')
            },
            {
                id: 'carrier',
                title: '[5] TÀU SÂN BAY FORD (Max 2)',
                cost: (ShipConfig.allies && ShipConfig.allies.carrier) ? ShipConfig.allies.carrier.cost : 3000,
                desc: '4x CIWS + 9 Tiêm kích',
                color: 0x9b59b6,
                stageReq: 5,
                action: () => this.battleScene.summonAlly('carrier')
            },
            {
                id: 'repair',
                title: '[6] SỬA CHỮA KHẨN',
                cost: 400,
                desc: '+550 HP căn cứ',
                color: 0xe67e22,
                stageReq: 1,
                action: () => this.battleScene.repairCarrier()
            },
            {
                id: 'CPS',
                title: missileLabel,
                cost: 0,
                desc: 'CPS',
                color: 0xff0055,
                stageReq: 1,
                action: () => this.battleScene.launchPlayerTomahawk()
            }
        ];

        const cardW = 144;
        const startX = centerX - totalW / 2 + 10 + cardW / 2;
        const spacing = 150;

        cardDefs.forEach((def, index) => {
            const cardX = startX + index * spacing;
            const card = this.createCommandCard(cardX, centerY, cardW, def);
            this.commandCards.push(card);
        });
    }

    createCommandCard(x, y, width, def) {
        const height = 58;
        const container = this.add.container(x, y);

        const isLocked = this.battleScene && typeof this.battleScene.isAllyTypeUnlocked === 'function' && !this.battleScene.isAllyTypeUnlocked(def.id);

        const bg = this.add.graphics();
        this.renderCardBg(bg, width, height, def.color, true, false, isLocked);

        const titleText = this.add.text(0, -16, isLocked ? `🔒 ${def.title.replace(/\[\d\]\s*/, '')}` : def.title, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: isLocked ? '#7f8c8d' : '#ffffff'
        }).setOrigin(0.5);

        const costLabel = isLocked ? `MỞ Ở MÀN ${def.stageReq}` : (def.cost > 0 ? `$${def.cost}` : 'SẴN SÀNG');
        const costColor = isLocked ? '#e74c3c' : (def.cost > 0 ? '#f1c40f' : '#00f2fe');
        const costText = this.add.text(0, 0, costLabel, {
            fontFamily: 'monospace',
            fontSize: '12px',
            fontStyle: 'bold',
            color: costColor
        }).setOrigin(0.5);

        const descLabel = isLocked ? `Vượt Màn ${def.stageReq - 1} để mở` : def.desc;
        const descText = this.add.text(0, 16, descLabel, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9px',
            color: isLocked ? '#7f8c8d' : '#bdc3c7'
        }).setOrigin(0.5);

        container.add([bg, titleText, costText, descText]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        if (isLocked) container.setAlpha(0.55);

        container.on('pointerover', () => {
            container.setScale(1.03);
        });

        container.on('pointerout', () => {
            container.setScale(1.0);
        });

        container.on('pointerdown', () => {
            const currentlyLocked = this.battleScene && typeof this.battleScene.isAllyTypeUnlocked === 'function' && !this.battleScene.isAllyTypeUnlocked(def.id);
            if (currentlyLocked) {
                if (this.battleScene && this.battleScene.showFloatingMessage) {
                    const px = this.battleScene.playerShip ? this.battleScene.playerShip.x : 450;
                    const py = this.battleScene.playerShip ? this.battleScene.playerShip.y - 65 : 700;
                    this.battleScene.showFloatingMessage(px, py, `🔒 ${def.title} ĐANG KHÓA (CẦN VƯỢT MÀN ${def.stageReq - 1})!`, 0xf39c12);
                }
                SoundManager.playMissileWarning();
                return;
            }
            def.action();
        });

        return {
            container,
            bg,
            titleText,
            costText,
            descText,
            def,
            width,
            height
        };
    }

    renderCardBg(bg, w, h, color, canAfford, onCooldown, isLocked = false) {
        bg.clear();
        if (isLocked) {
            bg.fillStyle(0x0a1017, 0.7);
            bg.lineStyle(1.5, 0x34495e, 0.5);
        } else if (onCooldown) {
            bg.fillStyle(0x1e1518, 0.7);
            bg.lineStyle(1.5, 0xffa502, 0.6);
        } else if (canAfford) {
            bg.fillStyle(0x0e273c, 0.9);
            bg.lineStyle(1.5, color, 0.85);
        } else {
            bg.fillStyle(0x0a141e, 0.6);
            bg.lineStyle(1, 0x415b76, 0.4);
        }
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    }

    updateCommandCardsState() {
        this.commandCards.forEach(item => {
            const isLocked = this.battleScene && typeof this.battleScene.isAllyTypeUnlocked === 'function' && !this.battleScene.isAllyTypeUnlocked(item.def.id);
            const cdInfo = this.cooldownStates[item.def.id];
            const onCooldown = cdInfo && !cdInfo.ready;
            const canAfford = this.currentCredits >= item.def.cost;

            this.renderCardBg(item.bg, item.width, item.height, item.def.color, canAfford, onCooldown, isLocked);

            if (isLocked) {
                item.titleText.setText(`🔒 ${item.def.title.replace(/\[\d\]\s*/, '')}`);
                item.titleText.setColor('#7f8c8d');
                item.costText.setText(`MỞ Ở MÀN ${item.def.stageReq}`);
                item.costText.setColor('#e74c3c');
                item.descText.setText(`Vượt Màn ${item.def.stageReq - 1} để mở`);
                item.descText.setColor('#7f8c8d');
                item.container.setAlpha(0.5);
            } else if (onCooldown) {
                item.titleText.setText(item.def.title);
                item.titleText.setColor('#ffffff');
                item.descText.setText(item.def.desc);
                item.descText.setColor('#bdc3c7');
                item.costText.setText(`HỒI: ${cdInfo.remainingSec}s`);
                item.costText.setColor('#ffa502');
                item.container.setAlpha(0.7);
            } else {
                item.titleText.setText(item.def.title);
                item.titleText.setColor('#ffffff');
                item.descText.setText(item.def.desc);
                item.descText.setColor('#bdc3c7');
                item.costText.setText(item.def.cost > 0 ? `$${item.def.cost}` : 'SẴN SÀNG');
                item.costText.setColor(item.def.cost > 0 ? '#f1c40f' : '#00f2fe');
                item.container.setAlpha(canAfford ? 1.0 : 0.5);
            }
        });
    }

    /**
     * NÚT TẠM DỪNG (PAUSE ||) & OVERLAY MENU TẠM DỪNG
     */
    createPauseSystem(x, y) {
        // Nút Pause tròn phong cách Sci-Fi
        this.pauseBtn = this.add.container(x, y);

        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x0a192f, 0.92);
        btnBg.lineStyle(1.5, 0x00d2ff, 0.85);
        btnBg.fillCircle(0, 0, 20);
        btnBg.strokeCircle(0, 0, 20);

        const icon = this.add.text(0, 0, '❚❚', {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#00d2ff'
        }).setOrigin(0.5);

        this.pauseBtn.add([btnBg, icon]);
        this.pauseBtn.setSize(40, 40);
        this.pauseBtn.setInteractive({ useHandCursor: true });

        this.pauseBtn.on('pointerover', () => this.pauseBtn.setScale(1.1));
        this.pauseBtn.on('pointerout', () => this.pauseBtn.setScale(1.0));
        this.pauseBtn.on('pointerdown', () => this.togglePauseMenu());

        // Phím ESC cũng mở menu tạm dừng
        this.input.keyboard.on('keydown-ESC', () => this.togglePauseMenu());

        this.isGamePaused = false;
        this.createPauseModal();
    }

    createPauseModal() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.pauseOverlay = this.add.container(0, 0);
        this.pauseOverlay.setVisible(false);
        this.pauseOverlay.setDepth(100);

        const dimBg = this.add.graphics();
        dimBg.fillStyle(0x000000, 0.75);
        dimBg.fillRect(0, 0, width, height);

        const modalW = 440;
        const modalH = 340;
        const modalBg = this.add.graphics();
        modalBg.fillStyle(0x061527, 0.96);
        modalBg.lineStyle(2, 0x00d2ff, 0.9);
        modalBg.fillRoundedRect(width / 2 - modalW / 2, height / 2 - modalH / 2, modalW, modalH, 8);
        modalBg.strokeRoundedRect(width / 2 - modalW / 2, height / 2 - modalH / 2, modalW, modalH, 8);

        const title = this.add.text(width / 2, height / 2 - 120, 'TẠM DỪNG TÁC CHIẾN (GAME PAUSED)', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#00d2ff',
            letterSpacing: 2
        }).setOrigin(0.5);

        const sub = this.add.text(width / 2, height / 2 - 92, 'HỆ THỐNG ĐÃ ĐÓNG BĂNG CHIẾN TRƯỜNG', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#a4b0be'
        }).setOrigin(0.5);

        // 3 Nút: Tiếp tục, Cài đặt, Thoát
        const btnResume = this.createModalBtn(width / 2, height / 2 - 30, '▶ TIẾP TỤC CHIẾN ĐẤU (RESUME)', 0x2ed573, () => {
            this.togglePauseMenu();
        });

        const btnSettings = this.createModalBtn(width / 2, height / 2 + 30, '⚙ THIẾT LẬP ÂM THANH (AUDIO)', 0xf1c40f, () => {
            if (this.battleScene) {
                this.showFloatingMessage ? this.showFloatingMessage(width / 2, height / 2, 'Âm thanh đã tối ưu tự động!', 0xf1c40f) : null;
            }
        });

        const btnExit = this.createModalBtn(width / 2, height / 2 + 90, '🚪 THOÁT VỀ HẢI ĐỒ / MENU', 0xff4757, () => {
            this.scene.stop('UIScene');
            this.stopCombatScene();
            this.scene.start('StageMapScene');
        });

        this.pauseOverlay.add([dimBg, modalBg, title, sub, btnResume, btnSettings, btnExit]);
    }

    stopCombatScene() {
        this.scene.stop('CampaignModeScene');
        this.scene.stop('ActionModeScene');
        this.scene.stop('BattleScene');
    }

    getActiveCombatKey() {
        if (this.battleScene && this.battleScene.scene && this.battleScene.scene.key) {
            return this.battleScene.scene.key;
        }
        return (this.registry.get('gameMode') === 'action') ? 'ActionModeScene' : 'CampaignModeScene';
    }

    togglePauseMenu() {
        this.isGamePaused = !this.isGamePaused;
        this.pauseOverlay.setVisible(this.isGamePaused);

        if (this.battleScene) {
            if (this.isGamePaused) {
                this.battleScene.physics.world.pause();
                this.battleScene.scene.pause();
            } else {
                this.battleScene.scene.resume();
                this.battleScene.physics.world.resume();
            }
        }
    }

    /**
     * KHUNG HỘI THOẠI CỐT TRUYỆN (CIC NARRATIVE BRIEFING TRƯỚC TRẬN)
     */
    createNarrativeBriefingModal() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.briefingContainer = this.add.container(0, 0);
        this.briefingContainer.setDepth(90);

        const dimBg = this.add.graphics();
        dimBg.fillStyle(0x000000, 0.7);
        dimBg.fillRect(0, 0, width, height);

        const boxW = 680;
        const boxH = 260;
        const boxBg = this.add.graphics();
        boxBg.fillStyle(0x061527, 0.96);
        boxBg.lineStyle(2, 0x00d2ff, 0.95);
        boxBg.fillRoundedRect(width / 2 - boxW / 2, height / 2 - boxH / 2, boxW, boxH, 8);
        boxBg.strokeRoundedRect(width / 2 - boxW / 2, height / 2 - boxH / 2, boxW, boxH, 8);

        // Header CIC
        const header = this.add.text(width / 2 - boxW / 2 + 25, height / 2 - boxH / 2 + 25, '📡 PHÒNG TÁC CHIẾN CIC — THÔNG ĐIỆP CHỈ HUY HẠM ĐỘI', {
            fontFamily: 'system-ui, monospace',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#00d2ff',
            letterSpacing: 2
        });

        this.briefingTitleText = this.add.text(width / 2 - boxW / 2 + 25, height / 2 - boxH / 2 + 55, 'SECTOR 01: VỊNH TAN VỠ', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#f1c40f'
        });

        this.briefingStoryText = this.add.text(width / 2 - boxW / 2 + 25, height / 2 - boxH / 2 + 90, '', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            color: '#e0e6ed',
            wordWrap: { width: boxW - 50 },
            lineSpacing: 4
        });

        const btnProceed = this.createModalBtn(width / 2, height / 2 + boxH / 2 - 40, 'TIẾP NHẬN MỆNH LỆNH & XUẤT KÍCH ▶', 0x2ecc71, () => {
            this.briefingContainer.setVisible(false);
            if (this.battleScene) {
                this.battleScene.isBriefingActive = false;
                this.battleScene.scene.resume();
                this.battleScene.physics.world.resume();
            }
        });

        this.briefingContainer.add([dimBg, boxBg, header, this.briefingTitleText, this.briefingStoryText, btnProceed]);
        this.briefingContainer.setVisible(false);
    }

    showStageBriefing(stageData) {
        if (!stageData || !this.briefingContainer) return;
        const storyText = stageData.story || stageData.desc || 'Hạm đội tiến vào tọa độ chỉ định. Tiêu diệt toàn bộ lực lượng đối phương!';
        this.briefingTitleText.setText(`${stageData.code || 'SECTOR'}: ${stageData.name || 'HẢI PHẬN'}`);
        this.briefingStoryText.setText(storyText);
        this.briefingContainer.setVisible(true);

        // Tạm dừng scene game và chặn wave timer
        if (this.battleScene) {
            this.battleScene.isBriefingActive = true;
            this.battleScene.physics.world.pause();
        }
    }

    /**
     * BẢNG THEO DÕI NHIỆM VỤ PHỤ (SIDE MISSION HUD)
     */
    createSideMissionHUD(x, y) {
        this.sideMissionContainer = this.add.container(x, y);
        this.sideMissionContainer.setVisible(false);

        const boxW = 240;
        const boxH = 46;
        const bg = this.add.graphics();
        bg.fillStyle(0x061527, 0.85);
        bg.lineStyle(1.2, 0xf1c40f, 0.7);
        bg.fillRoundedRect(0, 0, boxW, boxH, 4);
        bg.strokeRoundedRect(0, 0, boxW, boxH, 4);

        this.missionTitleText = this.add.text(10, 8, 'MỤC TIÊU PHỤ', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#f1c40f'
        });

        this.missionProgressText = this.add.text(10, 24, 'Chờ tiếp nhận...', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            color: '#dcdde1'
        });

        this.sideMissionContainer.add([bg, this.missionTitleText, this.missionProgressText]);
    }

    updateSideMissionHUD(mission) {
        if (!mission || !this.sideMissionContainer) return;
        this.sideMissionContainer.setVisible(true);
        this.missionTitleText.setText(mission.completed ? '✔ NHIỆM VỤ HOÀN THÀNH!' : '★ MỤC TIÊU PHỤ (+THƯỞNG)');
        this.missionTitleText.setColor(mission.completed ? '#2ecc71' : '#f1c40f');

        let progText = mission.title;
        if (mission.target) {
            progText += ` (${mission.current}/${mission.target})`;
        }
        this.missionProgressText.setText(progText);
    }

    /**
     * Hiển thị icon, tên kỹ năng, và thanh cooldown overlay
     */
    createCommanderSkillButton(x, y) {
        this.skillBtnContainer = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x0d1f33, 0.94);
        bg.lineStyle(2, 0xf1c40f, 0.9);
        bg.fillRoundedRect(-76, -76, 152, 152, 8);
        bg.strokeRoundedRect(-76, -76, 152, 152, 8);

        this.skillIconText = this.add.text(0, -30, '🛩', { fontSize: '32px' }).setOrigin(0.5);

        this.skillNameText = this.add.text(0, 10, 'CAS', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#f1c40f',
            wordWrap: { width: 140 },
            align: 'center'
        }).setOrigin(0.5);

        const keyHint = this.add.text(0, 38, '[F] KỸ NĂNG', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#a4b0be'
        }).setOrigin(0.5);

        // Thanh cooldown overlay
        this.skillCooldownOverlay = this.add.graphics();

        this.skillCdText = this.add.text(0, 55, 'SẴN SÀNG', {
            fontFamily: 'monospace',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#2ecc71'
        }).setOrigin(0.5);

        this.skillBtnContainer.add([bg, this.skillCooldownOverlay, this.skillIconText, this.skillNameText, keyHint, this.skillCdText]);
        this.skillBtnContainer.setSize(152, 152);
        this.skillBtnContainer.setInteractive({ useHandCursor: true });
        this.skillBtnContainer.on('pointerdown', () => {
            if (this.battleScene && typeof this.battleScene.triggerCommanderSkill === 'function') {
                this.battleScene.triggerCommanderSkill();
            }
        });

        // Cập nhật nội dung từ BattleScene sau khi create
        this.time.delayedCall(200, () => {
            if (this.battleScene && this.battleScene.commanderSkill) {
                const sk = this.battleScene.commanderSkill;
                this.skillIconText.setText(sk.icon || '⚡');
                this.skillNameText.setText(sk.name || 'KỸ NĂNG');
            }
        });
    }

    /**
     * Cập nhật trạng thái cooldown của nút kỹ năng chỉ huy
     */
    updateSkillButton(remainingMs, totalMs) {
        if (!this.skillCdText || !this.skillCooldownOverlay) return;

        if (remainingMs <= 0) {
            this.skillCdText.setText('SẴN SÀNG');
            this.skillCdText.setColor('#2ecc71');
            this.skillCooldownOverlay.clear();
        } else {
            const secLeft = Math.ceil(remainingMs / 1000);
            this.skillCdText.setText(`${secLeft}s`);
            this.skillCdText.setColor('#ffa502');

            // Overlay mờ che phủ theo tỉ lệ cooldown
            const ratio = Math.min(1, remainingMs / totalMs);
            this.skillCooldownOverlay.clear();
            this.skillCooldownOverlay.fillStyle(0x000000, 0.55 * ratio);
            this.skillCooldownOverlay.fillRoundedRect(-76, -76, 152, 152 * ratio, 4);
        }
    }

    /**
     * BẢNG TRẠNG THÁI HƯ HỎNG BỘ PHẬN (MODULAR DAMAGE HUD)
     * Hiển thị trạng thái: Động cơ, Tháp pháo, Radar
     */
    createModularDamageHUD(x, y) {
        this.moduleHudContainer = this.add.container(0, 0);

        const boxW = 140;
        const bg = this.add.graphics();
        bg.fillStyle(0x061527, 0.82);
        bg.lineStyle(1, 0x1f4068, 0.7);
        bg.fillRoundedRect(x, y, boxW, 56, 4);
        bg.strokeRoundedRect(x, y, boxW, 56, 4);

        const titleTxt = this.add.text(x + boxW / 2, y + 8, 'TÌNH TRẠNG TÀU', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#00d2ff'
        }).setOrigin(0.5, 0);

        // 3 chỉ báo module
        this.moduleLights = {};
        const modules = [
            { key: 'engine', icon: '⚙', label: 'ĐỘNG CƠ', px: x + 12, py: y + 26 },
            { key: 'turrets', icon: '🔫', label: 'PHÁO', px: x + 56, py: y + 26 },
            { key: 'radar', icon: '📡', label: 'RADAR', px: x + 100, py: y + 26 }
        ];

        modules.forEach(m => {
            const light = this.add.circle(m.px + 8, m.py + 6, 5, 0x2ecc71, 1);
            const lbl = this.add.text(m.px, m.py + 16, m.label, {
                fontFamily: 'system-ui', fontSize: '8px', color: '#a4b0be'
            });
            this.moduleLights[m.key] = light;
            this.moduleHudContainer.add([light, lbl]);
        });

        this.moduleHudContainer.add([bg, titleTxt]);
    }

    /**
     * Cập nhật đèn tình trạng hư hỏng bộ phận
     */
    updateModuleLights(modules) {
        if (!this.moduleLights) return;
        const keys = ['engine', 'turrets', 'radar'];
        keys.forEach(k => {
            if (!this.moduleLights[k] || !modules[k]) return;
            const damaged = modules[k].damaged;
            this.moduleLights[k].setFillStyle(damaged ? 0xe74c3c : 0x2ecc71, 1);
        });
    }

    registerEvents() {
        if (!this.battleScene) return;

        this.battleScene.events.on('updatePlayerHp', (currentHp, maxHp) => {
            this.updatePlayerHpBar(currentHp, maxHp);
        });

        this.battleScene.events.on('updateCredits', (credits) => {
            this.currentCredits = credits;
            if (this.creditsText) {
                this.creditsText.setText(`NGÂN SÁCH: $${credits.toLocaleString()}`);
            }
            this.updateCommandCardsState();
        });

        this.battleScene.events.on('updateCooldowns', (statuses) => {
            this.cooldownStates = statuses;
            this.updateCommandCardsState();
        });

        this.battleScene.events.on('updatePrepTimer', (seconds) => {
            if (seconds > 0) {
                if (this.prepContainer) this.prepContainer.setVisible(true);
                if (this.prepTimerText) this.prepTimerText.setText(`CHUẨN BỊ: ${seconds}s`);
            } else {
                if (this.prepContainer) this.prepContainer.setVisible(false);
            }
        });

        this.battleScene.events.on('updateFleetStatus', (remainingEnemies, score) => {
            if (this.enemyCountText) {
                if (this.battleScene && this.battleScene.isPreparing) {
                    this.enemyCountText.setText('Tàu địch: Chờ xuất trận...');
                } else {
                    this.enemyCountText.setText(`Tàu địch: ${remainingEnemies} chiếc`);
                }
            }
            if (this.scoreText) {
                this.scoreText.setText(`Điểm: ${score}`);
            }
        });

        this.battleScene.events.on('showVictory', (score, tokens, stageId, hpPercent, unlockedShipKey) => {
            this.showVictoryModal(score, tokens, stageId, hpPercent, unlockedShipKey);
        });

        this.battleScene.events.on('updateFleetCount', (count, maxLimit) => {
            if (this.fleetCountText) {
                this.fleetCountText.setText(`HẠM ĐỘI HỘ TỐNG: ${count}/${maxLimit} TÀU`);
            }
        });

        this.battleScene.events.on('showDefeat', (score) => {
            this.showDefeatModal(score);
        });

        // Lắng nghe cập nhật trạng thái Hư hỏng Bộ phận
        this.battleScene.events.on('updateModules', (modules) => {
            this.updateModuleLights(modules);
        });

        // Lắng nghe cập nhật nhiệm vụ phụ
        this.battleScene.events.on('updateMissionStatus', (mission) => {
            this.updateSideMissionHUD(mission);
        });

        // Lắng nghe mở bản tóm tắt tình hình chiến sự CIC
        this.battleScene.events.on('updateStageInfo', (info) => {
            if (info && info.stageData && info.currentWave === 1 && !info.isEndless) {
                this.showStageBriefing(info.stageData);
            }
        });

        // Lắng nghe cập nhật cooldown Kỹ năng Chỉ huy
        this.battleScene.events.on('updateCommanderSkillCooldown', (remainingMs, totalMs) => {
            this.updateSkillButton(remainingMs, totalMs);
        });
    }

    updatePlayerHpBar(currentHp, maxHp) {
        const percent = Math.max(0, currentHp / maxHp);
        const fillWidth = Math.max(0, Math.floor(256 * percent));

        this.hudHpFill.clear();
        let color = 0x2ecc71;
        if (percent <= 0.25) color = 0xe74c3c;
        else if (percent <= 0.55) color = 0xf39c12;

        this.hudHpFill.fillStyle(color, 1);
        this.hudHpFill.fillRoundedRect(36, 52, fillWidth, 14, 3);

        this.hpNumericText.setText(`${Math.max(0, currentHp)} / ${maxHp} HP`);
    }

    showVictoryModal(score, tokensAwarded, stageId, hpPercent = 100, unlockedShipKey = null) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.85);
        overlay.fillRect(0, 0, width, height);

        const modal = this.add.container(width / 2, height / 2);
        const modalW = 560;
        const modalH = 340;

        const boxBg = this.add.graphics();
        boxBg.fillStyle(0x0a192f, 0.98);
        boxBg.lineStyle(2.5, 0x2ed573, 1);
        boxBg.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
        boxBg.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);

        // Header Title
        const titleText = this.add.text(0, -115, '★ CHIẾN THẮNG HẢI PHẬN ★', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#2ed573'
        }).setOrigin(0.5);

        // Tính toán số sao dựa trên lượng máu còn lại của Tàu Mẹ Citadel (30%, 60%, 90%)
        const safeHpPercent = typeof hpPercent === 'number' && !isNaN(hpPercent) ? hpPercent : 100;
        let starCount = 1;
        if (safeHpPercent >= 90) starCount = 3;
        else if (safeHpPercent >= 60) starCount = 2;
        else if (safeHpPercent >= 30) starCount = 1;
        else starCount = 1;

        if (SaveManager.setStageStars) {
            SaveManager.setStageStars(stageId, starCount);
        }

        // Tình trạng Máu Tàu Mẹ
        const hpColor = safeHpPercent >= 90 ? '#2ecc71' : (safeHpPercent >= 60 ? '#00d2ff' : '#f1c40f');
        const hpStatusText = this.add.text(0, -78, `BẢO VỆ SOÁI HẠM: ${safeHpPercent}% HP CÒN LẠI`, {
            fontFamily: 'system-ui, monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: hpColor
        }).setOrigin(0.5);

        // Hiển thị 3 ngôi sao (Sao nền xám viền đậm + Sao vàng pop-in animation)
        const starSpacing = 78;
        const starY = -12;
        const starItems = [];

        for (let i = 0; i < 3; i++) {
            const starX = (i - 1) * starSpacing;
            // Sao nền màu xám
            const bgStar = this.add.text(starX, starY, '★', {
                fontFamily: 'system-ui, sans-serif',
                fontSize: '54px',
                color: '#1c2833',
                stroke: '#2c3e50',
                strokeThickness: 2
            }).setOrigin(0.5);
            modal.add(bgStar);

            // Sao vàng siêu sáng rực rỡ nếu đạt được
            if (i < starCount) {
                const goldStar = this.add.text(starX, starY, '★', {
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '54px',
                    color: '#fff000',
                    stroke: '#f39c12',
                    strokeThickness: 3.5
                }).setOrigin(0.5);
                goldStar.setShadow(0, 0, '#ffe600', 25, true, true);
                goldStar.setScale(0);
                goldStar.setAlpha(0);
                modal.add(goldStar);
                starItems.push({ star: goldStar, starNum: i + 1, starX, starY });
            }
        }

        // Làm chậm thời gian xuất hiện 3 ngôi sao: 1000ms, 2200ms, 3400ms
        const starDelays = [1000, 2200, 3400];
        starItems.forEach((item, idx) => {
            const delayMs = starDelays[idx] || (1000 + idx * 1200);
            this.time.delayedCall(delayMs, () => {
                SoundManager.playStar(item.starNum);

                // Hiệu ứng vòng sáng vàng bùng nổ phía sau ngôi sao
                const halo = this.add.circle(item.starX, item.starY, 30, 0xffd700, 0.65);
                modal.add(halo);
                this.tweens.add({
                    targets: halo,
                    scale: 2.4,
                    alpha: 0,
                    duration: 600,
                    ease: 'Cubic.out',
                    onComplete: () => halo.destroy()
                });

                // Hiệu ứng tia sáng lấp lánh tung ra
                for (let k = 0; k < 6; k++) {
                    const sparkAngle = (k / 6) * Math.PI * 2;
                    const spark = this.add.circle(item.starX, item.starY, 3, 0xfff200, 0.9);
                    modal.add(spark);
                    this.tweens.add({
                        targets: spark,
                        x: item.starX + Math.cos(sparkAngle) * 45,
                        y: item.starY + Math.sin(sparkAngle) * 45,
                        scale: 0.2,
                        alpha: 0,
                        duration: 500,
                        ease: 'Cubic.out',
                        onComplete: () => spark.destroy()
                    });
                }

                // Animation rơi đập mạnh xuống của ngôi sao vàng
                this.tweens.add({
                    targets: item.star,
                    scale: 1.4,
                    alpha: 1,
                    duration: 320,
                    ease: 'Back.out',
                    onComplete: () => {
                        this.tweens.add({
                            targets: item.star,
                            scale: 1.0,
                            duration: 180
                        });
                    }
                });
            });
        });

        // Nhãn danh hiệu tác chiến tương ứng số sao xuất hiện sau khi sao cuối hoàn tất
        const ratingLabels = [
            '★☆☆ BẢO VỆ THÀNH CÔNG (≥30% HP)',
            '★★☆ XUẤT SẮC - HOÀN THÀNH MỤC TIÊU (≥60% HP)',
            '★★★ HOÀN HẢO - BẢO TOÀN LỰC LƯỢNG (≥90% HP)'
        ];
        const ratingText = this.add.text(0, 48, ratingLabels[starCount - 1], {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffd700'
        }).setOrigin(0.5);
        ratingText.setShadow(0, 0, '#f1c40f', 12, true, true);
        ratingText.setAlpha(0);

        const statusDelay = Math.max(1200, (starCount * 1200) + 150);
        this.time.delayedCall(statusDelay, () => {
            this.tweens.add({
                targets: ratingText,
                alpha: 1,
                scale: 1.05,
                yoyo: true,
                duration: 250
            });
        });

        const rewardNoticeText = this.add.text(0, 85, 'Đang chuẩn bị kiểm đếm chiến lợi phẩm...', {
            fontFamily: 'system-ui, monospace',
            fontSize: '12px',
            color: '#a4b0be'
        }).setOrigin(0.5);

        modal.add([boxBg, titleText, hpStatusText, ratingText, rewardNoticeText]);
        modal.setScale(0.85);
        modal.setAlpha(0);
        this.tweens.add({ targets: modal, scale: 1, alpha: 1, duration: 350, ease: 'Back.out' });

        // TỰ ĐỘNG BẬT POPUP PHẦN THƯỞNG CUỐI TRẬN SAU KHI HIỆN ĐỦ CÁC SAO THẮNG
        const popupTriggerDelay = Math.max(2600, (starCount * 1200) + 750);
        this.time.delayedCall(popupTriggerDelay, () => {
            this.tweens.add({
                targets: modal,
                alpha: 0,
                scale: 0.8,
                duration: 250,
                onComplete: () => {
                    modal.destroy();
                    this.showVictoryRewardPopup(stageId, tokensAwarded, score);
                }
            });
        });
    }

    /**
     * POPUP PHẦN THƯỞNG CUỐI TRẬN: XU NÂNG CẤP VÀ TÀU CON MỞ KHÓA Ở NHỮNG VÒNG ĐẦU
     */
    showVictoryRewardPopup(stageId, tokensAwarded, score) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Âm thanh mở thưởng hoành tráng
        SoundManager.playUpgrade();

        const container = this.add.container(width / 2, height / 2);
        const modalW = 580;
        const modalH = 430;

        // Nền popup phong cách Sci-Fi chỉ huy hải quân
        const bg = this.add.graphics();
        bg.fillStyle(0x051322, 0.98);
        bg.lineStyle(2.5, 0xf1c40f, 1);
        bg.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 12);
        bg.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 12);

        // Header phát sáng
        const headerTitle = this.add.text(0, -172, '🎁 PHẦN THƯỞNG CHIẾN DỊCH 🎁', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffd700'
        }).setOrigin(0.5);
        headerTitle.setShadow(0, 0, '#f1c40f', 14, true, true);

        const subTitle = this.add.text(0, -142, `HOÀN THÀNH XUẤT SẮC HẢI TRÌNH SECTOR 0${stageId} (ĐIỂM: ${score})`, {
            fontFamily: 'system-ui, monospace',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#00d2ff',
            letterSpacing: 1
        }).setOrigin(0.5);

        // --- PHẦN 1: XU NÂNG CẤP VĨNH VIỄN ---
        const tokenBox = this.add.graphics();
        tokenBox.fillStyle(0x0c2137, 0.9);
        tokenBox.lineStyle(1.5, 0xf1c40f, 0.8);
        tokenBox.fillRoundedRect(-modalW / 2 + 25, -122, modalW - 50, 72, 8);
        tokenBox.strokeRoundedRect(-modalW / 2 + 25, -122, modalW - 50, 72, 8);

        const tokenIcon = this.add.text(-modalW / 2 + 55, -86, '⬡', {
            fontFamily: 'monospace',
            fontSize: '36px',
            color: '#ffd700'
        }).setOrigin(0.5);
        tokenIcon.setShadow(0, 0, '#f1c40f', 16, true, true);

        const tokenTitle = this.add.text(-modalW / 2 + 90, -98, `+${tokensAwarded} XU NÂNG CẤP VĨNH VIỄN`, {
            fontFamily: 'system-ui, monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffd700'
        });

        const tokenDesc = this.add.text(-modalW / 2 + 90, -76, 'Dùng để nâng cấp Radar, Hỏa Lực, Máu và Tốc Độ tại Trung Tâm Nâng Cấp.', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#dcdde1'
        });

        // --- PHẦN 2: TÀU CON MỞ KHÓA Ở NHỮNG VÒNG ĐẦU ---
        const shipBox = this.add.graphics();
        const shipRewardData = {
            1: {
                title: '🚢 MỞ KHÓA CHIẾN HẠM: TÀU KHU TRỤC ARLEIGH BURKE (DDG-51)',
                desc: 'Trang bị Pháo hạm AGS-155 (155mm) đón đầu siêu chuẩn + Ống phóng Tomahawk Block IV đánh chặn!',
                notice: '★ SẴN SÀNG TRIỆU HỒI TỪ MÀN 2 VỚI CHI PHÍ $850',
                color: 0x2ecc71,
                hexColor: '#2ecc71'
            },
            2: {
                title: '🚀 MỞ KHÓA CHIẾN HẠM: TUẦN DƯƠNG HẠM TICONDEROGA (CG-47)',
                desc: 'Trang bị 2 cụm VLS Tomahawk Block V tầm cực xa & Radar quét diện rộng!',
                notice: '★ SẴN SÀNG TRIỆU HỒI TỪ MÀN 3 VỚI CHI PHÍ $1,400',
                color: 0x1abc9c,
                hexColor: '#1abc9c'
            },
            3: {
                title: '🛡️ MỞ KHÓA CHIẾN HẠM: THIẾT GIÁP HẠM IOWA (BB-61)',
                desc: 'Lá chắn thép Krupp bất khả xâm phạm, 3 tháp pháo hạng nặng 406mm uy lực cực đại!',
                notice: '★ SẴN SÀNG TRIỆU HỒI TỪ MÀN 4 VỚI CHI PHÍ $2,000',
                color: 0xe74c3c,
                hexColor: '#e74c3c'
            },
            4: {
                title: '✈️ MỞ KHÓA CHIẾN HẠM: TÀU SÂN BAY HỘ TỐNG FORD (CVN-78)',
                desc: 'Mang theo biên đội 9 Tiêm kích F-35C không kích & 4 tháp pháo CIWS 20mm Phalanx phòng không!',
                notice: '★ SẴN SÀNG TRIỆU HỒI TỪ MÀN 5 VỚI CHI PHÍ $2,600',
                color: 0x9b59b6,
                hexColor: '#9b59b6'
            }
        };

        const currentReward = shipRewardData[stageId] || {
            title: stageId >= 10 ? '🏆 ĐẠI THẮNG TOÀN DIỆN CHIẾN DỊCH HẢI QUÂN' : '🎖️ HUÂN CHƯƠNG CHIẾN CÔNG ĐÔ ĐỐC HẢI QUÂN',
            desc: stageId >= 10 ? 'Đã quét sạch toàn bộ liên minh Iron Tide, Kraken Titan Fusion và giữ vững trọn vẹn chủ quyền biển đảo!' : 'Toàn bộ 5 lớp tàu chiến hiện đại đã sẵn sàng triển khai trong mọi hải trình!',
            notice: '★ ĐÃ MỞ KHÓA ĐẦY ĐỦ LỰC LƯỢNG HẢI CHIẾN HIỆN ĐẠI',
            color: 0xf1c40f,
            hexColor: '#f1c40f'
        };

        shipBox.fillStyle(0x0c2137, 0.9);
        shipBox.lineStyle(1.5, currentReward.color, 0.9);
        shipBox.fillRoundedRect(-modalW / 2 + 25, -34, modalW - 50, 94, 8);
        shipBox.strokeRoundedRect(-modalW / 2 + 25, -34, modalW - 50, 94, 8);

        const shipTitle = this.add.text(-modalW / 2 + 45, -18, currentReward.title, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: currentReward.hexColor
        });
        shipTitle.setShadow(0, 0, currentReward.hexColor, 10, true, true);

        const shipDesc = this.add.text(-modalW / 2 + 45, 6, currentReward.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#dcdde1',
            wordWrap: { width: modalW - 90 }
        });

        const shipNotice = this.add.text(-modalW / 2 + 45, 36, currentReward.notice, {
            fontFamily: 'system-ui, monospace',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#ffd700'
        });

        // Nút hành động
        const nextStageId = stageId + 1;
        const hasNext = nextStageId <= 10;
        const btnNext = this.createModalBtn(0, 86, hasNext ? '▶ MÀN TIẾP THEO' : '🏆 PHÁ ĐẢO CHIẾN DỊCH', 0x2ed573, () => {
            this.scene.stop('UIScene');
            const combatKey = this.getActiveCombatKey();
            this.stopCombatScene();
            if (hasNext) {
                this.registry.set('selectedStage', nextStageId);
                this.scene.start(combatKey);
            } else {
                this.scene.start('StageMapScene');
            }
        });

        const btnUpgrade = this.createModalBtn(0, 132, '⚙ TRUNG TÂM NÂNG CẤP', 0xf1c40f, () => {
            this.scene.stop('UIScene');
            this.stopCombatScene();
            this.scene.start('UpgradeScene');
        });

        const btnMenu = this.createModalBtn(0, 178, '◀ VỀ MENU CHÍNH', 0x70a1ff, () => {
            this.scene.stop('UIScene');
            this.stopCombatScene();
            this.scene.start('MenuScene');
        });

        container.add([
            bg, headerTitle, subTitle,
            tokenBox, tokenIcon, tokenTitle, tokenDesc,
            shipBox, shipTitle, shipDesc, shipNotice,
            btnNext, btnUpgrade, btnMenu
        ]);

        container.setScale(0.7);
        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            scale: 1.0,
            alpha: 1,
            duration: 400,
            ease: 'Back.out'
        });
    }

    showDefeatModal(score) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, width, height);

        const modal = this.add.container(width / 2, height / 2);
        const modalW = 500;
        const modalH = 320;

        const boxBg = this.add.graphics();
        boxBg.fillStyle(0x0a192f, 0.96);
        boxBg.lineStyle(2.5, 0xff4757, 1);
        boxBg.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
        boxBg.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);

        const titleText = this.add.text(0, -95, '☠ SOÁI HẠM ĐÃ BỊ ĐÁNH CHÌM ☠', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ff4757'
        }).setOrigin(0.5);

        const descText = this.add.text(0, -50, 'Soái hạm Citadel đã bị phá hủy... Hải phận rơi vào tay địch.', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            color: '#dcdde1'
        }).setOrigin(0.5);

        const btnRetry = this.createModalBtn(0, 15, '🔄 TÁI XUẤT KÍCH (RETRY)', 0x38ef7d, () => {
            this.scene.stop('UIScene');
            const combatKey = this.getActiveCombatKey();
            this.stopCombatScene();
            this.scene.start(combatKey);
        });

        const btnUpgrade = this.createModalBtn(0, 65, '⚙ NÂNG CẤP THÊM CHỈ SỐ', 0xf1c40f, () => {
            this.scene.stop('UIScene');
            this.stopCombatScene();
            this.scene.start('UpgradeScene');
        });

        const btnMenu = this.createModalBtn(0, 115, '◀ VỀ MENU CHÍNH', 0x70a1ff, () => {
            this.scene.stop('UIScene');
            this.stopCombatScene();
            this.scene.start('MenuScene');
        });

        modal.add([boxBg, titleText, descText, btnRetry, btnUpgrade, btnMenu]);
        modal.setScale(0.8);
        modal.setAlpha(0);
        this.tweens.add({ targets: modal, scale: 1, alpha: 1, duration: 350, ease: 'Back.out' });
    }

    createModalBtn(x, y, text, color, callback) {
        const btn = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x0e273c, 0.9);
        bg.lineStyle(1.5, color, 0.8);
        bg.fillRoundedRect(-150, -18, 300, 36, 4);
        bg.strokeRoundedRect(-150, -18, 300, 36, 4);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.add([bg, label]);
        btn.setSize(300, 36);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setScale(1.04);
            bg.clear();
            bg.fillStyle(color, 0.3);
            bg.lineStyle(2, color, 1);
            bg.fillRoundedRect(-150, -18, 300, 36, 4);
            bg.strokeRoundedRect(-150, -18, 300, 36, 4);
        });

        btn.on('pointerout', () => {
            btn.setScale(1.0);
            bg.clear();
            bg.fillStyle(0x0e273c, 0.9);
            bg.lineStyle(1.5, color, 0.8);
            bg.fillRoundedRect(-150, -18, 300, 36, 4);
            bg.strokeRoundedRect(-150, -18, 300, 36, 4);
        });

        btn.on('pointerdown', () => {
            SoundManager.playClick();
            callback();
        });
        return btn;
    }
}
