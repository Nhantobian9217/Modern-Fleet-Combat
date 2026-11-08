/**
 * SoundManager.js - Hệ thống Quản lý Âm thanh & Nhạc nền Chuyên nghiệp (Audio Engine)
 * 
 * Tích hợp toàn diện:
 * 1. Âm thanh thực từ thư mục assets/audio/ (MP3 & OGG) do người chơi cung cấp.
 * 2. Tự động hỗ trợ cả Phaser Sound Manager và Web Audio API synth dự phòng (nếu tài nguyên chưa tải xong hoặc trình duyệt chặn).
 * 3. Quản lý chuyển đổi Nhạc Nền (BGM Cross-fading / Switch) theo từng bối cảnh:
 *    - Menu chính & Title: sound_bgm_man_hinh_chinh
 *    - Trận chiến Màn 1: sound_bgm_man_1
 *    - Trận chiến Màn 2 - 5 & Sinh tồn: sound_bgm_battlefield
 *    - Trận chiến Màn đặc biệt (Màn 6): sound_bgm_man_dac_biet
 *    - Trận chiến Boss KRAKEN / Màn cuối (Màn 7): sound_bgm_boss / sound_bgm_man_cuoi
 *    - Chiến thắng: music_game_won
 *    - Thất bại / Tàu chìm: music_game_lost
 * 4. Hiệu ứng âm thanh chiến thuật (SFX):
 *    - Bấm nút / Click UI: sound_sfx_click
 *    - Phóng tên lửa Tomahawk: sound_sfx_missile
 *    - Tiêm kích xuất kích / Kỹ năng CAS: sound_sfx_plane
 *    - Triệu hồi tàu chiến đồng minh: sound_sfx_unit
 *    - Nâng cấp chỉ số trong shop / terminal: sound_sfx_upgrade
 *    - Trang bị vũ khí / Lắp slot: sound_sfx_equip
 *    - Tiếng pháo hạm & Vụ nổ & Báo động & Sấm sét
 */

class SoundManagerClass {
    constructor() {
        this.phaserGame = null;
        this.currentBgm = null;
        this.currentBgmKey = null;
        this.bgmVolume = 0.55;
        this.sfxVolume = 0.8;
        this.isMuted = false;

        // Web Audio Context dự phòng
        this.ctx = null;
        this.initialized = false;
        this.oceanSource = null;
        this.ambientGain = null;
    }

