import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import '../styles/toolbar.css';

interface ChartData {
  symbol: string;
  name: string;
  url?: string;
  row: number;
  col: number;
}

interface ToolbarProps {
  layouts: string[];
  currentLayout: string;
  currentTab: string;
  tabs: string[];
  onTabChange: (tab: string) => void;
  onAddChart: (chartData: ChartData) => void;
  onCreateLayout: (layoutName: string) => void;
  onNewWindow: () => void;
}

/**
 * Toolbar component for managing dashboard controls
 */
const Toolbar: React.FC<ToolbarProps> = ({
  layouts,
  currentLayout,
  currentTab,
  tabs,
  onTabChange,
  onAddChart,
  onCreateLayout,
  onNewWindow
}) => {
  // State for add chart dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  
  // Handle showing/hiding BrowserViews when dialog is shown/hidden
  useEffect(() => {
    const toggleBrowserViews = async () => {
      try {
        if (showAddDialog) {
          // Hide all BrowserViews when dialog is shown
          console.log('Hiding all BrowserViews for dialog');
          await ipcRenderer.invoke('hide-all-chart-views');
        } else {
          // Show all BrowserViews when dialog is closed
          console.log('Showing all BrowserViews after dialog');
          await ipcRenderer.invoke('show-all-chart-views');
        }
      } catch (error) {
        console.error('Error toggling BrowserViews:', error);
      }
    };
    
    toggleBrowserViews();
  }, [showAddDialog]);

  // Handle add chart submission
  const handleAddChart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!assetName.trim()) {
      alert('Asset name is required');
      return;
    }
    
    // Calculate position (simple implementation - add to the end)
    // In a real app, you'd find the first empty cell
    const existingCharts = document.querySelectorAll('.chart-panel').length;
    const row = Math.floor(existingCharts / 4);
    const col = existingCharts % 4;
    
    // Generate a symbol from the name (simplified for this example)
    const symbol = assetName.replace(/\s+/g, '_').toUpperCase();
    
    // Hide dialog first
    setShowAddDialog(false);
    
    // Wait a moment for the dialog to close and BrowserViews to be shown
    setTimeout(() => {
      // Add the chart
      onAddChart({
        name: assetName.trim(),
        symbol: symbol, // Use generated symbol
        url: assetUrl.trim() || undefined,
        row,
        col
      });
      
      // Reset form
      setAssetName('');
      setAssetUrl('');
      
      console.log(`Added chart: ${assetName} (${symbol})`);
    }, 300); // Small delay to ensure smooth transition
  };

  // Handle create layout
  const handleCreateLayout = () => {
    const layoutName = prompt('Enter new layout name:');
    if (layoutName && layoutName.trim()) {
      onCreateLayout(layoutName.trim());
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h1>Market Dashboard</h1>
      </div>
      
      <div className="toolbar-section tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab-button ${currentTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="toolbar-section actions">
        <button className="action-button" onClick={() => setShowAddDialog(true)}>
          Add Chart
        </button>
        <button className="action-button" onClick={onNewWindow}>
          New Window
        </button>
      </div>
      
      {showAddDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Add New Chart</h2>
            <form onSubmit={handleAddChart}>
              <div className="form-group">
                <label htmlFor="assetName">Asset Name:</label>
                <input
                  id="assetName"
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g., Tesla"
                  required
                />
              </div>
              

              
              <div className="form-group">
                <label htmlFor="assetUrl">Custom URL (optional):</label>
                <input
                  id="assetUrl"
                  type="text"
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  placeholder="e.g., https://finance.yahoo.com/quote/TSLA"
                />
                <small>Leave empty to use Google Finance</small>
              </div>
              
              <div className="dialog-buttons">
                <button type="button" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </button>
                <button type="submit">Add Chart</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
