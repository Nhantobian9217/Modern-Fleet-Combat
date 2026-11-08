/**
 * Missile.js - Hệ thống Tên lửa Hải quân Hiện đại (Anti-Air & Anti-Ship)
 * 
 * Tính năng & Sửa lỗi toàn diện:
 * 1. Tên lửa bay trên trời nên XUYÊN QUA ĐỊA HÌNH (flyOverTerrain: true)
 * 2. Căn chỉnh góc xoay +90 độ cho toàn bộ asset PNG tên lửa thẳng đứng hướng về phía trước (Nose-first)
 * 3. Hỗ trợ spriteScale tùy biến theo tỷ lệ kích thước thực tế
 * 4. Phân loại mục tiêu targetType rõ ràng:
 *    - 'air_only': RIM-116, RIM-162, SM-3, SM-6 (Chỉ bắn chặn tên lửa và máy bay)
 *    - 'ship_only': Harpoon Block 3, NSM, AGM-84, Tomahawk Block IV (Chỉ tấn công tàu chiến mặt nước)
 *    - 'all': CPS (Tên lửa siêu thanh tàu mẹ - Nổ AoE quét sạch cả tàu lẫn mục tiêu trên không)
 */

import { SoundManager } from '../managers/SoundManager.js';

export class Missile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, config, target, angleRad, sourceTeam) {
        super(scene, x, y, textureKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.config = config || {};
        this.target = target;
        this.sourceTeam = sourceTeam;
        this.damage = this.config.damage || 160;
        this.aoeRadius = this.config.aoeRadius || 85;
        this.speed = this.config.speed || 350;
        this.turnSpeed = this.config.turnSpeed || 120;
        this.range = this.config.range || 950;
        this.targetType = this.config.targetType || 'ship_only';

        // MÁU CỦA TÊN LỬA (HỆ THỐNG PHÒNG KHÔNG ĐÁNH CHẶN)
        this.maxHp = this.config.maxHp || 40;
        this.hp = this.maxHp;

        this.startX = x;
        this.startY = y;
        this.currentSpeed = this.speed * 0.75;

        // Góc bay vật lý (Flight Angle)
        this.flightAngle = angleRad;
        this.spriteScale = this.config.spriteScale || 1.0;
        this.setScale(this.spriteScale);

        // ĐỒ HỌA TÊN LỬA MỚI HƯỚNG BẮC (THẲNG ĐỨNG): CẦN XOAY +90 ĐỘ ĐỂ ĐẦU ĐẠN CHÚC THEO HƯỚNG BAY
        this.setRotation(this.flightAngle + Math.PI / 2);
        this.setDepth(24); // Nổi trên không trung

        this.smokeTimer = 0;
        this.flightTimer = 0;
        this.maxFlightDuration = 12000;

        // HIỆU ỨNG KHỞI PHÓNG TÊN LỬA (LAUNCH FLASH & SMOKE PUFF)
        this.createLaunchVisuals(scene, x, y, angleRad);

        // Âm thanh phóng tên lửa rít gió
        SoundManager.playMissileLaunch();
    }

    createLaunchVisuals(scene, x, y, angleRad) {
        if (!scene || !scene.add) return;
        // Chớp lửa trắng cam tại bệ phóng
        const flash = scene.add.circle(x, y, 9 * this.spriteScale, 0xffeedd, 0.95);
        flash.setDepth(25);
        scene.tweens.add({
            targets: flash,
            scale: 2.2,
            alpha: 0,
            duration: 140,
            onComplete: () => flash.destroy()
        });

        // Khói phóng phụt ngược hướng bay
        const backX = x - Math.cos(angleRad) * 16;
        const backY = y - Math.sin(angleRad) * 16;
        const launchSmoke = scene.add.circle(backX, backY, 7 * this.spriteScale, 0xb2bec3, 0.75);
        launchSmoke.setDepth(22);
        scene.tweens.add({
            targets: launchSmoke,
            scale: 2.8,
            alpha: 0,
            duration: 450,
            onComplete: () => launchSmoke.destroy()
        });
    }

