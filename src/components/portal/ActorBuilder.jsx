import React, { useState } from 'react';
import { 
  PERMISSION_LEVEL_OPTIONS, 
  ACTOR_CATEGORY_OPTIONS, 
  SYSTEM_AREA_OPTIONS 
} from '../../data/initialActors';

const AVATAR_OPTIONS = [
  { icon: 'person', label: 'Usuario / Persona' },
  { icon: 'psychology', label: 'Psicología / Metas' },
  { icon: 'admin_panel_settings', label: 'Admin / Seguridad' },
  { icon: 'point_of_sale', label: 'Ventas / Caja' },
  { icon: 'inventory_2', label: 'Inventario / Almacén' },
  { icon: 'shield_person', label: 'Oficial de Campo' },
  { icon: 'verified_user', label: 'Auditor / Cumplimiento' },
  { icon: 'route', label: 'Ruta / Progreso' },
  { icon: 'groups', label: 'Equipo / Comunidad' }
];

const COLOR_OPTIONS = [
  { id: 'emerald', label: 'Verde Esmeralda', bg: 'bg-emerald-500' },
  { id: 'sky', label: 'Azul Cielo', bg: 'bg-sky-500' },
  { id: 'purple', label: 'Púrpura', bg: 'bg-purple-500' },
  { id: 'cyan', label: 'Cian Neón', bg: 'bg-cyan-500' },
  { id: 'amber', label: 'Ámbar Cálido', bg: 'bg-amber-500' },
  { id: 'primary', label: 'Dorado Pathrimonio', bg: 'bg-primary' }
];

