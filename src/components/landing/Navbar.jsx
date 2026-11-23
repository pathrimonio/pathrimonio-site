import React, { useState } from 'react';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Navbar({ onOpenPortal, onOpenRegister }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Roles & Control', href: '#roles' },
    { name: 'Programa de Socios', href: '#socios' },
    { name: 'Impacto & Pathway', href: '#impacto' },
    { name: 'Cotizador', href: '#cotizador' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E4E4E7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2.5 text-[#09090B] font-semibold tracking-tight text-lg group">
          <div className="w-8 h-8 rounded-[6px] bg-[#FFC000] flex items-center justify-center text-[#09090B] shrink-0 transition-transform group-hover:scale-105">
            <ShieldCheck size={18} strokeWidth={1.5} />
          </div>
          <span className="font-semibold text-[17px] tracking-tight">Pathrimonio</span>
          <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-[#9A6700] bg-[#FFFBEB] px-2 py-0.5 rounded-[4px] border border-amber-200/80">
            Company
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenPortal}
            className="px-3.5 py-1.5 text-xs font-medium text-[#52525B] hover:text-[#09090B] bg-[#FFFFFF] border border-[#E4E4E7] hover:border-[#D4D4D8] hover:bg-[#F4F4F5] rounded-[6px] transition-all cursor-pointer"
          >
            Portal Operativo
          </button>
          <a
            href="#cotizador"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#09090B] bg-[#FFC000] hover:bg-[#E5AC00] rounded-[6px] transition-colors shadow-sm cursor-pointer"
          >
            <span>Cotizar ($1/día)</span>
            <ArrowRight size={13} strokeWidth={1.5} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-[6px] text-[#52525B] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#E4E4E7] px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#52525B] hover:text-[#09090B] py-1.5 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-3 border-t border-[#E4E4E7] flex flex-col gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenPortal(); }}
              className="w-full text-center py-2 text-xs font-medium text-[#52525B] bg-[#F4F4F5] rounded-[6px]"
            >
              Portal Operativo (Ingreso)
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
              className="w-full text-center py-2 text-xs font-medium text-[#9A6700] bg-[#FFFBEB] border border-amber-200/80 rounded-[6px]"
            >
              Crear Cuenta Colaborador
            </button>
            <a
              href="#cotizador"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-[#09090B] bg-[#FFC000] hover:bg-[#E5AC00] rounded-[6px]"
            >
              Cotizar Sistema a Medida
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
