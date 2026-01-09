from fastapi import FastAPI, Request
from fastapi.responses import Response
import httpx

app = FastAPI()

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy(request: Request, path: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Path already includes 'api/' so just pass it directly to Next.js
        url = f"http://localhost:3000/{path}"
        body = await request.body()
        
        response = await client.request(
            method=request.method,
            url=url,
            headers={key: value for key, value in request.headers.items() 
                    if key.lower() not in ['host', 'content-length']},
            content=body,
            cookies=request.cookies,
        )
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )
