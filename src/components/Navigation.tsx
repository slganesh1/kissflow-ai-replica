
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, CheckSquare, Home, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-2">
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

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};
