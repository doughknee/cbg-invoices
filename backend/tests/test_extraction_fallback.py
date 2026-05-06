from __future__ import annotations

import os
from typing import Any

import pytest

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.services import extraction


class _TransientError(Exception):
    pass


class _PermanentError(Exception):
    pass


@pytest.mark.asyncio
async def test_try_extract_with_fallback_uses_secondary_after_transient_primary_failure() -> None:
    page_images = [(1, 1, b"png")]

    async def fail_provider(_page_images: list[tuple[int, int, bytes]]) -> dict[str, Any]:
        raise _TransientError("primary overloaded")

    async def succeed_provider(_page_images: list[tuple[int, int, bytes]]) -> dict[str, Any]:
        return {"vendor_name": "Fallback Vendor", "document_type": "invoice", "confidence": "high"}

    result = await extraction._try_extract_with_fallback(
        page_images,
        providers=[
            extraction.ExtractionProvider(name="primary", extract=fail_provider),
            extraction.ExtractionProvider(name="secondary", extract=succeed_provider),
        ],
        is_transient_error=lambda exc: isinstance(exc, _TransientError),
        sleep=lambda _seconds: None,
        max_attempts=1,
    )

    assert result.provider_name == "secondary"
    assert result.payload["vendor_name"] == "Fallback Vendor"


@pytest.mark.asyncio
async def test_try_extract_with_fallback_does_not_failover_on_permanent_primary_failure() -> None:
    page_images = [(1, 1, b"png")]
    secondary_called = False

    async def fail_provider(_page_images: list[tuple[int, int, bytes]]) -> dict[str, Any]:
        raise _PermanentError("bad response")

    async def succeed_provider(_page_images: list[tuple[int, int, bytes]]) -> dict[str, Any]:
        nonlocal secondary_called
        secondary_called = True
        return {"vendor_name": "Should Not Run", "document_type": "invoice", "confidence": "high"}

    with pytest.raises(_PermanentError):
        await extraction._try_extract_with_fallback(
            page_images,
            providers=[
                extraction.ExtractionProvider(name="primary", extract=fail_provider),
                extraction.ExtractionProvider(name="secondary", extract=succeed_provider),
            ],
            is_transient_error=lambda exc: isinstance(exc, _TransientError),
            sleep=lambda _seconds: None,
            max_attempts=1,
        )

    assert secondary_called is False


@pytest.mark.asyncio
async def test_try_extract_with_fallback_retries_transient_errors_before_failing_over() -> None:
    page_images = [(1, 1, b"png")]
    attempts = 0
    sleeps: list[float] = []

    async def fail_provider(_page_images: list[tuple[int, int, bytes]]) -> dict[str, Any]:
        nonlocal attempts
        attempts += 1
        raise _TransientError(f"overloaded {attempts}")

    async def succeed_provider(_page_images: list[tuple[int, int, bytes]]) -> dict[str, Any]:
        return {"vendor_name": "Fallback Vendor", "document_type": "invoice", "confidence": "high"}

    result = await extraction._try_extract_with_fallback(
        page_images,
        providers=[
            extraction.ExtractionProvider(name="primary", extract=fail_provider),
            extraction.ExtractionProvider(name="secondary", extract=succeed_provider),
        ],
        is_transient_error=lambda exc: isinstance(exc, _TransientError),
        sleep=lambda seconds: sleeps.append(seconds),
        max_attempts=3,
        base_delay_seconds=1.0,
    )

    assert attempts == 3
    assert sleeps == [1.0, 2.0]
    assert result.provider_name == "secondary"
