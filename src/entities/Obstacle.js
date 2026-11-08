/**
 * Obstacle.js - Vật cản địa hình trên biển (Đảo đá, Dàn khoan dầu)
 * 
 * Tạo điểm nhấn chiến thuật:
 * - Chặn đạn pháo của cả người chơi và kẻ địch (đạn va vào sẽ nổ tóe đá/lửa)
 * - Tàu chiến không thể bơi xuyên qua các hòn đảo hoặc giàn khoan
 */

export class Obstacle extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type, radius) {
        super(scene, x, y);

        this.scene = scene;
        this.obstacleType = type; // 'island_large', 'island_small', 'oil_rig'
        this.radius = radius || 60;

        // Hình ảnh đại diện
        this.sprite = scene.add.sprite(0, 0, type);
        this.add(this.sprite);

        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Static body (không bị đẩy xê dịch)

        this.setDepth(7); // Nổi trên mặt biển, nằm dưới máy bay
    }

    /**
     * Kiểm tra va chạm giữa điểm (x, y) với vật cản
     */
    containsPoint(x, y, extraMargin = 0) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, x, y);
        return dist <= (this.radius + extraMargin);
    }
}
