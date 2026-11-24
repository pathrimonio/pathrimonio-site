// Tipos de "registros abstractos" que se pueden cargar por archivo según su
// extensión. No es análisis de código: es una plantilla de inventario para que
// el usuario registre métodos, variables, clases, tablas, endpoints, etc.

const type = (value, label, icon, namePlaceholder, signaturePlaceholder) => ({
  value,
  label,
  icon,
  namePlaceholder,
  signaturePlaceholder
});

const JS_TYPES = [
  type('function', 'Función', 'function', 'login', 'login(email, password)'),
  type('component', 'Componente', 'widgets', 'Button', '<Button label="Guardar" />'),
  type('hook', 'Hook', 'hook', 'useAuth', 'useAuth()'),
  type('class', 'Clase', 'class', 'UserService', 'class UserService { ... }'),
  type('method', 'Método', 'functions', 'getUser', 'getUser(id)'),
  type('variable', 'Variable', 'variable_add', 'currentUser', 'const currentUser = ...'),
  type('constant', 'Constante', 'constant', 'API_URL', 'const API_URL = "..."'),
  type('interface', 'Interfaz', 'data_object', 'User', 'interface User { ... }'),
  type('type', 'Tipo', 'data_object', 'UserRole', 'type UserRole = "admin" | "user"'),
  type('enum', 'Enum', 'list', 'Status', 'enum Status { Active, Inactive }'),
  type('prop', 'Prop / Atributo', 'input', 'label', 'label: string'),
  type('state', 'Estado', 'database', 'isOpen', 'const [isOpen, setIsOpen] = useState(false)'),
  type('event', 'Evento', 'bolt', 'onClick', 'onClick={() => save()}'),
  type('api', 'Llamada API', 'api', 'fetchUsers', 'GET /api/users'),
  type('import', 'Import', 'input', 'React', 'import React from "react"'),
  type('export', 'Export', 'output', 'default', 'export default App')
];

const PY_TYPES = [
  type('class', 'Clase', 'class', 'UserService', 'class UserService:'),
  type('function', 'Función', 'function', 'calculate_total', 'def calculate_total(items):'),
  type('async_function', 'Función Async', 'bolt', 'fetch_users', 'async def fetch_users():'),
  type('method', 'Método', 'functions', 'get_user', 'def get_user(self, user_id):'),
  type('variable', 'Variable', 'variable_add', 'current_user', 'current_user = ...'),
  type('constant', 'Constante', 'constant', 'API_URL', 'API_URL = "..."'),
  type('decorator', 'Decorador', 'auto_awesome', 'login_required', '@login_required'),
  type('property', 'Propiedad', 'input', 'full_name', '@property'),
  type('route', 'Ruta', 'route', '/users', '@app.route("/users")'),
  type('model', 'Modelo', 'database', 'User', 'class User(BaseModel):'),
  type('serializer', 'Serializer', 'data_object', 'UserSerializer', 'class UserSerializer(...)'),
  type('test', 'Test', 'science', 'test_login', 'def test_login():')
];

const JVM_TYPES = [
  type('class', 'Clase', 'class', 'UserService', 'public class UserService { ... }'),
  type('interface', 'Interfaz', 'data_object', 'UserRepository', 'public interface UserRepository { ... }'),
  type('enum', 'Enum', 'list', 'Status', 'public enum Status { ... }'),
  type('method', 'Método', 'functions', 'getUser', 'public User getUser(String id)'),
  type('field', 'Campo', 'variable_add', 'userRepository', 'private final UserRepository userRepository;'),
  type('constructor', 'Constructor', 'build', 'UserService', 'public UserService(UserRepository repo)'),
  type('annotation', 'Anotación', 'label', 'Service', '@Service'),
  type('package', 'Paquete', 'folder', 'com.example.app', 'package com.example.app;'),
  type('import', 'Import', 'input', 'List', 'import java.util.List;')
];

