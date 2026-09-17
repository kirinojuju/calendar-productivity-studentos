# StudentOS

Minimal frontend foundation using React, Vite, Tailwind CSS, JavaScript, and React Router. Feature development is deferred until requirements and wireframes are finalized.

## Development

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. In Windows PowerShell, use `npm.cmd` instead of `npm` if script execution policy blocks `npm.ps1`.

```sh
npm run build
npm run preview
```

`build` outputs the production site to `dist/`. `preview` serves that build locally.

## Structure

```text
src/
  components/              Shared UI components (reserved)
  layouts/                 Shared page layouts (reserved)
  pages/PlaceholderPage.jsx
  routes/AppRoutes.jsx     Route definitions
  services/                Future external service integrations (reserved)
  hooks/                   Shared React hooks (reserved)
  utils/                   Shared utility functions (reserved)
  assets/                  Imported static assets (reserved)
  App.jsx                  Application entry component
  main.jsx                 React root and BrowserRouter
  index.css                Tailwind CSS import
```

Reserved folders contain only `.gitkeep` files so Git can retain them.

## Configuration

- `vite.config.js` enables React Fast Refresh and the Tailwind Vite plugin.
- Vite stays on version 7 with React plugin 5 because this machine's Windows application control blocks Vite 8's native Rolldown binding. The version 7 production build and development server work without changing system security settings.
- Tailwind uses `@import "tailwindcss";` and automatic source detection. This setup does not need a PostCSS or Tailwind JavaScript configuration file.
- React Router uses declarative `BrowserRouter` routing with a single `/` placeholder. Future routes belong in `src/routes/AppRoutes.jsx`.
- A future production host must serve `index.html` for application routes when using browser history routing.
- `package-lock.json` records resolved dependencies; use `npm ci` for reproducible installs.
- No feature modules, backend, service implementations, or additional UI libraries are included.

Next: finalize requirements and wireframes before adding page layouts or features.
