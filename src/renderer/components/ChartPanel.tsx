import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer } from 'electron';
import '../styles/chart-panel.css';

interface ChartPanelProps {
  symbol: string;
  name: string;
  url?: string;
  onRemove: () => void;
  onEdit: (chartData: { symbol: string; name: string; url?: string }) => void;
}

/**
 * ChartPanel component that displays a financial chart in an iframe
 */
const ChartPanel: React.FC<ChartPanelProps> = ({ symbol, name, url, onRemove, onEdit }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartId] = useState(`chart-${symbol}-${Date.now()}`);

  // Construct the URL for the chart
  const chartUrl = url || `https://www.google.com/finance/quote/${symbol}`;
  
  // Log chart information for debugging
  console.log(`Loading chart: ${name} (${symbol}) from ${chartUrl}`);

  // Create and manage BrowserView
  useEffect(() => {
    // Function to calculate bounds for the BrowserView
    const calculateBounds = () => {
      if (chartContainerRef.current) {
        const rect = chartContainerRef.current.getBoundingClientRect();
        return {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      }
      return { x: 0, y: 0, width: 0, height: 0 };
    };

    // Create the BrowserView
    const createChartView = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Creating BrowserView for ${name} with ID: ${chartId}`);
        const bounds = calculateBounds();
        console.log(`Chart bounds:`, bounds);
        
        const result = await ipcRenderer.invoke('create-chart-view', {
          id: chartId,
          url: chartUrl,
          bounds
        });
        
        if (result.success) {
          console.log(`BrowserView created successfully for ${name}`);
          setIsLoading(false);
        } else {
          console.error(`Failed to create BrowserView for ${name}:`, result.error);
          setError(`Failed to load chart for ${name}: ${result.error}`);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`Error creating BrowserView for ${name}:`, error);
        setError(`Failed to load chart for ${name}: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
      }
    };

    // Update BrowserView bounds when container size changes
    const updateBounds = async () => {
      try {
        const bounds = calculateBounds();
        console.log(`Updating bounds for ${chartId}:`, bounds);
        await ipcRenderer.invoke('update-chart-view-bounds', {
          id: chartId,
          bounds
        });
      } catch (error) {
        console.error(`Error updating bounds for ${chartId}:`, error);
      }
    };

    // Create the BrowserView when component mounts
    createChartView();

    // Set up resize observer to update bounds when container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    // Clean up when component unmounts
    return () => {
      console.log(`Removing BrowserView for ${chartId}`);
      ipcRenderer.invoke('remove-chart-view', { id: chartId })
        .catch(error => console.error(`Error removing BrowserView for ${chartId}:`, error));
      
      if (chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [chartId, chartUrl, name]);

  // Show edit dialog
  const handleEdit = () => {
    // In a real app, you'd show a modal dialog here
    // For simplicity, we'll use prompt
    const newName = prompt('Enter asset name:', name);
    const newSymbol = prompt('Enter asset symbol:', symbol);
    const newUrl = prompt('Enter custom URL (optional):', url || '');
    
    if (newName && newSymbol) {
      onEdit({
        name: newName,
        symbol: newSymbol,
        url: newUrl || undefined
      });
    }
  };

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <h3 className="chart-title">{name}</h3>
        <div className="chart-controls">
          <button className="edit-button" onClick={handleEdit}>Edit</button>
          <button className="remove-button" onClick={onRemove}>Remove</button>
        </div>
      </div>
      
      <div className="chart-content" ref={chartContainerRef}>
        {isLoading && <div className="loading-indicator">Loading chart...</div>}
        {error && <div className="error-message">{error}</div>}
        {/* BrowserView will be positioned here by the main process */}
        <div className="chart-placeholder" style={{ height: '100%', width: '100%' }}></div>
      </div>
    </div>
  );
};

export default ChartPanel;
