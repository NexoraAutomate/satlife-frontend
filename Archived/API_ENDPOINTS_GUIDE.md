# PLCM Frontend - API Endpoints Guide

## Base URL
```
http://localhost:8000/api
```

---

## 📋 API Endpoints Required (FastAPI Backend)

### 1. **CUSTOMERS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/customers` | Get all customers |
| GET | `/customers/{id}` | Get customer by ID |
| POST | `/customers` | Create new customer |
| PUT | `/customers/{id}` | Update customer |
| DELETE | `/customers/{id}` | Delete customer |

**Frontend Interface (Customers):**
```typescript
interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  totalOrders: number;
  status: "Active" | "Inactive";
  address: string;
  phone: string;
}
```

---

### 2. **ORDERS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/orders` | Get all orders |
| GET | `/orders/{id}` | Get order by ID |
| GET | `/orders/customer/{customerId}` | Get orders by customer |
| POST | `/orders` | Create new order |
| PUT | `/orders/{id}` | Update order |
| DELETE | `/orders/{id}` | Delete order |

**Frontend Interface (Orders):**
```typescript
interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;  // Format: YYYY-MM-DD
  status: "Pending" | "Approved" | "Rejected";
  linkedProjectId: string | null;
  description: string;
}
```

---

### 3. **PROJECTS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/projects` | Get all projects |
| GET | `/projects/{id}` | Get project by ID |
| GET | `/projects/order/{orderId}` | Get project by order ID |
| POST | `/projects` | Create new project |
| PUT | `/projects/{id}` | Update project |
| DELETE | `/projects/{id}` | Delete project |

**Frontend Interface (Projects):**
```typescript
interface Project {
  id: string;
  name: string;
  orderId: string;
  status: "Planning" | "Building" | "Testing" | "Delivered" | "Maintenance";
  deliveryDate: string;  // Format: YYYY-MM-DD
  systemIds: string[];
}
```

---

### 4. **SYSTEMS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/systems` | Get all systems |
| GET | `/systems/{id}` | Get system by ID |
| GET | `/systems/project/{projectId}` | Get systems by project |
| POST | `/systems` | Create new system |
| PUT | `/systems/{id}` | Update system |
| DELETE | `/systems/{id}` | Delete system |

**Frontend Interface (Systems):**
```typescript
interface System {
  id: string;
  name: string;
  type: string;  // e.g., "AOCS", "EPS", "COMM", "PROP", etc.
  status: "Available" | "Allocated" | "Installed" | "Testing" | "Failed" | "Under Maintenance" | "Replaced" | "Retired";
  serialNumber: string;
  projectId: string;
  subsystems: Subsystem[];
}
```

---

### 5. **SUBSYSTEMS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/subsystems` | Get all subsystems |
| GET | `/subsystems/{id}` | Get subsystem by ID |
| GET | `/subsystems/system/{systemId}` | Get subsystems by system |
| POST | `/subsystems` | Create new subsystem |
| PUT | `/subsystems/{id}` | Update subsystem |
| DELETE | `/subsystems/{id}` | Delete subsystem |

**Frontend Interface (Subsystems):**
```typescript
interface Subsystem {
  id: string;
  name: string;
  type: string;
  status: "Available" | "Allocated" | "Installed" | "Testing" | "Failed" | "Under Maintenance" | "Replaced" | "Retired";
  serialNumber: string;
  modules: Module[];
}
```

---

### 6. **MODULES**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/modules` | Get all modules |
| GET | `/modules/{id}` | Get module by ID |
| GET | `/modules/subsystem/{subsystemId}` | Get modules by subsystem |
| POST | `/modules` | Create new module |
| PUT | `/modules/{id}` | Update module |
| DELETE | `/modules/{id}` | Delete module |

**Frontend Interface (Modules):**
```typescript
interface Module {
  id: string;
  name: string;
  status: "Available" | "Allocated" | "Installed" | "Testing" | "Failed" | "Under Maintenance" | "Replaced" | "Retired";
  serialNumber: string;
  units: Unit[];
}
```

---

