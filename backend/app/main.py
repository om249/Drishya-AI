from fastapi import FastAPI

from app.api.routes import auth, interviews, users

app = FastAPI(title="Drishya API", version="0.1.0")

app.include_router(auth.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Welcome to Drishya API"}
