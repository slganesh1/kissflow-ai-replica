
import React from 'react';
import { ManualApprovalInterface } from '@/components/ManualApprovalInterface';
import { Navigation } from '@/components/Navigation';

const ApprovalDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <ManualApprovalInterface />
      </div>
    </div>
  );
};

export default ApprovalDashboard;
