# <p align="center">Lianer - Project Planner</p>

<p align="center">
  <img src="docs/images/demo/Slide1.jpg" alt="Lianer Hero" width="800">
</p>

<p align="center">
  <strong>A modern project planner built with Vanilla JavaScript for educational purposes.</strong>
</p>

---

https://alexanderjson.github.io/K3---Projekt-i-team/

## Description

Lianer allows teams to collaborate effectively using a classic **SCRUM-board** structure. Users can add team members, assign tasks, and track real-time progress through an intuitive dashboard interface.

---

## Table of Contents

- [Description](#description)
- [Technologies](#technologies)
- [Features](#features)
- [Installation & Usage](#installation--usage)
- [Testing & Quality Assurance](#testing--quality-assurance)
  - [Running Tests](#running-tests)
  - [Continuous Integration](#continuous-integration)
- [Deployment](#deployment)
- [Bugs](#bugs)
  - [Unsolved Bugs](#unsolved-bugs)
- [Content](#content)
- [Typography](#typography)
- [Contributors](#contributors)
- [Repository Stats](#repository-stats)
- [Demo & Gallery](#demo--gallery)

---

## Technologies

| Component    | Technology        | Badge                                                                                                                   |
| :----------- | :---------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Language** | JavaScript (ES6+) | ![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)               |
| **Styling**  | CSS               | ![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)                           |
| **Storage**  | Local Storage     | ![Local Storage](https://img.shields.io/badge/Local_Storage-000?style=for-the-badge&logo=browserstack&logoColor=white). |
| **Dev Ops**  | GitHub Pages      | ![GitHub](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)             |

---

## Features

- **Responsive Navigation**
  - Featured on all pages with a mobile-friendly toggle.
  - Active page indicators to improve user orientation.
  - High-contrast accessibility (Black on White).

<p align="center">
  <img src="docs/images/demo/Slide2.jpg" alt="Interface Preview" width="800">
</p>

- **Dashboard**
  - **Project overview:** Visual overview of current project health.
  - **Individual overview:** Individual progress bars for team members to identify bottlenecks. The statusbars also also informs the user about teammembers individual progress.

- **Task Board**
  - **Task Management:** View locked and unlocked tasks.
  - **Assignment:** Streamlined workflow allowing members to self-assign based on capacity.
  - **Communication:** Locking tasks requires a mandatory comment, ensuring follow-up is documented.

---

## Installation & Usage

För att köra detta projekt lokalt på din maskin, följ dessa steg:

### Förutsättningar

Eftersom detta är en helt klientbaserad applikation krävs ingen specifik backend-server, men det underlättar att ha en lokal utvecklingsserver för att Serve:a filerna korrekt (speciellt för PWA/Service Workers och `manifest.webmanifest`).

- [Node.js](https://nodejs.org/en/) & npm (för att kunna installera beroenden samt köra tester).

### Steg för steg

1. **Klona repot**
   Klipp in detta i din terminal för att ladda ner koden:
   ```bash
   git clone https://github.com/AlexanderJson/K3---Projekt-i-team.git
   ```
2. **Navigera in i mappen**
   ```bash
   cd K3---Projekt-i-team
   ```
3. **Installera NPM-paket**
   Detta steg krävs främst för testning (Jest):
   ```bash
   npm install
   ```
4. **Kör projektet lokalt**
   Du kan öppna `index.html` direkt i webbläsaren, ELLER köra den via en lokal server (rekommenderas).
   Om du exempelvis använder VS Code kan du starta **Live Server**.
   Alternativt, använd `npx serve`:
   ```bash
   npx serve .
   ```
   Öppna sedan din webbläsare och gå till `http://localhost:3000` (eller den port din server anger).

---

## Testing & Quality Assurance

- **Browsers:** Verified compatibility in Google Chrome, Mozilla Firefox, and Safari.
- **Responsiveness:** Validated using Chrome DevTools device simulation for mobile, tablet, and desktop.
- **Code Standards:** - **HTML:** Passed W3C Validator.
  - **CSS:** Passed Jigsaw Validator.
  - **Performance:** Audited via Lighthouse for SEO and accessibility.
  - **Unit tests:** Code is tested with Jest

### Running Tests

To verify the project integrity, run the following command:

```bash
npm test
```

### Continuous Integration

We use **GitHub Actions** to automate our testing pipeline. On every `push` and `pull_request` to the `main` branch:

1.  The environment is initialized.
2.  Dependencies are installed via `npm install`.
3.  **Jest** runs the full unit test suite.

**Note:** Merging is blocked if the CI pipeline fails, ensuring the production build remains stable.

---

## Deployment

The project is live and hosted via GitHub Pages.
**[Visit the Live Site](https://alexanderjson.github.io/K3---Projekt-i-team/)**

---

## Bugs

### Unsolved Bugs

## Content

- The icons in the footer were taken from [Google Fonts](https://fonts.google.com)

## Typography

- The fonts were taken from [Google Fonts](https://fonts.google.com/)

---

## Contributors

This project was developed by:

| [<h3>@alexanderjson</h3>](https://github.com/alexanderjson) | [<h3>@exikoz</h3>](https://github.com/exikoz) | [<h3>@JocoBorghol</h3>](https://github.com/JocoBorghol) |
| :---------------------------------------------------------: | :-------------------------------------------: | :-----------------------------------------------------: |

---

### Repository Stats

![Last Commit](https://img.shields.io/github/last-commit/AlexanderJson/K3---Projekt-i-team?style=flat-square)
![Commits per Year](https://img.shields.io/github/commit-activity/y/AlexanderJson/K3---Projekt-i-team?style=flat-square)
![Contributors](https://img.shields.io/github/contributors/AlexanderJson/K3---Projekt-i-team?style=flat-square)
![Pull Requests](https://img.shields.io/github/issues-pr/AlexanderJson/K3---Projekt-i-team?style=flat-square)

---

## Demo & Gallery

Här följer en visuell genomgång av applikationen, dess gränssnitt och funktioner.

### Pitch & Slide

<p align="center">
  <img src="docs/images/demo/Slide3.jpg" alt="PWA & Offline" width="800">
  <br><em>PWA & Offline-first funktionalitet</em>
</p>
<p align="center">
  <img src="docs/images/demo/Slide4.jpg" alt="Kalender" width="800">
  <br><em>Kalender med Veckonummer & .ics export</em>
</p>
<p align="center">
  <img src="docs/images/demo/Slide5.jpg" alt="CRM" width="800">
  <br><em>Integrerat CRM med QR-generering</em>
</p>
<p align="center">
  <img src="docs/images/demo/Slide6.jpg" alt="Taskboard" width="800">
  <br><em>Avancerad Uppgiftshantering (Kanban)</em>
</p>
<p align="center">
  <img src="docs/images/demo/Slide7.jpg" alt="Scrum" width="800">
  <br><em>Agila Verktyg & SCRUM-stöd</em>
</p>
<p align="center">
  <img src="docs/images/demo/Slide8.jpg" alt="WCAG" width="800">
  <br><em>WCAG 2.1 AA Tillgänglighetsstandard</em>
</p>
<p align="center">
  <img src="docs/images/demo/Slide9.jpg" alt="Arkitektur" width="800">
  <br><em>Arkitektur, Demolägen och Datasäkerhet</em>
</p>

### Screenshots från Applikationen

**Dashboard:**

<p align="center">
  <img src="docs/images/screenshots/dashboard desk.png" alt="Dashboard Desktop" width="800">
</p>
<p align="center">
  <img src="docs/images/screenshots/dashboard + hidden menu mobille.png" alt="Dashboard Mobile" width="300">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/images/screenshots/lightmode mobile.png" alt="Lightmode Mobile" width="300">
</p>

**Taskboard / Uppgiftshantering:**

<p align="center">
  <img src="docs/images/screenshots/taskboard team desk.png" alt="Taskboard Desktop" width="800">
</p>
<p align="center">
  <img src="docs/images/screenshots/taskboard lediga tasks desk.png" alt="Lediga Uppgifter Desktop" width="800">
</p>
<p align="center">
  <img src="docs/images/screenshots/taskboard team mobile.png" alt="Taskboard Mobile" width="300">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/images/screenshots/add task mobile.png" alt="Add Task Mobile" width="300">
</p>

**CRM & Planering:**

<p align="center">
  <img src="docs/images/screenshots/contactCRM desk.png" alt="CRM Desktop" width="800">
</p>
<p align="center">
  <img src="docs/images/screenshots/cal desk.png" alt="Calendar Desktop" width="800">
</p>

---
