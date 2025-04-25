import IntakeForm from "@/components/IntakeForm";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 relative">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <IntakeForm />
      </div>
    </div>
  );
};

export default Index;