    update(time, delta) {
        this.advanceMovement(delta);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.advanceMovement(delta);
    }

    advanceMovement(delta) {
        if (!this.active) return;

        if (this.scene && this.scene.game && this.scene.game.loop) {
            const currentFrame = this.scene.game.loop.frame;
            if (this._lastMoveFrame === currentFrame) return;
            this._lastMoveFrame = currentFrame;
        }

        const dt = (delta || 16) / 1000;

        // 1. TĂNG TỐC ĐỘNG CƠ PHẢN LỰC
        if (this.currentSpeed < this.speed) {
            this.currentSpeed = Math.min(this.speed, this.currentSpeed + 260 * dt);
        }

        // 2. DẪN ĐƯỜNG BAY THẲNG VÀ LƯỢN ĐẾN MỤC TIÊU
        if (!this.target || !this.target.active || (this.target.hp !== undefined && this.target.hp <= 0)) {
            // Tên lửa phòng không: Thử tái khóa mục tiêu đường không mới nếu mục tiêu cũ đã bị tiêu diệt
            if (this.targetType === 'air_only') {
                const newTarget = this.findNewAirTarget();
                if (newTarget) {
                    this.target = newTarget;
                    this.lostTarget = false;
                    this.lostTargetTimer = 0;
                } else {
                    this.target = null;
                }
            } else {
                this.target = null;
            }

            if (!this.target) {
                if (!this.lostTarget) {
                    this.lostTarget = true;
                    this.lostTargetTimer = 0;
                }
                this.lostTargetTimer += delta || 16;

                if (this.lostTargetTimer >= 2000) {
                    this.explode(null);
                    return;
                }
            }
        } else {
            const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
            const diff = Phaser.Math.Angle.Wrap(angleToTarget - this.flightAngle);

            const maxTurn = Phaser.Math.DegToRad(this.turnSpeed) * dt;
            if (Math.abs(diff) <= maxTurn) {
                this.flightAngle = angleToTarget;
            } else {
                this.flightAngle += (diff > 0 ? 1 : -1) * maxTurn;
            }

            // Khoảng cách tới mục tiêu <= 32px -> Kích nổ trực tiếp
            const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            if (distToTarget <= 32) {
                this.explode(this.target);
                return;
            }
        }

        // Cập nhật hướng xoay của sprite tên lửa (Nose-first)
        this.setRotation(this.flightAngle + Math.PI / 2);

        this.x += Math.cos(this.flightAngle) * this.currentSpeed * dt;
        this.y += Math.sin(this.flightAngle) * this.currentSpeed * dt;

        if (this.body) {
            this.body.reset(this.x, this.y);
        }

        // 3. KIỂM TRA TẦM BAY TỐI ĐA & THỜI GIAN BAY
        this.flightTimer += delta || 16;
        if (this.flightTimer >= this.maxFlightDuration) {
            this.explode(null);
            return;
        }

        const travelledDist = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
        if (travelledDist >= this.range) {
            this.explode(null);
            return;
        }

        // 4. HIỆU ỨNG ĐUÔI LỬA VÀ KHÓI TRẮNG CUỘN
        this.smokeTimer += delta || 16;
        if (this.smokeTimer >= 40) {
            this.smokeTimer = 0;
            this.createMissileTrail();
        }
    }

