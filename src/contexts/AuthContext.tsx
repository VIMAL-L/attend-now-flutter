
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }
        
        if (data.session?.user) {
          const userData = data.session.user;
          setUser({
            id: userData.id,
            email: userData.email!,
            name: userData.user_metadata?.name || userData.email!,
            role: userData.user_metadata?.role || 'employee',
          });
        }
      } catch (error) {
        console.error('Unexpected error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const userData = session.user;
          setUser({
            id: userData.id,
            email: userData.email!,
            name: userData.user_metadata?.name || userData.email!,
            role: userData.user_metadata?.role || 'employee',
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data.user;
      setUser({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!,
        role: user.user_metadata?.role || 'employee',
      });

      toast({ title: "Login successful", description: `Welcome back, ${user.email}` });
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'employee' },
        },
      });
      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account before logging in.",
      });

      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({ title: "Logged out", description: "You have been logged out successfully" });
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Logout failed", 
        description: (error as Error).message
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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
