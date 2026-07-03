from fastapi import FastAPI
from backend.app.client import supabase
from backend.app.routers import memberships

app = FastAPI(title="Gym CRUD & Biometric Access System", version="1.0.0")
app.include_router(memberships.router)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Servidor de Gimnasio corriendo en Docker con recarga automática!"}
