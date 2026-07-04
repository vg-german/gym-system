from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import memberships, members

app = FastAPI(title="Gym CRUD & Biometric Access System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(memberships.router)
app.include_router(members.router)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "GYM CRUD & Biometric Access System!"}
