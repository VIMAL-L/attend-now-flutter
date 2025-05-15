import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';
import { captureFromWebcam, compareFaces, isFaceMatched } from '@/utils/faceRecognition';

export interface Period {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  location: { lat: number; lng: number };
  locationName: string;
  locationRadius: number; // in meters
}

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
  clockInLocation: { lat: number; lng: number } | null;
  clockOutLocation: { lat: number; lng: number } | null;
  periodAttendance?: {
    periodId: number;
    time: string;
    isPresent: boolean;
    location: { lat: number; lng: number } | null;
  }[];
}

interface AttendanceContextType {
  todayRecord: AttendanceRecord | null;
  attendanceHistory: AttendanceRecord[];
  allEmployeeRecords: AttendanceRecord[];
  clockIn: (periodId?: number) => void;
  clockOut: () => void;
  markAttendanceWithFaceRecognition: (periodId?: number) => Promise<void>;
  isClockedIn: boolean;
  isLoading: boolean;
  periods: Period[];
  currentPeriod: Period | null;
  getNextPeriod: () => Period | null;
  checkLocationMatch: (userLocation: { lat: number; lng: number }, expectedLocation: { lat: number; lng: number }, radius: number) => boolean;
  isProcessingAttendance: boolean;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Mock periods for the day
const mockPeriods: Period[] = [
  { 
    id: 1, 
    name: '1st Period', 
    startTime: '08:00', 
    endTime: '08:50', 
    location: { lat: 37.7749, lng: -122.4194 },
    locationName: 'Main Building',
    locationRadius: 100
  },
  { 
    id: 2, 
    name: '2nd Period', 
    startTime: '09:00', 
    endTime: '09:50', 
    location: { lat: 37.7749, lng: -122.4194 },
    locationName: 'Main Building',
    locationRadius: 100
  },
  { 
    id: 3, 
    name: '3rd Period', 
    startTime: '10:00', 
    endTime: '10:50', 
    location: { lat: 37.7749, lng: -122.4194 },
    locationName: 'Science Lab',
    locationRadius: 100
  },
  { 
    id: 4, 
    name: '4th Period', 
    startTime: '11:00', 
    endTime: '11:50', 
    location: { lat: 37.7750, lng: -122.4195 },
    locationName: 'Library',
    locationRadius: 100
  },
  { 
    id: 5, 
    name: '5th Period', 
    startTime: '13:00', 
    endTime: '13:50', 
    location: { lat: 37.7751, lng: -122.4196 },
    locationName: 'Gym',
    locationRadius: 100
  },
  { 
    id: 6, 
    name: '6th Period', 
    startTime: '14:00', 
    endTime: '14:50', 
    location: { lat: 37.7749, lng: -122.4194 },
    locationName: 'Computer Lab',
    locationRadius: 100
  },
  { 
    id: 7, 
    name: '7th Period', 
    startTime: '15:00', 
    endTime: '15:50', 
    location: { lat: 37.7749, lng: -122.4194 },
    locationName: 'Art Room',
    locationRadius: 100
  },
  { 
    id: 8, 
    name: '8th Period', 
    startTime: '16:00', 
    endTime: '16:50', 
    location: { lat: 37.7749, lng: -122.4194 },
    locationName: 'Main Building',
    locationRadius: 100
  }
];

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
    location: 'Office',
    clockInLocation: { lat: 37.7749, lng: -122.4194 },
    clockOutLocation: { lat: 37.7749, lng: -122.4194 }
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
    location: 'Office',
    clockInLocation: { lat: 37.7749, lng: -122.4194 },
    clockOutLocation: { lat: 37.7749, lng: -122.4194 }
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
    location: 'Office',
    clockInLocation: { lat: 37.7749, lng: -122.4194 },
    clockOutLocation: { lat: 37.7749, lng: -122.4194 }
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
    location: 'Office',
    clockInLocation: { lat: 37.7749, lng: -122.4194 },
    clockOutLocation: { lat: 37.7749, lng: -122.4194 }
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
    location: 'Office',
    clockInLocation: { lat: 37.7749, lng: -122.4194 },
    clockOutLocation: { lat: 37.7749, lng: -122.4194 }
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
    location: null,
    clockInLocation: null,
    clockOutLocation: null
  }
];