### 7. **UNITS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/units` | Get all units |
| GET | `/units/{id}` | Get unit by ID |
| GET | `/units/module/{moduleId}` | Get units by module |
| POST | `/units` | Create new unit |
| PUT | `/units/{id}` | Update unit |
| DELETE | `/units/{id}` | Delete unit |

**Frontend Interface (Units):**
```typescript
interface Unit {
  id: string;
  name: string;
  status: "Available" | "Allocated" | "Installed" | "Testing" | "Failed" | "Under Maintenance" | "Replaced" | "Retired";
  serialNumber: string;
  components: SatComponent[];
}
```

---

### 8. **COMPONENTS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/components` | Get all components |
| GET | `/components/{id}` | Get component by ID |
| GET | `/components/unit/{unitId}` | Get components by unit |
| POST | `/components` | Create new component |
| PUT | `/components/{id}` | Update component |
| DELETE | `/components/{id}` | Delete component |

**Frontend Interface (Components):**
```typescript
interface SatComponent {
  id: string;
  name: string;
  status: "Available" | "Allocated" | "Installed" | "Testing" | "Failed" | "Under Maintenance" | "Replaced" | "Retired";
  serialNumber: string;
}
```

---

### 9. **MAINTENANCE LOGS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/maintenance-logs` | Get all maintenance logs |
| GET | `/maintenance-logs/{id}` | Get maintenance log by ID |
| GET | `/maintenance-logs/project/{projectId}` | Get logs by project |
| GET | `/maintenance-logs/entity/{entityId}` | Get logs by entity |
| POST | `/maintenance-logs` | Create new log |
| PUT | `/maintenance-logs/{id}` | Update log |
| DELETE | `/maintenance-logs/{id}` | Delete log |

**Frontend Interface (MaintenanceLogs):**
```typescript
interface MaintenanceLog {
  id: string;
  projectId: string;
  entityId: string;
  entityType: "System" | "Subsystem" | "Module" | "Unit" | "Component";
  entityName: string;
  faultDescription: string;
  rootCause: string;
  actionTaken: string;
  date: string;  // Format: YYYY-MM-DD
  engineer: string;
  status: "Open" | "Resolved" | "Monitoring";
}
```

---

### 10. **INVENTORY**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/inventory` | Get all inventory items |
| GET | `/inventory/{id}` | Get inventory item by ID |
| GET | `/inventory/project/{projectId}` | Get items assigned to project |
| POST | `/inventory` | Create new inventory item |
| PUT | `/inventory/{id}` | Update inventory item |
| DELETE | `/inventory/{id}` | Delete inventory item |

**Frontend Interface (InventoryItem):**
```typescript
interface InventoryItem {
  id: string;
  name: string;
  type: "System" | "Subsystem" | "Module" | "Unit" | "Component";
  serialNumber: string;
  status: "Available" | "Allocated" | "Installed" | "Testing" | "Failed" | "Under Maintenance" | "Replaced" | "Retired";
  quantity: number;
  assignedProject: string | null;
  location: string;
  lastMaintenanceDate: string | null;  // Format: YYYY-MM-DD
}
```

---

### 11. **USERS**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users` | Get all users |
| GET | `/users/{id}` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

**Frontend Interface (Users):**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Entry Operator" | "Viewer";
  status: "Active" | "Inactive";
}
```

---

### 12. **AUTHENTICATION**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login user, returns token |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/refresh` | Refresh authentication token |

**Frontend Authentication:**
- Token stored in: `localStorage.getItem("token")`
- Authorization Header: `Bearer {token}`
- Auto-intercepted by axios in [lib/api.ts](lib/api.ts)

---

## ✅ Field Validation Checklist

Use this to verify your backend tables match the frontend interfaces:

### Customers Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `contact` (string)
- [ ] `email` (string)
- [ ] `totalOrders` (integer)
- [ ] `status` (enum: Active, Inactive)
- [ ] `address` (string)
- [ ] `phone` (string)

### Orders Table
- [ ] `id` (string, primary key)
- [ ] `customerId` (string, foreign key → Customers)
- [ ] `customerName` (string)
- [ ] `date` (date, format: YYYY-MM-DD)
- [ ] `status` (enum: Pending, Approved, Rejected)
- [ ] `linkedProjectId` (string or null, foreign key → Projects)
- [ ] `description` (string)

