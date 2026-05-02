# Backend Table Fields Verification

## Quick Reference: Enum Values

### EntityStatus
```
"Available"
"Allocated"
"Installed"
"Testing"
"Failed"
"Under Maintenance"
"Replaced"
"Retired"
```

### ProjectStatus
```
"Planning"
"Building"
"Testing"
"Delivered"
"Maintenance"
```

### OrderStatus
```
"Pending"
"Approved"
"Rejected"
```

### MaintenanceStatus
```
"Open"
"Resolved"
"Monitoring"
```

### UserRole
```
"Admin"
"Entry Operator"
"Viewer"
```

---

## Table Structures (Database Schema Expected)

### 1. Customers
```sql
CREATE TABLE customers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  contact VARCHAR(255),
  email VARCHAR(255),
  total_orders INTEGER,
  status ENUM('Active', 'Inactive'),
  address VARCHAR(255),
  phone VARCHAR(20)
);
```

**Sample Data:**
```
CUST-001 | SpaceX Corp | Elon M. | contracts@spacex.com | 3 | Active | Hawthorne, CA | +1-310-555-0100
CUST-002 | ISRO | Dr. Somanath | procurement@isro.gov.in | 2 | Active | Bengaluru, India | +91-80-2217-2000
```

---

### 2. Orders
```sql
CREATE TABLE orders (
  id VARCHAR(20) PRIMARY KEY,
  customer_id VARCHAR(20),
  customer_name VARCHAR(255),
  date DATE,
  status ENUM('Pending', 'Approved', 'Rejected'),
  linked_project_id VARCHAR(20) NULL,
  description TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (linked_project_id) REFERENCES projects(id)
);
```

**Sample Data:**
```
ORD-001 | CUST-001 | SpaceX Corp | 2025-01-15 | Approved | PRJ-001 | LEO Communication Satellite
ORD-006 | CUST-003 | ESA | 2025-05-01 | Pending | NULL | Solar Panel Array
```

---

### 3. Projects
```sql
CREATE TABLE projects (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  order_id VARCHAR(20),
  status ENUM('Planning', 'Building', 'Testing', 'Delivered', 'Maintenance'),
  delivery_date DATE,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Relationship for systemIds
CREATE TABLE project_systems (
  project_id VARCHAR(20),
  system_id VARCHAR(20),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (system_id) REFERENCES systems(id),
  PRIMARY KEY (project_id, system_id)
);
```

**Sample Data (Projects):**
```
PRJ-001 | LEO CommSat Alpha | ORD-001 | Building | 2025-12-15
PRJ-005 | Deep Probe Echo | ORD-005 | Delivered | 2025-07-30
```

**Sample Data (Project_Systems):**
```
PRJ-001 | SYS-001
PRJ-001 | SYS-002
PRJ-001 | SYS-003
PRJ-001 | SYS-004
```

---

