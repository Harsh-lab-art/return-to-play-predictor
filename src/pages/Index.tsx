import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { AthleteProfile } from "@/components/AthleteProfile";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Dashboard />
      <AthleteProfile />
    </div>
  );
};

export default Index;
