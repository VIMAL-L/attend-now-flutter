
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SlideToAction from './SlideToAction';
import { useAttendance } from '@/contexts/AttendanceContext';
import { MapPin, Clock, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function ClockInOutCard() {
  const { 
    todayRecord, 
    clockIn, 
    clockOut, 
    isClockedIn, 
    periods, 
    currentPeriod,
    getNextPeriod,
    markAttendanceWithFaceRecognition,
    isProcessingAttendance
  } = useAttendance();
  
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(
    currentPeriod ? currentPeriod.id : null
  );
  const [showCamera, setShowCamera] = useState(false);
  
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
  
  const handleSlideComplete = async () => {
    if (isClockedIn) {
      clockOut();
    } else if (selectedPeriodId) {
      await markAttendanceWithFaceRecognition(selectedPeriodId);
    } else {
      await markAttendanceWithFaceRecognition();
    }
  };

  const handleAttendanceWithFace = async () => {
    try {
      setShowCamera(true);
      if (selectedPeriodId) {
        await markAttendanceWithFaceRecognition(selectedPeriodId);
      } else {
        await markAttendanceWithFaceRecognition();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Face Recognition Failed",
        description: "There was a problem with face recognition. Please try again."
      });
    } finally {
      setShowCamera(false);
    }
  };

  // Format location for display
  const formatLocation = (location: { lat: number; lng: number } | null) => {
    if (!location) return 'Not available';
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  };
  
  // Check if a period has attendance marked
  const isPeriodMarked = (periodId: number) => {
    if (!todayRecord?.periodAttendance) return false;
    return todayRecord.periodAttendance.some(p => p.periodId === periodId && p.isPresent);
  };
  
  // Get next period if no current period
  const nextPeriod = !currentPeriod ? getNextPeriod() : null;

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-primary">
          {formattedDate}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="status">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="periods">Periods</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-6">
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
                    <span className="text-green-500">present</span>
                  ) : todayRecord?.clockOutTime ? (
                    <span className="text-blue-500">Period Complete</span>
                  ) : (
                    <span className="text-gray-500">Not Clocked In</span>
                  )}
                </p>
              </div>
            </div>
            
            {currentPeriod && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Current Period</p>
                    <p className="text-lg font-medium">{currentPeriod.name}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{currentPeriod.startTime} - {currentPeriod.endTime}</span>
                    </div>
                  </div>
                  <div>
                    <Badge variant={isPeriodMarked(currentPeriod.id) ? "success" : "outline"}>
                      {isPeriodMarked(currentPeriod.id) ? "Present" : "Not Marked"}
                    </Badge>
                    {isPeriodMarked(currentPeriod.id) && (
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        Marked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {!currentPeriod && nextPeriod && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Next Period</p>
                    <p className="text-lg font-medium">{nextPeriod.name}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{nextPeriod.startTime} - {nextPeriod.endTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {todayRecord?.clockInTime && (
              <div className="grid grid-cols-2 gap-6 py-3">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Clock In</p>
                  <p className="text-lg font-medium">{todayRecord.clockInTime}</p>
                  {todayRecord.clockInLocation && (
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{formatLocation(todayRecord.clockInLocation)}</span>
                    </div>
                  )}
                </div>
                
                {todayRecord.clockOutTime ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Clock Out</p>
                    <p className="text-lg font-medium">{todayRecord.clockOutTime}</p>
                    {todayRecord.clockOutLocation && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{formatLocation(todayRecord.clockOutLocation)}</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
            
            {todayRecord?.totalHours ? (
              <div className="py-2 text-center bg-primary/10 rounded-lg">
                <p className="text-sm text-gray-600">Total Hours present</p>
                <p className="text-2xl font-bold text-primary">{todayRecord.totalHours.toFixed(2)}</p>
              </div>
            ) : null}
            
            {currentPeriod && !isPeriodMarked(currentPeriod.id) && (
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleAttendanceWithFace}
                  disabled={isProcessingAttendance}
                >
                  <Camera className="h-4 w-4" />
                  <span>{isProcessingAttendance ? 'Processing...' : 'Mark Attendance with Face Recognition'}</span>
                </Button>
                
                <SlideToAction
                  onComplete={handleSlideComplete}
                  text={`Slide to Mark ${currentPeriod.name}`}
                  completeText="Attendance Marked!"
                  disabled={isProcessingAttendance}
                />
              </div>
            )}
            
            {!currentPeriod && !todayRecord?.clockOutTime && (
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleAttendanceWithFace}
                  disabled={isProcessingAttendance}
                >
                  <Camera className="h-4 w-4" />
                  <span>{isProcessingAttendance ? 'Processing...' : 'Mark Attendance with Face Recognition'}</span>
                </Button>
                
                <SlideToAction
                  onComplete={handleSlideComplete}
                  text={isClockedIn ? "Slide to Clock Out" : "Slide to Clock In"}
                  completeText={isClockedIn ? "Clocked Out!" : "Clocked In!"}
                  disabled={isProcessingAttendance}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="periods" className="space-y-4">
            <p className="text-sm text-gray-500">Today's Periods</p>
            
            <div className="space-y-3">
              {periods.map((period) => {
                const isMarked = isPeriodMarked(period.id);
                const isCurrent = currentPeriod?.id === period.id;
                const isPast = currentTime > period.endTime;
                const isFuture = currentTime < period.startTime;
                
                return (
                  <div 
                    key={period.id}
                    className={`p-3 rounded-lg border ${isCurrent ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                    onClick={() => setSelectedPeriodId(period.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-md font-medium">{period.name}</span>
                          {isCurrent && <Badge variant="outline" className="text-xs">Current</Badge>}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{period.startTime} - {period.endTime}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{period.locationName}</span>
                        </div>
                      </div>
                      
                      <Badge variant={isMarked ? "success" : isPast ? "destructive" : "outline"}>
                        {isMarked ? "Present" : isPast ? "Missed" : "Upcoming"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {currentPeriod && !isPeriodMarked(currentPeriod.id) && (
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleAttendanceWithFace}
                  disabled={isProcessingAttendance}
                >
                  <Camera className="h-4 w-4" />
                  <span>{isProcessingAttendance ? 'Processing...' : 'Mark Attendance with Face Recognition'}</span>
                </Button>
                
                <SlideToAction
                  onComplete={handleSlideComplete}
                  text={`Mark Attendance for ${currentPeriod.name}`}
                  completeText="Attendance Marked!"
                  disabled={isProcessingAttendance}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
