# Corp-Crunch

## Get started

```bash
npm install
```

OR

```bash
yarn install
```

### Run Development server
```bash
npm run dev
```

OR

```bash
yarn dev
```

### Trigger Deployment

```
curl https://api.vercel.com/v1/integrations/deploy/prj_Eo4CaOoOIewr8W1AUgqQ59GPEZF2/gOeOq3UiHP
```

### Automated Deployment

The project is configured with GitHub Actions to automatically trigger a Vercel deployment when changes are pushed to the main branch. See the workflow file in `.github/workflows/vercel-deploy.yml`.

