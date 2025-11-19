import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";

interface RecoveryData {
  predicted_rtp_days_min: number;
  predicted_rtp_days_max: number;
  rest_days_recommended: number;
  daily_calories: number;
  daily_protein_grams: number;
  confidence_score: number;
  key_risk_factors: any;
  rehabilitation_phases: any;
  clinical_notes: string;
}

export const Dashboard = () => {
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecoveryData();
  }, []);

  const fetchRecoveryData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("athlete_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const { data: recommendations } = await supabase
          .from("recovery_recommendations")
          .select("*")
          .eq("athlete_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (recommendations && recommendations.length > 0) {
          setRecoveryData(recommendations[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching recovery data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!recoveryData) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Recovery Dashboard</h2>
              <p className="text-muted-foreground text-lg">
                Upload a medical report to get AI-powered recovery predictions
              </p>
            </div>
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No recovery recommendations available yet. Upload a medical report to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const confidencePercent = Math.round(recoveryData.confidence_score * 100);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Recovery Dashboard</h2>
            <p className="text-muted-foreground text-lg">
              AI-powered predictions and rehabilitation insights
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Predicted RTP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {recoveryData.predicted_rtp_days_min}-{recoveryData.predicted_rtp_days_max} days
                </div>
                <p className="text-xs text-muted-foreground mt-2">Recovery window</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Rest Days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recoveryData.rest_days_recommended}</div>
                <p className="text-xs text-muted-foreground mt-2">Recommended rest period</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Daily Nutrition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{recoveryData.daily_calories}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  calories • {recoveryData.daily_protein_grams}g protein
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Model Confidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{confidencePercent}%</div>
                <p className="text-xs text-muted-foreground mt-2">Prediction reliability</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rehabilitation Phases */}
            {recoveryData.rehabilitation_phases && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Rehabilitation Phases</CardTitle>
                  <CardDescription>Structured recovery timeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(recoveryData.rehabilitation_phases as any[]).map((phase: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{phase.phase}</span>
                        <span className="text-muted-foreground">{phase.duration_days} days</span>
                      </div>
                      <Progress value={index === 0 ? 100 : index === 1 ? 50 : 0} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {phase.activities?.join(" • ") || "Activities to be determined"}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Risk Factors */}
            {recoveryData.key_risk_factors && (
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Key Risk Factors</CardTitle>
                  <CardDescription>Factors affecting recovery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(recoveryData.key_risk_factors as any[]).map((risk: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{risk.factor}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress 
                              value={risk.importance * 100} 
                              className="h-1.5 flex-1" 
                            />
                            <span className="text-xs text-muted-foreground">
                              {risk.impact_days > 0 ? '+' : ''}{risk.impact_days}d
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Clinical Notes */}
          {recoveryData.clinical_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Clinical Notes & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recoveryData.clinical_notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};
