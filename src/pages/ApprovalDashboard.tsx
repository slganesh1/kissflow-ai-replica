
import { Navigation } from "@/components/Navigation";
import { ManualApprovalInterface } from "@/components/ManualApprovalInterface";

const ApprovalDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Approval Dashboard
          </h1>
          <p className="text-gray-600">
            Review and approve pending workflow requests
          </p>
        </div>
        <ManualApprovalInterface />
      </div>
    </div>
  );
};

export default ApprovalDashboard;
