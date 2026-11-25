import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_VERSION
} from '../config/siteConfig';

const DEFAULT_PREFERENCES = {
  necessary: true,
  analytics: false,
  marketing: false
};

const CATEGORY_COOKIE_PATTERNS = {
  analytics: {
    exact: ['_ga', '_gid', '_gat', '_clck', '_clsk', 'ajs_anonymous_id', 'ajs_user_id'],
    prefixes: ['_ga_', 'ph_', '_hj', '_pk_']
  },
  marketing: {
    exact: ['_fbp', '_fbc', '_gcl_au', '_gcl_aw', '_gcl_dc', 'li_fat_id', 'IDE', 'fr'],
    prefixes: ['_gcl_', '_uetsid', '_uetvid']
  }
};

function readCookieValue(name) {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeConsentCookie(payload) {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const attrs = [
    `${CONSENT_COOKIE_NAME}=${encoded}`,
    'path=/',
    `max-age=${CONSENT_MAX_AGE_SECONDS}`,
    'SameSite=Lax'
  ];
  if (isHttps) attrs.push('Secure');
  document.cookie = attrs.join('; ');
}

function expireCookieByName(cookieName) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const hostname = window.location.hostname;
  const hostParts = hostname.split('.');
  const domainCandidates = [undefined, hostname];
  if (hostParts.length >= 2) {
    domainCandidates.push(`.${hostParts.slice(-2).join('.')}`);
  }
  domainCandidates.forEach((domain) => {
    const domPart = domain ? `; domain=${domain}` : '';
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domPart}`;
  });
}

function purgeCategoryCookies(category) {
  if (typeof document === 'undefined') return;
  const spec = CATEGORY_COOKIE_PATTERNS[category];
  if (!spec) return;

  const rawCookies = document.cookie ? document.cookie.split(';') : [];
  const namesToDelete = new Set(spec.exact);

  rawCookies.forEach((entry) => {
    const eqIndex = entry.indexOf('=');
    const cookieName = (eqIndex > -1 ? entry.slice(0, eqIndex) : entry).trim();
    if (!cookieName) return;
    if (
      spec.exact.includes(cookieName) ||
      spec.prefixes.some((prefix) => cookieName.startsWith(prefix))
    ) {
      namesToDelete.add(cookieName);
    }
  });

  namesToDelete.forEach(expireCookieByName);

  // Stop active runtime trackers in memory when revoked
  if (typeof window !== 'undefined') {
    if (category === 'analytics') {
      const gaId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID;
      if (gaId) {
        window[`ga-disable-${gaId}`] = true;
      }
      if (typeof window.clarity === 'function') {
        try {
          window.clarity('consent', false);
        } catch (_) {}
      }
      if (window.posthog && typeof window.posthog.opt_out_capturing === 'function') {
        try {
          window.posthog.opt_out_capturing();
        } catch (_) {}
      }
    }
    if (category === 'marketing' && typeof window.fbq === 'function') {
      try {
        window.fbq('consent', 'revoke');
      } catch (_) {}
    }
  }
}

function ensureGtagStub() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}

function pushConsentModeDefault() {
  if (typeof window === 'undefined') return;
  ensureGtagStub();
  if (!window.__pathrimonioConsentDefaultSet) {
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500
    });
    window.__pathrimonioConsentDefaultSet = true;
  }
}

function pushConsentModeUpdate(preferences) {
  if (typeof window === 'undefined') return;
  ensureGtagStub();
  const gaId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID;
  if (gaId) {
    window[`ga-disable-${gaId}`] = !preferences.analytics;
  }
  window.gtag('consent', 'update', {
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
    analytics_storage: preferences.analytics ? 'granted' : 'denied'
  });
}

function loadStoredConsentRecord() {
  try {
    const fromCookie = readCookieValue(CONSENT_COOKIE_NAME);
    const raw = fromCookie || (typeof localStorage !== 'undefined' ? localStorage.getItem(CONSENT_COOKIE_NAME) : null);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.version === CONSENT_VERSION &&
      parsed.preferences &&
      typeof parsed.preferences === 'object'
    ) {
      return {
        version: parsed.version,
        updated_at: parsed.updated_at || new Date().toISOString(),
        preferences: {
          necessary: true,
          analytics: Boolean(parsed.preferences.analytics),
          marketing: Boolean(parsed.preferences.marketing)
        }
      };
    }
  } catch (_) {}
  return null;
}

const ConsentContext = createContext(null);

export function ConsentProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [consentRecord, setConsentRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    pushConsentModeDefault();
    const existing = loadStoredConsentRecord();
    if (existing) {
      setConsentRecord(existing);
      pushConsentModeUpdate(existing.preferences);
    } else {
      setConsentRecord(null);
    }
    setHydrated(true);
  }, []);

  const preferences = useMemo(() => {
    if (!consentRecord) return DEFAULT_PREFERENCES;
    return consentRecord.preferences;
  }, [consentRecord]);

  const persistDecision = useCallback(
    (nextPrefs) => {
      const normalized = {
        necessary: true,
        analytics: Boolean(nextPrefs.analytics),
        marketing: Boolean(nextPrefs.marketing)
      };

      // Revocation enforcement: purge cookies/trackers if previously accepted or ensuring clean slate
      if (!normalized.analytics) {
        purgeCategoryCookies('analytics');
      }
      if (!normalized.marketing) {
        purgeCategoryCookies('marketing');
      }

      const record = {
        version: CONSENT_VERSION,
        updated_at: new Date().toISOString(),
        preferences: normalized
      };

      writeConsentCookie(record);
      try {
        localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(record));
      } catch (_) {}

      pushConsentModeUpdate(normalized);
      setConsentRecord(record);
      setIsModalOpen(false);
    },
    []
  );

  const acceptAll = useCallback(() => {
    persistDecision({ necessary: true, analytics: true, marketing: true });
  }, [persistDecision]);

  const rejectNonEssential = useCallback(() => {
    persistDecision({ necessary: true, analytics: false, marketing: false });
  }, [persistDecision]);

  const savePreferences = useCallback(
    ({ analytics, marketing }) => {
      persistDecision({
        necessary: true,
        analytics: Boolean(analytics),
        marketing: Boolean(marketing)
      });
    },
    [persistDecision]
  );

  const openPreferencesModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closePreferencesModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const hasDecision = hydrated && consentRecord !== null;
  const showBanner = hydrated && !hasDecision && !isModalOpen;

  const value = useMemo(
    () => ({
      hydrated,
      hasDecision,
      showBanner,
      isModalOpen,
      consentRecord,
      preferences,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferencesModal,
      closePreferencesModal
    }),
    [
      hydrated,
      hasDecision,
      showBanner,
      isModalOpen,
      consentRecord,
      preferences,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openPreferencesModal,
      closePreferencesModal
    ]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    return {
      hydrated: false,
      hasDecision: false,
      showBanner: false,
      isModalOpen: false,
      consentRecord: null,
      preferences: DEFAULT_PREFERENCES,
      acceptAll: () => {},
      rejectNonEssential: () => {},
      savePreferences: () => {},
      openPreferencesModal: () => {},
      closePreferencesModal: () => {}
    };
  }
  return ctx;
}
