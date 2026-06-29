# Kartläggning av utvecklare.ai — vad är byggt, vad är placeholder?

*Utredning genomförd 2026-06-29. Ingen kod har ändrats — detta är endast en lägesrapport.*

---

## Så här ska du läsa det här

Sajten är en "skylt utåt" (det besökaren ser) som hämtar sitt innehåll från en
**databas** i bakgrunden (tjänsten heter Supabase — tänk på den som ett stort
kalkylark i molnet som sajten läser ur). Frågan "är det på riktigt eller
placeholder?" handlar nästan alltid om **vad som ligger i den databasen**:

- **Riktig data** = databasen fylls automatiskt eller med verkligt innehåll.
- **Placeholder / exempeldata** = någon har lagt in påhittade exempel för att
  sidan inte ska se tom ut, men det är inte verklig information.

Jag har tittat direkt i den live-databasen för att se exakt hur mycket som
finns i varje del. Siffrorna nedan är alltså verkligheten just nu, inte gissningar.

---

## 1. Översikt — alla sju sektioner

| Sektion | Vad den visar | På riktigt? | Hur mycket finns | Arbete kvar |
|---|---|---|---|---|
| **Jobb** | AI-/utvecklarjobb | ✅ **Ja — live & automatisk** | **558 aktiva jobb**, uppdaterades automatiskt idag 06:01 | **Medel** (kvalitetsfilter behöver fixas) |
| **Kunskapshubb** | Artiklar/guider | ✅ Ja — riktigt innehåll | **22 publicerade artiklar**, välskrivna på svenska | Liten (mer innehåll över tid) |
| **Verktyg** | AI-verktyg & recensioner | ✅ Ja — riktig data | **24 verktyg** i databasen | Liten–medel (ganska få verktyg) |
| **Lönestatistik** | Löner per roll/stad | ⚠️ **Delvis** — siffror visas, men de är **uppskattningar, inte en riktig enkät** | 92 rader lönedata, **0 riktiga inskick** | Liten (om man ärligt märker upp det) / Stor (om man vill ha riktig enkätdata) |
| **Community** | Forum/diskussioner | ⚠️ **Exempeldata** | 15 påhittade inlägg, **0 riktiga användare** | Stor |
| **Events** | AI-event/konferenser | ❌ **Placeholder** | 12 påhittade event, flera **redan passerade**, fejkade deltagarsiffror | Stor |
| **Företag** | Företagsprofiler | ❌ **Helt tom** | **0 företag** i databasen | Stor |

**Kort sagt:** De tre sektioner du vill satsa på (Jobb, Verktyg, Lönestatistik)
är också de tre som har mest verklig substans. De fyra du vill pausa (Community,
Events, Företag — plus i praktiken den "sociala" delen) är till stor del tomma
eller fyllda med exempel. Du prioriterar alltså rätt saker.

---

## 2. Jobb-sektionen i detalj (viktigast)

### Hämtas riktiga jobb från ett externt API?
**Ja.** Din magkänsla stämde: sajten hämtar jobb från **JobTech / Arbetsförmedlingens
officiella jobb-API** (det heter "jobsearch.api.jobtechdev.se"). Det är gratis
och officiellt — exakt rätt källa för svenska jobb.

### Fungerar integrationen just nu?
**Ja, den är levande och självgående.** Konkret:

- Det finns ett schemalagt jobb som körs **varje morgon kl. 06:00** och hämtar
  färska annonser. Jag kunde se i databasen att den **kördes idag (2026-06-29)
  kl. 06:01** — den är alltså i drift, inte avstängd.
- Just nu ligger det **558 aktiva jobb** inne, med riktiga företag, orter,
  ansökningslänkar och beskrivningar.
- Gamla annonser städas bort automatiskt (annonser som inte synts på 7 dagar
  tas bort ur listan), så listan hålls aktuell utan att du gör något.

Det här är sajtens starkaste och mest värdefulla del: den **sköter sig själv**
och innehåller verklig, färsk information.

### Finns filtrering så bara relevanta jobb visas? — Här är problemet
Det finns filter för besökaren (roll, stad, erfarenhet, distans/på plats), och
de fungerar. Men det finns ett **kvalitetsproblem i vad som plockas in från
början**, och det är värt att förstå:

Systemet söker hos JobTech på ord som "AI utvecklare", "machine learning",
"data scientist" osv. Problemet är att JobTech-sökningen matchar **brett** — den
fastnar t.ex. på ordet "engineer" och drar in massor av jobb som inte alls
handlar om AI. När jag tittade på de senaste annonserna såg jag bland annat:

- "Mechanical Site Engineer" (mekanik — inte AI)
- "Electrical Engineer" (el — inte AI)
- "SAP S/4 HANA ABAP Developer" (affärssystem — inte AI)
- "Tech Customer Support Administrator" (support — inte AI)
- "Senior Frontendutvecklare Angular" (webb — inte AI)

