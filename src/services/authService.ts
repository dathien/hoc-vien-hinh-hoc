/**
 * Extensible Authentication & Local Profile Service.
 * Currently operates 100% offline-first using local browser profile settings
 * with a clean interface ready for future cloud authentication integration.
 */

export interface LearnerProfile {
  id: string;
  displayName: string;
  mode: 'local';
  createdAt: string;
}

const LOCAL_PROFILE_KEY = 'hhs_local_profile_v1';

export const authService = {
  getCurrentProfile(fallbackName = 'Học viên Hình học'): LearnerProfile {
    try {
      const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LearnerProfile;
        if (parsed && parsed.id) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }

    const created: LearnerProfile = {
      id: `local_${Date.now().toString(36)}`,
      displayName: fallbackName,
      mode: 'local',
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(created));
    } catch {
      // Ignore storage write errors
    }
    return created;
  },

  updateDisplayName(displayName: string): LearnerProfile {
    const current = this.getCurrentProfile(displayName);
    const updated: LearnerProfile = {
      ...current,
      displayName: displayName.trim() || 'Học viên Hình học',
    };
    try {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    return updated;
  },
};
