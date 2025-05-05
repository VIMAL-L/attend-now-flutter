
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login for demo purposes
      // In real app, this would be a call to Supabase
      if (email === 'admin@example.com' && password === 'password') {
        const adminUser = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        } as User;
        
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        toast({ title: "Login successful", description: "Welcome back, Admin!" });
        navigate('/dashboard');
      } else if (email === 'employee@example.com' && password === 'password') {
        const employeeUser = {
          id: '2',
          email: 'employee@example.com',
          name: 'John Employee',
          role: 'employee'
        } as User;
        
        setUser(employeeUser);
        localStorage.setItem('user', JSON.stringify(employeeUser));
        toast({ title: "Login successful", description: "Welcome back, John!" });
        navigate('/dashboard');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({ 
        variant: "destructive", 
        title: "Login failed", 
        description: (error as Error).message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock register for demo purposes
      // In real app, this would be a call to Supabase
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: 'employee' as const
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast({ title: "Registration successful", description: "Welcome to Employee Attendance!" });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      toast({ 
        variant: "destructive", 
        title: "Registration failed", 
        description: (error as Error).message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({ title: "Logged out", description: "You have been logged out successfully" });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
