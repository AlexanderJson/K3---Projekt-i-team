# <p align="center">Lianer — Project Planner</p>

<p align="center">
  <img src="docs/banner.png" alt="Lianer Banner" width="800">
</p>

<p align="center">
  <strong>A modern project planner built with Vanilla JavaScript for educational purposes.</strong>
</p>

---

##  Description

Lianer allows teams to collaborate effectively using a classic **SCRUM-board** structure. Users can add team members, assign tasks, and track real-time progress through an intuitive dashboard interface.

---

## Table of Contents

- [Description](#description)
- [Technologies](#technologies)
- [Features](#features)
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



---


##  Technologies

| Component | Technology | Badge |
| :--- | :--- | :--- |
| **Language** | JavaScript (ES6+) | ![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
| **Styling** | CSS | ![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white) |
| **Storage** | Local Storage | ![Local Storage](https://img.shields.io/badge/Local_Storage-000?style=for-the-badge&logo=browserstack&logoColor=white). |
| **Dev Ops** | GitHub Pages | ![GitHub](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white) |

---

##  Features

- **Responsive Navigation**
  - Featured on all pages with a mobile-friendly toggle.
  - Active page indicators to improve user orientation.
  - High-contrast accessibility (Black on White).

<p align="center">
  <img src="docs/menu.png" alt="Interface Preview" width="600">
</p>


- **Dashboard**
  - **Project overview:** Visual overview of current project health.
  - **Individual overview:** Individual progress bars for team members to identify bottlenecks. The statusbars also also informs the user about teammembers individual progress.

- **Task Board**
  - **Task Management:** View locked and unlocked tasks.
  - **Assignment:** Streamlined workflow allowing members to self-assign based on capacity.
  - **Communication:** Locking tasks requires a mandatory comment, ensuring follow-up is documented.



---

##  Testing & Quality Assurance

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

##  Deployment

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

##  Contributors

This project was developed by:

| [@alexanderjson](https://github.com/alexanderjson) | [@exikoz](https://github.com/exikoz) | [@JotsoChas](https://github.com/jotsochas) |
| :---: | :---: | :---: |

---

###  Repository Stats

![Last Commit](https://img.shields.io/github/last-commit/AlexanderJson/K3---Projekt-i-team?style=flat-square)
![Commits per Year](https://img.shields.io/github/commit-activity/y/AlexanderJson/K3---Projekt-i-team?style=flat-square)
![Contributors](https://img.shields.io/github/contributors/AlexanderJson/K3---Projekt-i-team?style=flat-square)
![Pull Requests](https://img.shields.io/github/issues-pr/AlexanderJson/K3---Projekt-i-team?style=flat-square)
