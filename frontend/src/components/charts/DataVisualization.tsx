import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  HeatMap,
  HeatMapGrid,
} from 'recharts';

interface DataVisualizationProps {
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'scatter' | 'heatmap';
  title?: string;
  xAxis?: string;
  yAxis?: string;
  color?: string;
  height?: number;
  width?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  onDataPointClick?: (data: any) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  type,
  title,
  xAxis = 'x',
  yAxis = 'y',
  color = '#0088FE',
  height = 400,
  width = '100%',
  showLegend = true,
  showGrid = true,
  animate = true,
  onDataPointClick,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const renderLineChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey={yAxis}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          onClick={onDataPointClick}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={chartData}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        {showLegend && <Legend />}
        <Bar
          dataKey={yAxis}
          fill={color}
          onClick={onDataPointClick}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill={color}
          dataKey={yAxis}
          onClick={onDataPointClick}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        {showLegend && <Legend />}
        <Area
          type="monotone"
          dataKey={yAxis}
          stroke={color}
          fill={color}
          fillOpacity={0.3}
          onClick={onDataPointClick}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey={xAxis} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
        <Radar
          name={title || 'Data'}
          dataKey={yAxis}
          stroke={color}
          fill={color}
          fillOpacity={0.3}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = () => (
    <ResponsiveContainer width={width} height={height}>
      <ScatterChart>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        {showLegend && <Legend />}
        <Scatter
          data={chartData}
          fill={color}
          onClick={onDataPointClick}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderHeatMap = () => {
    // 简单的热力图实现
    const maxValue = Math.max(...chartData.map(d => d[yAxis]));
    const minValue = Math.min(...chartData.map(d => d[yAxis]));
    
    return (
      <div style={{ width, height }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20px, 1fr))', gap: '1px' }}>
          {chartData.map((item, index) => {
            const normalizedValue = (item[yAxis] - minValue) / (maxValue - minValue);
            const intensity = Math.floor(normalizedValue * 255);
            const backgroundColor = `rgb(${intensity}, ${255 - intensity}, 0)`;
            
            return (
              <div
                key={index}
                style={{
                  backgroundColor,
                  padding: '4px',
                  fontSize: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => onDataPointClick?.(item)}
                title={`${item[xAxis]}: ${item[yAxis]}`}
              >
                {item[yAxis]}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      case 'radar':
        return renderRadarChart();
      case 'scatter':
        return renderScatterChart();
      case 'heatmap':
        return renderHeatMap();
      default:
        return renderLineChart();
    }
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div style={{ width, height }}>
      {title && (
        <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>{title}</h3>
      )}
      {renderChart()}
    </div>
  );
};

export default DataVisualization; 