    createMissileTrail() {
        if (!this.scene || !this.scene.add) return;

        const tailDist = 18 * this.spriteScale;
        const trailX = this.x - Math.cos(this.flightAngle) * tailDist;
        const trailY = this.y - Math.sin(this.flightAngle) * tailDist;

        // 1. Lõi lửa plasma trắng rực tâm động cơ
        const core = this.scene.add.circle(trailX, trailY, 2.2 * this.spriteScale, 0xffffff, 1.0);
        core.setDepth(24);
        this.scene.tweens.add({
            targets: core,
            scale: 0.1,
            alpha: 0,
            duration: 90,
            onComplete: () => core.destroy()
        });

        // 2. Vầng hào quang lửa màu đặc trưng tên lửa
        const fire = this.scene.add.circle(trailX, trailY, 4.2 * this.spriteScale, this.config.bulletColor || 0xff9f43, 0.95);
        fire.setDepth(23);
        this.scene.tweens.add({
            targets: fire,
            scale: 0.3,
            alpha: 0,
            duration: 140,
            onComplete: () => fire.destroy()
        });

        // 3. Khói phản lực cuộn nở rộng
        const smoke = this.scene.add.circle(trailX, trailY, 4.5 * this.spriteScale, 0xdfe6e9, 0.65);
        smoke.setDepth(22);
        this.scene.tweens.add({
            targets: smoke,
            scale: 2.5,
            alpha: 0,
            duration: 350,
            onComplete: () => smoke.destroy()
        });

        // 4. Tia lửa văng ngược ra sau
        if (Math.random() < 0.6) {
            const sparkX = trailX + (Math.random() * 4 - 2);
            const sparkY = trailY + (Math.random() * 4 - 2);
            const spark = this.scene.add.circle(sparkX, sparkY, 1.8 * this.spriteScale, 0xffeaa7, 0.9);
            spark.setDepth(24);
            this.scene.tweens.add({
                targets: spark,
                x: sparkX - Math.cos(this.flightAngle) * 12,
                y: sparkY - Math.sin(this.flightAngle) * 12,
                scale: 0.2,
                alpha: 0,
                duration: 180,
                onComplete: () => spark.destroy()
            });
        }
    }

    takeDamage(damage) {
        if (!this.active || this.hp <= 0) return;
        this.hp -= damage;

        if (this.scene && this.scene.add) {
            const spark = this.scene.add.circle(this.x, this.y, 4, 0xf1c40f, 0.9);
            spark.setDepth(26);
            this.scene.tweens.add({
                targets: spark,
                scale: 1.8,
                alpha: 0,
                duration: 100,
                onComplete: () => spark.destroy()
            });
        }

        if (this.hp <= 0) {
            this.interceptedDestroy();
        }
    }

    /**
     * Bị bắn nổ giữa không trung trước khi chạm mục tiêu (Air Defense Interception)
     */
    interceptedDestroy() {
        if (!this.scene) return;
        const currentScene = this.scene;

        if (currentScene.createExplosion) {
            currentScene.createExplosion(this.x, this.y, 'big');
        }
        if (currentScene.showFloatingMessage) {
            currentScene.showFloatingMessage(this.x, this.y - 25, '⚡ BẮN HẠ TÊN LỬA!', 0xf1c40f);
        }

        SoundManager.playCannonFire();
        this.destroy();
    }

