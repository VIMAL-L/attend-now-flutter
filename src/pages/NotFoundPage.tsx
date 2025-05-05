
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-6">
        <Calendar className="h-16 w-16 text-primary mx-auto" />
        
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        
        <h2 className="text-3xl font-semibold text-gray-700">
          Page Not Found
        </h2>
        
        <p className="text-gray-500 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Button asChild className="mt-6">
          <Link to="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
