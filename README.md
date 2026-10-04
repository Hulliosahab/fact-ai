## Android packaging
1. Deploy the web client and API to HTTPS hosting.
2. Install Capacitor in this folder: `npm install @capacitor/core @capacitor/cli @capacitor/android`
3. Run `npx cap init FACTAI com.factai.app --web-dir dist`
4. Run `npm run build`, then `npx cap add android` and `npx cap sync android`.
5. Open Android Studio with `npx cap open android`.

For production, configure the API base URL in `src.jsx`, use HTTPS, add a database, rate limiting, email verification, and a strong JWT secret. Never ship the development secret.
