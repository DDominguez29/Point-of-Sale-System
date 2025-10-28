// Import the built-in 'http' module
import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleWelcome } from './routes/welcome.js';
import { handleAuth } from './routes/auth.js';
import { handleMenu } from './routes/menuData.js';
import { handleCheckout } from './routes/checkout.js';
import { handleInventoryRoutes } from './routes/inventoryRoutes.js';
import { handleUtilityRoutes } from './routes/utilityRoutes.js';
import { handleEditPage } from './routes/editpage.js';
import { handleNotificationRoutes } from './routes/notifications.js';

import './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { handleReports } from "./routes/reportsData.js"


const hostname = '0.0.0.0';
const port = process.env.SERVER_PORT || process.env.WEBSITE_PORT || 8080;

// Serve static files from public directory (built React app)
async function serveStaticFromPublic(filepath, res) {
    try {
        const data = await fs.readFile(filepath);
        
        // Determine content type
        const ext = path.extname(filepath).toLowerCase();
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(data);
        return true;
    } catch (error) {
        return false;
    }
}

async function serveStaticFile(req, res) {
    try {
        const filepath = path.join(__dirname, req.url);
        const data = await fs.readFile(filepath);

        // Determine content type
        const ext = path.extname(filepath).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(data);
    } catch (error) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>404 - File Not Found</h1>');
    }
}


const server = http.createServer(async (req, res) => {
    const { url, method } = req;
    console.log(`${method} request for ${url}`);
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.statusCode = 200;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.end();
        return;
    }
    
    // Serve static files from uploads directory
    if (url.startsWith('/uploads/')) {
        serveStaticFile(req, res);
        return;
    } 
    // API routes
    else if (url.startsWith('/api/staff/notifications')) {
        handleNotificationRoutes(req, res);
    } else if (url.startsWith('/api/editpage')) {
        handleEditPage(req, res);
    } else if (url.startsWith('/api/menu/')) {
        handleMenu(req, res);
    } else if (url.startsWith('/api/welcome')) {
        handleWelcome(req, res);
    } else if (url.startsWith('/api/auth')) {
        handleAuth(req, res);
    } else if (url.startsWith('/api/checkout')) {
        handleCheckout(req, res);
    } else if (url.startsWith('/api/inventory')) {
        handleInventoryRoutes(req, res);
    } else if (url.startsWith('/api/utilities')) {
        handleUtilityRoutes(req, res);
    } else if (url.startsWith('/api/reports')) {
        handleReports(req, res);
    } 
    // Serve React app
    else {
        const publicDir = path.join(__dirname, 'public');
        let filepath;
        
        // Check if file exists in public directory
        if (url !== '/') {
            filepath = path.join(publicDir, url);
            const served = await serveStaticFromPublic(filepath, res);
            if (served) return;
        }
        
        // For all other routes (including root), serve index.html for React Router
        filepath = path.join(publicDir, 'index.html');
        const served = await serveStaticFromPublic(filepath, res);
        
        if (!served) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end('<h1>404 - Application Not Found</h1><p>The React app build files are missing. Please run "npm run build" in the client directory.</p>');
        }
    }
});

// Start the server and have it listen on the specified port and hostname.
// The callback function is executed once the server starts listening.
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log('Press Ctrl+C to stop the server.');
});
