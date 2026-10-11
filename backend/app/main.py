from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.routers.plans import router as plans_router
from app.routers.tenants import router as tenants_router
from app.routers.usages import router as usages_router
from app.routers import dashboard

app = FastAPI(
    title="SaaS Billing API",
    description="Subscription and usage-based billing API",
    version="1.0.0",
)

app.add_middleware( 
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"],
    allow_credentials=True, 
    allow_methods=["GET", "POST", "OPTIONS"], 
    allow_headers=["Content-Type", "Authorization"], 
)

app.include_router(plans_router)
app.include_router(tenants_router)
app.include_router(usages_router)
app.include_router(dashboard.router)

