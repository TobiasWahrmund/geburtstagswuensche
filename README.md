# Tobis Geburtstagswünsche 🎁

Eine kleine, elegante Wunschliste für GitHub Pages mit anonymen Geschenk-Reservierungen.

## Was ist enthalten?

- responsive Website für Handy/Desktop
- Wunschkarten mit Bild, Beschreibung, Preis und Shop-Link
- anonyme Reservierung
- alle sehen, ob ein Geschenk bereits übernommen wurde
- keine Namen, E-Mail-Adressen oder Accounts der Gäste
- Wunschliste lässt sich später einfach in `gifts.js` bearbeiten
- GitHub Pages als kostenloses Hosting
- Supabase als kleines Backend für die Reservierungen

---

# 1. Supabase einrichten

1. Gehe zu https://supabase.com/ und erstelle ein kostenloses Projekt.
2. Öffne im Projekt den **SQL Editor**.
3. Öffne die Datei `setup.sql` aus diesem Projekt.
4. Kopiere den gesamten Inhalt in den SQL Editor.
5. Führe das SQL aus.

Damit wird eine Tabelle für die Reservierungen und eine sichere Funktion zum atomaren Reservieren angelegt.

## Supabase-Zugangsdaten

Im Supabase Dashboard findest du unter:

**Project Settings → API**

- Project URL
- Publishable key / anon key

Kopiere `config.example.js` nach `config.js` und trage die beiden Werte ein:

```js
window.APP_CONFIG = {
  supabaseUrl: "https://DEIN-PROJEKT.supabase.co",
  supabaseAnonKey: "DEIN-PUBLISHABLE-KEY"
};
```

Wichtig: Der Publishable/anon Key darf in einer öffentlichen Website stehen. Die Datenbank wird durch die RLS-Regeln und die Funktion geschützt.

---

# 2. Wünsche bearbeiten

Die komplette Wunschliste befindet sich in:

`gifts.js`

Beispiel:

```js
{
  id: "neuer-wunsch",
  title: "Mein neuer Wunsch",
  description: "Darüber würde ich mich besonders freuen.",
  price: "ca. 50 €",
  url: "https://shop.example/produkt",
  image: "https://example.com/bild.jpg"
}
```

## Felder

- `id`: eindeutige ID, niemals für zwei Wünsche verwenden
- `title`: Name des Geschenks
- `description`: deine persönliche Anmerkung
- `price`: optional
- `url`: optionaler Link zum Shop
- `image`: optionales Bild

Wenn du kein Bild hast, wird automatisch ein elegantes ✦ angezeigt.

---

# 3. GitHub Repository erstellen

1. Erstelle auf GitHub ein neues Repository, z. B. `geburtstagswuensche`.
2. Lade alle Dateien dieses Projekts hoch.
3. **Wichtig:** `config.js` muss ebenfalls hochgeladen werden, nachdem du dort deine Supabase-Daten eingetragen hast.

---

# 4. GitHub Pages aktivieren

Im GitHub Repository:

**Settings → Pages**

Bei **Build and deployment**:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

Speichern.

Nach kurzer Zeit ist die Seite unter einer Adresse wie

`https://DEINUSERNAME.github.io/geburtstagswuensche/`

erreichbar.

---

# 5. Wie funktioniert die Anonymität?

Die Gäste müssen:

- keinen Namen angeben
- keine E-Mail-Adresse angeben
- keinen GitHub-Account haben
- keinen Supabase-Account haben

Beim Klick auf „Das schenke ich dir“ wird ausschließlich die ID des Geschenks gespeichert.

Beispiel:

```text
mastering-french-cooking
```

und der Zeitpunkt.

Die Seite zeigt anschließend nur:

**✓ Bereits von jemandem übernommen**

Sie zeigt nicht, wer das Geschenk reserviert hat.

## Gleichzeitigkeits-Schutz

Die Datenbank verwendet die Geschenk-ID als eindeutigen Schlüssel. Wenn zwei Personen nahezu gleichzeitig dasselbe Geschenk auswählen, kann nur eine Reservierung erfolgreich sein.

---

# 6. Einen Wunsch wieder freigeben

Da die Reservierung anonym ist, gibt es bewusst keinen öffentlichen „Stornieren“-Button.

Falls du einmal eine Reservierung zurücksetzen möchtest:

Supabase → **Table Editor → gift_reservations**

Dort kannst du die entsprechende Zeile löschen.

---

# Hinweis zum Datenschutz

Für die eigentliche Reservierung werden keine personenbezogenen Daten gespeichert. Die Website selbst verwendet keine Login-Funktion.

Supabase kann als externer Dienst natürlich eigene technische Logs/Metadaten führen. Für eine private Geburtstags-Wunschliste ist die oben beschriebene Anwendung aber bewusst auf minimale gespeicherte Daten ausgelegt.
