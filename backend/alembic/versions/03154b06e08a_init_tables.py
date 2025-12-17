"""init tables

Revision ID: 03154b06e08a
Revises: e7504eac1888
Create Date: 2025-12-15 19:55:11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "03154b06e08a"
down_revision: Union[str, Sequence[str], None] = "e7504eac1888"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("sku", sa.String(64), nullable=False, unique=True),
        sa.Column("price", sa.Integer, nullable=False),
        sa.Column("stock", sa.Integer, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("total", sa.Integer, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("order_id", sa.Integer, sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("product_id", sa.Integer, sa.ForeignKey("products.id"), nullable=False),
        sa.Column("qty", sa.Integer, nullable=False),
        sa.Column("unit_price", sa.Integer, nullable=False),
    )

    op.create_index("ix_products_title", "products", ["title"])
    op.create_index("ix_cart_items_user_id", "cart_items", ["user_id"])
    op.create_index("ix_cart_items_product_id", "cart_items", ["product_id"])
    op.create_index("ix_orders_user_id", "orders", ["user_id"])
    op.create_index("ix_orders_status", "orders", ["status"])
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"])

    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # --- concurrent indexes MUST be outside transaction ---
    with op.get_context().autocommit_block():
        op.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_name_trgm
            ON users USING gin (name gin_trgm_ops)
        """)

        op.execute("""
            CREATE INDEX IF NOT EXISTS idx_orders_created_at_id
            ON orders (created_at DESC, id DESC)
        """)

        op.execute("""
            CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
            ON orders (status, created_at DESC)
        """)


def downgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("DROP INDEX IF EXISTS idx_orders_status_created_at")
        op.execute("DROP INDEX IF EXISTS idx_orders_created_at_id")
        op.execute("DROP INDEX IF EXISTS idx_users_name_trgm")

    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("cart_items")
    op.drop_table("users")
    op.drop_table("products")
