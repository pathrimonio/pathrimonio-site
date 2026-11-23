import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_STORIES } from './data/initialStories';
import { INITIAL_INTERFACES, INTERFACE_MODULE_OPTIONS } from './data/initialInterfaces';
import { INITIAL_PROJECTS } from './data/initialProjects';
import { INITIAL_DATA_MODELS } from './data/initialDataModels';
import { INITIAL_ACTORS } from './data/initialActors';
import { INITIAL_FILES } from './data/initialFiles';
import { mapSupabaseUser, DEMO_USERS } from './auth/authConfig';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  fetchWorkspace,
  saveStory,
  deleteStory,
  saveInterface,
  deleteInterface,
  saveDataModel,
  deleteDataModel,
  saveActor,
  deleteActor,
  saveFile,
  deleteFile,
  saveProject,
  addInterfaceModule,
  renameInterfaceModule,
  deleteInterfaceModule,
  addProjectMember,
  removeProjectMember
} from './lib/supabaseData';

// Landing Components
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import ServicesSection from './components/landing/ServicesSection';
import Pillars from './components/landing/Pillars';
import InteractiveEstimator from './components/landing/InteractiveEstimator';
import PathwaySection from './components/landing/PathwaySection';
import FutureProducts from './components/landing/FutureProducts';
import Manifesto from './components/landing/Manifesto';
import Footer from './components/landing/Footer';
import ContactModal from './components/landing/ContactModal';

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
import NewProjectModal from './components/portal/NewProjectModal';
import InviteProjectMemberModal from './components/portal/InviteProjectMemberModal';
import { BacklogView, SprintsView, DocsView, SettingsView } from './components/portal/ExtraViews';

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