const GO_TYPES = [
  type('package', 'Paquete', 'folder', 'main', 'package main'),
  type('struct', 'Struct', 'data_object', 'User', 'type User struct { ... }'),
  type('interface', 'Interfaz', 'data_object', 'Repository', 'type Repository interface { ... }'),
  type('function', 'Función', 'function', 'GetUser', 'func GetUser(id string) (*User, error)'),
  type('method', 'Método', 'functions', 'Save', 'func (s *Service) Save(user User) error'),
  type('variable', 'Variable', 'variable_add', 'db', 'var db *sql.DB'),
  type('constant', 'Constante', 'constant', 'MaxRetries', 'const MaxRetries = 3'),
  type('test', 'Test', 'science', 'TestGetUser', 'func TestGetUser(t *testing.T)')
];

const RUBY_PHP_TYPES = [
  type('class', 'Clase', 'class', 'UserService', 'class UserService'),
  type('module', 'Módulo', 'folder', 'Authentication', 'module Authentication'),
  type('method', 'Método', 'functions', 'get_user', 'def get_user(id)'),
  type('function', 'Función', 'function', 'calculate_total', 'function calculate_total($items)'),
  type('variable', 'Variable', 'variable_add', 'current_user', '$current_user = ...'),
  type('constant', 'Constante', 'constant', 'API_URL', 'API_URL = "..."'),
  type('route', 'Ruta', 'route', '/users', 'Route::get("/users", ...)'),
  type('model', 'Modelo', 'database', 'User', 'class User extends Model'),
  type('migration', 'Migración', 'schema', 'create_users_table', 'Schema::create("users", ...)')
];

const SQL_TYPES = [
  type('table', 'Tabla', 'table_chart', 'users', 'CREATE TABLE users (...)'),
  type('column', 'Columna', 'view_column', 'email', 'email VARCHAR(255) NOT NULL'),
  type('view', 'Vista', 'visibility', 'active_users', 'CREATE VIEW active_users AS ...'),
  type('function', 'Función', 'function', 'calculate_total', 'CREATE FUNCTION calculate_total(...)'),
  type('procedure', 'Procedimiento', 'functions', 'sync_users', 'CREATE PROCEDURE sync_users(...)'),
  type('trigger', 'Trigger', 'bolt', 'trg_users_updated', 'CREATE TRIGGER trg_users_updated ...'),
  type('index', 'Índice', 'format_list_numbered', 'idx_users_email', 'CREATE INDEX idx_users_email ON users(email)'),
  type('constraint', 'Restricción', 'rule', 'fk_users_role', 'FOREIGN KEY (role_id) REFERENCES roles(id)'),
  type('schema', 'Esquema', 'folder', 'public', 'CREATE SCHEMA public'),
  type('type', 'Tipo', 'data_object', 'user_status', 'CREATE TYPE user_status AS ENUM (...)'),
  type('sequence', 'Secuencia', 'numbers', 'users_id_seq', 'CREATE SEQUENCE users_id_seq'),
  type('policy', 'Política RLS', 'shield', 'users_select', 'CREATE POLICY users_select ON users ...')
];

const JSON_TYPES = [
  type('key', 'Clave', 'key', 'apiUrl', '"apiUrl": "..."'),
  type('object', 'Objeto', 'data_object', 'user', '"user": { ... }'),
  type('array', 'Array', 'list', 'items', '"items": [ ... ]'),
  type('config', 'Configuración', 'settings', 'database', '"database": { ... }'),
  type('endpoint', 'Endpoint', 'api', '/api/users', '"GET /api/users": { ... }'),
  type('schema', 'Esquema', 'schema', 'UserSchema', '"$schema": "..."')
];

const YAML_TYPES = [
  type('key', 'Clave', 'key', 'version', 'version: "3.9"'),
  type('service', 'Servicio', 'dns', 'api', 'api:'),
  type('environment_variable', 'Variable de Entorno', 'key', 'DATABASE_URL', 'DATABASE_URL: ...'),
  type('volume', 'Volumen', 'storage', 'db_data', 'db_data:'),
  type('network', 'Red', 'lan', 'backend', 'backend:'),
  type('job', 'Job / Tarea', 'work', 'build', 'build:'),
  type('step', 'Paso', 'format_list_numbered', 'checkout', 'steps:'),
  type('secret', 'Secreto', 'lock', 'API_KEY', 'API_KEY: ...')
];

