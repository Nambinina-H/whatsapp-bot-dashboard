"""Targeted checks: polling indicator during a refetch + error banner + Retry flow."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = "http://localhost:5174/"
WEBHOOK_HOST = "aklys.app.n8n.cloud"
OUT = Path(__file__).resolve().parent.parent / "screenshots"
OUT.mkdir(exist_ok=True)


def main() -> int:
    console_msgs: list[dict[str, str]] = []
    report: dict[str, object] = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        page = ctx.new_page()

        page.on(
            "console",
            lambda m: console_msgs.append({"type": m.type, "text": m.text})
            if m.type in ("error", "warning")
            else None,
        )
        page.on(
            "pageerror",
            lambda e: console_msgs.append({"type": "pageerror", "text": str(e)}),
        )

        # --- Polling-dot capture: wait for a refetch, screenshot mid-flight.
        page.goto(URL, wait_until="networkidle")
        with page.expect_request(
            lambda r: WEBHOOK_HOST in r.url, timeout=5000
        ) as _info:
            pass  # next refetch will fire within 3s
        page.screenshot(
            path=str(OUT / "state-polling-dot.png"),
            clip={"x": 0, "y": 0, "width": 380, "height": 100},
        )
        report["polling_dot_captured"] = True

        # --- Error state: abort all webhook calls, reload, screenshot banner.
        page.route(
            f"**://{WEBHOOK_HOST}/**",
            lambda route: route.abort(),
        )
        page.reload(wait_until="domcontentloaded")
        # wait for banner to appear (TanStack Query first failure)
        banner = page.locator("text=Erreur de chargement").first
        banner.wait_for(state="visible", timeout=10_000)
        page.screenshot(
            path=str(OUT / "state-error-banner.png"),
            clip={"x": 0, "y": 0, "width": 1280, "height": 200},
        )
        report["error_banner_visible"] = True

        # --- Retry: clicking should trigger another fetch attempt (still aborted).
        with page.expect_request(
            lambda r: WEBHOOK_HOST in r.url, timeout=5000
        ):
            page.get_by_role("button", name="Réessayer").click()
        report["retry_triggered_fetch"] = True

        # --- Lift the abort and confirm recovery
        page.unroute(f"**://{WEBHOOK_HOST}/**")
        page.wait_for_function(
            "() => !document.body.innerText.includes('Erreur de chargement')",
            timeout=10_000,
        )
        page.wait_for_load_state("networkidle")
        page.screenshot(path=str(OUT / "state-recovered.png"), full_page=False)
        report["recovered"] = True

        browser.close()

    report["console"] = console_msgs
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
