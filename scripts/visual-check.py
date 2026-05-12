"""Visual smoke test: render the dashboard at 3 breakpoints, capture screenshots,
collect console errors, and dump a small JSON report to stdout."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import ConsoleMessage, sync_playwright

URL = "http://localhost:5174/"
OUT = Path(__file__).resolve().parent.parent / "screenshots"
OUT.mkdir(exist_ok=True)

VIEWPORTS = [
    {"name": "mobile-375",  "width": 375,  "height": 812},
    {"name": "tablet-768",  "width": 768,  "height": 1024},
    {"name": "desktop-1280","width": 1280, "height": 800},
]


def main() -> int:
    report: dict[str, object] = {"viewports": [], "console": []}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        def on_console(msg: ConsoleMessage) -> None:
            if msg.type in ("error", "warning"):
                report["console"].append({"type": msg.type, "text": msg.text})

        page.on("console", on_console)
        page.on("pageerror", lambda e: report["console"].append({"type": "pageerror", "text": str(e)}))

        for vp in VIEWPORTS:
            entry: dict[str, object] = {"name": vp["name"], "shots": []}
            page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
            page.goto(URL, wait_until="networkidle")
            page.wait_for_timeout(400)

            shot_initial = OUT / f"{vp['name']}-01-initial.png"
            page.screenshot(path=str(shot_initial), full_page=False)
            entry["shots"].append(str(shot_initial.name))

            # Click first conversation in the list
            first = page.locator("ul > li > button").first
            if first.count() > 0:
                first.click()
                page.wait_for_timeout(300)
                shot_conv = OUT / f"{vp['name']}-02-conversation.png"
                page.screenshot(path=str(shot_conv), full_page=False)
                entry["shots"].append(str(shot_conv.name))

                # On mobile, exercise the back button
                if vp["width"] < 768:
                    back = page.get_by_role("button", name="Retour à la liste")
                    if back.count() > 0:
                        back.click()
                        page.wait_for_timeout(300)
                        shot_back = OUT / f"{vp['name']}-03-back-to-list.png"
                        page.screenshot(path=str(shot_back), full_page=False)
                        entry["shots"].append(str(shot_back.name))

            # Inspect DOM for layout sanity
            list_visible = page.locator("aside").is_visible()
            main_visible = page.locator("main").is_visible()
            entry["asideVisible"] = list_visible
            entry["mainVisible"] = main_visible
            entry["bodyScrollWidth"] = page.evaluate("document.documentElement.scrollWidth")
            entry["bodyClientWidth"] = page.evaluate("document.documentElement.clientWidth")
            report["viewports"].append(entry)

        browser.close()

    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
