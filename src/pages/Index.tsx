
import { WorkflowBuilder } from "@/components/WorkflowBuilder";
import { WorkflowInputForm } from "@/components/WorkflowInputForm";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Workflow Platform
          </h1>
          <p className="text-gray-600">
            Create, manage, and optimize your business workflows with intelligent automation
          </p>
        </div>

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
            <TabsTrigger value="submit">Submit Request</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-6">
            <WorkflowBuilder />
          </TabsContent>
          
          <TabsContent value="submit" className="space-y-6">
            <WorkflowInputForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
