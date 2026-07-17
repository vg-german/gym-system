from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import memberships, members, suscriptions, dashboard

app = FastAPI(title="Gym CRUD & Biometric Access System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(memberships.router)
app.include_router(members.router)
app.include_router(suscriptions.router)
app.include_router(dashboard.router)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "GYM CRUD & Biometric Access System!"}
