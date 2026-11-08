/**
 * BattleScene.js - Chiến trường Hải chiến Top-down Toàn diện (Bản Nâng Cấp Lớn)
 * 
 * Tính năng Mới:
 * 1. Bản đồ mở rộng 3200 x 2200 px & Camera thu phóng (Zoom in/out bằng con lăn chuột hoặc phím Z/X)
 * 2. Hệ thống Thời tiết động ngẫu nhiên: Trời quang, Bão tố sấm sét, Sương mù dày đặc, Sóng lớn
 * 3. Chế độ Đợt (Waves) với 20s Chuẩn bị giữa các đợt (có nút Skip xuất chiến ngay)
 * 4. Hệ thống Kỹ năng Chỉ huy Chủ động (Commander Skills) [Phím F]
 * 5. Chế độ Sinh tồn Vô tận (Endless Survival Mode) lưu kỷ lục vào SaveManager
 * 6. Giới hạn tối đa 10 tiêm kích F-35C trên tàu sân bay mẹ
 * 7. Tối ưu hiệu năng, triệt tiêu giật lag khi nhiều tàu cùng giao chiến
 */

import { GameConfig } from '../config/GameConfig.js';
import { ShipConfig } from '../config/ShipConfig.js';
import { StageConfig, generateEndlessWave } from '../config/StageConfig.js';
import { PlayerShip } from '../entities/PlayerShip.js';
import { EnemyShip } from '../entities/EnemyShip.js';
import { AllyShip } from '../entities/AllyShip.js';
import { FighterJet } from '../entities/FighterJet.js';
import { Obstacle } from '../entities/Obstacle.js';
import { SaveManager } from '../managers/SaveManager.js';
import { SoundManager } from '../managers/SoundManager.js';

export class BattleScene extends Phaser.Scene {
    constructor(config = { key: 'BattleScene' }) {
        super(config);
    }

    create() {
        SoundManager.ensureContext();

        this.score = 0;
        this.isGameOver = false;

        // 1. CHẾ ĐỘ CHƠI: CHIẾN DỊCH HOẶC SINH TỒN VÔ TẬN HOẶC HÀNH ĐỘNG
        this.gameMode = this.registry.get('gameMode') || 'campaign';
        this.isActionMode = (this.gameMode === 'action');
        this.isCampaignMode = (this.gameMode === 'campaign' && !this.registry.get('isEndlessMode'));
        this.isEndlessMode = this.registry.get('isEndlessMode') || false;
        this.currentStageId = this.registry.get('selectedStage') || 1;

        // ĐỌC CẤU HÌNH ĐÔ ĐỐC & ĐỘI HÌNH TỪ SAVEMANAGER
        const admiralId = SaveManager.getSelectedAdmiral ? SaveManager.getSelectedAdmiral() : 'duxe';
        this.admiralConfig = (GameConfig.admirals && GameConfig.admirals[admiralId]) || GameConfig.admirals.duxe;

        const formationId = SaveManager.getSelectedFormation ? SaveManager.getSelectedFormation() : 'LINE';
        this.formationConfig = (GameConfig.formations && GameConfig.formations[formationId]) || GameConfig.formations.LINE;

        if (this.isEndlessMode) {
            this.currentWaveIndex = 1;
            this.totalWaves = 999;
            this.stageData = {
                id: 999,
                name: 'CHẾ ĐỘ SINH TỒN VÔ TẬN',
                subName: 'Endless Survival Maelstrom',
                tokensReward: 0,
                startingCreditsBonus: 1000
            };
        } else {
            this.currentWaveIndex = 1;
            this.stageData = StageConfig.find(s => s.id === this.currentStageId) || StageConfig[0];
            this.totalWaves = (this.stageData.waves && this.stageData.waves.length) || 1;
        }

        // BẮT ĐẦU NHẠC CHIẾN TRẬN PHÙ HỢP THEO MÀN
        SoundManager.playBattleBGM(this.currentStageId, this.isEndlessMode, false);

        this.credits = (GameConfig.startingCredits || 1500) + (this.stageData.startingCreditsBonus || 0);

        // 2. KHỞI TẠO THỜI TIẾT ĐỘNG (DYNAMIC WEATHER)
        this.initWeatherSystem();

        // 3. THIẾT LẬP BẢN ĐỒ & CAMERA THU PHÓNG (3200 x 2200)
        const worldW = GameConfig.worldWidth;
        const worldH = GameConfig.worldHeight;
        this.physics.world.setBounds(0, 0, worldW, worldH);

        this.oceanBg = this.add.tileSprite(worldW / 2, worldH / 2, worldW, worldH, 'ocean_tile');
        this.oceanBg.setDepth(1);

        this.currentZoom = GameConfig.camera.defaultZoom;
        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setZoom(this.currentZoom);

        // 4. BỐ TRÍ ĐỊA HÌNH
        this.obstacles = [];
        this.spawnStageObstacles();

        // 5. CÁC NHÓM THỰC THỂ
        this.playerProjectiles = this.physics.add.group();
        this.enemyProjectiles = this.physics.add.group();
        this.allyFleet = [];
        this.aircraftSquadron = [];
        this.enemyFleet = [];
        this.enemyAircraft = [];

        // 6. KHỞI TẠO SOÁI HẠM / PHÁO ĐÀI CĂN CỨ HẢI QUÂN
        this.initPlayerMotherShip(worldH);

        // Quản lý đơn vị Đồng minh được chọn để ra lệnh (RTS Selection)
        this.selectedAlly = null;

        // Áp dụng buff Đô đốc và Đội hình cho Soái hạm
        if (this.admiralConfig.radarBuff) {
            this.playerShip.baseRadarRadius = Math.round(this.playerShip.baseRadarRadius * this.admiralConfig.radarBuff);
            this.playerShip.radarRadius = this.playerShip.baseRadarRadius;
        }
        if (this.formationConfig.speedBuff) {
            this.playerShip.baseSpeed *= this.formationConfig.speedBuff;
            this.playerShip.speed = this.playerShip.baseSpeed;
        }

        // KHỞI TẠO MỤC TIÊU PHỤ / NHIỆM VỤ CHIẾN THUẬT (MÀN 3 TRỞ ĐI)
        this.initSideMission();

        // 7. GIAI ĐOẠN CHUẨN BỊ 20 GIÂY ĐẦU TRẬN / GIỮA CÁC ĐỢT
        this.isPreparing = true;
        this.prepTimeRemaining = GameConfig.interWavePrepTime || 20000;
        this.isBriefingActive = false; // Chặn đếm giờ và xuất trận khi đang đọc briefing

        // KHỞI TẠO 3 TIÊM KÍCH BAN ĐẦU ĐỖ TRÊN BOONG TÀU SÂN BAY
        const equippedJetKey = SaveManager.getEquippedSlot('slot4') || 'fighter_f35c';
        const initialJetConfig = ShipConfig.aircraft[equippedJetKey] || ShipConfig.aircraft.fighter_jet;
        for (let i = 0; i < 3; i++) {
            const starterJet = new FighterJet(this, this.playerShip, initialJetConfig, i);
            this.aircraftSquadron.push(starterJet);
        }

        // 8. THEO DÕI COOLDOWN TRIỆU HỒI & KỸ NĂNG CHỈ HUY
        this.summonCooldowns = {
            jet: { duration: 6000, lastTime: -99999 },
            frigate: { duration: 12000, lastTime: -99999 },
            destroyer: { duration: 18000, lastTime: -99999 },
            cruiser: { duration: 25000, lastTime: -99999 },
            battleship: { duration: 35000, lastTime: -99999 },
            carrier: { duration: 40000, lastTime: -99999 },
            repair: { duration: 15000, lastTime: -99999 }
        };

        this.initCommanderSkill();

        // 9. CÀI ĐẶT BÀN PHÍM, PHÍM TẮT & CON LĂN CHUỘT THU PHÓNG
        this.setupInputControls();

        // 10. KHỞI CHẠY GIAO DIỆN CHỈ HUY (UIScene)
        this.scene.launch('UIScene');

        this.time.delayedCall(150, () => {
            this.events.emit('updatePlayerHp', this.playerShip.hp, this.playerShip.maxHp);
            this.events.emit('updateCredits', this.credits);
            this.events.emit('updateStageInfo', {
                stageData: this.stageData,
                currentWave: this.currentWaveIndex,
                totalWaves: this.totalWaves,
                weather: this.currentWeather,
                isEndless: this.isEndlessMode,
                admiral: this.admiralConfig,
                formation: this.formationConfig
            });
            this.events.emit('updateFleetStatus', this.enemyFleet.length, this.score);
            this.events.emit('updatePrepTimer', Math.ceil(this.prepTimeRemaining / 1000));
            this.events.emit('updateAircraftCount', this.aircraftSquadron.length, GameConfig.maxCarrierAircraft);
            this.events.emit('updateFleetCount', 0, 5 + (this.currentStageId || 1));

            if (this.currentSideMission) {
                this.events.emit('updateMissionStatus', this.currentSideMission);
            }
        });
    }

