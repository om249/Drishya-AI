# We have to take break for few days cause of Term-end exam
from fastapi import FastAPI
import os

from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth,
    dashboard,
    interviews,
    users,
    resume,
    job_descriptions,
    resume_matching,
)


app = FastAPI(title="Drishya API", version="0.1.0")

frontend_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

allowed_origins = list(set(default_origins + frontend_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(job_descriptions.router, prefix="/api")
app.include_router(resume_matching.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Welcome to Drishya API"}
