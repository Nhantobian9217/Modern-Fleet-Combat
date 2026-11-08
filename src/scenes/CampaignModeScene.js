/**
 * CampaignModeScene.js - Chế Độ Chiến Dịch Cốt Truyện (Campaign RTS Mode)
 * 
 * Đặc trưng cơ chế:
 * 1. Tàu Mẹ: Soái Hạm Citadel - Căn cứ pháo đài thân kép cố định, ĐỨNG YÊN HOÀN TOÀN, không di chuyển WASD.
 * 2. Điều phối hạm đội RTS: Mua tàu con, click chọn tàu con và click bản đồ (Click-to-Move) để tạo phòng tuyến đa tầng.
 * 3. Địch di chuyển theo Checkpoint / Waypoints có sẵn, dừng lại nghênh chiến khi phát hiện tàu đồng minh cản đường.
 * 4. Tự động thoát chọn sau khi đặt lệnh di chuyển và phát âm thanh Destination Ack.
 */

import { BattleScene } from './BattleScene.js';
import { ShipConfig } from '../config/ShipConfig.js';
import { GameConfig } from '../config/GameConfig.js';
import { SoundManager } from '../managers/SoundManager.js';

export class CampaignModeScene extends BattleScene {
    constructor() {
        super({ key: 'CampaignModeScene' });
    }

    init(data) {
        // Thiết lập chế độ Chiến dịch cốt truyện
        this.gameMode = 'campaign';
        this.isCampaignMode = true;
        this.isActionMode = false;
        if (data && data.selectedStage) {
            this.registry.set('selectedStage', data.selectedStage);
        }
    }

    create() {
        // Đảm bảo cờ chế độ chiến dịch được kích hoạt
        this.gameMode = 'campaign';
        this.isCampaignMode = true;
        this.isActionMode = false;

        // Gọi hàm khởi tạo chiến trường chuẩn từ BattleScene
        super.create();
    }

    /**
     * Khởi tạo Soái Hạm Citadel làm căn cứ phòng thủ cố định
     */
    initPlayerMotherShip(worldH) {
        const playerStartX = 450;
        const playerStartY = worldH / 2;

        // Sử dụng cấu hình Căn cứ pháo đài Citadel (đứng yên hoàn toàn)
        const motherShipConfig = ShipConfig.campaign_fortress;
        this.playerShip = new (this.getPlayerShipClass())(this, playerStartX, playerStartY, motherShipConfig);
        
        // Soái hạm Citadel xoay ngang (90 độ) hướng về phía Đông
        this.playerShip.setAngle(90);

        // Mặc định camera bao quát theo tàu mẹ
        this.cameras.main.startFollow(this.playerShip, true, 0.08, 0.08);
        this.isCameraFree = false;
    }

    /**
     * Sinh lộ trình Checkpoint đa luồng cho các đợt địch tiến vào
     * Luồng trên (Top Lane), Luồng giữa (Mid Lane), Luồng dưới (Bottom Lane)
     */
    generateEnemyWaypoints(posX, posY, laneIndex) {
        const fortX = (this.playerShip && this.playerShip.x) || 450;
        const fortY = (this.playerShip && this.playerShip.y) || (GameConfig.worldHeight / 2);

        const lane = laneIndex % 3; // 0: Top, 1: Mid, 2: Bottom
        const midY = (lane === 0) ? (fortY - 360) : ((lane === 2) ? (fortY + 360) : fortY);

        return [
            { x: posX - 500, y: midY },
            { x: fortX + 450, y: midY },
            { x: fortX + 180, y: fortY },
            { x: fortX, y: fortY }
        ];
    }
}
