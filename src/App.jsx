import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_STORIES } from './data/initialStories';
import { INITIAL_INTERFACES, INTERFACE_MODULE_OPTIONS } from './data/initialInterfaces';
import { INITIAL_PROJECTS } from './data/initialProjects';
import { INITIAL_DATA_MODELS } from './data/initialDataModels';
import { INITIAL_ACTORS } from './data/initialActors';
import { INITIAL_FILES } from './data/initialFiles';
import { summarizeTree } from './data/projectTree';
import { mapSupabaseUser, DEMO_USERS } from './auth/authConfig';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  fetchWorkspace,
  saveStory,
  deleteStory,
  fetchInterfaces,
  saveInterface,
  deleteInterface,
  saveDataModel,
  deleteDataModel,
  saveActor,
  deleteActor,
  saveFile,
  deleteFile,
  fetchProjectTree,
  replaceProjectTree,
  fetchFileRecords,
  fetchProjectFileRecords,
  addFileRecord,
  deleteFileRecord,
  saveProject,
  addInterfaceModule,
  renameInterfaceModule,
  deleteInterfaceModule,
  addProjectMember,
  removeProjectMember,
  fetchProjectArchitectureArtifacts,
  upsertProjectArchitectureArtifact,
  upsertPortalUserRecord,
  deletePortalUserRecord
} from './lib/supabaseData';

// Landing Components (Minimalist Modern SDD)
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import RolesSection from './components/landing/RolesSection';
import FormalIAShowcaseSection from './components/landing/FormalIAShowcaseSection';
import PartnershipSection from './components/landing/PartnershipSection';
import FormalIAWorkspace from './components/landing/formalia/FormalIAWorkspace';
import InteractiveEstimator from './components/estimator/InteractiveEstimator';
import FAQSection from './components/landing/FAQSection';
import Footer from './components/landing/Footer';
import ContactModal from './components/landing/ContactModal';
import LegalPageRouter, { isLegalPathname } from './components/legal/LegalPageRouter';
import { ConsentProvider } from './context/ConsentContext';
import ConsentTrackers from './components/consent/ConsentTrackers';
import CookieBanner from './components/consent/CookieBanner';
import CookiePreferencesModal from './components/consent/CookiePreferencesModal';
import { getSeoForPath, normalizePathname } from './config/siteConfig';

// Portal Components
import LoginPage from './components/portal/LoginPage';
import Sidebar from './components/portal/Sidebar';
import Header from './components/portal/Header';
import ControlsBar from './components/portal/ControlsBar';
import StoryBuilder from './components/portal/StoryBuilder';
import StoryFeed from './components/portal/StoryFeed';
import StoryDetailModal from './components/portal/StoryDetailModal';
import InterfaceControlsBar from './components/portal/InterfaceControlsBar';
import InterfaceBuilder from './components/portal/InterfaceBuilder';
import InterfaceFeed from './components/portal/InterfaceFeed';
import InterfaceDetailModal from './components/portal/InterfaceDetailModal';
import DataModelControlsBar from './components/portal/DataModelControlsBar';
import DataModelBuilder from './components/portal/DataModelBuilder';
import DataModelFeed from './components/portal/DataModelFeed';
import DataModelDetailModal from './components/portal/DataModelDetailModal';
import DERModal from './components/portal/DERModal';
import SQLScriptModal from './components/portal/SQLScriptModal';
import ActorsControlsBar from './components/portal/ActorsControlsBar';
import ActorBuilder from './components/portal/ActorBuilder';
import ActorFeed from './components/portal/ActorFeed';
import ActorDetailModal from './components/portal/ActorDetailModal';
import FilesControlsBar from './components/portal/FilesControlsBar';
import FileUploader from './components/portal/FileUploader';
import FileFeed from './components/portal/FileFeed';
import FileDetailModal from './components/portal/FileDetailModal';
import ProjectTreeView from './components/portal/ProjectTreeView';
import FolderImportModal from './components/portal/FolderImportModal';
import TreeFileDetailModal from './components/portal/TreeFileDetailModal';
import SoftwareArchitectureView from './components/portal/SoftwareArchitectureView';
import NewProjectModal from './components/portal/NewProjectModal';
import InviteProjectMemberModal from './components/portal/InviteProjectMemberModal';
import { BacklogView, SprintsView, DocsView, SettingsView } from './components/portal/ExtraViews';
import FormalIAPortalView from './components/portal/FormalIAPortalView';
import PathcomConsole from './components/pathcom/PathcomConsole';
import { fetchPublishedSiteProjects } from './services/pathcomService';
import AdminUsersView from './components/portal/AdminUsersView';
import ImplementationTrackerView from './components/portal/ImplementationTrackerView';
import PartnerDashboardView from './components/portal/PartnerDashboardView';
import CollaboratorPresalesView from './components/portal/CollaboratorPresalesView';
import ProjectsManagementView from './components/portal/ProjectsManagementView';
import { compileProcessToPortalBundle } from './lib/formalia/compilers';
import {
  clearLocalFormaliaSession,
  findClaimableAnonymousSession,
  claimFormaliaSession,
  saveLocalFormaliaSession
} from './services/formaliaService';
import { DEFAULT_PRICING_CONFIG } from './data/pricingRules';
import {
  DEFAULT_COMMUNITY_IMPACT,
  fetchPlatformSettings,
  savePlatformSetting,
  fetchImplementationRequests,
  createOrUpdateImplementationRequest,
  computeLiveDiffsAgainstBaseline,
  advanceImplementationStatus,
  reviewLiveModification,
  recordSystemAudit
} from './services/platformService';
import {
  PLATFORM_IMPLEMENTED_VERSION,
  buildProjectSyncReports,
  syncProjectFromCodeCatalog,
  autoSyncExistingCatalogProjects
} from './services/projectSyncService';
import { 
  loadRoleDefinitions, 
  saveRoleDefinitions, 
  PORTAL_USERS_STORAGE_KEY,
  isTabAllowedForRole,
  isActionAllowedForRole,
  getRoleDefinition,
  isInternalStaffRole
} from './auth/permissionsConfig';

const STORAGE_KEY = 'pathrimonio_stories_v3';
const INTERFACES_STORAGE_KEY = 'pathrimonio_interfaces_v3';
const INTERFACE_MODULES_STORAGE_KEY = 'pathrimonio_interface_modules_v1';
const DATA_MODELS_STORAGE_KEY = 'pathrimonio_data_models_v2';
const ACTORS_STORAGE_KEY = 'pathrimonio_actors_v1';
const FILES_STORAGE_KEY = 'pathrimonio_files_v1';
const PROJECTS_STORAGE_KEY = 'pathrimonio_projects_v1';
const ACTIVE_PROJECT_KEY = 'pathrimonio_active_project_id_v1';

function PortalLoader({ message }) {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p className="font-space text-xs uppercase tracking-widest text-on-surface-variant">{message}</p>
      </div>
    </div>
  );
}

export default function App({ initialPath = '/' }) {
  return (
    <ConsentProvider>
      <ConsentTrackers />
      <AppContent initialPath={initialPath} />
    </ConsentProvider>
  );
}

