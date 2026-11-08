/**
 * EnemyAircraft.js - Máy bay tiêm kích đối phương xuất kích từ Tàu sân bay địch / Kraken Titan
 * 
 * Mục tiêu hợp lệ cho Tên lửa phòng không (RIM-116, RIM-162, SM-3, SM-6) và CIWS 20mm
 */

import { HealthBar } from '../ui/HealthBar.js';
import { Projectile } from './Projectile.js';
import { SoundManager } from '../managers/SoundManager.js';

export class EnemyAircraft extends Phaser.GameObjects.Container {
    constructor(scene, x, y, target = null) {
        super(scene, x, y);

        this.scene = scene;
        this.target = target || scene.playerShip;

        this.maxHp = 105;
        this.hp = this.maxHp;
        this.speed = 230;
        this.turnSpeed = 150;
        this.attackRange = 380;
        this.lastFireTime = 0;
        this.fireCooldown = 1800;
        this.flightDuration = 25000;
        this.flightTimer = 0;
        this.contrailTimer = 0;

        // Sprite máy bay địch màu đỏ stealth
        this.sprite = scene.add.sprite(0, 0, 'enemy_jet');
        this.sprite.setOrigin(0.5, 0.5);
        this.add(this.sprite);

        // Ngọn lửa phản lực đuôi
        this.afterburner = scene.add.circle(0, 14, 3, 0xff4757, 0.85);
        this.add(this.afterburner);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(24, 24);
        this.setDepth(27);

        this.healthBar = new HealthBar(scene, this, 28, 3.5, -20);
        this.healthBar.graphics.setVisible(true);

        this.setAngle(scene.playerShip ? (Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(x, y, scene.playerShip.x, scene.playerShip.y)) + 90) : 180);
    }

    update(time, delta) {
        if (!this.active || this.hp <= 0) return;

        const deltaSec = delta / 1000;
        this.flightTimer += delta;

        // Hết thời gian bay hoặc bay quá xa thế giới
        if (this.flightTimer > this.flightDuration || this.x < -200 || this.x > 3500 || this.y < -200 || this.y > 2500) {
            this.destroyPlane();
            return;
        }

        // Tìm mục tiêu nếu mục tiêu cũ đã chết
        if (!this.target || !this.target.active || this.target.hp <= 0) {
            this.target = this.findClosestPlayerTarget();
        }

        if (this.target && this.target.active) {
            const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
            const targetDeg = Phaser.Math.RadToDeg(angleToTarget) + 90;
            const diff = Phaser.Math.Angle.WrapDegrees(targetDeg - this.angle);
            const step = this.turnSpeed * deltaSec;

            if (Math.abs(diff) <= step) {
                this.angle = targetDeg;
            } else {
                this.angle += (diff > 0 ? 1 : -1) * step;
            }

            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            if (dist <= this.attackRange && Math.abs(diff) < 30 && (time - this.lastFireTime >= this.fireCooldown)) {
                this.fireAtTarget(this.target);
                this.lastFireTime = time;
            }
        }

        // Tiến về phía trước
        const moveRad = Phaser.Math.DegToRad(this.angle - 90);
        this.x += Math.cos(moveRad) * this.speed * deltaSec;
        this.y += Math.sin(moveRad) * this.speed * deltaSec;

        // Hiệu ứng khói vệt bay phản lực đỏ
        this.contrailTimer += delta;
        if (this.contrailTimer > 70) {
            this.contrailTimer = 0;
            const contrail = this.scene.add.circle(this.x, this.y, 2, 0xff7675, 0.45);
            contrail.setDepth(25);
            this.scene.tweens.add({
                targets: contrail,
                scale: 0.2,
                alpha: 0,
                duration: 250,
                onComplete: () => contrail.destroy()
            });
        }

        if (this.healthBar) {
            this.healthBar.update();
        }
    }

    findClosestPlayerTarget() {
        let best = null;
        let minDist = Infinity;

        // Ưu tiên tàu mẹ
        if (this.scene.playerShip && this.scene.playerShip.active && this.scene.playerShip.hp > 0) {
            const d = Phaser.Math.Distance.Between(this.x, this.y, this.scene.playerShip.x, this.scene.playerShip.y);
            minDist = d;
            best = this.scene.playerShip;
        }

        // Quét tàu con đồng minh
        if (this.scene.allyFleet) {
            this.scene.allyFleet.forEach(ally => {
                if (!ally || !ally.active || ally.hp <= 0) return;
                const d = Phaser.Math.Distance.Between(this.x, this.y, ally.x, ally.y);
                if (d < minDist) {
                    minDist = d;
                    best = ally;
                }
            });
        }

        return best;
    }

    fireAtTarget(target) {
        const rad = Phaser.Math.DegToRad(this.angle - 90);
        const spawnX = this.x + Math.cos(rad) * 16;
        const spawnY = this.y + Math.sin(rad) * 16;

        const cfg = {
            damage: 28,
            speed: 550,
            range: 350,
            antiAir: false
        };

        const bullet = new Projectile(
            this.scene,
            spawnX,
            spawnY,
            'bullet_enemy',
            cfg,
            rad,
            'enemy'
        );
        this.scene.enemyProjectiles.add(bullet);
    }

    takeDamage(amount) {
        if (!this.active || this.hp <= 0) return;
        this.hp -= amount;
        if (this.healthBar) {
            this.healthBar.setHp(this.hp);
        }

        if (this.hp <= 0) {
            this.explode();
        }
    }

    explode() {
        if (!this.active) return;
        this.active = false;

        if (this.scene) {
            // Nổ máy bay trên không
            const burst = this.scene.add.circle(this.x, this.y, 22, 0xff4757, 0.9);
            burst.setDepth(30);
            this.scene.tweens.add({
                targets: burst,
                scale: 2.2,
                alpha: 0,
                duration: 250,
                onComplete: () => burst.destroy()
            });

            if (this.scene.createExplosion) {
                this.scene.createExplosion(this.x, this.y, 'hit');
            }
        }

        if (typeof SoundManager.playExplosion === 'function') {
            SoundManager.playExplosion('small');
        } else if (typeof SoundManager.playCannonFire === 'function') {
            SoundManager.playCannonFire();
        }

        this.destroyPlane();
    }

    destroyPlane() {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        if (this.scene && this.scene.enemyAircraft) {
            const idx = this.scene.enemyAircraft.indexOf(this);
            if (idx !== -1) {
                this.scene.enemyAircraft.splice(idx, 1);
            }
        }
        this.destroy();
    }
}
