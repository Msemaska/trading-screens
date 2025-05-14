import React from 'react';
import ChartPanel from './ChartPanel';
import '../styles/dashboard.css';

// Define types for our chart data
interface ChartData {
  symbol: string;
  name: string;
  url?: string;
  row: number;
  col: number;
}

interface DashboardProps {
  charts: ChartData[];
  onRemoveChart: (index: number) => void;
  onUpdateChart: (index: number, chartData: ChartData) => void;
}

/**
 * Dashboard component that displays a 4x4 grid of chart panels
 */
const Dashboard: React.FC<DashboardProps> = ({ charts, onRemoveChart, onUpdateChart }) => {
  // Create a 4x4 grid layout
  const grid = Array(4).fill(null).map(() => Array(4).fill(null));
  
  // Place charts in the grid
  charts.forEach((chart, index) => {
    const { row, col } = chart;
    if (row >= 0 && row < 4 && col >= 0 && col < 4) {
      grid[row][col] = { ...chart, index };
    }
  });
  
  // Show empty state if no charts
  const isEmpty = charts.length === 0;
  
  // Log grid layout for debugging
  console.log('Grid layout:', grid);

  return (
    <div className="dashboard">
      {isEmpty ? (
        <div className="empty-state">
          <h2>No charts added yet</h2>
          <p>Click the "Add Chart" button to add your first financial chart</p>
        </div>
      ) : (
        <div className="grid-container">
          {grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid-row">
              {row.map((cell, colIndex) => (
                <div key={`cell-${rowIndex}-${colIndex}`} className="grid-cell">
                  {cell ? (
                    <ChartPanel
                      symbol={cell.symbol}
                      name={cell.name}
                      url={cell.url}
                      onRemove={() => onRemoveChart(cell.index)}
                      onEdit={(updatedChart) => {
                        onUpdateChart(cell.index, {
                          ...updatedChart,
                          row: rowIndex,
                          col: colIndex
                        });
                      }}
                    />
                  ) : (
                    <div className="empty-cell">
                      <span>Empty</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
