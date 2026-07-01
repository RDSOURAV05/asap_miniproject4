from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# Activity Log Schemas
class ActivityLogBase(BaseModel):
    action: str
    details: str

class ActivityLog(ActivityLogBase):
    id: int
    employee_id: Optional[int] = None
    task_id: Optional[int] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Assigned"  # "Assigned", "Updated", "Completed"
    priority: Optional[str] = "Medium"   # "Low", "Medium", "High"
    due_date: Optional[str] = None

class TaskCreate(TaskBase):
    employee_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

class TaskUpdateStatus(BaseModel):
    status: str

class Task(TaskBase):
    id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Employee Schemas
class EmployeeBase(BaseModel):
    name: str
    email: str
    department: Optional[str] = None
    role: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    created_at: datetime
    tasks: List[Task] = []

    model_config = ConfigDict(from_attributes=True)
