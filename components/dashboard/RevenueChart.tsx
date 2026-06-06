"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueData {
  month: string;
  revenue: number;
}

export function RevenueChart({ data }: { data: RevenueData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white h-full flex flex-col">
        <CardHeader className="bg-slate-50 p-4 border-b border-slate-200">
          <CardTitle className="text-[15px] font-bold text-slate-900">Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6 text-sm text-slate-500">
          No revenue data available yet.
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-sm text-sm">
          <p className="font-bold text-slate-900 mb-1">{label}</p>
          <p className="text-[#0176D3] font-semibold">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white h-full flex flex-col">
      <CardHeader className="bg-slate-50 p-4 border-b border-slate-200">
        <CardTitle className="text-[15px] font-bold text-slate-900">Revenue Trend (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => \`₹\${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}\`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar 
                dataKey="revenue" 
                fill="#0176D3" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
