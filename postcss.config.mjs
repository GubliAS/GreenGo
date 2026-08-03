/** Tailwind v4 — the PostCSS plugin is all that's required.
 *  There is deliberately no tailwind.config.js: v4 is CSS-first and the
 *  entire theme lives in @theme inside app/globals.css. */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
