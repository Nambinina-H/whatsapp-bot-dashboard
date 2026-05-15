"""Search-bar scenarios: empty / with results / no results, plus debounce sanity."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = "http://localhost:5174/"
WEBHOOK_HOST = "aklys.app.n8n.cloud"
OUT = Path(__file__).resolve().parent.parent / "screenshots"
OUT.mkdir(exist_ok=True)

# Inline payload that mirrors n8n's contract and exercises the search cases:
# - "FR +33…" contacts (French) — should match query "FR"
# - "MG +261…" contacts (Malagasy) — should match query "261"
# - one ending in 4416 — should match query "4416" uniquely
MOCK_PAYLOAD = {
    "conversations": [
        {
            "id": "c1",
            "contact": {"name": "MG +261324649141", "phone": "+261324649141", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m1-1", "from": "user", "text": "Salut", "timestamp": "2026-05-12T09:49:00.000Z"},
                {"id": "m1-2", "from": "bot", "text": "Bonjour Joanh !", "timestamp": "2026-05-12T09:50:00.000Z"},
            ],
        },
        {
            "id": "c2",
            "contact": {"name": "FR +33607141883", "phone": "+33607141883", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m2-1", "from": "user", "text": "Bonjour", "timestamp": "2026-05-09T14:00:00.000Z"},
            ],
        },
        {
            "id": "c3",
            "contact": {"name": "FR +33782988667", "phone": "+33782988667", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m3-1", "from": "bot", "text": "Parfait.", "timestamp": "2026-05-08T18:00:00.000Z"},
            ],
        },
        {
            "id": "c4",
            "contact": {"name": "MG +261321994416", "phone": "+261321994416", "avatar": None},
            "unreadCount": 5,
            "messages": [
                {"id": "m4-1", "from": "user", "text": "Allo ?", "timestamp": "2026-05-08T11:00:00.000Z"},
            ],
        },
        {
            "id": "c5",
            "contact": {"name": "FR +33651983282", "phone": "+33651983282", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m5-1", "from": "bot", "text": "Le mieux c'est 30 min en visio.", "timestamp": "2026-05-07T10:00:00.000Z"},
            ],
        },
        {
            "id": "c6",
            "contact": {"name": "FR +33643442279", "phone": "+33643442279", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m6-1", "from": "bot", "text": "Bonne question.", "timestamp": "2026-05-07T11:00:00.000Z"},
            ],
        },
        {
            "id": "c7",
            "contact": {"name": "MG +261383910289", "phone": "+261383910289", "avatar": None},
            "unreadCount": 0,
            "messages": [
                {"id": "m7-1", "from": "bot", "text": "Je veux être sûre.", "timestamp": "2026-05-07T12:00:00.000Z"},
            ],
        },
    ]
}


def main() -> int:
    report: dict[str, object] = {"steps": []}
    console_msgs: list[dict[str, str]] = []

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

        # Stub the n8n endpoint with our deterministic payload so the test is
        # independent of upstream availability.
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

        search = page.locator("input[aria-label='Rechercher un contact']")
        counter = page.locator("header span.text-xs").first

        # --- 1. Empty (initial state)
        page.screenshot(
            path=str(OUT / "search-empty.png"),
            clip={"x": 0, "y": 0, "width": 380, "height": 800},
        )
        report["steps"].append({
            "step": "initial",
            "counter": counter.text_content(),
            "items_visible": page.locator("ul > li").count(),
        })

        # --- 2. Type "FR" -> French contacts; highlight on "FR" in names
        search.fill("FR")
        page.wait_for_timeout(400)  # debounce 250ms
        page.screenshot(
            path=str(OUT / "search-with-results.png"),
            clip={"x": 0, "y": 0, "width": 380, "height": 800},
        )
        marks_fr = page.locator("ul > li mark").all_text_contents()
        report["steps"].append({
            "step": "query 'FR'",
            "counter": counter.text_content(),
            "items_visible": page.locator("ul > li").count(),
            "highlighted_terms": marks_fr,
        })

        # --- 3. Type "261" -> Malagasy contacts highlight
        search.fill("")
        page.wait_for_timeout(300)
        search.fill("261")
        page.wait_for_timeout(400)
        marks_261 = page.locator("ul > li mark").all_text_contents()
        report["steps"].append({
            "step": "query '261'",
            "counter": counter.text_content(),
            "items_visible": page.locator("ul > li").count(),
            "highlighted_terms": marks_261,
        })

        # --- 4. Type "4416" -> single conversation +261321994416
        search.fill("")
        page.wait_for_timeout(300)
        search.fill("4416")
        page.wait_for_timeout(400)
        report["steps"].append({
            "step": "query '4416'",
            "counter": counter.text_content(),
            "items_visible": page.locator("ul > li").count(),
        })

        # --- 5. Type "BTP" -> no results -> EmptySearchState
        search.fill("")
        page.wait_for_timeout(300)
        search.fill("BTP")
        page.wait_for_timeout(400)
        no_results_visible = page.get_by_text("Aucun contact pour").is_visible()
        page.screenshot(
            path=str(OUT / "search-no-results.png"),
            clip={"x": 0, "y": 0, "width": 380, "height": 800},
        )
        report["steps"].append({
            "step": "query 'BTP'",
            "counter": counter.text_content(),
            "items_visible": page.locator("ul > li").count(),
            "empty_state_visible": no_results_visible,
        })

        # --- 6. Click "Effacer" inside empty state -> back to full list
        page.get_by_role("button", name="Effacer", exact=True).click()
        page.wait_for_timeout(300)
        report["steps"].append({
            "step": "after Effacer",
            "counter": counter.text_content(),
            "items_visible": page.locator("ul > li").count(),
            "search_value": search.input_value(),
        })

        # --- 7. Debounce sanity: rapidly type F, FR, FR3 then wait
        search.fill("F")
        page.wait_for_timeout(60)
        search.fill("FR")
        page.wait_for_timeout(60)
        search.fill("FR3")
        page.wait_for_timeout(500)  # let final debounce settle
        report["steps"].append({
            "step": "fast typing -> 'FR3'",
            "counter": counter.text_content(),
            "items_visible": page.locator("ul > li").count(),
        })

        # --- 8. Clear via the X button (visible because input has content)
        page.get_by_role("button", name="Effacer la recherche").click()
        page.wait_for_timeout(300)
        report["steps"].append({
            "step": "after X click",
            "counter": counter.text_content(),
            "items_visible": page.locator("ul > li").count(),
            "search_value": search.input_value(),
        })

        browser.close()

    report["console"] = console_msgs
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
