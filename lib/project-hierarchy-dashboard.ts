import type {
  Component,
  Module,
  Project,
  Status,
  Subsystem,
  System,
  Unit,
} from '@/lib/models';
import {
  hierarchyTreeToFlow,
  makeNodeId,
  mapEntityFields,
  type HierarchyEntityType,
  type HierarchyTreeNode,
} from '@/lib/system-hierarchy-graph';

export type HierarchyHighlightState = 'selected' | 'dimmed' | 'normal';

export interface HierarchyDashboardSelection {
  projectId?: number;
  systemId?: number;
  subsystemId?: number;
  moduleId?: number;
  unitId?: number;
  componentId?: number;
}

export interface SerialSearchMatch {
  type: HierarchyEntityType;
  entityId: number;
  serialNumber: string;
  name: string;
  selection: HierarchyDashboardSelection;
}

const DETAIL_PATH: Record<HierarchyEntityType, (id: number) => string> = {
  system: (id) => `/systems/${id}`,
  subsystem: (id) => `/subsystems/${id}`,
  module: (id) => `/modules/${id}`,
  unit: (id) => `/units/${id}`,
  component: (id) => `/components/${id}`,
};

export function getRunningProjects(projects: Project[]): Project[] {
  return projects.filter(
    (project) =>
      project.status_name !== 'Completed' && project.status_name !== 'On Hold'
  );
}

export function getSystemsForProject(systems: System[], projectId: number): System[] {
  return systems.filter((system) => system.project_id === projectId);
}

export function getSubsystemsForSystem(subsystems: Subsystem[], systemId: number): Subsystem[] {
  return subsystems.filter((subsystem) => subsystem.system_id === systemId);
}

export function getModulesForSubsystem(modules: Module[], subsystemId: number): Module[] {
  return modules.filter((module) => module.subsystem_id === subsystemId);
}

export function getUnitsForModule(units: Unit[], moduleId: number): Unit[] {
  return units.filter((unit) => unit.module_id === moduleId);
}

export function getComponentsForUnit(components: Component[], unitId: number): Component[] {
  return components.filter((component) => component.unit_id === unitId);
}

function getDeepestSelection(
  selection: HierarchyDashboardSelection
): { type: HierarchyEntityType; entityId: number } | null {
  if (selection.componentId) {
    return { type: 'component', entityId: selection.componentId };
  }
  if (selection.unitId) {
    return { type: 'unit', entityId: selection.unitId };
  }
  if (selection.moduleId) {
    return { type: 'module', entityId: selection.moduleId };
  }
  if (selection.subsystemId) {
    return { type: 'subsystem', entityId: selection.subsystemId };
  }
  if (selection.systemId) {
    return { type: 'system', entityId: selection.systemId };
  }
  return null;
}

function highlightStateFor(
  type: HierarchyEntityType,
  entityId: number,
  selection: HierarchyDashboardSelection
): HierarchyHighlightState {
  const deepest = getDeepestSelection(selection);
  if (!deepest) return 'normal';

  if (deepest.type === type && deepest.entityId === entityId) {
    return 'selected';
  }

  const selectedSystemId = selection.systemId;
  const selectedSubsystemId = selection.subsystemId;
  const selectedModuleId = selection.moduleId;
  const selectedUnitId = selection.unitId;

  if (type === 'system' && selectedSystemId && entityId !== selectedSystemId) {
    return 'dimmed';
  }
  if (type === 'subsystem' && selectedSubsystemId && entityId !== selectedSubsystemId) {
    return 'dimmed';
  }
  if (type === 'module' && selectedModuleId && entityId !== selectedModuleId) {
    return 'dimmed';
  }
  if (type === 'unit' && selectedUnitId && entityId !== selectedUnitId) {
    return 'dimmed';
  }
  if (
    type === 'component' &&
    selection.componentId &&
    entityId !== selection.componentId
  ) {
    return 'dimmed';
  }

  return 'normal';
}

function toTreeNode<T extends { id: number; name: string }>(
  entity: T,
  type: HierarchyEntityType,
  statuses: Status[],
  selection: HierarchyDashboardSelection,
  children: HierarchyTreeNode[] = []
): HierarchyTreeNode {
  const fields = mapEntityFields(entity as Parameters<typeof mapEntityFields>[0], statuses);

  return {
    id: makeNodeId(type, entity.id),
    entityId: entity.id,
    type,
    ...fields,
    detailPath: DETAIL_PATH[type](entity.id),
    children,
    highlightState: highlightStateFor(type, entity.id, selection),
  } as HierarchyTreeNode & { highlightState: HierarchyHighlightState };
}

