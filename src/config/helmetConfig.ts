import helmet from "helmet";

const isDevelopment = process.env.NODE_ENV !== "production";

// Optimized configuration for JSON APIs with safer defaults and dev-friendly exceptions
export const apiHelmetConfig = helmet({
    // Use CSP in production; keep it off in development for easier testing
    contentSecurityPolicy: isDevelopment
        ? false
        : {
              directives: {
                  defaultSrc: ["'self'"],
                  scriptSrc: ["'self'"],
                  objectSrc: ["'none'"],
                  baseUri: ["'self'"],
                  frameAncestors: ["'none'"],
                  upgradeInsecureRequests: [],
              },
          },

    crossOriginEmbedderPolicy: false,

    // Keep essential security headers
    hsts: {
        maxAge: isDevelopment ? 60 : 31536000, // 1 minute in dev, 1 year in production
        includeSubDomains: !isDevelopment,
        preload: !isDevelopment,
    },

    // Remove server information from responses
    hidePoweredBy: true,

    // Prevent MIME type sniffing
    noSniff: true,

    // Prevent clickjacking
    frameguard: { action: "deny" },

    referrerPolicy: { policy: "no-referrer" },

    // Allow browser-side debug in development but lock down in production
    crossOriginResourcePolicy: {
        policy: isDevelopment ? "cross-origin" : "same-origin",
    },
});

