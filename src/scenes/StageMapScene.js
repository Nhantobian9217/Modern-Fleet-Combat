/**
 * StageMapScene.js - Hải đồ Chiến dịch 10 Màn chơi
 * 
 * Chiến dịch: "BÌNH MINH THẦN SẤM" (Operation Thunder Dawn)
 * - Sector 01: Vịnh Tan Vỡ                - Sector 02: Rạn San Hô Bão
 * - Sector 03: Vực Thẳm Biển Sâu         - Sector 04: Pháo Đài Quần Đảo
 * - Sector 05 💀 BOSS 1: Vùng Nước Tử Thần (KRAKEN)
 * - Sector 06: Vịnh Băng Tàng Hình (Tàu Sân Bay Địch)
 * - Sector 07: Eo Biển Lửa Đỏ
 * - Sector 08 💀 BOSS 2: Đại Chiến Hạm Đội Hắc Hải
 * - Sector 09: Căn Cứ Ngầm Phantom Omega
 * - Sector 10 ★ FINAL: Bình Minh Thần Sấm (KRAKEN TITAN FUSION)
 * 
 * Mở khóa dần khi chiến thắng (lưu vào SaveManager).
 */

import { StageConfig } from '../config/StageConfig.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class StageMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StageMapScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.bg = this.add.tileSprite(width / 2, height / 2, width, height, 'ocean_tile');

        // Lưới tọa độ chiến thuật
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x00d2ff, 0.08);
        for (let x = 60; x < width; x += 70) { grid.moveTo(x, 40); grid.lineTo(x, height - 40); }
        for (let y = 60; y < height; y += 70) { grid.moveTo(40, y); grid.lineTo(width - 40, y); }
        grid.strokePath();

        // Tiêu đề
        this.add.text(width / 2, 30, '— OPERATION THUNDER DAWN — HẢI ĐỒ CHIẾN DỊCH —', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '11px',
            color: '#00d2ff',
            letterSpacing: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, 56, 'HẢI ĐỒ TÁC CHIẾN: 10 SECTORS (CAMPAIGN)', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            letterSpacing: 2
        }).setOrigin(0.5);

        const tokens = SaveManager.getTokens ? SaveManager.getTokens() : 0;
        this.add.text(width / 2, 84, `VƯỢT QUA TỪNG HẢI PHẬN ĐỂ THU XU NÂNG CẤP & MỞ KHÓA TÀU CON  ·  Xu hiện có: ⭐ ${tokens}`, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#70a1ff'
        }).setOrigin(0.5);

        // Đường kẻ phân tách
        const divLine = this.add.graphics();
        divLine.lineStyle(1, 0x1f4068, 0.8);
        divLine.moveTo(40, 100); divLine.lineTo(width - 40, 100);
        divLine.strokePath();

        // Lấy tiến trình từ SaveManager
        const unlockedStage = SaveManager.getUnlockedStage ? SaveManager.getUnlockedStage() : 1;

        // Bố cục 10 node zigzag xen kẽ trên 2 hàng
        const row1Y = height * 0.35;
        const row2Y = height * 0.62;
        const nodePositions = [
            { x: width * 0.07, y: row1Y },   // Sector 1
            { x: width * 0.17, y: row2Y },   // Sector 2
            { x: width * 0.27, y: row1Y },   // Sector 3
            { x: width * 0.37, y: row2Y },   // Sector 4
            { x: width * 0.47, y: row1Y },   // Sector 5 (Boss 1)
            { x: width * 0.57, y: row2Y },   // Sector 6 (Carrier debut)
            { x: width * 0.67, y: row1Y },   // Sector 7
            { x: width * 0.77, y: row2Y },   // Sector 8 (Boss 2)
            { x: width * 0.87, y: row1Y },   // Sector 9 (Phantom Omega)
            { x: width * 0.94, y: row2Y }    // Sector 10 (Final Titan)
        ];

        // Vẽ đường hải trình nối các node
        const routeG = this.add.graphics();
        for (let i = 0; i < nodePositions.length - 1; i++) {
            const p1 = nodePositions[i];
            const p2 = nodePositions[i + 1];
            const unlocked = (i + 2) <= unlockedStage;
            routeG.lineStyle(2.5, unlocked ? 0x2ecc71 : 0x30475e, unlocked ? 0.8 : 0.3);
            routeG.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }

        // Tạo 10 node chiến dịch
        const stagesSliced = StageConfig.slice(0, 10);
        stagesSliced.forEach((stage, index) => {
            if (index >= nodePositions.length) return;
            const pos = nodePositions[index];
            const isUnlocked = stage.id <= unlockedStage;
            const isBoss = (stage.id === 5 || stage.id === 8);
            const isFinal = (stage.id === 10);

            this.createStageNode(pos.x, pos.y, stage, isUnlocked, isBoss, isFinal, () => {
                this.registry.set('selectedStage', stage.id);
                this.registry.set('isEndlessMode', false);
                const nextScene = (this.registry.get('gameMode') === 'action') ? 'ActionModeScene' : 'CampaignModeScene';
                this.scene.start(nextScene);
            });
        });

        // Nút điều hướng chân trang & Reset tiến trình
        this.createFooterControls(width, height);
    }

    /**
     * Tạo node điểm chiến dịch trên hải đồ
     */
    createStageNode(x, y, stage, isUnlocked, isBoss, isFinal, onClick) {
        const container = this.add.container(x, y);

        // Màu sắc theo trạng thái
        let ringColor = 0x57606f;
        let nodeRadius = 32;

        if (isUnlocked) {
            if (isFinal) {
                ringColor = 0xffd700;
                nodeRadius = 38;
            } else if (isBoss) {
                ringColor = (stage.id === 5) ? 0xff0055 : 0xff3838;
                nodeRadius = 36;
            } else {
                ringColor = 0x2ed573;
                nodeRadius = 32;
            }
        }

        // Hào quang phát sáng (chỉ cho các node mở khóa)
        if (isUnlocked) {
            const glow = this.add.circle(0, 0, nodeRadius + 8, ringColor, 0.14);
            container.add(glow);
            this.tweens.add({ targets: glow, alpha: 0.04, radius: nodeRadius + 14, duration: 1200, yoyo: true, repeat: -1 });
        }

        const ring = this.add.circle(0, 0, nodeRadius, 0x061527, 0.96);
        ring.setStrokeStyle(isFinal || isBoss ? 3 : 2.5, ringColor, 1);

        // Hiển thị code sector
        let codeLabel = `S${stage.id < 10 ? '0' + stage.id : stage.id}`;
        const codeText = this.add.text(0, -10, codeLabel, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: isFinal || isBoss ? '10px' : '11px',
            fontStyle: 'bold',
            color: isUnlocked ? '#ffffff' : '#747d8c'
        }).setOrigin(0.5);

        let iconLabel = '🔒';
        let iconColor = '#747d8c';
        let iconSize = '9px';
        if (isUnlocked) {
            if (isFinal) {
                iconLabel = '★ FINAL';
                iconColor = '#ffd700';
                iconSize = '10px';
            } else if (stage.id === 5) {
                iconLabel = '💀 BOSS 1';
                iconColor = '#ff4757';
                iconSize = '9px';
            } else if (stage.id === 8) {
                iconLabel = '💀 BOSS 2';
                iconColor = '#ff6b81';
                iconSize = '9px';
            } else {
                iconLabel = '▶';
                iconColor = '#2ed573';
                iconSize = '11px';
            }
        }

        const statusIcon = this.add.text(0, 8, iconLabel, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: iconSize,
            fontStyle: 'bold',
            color: iconColor
        }).setOrigin(0.5);

        // Nhãn tên màn phía dưới
        const nameLabel = this.add.text(0, nodeRadius + 9, stage.name, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10px',
            fontStyle: isFinal || isBoss ? 'bold' : 'normal',
            align: 'center',
            color: isUnlocked ? (isFinal ? '#ffd700' : (isBoss ? '#ff6b81' : '#00d2ff')) : '#747d8c',
            wordWrap: { width: 110 }
        }).setOrigin(0.5, 0);

        const stars = (SaveManager.getStageStars && isUnlocked) ? SaveManager.getStageStars(stage.id) : 0;
        let starStr = '';
        if (stars > 0) {
            starStr = (stars === 3 ? '★★★ ' : (stars === 2 ? '★★☆ ' : '★☆☆ '));
        }

        const rewardLabel = this.add.text(0, nodeRadius + 32, `${starStr}+${stage.tokensReward}⭐`, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9px',
            color: isUnlocked ? '#f1c40f' : '#57606f'
        }).setOrigin(0.5, 0);

        container.add([ring, codeText, statusIcon, nameLabel, rewardLabel]);

        if (isUnlocked) {
            container.setSize(nodeRadius * 2 + 10, nodeRadius * 2 + 10);
            container.setInteractive({ useHandCursor: true });

            container.on('pointerover', () => { container.setScale(1.08); this.showTooltip(container.x, container.y - 75, stage); });
            container.on('pointerout', () => { container.setScale(1.0); this.hideTooltip(); });
            container.on('pointerdown', () => {
                SoundManager.playClick();
                if (onClick) onClick();
            });

            // Nhịp đập nhẹ cho node mở khóa
            this.tweens.add({ targets: ring, scaleX: 1.05, scaleY: 1.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
    }

    /**
     * Tooltip thông tin màn khi hover
     */
    showTooltip(x, y, stage) {
        if (this.tooltip) this.tooltip.destroy();

        this.tooltip = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x030f1e, 0.96);
        bg.lineStyle(1.5, 0x00d2ff, 0.85);
        bg.fillRoundedRect(-145, -42, 290, 84, 6);
        bg.strokeRoundedRect(-145, -42, 290, 84, 6);

        const t1 = this.add.text(0, -28, stage.name, {
            fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#00d2ff'
        }).setOrigin(0.5);

        const t2 = this.add.text(0, -10, stage.subName || '', {
            fontFamily: 'system-ui, sans-serif', fontSize: '10px', color: '#a4b0be'
        }).setOrigin(0.5);

        const t3 = this.add.text(0, 8, stage.desc || '', {
            fontFamily: 'system-ui, sans-serif', fontSize: '10px', color: '#ecf0f1',
            wordWrap: { width: 270 }, align: 'center'
        }).setOrigin(0.5, 0);

        this.tooltip.add([bg, t1, t2, t3]);
        this.tooltip.setDepth(50);
    }

    hideTooltip() {
        if (this.tooltip) { this.tooltip.destroy(); this.tooltip = null; }
    }

    /**
     * Nút điều hướng cuối trang & Reset Tiến Trình
     */
    createFooterControls(width, height) {
        const btnY = height - 42;

        this.createFooterBtn(width * 0.14, btnY, '◀ QUAY VỀ MENU', 0x70a1ff, () => {
            this.scene.start('MenuScene');
        }, 180);

        this.createFooterBtn(width * 0.38, btnY, '🚢 QUẢN LÝ HẠM ĐỘI', 0x1abc9c, () => {
            this.scene.start('FleetManageScene');
        }, 200);

        this.createFooterBtn(width * 0.62, btnY, '⚙ TRUNG TÂM NÂNG CẤP', 0xf1c40f, () => {
            this.scene.start('UpgradeScene');
        }, 200);

        this.createFooterBtn(width * 0.86, btnY, '🔄 RESET TIẾN TRÌNH', 0xff4757, () => {
            this.showResetConfirmDialog(width, height);
        }, 190);
    }

    createFooterBtn(x, y, text, color, callback, btnWidth = 200) {
        const btn = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(0x0b1929, 0.92);
        bg.lineStyle(1.5, color, 0.85);
        bg.fillRoundedRect(-btnWidth / 2, -18, btnWidth, 36, 4);
        bg.strokeRoundedRect(-btnWidth / 2, -18, btnWidth, 36, 4);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.add([bg, label]);
        btn.setSize(btnWidth, 36);
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => btn.setScale(1.04));
        btn.on('pointerout', () => btn.setScale(1.0));
        btn.on('pointerdown', () => {
            SoundManager.playClick();
            callback();
        });
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
            this.bg.tilePositionX += 0.25;
            this.bg.tilePositionY += 0.12;
        }
    }
}
