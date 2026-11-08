/**
 * EnemyShip.js - Thực thể Chiến hạm Đối phương (Modular Damage & AI Nâng cao)
 */

import { HealthBar } from '../ui/HealthBar.js';
import { Projectile } from './Projectile.js';
import { Missile } from './Missile.js';
import { EnemyAircraft } from './EnemyAircraft.js';
import { WeaponConfig } from '../config/WeaponConfig.js';
import { SoundManager } from '../managers/SoundManager.js';

export class EnemyShip extends Phaser.GameObjects.Container {
    constructor(scene, x, y, configKey, configData) {
        super(scene, x, y);

        this.scene = scene;
        this.config = configData;
        this.configKey = configKey;

        this.maxHp = configData.maxHp;
        this.hp = this.maxHp;
        this.baseSpeed = configData.speed || 100;
        this.speed = this.baseSpeed;
        this.turnSpeed = configData.turnSpeed || 55;
        this.armor = configData.armor || 8;
        this.attackRange = configData.attackRange || 550;
        this.preferredDistance = configData.preferredDistance || 380;
        this.fireCooldown = configData.fireCooldown || 2200;
        this.scoreValue = configData.scoreValue || 200;

        this.lastFireTime = scene.time.now + Math.random() * 800;

        // Hệ thống Waypoints & State Machine Chiến thuật (PATROL, ENGAGE, RESUME_PATH)
        this.waypoints = [];
        this.currentWaypointIndex = 0;
        this.aiState = 'PATROL'; // 'PATROL', 'ENGAGE', 'RESUME_PATH'
        this.blockingTarget = null;

        // TỰ ĐỘNG SỬA CHỮA (AUTO-REPAIR CHO TÀU ĐỊCH)
        this.lastDamageTakenTime = 0;
        this.repairEffectTimer = 0;

        // Cơ chế Hư hỏng bộ phận (Modular damage)
        this.modules = {
            engine: { hp: Math.round(this.maxHp * 0.35), damaged: false },
            turrets: { hp: Math.round(this.maxHp * 0.35), damaged: false }
        };

        // Vũ khí
        this.weaponConfig = WeaponConfig[configData.weapon] || WeaponConfig.enemy_light_cannon;
        this.missileSlots = configData.missileSlots || 0;
        this.missileConfig = WeaponConfig[configData.missileWeapon] || WeaponConfig.tomahawk_enemy;
        this.missileCooldown = configData.missileCooldown || 10000;
        this.lastMissileTime = scene.time.now + 3000 + Math.random() * 2000;

        // Hệ thống Tên lửa Phòng không (Air Defense Missiles: chỉ bắn máy bay & tên lửa)
        this.antiAirMissileSlots = configData.antiAirMissileSlots || 0;
        this.antiAirMissileWeapon = configData.antiAirMissileWeapon || 'enemy_anti_air_missile';
        this.antiAirMissileConfig = WeaponConfig[this.antiAirMissileWeapon] || WeaponConfig.enemy_anti_air_missile;
        this.antiAirCooldown = configData.antiAirCooldown || 5000;
        this.lastAntiAirTime = scene.time.now + 2000 + Math.random() * 2000;

        // Trạng thái bị áp chế tác chiến điện tử (EW Jammed)
        this.isJammed = false;

        // 1. Thân tàu
        let hullTexture = 'enemy_cruiser_hull';
        let bodyW = 46;
        let bodyH = 100;

        if (configKey === 'heavy_battleship') {
            hullTexture = 'enemy_battleship_hull';
            bodyW = 58;
            bodyH = 126;
        } else if (configKey === 'missile_destroyer') {
            hullTexture = 'enemy_missile_destroyer_hull';
            bodyW = 42;
            bodyH = 92;
        } else if (configKey === 'advanced_cruiser') {
            hullTexture = 'enemy_advanced_cruiser_hull';
            bodyW = 54;
            bodyH = 118;
        } else if (configKey === 'dreadnought_boss') {
            hullTexture = 'enemy_boss_hull';
            bodyW = 84;
            bodyH = 185;
        } else if (configKey === 'enemy_carrier') {
            hullTexture = 'enemy_carrier_hull';
            bodyW = 68;
            bodyH = 155;
            this.airStrikeTimer = 6500;
        } else if (configKey === 'super_boss_titan') {
            hullTexture = 'enemy_super_boss_hull';
            bodyW = 140;
            bodyH = 220;
            this.airStrikeTimer = 8500;
        }

        this.hull = scene.add.sprite(0, 0, hullTexture);
        this.hull.setOrigin(0.5, 0.5);
        this.add(this.hull);

        // 2. Tháp pháo
        this.turret = scene.add.sprite(0, -6, 'enemy_turret');
        this.turret.setOrigin(0.5, 0.65);
        this.add(this.turret);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(bodyW, bodyH);
        this.body.setOffset(-bodyW / 2, -bodyH / 2);
        this.setDepth(9);

        const hpBarW = (configKey === 'super_boss_titan' ? 150 : (configKey === 'dreadnought_boss' ? 110 : (configKey === 'enemy_carrier' ? 90 : 64)));
        this.healthBar = new HealthBar(scene, this, hpBarW, 7, -bodyH / 2 - 14);
        this.wakeTimer = 0;
        this.smokeTimer = 0;
    }

