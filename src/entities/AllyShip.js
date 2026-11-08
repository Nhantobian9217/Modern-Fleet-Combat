/**
 * AllyShip.js - Tàu chiến Hộ tống Đồng minh (Modular Damage & Đánh chặn)
 */

import { HealthBar } from '../ui/HealthBar.js';
import { Projectile } from './Projectile.js';
import { Missile } from './Missile.js';
import { FighterJet } from './FighterJet.js';
import { WeaponConfig } from '../config/WeaponConfig.js';
import { UnitData } from '../config/UnitData.js';
import { SaveManager } from '../managers/SaveManager.js';

export class AllyShip extends Phaser.GameObjects.Container {
    constructor(scene, carrier, configKey, configData, formationOffset) {
        // Tàu con xuất hiện từ bên tay trái màn hình rồi mới di chuyển vào vị trí chỉ định
        const targetX = (formationOffset && formationOffset.x !== undefined) ? formationOffset.x : (carrier.x + 220);
        const targetY = (formationOffset && formationOffset.y !== undefined) ? formationOffset.y : carrier.y;

        const camLeft = (scene.cameras && scene.cameras.main) ? scene.cameras.main.worldView.left : 0;
        const spawnX = Math.min(-120, camLeft - 80);
        const spawnY = targetY;

        super(scene, spawnX, spawnY);

        this.scene = scene;
        this.carrier = carrier;
        this.config = configData;
        this.configKey = configKey;
        this.formationOffset = { x: targetX, y: targetY };
        this.aiState = 'MOVING'; // Tự động di chuyển từ mép trái màn hình vào đội hình

        // Mặc định tàu con hướng sang phía Đông (90 độ) nhìn thẳng về phía đối phương
        this.setAngle(90);

        this.dmgMult = SaveManager.getMultiplier('damage');

        this.maxHp = configData.maxHp;
        this.hp = this.maxHp;
        this.baseSpeed = configData.speed || 130;
        this.speed = this.baseSpeed;
        this.turnSpeed = configData.turnSpeed || 80;
        this.armor = configData.armor || 15;

        // TÁCH BẠCH HOÀN TOÀN TẦM QUÉT RADAR VÀ TẦM BẮN PHÁO 20MM CIWS
        this.isCIWS = (configKey === 'carrier' || (this.weaponConfig && this.weaponConfig.targetType === 'air_only'));
        this.radarRange = configData.radarRange || (this.isCIWS ? 400 : (this.radarRadius || 750));
        this.weaponRange = configData.weaponRange || (this.isCIWS ? 120 : (configData.attackRange || 520));
        this.attackRange = this.isCIWS ? this.weaponRange : (configData.attackRange || 520);
        this.fireCooldown = configData.fireCooldown || (this.isCIWS ? 80 : 1200);
        this.lastFireTime = scene.time.now + Math.random() * 500;

        // Cơ chế Hư hỏng bộ phận (Modular damage)
        this.modules = {
            engine: { hp: 150, damaged: false },
            turrets: { hp: 150, damaged: false }
        };

        // HỆ THỐNG TỰ SỬA CHỮA (AUTO-REPAIR)
        this.lastDamageTakenTime = 0;
        this.repairEffectTimer = 0;

        // Vũ khí & Tên lửa
        this.weaponConfig = WeaponConfig[configData.weapon] || WeaponConfig.ags155;
        this.missileSlots = configData.missileSlots !== undefined ? configData.missileSlots : 1;
        const defaultMissile = (configData.antiShipMissiles && configData.antiShipMissiles[0]) || configData.missileWeapon || 'tomahawk_block_4';
        this.missileConfig = WeaponConfig[defaultMissile] || WeaponConfig.tomahawk_block_4;
        this.missileCooldown = configData.missileCooldown || 8500;
        this.lastMissileTime = scene.time.now + 2000;
        
        // HỆ THỐNG CÁC BỆ PHÓNG TÊN LỬA PHÒNG KHÔNG ĐA TẦNG (RIM-116, RIM-162, SM-3, SM-6)
        const rawAAList = configData.antiAirMissiles || (UnitData.allies[configKey] && UnitData.allies[configKey].antiAirMissiles) || [];
        this.antiAirMissiles = [...rawAAList];
        this.initAntiAirBatteries();
        this.hangarRechargeTimer = 0;

        // 1. Thân tàu
        let hullTexture = 'ally_destroyer_hull';
        if (configKey === 'cruiser') hullTexture = 'ally_cruiser_hull';
        else if (configKey === 'frigate') hullTexture = 'ally_frigate_hull';
        else if (configKey === 'battleship') hullTexture = 'ally_battleship_hull';
        else if (configKey === 'carrier') hullTexture = 'carrier_hull';

        this.hull = scene.add.sprite(0, 0, hullTexture);
        this.hull.setOrigin(0.5, 0.5);
        this.add(this.hull);

        // 2. Tháp pháo tùy chỉnh (CHỈ RENDER KHI CÓ CUSTOM IMAGE TURRET THEO FILE INI)
        this.turrets = [];
        this.turretIdleDirs = [];

        if (configKey === 'carrier') {
            // Tàu sân bay Ford CVN-78: image_turret: NONE -> Tàng hình 100%
            this.turret = null;
        } else if (configKey === 'frigate') {
            // Constellation (FFG-62): ffg_Cannon.png tại (0, -14) theo ffg.ini
            const t = scene.add.sprite(0, -14, 'turret_frigate');
            t.setOrigin(0.5, 0.65);
            this.add(t);
            this.turrets.push(t);
            this.turretIdleDirs.push(0);
            this.turret = t;
        } else if (configKey === 'destroyer') {
            // Arleigh Burke: Arleigh_Cannon.png tại (0, -30) theo Arleigh.ini
            const t = scene.add.sprite(0, -30, 'turret_destroyer');
            t.setOrigin(0.5, 0.65);
            this.add(t);
            this.turrets.push(t);
            this.turretIdleDirs.push(0);
            this.turret = t;
        } else if (configKey === 'cruiser') {
            // Ticonderoga: Cannon1.png tại (0, -45) mũi, Cannon2.png tại (1, 50) đuôi theo Tico.ini
            const t1 = scene.add.sprite(0, -45, 'turret_cruiser_1');
            t1.setOrigin(0.5, 0.65);
            const t2 = scene.add.sprite(1, 50, 'turret_cruiser_2');
            t2.setOrigin(0.5, 0.65);
            t2.rotation = Math.PI; // idleDir: 180 quay về phía đuôi
            this.add([t1, t2]);
            this.turrets.push(t1, t2);
            this.turretIdleDirs.push(0, Math.PI);
            this.turret = t1;
        } else if (configKey === 'battleship') {
            // Missouri: Cannon1.png tại (1, -30), Cannon2.png tại (1, -13), Cannon3.png tại (-1, 40) theo Missouri.ini
            const t1 = scene.add.sprite(1, -30, 'turret_battleship_1');
            t1.setOrigin(0.5, 0.65);
            const t2 = scene.add.sprite(1, -13, 'turret_battleship_2');
            t2.setOrigin(0.5, 0.65);
            const t3 = scene.add.sprite(-1, 40, 'turret_battleship_3');
            t3.setOrigin(0.5, 0.65);
            t3.rotation = Math.PI; // idleDir: 180 quay về phía đuôi
            this.add([t1, t2, t3]);
            this.turrets.push(t1, t2, t3);
            this.turretIdleDirs.push(0, 0, Math.PI);
            this.turret = t1;
        }

        // Tác chiến RTS: Vị trí hành quân tự do (Target Waypoint) & Chọn quân
        this.customMoveTarget = { x: targetX, y: targetY };
        this.isSelected = false;
        this.hasReachedFormation = false; // Đã đến vị trí đội hình chưa

        // Radar riêng của tàu con (đảm bảo cả radarRadius và allyRadarRadius)
        this.radarRadius = configData.radarRadius || (configData.attackRange ? configData.attackRange + 120 : 750);
        this.allyRadarRadius = this.radarRadius;
        this.radarGraphics = scene.add.graphics();
        this.radarGraphics.setDepth(4);
        this.radarGraphics.setVisible(false);

        // Vòng tròn hiển thị chọn quân (Tactical Selection Ring)
        this.selectRing = scene.add.graphics();
        this.selectRing.lineStyle(2, 0x00f2fe, 0.9);
        this.selectRing.strokeCircle(0, 0, (configKey === 'carrier' || configKey === 'battleship') ? 56 : 38);
        this.selectRing.setVisible(false);
        this.add(this.selectRing);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const bodyW = (configKey === 'carrier' || configKey === 'battleship') ? 58 : 44;
        const bodyH = (configKey === 'carrier' || configKey === 'battleship') ? 130 : 95;
        this.body.setSize(bodyW, bodyH);
        this.body.setOffset(-bodyW / 2, -bodyH / 2);
        this.setDepth(9);

        // Hỗ trợ tương tác chuột để chọn tàu điều binh
        this.setSize(bodyW + 20, bodyH + 20);
        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                if (this.scene && typeof this.scene.selectAllyShip === 'function') {
                    this.scene.selectAllyShip(this);
                }
            }
        });

        this.healthBar = new HealthBar(scene, this, (configKey === 'carrier' || configKey === 'battleship') ? 70 : 58, 6, -55);
        this.wakeTimer = 0;
        this.smokeTimer = 0;

        // Nếu là Escort Carrier, khởi tạo đủ 9 tiêm kích riêng (3 phi đội x 3 chiếc)
        this.escortJets = [];
        if (configKey === 'carrier') {
            this._spawnEscortJets();
        }
    }

    /**
     * Khởi tạo đủ 9 tiêm kích hạm cho Tàu sân bay hộ tống
     */
    _spawnEscortJets() {
        if (!this.scene) return;
        const jetCfg = (this.scene.ShipConfig && this.scene.ShipConfig.aircraft && this.scene.ShipConfig.aircraft.fighter_f35c) || {
            id: 'fighter_f35c',
            name: 'Tiêm kích F-35C Hộ tống',
            maxHp: 110,
            speed: 280,
            turnSpeed: 180,
            attackRange: 340,
            flightDuration: 30000,
            weapon: 'aircraft_gatling',
            missileWeapon: 'tomahawk_aircraft',
            textureKey: 'fighter_jet'
        };
        this.escortJets = [];
        for (let k = 0; k < 9; k++) {
            const jet = new FighterJet(this.scene, this, jetCfg, k);
            this.escortJets.push(jet);
            if (this.scene.aircraftSquadron) {
                this.scene.aircraftSquadron.push(jet);
            }
        }
    }

    update(time, delta) {
        if (!this.active || this.hp <= 0) return;

        const deltaSec = delta / 1000;
        const carrierAlive = this.carrier && this.carrier.active && this.carrier.hp > 0;
        const radarR = this.carrier ? this.carrier.radarRadius : 650;

        // Điều chỉnh tốc độ theo bộ phận hỏng và thời tiết
        let speedMod = (this.modules.engine.damaged ? 0.5 : 1.0);
        if (this.scene.currentWeather) speedMod *= (this.scene.currentWeather.speedMod || 1.0);
        this.speed = this.baseSpeed * speedMod;

        // --- 1. TÌM KẺ ĐỊCH NẰM TRONG TẦM RADAR TÀU MẸ ---
        const targetEnemy = this.findEnemyInRadar(radarR);

        // --- 2. XOAY PHÁO VÀ KHAI HỎA ---
        if (targetEnemy) {
            const angleToEnemy = Phaser.Math.Angle.Between(this.x, this.y, targetEnemy.x, targetEnemy.y);
            const globalAngleRad = Phaser.Math.DegToRad(this.angle);
            const localTurretRot = angleToEnemy - globalAngleRad + Math.PI / 2;
            if (this.turrets && this.turrets.length > 0) {
                this.turrets.forEach(t => t.rotation = localTurretRot);
            } else if (this.turret) {
                this.turret.rotation = localTurretRot;
            }

            const dist = Phaser.Math.Distance.Between(this.x, this.y, targetEnemy.x, targetEnemy.y);
            const fireRateMod = this.modules.turrets.damaged ? 2.5 : 1.0;

            // TÁCH BẠCH: CIWS 20MM CHỈ KÍCH HOẠT FIRE KHI DIST <= WEAPONRANGE (120px)
            const allowedRange = this.isCIWS ? this.weaponRange : this.attackRange;
            if (dist <= allowedRange && time - this.lastFireTime >= (this.fireCooldown * fireRateMod)) {
                this.fireAtEnemy(targetEnemy);
                this.lastFireTime = time;
            }

            if (!this.isCIWS && this.missileSlots > 0 && dist <= (this.missileConfig.range || 750) && time - this.lastMissileTime >= this.missileCooldown) {
                this.launchTomahawkSalvo(targetEnemy);
                this.lastMissileTime = time;
            }
        } else {
            if (this.turrets && this.turrets.length > 0) {
                this.turrets.forEach((t, idx) => {
                    t.rotation = (this.turretIdleDirs && this.turretIdleDirs[idx] !== undefined) ? this.turretIdleDirs[idx] : 0;
                });
            } else if (this.turret) {
                this.turret.rotation = 0;
            }
        }

        // TỰ ĐỘNG PHÓNG TÊN LỬA PHÒNG KHÔNG (RIM-116 / RIM-162 / SM-3) NẾU CÓ TRANG BỊ
        this.updateAutoAntiAirMissile(time);

        // NẠP LẠI MÁY BAY HANGAR CHO TÀU SÂN BAY HỘ TỐNG (CVN-78) KHI BỊ BẮN HẠ
        if (this.configKey === 'carrier') {
            this.updateHangarRecharge(delta);
        }

        // --- 3. ĐIỀU HƯỚNG TÁC CHIẾN (ƯU TIÊN LỆNH DI CHUYỂN TỰ DO CỦA NGƯỜI CHƠI) ---
        if (this.customMoveTarget) {
            this.moveToCustomTarget(deltaSec, targetEnemy);
        } else if (this.aiState === 'IDLE' || this.aiState === 'COMBAT') {
            // Đã tới vị trí chỉ định: giữ nguyên vị trí, không di chuyển vòng tròn
            this.body.setVelocity(0, 0);
            if (this.body.setAngularVelocity) this.body.setAngularVelocity(0);
        } else if (targetEnemy && carrierAlive) {
            this.interceptEnemy(targetEnemy, deltaSec);
        } else if (carrierAlive) {
            this.followCarrierFormation(deltaSec);
        } else if (targetEnemy) {
            this.huntEnemy(targetEnemy, deltaSec);
        }

        // Cập nhật vị trí vòng Radar riêng nếu đang được người chơi chọn
        if (this.isSelected && this.radarGraphics) {
            this.radarGraphics.clear();
            this.radarGraphics.lineStyle(1.5, 0x00f2fe, 0.45);
            this.radarGraphics.strokeCircle(this.x, this.y, this.allyRadarRadius);
            this.radarGraphics.lineStyle(1, 0x00d2ff, 0.2);
            this.radarGraphics.strokeCircle(this.x, this.y, this.allyRadarRadius * 0.6);
        }

        // Khói nếu động cơ hỏng
        if (this.modules.engine.damaged) {
            this.smokeTimer += delta;
            if (this.smokeTimer > 140) {
                this.smokeTimer = 0;
                this.createDamageSmoke();
            }
        }

        // Tự sửa chữa (Auto-repair sau 10s không dính đạn)
        this.updateAutoRepair(time, deltaSec);

        this.healthBar.update();
    }

    updateAutoRepair(time, deltaSec) {
        if (this.hp <= 0 || this.hp >= this.maxHp) return;

        if (time - this.lastDamageTakenTime >= 10000) {
            this.hp = Math.min(this.maxHp, this.hp + (this.maxHp * 0.05) * deltaSec);
            this.healthBar.setHp(this.hp);

            this.repairEffectTimer += deltaSec * 1000;
            if (this.repairEffectTimer > 300) {
                this.repairEffectTimer = 0;
                const spark = this.scene.add.circle(this.x + (Math.random() * 20 - 10), this.y + (Math.random() * 20 - 10), 2.5, 0x38ef7d, 0.9);
                spark.setDepth(12);
                this.scene.tweens.add({ targets: spark, scale: 1.8, alpha: 0, duration: 200, onComplete: () => spark.destroy() });
            }
        }
    }

    findEnemyInRadar(radarRadius) {
        // NẾU LÀ TÀU SÂN BAY CIWS 20MM (AIR TARGET ONLY): CHỈ BẮN TÊN LỬA VÀ MÁY BAY ĐỊCH TRONG radarRange (400px)
        if (this.isCIWS) {
            const enemyMissiles = (this.scene.enemyProjectiles ? this.scene.enemyProjectiles.getChildren() : []).filter(p => p && p.active && p.maxHp);
            let closestAirTarget = null;
            let closestAirDist = Infinity;
            for (let i = 0; i < enemyMissiles.length; i++) {
                const m = enemyMissiles[i];
                const d = Phaser.Math.Distance.Between(this.x, this.y, m.x, m.y);
                // Dùng radarRange (400px) để phát hiện và xoay nòng theo dõi
                if (d <= this.radarRange && d < closestAirDist) {
                    closestAirDist = d;
                    closestAirTarget = m;
                }
            }
            return closestAirTarget; // KHÔNG BAO GIỜ BẮN TÀU NỔI VÌ LÀ AIR TARGET ONLY
        }

        // CÁC TÀU CHIẾN NỔI: NẾU VŨ KHÍ LÀ SHIP ONLY (antiAir = false) -> BỎ QUA TÊN LỬA ĐỊCH!
        const canAntiAir = this.weaponConfig.antiAir && this.weaponConfig.targetType !== 'ship_only';
        if (canAntiAir) {
            const enemyMissiles = (this.scene.enemyProjectiles ? this.scene.enemyProjectiles.getChildren() : []).filter(p => p && p.active && p.maxHp);
            for (let i = 0; i < enemyMissiles.length; i++) {
                const m = enemyMissiles[i];
                const d = Phaser.Math.Distance.Between(this.x, this.y, m.x, m.y);
                if (d <= this.attackRange) {
                    return m;
                }
            }
        }

        if (!this.scene.enemyFleet || this.scene.enemyFleet.length === 0) return null;

        let closestDist = Infinity;
        let bestTarget = null;
        const myRadar = this.radarRadius || this.allyRadarRadius || 750;
        const safeCarrierRadar = (typeof radarRadius === 'number' && !isNaN(radarRadius)) ? radarRadius : 650;

        this.scene.enemyFleet.forEach(enemy => {
            if (!enemy || !enemy.active || enemy.hp <= 0) return;

            const distToMe = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            const distToCarrier = this.carrier ? Phaser.Math.Distance.Between(this.carrier.x, this.carrier.y, enemy.x, enemy.y) : Infinity;

            // Kẻ địch nằm trong tầm radar riêng của tàu con HOẶC trong tầm radar tàu mẹ
            if (distToMe <= myRadar || distToCarrier <= safeCarrierRadar) {
                if (distToMe < closestDist) {
                    closestDist = distToMe;
                    bestTarget = enemy;
                }
            }
        });

        return bestTarget;
    }

    setSelected(selected) {
        this.isSelected = selected;
        if (this.selectRing) {
            this.selectRing.setVisible(selected);
        }
        if (this.radarGraphics) {
            this.radarGraphics.clear();
            if (selected) {
                this.radarGraphics.setVisible(true);
                this.radarGraphics.lineStyle(1.5, 0x00f2fe, 0.45);
                this.radarGraphics.strokeCircle(this.x, this.y, this.allyRadarRadius);
                this.radarGraphics.lineStyle(1, 0x00d2ff, 0.2);
                this.radarGraphics.strokeCircle(this.x, this.y, this.allyRadarRadius * 0.6);
            } else {
                this.radarGraphics.setVisible(false);
            }
        }
    }

    setMoveTarget(x, y) {
        this.customMoveTarget = { x, y };
        this.aiState = 'MOVING';
    }

    moveToCustomTarget(deltaSec, targetEnemy) {
        if (!this.customMoveTarget) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.customMoveTarget.x, this.customMoveTarget.y);
        const STOP_THRESHOLD = 15;

        // KHẮC PHỤC TRIỆT ĐỂ HIỆN TƯỢNG XOAY VÒNG TRÒN:
        // Khi khoảng cách tới điểm đích <= 15px: ngắt vận tốc ngay lập tức, chuyển sang IDLE hoặc COMBAT
        if (dist <= STOP_THRESHOLD) {
            this.body.setVelocity(0, 0);
            if (this.body.setAngularVelocity) this.body.setAngularVelocity(0);
            this.customMoveTarget = null;
            this.aiState = targetEnemy ? 'COMBAT' : 'IDLE';
            return;
        }

        this.aiState = 'MOVING';
        const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, this.customMoveTarget.x, this.customMoveTarget.y);
        const targetDeg = Phaser.Math.RadToDeg(angleToTarget) + 90;
        const diffAngle = Phaser.Math.Angle.WrapDegrees(targetDeg - this.angle);

        if (Math.abs(diffAngle) > 4) {
            this.angle += (diffAngle > 0 ? 1 : -1) * this.turnSpeed * deltaSec;
        }

        const moveRad = Phaser.Math.DegToRad(this.angle - 90);
        // Giảm tốc mượt mà khi tới gần đích để không bị trượt quá đà
        const curSpeed = Math.min(this.speed, Math.max(30, dist * 2.5));
        this.body.setVelocity(Math.cos(moveRad) * curSpeed, Math.sin(moveRad) * curSpeed);

        this.wakeTimer += deltaSec * 1000;
        if (this.wakeTimer > 100) {
            this.wakeTimer = 0;
            this.createWakeEffect();
        }
    }

    interceptEnemy(enemy, deltaSec) {
        const angleCarrierToEnemy = Phaser.Math.Angle.Between(this.carrier.x, this.carrier.y, enemy.x, enemy.y);
        const interceptDist = Math.min(280, Phaser.Math.Distance.Between(this.carrier.x, this.carrier.y, enemy.x, enemy.y) * 0.55);

        const targetX = this.carrier.x + Math.cos(angleCarrierToEnemy) * interceptDist + this.formationOffset.x * 0.5;
        const targetY = this.carrier.y + Math.sin(angleCarrierToEnemy) * interceptDist + this.formationOffset.y * 0.5;

        const distToPoint = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
        const angleToPoint = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

        const targetDeg = Phaser.Math.RadToDeg(angleToPoint) + 90;
        const diffAngle = Phaser.Math.Angle.WrapDegrees(targetDeg - this.angle);

        if (Math.abs(diffAngle) > 3) {
            this.angle += (diffAngle > 0 ? 1 : -1) * this.turnSpeed * deltaSec;
        }

        const moveSpeed = distToPoint > 30 ? this.speed : this.speed * 0.35;
        const moveRad = Phaser.Math.DegToRad(this.angle - 90);
        this.body.setVelocity(Math.cos(moveRad) * moveSpeed, Math.sin(moveRad) * moveSpeed);

        this.wakeTimer += deltaSec * 1000;
        if (this.wakeTimer > 100) {
            this.wakeTimer = 0;
            this.createWakeEffect();
        }
    }

    followCarrierFormation(deltaSec) {
        const carrierRad = Phaser.Math.DegToRad(this.carrier.angle);
        const offsetX = this.formationOffset.x * Math.cos(carrierRad) - this.formationOffset.y * Math.sin(carrierRad);
        const offsetY = this.formationOffset.x * Math.sin(carrierRad) + this.formationOffset.y * Math.cos(carrierRad);

        const targetX = this.carrier.x + offsetX;
        const targetY = this.carrier.y + offsetY;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
        const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);

        if (dist > 15) {
            const targetDeg = Phaser.Math.RadToDeg(angleToTarget) + 90;
            const diffAngle = Phaser.Math.Angle.WrapDegrees(targetDeg - this.angle);

            if (Math.abs(diffAngle) > 3) {
                this.angle += (diffAngle > 0 ? 1 : -1) * this.turnSpeed * deltaSec;
            }

            const moveSpeed = Math.min(this.speed * 2.2, Math.max(this.speed * 1.2, dist * 2.5));
            const moveRad = Phaser.Math.DegToRad(this.angle - 90);
            this.body.setVelocity(Math.cos(moveRad) * moveSpeed, Math.sin(moveRad) * moveSpeed);

            this.wakeTimer += deltaSec * 1000;
            if (this.wakeTimer > 100) {
                this.wakeTimer = 0;
                this.createWakeEffect();
            }
        } else {
            const diffCarrier = Phaser.Math.Angle.WrapDegrees(this.carrier.angle - this.angle);
            if (Math.abs(diffCarrier) > 2) {
                this.angle += (diffCarrier > 0 ? 1 : -1) * this.turnSpeed * deltaSec * 0.5;
            }
            this.body.setVelocity(this.carrier.body.velocity.x * 0.9, this.carrier.body.velocity.y * 0.9);
        }
    }

    huntEnemy(target, deltaSec) {
        const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const targetDeg = Phaser.Math.RadToDeg(angleToTarget) + 90;
        const diff = Phaser.Math.Angle.WrapDegrees(targetDeg - this.angle);
        if (Math.abs(diff) > 4) {
            this.angle += (diff > 0 ? 1 : -1) * this.turnSpeed * deltaSec;
        }

        const moveRad = Phaser.Math.DegToRad(this.angle - 90);
        this.body.setVelocity(Math.cos(moveRad) * this.speed, Math.sin(moveRad) * this.speed);
    }

    fireAtEnemy(enemy) {
        let fireAngle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);

        // NẾU BẮN TÀU ĐỊCH (SHIP TARGET): TÍNH TOÁN GÓC ĐÓN ĐƯỜNG (LEAD TARGET PREDICTION)
        if (!this.isCIWS && enemy && enemy.body) {
            const bulletSpeed = this.weaponConfig.bulletSpeed || 960;
            const targetVx = (enemy.body.velocity) ? enemy.body.velocity.x : 0;
            const targetVy = (enemy.body.velocity) ? enemy.body.velocity.y : 0;
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            const timeOfFlight = dist / bulletSpeed;

            const predX = enemy.x + targetVx * timeOfFlight;
            const predY = enemy.y + targetVy * timeOfFlight;
            fireAngle = Phaser.Math.Angle.Between(this.x, this.y, predX, predY);
        }

        // Góc tản đạn cực hẹp: trong khoảng ±1 đến ±2 độ (±1.5°) đối với pháo hạm, ±0.8° đối với CIWS
        const spreadDeg = this.isCIWS ? (Math.random() - 0.5) * 1.6 : (Math.random() - 0.5) * 3.0;
        const finalAngle = fireAngle + Phaser.Math.DegToRad(spreadDeg);

        const spawnX = this.x + Math.cos(finalAngle) * 30;
        const spawnY = this.y + Math.sin(finalAngle) * 30;

        const config = {
            ...this.weaponConfig,
            damage: Math.round(this.weaponConfig.damage * this.dmgMult)
        };

        const projectile = new Projectile(
            this.scene,
            spawnX,
            spawnY,
            'bullet_player',
            config,
            finalAngle,
            'ally'
        );
        this.scene.playerProjectiles.add(projectile);
    }

    launchTomahawkSalvo(enemy) {
        const launchRad = Phaser.Math.DegToRad(this.angle - 90);
        const slots = this.missileSlots;

        for (let i = 0; i < slots; i++) {
            this.scene.time.delayedCall(i * 350, () => {
                if (!this.active || this.hp <= 0 || !enemy.active) return;

                const perp = launchRad + Math.PI / 2;
                const offset = (i === 0 ? -1 : 1) * 8;
                const spawnX = this.x + Math.cos(launchRad) * 20 + Math.cos(perp) * offset;
                const spawnY = this.y + Math.sin(launchRad) * 20 + Math.sin(perp) * offset;

                const config = {
                    ...this.missileConfig,
                    damage: Math.round(this.missileConfig.damage * this.dmgMult)
                };

                const texKey = this.missileConfig.textureKey || 'missile_harpoon3';
                const missile = new Missile(
                    this.scene,
                    spawnX,
                    spawnY,
                    texKey,
                    config,
                    enemy,
                    launchRad,
                    'ally'
                );
                this.scene.playerProjectiles.add(missile);
            });
        }
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
                    const spawnX = this.x + Math.cos(launchRad) * 22;
                    const spawnY = this.y + Math.sin(launchRad) * 22;

                    const missile = new Missile(
                        this.scene,
                        spawnX,
                        spawnY,
                        cfg.textureKey || `missile_${typeKey}`,
                        cfg,
                        targetRef,
                        launchRad,
                        'ally'
                    );
                    this.scene.playerProjectiles.add(missile);
                });
            }
        }
    }

    /**
     * Tự động tái tạo tiêm kích trong Hangar tàu sân bay con: Cứ 5s hồi phục 1 máy bay bị hạ (tối đa 9 chiếc)
     */
    updateHangarRecharge(delta) {
        if (!this.active || this.hp <= 0 || !this.scene) return;

        // Dọn dẹp máy bay đã bị bắn hạ khỏi danh sách
        this.escortJets = (this.escortJets || []).filter(j => j && j.active && j.hp > 0);

        if (this.escortJets.length < 9) {
            this.hangarRechargeTimer = (this.hangarRechargeTimer || 0) + delta;
            if (this.hangarRechargeTimer >= 5000) {
                this.hangarRechargeTimer = 0;
                const jetCfg = (this.scene.ShipConfig && this.scene.ShipConfig.aircraft && this.scene.ShipConfig.aircraft.fighter_f35c) || {
                    id: 'fighter_f35c',
                    name: 'Tiêm kích F-35C Hộ tống',
                    maxHp: 110,
                    speed: 280,
                    turnSpeed: 180,
                    attackRange: 340,
                    flightDuration: 30000,
                    weapon: 'aircraft_gatling',
                    missileWeapon: 'tomahawk_aircraft',
                    textureKey: 'fighter_jet'
                };
                const existingSlots = new Set(this.escortJets.map(j => j.slotIndex));
                let nextSlot = 0;
                for (let s = 0; s < 9; s++) {
                    if (!existingSlots.has(s)) {
                        nextSlot = s;
                        break;
                    }
                }
                const newJet = new FighterJet(this.scene, this, jetCfg, nextSlot);
                this.escortJets.push(newJet);
                if (this.scene.aircraftSquadron) {
                    this.scene.aircraftSquadron.push(newJet);
                }
            }
        }
    }

    createWakeEffect() {
        const sternAngleRad = Phaser.Math.DegToRad(this.angle + 90);
        const wakeX = this.x + Math.cos(sternAngleRad) * 38;
        const wakeY = this.y + Math.sin(sternAngleRad) * 38;

        const bubble = this.scene.add.circle(wakeX, wakeY, 4, 0x95c8ec, 0.6);
        bubble.setDepth(5);
        this.scene.tweens.add({
            targets: bubble,
            alpha: 0,
            scale: 2,
            duration: 500,
            onComplete: () => bubble.destroy()
        });
    }

    createDamageSmoke() {
        const sternAngleRad = Phaser.Math.DegToRad(this.angle + 90);
        const smokeX = this.x + Math.cos(sternAngleRad) * 35;
        const smokeY = this.y + Math.sin(sternAngleRad) * 35;

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

    takeDamage(damage) {
        if (this.scene && this.scene.time) {
            this.lastDamageTakenTime = this.scene.time.now;
        }

        const actualDamage = Math.max(5, Math.round(damage * (1 - this.armor / 100)));
        this.hp -= actualDamage;
        this.healthBar.setHp(this.hp);

        // Hư hỏng bộ phận
        if (Math.random() < 0.4 && !this.modules.engine.damaged) {
            this.modules.engine.hp -= actualDamage;
            if (this.modules.engine.hp <= 0) {
                this.modules.engine.damaged = true;
                if (this.scene.showFloatingMessage) {
                    this.scene.showFloatingMessage(this.x, this.y - 45, '⚠ HỎNG ĐỘNG CƠ!', 0xff3838);
                }
            }
        }

        this.scene.tweens.add({
            targets: [this.hull, this.turret],
            tint: 0xff4757,
            duration: 60,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                if (this.hull) this.hull.clearTint();
                if (this.turret) this.turret.clearTint();
            }
        });

        if (this.scene.showFloatingDamage) {
            this.scene.showFloatingDamage(this.x, this.y - 20, `-${actualDamage}`, 0x2ed573);
        }

        if (this.hp <= 0) {
            this.explodeAndSink();
        }
    }

    explodeAndSink() {
        this.body.setVelocity(0, 0);
        const currentScene = this.scene;

        if (currentScene && currentScene.createExplosion) {
            currentScene.createExplosion(this.x, this.y, 'big');
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
                }
            });
        }
    }

    destroy(fromScene) {
        // Hủy vòng radar riêng
        if (this.radarGraphics) {
            this.radarGraphics.destroy();
            this.radarGraphics = null;
        }

        // Tiêu diệt tiêm kích hộ tống nếu có
        if (this.escortJets && this.escortJets.length > 0) {
            this.escortJets.forEach(j => {
                if (j && j.active) j.takeDamage(9999);
            });
            this.escortJets = [];
        }

        if (this.healthBar) this.healthBar.destroy();
        super.destroy(fromScene);
    }
}
