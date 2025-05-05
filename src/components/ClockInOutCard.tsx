
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SlideToAction from './SlideToAction';
import { useAttendance } from '@/contexts/AttendanceContext';

export default function ClockInOutCard() {
  const { todayRecord, clockIn, clockOut, isClockedIn } = useAttendance();
  
  // Get current time for display
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  
  // Format date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const handleSlideComplete = () => {
    if (isClockedIn) {
      clockOut();
    } else {
      clockIn();
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-primary">
          {formattedDate}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Current Time</p>
            <p className="text-2xl font-bold">
              {currentTime}
            </p>
          </div>
          
          <div className="h-12 w-[1px] bg-gray-200"></div>
          
          <div className="space-y-1 text-right">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold">
              {isClockedIn ? (
                <span className="text-green-500">Working</span>
              ) : todayRecord?.clockOutTime ? (
                <span className="text-blue-500">Day Complete</span>
              ) : (
                <span className="text-gray-500">Not Clocked In</span>
              )}
            </p>
          </div>
        </div>
        
        {todayRecord?.clockInTime && (
          <div className="grid grid-cols-2 gap-6 py-3">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Clock In</p>
              <p className="text-lg font-medium">{todayRecord.clockInTime}</p>
            </div>
            
            {todayRecord.clockOutTime ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Clock Out</p>
                <p className="text-lg font-medium">{todayRecord.clockOutTime}</p>
              </div>
            ) : null}
          </div>
        )}
        
        {todayRecord?.totalHours ? (
          <div className="py-2 text-center bg-primary/10 rounded-lg">
            <p className="text-sm text-gray-600">Total Hours Today</p>
            <p className="text-2xl font-bold text-primary">{todayRecord.totalHours.toFixed(2)}</p>
          </div>
        ) : null}
        
        {todayRecord && (!todayRecord.clockInTime || !todayRecord.clockOutTime) && (
          <SlideToAction
            onComplete={handleSlideComplete}
            text={isClockedIn ? "Slide to Clock Out" : "Slide to Clock In"}
            completeText={isClockedIn ? "Clocked Out!" : "Clocked In!"}
            disabled={todayRecord?.clockInTime && todayRecord?.clockOutTime}
            className="mt-4"
          />
        )}
      </CardContent>
    </Card>
  );
}