const ENV_TYPES = [
  type('variable', 'Variable', 'key', 'DATABASE_URL', 'DATABASE_URL=postgres://...'),
  type('secret', 'Secreto', 'lock', 'API_KEY', 'API_KEY=...'),
  type('config', 'Configuración', 'settings', 'NODE_ENV', 'NODE_ENV=production')
];

const MD_TYPES = [
  type('heading', 'Título', 'title', 'Introducción', '# Introducción'),
  type('section', 'Sección', 'segment', 'Instalación', '## Instalación'),
  type('link', 'Enlace', 'link', 'Documentación', '[Documentación](https://...)'),
  type('code_block', 'Bloque de Código', 'code', 'Ejemplo', '```js ... ```'),
  type('table', 'Tabla', 'table_chart', 'Parámetros', '| Campo | Tipo |'),
  type('list', 'Lista', 'format_list_bulleted', 'Requisitos', '- Requisito 1'),
  type('note', 'Nota', 'info', 'Importante', '> Nota: ...')
];

const CSS_TYPES = [
  type('selector', 'Selector', 'css', '.button', '.button { ... }'),
  type('class', 'Clase', 'class', '.card', '.card { ... }'),
  type('id', 'ID', 'tag', '#app', '#app { ... }'),
  type('variable', 'Variable CSS', 'variable_add', '--primary-color', '--primary-color: #f5a623;'),
  type('mixin', 'Mixin', 'functions', 'flex-center', '@mixin flex-center { ... }'),
  type('function', 'Función', 'function', 'rem', 'rem(16)'),
  type('media_query', 'Media Query', 'devices', 'mobile', '@media (max-width: 768px) { ... }'),
  type('keyframes', 'Keyframes', 'animation', 'fadeIn', '@keyframes fadeIn { ... }'),
  type('utility', 'Utilidad', 'build', 'mt-4', '.mt-4 { margin-top: 1rem; }')
];

const HTML_TYPES = [
  type('element', 'Elemento', 'html', 'div', '<div class="...">'),
  type('id', 'ID', 'tag', '#app', 'id="app"'),
  type('class', 'Clase', 'class', 'container', 'class="container"'),
  type('script', 'Script', 'code', 'main.js', '<script src="main.js"></script>'),
  type('style', 'Estilo', 'css', 'styles.css', '<link rel="stylesheet" href="styles.css">'),
  type('form', 'Formulario', 'input', 'loginForm', '<form id="loginForm">'),
  type('input', 'Input', 'input', 'email', '<input type="email" name="email">'),
  type('link', 'Enlace', 'link', 'Inicio', '<a href="/">Inicio</a>'),
  type('meta', 'Meta', 'info', 'description', '<meta name="description" content="...">')
];

const XML_TYPES = [
  type('element', 'Elemento', 'code', 'user', '<user>...</user>'),
  type('attribute', 'Atributo', 'label', 'id', 'id="123"'),
  type('namespace', 'Namespace', 'folder', 'ns', 'xmlns:ns="..."'),
  type('schema', 'Esquema', 'schema', 'userSchema', '<xs:schema>...</xs:schema>')
];

const SHELL_TYPES = [
  type('function', 'Función', 'function', 'deploy', 'deploy() { ... }'),
  type('command', 'Comando', 'terminal', 'npm install', 'npm install'),
  type('variable', 'Variable', 'variable_add', 'APP_ENV', 'APP_ENV=production'),
  type('alias', 'Alias', 'link', 'll', 'alias ll="ls -la"'),
  type('job', 'Job', 'work', 'build', 'build:'),
  type('env', 'Variable de Entorno', 'key', 'API_KEY', 'export API_KEY=...')
];

const BUILD_TYPES = [
  type('stage', 'Etapa', 'layers', 'builder', 'FROM node:20 AS builder'),
  type('command', 'Comando', 'terminal', 'npm run build', 'RUN npm run build'),
  type('environment_variable', 'Variable de Entorno', 'key', 'NODE_ENV', 'ENV NODE_ENV=production'),
  type('port', 'Puerto', 'lan', '3000', 'EXPOSE 3000'),
  type('volume', 'Volumen', 'storage', '/app', 'VOLUME /app')
];