export function buildProjectHierarchyTree(
  selection: HierarchyDashboardSelection,
  systems: System[],
  subsystems: Subsystem[],
  modules: Module[],
  units: Unit[],
  components: Component[],
  statuses: Status[] = []
): HierarchyTreeNode[] {
  if (!selection.projectId) return [];

  const projectSystems = getSystemsForProject(systems, selection.projectId);
  if (projectSystems.length === 0) return [];

  return projectSystems.map((system) => {
    const isOnPath = !selection.systemId || system.id === selection.systemId;
    const systemChildren =
      isOnPath && selection.systemId
        ? buildSubsystemLevel(
            selection,
            system.id,
            subsystems,
            modules,
            units,
            components,
            statuses
          )
        : [];

    return toTreeNode(system, 'system', statuses, selection, systemChildren);
  });
}

function buildSubsystemLevel(
  selection: HierarchyDashboardSelection,
  systemId: number,
  subsystems: Subsystem[],
  modules: Module[],
  units: Unit[],
  components: Component[],
  statuses: Status[]
): HierarchyTreeNode[] {
  const systemSubsystems = getSubsystemsForSystem(subsystems, systemId);

  return systemSubsystems.map((subsystem) => {
    const isOnPath = !selection.subsystemId || subsystem.id === selection.subsystemId;
    const subsystemChildren =
      isOnPath && selection.subsystemId
        ? buildModuleLevel(selection, subsystem.id, modules, units, components, statuses)
        : [];

    return toTreeNode(subsystem, 'subsystem', statuses, selection, subsystemChildren);
  });
}

function buildModuleLevel(
  selection: HierarchyDashboardSelection,
  subsystemId: number,
  modules: Module[],
  units: Unit[],
  components: Component[],
  statuses: Status[]
): HierarchyTreeNode[] {
  const subsystemModules = getModulesForSubsystem(modules, subsystemId);

  return subsystemModules.map((module) => {
    const isOnPath = !selection.moduleId || module.id === selection.moduleId;
    const moduleChildren =
      isOnPath && selection.moduleId
        ? buildUnitLevel(selection, module.id, units, components, statuses)
        : [];

    return toTreeNode(module, 'module', statuses, selection, moduleChildren);
  });
}

function buildUnitLevel(
  selection: HierarchyDashboardSelection,
  moduleId: number,
  units: Unit[],
  components: Component[],
  statuses: Status[]
): HierarchyTreeNode[] {
  const moduleUnits = getUnitsForModule(units, moduleId);

  return moduleUnits.map((unit) => {
    const isOnPath = !selection.unitId || unit.id === selection.unitId;
    const unitChildren =
      isOnPath && selection.unitId
        ? buildComponentLevel(selection, unit.id, components, statuses)
        : [];

    return toTreeNode(unit, 'unit', statuses, selection, unitChildren);
  });
}

function buildComponentLevel(
  selection: HierarchyDashboardSelection,
  unitId: number,
  components: Component[],
  statuses: Status[]
): HierarchyTreeNode[] {
  return getComponentsForUnit(components, unitId).map((component) =>
    toTreeNode(component, 'component', statuses, selection, [])
  );
}

export function buildProjectHierarchyFlow(
  selection: HierarchyDashboardSelection,
  systems: System[],
  subsystems: Subsystem[],
  modules: Module[],
  units: Unit[],
  components: Component[],
  statuses: Status[] = []
) {
  const roots = buildProjectHierarchyTree(
    selection,
    systems,
    subsystems,
    modules,
    units,
    components,
    statuses
  );

  if (roots.length === 0) {
    return { nodes: [], edges: [] };
  }

  const virtualRoot: HierarchyTreeNode = {
    id: 'project-root',
    entityId: selection.projectId ?? 0,
    type: 'system',
    name: 'Project',
    detailPath: '#',
    children: roots,
  };

  const flow = hierarchyTreeToFlow(virtualRoot);

  return {
    nodes: flow.nodes
      .filter((node) => node.id !== 'project-root')
      .map((node) => {
        const treeNode = findTreeNode(roots, node.id);
        return {
          ...node,
          data: {
            ...node.data,
            highlightState: (treeNode as HierarchyTreeNode & { highlightState?: HierarchyHighlightState })
              ?.highlightState ?? 'normal',
          },
        };
      }),
    edges: flow.edges.filter(
      (edge) => edge.source !== 'project-root' && edge.target !== 'project-root'
    ),
  };
}