### Projects Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `orderId` (string, foreign key → Orders)
- [ ] `status` (enum: Planning, Building, Testing, Delivered, Maintenance)
- [ ] `deliveryDate` (date, format: YYYY-MM-DD)
- [ ] `systemIds` (array of strings or relationship table)

### Systems Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `type` (string)
- [ ] `status` (enum: Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired)
- [ ] `serialNumber` (string)
- [ ] `projectId` (string, foreign key → Projects)

### Subsystems Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `type` (string)
- [ ] `status` (enum: Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired)
- [ ] `serialNumber` (string)
- [ ] `systemId` (string, foreign key → Systems)

### Modules Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `status` (enum: Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired)
- [ ] `serialNumber` (string)
- [ ] `subsystemId` (string, foreign key → Subsystems)

### Units Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `status` (enum: Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired)
- [ ] `serialNumber` (string)
- [ ] `moduleId` (string, foreign key → Modules)

### Components Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `status` (enum: Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired)
- [ ] `serialNumber` (string)
- [ ] `unitId` (string, foreign key → Units)

### MaintenanceLogs Table
- [ ] `id` (string, primary key)
- [ ] `projectId` (string, foreign key → Projects)
- [ ] `entityId` (string)
- [ ] `entityType` (enum: System, Subsystem, Module, Unit, Component)
- [ ] `entityName` (string)
- [ ] `faultDescription` (string)
- [ ] `rootCause` (string)
- [ ] `actionTaken` (string)
- [ ] `date` (date, format: YYYY-MM-DD)
- [ ] `engineer` (string)
- [ ] `status` (enum: Open, Resolved, Monitoring)

### Inventory Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `type` (enum: System, Subsystem, Module, Unit, Component)
- [ ] `serialNumber` (string)
- [ ] `status` (enum: Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired)
- [ ] `quantity` (integer)
- [ ] `assignedProject` (string or null, foreign key → Projects)
- [ ] `location` (string)
- [ ] `lastMaintenanceDate` (date or null, format: YYYY-MM-DD)

### Users Table
- [ ] `id` (string, primary key)
- [ ] `name` (string)
- [ ] `email` (string)
- [ ] `role` (enum: Admin, Entry Operator, Viewer)
- [ ] `status` (enum: Active, Inactive)

---

## 🔗 Frontend Integration Points

The following files will need API calls:

| Page | Current File | Should fetch from |
|------|--------------|-------------------|
| Customers | `app/(dashboard)/customers/page.tsx` | `GET /api/customers` |
| Orders | `app/(dashboard)/orders/page.tsx` | `GET /api/orders` |
| Projects | `app/(dashboard)/projects/page.tsx` | `GET /api/projects` |
| Project Details | `app/(dashboard)/projects/[id]/page.tsx` | `GET /api/projects/{id}` |
| Hierarchy | `app/(dashboard)/hierarchy/page.tsx` | All systems/subsystems/modules/units/components |
| Inventory | `app/(dashboard)/inventory/page.tsx` | `GET /api/inventory` |
| Maintenance | `app/(dashboard)/maintenance/page.tsx` | `GET /api/maintenance-logs` |
| Users | `app/(dashboard)/users/page.tsx` | `GET /api/users` |
| Login | `app/login/page.tsx` | `POST /api/auth/login` |

---

## 📝 Example: API Call Implementation

Here's how to update a page component to fetch data from your FastAPI backend:

```typescript
// app/(dashboard)/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Customer } from "@/lib/dummy-data";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get<Customer[]>("/customers");
        setCustomers(response.data);
      } catch (err) {
        setError("Failed to fetch customers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {/* Render customers */}
      {customers.map((customer) => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  );
}
```

---

## Summary

✅ **Base URL:** `http://localhost:8000/api`
✅ **Authentication:** Bearer token in Authorization header
✅ **Data Format:** All interfaces defined in [lib/dummy-data.ts](lib/dummy-data.ts)
✅ **HTTP Client:** Configured in [lib/api.ts](lib/api.ts)