    /**
     * Kích nổ AoE với âm thanh bass trầm & Rung màn hình mạnh
     */
    explode(directHitTarget) {
        if (!this.scene) return;

        const scene = this.scene;
        const x = this.x;
        const y = this.y;
        const aoeRadius = this.aoeRadius;
        const baseDamage = this.damage;
        const isFriendly = (this.sourceTeam === 'player' || this.sourceTeam === 'ally');
        const targetType = this.targetType; // 'air_only', 'ship_only', 'all'

        // Âm thanh nổ bass trầm cực mạnh
        SoundManager.playDeepExplosion();

        // Rung màn hình và lóe chớp sáng theo yêu cầu
        scene.cameras.main.shake(220, 0.008);
        scene.cameras.main.flash(120, 255, 230, 150, 0.25);

        if (scene.createExplosion) {
            scene.createExplosion(x, y, (aoeRadius > 150) ? 'huge' : 'big');
        }

        // Vòng tròn sóng xung kích kép (Double Shockwave Ring)
        const shockwave = scene.add.circle(x, y, 10, this.config.bulletColor || 0xff9f43, 0.9);
        shockwave.setStrokeStyle(3, 0xffffff, 1);
        shockwave.setDepth(25);
        scene.tweens.add({
            targets: shockwave,
            radius: aoeRadius,
            alpha: 0,
            duration: 320,
            ease: 'Cubic.out',
            onComplete: () => shockwave.destroy()
        });

        const outerWave = scene.add.circle(x, y, 12, 0xffffff, 0.7);
        outerWave.setStrokeStyle(2, this.config.bulletColor || 0xffa502, 0.8);
        outerWave.setDepth(24);
        scene.tweens.add({
            targets: outerWave,
            radius: aoeRadius * 1.25,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.out',
            onComplete: () => outerWave.destroy()
        });

        // Hạt lửa mảnh vỡ văng tỏa tròn (Radial explosion sparks)
        for (let s = 0; s < 8; s++) {
            const sparkAngle = (Math.PI * 2 / 8) * s + (Math.random() * 0.4 - 0.2);
            const sparkDist = (aoeRadius * 0.5) + Math.random() * (aoeRadius * 0.5);
            const spark = scene.add.circle(x, y, 3, 0xffeaa7, 1);
            spark.setDepth(26);
            scene.tweens.add({
                targets: spark,
                x: x + Math.cos(sparkAngle) * sparkDist,
                y: y + Math.sin(sparkAngle) * sparkDist,
                scale: 0.1,
                alpha: 0,
                duration: 250 + Math.random() * 150,
                ease: 'Quad.out',
                onComplete: () => spark.destroy()
            });
        }

        // Tính toán sát thương diện rộng (AoE) phân loại theo targetType
        if (isFriendly) {
            // 1. SÁT THƯƠNG TÀU CHIẾN (Chỉ khi targetType === 'ship_only' hoặc 'all')
            if (targetType === 'ship_only' || targetType === 'all') {
                if (scene.enemyFleet) {
                    scene.enemyFleet.forEach(enemy => {
                        if (!enemy || !enemy.active || enemy.hp <= 0) return;
                        const d = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                        if (d <= aoeRadius) {
                            const falloff = 1 - (d / aoeRadius) * 0.4;
                            const dmg = Math.round(baseDamage * falloff);
                            enemy.takeDamage(dmg, 'aoe');
                        }
                    });
                }
            }

            // 2. SÁT THƯƠNG TÊN LỬA & MÁY BAY ĐỊCH (Chỉ khi targetType === 'air_only' hoặc 'all')
            if (targetType === 'air_only' || targetType === 'all') {
                // Đánh chặn tên lửa địch
                if (scene.enemyProjectiles) {
                    const missiles = scene.enemyProjectiles.getChildren().filter(p => p && p.active && p.maxHp);
                    missiles.forEach(p => {
                        const d = Phaser.Math.Distance.Between(x, y, p.x, p.y);
                        if (d <= aoeRadius) {
                            p.takeDamage(baseDamage);
                        }
                    });
                }

                // Tiêu diệt máy bay địch
                if (scene.enemyAircraft) {
                    scene.enemyAircraft.forEach(plane => {
                        if (!plane || !plane.active || plane.hp <= 0) return;
                        const d = Phaser.Math.Distance.Between(x, y, plane.x, plane.y);
                        if (d <= aoeRadius) {
                            plane.takeDamage(baseDamage);
                        }
                    });
                }
            }
        } else {
            // Địch bắn trúng người chơi / đồng minh / máy bay / tên lửa của ta
            // 1. SÁT THƯƠNG TÀU CHIẾN PHE TA (Chỉ khi targetType === 'ship_only' hoặc 'all')
            if (targetType === 'ship_only' || targetType === 'all') {
                if (scene.playerShip && scene.playerShip.active && scene.playerShip.hp > 0) {
                    const d = Phaser.Math.Distance.Between(x, y, scene.playerShip.x, scene.playerShip.y);
                    if (d <= aoeRadius) {
                        const falloff = 1 - (d / aoeRadius) * 0.4;
                        const dmg = Math.round(baseDamage * falloff);
                        scene.playerShip.takeDamage(dmg, 'aoe');
                        scene.events.emit('updatePlayerHp', scene.playerShip.hp, scene.playerShip.maxHp);
                    }
                }

                if (scene.allyFleet) {
                    scene.allyFleet.forEach(ally => {
                        if (!ally || !ally.active || ally.hp <= 0) return;
                        const d = Phaser.Math.Distance.Between(x, y, ally.x, ally.y);
                        if (d <= aoeRadius) {
                            const falloff = 1 - (d / aoeRadius) * 0.4;
                            const dmg = Math.round(baseDamage * falloff);
                            ally.takeDamage(dmg, 'aoe');
                        }
                    });
                }
            }

            // 2. SÁT THƯƠNG TÊN LỬA VÀ MÁY BAY PHE TA (Chỉ khi targetType === 'air_only' hoặc 'all')
            if (targetType === 'air_only' || targetType === 'all') {
                // Đánh chặn tên lửa của ta
                if (scene.playerProjectiles) {
                    const missiles = scene.playerProjectiles.getChildren().filter(p => p && p.active && p.maxHp);
                    missiles.forEach(p => {
                        const d = Phaser.Math.Distance.Between(x, y, p.x, p.y);
                        if (d <= aoeRadius) {
                            p.takeDamage(baseDamage);
                        }
                    });
                }

                // Tiêu diệt máy bay của ta
                if (scene.aircraftSquadron) {
                    scene.aircraftSquadron.forEach(plane => {
                        if (!plane || !plane.active || plane.hp <= 0 || plane.state === 'PARKED') return;
                        const d = Phaser.Math.Distance.Between(x, y, plane.x, plane.y);
                        if (d <= aoeRadius) {
                            plane.takeDamage(baseDamage);
                        }
                    });
                }
            }
        }

        this.destroy();
    }

