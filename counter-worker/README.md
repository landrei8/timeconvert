# Time Zones view counter (Cloudflare Workers + D1)

Your own free view counter for the GitHub Pages site. The free plan covers about 100,000 views a day.

The site keeps using the old counter until you finish step 5, so nothing breaks while you set this up.

## Option A: everything in the Cloudflare dashboard (no installs)

Cloudflare renames menu items now and then; if a label differs slightly, look for the closest match.

1. **Create a free account** at <https://dash.cloudflare.com/sign-up> (no credit card needed).

2. **Create the database**
   - Go to **Storage & Databases → D1 SQL Database → Create**.
   - Name it `timeconvert-counter` and create it.
   - Open the database, go to its **Console** tab, paste everything from [`schema.sql`](schema.sql) and click **Execute**.

3. **Create the Worker**
   - Go to **Workers & Pages → Create → Create Worker** (the "Hello World" starter is fine).
   - Name it `timeconvert-counter` and click **Deploy**.
   - Click **Edit code**, delete everything, paste the contents of [`worker.js`](worker.js) and click **Deploy**.

4. **Connect the Worker to the database and your site**
   - In the Worker, open **Settings → Bindings → Add → D1 database**.
     Variable name: `DB`. Database: `timeconvert-counter`. Save.
   - In **Settings → Variables and Secrets**, add two **Text** variables:
     - `ALLOWED_ORIGINS` = `https://YOUR-USERNAME.github.io` (your GitHub Pages address, no trailing slash and no folder path; add more separated by commas, e.g. `,http://localhost:8765` for local testing)
     - `ALLOWED_KEYS` = `views`
   - Deploy again if the dashboard asks you to.

5. **Point the site at your counter**
   - Your Worker's address is shown at the top of its page, like `https://timeconvert-counter.YOUR-SUBDOMAIN.workers.dev`.
   - In `index.html`, find the `COUNTER_URL` line and change it to:
     ```js
     const COUNTER_URL = 'https://timeconvert-counter.YOUR-SUBDOMAIN.workers.dev', COUNTER_KEY = 'views';
     ```
   - Commit and push to GitHub Pages.

## Check that it works

Open `https://timeconvert-counter.YOUR-SUBDOMAIN.workers.dev/get/views` in a browser. You should see `{"value":0}` or your current count.
Then open your site; the footer should show the number of views.

## Option B: command line

Needs Node.js. From this folder:

```bash
npx wrangler login
```

```bash
npx wrangler d1 create timeconvert-counter
```

Copy the `database_id` it prints into `wrangler.toml`, set your site in `ALLOWED_ORIGINS`, then:

```bash
npx wrangler d1 execute timeconvert-counter --remote --file=schema.sql
```

```bash
npx wrangler deploy
```

Then do step 5 above.

## Good to know

- **Starting count:** to carry over a previous total, run this in the D1 Console (replace 123):
  `INSERT INTO counters (key, value) VALUES ('views', 123) ON CONFLICT(key) DO UPDATE SET value = excluded.value;`
- **Who can add views:** only pages on the sites in `ALLOWED_ORIGINS` can count from a browser. Like any public counter, someone determined could still inflate it with scripts; it's a visit counter, not an audited statistic.
- **Company networks and ad blockers:** a `workers.dev` address is less likely to be blocked than a known counter service, but no guarantee. For the best chance, use your own domain for the site and attach a subdomain such as `counter.yourdomain.com` to the Worker (**Settings → Domains & Routes**).
