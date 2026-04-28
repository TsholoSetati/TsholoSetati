# Tsholo Setati - Personal Website

A modern, responsive personal portfolio website showcasing professional experience, projects, and financial literacy tools.

**Live Site:** [tsholosetati.com](https://tsholosetati.com)

## Overview

This is a **static HTML/CSS/JavaScript site** — no build tools required to view or deploy. The site features:

- **Multi-page layout** with modern responsive design
- **Dark mode toggle** with localStorage persistence
- **Interactive calculators** (retirement, loans, compound interest) powered by Chart.js
- **Financial literacy quiz** with immediate feedback
- **Professional experience timeline** with detailed role descriptions
- **Contact & social links** section

No Node.js, npm, or build tools needed to run locally or deploy.

## Quick Start

### View Locally (Recommended)

Use Python's built-in HTTP server:

```bash
# from the repository root
python -m http.server 8000

# then open http://localhost:8000/ in your browser
```

Or open `index.html` directly in your browser.

### Optional: Install Dependencies for Development

If you want to use linting, formatting, or type-checking:

```bash
# Requires Node.js 18+ (https://nodejs.org)
npm install
```

## Project Structure

```
.
├── index.html              # Home page (hero, features, navigation)
├── about.html              # About & professional summary
├── experience.html         # Detailed experience timeline (12+ roles)

├── tools.html              # Calculators & financial quiz
├── contact.html            # Contact information & social links
├── style.css               # Modern responsive styling (CSS variables, dark mode)
├── ui.js                   # Shared UI (header, footer, theme toggle)
├── script.js               # Calculator logic & interactions
├── CNAME                   # Custom domain (GitHub Pages)
├── .github/workflows/ci.yml # CI/CD pipeline (optional)
└── README.md               # This file
```

## Pages

| Page | Purpose |
|------|---------|
| **index.html** | Landing page with hero section, feature highlights, and CTAs |
| **about.html** | Professional background, expertise, and key achievements |
| **experience.html** | Complete professional timeline (Microsoft, EY, research, etc.) |

| **tools.html** | Interactive calculators (retirement, loans, compound interest) + financial quiz |
| **contact.html** | Contact methods (email, LinkedIn) and social links |

## Features

### Interactive Tools
- **Financial Literacy Quiz** — 4 questions testing financial understanding with instant feedback
- **Compound Interest Calculator** — Visualize investment growth with Chart.js
- **Retirement Savings Calculator** — Project retirement savings based on contributions and returns
- **Loan Repayment Calculator** — Calculate monthly payments and total interest

### Design
- **Responsive Layout** — Mobile-first design (works on phones, tablets, desktops)
- **Dark Mode** — Toggle via button in header; preference saved to localStorage
- **Modern CSS** — CSS variables, flexbox, grid, smooth transitions
- **Accessible** — Semantic HTML, ARIA labels, high contrast support

### Navigation
- **Sticky Header** — Quick access to all pages and theme toggle
- **Mobile Menu** — Hamburger menu for smaller screens
- **Active Link Highlighting** — Visual indicator of current page

## Development

### Optional: Linting & Formatting

Install dependencies first:

```bash
npm install
```

Available npm scripts:

```bash
npm run dev           # Start local dev server (with Vite)
npm run build         # Build for production
npm run preview       # Preview production build locally
npm run type-check    # TypeScript type checking
npm run lint          # Run ESLint
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier
```

### TypeScript Setup

TypeScript is configured but optional. Source code is in `src/` if you want to compile:

```bash
npm run type-check    # Validate types without compiling
```

The site works perfectly as vanilla JavaScript with CDN Chart.js.

## Deployment

### GitHub Pages (Automatic)

This site is configured for GitHub Pages auto-deployment:

1. Push changes to `main` branch
2. GitHub Actions runs the CI workflow (linting, type-check)
3. Site auto-publishes to `https://tsholosetati.com` (via CNAME)

**No manual deployment needed!**

Workflow file: [.github/workflows/ci.yml](.github/workflows/ci.yml)

### Manual Deployment

Since this is a static site, you can deploy anywhere:

- **GitHub Pages** — Push to `main`, CNAME points to custom domain
- **Vercel/Netlify** — Connect repo, auto-deploy on push
- **Any web host** — Upload all files via FTP/SSH

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## License

Personal portfolio — all content is proprietary.

## Contact

- **Email:** [tsholo@example.com](mailto:tsholo@example.com)
- **LinkedIn:** [linkedin.com/in/tsholosetati](https://linkedin.com/in/tsholosetati)
- **GitHub:** [github.com/TsholoSetati](https://github.com/TsholoSetati)

