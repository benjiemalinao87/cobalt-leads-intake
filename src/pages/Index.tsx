
import IntakeForm from "@/components/IntakeForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 relative">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <IntakeForm />
      </div>
    </div>
  );
};

export default Index;