export default function ActorBuilder({
  onSaveActor,
  onNotify,
  activeProjectId
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(ACTOR_CATEGORY_OPTIONS[1] || 'Usuario Final / B2C');
  const [avatarIcon, setAvatarIcon] = useState('person');
  const [color, setColor] = useState('emerald');
  const [description, setDescription] = useState('');
  const [permissionLevel, setPermissionLevel] = useState(PERMISSION_LEVEL_OPTIONS[2] || 'Operativo / Escritura');
  const [selectedAreas, setSelectedAreas] = useState([SYSTEM_AREA_OPTIONS[0]]);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [assignedWorkerName, setAssignedWorkerName] = useState('');
  const [assignedWorker, setAssignedWorker] = useState('');
  const [isPrimaryRole, setIsPrimaryRole] = useState(false);

  // Toggle area checkbox
  const toggleArea = (area) => {
    if (selectedAreas.includes(area)) {
      if (selectedAreas.length === 1) {
        onNotify?.('Debes seleccionar al menos un área del sistema con permisos.');
        return;
      }
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  // Add custom area
  const handleAddCustomArea = (e) => {
    e.preventDefault();
    const clean = newAreaInput.trim();
    if (!clean) return;
    if (!selectedAreas.includes(clean)) {
      setSelectedAreas([...selectedAreas, clean]);
      setNewAreaInput('');
    }
  };

  // Quick Preset Loader
  const loadPreset = (presetType) => {
    switch (presetType) {
      case 'admin':
        setName('Administrador del Sistema');
        setCategory('Administración & Gerencia');
        setAvatarIcon('admin_panel_settings');
        setColor('purple');
        setDescription('Responsable de la configuración global de la empresa, supervisión de métricas, asignación de permisos y aprobación de flujos críticos.');
        setPermissionLevel('Acceso Total (Admin)');
        setSelectedAreas(['Gestión & Monitoreo', 'Configuración & Permisos', 'Reportes de Impacto']);
        setIsPrimaryRole(true);
        break;
      case 'operator':
        setName('Operador Comercial / Ventas');
        setCategory('Operaciones & Ventas');
        setAvatarIcon('point_of_sale');
        setColor('cyan');
        setDescription('Atiende transacciones directas con clientes o usuarios finales, registra operaciones y consulta estados en tiempo real.');
        setPermissionLevel('Operativo / Escritura');
        setSelectedAreas(['Ventas & Facturación', 'Gestión & Monitoreo']);
        setIsPrimaryRole(false);
        break;
      case 'enduser':
        setName('Cliente / Usuario Final');
        setCategory('Usuario Final / B2C');
        setAvatarIcon('psychology');
        setColor('emerald');
        setDescription('Persona o beneficiario directo de la solución. Requiere una experiencia ágil, intuitiva y visual sin fricción técnica.');
        setPermissionLevel('Usuario Móvil / B2C');
        setSelectedAreas(['Metas & Hábitos (Pathway)', 'Pasos & Hitos']);
        setIsPrimaryRole(false);
        break;
      case 'inventory':
        setName('Encargado de Almacén');
        setCategory('Operaciones & Ventas');
        setAvatarIcon('inventory_2');
        setColor('amber');
        setDescription('Supervisa ingresos de mercadería, kardex físico y atiende alertas tempranas de inventario crítico.');
        setPermissionLevel('Operativo / Escritura');
        setSelectedAreas(['Inventario & Alertas', 'Gestión & Monitoreo']);
        setIsPrimaryRole(false);
        break;
      default:
        break;
    }
    onNotify?.('Plantilla de rol cargada en el formulario.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      onNotify?.('Por favor indica el nombre del rol o actor del negocio.');
      return;
    }

    if (!description.trim()) {
      onNotify?.('Por favor agrega una breve descripción de las responsabilidades de este actor.');
      return;
    }

    if (selectedAreas.length === 0) {
      onNotify?.('Debes asociar al menos un área del sistema donde el actor tenga permisos.');
      return;
    }

    const newActor = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      projectId: activeProjectId || 'pathway',
      name: name.trim(),
      category,
      avatarIcon,
      color,
      description: description.trim(),
      permissionLevel,
      systemAreas: selectedAreas,
      assignedWorker: assignedWorker.trim(),
      assignedWorkerName: assignedWorkerName.trim(),
      isPrimaryRole,
      status: 'Activo',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSaveActor(newActor);
    onNotify?.(`¡Actor "${newActor.name}" registrado con éxito! Ya está disponible en el Combobox de Historias de Usuario.`);

    // Reset form
    setName('');
    setDescription('');
    setAssignedWorker('');
    setAssignedWorkerName('');
    setIsPrimaryRole(false);
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex flex-col gap-5 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
            <h2 className="font-space text-base text-white font-semibold">Registrar Actor o Rol</h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-space text-[10px] font-semibold uppercase tracking-wider">
            Requerimientos
          </span>
        </div>
        <p className="font-jakarta text-xs text-on-surface-variant">
          Establece quién actúa en el sistema, su alcance y permisos para que las Historias de Usuario mantengan coherencia técnica.
        </p>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="font-space text-[11px] text-on-surface-variant">Plantillas rápidas:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => loadPreset('admin')}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white font-space text-[11px] transition-colors"
            >
              👑 Administrador
            </button>
            <button
              type="button"
              onClick={() => loadPreset('operator')}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white font-space text-[11px] transition-colors"
            >
              💳 Operador Ventas
            </button>
            <button
              type="button"
              onClick={() => loadPreset('inventory')}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white font-space text-[11px] transition-colors"
            >
              📦 Almacén / Stock
            </button>
            <button
              type="button"
              onClick={() => loadPreset('enduser')}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-white font-space text-[11px] transition-colors"
            >
              📱 Usuario Final B2C
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Nombre del Rol */}
        <div className="flex flex-col gap-1">
          <label className="font-space text-xs text-white flex items-center justify-between">
            <span className="font-medium">Nombre del Rol o Actor</span>
            <span className="text-on-surface-variant font-space text-[10px] uppercase">Requerido</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Administrador General, Cajero de Tienda, Usuario Móvil..."
            className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        {/* Categoría y Nivel de Permiso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Categoría */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">Categoría del Actor</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
            >
              {ACTOR_CATEGORY_OPTIONS.filter(c => c !== 'Todas').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Nivel de Permiso */}
          <div className="flex flex-col gap-1">
            <label className="font-space text-xs text-white font-medium">Nivel de Permisos</label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value)}
              className="w-full h-9 bg-surface-container-lowest border border-outline-variant rounded-xl px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
            >
              {PERMISSION_LEVEL_OPTIONS.filter(p => p !== 'Todos').map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Avatar Icon & Color Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Avatar Icon */}
          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs text-white font-medium">Ícono Identificador</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVATAR_OPTIONS.map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => setAvatarIcon(item.icon)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                    avatarIcon === item.icon
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:text-white'
                  }`}
                  title={item.label}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Tag */}
          <div className="flex flex-col gap-1.5">
            <label className="font-space text-xs text-white font-medium">Color de Tarjeta</label>
            <div className="flex items-center gap-2 pt-1">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setColor(col.id)}
                  className={`w-6 h-6 rounded-full ${col.bg} transition-transform ${
                    color === col.id ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-container scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={col.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Descripción de Responsabilidades */}
        <div className="flex flex-col gap-1">
          <label className="font-space text-xs text-white flex items-center justify-between">
            <span className="font-medium">Descripción y Responsabilidades</span>
            <span className="text-on-surface-variant font-space text-[10px] uppercase">Contexto de Negocio</span>
          </label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Qué hace este actor en la empresa? ¿Qué decisiones toma? ¿Por qué necesita interactuar con el sistema?"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 font-jakarta text-xs text-white focus:outline-none focus:border-primary resize-none"
            required
          />
        </div>

        {/* Áreas del Sistema con Permisos */}
        <div className="flex flex-col gap-2">
          <label className="font-space text-xs text-white flex items-center justify-between">
            <span className="font-medium">Áreas del Sistema con Permisos</span>
            <span className="text-primary font-mono text-[10px]">{selectedAreas.length} seleccionadas</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-surface-container-lowest border border-outline-variant rounded-xl">
            {SYSTEM_AREA_OPTIONS.map((area) => {
              const checked = selectedAreas.includes(area);
              return (
                <label
                  key={area}
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                    checked ? 'bg-primary/10 text-white' : 'hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArea(area)}
                    className="rounded border-outline-variant text-primary focus:ring-0"
                  />
                  <span className="font-jakarta text-[11px] truncate">{area}</span>
                </label>
              );
            })}
          </div>

          {/* Add custom area tag */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={newAreaInput}
              onChange={(e) => setNewAreaInput(e.target.value)}
              placeholder="Añadir otra área personalizada..."
              className="flex-1 h-8 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddCustomArea}
              className="h-8 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-white font-space text-xs transition-colors"
            >
              + Agregar
            </button>
          </div>
        </div>

        {/* Asignación de Colaborador / Trabajador (Para compartir enlace) */}
        <div className="p-3 bg-surface-container/60 border border-outline-variant/80 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">share</span>
            <span className="font-space text-xs font-semibold text-white">
              Colaborador o Trabajador Asignado
            </span>
          </div>
          <p className="font-jakarta text-[11px] text-on-surface-variant leading-relaxed">
            Asigna un trabajador para generarle un enlace directo y permitirle completar las Historias de Usuario que le corresponden a su rol.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={assignedWorkerName}
              onChange={(e) => setAssignedWorkerName(e.target.value)}
              placeholder="Nombre (ej. Elena Morales)"
              className="h-8 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
            />
            <input
              type="email"
              value={assignedWorker}
              onChange={(e) => setAssignedWorker(e.target.value)}
              placeholder="Email (ej. elena@empresa.com)"
              className="h-8 bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 font-jakarta text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Switch Rol Principal */}
        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isPrimaryRole}
            onChange={(e) => setIsPrimaryRole(e.target.checked)}
            className="rounded border-outline-variant text-primary focus:ring-0"
          />
          <span className="font-space text-xs text-white">Marcar como Rol Principal de este Proyecto</span>
        </label>

        {/* Submit CTA */}
        <button
          type="submit"
          className="w-full mt-2 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-space text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Registrar Actor de Negocio</span>
        </button>
      </form>
    </div>
  );
}
