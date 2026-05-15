"""Verify channel badge + filter menu (Canal + Campagne sections) UI."""

from __future__ import annotations

import json
import sys

from playwright.sync_api import sync_playwright

URL = "http://localhost:5174/"
WEBHOOK_HOST = "aklys.app.n8n.cloud"

MOCK_PAYLOAD = {
    "conversations": [
        {
            "id": "c1",
            "channel": "whatsapp",
            "contact": {"name": "Alice WA", "phone": "+261324649141", "avatar": None},
            "unreadCount": 1,
            "lead": {"campaignName": "Acquisition"},
            "messages": [
                {"id": "m1", "from": "user", "text": "Salut", "timestamp": "2026-05-14T09:00:00.000Z"},
            ],
        },
        {
            "id": "c2",
            "channel": "facebook",
            "contact": {"name": "Bob FB", "phone": "+33607141883", "avatar": None},
            "unreadCount": 0,
            "lead": {"campaignName": "Testing"},
            "messages": [
                {"id": "m2", "from": "user", "text": "Hello", "timestamp": "2026-05-14T10:00:00.000Z"},
            ],
        },
        {
            "id": "c3",
            "channel": "instagram",
            "contact": {"name": "Charlie IG", "phone": "+33782988667", "avatar": None},
            "unreadCount": 2,
            "lead": {"campaignName": "Testing"},
            "messages": [
                {"id": "m3", "from": "user", "text": "Insta", "timestamp": "2026-05-14T11:00:00.000Z"},
            ],
        },
        {
            "id": "c4",
            "channel": "linkedin",
            "contact": {"name": "Dana LI", "phone": "+261321994416", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m4", "from": "user", "text": "LinkedIn", "timestamp": "2026-05-14T12:00:00.000Z"},
            ],
        },
    ]
}


def main() -> int:
    report: dict[str, object] = {"steps": []}
    console_errors: list[dict[str, str]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 800})
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

        page.route(
            f"**://{WEBHOOK_HOST}/**",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(MOCK_PAYLOAD),
            ),
        )

        page.goto(URL, wait_until="networkidle")
        page.wait_for_selector("input[aria-label='Rechercher un prospect']")
        page.wait_for_timeout(300)

        filter_button = page.get_by_role("button", name="Filtrer")
        report["steps"].append({
            "step": "initial state",
            "filter_button_visible": filter_button.is_visible(),
            "items_visible": page.locator("ul > li").count(),
            "badges": page.locator("ul > li [aria-label^='Canal :']").count(),
            "active_pill_count": page.locator("button[aria-label^='Retirer le filtre']").count(),
        })

        # Open popover
        filter_button.click()
        page.wait_for_timeout(150)
        menu = page.get_by_role("menu", name="Filtres")
        options = menu.get_by_role("menuitemradio")
        report["steps"].append({
            "step": "popover opened (Canal + Campagne sections)",
            "menu_visible": menu.is_visible(),
            "option_count": options.count(),
            "option_labels": [
                (options.nth(i).text_content() or "").strip()
                for i in range(options.count())
            ],
        })

        # Pick Facebook channel
        options.filter(has_text="Facebook").first.click()
        page.wait_for_timeout(200)
        report["steps"].append({
            "step": "after selecting Facebook channel",
            "items_visible": page.locator("ul > li").count(),
            "channel_pill_count": page.locator("button[aria-label='Retirer le filtre canal Facebook']").count(),
        })

        # Reopen popover (now auto-closed after channel selection)
        page.locator("button[aria-expanded]").first.click()
        page.wait_for_selector("[role='menu'][aria-label='Filtres']", timeout=5000)
        all_options = page.locator("[role='menu'] [role='menuitemradio']")
        all_option_labels = [
            (all_options.nth(i).text_content() or "").strip()
            for i in range(all_options.count())
        ]
        report["steps"].append({
            "step": "reopened popover shows Campagne section",
            "option_count": all_options.count(),
            "all_options": all_option_labels,
        })
        # Pick Testing campaign (use partial text match on text-only campaign option)
        all_options.filter(has_text="Testing").first.click()
        page.wait_for_timeout(300)
        report["steps"].append({
            "step": "combined Facebook + Testing filters",
            "items_visible": page.locator("ul > li").count(),
            "channel_pill_count": page.locator("button[aria-label='Retirer le filtre canal Facebook']").count(),
            "campaign_pill_count": page.locator("button[aria-label='Retirer le filtre campagne Testing']").count(),
        })

        # Clear channel pill -> only campaign filter remains
        page.locator("button[aria-label='Retirer le filtre canal Facebook']").click()
        page.wait_for_timeout(150)
        report["steps"].append({
            "step": "after clearing channel pill",
            "items_visible": page.locator("ul > li").count(),
            "channel_pill_count": page.locator("button[aria-label^='Retirer le filtre canal']").count(),
            "campaign_pill_count": page.locator("button[aria-label^='Retirer le filtre campagne']").count(),
        })

        # Clear campaign pill -> back to all
        page.locator("button[aria-label='Retirer le filtre campagne Testing']").click()
        page.wait_for_timeout(150)
        report["steps"].append({
            "step": "after clearing campaign pill",
            "items_visible": page.locator("ul > li").count(),
            "active_pill_count": page.locator("button[aria-label^='Retirer le filtre']").count(),
        })

        # ESC closes popover
        page.get_by_role("button", name="Filtrer").click()
        page.wait_for_timeout(150)
        page.keyboard.press("Escape")
        page.wait_for_timeout(150)
        report["steps"].append({
            "step": "ESC closes popover",
            "menu_count": page.get_by_role("menu", name="Filtres").count(),
        })

        # Open conversation, inspect inline header content
        page.locator("ul > li").first.click()
        page.wait_for_timeout(200)
        header_text = page.locator("header").nth(1).text_content() or ""
        header_box = page.locator("header").nth(1).bounding_box()
        report["steps"].append({
            "step": "open first conv, inline header",
            "header_height": header_box["height"] if header_box else None,
            "header_has_phone": "+33" in header_text or "+261" in header_text,
            "header_has_campaign_label": "Campagne" in header_text,
        })

        browser.close()

    report["console_errors"] = console_errors
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if console_errors else 0


if __name__ == "__main__":
    sys.exit(main())
