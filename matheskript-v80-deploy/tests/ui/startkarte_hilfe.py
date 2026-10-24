"""Hilfe für Browser-Tests seit der Start-Karte (21.10.): Der Quickfinder steckt in der Schublade
„Alles zu deiner Klasse“, die erst erscheint, wenn die Klasse in der Start-Karte gewählt ist.
schublade_auf(page) wählt bei Bedarf Schulsystem und Klasse in der Start-Karte, klappt die Schublade auf
und öffnet (auswahl=True) die Klassenauswahl des Quickfinders – so wie früher die frische Kachel."""

def schublade_auf(page, schulart="g9", klasse="9", auswahl=True):
    if page.locator("[data-startkarte='wahl']").count():
        page.locator(f"[data-sk-schulart='{schulart}']").first.click()
        page.locator(f"[data-sk-klasse='{klasse}']").first.click()
        page.wait_for_timeout(600)
    knopf = page.get_by_role("button", name="Alles zu deiner Klasse aufklappen")
    if knopf.count():
        knopf.first.scroll_into_view_if_needed()
        knopf.first.click()
        page.wait_for_timeout(400)
    if auswahl:
        chip = page.locator(".qf-kopf button[aria-label$='– ändern']")
        if chip.count():
            chip.first.click()
            page.wait_for_timeout(200)
