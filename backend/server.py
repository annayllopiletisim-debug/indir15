from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_URL = "http://localhost:3000"

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy(request: Request, path: str):
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Ensure path starts with /
        clean_path = path if path.startswith('/') else f'/{path}'
        url = f"{FRONTEND_URL}{clean_path}"
        
        # Forward the request
        response = await client.request(
            method=request.method,
            url=url,
            headers={key: value for key, value in request.headers.items() if key.lower() not in ['host']},
            content=await request.body(),
            params=request.query_params,
        )
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )
