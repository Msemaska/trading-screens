const { app, BrowserWindow, ipcMain, BrowserView } = require('electron');
const path = require('path');
const fs = require('fs');

// Configuration file path
const CONFIG_FILE = path.join(app.getPath('userData'), 'dashboard_config.json');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow = null;

// Store active BrowserViews
const chartViews = new Map();

/**
 * Creates the main application window
 */
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Maximize the window for best layout
  mainWindow.maximize();

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });

  // Log window size for debugging
  mainWindow.on('resize', () => {
    const size = mainWindow?.getSize();
    console.log(`Window resized to ${size?.[0]}x${size?.[1]}`);
  });
}

/**
 * Initialize the application when Electron has finished initialization
 */
app.whenReady().then(() => {
  createWindow();

  // On macOS it's common to re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Quit when all windows are closed, except on macOS
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Load configuration from file
 */
ipcMain.handle('load-config', async () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
      console.log('Loaded configuration from file');
      return JSON.parse(configData);
    } else {
      console.log('No configuration file found, creating default');
      // Return default configuration
      return {
        layouts: {
          'Default Layout': []
        },
        current_layout: 'Default Layout',
        tab_layouts: {
          'Main Dashboard': [],
          'Secondary Dashboard': []
        }
      };
    }
  } catch (error) {
    console.error('Error loading configuration:', error);
    return {
      layouts: {
        'Default Layout': []
      },
      current_layout: 'Default Layout'
    };
  }
});

/**
 * Save configuration to file
 */
ipcMain.handle('save-config', async (event, config) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('Saved configuration to file');
    return true;
  } catch (error) {
    console.error('Error saving configuration:', error);
    return false;
  }
});

/**
 * Create a new window with the same layout
 */
ipcMain.handle('create-new-window', () => {
  createWindow();
});

/**
 * Create a chart BrowserView
 */
ipcMain.handle('create-chart-view', (event, { id, url, bounds }) => {
  try {
    console.log(`Creating chart view ${id} with URL: ${url}`);
    
    // Remove existing view with this ID if it exists
    if (chartViews.has(id)) {
      const existingView = chartViews.get(id);
      mainWindow.removeBrowserView(existingView);
      chartViews.delete(id);
    }
    
    // Create a new BrowserView
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });
    
    // Add to the main window
    mainWindow.addBrowserView(view);
    
    // Set bounds
    view.setBounds(bounds);
    
    // Load the URL
    view.webContents.loadURL(url);
    
    // Set zoom factor to 80%
    view.webContents.setZoomFactor(0.8);
    
    // Store the view
    chartViews.set(id, view);
    
    // Log success
    console.log(`Chart view ${id} created successfully`);
    
    return { success: true, id };
  } catch (error) {
    console.error(`Error creating chart view: ${error}`);
    return { success: false, error: error.message };
  }
});

/**
 * Update a chart BrowserView
 */
ipcMain.handle('update-chart-view', (event, { id, url, bounds }) => {
  try {
    console.log(`Updating chart view ${id}`);
    
    // Get the view
    const view = chartViews.get(id);
    
    if (!view) {
      console.error(`Chart view ${id} not found`);
      return { success: false, error: 'View not found' };
    }
    
    // Update bounds if provided
    if (bounds) {
      view.setBounds(bounds);
    }
    
    // Update URL if provided
    if (url) {
      view.webContents.loadURL(url);
      
      // Maintain zoom factor at 80%
      view.webContents.setZoomFactor(0.8);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating chart view: ${error}`);
    return { success: false, error: error.message };
  }
});

/**
 * Remove a chart BrowserView
 */
ipcMain.handle('remove-chart-view', (event, { id }) => {
  try {
    console.log(`Removing chart view ${id}`);
    
    // Get the view
    const view = chartViews.get(id);
    
    if (!view) {
      console.error(`Chart view ${id} not found`);
      return { success: false, error: 'View not found' };
    }
    
    // Remove from the main window
    mainWindow.removeBrowserView(view);
    
    // Remove from the map
    chartViews.delete(id);
    
    return { success: true };
  } catch (error) {
    console.error(`Error removing chart view: ${error}`);
    return { success: false, error: error.message };
  }
});

/**
 * Hide all chart views for a tab
 */
ipcMain.handle('hide-chart-views', (event, { tab }) => {
  try {
    console.log(`Hiding chart views for tab ${tab}`);
    
    // Get all views for this tab
    for (const [id, view] of chartViews.entries()) {
      if (id.startsWith(`${tab}-`)) {
        mainWindow.removeBrowserView(view);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error hiding chart views: ${error}`);
    return { success: false, error: error.message };
  }
});

/**
 * Show all chart views for a tab
 */
ipcMain.handle('show-chart-views', (event, { tab }) => {
  try {
    console.log(`Showing chart views for tab ${tab}`);
    
    // Get all views for this tab
    for (const [id, view] of chartViews.entries()) {
      if (id.startsWith(`${tab}-`)) {
        mainWindow.addBrowserView(view);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error showing chart views: ${error}`);
    return { success: false, error: error.message };
  }
});

/**
 * Hide all chart views (for dialogs)
 */
ipcMain.handle('hide-all-chart-views', async () => {
  try {
    console.log('Hiding all chart views for dialog');
    
    // Hide all views
    if (mainWindow) {
      for (const [id, view] of chartViews.entries()) {
        console.log(`Hiding view: ${id}`);
        mainWindow.removeBrowserView(view);
      }
      
      console.log('All chart views hidden successfully');
      return { success: true };
    } else {
      console.error('Failed to hide chart views: Main window is null');
      return { success: false, error: 'Main window is null' };
    }
  } catch (error) {
    console.error('Error hiding chart views:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Show all chart views (after dialog closes)
 */
ipcMain.handle('show-all-chart-views', async () => {
  try {
    console.log('Showing all chart views after dialog');
    
    // Show all views
    if (mainWindow) {
      for (const [id, view] of chartViews.entries()) {
        console.log(`Showing view: ${id}`);
        mainWindow.addBrowserView(view);
      }
      
      console.log('All chart views shown successfully');
      return { success: true };
    } else {
      console.error('Failed to show chart views: Main window is null');
      return { success: false, error: 'Main window is null' };
    }
  } catch (error) {
    console.error('Error showing chart views:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Update a chart view's bounds
 */
ipcMain.handle('update-chart-view-bounds', async (event, { id, bounds }) => {
  try {
    console.log(`Updating chart view ${id} bounds:`, bounds);
    
    // Get the view
    const view = chartViews.get(id);
    
    if (view) {
      // Update the bounds
      view.setBounds(bounds);
      
      console.log(`Chart view ${id} bounds updated successfully`);
      return { success: true };
    } else {
      console.log(`Chart view ${id} not found`);
      return { success: false, error: 'Chart view not found' };
    }
  } catch (error) {
    console.error(`Error updating chart view ${id} bounds:`, error);
    return { success: false, error: error.message };
  }
});
