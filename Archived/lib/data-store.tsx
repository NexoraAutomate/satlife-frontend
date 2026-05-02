"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  customers as initialCustomers,
  orders as initialOrders,
  projects as initialProjects,
  systems as initialSystems,
  inventory as initialInventory,
  maintenanceLogs as initialMaintenanceLogs,
  users as initialUsers,
  hierarchyRules as initialHierarchyRules,
  type Customer,
  type Order,
  type Project,
  type System,
  type Subsystem,
  type Module,
  type Unit,
  type SatComponent,
  type InventoryItem,
  type MaintenanceLog,
  type User,
  type HierarchyRule,
  type EntityStatus,
  type ProjectStatus,
  type OrderStatus,
  type MaintenanceStatus,
  type UserRole,
} from "@/lib/dummy-data";

// ------- helpers -------
function nextId(prefix: string, list: { id: string }[]): string {
  const maxNum = list.reduce((max, item) => {
    const num = parseInt(item.id.replace(`${prefix}-`, ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `${prefix}-${String(maxNum + 1).padStart(3, "0")}`;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return fallback;
}

// ------- context shape -------
interface DataStoreContextType {
  // Customers
  customers: Customer[];
  addCustomer: (c: Omit<Customer, "id" | "totalOrders">) => Customer;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Orders
  orders: Order[];
  addOrder: (o: Omit<Order, "id">) => Order;
  updateOrder: (id: string, o: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (p: Omit<Project, "id" | "systemIds">) => Project;
  updateProject: (id: string, p: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Systems (top-level)
  systems: System[];
  addSystem: (s: Omit<System, "id" | "subsystems">) => System;
  updateSystem: (id: string, updates: Partial<Pick<System, "name" | "type" | "status" | "serialNumber">>) => void;
  deleteSystem: (id: string) => void;

  // Subsystems
  addSubsystem: (systemId: string, sub: { name: string; type: string; status: EntityStatus; serialNumber: string }) => void;
  updateSubsystem: (systemId: string, subId: string, updates: Partial<Pick<Subsystem, "name" | "type" | "status" | "serialNumber">>) => void;
  deleteSubsystem: (systemId: string, subId: string) => void;

  // Modules
  addModule: (systemId: string, subId: string, mod: { name: string; status: EntityStatus; serialNumber: string }) => void;
  updateModule: (systemId: string, subId: string, modId: string, updates: Partial<Pick<Module, "name" | "status" | "serialNumber">>) => void;
  deleteModule: (systemId: string, subId: string, modId: string) => void;

  // Units
  addUnit: (systemId: string, subId: string, modId: string, unit: { name: string; status: EntityStatus; serialNumber: string }) => void;
  updateUnit: (systemId: string, subId: string, modId: string, unitId: string, updates: Partial<Pick<Unit, "name" | "status" | "serialNumber">>) => void;
  deleteUnit: (systemId: string, subId: string, modId: string, unitId: string) => void;

  // Components
  addComponent: (systemId: string, subId: string, modId: string, unitId: string, comp: { name: string; status: EntityStatus; serialNumber: string }) => void;
  updateComponent: (systemId: string, subId: string, modId: string, unitId: string, compId: string, updates: Partial<Pick<SatComponent, "name" | "status" | "serialNumber">>) => void;
  deleteComponent: (systemId: string, subId: string, modId: string, unitId: string, compId: string) => void;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (i: Omit<InventoryItem, "id">) => InventoryItem;
  updateInventoryItem: (id: string, i: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Maintenance
  maintenanceLogs: MaintenanceLog[];
  addMaintenanceLog: (m: Omit<MaintenanceLog, "id">) => MaintenanceLog;
  updateMaintenanceLog: (id: string, m: Partial<MaintenanceLog>) => void;
  deleteMaintenanceLog: (id: string) => void;

  // Users
  users: User[];
  addUser: (u: Omit<User, "id">) => User;
  updateUser: (id: string, u: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Hierarchy rules
  hierarchyRules: HierarchyRule[];
  setHierarchyRules: (rules: HierarchyRule[]) => void;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

const STORAGE_KEY = "sat-data-store";

interface StoredState {
  customers: Customer[];
  orders: Order[];
  projects: Project[];
  systems: System[];
  inventory: InventoryItem[];
  maintenanceLogs: MaintenanceLog[];
  users: User[];
  hierarchyRules: HierarchyRule[];
}

function getInitialState(): StoredState {
  const stored = loadFromStorage<StoredState | null>(STORAGE_KEY, null);
  if (stored) return stored;
  return {
    customers: initialCustomers,
    orders: initialOrders,
    projects: initialProjects,
    systems: initialSystems,
    inventory: initialInventory,
    maintenanceLogs: initialMaintenanceLogs,
    users: initialUsers,
    hierarchyRules: initialHierarchyRules,
  };
}

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(getInitialState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ---------- CUSTOMERS ----------
  const addCustomer = useCallback((c: Omit<Customer, "id" | "totalOrders">): Customer => {
    const newC: Customer = { ...c, id: nextId("CUST", state.customers), totalOrders: 0 };
    setState((s) => ({ ...s, customers: [...s.customers, newC] }));
    return newC;
  }, [state.customers]);

  const updateCustomer = useCallback((id: string, c: Partial<Customer>) => {
    setState((s) => ({
      ...s,
      customers: s.customers.map((x) => (x.id === id ? { ...x, ...c } : x)),
    }));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      customers: s.customers.filter((x) => x.id !== id),
    }));
  }, []);

  // ---------- ORDERS ----------
  const addOrder = useCallback((o: Omit<Order, "id">): Order => {
    const newO: Order = { ...o, id: nextId("ORD", state.orders) };
    setState((s) => {
      const updatedCustomers = s.customers.map((c) =>
        c.id === o.customerId ? { ...c, totalOrders: c.totalOrders + 1 } : c
      );
      return { ...s, orders: [...s.orders, newO], customers: updatedCustomers };
    });
    return newO;
  }, [state.orders]);

  const updateOrder = useCallback((id: string, o: Partial<Order>) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((x) => (x.id === id ? { ...x, ...o } : x)),
    }));
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.filter((x) => x.id !== id),
    }));
  }, []);

  // ---------- PROJECTS ----------
  const addProject = useCallback((p: Omit<Project, "id" | "systemIds">): Project => {
    const newP: Project = { ...p, id: nextId("PRJ", state.projects), systemIds: [] };
    setState((s) => ({ ...s, projects: [...s.projects, newP] }));
    return newP;
  }, [state.projects]);

  const updateProject = useCallback((id: string, p: Partial<Project>) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((x) => (x.id === id ? { ...x, ...p } : x)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      projects: s.projects.filter((x) => x.id !== id),
      systems: s.systems.filter((sys) => sys.projectId !== id),
    }));
  }, []);

  // ---------- SYSTEMS ----------
  const addSystem = useCallback((s: Omit<System, "id" | "subsystems">): System => {
    const newSys: System = { ...s, id: nextId("SYS", state.systems), subsystems: [] };
    setState((prev) => ({
      ...prev,
      systems: [...prev.systems, newSys],
      projects: prev.projects.map((p) =>
        p.id === s.projectId ? { ...p, systemIds: [...p.systemIds, newSys.id] } : p
      ),
    }));
    return newSys;
  }, [state.systems]);

  const updateSystem = useCallback((id: string, updates: Partial<Pick<System, "name" | "type" | "status" | "serialNumber">>) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => (sys.id === id ? { ...sys, ...updates } : sys)),
    }));
  }, []);

  const deleteSystem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      systems: s.systems.filter((sys) => sys.id !== id),
      projects: s.projects.map((p) => ({
        ...p,
        systemIds: p.systemIds.filter((sid) => sid !== id),
      })),
    }));
  }, []);

  // ---------- SUBSYSTEMS ----------
  const addSubsystem = useCallback((systemId: string, sub: { name: string; type: string; status: EntityStatus; serialNumber: string }) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        const newSubId = `${systemId}-SS-${String(sys.subsystems.length + 1).padStart(2, "0")}`;
        const newSub: Subsystem = { ...sub, id: newSubId, modules: [] };
        return { ...sys, subsystems: [...sys.subsystems, newSub] };
      }),
    }));
  }, []);

  const updateSubsystem = useCallback((systemId: string, subId: string, updates: Partial<Pick<Subsystem, "name" | "type" | "status" | "serialNumber">>) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => (sub.id === subId ? { ...sub, ...updates } : sub)),
        };
      }),
    }));
  }, []);

  const deleteSubsystem = useCallback((systemId: string, subId: string) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return { ...sys, subsystems: sys.subsystems.filter((sub) => sub.id !== subId) };
      }),
    }));
  }, []);

  // ---------- MODULES ----------
  const addModule = useCallback((systemId: string, subId: string, mod: { name: string; status: EntityStatus; serialNumber: string }) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            const newModId = `${subId}-M-${String(sub.modules.length + 1).padStart(2, "0")}`;
            const newMod: Module = { ...mod, id: newModId, units: [] };
            return { ...sub, modules: [...sub.modules, newMod] };
          }),
        };
      }),
    }));
  }, []);

  const updateModule = useCallback((systemId: string, subId: string, modId: string, updates: Partial<Pick<Module, "name" | "status" | "serialNumber">>) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              modules: sub.modules.map((m) => (m.id === modId ? { ...m, ...updates } : m)),
            };
          }),
        };
      }),
    }));
  }, []);

  const deleteModule = useCallback((systemId: string, subId: string, modId: string) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            return { ...sub, modules: sub.modules.filter((m) => m.id !== modId) };
          }),
        };
      }),
    }));
  }, []);

  // ---------- UNITS ----------
  const addUnit = useCallback((systemId: string, subId: string, modId: string, unit: { name: string; status: EntityStatus; serialNumber: string }) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              modules: sub.modules.map((m) => {
                if (m.id !== modId) return m;
                const newUnitId = `${modId}-U-${String(m.units.length + 1).padStart(2, "0")}`;
                const newUnit: Unit = { ...unit, id: newUnitId, components: [] };
                return { ...m, units: [...m.units, newUnit] };
              }),
            };
          }),
        };
      }),
    }));
  }, []);

  const updateUnit = useCallback((systemId: string, subId: string, modId: string, unitId: string, updates: Partial<Pick<Unit, "name" | "status" | "serialNumber">>) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              modules: sub.modules.map((m) => {
                if (m.id !== modId) return m;
                return {
                  ...m,
                  units: m.units.map((u) => (u.id === unitId ? { ...u, ...updates } : u)),
                };
              }),
            };
          }),
        };
      }),
    }));
  }, []);

  const deleteUnit = useCallback((systemId: string, subId: string, modId: string, unitId: string) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              modules: sub.modules.map((m) => {
                if (m.id !== modId) return m;
                return { ...m, units: m.units.filter((u) => u.id !== unitId) };
              }),
            };
          }),
        };
      }),
    }));
  }, []);

  // ---------- COMPONENTS ----------
  const addComponent = useCallback((systemId: string, subId: string, modId: string, unitId: string, comp: { name: string; status: EntityStatus; serialNumber: string }) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              modules: sub.modules.map((m) => {
                if (m.id !== modId) return m;
                return {
                  ...m,
                  units: m.units.map((u) => {
                    if (u.id !== unitId) return u;
                    const newCompId = `${unitId}-CMP-${String(u.components.length + 1).padStart(3, "0")}`;
                    const newComp: SatComponent = { ...comp, id: newCompId };
                    return { ...u, components: [...u.components, newComp] };
                  }),
                };
              }),
            };
          }),
        };
      }),
    }));
  }, []);

  const updateComponent = useCallback((systemId: string, subId: string, modId: string, unitId: string, compId: string, updates: Partial<Pick<SatComponent, "name" | "status" | "serialNumber">>) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              modules: sub.modules.map((m) => {
                if (m.id !== modId) return m;
                return {
                  ...m,
                  units: m.units.map((u) => {
                    if (u.id !== unitId) return u;
                    return {
                      ...u,
                      components: u.components.map((c) => (c.id === compId ? { ...c, ...updates } : c)),
                    };
                  }),
                };
              }),
            };
          }),
        };
      }),
    }));
  }, []);

  const deleteComponent = useCallback((systemId: string, subId: string, modId: string, unitId: string, compId: string) => {
    setState((s) => ({
      ...s,
      systems: s.systems.map((sys) => {
        if (sys.id !== systemId) return sys;
        return {
          ...sys,
          subsystems: sys.subsystems.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              modules: sub.modules.map((m) => {
                if (m.id !== modId) return m;
                return {
                  ...m,
                  units: m.units.map((u) => {
                    if (u.id !== unitId) return u;
                    return { ...u, components: u.components.filter((c) => c.id !== compId) };
                  }),
                };
              }),
            };
          }),
        };
      }),
    }));
  }, []);

  // ---------- INVENTORY ----------
  const addInventoryItem = useCallback((i: Omit<InventoryItem, "id">): InventoryItem => {
    const newI: InventoryItem = { ...i, id: nextId("INV", state.inventory) };
    setState((s) => ({ ...s, inventory: [...s.inventory, newI] }));
    return newI;
  }, [state.inventory]);

  const updateInventoryItem = useCallback((id: string, i: Partial<InventoryItem>) => {
    setState((s) => ({
      ...s,
      inventory: s.inventory.map((x) => (x.id === id ? { ...x, ...i } : x)),
    }));
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      inventory: s.inventory.filter((x) => x.id !== id),
    }));
  }, []);

  // ---------- MAINTENANCE ----------
  const addMaintenanceLog = useCallback((m: Omit<MaintenanceLog, "id">): MaintenanceLog => {
    const newM: MaintenanceLog = { ...m, id: nextId("MNT", state.maintenanceLogs) };
    setState((s) => ({ ...s, maintenanceLogs: [...s.maintenanceLogs, newM] }));
    return newM;
  }, [state.maintenanceLogs]);

  const updateMaintenanceLog = useCallback((id: string, m: Partial<MaintenanceLog>) => {
    setState((s) => ({
      ...s,
      maintenanceLogs: s.maintenanceLogs.map((x) => (x.id === id ? { ...x, ...m } : x)),
    }));
  }, []);

  const deleteMaintenanceLog = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      maintenanceLogs: s.maintenanceLogs.filter((x) => x.id !== id),
    }));
  }, []);

  // ---------- USERS ----------
  const addUser = useCallback((u: Omit<User, "id">): User => {
    const newU: User = { ...u, id: nextId("USR", state.users) };
    setState((s) => ({ ...s, users: [...s.users, newU] }));
    return newU;
  }, [state.users]);

  const updateUser = useCallback((id: string, u: Partial<User>) => {
    setState((s) => ({
      ...s,
      users: s.users.map((x) => (x.id === id ? { ...x, ...u } : x)),
    }));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      users: s.users.filter((x) => x.id !== id),
    }));
  }, []);

  // ---------- HIERARCHY RULES ----------
  const setHierarchyRules = useCallback((rules: HierarchyRule[]) => {
    setState((s) => ({ ...s, hierarchyRules: rules }));
  }, []);

  const value: DataStoreContextType = {
    customers: state.customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    orders: state.orders,
    addOrder,
    updateOrder,
    deleteOrder,
    projects: state.projects,
    addProject,
    updateProject,
    deleteProject,
    systems: state.systems,
    addSystem,
    updateSystem,
    deleteSystem,
    addSubsystem,
    updateSubsystem,
    deleteSubsystem,
    addModule,
    updateModule,
    deleteModule,
    addUnit,
    updateUnit,
    deleteUnit,
    addComponent,
    updateComponent,
    deleteComponent,
    inventory: state.inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    maintenanceLogs: state.maintenanceLogs,
    addMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog,
    users: state.users,
    addUser,
    updateUser,
    deleteUser,
    hierarchyRules: state.hierarchyRules,
    setHierarchyRules,
  };

  return (
    <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (context === undefined) {
    throw new Error("useDataStore must be used within a DataStoreProvider");
  }
  return context;
}

// Re-export types for convenience
export type {
  Customer,
  Order,
  Project,
  System,
  Subsystem,
  Module,
  Unit,
  SatComponent,
  InventoryItem,
  MaintenanceLog,
  User,
  HierarchyRule,
  EntityStatus,
  ProjectStatus,
  OrderStatus,
  MaintenanceStatus,
  UserRole,
};
