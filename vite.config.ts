// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import svgr from "vite-plugin-svgr";

// // https://vite.dev/config/
// export default defineConfig({
//   base: "/swagat",
//   plugins: [
//     react(),
//     svgr({
//       svgrOptions: {
//         icon: true,
//         // This will transform your SVG to a React component
//         exportType: "named",
//         namedExport: "ReactComponent",
//       },
//     }),
//     // "babel-plugin-react-compiler",
//   ],
//   // disable the HMR error overlay shown in the browser
//   server: {
//     hmr: {
//       overlay: false,
//     },
//   },
// });












// @ts-nocheck
import { defineConfig, type ConfigEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import PurgeCSS from 'vite-plugin-purgecss';
import Inspect from 'vite-plugin-inspect';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';
import ViteSitemap from 'vite-plugin-sitemap';
import path from 'path';

const config = (env: ConfigEnv): UserConfig => {
  return {
    base: "./",
    plugins: [
      ViteSitemap(
        {
          hostname: "https://swar-api.gujarat.gov.in/swagat/",
          outDir: "dist",
          robots: [
            {
              userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
              allow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "Googlebot/2.1 (+https://www.google.com/bot.html)",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "Baiduspider/2.0 (+http://www.baidu.com/search/spider.html)",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "Sogou Spider/4.0 (+http://www.sogou.com/docs/help/webmasters.htm)",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "Twitterbot/1.0",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
            {
              userAgent: "Pinterest/0.2 (+https://www.pinterest.com/bot.html)",
              disallow: ["/", "/overview", "/subject-category", "/level-wise-designation-analysis", "/positively-disposed-grievance", "/escalated-by-citizen", "/reviewed", "/drill-down/*"]
            },
          ]
        }
      ),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 1024,
        algorithm: 'brotliCompress',
        ext: '.br'
      }),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        }
      }),
      // PurgeCSS(),
      Inspect(),
      svgr({
        svgrOptions: {
          icon: true,
          exportType: "named",
          namedExport: "ReactComponent",
        }
      })
    ],


    define: {
      __APP_ENV__: JSON.stringify(env.mode),
    },
    server: {
      proxy: {
        "/Gujdistricts.geojson.geojson.geojson": {
          target: "https://swar-api.gujarat.gov.in/Gujdistricts.geojson"
        }
      },
      hmr: true,
      watch: {
        atomic: true,
      },
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      },
      target: 'esnext',
      outDir: 'dist',
      minify: 'esbuild',
      sourcemap: false,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: true,
    },
  };
};

export default defineConfig(config);
