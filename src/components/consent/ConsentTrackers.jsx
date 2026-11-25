import React from 'react';
import ConsentGatedScript from './ConsentGatedScript';

/**
 * Registro centralizado de scripts no esenciales conectados por variables de entorno.
 * Por diseño (SDD Pilar 2), ninguno se descarga ni ejecuta hasta que el usuario otorga opt-in.
 */
export default function ConsentTrackers() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  const gaMeasurementId = (env.VITE_GA_MEASUREMENT_ID || '').trim();
  const clarityId = (env.VITE_CLARITY_ID || '').trim();
  const metaPixelId = (env.VITE_META_PIXEL_ID || '').trim();

  return (
    <>
      {gaMeasurementId && (
        <>
          <ConsentGatedScript
            id="pathrimonio-ga4-loader"
            category="analytics"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`}
            onLoad={() => {
              if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                window.gtag('js', new Date());
                window.gtag('config', gaMeasurementId, {
                  anonymize_ip: true
                });
              }
            }}
          />
        </>
      )}

      {clarityId && (
        <ConsentGatedScript
          id="pathrimonio-clarity-loader"
          category="analytics"
          inlineCode={`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", ${JSON.stringify(clarityId)});`}
        />
      )}

      {metaPixelId && (
        <ConsentGatedScript
          id="pathrimonio-meta-pixel-loader"
          category="marketing"
          inlineCode={`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('consent','grant');fbq('init',${JSON.stringify(metaPixelId)});fbq('track','PageView');`}
        />
      )}
    </>
  );
}
