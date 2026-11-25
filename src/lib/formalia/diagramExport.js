import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Exportación visual del lienzo FORMALIA en PNG y PDF con marca discreta de Pathrimonio.
 * Devuelve metadatos del archivo generado para recopilarlo en el historial de versiones.
 */
export async function exportDiagramAsPNG(element, graph, versionLabel = 'v1') {
  if (!element) throw new Error('Elemento del lienzo no disponible');
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2,
    cacheBust: true,
    filter: (node) => !node?.dataset?.exportIgnore
  });

  const slug = (graph?.business_context?.company_name || 'proceso-formalia')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const fileName = `FORMALIA-${slug || 'diagrama'}-${graph?.session_id || 'export'}-${versionLabel}.png`;
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();

  const approxBytes = Math.round((dataUrl.length * 3) / 4);
  return {
    fileName,
    mimeType: 'image/png',
    dataUrl,
    sizeBytes: approxBytes
  };
}

export async function exportDiagramAsPDF(element, graph, versionLabel = 'v1') {
  if (!element) throw new Error('Elemento del lienzo no disponible');
  const dataUrl = await toPng(element, {
    quality: 0.98,
    pixelRatio: 2,
    cacheBust: true,
    filter: (node) => !node?.dataset?.exportIgnore
  });

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header Pathrimonio FORMALIA
  pdf.setFillColor(9, 9, 11);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  pdf.setFillColor(255, 192, 0);
  pdf.rect(0, 20, pageWidth, 1.2, 'F');

  pdf.setTextColor(255, 192, 0);
  pdf.setFontSize(12);
  pdf.text('Pathrimonio FORMALIA', 12, 9);

  pdf.setTextColor(244, 244, 245);
  pdf.setFontSize(10);
  const titleText = `${graph?.business_context?.company_name || 'Empresa'} — ${graph?.business_context?.process_name || 'Mapa de Procesos'}`;
  pdf.text(titleText.slice(0, 80), 12, 15.5);

  pdf.setTextColor(161, 161, 170);
  pdf.setFontSize(8.5);
  pdf.text(
    `Sesión: ${graph?.session_id || 'FIA'} (${versionLabel}) | Roles: ${graph?.actors?.length || 0} | Pasos: ${graph?.steps?.length || 0}`,
    pageWidth - 12,
    12,
    { align: 'right' }
  );

  // Diagram image
  const imgProps = pdf.getImageProperties(dataUrl);
  const maxImgW = pageWidth - 20;
  const maxImgH = pageHeight - 36;
  const ratio = Math.min(maxImgW / imgProps.width, maxImgH / imgProps.height);
  const drawW = imgProps.width * ratio;
  const drawH = imgProps.height * ratio;
  const offsetX = (pageWidth - drawW) / 2;

  pdf.addImage(dataUrl, 'PNG', offsetX, 25, drawW, drawH);

  // Footer marca discreta
  pdf.setTextColor(113, 113, 122);
  pdf.setFontSize(8);
  pdf.text(
    `Generado gratuitamente con FORMALIA by Pathrimonio Company — www.pathrimonio.site ($1 USD/día por rol) · ${versionLabel}`,
    12,
    pageHeight - 5
  );

  const slug = (graph?.business_context?.company_name || 'proceso-formalia')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const fileName = `FORMALIA-${slug || 'diagrama'}-${graph?.session_id || 'export'}-${versionLabel}.pdf`;
  pdf.save(fileName);

  const pdfDataUri = pdf.output('datauristring');
  const approxBytes = Math.round((pdfDataUri.length * 3) / 4);
  return {
    fileName,
    mimeType: 'application/pdf',
    dataUrl: dataUrl, // preview image thumbnail
    sizeBytes: approxBytes
  };
}
