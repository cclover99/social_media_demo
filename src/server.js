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


// Create routes
const mainRouter = express.Router();
const dashboardRouter = express.Router();


// Nunjucks setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'njk');


// Disable etag for fresher pages
app.disable('etag');

app.disable('x-powered-by');

// Don't cache .njk files
app.disable('view cache');


// Handle form data
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 


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


// If in localhost set the subdomain offset
if (process.env.NODE_ENV === 'development')
    app.set('subdomain offset', 1)



function subdomainHandler(subdomainName, router) {
    return (req, res, next) => {    
        console.log(req.subdomains) 
        if (req.subdomains.includes(subdomainName)) {
            router(req, res, next);
        } else {
            next();
        }
    };
};


// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const postRoutes = require('./routes/postview');
const apiRoutes = require('./routes/api');

// Subdomain Routes
const dashboardRoutes = require('./routes/dashboard/dashboard');
const dashboardApiRoutes = require('./routes/dashboard/api');


// Mount global routes
mainRouter.use('/', authRoutes);


// Mount to root
mainRouter.use('/u', profileRoutes);
mainRouter.use('/u', postRoutes);
mainRouter.use('/api', apiRoutes);


// Mount subdomain
dashboardRouter.use("/", dashboardRoutes);
dashboardRouter.use("/api", dashboardApiRoutes);


// Mount /cdn
mainRouter.use('/cdn', express.static(path.join(__dirname, '../cdn')));


// Root URL, index
mainRouter.get('/', (req, res) => { res.render('index', {"user": req.session.user}) });



// Mount /public, serves everything in the 'public' folder.
app.use(express.static(path.join(__dirname, '../public'), { 
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



// vite build files
app.use('/dist', express.static(path.join(__dirname, '../dist')));




// Connect all the routers
app.use((req, res, next) => {
    if (req.subdomains.includes('admin')) {
        // If the URL has 'dashboard', send it EXCLUSIVELY to the dashboard router
        return dashboardRouter(req, res, next);
    } else {
        // If it doesn't, send it EXCLUSIVELY to the main site router
        return mainRouter(req, res, next);
    };
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