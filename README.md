# Aziz Shukurov — Developer Portfolio

A responsive personal portfolio built with React, TypeScript, and Vite. It highlights backend engineering in fintech and banking, two years of React/Next.js experience, selected anonymized case studies, technical skills, and engineering principles.

## Live URL

After deployment, the portfolio will be available at:

**https://aziz0103.github.io**

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Deploy to GitHub Pages

### 1. Create the repository

Sign in to GitHub and create a **public** repository named exactly:

```text
aziz0103.github.io
```

Do not add a README, `.gitignore`, or license on GitHub because this project already contains its own files.

### 2. Push this project

Open PowerShell or Terminal inside the extracted project folder:

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/Aziz0103/aziz0103.github.io.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Open the **Actions** tab and wait for “Deploy portfolio to GitHub Pages” to finish.
5. Visit **https://aziz0103.github.io**.

Every future push to `main` automatically rebuilds and redeploys the site.

## Customize public links

Edit `src/siteConfig.ts` to update GitHub, LinkedIn, or the public site URL. The portfolio deliberately does not include a public email, employer name, private client details, credentials, or internal infrastructure.

## Main files

- `src/App.tsx` — portfolio content and interactions
- `src/styles.css` — responsive design, themes, and animations
- `src/siteConfig.ts` — public profile links
- `.github/workflows/deploy.yml` — automatic GitHub Pages deployment
- `public/robots.txt` and `public/sitemap.xml` — search-engine metadata
- `public/404.html` — custom not-found page

## Accessibility and performance

- Semantic landmarks and headings
- Keyboard-visible focus styles
- Skip-to-content link
- Reduced-motion support
- Dark and light themes
- No analytics, tracking, backend, database, secrets, or paid dependencies
