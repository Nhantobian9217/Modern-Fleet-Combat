/**
 * MiniMap.js - Bản đồ Thu nhỏ Chiến thuật (Tactical Radar Mini-map)
 * 
 * Hiển thị bao quát toàn bộ chiến trường 3200 x 2200 px:
 * - Vị trí Soái hạm tàu sân bay (Chấm xanh dương lớn)
 * - Tàu con hộ tống (Chấm xanh lá)
 * - Tiêm kích F-35C (Chấm cyan nhỏ)
 * - Hạm đội địch (Chấm đỏ)
 * - Siêu Boss KRAKEN (Biểu tượng đỏ nhấp nháy phát quang)
 * - Địa hình Đảo & Giàn khoan (Chấm vàng cát / xám thép)
 * - Khung hình chữ nhật hiển thị tầm nhìn Camera hiện tại
 * - Nhấp chuột vào Mini-map để dịch chuyển Camera nhanh chóng!
 */

import { GameConfig } from '../config/GameConfig.js';

export class MiniMap {
    constructor(scene, x, y, width = 210, height = 145) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.worldW = GameConfig.worldWidth;
        this.worldH = GameConfig.worldHeight;
        this.scaleX = width / this.worldW;
        this.scaleY = height / this.worldH;

        // Container UI
        this.container = scene.add.container(x, y);
        this.container.setScrollFactor(0); // Cố định trên màn hình
        this.container.setDepth(100);

        // Nền khung Radar công nghệ cao
        this.bg = scene.add.graphics();
        this.bg.fillStyle(0x061423, 0.88);
        this.bg.lineStyle(2, 0x00d2ff, 0.85);
        this.bg.fillRoundedRect(0, 0, width, height, 6);
        this.bg.strokeRoundedRect(0, 0, width, height, 6);
        this.container.add(this.bg);

        // Lưới radar
        this.grid = scene.add.graphics();
        this.grid.lineStyle(1, 0x00d2ff, 0.15);
        this.grid.lineBetween(width / 2, 0, width / 2, height);
        this.grid.lineBetween(0, height / 2, width, height / 2);
        this.container.add(this.grid);

        // Đồ họa hiển thị các chấm thực thể
        this.blipsGraphics = scene.add.graphics();
        this.container.add(this.blipsGraphics);

        // Khung nhìn Camera (Viewport Rect)
        this.camRect = scene.add.graphics();
        this.container.add(this.camRect);

        // Nhãn tiêu đề
        const label = scene.add.text(8, 6, 'TACTICAL RADAR', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#00d2ff',
            letterSpacing: 1
        });
        this.container.add(label);

        // Tương tác nhấp chuột điều hướng camera
        const hitArea = scene.add.zone(width / 2, height / 2, width, height);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', (pointer) => {
            const localX = pointer.x - this.container.x;
            const localY = pointer.y - this.container.y;
            const targetWorldX = localX / this.scaleX;
            const targetWorldY = localY / this.scaleY;

            const mainCam = this.scene.battleScene.cameras.main;
            if (mainCam) {
                mainCam.pan(targetWorldX, targetWorldY, 350, 'Power2');
            }
        });
        this.container.add(hitArea);
    }

    update() {
        if (!this.scene.battleScene) return;
        const bs = this.scene.battleScene;

        this.blipsGraphics.clear();
        this.camRect.clear();

        // 1. VẼ ĐỊA HÌNH (ĐẢO & GIÀN KHOAN)
        if (bs.obstacles) {
            bs.obstacles.forEach(obs => {
                const mx = obs.x * this.scaleX;
                const my = obs.y * this.scaleY;
                const mr = Math.max(2, obs.radius * this.scaleX);

                if (obs.obstacleType === 'oil_rig') {
                    this.blipsGraphics.fillStyle(0xf39c12, 0.85);
                    this.blipsGraphics.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
                } else {
                    this.blipsGraphics.fillStyle(0xd4ac0d, 0.7);
                    this.blipsGraphics.fillCircle(mx, my, mr);
                }
            });
        }

        // 2. VẼ TÀU SÂN BAY MẸ (Chấm xanh dương lớn)
        if (bs.playerShip && bs.playerShip.active && bs.playerShip.hp > 0) {
            const px = bs.playerShip.x * this.scaleX;
            const py = bs.playerShip.y * this.scaleY;

            this.blipsGraphics.fillStyle(0x00d2ff, 1);
            this.blipsGraphics.fillCircle(px, py, 4.5);
            this.blipsGraphics.lineStyle(1.5, 0xffffff, 0.9);
            this.blipsGraphics.strokeCircle(px, py, 4.5);
        }

        // 3. VẼ TÀU HỘ TỐNG ĐỒNG MINH (Chấm xanh lá)
        if (bs.allyFleet) {
            this.blipsGraphics.fillStyle(0x2ecc71, 0.9);
            bs.allyFleet.forEach(ally => {
                if (!ally || !ally.active || ally.hp <= 0) return;
                const ax = ally.x * this.scaleX;
                const ay = ally.y * this.scaleY;
                this.blipsGraphics.fillCircle(ax, ay, 3);
            });
        }

        // 4. VẼ TIÊM KÍCH F-35C (Chấm cyan nhỏ)
        if (bs.aircraftSquadron) {
            this.blipsGraphics.fillStyle(0x00f2fe, 0.8);
            bs.aircraftSquadron.forEach(jet => {
                if (!jet || !jet.active || jet.hp <= 0 || jet.state === 'PARKED') return;
                const jx = jet.x * this.scaleX;
                const jy = jet.y * this.scaleY;
                this.blipsGraphics.fillCircle(jx, jy, 2);
            });
        }

        // 5. VẼ HẠM ĐỘI ĐỊCH & BOSS KRAKEN (Chấm đỏ / Biểu tượng trùm)
        if (bs.enemyFleet) {
            bs.enemyFleet.forEach(enemy => {
                if (!enemy || !enemy.active || enemy.hp <= 0) return;
                const ex = enemy.x * this.scaleX;
                const ey = enemy.y * this.scaleY;

                if (enemy.configKey === 'dreadnought_boss') {
                    // Boss KRAKEN nhấp nháy phát quang
                    this.blipsGraphics.fillStyle(0xff0033, 1);
                    this.blipsGraphics.fillCircle(ex, ey, 6);
                    this.blipsGraphics.lineStyle(2, 0xfff200, 1);
                    this.blipsGraphics.strokeCircle(ex, ey, 6);
                } else {
                    this.blipsGraphics.fillStyle(0xff4757, 0.95);
                    this.blipsGraphics.fillCircle(ex, ey, 3);
                }
            });
        }

        // 6. KHUNG NHÌN CAMERA VIEWPORT
        const mainCam = bs.cameras.main;
        if (mainCam) {
            const camX = mainCam.worldView.x * this.scaleX;
            const camY = mainCam.worldView.y * this.scaleY;
            const camW = mainCam.worldView.width * this.scaleX;
            const camH = mainCam.worldView.height * this.scaleY;

            this.camRect.lineStyle(1.5, 0xffffff, 0.5);
            this.camRect.strokeRect(camX, camY, camW, camH);
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
