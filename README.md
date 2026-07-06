# CodeForge

A responsive coding-practice website for algorithms, SQL and DBMS learning.

## Features

- Live catalog of up to 4,000 problems from the [Alfa LeetCode API](https://github.com/alfaarghya/alfa-leetcode-api)
- Search, topic and difficulty filters with pagination
- Full problem detail drawer with safe HTML rendering
- Java, Python, JavaScript and SQL compiler workspaces powered by the documented [OneCompiler embed](https://onecompiler.com/apis)
- Algorithm, SQL and DBMS learning tracks
- Local solved-problem progress and theme preference
- Responsive, accessible layout with an offline fallback catalog

## Run locally

This is a static site. Serve the folder instead of opening the HTML file directly:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

The site can be deployed directly with GitHub Pages. No build step and no API secrets are required.

The problem catalog is provided by a community API and problem copyrights remain with their respective owner. The UI caches a normalized catalog for six hours and falls back to a small local set if the service is unavailable. Code execution occurs inside OneCompiler's embedded service.
