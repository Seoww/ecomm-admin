from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional

from app.db.session import get_db

router = APIRouter()

# Allow only safe sortable columns
SAFE_ORDER_FIELDS = {"id", "email", "name", "created_at"}

@router.get("/")
async def get_users(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),

    # Filtering options
    email: Optional[str] = None,
    name: Optional[str] = None,

    # Ordering
    order_by: str = Query("created_at"),
    order_dir: str = Query("desc"),

    db: AsyncSession = Depends(get_db)
):
    # --- Validate ordering fields ---
    if order_by not in SAFE_ORDER_FIELDS:
        order_by = "created_at"

    if order_dir.lower() not in {"asc", "desc"}:
        order_dir = "desc"

    # --- Base query ---
    sql = """
        SELECT * 
        FROM users
        WHERE 1=1
    """

    params = {}

    # --- Filtering ---
    if email:
        sql += " AND email ILIKE :email"
        params["email"] = f"%{email}%"

    if name:
        sql += " AND name ILIKE :name"
        params["name"] = f"%{name}%"

    # --- Ordering ---
    sql += f" ORDER BY {order_by} {order_dir.upper()}"

    # --- Pagination ---
    sql += " LIMIT :limit OFFSET :offset"
    params.update({"limit": limit, "offset": offset})

    query = text(sql)
    result = await db.execute(query, params)
    rows = result.fetchall()

    users = [dict(row._mapping) for row in rows]

    return {
        "data": users,
        "pagination": {
            "limit": limit,
            "offset": offset,
            "count": len(users)
        }
    }
