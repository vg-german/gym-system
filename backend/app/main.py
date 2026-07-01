from fastapi import FastAPI

app = FastAPI(title="Gym CRUD & Biometric Access System", version="1.0.0")


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Servidor de Gimnasio corriendo en Docker con recarga automática!"}
