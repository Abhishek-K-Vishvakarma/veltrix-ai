from sqlalchemy import func, select


def paginate(db, stmt, page: int, size: int, serialize=lambda x: x) -> dict:
    total = (
        db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
    )
    rows = db.scalars(stmt.offset((page - 1) * size).limit(size)).all()
    return {
        "items": [serialize(r) for r in rows],
        "total": total, 
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size,
    }
