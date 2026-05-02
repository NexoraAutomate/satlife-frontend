# Frontend Integration Guide - API Calls

## Quick Start: Making API Calls

Your frontend is already configured with axios in [lib/api.ts](lib/api.ts). Here's how to use it:

---

## ✅ Making API Calls in Components

### Basic Pattern

```typescript
// Option 1: Using useEffect hook
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Customer } from "@/lib/dummy-data";

export default function MyComponent() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<Customer[]>("/customers");
        setData(response.data);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return <div>{/* Render data */}</div>;
}
```

---

## 📄 Page-by-Page Integration Examples

### 1. CUSTOMERS PAGE
**File:** `app/(dashboard)/customers/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Customer } from "@/lib/dummy-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.contact}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.address}</TableCell>
              <TableCell>{customer.totalOrders}</TableCell>
              <TableCell>
                <span className={customer.status === "Active" ? "text-green-600" : "text-red-600"}>
                  {customer.status}
                </span>
              </TableCell>
              <TableCell>
                <button onClick={() => handleDelete(customer.id)} className="text-red-500">
                  Delete
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### 2. ORDERS PAGE
**File:** `app/(dashboard)/orders/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Order } from "@/lib/dummy-data";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(""); // Filter by status

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<Order[]>("/orders");
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = filter
    ? orders.filter((o) => o.status === filter)
    : orders;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="border rounded p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Order ID:</strong> {order.id}
              </div>
              <div>
                <strong>Status:</strong> {order.status}
              </div>
              <div>
                <strong>Customer:</strong> {order.customerName}
              </div>
              <div>
                <strong>Date:</strong> {order.date}
              </div>
              <div>
                <strong>Description:</strong> {order.description}
              </div>
              <div>
                <strong>Project:</strong> {order.linkedProjectId || "Not linked"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 3. PROJECTS PAGE
**File:** `app/(dashboard)/projects/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Project } from "@/lib/dummy-data";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get<Project[]>("/projects");
        setProjects(response.data);
      } catch (err) {
        setError("Failed to fetch projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Projects</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <div className="border rounded p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-bold">{project.name}</h3>
              <p className="text-sm text-gray-600">ID: {project.id}</p>
              <p className="text-sm">Status: <span className="font-semibold">{project.status}</span></p>
              <p className="text-sm">Delivery: {project.deliveryDate}</p>
              <p className="text-sm">Systems: {project.systemIds.length}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

### 4. PROJECT DETAILS PAGE
**File:** `app/(dashboard)/projects/[id]/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Project, System } from "@/lib/dummy-data";
import { useParams } from "next/navigation";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project details
        const projectRes = await api.get<Project>(`/projects/${projectId}`);
        setProject(projectRes.data);

        // Fetch systems for this project
        const systemsRes = await api.get<System[]>(
          `/systems/project/${projectId}`
        );
        setSystems(systemsRes.data);
      } catch (err) {
        setError("Failed to fetch project details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-gray-600">ID: {project.id}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Status:</strong> {project.status}
        </div>
        <div>
          <strong>Order ID:</strong> {project.orderId}
        </div>
        <div>
          <strong>Delivery Date:</strong> {project.deliveryDate}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Systems ({systems.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systems.map((system) => (
            <div key={system.id} className="border rounded p-4">
              <h3 className="font-bold">{system.name}</h3>
              <p className="text-sm">Type: {system.type}</p>
              <p className="text-sm">Serial: {system.serialNumber}</p>
              <p className="text-sm">Status: <span className="font-semibold">{system.status}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 5. HIERARCHY PAGE (Systems/Subsystems/etc.)
**File:** `app/(dashboard)/hierarchy/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { System, Subsystem } from "@/lib/dummy-data";

export default function HierarchyPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const response = await api.get<System[]>("/systems");
        setSystems(response.data);
      } catch (err) {
        setError("Failed to fetch systems");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystems();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">System Hierarchy</h1>

      <div className="space-y-2">
        {systems.map((system) => (
          <div key={system.id}>
            <button
              onClick={() => 
                setExpandedSystem(expandedSystem === system.id ? null : system.id)
              }
              className="w-full text-left p-2 border rounded hover:bg-gray-100"
            >
              {expandedSystem === system.id ? "▼" : "▶"} {system.name} ({system.type})
            </button>

            {expandedSystem === system.id && (
              <div className="ml-4 space-y-2 mt-2">
                {system.subsystems?.map((subsystem) => (
                  <div key={subsystem.id} className="border rounded p-2 bg-gray-50">
                    <div className="font-semibold">{subsystem.name}</div>
                    <div className="text-sm text-gray-600">
                      Status: {subsystem.status} | Serial: {subsystem.serialNumber}
                    </div>
                    <div className="text-sm mt-2">
                      Modules: {subsystem.modules?.length || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 6. INVENTORY PAGE
**File:** `app/(dashboard)/inventory/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { InventoryItem } from "@/lib/dummy-data";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get<InventoryItem[]>("/inventory");
        setItems(response.data);
      } catch (err) {
        setError("Failed to fetch inventory");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredItems = filterType
    ? items.filter((item) => item.type === filterType)
    : items;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <div className="mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Types</option>
          <option value="System">System</option>
          <option value="Subsystem">Subsystem</option>
          <option value="Module">Module</option>
          <option value="Unit">Unit</option>
          <option value="Component">Component</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="border rounded p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <strong>Name:</strong> {item.name}
              </div>
              <div>
                <strong>Type:</strong> {item.type}
              </div>
              <div>
                <strong>Quantity:</strong> {item.quantity}
              </div>
              <div>
                <strong>Status:</strong> <span className="text-blue-600">{item.status}</span>
              </div>
              <div>
                <strong>Location:</strong> {item.location}
              </div>
              <div>
                <strong>Serial:</strong> {item.serialNumber}
              </div>
              <div>
                <strong>Project:</strong> {item.assignedProject || "Unassigned"}
              </div>
              {item.lastMaintenanceDate && (
                <div>
                  <strong>Last Maintenance:</strong> {item.lastMaintenanceDate}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 7. MAINTENANCE PAGE
**File:** `app/(dashboard)/maintenance/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { MaintenanceLog } from "@/lib/dummy-data";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get<MaintenanceLog[]>("/maintenance-logs");
        setLogs(response.data);
      } catch (err) {
        setError("Failed to fetch maintenance logs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = filterStatus
    ? logs.filter((log) => log.status === filterStatus)
    : logs;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Maintenance Logs</h1>

      <div className="mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
          <option value="Monitoring">Monitoring</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="border rounded p-4">
            <div className="mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{log.entityName}</h3>
                  <p className="text-sm text-gray-600">
                    {log.entityType} | {log.date} | Engineer: {log.engineer}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  log.status === "Resolved" ? "bg-green-100 text-green-800" :
                  log.status === "Open" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {log.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Fault Description:</strong>
                <p className="text-gray-700">{log.faultDescription}</p>
              </div>
              <div>
                <strong>Root Cause:</strong>
                <p className="text-gray-700">{log.rootCause}</p>
              </div>
              <div className="col-span-2">
                <strong>Action Taken:</strong>
                <p className="text-gray-700">{log.actionTaken}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 8. USERS PAGE
**File:** `app/(dashboard)/users/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { User } from "@/lib/dummy-data";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<User[]>("/users");
        setUsers(response.data);
      } catch (err) {
        setError("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <div key={user.id} className="border rounded p-4">
            <div className="space-y-2">
              <h3 className="font-bold">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">Role: <strong>{user.role}</strong></span>
                <span className={`px-2 py-1 rounded text-sm ${
                  user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔐 Authentication Integration

**File:** `app/login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Store token
      localStorage.setItem("token", response.data.access_token);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

---

## 📊 Common API Patterns

### Fetch with Dependency
```typescript
useEffect(() => {
  fetchData();
}, [dependency]); // Re-fetch when dependency changes
```

### Pagination
```typescript
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);

useEffect(() => {
  const fetchPaginated = async () => {
    const response = await api.get("/customers", {
      params: { page, limit },
    });
    setCustomers(response.data);
  };
  fetchPaginated();
}, [page, limit]);
```

### POST/Create
```typescript
const handleCreate = async (newData: CustomerCreate) => {
  try {
    const response = await api.post<Customer>("/customers", newData);
    setCustomers([...customers, response.data]);
  } catch (err) {
    console.error("Create failed", err);
  }
};
```

### PUT/Update
```typescript
const handleUpdate = async (id: string, updatedData: CustomerUpdate) => {
  try {
    const response = await api.put<Customer>(`/customers/${id}`, updatedData);
    setCustomers(
      customers.map((c) => (c.id === id ? response.data : c))
    );
  } catch (err) {
    console.error("Update failed", err);
  }
};
```

### DELETE
```typescript
const handleDelete = async (id: string) => {
  try {
    await api.delete(`/customers/${id}`);
    setCustomers(customers.filter((c) => c.id !== id));
  } catch (err) {
    console.error("Delete failed", err);
  }
};
```

---

## ✅ Integration Verification Checklist

- [ ] API base URL working: `http://localhost:8000/api`
- [ ] Token is being sent in Authorization header
- [ ] All endpoints return data in expected format
- [ ] Enum values match exactly (case-sensitive)
- [ ] Date fields are in YYYY-MM-DD format
- [ ] Error handling is working
- [ ] Loading states display correctly
- [ ] CORS is configured on backend
- [ ] Authentication token persists across pages
- [ ] All pages fetch from backend instead of dummy data

