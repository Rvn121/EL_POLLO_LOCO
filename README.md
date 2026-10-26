# El Pollo Loco

**El Pollo Loco** ist ein 2D-Jump-and-Run-Spiel, das im Rahmen meiner Weiterbildung bei der **Developer Akademie** entstanden ist. Das Spiel wurde mit HTML, CSS und JavaScript entwickelt und nutzt das HTML-Canvas für die Spielwelt.

## Spiel starten

1. Das Projekt in Visual Studio Code öffnen.
2. Die Datei `index.html` mit einem lokalen Entwicklungsserver, z. B. **Live Server**, starten.
3. Im Hauptmenü auf **Start** klicken.
4. Über die Bildauswahl das **Tutorial** oder das reguläre Level auswählen.

Die aktuelle Projektfassung enthält zwei technisch umgesetzte Spielabschnitte: **Tutorial (intern Level 1)** und **Level 1 (intern Level 2)**. Die interne Nummerierung im JavaScript unterscheidet sich also von den Bezeichnungen im Menü.

## Steuerung

| Taste | Funktion |
| --- | --- |
| Pfeiltaste links | Nach links laufen |
| Pfeiltaste rechts | Nach rechts laufen |
| Pfeiltaste oben | Springen |
| Leertaste gedrückt halten und loslassen | Flaschenwurf aufladen und werfen |
| P | Spiel pausieren oder fortsetzen |
| Esc | Zum Hauptmenü zurückkehren |

Auf Mobilgeräten kann das Spiel im Querformat über die Touchsteuerung bedient werden. Die Schaltfläche **Controls** zeigt die Steuerung an.

## Spielziel und Spielprinzip

- Laufe durch die Spielwelt und besiege die kleinen und normalen Hühner.
- **Erst wenn alle Hühner des Levels besiegt sind, wird der Endboss freigeschaltet.** Das Einsammeln von Coins allein schaltet ihn nicht frei.
- Springe von oben auf Hühner, um sie zu besiegen.
- Sammle Coins, um deine Lebensenergie aufzufüllen.
- Sammle Salsa-Flaschen und wirf sie auf Gegner und Bosse.
- Besiege den Endboss, um den Spielabschnitt abzuschließen.

## Spielabschnitte

### Tutorial

Das Tutorial führt in die Steuerung, das Springen, Einsammeln von Gegenständen und das Bekämpfen von Gegnern ein. Auch hier erscheint der Endboss erst, wenn alle Hühner besiegt wurden.

### Level 1

Der reguläre Spielabschnitt enthält mehr Gegner sowie Minibosse. Der große Endboss wird erst freigeschaltet, wenn sämtliche Hühner besiegt wurden. Gegner, Bosse und ihre Angriffe machen das Level anspruchsvoller.

## Funktionen

- Animierte Spielfigur mit Lauf-, Sprung-, Idle-, Hurt- und Todesanimation
- Kleine und normale Hühner sowie Mini- und Endbosse
- Münzen und werfbare Salsa-Flaschen
- Lebens-, Coin-, Flaschen- und Boss-Statusleisten
- Musik und Soundeffekte mit Stummschaltung
- Pause und Fullscreen
- Startmenü, Levelauswahl, Sieg-, Game-Over- und Restart-Funktion
- Mobile Touchsteuerung im Querformat

## Projektstruktur

| Datei / Ordner | Inhalt |
| --- | --- |
| `index.html` | Hauptseite und Bedienelemente |
| `style.css` | Design und responsives Layout |
| `models/` | JavaScript-Klassen für Figuren, Objekte und Spielwelt |
| `level.js/` | Aufbau der Spielabschnitte |
| `js/` | Start, Spiellogik, Audio und Bedienung |
| `img/` | Spielgrafiken und Animationen |
| `audio/` | Musik und Soundeffekte |
| `fonts/` | Lokal eingebundene Schriftarten |
| `impressum.html` | Impressum |

## Technische Umsetzung

Das Spiel verwendet HTML5, CSS3 und JavaScript mit objektorientierter Programmierung (`class`, `extends`, `super`). Es ist kein zusätzlicher Build-Schritt notwendig. Browser können die automatische Musikwiedergabe vor der ersten Interaktion blockieren.

## Hintergrund und Rechte

Dieses Spiel entstand als Lernprojekt im Rahmen der Weiterbildung bei der **Developer Akademie**. Die bereitgestellten Spielgrafiken und Lernmaterialien stammen aus dem Ausbildungskontext. Die jeweiligen Rechte und Nutzungsbedingungen der Grafiken, Sounds und Schriftarten sind zu beachten.

## Entwicklungsstand

Das Projekt befindet sich in Weiterentwicklung. Insbesondere Animationen, Kollisionen, Soundsteuerung und mobile Bedienung sollten vor der Abgabe vollständig im Browser getestet werden.
