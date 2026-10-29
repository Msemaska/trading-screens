import { app, BrowserWindow, BrowserView, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Configuration file path
const CONFIG_FILE = path.join(app.getPath('userData'), 'dashboard_config.json');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Store all chart views
const chartViews: Map<string, BrowserView> = new Map();

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
    },
    icon: path.join(__dirname, 'icon.png'),
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
          'Secondary Dashboard': [],
          'Crypto': [],
          'Uranium': [],
          'Quantum': []
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
 * Create a chart view (BrowserView) for a specific chart
 */
ipcMain.handle('create-chart-view', async (event, { id, url, bounds }) => {
  try {
    console.log(`Creating chart view ${id} with URL: ${url}`);
    
    // Remove existing view with the same ID if it exists
    if (chartViews.has(id)) {
      const existingView = chartViews.get(id);
      if (existingView && mainWindow) {
        mainWindow.removeBrowserView(existingView);
      }
      chartViews.delete(id);
    }
    
    // Create a new BrowserView
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    // Add the view to the main window
    if (mainWindow) {
      mainWindow.addBrowserView(view);
      view.setBounds(bounds);
      view.webContents.loadURL(url);
      
      // Store the view for future reference
      chartViews.set(id, view);
      
      console.log(`Chart view ${id} created successfully`);
      return { success: true };
    } else {
      console.error(`Failed to create chart view ${id}: Main window is null`);
      return { success: false, error: 'Main window is null' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error creating chart view ${id}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
});

/**
 * Remove a chart view
 */
ipcMain.handle('remove-chart-view', async (event, { id }) => {
  try {
    console.log(`Removing chart view ${id}`);
    
    // Get the view
    const view = chartViews.get(id);
    
    if (view && mainWindow) {
      // Remove the view from the window
      mainWindow.removeBrowserView(view);
      
      // Remove from the map
      chartViews.delete(id);
      
      console.log(`Chart view ${id} removed successfully`);
      return { success: true };
    } else {
      console.log(`Chart view ${id} not found`);
      return { success: false, error: 'Chart view not found' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error removing chart view ${id}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
});

/**
 * Update a chart view's bounds
 */
ipcMain.handle('update-chart-view-bounds', async (event, { id, bounds }) => {
  try {
    console.log(`Updating chart view ${id} bounds`);
    
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error updating chart view ${id} bounds:`, errorMessage);
    return { success: false, error: errorMessage };
  }
});

/**
 * Hide all chart views
 */
ipcMain.handle('hide-all-chart-views', async () => {
  try {
    console.log('Hiding all chart views');
    
    if (mainWindow) {
      // Hide all views
      for (const [id, view] of chartViews.entries()) {
        mainWindow.removeBrowserView(view);
      }
      
      console.log('All chart views hidden successfully');
      return { success: true };
    } else {
      console.error('Failed to hide chart views: Main window is null');
      return { success: false, error: 'Main window is null' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error hiding chart views:', errorMessage);
    return { success: false, error: errorMessage };
  }
});

/**
 * Show all chart views
 */
ipcMain.handle('show-all-chart-views', async () => {
  try {
    console.log('Showing all chart views');
    
    if (mainWindow) {
      // Show all views
      for (const [id, view] of chartViews.entries()) {
        mainWindow.addBrowserView(view);
      }
      
      console.log('All chart views shown successfully');
      return { success: true };
    } else {
      console.error('Failed to show chart views: Main window is null');
      return { success: false, error: 'Main window is null' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error showing chart views:', errorMessage);
    return { success: false, error: errorMessage };
  }
});
