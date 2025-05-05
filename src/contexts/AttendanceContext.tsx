
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalHours: number | null;
  status: 'present' | 'absent' | 'half-day' | null;
  location: string | null;
}

interface AttendanceContextType {
  todayRecord: AttendanceRecord | null;
  attendanceHistory: AttendanceRecord[];
  allEmployeeRecords: AttendanceRecord[];
  clockIn: () => void;
  clockOut: () => void;
  isClockedIn: boolean;
  isLoading: boolean;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Mock data for attendance records
const mockAttendanceData: AttendanceRecord[] = [
  {
    id: '1',
    userId: '2',
    userName: 'John Employee',
    date: '2025-05-04', // Yesterday
    clockInTime: '08:30',
    clockOutTime: '17:15',
    totalHours: 8.75,
    status: 'present',
    location: 'Office'
  },
  {
    id: '2',
    userId: '2',
    userName: 'John Employee',
    date: '2025-05-03',
    clockInTime: '08:45',
    clockOutTime: '17:30',
    totalHours: 8.75,
    status: 'present',
    location: 'Office'
  },
  {
    id: '3',
    userId: '2',
    userName: 'John Employee',
    date: '2025-05-02',
    clockInTime: '09:00',
    clockOutTime: '14:00',
    totalHours: 5,
    status: 'half-day',
    location: 'Office'
  },
  {
    id: '4',
    userId: '3',
    userName: 'Jane Smith',
    date: '2025-05-04', // Yesterday
    clockInTime: '08:15',
    clockOutTime: '16:45',
    totalHours: 8.5,
    status: 'present',
    location: 'Office'
  },
  {
    id: '5',
    userId: '4',
    userName: 'Mike Johnson',
    date: '2025-05-04', // Yesterday
    clockInTime: '08:00',
    clockOutTime: '17:00',
    totalHours: 9,
    status: 'present',
    location: 'Office'
  },
  {
    id: '6',
    userId: '5',
    userName: 'Sarah Williams',
    date: '2025-05-04', // Yesterday
    clockInTime: null,
    clockOutTime: null,
    totalHours: null,
    status: 'absent',
    location: null
  }
];

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [allEmployeeRecords, setAllEmployeeRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isClockedIn = todayRecord?.clockInTime && !todayRecord?.clockOutTime;

  useEffect(() => {
    if (user) {
      loadAttendanceData();
    }
  }, [user]);

  const loadAttendanceData = () => {
    setIsLoading(true);
    
    // Mock loading attendance data
    setTimeout(() => {
      // Create today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      if (user) {
        // Find today's record for this user
        const existingTodayRecord = mockAttendanceData.find(
          record => record.userId === user.id && record.date === today
        );
        
        // Set today's record or create a new one if it doesn't exist
        setTodayRecord(existingTodayRecord || {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userName: user.name,
          date: today,
          clockInTime: null,
          clockOutTime: null,
          totalHours: null,
          status: null,
          location: null
        });
        
        // Get attendance history for this user (excluding today)
        setAttendanceHistory(
          mockAttendanceData
            .filter(record => record.userId === user.id && record.date !== today)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        
        // For admin users, get all employee records
        if (user.role === 'admin') {
          setAllEmployeeRecords(mockAttendanceData.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ));
        }
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const clockIn = () => {
    if (!user) return;
    
    // Get current time in HH:MM format
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    // Update today's record
    const updatedRecord: AttendanceRecord = {
      ...(todayRecord as AttendanceRecord),
      clockInTime: currentTime,
      status: 'present',
      location: 'Office' // In a real app this would come from location services
    };
    
    setTodayRecord(updatedRecord);
    
    toast({ 
      title: "Clocked In", 
      description: `Successfully clocked in at ${currentTime}`
    });
  };

  const clockOut = () => {
    if (!user || !todayRecord) return;
    
    // Get current time in HH:MM format
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    // Calculate total hours
    const clockInParts = todayRecord.clockInTime?.split(':').map(Number) || [0, 0];
    const clockOutParts = currentTime.split(':').map(Number);
    
    const clockInMinutes = clockInParts[0] * 60 + clockInParts[1];
    const clockOutMinutes = clockOutParts[0] * 60 + clockOutParts[1];
    const totalMinutes = clockOutMinutes - clockInMinutes;
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
    
    // Update today's record
    const updatedRecord: AttendanceRecord = {
      ...todayRecord,
      clockOutTime: currentTime,
      totalHours,
      status: totalHours < 4 ? 'half-day' : 'present'
    };
    
    setTodayRecord(updatedRecord);
    
    toast({ 
      title: "Clocked Out", 
      description: `Successfully clocked out at ${currentTime}. Total hours: ${totalHours.toFixed(2)}`
    });
  };

  return (
    <AttendanceContext.Provider value={{ 
      todayRecord, 
      attendanceHistory,
      allEmployeeRecords,
      clockIn, 
      clockOut, 
      isClockedIn,
      isLoading
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