    findNewAirTarget() {
        if (!this.scene) return null;
        const isFriendly = (this.sourceTeam === 'player' || this.sourceTeam === 'ally');
        let bestTarget = null;
        let closestDist = 550;

        if (isFriendly) {
            // Tên lửa phe ta tái khóa tên lửa hoặc máy bay địch
            if (this.scene.enemyProjectiles) {
                const missiles = this.scene.enemyProjectiles.getChildren().filter(p => p && p.active && p.maxHp && (p.hp === undefined || p.hp > 0));
                for (let i = 0; i < missiles.length; i++) {
                    const m = missiles[i];
                    const d = Phaser.Math.Distance.Between(this.x, this.y, m.x, m.y);
                    if (d < closestDist) {
                        closestDist = d;
                        bestTarget = m;
                    }
                }
            }
            if (!bestTarget && this.scene.enemyAircraft) {
                for (let i = 0; i < this.scene.enemyAircraft.length; i++) {
                    const a = this.scene.enemyAircraft[i];
                    if (!a || !a.active || a.hp <= 0) continue;
                    const d = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
                    if (d < closestDist) {
                        closestDist = d;
                        bestTarget = a;
                    }
                }
            }
        } else {
            // Tên lửa địch tái khóa tên lửa hoặc tiêm kích ta
            if (this.scene.playerProjectiles) {
                const missiles = this.scene.playerProjectiles.getChildren().filter(p => p && p.active && p.maxHp && (p.hp === undefined || p.hp > 0));
                for (let i = 0; i < missiles.length; i++) {
                    const m = missiles[i];
                    const d = Phaser.Math.Distance.Between(this.x, this.y, m.x, m.y);
                    if (d < closestDist) {
                        closestDist = d;
                        bestTarget = m;
                    }
                }
            }
            if (!bestTarget && this.scene.aircraftSquadron) {
                for (let i = 0; i < this.scene.aircraftSquadron.length; i++) {
                    const a = this.scene.aircraftSquadron[i];
                    if (!a || !a.active || a.hp <= 0 || a.state === 'PARKED') continue;
                    const d = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
                    if (d < closestDist) {
                        closestDist = d;
                        bestTarget = a;
                    }
                }
            }
        }

        return bestTarget;
    }
}
