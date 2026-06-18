"""Shared pytest configuration.

Lets SQLite-backed tests create tables whose models use the Postgres
``JSONB`` type (``audit_logs.before/after``, ``invoices.line_items``,
``stamp_position``, ...). On the production Postgres dialect JSONB is left
untouched; here it renders as ``JSON``, which SQLite stores as TEXT. This is
test-only and is never imported by application code.
"""
from __future__ import annotations

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles


@compiles(JSONB, "sqlite")
def _compile_jsonb_as_json_on_sqlite(element, compiler, **kw):
    return "JSON"
