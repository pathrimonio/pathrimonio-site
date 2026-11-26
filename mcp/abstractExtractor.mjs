import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import ts from 'typescript';

export const MAX_PARSE_BYTES = 512 * 1024;
export const MAX_SCAN_NODES = 10000;

export const DEFAULT_IGNORED_FOLDERS = new Set([
  'node_modules',
  '.git',
  'dist',
  'dist-ssr',
  'build',
  '.next',
  'out',
  'coverage',
  '.cache',
  '.turbo',
  '.vercel',
  '.expo',
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
]);

export const DEFAULT_IGNORED_FILES = new Set([
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini'
]);

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'svg', 'bmp', 'tiff',
  'mp4', 'mov', 'avi', 'webm', 'mp3', 'wav', 'ogg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'tar', 'gz', '7z', 'rar', 'apk', 'aab', 'ipa', 'exe', 'dll', 'so', 'dylib',
  'woff', 'woff2', 'ttf', 'otf', 'eot', 'sqlite', 'db', 'lock'
]);

export function normalizeRelPath(inputPath = '') {
  return String(inputPath || '')
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/^\/+|\/+$/g, '');
}

export function getExtension(name = '') {
  const base = String(name).split('/').pop() || '';
  const lower = base.toLowerCase();
  if (lower.startsWith('.env')) return 'env';
  if (lower === 'dockerfile' || lower.startsWith('dockerfile.')) return 'dockerfile';
  if (lower === 'makefile' || lower.startsWith('makefile.')) return 'makefile';
  const idx = lower.lastIndexOf('.');
  if (idx <= 0) return '';
  return lower.slice(idx + 1);
}

export function buildNodePayloadsForPath({
  relPath,
  isDirectory = false,
  sizeBytes = null,
  rootName = 'root',
  source = 'mcp-agent'
}) {
  const clean = normalizeRelPath(relPath);
  const nodes = [
    {
      path: '',
      parentPath: '',
      name: rootName,
      extension: null,
      isDirectory: true,
      sizeBytes: null,
      depth: 0,
      source
    }
  ];

  if (!clean) return nodes;

  const segments = clean.split('/').filter(Boolean);
  const dirCount = isDirectory ? segments.length : segments.length - 1;

  for (let i = 0; i < dirCount; i += 1) {
    const dirPath = segments.slice(0, i + 1).join('/');
    nodes.push({
      path: dirPath,
      parentPath: segments.slice(0, i).join('/'),
      name: segments[i],
      extension: null,
      isDirectory: true,
      sizeBytes: null,
      depth: i + 1,
      source
    });
  }

  if (!isDirectory) {
    const fileName = segments[segments.length - 1];
    nodes.push({
      path: clean,
      parentPath: segments.slice(0, -1).join('/'),
      name: fileName,
      extension: getExtension(fileName) || null,
      isDirectory: false,
      sizeBytes: sizeBytes ?? null,
      depth: segments.length,
      source
    });
  }

  return nodes;
}

function loadGitignoreMatchers(repoRoot) {
  const gitignorePath = join(repoRoot, '.gitignore');
  if (!existsSync(gitignorePath)) return [];
  try {
    const raw = readFileSync(gitignorePath, 'utf8');
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && !line.startsWith('!'))
      .map((pattern) => {
        const clean = pattern.replace(/^\//, '').replace(/\/$/, '');
        const regexStr = clean
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\?/g, '[^/]');
        return {
          raw: clean,
          regex: new RegExp(`(^|/)${regexStr}($|/)`, 'i')
        };
      });
  } catch {
    return [];
  }
}

