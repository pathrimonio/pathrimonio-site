import React from 'react';
import UserMenu from './UserMenu';

export default function Header({ onToggleSidebar, searchQuery, setSearchQuery, user, onLogout }) {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-14 bg-surface-container-lowest/90 backdrop-blur-md z-30 border-b border-outline-variant px-4 sm:px-6 flex items-center justify-between gap-4">
      
      {/* Left: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-x-3">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded text-on-surface-variant hover:text-white hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="flex items-center gap-x-2 text-on-surface-variant font-jakarta text-xs truncate">
          <span className="text-white font-space font-semibold hidden sm:inline">Pathrimonio</span>
          <span className="text-outline-variant font-mono hidden sm:inline">/</span>
          <span className="text-on-surface truncate">Portal de Historias</span>
        </div>

        <div className="hidden md:block h-4 w-px bg-outline-variant"></div>

        <div className="hidden md:flex items-center gap-x-1.5 px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-on-surface font-space text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-medium text-white">Sprint 14 Activo</span>
        </div>
      </div>

      {/* Right: Search, Collabs & User Menu */}
      <div className="flex items-center gap-x-3">
        {/* Search Input */}
        <div className="flex items-center gap-x-2 bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded text-on-surface-variant font-jakarta text-xs focus-within:border-primary transition-colors w-36 sm:w-48 md:w-60">
          <span className="material-symbols-outlined text-[16px] text-primary">search</span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar historias..."
            className="bg-transparent text-white placeholder-on-surface-variant/70 text-xs font-jakarta w-full focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-surface-container-highest border border-outline-variant font-mono text-[9px] text-white">
            ⌘K
          </kbd>
        </div>

        {/* Collaborators avatars (non-logged users) */}
        <div className="hidden sm:flex items-center -space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-500/80 border border-outline-variant flex items-center justify-center font-space text-[10px] font-semibold text-white" title="Alonso L.">AL</div>
          <div className="w-6 h-6 rounded-full bg-teal-500/80 border border-outline-variant flex items-center justify-center font-space text-[10px] font-semibold text-white" title="Mariana R.">MR</div>
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-space text-[10px] font-bold text-primary" title="3 colaboradores más">+2</div>
        </div>

        {/* Notification bell */}
        <button className="relative p-1.5 rounded text-on-surface-variant hover:text-white hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(245,166,35,0.7)]"></span>
        </button>

        {/* User Menu with Dropdown */}
        {user && <UserMenu user={user} onLogout={onLogout} />}
      </div>

    </header>
  );
}
