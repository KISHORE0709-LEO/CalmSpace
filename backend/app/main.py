from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import circles
from .routes import therapy_sessions

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CalmSpace API")

# ── CORS — allow the Vite dev server ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(circles.router, prefix="/circles", tags=["circles"])
app.include_router(therapy_sessions.router)          # prefix="/api/therapy" defined in the router

@app.get("/")
def read_root():
    return {"message": "Welcome to CalmSpace API"}