    update(time, delta) {
        if (!this.active || this.hp <= 0) return;

        // Điều chỉnh tốc độ theo thời tiết và bộ phận hỏng
        let speedMod = (this.modules.engine.damaged ? 0.5 : 1.0);
        if (this.scene.currentWeather) speedMod *= (this.scene.currentWeather.speedMod || 1.0);
        this.speed = this.baseSpeed * speedMod;

        const deltaSec = delta / 1000;

        // 1. TÌM MỤC TIÊU MẶT NƯỚC (SURFACE TARGET ONLY: TÀU MẸ HOẶC TÀU CON ĐỒNG MINH)
        const surfaceTarget = this.findSurfaceTarget();

        // 2. XOAY THÁP PHÁO VÀ TIẾN CÔNG MỤC TIÊU MẶT NƯỚC
        if (surfaceTarget) {
            const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, surfaceTarget.x, surfaceTarget.y);
            const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, surfaceTarget.x, surfaceTarget.y);

            const globalShipAngleRad = Phaser.Math.DegToRad(this.angle);
            this.turret.rotation = angleToTarget - globalShipAngleRad + Math.PI / 2;

            // BẮN PHÁO CHÍNH (SHIP TARGET ONLY)
            const turretRateMod = this.modules.turrets.damaged ? 2.5 : 1.0;
            if (distToTarget <= this.attackRange && time - this.lastFireTime >= (this.fireCooldown * turretRateMod)) {
                this.fireAtTarget(surfaceTarget);
                this.lastFireTime = time;
            }

            // BẮN TÊN LỬA DIỆT HẠM TOMAHAWK (SHIP TARGET ONLY)
            if (!this.isJammed && this.missileSlots > 0 && distToTarget <= (this.missileConfig.range || 950)) {
                if (time - this.lastMissileTime >= this.missileCooldown) {
                    this.launchEnemyMissile(surfaceTarget);
                    this.lastMissileTime = time;
                }
            }

