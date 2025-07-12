from fastapi.middleware.cors import CORSMiddleware
from config import app
from auth.routes import auth_router
from csv_routes import router as csv_router
from services.database_service import db_service

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection events
@app.on_event("startup")
async def startup():
    await db_service.connect()

@app.on_event("shutdown")
async def shutdown():
    await db_service.disconnect()

app.include_router(auth_router)
app.include_router(csv_router, prefix="/api/csv", tags=["csv"])