export function scanLocalDirectory({
  directoryPath,
  rootName,
  ignoreCommon = true,
  maxNodes = MAX_SCAN_NODES,
  extractSignatures = false,
  pathFilter = ''
}) {
  const absRoot = resolve(directoryPath);
  if (!existsSync(absRoot) || !statSync(absRoot).isDirectory()) {
    throw new Error(`El directorio local no existe o no es una carpeta: ${absRoot}`);
  }

  const effectiveRootName = (rootName || basename(absRoot) || 'root').trim();
  const gitignoreMatchers = loadGitignoreMatchers(absRoot);
  const filterNorm = normalizeRelPath(pathFilter);
  let truncated = false;

  const nodes = [
    {
      path: '',
      parentPath: '',
      name: effectiveRootName,
      extension: null,
      isDirectory: true,
      sizeBytes: null,
      depth: 0,
      source: 'mcp-agent'
    }
  ];

  const extractedByPath = new Map();

  function isIgnored(relPath, entryName, isDir) {
    if (ignoreCommon) {
      if (isDir && DEFAULT_IGNORED_FOLDERS.has(entryName)) return true;
      if (!isDir && DEFAULT_IGNORED_FILES.has(entryName)) return true;
    }
    return gitignoreMatchers.some((m) => m.regex.test(relPath) || entryName === m.raw);
  }

  function walk(currentDir, depth) {
    if (nodes.length >= maxNodes) {
      truncated = true;
      return;
    }

    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' }));

    for (const entry of entries) {
      if (nodes.length >= maxNodes) {
        truncated = true;
        break;
      }

      const fullPath = join(currentDir, entry.name);
      const rel = normalizeRelPath(relative(absRoot, fullPath));
      const isDir = entry.isDirectory();

      if (isIgnored(rel, entry.name, isDir)) continue;
      if (filterNorm && !rel.startsWith(filterNorm) && !filterNorm.startsWith(`${rel}/`)) continue;

      const parentPath = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';

      if (isDir) {
        nodes.push({
          path: rel,
          parentPath,
          name: entry.name,
          extension: null,
          isDirectory: true,
          sizeBytes: null,
          depth,
          source: 'mcp-agent'
        });
        walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        let sizeBytes = 0;
        try {
          sizeBytes = statSync(fullPath).size;
        } catch {
          sizeBytes = 0;
        }
        const ext = getExtension(entry.name);
        nodes.push({
          path: rel,
          parentPath,
          name: entry.name,
          extension: ext || null,
          isDirectory: false,
          sizeBytes,
          depth,
          source: 'mcp-agent'
        });

        if (extractSignatures && sizeBytes <= MAX_PARSE_BYTES && !BINARY_EXTENSIONS.has(ext)) {
          const extraction = extractAbstractRecordsFromFile(fullPath, { extension: ext });
          if (extraction.records.length > 0) {
            extractedByPath.set(rel, extraction.records);
          }
        }
      }
    }
  }

  walk(absRoot, 1);

  return {
    rootName: effectiveRootName,
    directoryPath: absRoot,
    nodes,
    extractedByPath,
    truncated
  };
}

// ── Extractores AST (Zero-Code Leakage: sin cuerpo ni secretos) ──────────

function getLine(sourceFile, node) {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return line + 1;
}

function getLeadingDoc(sourceText, node, sourceFile) {
  const ranges = ts.getLeadingCommentRanges(sourceText, node.getFullStart());
  if (!ranges || ranges.length === 0) return '';
  const last = ranges[ranges.length - 1];
  const raw = sourceText.slice(last.pos, last.end);
  const cleaned = raw
    .replace(/^\/\*\*?/, '')
    .replace(/\*\/$/, '')
    .replace(/^\/\/\s?/gm, '')
    .replace(/^\s*\*\s?/gm, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('@'))
    .slice(0, 2)
    .join(' ');
  return cleaned.slice(0, 220);
}

function hasModifier(node, kind) {
  return Boolean(ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((m) => m.kind === kind));
}

function getVisibility(node) {
  if (hasModifier(node, ts.SyntaxKind.PrivateKeyword)) return 'private';
  if (hasModifier(node, ts.SyntaxKind.ProtectedKeyword)) return 'protected';
  return 'public';
}