function findTreeNode(
  nodes: HierarchyTreeNode[],
  id: string
): HierarchyTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const match = findTreeNode(node.children, id);
    if (match) return match;
  }
  return undefined;
}

export function resolveSelectionFromEntity(
  type: HierarchyEntityType,
  entityId: number,
  systems: System[],
  subsystems: Subsystem[],
  modules: Module[],
  units: Unit[],
  components: Component[]
): HierarchyDashboardSelection | null {
  switch (type) {
    case 'component': {
      const component = components.find((item) => item.id === entityId);
      if (!component) return null;
      const unit = units.find((item) => item.id === component.unit_id);
      if (!unit) return null;
      return {
        ...resolveSelectionFromEntity('unit', unit.id, systems, subsystems, modules, units, components),
        componentId: component.id,
      };
    }
    case 'unit': {
      const unit = units.find((item) => item.id === entityId);
      if (!unit) return null;
      const module = modules.find((item) => item.id === unit.module_id);
      if (!module) return null;
      return {
        ...resolveSelectionFromEntity('module', module.id, systems, subsystems, modules, units, components),
        unitId: unit.id,
      };
    }
    case 'module': {
      const module = modules.find((item) => item.id === entityId);
      if (!module) return null;
      const subsystem = subsystems.find((item) => item.id === module.subsystem_id);
      if (!subsystem) return null;
      return {
        ...resolveSelectionFromEntity(
          'subsystem',
          subsystem.id,
          systems,
          subsystems,
          modules,
          units,
          components
        ),
        moduleId: module.id,
      };
    }
    case 'subsystem': {
      const subsystem = subsystems.find((item) => item.id === entityId);
      if (!subsystem) return null;
      const system = systems.find((item) => item.id === subsystem.system_id);
      if (!system) return null;
      return {
        ...resolveSelectionFromEntity('system', system.id, systems, subsystems, modules, units, components),
        subsystemId: subsystem.id,
      };
    }
    case 'system': {
      const system = systems.find((item) => item.id === entityId);
      if (!system) return null;
      return { projectId: system.project_id, systemId: system.id };
    }
  }
}

export function searchEntityBySerialNumber(
  serialQuery: string,
  systems: System[],
  subsystems: Subsystem[],
  modules: Module[],
  units: Unit[],
  components: Component[],
  runningProjectIds: Set<number>
): SerialSearchMatch | null {
  const query = serialQuery.trim().toLowerCase();
  if (!query) return null;

  const candidates: SerialSearchMatch[] = [];

  const addMatch = (
    type: HierarchyEntityType,
    entity: { id: number; name: string; serial_number?: string }
  ) => {
    if (!entity.serial_number?.toLowerCase().includes(query)) return;
    const selection = resolveSelectionFromEntity(
      type,
      entity.id,
      systems,
      subsystems,
      modules,
      units,
      components
    );
    if (!selection?.projectId || !runningProjectIds.has(selection.projectId)) return;

    candidates.push({
      type,
      entityId: entity.id,
      serialNumber: entity.serial_number,
      name: entity.name,
      selection,
    });
  };

  systems.forEach((system) => addMatch('system', system));
  subsystems.forEach((subsystem) => addMatch('subsystem', subsystem));
  modules.forEach((module) => addMatch('module', module));
  units.forEach((unit) => addMatch('unit', unit));
  components.forEach((component) => addMatch('component', component));

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => {
    const exactA = a.serialNumber.toLowerCase() === query;
    const exactB = b.serialNumber.toLowerCase() === query;
    if (exactA !== exactB) return exactA ? -1 : 1;
    return a.serialNumber.localeCompare(b.serialNumber);
  })[0];
}

export const HIERARCHY_LEVELS: {
  key: keyof HierarchyDashboardSelection;
  type: HierarchyEntityType;
  label: string;
  parentKey?: keyof HierarchyDashboardSelection;
}[] = [
  { key: 'projectId', type: 'system', label: 'Project' },
  { key: 'systemId', type: 'system', label: 'System', parentKey: 'projectId' },
  { key: 'subsystemId', type: 'subsystem', label: 'Subsystem', parentKey: 'systemId' },
  { key: 'moduleId', type: 'module', label: 'Module', parentKey: 'subsystemId' },
  { key: 'unitId', type: 'unit', label: 'Unit', parentKey: 'moduleId' },
  { key: 'componentId', type: 'component', label: 'Component', parentKey: 'unitId' },
];
