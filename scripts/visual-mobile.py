"""Mobile-first audit: verify touch target sizes and header layout at 375px."""

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
        # iPhone SE 2nd gen viewport
        ctx = browser.new_context(viewport={"width": 375, "height": 667})
        page = ctx.new_page()

        page.on(
            "console",
            lambda m: console_errors.append({"type": m.type, "text": m.text})
            if m.type in ("error", "warning")
            else None,
        )
        page.on(
            "pageerror",
            lambda e: console_errors.append({"type": "pageerror", "text": str(e)}),
        )

        page.goto(URL, wait_until="networkidle")
        page.wait_for_selector("input[aria-label='Rechercher un prospect']")
        page.wait_for_timeout(400)

        # Measure touch target sizes
        search_input = page.locator("input[aria-label='Rechercher un prospect']")
        filter_btn = page.get_by_role("button", name="Filtrer")
        search_box = search_input.bounding_box()
        filter_box = filter_btn.bounding_box()
        report["steps"].append({
            "step": "touch target sizes (mobile)",
            "search_input_height": search_box["height"] if search_box else None,
            "filter_button_size": (filter_box["width"], filter_box["height"]) if filter_box else None,
        })

        # Verify input font-size >= 16px (iOS auto-zoom prevention)
        font_size = page.evaluate(
            """() => getComputedStyle(document.querySelector("input[aria-label='Rechercher un prospect']")).fontSize"""
        )
        report["steps"].append({
            "step": "search input font-size",
            "font_size": font_size,
        })

        # Open popover and measure option size
        filter_btn.click()
        page.wait_for_timeout(200)
        options = page.get_by_role("menu").get_by_role("menuitemradio")
        first_box = options.first.bounding_box()
        report["steps"].append({
            "step": "popover option height",
            "first_option_height": first_box["height"] if first_box else None,
        })
        page.keyboard.press("Escape")

        # Open a conversation, check header doesn't overflow and channel label hidden
        page.locator("ul > li").first.click()
        page.wait_for_timeout(300)
        header = page.locator("header").nth(1)
        header_box = header.bounding_box()
        # back button size
        back_btn = page.get_by_role("button", name="Retour à la liste")
        back_box = back_btn.bounding_box() if back_btn.count() else None
        phone_text = header.text_content() or ""
        report["steps"].append({
            "step": "conversation header at 375px",
            "header_width": header_box["width"] if header_box else None,
            "back_button_size": (back_box["width"], back_box["height"]) if back_box else None,
            "header_text": phone_text.strip(),
        })

        browser.close()

    report["console_errors"] = console_errors
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if console_errors else 0


if __name__ == "__main__":
    sys.exit(main())
