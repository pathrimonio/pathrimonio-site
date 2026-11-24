// Utilidades para construir y resumir el árbol de archivos de un proyecto.
// No lee contenido de archivos: solo nombres, rutas, extensiones y tamaños.

export const DEFAULT_IGNORED_FOLDERS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'out',
  'coverage',
  '.cache',
  '.turbo',
  '.vercel',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
  'target',
  '.idea',
  '.gradle',
  '.mvn',
  'bin',
  'obj'
];

export const DEFAULT_IGNORED_FILES = [
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini'
];

export const MAX_TREE_NODES = 10000;

export function getExtension(name = '') {
  const base = String(name).split('/').pop() || '';
  const lower = base.toLowerCase();
  if (lower.startsWith('.env')) return 'env';
  const idx = lower.lastIndexOf('.');
  if (idx <= 0) return '';
  return lower.slice(idx + 1);
}

export function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value <= 0) return '0 B';
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  return `${(value / 1024 ** 3).toFixed(2)} GB`;
}

/**
 * Construye una lista plana de nodos (carpetas + archivos) a partir de un
 * FileList de un input webkitdirectory. El primer segmento de
 * webkitRelativePath es la carpeta raíz seleccionada.
 */
export function buildTreeFromFileList(fileList, options = {}) {
  const files = Array.from(fileList || []);
  if (files.length === 0) {
    return { rootName: '', nodes: [], truncated: false };
  }

  const rootName = files[0]?.webkitRelativePath?.split('/')[0] || files[0]?.name || 'root';
  const ignoreCommon = options.ignoreCommon !== false;
  const ignoreFolders = new Set(
    ignoreCommon
      ? (options.ignoreFolders || DEFAULT_IGNORED_FOLDERS)
      : []
  );
  const ignoreFiles = new Set(DEFAULT_IGNORED_FILES);
  const maxNodes = options.maxNodes || MAX_TREE_NODES;

  const byPath = new Map();
  const rootNode = {
    path: '',
    parentPath: '',
    name: rootName,
    extension: null,
    isDirectory: true,
    sizeBytes: null,
    depth: 0,
    source: 'folder-scan'
  };
  let truncated = false;

  for (const file of files) {
    if (byPath.size + 1 >= maxNodes) {
      truncated = true;
      break;
    }

    const relative = String(file.webkitRelativePath || file.name).replace(/\\/g, '/');
    const segments = relative.split('/').filter(Boolean);
    if (segments.length === 0) continue;

    if (segments[0] === rootName) segments.shift();
    if (segments.length === 0) continue;

    const fileName = segments[segments.length - 1];
    if (ignoreFiles.has(fileName)) continue;

    const directorySegments = segments.slice(0, -1);
    if (directorySegments.some((segment) => ignoreFolders.has(segment))) continue;

    // Crear las carpetas intermedias que falten.
    for (let i = 0; i < directorySegments.length; i += 1) {
      const dirPath = directorySegments.slice(0, i + 1).join('/');
      if (byPath.has(dirPath)) continue;
      byPath.set(dirPath, {
        path: dirPath,
        parentPath: directorySegments.slice(0, i).join('/'),
        name: directorySegments[i],
        extension: null,
        isDirectory: true,
        sizeBytes: null,
        depth: i + 1,
        source: 'folder-scan'
      });
      if (byPath.size + 1 >= maxNodes) {
        truncated = true;
        break;
      }
    }
    if (truncated) break;

    const filePath = segments.join('/');
    if (byPath.has(filePath)) continue;

    byPath.set(filePath, {
      path: filePath,
      parentPath: directorySegments.join('/'),
      name: fileName,
      extension: getExtension(fileName),
      isDirectory: false,
      sizeBytes: Number(file.size) || 0,
      depth: segments.length,
      source: 'folder-scan'
    });
  }

  const nodes = [rootNode, ...byPath.values()].sort((a, b) => {
    if (a.path === '') return -1;
    if (b.path === '') return 1;
    return a.path.localeCompare(b.path, 'es', { numeric: true, sensitivity: 'base' });
  });

  return { rootName, nodes, truncated };
}

export function summarizeTree(nodes = []) {
  const folders = nodes.filter((node) => node.isDirectory).length;
  const files = nodes.filter((node) => !node.isDirectory).length;
  const totalBytes = nodes.reduce((acc, node) => acc + (Number(node.sizeBytes) || 0), 0);
  const recordCount = nodes.reduce((acc, node) => acc + (Number(node.recordCount) || 0), 0);

  return {
    total: nodes.length,
    folders,
    files,
    totalBytes,
    totalSizeFormatted: formatBytes(totalBytes),
    recordCount
  };
}