    /**
     * Gắn cá thể game của Phaser vào SoundManager
     */
    setGame(game) {
        this.phaserGame = game;
        this.unlockAudioOnUserGesture();
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.initialized = true;
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    ensureContext() {
        if (!this.initialized) {
            this.init();
        }
        // Chỉ gọi resume nếu context đã tồn tại và chưa bị đóng
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        if (this.phaserGame && this.phaserGame.sound && this.phaserGame.sound.context && this.phaserGame.sound.context.state === 'suspended') {
            this.phaserGame.sound.context.resume().catch(() => {});
        }
    }

    /**
     * Khởi động audio khi người chơi tương tác lần đầu (Click/Keydown)
     */
    unlockAudioOnUserGesture() {
        const unlock = () => {
            this.ensureContext();
            if (this.currentBgmKey && (!this.currentBgm || !this.currentBgm.isPlaying)) {
                this.playBGM(this.currentBgmKey);
            }
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.phaserGame && this.phaserGame.sound) {
            this.phaserGame.sound.mute = this.isMuted;
        }
        if (this.ambientGain && this.ctx) {
            this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // ============================================================
    // QUẢN LÝ NHẠC NỀN (BGM SYSTEM)
    // ============================================================

    /**
     * Phát nhạc nền theo key, hỗ trợ lặp và dừng bài cũ mượt mà
     */
    playBGM(key, loop = true, volume = null) {
        if (!key) return;
        this.ensureContext();

        const vol = (volume !== null ? volume : this.bgmVolume);

        // Nếu bài này đang phát thì không khởi động lại
        if (this.currentBgmKey === key && this.currentBgm && this.currentBgm.isPlaying) {
            return;
        }

        // Dừng bài nhạc trước nếu có
        this.stopBGM();

        if (this.phaserGame && this.phaserGame.sound) {
            try {
                if (this.phaserGame.sound.get(key) || this.phaserGame.cache.audio.has(key)) {
                    this.currentBgm = this.phaserGame.sound.add(key, {
                        volume: vol,
                        loop: loop
                    });
                    this.currentBgm.play();
                    this.currentBgmKey = key;
                    return;
                }
            } catch (err) {
                console.warn(`Không thể phát BGM: ${key}`, err);
            }
        }

        this.currentBgmKey = key;
    }

    stopBGM() {
        if (this.currentBgm) {
            try {
                this.currentBgm.stop();
                this.currentBgm.destroy();
            } catch (e) {}
            this.currentBgm = null;
        }
        this.currentBgmKey = null;
    }

    /**
     * Nhạc nền Menu chính & Màn hình khởi động
     */
    playMainMenuBGM() {
        this.playBGM('sound_bgm_man_hinh_chinh', true, 0.5);
    }

    /**
     * Nhạc nền trận chiến dựa theo màn chơi hoặc tình huống
     */
    playBattleBGM(stageId, isEndless = false, isKrakenWave = false) {
        if (stageId === 10) {
            // Màn 10 trận chiến tối hậu: Nhạc chung cuộc hoành tráng (Final Boss)
            this.playBGM('sound_bgm_man_cuoi', true, 0.65);
        } else if (stageId === 5 || stageId === 8 || isKrakenWave) {
            // Màn 5 và màn 8: Trận đại chiến Boss (KRAKEN / Black Tide Carrier Armada)
            this.playBGM('sound_bgm_boss', true, 0.65);
        } else if (stageId === 9) {
            // Màn 9 đặc biệt (Căn cứ ngầm Phantom Omega)
            this.playBGM('sound_bgm_man_dac_biet', true, 0.55);
        } else if (stageId === 1) {
            // Màn 1 mở đầu chiến dịch
            this.playBGM('sound_bgm_man_1', true, 0.55);
        } else {
            // Các màn khác (2, 3, 4, 6, 7) và Endless
            this.playBGM('sound_bgm_battlefield', true, 0.55);
        }
    }

    /**
     * Nhạc chiến thắng khi diệt sạch hạm đội địch
     */
    playVictoryMusic() {
        this.playBGM('music_game_won', false, 0.65);
    }

    /**
     * Nhạc thất bại khi soái hạm bị chìm
     */
    playDefeatMusic() {
        this.playBGM('music_game_lost', false, 0.65);
    }

    // ============================================================
    // HIỆU ỨNG ÂM THANH (SFX SYSTEM)
    // ============================================================

    /**
     * Phát một hiệu ứng âm thanh từ cache của Phaser hoặc fallback synth
     */
    playSFX(key, volume = null) {
        if (this.isMuted) return;
        this.ensureContext();

        const vol = (volume !== null ? volume : this.sfxVolume);

        if (this.phaserGame && this.phaserGame.sound) {
            try {
                if (this.phaserGame.sound.get(key) || this.phaserGame.cache.audio.has(key)) {
                    this.phaserGame.sound.play(key, { volume: vol });
                    return true;
                }
            } catch (err) {
                // Fallback xuống synthesizer nếu file chưa kịp nạp
            }
        }
        return false;
    }

    /**
     * Tiếng bấm nút / tương tác UI
     */
    playClick() {
        if (!this.playSFX('sound_sfx_click', 0.6)) {
            this.synthBeep(850, 0.05, 0.15);
        }
    }

    /**
     * Tiếng phóng tên lửa Tomahawk
     */
    playMissileLaunch() {
        if (!this.playSFX('sound_sfx_missile', 0.85)) {
            // Fallback âm thanh phản lực tăng tần số
            this.synthMissile();
        }
    }

    /**
     * Tiếng tiêm kích F-35C / F/A-XX cất cánh hoặc không kích CAS
     */
    playJetRoar() {
        if (!this.playSFX('sound_sfx_plane', 0.75)) {
            this.playNoiseBurst(0.3, 0.2, 900);
        }
    }

    /**
     * Tiếng điều động / triệu hồi tàu con đồng minh
     */
    playSummonUnit() {
        if (!this.playSFX('sound_sfx_unit', 0.8)) {
            this.synthBeep(420, 0.12, 0.3);
        }
    }

    /**
     * Âm thanh xác nhận tọa độ điều động điểm đến (Tactical Destination Ack)
     */
    playDestinationAck() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.playSFX('sound_sfx_destination', 0.9) && !this.playSFX('sound_sfx_click', 0.85)) {
            if (this.ctx) {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.setValueAtTime(1174.66, now + 0.08); // A5 -> D6
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.22);
            }
        }
    }

