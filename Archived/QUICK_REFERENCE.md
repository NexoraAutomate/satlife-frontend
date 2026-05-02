# API Integration - Quick Reference

## 📍 Documentation Files Created

1. **[API_ENDPOINTS_GUIDE.md](API_ENDPOINTS_GUIDE.md)** — Complete list of all endpoints with URLs and descriptions
2. **[BACKEND_TABLE_VERIFICATION.md](BACKEND_TABLE_VERIFICATION.md)** — Database schema, sample data, and field validation checklist
3. **[FASTAPI_IMPLEMENTATION_REFERENCE.md](FASTAPI_IMPLEMENTATION_REFERENCE.md)** — Pydantic models and FastAPI route templates
4. **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** — Page-by-page integration examples

---

## 🚀 Quick Start Checklist

### Backend Setup
- [ ] Create FastAPI application (see [FASTAPI_IMPLEMENTATION_REFERENCE.md](FASTAPI_IMPLEMENTATION_REFERENCE.md))
- [ ] Create database tables matching [BACKEND_TABLE_VERIFICATION.md](BACKEND_TABLE_VERIFICATION.md)
- [ ] Implement all endpoints from [API_ENDPOINTS_GUIDE.md](API_ENDPOINTS_GUIDE.md)
- [ ] Add CORS middleware for `http://localhost:3000`
- [ ] Test endpoints locally with curl or Postman

### Frontend Setup
- [ ] Verify base URL in [lib/api.ts](lib/api.ts) is `http://localhost:8000/api` ✓
- [ ] Replace dummy data with API calls in each page
- [ ] Use examples from [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)
- [ ] Test each page after implementation

---

## 🔗 API Base URL
```
http://localhost:8000/api
```

---

## 📋 All Endpoints at a Glance

### Customers
```
GET    /api/customers              → List all
GET    /api/customers/{id}         → Get one
POST   /api/customers              → Create
PUT    /api/customers/{id}         → Update
DELETE /api/customers/{id}         → Delete
```

### Orders
```
GET    /api/orders                        → List all
GET    /api/orders/{id}                   → Get one
GET    /api/orders/customer/{customerId}  → By customer
POST   /api/orders                        → Create
PUT    /api/orders/{id}                   → Update
DELETE /api/orders/{id}                   → Delete
```

### Projects
```
GET    /api/projects                 → List all
GET    /api/projects/{id}            → Get one
GET    /api/projects/order/{orderId} → By order
POST   /api/projects                 → Create
PUT    /api/projects/{id}            → Update
DELETE /api/projects/{id}            → Delete
```

### Systems
```
GET    /api/systems                      → List all
GET    /api/systems/{id}                 → Get one
GET    /api/systems/project/{projectId}  → By project
POST   /api/systems                      → Create
PUT    /api/systems/{id}                 → Update
DELETE /api/systems/{id}                 → Delete
```

### Subsystems
```
GET    /api/subsystems                      → List all
GET    /api/subsystems/{id}                 → Get one
GET    /api/subsystems/system/{systemId}    → By system
POST   /api/subsystems                      → Create
PUT    /api/subsystems/{id}                 → Update
DELETE /api/subsystems/{id}                 → Delete
```

### Modules
```
GET    /api/modules                        → List all
GET    /api/modules/{id}                   → Get one
GET    /api/modules/subsystem/{subsystemId} → By subsystem
POST   /api/modules                        → Create
PUT    /api/modules/{id}                   → Update
DELETE /api/modules/{id}                   → Delete
```

### Units
```
GET    /api/units                        → List all
GET    /api/units/{id}                   → Get one
GET    /api/units/module/{moduleId}      → By module
POST   /api/units                        → Create
PUT    /api/units/{id}                   → Update
DELETE /api/units/{id}                   → Delete
```

### Components
```
GET    /api/components                   → List all
GET    /api/components/{id}              → Get one
GET    /api/components/unit/{unitId}     → By unit
POST   /api/components                   → Create
PUT    /api/components/{id}              → Update
DELETE /api/components/{id}              → Delete
```

### Maintenance Logs
```
GET    /api/maintenance-logs                   → List all
GET    /api/maintenance-logs/{id}              → Get one
GET    /api/maintenance-logs/project/{projectId} → By project
GET    /api/maintenance-logs/entity/{entityId}   → By entity
POST   /api/maintenance-logs                   → Create
PUT    /api/maintenance-logs/{id}              → Update
DELETE /api/maintenance-logs/{id}              → Delete
```

### Inventory
```
GET    /api/inventory                        → List all
GET    /api/inventory/{id}                   → Get one
GET    /api/inventory/project/{projectId}    → By project
POST   /api/inventory                        → Create
PUT    /api/inventory/{id}                   → Update
DELETE /api/inventory/{id}                   → Delete
```

### Users
```
GET    /api/users                 → List all
GET    /api/users/{id}            → Get one
POST   /api/users                 → Create
PUT    /api/users/{id}            → Update
DELETE /api/users/{id}            → Delete
```

### Authentication
```
POST /api/auth/login              → Login (returns token)
POST /api/auth/logout             → Logout
POST /api/auth/refresh            → Refresh token
```

---

## 🔐 Authentication

**Token Storage:**
```typescript
localStorage.getItem("token")
```

**Auto-added to all requests:**
```
Authorization: Bearer {token}
```

**Configure in:** [lib/api.ts](lib/api.ts) ✓ (Already set up)

---

## 📊 Data Structures

### Key Enums
```
EntityStatus:      Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired
ProjectStatus:     Planning, Building, Testing, Delivered, Maintenance
OrderStatus:       Pending, Approved, Rejected
MaintenanceStatus: Open, Resolved, Monitoring
UserRole:          Admin, Entry Operator, Viewer
CustomerStatus:    Active, Inactive
```