const MAKEFILE_TYPES = [
  type('target', 'Target', 'build', 'build', 'build:'),
  type('variable', 'Variable', 'variable_add', 'CC', 'CC = gcc'),
  type('command', 'Comando', 'terminal', 'compile', 'gcc -o app main.c'),
  type('dependency', 'Dependencia', 'link', 'main.o', 'app: main.o')
];

const CSV_TYPES = [
  type('column', 'Columna', 'view_column', 'email', 'email'),
  type('dataset', 'Dataset', 'table_view', 'users', 'users.csv'),
  type('metric', 'Métrica', 'analytics', 'total_users', 'total_users'),
  type('note', 'Nota', 'info', 'Observación', '...')
];

const PUML_TYPES = [
  type('class', 'Clase', 'class', 'User', 'class User { ... }'),
  type('actor', 'Actor', 'person', 'Cliente', 'actor Cliente'),
  type('component', 'Componente', 'widgets', 'API', 'component API'),
  type('database', 'Base de Datos', 'database', 'PostgreSQL', 'database PostgreSQL'),
  type('relationship', 'Relación', 'arrow_forward', 'User -> Order', 'User --> Order'),
  type('note', 'Nota', 'info', 'Observación', 'note right: ...')
];

export const DEFAULT_RECORD_TYPES = [
  type('record', 'Registro', 'data_object', 'Elemento', '...'),
  type('property', 'Propiedad', 'input', 'propiedad', '...'),
  type('value', 'Valor', 'tag', 'valor', '...'),
  type('section', 'Sección', 'segment', 'Sección', '...'),
  type('note', 'Nota', 'info', 'Nota', '...')
];

export const RECORD_TYPES_BY_EXTENSION = {
  js: JS_TYPES,
  jsx: JS_TYPES,
  ts: JS_TYPES,
  tsx: JS_TYPES,
  mjs: JS_TYPES,
  cjs: JS_TYPES,
  py: PY_TYPES,
  java: JVM_TYPES,
  kt: JVM_TYPES,
  kts: JVM_TYPES,
  cs: JVM_TYPES,
  go: GO_TYPES,
  rb: RUBY_PHP_TYPES,
  php: RUBY_PHP_TYPES,
  sql: SQL_TYPES,
  ddl: SQL_TYPES,
  json: JSON_TYPES,
  jsonc: JSON_TYPES,
  yml: YAML_TYPES,
  yaml: YAML_TYPES,
  env: ENV_TYPES,
  md: MD_TYPES,
  mdx: MD_TYPES,
  css: CSS_TYPES,
  scss: CSS_TYPES,
  sass: CSS_TYPES,
  less: CSS_TYPES,
  html: HTML_TYPES,
  htm: HTML_TYPES,
  xml: XML_TYPES,
  sh: SHELL_TYPES,
  bash: SHELL_TYPES,
  zsh: SHELL_TYPES,
  ps1: SHELL_TYPES,
  bat: SHELL_TYPES,
  cmd: SHELL_TYPES,
  dockerfile: BUILD_TYPES,
  makefile: MAKEFILE_TYPES,
  csv: CSV_TYPES,
  tsv: CSV_TYPES,
  puml: PUML_TYPES,
  plantuml: PUML_TYPES,
  txt: DEFAULT_RECORD_TYPES
};

export function getRecordTypesForExtension(extension) {
  const ext = String(extension || '').toLowerCase().replace(/^\./, '');
  return RECORD_TYPES_BY_EXTENSION[ext] || DEFAULT_RECORD_TYPES;
}

let metaMap = null;

function buildMetaMap() {
  if (metaMap) return metaMap;
  metaMap = new Map();
  Object.values(RECORD_TYPES_BY_EXTENSION).forEach((types) => {
    types.forEach((item) => {
      if (!metaMap.has(item.value)) {
        metaMap.set(item.value, { label: item.label, icon: item.icon });
      }
    });
  });
  DEFAULT_RECORD_TYPES.forEach((item) => {
    if (!metaMap.has(item.value)) {
      metaMap.set(item.value, { label: item.label, icon: item.icon });
    }
  });
  return metaMap;
}

export function getRecordTypeMeta(value) {
  return buildMetaMap().get(value) || { label: value || 'Registro', icon: 'data_object' };
}
