
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceRecord } from '@/contexts/AttendanceContext';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  title?: string;
  showUser?: boolean;
}

export default function AttendanceTable({ 
  records, 
  title = "Attendance History", 
  showUser = false 
}: AttendanceTableProps) {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-500">Absent</Badge>;
      case 'half-day':
        return <Badge className="bg-yellow-500">Half Day</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {showUser && <TableHead>Employee</TableHead>}
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length > 0 ? (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    {showUser && <TableCell>{record.userName}</TableCell>}
                    <TableCell>{record.clockInTime || '—'}</TableCell>
                    <TableCell>{record.clockOutTime || '—'}</TableCell>
                    <TableCell>
                      {record.totalHours ? record.totalHours.toFixed(2) : '—'}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={showUser ? 6 : 5} className="text-center py-4">
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
