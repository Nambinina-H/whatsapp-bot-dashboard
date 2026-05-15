"""Verify channel badge + filter menu (popover) UI."""

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
            "messages": [
                {"id": "m1", "from": "user", "text": "Salut WhatsApp", "timestamp": "2026-05-14T09:00:00.000Z"},
            ],
        },
        {
            "id": "c2",
            "channel": "facebook",
            "contact": {"name": "Bob FB", "phone": "+33607141883", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m2", "from": "user", "text": "Hello Facebook", "timestamp": "2026-05-14T10:00:00.000Z"},
            ],
        },
        {
            "id": "c3",
            "channel": "instagram",
            "contact": {"name": "Charlie IG", "phone": "+33782988667", "avatar": None},
            "unreadCount": 2,
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
                {"id": "m4", "from": "user", "text": "LinkedIn ping", "timestamp": "2026-05-14T12:00:00.000Z"},
            ],
        },
        {
            "id": "c5",
            "channel": "tiktok",
            "contact": {"name": "Eve TT", "phone": "+261383910289", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m5", "from": "user", "text": "Tiktok unknown", "timestamp": "2026-05-14T13:00:00.000Z"},
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
        page.wait_for_selector("input[aria-label='Rechercher un contact']")
        page.wait_for_timeout(300)

        filter_button = page.get_by_role("button", name="Filtrer par canal")
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
        menu = page.get_by_role("menu", name="Filtrer par canal")
        options = menu.get_by_role("menuitemradio")
        report["steps"].append({
            "step": "popover opened",
            "menu_visible": menu.is_visible(),
            "option_count": options.count(),
            "option_labels": [
                (options.nth(i).text_content() or "").strip()
                for i in range(options.count())
            ],
        })

        # Pick Facebook
        options.filter(has_text="Facebook").first.click()
        page.wait_for_timeout(200)
        report["steps"].append({
            "step": "after selecting Facebook",
            "menu_count": menu.count(),
            "items_visible": page.locator("ul > li").count(),
            "active_pill_count": page.locator("button[aria-label='Retirer le filtre Facebook']").count(),
        })

        # Click pill X to clear
        page.locator("button[aria-label='Retirer le filtre Facebook']").click()
        page.wait_for_timeout(150)
        report["steps"].append({
            "step": "after clearing via pill",
            "items_visible": page.locator("ul > li").count(),
            "active_pill_count": page.locator("button[aria-label^='Retirer le filtre']").count(),
        })

        # Open popover, press Escape -> closes
        filter_button.click()
        page.wait_for_timeout(150)
        page.keyboard.press("Escape")
        page.wait_for_timeout(150)
        report["steps"].append({
            "step": "ESC closes popover",
            "menu_count": page.get_by_role("menu", name="Filtrer par canal").count(),
        })

        # Open popover, click outside -> closes
        filter_button.click()
        page.wait_for_timeout(150)
        page.mouse.click(900, 400)
        page.wait_for_timeout(150)
        report["steps"].append({
            "step": "outside click closes popover",
            "menu_count": page.get_by_role("menu", name="Filtrer par canal").count(),
        })

        # Combine: filter Instagram + search 'Alice' (mismatch)
        filter_button.click()
        page.wait_for_timeout(150)
        menu.get_by_role("menuitemradio").filter(has_text="Instagram").first.click()
        page.wait_for_timeout(150)
        page.locator("input[aria-label='Rechercher un contact']").fill("Alice")
        page.wait_for_timeout(400)
        report["steps"].append({
            "step": "Instagram filter + search 'Alice' (mismatch)",
            "items_visible": page.locator("ul > li").count(),
            "empty_state_visible": page.get_by_text("Aucun contact pour").is_visible(),
        })

        # Reset via EmptySearchState "Effacer" button (clears search + filter)
        page.get_by_role("button", name="Effacer", exact=True).click()
        page.wait_for_timeout(300)
        report["steps"].append({
            "step": "after Effacer",
            "items_visible": page.locator("ul > li").count(),
            "active_pill_count": page.locator("button[aria-label^='Retirer le filtre']").count(),
            "search_value": page.locator("input[aria-label='Rechercher un contact']").input_value(),
        })

        # Open a conversation, inspect header channel label
        page.locator("ul > li").first.click()
        page.wait_for_timeout(200)
        header_text = page.locator("header").nth(1).text_content() or ""
        report["steps"].append({
            "step": "open first conv, header content",
            "header_includes_channel": any(
                lbl in header_text
                for lbl in ("WhatsApp", "Facebook", "Instagram", "LinkedIn", "Inconnu")
            ),
        })

        browser.close()

    report["console_errors"] = console_errors
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 1 if console_errors else 0


if __name__ == "__main__":
    sys.exit(main())
