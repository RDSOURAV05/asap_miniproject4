from sqlalchemy.orm import Session
import models, schemas

# Employee CRUD
def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

def get_employee_by_email(db: Session, email: str):
    return db.query(models.Employee).filter(models.Employee.email == email).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(
        name=employee.name,
        email=employee.email,
        department=employee.department,
        role=employee.role
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    # Log action
    log_activity(
        db=db,
        employee_id=db_employee.id,
        action="employee_added",
        details=f"Employee {db_employee.name} was added to the system."
    )
    return db_employee

# Task CRUD
def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Task).offset(skip).limit(limit).all()

def get_tasks_by_employee(db: Session, employee_id: int):
    return db.query(models.Task).filter(models.Task.employee_id == employee_id).all()

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status or "Assigned",
        priority=task.priority or "Medium",
        due_date=task.due_date,
        employee_id=task.employee_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Get employee name for details
    employee = db.query(models.Employee).filter(models.Employee.id == task.employee_id).first()
    emp_name = employee.name if employee else "Unknown Employee"

    # Log action
    log_activity(
        db=db,
        employee_id=task.employee_id,
        task_id=db_task.id,
        action="task_assigned",
        details=f"Task '{db_task.title}' was assigned to {emp_name}."
    )
    return db_task

def update_task_status(db: Session, task_id: int, status: str):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return None

    # Track status changes to log correctly
    old_status = db_task.status
    db_task.status = status
    db.commit()
    db.refresh(db_task)

    if old_status != status:
        action = "task_completed" if status == "Completed" else "task_updated"
        details = f"Task '{db_task.title}' status was updated to {status}."
        if status == "Completed":
            details = f"Task '{db_task.title}' was completed."
        
        log_activity(
            db=db,
            employee_id=db_task.employee_id,
            task_id=db_task.id,
            action=action,
            details=details
        )
    
    return db_task

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return None
    
    # Store old status to log transitions if it changes
    old_status = db_task.status
    
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    
    # Log if status changed
    if "status" in update_data and old_status != db_task.status:
        action = "task_completed" if db_task.status == "Completed" else "task_updated"
        details = f"Task '{db_task.title}' was completed." if db_task.status == "Completed" else f"Task '{db_task.title}' status was updated to {db_task.status}."
        
        log_activity(
            db=db,
            employee_id=db_task.employee_id,
            task_id=db_task.id,
            action=action,
            details=details
        )
    else:
        # Generic update log
        log_activity(
            db=db,
            employee_id=db_task.employee_id,
            task_id=db_task.id,
            action="task_updated",
            details=f"Task '{db_task.title}' details were updated."
        )
        
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        return False
    
    task_title = db_task.title
    employee_id = db_task.employee_id

    # Log action before deletion (since FK will be set to NULL)
    log_activity(
        db=db,
        employee_id=employee_id,
        action="task_deleted",
        details=f"Task '{task_title}' was deleted from the system."
    )

    db.delete(db_task)
    db.commit()
    return True

# Activity Log CRUD
def get_activity_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).offset(skip).limit(limit).all()

def log_activity(db: Session, employee_id: int = None, task_id: int = None, action: str = "", details: str = ""):
    db_log = models.ActivityLog(
        employee_id=employee_id,
        task_id=task_id,
        action=action,
        details=details
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
