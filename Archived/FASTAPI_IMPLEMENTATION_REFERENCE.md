# FastAPI Backend Implementation Reference

## Overview
This document shows the expected FastAPI endpoint structure and Pydantic models to ensure frontend data structures match your backend exactly.

---

## Required Environment & Setup

```bash
# Install FastAPI and dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib[bcrypt] python-multipart

# Run FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Pydantic Models (Expected Structure)

```python
# models.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date
from enum import Enum

# ============= ENUMS =============
class EntityStatusEnum(str, Enum):
    AVAILABLE = "Available"
    ALLOCATED = "Allocated"
    INSTALLED = "Installed"
    TESTING = "Testing"
    FAILED = "Failed"
    UNDER_MAINTENANCE = "Under Maintenance"
    REPLACED = "Replaced"
    RETIRED = "Retired"

class ProjectStatusEnum(str, Enum):
    PLANNING = "Planning"
    BUILDING = "Building"
    TESTING = "Testing"
    DELIVERED = "Delivered"
    MAINTENANCE = "Maintenance"

class OrderStatusEnum(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class MaintenanceStatusEnum(str, Enum):
    OPEN = "Open"
    RESOLVED = "Resolved"
    MONITORING = "Monitoring"

class UserRoleEnum(str, Enum):
    ADMIN = "Admin"
    ENTRY_OPERATOR = "Entry Operator"
    VIEWER = "Viewer"

class CustomerStatusEnum(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"

class EntityTypeEnum(str, Enum):
    SYSTEM = "System"
    SUBSYSTEM = "Subsystem"
    MODULE = "Module"
    UNIT = "Unit"
    COMPONENT = "Component"

class InventoryTypeEnum(str, Enum):
    SYSTEM = "System"
    SUBSYSTEM = "Subsystem"
    MODULE = "Module"
    UNIT = "Unit"
    COMPONENT = "Component"

# ============= CUSTOMER =============
class CustomerBase(BaseModel):
    name: str
    contact: str
    email: str
    total_orders: int
    status: CustomerStatusEnum
    address: str
    phone: str

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    total_orders: Optional[int] = None
    status: Optional[CustomerStatusEnum] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class Customer(CustomerBase):
    id: str

    class Config:
        from_attributes = True

# ============= ORDER =============
class OrderBase(BaseModel):
    customer_id: str
    customer_name: str
    date: date  # YYYY-MM-DD
    status: OrderStatusEnum
    linked_project_id: Optional[str] = None
    description: str

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    date: Optional[date] = None
    status: Optional[OrderStatusEnum] = None
    linked_project_id: Optional[str] = None
    description: Optional[str] = None

class Order(OrderBase):
    id: str

    class Config:
        from_attributes = True

# ============= PROJECT =============
class ProjectBase(BaseModel):
    name: str
    order_id: str
    status: ProjectStatusEnum
    delivery_date: date  # YYYY-MM-DD
    system_ids: List[str] = []

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    order_id: Optional[str] = None
    status: Optional[ProjectStatusEnum] = None
    delivery_date: Optional[date] = None
    system_ids: Optional[List[str]] = None

class Project(ProjectBase):
    id: str

    class Config:
        from_attributes = True

# ============= SYSTEM =============
class SystemBase(BaseModel):
    name: str
    type: str
    status: EntityStatusEnum
    serial_number: str
    project_id: str

class SystemCreate(SystemBase):
    pass

class SystemUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[EntityStatusEnum] = None
    serial_number: Optional[str] = None
    project_id: Optional[str] = None

class System(SystemBase):
    id: str

    class Config:
        from_attributes = True

# ============= SUBSYSTEM =============
class SubsystemBase(BaseModel):
    name: str
    type: str
    status: EntityStatusEnum
    serial_number: str
    system_id: str

class SubsystemCreate(SubsystemBase):
    pass

class SubsystemUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[EntityStatusEnum] = None
    serial_number: Optional[str] = None
    system_id: Optional[str] = None

class Subsystem(SubsystemBase):
    id: str

    class Config:
        from_attributes = True

# ============= MODULE =============
class ModuleBase(BaseModel):
    name: str
    status: EntityStatusEnum
    serial_number: str
    subsystem_id: str

class ModuleCreate(ModuleBase):
    pass

class ModuleUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[EntityStatusEnum] = None
    serial_number: Optional[str] = None
    subsystem_id: Optional[str] = None

class Module(ModuleBase):
    id: str

    class Config:
        from_attributes = True

# ============= UNIT =============
class UnitBase(BaseModel):
    name: str
    status: EntityStatusEnum
    serial_number: str
    module_id: str

class UnitCreate(UnitBase):
    pass

class UnitUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[EntityStatusEnum] = None
    serial_number: Optional[str] = None
    module_id: Optional[str] = None

class Unit(UnitBase):
    id: str

    class Config:
        from_attributes = True

# ============= COMPONENT =============
class SatComponentBase(BaseModel):
    name: str
    status: EntityStatusEnum
    serial_number: str
    unit_id: str

class SatComponentCreate(SatComponentBase):
    pass

class SatComponentUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[EntityStatusEnum] = None
    serial_number: Optional[str] = None
    unit_id: Optional[str] = None

class SatComponent(SatComponentBase):
    id: str

    class Config:
        from_attributes = True

# ============= MAINTENANCE LOG =============
class MaintenanceLogBase(BaseModel):
    project_id: str
    entity_id: str
    entity_type: EntityTypeEnum
    entity_name: str
    fault_description: str
    root_cause: str
    action_taken: str
    date: date  # YYYY-MM-DD
    engineer: str
    status: MaintenanceStatusEnum

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogUpdate(BaseModel):
    project_id: Optional[str] = None
    entity_id: Optional[str] = None
    entity_type: Optional[EntityTypeEnum] = None
    entity_name: Optional[str] = None
    fault_description: Optional[str] = None
    root_cause: Optional[str] = None
    action_taken: Optional[str] = None
    date: Optional[date] = None
    engineer: Optional[str] = None
    status: Optional[MaintenanceStatusEnum] = None

class MaintenanceLog(MaintenanceLogBase):
    id: str

    class Config:
        from_attributes = True

# ============= INVENTORY =============
class InventoryItemBase(BaseModel):
    name: str
    type: InventoryTypeEnum
    serial_number: str
    status: EntityStatusEnum
    quantity: int
    assigned_project: Optional[str] = None
    location: str
    last_maintenance_date: Optional[date] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[InventoryTypeEnum] = None
    serial_number: Optional[str] = None
    status: Optional[EntityStatusEnum] = None
    quantity: Optional[int] = None
    assigned_project: Optional[str] = None
    location: Optional[str] = None
    last_maintenance_date: Optional[date] = None

class InventoryItem(InventoryItemBase):
    id: str

    class Config:
        from_attributes = True

# ============= USER =============
class UserBase(BaseModel):
    name: str
    email: str
    role: UserRoleEnum
    status: CustomerStatusEnum  # Active/Inactive

class UserCreate(UserBase):
    password: str  # Only on creation

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRoleEnum] = None
    status: Optional[CustomerStatusEnum] = None
    password: Optional[str] = None

class User(UserBase):
    id: str

    class Config:
        from_attributes = True

# ============= AUTHENTICATION =============
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None
```

---

## FastAPI Routes Example

```python
# main.py or routes/customers.py
from fastapi import FastAPI, HTTPException, Depends, status
from typing import List
from datetime import datetime

app = FastAPI(title="PLCM Backend", version="1.0.0")

# CORS setup (allow frontend to call backend)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= CUSTOMERS =============
@app.get("/api/customers", response_model=List[Customer])
async def get_customers():
    """Get all customers"""
    # TODO: Fetch from database
    return []

@app.get("/api/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    """Get customer by ID"""
    # TODO: Fetch from database
    return {}

@app.post("/api/customers", response_model=Customer, status_code=201)
async def create_customer(customer: CustomerCreate):
    """Create new customer"""
    # TODO: Save to database
    return {}

@app.put("/api/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: CustomerUpdate):
    """Update customer"""
    # TODO: Update in database
    return {}

@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: str):
    """Delete customer"""
    # TODO: Delete from database
    return {"message": "Customer deleted"}

# ============= ORDERS =============
@app.get("/api/orders", response_model=List[Order])
async def get_orders():
    """Get all orders"""
    return []

@app.get("/api/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get order by ID"""
    return {}

@app.get("/api/orders/customer/{customer_id}", response_model=List[Order])
async def get_orders_by_customer(customer_id: str):
    """Get orders by customer"""
    return []

@app.post("/api/orders", response_model=Order, status_code=201)
async def create_order(order: OrderCreate):
    """Create new order"""
    return {}

@app.put("/api/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, order: OrderUpdate):
    """Update order"""
    return {}

@app.delete("/api/orders/{order_id}")
async def delete_order(order_id: str):
    """Delete order"""
    return {"message": "Order deleted"}

# ============= PROJECTS =============
@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    """Get all projects"""
    return []

@app.get("/api/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get project by ID"""
    return {}

@app.get("/api/projects/order/{order_id}", response_model=Project)
async def get_project_by_order(order_id: str):
    """Get project by order ID"""
    return {}

@app.post("/api/projects", response_model=Project, status_code=201)
async def create_project(project: ProjectCreate):
    """Create new project"""
    return {}

@app.put("/api/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project: ProjectUpdate):
    """Update project"""
    return {}

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete project"""
    return {"message": "Project deleted"}

# ============= SYSTEMS =============
@app.get("/api/systems", response_model=List[System])
async def get_systems():
    """Get all systems"""
    return []

@app.get("/api/systems/{system_id}", response_model=System)
async def get_system(system_id: str):
    """Get system by ID"""
    return {}

@app.get("/api/systems/project/{project_id}", response_model=List[System])
async def get_systems_by_project(project_id: str):
    """Get systems by project ID"""
    return []

@app.post("/api/systems", response_model=System, status_code=201)
async def create_system(system: SystemCreate):
    """Create new system"""
    return {}

@app.put("/api/systems/{system_id}", response_model=System)
async def update_system(system_id: str, system: SystemUpdate):
    """Update system"""
    return {}

@app.delete("/api/systems/{system_id}")
async def delete_system(system_id: str):
    """Delete system"""
    return {"message": "System deleted"}

# ============= SUBSYSTEMS =============
@app.get("/api/subsystems", response_model=List[Subsystem])
async def get_subsystems():
    """Get all subsystems"""
    return []

@app.get("/api/subsystems/{subsystem_id}", response_model=Subsystem)
async def get_subsystem(subsystem_id: str):
    """Get subsystem by ID"""
    return {}

@app.get("/api/subsystems/system/{system_id}", response_model=List[Subsystem])
async def get_subsystems_by_system(system_id: str):
    """Get subsystems by system ID"""
    return []

@app.post("/api/subsystems", response_model=Subsystem, status_code=201)
async def create_subsystem(subsystem: SubsystemCreate):
    """Create new subsystem"""
    return {}

@app.put("/api/subsystems/{subsystem_id}", response_model=Subsystem)
async def update_subsystem(subsystem_id: str, subsystem: SubsystemUpdate):
    """Update subsystem"""
    return {}

@app.delete("/api/subsystems/{subsystem_id}")
async def delete_subsystem(subsystem_id: str):
    """Delete subsystem"""
    return {"message": "Subsystem deleted"}

# ============= MODULES =============
@app.get("/api/modules", response_model=List[Module])
async def get_modules():
    """Get all modules"""
    return []

@app.get("/api/modules/{module_id}", response_model=Module)
async def get_module(module_id: str):
    """Get module by ID"""
    return {}

@app.get("/api/modules/subsystem/{subsystem_id}", response_model=List[Module])
async def get_modules_by_subsystem(subsystem_id: str):
    """Get modules by subsystem ID"""
    return []

@app.post("/api/modules", response_model=Module, status_code=201)
async def create_module(module: ModuleCreate):
    """Create new module"""
    return {}

@app.put("/api/modules/{module_id}", response_model=Module)
async def update_module(module_id: str, module: ModuleUpdate):
    """Update module"""
    return {}

@app.delete("/api/modules/{module_id}")
async def delete_module(module_id: str):
    """Delete module"""
    return {"message": "Module deleted"}

# ============= UNITS =============
@app.get("/api/units", response_model=List[Unit])
async def get_units():
    """Get all units"""
    return []

@app.get("/api/units/{unit_id}", response_model=Unit)
async def get_unit(unit_id: str):
    """Get unit by ID"""
    return {}

@app.get("/api/units/module/{module_id}", response_model=List[Unit])
async def get_units_by_module(module_id: str):
    """Get units by module ID"""
    return []

@app.post("/api/units", response_model=Unit, status_code=201)
async def create_unit(unit: UnitCreate):
    """Create new unit"""
    return {}

@app.put("/api/units/{unit_id}", response_model=Unit)
async def update_unit(unit_id: str, unit: UnitUpdate):
    """Update unit"""
    return {}

@app.delete("/api/units/{unit_id}")
async def delete_unit(unit_id: str):
    """Delete unit"""
    return {"message": "Unit deleted"}

# ============= COMPONENTS =============
@app.get("/api/components", response_model=List[SatComponent])
async def get_components():
    """Get all components"""
    return []

@app.get("/api/components/{component_id}", response_model=SatComponent)
async def get_component(component_id: str):
    """Get component by ID"""
    return {}

@app.get("/api/components/unit/{unit_id}", response_model=List[SatComponent])
async def get_components_by_unit(unit_id: str):
    """Get components by unit ID"""
    return []

@app.post("/api/components", response_model=SatComponent, status_code=201)
async def create_component(component: SatComponentCreate):
    """Create new component"""
    return {}

@app.put("/api/components/{component_id}", response_model=SatComponent)
async def update_component(component_id: str, component: SatComponentUpdate):
    """Update component"""
    return {}

@app.delete("/api/components/{component_id}")
async def delete_component(component_id: str):
    """Delete component"""
    return {"message": "Component deleted"}

# ============= MAINTENANCE LOGS =============
@app.get("/api/maintenance-logs", response_model=List[MaintenanceLog])
async def get_maintenance_logs():
    """Get all maintenance logs"""
    return []

@app.get("/api/maintenance-logs/{log_id}", response_model=MaintenanceLog)
async def get_maintenance_log(log_id: str):
    """Get maintenance log by ID"""
    return {}

@app.get("/api/maintenance-logs/project/{project_id}", response_model=List[MaintenanceLog])
async def get_maintenance_logs_by_project(project_id: str):
    """Get maintenance logs by project ID"""
    return []

@app.get("/api/maintenance-logs/entity/{entity_id}", response_model=List[MaintenanceLog])
async def get_maintenance_logs_by_entity(entity_id: str):
    """Get maintenance logs by entity ID"""
    return []

@app.post("/api/maintenance-logs", response_model=MaintenanceLog, status_code=201)
async def create_maintenance_log(log: MaintenanceLogCreate):
    """Create new maintenance log"""
    return {}

@app.put("/api/maintenance-logs/{log_id}", response_model=MaintenanceLog)
async def update_maintenance_log(log_id: str, log: MaintenanceLogUpdate):
    """Update maintenance log"""
    return {}

@app.delete("/api/maintenance-logs/{log_id}")
async def delete_maintenance_log(log_id: str):
    """Delete maintenance log"""
    return {"message": "Maintenance log deleted"}

# ============= INVENTORY =============
@app.get("/api/inventory", response_model=List[InventoryItem])
async def get_inventory():
    """Get all inventory items"""
    return []

@app.get("/api/inventory/{item_id}", response_model=InventoryItem)
async def get_inventory_item(item_id: str):
    """Get inventory item by ID"""
    return {}

@app.get("/api/inventory/project/{project_id}", response_model=List[InventoryItem])
async def get_inventory_by_project(project_id: str):
    """Get inventory items by project ID"""
    return []

@app.post("/api/inventory", response_model=InventoryItem, status_code=201)
async def create_inventory_item(item: InventoryItemCreate):
    """Create new inventory item"""
    return {}

@app.put("/api/inventory/{item_id}", response_model=InventoryItem)
async def update_inventory_item(item_id: str, item: InventoryItemUpdate):
    """Update inventory item"""
    return {}

@app.delete("/api/inventory/{item_id}")
async def delete_inventory_item(item_id: str):
    """Delete inventory item"""
    return {"message": "Inventory item deleted"}

# ============= USERS =============
@app.get("/api/users", response_model=List[User])
async def get_users():
    """Get all users"""
    return []

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    return {}

@app.post("/api/users", response_model=User, status_code=201)
async def create_user(user: UserCreate):
    """Create new user"""
    return {}

@app.put("/api/users/{user_id}", response_model=User)
async def update_user(user_id: str, user: UserUpdate):
    """Update user"""
    return {}

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: str):
    """Delete user"""
    return {"message": "User deleted"}

# ============= AUTHENTICATION =============
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Login user"""
    # TODO: Verify credentials, generate JWT token
    return {}

@app.post("/api/auth/logout")
async def logout():
    """Logout user"""
    return {"message": "Logged out"}

@app.post("/api/auth/refresh")
async def refresh_token():
    """Refresh authentication token"""
    # TODO: Generate new token
    return {}

# ============= HEALTH CHECK =============
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Testing Your API

Use this curl command to test endpoints:

```bash
# Test health
curl http://localhost:8000/api/health

# Get all customers
curl http://localhost:8000/api/customers

# Create a customer
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

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@satlife.com",
    "password": "password123"
  }'
```

---

## ✅ Checklist for Backend Implementation

- [ ] All Pydantic models defined correctly
- [ ] All routes follow the endpoint pattern shown
- [ ] Enum values match frontend exactly (case-sensitive)
- [ ] CORS middleware configured for frontend URL
- [ ] Database models created with proper relationships
- [ ] Foreign keys enforce referential integrity
- [ ] ID generation strategy decided (UUID, string format, etc.)
- [ ] Authentication/JWT implemented
- [ ] Input validation via Pydantic
- [ ] Error handling for 404, 400, 500 responses
- [ ] API documentation available at `/docs`
- [ ] Database migrations set up

---

## SQLAlchemy ORM Models Example

```python
# database.py
from sqlalchemy import create_engine, Column, String, Integer, Date, Enum, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

DATABASE_URL = "sqlite:///./plcm.db"  # Or your database URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CustomerModel(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True)
    name = Column(String)
    contact = Column(String)
    email = Column(String)
    total_orders = Column(Integer)
    status = Column(String)
    address = Column(String)
    phone = Column(String)

class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True)
    customer_id = Column(String, ForeignKey("customers.id"))
    customer_name = Column(String)
    date = Column(Date)
    status = Column(String)
    linked_project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    description = Column(String)

class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    name = Column(String)
    order_id = Column(String, ForeignKey("orders.id"))
    status = Column(String)
    delivery_date = Column(Date)

# ... more models
```

