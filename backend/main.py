from fastapi import FastAPI
from mangum import Mangum
from app.api import services, departments, profile

app = FastAPI(title='Rode Kruis API')
app.include_router(services.router)
app.include_router(departments.router)
app.include_router(profile.router)

@app.get('/')
def root():
    return {'ok': True}

handler = Mangum(app)