### Date Format
All dates must be: **YYYY-MM-DD** (e.g., `2025-12-15`)

### ID Format
All IDs follow pattern: **PREFIX-XXX** (e.g., `CUST-001`, `ORD-001`, `PRJ-001`)

---

## 🧪 Testing Endpoints

### Using curl
```bash
# Health check
curl http://localhost:8000/api/health

# Get all customers
curl http://localhost:8000/api/customers

# Get single customer
curl http://localhost:8000/api/customers/CUST-001

# Create customer
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Corp",
    "contact": "John Doe",
    "email": "john@test.com",
    "total_orders": 0,
    "status": "Active",
    "address": "123 Main St",
    "phone": "+1-555-0000"
  }'

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/protected-endpoint
```

### Using Postman
1. Server: `localhost:8000`
2. Base path: `/api`
3. Add header: `Authorization: Bearer {token}`

---

## 🔄 Relationship Hierarchy

```
Customers (1) ←→ (N) Orders (N) → (1) Projects (1) ←→ (N) Systems (1) ←→ (N) Subsystems
                                                          ↓
                                                    (1) Modules (1) ←→ (N) Units (1) ←→ (N) Components
```

---

## 📖 Field Validation Checklist

### When implementing backend, verify:

#### Customers Table
- [x] id (string, PK)
- [x] name, contact, email, address, phone (strings)
- [x] total_orders (integer)
- [x] status (enum: Active, Inactive)

#### Orders Table
- [x] id (string, PK)
- [x] customer_id (FK → Customers)
- [x] customer_name (string)
- [x] date (DATE format YYYY-MM-DD)
- [x] status (enum: Pending, Approved, Rejected)
- [x] linked_project_id (FK → Projects, nullable)
- [x] description (string/text)

#### Projects Table
- [x] id (string, PK)
- [x] name (string)
- [x] order_id (FK → Orders)
- [x] status (enum: Planning, Building, Testing, Delivered, Maintenance)
- [x] delivery_date (DATE format YYYY-MM-DD)
- [x] system_ids (junction table or JSON array)

#### Systems/Subsystems/Modules/Units/Components
- [x] id (string, PK)
- [x] name (string)
- [x] type (string) — for Systems only
- [x] status (enum: Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired)
- [x] serial_number (string)
- [x] parent_id (FK to parent entity)

#### Maintenance Logs
- [x] id (string, PK)
- [x] project_id (FK → Projects)
- [x] entity_id (string)
- [x] entity_type (enum: System, Subsystem, Module, Unit, Component)
- [x] entity_name (string)
- [x] fault_description, root_cause, action_taken (text)
- [x] date (DATE format YYYY-MM-DD)
- [x] engineer (string)
- [x] status (enum: Open, Resolved, Monitoring)

#### Inventory
- [x] id (string, PK)
- [x] name (string)
- [x] type (enum: System, Subsystem, Module, Unit, Component)
- [x] serial_number (string)
- [x] status (enum: Available, Allocated, Installed, Testing, Failed, Under Maintenance, Replaced, Retired)
- [x] quantity (integer)
- [x] assigned_project (FK → Projects, nullable)
- [x] location (string)
- [x] last_maintenance_date (DATE, nullable)

#### Users
- [x] id (string, PK)
- [x] name, email (strings)
- [x] role (enum: Admin, Entry Operator, Viewer)
- [x] status (enum: Active, Inactive)
- [x] password (hashed)

---

## 🛠️ Implementation Steps

### 1. Backend (FastAPI)
```bash
pip install fastapi uvicorn sqlalchemy pydantic python-jose
# Create models.py with Pydantic schemas
# Create main.py with routes
# Create database.py with SQLAlchemy models
# Add CORS middleware
python -m uvicorn main:app --reload
```

### 2. Frontend Integration
```typescript
// In each page, replace dummy data with:
import api from "@/lib/api";

useEffect(() => {
  const fetchData = async () => {
    const response = await api.get("/endpoint");
    setState(response.data);
  };
  fetchData();
}, []);
```

### 3. Testing
```bash
# Test backend is running
curl http://localhost:8000/api/health

# Test frontend can connect
# Open browser DevTools > Network
# Load a page and check API calls
```

---

## 🔗 File References

| File | Purpose |
|------|---------|
| [lib/api.ts](lib/api.ts) | Axios configuration (already set up) ✓ |
| [lib/dummy-data.ts](lib/dummy-data.ts) | Data interfaces and sample data |
| [app/(dashboard)/**/page.tsx](app) | Pages to convert to API calls |
| [app/login/page.tsx](app/login/page.tsx) | Authentication page |

---

## ✅ Final Checklist Before Go-Live

- [ ] All backend endpoints implemented and working
- [ ] All database tables created with correct field names
- [ ] All enum values match frontend exactly (case-sensitive)
- [ ] CORS configured: allows `http://localhost:3000`
- [ ] Authentication working with JWT tokens
- [ ] All frontend pages fetching from backend
- [ ] Error handling in place
- [ ] Date formats are YYYY-MM-DD everywhere
- [ ] ID formats follow PREFIX-XXX pattern
- [ ] Null handling correct for optional fields
- [ ] API documentation generated (`/api/docs`)
- [ ] Performance tested with real data volume
- [ ] Edge cases tested (delete, update, create errors)

---

## 📞 Support Resources

- **Pydantic Docs:** https://docs.pydantic.dev/
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **SQLAlchemy Docs:** https://docs.sqlalchemy.org/
- **Next.js Docs:** https://nextjs.org/docs
- **Testing API:** `http://localhost:8000/api/docs` (Swagger UI)

