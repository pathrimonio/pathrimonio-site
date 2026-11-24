---
name: archifly
description: Autonomous software architecture analysis, clean and hexagonal layer synthesis, abstract method contract inspection, C4 topology modeling, and requirements-to-code traceability. Use whenever the user asks to "analyze software architecture", "inspect project architecture", "use archifly skill", "map architectural layers", "review hexagonal architecture", or "generate architecture snapshot".
license: MIT
metadata:
  author: pathrimonio-engineering
  version: "1.0.0"
---

# Archifly — Software Architecture & Contract Synthesis Skill

**Archifly** is an autonomous software architecture analysis engine engineered for **Zero-Trust, Zero-Code-Leakage** environments. It processes lightweight contracts, abstract method signatures (`methods.manifest.json`), database models (DER), user stories, and UI interfaces to synthesize comprehensive architectural models without ingesting implementation source code.

---

## 1. Core Principles

1. **Zero-Code Leakage (AST Signatures Only):** Archifly never parses or requires internal function bodies, secret keys, or raw SQL queries. It operates strictly on symbols, typed signatures, visibility modifiers, and module boundaries.
2. **Token Efficiency (>90% Reduction):** By analyzing lightweight manifests rather than raw files, token consumption is reduced by over 90% compared to brute-force repository scanning.
3. **Clean & Hexagonal Architecture Standard:** Every component is mapped to one of the 4 canonical architectural layers:
   - **Presentation / Interface Layer:** Controllers, ViewModels, UI Screens, Rest/GraphQL Endpoints, CLI commands.
   - **Application / Use Case Layer:** Interactors, Orchestrators, Application Services, Command/Query Handlers, DTOs.
   - **Domain / Core Business Layer:** Entities, Value Objects, Domain Events, Aggregate Roots, Invariant Policies.
   - **Infrastructure / Adapter Layer:** Database Repositories (SQLite/Postgres), HTTP Clients, Cloud Gateways, OCR Engines, Multi-Agent Workers.
4. **End-to-End Traceability (DoD Chain):**
   $$\text{User Story (US)} \longrightarrow \text{UI Interface (UI)} \longrightarrow \text{Abstract Method (Contract)} \longrightarrow \text{Data Model (DB)}$$

---

## 2. Analysis Workflow

When invoked on a project:

### Step 1: Ingest Lightweight Manifest
Read the project metadata, file tree nodes, and abstract method records (including live records synced into Supabase by the **`pathrimonio-files`** MCP server via `sync_modified_file` / `upsert_file_records`):
- Relative path & file category
- Symbol ID & Typed Signature (e.g. `public calculateMonthlyTotal(roles: number): PricingSummary`)
- Visibility (`public`, `private`, `protected`) and modifiers (`async`, `static`)
- Linked user stories and interface mockups

### Step 2: Layer & Boundary Classification
Group methods and modules into the 4 architectural layers:
- Verify that **Domain** has zero outbound dependencies to outer layers (Dependency Inversion Principle).
- Verify that **Presentation** only interacts with **Application** interfaces.
- Identify all infrastructure adapters implementing domain/application ports.

### Step 3: Architecture Topology & C4 Diagramming
Generate standard C4 Container and Component topologies using Mermaid diagrams:
- System Context (Actors & external consumers)
- Container Diagram (Mobile App, Web Portal, Local SQLite Database, Remote API Sync)
- Component Diagram (Services, Repositories, Domain Entities)

### Step 4: Traceability Audit & Health Assessment
Cross-reference requirements against contracts:
- Detect orphaned user stories (no interface or service contract linked).
- Detect orphaned database tables (no domain entity or repository referencing them).
- Calculate coupling score, cohesion index, and offline-first compliance.

### Step 5: Snapshot Export (`ArchitectureSnapshot.json`)
Emit an immutable JSON document containing the complete architectural specification with timestamp and SHA-256 fingerprint for stakeholder review.

---

## 3. Supported Project Profiles in Pathrimonio

- **Pathway (MVP Mobile Habit Tracker):** Offline-first React Native + SQLite architecture, Clean Architecture with localized Domain aggregates, zero cloud latency.
- **SMATAD (Logistics & Dynamic Dispatch):** Multi-agent orchestration (LangGraph) + OCR DeepSeek engine + React Native mobile app + real-time Supabase telemetry.
- **Core Banking & Impact Hub:** Fintech ledger, multisig cryptographic authorization (Ed25519 / SHA-256), offline peer-to-peer disbursement.
- **Sistema de Gestión & Ventas (ERP):** Modular dashboard, real-time inventory threshold monitors, role-based access control (RBAC).

---

## 4. Output Format Guidelines

Always present findings with:
1. Executive architectural summary (Layers, coupling, compliance).
2. Clean Mermaid diagram illustrating component and data flow.
3. Interactive contract inventory by layer.
4. Traceability matrix showing US $\to$ UI $\to$ Method $\to$ DB links.
5. Actionable architectural recommendations.
