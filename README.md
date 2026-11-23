
# Moviefy

Moviefy ist ein Film-Tracker, der mit Next.js, React und TypeScript entwickelt wurde. Die Anwendung bietet eine Benutzerregistrierung und Anmeldung über Supabase, eine Filmsuche über die TMDB-API sowie ein Kanban-Board zur Verwaltung und Organisation von Filmen.

## 1. Voraussetzungen

Für die Nutzung des Projekts werden folgende Dinge benötigt:

- Node.js Version 20.9 oder neuer
- npm
- Ein eigenes Supabase-Konto und ein Supabase-Projekt
- Ein TMDB-Konto und ein persönlicher API-Schlüssel

**Wichtig:** Jeder Benutzer muss ein eigenes Benutzerkonto in Moviefy erstellen, um die Anwendung nutzen zu können. Dafür ist eine Registrierung mit einer gültigen E-Mail-Adresse und einem persönlichen Passwort erforderlich.

## 2. Projekt installieren

Öffne das Terminal im Projektordner und führe folgenden Befehl aus:

```bash
npm install
```

## 3. Supabase-Konto und Projekt erstellen

Für die Anmeldung und Speicherung der Filmdaten wird Supabase verwendet.

1. Öffne https://supabase.com/
2. Erstelle ein kostenloses Konto oder melde dich an.
3. Erstelle ein neues Supabase-Projekt.
4. Öffne dein Projekt und gehe zu **Project Settings → API Keys**.
5. Kopiere die Project URL und den anon-/Publishable-Key.

Diese Daten werden später in der Datei `.env.local` benötigt.

## 4. TMDB-Konto und API-Schlüssel erstellen

Für die Filmsuche wird die TMDB-API verwendet.

1. Öffne https://www.themoviedb.org/
2. Erstelle ein Konto oder melde dich an.
3. Gehe zu deinen Kontoeinstellungen und öffne den Bereich **API**.
4. Beantrage einen API-Schlüssel.
5. Kopiere deinen persönlichen API-Schlüssel.

## 5. Umgebungsvariablen konfigurieren

Kopiere die Datei `.env.example` und erstelle daraus eine Datei mit dem Namen `.env.local`.

```bash
cp .env.example .env.local
```

Trage anschließend deine persönlichen Zugangsdaten ein:

```env
NEXT_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=DEIN_SUPABASE_KEY
NEXT_PUBLIC_TMDB_API_KEY=DEIN_TMDB_API_KEY
```

Ersetze die Beispielwerte durch deine echten Zugangsdaten.

**Sicherheitshinweis:** Verwende niemals den Supabase-Service-Role-Key oder einen Secret-Key im Browser. Diese Schlüssel dürfen nicht in `.env.local` für öffentliche Client-Variablen eingetragen werden.

## 6. Datenbank einrichten

Damit Moviefy Filme speichern kann, muss die Datenbank eingerichtet werden.

1. Öffne dein Supabase-Projekt.
2. Gehe zum **SQL Editor**.
3. Öffne die Datei `supabase-schema.sql` aus diesem Projekt.
4. Kopiere den gesamten SQL-Code.
5. Füge ihn in den SQL Editor ein und führe ihn aus.

Die Datenbank verwendet Row Level Security (RLS). Dadurch kann jeder angemeldete Benutzer nur auf seine eigenen Filmdaten zugreifen.

## 7. Anwendung starten

Starte den Entwicklungsserver mit:

```bash
npm run dev
```

Öffne anschließend im Browser:

http://localhost:3000

## 8. Benutzerkonto erstellen und anmelden

Jeder Benutzer muss sich zunächst registrieren:

1. Öffne Moviefy im Browser.
2. Klicke auf **Create Account**.
3. Gib deine E-Mail-Adresse und ein persönliches Passwort ein.
4. Schließe die Registrierung ab.
5. Falls die E-Mail-Bestätigung in Supabase aktiviert ist, bestätige deine E-Mail-Adresse über den zugesendeten Link.
6. Melde dich anschließend mit deinen Zugangsdaten an.

Jeder Benutzer verwendet sein eigenes Konto. Es gibt keine gemeinsamen Standard-Zugangsdaten.

## 9. Projekt überprüfen

Mit diesen Befehlen kannst du das Projekt überprüfen:

```bash
npm run typecheck
npm run build
```

## 10. Wichtige Hinweise

- Die Datei `.env.local` darf nicht veröffentlicht oder in Git hochgeladen werden.
- Jeder Benutzer benötigt ein eigenes Moviefy-Konto.
- Für die Anwendung muss ein eigenes Supabase-Projekt eingerichtet werden.
- Für die Filmsuche wird ein gültiger TMDB-API-Schlüssel benötigt.
- Der TMDB-Schlüssel wird durch das Präfix `NEXT_PUBLIC_` im Browser sichtbar. Für eine produktive Anwendung sollte die TMDB-Anfrage über eine serverseitige Route laufen, wenn der Schlüssel geheim bleiben soll.

---

**Viel Spaß mit Moviefy!**