// Mock user face data
const mockUserFaces: Record<string, string> = {
  '1': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDvvD/7D3/BPzWP2fLm+m8A+CYfGDweZHcQeHrUPHd55M9n3j25TRXP+E/hn8GpvCuZP+EO8NLz/wAs9Eh/+N0V+OV83x9WpJxqSs3/ADM/ir6vmcm7Tb9Wfr7p3gjw5plrHBbaVYRQwxrHGgtYxtVQFUcL0AAH0FW/+EV0P/oF2P8A4Cx//E14J/w1x/z7H/vtv/iqP+GuP+fY/wDfbf8AxVfnyx+Mez9T5D61jNve+8+g/wDhFdD/AOgXY/8AgLH/APE0f8Irof8A0C7H/wABY/8A4mvn/wD4a4/59j/323/xVH/DXH/Psf8Avtv/AIqj+0MZ2D67jPP7z6A/4RXQ/wDoF2P/AICx/wDxNH/CK6H/ANAux/8AAWP/AOJr5/8A+GuP+fY/99t/8VR/w1x/z7H/AL7b/wCKo/tDGdg+u4zz+8+gP+EV0P8A6Bdj/wCAsf8A8TR/wiuh/wDQLsf/AAFj/wDia+f/APhrj/n2P/fbf/FVY0n9q5vtcf8AoqxPzEyfMb+8nt9BVRzDGPa4fXsZ5/efv5o//BJv9g17KNn+HXhqNmjUtmwhPJ+tFFenfD/RtLbwlYk6fZklYyc28Z5x/sFFFftuFxGKVGN6kvvZ5P8ArDjf+fkv/AmfMn/DrP8AY0/6Jz4d/wDAKD/4ij/h1n+xp/0Tnw7/AOAUH/xFFFc31zE/8/Jf+BS/zMf9YcZ/z+l/4Ez/2Q==',
  '2': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDvvD/7D3/BPzWP2fLm+m8A+CYfGDweZHcQeHrUPHd55M9n3j25TRXP+E/hn8GpvCuZP+EO8NLz/wAs9Eh/+N0V+OV83x9WpJxqSs3/ADM/ir6vmcm7Tb9Wfr7p3gjw5plrHBbaVYRQwxrHGgtYxtVQFUcL0AAH0FW/+EV0P/oF2P8A4Cx//E14J/w1x/z7H/vtv/iqP+GuP+fY/wDfbf8AxVfnyx+Mez9T5D61jNve+8+g/wDhFdD/AOgXY/8AgLH/APE0f8Irof8A0C7H/wABY/8A4mvn/wD4a4/59j/323/xVH/DXH/Psf8Avtv/AIqj+0MZ2D67jPP7z6A/4RXQ/wDoF2P/AICx/wDxNH/CK6H/ANAux/8AAWP/AOJr5/8A+GuP+fY/99t/8VR/w1x/z7H/AL7b/wCKo/tDGdg+u4zz+8+gP+EV0P8A6Bdj/wCAsf8A8TR/wiuh/wDQLsf/AAFj/wDia+f/APhrj/n2P/fbf/FVY0n9q5vtcf8AoqxPzEyfMb+8nt9BVRzDGPa4fXsZ5/efv5o//BJv9g17KNn+HXhqNmjUtmwhPJ+tFFenfD/RtLbwlYk6fZklYyc28Z5x/sFFFftuFxGKVGN6kvvZ5P8ArDjf+fkv/AmfMn/DrP8AY0/6Jz4d/wDAKD/4ij/h1n+xp/0Tnw7/AOAUH/xFFFc31zE/8/Jf+BS/zMf9YcZ/z+l/4Ez/2Q==',
  '3': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAyADIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDvvD/7D3/BPzWP2fLm+m8A+CYfGDweZHcQeHrUPHd55M9n3j25TRXP+E/hn8GpvCuZP+EO8NLz/wAs9Eh/+N0V+OV83x9WpJxqSs3/ADM/ir6vmcm7Tb9Wfr7p3gjw5plrHBbaVYRQwxrHGgtYxtVQFUcL0AAH0FW/+EV0P/oF2P8A4Cx//E14J/w1x/z7H/vtv/iqP+GuP+fY/wDfbf8AxVfnyx+Mez9T5D61jNve+8+g/wDhFdD/AOgXY/8AgLH/APE0f8Irof8A0C7H/wABY/8A4mvn/wD4a4/59j/323/xVH/DXH/Psf8Avtv/AIqj+0MZ2D67jPP7z6A/4RXQ/wDoF2P/AICx/wDxNH/CK6H/ANAux/8AAWP/AOJr5/8A+GuP+fY/99t/8VR/w1x/z7H/AL7b/wCKo/tDGdg+u4zz+8+gP+EV0P8A6Bdj/wCAsf8A8TR/wiuh/wDQLsf/AAFj/wDia+f/APhrj/n2P/fbf/FVY0n9q5vtcf8AoqxPzEyfMb+8nt9BVRzDGPa4fXsZ5/efv5o//BJv9g17KNn+HXhqNmjUtmwhPJ+tFFenfD/RtLbwlYk6fZklYyc28Z5x/sFFFftuFxGKVGN6kvvZ5P8ArDjf+fkv/AmfMn/DrP8AY0/6Jz4d/wDAKD/4ij/h1n+xp/0Tnw7/AOAUH/xFFFc31zE/8/Jf+BS/zMf9YcZ/z+l/4Ez/2Q==',
};

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [allEmployeeRecords, setAllEmployeeRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [isProcessingAttendance, setIsProcessingAttendance] = useState(false);
  
  const isClockedIn = todayRecord?.clockInTime && !todayRecord?.clockOutTime;

  useEffect(() => {
    if (user) {
      loadAttendanceData();
    }

    // Set up interval to check current period
    const intervalId = setInterval(updateCurrentPeriod, 60000); // check every minute
    updateCurrentPeriod(); // Initial check

    return () => clearInterval(intervalId);
  }, [user]);

  // Function to update the current period based on current time
  const updateCurrentPeriod = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const period = mockPeriods.find(p => {
      return currentTime >= p.startTime && currentTime <= p.endTime;
    });
    
    setCurrentPeriod(period || null);
  };

  // Function to get the next upcoming period
  const getNextPeriod = (): Period | null => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const nextPeriod = mockPeriods.find(p => p.startTime > currentTime);
    return nextPeriod || null;
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if user location matches expected location within radius
  const checkLocationMatch = (
    userLocation: { lat: number; lng: number },
    expectedLocation: { lat: number; lng: number },
    radius: number
  ): boolean => {
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      expectedLocation.lat, 
      expectedLocation.lng
    );
    return distance <= radius;
  };

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
          location: null,
          clockInLocation: null,
          clockOutLocation: null,
          periodAttendance: []
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

  // Function to get current location
  const getCurrentLocation = async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting location', error);
            // For demo purposes, use mock location
            resolve({ lat: 37.7749, lng: -122.4194 });
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        console.error('Geolocation not supported by this browser');
        // For demo purposes, use mock location
        resolve({ lat: 37.7749, lng: -122.4194 });
      }
    });
  };

  const clockIn = async (periodId?: number) => {
    if (!user) return;
    
    try {
      // Get current location
      const location = await getCurrentLocation();
      
      // Get current time in HH:MM format
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      
      // If this is for a specific period, verify location
      if (periodId) {
        const period = mockPeriods.find(p => p.id === periodId);
        
        if (!period) {
          toast({
            variant: "destructive",
            title: "Period Not Found",
            description: "Could not find the specified period."
          });
          return;
        }
        
        // Check if the current time is within the period's time range
        if (currentTime < period.startTime || currentTime > period.endTime) {
          toast({
            variant: "destructive",
            title: "Outside Period Hours",
            description: `You can only clock in during ${period.name} (${period.startTime} - ${period.endTime}).`
          });
          return;
        }
        
        // Check if location matches
        const locationMatches = checkLocationMatch(location, period.location, period.locationRadius);
        
        if (!locationMatches) {
          toast({
            variant: "destructive",
            title: "Location Mismatch",
            description: `You must be at ${period.locationName} to clock in for this period.`
          });
          return;
        }
        
        // Update period attendance
        const updatedRecord = { ...todayRecord } as AttendanceRecord;
        
        // Initialize periodAttendance if it doesn't exist
        if (!updatedRecord.periodAttendance) {
          updatedRecord.periodAttendance = [];
        }
        
        // Check if already clocked in for this period
        const existingPeriodAttendance = updatedRecord.periodAttendance.find(p => p.periodId === periodId);
        
        if (existingPeriodAttendance) {
          toast({
            variant: "destructive",
            title: "Already Clocked In",
            description: `You have already clocked in for ${period.name}.`
          });
          return;
        }
        
        // Add attendance for this period
        updatedRecord.periodAttendance.push({
          periodId,
          time: currentTime,
          isPresent: true,
          location
        });
        
        // First period attendance also counts as clock in for the day
        if (!updatedRecord.clockInTime) {
          updatedRecord.clockInTime = currentTime;
          updatedRecord.clockInLocation = location;
          updatedRecord.status = 'present';
          updatedRecord.location = period.locationName;
        }
        
        setTodayRecord(updatedRecord);
        
        toast({ 
          title: `${period.name} Attendance Marked`, 
          description: `Successfully marked present for ${period.name} at ${currentTime}`
        });
      } else {
        // Regular clock in (not period-specific)
        const updatedRecord: AttendanceRecord = {
          ...(todayRecord as AttendanceRecord),
          clockInTime: currentTime,
          status: 'present',
          location: 'Office', // In a real app this could be determined by geofencing
          clockInLocation: location
        };
        
        setTodayRecord(updatedRecord);
        
        toast({ 
          title: "Clocked In", 
          description: `Successfully clocked in at ${currentTime} with location tracking`
        });
      }
    } catch (error) {
      console.error('Error getting location', error);
      toast({ 
        variant: "destructive",
        title: "Clock In Failed", 
        description: "Could not access location. Please enable location services."
      });
    }
  };

  const clockOut = async () => {
    if (!user || !todayRecord) return;
    
    try {
      // Get current location
      const location = await getCurrentLocation();
      
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
      
      // Update today's record with location data
      const updatedRecord: AttendanceRecord = {
        ...todayRecord,
        clockOutTime: currentTime,
        totalHours,
        status: totalHours < 4 ? 'half-day' : 'present',
        clockOutLocation: location
      };
      
      setTodayRecord(updatedRecord);
      
      toast({ 
        title: "Clocked Out", 
        description: `Successfully clocked out at ${currentTime}. Total hours: ${totalHours.toFixed(2)}`
      });
    } catch (error) {
      console.error('Error getting location', error);
      toast({ 
        variant: "destructive",
        title: "Clock Out Failed", 
        description: "Could not access location. Please enable location services."
      });
    }
  };

  const markAttendanceWithFaceRecognition = async (periodId?: number) => {
    if (!user) return;
    
    try {
      setIsProcessingAttendance(true);
      
      // Step 1: Capture current face from webcam
      toast({ title: "Capturing", description: "Please look at the camera..." });
      const currentFaceImage = await captureFromWebcam();
      
      // Step 2: Get the stored face for this user
      // In a real app, this would be fetched from a database
      const storedFaceImage = mockUserFaces[user.id] || mockUserFaces['2']; // Default to a mock image
      
      if (!storedFaceImage) {
        toast({ 
          variant: "destructive",
          title: "Face Recognition Error", 
          description: "No stored face found for your profile. Please update your profile with a face image."
        });
        return;
      }
      
      // Step 3: Compare the faces
      toast({ title: "Processing", description: "Verifying your identity..." });
      const similarityScore = await compareFaces(currentFaceImage, storedFaceImage);
      const faceMatched = isFaceMatched(similarityScore);
      
      if (!faceMatched) {
        toast({ 
          variant: "destructive",
          title: "Face Recognition Failed", 
          description: "Your face could not be verified. Please try again with better lighting."
        });
        return;
      }
      
      // Step 4: Get current location
      toast({ title: "Verifying Location", description: "Checking your location..." });
      const location = await getCurrentLocation();
      
      // Step 5: Get current time in HH:MM format
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      
      // If this is for a specific period, verify location
      if (periodId) {
        const period = mockPeriods.find(p => p.id === periodId);
        
        if (!period) {
          toast({
            variant: "destructive",
            title: "Period Not Found",
            description: "Could not find the specified period."
          });
          return;
        }
        
        // Check if the current time is within the period's time range
        if (currentTime < period.startTime || currentTime > period.endTime) {
          toast({
            variant: "destructive",
            title: "Outside Period Hours",
            description: `You can only mark attendance during ${period.name} (${period.startTime} - ${period.endTime}).`
          });
          return;
        }
        
        // Check if location matches
        const locationMatches = checkLocationMatch(location, period.location, period.locationRadius);
        
        if (!locationMatches) {
          toast({
            variant: "destructive",
            title: "Location Mismatch",
            description: `You must be at ${period.locationName} to mark attendance for this period.`
          });
          return;
        }
        
        // Update period attendance
        const updatedRecord = { ...todayRecord } as AttendanceRecord;
        
        // Initialize periodAttendance if it doesn't exist
        if (!updatedRecord.periodAttendance) {
          updatedRecord.periodAttendance = [];
        }
        
        // Check if already clocked in for this period
        const existingPeriodAttendance = updatedRecord.periodAttendance.find(p => p.periodId === periodId);
        
        if (existingPeriodAttendance) {
          toast({
            variant: "destructive",
            title: "Already Marked",
            description: `You have already marked attendance for ${period.name}.`
          });
          return;
        }
        
        // Add attendance for this period
        updatedRecord.periodAttendance.push({
          periodId,
          time: currentTime,
          isPresent: true,
          location
        });
        
        // First period attendance also counts as clock in for the day
        if (!updatedRecord.clockInTime) {
          updatedRecord.clockInTime = currentTime;
          updatedRecord.clockInLocation = location;
          updatedRecord.status = 'present';
          updatedRecord.location = period.locationName;
        }
        
        setTodayRecord(updatedRecord);
        
        toast({ 
          title: `${period.name} Attendance Marked`, 
          description: `Successfully marked present for ${period.name} at ${currentTime}`
        });
      } else {
        // Regular clock in (not period-specific)
        const updatedRecord: AttendanceRecord = {
          ...(todayRecord as AttendanceRecord),
          clockInTime: currentTime,
          status: 'present',
          location: 'Office', // In a real app this could be determined by geofencing
          clockInLocation: location
        };
        
        setTodayRecord(updatedRecord);
        
        toast({ 
          title: "Attendance Marked", 
          description: `Successfully marked attendance at ${currentTime}`
        });
      }
    } catch (error) {
      console.error('Error during face recognition', error);
      toast({ 
        variant: "destructive",
        title: "Attendance Marking Failed", 
        description: "An error occurred while processing your request. Please try again."
      });
    } finally {
      setIsProcessingAttendance(false);
    }
  };

  return (
    <AttendanceContext.Provider value={{ 
      todayRecord, 
      attendanceHistory,
      allEmployeeRecords,
      clockIn, 
      clockOut, 
      markAttendanceWithFaceRecognition,
      isClockedIn,
      isLoading,
      periods: mockPeriods,
      currentPeriod,
      getNextPeriod,
      checkLocationMatch,
      isProcessingAttendance
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
