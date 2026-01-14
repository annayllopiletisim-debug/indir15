from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get frontend URL from environment variable
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes"""
    return JSONResponse(content={"status": "healthy", "service": "backend-proxy"})

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
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
        
        # Filter out hop-by-hop headers
        hop_by_hop = {'connection', 'keep-alive', 'transfer-encoding', 'te', 'trailer', 'upgrade'}
        filtered_headers = {k: v for k, v in response.headers.items() if k.lower() not in hop_by_hop}
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=filtered_headers,
        )
