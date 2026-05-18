const path = require('path');
const helmet = require('helmet');
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');

const db = require('./config/db');
const SQLSessionStore = require('./config/sessionStore');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT

app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'njk');

// Disable etag for fresher pages
app.disable('etag');

app.disable('x-powered-by');

// Don't cache .njk files
app.disable('view cache');
// app.use(
//     helmet({
//         // Allow inline scripts to run
//         contentSecurityPolicy: {
//             directives: 
//             // {"script-src": ["'self'"]}
//             {"script-src": ["'self'", "'unsafe-inline'"]}
//         }
//     })
// );

app.use(express.urlencoded({ extended: true })); // To read form data
app.use(express.json()); // To read json form data

// Explicitly tell the browser not to cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, proxy-revalidate');
    next();
});


// Nunjucks
nunjucks.configure(path.join(__dirname, './views'), {
    autoescape: true,
    express: app,
    // watch: true,
    noCache: true
});

// Define Session
app.use(session({
    store: new SQLSessionStore(db),
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 7, // Remember for 7 days
        //httpsOnly: true // Browser only
        httpOnly: true, // development test
        secure: false // for development
    } 
}));

// Redirect 'index' and 'index.html' to '/'
app.get(/^\/index(\.html)?$/, (req, res) => { res.redirect(301, '/') });

// Root URL, index
app.get('/', (req, res) => {
    res.render('index', {"user": req.session.user});
});


function mountOnSubdomain(subdomainName, router) {
  return (req, res, next) => {
    // req.hostname is "subdomain.localhost:4000" → split to "subdomain"
    const hostParts = req.hostname.split(".");
    const actualHostname = hostParts[hostParts.length - 1].includes(":")
      ? hostParts.slice(0, -1).join(".")
      : hostParts.join(".");
    const subdomains = hostParts.slice(0, -1);

    // If no dot, no subdomain (== root)
    const primarySubdomain = subdomains.length > 0 ? subdomains[0] : null;

    if (primarySubdomain === subdomainName) {
      router(req, res, next);
    } else {
      next();
    }
  };
}


// Import routes
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const postRoutes = require('./routes/postview')
const apiRoutes = require('./routes/api')

// Subdomain Routes
const dashboardRoutes = require('./routes/dashboard')



// Mount routes
app.use('/', authRoutes);
app.use('/u', profileRoutes);
app.use('/u', postRoutes);
app.use('/api', apiRoutes);

// Mount subdomain
app.use("/", mountOnSubdomain("dashboard", dashboardRoutes))


// Mount /cdn
app.use('/cdn', express.static(path.join(__dirname, '../cdn')));

// Mount /public, serves everything in the 'public' folder. Put this at the absolute bottom.
app.use(express.static(path.join(__dirname, '../public'), { 
    dotfiles: 'deny',
    index: false,
    redirect: false,
    extensions: ['html', 'htm'],

    setHeaders: (res, path, stat) => {
        // Stop browsers from trying to "guess" the file type // MIME sniffing
        res.set('X-Content-Type-Options', 'nosniff');
        
        // Prevent pages from being put in an <iframe> on another site // Clickjacking
        res.set('X-Frame-Options', 'DENY');
    }
}));

// vite build
app.use('/dist', express.static(path.join(__dirname, '../dist')));

// Place this after routes for 404 handling
app.use((req, res) => {
    // logger.warn(`404 - Page Not Found: ${req.originalUrl} - IP: ${req.ip}`);
    
    res.status(404).render('404', {"user": req.session.user});
});

// Error Handling.
// Place this at the absolute bottom.
app.use((err, req, res, next) => {
    console.log(err.stack)
    // logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} \nStack: ${err.stack}`);

    res.status(err.status || 500).json({
        message: "An internal server error occurred. ",
        status: 500
    });
});

// Run server
const server = app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
});