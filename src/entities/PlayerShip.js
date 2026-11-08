/**
 * PlayerShip.js - Tàu mẹ Citadel
 * 
 * Tính năng Nâng cấp Toàn diện:
 * 1. Cơ chế Hư hỏng Bộ phận (Modular Damage): Động cơ, Tháp pháo, Radar
 * 2. Hiển thị máy bay đỗ trên boong (tối đa 10 máy bay)
 * 3. Chịu ảnh hưởng thời tiết động (Mưa bão, Sương mù, Sóng lớn)
 * 4. 2 khẩu pháo tự vệ tự động bắn + 1 slot Tomahawk tầm xa
 */

import { HealthBar } from '../ui/HealthBar.js';
import { Projectile } from './Projectile.js';
import { Missile } from './Missile.js';
import { WeaponConfig } from '../config/WeaponConfig.js';
import { GameConfig } from '../config/GameConfig.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class PlayerShip extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config) {
        super(scene, x, y);

        this.scene = scene;
        this.config = config;

        // NÂNG CẤP VĨNH VIỄN
        const hpMult = SaveManager.getMultiplier('hp');
        const spdMult = SaveManager.getMultiplier('speed');
        this.dmgMult = SaveManager.getMultiplier('damage');
        this.radarMult = SaveManager.getMultiplier('radar');

        // Chỉ số chiến đấu cơ bản
        this.maxHp = Math.round((config.maxHp || 4500) * hpMult);
        this.hp = this.maxHp;
        this.baseSpeed = (config.speed || 95) * spdMult;
        this.speed = this.baseSpeed;
        this.acceleration = (config.acceleration || 55) * spdMult;
        this.turnSpeed = config.turnSpeed || 42;
        this.drag = config.drag || 40;
        this.armor = config.armor || 28;

        this.baseRadarRadius = Math.round((GameConfig.radarRadius || 920) * this.radarMult);
        this.radarRadius = this.baseRadarRadius;

        // HỆ THỐNG HƯ HỎNG BỘ PHẬN (MODULAR DAMAGE)
        this.modules = {
            engine: { name: 'Động cơ', hp: 550, maxHp: 550, damaged: false },
            turrets: { name: 'Tháp pháo', hp: 500, maxHp: 500, damaged: false },
            radar: { name: 'Radar', hp: 450, maxHp: 450, damaged: false }
        };

        // Vũ khí
        this.cannonConfig = WeaponConfig[config.cannonWeapon] || WeaponConfig.carrier_defense_cannon;
        this.missileConfig = WeaponConfig[config.missileWeapon] || WeaponConfig.tomahawk_carrier;
        this.missileCooldown = config.missileCooldown || 15000;
        this.lastMissileTime = 0;

        // ĐỒNG BỘ TRANG BỊ TỪ SAVEMANAGER (NẾU CÓ)
        this.syncEquippedSlots();

        // HỆ THỐNG TỰ SỬA CHỮA (AUTO-REPAIR SYSTEM)
        this.lastDamageTakenTime = 0;
        this.repairEffectTimer = 0;

        this.lastPortFireTime = 0;
        this.lastStarboardFireTime = 150;
        this.currentForwardSpeed = 0;

        // Vòng tròn Radar
        this.radarGraphics = scene.add.graphics();
        this.radarGraphics.setDepth(4);
        this.radarSweepAngle = 0;

        this.isFortress = !!config.stationary;

        // Thân tàu sân bay hoặc Pháo đài thân kép
        const hullTex = this.isFortress ? 'campaign_fortress_hull' : 'carrier_hull';
        this.hull = scene.add.sprite(0, 0, hullTex);
        this.hull.setOrigin(0.5, 0.5);
        this.add(this.hull);

        // ĐẶT GÓC XOAY NGANG 90 ĐỘ (HƯỚNG ĐÔNG - SANG PHẢI) CHO TOÀN BỘ SOÁI HẠM & MÁY BAY BOONG
        this.setAngle(90);

        // Khẩu pháo tự vệ (Tất cả tàng hình 100% theo quy tắc citadel.ini & ford.ini: image_turret: NONE / NO.png)
        this.turrets = [];
        if (this.isFortress) {
            // 4 Khẩu pháo phân bố 4 góc pháo đài thân kép (tọa độ local bên trong container)
            const positions = [
                { x: -45, y: -65 },
                { x: 45, y: -65 },
                { x: -45, y: 65 },
                { x: 45, y: 65 }
            ];
            positions.forEach(pos => {
                const t = scene.add.sprite(pos.x, pos.y, 'carrier_turret_small');
                t.setOrigin(0.5, 0.65);
                t.setVisible(false); // 100% INVISIBLE THEO YÊU CẦU
                this.add(t);
                this.turrets.push({ sprite: t, lastFire: Math.random() * 300 });
            });
            // Giữ tương thích tham chiếu cũ
            this.turretPort = this.turrets[0].sprite;
            this.turretStarboard = this.turrets[2].sprite;

            // THÁP RADAR XOAY TRÒN TRÊN SOÁI HẠM CITADEL THEO citadel.ini ([arm_2] x: 23, y: -27)
            this.radarDish = scene.add.sprite(23, -27, 'citadel_radar_dish');
            this.radarDish.setOrigin(0.5, 0.5);
            this.radarDish.setDepth(11);
            this.add(this.radarDish);
        } else {
            // 2 Khẩu pháo nhỏ mạn trái và mạn phải CVN-78 (Tàng hình theo Ford.ini)
            this.turretPort = scene.add.sprite(-22, 25, 'carrier_turret_small');
            this.turretPort.setOrigin(0.5, 0.65);
            this.turretPort.setVisible(false);
            this.add(this.turretPort);

            this.turretStarboard = scene.add.sprite(25, 15, 'carrier_turret_small');
            this.turretStarboard.setOrigin(0.5, 0.65);
            this.turretStarboard.setVisible(false);
            this.add(this.turretStarboard);

            this.turrets.push({ sprite: this.turretPort, lastFire: 0 });
            this.turrets.push({ sprite: this.turretStarboard, lastFire: 150 });
        }

        // Đồ họa hiển thị máy bay đỗ trên boong (Tàng hình 100% khi chưa có asset custom)
        this.parkedJetsGraphics = scene.add.graphics();
        this.parkedJetsGraphics.setVisible(false);
        this.add(this.parkedJetsGraphics);

        // HỆ THỐNG PHÒNG KHÔNG TỰ ĐỘNG BẮN TÊN LỬA RIM-116 / RIM-162 / SM-3 / SM-6 ĐÁNH CHẶN
        this.antiAirMissiles = config.antiAirMissiles || (this.isFortress ? ['sm6', 'sm3', 'rim162', 'rim162', 'rim116', 'rim116'] : ['sm3', 'rim162', 'rim162', 'rim116', 'rim116']);
        this.initAntiAirBatteries();

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Khi xoay ngang 90 độ, chiều ngang AABB là 220, chiều dọc là 140
        const bW = this.isFortress ? 220 : 160;
        const bH = this.isFortress ? 140 : 64;
        this.body.setSize(bW, bH);
        this.body.setOffset(-bW / 2, -bH / 2);
        this.body.setCollideWorldBounds(true);
        if (this.isFortress) {
            this.body.setImmovable(true);
        }
        this.setDepth(10);

        const hpBarW = this.isFortress ? 130 : 96;
        const hpBarY = this.isFortress ? -115 : -95;
        this.healthBar = new HealthBar(scene, this, hpBarW, 9, hpBarY);
        this.wakeTimer = 0;
        this.smokeTimer = 0;
        this.fireFxTimer = 0; // Hiệu ứng lửa cháy dữ dội khi HP < 20%
    }

    update(time, delta, cursors, wasdKeys, pointer) {
        if (!this.active || this.hp <= 0) return;

        const deltaSec = delta / 1000;

        // --- 1. ĐỒNG BỘ ẢNH HƯỞNG THỜI TIẾT & BỘ PHẬN HỎNG ---
        this.applyEnvironmentalAndModuleModifiers();

        // --- 2. BẺ LÁI & TĂNG TỐC (CHỈ KHI KHÔNG PHẢI PHÁO ĐÀI CỐ ĐỊNH) ---
        if (!this.isFortress) {
            let turning = 0;
            if (wasdKeys.A.isDown || cursors.left.isDown) turning = -1;
            else if (wasdKeys.D.isDown || cursors.right.isDown) turning = 1;

            if (turning !== 0) {
                const steerFactor = Math.abs(this.currentForwardSpeed) > 10 ? 1 : 0.35;
                this.angle += turning * this.turnSpeed * deltaSec * steerFactor;
            }

            let throttle = 0;
            if (wasdKeys.W.isDown || cursors.up.isDown) throttle = 1;
            else if (wasdKeys.S.isDown || cursors.down.isDown) throttle = -0.5;

            if (throttle > 0) {
                this.currentForwardSpeed = Math.min(
                    this.speed,
                    this.currentForwardSpeed + this.acceleration * deltaSec
                );
            } else if (throttle < 0) {
                this.currentForwardSpeed = Math.max(
                    -this.speed * 0.45,
                    this.currentForwardSpeed - this.acceleration * deltaSec
                );
            } else {
                if (this.currentForwardSpeed > 0) {
                    this.currentForwardSpeed = Math.max(0, this.currentForwardSpeed - this.drag * deltaSec);
                } else if (this.currentForwardSpeed < 0) {
                    this.currentForwardSpeed = Math.min(0, this.currentForwardSpeed + this.drag * deltaSec);
                }
            }

            const moveRad = Phaser.Math.DegToRad(this.angle - 90);
            this.body.setVelocity(
                Math.cos(moveRad) * this.currentForwardSpeed,
                Math.sin(moveRad) * this.currentForwardSpeed
            );
        } else {
            this.currentForwardSpeed = 0;
            this.body.setVelocity(0, 0);
        }

        // --- 3. PHÁO TỰ ĐỘNG BẮN ---
        this.updateAutoTurrets(time, pointer);

        // --- 4. TẠO BỌT SÓNG & KHÓI ĐỘNG CƠ HỎNG ---
        if (!this.isFortress && Math.abs(this.currentForwardSpeed) > 15) {
            this.wakeTimer += delta;
            if (this.wakeTimer > 90) {
                this.wakeTimer = 0;
                this.createWakeEffect();
            }
        }

        // Tình trạng hư hại thân tàu:
        // Khói đen bốc lên khi HP < 50% hoặc động cơ hỏng
        const hpPercent = this.hp / this.maxHp;
        if (this.modules.engine.damaged || hpPercent < 0.5) {
            this.smokeTimer += delta;
            if (this.smokeTimer > (hpPercent < 0.3 ? 80 : 130)) {
                this.smokeTimer = 0;
                this.createDamageSmoke();
            }
        }

        // Lửa cháy dữ dội khi HP < 20%
        if (hpPercent < 0.2) {
            this.fireFxTimer += delta;
            if (this.fireFxTimer > 100) {
                this.fireFxTimer = 0;
                this.createHullFireEffect();
            }
        }

        // --- 5. VẼ RADAR CHIẾN THUẬT & XOAY RADAR DISH ---
        if (this.radarDish) {
            this.radarDish.angle += 2;
        }
        this.drawRadarCircle(deltaSec);

        // --- 6. PHÒNG KHÔNG TỰ ĐỘNG BẮN TÊN LỬA RIM-162 ĐÁNH CHẶN ---
        this.updateAutoAntiAirMissile(time);

        // --- 7. HỆ THỐNG TỰ SỬA CHỮA (AUTO-REPAIR SYSTEM) ---
        this.updateAutoRepair(time, deltaSec);

        this.healthBar.update();
    }

    syncEquippedSlots() {
        // Cập nhật cấu hình vũ khí gắn theo Slot đã mua/thay thế
        const slot1Item = SaveManager.getEquippedSlot('slot1') || 'ags155';
        const slot2Item = SaveManager.getEquippedSlot('slot2') || 'ags155';
        const slot3Item = SaveManager.getEquippedSlot('slot3') || 'tomahawk_carrier';

        this.portCannonConfig = WeaponConfig[slot1Item] || this.cannonConfig;
        this.starboardCannonConfig = WeaponConfig[slot2Item] || this.cannonConfig;
        this.missileConfig = WeaponConfig[slot3Item] || this.missileConfig;
    }

    updateAutoRepair(time, deltaSec) {
        if (this.hp <= 0 || this.hp >= this.maxHp) return;

        // 10 giây không nhận sát thương
        const timeSinceHit = time - this.lastDamageTakenTime;
        if (timeSinceHit >= 10000) {
            // Hồi phục 0.5% Máu (HP) tổng mỗi giây
            const healPerSec = this.maxHp * 0.005;
            this.hp = Math.min(this.maxHp, this.hp + healPerSec * deltaSec);
            this.healthBar.setHp(this.hp);
            this.scene.events.emit('updatePlayerHp', Math.round(this.hp), this.maxHp);

            // Hiệu ứng khói hàn / sửa chữa phát ra từ thân tàu
            this.repairEffectTimer += deltaSec * 1000;
            if (this.repairEffectTimer > 250) {
                this.repairEffectTimer = 0;
                this.createWeldingRepairEffect();
            }
        }
    }

    createWeldingRepairEffect() {
        const radShip = Phaser.Math.DegToRad(this.angle);
        const randX = (Math.random() * 30 - 15);
        const randY = (Math.random() * 80 - 40);
        const sparkX = this.x + randX * Math.cos(radShip) - randY * Math.sin(radShip);
        const sparkY = this.y + randX * Math.sin(radShip) + randY * Math.cos(radShip);

        // Tia lửa hàn sáng xanh lục / trắng
        const spark = this.scene.add.circle(sparkX, sparkY, 3, 0x38ef7d, 0.95);
        spark.setDepth(17);
        this.scene.tweens.add({
            targets: spark,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => spark.destroy()
        });
    }

    applyEnvironmentalAndModuleModifiers() {
        let speedMod = 1.0;
        let radarMod = 1.0;

        // Thời tiết
        if (this.scene.currentWeather) {
            speedMod *= (this.scene.currentWeather.speedMod || 1.0);
            radarMod *= (this.scene.currentWeather.radarMod || 1.0);
        }

        // Hư hỏng Động cơ -> Giảm 50% tốc độ
        if (this.modules.engine.damaged) {
            speedMod *= 0.50;
        }

        // Hư hỏng Radar -> Giảm 35% tầm quét
        if (this.modules.radar.damaged) {
            radarMod *= 0.65;
        }

        this.speed = this.baseSpeed * speedMod;
        this.radarRadius = Math.round(this.baseRadarRadius * radarMod);
    }

    updateAutoTurrets(time, pointer) {
        const enemies = this.scene.enemyFleet || [];
        const globalShipAngleRad = Phaser.Math.DegToRad(this.angle);

        // Nếu tháp pháo bị hỏng -> thời gian nạp tăng gấp 2.5 lần
        const cooldownMod = this.modules.turrets.damaged ? 2.5 : 1.0;
        const cannonCfg = this.portCannonConfig || this.cannonConfig;
        const cooldown = cannonCfg.cooldown * cooldownMod;
        const radarRange = cannonCfg.radarRange || cannonCfg.range || 850;
        const weaponRange = cannonCfg.weaponRange || 540;

        // Tập hợp danh sách mục tiêu khả dụng:
        // PHÁO HẠM AGS-155: CHỈ BẮN TÀU ĐỊCH (SHIP TARGET ONLY - KHÔNG BẮN TÊN LỬA / MÁY BAY)
        const targets = [];
        const allowAntiAir = cannonCfg.antiAir && cannonCfg.targetType !== 'ship_only';

        if (allowAntiAir) {
            const enemyMissiles = (this.scene.enemyProjectiles ? this.scene.enemyProjectiles.getChildren() : []).filter(p => p && p.active && p.maxHp);
            enemyMissiles.forEach(m => {
                const d = Phaser.Math.Distance.Between(this.x, this.y, m.x, m.y);
                if (d <= radarRange) targets.push({ obj: m, dist: d, priority: 1 });
            });
        }

        enemies.forEach(e => {
            if (e && e.active && e.hp > 0) {
                const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
                if (d <= radarRange) targets.push({ obj: e, dist: d, priority: 2 });
            }
        });

        // Sắp xếp ưu tiên khoảng cách gần nhất
        targets.sort((a, b) => a.priority - b.priority || a.dist - b.dist);

        // Bắn từng tháp pháo độc lập (2 tháp pháo hoặc 4 tháp pháo)
        this.turrets.forEach((turretObj, idx) => {
            const tSprite = turretObj.sprite;
            const assignedTarget = targets[idx % targets.length];

            if (assignedTarget) {
                const targetObj = assignedTarget.obj;

                // Tọa độ thế giới của nòng tháp pháo
                const turretWorldX = this.x + tSprite.x * Math.cos(globalShipAngleRad) - tSprite.y * Math.sin(globalShipAngleRad);
                const turretWorldY = this.y + tSprite.x * Math.sin(globalShipAngleRad) + tSprite.y * Math.cos(globalShipAngleRad);

                // --- CƠ CHẾ TÍNH TOÁN GÓC ĐÓN ĐƯỜNG (LEAD TARGET PREDICTION) ---
                const bulletSpeed = cannonCfg.bulletSpeed || 960;
                const targetVx = (targetObj.body && targetObj.body.velocity) ? targetObj.body.velocity.x : 0;
                const targetVy = (targetObj.body && targetObj.body.velocity) ? targetObj.body.velocity.y : 0;

                const rawDist = Phaser.Math.Distance.Between(turretWorldX, turretWorldY, targetObj.x, targetObj.y);
                let timeOfFlight = rawDist / bulletSpeed;

                // Dự đoán tọa độ địch sẽ tới khi đạn bay đến nơi (2 lần lặp để đạt độ chuẩn xác cao)
                let predictedX = targetObj.x + targetVx * timeOfFlight;
                let predictedY = targetObj.y + targetVy * timeOfFlight;

                const refinedDist = Phaser.Math.Distance.Between(turretWorldX, turretWorldY, predictedX, predictedY);
                timeOfFlight = refinedDist / bulletSpeed;
                predictedX = targetObj.x + targetVx * timeOfFlight;
                predictedY = targetObj.y + targetVy * timeOfFlight;

                // Góc đón đường bắn
                const leadAngle = Phaser.Math.Angle.Between(turretWorldX, turretWorldY, predictedX, predictedY);

                // Độ tản đạn cực hẹp: thu hẹp tối đa trong khoảng ±1 đến ±2 độ (±1.5°)
                const spreadDeg = (Math.random() - 0.5) * 3.0; // [-1.5°, +1.5°]
                const finalFireAngle = leadAngle + Phaser.Math.DegToRad(spreadDeg);

                // Xoay tháp pháo theo góc đón đường
                tSprite.rotation = leadAngle - globalShipAngleRad + Math.PI / 2;

                // CHỈ KHAI HỎA KHI KHOẢNG CÁCH THỰC TẾ <= WEAPONRANGE (540px)
                if (rawDist <= weaponRange && (time - turretObj.lastFire >= cooldown)) {
                    this.fireSingleCannon(tSprite, finalFireAngle, cannonCfg);
                    turretObj.lastFire = time;
                }
            } else {
                tSprite.rotation = 0;
            }
        });
    }

    fireSingleCannon(turretSprite, fireAngleRad, weaponCfg) {
        const radShip = Phaser.Math.DegToRad(this.angle);
        const turretWorldX = this.x + turretSprite.x * Math.cos(radShip) - turretSprite.y * Math.sin(radShip);
        const turretWorldY = this.y + turretSprite.x * Math.sin(radShip) + turretSprite.y * Math.cos(radShip);

        const spawnX = turretWorldX + Math.cos(fireAngleRad) * 18;
        const spawnY = turretWorldY + Math.sin(fireAngleRad) * 18;

        const baseCfg = weaponCfg || this.cannonConfig;
        const config = {
            ...baseCfg,
            damage: Math.round(baseCfg.damage * this.dmgMult)
        };

        const projectile = new Projectile(
            this.scene,
            spawnX,
            spawnY,
            'bullet_player',
            config,
            fireAngleRad,
            'player'
        );
        this.scene.playerProjectiles.add(projectile);

        // Chớp lửa đầu nòng pháo (Muzzle Flash)
        const flash = this.scene.add.sprite(spawnX, spawnY, 'muzzle_flash');
        flash.setRotation(fireAngleRad);
        flash.setScale(0.85);
        flash.setDepth(16);
        this.scene.tweens.add({
            targets: flash,
            scale: 1.3,
            alpha: 0,
            duration: 90,
            onComplete: () => flash.destroy()
        });
    }

    launchTomahawk(targetEnemy = null) {
        if (!this.active || this.hp <= 0) return false;

        const now = this.scene.time.now;
        if (now - this.lastMissileTime < this.missileCooldown) {
            return false;
        }

        let target = targetEnemy;
        if (!target) {
            let closestDist = Infinity;
            (this.scene.enemyFleet || []).forEach(e => {
                if (!e || !e.active || e.hp <= 0) return;
                const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
                if (d <= this.radarRadius && d < closestDist) {
                    closestDist = d;
                    target = e;
                }
            });
        }

        if (!target) {
            if (this.scene.showFloatingMessage) {
                this.scene.showFloatingMessage(this.x, this.y - 60, 'KHÔNG CÓ MỤC TIÊU TRONG RADAR!', 0xff4757);
            }
            return false;
        }

        this.lastMissileTime = now;

        const launchRad = Phaser.Math.DegToRad(this.angle - 90);
        const spawnX = this.x + Math.cos(launchRad) * 40;
        const spawnY = this.y + Math.sin(launchRad) * 40;

        const config = {
            ...this.missileConfig,
            damage: Math.round(this.missileConfig.damage * this.dmgMult),
            range: this.radarRadius
        };

        const texKey = this.missileConfig.textureKey || 'missile_cps';
        const missile = new Missile(
            this.scene,
            spawnX,
            spawnY,
            texKey,
            config,
            target,
            launchRad,
            'player'
        );
        this.scene.playerProjectiles.add(missile);

        return true;
    }

    initAntiAirBatteries() {
        this.antiAirBatteries = (this.antiAirMissiles || []).map((key, index) => {
            const cfg = WeaponConfig[key] || WeaponConfig.rim116;
            return {
                id: `${key}_${index}`,
                type: key,
                config: cfg,
                weaponRange: cfg.weaponRange || cfg.range || 480,
                cooldown: cfg.cooldown || 3500,
                lastFireTime: 0
            };
        });
    }

    updateAutoAntiAirMissile(time) {
        if (!this.active || this.hp <= 0 || !this.scene) return;
        if (!this.antiAirBatteries || this.antiAirBatteries.length === 0) return;

        // 1. Quét toàn bộ mục tiêu đường không (Air Targets Only: Tên lửa & Máy bay địch)
        const airTargets = [];

        // Tên lửa địch đang bay tới
        if (this.scene.enemyProjectiles) {
            const enemyMissiles = this.scene.enemyProjectiles.getChildren().filter(p => p && p.active && p.maxHp && (p.hp === undefined || p.hp > 0));
            enemyMissiles.forEach(m => {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, m.x, m.y);
                airTargets.push({ target: m, dist: dist });
            });
        }

        // Máy bay tiêm kích đối phương
        if (this.scene.enemyAircraft) {
            this.scene.enemyAircraft.forEach(a => {
                if (!a || !a.active || a.hp <= 0) return;
                const dist = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
                airTargets.push({ target: a, dist: dist });
            });
        }

        if (airTargets.length === 0) return;

        // Ưu tiên mối đe dọa gần nhất
        airTargets.sort((a, b) => a.dist - b.dist);

        // 2. Duyệt qua từng bệ phóng tên lửa phòng không độc lập (VLS Cells)
        let firedThisFrame = 0;

        for (let b = 0; b < this.antiAirBatteries.length; b++) {
            const battery = this.antiAirBatteries[b];
            if (time - battery.lastFireTime < battery.cooldown) continue;

            // Tìm mục tiêu phù hợp nằm trong tầm bắn thực tế (weaponRange) của bệ phóng này
            let chosenTarget = null;
            for (let t = 0; t < airTargets.length; t++) {
                const targetIdx = (b + t) % airTargets.length;
                const candidate = airTargets[targetIdx];
                if (candidate.dist <= battery.weaponRange && candidate.target.active && (candidate.target.hp === undefined || candidate.target.hp > 0)) {
                    chosenTarget = candidate.target;
                    break;
                }
            }

            if (!chosenTarget) {
                for (let t = 0; t < airTargets.length; t++) {
                    const candidate = airTargets[t];
                    if (candidate.dist <= battery.weaponRange && candidate.target.active && (candidate.target.hp === undefined || candidate.target.hp > 0)) {
                        chosenTarget = candidate.target;
                        break;
                    }
                }
            }

            if (chosenTarget) {
                const delayMs = firedThisFrame * 120;
                battery.lastFireTime = time + delayMs;
                firedThisFrame++;

                const targetRef = chosenTarget;
                const cfg = battery.config;
                const typeKey = battery.type;

                this.scene.time.delayedCall(delayMs, () => {
                    if (!this.active || this.hp <= 0 || !targetRef.active || (targetRef.hp !== undefined && targetRef.hp <= 0)) return;

                    const launchRad = Phaser.Math.Angle.Between(this.x, this.y, targetRef.x, targetRef.y);
                    const spawnX = this.x + Math.cos(launchRad) * 35;
                    const spawnY = this.y + Math.sin(launchRad) * 35;

                    const missile = new Missile(
                        this.scene,
                        spawnX,
                        spawnY,
                        cfg.textureKey || `missile_${typeKey}`,
                        cfg,
                        targetRef,
                        launchRad,
                        'player'
                    );
                    this.scene.playerProjectiles.add(missile);
                });
            }
        }
    }

    drawRadarCircle(deltaSec) {
        if (!this.radarGraphics) return;

        this.radarGraphics.clear();
        const r = this.radarRadius;

        this.radarGraphics.lineStyle(1.5, 0x00d2ff, 0.22);
        this.radarGraphics.strokeCircle(this.x, this.y, r);

        this.radarGraphics.lineStyle(1, 0x00d2ff, 0.12);
        this.radarGraphics.strokeCircle(this.x, this.y, r * 0.6);

        this.radarGraphics.lineBetween(this.x - r, this.y, this.x + r, this.y);
        this.radarGraphics.lineBetween(this.x, this.y - r, this.x, this.y + r);

        this.radarSweepAngle += deltaSec * 1.5;
        const sweepX = this.x + Math.cos(this.radarSweepAngle) * r;
        const sweepY = this.y + Math.sin(this.radarSweepAngle) * r;

        this.radarGraphics.lineStyle(2, 0x00f2fe, 0.4);
        this.radarGraphics.lineBetween(this.x, this.y, sweepX, sweepY);
    }

    createWakeEffect() {
        const sternAngleRad = Phaser.Math.DegToRad(this.angle + 90);
        [-20, 0, 20].forEach(offset => {
            const perp = sternAngleRad + Math.PI / 2;
            const wakeX = this.x + Math.cos(sternAngleRad) * 82 + Math.cos(perp) * offset;
            const wakeY = this.y + Math.sin(sternAngleRad) * 82 + Math.sin(perp) * offset;

            // Bọt nước trắng xóa (Foam particles)
            const foam = this.scene.add.sprite(wakeX, wakeY, 'foam_particle');
            foam.setScale(0.8 + Math.random() * 0.6);
            foam.setAlpha(0.85);
            foam.setDepth(5);
            this.scene.tweens.add({
                targets: foam,
                alpha: 0,
                scale: 2.2,
                duration: 650,
                onComplete: () => foam.destroy()
            });
        });
    }

    createHullFireEffect() {
        const radShip = Phaser.Math.DegToRad(this.angle);
        const rx = (Math.random() * 32 - 16);
        const ry = (Math.random() * 90 - 45);
        const fx = this.x + rx * Math.cos(radShip) - ry * Math.sin(radShip);
        const fy = this.y + rx * Math.sin(radShip) + ry * Math.cos(radShip);

        const fire = this.scene.add.sprite(fx, fy, 'fire_particle');
        fire.setDepth(18);
        fire.setScale(0.9 + Math.random() * 0.5);
        this.scene.tweens.add({
            targets: fire,
            scale: 0.2,
            alpha: 0,
            y: fy - 18,
            duration: 350,
            onComplete: () => fire.destroy()
        });
    }

    createDamageSmoke() {
        const sternAngleRad = Phaser.Math.DegToRad(this.angle + 90);
        const smokeX = this.x + Math.cos(sternAngleRad) * 55;
        const smokeY = this.y + Math.sin(sternAngleRad) * 55;

        const smoke = this.scene.add.circle(smokeX + (Math.random() * 8 - 4), smokeY + (Math.random() * 8 - 4), 6, 0x2d3436, 0.75);
        smoke.setDepth(15);
        this.scene.tweens.add({
            targets: smoke,
            alpha: 0,
            scale: 2.5,
            duration: 600,
            onComplete: () => smoke.destroy()
        });
    }

    takeDamage(damageAmount, damageType = 'normal') {
        if (!this.active || this.hp <= 0) return;

        // CẬP NHẬT THỜI ĐIỂM BỊ SÁT THƯƠNG ĐỂ RESET AUTO-REPAIR
        if (this.scene && this.scene.time) {
            this.lastDamageTakenTime = this.scene.time.now;
        }

        const actualDamage = Math.max(8, Math.round(damageAmount * (1 - this.armor / 100)));
        this.hp -= actualDamage;
        this.healthBar.setHp(this.hp);

        // HƯ HỎNG BỘ PHẬN (CƠ CHẾ MODULAR DAMAGE)
        this.distributeModularDamage(actualDamage);

        this.scene.tweens.add({
            targets: [this.hull, this.turretPort, this.turretStarboard],
            tint: 0xff3b30,
            duration: 70,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                if (this.hull) this.hull.clearTint();
                if (this.turretPort) this.turretPort.clearTint();
                if (this.turretStarboard) this.turretStarboard.clearTint();
            }
        });

        if (this.scene.showFloatingDamage) {
            this.scene.showFloatingDamage(this.x, this.y - 35, `-${actualDamage}`, 0xff4757);
        }

        if (this.hp <= 0) {
            this.sinkAndDestroy();
        }
    }

    distributeModularDamage(amount) {
        const moduleKeys = ['engine', 'turrets', 'radar'];
        const chosenKey = moduleKeys[Math.floor(Math.random() * moduleKeys.length)];
        const mod = this.modules[chosenKey];

        if (mod && !mod.damaged) {
            mod.hp -= Math.round(amount * 0.6);
            if (mod.hp <= 0) {
                mod.hp = 0;
                mod.damaged = true;
                if (this.scene.showFloatingMessage) {
                    this.scene.showFloatingMessage(this.x, this.y - 75, `⚠ HƯ HỎNG: ${mod.name.toUpperCase()}!`, 0xff3838);
                }
            }
            // Gửi cập nhật trạng thái bộ phận sang UIScene
            if (this.scene.events) {
                this.scene.events.emit('updateModules', this.modules);
            }
        }
    }

    sinkAndDestroy() {
        this.body.setVelocity(0, 0);
        const currentScene = this.scene;

        if (this.radarGraphics) {
            this.radarGraphics.destroy();
            this.radarGraphics = null;
        }

        if (currentScene && currentScene.createExplosion) {
            currentScene.createExplosion(this.x, this.y, 'huge');
        }

        if (currentScene) {
            currentScene.tweens.add({
                targets: this,
                alpha: 0,
                scale: 0.6,
                duration: 1500,
                onComplete: () => {
                    if (this.healthBar) {
                        this.healthBar.destroy();
                    }
                    this.destroy();
                    if (currentScene && currentScene.onPlayerDefeated) {
                        currentScene.onPlayerDefeated();
                    }
                }
            });
        }
    }

    destroy(fromScene) {
        if (this.radarGraphics) this.radarGraphics.destroy();
        if (this.healthBar) this.healthBar.destroy();
        super.destroy(fromScene);
    }
}
