"""FEFO allocation service: thin wrapper around the `allocate_fefo_stock`
plpgsql function (backend/db/schema.sql), which does the actual FOR UPDATE
locking, quantity_reserved bookkeeping, and inventory_ledger writes
atomically inside Postgres. This layer only translates the function's
RAISE EXCEPTION on insufficient stock into an application-level error the
route can turn into an HTTP response."""
import asyncpg


class InsufficientStockError(Exception):
    """Raised when allocate_fefo_stock can't satisfy the requested quantity."""


async def allocate_fefo_stock(
    db: asyncpg.Connection, facility_id: str, item_code: str, quantity: int
) -> list[dict]:
    try:
        async with db.transaction():
            rows = await db.fetch(
                "SELECT * FROM allocate_fefo_stock($1, $2, $3)",
                facility_id, item_code, quantity,
            )
    except asyncpg.exceptions.RaiseError as exc:
        raise InsufficientStockError(str(exc)) from exc

    return [
        {
            "batch_id": str(r["batch_id"]),
            "batch_number": r["batch_number"],
            "allocated_qty": r["allocated_qty"],
            "expiry_date": str(r["expiry_date"]),
        }
        for r in rows
    ]