export default function App() {
  // ── View state: 'landing' | 'portal'
  const [currentView, setCurrentView] = useState(() =>
    window.location.hash === '#portal' ? 'portal' : 'landing'
  );

  // ── Auth state (Supabase Auth)
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [workspaceReady, setWorkspaceReady] = useState(!isSupabaseConfigured);
  const [showLogin, setShowLogin] = useState(false);

  // ── Portal nav
  const [activePortalTab, setActivePortalTab] = useState('stories');
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

  // ── Portal users (team directory)
  const [portalUsers, setPortalUsers] = useState(() =>
    DEMO_USERS.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      color: user.color,
      permissions: user.permissions
    }))
  );

  // ── Real project memberships (portal_users with access per project)
  const [projectMembers, setProjectMembers] = useState([]);

  // ── Filters & Search
  const [activeModule, setActiveModule] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [interfaceSearchQuery, setInterfaceSearchQuery] = useState('');
  const [dataModelSearchQuery, setDataModelSearchQuery] = useState('');
  const [actorSearchQuery, setActorSearchQuery] = useState('');
  const [fileSearchQuery, setFileSearchQuery] = useState('');

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

  // Sync URL hash & query parameters for deep linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#portal')) {
        setCurrentView('portal');

        // Parse query params after #portal?
        const qIndex = hash.indexOf('?');
        if (qIndex !== -1) {
          const queryString = hash.slice(qIndex + 1);
          const params = new URLSearchParams(queryString);
          const tab = params.get('tab');
          const roleParam = params.get('role');
          const projectParam = params.get('project');

          if (tab) setActivePortalTab(tab);
          if (roleParam) {
            setPreselectedRoleForStory(decodeURIComponent(roleParam));
          }
          if (projectParam && projects.some(p => p.id === projectParam)) {
            setActiveProjectId(projectParam);
          }
        }
      } else {
        setCurrentView('landing');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [projects]);

  // Show login gate when user enters portal without a session
  useEffect(() => {
    if (currentView === 'portal' && authReady && !currentUser) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [currentView, currentUser, authReady]);

  const notify = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(prev => prev === msg ? null : prev), 4000);
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

  // ── Supabase: fire-and-forget persistence with user feedback
  const persist = (operation, label) => {
    if (!supabase) return;
    Promise.resolve(operation).catch((error) => {
      console.error(`[Supabase] ${label}`, error);
      notify(`Error al guardar en Supabase (${label}): ${error.message}`);
    });
  };

  const navigateToPortal = () => {
    window.location.hash = '#portal';
    setCurrentView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.location.hash = '#home';
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Auth handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setShowLogin(false);
    notify(`¡Bienvenido al Portal, ${user.name}!`);
  };

  const handleLogout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('[Supabase] signOut', error);
      }
    }
    setCurrentUser(null);
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
    setInterfaces(prev => [newInterface, ...prev]);
    persist(saveInterface(newInterface, resolveActorId, validDataModelIds, validStoryIds), 'interfaz');
  };

  const handleUpdateInterface = (updated) => {
    setInterfaces(prev => prev.map(i => i.id === updated.id ? updated : i));
    persist(saveInterface(updated, resolveActorId, validDataModelIds, validStoryIds), 'interfaz');
    notify(`Interfaz ${updated.id} (${updated.fullName || updated.title || updated.id}) actualizada.`);
  };

  const handleDuplicateInterface = (item) => {
    const dupImages = Array.isArray(item.images) && item.images.length > 0
      ? [...item.images]
      : (item.image ? [item.image] : []);

    const dup = {
      ...item,
      id: `INT-${Math.floor(10 + Math.random() * 90)}`,
      fullName: `${item.fullName || item.title} (Copia)`,
      title: `${item.title || item.fullName} (Copia)`,
      images: dupImages,
      image: dupImages[0] || item.image || null,
      status: 'Borrador',
      createdAt: 'Justo ahora',
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
    const updated = {
      ...item,
      status: newStatus,
      reviewedBy: newStatus.includes('Aprobado') ? 'Cliente / PO' : item.reviewedBy,
      approvedAt: newStatus.includes('Aprobado') ? new Date().toISOString().split('T')[0] : item.approvedAt
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
    const approvedAt = new Date().toISOString().split('T')[0];
    const updated = itemsToApprove.map(item => ({
      ...item,
      status: 'Aprobado por Cliente',
      reviewedBy: 'Cliente / PO',
      approvedAt
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

  // ── Project Handlers & Scoping
  const handleCreateProject = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    persist(saveProject(newProject), 'proyecto');
    notify(`Software "${newProject.name}" creado y activado.`);
  };

  const activeProject = activeProjectId === 'all'
    ? {
        id: 'all',
        name: 'Todos los Proyectos',
        subtitle: 'Vista Consolidada de Todo el Software',
        status: 'Consolidado',
        icon: 'folder_copy',
        category: 'Visión Global'
      }
    : (projects.find(p => p.id === activeProjectId) || projects[0]);

  // Stories scoped to active project
  const projectStories = activeProjectId === 'all'
    ? stories
    : stories.filter(s => {
        const pId = s.projectId || (s.id === 'US-301' ? 'portal-admin' : (s.id.startsWith('US-1') ? 'core-hub' : 'pathway'));
        return pId === activeProjectId;
      });

  // Interfaces scoped to active project
  const projectInterfaces = activeProjectId === 'all'
    ? interfaces
    : interfaces.filter(i => {
        const pId = i.projectId || (i.id === 'INT-04' ? 'portal-admin' : i.id === 'INT-07' ? 'core-hub' : 'pathway');
        return pId === activeProjectId;
      });

  // Data Models scoped to active project
  const projectDataModels = activeProjectId === 'all'
    ? dataModels
    : dataModels.filter(t => {
        const pId = t.projectId || (t.id === 'TBL-04' || t.id === 'TBL-05' ? 'portal-admin' : (t.id === 'TBL-06' || t.id === 'TBL-07' ? 'core-hub' : 'pathway'));
        return pId === activeProjectId;
      });

  // Business Actors scoped to active project
  const projectActors = activeProjectId === 'all'
    ? actors
    : actors.filter(a => {
        const pId = a.projectId || (a.id === 'ACT-04' || a.id === 'ACT-05' || a.id === 'ACT-06' ? 'portal-admin' : (a.id === 'ACT-07' || a.id === 'ACT-08' || a.id === 'ACT-09' ? 'core-hub' : 'pathway'));
        return pId === activeProjectId;
      });

  // Files & Deliverables scoped to active project
  const projectFiles = activeProjectId === 'all'
    ? files
    : files.filter(f => {
        const pId = f.projectId || (f.id === 'FILE-05' || f.id === 'FILE-06' || f.id === 'FILE-07' || f.id === 'FILE-08' ? 'portal-admin' : (f.id === 'FILE-09' || f.id === 'FILE-10' ? 'core-hub' : 'pathway'));
        return pId === activeProjectId;
      });

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
          VIEW: LANDING PAGE
      ══════════════════════════════════════════ */}
      {currentView === 'landing' && (
        <div className="flex flex-col w-full">
          <Navbar onOpenContact={() => setIsContactModalOpen(true)} onOpenPortal={navigateToPortal} />

          <main className="w-full">
            <Hero onOpenContact={() => setIsContactModalOpen(true)} />
            <ServicesSection />
            <Pillars />
            <InteractiveEstimator onOpenContact={() => setIsContactModalOpen(true)} />
            <PathwaySection />
            <FutureProducts onOpenContact={() => setIsContactModalOpen(true)} />
            <Manifesto />

            {/* Pre-Footer CTA */}
            <section className="w-full py-20 bg-surface border-t border-outline-variant/60">
              <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-6">
                <div className="w-12 h-1 bg-primary rounded-full"></div>
                <h2 className="font-space text-3xl sm:text-4xl text-white font-bold tracking-tight max-w-3xl">
                  ¿Listo para hacer realidad tu próxima idea o proyecto de software?
                </h2>
                <p className="font-jakarta text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
                  En Pathrimonio combinamos diseño centrado en el usuario, ingeniería de alto rendimiento y metodologías ágiles para construir aplicaciones móviles y plataformas web que marcan la diferencia.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <a
                    href="#cotizador"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:shadow-[0_0_36px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">calculate</span>
                    Cotizar mi Software ($1/día)
                  </a>
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs font-semibold tracking-wide hover:bg-surface-container-highest transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Iniciar Conversación
                  </button>
                  <a
                    href="#pathway"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container-high border border-outline-variant text-white hover:text-primary font-space text-xs font-semibold tracking-wide hover:bg-surface-container-highest transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">route</span>
                    Conocer Pathway (App MVP)
                  </a>
                </div>
              </div>
            </section>
          </main>

          <Footer onOpenContact={() => setIsContactModalOpen(true)} />
          <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
        </div>
      )}

      {/* ══════════════════════════════════════════
          VIEW: PORTAL — LOGIN GATE
      ══════════════════════════════════════════ */}
      {currentView === 'portal' && !authReady && (
        <PortalLoader message="Verificando sesión..." />
      )}

      {currentView === 'portal' && authReady && showLogin && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
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
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          />

          <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
            <Header
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              user={currentUser}
              onLogout={handleLogout}
              activeProject={activeProject}
              projectUsers={projectUsers}
              onInvite={activeProjectId !== 'all' ? () => setIsInviteMemberModalOpen(true) : undefined}
            />

            <main className="w-full pt-14 flex-1">
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
                  <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="w-full flex flex-col gap-y-4">
                      <StoryFeed
                        stories={filteredStories}
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
                    activeProjectId={activeProjectId}
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
                    activeProject={activeProject}
                    projectUsers={projectUsers}
                    onManageUsers={activeProjectId !== 'all' ? () => setIsInviteMemberModalOpen(true) : undefined}
                    onNotify={notify}
                    onNavigateToStories={() => setActivePortalTab('stories')}
                    onOpenCreateModal={() => setIsCreateActorModalOpen(true)}
                  />
                  <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="w-full flex flex-col gap-y-4">
                      <ActorFeed
                        actors={projectActors}
                        stories={projectStories}
                        interfaces={projectInterfaces}
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
                    activeProjectId={activeProjectId}
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
                  <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="w-full flex flex-col gap-y-4">
                      <InterfaceFeed
                        interfaces={projectInterfaces}
                        projectActors={projectActors}
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
                    activeProjectId={activeProjectId}
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
                  <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                    activeProject={activeProject}
                    onNotify={notify}
                    onOpenUpload={() => setIsCreateFileModalOpen(true)}
                  />
                  <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="w-full flex flex-col gap-y-4">
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
                    </div>
                  </div>

                  <FileUploader
                    isOpen={isCreateFileModalOpen}
                    onClose={() => setIsCreateFileModalOpen(false)}
                    onSaveFile={handleSaveFile}
                    onNotify={notify}
                    activeProjectId={activeProjectId}
                  />
                </div>
              )}
              {activePortalTab === 'backlog'   && <BacklogView stories={projectStories} />}
              {activePortalTab === 'sprints'   && <SprintsView />}
              {activePortalTab === 'docs'      && <DocsView />}
              {activePortalTab === 'settings'  && <SettingsView />}
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
    </div>
  );
}
