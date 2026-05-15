# Lexora Deployment

## Verify locally

```bash
npm install
npm run verify
```

## Enable GitHub Actions

Open the repository on GitHub:

1. Go to **Actions**.
2. Enable workflows if GitHub asks for confirmation.
3. Run the **CI** workflow manually.

## Enable GitHub Pages

Open repository settings:

1. Go to **Settings**.
2. Open **Pages**.
3. Set source to **GitHub Actions**.
4. Save.
5. Run **Deploy Lexora** manually or push to `main`.

## Expected result

The app should deploy to the repository Pages URL and load from:

```text
/Lexora/
```

## Quality gate

Preview is considered complete only when:

- CI is green
- Deploy Lexora is green
- the live Pages URL opens the game