    /**
     * Âm thanh đạt ngôi sao đánh giá cuối trận (Star 1, Star 2, Star 3)
     */
    playStar(starNum) {
        if (this.isMuted) return;
        this.ensureContext();
        const key = `sound_sfx_star_${starNum}`;
        if (!this.playSFX(key, 0.95)) {
            // Synth fallback tương ứng từng sao
            if (this.ctx) {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
                const f = freqs[Math.max(0, Math.min(2, starNum - 1))];
                osc.frequency.setValueAtTime(f, now);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            }
        }
    }

    playStar1() { this.playStar(1); }
    playStar2() { this.playStar(2); }
    playStar3() { this.playStar(3); }

    /**
     * Tiếng nâng cấp chỉ số thành công
     */
    playUpgrade() {
        if (!this.playSFX('sound_sfx_upgrade', 0.8)) {
            this.synthFanfare();
        }
    }

    /**
     * Tiếng thay đổi / lắp ráp trang bị vào slot
     */
    playEquip() {
        if (!this.playSFX('sound_sfx_equip', 0.8)) {
            this.synthBeep(620, 0.08, 0.25);
        }
    }

    /**
     * Tiếng pháo hải quân khai hỏa (Mark 45)
     */
    playCannonFire() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);

        this.playNoiseBurst(0.08, 0.25, 450);
    }

    /**
     * Vụ nổ bass trầm cực mạnh của tên lửa Tomahawk & Boss KRAKEN
     */
    playDeepExplosion() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.65);

        gain.gain.setValueAtTime(0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.7);

        this.playNoiseBurst(0.45, 0.4, 250);
    }

    /**
     * Âm thanh vụ nổ linh hoạt (small, hit, big, huge)
     */
    playExplosion(type = 'small') {
        if (this.isMuted) return;
        this.ensureContext();
        if (type === 'big' || type === 'huge') {
            this.playDeepExplosion();
            return;
        }

        if (this.ctx) {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(130, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);

            gain.gain.setValueAtTime(0.32, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.2);

            this.playNoiseBurst(0.12, 0.25, 550);
        }
    }

    /**
     * Còi báo động hạm đội khẩn cấp
     */
    playFleetAlarm() {
        // Loại bỏ âm thanh còi báo động hạm đội theo yêu cầu của người chơi
        return;
    }

    /**
     * Âm thanh sấm sét khi trời mưa bão
     */
    playThunder() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        this.playNoiseBurst(0.7, 0.4, 200);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
    }

    // ============================================================
    // SYNTHESISERS DỰ PHÒNG
    // ============================================================

    synthBeep(freq, duration, vol) {
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    }

    synthMissile() {
        if (!this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(650, now + 0.35);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } catch (e) {}
    }

    synthFanfare() {
        if (!this.ctx) return;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            setTimeout(() => this.synthBeep(freq, 0.12, 0.2), idx * 80);
        });
    }

    playNoiseBurst(duration, volume, filterFreq) {
        if (!this.ctx) return;
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq || 500, this.ctx.currentTime);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(this.ctx.currentTime);
            noise.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }
}

export const SoundManager = new SoundManagerClass();