    getPlayerShipClass() {
        return PlayerShip;
    }

    initPlayerMotherShip(worldH) {
        const playerStartX = 450;
        const playerStartY = worldH / 2;

        const motherShipConfig = (this.isCampaignMode) ? ShipConfig.campaign_fortress : ShipConfig.player;
        this.playerShip = new PlayerShip(this, playerStartX, playerStartY, motherShipConfig);

        // Soái hạm Citadel và CVN-78 mặc định xoay ngang 90 độ hướng về phía Đông
        this.playerShip.setAngle(90);

        this.cameras.main.startFollow(this.playerShip, true, 0.08, 0.08);
        this.isCameraFree = false;
    }

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

    initWeatherSystem() {
        const weatherKeys = Object.keys(GameConfig.weatherTypes);
        let chosenKey = 'CLEAR';

        if (this.stageData.weather) {
            chosenKey = this.stageData.weather;
        } else {
            chosenKey = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
        }

        this.currentWeather = GameConfig.weatherTypes[chosenKey] || GameConfig.weatherTypes.CLEAR;

        // Hiệu ứng mưa bão nếu là STORM
        if (this.currentWeather.id === 'STORM') {
            this.rainParticles = [];
            for (let i = 0; i < 120; i++) {
                const rx = Math.random() * GameConfig.worldWidth;
                const ry = Math.random() * GameConfig.worldHeight;
                const drop = this.add.sprite(rx, ry, 'rain_drop');
                drop.setDepth(35);
                drop.setAlpha(0.6);
                this.rainParticles.push(drop);
            }

            // Sấm sét ngẫu nhiên
            this.time.addEvent({
                delay: 7000,
                loop: true,
                callback: () => {
                    if (Math.random() < 0.6) {
                        this.cameras.main.flash(200, 255, 255, 255, 0.4);
                        SoundManager.playThunder();
                    }
                }
            });
        }

        // Hiệu ứng sương mù nếu là HEAVY_FOG
        if (this.currentWeather.id === 'HEAVY_FOG') {
            this.fogParticles = [];
            for (let i = 0; i < 40; i++) {
                const fx = Math.random() * GameConfig.worldWidth;
                const fy = Math.random() * GameConfig.worldHeight;
                const fog = this.add.sprite(fx, fy, 'fog_cloud');
                fog.setScale(2.5);
                fog.setDepth(32);
                fog.setAlpha(0.35);
                this.fogParticles.push(fog);
            }
        }
    }

    spawnStageObstacles() {
        const obsList = this.stageData.obstacles || [
            { type: 'oil_rig', x: 1600, y: 920, radius: 60 },
            { type: 'island_large', x: 1950, y: 460, radius: 90 },
            { type: 'island_small', x: 1750, y: 1740, radius: 55 }
        ];

        obsList.forEach(data => {
            // Đảm bảo tuyệt đối: Vật cản không xuất hiện gần tàu mẹ (cách xa ít nhất 1350px)
            // và không được chắn ngang 3 làn đường (Lanes: 740, 1100, 1460) của tàu con và tàu địch
            let posX = Math.max(1350, data.x);
            let posY = data.y;

            const forbiddenLanes = [740, 1100, 1460];
            for (const ly of forbiddenLanes) {
                if (Math.abs(posY - ly) < (data.radius + 85)) {
                    if (ly === 1100) {
                        posY = (posY < 1100) ? 920 : 1280;
                    } else if (ly === 740) {
                        posY = (posY < 740) ? 460 : 920;
                    } else if (ly === 1460) {
                        posY = (posY < 1460) ? 1280 : 1740;
                    }
                }
            }

            const obs = new Obstacle(this, posX, posY, data.type, data.radius);
            this.obstacles.push(obs);
        });
    }

    initSideMission() {
        this.currentSideMission = null;
        if (this.currentStageId < 3 && !this.isEndlessMode) return;

        const missions = [
            {
                type: 'destroy_enemies',
                title: 'Nhiệm vụ: Tiêu diệt 6 Chiến hạm Địch',
                target: 6,
                current: 0,
                reward: 600,
                completed: false
            },
            {
                type: 'protect_carrier',
                title: 'Nhiệm vụ: Giữ HP Tàu Mẹ trên 70%',
                reward: 800,
                completed: false
            },
            {
                type: 'air_strike',
                title: 'Nhiệm vụ: Điều động 2 Phi đội Tiêm kích',
                target: 2,
                current: 0,
                reward: 500,
                completed: false
            }
        ];

        this.currentSideMission = missions[Math.floor(Math.random() * missions.length)];
    }

