mport os
import socket
import platform
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Python FastAPI Analytics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "db"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER", "dockeruser"),
        password=os.getenv("DB_PASSWORD", "dockerpass"),
        dbname=os.getenv("DB_NAME", "microdb"),
    )

@app.get("/api/python/stats")
def get_stats():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM service_logs")
    total_records = cur.fetchone()[0]
    cur.execute("SELECT service_name, COUNT(*) FROM service_logs GROUP BY service_name ORDER BY COUNT(*) DESC")
    breakdown = [{"service_name": row[0], "count": row[1]} for row in cur.fetchall()]
    cur.close()
    conn.close()
    return {
        "status": "healthy",
        "service": "Python FastAPI Analytics",
        "container_id": socket.gethostname(),
        "python_version": platform.python_version(),
        "total_records": total_records,
        "breakdown": breakdown,
    }