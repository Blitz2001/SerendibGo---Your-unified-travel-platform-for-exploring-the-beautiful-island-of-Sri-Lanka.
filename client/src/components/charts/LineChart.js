import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, title, color = 'blue' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const getColor = (color) => {
    switch (color) {
      case 'green': return '#10b981';
      case 'red': return '#ef4444';
      case 'purple': return '#8b5cf6';
      case 'yellow': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  // Transform data for Recharts
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    amount: item.amount || item.value,
    count: item.count || item.value
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#374151', fontWeight: '600' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getColor(color)} 
              strokeWidth={2}
              dot={{ fill: getColor(color), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: getColor(color), strokeWidth: 2 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;
