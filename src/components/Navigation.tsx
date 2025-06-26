
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, CheckSquare, Home, Sparkles } from 'lucide-react';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            FlowAI
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={location.pathname === '/' ? 'default' : 'outline'}
            onClick={() => navigate('/')}
            className={`flex items-center space-x-2 transition-all duration-300 ${
              location.pathname === '/' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg' 
                : 'hover:bg-blue-50 border-blue-200'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Workflow Builder</span>
          </Button>
          
          <Button
            variant={location.pathname === '/approvals' ? 'default' : 'outline'}
            onClick={() => navigate('/approvals')}
            className={`flex items-center space-x-2 transition-all duration-300 ${
              location.pathname === '/approvals' 
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg' 
                : 'hover:bg-green-50 border-green-200'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Approvals</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="px-3 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm font-medium rounded-full shadow-lg">
          ✨ Pro
        </div>
      </div>
    </div>
  );
};