### 4. Systems
```sql
CREATE TABLE systems (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(100),
  status ENUM('Available', 'Allocated', 'Installed', 'Testing', 'Failed', 'Under Maintenance', 'Replaced', 'Retired'),
  serial_number VARCHAR(50),
  project_id VARCHAR(20),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

**Sample Data:**
```
SYS-001 | AOCS | AOCS | Installed | SN-SYS-001 | PRJ-001
SYS-008 | EO Imaging | PAYLOAD | Testing | SN-SYS-008 | PRJ-003
```

---

### 5. Subsystems
```sql
CREATE TABLE subsystems (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(100),
  status ENUM('Available', 'Allocated', 'Installed', 'Testing', 'Failed', 'Under Maintenance', 'Replaced', 'Retired'),
  serial_number VARCHAR(50),
  system_id VARCHAR(20),
  FOREIGN KEY (system_id) REFERENCES systems(id)
);
```

**Sample Data:**
```
SYS-001-SS-01 | Sensors | Sensors | Installed | SN-SYS-001-SS1 | SYS-001
SYS-002-SS-02 | Battery Pack | Battery Pack | Testing | SN-SYS-002-SS2 | SYS-002
```

---

### 6. Modules
```sql
CREATE TABLE modules (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  status ENUM('Available', 'Allocated', 'Installed', 'Testing', 'Failed', 'Under Maintenance', 'Replaced', 'Retired'),
  serial_number VARCHAR(50),
  subsystem_id VARCHAR(20),
  FOREIGN KEY (subsystem_id) REFERENCES subsystems(id)
);
```

**Sample Data:**
```
SYS-001-SS-01-M-01 | Sensors Module 1 | Installed | SN-SYS-001-SS1-M1 | SYS-001-SS-01
SYS-001-SS-01-M-02 | Sensors Module 2 | Available | SN-SYS-001-SS1-M2 | SYS-001-SS-01
```

---

### 7. Units
```sql
CREATE TABLE units (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  status ENUM('Available', 'Allocated', 'Installed', 'Testing', 'Failed', 'Under Maintenance', 'Replaced', 'Retired'),
  serial_number VARCHAR(50),
  module_id VARCHAR(20),
  FOREIGN KEY (module_id) REFERENCES modules(id)
);
```

**Sample Data:**
```
SYS-001-SS-01-M-01-U-01 | Sensors Module 1 Unit 1 | Installed | SN-SYS-001-SS1-M1-U1 | SYS-001-SS-01-M-01
SYS-001-SS-01-M-01-U-02 | Sensors Module 1 Unit 2 | Testing | SN-SYS-001-SS1-M1-U2 | SYS-001-SS-01-M-01
```

---

### 8. Components (SatComponent)
```sql
CREATE TABLE components (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  status ENUM('Available', 'Allocated', 'Installed', 'Testing', 'Failed', 'Under Maintenance', 'Replaced', 'Retired'),
  serial_number VARCHAR(50),
  unit_id VARCHAR(20),
  FOREIGN KEY (unit_id) REFERENCES units(id)
);
```

**Sample Data:**
```
SYS-001-SS-01-M-01-U-01-CMP-001 | Sensors Component 1 | Available | SN-SYS-001-SS1-M1-U1-C1 | SYS-001-SS-01-M-01-U-01
SYS-001-SS-01-M-01-U-01-CMP-002 | Sensors Component 2 | Installed | SN-SYS-001-SS1-M1-U1-C2 | SYS-001-SS-01-M-01-U-01
```

---

### 9. Maintenance Logs
```sql
CREATE TABLE maintenance_logs (
  id VARCHAR(20) PRIMARY KEY,
  project_id VARCHAR(20),
  entity_id VARCHAR(20),
  entity_type ENUM('System', 'Subsystem', 'Module', 'Unit', 'Component'),
  entity_name VARCHAR(255),
  fault_description TEXT,
  root_cause TEXT,
  action_taken TEXT,
  date DATE,
  engineer VARCHAR(255),
  status ENUM('Open', 'Resolved', 'Monitoring'),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

**Sample Data:**
```
MNT-001 | PRJ-001 | SYS-001 | System | AOCS | Gyroscope drift exceeding tolerance | Bearing wear | Replaced gyroscope bearing assembly | 2025-06-10 | Dr. Sarah Chen | Resolved
MNT-006 | PRJ-006 | SYS-020 | System | Surveillance Payload | SAR image artifacts | Antenna misalignment after vibration test | Realigned antenna, retested | 2025-08-10 | Ana Rodriguez | Monitoring
```

---

### 10. Inventory
```sql
CREATE TABLE inventory (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  type ENUM('System', 'Subsystem', 'Module', 'Unit', 'Component'),
  serial_number VARCHAR(50),
  status ENUM('Available', 'Allocated', 'Installed', 'Testing', 'Failed', 'Under Maintenance', 'Replaced', 'Retired'),
  quantity INTEGER,
  assigned_project VARCHAR(20) NULL,
  location VARCHAR(255),
  last_maintenance_date DATE NULL,
  FOREIGN KEY (assigned_project) REFERENCES projects(id)
);
```

**Sample Data:**
```
INV-001 | Reaction Wheel RW-200 | Unit | SN-RW-200-001 | Available | 12 | NULL | Warehouse A-1 | NULL
INV-003 | Solar Panel SP-3K | Subsystem | SN-SP-3K-001 | Allocated | 4 | PRJ-003 | Clean Room B-1 | NULL
INV-004 | Li-Ion Battery Pack | Subsystem | SN-LIB-001 | Installed | 6 | PRJ-001 | Integration Bay | 2025-06-15
```

---

### 11. Users
```sql
CREATE TABLE users (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  role ENUM('Admin', 'Entry Operator', 'Viewer'),
  status ENUM('Active', 'Inactive')
);
```

**Sample Data:**
```
USR-001 | Admin User | admin@satlife.com | Admin | Active
USR-002 | Dr. Sarah Chen | sarah.chen@satlife.com | Entry Operator | Active
USR-005 | James Walker | james.walker@satlife.com | Viewer | Active
USR-006 | Emily Tanaka | emily.tanaka@satlife.com | Viewer | Inactive
```

---

## Relationship Diagram

```
Customers (1) ←→ (N) Orders (N) → (1) Projects
                                    ↓
                            Project_Systems ← (N) Systems
                                              ↓
                                    (1) Subsystems (N)
                                              ↓
                                    (1) Modules (N)
                                              ↓
                                    (1) Units (N)
                                              ↓
                                    (1) Components (N)

Maintenance_Logs → Projects
Maintenance_Logs → (any entity: System, Subsystem, Module, Unit, Component)

Inventory → Projects (nullable)
Users (standalone)
```

---

## Data Type Recommendations

| Frontend Type | SQL Type | Notes |
|---|---|---|
| string (IDs) | VARCHAR(20) | Consistent format like "CUST-001", "ORD-001" |
| string (names) | VARCHAR(255) | Use TEXT for longer descriptions |
| date string | DATE | Store as YYYY-MM-DD format |
| enum | ENUM or VARCHAR | Use ENUM for validation, VARCHAR for flexibility |
| boolean | BOOLEAN/TINYINT | Active/Inactive uses ENUM |
| number (count) | INTEGER | quantity, totalOrders |
| array | JSON or junction table | systemIds uses project_systems junction table |
| null-able field | Type NULL | assignedProject, linkedProjectId, lastMaintenanceDate |

---

## ✅ Verification Checklist for Backend Tables

Before integrating frontend with backend, verify:

- [ ] All table names match expected endpoints
- [ ] All enum values are exact (case-sensitive)
- [ ] Foreign keys have corresponding primary keys
- [ ] Date fields are in YYYY-MM-DD format
- [ ] Nullable fields are properly marked
- [ ] IDs follow the pattern: PREFIX-XXX (e.g., CUST-001, ORD-001)
- [ ] Serial numbers follow pattern: SN-{prefix}-{identifier}
- [ ] Array fields use junction tables
- [ ] Relationships are bidirectional where needed
- [ ] Email fields have email validation
- [ ] Phone fields accept international formats

---

## Notes

1. **Case Sensitivity**: Enum values in database must match exactly with frontend
2. **ID Format**: Frontend expects IDs as strings (not auto-increment integers)
3. **Dates**: All date fields should be stored in YYYY-MM-DD format or as DATE type
4. **Null Values**: Fields like `linkedProjectId` and `assignedProject` accept NULL
5. **Relationships**: The hierarchy (System → Subsystem → Module → Unit → Component) must be maintained
