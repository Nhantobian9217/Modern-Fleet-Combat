/**
 * main.js - Điểm khởi động chính của trò chơi (Game Entry Point)
 * 
 * Khởi tạo cá thể Phaser.Game và liên kết toàn bộ các Scene:
 * 1. BootScene: Nạp tài nguyên và tạo Texture đồ họa
 * 2. MenuScene: Giao diện Menu chính
 * 3. StageMapScene: Hải đồ chiến dịch chọn màn
 * 4. BattleScene: Chiến trường hải chiến Top-down
 * 5. UIScene: Lớp giao diện HUD và thông báo Thắng/Thua
 */

import { GameConfig } from './config/GameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { StageMapScene } from './scenes/StageMapScene.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import { CampaignModeScene } from './scenes/CampaignModeScene.js';
import { ActionModeScene } from './scenes/ActionModeScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { UIScene } from './scenes/UIScene.js';
import { FleetManageScene } from './scenes/FleetManageScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { SoundManager } from './managers/SoundManager.js';

const config = {
    type: Phaser.AUTO,
    width: GameConfig.width,
    height: GameConfig.height,
    parent: 'game-container',
    backgroundColor: '#071526',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: GameConfig.physics,
    scene: [
        BootScene,
        TitleScene,
        MainMenuScene,
        MenuScene,
        StageMapScene,
        UpgradeScene,
        FleetManageScene,
        ShopScene,
        CampaignModeScene,
        ActionModeScene,
        BattleScene,
        UIScene
    ]
};

// Khởi tạo Game
window.addEventListener('load', () => {
    window.game = new Phaser.Game(config);
    SoundManager.setGame(window.game);
});
