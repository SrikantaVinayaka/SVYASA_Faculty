# S-VYASA Faculty Dashboard

React + Vite + Tailwind CSS v4

---

## Steps to run in VS Code

### 1. Extract the zip
Unzip `svyasa-dashboard.zip` anywhere on your machine.

### 2. Open in VS Code
File → Open Folder → select the `svyasa` folder.

### 3. Open the terminal
Press  Ctrl + `  (backtick) to open the integrated terminal.

### 4. Install dependencies
```
npm install
```
This downloads React, Tailwind, and all packages into node_modules.
Takes about 30–60 seconds on first run.

### 5. Start the dev server
```
npm run dev
```

### 6. Open in browser
Visit:  http://localhost:5173

---

## Project structure

```
svyasa/
├── index.html              Root HTML entry
├── package.json            Dependencies & scripts
├── vite.config.js          Vite + Tailwind v4 plugin
└── src/
    ├── main.jsx            React entry point
    ├── App.jsx             Root layout (Sidebar + Topbar + Dashboard)
    ├── index.css           Tailwind v4 imports + @theme config + Google Fonts
    └── components/
        ├── Sidebar.jsx     Left nav with dropdowns & profile footer
        ├── Topbar.jsx      Top bar with search, notifications & avatar
        └── Dashboard.jsx   Welcome banner, stats, quick access, panels
```

---

## Notes

- No `tailwind.config.js` needed — Tailwind v4 is configured via `@theme {}` inside `index.css`
- No `postcss.config.js` needed — handled by `@tailwindcss/vite` plugin
- Fonts load from Google Fonts CDN (requires internet on first load)
- The greeting (Good Morning / Afternoon / Evening / Night) updates automatically based on your system time
