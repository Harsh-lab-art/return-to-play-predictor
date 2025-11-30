import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Upload, History } from "lucide-react";
import { Dashboard } from "@/components/Dashboard";
import { AthleteProfile } from "@/components/AthleteProfile";
import { MedicalReportUpload } from "@/components/MedicalReportUpload";
import { ReportViewer } from "@/components/ReportViewer";
import { HealthcareChat } from "@/components/HealthcareChat";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [athleteId, setAthleteId] = useState<string>("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
        
        // Fetch athlete profile ID
        const { data: profile } = await supabase
          .from("athlete_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (profile) {
          setAthleteId(profile.id);
        }
      }
    } catch (error) {
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Recovery Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/injury-history")}>
              <History className="mr-2 h-4 w-4" />
              Injury History
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <AthleteProfile />
        <MedicalReportUpload userId={user?.id} />
        {athleteId && <ReportViewer athleteId={athleteId} />}
        <Dashboard />
        <HealthcareChat />
      </main>
    </div>
  );
};

export default DashboardPage;
