
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceRecord } from '@/contexts/AttendanceContext';

interface AttendanceSummaryProps {
  records: AttendanceRecord[];
}

export default function AttendanceSummary({ records }: AttendanceSummaryProps) {
  // Calculate summary statistics
  const totalRecords = records.length;
  const presentDays = records.filter(r => r.status === 'present').length;
  const halfDays = records.filter(r => r.status === 'half-day').length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  
  // Calculate total hours
  const totalHours = records.reduce((sum, record) => {
    return sum + (record.totalHours || 0);
  }, 0);
  
  // Calculate average hours per day (excluding absent days)
  const daysWithHours = records.filter(r => r.totalHours).length;
  const averageHours = daysWithHours > 0 
    ? totalHours / daysWithHours 
    : 0;
  
  // Summary cards data
  const summaryCards = [
    { title: 'Total Days', value: totalRecords, color: 'bg-blue-50 text-blue-700' },
    { title: 'Present', value: presentDays, color: 'bg-green-50 text-green-700' },
    { title: 'Half Days', value: halfDays, color: 'bg-yellow-50 text-yellow-700' },
    { title: 'Absent', value: absentDays, color: 'bg-red-50 text-red-700' },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div key={card.title} className={`p-4 rounded-lg ${card.color}`}>
              <h3 className="font-medium">{card.title}</h3>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-700">Total Hours</h3>
            <p className="text-2xl font-bold mt-1">{totalHours.toFixed(2)}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-700">Average Hours/Day</h3>
            <p className="text-2xl font-bold mt-1">{averageHours.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
