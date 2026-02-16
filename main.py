from fastapi import FastAPI
import uvicorn
import asyncio
app = FastAPI()

@app.get('/home')
def home():
    return {'f':'fffff'}



async def main():
    config = uvicorn.Config(app=app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()

asyncio.run(main())
