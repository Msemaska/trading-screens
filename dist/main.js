/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main/main.ts":
/*!**************************!*\
  !*** ./src/main/main.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || (function () {\n    var ownKeys = function(o) {\n        ownKeys = Object.getOwnPropertyNames || function (o) {\n            var ar = [];\n            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;\n            return ar;\n        };\n        return ownKeys(o);\n    };\n    return function (mod) {\n        if (mod && mod.__esModule) return mod;\n        var result = {};\n        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== \"default\") __createBinding(result, mod, k[i]);\n        __setModuleDefault(result, mod);\n        return result;\n    };\n})();\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst electron_1 = __webpack_require__(/*! electron */ \"electron\");\nconst path = __importStar(__webpack_require__(/*! path */ \"path\"));\nconst fs = __importStar(__webpack_require__(/*! fs */ \"fs\"));\n// Configuration file path\nconst CONFIG_FILE = path.join(electron_1.app.getPath('userData'), 'dashboard_config.json');\n// Keep a global reference of the window object to prevent garbage collection\nlet mainWindow = null;\n// Store all chart views\nconst chartViews = new Map();\n/**\n * Creates the main application window\n */\nfunction createWindow() {\n    // Create the browser window\n    mainWindow = new electron_1.BrowserWindow({\n        width: 1280,\n        height: 800,\n        webPreferences: {\n            nodeIntegration: true,\n            contextIsolation: false,\n        },\n        icon: path.join(__dirname, 'icon.png'),\n    });\n    // Load the index.html of the app\n    mainWindow.loadFile(path.join(__dirname, '../index.html'));\n    // Open DevTools in development mode\n    if (true) {\n        mainWindow.webContents.openDevTools();\n    }\n    // Maximize the window for best layout\n    mainWindow.maximize();\n    // Emitted when the window is closed\n    mainWindow.on('closed', () => {\n        // Dereference the window object\n        mainWindow = null;\n    });\n    // Log window size for debugging\n    mainWindow.on('resize', () => {\n        const size = mainWindow?.getSize();\n        console.log(`Window resized to ${size?.[0]}x${size?.[1]}`);\n    });\n}\n/**\n * Initialize the application when Electron has finished initialization\n */\nelectron_1.app.whenReady().then(() => {\n    createWindow();\n    // On macOS it's common to re-create a window when the dock icon is clicked\n    electron_1.app.on('activate', () => {\n        if (electron_1.BrowserWindow.getAllWindows().length === 0) {\n            createWindow();\n        }\n    });\n});\n/**\n * Quit when all windows are closed, except on macOS\n */\nelectron_1.app.on('window-all-closed', () => {\n    if (process.platform !== 'darwin') {\n        electron_1.app.quit();\n    }\n});\n/**\n * Load configuration from file\n */\nelectron_1.ipcMain.handle('load-config', async () => {\n    try {\n        if (fs.existsSync(CONFIG_FILE)) {\n            const configData = fs.readFileSync(CONFIG_FILE, 'utf8');\n            console.log('Loaded configuration from file');\n            return JSON.parse(configData);\n        }\n        else {\n            console.log('No configuration file found, creating default');\n            // Return default configuration\n            return {\n                layouts: {\n                    'Default Layout': []\n                },\n                current_layout: 'Default Layout',\n                tab_layouts: {\n                    'Main Dashboard': [],\n                    'Secondary Dashboard': []\n                }\n            };\n        }\n    }\n    catch (error) {\n        console.error('Error loading configuration:', error);\n        return {\n            layouts: {\n                'Default Layout': []\n            },\n            current_layout: 'Default Layout'\n        };\n    }\n});\n/**\n * Save configuration to file\n */\nelectron_1.ipcMain.handle('save-config', async (event, config) => {\n    try {\n        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));\n        console.log('Saved configuration to file');\n        return true;\n    }\n    catch (error) {\n        console.error('Error saving configuration:', error);\n        return false;\n    }\n});\n/**\n * Create a new window with the same layout\n */\nelectron_1.ipcMain.handle('create-new-window', () => {\n    createWindow();\n});\n/**\n * Create a chart view (BrowserView) for a specific chart\n */\nelectron_1.ipcMain.handle('create-chart-view', async (event, { id, url, bounds }) => {\n    try {\n        console.log(`Creating chart view ${id} with URL: ${url}`);\n        // Remove existing view with the same ID if it exists\n        if (chartViews.has(id)) {\n            const existingView = chartViews.get(id);\n            if (existingView && mainWindow) {\n                mainWindow.removeBrowserView(existingView);\n            }\n            chartViews.delete(id);\n        }\n        // Create a new BrowserView\n        const view = new electron_1.BrowserView({\n            webPreferences: {\n                nodeIntegration: true,\n                contextIsolation: false\n            }\n        });\n        // Add the view to the main window\n        if (mainWindow) {\n            mainWindow.addBrowserView(view);\n            view.setBounds(bounds);\n            view.webContents.loadURL(url);\n            // Store the view for future reference\n            chartViews.set(id, view);\n            console.log(`Chart view ${id} created successfully`);\n            return { success: true };\n        }\n        else {\n            console.error(`Failed to create chart view ${id}: Main window is null`);\n            return { success: false, error: 'Main window is null' };\n        }\n    }\n    catch (error) {\n        const errorMessage = error instanceof Error ? error.message : String(error);\n        console.error(`Error creating chart view ${id}:`, errorMessage);\n        return { success: false, error: errorMessage };\n    }\n});\n/**\n * Remove a chart view\n */\nelectron_1.ipcMain.handle('remove-chart-view', async (event, { id }) => {\n    try {\n        console.log(`Removing chart view ${id}`);\n        // Get the view\n        const view = chartViews.get(id);\n        if (view && mainWindow) {\n            // Remove the view from the window\n            mainWindow.removeBrowserView(view);\n            // Remove from the map\n            chartViews.delete(id);\n            console.log(`Chart view ${id} removed successfully`);\n            return { success: true };\n        }\n        else {\n            console.log(`Chart view ${id} not found`);\n            return { success: false, error: 'Chart view not found' };\n        }\n    }\n    catch (error) {\n        const errorMessage = error instanceof Error ? error.message : String(error);\n        console.error(`Error removing chart view ${id}:`, errorMessage);\n        return { success: false, error: errorMessage };\n    }\n});\n/**\n * Update a chart view's bounds\n */\nelectron_1.ipcMain.handle('update-chart-view-bounds', async (event, { id, bounds }) => {\n    try {\n        console.log(`Updating chart view ${id} bounds`);\n        // Get the view\n        const view = chartViews.get(id);\n        if (view) {\n            // Update the bounds\n            view.setBounds(bounds);\n            console.log(`Chart view ${id} bounds updated successfully`);\n            return { success: true };\n        }\n        else {\n            console.log(`Chart view ${id} not found`);\n            return { success: false, error: 'Chart view not found' };\n        }\n    }\n    catch (error) {\n        const errorMessage = error instanceof Error ? error.message : String(error);\n        console.error(`Error updating chart view ${id} bounds:`, errorMessage);\n        return { success: false, error: errorMessage };\n    }\n});\n/**\n * Hide all chart views\n */\nelectron_1.ipcMain.handle('hide-all-chart-views', async () => {\n    try {\n        console.log('Hiding all chart views');\n        if (mainWindow) {\n            // Hide all views\n            for (const [id, view] of chartViews.entries()) {\n                mainWindow.removeBrowserView(view);\n            }\n            console.log('All chart views hidden successfully');\n            return { success: true };\n        }\n        else {\n            console.error('Failed to hide chart views: Main window is null');\n            return { success: false, error: 'Main window is null' };\n        }\n    }\n    catch (error) {\n        const errorMessage = error instanceof Error ? error.message : String(error);\n        console.error('Error hiding chart views:', errorMessage);\n        return { success: false, error: errorMessage };\n    }\n});\n/**\n * Show all chart views\n */\nelectron_1.ipcMain.handle('show-all-chart-views', async () => {\n    try {\n        console.log('Showing all chart views');\n        if (mainWindow) {\n            // Show all views\n            for (const [id, view] of chartViews.entries()) {\n                mainWindow.addBrowserView(view);\n            }\n            console.log('All chart views shown successfully');\n            return { success: true };\n        }\n        else {\n            console.error('Failed to show chart views: Main window is null');\n            return { success: false, error: 'Main window is null' };\n        }\n    }\n    catch (error) {\n        const errorMessage = error instanceof Error ? error.message : String(error);\n        console.error('Error showing chart views:', errorMessage);\n        return { success: false, error: errorMessage };\n    }\n});\n\n\n//# sourceURL=webpack://trading-screens/./src/main/main.ts?");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main/main.ts");
/******/ 	
/******/ })()
;