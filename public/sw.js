if (!self.define) {
  let e,
    a = {};
  const s = (s, n) => (
    (s = new URL(s + ".js", n).href),
    a[s] ||
      new Promise((a) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, c) => {
    const i = e || ("document" in self ? document.currentScript.src : "") || location.href;
    if (a[i]) return;
    let t = {};
    const f = (e) => s(e, i),
      r = { module: { uri: i }, exports: t, require: f };
    a[i] = Promise.all(n.map((e) => r[e] || f(e))).then((e) => (c(...e), t));
  };
}
define(["./workbox-f1770938"], function (e) {
  "use strict";
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: "/_next/static/chunks/11-619e6495c56e6646.js", revision: "619e6495c56e6646" },
        { url: "/_next/static/chunks/237-32a32126b7cd70d5.js", revision: "32a32126b7cd70d5" },
        { url: "/_next/static/chunks/268-89e30efdcf8f5747.js", revision: "89e30efdcf8f5747" },
        { url: "/_next/static/chunks/295.1b49fea817878646.js", revision: "1b49fea817878646" },
        { url: "/_next/static/chunks/4bd1b696-deb4a0a1da1923b0.js", revision: "deb4a0a1da1923b0" },
        { url: "/_next/static/chunks/552-befa3771c92383ae.js", revision: "befa3771c92383ae" },
        { url: "/_next/static/chunks/674-d9e5506197404feb.js", revision: "d9e5506197404feb" },
        { url: "/_next/static/chunks/770-2507f2e84c89ed31.js", revision: "2507f2e84c89ed31" },
        { url: "/_next/static/chunks/82-37a722a2927da20f.js", revision: "37a722a2927da20f" },
        { url: "/_next/static/chunks/837-ab9eaf7348ea7f4f.js", revision: "ab9eaf7348ea7f4f" },
        { url: "/_next/static/chunks/855.e725a31d2a17345d.js", revision: "e725a31d2a17345d" },
        { url: "/_next/static/chunks/928-268a16c661757f1f.js", revision: "268a16c661757f1f" },
        { url: "/_next/static/chunks/940-fcd87bdab263335f.js", revision: "fcd87bdab263335f" },
        {
          url: "/_next/static/chunks/app/_global-error/page-7eff305917eddaf6.js",
          revision: "7eff305917eddaf6",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-c88d53682d6d5e8a.js",
          revision: "c88d53682d6d5e8a",
        },
        {
          url: "/_next/static/chunks/app/about/page-53a61c3703b2d762.js",
          revision: "53a61c3703b2d762",
        },
        {
          url: "/_next/static/chunks/app/adventure/page-290d282b17974676.js",
          revision: "290d282b17974676",
        },
        {
          url: "/_next/static/chunks/app/games/balance/page-458a401fdc955d1d.js",
          revision: "458a401fdc955d1d",
        },
        {
          url: "/_next/static/chunks/app/games/color-match/page-95fbc8462123b701.js",
          revision: "95fbc8462123b701",
        },
        {
          url: "/_next/static/chunks/app/games/math-24/page-fccbf8887aa7063d.js",
          revision: "fccbf8887aa7063d",
        },
        {
          url: "/_next/static/chunks/app/games/maze/page-99352b10f7bf9d9b.js",
          revision: "99352b10f7bf9d9b",
        },
        {
          url: "/_next/static/chunks/app/games/memory/page-c98d73dbafcbeaac.js",
          revision: "c98d73dbafcbeaac",
        },
        {
          url: "/_next/static/chunks/app/games/pattern-master/page-609e4fa81cba8c66.js",
          revision: "609e4fa81cba8c66",
        },
        {
          url: "/_next/static/chunks/app/games/piano/page-46344b3c3aa45303.js",
          revision: "46344b3c3aa45303",
        },
        {
          url: "/_next/static/chunks/app/games/schulte/page-669adb91bb6fcafe.js",
          revision: "669adb91bb6fcafe",
        },
        {
          url: "/_next/static/chunks/app/games/sequence/page-37ca643e18f49533.js",
          revision: "37ca643e18f49533",
        },
        {
          url: "/_next/static/chunks/app/games/shadow-match/page-51bf951c13ca7118.js",
          revision: "51bf951c13ca7118",
        },
        {
          url: "/_next/static/chunks/app/games/sorting/page-27a4239bc5d28986.js",
          revision: "27a4239bc5d28986",
        },
        {
          url: "/_next/static/chunks/app/games/sudoku/page-15efeace3e74f826.js",
          revision: "15efeace3e74f826",
        },
        {
          url: "/_next/static/chunks/app/games/whack-a-mole/page-6771046274ed5ba1.js",
          revision: "6771046274ed5ba1",
        },
        {
          url: "/_next/static/chunks/app/games/word-match/page-148d2c2f99b0a730.js",
          revision: "148d2c2f99b0a730",
        },
        {
          url: "/_next/static/chunks/app/layout-85870f2fb198f65b.js",
          revision: "85870f2fb198f65b",
        },
        { url: "/_next/static/chunks/app/page-35b23cd6415e8cc0.js", revision: "35b23cd6415e8cc0" },
        {
          url: "/_next/static/chunks/app/parents/page-d447ab3853c39b80.js",
          revision: "d447ab3853c39b80",
        },
        {
          url: "/_next/static/chunks/app/robots.txt/route-7eff305917eddaf6.js",
          revision: "7eff305917eddaf6",
        },
        {
          url: "/_next/static/chunks/app/sitemap.xml/route-7eff305917eddaf6.js",
          revision: "7eff305917eddaf6",
        },
        { url: "/_next/static/chunks/framework-b29f9083d3cda3b2.js", revision: "b29f9083d3cda3b2" },
        { url: "/_next/static/chunks/main-19a99e2c8f1dfd67.js", revision: "19a99e2c8f1dfd67" },
        { url: "/_next/static/chunks/main-app-fa568fa60a42e0e4.js", revision: "fa568fa60a42e0e4" },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/app-error-7eff305917eddaf6.js",
          revision: "7eff305917eddaf6",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/forbidden-7eff305917eddaf6.js",
          revision: "7eff305917eddaf6",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/global-error-c6b29d155046bce3.js",
          revision: "c6b29d155046bce3",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/not-found-7eff305917eddaf6.js",
          revision: "7eff305917eddaf6",
        },
        {
          url: "/_next/static/chunks/next/dist/client/components/builtin/unauthorized-7eff305917eddaf6.js",
          revision: "7eff305917eddaf6",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        { url: "/_next/static/chunks/webpack-83667beddae93878.js", revision: "83667beddae93878" },
        { url: "/_next/static/css/c4223867d31830f8.css", revision: "c4223867d31830f8" },
        {
          url: "/_next/static/l-9qgH-DCdGYjbx_vLC_7/_buildManifest.js",
          revision: "08d7d60eb63976cc5b0483789d37541c",
        },
        {
          url: "/_next/static/l-9qgH-DCdGYjbx_vLC_7/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/media/013b72fa676f92e0-s.woff2",
          revision: "bc06a1ea50382b6956e53aeb91c889c1",
        },
        {
          url: "/_next/static/media/2b5b02fc7e511755-s.woff2",
          revision: "a27466d069120e75e25b4fd06edd5be2",
        },
        {
          url: "/_next/static/media/3131c862d4942660-s.woff2",
          revision: "f228e29cc52b9499570eda6fe998bbbb",
        },
        {
          url: "/_next/static/media/65f03d54ccadf4a8-s.woff2",
          revision: "58bcf4f276e0844890901b91c411447c",
        },
        {
          url: "/_next/static/media/6a9c36ea9dc9b36b-s.woff2",
          revision: "2ff2e1d51f89a9391b6ee71296a62a79",
        },
        {
          url: "/_next/static/media/7d4881bb7e1bf84d-s.p.woff2",
          revision: "cd5b25781181c5c03d99ac2cbf88016a",
        },
        {
          url: "/_next/static/media/abfec168c8990f67-s.woff2",
          revision: "f83a932e4390acc2339567f36b215614",
        },
        {
          url: "/_next/static/media/b9408752a0c24fb9-s.woff2",
          revision: "c10faa6c8fbd7a47d8f00e75e82935cb",
        },
        {
          url: "/_next/static/media/e038a29029a234f2-s.woff2",
          revision: "42a21c981b367f31bd04683072dae1c1",
        },
        {
          url: "/_next/static/media/e1694c6cb47c173f-s.woff2",
          revision: "cd5cabf5b80f62cb7b59dd200d84a9d7",
        },
        {
          url: "/_next/static/media/ee40bb094c99a29a-s.p.woff2",
          revision: "acfce21e9f6eaf62a1058b502b920e06",
        },
        { url: "/apple-touch-icon.png", revision: "b3211d819c857849d830a4315b43448b" },
        { url: "/favicon.ico", revision: "85a7fe6fdc43ff087051582cab94a659" },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        { url: "/icon.svg", revision: "850d4d633aed4c257b75780efc77b29d" },
        { url: "/icons/schulte.svg", revision: "a657f2a28136a6d7e799d5aa72b77564" },
        { url: "/logo.jpg", revision: "28b1a82072f0b9c65bd1ec4b53ccb99f" },
        { url: "/manifest.json", revision: "52436f078dfcd5fad31ad9370342058b" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({ response: e }) =>
              e && "opaqueredirect" === e.type
                ? new Response(e.body, { status: 200, statusText: "OK", headers: e.headers })
                : e,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: "next-static-js-assets",
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ sameOrigin: e, url: { pathname: a } }) =>
        !(!e || a.startsWith("/api/auth/callback") || !a.startsWith("/api/")),
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: a }, sameOrigin: s }) =>
        "1" === e.headers.get("RSC") &&
        "1" === e.headers.get("Next-Router-Prefetch") &&
        s &&
        !a.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages-rsc-prefetch",
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ request: e, url: { pathname: a }, sameOrigin: s }) =>
        "1" === e.headers.get("RSC") && s && !a.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages-rsc",
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: { pathname: e }, sameOrigin: a }) => a && !e.startsWith("/api/"),
      new e.NetworkFirst({
        cacheName: "pages",
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ sameOrigin: e }) => !e,
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
      }),
      "GET"
    ));
});
