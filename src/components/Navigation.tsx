
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, CheckSquare, Home } from 'lucide-react';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center space-x-2 mb-6 p-4 bg-white border-b">
      <Button
        variant={location.pathname === '/' ? 'default' : 'outline'}
        onClick={() => navigate('/')}
        className="flex items-center space-x-2"
      >
        <Home className="h-4 w-4" />
        <span>Workflow Builder</span>
      </Button>
      
      <Button
        variant={location.pathname === '/approvals' ? 'default' : 'outline'}
        onClick={() => navigate('/approvals')}
        className="flex items-center space-x-2"
      >
        <CheckSquare className="h-4 w-4" />
        <span>Approvals</span>
      </Button>
    </div>
  );
};
