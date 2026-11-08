/**
 * SaveManager.js - Quản lý Dữ liệu Lưu trữ Vĩnh viễn (LocalStorage)
 */

const STORAGE_KEY = 'FLEET_COMBAT_SAVE_DATA_V3';

const DEFAULT_DATA = {
    upgradeTokens: 0,
    unlockedStage: 1,
    selectedSkill: 'AIR_SUPERIORITY',
    endlessRecord: {
        waves: 0,
        score: 0
    },
    upgrades: {
        radar: 0,    // 0..10
        damage: 0,   // 0..10
        hp: 0,       // 0..10
        speed: 0     // 0..10
    },
    // TRANG BỊ ĐÃ MUA VÀ LẮP VÀO TÀU MẸ
    inventory: ['ags155', 'cps', 'fighter_f35c', 'duxe'],
    equippedSlots: {
        slot1: 'ags155',
        slot2: 'ags155',
        slot3: 'cps',
        slot4: 'fighter_f35c'
    },
    selectedAdmiral: 'duxe',
    selectedFormation: 'LINE',
    stageStars: {}, // { 1: 3, 2: 2, ... }
    unlockedAllies: ['frigate'] // Màn 1 chỉ mở khóa Frigate, thắng màn 1 mở Destroyer, v.v.
};