function formatParams(params = [], sourceFile) {
  return params
    .map((p) => {
      const rest = p.dotDotDotToken ? '...' : '';
      const name = p.name?.getText(sourceFile) || 'arg';
      const opt = p.questionToken ? '?' : '';
      const type = p.type ? `: ${p.type.getText(sourceFile)}` : '';
      return `${rest}${name}${opt}${type}`;
    })
    .join(', ');
}

function containsJsx(node) {
  let found = false;
  function visit(n) {
    if (found) return;
    if (
      ts.isJsxElement(n) ||
      ts.isJsxSelfClosingElement(n) ||
      ts.isJsxFragment(n)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(n, visit);
  }
  if (node) visit(node);
  return found;
}

function extractTypeScriptOrJs(sourceText, fileName) {
  const ext = getExtension(fileName);
  const scriptKind =
    ext === 'tsx' ? ts.ScriptKind.TSX
      : ext === 'jsx' ? ts.ScriptKind.JSX
        : ext === 'ts' ? ts.ScriptKind.TS
          : ts.ScriptKind.JS;

  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, scriptKind);
  const records = [];

  const pushRecord = (record) => {
    records.push({
      recordType: record.recordType,
      name: record.name,
      signature: record.signature || null,
      description: record.description || null,
      lineNumber: record.lineNumber ?? null,
      metadata: record.metadata || {}
    });
  };

  function visitTopLevel(node) {
    const isExported = hasModifier(node, ts.SyntaxKind.ExportKeyword);
    const isDefault = hasModifier(node, ts.SyntaxKind.DefaultKeyword);
    const exportPrefix = isExported ? (isDefault ? 'export default ' : 'export ') : '';

    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.getText(sourceFile);
      const heritage = node.heritageClauses?.map((h) => h.getText(sourceFile)).join(' ') || '';
      pushRecord({
        recordType: 'class',
        name: className,
        signature: `${exportPrefix}class ${className}${heritage ? ` ${heritage}` : ''}`,
        description: getLeadingDoc(sourceText, node, sourceFile),
        lineNumber: getLine(sourceFile, node),
        metadata: { exported: isExported, sourceMode: 'ast-ts' }
      });

      for (const member of node.members) {
        if (ts.isConstructorDeclaration(member)) {
          const params = formatParams(member.parameters, sourceFile);
          pushRecord({
            recordType: 'method',
            name: `${className}.constructor`,
            signature: `constructor(${params})`,
            description: getLeadingDoc(sourceText, member, sourceFile),
            lineNumber: getLine(sourceFile, member),
            metadata: { className, visibility: getVisibility(member), isAsync: false, sourceMode: 'ast-ts' }
          });
        } else if (ts.isMethodDeclaration(member) || ts.isGetAccessorDeclaration(member) || ts.isSetAccessorDeclaration(member)) {
          const memberName = member.name?.getText(sourceFile);
          if (!memberName) continue;
          const visibility = getVisibility(member);
          const isStatic = hasModifier(member, ts.SyntaxKind.StaticKeyword);
          const isAsync = hasModifier(member, ts.SyntaxKind.AsyncKeyword);
          const isAbstract = hasModifier(member, ts.SyntaxKind.AbstractKeyword);
          const kindPrefix = ts.isGetAccessorDeclaration(member) ? 'get ' : ts.isSetAccessorDeclaration(member) ? 'set ' : '';
          const params = formatParams(member.parameters, sourceFile);
          const retType = member.type ? `: ${member.type.getText(sourceFile)}` : '';
          const mods = [
            visibility !== 'public' ? visibility : '',
            isStatic ? 'static' : '',
            isAbstract ? 'abstract' : '',
            isAsync ? 'async' : ''
          ].filter(Boolean).join(' ');

          pushRecord({
            recordType: 'method',
            name: `${className}.${memberName}`,
            signature: `${mods ? `${mods} ` : ''}${kindPrefix}${memberName}(${params})${retType}`,
            description: getLeadingDoc(sourceText, member, sourceFile),
            lineNumber: getLine(sourceFile, member),
            metadata: { className, visibility, isAsync, isStatic, isAbstract, sourceMode: 'ast-ts' }
          });
        }
      }
      return;
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      const fnName = node.name.getText(sourceFile);
      const isAsync = hasModifier(node, ts.SyntaxKind.AsyncKeyword);
      const params = formatParams(node.parameters, sourceFile);
      const retType = node.type ? `: ${node.type.getText(sourceFile)}` : '';
      const isHook = /^use[A-Z0-9_]/.test(fnName);
      const isComponent = /^[A-Z]/.test(fnName) && (ext === 'jsx' || ext === 'tsx' || containsJsx(node.body));
      const recordType = isHook ? 'hook' : isComponent ? 'component' : 'function';

      pushRecord({
        recordType,
        name: fnName,
        signature: `${exportPrefix}${isAsync ? 'async ' : ''}function ${fnName}(${params})${retType}`,
        description: getLeadingDoc(sourceText, node, sourceFile),
        lineNumber: getLine(sourceFile, node),
        metadata: { exported: isExported, isDefault, isAsync, sourceMode: 'ast-ts' }
      });
      return;
    }

    if (ts.isInterfaceDeclaration(node)) {
      const ifName = node.name.getText(sourceFile);
      const props = node.members
        .slice(0, 8)
        .map((m) => m.name?.getText(sourceFile))
        .filter(Boolean)
        .join(', ');
      pushRecord({
        recordType: 'interface',
        name: ifName,
        signature: `${exportPrefix}interface ${ifName}${props ? ` { ${props}${node.members.length > 8 ? ', ...' : ''} }` : ' { ... }'}`,
        description: getLeadingDoc(sourceText, node, sourceFile),
        lineNumber: getLine(sourceFile, node),
        metadata: { exported: isExported, memberCount: node.members.length, sourceMode: 'ast-ts' }
      });
      return;
    }

    if (ts.isTypeAliasDeclaration(node)) {
      const typeName = node.name.getText(sourceFile);
      const rawType = node.type.getText(sourceFile).replace(/\s+/g, ' ').slice(0, 120);
      pushRecord({
        recordType: 'type',
        name: typeName,
        signature: `${exportPrefix}type ${typeName} = ${rawType}`,
        description: getLeadingDoc(sourceText, node, sourceFile),
        lineNumber: getLine(sourceFile, node),
        metadata: { exported: isExported, sourceMode: 'ast-ts' }
      });
      return;
    }

    if (ts.isEnumDeclaration(node)) {
      const enumName = node.name.getText(sourceFile);
      const members = node.members.slice(0, 8).map((m) => m.name.getText(sourceFile)).join(', ');
      pushRecord({
        recordType: 'enum',
        name: enumName,
        signature: `${exportPrefix}enum ${enumName} { ${members}${node.members.length > 8 ? ', ...' : ''} }`,
        description: getLeadingDoc(sourceText, node, sourceFile),
        lineNumber: getLine(sourceFile, node),
        metadata: { exported: isExported, sourceMode: 'ast-ts' }
      });
      return;
    }

    if (ts.isVariableStatement(node)) {
      const isConst = Boolean(node.declarationList.flags & ts.NodeFlags.Const);
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue;
        const varName = decl.name.getText(sourceFile);
        const init = decl.initializer;

        if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
          const isAsync = hasModifier(init, ts.SyntaxKind.AsyncKeyword);
          const params = formatParams(init.parameters, sourceFile);
          const retType = init.type ? `: ${init.type.getText(sourceFile)}` : '';
          const isHook = /^use[A-Z0-9_]/.test(varName);
          const isComponent = /^[A-Z]/.test(varName) && (ext === 'jsx' || ext === 'tsx' || containsJsx(init.body));
          const recordType = isHook ? 'hook' : isComponent ? 'component' : 'function';

          pushRecord({
            recordType,
            name: varName,
            signature: `${exportPrefix}const ${varName} = ${isAsync ? 'async ' : ''}(${params})${retType} => ...`,
            description: getLeadingDoc(sourceText, node, sourceFile),
            lineNumber: getLine(sourceFile, decl),
            metadata: { exported: isExported, isAsync, sourceMode: 'ast-ts' }
          });
        } else if (isExported) {
          const typeAnnotation = decl.type ? `: ${decl.type.getText(sourceFile)}` : '';
          pushRecord({
            recordType: isConst ? 'constant' : 'variable',
            name: varName,
            signature: `${exportPrefix}${isConst ? 'const' : 'let'} ${varName}${typeAnnotation}`,
            description: getLeadingDoc(sourceText, node, sourceFile),
            lineNumber: getLine(sourceFile, decl),
            metadata: { exported: true, sourceMode: 'ast-ts' }
          });
        }
      }
    }
  }

  ts.forEachChild(sourceFile, visitTopLevel);
  return records;
}

