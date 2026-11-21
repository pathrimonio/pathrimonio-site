import React, { useState, useEffect } from 'react';
import { INITIAL_STORIES } from './data/initialStories';
import { authenticateUser, saveSession, loadSession, clearSession } from './auth/authConfig';

// Landing Components
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import ServicesSection from './components/landing/ServicesSection';
import Pillars from './components/landing/Pillars';
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
import { BacklogView, SprintsView, DocsView, SettingsView } from './components/portal/ExtraViews';

const STORAGE_KEY = 'pathrimonio_stories_v1';

export default function App() {
  // ── View state: 'landing' | 'portal'
  const [currentView, setCurrentView] = useState(() =>
    window.location.hash === '#portal' ? 'portal' : 'landing'
  );

  // ── Auth state
  const [currentUser, setCurrentUser] = useState(() => loadSession());
  const [showLogin, setShowLogin] = useState(false);

  // ── Portal nav
  const [activePortalTab, setActivePortalTab] = useState('stories');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Stories
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_STORIES;
  });

  // ── Filters
  const [activeModule, setActiveModule] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Detail modal
  const [selectedStory, setSelectedStory] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // ── Contact modal (landing)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // ── Toast
  const [toastMessage, setToastMessage] = useState(null);

  // Persist stories
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stories)); } catch (_) {}
  }, [stories]);

  // Sync URL hash
  useEffect(() => {
    const handleHash = () => {
      setCurrentView(window.location.hash === '#portal' ? 'portal' : 'landing');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Show login gate when user enters portal without a session
  useEffect(() => {
    if (currentView === 'portal' && !currentUser) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [currentView, currentUser]);

  const notify = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(prev => prev === msg ? null : prev), 4000);
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
    saveSession(user);
    setCurrentUser(user);
    setShowLogin(false);
    notify(`¡Bienvenido al Portal, ${user.name}!`);
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    navigateToHome();
    notify('Sesión cerrada correctamente. Hasta pronto.');
  };

  // ── Story CRUD
  const handleSaveStory = (newStory) => setStories([newStory, ...stories]);

  const handleUpdateStory = (updated) => {
    setStories(stories.map(s => s.id === updated.id ? updated : s));
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
    setStories([dup, ...stories]);
    notify(`Historia duplicada → ${dup.id}`);
  };

  const handleDeleteStory = (id) => {
    if (!window.confirm(`¿Eliminar la historia ${id}?`)) return;
    setStories(stories.filter(s => s.id !== id));
    notify(`Historia ${id} eliminada.`);
  };

  const handleToggleCriterion = (storyId, criterionId) => {
    setStories(stories.map(s => {
      if (s.id !== storyId) return s;
      return {
        ...s,
        criteria: s.criteria.map((c, idx) =>
          (c.id === criterionId || idx === criterionId) ? { ...c, checked: !c.checked } : c
        )
      };
    }));
  };

  // ── Filtered stories for feed
  const filteredStories = stories.filter(story => {
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
          <Navbar onOpenContact={() => setIsContactModalOpen(true)} />

          <main className="w-full">
            <Hero onOpenContact={() => setIsContactModalOpen(true)} />
            <ServicesSection />
            <Pillars />
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
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-on-primary font-space text-xs font-bold uppercase tracking-wider shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:shadow-[0_0_36px_rgba(245,166,35,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all"
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
      {currentView === 'portal' && showLogin && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {/* ══════════════════════════════════════════
          VIEW: PORTAL — AUTHENTICATED APP
      ══════════════════════════════════════════ */}
      {currentView === 'portal' && !showLogin && currentUser && (
        <div className="flex min-h-screen bg-surface">
          <Sidebar
            activeTab={activePortalTab}
            onSelectTab={setActivePortalTab}
            onReturnHome={navigateToHome}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
            <Header
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              user={currentUser}
              onLogout={handleLogout}
            />

            <main className="w-full pt-14 flex-1">
              {activePortalTab === 'stories' && (
                <div className="flex flex-col w-full">
                  <ControlsBar
                    stories={stories}
                    activeModule={activeModule}
                    setActiveModule={setActiveModule}
                    onNotify={notify}
                  />
                  <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <section className="lg:col-span-5 flex flex-col gap-y-4 lg:sticky lg:top-20">
                        <StoryBuilder onSaveStory={handleSaveStory} onNotify={notify} />
                      </section>
                      <section className="lg:col-span-7 flex flex-col gap-y-4">
                        <StoryFeed
                          stories={filteredStories}
                          onEditStory={(story) => { setSelectedStory(story); setIsDetailModalOpen(true); }}
                          onDuplicateStory={handleDuplicateStory}
                          onDeleteStory={handleDeleteStory}
                          onToggleCriterion={handleToggleCriterion}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                        />
                      </section>
                    </div>
                  </div>
                </div>
              )}
              {activePortalTab === 'backlog'   && <BacklogView stories={stories} />}
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
          />
        </div>
      )}
    </div>
  );
}
