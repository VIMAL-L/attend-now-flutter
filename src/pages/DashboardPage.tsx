import React from 'react';
import Layout from '@/components/Layout';
import ClockInOutCard from '@/components/ClockInOutCard';
import AttendanceTable from '@/components/AttendanceTable';
import AttendanceSummary from '@/components/AttendanceSummary';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar, User, FileText, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const { user } = useAuth();
  const { 
    attendanceHistory, 
    allEmployeeRecords, 
    isLoading 
  } = useAttendance();
  const isAdmin = user?.role === 'admin';
  
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        {!isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ClockInOutCard />
            </div>
            <div className="lg:col-span-2">
              <AttendanceSummary records={attendanceHistory} />
            </div>
          </div>
        )}
        
        {isAdmin ? (
          <Tabs defaultValue="employees">
            <TabsList className="mb-6">
              <TabsTrigger value="employees">
                <Users className="h-4 w-4 mr-1" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="h-4 w-4 mr-1" />
                Reports
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="employees">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Employee Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input placeholder="Search employees..." className="sm:w-80" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <AttendanceTable 
                records={allEmployeeRecords} 
                title="Employee Attendance" 
                showUser={true} 
              />
            </TabsContent>
            
            <TabsContent value="reports">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Generate Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select defaultValue="weekly">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Report</SelectItem>
                        <SelectItem value="weekly">Weekly Report</SelectItem>
                        <SelectItem value="monthly">Monthly Report</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button>
                      <FileText className="mr-1 h-4 w-4" />
                      Generate Report
                    </Button>
                    
                    <Button >
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Total Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="text-3xl font-bold">15</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Present Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      <span className="text-3xl font-bold">12</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Average Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="text-3xl font-bold">7.5</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <AttendanceTable records={attendanceHistory} title="My Recent Attendance" />
        )}
      </div>
    </Layout>
  );
}
