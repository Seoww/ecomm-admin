import asyncio
import random
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, text

from app.db.session import get_engine
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem


def random_string(n=6):
    return "".join(random.choices(string.ascii_lowercase, k=n))


def random_price():
    return random.randint(10, 500)


def random_stock():
    return random.randint(0, 500)


def random_status():
    return random.choice(
        ["pending", "processing", "shipped", "completed", "cancelled"]
    )


async def seed_users(session: AsyncSession, total=10_000, batch_size=1_000):
    print(f"Seeding {total} users...")
    batch = []

    for i in range(total):
        batch.append({
            "email": f"user{i}@example.com",
            "name": f"User {i}",
        })

        if len(batch) >= batch_size:
            await session.execute(insert(User), batch)
            await session.commit()
            batch.clear()

    if batch:
        await session.execute(insert(User), batch)
        await session.commit()

    print("Users done.")


async def seed_products(session: AsyncSession, total=5_000, batch_size=500):
    print(f"Seeding {total} products...")
    batch = []

    for i in range(total):
        batch.append({
            "title": f"Product {random_string()}",
            "sku": f"SKU-{i}-{random_string(4)}",
            "price": random_price(),
            "stock": random_stock(),
        })

        if len(batch) >= batch_size:
            await session.execute(insert(Product), batch)
            await session.commit()
            batch.clear()

    if batch:
        await session.execute(insert(Product), batch)
        await session.commit()

    print("Products done.")


async def seed_orders(
    session: AsyncSession,
    total_orders=85_000,
    batch_size=500,
):
    print(f"Seeding {total_orders} orders...")

    user_ids = [
        r[0] for r in (await session.execute(text("SELECT id FROM users"))).all()
    ]

    products = [
        {"id": r.id, "price": int(r.price)}
        for r in (await session.execute(text("SELECT id, price FROM products"))).all()
    ]

    if not user_ids or not products:
        print("Missing users or products.")
        return

    orders_batch = []
    items_batch = []
    inserted = 0

    for _ in range(total_orders):
        user_id = random.choice(user_ids)
        num_items = random.randint(1, 5)

        total_price = 0
        items = []

        for _ in range(num_items):
            product = random.choice(products)
            qty = random.randint(1, 3)
            subtotal = product["price"] * qty
            total_price += subtotal

            items.append({
                "product_id": product["id"],
                "qty": qty,
                "unit_price": product["price"],
            })

        orders_batch.append({
            "user_id": user_id,
            "status": random_status(),
            "total": total_price,
        })

        items_batch.append(items)

        if len(orders_batch) >= batch_size:
            result = await session.execute(
                insert(Order).returning(Order.id),
                orders_batch
            )
            order_ids = [r[0] for r in result]

            flat_items = []
            for oid, order_items in zip(order_ids, items_batch):
                for item in order_items:
                    flat_items.append({
                        "order_id": oid,
                        **item
                    })

            await session.execute(insert(OrderItem), flat_items)
            await session.commit()

            inserted += len(orders_batch)
            print(f"Inserted {inserted} orders...")

            orders_batch.clear()
            items_batch.clear()

    if orders_batch:
        result = await session.execute(
            insert(Order).returning(Order.id),
            orders_batch
        )
        order_ids = [r[0] for r in result]

        flat_items = []
        for oid, order_items in zip(order_ids, items_batch):
            for item in order_items:
                flat_items.append({
                    "order_id": oid,
                    **item
                })

        await session.execute(insert(OrderItem), flat_items)
        await session.commit()

    print("Orders done.")


async def main():
    engine = get_engine()
    async with AsyncSession(engine) as session:
        await seed_users(session)
        await seed_products(session)
        await seed_orders(session)

    print("Seeding complete.")


if __name__ == "__main__":
    asyncio.run(main())
