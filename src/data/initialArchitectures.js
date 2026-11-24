import { PATHRIMONIO_SITE_ARCHITECTURE } from './pathrimonioSiteData.js';

// Catálogo de Arquitecturas de Software Sintetizadas por la skill Archify
// para cada uno de los proyectos activos en Pathrimonio.
// Principio: Zero-Code Leakage (Firmas abstractas, contratos, topologías C4 y trazabilidad DoD).

export const PROJECT_ARCHITECTURES = {
  pathway: {
    projectId: 'pathway',
    projectName: 'Pathway (App MVP)',
    architecturePattern: 'Clean Architecture + 100% Offline-First SQLite',
    version: 'v1.0.1-prod',
    synthesizedBy: 'archify Engine v3.3 (AST & HTML Mode)',
    lastAnalyzed: '2026-11-23T20:45:00-05:00',
    tokenSavingsPercent: 95.4,
    auditStatus: 'Certificada (Cero Fuga de Código)',
    summary: 'Arquitectura móvil nativa reactiva y resiliente desacoplada en 4 capas concéntricas. La operativa nuclear de metas, secuencias y rachas opera enteramente sobre base de datos SQLite local en disco del dispositivo, sin requerir conexión a internet para registrar progreso o evaluar invariantes de dominio.',
    metrics: {
      layersCount: 4,
      abstractMethodsCount: 28,
      tracedStoriesPercent: 100,
      tokenReductionRatio: '18.4x',
      offlineReadiness: '100% Nativo',
      dipCompliance: '100% Inversión de Dependencias'
    },
    layers: [
      {
        id: 'presentation',
        name: 'Capa 1: Presentación & UI',
        badge: 'UI/UX',
        colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        description: 'Vistas móviles en React Native, componentes de estado local, hooks y navegadores que reciben interacción táctil del usuario y delegan a casos de uso.',
        components: [
          {
            name: 'GoalListScreen',
            path: 'src/screens/goals/GoalListScreen.tsx',
            type: 'screen',
            abstractMethods: [
              { symbol: 'GoalListScreen.renderGoalCards', signature: 'renderGoalCards(goals: GoalSummary[]): JSX.Element[]', visibility: 'public', isAsync: false, line: 42, doc: 'Renderizado reactivo de tarjetas de metas activas con indicador de progreso visual.' },
              { symbol: 'GoalListScreen.handleQuickCheckin', signature: 'handleQuickCheckin(goalId: string): Promise<void>', visibility: 'public', isAsync: true, line: 88, doc: 'Disparo de registro de racha en un toque delegando al servicio de aplicación.' }
            ]
          },
          {
            name: 'StepSequenceModal',
            path: 'src/components/steps/StepSequenceModal.tsx',
            type: 'component',
            abstractMethods: [
              { symbol: 'StepSequenceModal.onReorderSteps', signature: 'onReorderSteps(stepIds: string[]): void', visibility: 'public', isAsync: false, line: 36, doc: 'Reordenamiento drag & drop de pasos secuenciales para una meta.' },
              { symbol: 'StepSequenceModal.toggleStepComplete', signature: 'toggleStepComplete(stepId: string): Promise<boolean>', visibility: 'public', isAsync: true, line: 64, doc: 'Alterna el estado completado de un paso e invoca cálculo de racha.' }
            ]
          },
          {
            name: 'HabitStreakWidget',
            path: 'src/components/habits/HabitStreakWidget.tsx',
            type: 'component',
            abstractMethods: [
              { symbol: 'HabitStreakWidget.computeStreakRing', signature: 'computeStreakRing(currentStreak: number, maxStreak: number): RingStyle', visibility: 'private', isAsync: false, line: 24, doc: 'Cálculo de estilo SVG cinético del anillo de hábito diario.' }
            ]
          }
        ]
      },
      {
        id: 'application',
        name: 'Capa 2: Aplicación & Casos de Uso',
        badge: 'USE CASES',
        colorClass: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        description: 'Orquestación de la lógica de aplicación sin dependencia de librerías de UI ni de frameworks de base de datos. Implementa los casos de uso descritos en las Historias de Usuario.',
        components: [
          {
            name: 'GoalApplicationService',
            path: 'src/application/goals/GoalApplicationService.ts',
            type: 'service',
            abstractMethods: [
              { symbol: 'GoalApplicationService.createGoal', signature: 'public async createGoal(cmd: CreateGoalCommand): Promise<GoalId>', visibility: 'public', isAsync: true, line: 28, doc: 'Crea una nueva meta validando título, categoría y fecha estimada.' },
              { symbol: 'GoalApplicationService.archiveGoal', signature: 'public async archiveGoal(id: GoalId): Promise<void>', visibility: 'public', isAsync: true, line: 62, doc: 'Archiva una meta preservando histórico y estadísticas de racha.' },
              { symbol: 'GoalApplicationService.listActiveGoals', signature: 'public async listActiveGoals(): Promise<GoalSummary[]>', visibility: 'public', isAsync: true, line: 85, doc: 'Recupera metas activas ordenadas por prioridad e índice de secuencia.' }
            ]
          },
          {
            name: 'RegisterCheckinUseCase',
            path: 'src/application/habits/RegisterCheckinUseCase.ts',
            type: 'use_case',
            abstractMethods: [
              { symbol: 'RegisterCheckinUseCase.execute', signature: 'public async execute(habitId: string, timestamp: number): Promise<CheckinResult>', visibility: 'public', isAsync: true, line: 31, doc: 'Ejecuta el check-in diario evaluando el cálculo de racha en el dominio.' }
            ]
          },
          {
            name: 'StepSequenceOrchestrator',
            path: 'src/application/steps/StepSequenceOrchestrator.ts',
            type: 'service',
            abstractMethods: [
              { symbol: 'StepSequenceOrchestrator.advanceNextStep', signature: 'public async advanceNextStep(goalId: string): Promise<StepAdvanceResult>', visibility: 'public', isAsync: true, line: 44, doc: 'Avanza automáticamente el puntero al siguiente paso pendiente de la meta.' }
            ]
          }
        ]
      },
      {
        id: 'domain',
        name: 'Capa 3: Dominio & Reglas Nucleares',
        badge: 'DOMAIN',
        colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        description: 'Entidades puras, objetos de valor y reglas invariantes del negocio Pathway. No importa nada de React, SQLite ni HTTP. 100% TypeScript puro y testeable.',
        components: [
          {
            name: 'Goal (Aggregate Root)',
            path: 'src/domain/goals/Goal.ts',
            type: 'entity',
            abstractMethods: [
              { symbol: 'Goal.calculateCompletionPercent', signature: 'public calculateCompletionPercent(): number', visibility: 'public', isAsync: false, line: 55, doc: 'Calcula porcentaje exacto (0-100) en base a pasos cerrados vs totales.' },
              { symbol: 'Goal.addStep', signature: 'public addStep(stepTitle: string, orderIndex: number): void', visibility: 'public', isAsync: false, line: 72, doc: 'Agrega un paso garantizando unicidad en índice secuencial.' },
              { symbol: 'Goal.markAsAchieved', signature: 'public markAsAchieved(achievedAt: Date): void', visibility: 'public', isAsync: false, line: 104, doc: 'Sella la meta como cumplida generando evento de dominio GoalAchievedEvent.' }
            ]
          },
          {
            name: 'HabitStreakPolicy',
            path: 'src/domain/habits/HabitStreakPolicy.ts',
            type: 'policy',
            abstractMethods: [
              { symbol: 'HabitStreakPolicy.evaluateStreak', signature: 'public evaluateStreak(lastCheckin: Date, newCheckin: Date, currentStreak: number): number', visibility: 'public', isAsync: false, line: 20, doc: 'Calcula si la racha se incrementa (+1), se congela o se reinicia a 1.' }
            ]
          },
          {
            name: 'Step (Entity)',
            path: 'src/domain/steps/Step.ts',
            type: 'entity',
            abstractMethods: [
              { symbol: 'Step.complete', signature: 'public complete(): void', visibility: 'public', isAsync: false, line: 32, doc: 'Marca el paso individual como completado verificando prerrequisitos.' }
            ]
          }
        ]
      },
      {
        id: 'infrastructure',
        name: 'Capa 4: Infraestructura & Adaptadores',
        badge: 'INFRA',
        colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        description: 'Implementación concreta de puertos definidos en el dominio y aplicación: almacenamiento local SQLite, exportación a JSON y sincronización diferida.',
        components: [
          {
            name: 'SQLiteGoalRepository',
            path: 'src/infrastructure/persistence/SQLiteGoalRepository.ts',
            type: 'repository',
            abstractMethods: [
              { symbol: 'SQLiteGoalRepository.findById', signature: 'public async findById(id: GoalId): Promise<Goal | null>', visibility: 'public', isAsync: true, line: 38, doc: 'Lee registro de meta y sus pasos asociados desde SQLite local.' },
              { symbol: 'SQLiteGoalRepository.save', signature: 'public async save(goal: Goal): Promise<void>', visibility: 'public', isAsync: true, line: 68, doc: 'Guarda o actualiza de forma atómica en SQLite con transacción ACID.' },
              { symbol: 'SQLiteGoalRepository.queryActive', signature: 'public async queryActive(): Promise<GoalRecord[]>', visibility: 'public', isAsync: true, line: 112, doc: 'Consulta indexada por estado = active y orden secuencial.' }
            ]
          },
          {
            name: 'LocalFileBackupService',
            path: 'src/infrastructure/backup/LocalFileBackupService.ts',
            type: 'adapter',
            abstractMethods: [
              { symbol: 'LocalFileBackupService.exportToJSON', signature: 'public async exportToJSON(): Promise<string>', visibility: 'public', isAsync: true, line: 22, doc: 'Exporta todas las tablas SQLite a archivo JSON firmado con SHA-256 en disco.' }
            ]
          }
        ]
      }
    ],
    mermaidDiagram: `flowchart TD
  subgraph PresentationLayer["Capa 1: Presentación (React Native UI)"]
    UI_List["GoalListScreen (Vistas de Metas)"]
    UI_Modal["StepSequenceModal (Pasos)"]
    UI_Widget["HabitStreakWidget (Rachas)"]
  end

  subgraph ApplicationLayer["Capa 2: Aplicación (Casos de Uso)"]
    App_Goal["GoalApplicationService"]
    App_Checkin["RegisterCheckinUseCase"]
    App_Step["StepSequenceOrchestrator"]
  end

  subgraph DomainLayer["Capa 3: Dominio (Entidades & Políticas)"]
    Dom_Goal["Goal (Aggregate Root)"]
    Dom_Step["Step (Entidad)"]
    Dom_Policy["HabitStreakPolicy (Regla de Racha)"]
  end

  subgraph InfrastructureLayer["Capa 4: Infraestructura (SQLite Offline)"]
    Repo_SQLite[("SQLite Local Database (ACID)")]
    Adapter_Backup["LocalFileBackupService"]
  end

  %% Flujos respetando Clean Architecture
  UI_List -->|invoca| App_Goal
  UI_Modal -->|invoca| App_Step
  UI_Widget -->|invoca| App_Checkin

  App_Goal -->|manipula| Dom_Goal
  App_Step -->|manipula| Dom_Step
  App_Checkin -->|evalúa| Dom_Policy

  App_Goal -->|persiste vía Port| Repo_SQLite
  App_Step -->|persiste vía Port| Repo_SQLite
  Adapter_Backup -.->|lee snapshot| Repo_SQLite`,
    traceabilityMatrix: [
      {
        storyId: 'US-101',
        storyTitle: 'Creación y registro de meta secuencial',
        interfaceId: 'IF-01',
        interfaceName: 'Pantalla de Creación de Metas',
        abstractMethod: 'GoalApplicationService.createGoal(cmd: CreateGoalCommand)',
        domainModel: 'goals (Tabla SQLite)',
        doDCriterion: 'Persistencia local en < 15ms sin conexión a internet y validación de título obligatorio.',
        status: 'Auditado'
      },
      {
        storyId: 'US-102',
        storyTitle: 'Avance secuencial de pasos y cálculo de porcentaje',
        interfaceId: 'IF-02',
        interfaceName: 'Modal de Pasos y Checklist',
        abstractMethod: 'Goal.calculateCompletionPercent(): number',
        domainModel: 'steps (Tabla SQLite)',
        doDCriterion: 'El indicador de progreso se actualiza reactivamente tras cada checklist confirmado.',
        status: 'Auditado'
      },
      {
        storyId: 'US-103',
        storyTitle: 'Registro de check-in diario y preservación de racha',
        interfaceId: 'IF-03',
        interfaceName: 'Widget de Anillo de Racha',
        abstractMethod: 'HabitStreakPolicy.evaluateStreak(...)',
        domainModel: 'habits (Tabla SQLite)',
        doDCriterion: 'Incremento atómico de la racha si el check-in ocurre dentro de la ventana de 24 horas.',
        status: 'Auditado'
      }
    ],
    diagnostics: {
      dipCompliance: '100% — El Dominio no tiene ninguna importación de SQLite ni de React Native.',
      zeroLeakageScore: '100% — Solo firmas abstractas expuestas en manifiesto.',
      offlineReadiness: '100% — Operativa nuclear garantizada en modo avión sin fallos.',
      cyclomaticComplexity: '1.2 (Promedio por método)',
      recommendations: [
        'Mantener el esquema SQLite versionado mediante migraciones automáticas al iniciar la app.',
        'Preservar el desacoplamiento de la política de racha como función pura de dominio.'
      ]
    }
  },

  smatad: {
    projectId: 'smatad',
    projectName: 'SMATAD — Transporte & Asignación Dinámica',
    architecturePattern: 'Hexagonal Architecture + LangGraph Multi-Agent + DeepSeek OCR',
    version: 'v1.2.0-sprint3',
    synthesizedBy: 'archify Engine v3.3 (AST & HTML Mode)',
    lastAnalyzed: '2026-11-23T20:50:00-05:00',
    tokenSavingsPercent: 96.1,
    auditStatus: 'Certificada (Cero Fuga de Código)',
    summary: 'Arquitectura hexagonal distribuida para logística de carga pesada. Combina una aplicación móvil React Native para conductores con orquestación inteligente de recursos asistida por agentes autónomos LangGraph, digitalización instantánea de Guías de Remisión Electrónica (GRE) vía OCR y telemetría satelital con Supabase Realtime.',
    metrics: {
      layersCount: 4,
      abstractMethodsCount: 36,
      tracedStoriesPercent: 100,
      tokenReductionRatio: '21.2x',
      offlineReadiness: 'Híbrida Resiliente (Sync Automático)',
      dipCompliance: '100% Puertos y Adaptadores'
    },
    layers: [
      {
        id: 'presentation',
        name: 'Capa 1: Presentación & Interfaces Móvil/Web',
        badge: 'UI/UX',
        colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        description: 'Interfaces móviles para transportistas en ruta, panel web para coordinadores de despacho y visor de telemetría en tiempo real.',
        components: [
          {
            name: 'DriverTripScreen',
            path: 'src/screens/trips/DriverTripScreen.tsx',
            type: 'screen',
            abstractMethods: [
              { symbol: 'DriverTripScreen.onStartTrip', signature: 'onStartTrip(tripId: string): Promise<void>', visibility: 'public', isAsync: true, line: 34, doc: 'Inicia el viaje emitiendo punto GPS inicial y validando checklist del vehículo.' },
              { symbol: 'DriverTripScreen.reportIncident', signature: 'reportIncident(tripId: string, type: IncidentType): Promise<void>', visibility: 'public', isAsync: true, line: 78, doc: 'Emite alerta inmediata al orquestador multiagente ante detención o desvío.' }
            ]
          },
          {
            name: 'WaybillScannerModal',
            path: 'src/components/ocr/WaybillScannerModal.tsx',
            type: 'component',
            abstractMethods: [
              { symbol: 'WaybillScannerModal.captureAndExtract', signature: 'captureAndExtract(photoUri: string): Promise<WaybillData>', visibility: 'public', isAsync: true, line: 28, doc: 'Captura imagen física de la guía GRE y delega la extracción a la capa de aplicación.' }
            ]
          },
          {
            name: 'FleetMonitoringDashboard',
            path: 'src/views/fleet/FleetMonitoringDashboard.tsx',
            type: 'screen',
            abstractMethods: [
              { symbol: 'FleetMonitoringDashboard.renderTelemetryMap', signature: 'renderTelemetryMap(vehicles: VehicleLocation[]): JSX.Element', visibility: 'public', isAsync: false, line: 52, doc: 'Visualiza la flota sobre mapa con estados en vivo: en tránsito, cargando o detenido.' }
            ]
          }
        ]
      },
      {
        id: 'application',
        name: 'Capa 2: Aplicación, Casos de Uso & Agentes',
        badge: 'AGENTS / USE CASES',
        colorClass: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        description: 'Orquestación de procesos de transporte, validación de guías OCR y coordinación inteligente de flota mediante agentes autónomos LangGraph.',
        components: [
          {
            name: 'DispatchOrchestratorAgent',
            path: 'src/application/agents/DispatchOrchestratorAgent.ts',
            type: 'agent',
            abstractMethods: [
              { symbol: 'DispatchOrchestratorAgent.evaluateCarrierMatch', signature: 'public async evaluateCarrierMatch(orderId: string): Promise<AssignmentProposal>', visibility: 'public', isAsync: true, line: 40, doc: 'Agente autónomo que empareja orden de carga con conductor y tracto óptimo.' },
              { symbol: 'DispatchOrchestratorAgent.auditTripMilestones', signature: 'public async auditTripMilestones(tripId: string): Promise<AuditReport>', visibility: 'public', isAsync: true, line: 85, doc: 'Monitorea cumplimiento de ventanas horarias y descansos reglamentarios.' }
            ]
          },
          {
            name: 'ProcessWaybillOcrUseCase',
            path: 'src/application/ocr/ProcessWaybillOcrUseCase.ts',
            type: 'use_case',
            abstractMethods: [
              { symbol: 'ProcessWaybillOcrUseCase.execute', signature: 'public async execute(imageStream: Blob): Promise<ExtractedGRE>', visibility: 'public', isAsync: true, line: 30, doc: 'Procesa guía física mediante adaptador OCR y valida formato SUNAT.' }
            ]
          },
          {
            name: 'CalculateTpvMetricsUseCase',
            path: 'src/application/metrics/CalculateTpvMetricsUseCase.ts',
            type: 'use_case',
            abstractMethods: [
              { symbol: 'CalculateTpvMetricsUseCase.computeTpv', signature: 'public computeTpv(travelHours: number, waitHours: number): TpvSummary', visibility: 'public', isAsync: false, line: 22, doc: 'Calcula Tiempo Promedio de Viaje (TPV) desglosando tránsito y esperas en planta.' }
            ]
          }
        ]
      },
      {
        id: 'domain',
        name: 'Capa 3: Dominio & Reglas Logísticas',
        badge: 'DOMAIN',
        colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        description: 'Reglas nucleares de transporte de carga pesada, cumplimiento normativo de descansos (SUTRAN) y validación de Guías de Remisión Electrónica.',
        components: [
          {
            name: 'Trip (Aggregate Root)',
            path: 'src/domain/trips/Trip.ts',
            type: 'entity',
            abstractMethods: [
              { symbol: 'Trip.assignVehicleAndDriver', signature: 'public assignVehicleAndDriver(vehicleId: string, driverId: string): void', visibility: 'public', isAsync: false, line: 45, doc: 'Asigna unidad verificando SOAT, revisión técnica y brevete vigente.' },
              { symbol: 'Trip.recordCheckinCheckpoint', signature: 'public recordCheckinCheckpoint(coords: GpsCoords, timestamp: Date): void', visibility: 'public', isAsync: false, line: 82, doc: 'Registra hito de viaje calculando velocidad y desvío de ruta planificada.' },
              { symbol: 'Trip.closeTripWithProof', signature: 'public closeTripWithProof(podUrl: string): void', visibility: 'public', isAsync: false, line: 115, doc: 'Cierra el viaje con comprobante de entrega conforme (Proof of Delivery).' }
            ]
          },
          {
            name: 'GuiaRemisionElectronica (Value Object)',
            path: 'src/domain/waybill/GuiaRemisionElectronica.ts',
            type: 'value_object',
            abstractMethods: [
              { symbol: 'GuiaRemisionElectronica.validateSunatChecksum', signature: 'public validateSunatChecksum(): boolean', visibility: 'public', isAsync: false, line: 32, doc: 'Valida estructura de 13 dígitos y RUC de remitente y destinatario.' }
            ]
          },
          {
            name: 'RestHoursPolicy',
            path: 'src/domain/compliance/RestHoursPolicy.ts',
            type: 'policy',
            abstractMethods: [
              { symbol: 'RestHoursPolicy.canContinueDriving', signature: 'public canContinueDriving(consecutiveHours: number): boolean', visibility: 'public', isAsync: false, line: 18, doc: 'Exige descanso obligatorio de 30 minutos por cada 4 horas continuas.' }
            ]
          }
        ]
      },
      {
        id: 'infrastructure',
        name: 'Capa 4: Infraestructura & Adaptadores',
        badge: 'INFRA / ADAPTERS',
        colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        description: 'Conectores a Supabase Realtime, motor OCR DeepSeek, telemetría GPS IoT y motor de flujo LangGraph.',
        components: [
          {
            name: 'SupabaseTripRepository',
            path: 'src/infrastructure/supabase/SupabaseTripRepository.ts',
            type: 'repository',
            abstractMethods: [
              { symbol: 'SupabaseTripRepository.findActiveByDriver', signature: 'public async findActiveByDriver(driverId: string): Promise<Trip | null>', visibility: 'public', isAsync: true, line: 42, doc: 'Recupera viaje activo del transportista desde tabla via_viajes en Supabase.' },
              { symbol: 'SupabaseTripRepository.saveStatusUpdate', signature: 'public async saveStatusUpdate(tripId: string, status: TripStatus): Promise<void>', visibility: 'public', isAsync: true, line: 78, doc: 'Actualiza estado del viaje con timestamp auditado.' }
            ]
          },
          {
            name: 'DeepSeekOcrAdapter',
            path: 'src/infrastructure/ocr/DeepSeekOcrAdapter.ts',
            type: 'adapter',
            abstractMethods: [
              { symbol: 'DeepSeekOcrAdapter.extractWaybillFields', signature: 'public async extractWaybillFields(imageBuffer: Buffer): Promise<RawOcrFields>', visibility: 'public', isAsync: true, line: 24, doc: 'Conecta con modelo de visión OCR para parsear tabla de ítems y pesos.' }
            ]
          },
          {
            name: 'GpsTelemetryGateway',
            path: 'src/infrastructure/iot/GpsTelemetryGateway.ts',
            type: 'adapter',
            abstractMethods: [
              { symbol: 'GpsTelemetryGateway.pushLiveCoordinates', signature: 'public async pushLiveCoordinates(telemetryPacket: GpsPacket): Promise<void>', visibility: 'public', isAsync: true, line: 36, doc: 'Envía punto georreferenciado a canal de WebSocket con compresión binaria.' }
            ]
          }
        ]
      }
    ],
    mermaidDiagram: `flowchart TD
  subgraph Presentation["Capa 1: Interfaces Conductor & Coordinación"]
    UI_Driver["DriverTripScreen (App Móvil)"]
    UI_Scan["WaybillScannerModal (Cámara OCR)"]
    UI_Fleet["FleetMonitoringDashboard (Panel Web)"]
  end

  subgraph Application["Capa 2: Casos de Uso & Agentes Autónomos"]
    Agent_Dispatch["DispatchOrchestratorAgent (LangGraph)"]
    UC_Ocr["ProcessWaybillOcrUseCase"]
    UC_Tpv["CalculateTpvMetricsUseCase"]
  end

  subgraph Domain["Capa 3: Dominio Logístico & Reglas SUTRAN"]
    Dom_Trip["Trip (Aggregate Root)"]
    Dom_GRE["GuiaRemisionElectronica (Value Object)"]
    Dom_Rest["RestHoursPolicy (Descanso Conductor)"]
  end

  subgraph Infrastructure["Capa 4: Infraestructura & Servicios Cloud"]
    DB_Supabase[("Supabase Realtime PostgreSQL")]
    API_Ocr["DeepSeek Vision OCR Engine"]
    IoT_Gps["GpsTelemetryGateway (WebSocket)"]
  end

  UI_Driver -->|inicia viaje| Dom_Trip
  UI_Driver -->|reporta telemetría| IoT_Gps
  UI_Scan -->|envía imagen| UC_Ocr
  UI_Fleet -->|consulta asignación| Agent_Dispatch

  Agent_Dispatch -->|evalúa reglas| Dom_Rest
  Agent_Dispatch -->|orquesta| Dom_Trip
  UC_Ocr -->|extrae campos| API_Ocr
  UC_Ocr -->|valida estructura| Dom_GRE

  Dom_Trip -->|persiste vía Port| DB_Supabase
  IoT_Gps -->|transmite coordenadas| DB_Supabase`,
    traceabilityMatrix: [
      {
        storyId: 'US-SMATAD-01',
        storyTitle: 'Extracción instantánea de datos de Guía GRE física vía OCR',
        interfaceId: 'IF-08',
        interfaceName: 'Modal de Escaneo de Guía Remisión',
        abstractMethod: 'ProcessWaybillOcrUseCase.execute(imageStream: Blob)',
        domainModel: 'guias_remision (Tabla Supabase)',
        doDCriterion: 'Extracción del 100% de campos SUNAT (RUC, serie, número, peso) en menos de 2.5 segundos.',
        status: 'Auditado'
      },
      {
        storyId: 'US-SMATAD-02',
        storyTitle: 'Orquestación y asignación óptima de conductor y tracto',
        interfaceId: 'IF-14',
        interfaceName: 'Bandeja de Despacho y Asignación',
        abstractMethod: 'DispatchOrchestratorAgent.evaluateCarrierMatch(...)',
        domainModel: 'viajes (Tabla Supabase)',
        doDCriterion: 'Propuesta automática considerando compatibilidad de tolva y horas de descanso SUTRAN.',
        status: 'Auditado'
      },
      {
        storyId: 'US-SMATAD-03',
        storyTitle: 'Cálculo analítico del Tiempo Promedio de Viaje (TPV)',
        interfaceId: 'IF-22',
        interfaceName: 'Reporte de Productividad TPV',
        abstractMethod: 'CalculateTpvMetricsUseCase.computeTpv(...)',
        domainModel: 'metricas_operativas (Tabla Supabase)',
        doDCriterion: 'Desglose exacto entre horas de rodaje efectivo y demoras en planta de origen y destino.',
        status: 'Auditado'
      }
    ],
    diagnostics: {
      dipCompliance: '100% — Arquitectura de Puertos y Adaptadores estricta.',
      zeroLeakageScore: '100% — Toda la lógica interna de OCR y Agentes se encapsula tras firmas abstractas.',
      offlineReadiness: 'Alta — La app móvil almacena encolado SQLite local y sincroniza en cuanto recupera señal en ruta.',
      cyclomaticComplexity: '1.4 (Promedio por método)',
      recommendations: [
        'Aislar el cliente de telemetría GPS mediante un buffer circular en memoria para evitar pérdida de puntos en zonas de sombra celular.',
        'Formalizar los contratos de los agentes LangGraph como puertos de aplicación.'
      ]
    }
  },

  'core-hub': {
    projectId: 'core-hub',
    projectName: 'Core Banking & Impact Hub',
    architecturePattern: 'Event-Driven Clean Architecture + Offline SQLite Vault + Ed25519 Multisig',
    version: 'v2.4.0',
    synthesizedBy: 'archify Engine v3.3 (AST & HTML Mode)',
    lastAnalyzed: '2026-11-23T20:30:00-05:00',
    tokenSavingsPercent: 94.2,
    auditStatus: 'Certificada (Cero Fuga de Código)',
    summary: 'Infraestructura fintech orientada a eventos para microcréditos comunales y desembolsos descentralizados. Garantiza inmutabilidad criptográfica en cada transacción mediante firmas Ed25519 multisig y preserva soberanía total de datos con almacenamiento SQLite encriptado en el servidor comunal.',
    metrics: {
      layersCount: 4,
      abstractMethodsCount: 32,
      tracedStoriesPercent: 100,
      tokenReductionRatio: '17.2x',
      offlineReadiness: '100% Offline con Bluetooth Mesh',
      dipCompliance: '100% Clean Architecture'
    },
    layers: [
      {
        id: 'presentation',
        name: 'Capa 1: Presentación & Consola de Desembolsos',
        badge: 'UI/UX',
        colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        description: 'Vistas de originación de crédito, consola de firma comunal multisig y panel de auditoría de impacto.',
        components: [
          {
            name: 'DisbursementConsoleView',
            path: 'src/views/loans/DisbursementConsoleView.tsx',
            type: 'screen',
            abstractMethods: [
              { symbol: 'DisbursementConsoleView.submitForMultisig', signature: 'submitForMultisig(loanId: string): Promise<void>', visibility: 'public', isAsync: true, line: 45, doc: 'Envía solicitud a ronda de 3 firmas comunales requeridas.' }
            ]
          }
        ]
      },
      {
        id: 'application',
        name: 'Capa 2: Aplicación & Servicios Transaccionales',
        badge: 'USE CASES',
        colorClass: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        description: 'Coordinación de originación de créditos, verificación de quórum multisig y emisión de recibos firmados.',
        components: [
          {
            name: 'LoanOriginationService',
            path: 'src/application/loans/LoanOriginationService.ts',
            type: 'service',
            abstractMethods: [
              { symbol: 'LoanOriginationService.originateLoan', signature: 'public async originateLoan(cmd: OriginateLoanCmd): Promise<LoanId>', visibility: 'public', isAsync: true, line: 32, doc: 'Originación atómica con validación de límite crediticio comunal.' },
              { symbol: 'LoanOriginationService.appendMultisigSignature', signature: 'public async appendMultisigSignature(loanId: LoanId, sig: SignatureBytes): Promise<boolean>', visibility: 'public', isAsync: true, line: 74, doc: 'Agrega firma de líder comunal y ejecuta desembolso al alcanzar quórum.' }
            ]
          }
        ]
      },
      {
        id: 'domain',
        name: 'Capa 3: Dominio & Invariantes Financieras',
        badge: 'DOMAIN',
        colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        description: 'Entidades financieras comunales, cálculo de interés no usurero y validación criptográfica de firmas.',
        components: [
          {
            name: 'CommunityLoan (Aggregate Root)',
            path: 'src/domain/loans/CommunityLoan.ts',
            type: 'entity',
            abstractMethods: [
              { symbol: 'CommunityLoan.verifyQuorum', signature: 'public verifyQuorum(): boolean', visibility: 'public', isAsync: false, line: 58, doc: 'Verifica si se cuenta con al menos 2 de 3 firmas válidas registradas.' }
            ]
          }
        ]
      },
      {
        id: 'infrastructure',
        name: 'Capa 4: Infraestructura & Criptografía',
        badge: 'INFRA',
        colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        description: 'Bóveda encriptada SQLite local, generador de claves Ed25519 y módulo de replicación P2P.',
        components: [
          {
            name: 'EncryptedSQLiteVault',
            path: 'src/infrastructure/crypto/EncryptedSQLiteVault.ts',
            type: 'repository',
            abstractMethods: [
              { symbol: 'EncryptedSQLiteVault.appendLedgerRecord', signature: 'public async appendLedgerRecord(entry: LedgerEntry): Promise<HashSha256>', visibility: 'public', isAsync: true, line: 40, doc: 'Inserta en el libro mayor inmutable con hash SHA-256 encadenado.' }
            ]
          }
        ]
      }
    ],
    mermaidDiagram: `flowchart TD
  subgraph Presentation["Capa 1: Consola Comunal"]
    UI_Disbursement["DisbursementConsoleView (Desembolsos)"]
  end

  subgraph Application["Capa 2: Casos de Uso Financieros"]
    App_Loan["LoanOriginationService (Originación)"]
  end

  subgraph Domain["Capa 3: Dominio & Quórum Multisig"]
    Dom_Loan["CommunityLoan (Aggregate Root)"]
  end

  subgraph Infrastructure["Capa 4: Bóveda Criptográfica SQLite"]
    Vault_SQLite[("EncryptedSQLiteVault (Ledger SHA-256)")]
  end

  UI_Disbursement -->|solicita crédito| App_Loan
  App_Loan -->|evalúa quórum| Dom_Loan
  App_Loan -->|asienta en libro mayor| Vault_SQLite`,
    traceabilityMatrix: [
      {
        storyId: 'US-201',
        storyTitle: 'Firma Criptográfica Multisig para desembolsos comunales',
        interfaceId: 'IF-30',
        interfaceName: 'Consola de Firmas Comunitarias',
        abstractMethod: 'LoanOriginationService.appendMultisigSignature(...)',
        domainModel: 'firmas_multisig (Tabla SQLite)',
        doDCriterion: 'Desembolso bloqueado hasta alcanzar quórum estricto de 2 de 3 firmas válidas.',
        status: 'Auditado'
      }
    ],
    diagnostics: {
      dipCompliance: '100% — Dominio financiero aislado de implementaciones criptográficas concretas.',
      zeroLeakageScore: '100% — Cero secretos de claves privadas expuestos.',
      offlineReadiness: '100% — Opera en servidor local sin salida a internet.',
      cyclomaticComplexity: '1.3 (Promedio por método)',
      recommendations: [
        'Asegurar rotación periódica de pares de llaves comunales Ed25519.'
      ]
    }
  },

  'portal-admin': {
    projectId: 'portal-admin',
    projectName: 'Sistema de Gestión & Ventas',
    architecturePattern: 'Modular Layered Architecture + Event-Driven Alerts',
    version: 'v0.8.2',
    synthesizedBy: 'archify Engine v3.3 (AST & HTML Mode)',
    lastAnalyzed: '2026-11-23T20:25:00-05:00',
    tokenSavingsPercent: 93.7,
    auditStatus: 'Certificada (Cero Fuga de Código)',
    summary: 'Arquitectura modular para ERP corporativo y analítica en vivo. Estructura el monitoreo de inventarios, transacciones de venta y alertas de stock crítico bajo un diseño desacoplado de alta velocidad de respuesta.',
    metrics: {
      layersCount: 4,
      abstractMethodsCount: 24,
      tracedStoriesPercent: 100,
      tokenReductionRatio: '15.9x',
      offlineReadiness: 'Web Conectada con Caché Local',
      dipCompliance: '100% Clean Architecture'
    },
    layers: [
      {
        id: 'presentation',
        name: 'Capa 1: Vistas Administrativas & Dashboards',
        badge: 'UI/UX',
        colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        description: 'Dashboards en tiempo real de ventas, inventario y monitor de stock crítico.',
        components: [
          {
            name: 'InventoryDashboardView',
            path: 'src/views/inventory/InventoryDashboardView.tsx',
            type: 'screen',
            abstractMethods: [
              { symbol: 'InventoryDashboardView.renderStockAlerts', signature: 'renderStockAlerts(alerts: StockAlert[]): JSX.Element', visibility: 'public', isAsync: false, line: 30, doc: 'Muestra banners de reposición inmediata para productos bajo umbral mínimo.' }
            ]
          }
        ]
      },
      {
        id: 'application',
        name: 'Capa 2: Aplicación & Procesos ERP',
        badge: 'USE CASES',
        colorClass: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
        description: 'Servicios de gestión de pedidos, conciliación de caja y disparo de alertas de reabastecimiento.',
        components: [
          {
            name: 'InventoryApplicationService',
            path: 'src/application/inventory/InventoryApplicationService.ts',
            type: 'service',
            abstractMethods: [
              { symbol: 'InventoryApplicationService.recordStockMovement', signature: 'public async recordStockMovement(cmd: StockMovementCmd): Promise<void>', visibility: 'public', isAsync: true, line: 35, doc: 'Actualiza stock físico y evalúa invariante de punto de reorden.' }
            ]
          }
        ]
      },
      {
        id: 'domain',
        name: 'Capa 3: Dominio & Reglas Comerciales',
        badge: 'DOMAIN',
        colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        description: 'Entidades de productos, pedidos, listas de precios y reglas de inventario mínimo.',
        components: [
          {
            name: 'ProductItem (Entity)',
            path: 'src/domain/inventory/ProductItem.ts',
            type: 'entity',
            abstractMethods: [
              { symbol: 'ProductItem.isBelowSafetyStock', signature: 'public isBelowSafetyStock(): boolean', visibility: 'public', isAsync: false, line: 28, doc: 'Retorna true si el inventario actual es menor o igual al stock de seguridad.' }
            ]
          }
        ]
      },
      {
        id: 'infrastructure',
        name: 'Capa 4: Infraestructura & Persistencia',
        badge: 'INFRA',
        colorClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        description: 'Persistencia en Supabase PostgreSQL y pasarela de alertas por correo y webhook.',
        components: [
          {
            name: 'PostgresInventoryRepository',
            path: 'src/infrastructure/repositories/PostgresInventoryRepository.ts',
            type: 'repository',
            abstractMethods: [
              { symbol: 'PostgresInventoryRepository.findCriticalStock', signature: 'public async findCriticalStock(): Promise<ProductItem[]>', visibility: 'public', isAsync: true, line: 40, doc: 'Consulta optimizada por índice de stock <= stock_minimo.' }
            ]
          }
        ]
      }
    ],
    mermaidDiagram: `flowchart TD
  subgraph Presentation["Capa 1: Presentación (Dashboard ERP)"]
    UI_Dashboard["InventoryDashboardView (Alertas en Vivo)"]
  end

  subgraph Application["Capa 2: Aplicación (Servicios ERP)"]
    App_Inv["InventoryApplicationService (Movimientos de Stock)"]
  end

  subgraph Domain["Capa 3: Dominio (Entidades de Negocio)"]
    Dom_Product["ProductItem (Regla Stock de Seguridad)"]
  end

  subgraph Infrastructure["Capa 4: Infraestructura (Postgres)"]
    Repo_Postgres[("PostgresInventoryRepository (Supabase)")]
  end

  UI_Dashboard -->|monitorea| App_Inv
  App_Inv -->|aplica reglas| Dom_Product
  App_Inv -->|persiste| Repo_Postgres`,
    traceabilityMatrix: [
      {
        storyId: 'US-ERP-01',
        storyTitle: 'Monitoreo en tiempo real de inventario crítico y alertas de stock',
        interfaceId: 'IF-ERP-04',
        interfaceName: 'Dashboard de Stock y Alertas',
        abstractMethod: 'InventoryApplicationService.recordStockMovement(...)',
        domainModel: 'inventario (Tabla Supabase)',
        doDCriterion: 'Disparo de notificación visual automática al registrar un egreso que vulnere el stock mínimo.',
        status: 'Auditado'
      }
    ],
    diagnostics: {
      dipCompliance: '100% — Clean Architecture con inversión de dependencias.',
      zeroLeakageScore: '100% — Manifiesto sin exposición de código de backend.',
      offlineReadiness: 'Media — Requiere conectividad con soporte de caché transaccional local.',
      cyclomaticComplexity: '1.2 (Promedio por método)',
      recommendations: [
        'Configurar índices B-Tree en la columna de stock_actual para optimizar consultas de inventario masivas.'
      ]
    }
  },

  'pathrimonio-site': PATHRIMONIO_SITE_ARCHITECTURE
};

export function getProjectArchitecture(projectId = 'pathway') {
  return PROJECT_ARCHITECTURES[projectId] || PROJECT_ARCHITECTURES.pathway;
}
