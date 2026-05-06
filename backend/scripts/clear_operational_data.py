"""Purge operational app data while preserving Logto users and coding options.

Usage (inside the backend container):
    python scripts/clear_operational_data.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import AsyncSessionLocal  # noqa: E402
from app.services.admin_cleanup import purge_operational_data  # noqa: E402


async def main() -> int:
    print("→ Purging operational data (invoices, QBO sync data, audit logs, access requests)…")
    async with AsyncSessionLocal() as session:
        try:
            await purge_operational_data(session)
            await session.commit()
        except Exception:
            await session.rollback()
            raise

    print("✓ Operational data cleared.")
    print("  Preserved: Logto users, roles, and coding options.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 1:
        print("usage: python scripts/clear_operational_data.py", file=sys.stderr)
        sys.exit(1)
    sys.exit(asyncio.run(main()))
