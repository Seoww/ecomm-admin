from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.session import get_db
from app.db.redis import redis_client
from app.utils.cache_json import dumps, loads

router = APIRouter()

@router.get("/")
async def list_orders(
    search: str | None = Query(None),
    status: str | None = Query(None),
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    cache_key = (
        f"orders:list:"
        f"search={search}|status={status}|limit={limit}|offset={offset}"
    )

    cached = redis_client.get(cache_key)
    if cached:
        return loads(cached)

    count_sql = """
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE 1=1
    """

    count_params = {}

    if search:
        count_sql += " AND u.name ILIKE :search"
        count_params["search"] = f"%{search}%"

    if status:
        count_sql += " AND o.status = :status"
        count_params["status"] = status

    total = (await db.execute(text(count_sql), count_params)).scalar() or 0

    order_id_sql = """
        SELECT o.id
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE 1=1
    """

    params = {}

    if search:
        order_id_sql += " AND u.name ILIKE :search"
        params["search"] = f"%{search}%"

    if status:
        order_id_sql += " AND o.status = :status"
        params["status"] = status

    order_id_sql += """
        ORDER BY o.created_at DESC
        LIMIT :limit OFFSET :offset
    """

    params["limit"] = limit
    params["offset"] = offset

    order_ids = [
        r[0]
        for r in (await db.execute(text(order_id_sql), params)).fetchall()
    ]

    if not order_ids:
        response = {
            "data": [],
            "pagination": {
                "total": total,
                "limit": limit,
                "offset": offset,
                "count": 0,
            },
        }
        redis_client.setex(cache_key, 30, dumps(response))
        return response

    sql = """
        SELECT 
            o.id AS order_id,
            o.status,
            o.total,
            o.created_at,
            u.id AS user_id,
            u.name AS user_name,
            u.email AS user_email,
            oi.id AS order_item_id,
            oi.qty,
            oi.unit_price,
            p.id AS product_id,
            p.title AS product_title,
            p.sku AS product_sku
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.id = ANY(:order_ids)
        ORDER BY o.created_at DESC
    """

    rows = (await db.execute(text(sql), {"order_ids": order_ids})).fetchall()

    orders = {}

    for r in rows:
        if r.order_id not in orders:
            orders[r.order_id] = {
                "order_id": r.order_id,
                "status": r.status,
                "total": float(r.total),
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "user": {
                    "user_id": r.user_id,
                    "name": r.user_name,
                    "email": r.user_email,
                },
                "items": [],
            }

        orders[r.order_id]["items"].append({
            "order_item_id": r.order_item_id,
            "qty": r.qty,
            "unit_price": float(r.unit_price),
            "product": {
                "product_id": r.product_id,
                "title": r.product_title,
                "sku": r.product_sku,
            },
        })

    response = {
        "data": list(orders.values()),
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "count": len(orders),
        },
    }

    redis_client.setex(cache_key, 30, dumps(response))
    return response
