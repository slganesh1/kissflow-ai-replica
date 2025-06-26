
import { WorkflowBuilder } from "@/components/WorkflowBuilder";
import { WorkflowInputForm } from "@/components/WorkflowInputForm";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI-Powered Workflow Platform
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Create, manage, and optimize your business workflows with intelligent automation
          </p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="builder" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              🎯 Workflow Builder
            </TabsTrigger>
            <TabsTrigger 
              value="submit"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              📝 Submit Request
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-6 mt-6">
            <WorkflowBuilder />
          </TabsContent>
          
          <TabsContent value="submit" className="space-y-6 mt-6">
            <WorkflowInputForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