function extractPython(sourceText) {
  const lines = sourceText.split(/\r?\n/);
  const records = [];
  let currentClass = null;
  let currentClassIndent = -1;
  let pendingDecorators = [];

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = raw.search(/\S/);
    if (currentClass && indent <= currentClassIndent && !trimmed.startsWith('@')) {
      currentClass = null;
      currentClassIndent = -1;
    }

    if (trimmed.startsWith('@')) {
      pendingDecorators.push(trimmed);
      continue;
    }

    const classMatch = trimmed.match(/^class\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?\s*:/);
    if (classMatch) {
      const name = classMatch[1];
      const bases = classMatch[2] || '';
      currentClass = name;
      currentClassIndent = indent;
      records.push({
        recordType: 'class',
        name,
        signature: `class ${name}${bases}:`,
        description: pendingDecorators.length ? `Decoradores: ${pendingDecorators.join(', ')}` : null,
        lineNumber: i + 1,
        metadata: { decorators: pendingDecorators, sourceMode: 'parser-py' }
      });
      pendingDecorators = [];
      continue;
    }

    const defMatch = trimmed.match(/^(async\s+)?def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    if (defMatch) {
      const isAsync = Boolean(defMatch[1]);
      const fnName = defMatch[2];
      // Join multi-line signature up to closing ':'
      let sigText = trimmed;
      let j = i;
      while (!sigText.endsWith(':') && j + 1 < lines.length && j - i < 8) {
        j += 1;
        sigText += ` ${lines[j].trim()}`;
      }
      sigText = sigText.replace(/\s+/g, ' ').replace(/:$/, '');
      const isMethod = Boolean(currentClass && indent > currentClassIndent);
      const routeDec = pendingDecorators.find((d) => /\.(get|post|put|patch|delete|route)\(/i.test(d));
      const recordType = routeDec ? 'route' : isMethod ? 'method' : isAsync ? 'async_function' : 'function';

      records.push({
        recordType,
        name: isMethod ? `${currentClass}.${fnName}` : fnName,
        signature: sigText,
        description: pendingDecorators.length ? pendingDecorators.join(' ') : null,
        lineNumber: i + 1,
        metadata: {
          className: isMethod ? currentClass : null,
          isAsync,
          decorators: pendingDecorators,
          sourceMode: 'parser-py'
        }
      });
      pendingDecorators = [];
      continue;
    }

    pendingDecorators = [];
  }

  return records;
}

function extractSql(sourceText) {
  const lines = sourceText.split(/\r?\n/);
  const records = [];
  const regex = /^\s*create\s+(?:or\s+replace\s+)?(table|view|function|procedure|trigger|index|type|sequence|policy|schema)\s+(?:if\s+not\s+exists\s+)?(["`\w.]+)/i;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(regex);
    if (!match) continue;
    const rawKind = match[1].toLowerCase();
    const rawName = match[2].replace(/["`]/g, '');
    records.push({
      recordType: rawKind,
      name: rawName,
      signature: lines[i].trim().slice(0, 140),
      description: `Objeto SQL (${rawKind})`,
      lineNumber: i + 1,
      metadata: { sourceMode: 'parser-sql' }
    });
  }
  return records;
}

function extractBraceLang(sourceText) {
  const lines = sourceText.split(/\r?\n/);
  const records = [];
  const typeRegex = /^\s*(?:public|private|protected|internal|export)?\s*(?:abstract|final|static)?\s*(class|interface|struct|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/;
  const goFuncRegex = /^\s*func\s+(?:\([^)]+\)\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)/;
  const methodRegex = /^\s*(?:public|private|protected|override|suspend|async|static|\s)+\s*(?:fun\s+|function\s+|[A-Za-z0-9_<>\[\]?]+\s+)([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)/;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const tMatch = line.match(typeRegex);
    if (tMatch) {
      records.push({
        recordType: tMatch[1].toLowerCase(),
        name: tMatch[2],
        signature: line.trim().replace(/\{$/, '').trim(),
        description: null,
        lineNumber: i + 1,
        metadata: { sourceMode: 'parser-generic' }
      });
      continue;
    }
    const gMatch = line.match(goFuncRegex);
    if (gMatch) {
      records.push({
        recordType: line.includes(') ') && line.trim().startsWith('func (') ? 'method' : 'function',
        name: gMatch[1],
        signature: line.trim().replace(/\{$/, '').trim(),
        description: null,
        lineNumber: i + 1,
        metadata: { sourceMode: 'parser-go' }
      });
      continue;
    }
    const mMatch = line.match(methodRegex);
    if (mMatch && !/^\s*(if|for|while|switch|catch)\b/.test(line)) {
      records.push({
        recordType: 'method',
        name: mMatch[1],
        signature: line.trim().replace(/\{$/, '').trim().slice(0, 160),
        description: null,
        lineNumber: i + 1,
        metadata: { sourceMode: 'parser-generic' }
      });
    }
  }
  return records;
}

function extractJsonKeys(sourceText) {
  try {
    const parsed = JSON.parse(sourceText);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];
    const lines = sourceText.split(/\r?\n/);
    return Object.keys(parsed).slice(0, 40).map((key) => {
      const val = parsed[key];
      const kind = Array.isArray(val) ? 'array' : (val && typeof val === 'object') ? 'object' : 'key';
      const lineIdx = lines.findIndex((l) => l.includes(`"${key}"`));
      return {
        recordType: kind,
        name: key,
        signature: `"${key}": ${kind === 'array' ? `[${val.length} items]` : kind === 'object' ? `{${Object.keys(val).length} keys}` : typeof val}`,
        description: null,
        lineNumber: lineIdx >= 0 ? lineIdx + 1 : null,
        metadata: { sourceMode: 'parser-json' }
      };
    });
  } catch {
    return [];
  }
}

export function extractAbstractRecordsFromFile(absFilePath, options = {}) {
  const fullPath = resolve(absFilePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Archivo local no encontrado: ${fullPath}`);
  }

  const stat = statSync(fullPath);
  if (!stat.isFile()) {
    throw new Error(`La ruta no corresponde a un archivo: ${fullPath}`);
  }

  const ext = (options.extension || getExtension(fullPath) || '').toLowerCase();
  if (BINARY_EXTENSIONS.has(ext) || stat.size > MAX_PARSE_BYTES) {
    return { sizeBytes: stat.size, extension: ext, skipped: true, records: [] };
  }

  const text = readFileSync(fullPath, 'utf8');
  let records = [];

  if (['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'].includes(ext)) {
    records = extractTypeScriptOrJs(text, fullPath);
  } else if (ext === 'py') {
    records = extractPython(text);
  } else if (['sql', 'ddl'].includes(ext)) {
    records = extractSql(text);
  } else if (['go', 'java', 'kt', 'kts', 'cs', 'php', 'rb', 'dart'].includes(ext)) {
    records = extractBraceLang(text);
  } else if (ext === 'json') {
    records = extractJsonKeys(text);
  }

  return {
    sizeBytes: stat.size,
    extension: ext,
    skipped: false,
    records
  };
}
