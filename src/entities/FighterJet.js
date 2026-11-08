/**
 * FighterJet.js - Tiêm kích hạm tàng hình F-35C (Cơ chế Mới)
 * 
 * Cải tiến cơ chế theo yêu cầu:
 * 1. Khi KHÔNG CÓ ĐỊCH: Máy bay sẽ ở yên đỗ trên boong tàu sân bay (PARKED)
 * 2. Khi PHÁT HIỆN ĐỊCH TRONG RADAR: Toàn bộ phi đội cất cánh xuất kích (SCRAMBLE)
 * 3. Tối đa 10 máy bay thuộc biên chế soái hạm
 * 4. Tối ưu hiệu năng, giảm lag khi giao tranh lớn
 */

import { HealthBar } from '../ui/HealthBar.js';
import { Projectile } from './Projectile.js';
import { Missile } from './Missile.js';
import { WeaponConfig } from '../config/WeaponConfig.js';
import { GameConfig } from '../config/GameConfig.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class FighterJet extends Phaser.GameObjects.Container {
    constructor(scene, carrier, config, slotIndex = 0) {
        super(scene, carrier.x, carrier.y);

        this.scene = scene;
        this.carrier = carrier;
        this.config = config;
        this.slotIndex = slotIndex;
        this.squadronIndex = Math.floor(slotIndex / 3); // 0, 1, 2, 3 (Mỗi phi đội 3 chiếc)
        this.slotInSquadron = slotIndex % 3; // 0: Dẫn đầu (Lead), 1: Cánh trái (Wingman 1), 2: Cánh phải (Wingman 2)
        this.squadronTarget = null; // Mục tiêu riêng của phi đội

        this.dmgMult = SaveManager.getMultiplier('damage');

        this.maxHp = config.maxHp || 95;
        this.hp = this.maxHp;
        this.speed = config.speed || 280;
        this.turnSpeed = config.turnSpeed || 180;
        this.weaponConfig = WeaponConfig[config.weapon] || WeaponConfig.aircraft_gatling;
        this.missileConfig = WeaponConfig[config.missileWeapon] || WeaponConfig.tomahawk_aircraft;
        this.missileCooldown = 6500;
        this.lastMissileTime = scene.time.now + 1000;

        this.attackRange = config.attackRange || 300;
        this.flightDuration = config.flightDuration || 28000;

        // Tên Texture của máy bay (Hỗ trợ F-35C, F/A-XX, F/A-47 NGAD)
        const jetTexture = config.textureKey || 'fighter_jet';

        // Trạng thái AI: 'PARKED', 'TAKEOFF', 'ENGAGE', 'RETURNING', 'REARMING'
        this.state = 'PARKED';
        this.flightTime = 0;
        this.lastFireTime = 0;
        this.targetEnemy = null;
        this.contrailTimer = 0;
        this.rearmTimer = 0; // Đếm thời gian nạp đạn khi quay về tàu mẹ

        // Trạng thái đòn đánh tầm xa & rút lui ngay (Hit-and-Run Stand-off Strike)
        this.hasFiredMissile = false;
        this.hasFiredCannon = false;
        this.isFiringBurst = false;
        this.burstShotsRemaining = 0;
        this.burstShotTimer = 0;
        this.attackRunCompleted = false;

        // Sprite tiêm kích
        this.jetSprite = scene.add.sprite(0, 0, jetTexture);
        this.jetSprite.setOrigin(0.5, 0.5);
        this.add(this.jetSprite);

        // Ngọn lửa đuôi
        this.afterburner = scene.add.circle(0, 14, 3, 0x00d2ff, 0);
        this.add(this.afterburner);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(24, 24);
        this.setDepth(12); // Đỗ trên boong

        this.healthBar = new HealthBar(scene, this, 32, 4, -22);

        // Đồng bộ vị trí đỗ ban đầu
        this.syncParkedPosition();
    }

    /**
     * Đồng bộ tọa độ đỗ trên boong tàu sân bay khi ở trạng thái PARKED
     */
    syncParkedPosition() {
        if (!this.carrier || !this.carrier.active) return;

        // Tính toán slot đỗ 2 hàng trên boong tàu mẹ (tối đa 12 máy bay: 6 hàng x 2)
        const row = Math.floor(this.slotIndex / 2);
        const col = this.slotIndex % 2;
        const localX = (this.carrier.isFortress ? (col === 0 ? -18 : 18) : (col === 0 ? -18 : -6));
        const localY = -50 + (row * 20);

        const carrierRad = Phaser.Math.DegToRad(this.carrier.angle);
        const worldX = this.carrier.x + (localX * Math.cos(carrierRad) - localY * Math.sin(carrierRad));
        const worldY = this.carrier.y + (localX * Math.sin(carrierRad) + localY * Math.cos(carrierRad));

        this.x = worldX;
        this.y = worldY;
        this.angle = this.carrier.angle;
        this.setDepth(12);
        this.setScale(0.65); // Thu nhỏ kích thước khi đỗ trên boong
        this.afterburner.setAlpha(0);
        // TÀNG HÌNH 100% KHI ĐỖ TRÊN BOONG (KHI CHƯA CÓ ASSET CUSTOM THEO YÊU CẦU)
        this.setVisible(false);

        if (this.healthBar) {
            this.healthBar.graphics.setVisible(false);
        }
    }

    getAllCarrierJets() {
        if (!this.carrier) return [];
        if (this.carrier.escortJets) {
            return this.carrier.escortJets.filter(j => j && j.active);
        }
        if (this.scene && this.scene.aircraftSquadron) {
            return this.scene.aircraftSquadron.filter(j => j && j.active && j.carrier === this.carrier);
        }
        return [];
    }

    getMySquadronJets() {
        return this.getAllCarrierJets().filter(j => j.squadronIndex === this.squadronIndex);
    }

    update(time, delta) {
        if (!this.active || this.hp <= 0) return;

        const deltaSec = delta / 1000;
        const carrierAlive = (this.carrier && this.carrier.active && this.carrier.hp > 0);
        const radarR = carrierAlive ? (this.carrier.radarRadius || this.carrier.allyRadarRadius || 750) : 750;

        switch (this.state) {
            case 'PARKED':
                // Đỗ yên trên boong, phối hợp xuất kích theo từng phi đội 3 chiếc cách nhau 1s
                this.syncParkedPosition();
                this.checkSquadronScramble(time, radarR);
                break;

            case 'REARMING':
                // Đang tiếp đạn & bảo dưỡng trên boong sau khi hoàn thành đợt tấn công (6 giây)
                this.syncParkedPosition();
                this.rearmTimer -= delta;
                if (this.rearmTimer <= 0) {
                    this.state = 'PARKED';
                    if (this.scene && this.scene.showFloatingMessage && this.slotInSquadron === 0) {
                        this.scene.showFloatingMessage(this.carrier.x, this.carrier.y - 75, `🛩 PHI ĐỘI ${this.squadronIndex + 1} ĐÃ NẠP ĐẠN XONG!`, 0x2ecc71);
                    }
                }
                break;

            case 'TAKEOFF':
                this.moveForward(this.speed * 1.25, deltaSec);
                break;

            case 'ENGAGE':
                this.flightTime += delta;
                this.updateFlyingEffects(delta);

                if (this.flightTime >= this.flightDuration && carrierAlive) {
                    this.breakAwayAndReturn();
                    break;
                }

                // Nếu mục tiêu đã bị tiêu diệt trước khi tiếp cận -> Lập tức quay về
                if (!this.targetEnemy || !this.targetEnemy.active || this.targetEnemy.hp <= 0) {
                    this.breakAwayAndReturn();
                    break;
                }

                this.engageTarget(time, deltaSec, delta);
                break;

            case 'RETURNING':
                this.updateFlyingEffects(delta);
                if (!carrierAlive) {
                    // Tàu sân bay đã bị tiêu diệt — máy bay tự hủy
                    if (this.scene && this.scene.createExplosion) {
                        this.scene.createExplosion(this.x, this.y, 'hit');
                    }
                    if (this.healthBar) this.healthBar.destroy();
                    this.destroy();
                    return; // Thoát update ngay, không truy cập thêm thuộc tính
                }
                this.flyBackToCarrier(deltaSec);
                break;
        }

        if (this.healthBar && this.healthBar.graphics && this.state !== 'PARKED') {
            this.healthBar.graphics.setVisible(true);
            this.healthBar.update();
        }
    }

    /**
     * Kiểm tra điều kiện xuất kích: 1 lần 1 phi đội 3 chiếc cùng lúc hình chữ V, delay 1s giữa các phi đội
     */
    checkSquadronScramble(time, radarR) {
        if (!this.carrier || !this.carrier.active || this.carrier.hp <= 0) return;

        const allCarrierParkedJets = this.getAllCarrierJets().filter(j => j && j.active && j.state === 'PARKED');
        // KIỂM TRA HANGAR: Chỉ khi có ít nhất 3 máy bay đang ở trạng thái PARKED mới cất cánh!
        if (allCarrierParkedJets.length < 3) return;

        // Chỉ để máy bay đỗ đầu tiên điều phối việc cất cánh để tránh gọi trùng lặp trong cùng 1 frame
        if (this !== allCarrierParkedJets[0]) return;

        // Quét tìm mục tiêu trong tầm radar
        this.findTargetWithinRadar(radarR);
        if (!this.targetEnemy || !this.targetEnemy.active || this.targetEnemy.hp <= 0) return;

        // Delay 1s (1000ms) giữa các phi đội
        const carrier = this.carrier;
        carrier._lastSquadronLaunchTime = carrier._lastSquadronLaunchTime || 0;
        if (time - carrier._lastSquadronLaunchTime < 1000) return;

        // KÍCH HOẠT ĐÚNG 1 PHI ĐỘI GỒM 3 CHIẾC CÙNG LÚC HÌNH CHỮ V!
        carrier._lastSquadronLaunchTime = time;
        const target = this.targetEnemy;

        const squadronJets = allCarrierParkedJets.slice(0, 3);
        const assignedSquadronIndex = Math.floor(allCarrierParkedJets[0].slotIndex / 3);

        squadronJets.forEach((jet, idx) => {
            jet.slotInSquadron = idx; // 0: Dẫn đầu, 1: Cánh trái, 2: Cánh phải
            jet.squadronIndex = assignedSquadronIndex;
            jet.scrambleTakeoff(target);
        });
    }

    /**
     * Xuất kích bay lên bầu trời: Cả phi đội xuất phát cùng lúc trong đội hình chữ V
     */
    scrambleTakeoff(targetEnemy = null) {
        this.state = 'TAKEOFF';
        this.flightTime = 0;
        this.targetEnemy = targetEnemy || this.targetEnemy;
        this.hasFiredMissile = false;
        this.hasFiredCannon = false;
        this.isFiringBurst = false;
        this.burstShotsRemaining = 0;
        this.burstShotTimer = 0;
        this.attackRunCompleted = false;

        this.setVisible(true); // Hiện rõ khi bay lên bầu trời
        this.setDepth(28); // Bay trên tầng mây
        this.afterburner.setAlpha(0.9);

        // Đặt vị trí xuất phát ngay theo hình chữ V hướng về phía mục tiêu
        const target = this.targetEnemy;
        const launchHeading = target ? Phaser.Math.Angle.Between(this.carrier.x, this.carrier.y, target.x, target.y) : Phaser.Math.DegToRad(this.carrier.angle);

        let perpSide = 0;
        let perpBack = 0;
        if (this.slotInSquadron === 1) {
            // Cánh trái: lệch trái 36px, lùi sau 32px
            perpSide = -36;
            perpBack = -32;
        } else if (this.slotInSquadron === 2) {
            // Cánh phải: lệch phải 36px, lùi sau 32px
            perpSide = 36;
            perpBack = -32;
        }

        const perpRad = launchHeading + Math.PI / 2;
        const startX = this.carrier.x + Math.cos(launchHeading) * 45 + Math.cos(perpRad) * perpSide + Math.cos(launchHeading) * perpBack;
        const startY = this.carrier.y + Math.sin(launchHeading) * 45 + Math.sin(perpRad) * perpSide + Math.sin(launchHeading) * perpBack;

        this.x = startX;
        this.y = startY;
        this.angle = Phaser.Math.RadToDeg(launchHeading) + 90;

        if (this.slotInSquadron === 0) {
            SoundManager.playJetRoar();
        }

        this.setScale(0.7);
        this.scene.tweens.add({
            targets: this,
            scale: 1.0,
            duration: 650,
            ease: 'Cubic.out',
            onComplete: () => {
                if (this.state === 'TAKEOFF') {
                    this.state = 'ENGAGE';
                }
            }
        });
    }

    moveForward(spd, deltaSec) {
        const moveRad = Phaser.Math.DegToRad(this.angle - 90);
        this.x += Math.cos(moveRad) * spd * deltaSec;
        this.y += Math.sin(moveRad) * spd * deltaSec;
    }

    turnTowards(targetDeg, deltaSec) {
        const diff = Phaser.Math.Angle.WrapDegrees(targetDeg - this.angle);
        const step = this.turnSpeed * deltaSec;
        if (Math.abs(diff) <= step) {
            this.angle = targetDeg;
        } else {
            this.angle += (diff > 0 ? 1 : -1) * step;
        }
    }

    updateFlyingEffects(delta) {
        if (this.afterburner) {
            this.afterburner.setScale(0.8 + Math.random() * 0.4);
        }

        this.contrailTimer += delta;
        if (this.contrailTimer > 60) {
            this.contrailTimer = 0;
            const contrail = this.scene.add.circle(this.x, this.y, 2.5, 0xe0f7fa, 0.45);
            contrail.setDepth(26);
            this.scene.tweens.add({
                targets: contrail,
                scale: 0.2,
                alpha: 0,
                duration: 260,
                onComplete: () => contrail.destroy()
            });
        }
    }

    findTargetWithinRadar(radarRadius) {
        if (!this.scene.enemyFleet || this.scene.enemyFleet.length === 0) {
            this.targetEnemy = null;
            return;
        }

        const safeRadar = (typeof radarRadius === 'number' && !isNaN(radarRadius) && radarRadius > 0) ? radarRadius : 750;

        // Lấy danh sách kẻ địch còn sống trong tầm radar của tàu chở (hoặc bản thân nếu đang bay)
        const livingEnemies = this.scene.enemyFleet.filter(e => {
            if (!e || !e.active || e.hp <= 0) return false;
            const refX = this.carrier ? this.carrier.x : this.x;
            const refY = this.carrier ? this.carrier.y : this.y;
            const dist = Phaser.Math.Distance.Between(e.x, e.y, refX, refY);

            // Kiểm tra trong tầm radar của tàu chở (Citadel hoặc Tàu sân bay Ford)
            const inCarrierRadar = dist <= (safeRadar + 150);

            // Hoặc trong tầm radar bảo vệ soái hạm
            const playerShip = this.scene.playerShip;
            const inMotherRadar = (playerShip && playerShip.active && playerShip.hp > 0)
                ? (Phaser.Math.Distance.Between(e.x, e.y, playerShip.x, playerShip.y) <= 850)
                : false;

            return inCarrierRadar || inMotherRadar;
        });

        if (livingEnemies.length === 0) {
            this.targetEnemy = null;
            return;
        }

        // Nếu chỉ còn ít địch -> Toàn bộ phi đội tập trung hỏa lực vào tàu gần nhất
        if (livingEnemies.length <= 2) {
            let closestDist = Infinity;
            let bestTarget = null;
            livingEnemies.forEach(e => {
                const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
                if (d < closestDist) {
                    closestDist = d;
                    bestTarget = e;
                }
            });
            this.targetEnemy = bestTarget;
            return;
        }

        // Phân chia mục tiêu theo phi đội để tránh giẫm chân nhau
        const assignedTargetIndex = this.squadronIndex % livingEnemies.length;
        this.targetEnemy = livingEnemies[assignedTargetIndex];
    }

    /**
     * Tác chiến tầm xa: Bay tới cự ly, phóng tên lửa chống hạm, bắn 1 loạt pháo và rút lui ngay, không xoay quanh địch
     */
    engageTarget(time, deltaSec, delta) {
        if (!this.targetEnemy || !this.targetEnemy.active || this.targetEnemy.hp <= 0) {
            this.breakAwayAndReturn();
            return;
        }

        const directDist = Phaser.Math.Distance.Between(this.x, this.y, this.targetEnemy.x, this.targetEnemy.y);
        const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, this.targetEnemy.x, this.targetEnemy.y);

        // 1. DUY TRÌ ĐỘI HÌNH V-FORMATION THEO TỌA ĐỘ MỤC TIÊU
        let destX = this.targetEnemy.x;
        let destY = this.targetEnemy.y;

        if (this.slotInSquadron === 1) {
            // Cánh trái: Lệch trái 36px và lùi sau 32px
            const perpAngle = baseAngle - Math.PI / 2;
            destX += Math.cos(perpAngle) * 36 - Math.cos(baseAngle) * 32;
            destY += Math.sin(perpAngle) * 36 - Math.sin(baseAngle) * 32;
        } else if (this.slotInSquadron === 2) {
            // Cánh phải: Lệch phải 36px và lùi sau 32px
            const perpAngle = baseAngle + Math.PI / 2;
            destX += Math.cos(perpAngle) * 36 - Math.cos(baseAngle) * 32;
            destY += Math.sin(perpAngle) * 36 - Math.sin(baseAngle) * 32;
        }

        const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, destX, destY);
        const targetDeg = Phaser.Math.RadToDeg(angleToTarget) + 90;

        this.turnTowards(targetDeg, deltaSec);
        this.moveForward(this.speed, deltaSec);

        // 2. TẤN CÔNG GIAI ĐOẠN 1: PHÓNG TÊN LỬA CHỐNG HẠM TỪ XA (Cự ly 420 - 460px)
        if (directDist <= 460 && !this.hasFiredMissile) {
            this.hasFiredMissile = true;
            this.launchAircraftMissile(this.targetEnemy);
        }

        // 3. TẤN CÔNG GIAI ĐOẠN 2: BẮN 1 LOẠT PHÁO GATLING TỪ XA (Cự ly 340 - 380px)
        if (directDist <= 380 && !this.hasFiredCannon && !this.isFiringBurst) {
            this.hasFiredCannon = true;
            this.isFiringBurst = true;
            this.burstShotsRemaining = 4; // 1 loạt 4 phát đạn pháo
            this.burstShotTimer = 0;
        }

        // Xả loạt đạn liên thanh
        if (this.isFiringBurst) {
            this.burstShotTimer += delta;
            if (this.burstShotTimer >= 60) {
                this.burstShotTimer = 0;
                if (this.targetEnemy && this.targetEnemy.active) {
                    this.fireAtTarget(this.targetEnemy);
                }
                this.burstShotsRemaining--;
                if (this.burstShotsRemaining <= 0) {
                    this.isFiringBurst = false;
                    // BẮN XONG 1 LOẠT PHÁO: LẬP TỨC QUAY VỀ, KHÔNG XOAY QUANH KẺ ĐỊCH!
                    this.breakAwayAndReturn();
                    return;
                }
            }
        }

        // 4. BẢO VỆ AN TOÀN: NẾU TIẾP CẬN CỰ LY 260px MÀ CHƯA THOÁT LY -> LẬP TỨC QUAY VỀ, KHÔNG LƯỢN QUA MỤC TIÊU
        if (directDist <= 260 && !this.attackRunCompleted) {
            this.breakAwayAndReturn();
        }
    }

    /**
     * Bẻ lái thoát ly ngay lập tức và quay về tàu mẹ (Breakaway & RTB)
     */
    breakAwayAndReturn() {
        this.state = 'RETURNING';
        this.attackRunCompleted = true;
        this.isFiringBurst = false;
        this.targetEnemy = null;

        // Bẻ lái gấp quay đầu 180 độ về phía tàu mẹ (Sharp Breakaway Maneuver)
        if (this.carrier && this.carrier.active) {
            const angleToCarrier = Phaser.Math.Angle.Between(this.x, this.y, this.carrier.x, this.carrier.y);
            this.angle = Phaser.Math.RadToDeg(angleToCarrier) + 90;
        }
    }

    fireAtTarget(target) {
        const rad = Phaser.Math.DegToRad(this.angle - 90);
        const spawnX = this.x + Math.cos(rad) * 16;
        const spawnY = this.y + Math.sin(rad) * 16;

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
            rad,
            'ally'
        );
        this.scene.playerProjectiles.add(projectile);
    }

    launchAircraftMissile(target) {
        const rad = Phaser.Math.DegToRad(this.angle - 90);
        const spawnX = this.x + Math.cos(rad) * 14;
        const spawnY = this.y + Math.sin(rad) * 14;

        const config = {
            ...this.missileConfig,
            damage: Math.round(this.missileConfig.damage * this.dmgMult)
        };

        const missile = new Missile(
            this.scene,
            spawnX,
            spawnY,
            'missile_aircraft',
            config,
            target,
            rad,
            'ally'
        );
        this.scene.playerProjectiles.add(missile);
    }

    flyBackToCarrier(deltaSec) {
        if (!this.carrier || !this.carrier.active || this.carrier.hp <= 0) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.carrier.x, this.carrier.y);
        const angleToCarrier = Phaser.Math.Angle.Between(this.x, this.y, this.carrier.x, this.carrier.y);
        const targetDeg = Phaser.Math.RadToDeg(angleToCarrier) + 90;

        this.turnTowards(targetDeg, deltaSec);
        this.moveForward(this.speed * 1.15, deltaSec);

        // Tiếp cận đường băng tàu mẹ -> Hạ cánh và nạp lại
        if (dist < 50) {
            this.landOnCarrier();
        }
    }

    landOnCarrier() {
        this.state = 'REARMING';
        this.rearmTimer = 6000; // 6s nạp lại đầy đủ vũ khí
        this.hp = this.maxHp;
        this.healthBar.setHp(this.hp);
        this.syncParkedPosition();
        this.hasFiredMissile = false;
        this.hasFiredCannon = false;
        this.isFiringBurst = false;
        this.burstShotsRemaining = 0;
        this.attackRunCompleted = false;
        this.targetEnemy = null;
    }

    takeDamage(damage) {
        this.hp -= damage;
        this.healthBar.setHp(this.hp);

        if (this.hp <= 0) {
            if (this.scene.createExplosion) {
                this.scene.createExplosion(this.x, this.y, 'hit');
            }
            if (this.healthBar) this.healthBar.destroy();
            this.destroy();
        }
    }

    destroy(fromScene) {
        if (this.healthBar) this.healthBar.destroy();
        super.destroy(fromScene);
    }
}
