/**
 * HealthBar.js - Thanh hiển thị lượng máu động (HP Bar)
 * 
 * Tự động gắn lên đầu chiến hạm, hiển thị thanh máu với màu sắc thay đổi:
 * - Xanh lá (> 50% HP)
 * - Vàng (20% - 50% HP)
 * - Đỏ (< 20% HP)
 */

export class HealthBar {
    constructor(scene, target, width = 64, height = 7, offsetY = -45) {
        this.scene = scene;
        this.target = target;
        this.width = width;
        this.height = height;
        this.offsetY = offsetY;

        // Container đồ họa cho thanh máu
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(20); // Đảm bảo luôn nổi trên thân tàu và mặt biển

        this.currentHp = target.hp;
        this.maxHp = target.maxHp;

        this.draw();
    }

    /**
     * Cập nhật lượng HP mới và vẽ lại thanh máu
     */
    setHp(newHp) {
        this.currentHp = Math.max(0, Math.min(newHp, this.maxHp));
        this.draw();
    }

    /**
     * Đồng bộ vị trí thanh máu theo tọa độ của tàu
     */
    update() {
        if (!this.target || !this.target.active) {
            this.destroy();
            return;
        }
        this.draw();
    }

    /**
     * Vẽ lại khung viền và phần trăm máu
     */
    draw() {
        if (!this.target || !this.graphics) return;

        this.graphics.clear();

        const x = this.target.x - this.width / 2;
        const y = this.target.y + this.offsetY;

        // 1. Nền tối phía sau
        this.graphics.fillStyle(0x0a101d, 0.85);
        this.graphics.fillRoundedRect(x - 1, y - 1, this.width + 2, this.height + 2, 2);

        // 2. Viền ngoài thanh máu
        this.graphics.lineStyle(1, 0x415b76, 0.9);
        this.graphics.strokeRoundedRect(x - 1, y - 1, this.width + 2, this.height + 2, 2);

        // 3. Tính toán màu sắc dựa trên % HP còn lại
        const percent = Math.max(0, this.currentHp / this.maxHp);
        const fillWidth = Math.floor(this.width * percent);

        if (fillWidth > 0) {
            let fillColor = 0x2ecc71; // Xanh lá mặc định
            if (percent <= 0.25) {
                fillColor = 0xe74c3c; // Đỏ cảnh báo nguy cấp
            } else if (percent <= 0.55) {
                fillColor = 0xf39c12; // Vàng chú ý
            }

            this.graphics.fillStyle(fillColor, 1);
            this.graphics.fillRoundedRect(x, y, fillWidth, this.height, 1);
        }
    }

    /**
     * Xóa đồ họa khi tàu bị phá hủy
     */
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
    }
}
