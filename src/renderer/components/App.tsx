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

const App: React.FC = () => {
  // State for configuration
  const [config, setConfig] = useState<Config>({
    layouts: { 'Default Layout': [] },
    current_layout: 'Default Layout',
    tab_layouts: {
      [MAIN_TAB]: [],
      [SECONDARY_TAB]: []
    }
  });
  
  // State for current tab
  const [currentTab, setCurrentTab] = useState<string>(MAIN_TAB);
  
  // State for loading status
  const [loading, setLoading] = useState<boolean>(true);

  // Load configuration on component mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('Loading configuration...');
        const loadedConfig = await ipcRenderer.invoke('load-config');
        console.log('Configuration loaded:', loadedConfig);
        
        // Ensure tab_layouts exists
        if (!loadedConfig.tab_layouts) {
          loadedConfig.tab_layouts = {
            [MAIN_TAB]: [],
            [SECONDARY_TAB]: []
          };
        }
        
        setConfig(loadedConfig);
        setLoading(false);
      } catch (error) {
        console.error('Error loading configuration:', error);
        setLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  // Save configuration when it changes
  useEffect(() => {
    if (!loading) {
      console.log('Saving configuration...');
      ipcRenderer.invoke('save-config', config)
        .then(success => {
          console.log('Configuration saved:', success);
        })
        .catch(error => {
          console.error('Error saving configuration:', error);
        });
    }
  }, [config, loading]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    console.log(`Switching to tab: ${tab}`);
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

  return (
    <div className="app">
      <Toolbar 
        layouts={Object.keys(config.layouts)}
        currentLayout={config.current_layout}
        currentTab={currentTab}
        tabs={[MAIN_TAB, SECONDARY_TAB]}
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
