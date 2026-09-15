const STORAGE_KEYS = {
  HAS_SEEN_INTRO: 'atos_mobile_has_seen_intro',
  ONBOARDING_COMPLETED: 'atos_mobile_onboarding_completed',
  LAST_OPENED_DATE: 'atos_mobile_last_opened_date'
};

class MobileAppFlowService {
  getHasSeenIntro() {
    return localStorage.getItem(STORAGE_KEYS.HAS_SEEN_INTRO) === 'true';
  }

  setHasSeenIntro(value) {
    localStorage.setItem(STORAGE_KEYS.HAS_SEEN_INTRO, value ? 'true' : 'false');
  }

  getOnboardingCompleted() {
    // Also check if user data exists in standard location
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const isCompleted = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true' ||
                        (userData.name && !userData.skippedOnboarding);
    return isCompleted;
  }

  setOnboardingCompleted(value) {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, value ? 'true' : 'false');
  }

  updateLastOpenedDate() {
    localStorage.setItem(STORAGE_KEYS.LAST_OPENED_DATE, new Date().toISOString());
  }

  getLastOpenedDate() {
    return localStorage.getItem(STORAGE_KEYS.LAST_OPENED_DATE);
  }

  // Clear all mobile-specific state
  resetFlow() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
}

export const mobileAppFlowService = new MobileAppFlowService();
