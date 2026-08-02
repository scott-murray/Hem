const STORAGE_KEY = 'bunny.progress.v1';

const DEFAULT_PROGRESS = {
  unlockedLevel: 1,
  completedLevels: [],
  muted: false,
  hasDigAbility: false,
  broccolis: 0,
};

export const storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PROGRESS };
      return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULT_PROGRESS };
    }
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save progress:', e);
    }
  },

  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    return { ...DEFAULT_PROGRESS };
  },

  unlockLevel(level) {
    const data = this.load();
    if (level > data.unlockedLevel) {
      data.unlockedLevel = level;
    }
    this.save(data);
    return data;
  },

  completeLevel(level) {
    const data = this.load();
    if (!data.completedLevels.includes(level)) {
      data.completedLevels.push(level);
    }
    // Unlock next level
    const nextLevel = level + 1;
    if (nextLevel <= 5 && nextLevel > data.unlockedLevel) {
      data.unlockedLevel = nextLevel;
    }
    this.save(data);
    return data;
  },

  setMuted(val) {
    const data = this.load();
    data.muted = val;
    this.save(data);
    return data;
  },

  hasDigAbility() {
    return this.load().hasDigAbility || false;
  },

  setDigAbility(val) {
    const data = this.load();
    data.hasDigAbility = val;
    this.save(data);
    return data;
  },

  getBroccolis() {
    return this.load().broccolis || 0;
  },

  addBroccoli() {
    const data = this.load();
    data.broccolis = (data.broccolis || 0) + 1;
    this.save(data);
    return data.broccolis;
  },
};
