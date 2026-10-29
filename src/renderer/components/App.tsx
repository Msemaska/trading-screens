import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import Dashboard from './Dashboard';
import Toolbar from './Toolbar';
import '../styles/app.css';

// Define types for our configuration
interface ChartData {
  symbol: string;
  name: string;
  url?: string;
  row: number;
  col: number;
}

interface TabLayouts {
  [key: string]: ChartData[];
}

interface Config {
  layouts: {
    [key: string]: ChartData[];
  };
  current_layout: string;
  tab_layouts?: {
    [key: string]: ChartData[];
  };
}

// Main tab names
const MAIN_TAB = 'Main Dashboard';
const SECONDARY_TAB = 'Secondary Dashboard';
const CRYPTO_TAB = 'Crypto';
const URANIUM_TAB = 'Uranium';
const QUANTUM_TAB = 'Quantum';

const App: React.FC = () => {
  // State for configuration
  const [config, setConfig] = useState<Config>({
    layouts: { 'Default Layout': [] },
    current_layout: 'Default Layout',
    tab_layouts: {
      [MAIN_TAB]: [],
      [SECONDARY_TAB]: [],
      [CRYPTO_TAB]: [],
      [URANIUM_TAB]: [],
      [QUANTUM_TAB]: []
    }
  });
  
  // State for current tab
  const [currentTab, setCurrentTab] = useState<string>(MAIN_TAB);

  // Always use these tabs
  const forcedTabs = [MAIN_TAB, SECONDARY_TAB, CRYPTO_TAB, URANIUM_TAB, QUANTUM_TAB];
  
  // State for loading status
  const [loading, setLoading] = useState<boolean>(true);

  // Load configuration on component mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const loadedConfig = await ipcRenderer.invoke('load-config');
        // Always ensure all forcedTabs exist in config
        if (!loadedConfig.tab_layouts) loadedConfig.tab_layouts = {};
        forcedTabs.forEach(tab => {
          if (!loadedConfig.tab_layouts[tab]) {
            loadedConfig.tab_layouts[tab] = [];
          }
        });
        setConfig(loadedConfig);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // Save configuration when it changes
  useEffect(() => {
    if (!loading) {
      ipcRenderer.invoke('save-config', config);
    }
  }, [config, loading]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    console.log(`Switching to tab: ${tab}`);
    
    // Create the tab in the config if it doesn't exist
    if (config.tab_layouts && !config.tab_layouts[tab]) {
      const updatedTabLayouts = {
        ...config.tab_layouts,
        [tab]: []
      };
      
      setConfig({
        ...config,
        tab_layouts: updatedTabLayouts
      });
    }
    
    setCurrentTab(tab);
  };

  // Add a chart to the current tab
  const addChart = (chartData: ChartData) => {
    console.log(`Adding chart to ${currentTab}:`, chartData);
    
    // Create a copy of the current tab layouts
    const updatedTabLayouts = { ...config.tab_layouts } as TabLayouts;
    
    // If the tab doesn't exist, create it
    if (!updatedTabLayouts[currentTab]) {
      updatedTabLayouts[currentTab] = [];
    }
    
    // Add the chart to the current tab
    updatedTabLayouts[currentTab] = [...updatedTabLayouts[currentTab], chartData];
    
    // Update the configuration
    setConfig({
      ...config,
      tab_layouts: updatedTabLayouts
    });
  };

  // Remove a chart from the current tab
  const removeChart = (index: number) => {
    console.log(`Removing chart at index ${index} from ${currentTab}`);
    
    // Create a copy of the current tab layouts
    const updatedTabLayouts = { ...config.tab_layouts } as TabLayouts;
    
    // Remove the chart from the current tab
    if (updatedTabLayouts[currentTab]) {
      updatedTabLayouts[currentTab] = updatedTabLayouts[currentTab].filter((_, i) => i !== index);
    }
    
    // Update the configuration
    setConfig({
      ...config,
      tab_layouts: updatedTabLayouts
    });
  };

  // Update a chart in the current tab
  const updateChart = (index: number, chartData: ChartData) => {
    console.log(`Updating chart at index ${index} in ${currentTab}:`, chartData);
    
    // Create a copy of the current tab layouts
    const updatedTabLayouts = { ...config.tab_layouts } as TabLayouts;
    
    // Update the chart in the current tab
    if (updatedTabLayouts[currentTab]) {
      updatedTabLayouts[currentTab] = updatedTabLayouts[currentTab].map((chart, i) => 
        i === index ? chartData : chart
      );
    }
    
    // Update the configuration
    setConfig({
      ...config,
      tab_layouts: updatedTabLayouts
    });
  };

  // Get charts for the current tab
  const getCurrentTabCharts = (): ChartData[] => {
    return (config.tab_layouts && config.tab_layouts[currentTab]) || [];
  };

  // Create a new layout
  const createNewLayout = (layoutName: string) => {
    console.log(`Creating new layout: ${layoutName}`);
    
    // Create a copy of the layouts
    const updatedLayouts = { ...config.layouts };
    
    // Add the new layout
    updatedLayouts[layoutName] = [];
    
    // Update the configuration
    setConfig({
      ...config,
      layouts: updatedLayouts,
      current_layout: layoutName
    });
  };

  // Open a new window
  const openNewWindow = () => {
    console.log('Opening new window');
    ipcRenderer.invoke('create-new-window');
  };

  // Always render forcedTabs
  return (
    <div className="app">
      <Toolbar 
        layouts={Object.keys(config.layouts)}
        currentLayout={config.current_layout}
        currentTab={currentTab}
        tabs={forcedTabs}
        onTabChange={handleTabChange}
        onAddChart={addChart}
        onCreateLayout={createNewLayout}
        onNewWindow={openNewWindow}
      />
      <Dashboard 
        charts={getCurrentTabCharts()}
        onRemoveChart={removeChart}
        onUpdateChart={updateChart}
      />
    </div>
  );
};

export default App;
