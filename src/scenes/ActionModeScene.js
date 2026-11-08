/**
 * ActionModeScene.js - Chế Độ Hành Động Cổ Điển (Action WASD Mode)
 * 
 * Đặc trưng cơ chế:
 * 1. Tàu Mẹ: Soái Hạm Citadel (CVN-78) - Điều khiển trực tiếp bằng phím [W][A][S][D] hoặc mũi tên.
 * 2. Tự do cơ động, bẻ lái né đạn, xả pháo và phóng tên lửa Tomahawk tầm xa.
 * 3. Camera bám sát theo chuyển động của soái hạm.
 * 4. Hỗ trợ triệu hồi các phi đội tiêm kích và tàu hộ tống yểm trợ trực tiếp.
 */

import { BattleScene } from './BattleScene.js';
import { ShipConfig } from '../config/ShipConfig.js';

export class ActionModeScene extends BattleScene {
    constructor() {
        super({ key: 'ActionModeScene' });
    }

    init(data) {
        // Thiết lập chế độ Hành động tự do lái WASD
        this.gameMode = 'action';
        this.isActionMode = true;
        this.isCampaignMode = false;
        if (data && data.selectedStage) {
            this.registry.set('selectedStage', data.selectedStage);
        }
    }

    create() {
        // Kích hoạt cờ chế độ hành động
        this.gameMode = 'action';
        this.isActionMode = true;
        this.isCampaignMode = false;

        // Khởi tạo toàn bộ thực thể chiến trường
        super.create();
    }

    /**
     * Khởi tạo Tàu sân bay CVN-78 tự do di chuyển bằng phím WASD
     */
    initPlayerMotherShip(worldH) {
        const playerStartX = 450;
        const playerStartY = worldH / 2;

        // Sử dụng cấu hình CVN-78 tự do di chuyển
        const motherShipConfig = ShipConfig.player;
        this.playerShip = new (this.getPlayerShipClass())(this, playerStartX, playerStartY, motherShipConfig);

        // Mặc định tàu xoay ngang (90 độ) hướng về phía trước
        this.playerShip.setAngle(90);

        // Camera bám sát soái hạm
        this.cameras.main.startFollow(this.playerShip, true, 0.08, 0.08);
        this.isCameraFree = false;
    }
}