            // KHÔNG KÍCH TỪ TÀU SÂN BAY HOẶC BOSS TITAN
            if ((this.configKey === 'enemy_carrier' || this.configKey === 'super_boss_titan')) {
                this.airStrikeTimer -= delta;
                if (this.airStrikeTimer <= 0) {
                    this.airStrikeTimer = (this.configKey === 'super_boss_titan') ? 11000 : 14000;
                    this.launchEnemyAirStrike(surfaceTarget);
                }
            }
        }

        // 3. ĐIỀU HƯỚNG TÀU THEO STATE MACHINE (PATROL / ENGAGE / RESUME_PATH)
        if (this.scene.isCampaignMode && this.waypoints && this.waypoints.length > 0) {
            this.updateCampaignStateMachine(deltaSec, surfaceTarget);
        } else if (surfaceTarget) {
            this.navigateCombat(surfaceTarget, deltaSec);
        } else {
            this.body.setVelocity(0, 0);
        }

        // 4. HỆ THỐNG PHÒNG KHÔNG ĐÁNH CHẶN TỰ ĐỘNG (AIR TARGET ONLY: TÊN LỬA VÀ MÁY BAY TA)
        this.updateAutoAntiAirMissile(time);

        // Khói nếu động cơ hỏng
        if (this.modules.engine.damaged) {
            this.smokeTimer += delta;
            if (this.smokeTimer > 120) {
                this.smokeTimer = 0;
                this.createDamageSmoke();
            }
        }

        // TỰ SỬA CHỮA CHO TÀU ĐỊCH (KỂ CẢ TRÙM KRAKEN)
        this.updateAutoRepair(time, deltaSec);

        this.healthBar.update();
    }

    /**
     * TỰ ĐỘNG PHÓNG TÊN LỬA PHÒNG KHÔNG ĐÁNH CHẶN MÁY BAY VÀ TÊN LỬA PHE TA
     */
    updateAutoAntiAirMissile(time) {
        if (!this.active || this.hp <= 0 || this.isJammed) return;
        if (this.antiAirMissileSlots <= 0) return;
        if (time - this.lastAntiAirTime < this.antiAirCooldown) return;

        const maxRange = this.antiAirMissileConfig.weaponRange || 550;
        const airTarget = this.findAirTarget(maxRange);
        if (!airTarget) return;

        this.lastAntiAirTime = time;
        this.launchEnemyAntiAirMissiles(airTarget);
    }

    launchEnemyAntiAirMissiles(airTarget) {
        if (!this.active || this.hp <= 0 || !airTarget || !airTarget.active) return;

        const launchRad = Phaser.Math.DegToRad(this.angle - 90);
        const slots = this.antiAirMissileSlots;

        for (let i = 0; i < slots; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                if (!this.active || this.hp <= 0 || !airTarget || !airTarget.active) return;

                const perp = launchRad + Math.PI / 2;
                const offset = (i % 2 === 0 ? -1 : 1) * 10;
                const spawnX = this.x + Math.cos(launchRad) * 20 + Math.cos(perp) * offset;
                const spawnY = this.y + Math.sin(launchRad) * 20 + Math.sin(perp) * offset;

                const missile = new Missile(
                    this.scene,
                    spawnX,
                    spawnY,
                    this.antiAirMissileConfig.textureKey || 'missile_rim162',
                    this.antiAirMissileConfig,
                    airTarget,
                    launchRad,
                    'enemy'
                );
                this.scene.enemyProjectiles.add(missile);
            });
        }
    }

    /**
     * TÌM MỤC TIÊU PHÒNG KHÔNG (AIR TARGET ONLY): Tên lửa đang bay tới và Máy bay tiêm kích ta
     */
    findAirTarget(range) {
        let closestDist = range || 550;
        let bestAirTarget = null;

        // 1. Ưu tiên cao nhất: Đánh chặn tên lửa Tomahawk/CPS đang bay tới
        const pMissiles = (this.scene.playerProjectiles ? this.scene.playerProjectiles.getChildren() : []).filter(p => p && p.active && p.maxHp);
        for (let i = 0; i < pMissiles.length; i++) {
            const m = pMissiles[i];
            const d = Phaser.Math.Distance.Between(this.x, this.y, m.x, m.y);
            if (d < closestDist) {
                closestDist = d;
                bestAirTarget = m;
            }
        }
        if (bestAirTarget) return bestAirTarget;

        // 2. Bắn hạ máy bay tiêm kích đang xuất kích bay trên không
        const jets = this.scene.aircraftSquadron || [];
        for (let i = 0; i < jets.length; i++) {
            const jet = jets[i];
            if (!jet || !jet.active || jet.hp <= 0 || jet.state === 'PARKED') continue;
            const d = Phaser.Math.Distance.Between(this.x, this.y, jet.x, jet.y);
            if (d < closestDist) {
                closestDist = d;
                bestAirTarget = jet;
            }
        }

        return bestAirTarget;
    }

    /**
     * TÌM MỤC TIÊU MẶT NƯỚC (SURFACE TARGET ONLY): Tàu Mẹ Citadel hoặc Tàu con đồng minh
     */
    findSurfaceTarget() {
        let closestDist = Infinity;
        let bestTarget = null;

        // 1. Tàu Mẹ Citadel
        const player = this.scene.playerShip;
        if (player && player.active && player.hp > 0) {
            closestDist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            bestTarget = player;
        }

        // 2. Tàu con đồng minh
        const allies = this.scene.allyFleet || [];
        for (let i = 0; i < allies.length; i++) {
            const ally = allies[i];
            if (!ally || !ally.active || ally.hp <= 0) continue;
            const dist = Phaser.Math.Distance.Between(this.x, this.y, ally.x, ally.y);
            if (dist < closestDist) {
                closestDist = dist;
                bestTarget = ally;
            }
        }

        return bestTarget;
    }

    findClosestTarget() {
        return this.findSurfaceTarget();
    }

    /**
     * STATE MACHINE AI KẺ ĐỊCH:
     * 1. PATROL / MOVE_TO_WAYPOINT: Di chuyển theo các Checkpoint trên bản đồ. Khi cách dưới Threshold -> waypointIndex++
     * 2. ENGAGE / BLOCK_CHECK: Phát hiện tàu đồng minh cản đường -> Tiếp chiến tiêu diệt
     * 3. RESUME_PATH: Sau khi tiêu diệt xong chốt chặn -> Tiếp tục lộ trình tiến về Soái Hạm Citadel
     */
    updateCampaignStateMachine(deltaSec, defaultTarget) {
        // 1. Kiểm tra trạng thái ENGAGE
        if (this.aiState === 'ENGAGE') {
            if (!this.blockingTarget || !this.blockingTarget.active || this.blockingTarget.hp <= 0) {
                // Tàu cản đường đã bị tiêu diệt hoàn toàn -> Chuyển sang RESUME_PATH
                this.aiState = 'RESUME_PATH';
            } else {
                // Tạm dừng bước tiến lộ trình, nghênh chiến với tàu chặn đường
                this.navigateCombat(this.blockingTarget, deltaSec);
                return;
            }
        }

        // 2. Trạng thái RESUME_PATH: Tái lập lộ trình
        if (this.aiState === 'RESUME_PATH') {
            this.blockingTarget = null;
            // Kiểm tra xem có tàu chặn đường mới trong tầm quét không
            const newBlock = this.findBlockingAlly();
            if (newBlock) {
                this.blockingTarget = newBlock;
                this.aiState = 'ENGAGE';
                this.navigateCombat(this.blockingTarget, deltaSec);
                return;
            } else {
                // Tiếp tục hành quân theo lộ trình
                this.aiState = 'PATROL';
            }
        }

        // 3. Trạng thái PATROL: Di chuyển theo danh sách Checkpoints
        if (this.aiState === 'PATROL') {
            // Quét liên tục kiểm tra xem có tàu con cản đường chắn ngang lộ trình không
            const blockingAlly = this.findBlockingAlly();
            if (blockingAlly) {
                this.blockingTarget = blockingAlly;
                this.aiState = 'ENGAGE';
                this.navigateCombat(this.blockingTarget, deltaSec);
                return;
            }

            // Tiếp tục di chuyển theo waypoint
            this.followWaypoints(deltaSec);
        }
    }

    findBlockingAlly() {
        if (!this.scene.allyFleet || this.scene.allyFleet.length === 0) return null;
        let closest = null;
        let minDist = this.attackRange + 40;
        this.scene.allyFleet.forEach(ally => {
            if (!ally || !ally.active || ally.hp <= 0) return;
            const d = Phaser.Math.Distance.Between(this.x, this.y, ally.x, ally.y);
            if (d < minDist) {
                minDist = d;
                closest = ally;
            }
        });
        return closest;
    }

    followWaypoints(deltaSec) {
        if (!this.waypoints || this.waypoints.length === 0) return;
        const currentWp = this.waypoints[this.currentWaypointIndex];
        if (!currentWp) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, currentWp.x, currentWp.y);

        // Ngưỡng phát hiện chạm waypoint nới rộng phù hợp kích cỡ thân tàu (tránh quay vòng tròn)
        const isBoss = (this.configKey === 'dreadnought_boss' || this.configKey === 'super_boss_titan');
        const WAYPOINT_THRESHOLD = isBoss ? 65 : 48;
        if (dist <= WAYPOINT_THRESHOLD) {
            if (this.currentWaypointIndex < this.waypoints.length - 1) {
                this.currentWaypointIndex++;
            } else {
                // Đã đi hết danh sách Waypoint -> Hướng thẳng đến Tàu Mẹ Citadel
                if (this.scene.playerShip && this.scene.playerShip.active) {
                    this.navigateCombat(this.scene.playerShip, deltaSec);
                }
                return;
            }
        }

        const angleToWp = Phaser.Math.Angle.Between(this.x, this.y, currentWp.x, currentWp.y);
        const targetDeg = Phaser.Math.RadToDeg(angleToWp) + 90;
        const diffAngle = Phaser.Math.Angle.WrapDegrees(targetDeg - this.angle);

        if (Math.abs(diffAngle) > 2) {
            const steerDir = diffAngle > 0 ? 1 : -1;
            const turnStep = Math.min(Math.abs(diffAngle), this.turnSpeed * deltaSec);
            this.angle += steerDir * turnStep;
        }

        const moveRad = Phaser.Math.DegToRad(this.angle - 90);
        this.body.setVelocity(Math.cos(moveRad) * this.speed, Math.sin(moveRad) * this.speed);

        this.wakeTimer += deltaSec * 1000;
        if (this.wakeTimer > 100) {
            this.wakeTimer = 0;
            this.createWakeEffect();
        }
    }

    navigateCombat(target, deltaSec) {
        if (!target) return;
        const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);

        const targetDeg = Phaser.Math.RadToDeg(angleToTarget) + 90;
        const diffAngle = Phaser.Math.Angle.WrapDegrees(targetDeg - this.angle);

        if (Math.abs(diffAngle) > 2) {
            const steerDir = diffAngle > 0 ? 1 : -1;
            const turnStep = Math.min(Math.abs(diffAngle), this.turnSpeed * deltaSec);
            this.angle += steerDir * turnStep;
        }

        // Duy trì vận tốc cơ động chiến đấu thay vì đứng yên hoàn toàn
        let moveSpeed = 0;
        if (distToTarget > this.attackRange) {
            moveSpeed = this.speed * 0.85; // Tiến nhanh vào tầm bắn
        } else if (distToTarget > (this.preferredDistance || 380)) {
            moveSpeed = this.speed * 0.55; // Tiến đều gây áp lực
        } else {
            moveSpeed = this.speed * 0.25; // Cơ động nhẹ duy trì đội hình, không khựng cứng
        }

        const moveRad = Phaser.Math.DegToRad(this.angle - 90);
        this.body.setVelocity(Math.cos(moveRad) * moveSpeed, Math.sin(moveRad) * moveSpeed);

        if (Math.abs(moveSpeed) > 10) {
            this.wakeTimer += deltaSec * 1000;
            if (this.wakeTimer > 100) {
                this.wakeTimer = 0;
                this.createWakeEffect();
            }
        }
    }

    updateAutoRepair(time, deltaSec) {
        if (this.hp <= 0 || this.hp >= this.maxHp) return;

        if (time - this.lastDamageTakenTime >= 10000) {
            this.hp = Math.min(this.maxHp, this.hp + (this.maxHp * 0.005) * deltaSec);
            this.healthBar.setHp(this.hp);

            this.repairEffectTimer += deltaSec * 1000;
            if (this.repairEffectTimer > 350) {
                this.repairEffectTimer = 0;
                const spark = this.scene.add.circle(this.x + (Math.random() * 20 - 10), this.y + (Math.random() * 20 - 10), 2.5, 0xff7675, 0.8);
                spark.setDepth(12);
                this.scene.tweens.add({ targets: spark, scale: 1.8, alpha: 0, duration: 200, onComplete: () => spark.destroy() });
            }
        }
    }

    fireAtTarget(target) {
        if (!this.active || this.hp <= 0 || !target || !target.active) return;

        // Vận tốc của mục tiêu (Tàu mẹ hoặc tàu con đồng minh)
        const targetVx = (target.body && target.body.velocity) ? target.body.velocity.x : 0;
        const targetVy = (target.body && target.body.velocity) ? target.body.velocity.y : 0;

        const bulletSpeed = (this.weaponConfig && this.weaponConfig.bulletSpeed) ? this.weaponConfig.bulletSpeed : 460;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        const timeOfFlight = dist / bulletSpeed;

        // Mức độ chuẩn xác theo từng màn chơi (Stage 1-3: đón đầu 65%, Stage 4-7: 85%, Stage 8-10 & Boss: 95-100%)
        const stageId = (this.scene.stageData && this.scene.stageData.id) ? this.scene.stageData.id : 1;
        const isBoss = (this.configKey === 'dreadnought_boss' || this.configKey === 'super_boss_titan');
        let leadFactor = Math.min(1.0, 0.60 + stageId * 0.04);
        if (isBoss) leadFactor = 1.0;

        const predX = target.x + targetVx * timeOfFlight * leadFactor;
        const predY = target.y + targetVy * timeOfFlight * leadFactor;

        const leadAngle = Phaser.Math.Angle.Between(this.x, this.y, predX, predY);

        // Giảm độ ngẫu nhiên quá mức: góc tản thu hẹp từ ±1.5° (màn cao/boss) đến ±2.5° (màn đầu)
        // Nếu bị tác chiến điện tử (EW Jammed) thì tản rộng hơn
        let maxSpreadDeg = isBoss ? 1.2 : Math.max(1.5, 3.2 - stageId * 0.18);
        if (this.isJammed) maxSpreadDeg = 8.0;

        const spreadRad = Phaser.Math.DegToRad((Math.random() - 0.5) * (maxSpreadDeg * 2));
        const fireAngle = leadAngle + spreadRad;

        const spawnX = this.x + Math.cos(fireAngle) * 34;
        const spawnY = this.y + Math.sin(fireAngle) * 34;

        const projectile = new Projectile(
            this.scene,
            spawnX,
            spawnY,
            'bullet_enemy',
            this.weaponConfig,
            fireAngle,
            'enemy'
        );
        this.scene.enemyProjectiles.add(projectile);

        // Nếu là Boss KRAKEN hoặc KRAKEN TITAN nã pháo -> Rung màn hình uy lực!
        if (this.configKey === 'dreadnought_boss' || this.configKey === 'super_boss_titan') {
            this.scene.cameras.main.shake(180, this.configKey === 'super_boss_titan' ? 0.008 : 0.005);
            SoundManager.playCannonFire();
        }

        const flash = this.scene.add.circle(spawnX, spawnY, 6, 0xff7675, 0.85);
        flash.setDepth(16);
        this.scene.tweens.add({
            targets: flash,
            scale: 1.6,
            alpha: 0,
            duration: 80,
            onComplete: () => flash.destroy()
        });
    }

    launchEnemyMissile(target) {
        if (!this.active || this.hp <= 0) return;

        const launchRad = Phaser.Math.DegToRad(this.angle - 90);
        const slots = this.missileSlots;

        // Nếu Boss bắn -> thông báo cảnh báo nguy hiểm
        if (this.configKey === 'super_boss_titan') {
            if (this.scene.showFloatingMessage) {
                this.scene.showFloatingMessage(this.x, this.y - 85, '⚠ KRAKEN TITAN XẢ 10 TÊN LỬA HẠT NHÂN!', 0xff0033);
            }
        } else if (this.configKey === 'dreadnought_boss') {
            if (this.scene.showFloatingMessage) {
                this.scene.showFloatingMessage(this.x, this.y - 70, '⚠ KRAKEN KHAI HỎA TÊN LỬA HỦY DIỆT!', 0xff0055);
            }
        }

        for (let i = 0; i < slots; i++) {
            this.scene.time.delayedCall(i * 400, () => {
                if (!this.active || this.hp <= 0 || !target || !target.active || (target.hp !== undefined && target.hp <= 0)) return;

                const perp = launchRad + Math.PI / 2;
                const offset = (i % 2 === 0 ? -1 : 1) * 12;
                const spawnX = this.x + Math.cos(launchRad) * 25 + Math.cos(perp) * offset;
                const spawnY = this.y + Math.sin(launchRad) * 25 + Math.sin(perp) * offset;

                const missile = new Missile(
                    this.scene,
                    spawnX,
                    spawnY,
                    'missile_enemy',
                    this.missileConfig,
                    target,
                    launchRad,
                    'enemy'
                );
                this.scene.enemyProjectiles.add(missile);
            });
        }
    }

    launchEnemyAirStrike(target) {
        if (!this.active || this.hp <= 0) return;
        if (!target || !target.active) return;

        SoundManager.playJetRoar();
        const callerName = this.configKey === 'super_boss_titan' ? 'SIÊU TRÙM KRAKEN TITAN' : 'TÀU SÂN BAY ĐỊCH';
        if (this.scene && this.scene.showFloatingMessage) {
            this.scene.showFloatingMessage(this.x, this.y - 85, `✈ ${callerName} PHÁT LỆNH KHÔNG KÍCH!`, 0xff3838);
        }

        // Xuất kích 3 máy bay tiêm kích oanh tạc thẳng vào vị trí mục tiêu (Staggered spawn)
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 350, () => {
                if (!this.active || this.hp <= 0 || !target.active) return;
                const offsetSide = (i - 1) * 28;
                const launchRad = Phaser.Math.DegToRad(this.angle - 90);
                const spawnX = this.x + Math.cos(launchRad) * 40 + Math.cos(launchRad + Math.PI / 2) * offsetSide;
                const spawnY = this.y + Math.sin(launchRad) * 40 + Math.sin(launchRad + Math.PI / 2) * offsetSide;

                const enemyJet = new EnemyAircraft(this.scene, spawnX, spawnY, target);
                if (this.scene.enemyAircraft) {
                    this.scene.enemyAircraft.push(enemyJet);
                }
            });
        }
    }

    createWakeEffect() {
        const sternAngleRad = Phaser.Math.DegToRad(this.angle + 90);
        const wakeX = this.x + Math.cos(sternAngleRad) * 44;
        const wakeY = this.y + Math.sin(sternAngleRad) * 44;

        const bubble = this.scene.add.circle(wakeX, wakeY, 5, 0x95c8ec, 0.55);
        bubble.setDepth(5);
        this.scene.tweens.add({
            targets: bubble,
            alpha: 0,
            scale: 2.2,
            duration: 550,
            onComplete: () => bubble.destroy()
        });
    }

    createDamageSmoke() {
        const sternAngleRad = Phaser.Math.DegToRad(this.angle + 90);
        const smokeX = this.x + Math.cos(sternAngleRad) * 38;
        const smokeY = this.y + Math.sin(sternAngleRad) * 38;

        const smoke = this.scene.add.circle(smokeX, smokeY, 4.5, 0x2d3436, 0.7);
        smoke.setDepth(11);
        this.scene.tweens.add({
            targets: smoke,
            alpha: 0,
            scale: 2,
            duration: 450,
            onComplete: () => smoke.destroy()
        });
    }

    takeDamage(damageAmount) {
        if (!this.active || this.hp <= 0) return;

        if (this.scene && this.scene.time) {
            this.lastDamageTakenTime = this.scene.time.now;
        }

        const actualDamage = Math.max(5, Math.round(damageAmount * (1 - this.armor / 100)));
        this.hp -= actualDamage;
        this.healthBar.setHp(this.hp);

        // Hư hỏng bộ phận ngẫu nhiên
        if (Math.random() < 0.35 && !this.modules.engine.damaged) {
            this.modules.engine.hp -= actualDamage;
            if (this.modules.engine.hp <= 0) {
                this.modules.engine.damaged = true;
                if (this.scene.showFloatingMessage) {
                    this.scene.showFloatingMessage(this.x, this.y - 30, 'ĐỊCH HỎNG ĐỘNG CƠ!', 0xf1c40f);
                }
            }
        }

        this.scene.tweens.add({
            targets: [this.hull, this.turret],
            tint: 0xffffff,
            duration: 60,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                if (this.hull) this.hull.clearTint();
                if (this.turret) this.turret.clearTint();
            }
        });

        if (this.scene.showFloatingDamage) {
            this.scene.showFloatingDamage(this.x, this.y - 20, `-${actualDamage}`, 0x2ecc71);
        }

        if (this.hp <= 0) {
            this.explodeAndSink();
        }
    }

    explodeAndSink() {
        this.body.setVelocity(0, 0);
        const currentScene = this.scene;

        if (currentScene && currentScene.createExplosion) {
            const expType = this.configKey === 'dreadnought_boss' ? 'huge' : 'big';
            currentScene.createExplosion(this.x, this.y, expType);
        }

        if (currentScene && currentScene.onEnemyDestroyed) {
            currentScene.onEnemyDestroyed(this);
        } else if (currentScene && currentScene.addScore) {
            currentScene.addScore(this.scoreValue);
        }

        if (currentScene) {
            currentScene.tweens.add({
                targets: this,
                alpha: 0,
                scale: 0.5,
                duration: 900,
                onComplete: () => {
                    if (this.healthBar) {
                        this.healthBar.destroy();
                    }
                    this.destroy();

                    if (currentScene && currentScene.checkVictoryCondition) {
                        currentScene.checkVictoryCondition();
                    }
                }
            });
        }
    }

    destroy(fromScene) {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        super.destroy(fromScene);
    }
}