class SaveManagerClass {
    constructor() {
        this.data = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.inventory) {
                    parsed.inventory = parsed.inventory.map(item => {
                        if (item === 'mark45_mod4' || item === 'mark45_mod4m') return 'ags155';
                        if (item === 'tomahawk_block_va' || item === 'tomahawk_carrier') return 'cps';
                        return item;
                    });
                }
                if (parsed.equippedSlots) {
                    if (parsed.equippedSlots.slot1 === 'mark45_mod4' || parsed.equippedSlots.slot1 === 'mark45_mod4m') parsed.equippedSlots.slot1 = 'ags155';
                    if (parsed.equippedSlots.slot2 === 'mark45_mod4' || parsed.equippedSlots.slot2 === 'mark45_mod4m') parsed.equippedSlots.slot2 = 'ags155';
                    if (parsed.equippedSlots.slot3 === 'tomahawk_block_va' || parsed.equippedSlots.slot3 === 'tomahawk_carrier') parsed.equippedSlots.slot3 = 'cps';
                }
                return {
                    ...DEFAULT_DATA,
                    ...parsed,
                    endlessRecord: { ...DEFAULT_DATA.endlessRecord, ...(parsed.endlessRecord || {}) },
                    upgrades: { ...DEFAULT_DATA.upgrades, ...(parsed.upgrades || {}) },
                    inventory: parsed.inventory || DEFAULT_DATA.inventory,
                    equippedSlots: { ...DEFAULT_DATA.equippedSlots, ...(parsed.equippedSlots || {}) },
                    selectedAdmiral: parsed.selectedAdmiral || DEFAULT_DATA.selectedAdmiral,
                    selectedFormation: parsed.selectedFormation || DEFAULT_DATA.selectedFormation,
                    stageStars: parsed.stageStars || {},
                    unlockedAllies: parsed.unlockedAllies || ['frigate']
                };
            }
        } catch (e) {
            console.warn('Không thể đọc LocalStorage:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Không thể lưu LocalStorage:', e);
        }
    }

    getTokens() {
        return this.data.upgradeTokens || 0;
    }

    addTokens(amount) {
        this.data.upgradeTokens = (this.data.upgradeTokens || 0) + amount;
        this.save();
    }

    getUpgradeLevel(statKey) {
        return this.data.upgrades[statKey] || 0;
    }

    upgradeStat(statKey) {
        const currentLvl = this.getUpgradeLevel(statKey);
        if (currentLvl >= 10) return false;
        if (this.data.upgradeTokens < 1) return false;

        this.data.upgradeTokens -= 1;
        this.data.upgrades[statKey] = currentLvl + 1;
        this.save();
        return true;
    }

    resetUpgrades() {
        let totalRefund = 0;
        Object.keys(this.data.upgrades).forEach(key => {
            totalRefund += this.data.upgrades[key];
            this.data.upgrades[key] = 0;
        });
        this.data.upgradeTokens += totalRefund;
        this.save();
        return totalRefund;
    }

    getMultiplier(statKey) {
        const lvl = this.getUpgradeLevel(statKey);
        return 1 + (lvl * 0.05);
    }

    getUnlockedStage() {
        return this.data.unlockedStage || 1;
    }

    unlockStage(stageNumber) {
        if (stageNumber > this.data.unlockedStage) {
            this.data.unlockedStage = Math.min(10, stageNumber);
            this.save();
        }
    }

    resetProgress() {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.save();
        return this.data;
    }

    setStageStars(stageNumber, stars) {
        if (!this.data.stageStars) this.data.stageStars = {};
        const curStars = this.data.stageStars[stageNumber] || 0;
        if (stars > curStars) {
            this.data.stageStars[stageNumber] = Math.max(1, Math.min(3, stars));
            this.save();
        }
    }

    getStageStars(stageNumber) {
        return (this.data.stageStars && this.data.stageStars[stageNumber]) || 0;
    }

    unlockAlly(shipKey) {
        if (!this.data.unlockedAllies) this.data.unlockedAllies = ['frigate'];
        if (!this.data.unlockedAllies.includes(shipKey)) {
            this.data.unlockedAllies.push(shipKey);
            this.save();
        }
    }

    isAllyUnlocked(shipKey) {
        if (shipKey === 'frigate') return true;
        if (this.data.unlockedAllies && this.data.unlockedAllies.includes(shipKey)) return true;
        const stageUnlocks = {
            frigate: 1,
            destroyer: 2,
            cruiser: 3,
            battleship: 4,
            carrier: 5
        };
        const req = stageUnlocks[shipKey] || 1;
        return (this.data.unlockedStage || 1) >= req;
    }

    getSelectedSkill() {
        return this.data.selectedSkill || 'AIR_SUPERIORITY';
    }

    setSelectedSkill(skillId) {
        this.data.selectedSkill = skillId;
        this.save();
    }

    getEndlessRecord() {
        return this.data.endlessRecord || { waves: 0, score: 0 };
    }

    updateEndlessRecord(waves, score) {
        let updated = false;
        if (waves > this.data.endlessRecord.waves) {
            this.data.endlessRecord.waves = waves;
            updated = true;
        }
        if (score > this.data.endlessRecord.score) {
            this.data.endlessRecord.score = score;
            updated = true;
        }
        if (updated) {
            this.save();
        }
    }

    // ==========================================
    // QUẢN LÝ KHO TRANG BỊ & SLOT CỦA TÀU MẸ
    // ==========================================
    hasItem(itemId) {
        return (this.data.inventory || []).includes(itemId);
    }

    buyItem(itemId, cost) {
        if (this.hasItem(itemId)) return false;
        if (this.data.upgradeTokens < cost) return false;

        this.data.upgradeTokens -= cost;
        this.data.inventory.push(itemId);
        this.save();
        return true;
    }

    getEquippedSlot(slotKey) {
        return (this.data.equippedSlots && this.data.equippedSlots[slotKey]) || null;
    }

    equipSlot(slotKey, itemId) {
        if (!this.hasItem(itemId)) return false;
        if (!this.data.equippedSlots) this.data.equippedSlots = {};
        this.data.equippedSlots[slotKey] = itemId;
        this.save();
        return true;
    }

    getSelectedAdmiral() {
        return this.data.selectedAdmiral || 'duxe';
    }

    setSelectedAdmiral(admiralId) {
        this.data.selectedAdmiral = admiralId;
        this.save();
    }

    getSelectedFormation() {
        return this.data.selectedFormation || 'LINE';
    }

    setSelectedFormation(formationId) {
        this.data.selectedFormation = formationId;
        this.save();
    }
}

export const SaveManager = new SaveManagerClass();
