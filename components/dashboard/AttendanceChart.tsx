"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AttendanceData {
  date: string;
  present: number;
  lop: number;
}

export function AttendanceChart({ data }: { data: AttendanceData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white h-full flex flex-col">
        <CardHeader className="bg-slate-50 p-4 border-b border-slate-200">
          <CardTitle className="text-[15px] font-bold text-slate-900">Attendance Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6 text-sm text-slate-500">
          No attendance data available.
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-sm text-sm min-w-[150px]">
          <p className="font-bold text-slate-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 font-semibold flex justify-between">
              <span>Present:</span> <span>{payload[0].value}</span>
            </p>
            <p className="text-amber-600 font-semibold flex justify-between">
              <span>On Leave/LOP:</span> <span>{payload[1].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white h-full flex flex-col">
      <CardHeader className="bg-slate-50 p-4 border-b border-slate-200">
        <CardTitle className="text-[15px] font-bold text-slate-900">Attendance Trend (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              <Area type="monotone" dataKey="lop" name="Leave/LOP" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorLop)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
