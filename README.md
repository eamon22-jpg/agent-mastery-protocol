# Agent Mastery Concept

This folder contains the complete source for Eamon Bonner's interactive Agent Mastery concept page.

## Publish with GitHub Pages

1. Create an empty GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Open the repository settings on GitHub.
4. Select **Pages** under **Code and automation**.
5. Set **Source** to **GitHub Actions**.
6. Push to the `main` branch, or run the workflow from the **Actions** tab.

GitHub will publish the page at one of these addresses:

- `https://YOUR-NAME.github.io/REPOSITORY-NAME/`
- `https://YOUR-NAME.github.io/` for a repository named `YOUR-NAME.github.io`

The workflow detects the repository name. A post-build step sets the correct asset path for either address.

## Edit the page

- Edit the page copy in `app/page.tsx`.
- Edit the page styles in `app/globals.css`.
- Edit the three models in `components/`.
- Replace `public/og.png` to change the social preview image.

Each push to `main` publishes the latest version.

## Test locally

Install Node.js 22. Then run:

```sh
npm ci --no-audit --no-fund
npm run dev
```

Open `http://localhost:3000/`.

Run a production build with:

```sh
npm run build:pages
```

The static output appears in `dist/client`.
