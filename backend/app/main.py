from fastapi import FastAPI
from .database import engine, Base
from .routes import circles

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CalmSpace Care Circle API")

app.include_router(circles.router, prefix="/circles", tags=["circles"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CalmSpace API"}
