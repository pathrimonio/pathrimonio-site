import React from 'react';
import { normalizePathname } from '../../config/siteConfig';
import LegalAvisoPage from './LegalAvisoPage';
import LegalPrivacidadPage from './LegalPrivacidadPage';
import LegalCookiesPage from './LegalCookiesPage';
import LegalLibroReclamacionesPage from './LegalLibroReclamacionesPage';

export function isLegalPathname(pathname) {
  const clean = normalizePathname(pathname);
  return (
    clean === '/legal/aviso-legal' ||
    clean === '/legal/privacidad' ||
    clean === '/legal/cookies' ||
    clean === '/legal/libro-reclamaciones'
  );
}

export default function LegalPageRouter({ pathname, ...props }) {
  const clean = normalizePathname(pathname);
  switch (clean) {
    case '/legal/privacidad':
      return <LegalPrivacidadPage {...props} />;
    case '/legal/cookies':
      return <LegalCookiesPage {...props} />;
    case '/legal/libro-reclamaciones':
      return <LegalLibroReclamacionesPage {...props} />;
    case '/legal/aviso-legal':
    default:
      return <LegalAvisoPage {...props} />;
  }
}