function AppContent({ initialPath = '/' }) {
  const initialCleanPath = normalizePathname(initialPath);

  // ── Theme state: determinista en SSR (60% Gray #2B2D31 / 30% Silver #D9DADC / 10% Yellow #FFC93C)
  const [theme, setTheme] = useState('dark');
  const [themeHydrated, setThemeHydrated] = useState(false);

  useEffect(() => {
    try {
      const paletteVer = localStorage.getItem('pathrimonio_theme_ver');
      const savedTheme = paletteVer === '60-30-10' ? localStorage.getItem('pathrimonio_theme') : null;
      const resolved = savedTheme === 'light' ? 'light' : 'dark';
      setTheme(resolved);
    } catch (_) {}
    setThemeHydrated(true);
  }, []);

  useEffect(() => {
    if (!themeHydrated) return;
    try {
      localStorage.setItem('pathrimonio_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (_) {}
  }, [theme, themeHydrated]);

  const toggleTheme = () => {
    try {
      localStorage.setItem('pathrimonio_theme_ver', '60-30-10');
    } catch (_) {}
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ── Path & View state: 'landing' | 'formalia' | 'pathcom' | 'legal' | 'portal'
  const [currentPath, setCurrentPath] = useState(initialCleanPath);
  const [currentView, setCurrentView] = useState(() =>
    isLegalPathname(initialCleanPath)
      ? 'legal'
      : initialCleanPath === '/formalia'
        ? 'formalia'
        : initialCleanPath === '/pathcom'
          ? 'pathcom'
          : 'landing'
  );
  const [preloadedFormaliaData, setPreloadedFormaliaData] = useState(null);
  const [pricingConfig, setPricingConfig] = useState(DEFAULT_PRICING_CONFIG);
  const [communityImpact, setCommunityImpact] = useState(DEFAULT_COMMUNITY_IMPACT);
  const [publishedSiteProjects, setPublishedSiteProjects] = useState([]);
  const [implementationRequests, setImplementationRequests] = useState([]);

  // ── Auth state (Supabase Auth)
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [workspaceReady, setWorkspaceReady] = useState(!isSupabaseConfigured);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState('login');
  const claimedAnonSessionsRef = useRef(new Set());
  const autoSyncedCatalogRef = useRef('');

  // ── Portal nav
  const [activePortalTab, setActivePortalTab] = useState('actors');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Projects (Multi-software)
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (saved) return saved;
    } catch (_) {}
    return 'pathway';
  });

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // ── Stories
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_STORIES;
  });

  // ── Interfaces & UI Specs
  const [interfaces, setInterfaces] = useState(() => {
    try {
      const saved = localStorage.getItem(INTERFACES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(item => {
          const initialMatch = INITIAL_INTERFACES.find(i => i.id === item.id);
          const roles = (!item.roles || !Array.isArray(item.roles) || item.roles.length === 0)
            ? (initialMatch?.roles || (item.role ? [item.role] : []))
            : item.roles;
          const dataUsage = (!item.dataUsage || !Array.isArray(item.dataUsage) || item.dataUsage.length === 0)
            ? (initialMatch?.dataUsage || [])
            : item.dataUsage;
          return {
            ...item,
            roles,
            dataUsage
          };
        });
      }
    } catch (_) {}
    return INITIAL_INTERFACES;
  });

  // ── Interface module catalog (editable, persisted)
  const [interfaceModules, setInterfaceModules] = useState(() => {
    const defaults = new Set(INTERFACE_MODULE_OPTIONS.filter(m => m !== 'Todos'));
    INITIAL_INTERFACES.forEach(item => { if (item.module) defaults.add(item.module); });

    try {
      const saved = localStorage.getItem(INTERFACE_MODULES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const catalog = new Set(parsed.filter(m => m && m !== 'Sin módulo'));
          interfaces.forEach(item => {
            if (item.module && item.module !== 'Sin módulo') catalog.add(item.module);
          });
          return Array.from(catalog);
        }
      }
    } catch (_) {}

    return Array.from(defaults);
  });

  // ── Data Models & Tables
  const [dataModels, setDataModels] = useState(() => {
    try {
      const saved = localStorage.getItem(DATA_MODELS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_DATA_MODELS;
  });

  // ── Business Actors & Roles
  const [actors, setActors] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTORS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_ACTORS;
  });

  // ── Project Files & Deliverables
  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem(FILES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_FILES;
  });

  // ── Project file tree (folders + files loaded from a root folder)
  const [treeNodes, setTreeNodes] = useState([]);
  const [projectFileRecords, setProjectFileRecords] = useState([]);
  const [treeLoading, setTreeLoading] = useState(false);

  // ── Archify interactive HTML artifacts per active project
  const [architectureArtifacts, setArchitectureArtifacts] = useState([]);
  const [archArtifactsLoading, setArchArtifactsLoading] = useState(false);

  // ── Role Definitions & Access Matrix
  const [roleDefinitions, setRoleDefinitions] = useState(() => loadRoleDefinitions());

  // ── Portal users (team directory with persisted accounts)
  const [portalUsers, setPortalUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(PORTAL_USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEMO_USERS.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.role === 'Admin' ? 'Pathrimonio Central' : 'Equipo de Desarrollo',
      avatar: user.avatar,
      color: user.color,
      status: 'active',
      permissions: user.permissions
    }));
  });

  // Persist portal users
  useEffect(() => {
    try {
      localStorage.setItem(PORTAL_USERS_STORAGE_KEY, JSON.stringify(portalUsers));
    } catch (_) {}
  }, [portalUsers]);

  const handleUpdatePortalUsers = (updatedUsers) => {
    setPortalUsers(updatedUsers);
    try {
      localStorage.setItem(PORTAL_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (_) {}

    if (isSupabaseConfigured) {
      updatedUsers.forEach((u) => {
        if (u?.id && u?.email) {
          upsertPortalUserRecord(u).catch(() => {});
        }
      });
    }

    // Si el usuario actual fue actualizado en el directorio, sincronizar su sesión viva
    if (currentUser) {
      const matching = updatedUsers.find(u => u.email?.toLowerCase() === currentUser.email?.toLowerCase());
      if (matching) {
        setCurrentUser(prev => ({
          ...prev,
          role: matching.role || prev.role,
          credit_balance_usd: matching.credit_balance_usd ?? prev.credit_balance_usd ?? 0,
          bonus_role_months: matching.bonus_role_months ?? prev.bonus_role_months ?? 0,
          referral_code: matching.referral_code || prev.referral_code || null,
          organization: matching.organization || prev.organization || null
        }));
      }
    }
  };

  const handleDeletePortalUser = async (targetUser) => {
    if (!targetUser?.id) return;
    const next = portalUsers.filter((u) => u.id !== targetUser.id);
    setPortalUsers(next);
    try {
      localStorage.setItem(PORTAL_USERS_STORAGE_KEY, JSON.stringify(next));
    } catch (_) {}
    if (isSupabaseConfigured) {
      try { await deletePortalUserRecord(targetUser.id); } catch (_) {}
    }
    notify(`Usuario "${targetUser.name || targetUser.email}" eliminado.`);
  };

  const handleSavePricingConfig = async (nextConfig, actorUser) => {
    const saved = await savePlatformSetting('pricing_config', nextConfig, actorUser || currentUser);
    setPricingConfig({ ...DEFAULT_PRICING_CONFIG, ...saved });
    return saved;
  };

  const handleSaveCommunityImpact = async (nextImpact, actorUser) => {
    const saved = await savePlatformSetting('community_impact', nextImpact, actorUser || currentUser);
    setCommunityImpact({ ...DEFAULT_COMMUNITY_IMPACT, ...saved });
    return saved;
  };

  const handleUpdateRoleDefinitions = (updatedDefs) => {
    setRoleDefinitions(updatedDefs);
    saveRoleDefinitions(updatedDefs);
  };

  // ── Real project memberships (portal_users with access per project)
  const [projectMembers, setProjectMembers] = useState([]);

  // ── Filters & Search
  const [activeModule, setActiveModule] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [interfaceSearchQuery, setInterfaceSearchQuery] = useState('');
  const [dataModelSearchQuery, setDataModelSearchQuery] = useState('');
  const [actorSearchQuery, setActorSearchQuery] = useState('');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [filesViewMode, setFilesViewMode] = useState('tree');

  // ── Preselected Role from Collaborator Link or Selection
  const [preselectedRoleForStory, setPreselectedRoleForStory] = useState(null);

  // ── Builder Roles for immediate feed filter synchronization
  const [builderRoles, setBuilderRoles] = useState([]);

  useEffect(() => {
    setBuilderRoles([]);
  }, [activeProjectId]);

  // ── Detail modals
  const [selectedStory, setSelectedStory] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedInterface, setSelectedInterface] = useState(null);
  const [isInterfaceModalOpen, setIsInterfaceModalOpen] = useState(false);
  const [isRegisterInterfaceModalOpen, setIsRegisterInterfaceModalOpen] = useState(false);

  const [selectedTable, setSelectedTable] = useState(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isDERModalOpen, setIsDERModalOpen] = useState(false);
  const [isSQLModalOpen, setIsSQLModalOpen] = useState(false);

  const [selectedActor, setSelectedActor] = useState(null);
  const [isActorModalOpen, setIsActorModalOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  // ── Create entity modals (registered via dedicated button modals, not embedded)
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [isCreateActorModalOpen, setIsCreateActorModalOpen] = useState(false);
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
  const [isFolderImportOpen, setIsFolderImportOpen] = useState(false);
  const [selectedTreeNode, setSelectedTreeNode] = useState(null);
  const [isTreeFileModalOpen, setIsTreeFileModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);

  // ── Contact modal (landing)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // ── Toast
  const [toastMessage, setToastMessage] = useState(null);

  // Persist stories
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stories)); } catch (_) {}
  }, [stories]);

  // Persist interfaces
  useEffect(() => {
    try { localStorage.setItem(INTERFACES_STORAGE_KEY, JSON.stringify(interfaces)); } catch (_) {}
  }, [interfaces]);

  // Persist interface module catalog
  useEffect(() => {
    try { localStorage.setItem(INTERFACE_MODULES_STORAGE_KEY, JSON.stringify(interfaceModules)); } catch (_) {}
  }, [interfaceModules]);

  // Persist data models
  useEffect(() => {
    try { localStorage.setItem(DATA_MODELS_STORAGE_KEY, JSON.stringify(dataModels)); } catch (_) {}
  }, [dataModels]);

  // Persist actors
  useEffect(() => {
    try { localStorage.setItem(ACTORS_STORAGE_KEY, JSON.stringify(actors)); } catch (_) {}
  }, [actors]);

  // Persist project files
  useEffect(() => {
    try { localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files)); } catch (_) {}
  }, [files]);

  // Persist projects
  useEffect(() => {
    try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects)); } catch (_) {}
  }, [projects]);

  // Persist active project ID
  useEffect(() => {
    try { localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId); } catch (_) {}
  }, [activeProjectId]);

  // ── Supabase Auth: restore session & listen for changes
  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setCurrentUser(data.session ? mapSupabaseUser(data.session.user) : null);
        setAuthReady(true);
      })
      .catch((error) => {
        console.error('[Supabase] getSession', error);
        if (!cancelled) setAuthReady(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session ? mapSupabaseUser(session.user) : null);
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Sync URL pathname, hash & query parameters for deep linking (SSR/SPA clean URLs + #portal)
  useEffect(() => {
    const syncSeoHead = (pathname) => {
      const seo = getSeoForPath(pathname);
      if (typeof document !== 'undefined') {
        document.title = seo.title;
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) descTag.setAttribute('content', seo.description);
        const canonicalTag = document.querySelector('link[rel="canonical"]');
        if (canonicalTag) canonicalTag.setAttribute('href', seo.canonical);
      }
    };

    const handleRouteSync = () => {
      const hash = window.location.hash || '';
      const searchParams = new URLSearchParams(window.location.search || '');
      const portalTabParam = searchParams.get('portal_tab');
      const hasAuthRedirect =
        hash.includes('access_token=') ||
        hash.includes('type=signup') ||
        hash.includes('error_description=') ||
        searchParams.has('code') ||
        searchParams.has('error_description');
      const cleanPath = normalizePathname(window.location.pathname || '/');
      setCurrentPath(cleanPath);

      if (hash.startsWith('#portal')) {
        setCurrentView('portal');

        const qIndex = hash.indexOf('?');
        if (qIndex !== -1) {
          const queryString = hash.slice(qIndex + 1);
          const params = new URLSearchParams(queryString);
          const tab = params.get('tab');
          const roleParam = params.get('role');
          const projectParam = params.get('project');
          const modeParam = params.get('mode') || params.get('action');

          if (modeParam === 'register' || modeParam === 'signup') {
            setLoginMode('register');
          } else if (modeParam === 'login') {
            setLoginMode('login');
          }

          if (tab) setActivePortalTab(tab);
          if (roleParam) {
            setPreselectedRoleForStory(decodeURIComponent(roleParam));
          }
          if (projectParam && projects.some((p) => p.id === projectParam)) {
            setActiveProjectId(projectParam);
          }
        }
      } else if (portalTabParam || hasAuthRedirect) {
        setCurrentView('portal');
        if (portalTabParam) {
          setActivePortalTab(portalTabParam);
        }
      } else if (isLegalPathname(cleanPath)) {
        setCurrentView('legal');
        syncSeoHead(cleanPath);
      } else if (cleanPath === '/formalia') {
        setCurrentView('formalia');
        syncSeoHead('/formalia');
      } else if (cleanPath === '/pathcom') {
        setCurrentView('pathcom');
        syncSeoHead('/pathcom');
      } else {
        setCurrentView('landing');
        syncSeoHead('/');
      }
    };

    handleRouteSync();
    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('popstate', handleRouteSync);
    return () => {
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('popstate', handleRouteSync);
    };
  }, [projects]);

  // Finaliza callbacks de verificación de correo Supabase Auth una vez authReady === true
  useEffect(() => {
    if (!authReady || typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    const searchParams = new URLSearchParams(window.location.search || '');
    const portalTabParam = searchParams.get('portal_tab');
    const hasTokenCallback = hash.includes('access_token=') || searchParams.has('code');
    const hasErrorCallback = hash.includes('error_description=') || searchParams.has('error_description');

    if (!portalTabParam && !hasTokenCallback && !hasErrorCallback) return;

    if (hasErrorCallback && !currentUser) {
      setCurrentView('portal');
      setLoginMode('login');
      window.history.replaceState({}, '', '/#portal');
      notify('El enlace de verificación expiró o ya fue utilizado. Inicia sesión o reenvía el correo.');
      return;
    }

    if (currentUser) {
      const targetTab = portalTabParam || (currentUser.source === 'formalia' ? 'formalia' : 'actors');
      setActivePortalTab(targetTab);
      setCurrentView('portal');
      setShowLogin(false);
      window.history.replaceState(
        {},
        '',
        `/#portal${targetTab !== 'actors' ? `?tab=${encodeURIComponent(targetTab)}` : ''}`
      );
      notify(`¡Correo confirmado! Bienvenido al Portal, ${currentUser.name || currentUser.email}.`);
    }
  }, [authReady, currentUser]);

  // Show login gate when user enters portal without a session
  useEffect(() => {
    if (currentView === 'portal' && authReady && !currentUser) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [currentView, currentUser, authReady]);

  // Restricción estricta de navegación según rol RBAC
  useEffect(() => {
    if (currentView === 'portal' && currentUser) {
      const userRole = currentUser.role || 'Usuario Registrado';
      const isAllowed = isTabAllowedForRole(userRole, activePortalTab, roleDefinitions);
      if (!isAllowed) {
        const allowed = getRoleDefinition(userRole, roleDefinitions)?.allowedTabs || ['actors', 'stories', 'interfaces', 'formalia', 'implementationStatus'];
        const fallbackTab = allowed.includes('actors') ? 'actors' : (allowed.includes('stories') ? 'stories' : allowed[0]);
        setActivePortalTab(fallbackTab);
      }
    }
  }, [currentView, currentUser, activePortalTab, roleDefinitions]);

  // Cargar settings globales (Landing pricing-config, Impacto Comunitario y proyectos Pathcom CMS)
  useEffect(() => {
    let cancelled = false;
    fetchPlatformSettings().then((res) => {
      if (cancelled || !res) return;
      const nextPricing = res.pricingConfig || res.pricing_config;
      const nextImpact = res.communityImpact || res.community_impact;
      if (nextPricing) setPricingConfig(nextPricing);
      if (nextImpact) setCommunityImpact(nextImpact);
    });
    fetchPublishedSiteProjects().then((projectsList) => {
      if (!cancelled && Array.isArray(projectsList)) {
        setPublishedSiteProjects(projectsList.filter((p) => p.is_published));
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Reconciliar rol/billetera de currentUser con directorio DB portal_users al cargar workspace
  useEffect(() => {
    if (!currentUser?.email || !Array.isArray(portalUsers) || portalUsers.length === 0) return;
    const match = portalUsers.find(
      (u) => String(u.email || '').trim().toLowerCase() === String(currentUser.email || '').trim().toLowerCase()
    );
    if (!match) return;
    if (
      match.role !== currentUser.role ||
      Number(match.credit_balance_usd || 0) !== Number(currentUser.credit_balance_usd || 0) ||
      Number(match.bonus_role_months || 0) !== Number(currentUser.bonus_role_months || 0) ||
      (match.referral_code && match.referral_code !== currentUser.referral_code)
    ) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              role: match.role || prev.role,
              credit_balance_usd: Number(match.credit_balance_usd ?? prev.credit_balance_usd ?? 0),
              bonus_role_months: Number(match.bonus_role_months ?? prev.bonus_role_months ?? 0),
              referral_code: match.referral_code || prev.referral_code || null,
              organization: match.organization || prev.organization || null
            }
          : prev
      );
    }
  }, [portalUsers, currentUser?.email]);

  // Cargar solicitudes de Implementación Web & Diffs según rol
  useEffect(() => {
    if (!currentUser?.email) {
      setImplementationRequests([]);
      return;
    }
    let cancelled = false;
    fetchImplementationRequests(currentUser).then((reqs) => {
      if (!cancelled) setImplementationRequests(reqs || []);
    });
    return () => { cancelled = true; };
  }, [currentUser?.email, currentUser?.role]);

  const notify = (msg, durationMs = 4000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(prev => prev === msg ? null : prev), durationMs);
  };

  // ── Supabase: hydrate workspace once on mount (anon read)
  useEffect(() => {
    if (!supabase) {
      setWorkspaceReady(true);
      return;
    }

    let cancelled = false;

    fetchWorkspace()
      .then((data) => {
        if (cancelled) return;
        setProjects(data.projects);
        setStories(data.stories);
        setInterfaces(data.interfaces);
        setDataModels(data.dataModels);
        setActors(data.actors);
        setFiles(data.files);
        if (data.portalUsers) {
          setPortalUsers(data.portalUsers);
        }
        if (data.projectMembers) {
          setProjectMembers(data.projectMembers);
        }
        if (data.interfaceModules.length > 0) {
          setInterfaceModules(data.interfaceModules.map((module) => module.name));
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[Supabase] fetchWorkspace', error);
        notify(`No se pudo cargar el workspace desde Supabase: ${error.message}`);
      })
      .finally(() => {
        if (!cancelled) setWorkspaceReady(true);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Supabase: load the project file tree & abstract records + subscribe to MCP Realtime updates
  useEffect(() => {
    const needsTreeData = activePortalTab === 'files' || activePortalTab === 'architecture';
    if (!needsTreeData || activeProjectId === 'all' || !isSupabaseConfigured) {
      setTreeNodes([]);
      setProjectFileRecords([]);
      setTreeLoading(false);
      return undefined;
    }

    let cancelled = false;
    setTreeLoading(true);

    const loadTreeAndRecords = () => Promise.all([
      fetchProjectTree(activeProjectId),
      fetchProjectFileRecords(activeProjectId)
    ]);

    loadTreeAndRecords()
      .then(([nodes, records]) => {
        if (!cancelled) {
          setTreeNodes(nodes);
          setProjectFileRecords(records);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[Supabase] fetchProjectTree/Records', error);
        notify(`No se pudo cargar el árbol de archivos: ${error.message}`);
      })
      .finally(() => {
        if (!cancelled) setTreeLoading(false);
      });

    // Suscripción Realtime: los cambios hechos desde MCP se reflejan al instante en la web
    let syncTimer = null;
    const scheduleLiveRefresh = () => {
      if (syncTimer) window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(() => {
        loadTreeAndRecords()
          .then(([nodes, records]) => {
            if (!cancelled) {
              setTreeNodes(nodes);
              setProjectFileRecords(records);
            }
          })
          .catch(() => {});
      }, 350);
    };

    const channel = supabase
      .channel(`project-tree-live:${activeProjectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_tree_nodes', filter: `project_id=eq.${activeProjectId}` },
        scheduleLiveRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'file_records', filter: `project_id=eq.${activeProjectId}` },
        scheduleLiveRefresh
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (syncTimer) window.clearTimeout(syncTimer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePortalTab, activeProjectId]);

  const effectiveArchProjectId = activeProjectId === 'all'
    ? (projects[0]?.id || 'pathway')
    : activeProjectId;

  useEffect(() => {
    if (activePortalTab !== 'architecture' || !effectiveArchProjectId || !isSupabaseConfigured) {
      return undefined;
    }

    let cancelled = false;
    setArchArtifactsLoading(true);

    fetchProjectArchitectureArtifacts(effectiveArchProjectId)
      .then((rows) => {
        if (!cancelled) setArchitectureArtifacts(rows);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('[Supabase] fetchProjectArchitectureArtifacts', error);
        }
      })
      .finally(() => {
        if (!cancelled) setArchArtifactsLoading(false);
      });

    let artTimer = null;
    const scheduleArchRefresh = () => {
      if (artTimer) window.clearTimeout(artTimer);
      artTimer = window.setTimeout(() => {
        fetchProjectArchitectureArtifacts(effectiveArchProjectId)
          .then((rows) => {
            if (!cancelled) setArchitectureArtifacts(rows);
          })
          .catch(() => {});
      }, 300);
    };

    const archChannel = supabase
      .channel(`project-archify-live:${effectiveArchProjectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_architecture_artifacts',
          filter: `project_id=eq.${effectiveArchProjectId}`
        },
        scheduleArchRefresh
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (artTimer) window.clearTimeout(artTimer);
      supabase.removeChannel(archChannel);
    };
  }, [activePortalTab, effectiveArchProjectId]);

  // ── Supabase: Realtime live sync for interfaces (including MCP upsert_interface / delete_interface)
  useEffect(() => {
    if (!workspaceReady || !isSupabaseConfigured) {
      return undefined;
    }

    let cancelled = false;
    let refreshTimer = null;

    const scheduleInterfacesRefresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        fetchInterfaces()
          .then((rows) => {
            if (!cancelled) setInterfaces(rows);
          })
          .catch(() => {});
      }, 250);
    };

    const interfacesChannel = supabase
      .channel('interfaces-live-catalog')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interfaces' },
        scheduleInterfacesRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interface_roles' },
        scheduleInterfacesRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interface_data_usage' },
        scheduleInterfacesRefresh
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      supabase.removeChannel(interfacesChannel);
    };
  }, [workspaceReady]);

  const handleRefreshArchitectureArtifacts = async (overrideProjectId) => {
    const targetId = overrideProjectId || effectiveArchProjectId;
    if (!targetId || !isSupabaseConfigured) return [];
    setArchArtifactsLoading(true);
    try {
      const rows = await fetchProjectArchitectureArtifacts(targetId);
      setArchitectureArtifacts(rows);
      return rows;
    } finally {
      setArchArtifactsLoading(false);
    }
  };

  const handleSaveArchitectureArtifact = async (artifactPayload) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado.');
    }
    const saved = await upsertProjectArchitectureArtifact(artifactPayload);
    setArchitectureArtifacts((prev) => {
      const rest = prev.filter(
        (item) => !(item.projectId === saved.projectId && item.slug === saved.slug)
      );
      return [saved, ...rest];
    });
    return saved;
  };

  // ── Supabase: fire-and-forget persistence with user feedback
  const persist = (operation, label) => {
    if (!supabase) return;
    Promise.resolve(operation).catch((error) => {
      console.error(`[Supabase] ${label}`, error);
      notify(`Error al guardar en Supabase (${label}): ${error.message}`);
    });
  };

  const navigateToPath = (target) => {
    if (typeof window === 'undefined') return;
    const [rawPath, rawHash] = String(target || '/').split('#');
    const cleanPath = normalizePathname(rawPath || '/');
    const nextUrl = rawHash ? `${cleanPath}#${rawHash}` : cleanPath;

    window.history.pushState({}, '', nextUrl);
    setCurrentPath(cleanPath);

    if (isLegalPathname(cleanPath)) {
      setCurrentView('legal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (cleanPath === '/formalia') {
      setCurrentView('formalia');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (cleanPath === '/pathcom') {
      setCurrentView('pathcom');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('landing');
      if (rawHash) {
        window.setTimeout(() => {
          const targetEl = document.getElementById(rawHash);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 40);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    const seo = getSeoForPath(cleanPath);
    document.title = seo.title;
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', seo.description);
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) canonicalTag.setAttribute('href', seo.canonical);
  };

  const navigateToPortal = (initialAction = 'login', initialTab = 'actors') => {
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
    }
    const targetTab = initialTab || 'actors';
    if (initialAction === 'register') {
      window.location.hash = `#portal?mode=register${targetTab !== 'actors' ? `&tab=${targetTab}` : ''}`;
      setLoginMode('register');
    } else {
      window.location.hash = targetTab !== 'actors' ? `#portal?tab=${targetTab}` : '#portal';
      setLoginMode('login');
    }
    setActivePortalTab(targetTab);
    setCurrentView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToRegister = () => navigateToPortal('register');

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Auth handlers
  const resolveDefaultProjectForUser = (targetUser, candidateProjects = projects, preferredProject = null) => {
    if (preferredProject && preferredProject.id) return preferredProject;
    const cleanEmail = String(targetUser?.email || '').trim().toLowerCase();
    const list = Array.isArray(candidateProjects) ? candidateProjects : [];
    const staff = isInternalStaffRole(targetUser);
    const ownedOrMember = list.filter((p) => {
      if (!p) return false;
      if (cleanEmail && String(p.owner_email || '').trim().toLowerCase() === cleanEmail) return true;
      if (targetUser?.id && projectMembers.some((m) => m.projectId === p.id && m.userId === targetUser.id)) return true;
      return staff && !p.owner_email;
    });
    const scopedPool = ownedOrMember.length > 0 ? ownedOrMember : (staff ? list : []);
    if (activeProjectId && activeProjectId !== 'all') {
      const activeMatch = scopedPool.find((p) => p.id === activeProjectId);
      if (activeMatch) return activeMatch;
    }
    return scopedPool[0] || null;
  };

  const autoClaimPendingFormaliaForUser = async (targetUser, preferredProject = null, candidateProjects = projects) => {
    const cleanEmail = String(targetUser?.email || '').trim().toLowerCase();
    if (!cleanEmail) return null;
    const pendingAnon = findClaimableAnonymousSession(cleanEmail);
    if (!pendingAnon || claimedAnonSessionsRef.current.has(pendingAnon.session_id)) {
      return null;
    }
    claimedAnonSessionsRef.current.add(pendingAnon.session_id);

    let targetProj = resolveDefaultProjectForUser(targetUser, candidateProjects, preferredProject);
    if (!targetProj && isSupabaseConfigured && supabase) {
      try {
        const { data: ownedRows } = await supabase
          .from('projects')
          .select('id, name, short_name, owner_email')
          .ilike('owner_email', cleanEmail)
          .limit(5);
        if (Array.isArray(ownedRows) && ownedRows.length > 0) {
          targetProj = ownedRows[0];
        }
      } catch (_) {}
    }

    const nextWsId = targetProj?.id ? `ws_proj_${targetProj.id}` : undefined;
    const nextWsName = targetProj?.name || targetUser.organization || undefined;

    // Pre-estampar síncronamente en localStorage antes del mount de FormalIAWorkspace para evitar condiciones de carrera
    if (nextWsId) {
      saveLocalFormaliaSession({
        ...pendingAnon,
        user_id: targetUser.id || null,
        user_email: cleanEmail,
        user_name: targetUser.name || cleanEmail,
        project_id: targetProj.id,
        workspace_id: nextWsId,
        workspace_name: nextWsName,
        saved_to_account: true,
        process_graph: {
          ...(pendingAnon.process_graph || {}),
          workspace_meta: {
            ...(pendingAnon.process_graph?.workspace_meta || {}),
            workspace_id: nextWsId,
            workspace_name: nextWsName,
            project_id: targetProj.id,
            canvas_title:
              pendingAnon.canvas_title ||
              pendingAnon.process_graph?.business_context?.process_name ||
              'Lienzo principal'
          }
        }
      });
      setActiveProjectId(targetProj.id);
    }

    const res = await claimFormaliaSession({
      anonymousSession: pendingAnon,
      account: {
        userId: targetUser.id || null,
        email: cleanEmail,
        name: targetUser.name || cleanEmail
      },
      projectId: targetProj?.id || null,
      workspaceId: nextWsId,
      workspaceName: nextWsName
    }).catch(() => null);

    if (res?.ok) {
      if (targetProj?.id) {
        setActiveProjectId(targetProj.id);
      }
      if (typeof window !== 'undefined' && res.session) {
        window.dispatchEvent(new CustomEvent('pathrimonio-formalia-claimed', { detail: res.session }));
      }
      notify(
        `Lienzo FORMALIA (${pendingAnon.session_id}) asignado a tu cuenta${
          targetProj?.name ? ` y al proyecto "${targetProj.name}"` : ''
        }.`
      );
      return res;
    }
    claimedAnonSessionsRef.current.delete(pendingAnon.session_id);
    return null;
  };

  useEffect(() => {
    if (!authReady || !workspaceReady || !currentUser?.email) return;
    autoClaimPendingFormaliaForUser(currentUser);
  }, [authReady, workspaceReady, currentUser?.email]);

  const applyProjectSyncState = (nextState) => {
    if (!nextState) return;
    if (Array.isArray(nextState.projects)) setProjects(nextState.projects);
    if (Array.isArray(nextState.actors)) setActors(nextState.actors);
    if (Array.isArray(nextState.stories)) setStories(nextState.stories);
    if (Array.isArray(nextState.dataModels)) setDataModels(nextState.dataModels);
    if (Array.isArray(nextState.interfaces)) setInterfaces(nextState.interfaces);
    if (Array.isArray(nextState.files)) setFiles(nextState.files);
  };

  useEffect(() => {
    if (!authReady || !workspaceReady || !isInternalStaffRole(currentUser?.role) || projects.length === 0) {
      return undefined;
    }
    const staffEmail = String(currentUser?.email || '').trim().toLowerCase() || 'staff';
    if (autoSyncedCatalogRef.current === staffEmail) return undefined;
    autoSyncedCatalogRef.current = staffEmail;

    let cancelled = false;
    autoSyncExistingCatalogProjects(
      {
        projects,
        actors,
        stories,
        interfaces,
        dataModels,
        files,
        implementationRequests
      },
      currentUser
    )
      .then((res) => {
        if (cancelled) return;
        if (res?.syncedIds?.length > 0) {
          applyProjectSyncState(res.nextState);
          notify(
            `Catálogo actualizado automáticamente (${res.syncedIds.join(', ')}) a ${PLATFORM_IMPLEMENTED_VERSION}.`,
            7000
          );
        }
      })
      .catch((error) => {
        autoSyncedCatalogRef.current = '';
        console.warn('[ProjectAutoSync]', error?.message || error);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, workspaceReady, currentUser?.email, currentUser?.role, projects.length]);

  const handleLoginSuccess = (user) => {
    const cleanEmail = String(user?.email || '').trim().toLowerCase();
    const existingDbUser = (portalUsers || []).find(
      (u) => String(u.email || '').trim().toLowerCase() === cleanEmail
    );
    const reconciledUser = existingDbUser
      ? {
          ...user,
          role: existingDbUser.role || user.role,
          credit_balance_usd: Number(existingDbUser.credit_balance_usd ?? user.credit_balance_usd ?? 0),
          bonus_role_months: Number(existingDbUser.bonus_role_months ?? user.bonus_role_months ?? 0),
          referral_code: existingDbUser.referral_code || user.referral_code || null,
          organization: existingDbUser.organization || user.organization || null
        }
      : user;

    setCurrentUser(reconciledUser);
    setShowLogin(false);
    const hashQuery = window.location.hash.split('?')[1] || '';
    const requestedTab = new URLSearchParams(hashQuery).get('tab');
    const pendingAnon = findClaimableAnonymousSession(cleanEmail);
    const defaultTab = (reconciledUser?.source === 'formalia' || pendingAnon) ? 'formalia' : 'actors';
    setActivePortalTab(requestedTab || defaultTab);

    let nextProjectsSnapshot = projects;
    let resolvedProject = null;

    if (reconciledUser.initialProjectName && (!reconciledUser.initialProject || !projects.some(p => p.id === reconciledUser.initialProject))) {
      const slug = (reconciledUser.initialProject || reconciledUser.initialProjectName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `proj-${Date.now().toString().slice(-4)}`;
      const newProj = {
        id: slug,
        name: reconciledUser.initialProjectName,
        shortName: reconciledUser.initialProjectName,
        subtitle: `Proyecto de ${reconciledUser.organization || reconciledUser.name}`,
        description: `Espacio de trabajo creado por ${reconciledUser.name} (${reconciledUser.organization || 'Organización'})`,
        category: 'Software a Medida',
        client: reconciledUser.organization || reconciledUser.name,
        icon: 'rocket_launch',
        color: 'amber',
        status: 'Fase Inicial / Requerimientos',
        version: 'v0.1.0',
        modules: ['General', 'Autenticación', 'Módulo Principal'],
        owner_email: cleanEmail,
        owner_user_id: reconciledUser.id || null,
        source_type: 'client_web'
      };
      nextProjectsSnapshot = [...projects, newProj];
      resolvedProject = newProj;
      setProjects(prev => [...prev, newProj]);
      setActiveProjectId(newProj.id);
      persist(saveProject(newProj), 'proyecto');
    } else if (reconciledUser.initialProject && projects.some(p => p.id === reconciledUser.initialProject)) {
      resolvedProject = projects.find(p => p.id === reconciledUser.initialProject) || null;
      setActiveProjectId(reconciledUser.initialProject);
    } else {
      resolvedProject = resolveDefaultProjectForUser(reconciledUser, nextProjectsSnapshot, null);
      if (resolvedProject?.id) {
        setActiveProjectId(resolvedProject.id);
      }
    }

    if (pendingAnon && (workspaceReady || resolvedProject)) {
      autoClaimPendingFormaliaForUser(reconciledUser, resolvedProject, nextProjectsSnapshot);
    }

    const portalRecord = {
      id: reconciledUser.id,
      email: cleanEmail,
      name: reconciledUser.name,
      organization: reconciledUser.organization || null,
      role: reconciledUser.role || 'Usuario Registrado',
      status: 'active',
      referral_code: reconciledUser.referral_code || null,
      credit_balance_usd: Number(reconciledUser.credit_balance_usd || 0),
      bonus_role_months: Number(reconciledUser.bonus_role_months || 0),
      source: reconciledUser.source || 'portal_signup',
      avatar: reconciledUser.avatar,
      color: reconciledUser.color || 'bg-amber-600',
      permissions: reconciledUser.permissions || ['read', 'write', 'create_workspace', 'implement_web', 'send_quote']
    };

    setPortalUsers(prev => {
      if (prev.some(u => u.email.toLowerCase() === cleanEmail)) return prev;
      return [...prev, portalRecord];
    });
    if (!existingDbUser && isSupabaseConfigured) {
      upsertPortalUserRecord(portalRecord).catch(() => {});
    }

    notify(`¡Bienvenido al Portal, ${reconciledUser.name}! Rol activo: ${reconciledUser.role}.`);
  };

  const handleLogout = async () => {
    autoSyncedCatalogRef.current = '';
    clearLocalFormaliaSession();
    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (error) {
        console.warn('[Supabase] signOut', error);
      }
    }
    setCurrentUser(null);
    setImplementationRequests([]);
    navigateToHome();
    notify('Sesión cerrada correctamente. Hasta pronto.');
  };

  // ── Project members (real portal users with access)
  const handleAddProjectMember = async ({ userId, role }) => {
    const projectId = activeProjectId === 'all' ? null : activeProjectId;
    if (!projectId) {
      notify('Seleccioná un proyecto específico para invitar usuarios.');
      return false;
    }

    try {
      const member = await addProjectMember({
        projectId,
        userId,
        role,
        invitedBy: currentPortalUser?.id || null
      });
      setProjectMembers((prev) => [...prev, member]);
      notify('Usuario agregado al proyecto.');
      return true;
    } catch (error) {
      console.error('[Supabase] addProjectMember', error);
      notify(`No se pudo agregar el usuario: ${error.message}`);
      return false;
    }
  };

  const handleRemoveProjectMember = async (membershipId) => {
    const previous = projectMembers;
    setProjectMembers((prev) => prev.filter((member) => member.id !== membershipId));

    try {
      await removeProjectMember(membershipId);
      notify('Usuario quitado del proyecto.');
      return true;
    } catch (error) {
      console.error('[Supabase] removeProjectMember', error);
      setProjectMembers(previous);
      notify(`No se pudo quitar el usuario: ${error.message}`);
      return false;
    }
  };

  // ── Story CRUD
  const handleSaveStory = (newStory) => {
    setStories(prev => [newStory, ...prev]);
    persist(saveStory(newStory), 'historia');
  };

  const handleUpdateStory = (updated) => {
    setStories(prev => prev.map(s => s.id === updated.id ? updated : s));
    persist(saveStory(updated), 'historia');
    notify(`Historia ${updated.id} actualizada.`);
  };

  const handleDuplicateStory = (story) => {
    const dup = {
      ...story,
      id: `US-${Math.floor(100 + Math.random() * 900)}`,
      role: `${story.role} (Copia)`,
      createdAt: 'Justo ahora',
      status: 'Draft'
    };
    setStories(prev => [dup, ...prev]);
    persist(saveStory(dup), 'historia');
    notify(`Historia duplicada → ${dup.id}`);
  };

  const handleDeleteStory = (id) => {
    if (!window.confirm(`¿Eliminar la historia ${id}?`)) return;
    setStories(prev => prev.filter(s => s.id !== id));
    persist(deleteStory(id), 'historia');
    notify(`Historia ${id} eliminada.`);
  };

  const handleToggleCriterion = (storyId, criterionId) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    const updated = {
      ...story,
      criteria: story.criteria.map((c, idx) =>
        (c.id === criterionId || idx === criterionId) ? { ...c, checked: !c.checked } : c
      )
    };
    setStories(prev => prev.map(s => s.id === storyId ? updated : s));
    persist(saveStory(updated), 'criterio');
  };

  // ── Interface CRUD & Handlers
  const resolveActorId = (roleName, projectId) => {
    const match = actors.find(
      (actor) => actor.name === roleName && (!actor.projectId || actor.projectId === projectId)
    );
    return match?.id || null;
  };

  const validDataModelIds = new Set(dataModels.map((model) => model.id));
  const validStoryIds = new Set(stories.map((story) => story.id));
  const validInterfaceIds = new Set(interfaces.map((item) => item.id));

  const handleSaveInterface = (newInterface) => {
    const nowIso = new Date().toISOString();
    const stamped = {
      ...newInterface,
      ultimaFechaModificacion: newInterface.ultimaFechaModificacion || nowIso,
      ultima_fecha_modificacion: newInterface.ultima_fecha_modificacion || nowIso
    };
    setInterfaces(prev => [stamped, ...prev]);
    persist(saveInterface(stamped, resolveActorId, validDataModelIds, validStoryIds), 'interfaz');
  };

  const handleUpdateInterface = (updated) => {
    const nowIso = new Date().toISOString();
    const stamped = {
      ...updated,
      ultimaFechaModificacion: nowIso,
      ultima_fecha_modificacion: nowIso
    };
    setInterfaces(prev => prev.map(i => i.id === stamped.id ? stamped : i));
    persist(saveInterface(stamped, resolveActorId, validDataModelIds, validStoryIds), 'interfaz');
    notify(`Interfaz ${stamped.id} (${stamped.fullName || stamped.title || stamped.id}) actualizada.`);
  };

  const handleDuplicateInterface = (item) => {
    const dupImages = Array.isArray(item.images) && item.images.length > 0
      ? [...item.images]
      : (item.image ? [item.image] : []);
    const nowIso = new Date().toISOString();

    const dup = {
      ...item,
      id: `INT-${Math.floor(10 + Math.random() * 90)}`,
      fullName: `${item.fullName || item.title} (Copia)`,
      title: `${item.title || item.fullName} (Copia)`,
      images: dupImages,
      image: dupImages[0] || item.image || null,
      status: 'Borrador',
      createdAt: 'Justo ahora',
      ultimaFechaModificacion: nowIso,
      ultima_fecha_modificacion: nowIso,
      version: `${item.version || 'v1.0'}-copy`
    };
    setInterfaces(prev => [dup, ...prev]);
    persist(saveInterface(dup, resolveActorId, validDataModelIds, validStoryIds), 'interfaz');
    notify(`Interfaz duplicada → ${dup.id}`);
  };

  const handleDeleteInterface = (id) => {
    if (!window.confirm(`¿Eliminar la interfaz ${id}?`)) return;
    setInterfaces(prev => prev.filter(i => i.id !== id));
    persist(deleteInterface(id), 'interfaz');
    notify(`Interfaz ${id} eliminada.`);
  };

  const handleQuickInterfaceStatus = (id, newStatus) => {
    const item = interfaces.find(i => i.id === id);
    if (!item) return;
    const nowIso = new Date().toISOString();
    const updated = {
      ...item,
      status: newStatus,
      reviewedBy: newStatus.includes('Aprobado') ? 'Cliente / PO' : item.reviewedBy,
      approvedAt: newStatus.includes('Aprobado') ? nowIso.split('T')[0] : item.approvedAt,
      ultimaFechaModificacion: nowIso,
      ultima_fecha_modificacion: nowIso
    };
    setInterfaces(prev => prev.map(i => i.id === id ? updated : i));
    persist(saveInterface(updated, resolveActorId, validDataModelIds, validStoryIds), 'interfaz');
    notify(`Estado de interfaz ${id} cambiado a "${newStatus}".`);
  };

  const handleConfirmClientReview = (itemsToApprove = []) => {
    if (!Array.isArray(itemsToApprove) || itemsToApprove.length === 0) {
      notify('No hay interfaces en revisión para confirmar.');
      return 0;
    }
    const nowIso = new Date().toISOString();
    const approvedAt = nowIso.split('T')[0];
    const updated = itemsToApprove.map(item => ({
      ...item,
      status: 'Aprobado por Cliente',
      reviewedBy: 'Cliente / PO',
      approvedAt,
      ultimaFechaModificacion: nowIso,
      ultima_fecha_modificacion: nowIso
    }));
    const updatedById = new Map(updated.map(item => [item.id, item]));
    setInterfaces(prev => prev.map(item => updatedById.get(item.id) || item));
    updated.forEach(item => {
      persist(saveInterface(item, resolveActorId, validDataModelIds, validStoryIds), 'interfaz');
    });
    notify(`${updated.length} ${updated.length === 1 ? 'interfaz marcada' : 'interfaces marcadas'} como revisadas por el cliente.`);
    return updated.length;
  };

  const handleToggleVisualCriterion = (interfaceId, criterionId) => {
    setInterfaces(prev => prev.map(i => {
      if (i.id !== interfaceId) return i;
      return {
        ...i,
        visualCriteria: (i.visualCriteria || []).map(c =>
          c.id === criterionId ? { ...c, checked: !c.checked } : c
        )
      };
    }));
  };

  // ── Interface module catalog CRUD
  const handleAddInterfaceModule = (name) => {
    const clean = (name || '').trim();
    if (!clean) return false;
    if (interfaceModules.some(m => m.toLowerCase() === clean.toLowerCase())) {
      notify(`El módulo "${clean}" ya existe.`);
      return false;
    }
    setInterfaceModules(prev => [...prev, clean]);
    persist(addInterfaceModule(clean), 'módulo');
    notify(`Módulo del Software "${clean}" agregado a la base de datos.`);
    return true;
  };

  const handleRenameInterfaceModule = (oldName, newName) => {
    const clean = (newName || '').trim();
    if (!clean || clean === oldName) return false;
    if (interfaceModules.some(m => m.toLowerCase() === clean.toLowerCase() && m !== oldName)) {
      notify(`Ya existe un módulo llamado "${clean}".`);
      return false;
    }
    setInterfaceModules(prev => prev.map(m => m === oldName ? clean : m));
    setInterfaces(prev => prev.map(i => i.module === oldName ? { ...i, module: clean } : i));
    setSelectedInterface(prev => (prev && prev.module === oldName ? { ...prev, module: clean } : prev));
    persist(renameInterfaceModule(oldName, clean), 'módulo');
    notify(`Módulo del Software "${oldName}" renombrado a "${clean}".`);
    return true;
  };

  const handleDeleteInterfaceModule = (name) => {
    const affected = interfaces.filter(i => i.module === name).length;
    setInterfaceModules(prev => prev.filter(m => m !== name));
    setInterfaces(prev => prev.map(i => i.module === name ? { ...i, module: 'Sin módulo' } : i));
    persist(deleteInterfaceModule(name), 'módulo');
    notify(
      `Módulo del Software "${name}" eliminado de la base de datos` +
      (affected > 0 ? ` — ${affected} interfaz(es) quedaron sin módulo.` : '.')
    );
  };

  // ── Project Handlers & Scoping por Rol (user/partner solo ven sus propios proyectos)
  const isStaffUser = isInternalStaffRole(currentUser?.role);
  const visibleProjects = useMemo(() => {
    if (!currentUser || isStaffUser) return projects;
    const cleanEmail = String(currentUser.email || '').trim().toLowerCase();
    const ownedReqProjectIds = new Set(
      implementationRequests
        .filter((r) => String(r.user_email || '').trim().toLowerCase() === cleanEmail)
        .map((r) => r.project_id)
    );
    const memberProjectIds = new Set(
      projectMembers
        .filter((m) => m.userId === currentUser.id)
        .map((m) => m.projectId)
    );
    return projects.filter(
      (p) =>
        String(p.owner_email || '').trim().toLowerCase() === cleanEmail ||
        ownedReqProjectIds.has(p.id) ||
        memberProjectIds.has(p.id) ||
        (currentUser.initialProject && p.id === currentUser.initialProject)
    );
  }, [projects, currentUser, isStaffUser, implementationRequests, projectMembers]);

  useEffect(() => {
    if (!currentUser || isStaffUser) return;
    if (visibleProjects.length > 0 && !visibleProjects.some((p) => p.id === activeProjectId)) {
      setActiveProjectId(visibleProjects[0].id);
    }
  }, [currentUser, isStaffUser, visibleProjects, activeProjectId]);

  const handleCreateProject = (newProject) => {
    const ownedProj = isStaffUser
      ? newProject
      : {
          ...newProject,
          owner_email: String(currentUser?.email || '').trim().toLowerCase() || null,
          owner_user_id: currentUser?.id || null,
          source_type: 'client_web'
        };
    setProjects(prev => [...prev, ownedProj]);
    setActiveProjectId(ownedProj.id);
    persist(saveProject(ownedProj), 'proyecto');
    notify(`Software "${ownedProj.name}" creado y activado.`);
  };

  const outdatedProjectsCount = useMemo(() => {
    if (!isStaffUser) return 0;
    const reports = buildProjectSyncReports({
      dbProjects: projects,
      dbActors: actors,
      dbStories: stories,
      dbInterfaces: interfaces,
      dbDataModels: dataModels,
      dbFiles: files,
      implementationRequests
    });
    return reports.filter(
      (r) => r.statusCode === 'outdated' || r.statusCode === 'uninitialized' || r.statusCode === 'client_diffs'
    ).length;
  }, [isStaffUser, projects, actors, stories, interfaces, dataModels, files, implementationRequests]);

  const handleSyncCatalogProject = async (projectId) => {
    try {
      const res = await syncProjectFromCodeCatalog(
        projectId,
        {
          projects,
          actors,
          stories,
          interfaces,
          dataModels,
          files,
          implementationRequests
        },
        currentUser
      );
      applyProjectSyncState(res.nextState);
      notify(
        `Proyecto "${projectId}" sincronizado a ${res.version} (+${res.syncedEntities} especificación(es) actualizadas).`
      );
      return res;
    } catch (error) {
      console.error('[ProjectSync] single', error);
      notify(`No se pudo sincronizar "${projectId}": ${error.message}`);
      return null;
    }
  };

  const handleSyncAllCatalogProjects = async () => {
    const reports = buildProjectSyncReports({
      dbProjects: projects,
      dbActors: actors,
      dbStories: stories,
      dbInterfaces: interfaces,
      dbDataModels: dataModels,
      dbFiles: files,
      implementationRequests
    });
    const pending = reports.filter((r) => r.isCatalogProject && r.needsSync);
    if (pending.length === 0) {
      notify('Todos los proyectos del catálogo ya están actualizados en Supabase.');
      return;
    }

    let rollingState = {
      projects,
      actors,
      stories,
      interfaces,
      dataModels,
      files,
      implementationRequests
    };
    const syncedNames = [];
    for (const rep of pending) {
      try {
        const res = await syncProjectFromCodeCatalog(rep.id, rollingState, currentUser);
        rollingState = { ...rollingState, ...res.nextState };
        syncedNames.push(`${rep.id} (${res.version})`);
      } catch (error) {
        console.warn(`[ProjectSync] ${rep.id}:`, error?.message || error);
      }
    }
    applyProjectSyncState(rollingState);
    if (syncedNames.length > 0) {
      notify(`Sincronizados ${syncedNames.length} proyecto(s): ${syncedNames.join(', ')}.`);
    } else {
      notify('No se pudo completar la sincronización de catálogos.');
    }
  };

  const handleUpdateProjectMeta = async (updatedProj) => {
    if (!updatedProj?.id) return;
    setProjects((prev) =>
      prev.some((p) => p.id === updatedProj.id)
        ? prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
        : [...prev, updatedProj]
    );
    try {
      await saveProject(updatedProj);
      await recordSystemAudit({
        actorEmail: currentUser?.email,
        actorRole: currentUser?.role,
        actionType: 'update_project_meta',
        targetId: updatedProj.id,
        summary: `Actualizó versión/estado de "${updatedProj.id}" a ${updatedProj.version || 'N/A'} (${updatedProj.status || 'Sin estado'}).`
      });
      notify(`Versión de "${updatedProj.shortName || updatedProj.name}" guardada (${updatedProj.version}).`);
    } catch (error) {
      console.error('[ProjectMeta]', error);
      notify(`Error guardando metadatos del proyecto: ${error.message}`);
    }
  };

  const activeProject = (activeProjectId === 'all' && isStaffUser)
    ? {
        id: 'all',
        name: 'Todos los Proyectos',
        subtitle: 'Vista Consolidada de Todo el Software',
        status: 'Consolidado',
        icon: 'folder_copy',
        category: 'Visión Global'
      }
    : (visibleProjects.find(p => p.id === activeProjectId) || visibleProjects[0] || {
        id: 'personal-draft',
        name: 'Mi Espacio PYME (Sin proyecto aún)',
        shortName: 'Mi Espacio PYME',
        subtitle: 'Genera tu proyecto desde FORMALIA -> Implementar en solución web',
        status: 'Pendiente',
        icon: 'rocket_launch',
        category: 'Solución Web'
      });

  const effectiveScopedProjectId = (!isStaffUser && visibleProjects.length === 0)
    ? '__none__'
    : (activeProject?.id || activeProjectId);

  // Stories scoped to active project
  const projectStories = (effectiveScopedProjectId === 'all' && isStaffUser)
    ? stories
    : stories.filter(s => {
        const pId = s.projectId || (s.id === 'US-301' ? 'portal-admin' : (s.id.startsWith('US-1') ? 'core-hub' : 'pathway'));
        return pId === effectiveScopedProjectId;
      });

  // Interfaces scoped to active project
  const projectInterfaces = (effectiveScopedProjectId === 'all' && isStaffUser)
    ? interfaces
    : interfaces.filter(i => {
        const pId = i.projectId || (i.id === 'INT-04' ? 'portal-admin' : i.id === 'INT-07' ? 'core-hub' : 'pathway');
        return pId === effectiveScopedProjectId;
      });

  // Data Models scoped to active project
  const projectDataModels = (effectiveScopedProjectId === 'all' && isStaffUser)
    ? dataModels
    : dataModels.filter(t => {
        const pId = t.projectId || (t.id === 'TBL-04' || t.id === 'TBL-05' ? 'portal-admin' : (t.id === 'TBL-06' || t.id === 'TBL-07' ? 'core-hub' : 'pathway'));
        return pId === effectiveScopedProjectId;
      });

  // Business Actors scoped to active project
  const projectActors = (effectiveScopedProjectId === 'all' && isStaffUser)
    ? actors
    : actors.filter(a => {
        const pId = a.projectId || (a.id === 'ACT-04' || a.id === 'ACT-05' || a.id === 'ACT-06' ? 'portal-admin' : (a.id === 'ACT-07' || a.id === 'ACT-08' || a.id === 'ACT-09' ? 'core-hub' : 'pathway'));
        return pId === effectiveScopedProjectId;
      });

  // Files & Deliverables scoped to active project
  const projectFiles = (effectiveScopedProjectId === 'all' && isStaffUser)
    ? files
    : files.filter(f => {
        const pId = f.projectId || (f.id === 'FILE-05' || f.id === 'FILE-06' || f.id === 'FILE-07' || f.id === 'FILE-08' ? 'portal-admin' : (f.id === 'FILE-09' || f.id === 'FILE-10' ? 'core-hub' : 'pathway'));
        return pId === effectiveScopedProjectId;
      });

  // Diffs post-envío en vivo respecto al snapshot enviado desde "Implementar en solución web"
  const activeImplementationRequest = useMemo(() => {
    return (
      implementationRequests.find((r) => r.project_id === effectiveScopedProjectId) ||
      null
    );
  }, [implementationRequests, effectiveScopedProjectId]);

  const { diffByActorId, diffByStoryId, diffByInterfaceId } = useMemo(() => {
    const byActor = {};
    const byStory = {};
    const byInterface = {};
    if (activeImplementationRequest) {
      const diffs = computeLiveDiffsAgainstBaseline(
        activeImplementationRequest,
        actors,
        stories,
        interfaces
      );
      diffs.forEach((d) => {
        if (d.entity_type === 'actor') byActor[d.entity_id] = d;
        else if (d.entity_type === 'story') byStory[d.entity_id] = d;
        else if (d.entity_type === 'interface') byInterface[d.entity_id] = d;
      });
    }
    return { diffByActorId: byActor, diffByStoryId: byStory, diffByInterfaceId: byInterface };
  }, [activeImplementationRequest, actors, stories, interfaces]);

  // Real team members of the active project (project_members joined with portal_users).
  const projectUsers = useMemo(() => {
    const users = portalUsers || [];
    if (users.length === 0) return [];

    const memberships = activeProjectId === 'all'
      ? projectMembers
      : projectMembers.filter((member) => member.projectId === activeProjectId);

    const seen = new Set();
    const result = [];

    memberships.forEach((membership) => {
      if (seen.has(membership.userId)) return;
      const user = users.find((item) => item.id === membership.userId);
      if (!user) return;
      seen.add(membership.userId);
      result.push({
        ...user,
        membershipId: membership.id,
        projectRole: membership.role
      });
    });

    return result;
  }, [portalUsers, projectMembers, activeProjectId]);

  const currentPortalUser = useMemo(() => {
    const email = String(currentUser?.email || '').toLowerCase();
    if (!email) return null;
    return (portalUsers || []).find(
      (item) => String(item.email || '').toLowerCase() === email
    ) || null;
  }, [portalUsers, currentUser]);

  // ── Data Model Handlers
  const handleSaveTable = (newTable) => {
    setDataModels(prev => [newTable, ...prev]);
    persist(saveDataModel(newTable, validStoryIds, validInterfaceIds), 'entidad');
    notify(`Entidad "${newTable.tableName}" registrada.`);
  };

  const handleUpdateTable = (updated) => {
    setDataModels(prev => prev.map(t => t.id === updated.id ? updated : t));
    persist(saveDataModel(updated, validStoryIds, validInterfaceIds), 'entidad');
    notify(`Entidad "${updated.tableName}" actualizada.`);
  };

  const handleDuplicateTable = (table) => {
    const clone = {
      ...table,
      id: `TBL-${Date.now().toString().slice(-4)}`,
      tableName: `${table.tableName}_copia`,
      name: `${table.name} (Copia)`,
      status: 'Borrador',
      version: 'v1.0'
    };
    setDataModels(prev => [clone, ...prev]);
    persist(saveDataModel(clone, validStoryIds, validInterfaceIds), 'entidad');
    notify(`Entidad "${table.tableName}" duplicada como "${clone.tableName}".`);
  };

  const handleDeleteTable = (id) => {
    setDataModels(prev => prev.filter(t => t.id !== id));
    persist(deleteDataModel(id), 'entidad');
    notify(`Entidad ${id} eliminada.`);
  };

  const handleQuickTableStatus = (table, newStatus) => {
    const current = dataModels.find(t => t.id === table.id);
    if (!current) return;
    const updated = {
      ...current,
      status: newStatus,
      approvedAt: newStatus.includes('Aprobado') ? new Date().toISOString().split('T')[0] : current.approvedAt
    };
    setDataModels(prev => prev.map(t => t.id === table.id ? updated : t));
    persist(saveDataModel(updated, validStoryIds, validInterfaceIds), 'entidad');
    notify(`Estado de "${table.tableName}" cambiado a "${newStatus}".`);
  };

  const handleImportTables = (newTables = []) => {
    if (!newTables || newTables.length === 0) return;
    const targetProjectId = (activeProjectId && activeProjectId !== 'all') ? activeProjectId : 'pathway';

    // Clear search query so new tables are immediately visible
    setDataModelSearchQuery('');

    const timestamp = Date.now();
    const incoming = newTables.map((table, idx) => ({
      ...table,
      id: table.id && !table.id.startsWith('TBL-temp') ? table.id : `TBL-${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}-${idx + 1}`,
      projectId: targetProjectId,
      author: 'Importador SQL',
      isNewlyImported: true,
      updatedAt: new Date().toISOString()
    }));

    setDataModels(prev => {
      const prevList = Array.isArray(prev) ? prev : [];

      // Tables belonging to other projects
      const otherProjectTables = prevList.filter(t => {
        const pId = t.projectId || (t.id === 'TBL-04' || t.id === 'TBL-05' ? 'portal-admin' : (t.id === 'TBL-06' || t.id === 'TBL-07' ? 'core-hub' : 'pathway'));
        return pId !== targetProjectId;
      });

      // Tables belonging to target project
      const currentProjectTables = prevList.filter(t => {
        const pId = t.projectId || (t.id === 'TBL-04' || t.id === 'TBL-05' ? 'portal-admin' : (t.id === 'TBL-06' || t.id === 'TBL-07' ? 'core-hub' : 'pathway'));
        return pId === targetProjectId;
      });

      const incomingByLowerName = new Map(incoming.map(t => [t.tableName.toLowerCase(), t]));

      // Update matching tables, keeping ID
      const updatedCurrent = currentProjectTables.map(existing => {
        const match = incomingByLowerName.get(existing.tableName.toLowerCase());
        if (match) {
          incomingByLowerName.delete(existing.tableName.toLowerCase());
          return {
            ...existing,
            ...match,
            id: existing.id,
            projectId: targetProjectId
          };
        }
        return existing;
      });

      // Brand new tables
      const brandNewTables = Array.from(incomingByLowerName.values());

      // Prepend brand new tables at the very top of the list so they are immediately visible on screen!
      const finalProjectTables = [...brandNewTables, ...updatedCurrent];
      const merged = [...finalProjectTables, ...otherProjectTables];

      try {
        localStorage.setItem(DATA_MODELS_STORAGE_KEY, JSON.stringify(merged));
      } catch (_) {}

      finalProjectTables.forEach(t => {
        persist(saveDataModel(t, validStoryIds, validInterfaceIds), 'entidad');
      });

      return merged;
    });

    notify(`¡${incoming.length} entidades de datos incorporadas correctamente al catálogo de "${activeProject?.name || 'Software Activo'}"!`);
  };

  // ── Business Actor Handlers
  const handleSaveActor = (newActor) => {
    setActors(prev => [newActor, ...prev]);
    persist(saveActor(newActor), 'actor');
  };

  const handleUpdateActor = (updatedActor) => {
    setActors(prev => prev.map(a => a.id === updatedActor.id ? updatedActor : a));
    persist(saveActor(updatedActor), 'actor');
    notify(`Actor "${updatedActor.name}" actualizado.`);
  };

  const handleDuplicateActor = (actorToClone) => {
    const cloned = {
      ...actorToClone,
      id: `ACT-${Date.now().toString().slice(-4)}`,
      name: `${actorToClone.name} (Copia)`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setActors(prev => [cloned, ...prev]);
    persist(saveActor(cloned), 'actor');
    notify(`Actor duplicado como "${cloned.name}".`);
  };

  const handleDeleteActor = (actorId) => {
    const actorToDelete = actors.find(a => a.id === actorId);
    if (!window.confirm(`¿Eliminar el rol "${actorToDelete?.name || actorId}"?`)) return;
    setActors(prev => prev.filter(a => a.id !== actorId));
    persist(deleteActor(actorId), 'actor');
    notify('Actor eliminado de la matriz.');
  };

  const handleSelectActorForStory = (actor) => {
    setPreselectedRoleForStory(actor.name);
    setActivePortalTab('stories');
    setIsCreateStoryModalOpen(true);
    notify(`Rol "${actor.name}" seleccionado. Completa los detalles de la Historia de Usuario.`);
  };

  const handleAddRoleFromInterface = (roleName) => {
    const trimmed = roleName?.trim();
    if (!trimmed) return;
    const pId = activeProjectId === 'all' ? 'pathway' : activeProjectId;
    setBuilderRoles(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
    setActors(prev => {
      const exists = prev.some(a =>
        (a.projectId === pId || (pId === 'pathway' && !a.projectId)) &&
        a.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return prev;
      const newActor = {
        id: `ACT-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
        projectId: pId,
        name: trimmed,
        category: 'Operaciones & Negocio',
        avatarIcon: 'badge',
        color: 'primary',
        description: 'Rol del negocio registrado desde especificación de interfaces.',
        permissionLevel: 'Operativo / Escritura',
        systemAreas: [],
        assignedWorker: '',
        assignedWorkerName: '',
        isPrimaryRole: false,
        status: 'Activo',
        createdAt: new Date().toISOString().split('T')[0]
      };
      persist(saveActor(newActor), 'actor');
      return [newActor, ...prev];
    });
  };

  // ── Promoción de Flujo FORMALIA a Artefactos SDD Reales del Proyecto
  const handlePromoteFormaliaToProject = (graph) => {
    const targetProjectId =
      activeProjectId && activeProjectId !== 'all'
        ? activeProjectId
        : (projects[0]?.id || 'pathway');
    const targetProj = projects.find((p) => p.id === targetProjectId);
    const bundle = compileProcessToPortalBundle(graph, targetProjectId);

    const upsertById = (existingList, incomingList) => {
      const incomingIds = new Set(incomingList.map((item) => item.id));
      const kept = existingList.filter((item) => !incomingIds.has(item.id));
      return [...incomingList, ...kept];
    };

    const nextActors = upsertById(actors, bundle.actors);
    const nextStories = upsertById(stories, bundle.stories);
    const nextModels = upsertById(dataModels, bundle.dataModels);
    const nextInterfaces = upsertById(interfaces, bundle.interfaces);

    setActors(nextActors);
    setStories(nextStories);
    setDataModels(nextModels);
    setInterfaces(nextInterfaces);
    setFiles((prev) => upsertById(prev, [bundle.file]));

    if (bundle.handoff?.process_name && !interfaceModules.includes(bundle.handoff.process_name)) {
      handleAddInterfaceModule(bundle.handoff.process_name);
    }

    setSearchQuery('');
    setActorSearchQuery('');
    setInterfaceSearchQuery('');
    setDataModelSearchQuery('');

    // Persistencia encadenada respetando llaves foráneas en Supabase
    const actorIdLookup = (roleName, projId) => {
      const found = nextActors.find(
        (a) => a.name === roleName && (!a.projectId || a.projectId === (projId || targetProjectId))
      );
      return found?.id || null;
    };
    const nextValidStoryIds = new Set(nextStories.map((s) => s.id));
    const nextValidModelIds = new Set(nextModels.map((m) => m.id));
    const nextValidInterfaceIds = new Set(nextInterfaces.map((i) => i.id));

    (async () => {
      try {
        for (const a of bundle.actors) {
          await saveActor(a);
        }
        for (const s of bundle.stories) {
          await saveStory(s);
        }
        for (const dm of bundle.dataModels) {
          await saveDataModel(dm, nextValidStoryIds, nextValidInterfaceIds);
        }
        for (const iface of bundle.interfaces) {
          await saveInterface(iface, actorIdLookup, nextValidModelIds, nextValidStoryIds);
        }
        await saveFile(bundle.file);
      } catch (err) {
        if (supabase) console.warn('[FORMALIA -> Portal] Persistencia parcial:', err?.message || err);
      }
    })();

    const projectName = targetProj?.shortName || targetProj?.name || targetProjectId;
    notify(
      `¡Flujo materializado en ${projectName}! ${bundle.actors.length} roles, ${bundle.stories.length} HUs, ${bundle.interfaces.length} interfaces y ${bundle.dataModels.length} tablas.`
    );

    return {
      projectId: targetProjectId,
      projectName,
      processName: bundle.handoff?.process_name || 'Flujo FORMALIA',
      actorsCount: bundle.actors.length,
      storiesCount: bundle.stories.length,
      interfacesCount: bundle.interfaces.length,
      tablesCount: bundle.dataModels.length
    };
  };

  // ── "Implementar en solución web" -> Crea Proyecto en Portal + Solicitud + Snapshot Inmutable
  const handleSubmitWebImplementation = async ({
    activeSession,
    blueprint,
    editedStories = null,
    combinedGraph,
    currentUser: modalUser
  }) => {
    const actorUser = modalUser || currentUser;
    const implResult = await createOrUpdateImplementationRequest({
      user: actorUser,
      session: activeSession,
      graph: combinedGraph,
      editedStories,
      webBlueprint: blueprint
    });

    const reqRecord = implResult.reqRecord || implResult.request;
    const projectObj = implResult.projectObj || implResult.project;
    const bundle = implResult.bundle || {};
    const safeActors = Array.isArray(bundle.actors) ? bundle.actors : [];
    const safeStories = Array.isArray(implResult.finalStories)
      ? implResult.finalStories
      : (Array.isArray(bundle.stories) ? bundle.stories : []);
    const safeModels = Array.isArray(bundle.dataModels) ? bundle.dataModels : [];
    const safeInterfaces = Array.isArray(bundle.interfaces) ? bundle.interfaces : [];
    const safeFiles = bundle.file ? [bundle.file] : [];

    const upsertById = (existingList = [], incomingList = []) => {
      const safeExisting = Array.isArray(existingList) ? existingList : [];
      const safeIncoming = Array.isArray(incomingList) ? incomingList : [];
      const incomingIds = new Set(safeIncoming.map((item) => item?.id).filter(Boolean));
      const kept = safeExisting.filter((item) => !incomingIds.has(item?.id));
      return [...safeIncoming, ...kept];
    };

    const nextActors = upsertById(actors, safeActors);
    const nextStories = upsertById(stories, safeStories);
    const nextModels = upsertById(dataModels, safeModels);
    const nextInterfaces = upsertById(interfaces, safeInterfaces);

    setProjects((prev) => upsertById(prev, [projectObj]));
    setActiveProjectId(projectObj.id);
    setActors(nextActors);
    setStories(nextStories);
    setDataModels(nextModels);
    setInterfaces(nextInterfaces);
    if (safeFiles.length > 0) {
      setFiles((prev) => upsertById(prev, safeFiles));
    }
    setImplementationRequests((prev) => [reqRecord, ...prev.filter((r) => r.id !== reqRecord.id)]);

    if (bundle.handoff?.process_name && !interfaceModules.includes(bundle.handoff.process_name)) {
      handleAddInterfaceModule(bundle.handoff.process_name);
    }

    const actorIdLookup = (roleName, projId) => {
      const found = nextActors.find(
        (a) => a.name === roleName && (!a.projectId || a.projectId === (projId || projectObj.id))
      );
      return found?.id || null;
    };
    const nextValidStoryIds = new Set(nextStories.map((s) => s.id));
    const nextValidModelIds = new Set(nextModels.map((m) => m.id));
    const nextValidInterfaceIds = new Set(nextInterfaces.map((i) => i.id));

    if (isSupabaseConfigured) {
      try {
        await saveProject(projectObj);
        for (const a of safeActors) await saveActor(a);
        for (const s of safeStories) await saveStory(s);
        for (const dm of safeModels) await saveDataModel(dm, nextValidStoryIds, nextValidInterfaceIds);
        for (const iface of safeInterfaces) await saveInterface(iface, actorIdLookup, nextValidModelIds, nextValidStoryIds);
        if (bundle.file) await saveFile(bundle.file);
      } catch (err) {
        console.warn('[Implementar en solución web] Persistencia parcial:', err?.message || err);
      }
    }

    setCurrentView('portal');
    setActivePortalTab('implementationStatus');
    window.location.hash = `#portal?tab=implementationStatus&project=${encodeURIComponent(projectObj.id)}`;
    notify(`¡Proyecto "${projectObj.name}" creado! Revisa tus 4 subvistas y el Estado de Solicitud en el Portal.`);
    return reqRecord;
  };

  const handleAdvanceRequestStatus = async (reqRecord, nextStatus, note = '') => {
    const updated = await advanceImplementationStatus(reqRecord, {
      nextStatus,
      reviewerUser: currentUser,
      note
    });
    setImplementationRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    notify(`Solicitud ${updated.id} movida a estado "${nextStatus}".`);
  };

  const handleReviewRequestDiff = async (reqRecord, liveDiffItem, decision, note = '') => {
    const updated = await reviewLiveModification(reqRecord, liveDiffItem, {
      decision,
      reviewerUser: currentUser,
      note
    });
    setImplementationRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    notify(`Cambio "${liveDiffItem.entity_label}" marcado como ${decision === 'approved' ? 'Aprobado' : 'Observado'}.`);
  };

  // ── Project File Handlers
  const handleSaveFile = (newFile) => {
    setFiles(prev => [newFile, ...prev]);
    persist(saveFile(newFile), 'archivo');
  };

  const handleUpdateFile = (updated) => {
    setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
    persist(saveFile(updated), 'archivo');
    notify(`Archivo "${updated.name}" actualizado.`);
  };

  const handleDeleteFile = (fileId) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (!window.confirm(`¿Eliminar el archivo "${fileToDelete?.name || fileId}" del repositorio?`)) return;
    setFiles(prev => prev.filter(f => f.id !== fileId));
    persist(deleteFile(fileId), 'archivo');
    notify('Archivo eliminado del repositorio.');
  };

  const handleDuplicateFile = (fileToClone) => {
    const ext = (fileToClone.name.split('.').pop() || 'bin');
    const base = fileToClone.name.replace(new RegExp(`\\.${ext}$`, 'i'), '');
    const cloned = {
      ...fileToClone,
      id: `FILE-${Date.now().toString().slice(-4)}`,
      name: `${base}_copia.${ext}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setFiles(prev => [cloned, ...prev]);
    persist(saveFile(cloned), 'archivo');
    notify(`Archivo duplicado como "${cloned.name}".`);
  };

  // ── Project tree handlers
  const handleRefreshProjectTree = async () => {
    if (activeProjectId === 'all' || !isSupabaseConfigured || treeLoading) return;
    setTreeLoading(true);
    try {
      const [nodes, records] = await Promise.all([
        fetchProjectTree(activeProjectId),
        fetchProjectFileRecords(activeProjectId)
      ]);
      setTreeNodes(nodes);
      setProjectFileRecords(records);
      notify('Árbol de archivos y registros actualizados.');
    } catch (error) {
      console.error('[Supabase] fetchProjectTree', error);
      notify(`No se pudo actualizar el árbol: ${error.message}`);
    } finally {
      setTreeLoading(false);
    }
  };

  const handleImportProjectTree = async ({ projectId, rootName, nodes }) => {
    try {
      const refreshed = await replaceProjectTree({ projectId, rootName, nodes });
      const summary = summarizeTree(nodes);
      setTreeNodes(refreshed);
      if (projectId !== activeProjectId) {
        setActiveProjectId(projectId);
      }
      notify(`Árbol "${rootName}" importado: ${summary.files} archivos y ${summary.folders} carpetas.`);
      setIsFolderImportOpen(false);
      return true;
    } catch (error) {
      console.error('[Supabase] replaceProjectTree', error);
      notify(`No se pudo importar el árbol: ${error.message}`);
      return false;
    }
  };

  const handleSelectTreeNode = (node) => {
    if (!node || node.isDirectory) return;
    setSelectedTreeNode(node);
    setIsTreeFileModalOpen(true);
  };

  const handleLoadFileRecords = async (nodeId) => {
    try {
      return await fetchFileRecords(nodeId);
    } catch (error) {
      console.error('[Supabase] fetchFileRecords', error);
      notify(`No se pudieron cargar los registros: ${error.message}`);
      return [];
    }
  };

  const handleAddFileRecord = async (payload) => {
    try {
      const record = await addFileRecord(payload);
      setProjectFileRecords((prev) => [...prev, record]);
      setTreeNodes((prev) => prev.map((node) => (
        node.id === payload.nodeId
          ? { ...node, recordCount: (node.recordCount || 0) + 1 }
          : node
      )));
      notify('Registro abstracto agregado.');
      return record;
    } catch (error) {
      console.error('[Supabase] addFileRecord', error);
      notify(`No se pudo agregar el registro: ${error.message}`);
      return null;
    }
  };

  const handleDeleteFileRecord = async (record) => {
    try {
      await deleteFileRecord(record.id);
      setProjectFileRecords((prev) => prev.filter((item) => item.id !== record.id));
      setTreeNodes((prev) => prev.map((node) => (
        node.id === record.nodeId
          ? { ...node, recordCount: Math.max((node.recordCount || 0) - 1, 0) }
          : node
      )));
      notify('Registro abstracto eliminado.');
      return true;
    } catch (error) {
      console.error('[Supabase] deleteFileRecord', error);
      notify(`No se pudo eliminar el registro: ${error.message}`);
      return false;
    }
  };

  // ── Filtered stories for feed
  const filteredStories = projectStories.filter(story => {
    const matchMod = activeModule === 'Todos' || story.module === activeModule;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchMod;
    const matchQ =
      story.id.toLowerCase().includes(q) ||
      story.role.toLowerCase().includes(q) ||
      story.action.toLowerCase().includes(q) ||
      story.benefit.toLowerCase().includes(q) ||
      story.priority.toLowerCase().includes(q) ||
      story.criteria.some(c => c.text.toLowerCase().includes(q));
    return matchMod && matchQ;
  });

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col selection:bg-primary selection:text-on-primary">

      {/* ── Toast ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high border border-primary text-white text-xs font-space shadow-2xl">
          <span className="material-symbols-outlined text-primary text-[18px]">info</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-on-surface-variant hover:text-white">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          VIEW: LANDING PAGE (Paleta 60-30-10: Gray #2B2D31 / Silver #D9DADC / Yellow #FFC93C)
      ══════════════════════════════════════════ */}
      {currentView === 'landing' && (
        <div className="flex flex-col w-full bg-[var(--bg-page)] text-[var(--text-primary)] min-h-screen selection:bg-[var(--accent-soft)] selection:text-[var(--text-primary)] transition-colors duration-200">
          <Navbar 
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigate={navigateToPath}
            onOpenPortal={() => navigateToPortal('login')}
            onOpenRegister={navigateToRegister} 
          />

          <main className="w-full">
            {/* Bloque 1: Hero — Propuesta directa y doble puerta de entrada */}
            <Hero
              onOpenPortal={() => navigateToPortal('login')}
              onNavigate={navigateToPath}
              theme={theme}
            />

            {/* Bloque 2: El diferenciador — Control por roles */}
            <RolesSection onNavigate={navigateToPath} />

            {/* Bloque 3: FormalIA — Demostración de autoridad (Antes / Después) */}
            <FormalIAShowcaseSection onNavigate={navigateToPath} />

            {/* Bloque 4: Programa de Socios + Propósito */}
            <PartnershipSection
              pricingConfig={pricingConfig}
              communityImpact={communityImpact}
              publishedProjects={publishedSiteProjects}
              onNavigate={navigateToPath}
            />

            {/* Bloque 5: El Cotizador Interactivo */}
            <InteractiveEstimator
              onOpenContact={() => setIsContactModalOpen(true)}
              onNavigate={navigateToPath}
              preloadedFormaliaData={preloadedFormaliaData}
              pricingConfig={pricingConfig}
              currentUser={currentUser}
            />

            {/* Bloque 6: FAQ de objeciones */}
            <FAQSection />
          </main>

          {/* Footer legal minimalista */}
          <Footer onNavigate={navigateToPath} />
          <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onNavigate={navigateToPath} />
        </div>
      )}

      {/* ══════════════════════════════════════════
          VIEW: FORMALIA (/formalia — SSG + SPA)
      ══════════════════════════════════════════ */}
      {currentView === 'formalia' && (
        <div className="flex flex-col w-full bg-[var(--bg-page)] text-[var(--text-primary)] min-h-screen selection:bg-[var(--accent-soft)] selection:text-[var(--text-primary)] transition-colors duration-200">
          <Navbar
            isSubpage
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigate={navigateToPath}
            onOpenPortal={() => navigateToPortal('login')}
            onOpenRegister={navigateToRegister}
          />

          <main className="w-full flex-1">
            <FormalIAWorkspace
              isStandalonePage
              currentUser={currentUser}
              portalProjects={visibleProjects}
              activeProjectId={activeProjectId}
              onBackHome={() => navigateToPath('/')}
              onOpenInPortal={() => navigateToPortal('login', 'formalia')}
              onSubmitImplementation={handleSubmitWebImplementation}
              onPreloadQuote={(data) => {
                setPreloadedFormaliaData(data);
                notify('Configuración de roles y canales precargada desde FORMALIA.');
                navigateToPath('/#cotizador');
              }}
            />
          </main>

          <Footer onOpenContact={() => setIsContactModalOpen(true)} onNavigate={navigateToPath} />
          <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onNavigate={navigateToPath} />
        </div>
      )}

      {/* ══════════════════════════════════════════
          VIEW: PATHCOM (/pathcom — SSG + SPA)
      ══════════════════════════════════════════ */}
      {currentView === 'pathcom' && (
        <div className="flex flex-col w-full bg-[var(--bg-page)] text-[var(--text-primary)] min-h-screen selection:bg-[var(--accent-soft)] selection:text-[var(--text-primary)] transition-colors duration-200">
          <Navbar
            isSubpage
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigate={navigateToPath}
            onOpenPortal={() => navigateToPortal('login')}
            onOpenRegister={navigateToRegister}
          />

          <main className="w-full flex-1">
            <PathcomConsole
              isStandalonePage
              currentUser={currentUser}
              onBackHome={() => navigateToPath('/')}
              onOpenPortal={() => navigateToPortal('login', 'pathcom')}
              onSiteProjectsChange={(list) =>
                setPublishedSiteProjects((list || []).filter((p) => p.is_published))
              }
              onNotify={notify}
            />
          </main>

          <Footer onOpenContact={() => setIsContactModalOpen(true)} onNavigate={navigateToPath} />
          <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onNavigate={navigateToPath} />
        </div>
      )}

      {/* ══════════════════════════════════════════
          VIEW: LEGAL DOCUMENTS (/legal/* — SSG + SPA)
      ══════════════════════════════════════════ */}
      {currentView === 'legal' && (
        <>
          <LegalPageRouter
            pathname={currentPath}
            theme={theme}
            onToggleTheme={toggleTheme}
            onNavigate={navigateToPath}
            onOpenPortal={() => navigateToPortal('login')}
            onOpenRegister={navigateToRegister}
            onOpenContact={() => setIsContactModalOpen(true)}
          />
          <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onNavigate={navigateToPath} />
        </>
      )}

      {/* ══════════════════════════════════════════
          VIEW: PORTAL — LOGIN GATE
      ══════════════════════════════════════════ */}
      {currentView === 'portal' && !authReady && (
        <PortalLoader message="Verificando sesión..." />
      )}

      {currentView === 'portal' && authReady && showLogin && (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          projects={projects}
          activeProjectId={activeProjectId}
          initialMode={loginMode}
          onBackToLanding={navigateToHome}
        />
      )}

      {currentView === 'portal' && authReady && !showLogin && currentUser && !workspaceReady && (
        <PortalLoader message="Cargando workspace desde Supabase..." />
      )}

      {/* ══════════════════════════════════════════
          VIEW: PORTAL — AUTHENTICATED APP
      ══════════════════════════════════════════ */}
      {currentView === 'portal' && authReady && !showLogin && currentUser && workspaceReady && (
        <div className="flex min-h-screen bg-surface">
          <Sidebar
            activeTab={activePortalTab}
            onSelectTab={setActivePortalTab}
            onReturnHome={navigateToHome}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            projects={visibleProjects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
            currentUser={currentUser}
            roleDefinitions={roleDefinitions}
            outdatedProjectsCount={outdatedProjectsCount}
          />

          <div className="lg:pl-64 flex flex-col flex-1 min-w-0 w-full">
            <Header
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              user={currentUser}
              onLogout={handleLogout}
              activeProject={activeProject}
              projectUsers={projectUsers}
              onInvite={activeProjectId !== 'all' && isActionAllowedForRole(currentUser?.role, 'canManageUsers', roleDefinitions) ? () => setIsInviteMemberModalOpen(true) : undefined}
            />

            <main className="w-full pt-14 flex-1 min-w-0">
              {!isTabAllowedForRole(currentUser?.role, activePortalTab, roleDefinitions) ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <span className="material-symbols-outlined text-[28px]">lock</span>
                  </div>
                  <h2 className="font-space text-lg text-white font-bold">
                    Acceso Restringido para Perfil {currentUser?.role || 'Usuario Registrado'}
                  </h2>
                  <p className="font-jakarta text-xs text-on-surface-variant leading-relaxed">
                    Tu rol actual (<strong className="text-white">{currentUser?.role || 'Usuario Registrado'}</strong>) no tiene permiso para acceder a esta sección. Puedes volver a tus módulos habilitados a continuación.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActivePortalTab('actors')}
                      className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant hover:border-primary text-xs font-space text-white transition-colors cursor-pointer"
                    >
                      Ver Actores & Roles
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePortalTab('stories')}
                      className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-space font-semibold cursor-pointer"
                    >
                      Ver Historias de Usuario
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {activePortalTab === 'stories' && (
                    <div className="flex flex-col w-full">
                      <ControlsBar
                        stories={projectStories}
                        activeModule={activeModule}
                        setActiveModule={setActiveModule}
                        onNotify={notify}
                        activeProject={activeProject}
                        onNavigateToActors={() => setActivePortalTab('actors')}
                        actorsCount={projectActors.length}
                        onOpenCreateModal={() => setIsCreateStoryModalOpen(true)}
                      />
                      <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                        <div className="w-full flex flex-col gap-y-4">
                          <StoryFeed
                            stories={filteredStories}
                            diffByStoryId={diffByStoryId}
                            onEditStory={(story) => { setSelectedStory(story); setIsDetailModalOpen(true); }}
                            onDuplicateStory={handleDuplicateStory}
                            onDeleteStory={handleDeleteStory}
                            onToggleCriterion={handleToggleCriterion}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onOpenCreateModal={() => setIsCreateStoryModalOpen(true)}
                          />
                        </div>
                      </div>

                      <StoryBuilder 
                        isOpen={isCreateStoryModalOpen}
                        onClose={() => setIsCreateStoryModalOpen(false)}
                        onSaveStory={handleSaveStory} 
                        onNotify={notify} 
                        activeProjectId={effectiveScopedProjectId === '__none__' ? activeProject.id : activeProjectId}
                        projectActors={projectActors}
                        selectedRole={preselectedRoleForStory}
                        onNavigateToActors={() => setActivePortalTab('actors')}
                      />
                    </div>
                  )}
                  {activePortalTab === 'actors' && (
                    <div className="flex flex-col w-full">
                      <ActorsControlsBar
                        actors={projectActors}
                        stories={projectStories}
                        projectUsers={projectUsers}
                        onManageUsers={activeProjectId !== 'all' && isActionAllowedForRole(currentUser?.role, 'canManageUsers', roleDefinitions) ? () => setIsInviteMemberModalOpen(true) : undefined}
                      />
                      <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                        <div className="w-full flex flex-col gap-y-4">
                          <ActorFeed
                            actors={projectActors}
                            stories={projectStories}
                            interfaces={projectInterfaces}
                            diffByActorId={diffByActorId}
                            onEditActor={(actor) => { setSelectedActor(actor); setIsActorModalOpen(true); }}
                            onDuplicateActor={handleDuplicateActor}
                            onDeleteActor={handleDeleteActor}
                            onSelectForStory={handleSelectActorForStory}
                            searchQuery={actorSearchQuery}
                            setSearchQuery={setActorSearchQuery}
                            onNotify={notify}
                            onOpenCreateModal={() => setIsCreateActorModalOpen(true)}
                          />
                        </div>
                      </div>

                      <ActorBuilder
                        isOpen={isCreateActorModalOpen}
                        onClose={() => setIsCreateActorModalOpen(false)}
                        onSaveActor={handleSaveActor}
                        onNotify={notify}
                        activeProjectId={effectiveScopedProjectId === '__none__' ? activeProject.id : activeProjectId}
                      />
                    </div>
                  )}
                  {activePortalTab === 'interfaces' && (
                    <div className="flex flex-col w-full">
                      <InterfaceControlsBar
                        interfaces={projectInterfaces}
                        stories={projectStories}
                        projectActors={projectActors}
                        onNotify={notify}
                        onConfirmClientReview={handleConfirmClientReview}
                        activeProject={activeProject}
                        onOpenRegisterModal={() => setIsRegisterInterfaceModalOpen(true)}
                      />
                      <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                        <div className="w-full flex flex-col gap-y-4">
                          <InterfaceFeed
                            interfaces={projectInterfaces}
                            projectActors={projectActors}
                            diffByInterfaceId={diffByInterfaceId}
                            modules={interfaceModules}
                            onEditInterface={(item) => { setSelectedInterface(item); setIsInterfaceModalOpen(true); }}
                            onDuplicateInterface={handleDuplicateInterface}
                            onDeleteInterface={handleDeleteInterface}
                            onQuickStatusChange={handleQuickInterfaceStatus}
                            onToggleCriterion={handleToggleVisualCriterion}
                            searchQuery={interfaceSearchQuery}
                            setSearchQuery={setInterfaceSearchQuery}
                            builderRoles={builderRoles}
                            onOpenRegisterModal={() => setIsRegisterInterfaceModalOpen(true)}
                          />
                        </div>
                      </div>

                      <InterfaceBuilder
                        isOpen={isRegisterInterfaceModalOpen}
                        onClose={() => setIsRegisterInterfaceModalOpen(false)}
                        onSaveInterface={handleSaveInterface}
                        onNotify={notify}
                        existingStories={projectStories}
                        activeProjectId={effectiveScopedProjectId === '__none__' ? activeProject.id : activeProjectId}
                        projectActors={projectActors}
                        modules={interfaceModules}
                        onAddModule={handleAddInterfaceModule}
                        onRenameModule={handleRenameInterfaceModule}
                        onDeleteModule={handleDeleteInterfaceModule}
                        existingInterfaces={interfaces}
                        dataModels={projectDataModels}
                        onAddRole={handleAddRoleFromInterface}
                        onRolesChange={setBuilderRoles}
                      />
                    </div>
                  )}
                  {activePortalTab === 'architecture' && (
                    <SoftwareArchitectureView
                      activeProject={activeProject}
                      activeProjectId={activeProjectId}
                      projects={projects}
                      onSelectProject={setActiveProjectId}
                      stories={projectStories}
                      interfaces={projectInterfaces}
                      dataModels={projectDataModels}
                      treeNodes={treeNodes}
                      fileRecords={projectFileRecords}
                      architectureArtifacts={architectureArtifacts}
                      archArtifactsLoading={archArtifactsLoading}
                      onSaveArchitectureArtifact={handleSaveArchitectureArtifact}
                      onRefreshArchitectureArtifacts={handleRefreshArchitectureArtifacts}
                      onNotify={notify}
                    />
                  )}
                  {activePortalTab === 'dataModel' && (
                    <div className="flex flex-col w-full">
                      <DataModelControlsBar
                        tables={projectDataModels}
                        stories={projectStories}
                        interfaces={projectInterfaces}
                        onNotify={notify}
                        activeProject={activeProject}
                        onOpenDERModal={() => setIsDERModalOpen(true)}
                        onOpenSQLModal={() => setIsSQLModalOpen(true)}
                        onOpenCreateModal={() => setIsCreateTableModalOpen(true)}
                      />
                      <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                        <div className="w-full flex flex-col gap-y-4">
                          <DataModelFeed
                            tables={projectDataModels}
                            onEditTable={(table) => { setSelectedTable(table); setIsTableModalOpen(true); }}
                            onDuplicateTable={handleDuplicateTable}
                            onDeleteTable={handleDeleteTable}
                            onQuickStatusChange={handleQuickTableStatus}
                            searchQuery={dataModelSearchQuery}
                            setSearchQuery={setDataModelSearchQuery}
                            onOpenCreateModal={() => setIsCreateTableModalOpen(true)}
                          />
                        </div>
                      </div>

                      <DataModelBuilder
                        isOpen={isCreateTableModalOpen}
                        onClose={() => setIsCreateTableModalOpen(false)}
                        onSaveTable={handleSaveTable}
                        onNotify={notify}
                        existingStories={projectStories}
                        existingInterfaces={projectInterfaces}
                        activeProjectId={activeProjectId}
                        onOpenSQLModal={() => setIsSQLModalOpen(true)}
                      />
                    </div>
                  )}
                  {activePortalTab === 'files' && (
                    <div className="flex flex-col w-full">
                      <FilesControlsBar
                        files={projectFiles}
                        treeNodes={treeNodes}
                        viewMode={filesViewMode}
                        onChangeViewMode={setFilesViewMode}
                        projects={projects}
                        activeProjectId={activeProjectId}
                        onSelectProject={setActiveProjectId}
                        activeProject={activeProject}
                        onNotify={notify}
                        onOpenUpload={() => setIsCreateFileModalOpen(true)}
                        onOpenFolderImport={() => setIsFolderImportOpen(true)}
                        onRefreshTree={handleRefreshProjectTree}
                        onOpenArchitecture={() => {
                          setActivePortalTab('architecture');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          notify(`Abriendo Arquitectura de Software (${activeProject?.name || 'Pathrimonio'})...`);
                        }}
                      />
                      <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                        <div className="w-full flex flex-col gap-y-4">
                          {filesViewMode === 'tree' ? (
                            <ProjectTreeView
                              nodes={treeNodes}
                              loading={treeLoading}
                              activeProject={activeProject}
                              activeProjectId={activeProjectId}
                              onSelectFile={handleSelectTreeNode}
                              onImportFolder={() => setIsFolderImportOpen(true)}
                              onRefresh={handleRefreshProjectTree}
                            />
                          ) : (
                            <FileFeed
                              files={projectFiles}
                              onPreviewFile={(f) => { setSelectedFile(f); setIsFileModalOpen(true); }}
                              onEditFile={(f) => { setSelectedFile(f); setIsFileModalOpen(true); }}
                              onDeleteFile={handleDeleteFile}
                              onDuplicateFile={handleDuplicateFile}
                              searchQuery={fileSearchQuery}
                              setSearchQuery={setFileSearchQuery}
                              onNotify={notify}
                              onOpenUpload={() => setIsCreateFileModalOpen(true)}
                            />
                          )}
                        </div>
                      </div>

                      <FileUploader
                        isOpen={isCreateFileModalOpen}
                        onClose={() => setIsCreateFileModalOpen(false)}
                        onSaveFile={handleSaveFile}
                        onNotify={notify}
                        activeProjectId={activeProjectId}
                      />

                      <FolderImportModal
                        isOpen={isFolderImportOpen}
                        onClose={() => setIsFolderImportOpen(false)}
                        projects={projects}
                        defaultProjectId={activeProjectId}
                        onImport={handleImportProjectTree}
                        onNotify={notify}
                      />

                      <TreeFileDetailModal
                        isOpen={isTreeFileModalOpen}
                        node={selectedTreeNode}
                        onClose={() => { setIsTreeFileModalOpen(false); setSelectedTreeNode(null); }}
                        onLoadRecords={handleLoadFileRecords}
                        onAddRecord={handleAddFileRecord}
                        onDeleteRecord={handleDeleteFileRecord}
                        onNotify={notify}
                      />
                    </div>
                  )}
                  {activePortalTab === 'formalia' && (
                    <FormalIAPortalView
                      currentUser={currentUser}
                      activeProjectId={activeProjectId}
                      activeProjectName={activeProject?.shortName || activeProject?.name || 'Proyecto Activo'}
                      projects={visibleProjects}
                      onSaveToProjectFiles={handleSaveFile}
                      onPromoteGraphToProject={handlePromoteFormaliaToProject}
                      onSubmitImplementation={handleSubmitWebImplementation}
                      onPreloadQuote={(data) => {
                        setPreloadedFormaliaData(data);
                        notify('Blueprint web y roles precargados en el Cotizador.');
                        navigateToPath('/#cotizador');
                      }}
                      onNavigatePortalTab={(tabId) => {
                        setActivePortalTab(tabId);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onNotify={notify}
                    />
                  )}
                  {activePortalTab === 'pathcom' && (
                    <PathcomConsole
                      currentUser={currentUser}
                      onOpenPortal={() => navigateToPortal('login', 'pathcom')}
                      onSiteProjectsChange={(list) =>
                        setPublishedSiteProjects((list || []).filter((p) => p.is_published))
                      }
                      onNotify={notify}
                    />
                  )}
                  {activePortalTab === 'implementationStatus' && (
                    <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                      <ImplementationTrackerView
                        currentUser={currentUser}
                        requests={implementationRequests}
                        projects={visibleProjects}
                        actors={actors}
                        stories={stories}
                        interfaces={interfaces}
                        activeProjectId={activeProjectId}
                        onSelectProject={setActiveProjectId}
                        onNavigateTab={(tabId) => {
                          setActivePortalTab(tabId);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        canReview={isStaffUser}
                        onAdvanceStatus={handleAdvanceRequestStatus}
                        onReviewDiff={handleReviewRequestDiff}
                      />
                    </div>
                  )}
                  {activePortalTab === 'partnerPanel' && (
                    <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                      <PartnerDashboardView
                        currentUser={currentUser}
                        portalUsers={portalUsers}
                        projects={visibleProjects}
                        implementationRequests={implementationRequests}
                        pricingConfig={pricingConfig}
                        onUserUpdated={(patch) => {
                          setCurrentUser((prev) => (prev ? { ...prev, ...patch } : prev));
                          const cleanEmail = String(currentUser?.email || '').toLowerCase();
                          handleUpdatePortalUsers(
                            portalUsers.map((u) =>
                              String(u.email || '').toLowerCase() === cleanEmail ? { ...u, ...patch } : u
                            )
                          );
                        }}
                        onNavigateTab={(tabId) => {
                          setActivePortalTab(tabId);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onNotify={notify}
                      />
                    </div>
                  )}
                  {activePortalTab === 'presalesReview' && (
                    <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                      <CollaboratorPresalesView
                        currentUser={currentUser}
                        isAdmin={isActionAllowedForRole(currentUser?.role, 'canEditPricingConfig', roleDefinitions)}
                        implementationRequests={implementationRequests}
                        actors={actors}
                        stories={stories}
                        interfaces={interfaces}
                        onAdvanceImplementationStatus={handleAdvanceRequestStatus}
                        onReviewModification={handleReviewRequestDiff}
                        onSelectProject={setActiveProjectId}
                        onNavigateTab={(tabId) => {
                          setActivePortalTab(tabId);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onNotify={notify}
                      />
                    </div>
                  )}
                  {activePortalTab === 'projectsManager' && (
                    <div className="w-full px-3 sm:px-4 lg:px-5 py-4 sm:py-5">
                      <ProjectsManagementView
                        currentUser={currentUser}
                        isAdmin={isActionAllowedForRole(currentUser?.role, 'canManageProjects', roleDefinitions)}
                        projects={visibleProjects}
                        actors={actors}
                        stories={stories}
                        interfaces={interfaces}
                        dataModels={dataModels}
                        files={files}
                        implementationRequests={implementationRequests}
                        onSyncCatalogProject={
                          isActionAllowedForRole(currentUser?.role, 'canManageProjects', roleDefinitions)
                            ? handleSyncCatalogProject
                            : undefined
                        }
                        onSyncAllCatalogProjects={
                          isActionAllowedForRole(currentUser?.role, 'canManageProjects', roleDefinitions)
                            ? handleSyncAllCatalogProjects
                            : undefined
                        }
                        onUpdateProjectMeta={
                          isActionAllowedForRole(currentUser?.role, 'canManageProjects', roleDefinitions)
                            ? handleUpdateProjectMeta
                            : undefined
                        }
                        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
                        onSelectProject={setActiveProjectId}
                        onNavigateTab={(tabId) => {
                          setActivePortalTab(tabId);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onNotify={notify}
                      />
                    </div>
                  )}
                  {activePortalTab === 'backlog'   && <BacklogView stories={projectStories} />}
                  {activePortalTab === 'sprints'   && <SprintsView />}
                  {activePortalTab === 'docs'      && <DocsView />}
                  {activePortalTab === 'settings'  && (
                    <AdminUsersView
                      currentUser={currentUser}
                      portalUsers={portalUsers}
                      onUpdatePortalUsers={handleUpdatePortalUsers}
                      roleDefinitions={roleDefinitions}
                      onUpdateRoleDefinitions={handleUpdateRoleDefinitions}
                      pricingConfig={pricingConfig}
                      communityImpact={communityImpact}
                      onSavePricingConfig={handleSavePricingConfig}
                      onSaveCommunityImpact={handleSaveCommunityImpact}
                      onDeletePortalUser={handleDeletePortalUser}
                      onNotify={notify}
                    />
                  )}
                </>
              )}
            </main>
          </div>

          <StoryDetailModal
            story={selectedStory}
            isOpen={isDetailModalOpen}
            onClose={() => { setIsDetailModalOpen(false); setSelectedStory(null); }}
            onUpdateStory={handleUpdateStory}
            projectActors={projectActors}
          />

          <ActorDetailModal
            actor={selectedActor}
            isOpen={isActorModalOpen}
            onClose={() => { setIsActorModalOpen(false); setSelectedActor(null); }}
            onUpdateActor={handleUpdateActor}
            existingStories={projectStories}
            onNotify={notify}
          />

          <InterfaceDetailModal
            item={selectedInterface}
            isOpen={isInterfaceModalOpen}
            onClose={() => { setIsInterfaceModalOpen(false); setSelectedInterface(null); }}
            onUpdateInterface={handleUpdateInterface}
            existingStories={projectStories}
            projectActors={projectActors}
            dataModels={projectDataModels}
            existingInterfaces={projectInterfaces}
            onAddRole={handleAddRoleFromInterface}
            onNotify={notify}
          />

          <DataModelDetailModal
            table={selectedTable}
            isOpen={isTableModalOpen}
            onClose={() => { setIsTableModalOpen(false); setSelectedTable(null); }}
            onUpdateTable={handleUpdateTable}
            existingStories={projectStories}
            existingInterfaces={projectInterfaces}
          />

          <DERModal
            isOpen={isDERModalOpen}
            onClose={() => setIsDERModalOpen(false)}
            tables={projectDataModels}
            projectName={activeProject?.name}
            onNotify={notify}
          />

          <SQLScriptModal
            isOpen={isSQLModalOpen}
            onClose={() => setIsSQLModalOpen(false)}
            onImportTables={handleImportTables}
            activeProject={activeProject}
            onNotify={notify}
          />

          <NewProjectModal
            isOpen={isNewProjectModalOpen}
            onClose={() => setIsNewProjectModalOpen(false)}
            onCreateProject={handleCreateProject}
            onNotify={notify}
          />

          <FileDetailModal
            file={selectedFile}
            isOpen={isFileModalOpen}
            onClose={() => { setIsFileModalOpen(false); setSelectedFile(null); }}
            onUpdateFile={handleUpdateFile}
            onNotify={notify}
          />

          <InviteProjectMemberModal
            isOpen={isInviteMemberModalOpen}
            onClose={() => setIsInviteMemberModalOpen(false)}
            project={activeProject}
            portalUsers={portalUsers}
            projectUsers={projectUsers}
            currentUser={currentUser}
            onAdd={handleAddProjectMember}
            onRemove={handleRemoveProjectMember}
          />
        </div>
      )}
      {/* ── Banner y Modal de Consentimiento Real de Cookies (en vistas públicas) ── */}
      {(currentView === 'landing' || currentView === 'legal') && (
        <>
          <CookieBanner onNavigate={navigateToPath} />
          <CookiePreferencesModal onNavigate={navigateToPath} />
        </>
      )}
    </div>
  );
}
