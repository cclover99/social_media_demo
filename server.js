const path = require('path');

const express = require('express');
const session = require('express-session');
const cors = require('cors');

const nunjucks = require('nunjucks');
const helmet = require('helmet');


const db = require('./shared/config/db');
const SQLSessionStore = require('./shared/config/sessionStore');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT


// Create express apps
const mainApp = express();
const dashboardApp = express();
const cdnApp = express();


// Nunjucks setup
const nunjucks_config = {
    autoescape: true,
    // watch: true,
    noCache: true
};

// Main app
mainApp.set('view engine', 'njk');
mainApp.set('views', path.join(__dirname, './apps/main/src/views'));
const mainEnv = nunjucks.configure(
    path.join(__dirname, './apps/main/src/views'), {
    ...nunjucks_config,
    express: mainApp
});

mainEnv.addGlobal('CDN_HOST', `http://cdn.localhost:${PORT}`);
mainEnv.addGlobal('API_HOST', `http://api.localhost:${PORT}`);


// Dashboard
dashboardApp.set('view engine', 'njk');
dashboardApp.set('views', path.join(__dirname, './apps/dashboard/src/views'));
const dashboardEnv = nunjucks.configure(
    path.join(__dirname, './apps/dashboard/src/views'), {
    ...nunjucks_config,
    express: dashboardApp
});

dashboardEnv.addGlobal('CDN_HOST', `http://cdn.localhost:${PORT}`);
dashboardEnv.addGlobal('API_HOST', `http://api.localhost:${PORT}`);   



// Disable etag for fresher pages
app.disable('etag');

// No idea
app.disable('x-powered-by');


// Handle form data
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 



// Define Session
app.use(session({
    store: new SQLSessionStore(db),
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 7, // Remember for 7 days
        //httpsOnly: true // Browser only
        httpOnly: true // development test
    } 
}));


// Redirect 'index' and 'index.html' to '/'
app.get(/^\/index(\.html)?$/, (req, res) => { res.redirect(301, '/') });


// If in localhost set the subdomain offset
if (process.env.NODE_ENV === 'development') 
    app.set('subdomain offset', 1);


// Import routes
const authRoutes = require('./apps/main/src/routes/auth');
const profileRoutes = require('./apps/main/src/routes/profile');
const postRoutes = require('./apps/main/src/routes/postview');
const bookmarkRoutes = require('./apps/main/src/routes/bookmarks');

// API Routes
const apiRoutesPublic = require('./apps/main/src/routes/api');
const apiRoutesAdmin = require('./apps/api/src/routes/admin');

// Subdomain Routes
const dashboardRoutes = require('./apps/dashboard/src/routes/dashboard');

// Enable CORS origin globally
app.use(cors({ origin: ((process.env.NODE_ENV == 'development') ? `http://localhost:${PORT}` : process.env.PROD_URL) })); 


// Mount main routes
mainApp.use('/', authRoutes);
mainApp.use('/u', profileRoutes);
mainApp.use('/u', postRoutes);
mainApp.use('/bookmarks', bookmarkRoutes);
mainApp.use('/api', apiRoutesPublic);


// Mount subdomain
dashboardApp.use("/", dashboardRoutes);
dashboardApp.use('/api', apiRoutesAdmin);


// Root URL, index
mainApp.get('/', (req, res) => { 
    res.set('Cache-Control', 'private, max-age=0');
    res.render('index', {"user": req.session.user}) 
});


// vite build files
cdnApp.use('/dist', express.static(path.join(__dirname, './shared/dist')));


// Mount shared
cdnApp.use(express.static(path.join(__dirname, './shared/cdn'), { 
    dotfiles: 'deny',
    index: false,
    redirect: false,
    extensions: ['html', 'htm'],

    setHeaders: (res, path, stat) => {
        // Stop browsers from trying to "guess" the file type
        res.set('X-Content-Type-Options', 'nosniff');
        
        // Prevent pages from being put in an <iframe> on another site
        // res.set('X-Frame-Options', 'DENY');

        res.set('Access-Control-Allow-Origin', '*'); // Or 'http://localhost:4000'
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }
}));

// Mount /public, serves everything in the 'public' folder.
mainApp.use(express.static(path.join(__dirname, './apps/main/public'), { 
    dotfiles: 'deny',
    index: false,
    redirect: false,
    extensions: ['html', 'htm'],

    setHeaders: (res, path, stat) => {
        // Stop browsers from trying to "guess" the file type
        res.set('X-Content-Type-Options', 'nosniff');
        
        // Prevent pages from being put in an <iframe> on another site
        res.set('X-Frame-Options', 'DENY');
    }
}));






// Connect all the routers
app.use((req, res, next) => {
    if (req.subdomains.includes('admin')) {
        // If the URL has 'dashboard', send it EXCLUSIVELY to the dashboard router
        return dashboardApp(req, res, next);

    } else if (req.subdomains.includes('cdn')) {
        // If it doesn't, send it EXCLUSIVELY to the main site router
        return cdnApp(req, res, next);

    } else if (req.subdomains.length == 0) {
        return mainApp(req, res, next);
    };
});

// CDN 404 handler
cdnApp.use((req, res) => {
    res.status(404).send('404: Asset Not Found');
});


// 404 handler
app.use((req, res) => {
    // logger.warn(`404 - Page Not Found: ${req.originalUrl} - IP: ${req.ip}`);
    let error_page = req.subdomains.includes('admin') ? 'dashboard/404' : '404';
    
    return res.status(404).render(error_page, {"user": req.session.user});
});


// 505 handler for main
app.use((err, req, res, next) => {
    let error_page = 'dashboard/505' ? req.subdomains.includes('admin') : '505';
    console.log(err.stack);
    // logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} \nStack: ${err.stack}`);

    res.status(err.status || 500).json({
        message: "An internal server error occurred. ",
        status: 500
    });
});


// Run server
const server = app.listen(PORT, () => { console.log(`Express server running at http://localhost:${PORT}`) });