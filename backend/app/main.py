# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.api.routes import auth, dashboard, interviews, users

# app = FastAPI(title="Drishya API", version="0.1.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth.router, prefix="/api")
# app.include_router(dashboard.router, prefix="/api")
# app.include_router(interviews.router, prefix="/api")
# app.include_router(users.router, prefix="/api")


# @app.get("/")
# def root():
#     return {"message": "Welcome to Drishya API"}




from fastapi import FastAPI
import os

from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, dashboard, interviews, users

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


@app.get("/")
def root():
    return {"message": "Welcome to Drishya API"}
