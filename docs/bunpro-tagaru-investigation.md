# Investigation: たがる fehlt im Study-Data-Endpunkt

## Ziel
Klären, warum das kürzlich („die Tage") gelernte Grammatik-Item **たがる** nicht
im API-Endpunkt der App auftaucht.

## Blocker in der aktuellen Umgebung
- `api.bunpro.jp` ist **nicht** in der Allowlist des Agent-Proxys → CONNECT-Tunnel
  wird mit `403` abgelehnt (Policy-Denial), *bevor* HTTP-Header gesendet werden.
- User-Agent faken hilft **nicht** (der Block passiert auf CONNECT-Ebene).
- Live-Abfrage der Bunpro-API war daher hier unmöglich.

## Was in der freieren Umgebung zu tun ist
1. Roh-JSON von Bunpro holen (eingeloggt / erlaubtes Netz):
   ```
   https://api.bunpro.jp/api/frontend/share_data/eXaminator/learned_content
   ```
2. Prüfen, ob たがる enthalten ist und mit welchen Attributen. Interessant:
   - `reviewable.data.attributes.type_snake`  (muss `grammar_point` sein)
   - `reviewable.data.attributes.title` / `meaning`
   - `data.attributes.streak` / `reviewable_type`
   - Gesamtzahl der Items; Verteilung `grammar_point` vs `vocab`.

## Relevanter Code (Repo)
- **Endpunkt:** `app/routes/api.study-data.ts`
  - Aggregiert Wanikani (`getSubjects`) + Bunpro (`getBunproData`) parallel.
  - `?forceReload=true` umgeht den Cache.
- **Bunpro-Logik:** `app/lib/bunpro.server.ts`
  - Fetch der o. g. URL, **keine** Level-/Streak-Filterung, **keine** Pagination,
    **keine** Deduplizierung.
  - Einziger Filter:
    ```ts
    if (type_snake !== 'grammar_point') continue;
    ```
  - Gibt nur `{ title, meaning }` zurück.
- **Cache:** `app/lib/cache.server.ts`
  - In-Memory `Map`, TTL = **1 Stunde**, lazy expiration, pro Prozess.

## Hypothesen (nach Wahrscheinlichkeit)
1. **Bunpros `learned_content` listet たがる noch nicht** — Export enthält i. d. R.
   nur ausreichend hoch-SRS-te Items. Frisch gelernt → evtl. noch nicht drin.
   (Bunpro-seitig, kein App-Bug.)
2. **`type_snake` weicht ab** → wird von der `continue`-Zeile herausgefiltert.
3. **Ausgeschlossen:** 1h-Cache (läuft längst ab); über Tage irrelevant.
   Trotzdem zur Sicherheit mit `?forceReload=true` testen.

## Nächste Schritte je nach Befund
- Item **fehlt im Roh-JSON** → Bunpro-Ursache (Hypothese 1); nichts im Code zu fixen,
  ggf. abwarten bis SRS-Schwelle erreicht.
- Item **ist im Roh-JSON, aber `type_snake` ≠ `grammar_point`** → Filter in
  `bunpro.server.ts` anpassen (weitere Typen zulassen / Logik korrigieren).
- Unklar → temporäres Debug-Logging in `getBunproData` einbauen (Item-Count, alle
  `type_snake`-Werte, jeden Titel mit „たがる").

## Nebenbefund (erledigt)
- GitHub-Actions-Workflow `.github/workflows/docker-build.yml` hinzugefügt
  (Build + Push nach GHCR), Branch `claude/github-actions-image-build-9jzgdb`.