Dessutom: när systemet **inte** kan lista ut vad ett jobb är, sätter det
automatiskt etiketten **"AI-utvecklare"** på det. Så dessa icke-AI-jobb syns
dessutom felmärkta som AI-jobb. Av de 558 jobben är alltså en **betydande andel
inte riktiga AI-jobb** — de har bara råkat matcha en sökterm.

**Slutsats för Jobb:** Tekniken fungerar perfekt och datan är färsk. Det som
saknas för att sektionen ska kännas trovärdig är ett **relevansfilter** som
slänger bort jobb som uppenbart inte handlar om AI/ML/data, och en bättre
auto-märkning. Det är en **medelstor** insats — och den enskilt mest värdefulla
förbättringen på hela sajten (se sammanfattningen).

---

## 3. De tre prioriterade sektionerna — hur nära färdiga?

### Jobb — närmast färdig
- **Klar-grad:** ~80 %. Publicerbar redan idag rent funktionellt.
- **Saknas:** relevansfiltret ovan (rensa bort icke-AI-jobb + bättre märkning).
  Funktioner som "bevaka sökning" (mejla nya jobb) samlar e-post men har 0
  prenumeranter ännu — fungerar tekniskt men oanvänt.
- **Insats:** Medel.

### Verktyg — nästan klar men tunn
- **Klar-grad:** ~75 %. Funktionen fungerar (sök, kategorier, jämförelse,
  "Editor's Choice"), och de 24 verktygen är riktig data.
- **Saknas:** Främst **mer innehåll** — 24 verktyg är i tunnaste laget för att
  kännas som en komplett katalog. Värt att snabbkolla att verktygens detalj- och
  jämförelsesidor ser bra ut.
- **Insats:** Liten–medel (mest att fylla på fler verktyg).

### Lönestatistik — ser klar ut, men en ärlighetsfråga
- **Klar-grad:** ~70 % visuellt. Diagram, jämförelser och filter fungerar och
  ser proffsiga ut.
- **Saknas / varning:** Lönesiffrorna är **uppskattningar som lagts in i
  förväg** — inte resultat av en verklig enkät. Det finns ett formulär där
  besökare kan lämna sin lön, men det har **0 inskick** hittills. Ändå visar
  sidan "antal rapporter" (t.ex. *n=67*) som om siffrorna kom från riktiga
  svaranden. Det kan upplevas som vilseledande om någon granskar det.
  - **Snabb lösning (liten insats):** Märk om sidan ärligt som "uppskattad
    lönedata baserad på marknadsdata", ta bort de fejkade svarsantalen.
  - **Riktig lösning (stor insats):** Samla in verkliga löneuppgifter tills det
    finns underlag.
- **Insats:** Liten (ärlig ommärkning) eller stor (riktig data).

### Vilken är lättast att få färdig först?
Rent "knapptryck-klar": **Lönestatistik** (en liten ommärkning och den är
publicerbar utan trovärdighetsrisk). Men störst **värde** ligger i Jobb (se nedan).

---

## Sammanfattning i klarspråk

**Övergripande läge:** Grunden är gediget byggd och de tre delar du vill satsa på
(Jobb, Verktyg, Lönestatistik) har verkligt innehåll och fungerar — medan de fyra
du vill pausa (Community, Events, Företag m.fl.) mest är tomma eller fyllda med
exempeldata. Du prioriterar alltså helt rätt.

**Om du bara orkar göra EN sak härnäst:** Lägg den på **Jobb-sektionens
relevansfilter.** Det är sajtens enda del som uppdaterar sig själv varje dag med
färsk, verklig data — alltså den som ger mest värde med minst löpande arbete. Men
just nu späds den ut av en massa jobb som inte handlar om AI (mekanik-, el-,
support-jobb osv. som felaktigt märks "AI-utvecklare"). Att rensa bort dem gör att
sektionen direkt känns trovärdig och unik — och därefter sköter den sig i princip
själv. Det är den bästa kombinationen av "stor effekt" och "rimlig insats" på hela
sajten.

---

### Bilaga: tekniska detaljer (för utvecklaren du ev. tar in)
- Stack: Next.js 16, React 19, Supabase (databas + inloggning), Tailwind.
- Jobbsynk: `lib/jobtech/sync-jobs.ts` + `app/api/jobs/sync/route.ts`,
  schemalagd i `vercel.json` (kl 06:00 dagligen). Relevansfiltret bör läggas till
  i `mapHitToJob` / efter `fetchJobtechPage` (idag finns ingen efterkontroll av
  AI-relevans, och `categorizeJob` defaultar till "AI-utvecklare").
- Live-databasens innehåll vid kartläggningen: jobs 558 aktiva · tools 24 ·
  articles 22 · salary_data 92 · events 12 · forum_posts 15 · companies 0 ·
  profiles/job_alerts/salary_submissions/newsletter_subscribers 0.
