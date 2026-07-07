# CodeForge

A responsive coding-practice website for algorithms, SQL and DBMS learning.

## Features

- Live catalog of up to 4,000 problems from the [Alfa LeetCode API](https://github.com/alfaarghya/alfa-leetcode-api)
- Search, topic and difficulty filters with pagination
- Full problem detail drawer with safe HTML rendering
- Instant split problem/editor workspace with Java 17, Python 3.13, Node.js 22 and SQLite execution powered by [Judge0 CE](https://github.com/judge0/judge0)
- Algorithm, SQL and DBMS learning tracks
- Local solved-problem progress and theme preference
- Responsive, accessible layout with an offline fallback catalog

## Run locally

This is a static site. Serve the folder instead of opening the HTML file directly.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

You can also use the Cloud Run compatible Node server:

```bash
npm start
```

## Deployment

The site can be deployed directly with GitHub Pages. No build step and no API secrets are required.

For Google Cloud Run, deploy the included `Dockerfile`. The server reads the platform-provided `PORT` value and serves the static app without external runtime dependencies.

The problem catalog is provided by a community API and problem copyrights remain with their respective owner. The UI caches a normalized catalog for six hours and falls back to a small local set if the service is unavailable. Code is sent to the public Judge0 CE service only after the user chooses Compile, Run or Submit. Submit saves progress locally; it does not run LeetCode's private test suite.