    completeSideMission() {
        if (!this.currentSideMission || this.currentSideMission.completed) return;
        this.currentSideMission.completed = true;
        this.credits += this.currentSideMission.reward;
        this.events.emit('updateCredits', this.credits);
        this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 110, `★ HOÀN THÀNH NHIỆM VỤ PHỤ: +$${this.currentSideMission.reward}!`, 0xf1c40f);
        this.events.emit('updateMissionStatus', this.currentSideMission);
    }

    initCommanderSkill() {
        const skillId = SaveManager.getSelectedSkill();
        this.commanderSkill = GameConfig.commanderSkills[skillId] || GameConfig.commanderSkills.AIR_SUPERIORITY;
        this.lastSkillTime = -99999;
        this.isOverdriveActive = false;
    }

    setupInputControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
            Q: Phaser.Input.Keyboard.KeyCodes.Q, // Tiêm Kích Hạm (Tàu Mẹ)
            ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
            TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
            THREE: Phaser.Input.Keyboard.KeyCodes.THREE,
            FOUR: Phaser.Input.Keyboard.KeyCodes.FOUR,
            FIVE: Phaser.Input.Keyboard.KeyCodes.FIVE,
            SIX: Phaser.Input.Keyboard.KeyCodes.SIX,
            E: Phaser.Input.Keyboard.KeyCodes.E, // Tomahawk
            F: Phaser.Input.Keyboard.KeyCodes.F, // Commander Skill
            Z: Phaser.Input.Keyboard.KeyCodes.Z, // Zoom In
            X: Phaser.Input.Keyboard.KeyCodes.X  // Zoom Out
        });

        // Con lăn chuột thu phóng Camera mượt mà
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (deltaY > 0) {
                this.adjustCameraZoom(-0.08); // Zoom out
            } else if (deltaY < 0) {
                this.adjustCameraZoom(0.08);  // Zoom in
            }
        });

        // KÉO THẢ CAMERA TỰ DO BẰNG CHUỘT & ĐIỀU QUÂN RTS (CLICK TO MOVE)
        this.input.on('pointerdown', (pointer) => {
            // Nhấn chuột phải hoặc chuột giữa hoặc nhấn giữ để kéo tự do
            if (pointer.rightButtonDown() || pointer.middleButtonDown() || (pointer.isDown && pointer.event && pointer.event.shiftKey)) {
                this.cameras.main.stopFollow();
                this.isCameraFree = true;
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
                this.camStartX = this.cameras.main.scrollX;
                this.camStartY = this.cameras.main.scrollY;
            } else if (pointer.leftButtonDown()) {
                // Click chuột trái điều quân nếu đã chọn một tàu đồng minh
                if (this.selectedAlly && this.selectedAlly.active) {
                    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
                    let clickedOnShip = false;
                    for (let i = 0; i < this.allyFleet.length; i++) {
                        const a = this.allyFleet[i];
                        if (a && a.active && Phaser.Math.Distance.Between(a.x, a.y, worldPoint.x, worldPoint.y) < 40) {
                            clickedOnShip = true;
                            break;
                        }
                    }
                    if (!clickedOnShip) {
                        this.selectedAlly.setMoveTarget(worldPoint.x, worldPoint.y);
                        this.createMoveOrderMarker(worldPoint.x, worldPoint.y);
                        SoundManager.playDestinationAck();
                        // Tự động thoát select tàu đó sau khi chọn vị trí thành công
                        this.selectAllyShip(null);
                    }
                }
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isCameraFree && pointer.isDown && (pointer.rightButtonDown() || pointer.middleButtonDown() || (pointer.event && pointer.event.shiftKey))) {
                const z = this.cameras.main.zoom;
                const dx = (pointer.x - this.dragStartX) / z;
                const dy = (pointer.y - this.dragStartY) / z;
                this.cameras.main.scrollX = this.camStartX - dx;
                this.cameras.main.scrollY = this.camStartY - dy;
            }
        });

        // Bấm phím C hoặc Space để đưa Camera quay lại bám theo tàu mẹ
        this.input.keyboard.on('keydown-C', () => {
            this.cameras.main.startFollow(this.playerShip, true, 0.08, 0.08);
            this.isCameraFree = false;
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 70, '📷 CAMERA: ĐÃ KHÓA THEO TÀU SÂN BAY MẸ [C]', 0x00d2ff);
        });
    }

    selectAllyShip(ally) {
        if (this.selectedAlly && this.selectedAlly.active) {
            this.selectedAlly.setSelected(false);
        }
        this.selectedAlly = ally;
        if (this.selectedAlly) {
            this.selectedAlly.setSelected(true);
            this.showFloatingMessage(this.selectedAlly.x, this.selectedAlly.y - 50, `CHỈ HUY: ${this.selectedAlly.config.name.toUpperCase()}`, 0x00f2fe);
        }
    }

    createMoveOrderMarker(x, y) {
        const marker = this.add.graphics();
        marker.lineStyle(2, 0x00f2fe, 0.9);
        marker.strokeCircle(x, y, 16);
        marker.lineStyle(1.5, 0x38ef7d, 0.8);
        marker.strokeCircle(x, y, 8);
        marker.setDepth(15);

        this.tweens.add({
            targets: marker,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => marker.destroy()
        });
    }

    adjustCameraZoom(deltaZoom) {
        const minZ = GameConfig.camera.minZoom;
        const maxZ = GameConfig.camera.maxZoom;
        this.currentZoom = Phaser.Math.Clamp(this.currentZoom + deltaZoom, minZ, maxZ);
        this.cameras.main.setZoom(this.currentZoom);
        this.events.emit('updateZoomLevel', this.currentZoom);
    }

    /**
     * Xuất kích đợt kẻ địch hiện tại
     */
    startCurrentWaveEnemies() {
        if (!this.isPreparing) return;
        this.isPreparing = false;

        const worldH = GameConfig.worldHeight;
        // Tàu địch xuất kích từ ngoài màn hình bên phải (GameConfig.worldWidth + 150)
        const enemyStartX = GameConfig.worldWidth + 150;

        let waveFleet = [];
        if (this.isEndlessMode) {
            const endData = generateEndlessWave(this.currentWaveIndex);
            waveFleet = endData.fleet;
        } else {
            const waveIdx = Math.min(this.stageData.waves.length - 1, this.currentWaveIndex - 1);
            waveFleet = this.stageData.waves[waveIdx] || [];
        }

        this.pendingSpawnsCount = waveFleet.length;

        waveFleet.forEach((item, index) => {
            // Tàu địch ra theo kiểu nối đuôi nhau: mỗi tàu xuất hiện cách nhau 750ms
            const spawnDelay = index * 750;

            this.time.delayedCall(spawnDelay, () => {
                if (this.isGameOver) {
                    this.pendingSpawnsCount = Math.max(0, this.pendingSpawnsCount - 1);
                    return;
                }

                const config = ShipConfig.enemies[item.type];
                if (config) {
                    const posX = enemyStartX + (item.offsetX || 0);
                    const posY = worldH / 2 + (item.offsetY || 0);
                    const enemy = new EnemyShip(this, posX, posY, item.type, config);

                    if (this.isCampaignMode) {
                        // Tính làn đường (Lane 0: Top, Lane 1: Mid, Lane 2: Bottom) dựa theo offsetY
                        let lane = 1;
                        if (item.offsetY < -120) lane = 0;
                        else if (item.offsetY > 120) lane = 2;
                        enemy.waypoints = this.generateEnemyWaypoints(posX, posY, lane);
                        enemy.currentWaypointIndex = 0;
                    }

                    this.enemyFleet.push(enemy);

                    // Kích hoạt nhạc Boss nếu là KRAKEN, KRAKEN TITAN hoặc Màn 5 / Màn 8
                    if (item.type === 'kraken' || item.type === 'dreadnought_boss' || item.type === 'super_boss_titan' || this.currentStageId === 5 || this.currentStageId === 8) {
                        SoundManager.playBattleBGM(this.currentStageId, this.isEndlessMode, true);
                    }
                }

                this.pendingSpawnsCount = Math.max(0, this.pendingSpawnsCount - 1);
                const activeCount = this.enemyFleet.filter(e => e.active && e.hp > 0).length + this.pendingSpawnsCount;
                this.events.emit('updateFleetStatus', activeCount, this.score);
            });
        });

        this.events.emit('updatePrepTimer', 0);
        this.events.emit('updateFleetStatus', waveFleet.length, this.score);

        this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 95, `⚠ BÁO ĐỘNG: ĐỢT ${this.currentWaveIndex} ĐANG NỐI ĐUÔI TIẾN VÀO!`, 0xff4757);
        this.cameras.main.flash(300, 255, 0, 0, 0.2);
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Nếu bảng điều lệnh briefing đang mở, tạm dừng đếm ngược và di chuyển
        if (this.isBriefingActive) return;

        // --- 1. ĐẾM NGƯỢC 20S CHUẨN BỊ GIỮA CÁC ĐỢT ---
        if (this.isPreparing) {
            this.prepTimeRemaining -= delta;
            this.events.emit('updatePrepTimer', Math.max(0, Math.ceil(this.prepTimeRemaining / 1000)));

            if (this.prepTimeRemaining <= 0) {
                this.startCurrentWaveEnemies();
            }
        }

        // --- 2. XỬ LÝ PHÍM TẮT & THU PHÓNG ---
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.Q)) this.summonAircraft();
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.ONE)) this.summonAlly('frigate');
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.TWO)) this.summonAlly('destroyer');
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.THREE)) this.summonAlly('cruiser');
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.FOUR)) this.summonAlly('battleship');
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.FIVE)) this.summonAlly('carrier');
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.SIX)) this.repairCarrier();
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.E)) this.launchPlayerTomahawk();
        if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.F)) this.triggerCommanderSkill();

        if (this.wasdKeys.Z.isDown) this.adjustCameraZoom(0.01);
        if (this.wasdKeys.X.isDown) this.adjustCameraZoom(-0.01);

        // Đồng bộ trạng thái hồi chiêu sang UIScene
        this.emitCooldownStatuses(time);

        // --- 3. CẬP NHẬT TÀU SÂN BAY MẸ ---
        if (this.playerShip && this.playerShip.active) {
            this.playerShip.update(time, delta, this.cursors, this.wasdKeys, this.input.activePointer);
            this.resolveShipObstacleCollisions(this.playerShip, 55);
        }

        // --- 4. CẬP NHẬT TIÊM KÍCH & TÀU HỘ TỐNG ---
        for (let i = this.aircraftSquadron.length - 1; i >= 0; i--) {
            const jet = this.aircraftSquadron[i];
            if (jet && jet.active) {
                jet.update(time, delta);
            } else {
                this.aircraftSquadron.splice(i, 1);
                const mJets = this.aircraftSquadron.filter(j => j && j.active && j.carrier === this.playerShip);
                this.events.emit('updateAircraftCount', mJets.length, GameConfig.maxCarrierAircraft || 12);
            }
        }

        for (let i = this.allyFleet.length - 1; i >= 0; i--) {
            const ally = this.allyFleet[i];
            if (ally && ally.active) {
                ally.update(time, delta);
                this.resolveShipObstacleCollisions(ally, 36);
            } else {
                this.allyFleet.splice(i, 1);
                const maxFleetLimit = 5 + (this.currentStageId || 1);
                this.events.emit('updateFleetCount', this.allyFleet.filter(a => a && a.active && a.hp > 0).length, maxFleetLimit);
            }
        }

        // --- 5. CẬP NHẬT TÀU ĐỊCH & KHÔNG QUÂN ĐỊCH ---
        for (let i = this.enemyFleet.length - 1; i >= 0; i--) {
            const enemy = this.enemyFleet[i];
            if (enemy && enemy.active) {
                enemy.update(time, delta);
                this.resolveShipObstacleCollisions(enemy, 36);
            } else {
                this.enemyFleet.splice(i, 1);
            }
        }

        if (this.enemyAircraft) {
            for (let i = this.enemyAircraft.length - 1; i >= 0; i--) {
                const eJet = this.enemyAircraft[i];
                if (eJet && eJet.active && eJet.hp > 0) {
                    eJet.update(time, delta);
                } else {
                    if (eJet && eJet.destroyPlane) eJet.destroyPlane();
                    this.enemyAircraft.splice(i, 1);
                }
            }
        }

        // --- 5.1. XỬ LÝ VA CHẠM VẬT LÝ GIỮA CÁC CHIẾN HẠM (SHIP-TO-SHIP REPULSION) ---
        this.resolveShipToShipCollisions();

        // --- 6. CẬP NHẬT ĐẠN PHÁO & TÊN LỬA TOMAHAWK ---
        this.updateProjectiles(this.playerProjectiles, delta);
        this.updateProjectiles(this.enemyProjectiles, delta);

        // --- 7. KIỂM TRA VA CHẠM ĐẠN ---
        this.checkBulletCollisions();

        // --- 8. CẬP NHẬT HẠT MƯA RƠI ---
        if (this.rainParticles) {
            this.rainParticles.forEach(drop => {
                drop.y += 18;
                drop.x += 4;
                if (drop.y > GameConfig.worldHeight) {
                    drop.y = 0;
                    drop.x = Math.random() * GameConfig.worldWidth;
                }
            });
        }
    }

    emitCooldownStatuses(time) {
        const statuses = {};
        Object.keys(this.summonCooldowns).forEach(key => {
            const cd = this.summonCooldowns[key];
            const elapsed = time - cd.lastTime;
            const remaining = this.isOverdriveActive ? 0 : Math.max(0, cd.duration - elapsed);
            statuses[key] = {
                ready: remaining <= 0,
                remainingSec: Math.ceil(remaining / 1000)
            };
        });

        if (this.playerShip) {
            const elapsedM = time - this.playerShip.lastMissileTime;
            const remM = Math.max(0, this.playerShip.missileCooldown - elapsedM);
            statuses.tomahawk = {
                ready: remM <= 0,
                remainingSec: Math.ceil(remM / 1000)
            };
        }

        // Cooldown Kỹ năng chỉ huy
        const skillElapsed = time - this.lastSkillTime;
        const skillRem = Math.max(0, this.commanderSkill.cooldown - skillElapsed);
        statuses.commanderSkill = {
            ready: skillRem <= 0,
            remainingSec: Math.ceil(skillRem / 1000),
            skill: this.commanderSkill
        };

        this.events.emit('updateCooldowns', statuses);

        // Emit riêng để cập nhật nút Kỹ năng Chỉ huy trong UIScene
        this.events.emit('updateCommanderSkillCooldown', skillRem, this.commanderSkill.cooldown);
    }

    updateProjectiles(group, delta) {
        const bullets = group.getChildren();
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (b && b.active) {
                b.advanceMovement(delta);
            }
        }
    }

    resolveShipObstacleCollisions(ship, shipRadius) {
        if (!ship || !ship.body) return;

        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            const dist = Phaser.Math.Distance.Between(ship.x, ship.y, obs.x, obs.y);
            const minDist = obs.radius + shipRadius;

            if (dist < minDist && dist > 0) {
                const pushAngle = Phaser.Math.Angle.Between(obs.x, obs.y, ship.x, ship.y);
                const pushDist = minDist - dist;
                ship.x += Math.cos(pushAngle) * pushDist;
                ship.y += Math.sin(pushAngle) * pushDist;
                ship.body.setVelocity(ship.body.velocity.x * 0.4, ship.body.velocity.y * 0.4);
            }
        }
    }

    /**
     * Chống xuyên thấu giữa các chiến hạm (Ship-to-ship repulsion)
     */
    resolveShipToShipCollisions() {
        const ships = [];
        if (this.playerShip && this.playerShip.active && this.playerShip.hp > 0) {
            ships.push({ obj: this.playerShip, radius: 52, isCarrier: true });
        }
        this.allyFleet.forEach(a => {
            if (a && a.active && a.hp > 0) {
                ships.push({ obj: a, radius: 34, isCarrier: false });
            }
        });
        this.enemyFleet.forEach(e => {
            if (e && e.active && e.hp > 0) {
                const isKraken = (e.shipType === 'kraken');
                ships.push({ obj: e, radius: isKraken ? 75 : 36, isCarrier: isKraken });
            }
        });

        for (let i = 0; i < ships.length; i++) {
            for (let j = i + 1; j < ships.length; j++) {
                const s1 = ships[i];
                const s2 = ships[j];
                const dist = Phaser.Math.Distance.Between(s1.obj.x, s1.obj.y, s2.obj.x, s2.obj.y);
                const minDist = s1.radius + s2.radius;

                if (dist < minDist && dist > 0.1) {
                    const overlap = minDist - dist;
                    const angle = Phaser.Math.Angle.Between(s1.obj.x, s1.obj.y, s2.obj.x, s2.obj.y);
                    const pushX = Math.cos(angle) * overlap * 0.5;
                    const pushY = Math.sin(angle) * overlap * 0.5;

                    // Tàu mẹ hoặc boss nặng hơn nên dịch chuyển ít hơn tàu con
                    if (s1.isCarrier && !s2.isCarrier) {
                        s2.obj.x += pushX * 1.6;
                        s2.obj.y += pushY * 1.6;
                    } else if (!s1.isCarrier && s2.isCarrier) {
                        s1.obj.x -= pushX * 1.6;
                        s1.obj.y -= pushY * 1.6;
                    } else {
                        s1.obj.x -= pushX;
                        s1.obj.y -= pushY;
                        s2.obj.x += pushX;
                        s2.obj.y += pushY;
                    }
                }
            }
        }
    }

    checkBulletCollisions() {
        const pBullets = this.playerProjectiles.getChildren();
        const eBullets = this.enemyProjectiles.getChildren();

        // 1. ĐẠN TA BẮN TRÚNG TÀU ĐỊCH HOẶC BẮN CHẶN TÊN LỬA ĐỊCH
        for (let b = pBullets.length - 1; b >= 0; b--) {
            const bullet = pBullets[b];
            if (!bullet || !bullet.active || bullet.aoeRadius) continue;

            const isAirOnly = bullet.config && bullet.config.targetType === 'air_only';
            const isShipOnly = bullet.config && (bullet.config.targetType === 'ship_only' || bullet.config.antiAir === false);

            // Bắn chặn tên lửa địch (CHỈ KHI VŨ KHÍ KHÔNG PHẢI LÀ SHIP ONLY)
            let intercepted = false;
            if (!isShipOnly) {
                for (let em = 0; em < eBullets.length; em++) {
                    const enemyMissile = eBullets[em];
                    if (!enemyMissile || !enemyMissile.active || !enemyMissile.maxHp) continue;

                    if (Phaser.Math.Distance.Between(bullet.x, bullet.y, enemyMissile.x, enemyMissile.y) < 32) {
                        bullet.explode(true);
                        if (enemyMissile.takeDamage) enemyMissile.takeDamage(bullet.damage);
                        intercepted = true;
                        break;
                    }
                }
            }
            if (intercepted) continue;

            // Bắn hạ máy bay tiêm kích đối phương (Enemy Aircraft)
            let hitEnemyAircraft = false;
            if (!isShipOnly && this.enemyAircraft) {
                for (let ea = 0; ea < this.enemyAircraft.length; ea++) {
                    const eJet = this.enemyAircraft[ea];
                    if (!eJet || !eJet.active || eJet.hp <= 0) continue;
                    if (Phaser.Math.Distance.Between(bullet.x, bullet.y, eJet.x, eJet.y) < 32) {
                        bullet.explode(true);
                        if (eJet.takeDamage) eJet.takeDamage(bullet.damage);
                        hitEnemyAircraft = true;
                        break;
                    }
                }
            }
            if (hitEnemyAircraft) continue;

            // Bắn trúng tàu địch (CHỈ KHI VŨ KHÍ KHÔNG PHẢI LÀ AIR ONLY)
            if (!isAirOnly) {
                for (let e = 0; e < this.enemyFleet.length; e++) {
                    const enemy = this.enemyFleet[e];
                    if (!enemy || !enemy.active || enemy.hp <= 0) continue;

                    if (Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y) < 42) {
                        bullet.explode(true);
                        enemy.takeDamage(bullet.damage);
                        break;
                    }
                }
            }
        }

        // 2. ĐẠN ĐỊCH BẮN TRÚNG TÀU TA, TÊN LỬA TA HOẶC MÁY BAY TA
        for (let b = eBullets.length - 1; b >= 0; b--) {
            const bullet = eBullets[b];
            if (!bullet || !bullet.active || bullet.aoeRadius) continue;

            const isShipOnly = bullet.targetType === 'ship_only' || (bullet.config && bullet.config.targetType === 'ship_only');
            const isAirOnly = bullet.targetType === 'air_only' || (bullet.config && bullet.config.targetType === 'air_only');

            // Địch bắn chặn tên lửa Tomahawk của ta (CHỈ KHI KHÔNG PHẢI LÀ SHIP ONLY)
            let interceptedP = false;
            if (!isShipOnly) {
                for (let pm = 0; pm < pBullets.length; pm++) {
                    const playerMissile = pBullets[pm];
                    if (!playerMissile || !playerMissile.active || !playerMissile.maxHp) continue;

                    if (Phaser.Math.Distance.Between(bullet.x, bullet.y, playerMissile.x, playerMissile.y) < 30) {
                        bullet.explode(true);
                        if (playerMissile.takeDamage) playerMissile.takeDamage(bullet.damage);
                        interceptedP = true;
                        break;
                    }
                }
            }
            if (interceptedP) continue;

            // Địch bắn hạ máy bay tiêm kích của ta (CHỈ KHI KHÔNG PHẢI LÀ SHIP ONLY)
            let hitJet = false;
            if (!isShipOnly) {
                for (let j = 0; j < this.aircraftSquadron.length; j++) {
                    const jet = this.aircraftSquadron[j];
                    if (!jet || !jet.active || jet.hp <= 0 || jet.state === 'PARKED') continue;

                    if (Phaser.Math.Distance.Between(bullet.x, bullet.y, jet.x, jet.y) < 24) {
                        bullet.explode(true);
                        jet.takeDamage(bullet.damage);
                        hitJet = true;
                        break;
                    }
                }
            }
            if (hitJet) continue;

            // Bắn trúng Tàu Mẹ (CHỈ KHI KHÔNG PHẢI LÀ AIR ONLY)
            if (!isAirOnly && this.playerShip && this.playerShip.active && this.playerShip.hp > 0) {
                if (Phaser.Math.Distance.Between(bullet.x, bullet.y, this.playerShip.x, this.playerShip.y) < 52) {
                    bullet.explode(true);
                    this.playerShip.takeDamage(bullet.damage);
                    this.events.emit('updatePlayerHp', this.playerShip.hp, this.playerShip.maxHp);
                    continue;
                }
            }

            // Bắn trúng Tàu Đồng Minh (CHỈ KHI KHÔNG PHẢI LÀ AIR ONLY)
            if (!isAirOnly) {
                for (let a = 0; a < this.allyFleet.length; a++) {
                    const ally = this.allyFleet[a];
                    if (!ally || !ally.active || ally.hp <= 0) continue;

                    if (Phaser.Math.Distance.Between(bullet.x, bullet.y, ally.x, ally.y) < 38) {
                        bullet.explode(true);
                        ally.takeDamage(bullet.damage);
                        break;
                    }
                }
            }
        }
    }

    // ============================================================
    // TRIỆU HỒI & KỸ NĂNG CHỈ HUY
    // ============================================================

    summonAircraft() {
        // Lấy loại máy bay đang trang bị ở Slot 4 Hangar từ SaveManager
        const equippedJetKey = SaveManager.getEquippedSlot('slot4') || 'fighter_f35c';
        const config = ShipConfig.aircraft[equippedJetKey] || ShipConfig.aircraft.fighter_jet;
        const now = this.time.now;
        const cd = this.summonCooldowns.jet;

        // Giới hạn tối đa 12 máy bay trên tàu mẹ Citadel (4 phi đội x 3 chiếc)
        const maxJets = GameConfig.maxCarrierAircraft || 12;
        // Chỉ đếm số tiêm kích thuộc biên chế của Tàu Mẹ Citadel (không tính máy bay của tàu sân bay con)
        const mothershipJets = this.aircraftSquadron.filter(j => j && j.active && j.carrier === this.playerShip);
        if (mothershipJets.length >= maxJets) {
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 65, 'HANGAR ĐẦY: ĐÃ ĐẠT TỐI ĐA 12 TIÊM KÍCH!', 0xf1c40f);
            return false;
        }

        if (!this.isOverdriveActive && now - cd.lastTime < cd.duration) {
            return false;
        }

        // Xuất kích theo phi đội 1 lần 3 chiếc (hoặc số lượng còn thiếu để đủ 12)
        const countToSummon = Math.min(3, maxJets - mothershipJets.length);
        const totalSquadronCost = (config.cost || 300) * countToSummon;

        if (this.credits < totalSquadronCost) {
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 60, `CẦN $${totalSquadronCost} CHO BIÊN ĐỘI ${countToSummon} TIÊM KÍCH!`, 0xff4757);
            return false;
        }

        if (!this.playerShip || !this.playerShip.active || this.playerShip.hp <= 0) return false;

        this.credits -= totalSquadronCost;
        cd.lastTime = now;
        this.events.emit('updateCredits', this.credits);

        const existingSlots = new Set(mothershipJets.map(j => j.slotIndex));
        for (let i = 0; i < countToSummon; i++) {
            let slotIndex = 0;
            while (existingSlots.has(slotIndex)) {
                slotIndex++;
            }
            existingSlots.add(slotIndex);
            const jet = new FighterJet(this, this.playerShip, config, slotIndex);
            this.aircraftSquadron.push(jet);
        }

        const squadNum = Math.ceil((mothershipJets.length + countToSummon) / 3);
        this.events.emit('updateAircraftCount', mothershipJets.length + countToSummon, maxJets);
        this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 70, `+ XUẤT XƯỞNG PHI ĐỘI ${squadNum} (3x ${config.name})`, 0x00d2ff);
        SoundManager.playJetRoar();

        if (this.currentSideMission && this.currentSideMission.type === 'air_strike' && !this.currentSideMission.completed) {
            this.currentSideMission.current++;
            if (this.currentSideMission.current >= this.currentSideMission.target) {
                this.completeSideMission();
            } else {
                this.events.emit('updateMissionStatus', this.currentSideMission);
            }
        }

        return true;
    }

    isAllyTypeUnlocked(type) {
        if (type === 'frigate') return true;

        const stageReqs = {
            frigate: 1,
            destroyer: 2,   // Thắng Màn 1 mở khóa Khu trục hạm
            cruiser: 3,     // Thắng Màn 2 mở khóa Tuần dương hạm
            battleship: 4,  // Thắng Màn 3 mở khóa Thiết giáp hạm
            carrier: 5      // Thắng Màn 4 mở khóa Tàu sân bay Ford
        };

        const req = stageReqs[type] || 1;

        if (!this.isEndlessMode) {
            const currentStage = this.currentStageId || 1;
            return currentStage >= req;
        }

        return SaveManager.isAllyUnlocked ? SaveManager.isAllyUnlocked(type) : ((SaveManager.getUnlockedStage ? SaveManager.getUnlockedStage() : 1) >= req);
    }

    summonAlly(type) {
        const config = ShipConfig.allies[type];
        if (!config) return false;

        // KIỂM TRA MỞ KHÓA THEO TIẾN ĐỘ CHIẾN DỊCH
        if (!this.isAllyTypeUnlocked(type)) {
            const stageReqs = { frigate: 1, destroyer: 2, cruiser: 3, battleship: 4, carrier: 5 };
            const req = stageReqs[type] || 1;
            this.showFloatingMessage(
                this.playerShip.x,
                this.playerShip.y - 65,
                `🔒 ${config.name.toUpperCase()} ĐANG KHÓA (CẦN VƯỢT MÀN ${req - 1})!`,
                0xf39c12
            );
            SoundManager.playMissileWarning();
            return false;
        }

        // KIỂM TRA GIỚI HẠN TOÀN BỘ HẠM ĐỘI (TẤT CẢ CÁC LOẠI): tối đa = số màn hiện tại
        const activeAllies = this.allyFleet.filter(a => a && a.active && a.hp > 0);
        const maxFleetLimit = this.currentStageId || 1;
        if (activeAllies.length >= maxFleetLimit) {
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 65, `ĐÃ ĐẠT GIỚI HẠN TOÀN HẠM ĐỘI (${activeAllies.length}/${maxFleetLimit} TÀU)!`, 0xf1c40f);
            return false;
        }

        // KIỂM TRA GIỚI HẠN RIÊNG TỪNG LOẠI TÀU CON (không vượt quá giới hạn hạm đội)
        const currentCount = activeAllies.filter(a => a.configKey === type).length;
        const baseLimit = (GameConfig.allyLimits && GameConfig.allyLimits[type]) || (type === 'cruiser' ? 3 : (type === 'battleship' ? 2 : (type === 'carrier' ? 2 : 4)));
        const limit = Math.min(baseLimit, maxFleetLimit);
        if (currentCount >= limit) {
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 65, `ĐÃ ĐẠT GIỚI HẠN ${limit} ${config.name.toUpperCase()}!`, 0xf1c40f);
            return false;
        }

        const now = this.time.now;
        const cd = this.summonCooldowns[type];

        if (!this.isOverdriveActive && now - cd.lastTime < cd.duration) {
            return false;
        }

        if (this.credits < config.cost) {
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 60, 'KHÔNG ĐỦ NGÂN SÁCH!', 0xff4757);
            return false;
        }

        if (!this.playerShip || !this.playerShip.active || this.playerShip.hp <= 0) return false;

        this.credits -= config.cost;
        cd.lastTime = now;
        this.events.emit('updateCredits', this.credits);

        // VỊ TRÍ ĐÍCH: Dàn trận hàng cọc phòng ngự phía trước mũi Tàu Mẹ Citadel (không bị trùng vị trí)
        const allyIndex = activeAllies.length;
        const col = Math.floor(allyIndex / 5);
        const row = allyIndex % 5;
        const targetX = this.playerShip.x + 220 + (col * 85);
        const targetY = this.playerShip.y + (row - 2) * 85;
        const formationOffset = { x: targetX, y: targetY };

        // Tàu con xuất hiện từ mép trái màn hình rồi tự động hành quân ra formationOffset
        const ally = new AllyShip(this, this.playerShip, type, config, formationOffset);
        this.allyFleet.push(ally);

        this.events.emit('updateFleetCount', this.allyFleet.filter(a => a && a.active && a.hp > 0).length, maxFleetLimit);
        this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 70, `+ ĐIỀU ĐỘNG ${config.name.toUpperCase()} (-$${config.cost})`, 0x2ecc71);
        SoundManager.playSummonUnit();
        return true;
    }

    repairCarrier() {
        const cost = 400;
        const now = this.time.now;
        const cd = this.summonCooldowns.repair;

        if (!this.isOverdriveActive && now - cd.lastTime < cd.duration) {
            return false;
        }

        if (this.credits < cost) {
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 60, 'KHÔNG ĐỦ NGÂN SÁCH!', 0xff4757);
            return false;
        }

        if (!this.playerShip || !this.playerShip.active || this.playerShip.hp <= 0) return false;
        if (this.playerShip.hp >= this.playerShip.maxHp) {
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 60, 'MÁU TÀU ĐÃ ĐẦY!', 0xf1c40f);
            return false;
        }

        this.credits -= cost;
        cd.lastTime = now;
        this.events.emit('updateCredits', this.credits);

        const healAmount = 550;
        this.playerShip.hp = Math.min(this.playerShip.maxHp, this.playerShip.hp + healAmount);

        // Khắc phục hư hỏng bộ phận khi sửa chữa
        Object.keys(this.playerShip.modules).forEach(k => {
            this.playerShip.modules[k].damaged = false;
            this.playerShip.modules[k].hp = this.playerShip.modules[k].maxHp;
        });
        this.events.emit('updateModules', this.playerShip.modules);

        this.playerShip.healthBar.setHp(this.playerShip.hp);
        this.events.emit('updatePlayerHp', this.playerShip.hp, this.playerShip.maxHp);

        this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 70, `+ SỬA CHỮA HOÀN TẤT: +${healAmount} HP`, 0x38ef7d);
        return true;
    }

    launchPlayerTomahawk() {
        if (!this.playerShip) return;
        const launched = this.playerShip.launchTomahawk();
        if (launched) {
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 80, '🚀 TOMAHAWK BLOCK V XUẤT KÍCH!', 0x00f2fe);
        }
    }

    /**
     * KÍCH HOẠT KỸ NĂNG CHỈ HUY ĐẶC BIỆT [PHÍM F]
     */
    triggerCommanderSkill() {
        const now = this.time.now;
        if (now - this.lastSkillTime < this.commanderSkill.cooldown) {
            return;
        }

        this.lastSkillTime = now;

        switch (this.commanderSkill.id) {
            case 'AIR_SUPERIORITY':
                this.executeAirStrikeCAS();
                break;
            case 'EW_JAMMING':
                this.executeEWJamming();
                break;
            case 'OVERDRIVE_SUPPLY':
                this.executeOverdriveSupply();
                break;
        }
    }

    executeAirStrikeCAS() {
        this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 95, '🛩 KHÔNG KÍCH CAS TOÀN DIỆN!', 0x00d2ff);
        SoundManager.playJetRoar();

        // Lấy loại máy bay tiêm kích đang trang bị
        const equippedJetKey = SaveManager.getEquippedSlot('slot4') || 'fighter_jet';
        const jetTexture = (equippedJetKey === 'fighter_ngad') ? 'jet_ngad' : ((equippedJetKey === 'fighter_faxx') ? 'jet_faxx' : 'fighter_jet');

        // 3 tiêm kích bay qua theo Đội hình Tam giác V-Formation rải thảm bom tên lửa
        const formationOffsets = [
            { x: -260, y: 0 },    // Chiếc dẫn đầu (Lead)
            { x: -330, y: -75 },  // Chiếc cánh trái (Wingman 1)
            { x: -330, y: 75 }    // Chiếc cánh phải (Wingman 2)
        ];

        formationOffsets.forEach((pos) => {
            const strikeJet = this.add.sprite(this.playerShip.x + pos.x, this.playerShip.y + pos.y, jetTexture);
            strikeJet.setScale(1.25);
            strikeJet.setAngle(90); // Xoay mũi máy bay hướng về phía trước theo hướng bay (East)
            strikeJet.setDepth(34);

            this.tweens.add({
                targets: strikeJet,
                x: this.playerShip.x + 1300 + pos.x,
                duration: 1750,
                onUpdate: (tween, target) => {
                    if (Math.random() < 0.22 && this.enemyFleet.length > 0) {
                        const enemy = this.enemyFleet[Math.floor(Math.random() * this.enemyFleet.length)];
                        if (enemy && enemy.active) {
                            enemy.takeDamage(95, 'aoe');
                        }
                    }
                },
                onComplete: () => strikeJet.destroy()
            });
        });
        this.cameras.main.shake(300, 0.007);
    }

    executeEWJamming() {
        this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 95, '⚡ TÁC CHIẾN ĐIỆN TỬ: ĐỊCH BỊ MÙ RADAR!', 0xf1c40f);

        // Làm mù toàn bộ tàu địch trong 12s
        this.enemyFleet.forEach(enemy => {
            if (enemy && enemy.active) {
                enemy.isJammed = true;
            }
        });

        this.cameras.main.flash(400, 241, 196, 15, 0.3);

        this.time.delayedCall(12000, () => {
            this.enemyFleet.forEach(enemy => {
                if (enemy && enemy.active) {
                    enemy.isJammed = false;
                }
            });
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 95, 'ÁP CHẾ ĐIỆN TỬ KẾT THÚC', 0xa4b0be);
        });
    }

    executeOverdriveSupply() {
        this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 95, '🚀 TIẾP TẾ SIÊU TỐC: HỒI CHIÊU = 0 TRONG 15S!', 0x2ecc71);
        this.isOverdriveActive = true;

        this.cameras.main.flash(300, 46, 204, 113, 0.25);

        this.time.delayedCall(15000, () => {
            this.isOverdriveActive = false;
            this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 95, 'TIẾP TẾ SIÊU TỐC KẾT THÚC', 0xa4b0be);
        });
    }

    onEnemyDestroyed(enemy) {
        const baseBounty = enemy.config.bounty || 250;
        const scoreVal = enemy.config.scoreValue || 200;

        // Buff tiền thưởng từ Đô đốc (Cattnoriel & Xtobian)
        const bountyMultiplier = (this.admiralConfig && this.admiralConfig.bountyBuff) || 1.0;
        const bounty = Math.round(baseBounty * bountyMultiplier);

        this.credits += bounty;
        this.score += scoreVal;

        // Cập nhật tiến độ nhiệm vụ phụ nếu là tiêu diệt tàu địch
        if (this.currentSideMission && this.currentSideMission.type === 'destroy_enemies' && !this.currentSideMission.completed) {
            this.currentSideMission.current++;
            if (this.currentSideMission.current >= this.currentSideMission.target) {
                this.completeSideMission();
            } else {
                this.events.emit('updateMissionStatus', this.currentSideMission);
            }
        }

        this.showFloatingMessage(enemy.x, enemy.y - 30, `+$${bounty}`, 0xf1c40f);

        const remaining = this.enemyFleet.filter(e => e.active && e.hp > 0 && e !== enemy).length;
        this.events.emit('updateCredits', this.credits);
        this.events.emit('updateFleetStatus', remaining, this.score);
    }

    createExplosion(x, y, type = 'hit') {
        if (type === 'obstacle_hit') {
            const spark = this.add.circle(x, y, 10, 0xf39c12, 0.9);
            spark.setDepth(18);
            this.tweens.add({
                targets: spark,
                scale: 1.8,
                alpha: 0,
                duration: 180,
                onComplete: () => spark.destroy()
            });
            return;
        }

        if (type === 'water_splash') {
            const ripple = this.add.sprite(x, y, 'water_ripple');
            ripple.setDepth(6);
            ripple.setScale(0.4);
            ripple.setAlpha(0.85);
            this.tweens.add({
                targets: ripple,
                scale: 1.6,
                alpha: 0,
                duration: 550,
                onComplete: () => ripple.destroy()
            });
            return;
        }

        const baseRadius = type === 'huge' ? 65 : (type === 'big' ? 40 : 18);
        const boom = this.add.circle(x, y, baseRadius, 0xff9f43, 0.95);
        boom.setDepth(18);

        this.tweens.add({
            targets: boom,
            scale: 1.8,
            alpha: 0,
            duration: type === 'huge' ? 650 : 280,
            onComplete: () => boom.destroy()
        });
    }

    showFloatingMessage(x, y, text, color = 0xffffff) {
        const msg = this.add.text(x, y, text, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '15px',
            fontStyle: 'bold',
            color: Phaser.Display.Color.IntegerToColor(color).rgba,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        msg.setDepth(36);

        this.tweens.add({
            targets: msg,
            y: y - 35,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => msg.destroy()
        });
    }

    showFloatingDamage(x, y, text, color = 0xffffff) {
        this.showFloatingMessage(x, y, text, color);
    }

    checkVictoryCondition() {
        if (this.isPreparing) return;

        // Thưởng nhiệm vụ phụ bảo vệ tàu nếu chưa bị hoàn thành/hủy
        if (this.currentSideMission && this.currentSideMission.type === 'protect_carrier' && !this.currentSideMission.completed) {
            if (this.playerShip && this.playerShip.hp >= this.playerShip.maxHp * 0.70) {
                this.completeSideMission();
            }
        }

        const remaining = this.enemyFleet.filter(e => e.active && e.hp > 0).length + (this.pendingSpawnsCount || 0);
        this.events.emit('updateFleetStatus', remaining, this.score);

        if (remaining <= 0 && !this.isGameOver) {
            // Kiểm tra xem còn đợt tiếp theo không
            if (this.currentWaveIndex < this.totalWaves || this.isEndlessMode) {
                // Chuyển sang 20 Giây Chuẩn Bị trước khi vào đợt kế tiếp!
                this.currentWaveIndex += 1;
                this.isPreparing = true;
                this.prepTimeRemaining = GameConfig.interWavePrepTime || 20000;

                this.events.emit('updateStageInfo', {
                    stageData: this.stageData,
                    currentWave: this.currentWaveIndex,
                    totalWaves: this.totalWaves,
                    weather: this.currentWeather,
                    isEndless: this.isEndlessMode
                });

                this.events.emit('updatePrepTimer', Math.ceil(this.prepTimeRemaining / 1000));
                this.showFloatingMessage(this.playerShip.x, this.playerShip.y - 80, `ĐÃ QUÉT SẠCH ĐỢT ${this.currentWaveIndex - 1}! 20S CHUẨN BỊ ĐỢT ${this.currentWaveIndex}`, 0x2ecc71);

                if (this.isEndlessMode) {
                    SaveManager.updateEndlessRecord(this.currentWaveIndex, this.score);
                }
                return;
            }

            // ĐÃ CHIẾN THẮNG TOÀN BỘ CÁC ĐỢT TRONG MÀN!
            this.isGameOver = true;
            SoundManager.playVictoryMusic();
            const tokens = this.stageData.tokensReward || 3;
            SaveManager.addTokens(tokens);
            SaveManager.unlockStage(this.currentStageId + 1);

            // Mở khóa tàu con mới cho người chơi theo tiến trình
            const newShipRewards = {
                1: 'destroyer',
                2: 'cruiser',
                3: 'battleship',
                4: 'carrier'
            };
            const unlockedShipKey = newShipRewards[this.currentStageId] || null;
            if (unlockedShipKey && SaveManager.unlockAlly) {
                SaveManager.unlockAlly(unlockedShipKey);
            }

            const hpPercent = (this.playerShip && this.playerShip.maxHp > 0)
                ? Math.max(0, Math.min(100, Math.round((this.playerShip.hp / this.playerShip.maxHp) * 100)))
                : 100;

            this.time.delayedCall(800, () => {
                this.events.emit('showVictory', this.score, tokens, this.currentStageId, hpPercent, unlockedShipKey);
            });
        }
    }

    onPlayerDefeated() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        SoundManager.playDefeatMusic();
        this.events.emit('updatePlayerHp', 0, this.playerShip.maxHp);

        if (this.isEndlessMode) {
            SaveManager.updateEndlessRecord(this.currentWaveIndex, this.score);
        }

        this.time.delayedCall(1200, () => {
            this.events.emit('showDefeat', this.score);
        });
    }
}
