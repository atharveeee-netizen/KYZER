"""FEFO batch allocation: reserves stock earliest-expiry-first via the
allocate_fefo_stock plpgsql function (backend/db/schema.sql)."""
import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.database import get_db
from app.services.fefo_service import InsufficientStockError, allocate_fefo_stock

router = APIRouter(prefix="/api/v1/inventory", tags=["FEFO"])


class AllocateRequest(BaseModel):
    facility_id: str
    item_code: str
    quantity: int = Field(gt=0)


@router.post("/allocate")
async def allocate(
    body: AllocateRequest,
    db: asyncpg.Connection = Depends(get_db),
):
    try:
        allocations = await allocate_fefo_stock(db, body.facility_id, body.item_code, body.quantity)
    except InsufficientStockError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return {
        "status": "RESERVED",
        "facility_id": body.facility_id,
        "item_code": body.item_code,
        "requested_quantity": body.quantity,
        "allocations": allocations,
    }
