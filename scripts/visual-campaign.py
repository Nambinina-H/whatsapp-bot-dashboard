"""Verify campaign_name appears inline in conversation header (mobile + desktop)."""

from __future__ import annotations

import json
import sys

from playwright.sync_api import sync_playwright

URL = "http://localhost:5174/"


def main() -> int:
    report: dict[str, object] = {"steps": []}
    console_errors: list[dict[str, str]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for label, viewport in [("mobile 375", (375, 667)), ("desktop 1280", (1280, 800))]:
            ctx = browser.new_context(viewport={"width": viewport[0], "height": viewport[1]})
            page = ctx.new_page()
            page.on(
                "console",
                lambda m, v=label: console_errors.append({"type": m.type, "text": m.text, "viewport": v})
                if m.type in ("error", "warning")
                else None,
            )
            page.on(
                "pageerror",
                lambda e, v=label: console_errors.append({"type": "pageerror", "text": str(e), "viewport": v}),
            )

            page.goto(URL, wait_until="networkidle")
            page.wait_for_selector("input[aria-label='Rechercher un prospect']")
            page.wait_for_timeout(300)

            # First conv (Tovo R., Instagram + 'Testing' campaign)
            page.locator("ul > li").first.click()
            page.wait_for_timeout(200)
            header = page.locator("header").nth(1)
            header_box = header.bounding_box()
            header_text = (header.text_content() or "").strip()
            report["steps"].append({
                "viewport": label,
                "step": "conv with campaign (Tovo R.)",
                "header_height": header_box["height"] if header_box else None,
                "campaign_in_header": "Testing" in header_text,
                # 'Campagne :' label is hidden below sm: breakpoint
                "campagne_prefix_in_header": "Campagne" in header_text,
                "header_text": header_text,
            })

            # Last conv (Nirina V., no lead/campaign)
            back = page.get_by_role("button", name="Retour à la liste")
            if back.count() and back.first.is_visible():
                back.first.click()
                page.wait_for_timeout(200)
            page.locator("ul > li").last.click()
            page.wait_for_timeout(200)
            header = page.locator("header").nth(1)
            header_text = (header.text_content() or "").strip()
            report["steps"].append({
                "viewport": label,
                "step": "conv without campaign (Nirina V.)",
                "header_height": (header.bounding_box() or {}).get("height"),
                "campaign_absent": "Testing" not in header_text and "Acquisition" not in header_text,
            })

            ctx.close()

        browser.close()

    report["console_errors"] = console_errors
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if console_errors else 0


if __name__ == "__main__":
    sys.exit(main())
