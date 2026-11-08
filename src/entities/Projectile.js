/**
 * Projectile.js - Đạn pháo hải quân (Được tối ưu hóa & Chịu ảnh hưởng thời tiết)
 * 
 * - Tốc độ đạn chậm hơn vừa mắt, hiển thị quỹ đạo rõ nét
 * - Bị lệch nhẹ đường đạn khi gặp thời tiết Bão tố (STORM) hoặc Sóng lớn (ROUGH_SEAS)
 * - Tối ưu hóa triệt để để không gây lag khi hàng chục tàu cùng lúc xả đạn
 */

import { SoundManager } from '../managers/SoundManager.js';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, config, angleRad, sourceTeam) {
        super(scene, x, y, textureKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.config = config;
        this.sourceTeam = sourceTeam;
        this.damage = config.damage || 40;
        this.range = config.range || 600;
        this.speed = config.bulletSpeed || 420;

        this.startX = x;
        this.startY = y;

        // Ảnh hưởng thời tiết: lệch hướng đạn nếu gặp bão
        let finalAngle = angleRad;
        if (scene.currentWeather && scene.currentWeather.bulletDrift > 0) {
            const driftRad = Phaser.Math.DegToRad((Math.random() - 0.5) * scene.currentWeather.bulletDrift);
            finalAngle += driftRad;
        }

        this.setRotation(finalAngle);
        this.setDepth(15);

        this.vx = Math.cos(finalAngle) * this.speed;
        this.vy = Math.sin(finalAngle) * this.speed;

        this.trailTimer = 0;

        // Âm thanh pháo nổ
        if (sourceTeam === 'player' || sourceTeam === 'ally') {
            SoundManager.playCannonFire();
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.advanceMovement(delta);
    }

    advanceMovement(delta) {
        if (!this.active) return;

        const dt = (delta || 16) / 1000;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.body) {
            this.body.reset(this.x, this.y);
        }

        // 1. Kiểm tra tầm bắn tối đa
        const distance = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
        if (distance >= this.range) {
            this.explode(false);
            return;
        }

        // 2. Đạn pháo va chạm vật cản địa hình (Đảo, Giàn khoan)
        if (this.scene && this.scene.obstacles) {
            for (let i = 0; i < this.scene.obstacles.length; i++) {
                const obs = this.scene.obstacles[i];
                if (obs.containsPoint(this.x, this.y)) {
                    this.hitObstacle(obs);
                    return;
                }
            }
        }

        // 3. Vệt sáng đạn (Tối ưu hóa tránh lag: chu kỳ 55ms)
        this.trailTimer += delta;
        if (this.trailTimer > 55) {
            this.trailTimer = 0;
            this.createTrailParticle();
        }
    }

    createTrailParticle() {
        if (!this.scene) return;
        const trail = this.scene.add.circle(
            this.x, 
            this.y, 
            (this.config.bulletRadius || 3.5) * 0.7, 
            this.config.bulletColor || 0xffffff, 
            0.5
        );
        trail.setDepth(14);

        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0.2,
            duration: 140,
            onComplete: () => trail.destroy()
        });
    }

    hitObstacle(obstacle) {
        if (!this.scene) return;
        if (this.scene.createExplosion) {
            this.scene.createExplosion(this.x, this.y, 'obstacle_hit');
        }
        this.destroy();
    }

    explode(hitTarget = false) {
        if (!this.scene) return;
        if (this.scene.createExplosion) {
            this.scene.createExplosion(this.x, this.y, hitTarget ? 'hit' : 'water_splash');
        }
        this.destroy();
    }
}
