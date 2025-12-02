import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MedicalFileUpload } from "./MedicalFileUpload";
import { 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Loader2,
  XCircle,
  Upload
} from "lucide-react";

interface Injury {
  id: string;
  injury_type: string;
  injury_location: string;
  severity: string;
  injury_date: string;
  status: string;
  created_at: string;
}

interface RecoveryRecommendation {
  injury_id: string;
  predicted_rtp_days_min: number;
  predicted_rtp_days_max: number;
  confidence_score: number;
  daily_calories: number;
  daily_protein_grams: number;
  clinical_notes: string;
  generated_at: string;
}

interface InjuryWithRecovery extends Injury {
  recovery?: RecoveryRecommendation;
  actualRecoveryDays?: number;
}

export const InjuryHistory = () => {
  const [injuries, setInjuries] = useState<InjuryWithRecovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInjury, setExpandedInjury] = useState<string | null>(null);
  const [athleteId, setAthleteId] = useState<string>("");
  const [stats, setStats] = useState({
    totalInjuries: 0,
    averageRecoveryTime: 0,
    activeInjuries: 0,
    recoveredInjuries: 0,
  });

  useEffect(() => {
    fetchInjuryHistory();
  }, []);

  const fetchInjuryHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("athlete_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      setAthleteId(profile.id);

      // Fetch all injuries
      const { data: injuriesData } = await supabase
        .from("injuries")
        .select("*")
        .eq("athlete_id", profile.id)
        .order("injury_date", { ascending: false });

      if (!injuriesData) return;

      // Fetch recovery recommendations for each injury
      const injuryIds = injuriesData.map(inj => inj.id);
      const { data: recoveryData } = await supabase
        .from("recovery_recommendations")
        .select("*")
        .in("injury_id", injuryIds);

      // Merge data
      const injuriesWithRecovery: InjuryWithRecovery[] = injuriesData.map(injury => {
        const recovery = recoveryData?.find(rec => rec.injury_id === injury.id);
        
        // Calculate actual recovery days if injury is recovered
        let actualRecoveryDays;
        if (injury.status === "recovered") {
          const injuryDate = new Date(injury.injury_date);
          const today = new Date();
          actualRecoveryDays = Math.ceil((today.getTime() - injuryDate.getTime()) / (1000 * 60 * 60 * 24));
        }

        return {
          ...injury,
          recovery,
          actualRecoveryDays,
        };
      });

      setInjuries(injuriesWithRecovery);

      // Calculate statistics
      const totalInjuries = injuriesWithRecovery.length;
      const activeInjuries = injuriesWithRecovery.filter(inj => inj.status === "active").length;
      const recoveredInjuries = injuriesWithRecovery.filter(inj => inj.status === "recovered").length;
      
      const recoveredWithDays = injuriesWithRecovery.filter(inj => inj.actualRecoveryDays);
      const averageRecoveryTime = recoveredWithDays.length > 0
        ? Math.round(recoveredWithDays.reduce((sum, inj) => sum + (inj.actualRecoveryDays || 0), 0) / recoveredWithDays.length)
        : 0;

      setStats({
        totalInjuries,
        averageRecoveryTime,
        activeInjuries,
        recoveredInjuries,
      });

    } catch (error) {
      console.error("Error fetching injury history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertCircle className="w-5 h-5 text-accent" />;
      case "recovered":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      default:
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent text-accent-foreground";
      case "recovered":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "bg-destructive text-destructive-foreground";
      case "moderate":
        return "bg-accent text-accent-foreground";
      case "mild":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (injuries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">No injury history found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Total Injuries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalInjuries}</div>
            <p className="text-xs text-muted-foreground mt-2">All recorded injuries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Recovery Time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageRecoveryTime}</div>
            <p className="text-xs text-muted-foreground mt-2">days to recovery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Active Injuries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeInjuries}</div>
            <p className="text-xs text-muted-foreground mt-2">currently recovering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Recovered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recoveredInjuries}</div>
            <p className="text-xs text-muted-foreground mt-2">successful recoveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Injury Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Injury Timeline</CardTitle>
          <CardDescription>Complete history of injuries and recovery outcomes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {injuries.map((injury, index) => (
            <div key={injury.id}>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(injury.status)}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg capitalize">
                          {injury.injury_type.replace("-", " ")}
                        </h3>
                        <Badge className={getSeverityColor(injury.severity)}>
                          {injury.severity}
                        </Badge>
                        <Badge className={getStatusColor(injury.status)}>
                          {injury.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Injury Date: {formatDate(injury.injury_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <span>Location: {injury.injury_location}</span>
                        </div>
                      </div>
                    </div>

                    {injury.recovery && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {injury.recovery.predicted_rtp_days_min}-{injury.recovery.predicted_rtp_days_max}
                        </div>
                        <p className="text-xs text-muted-foreground">predicted days</p>
                      </div>
                    )}
                  </div>

                  {/* Recovery Metrics */}
                  {injury.recovery && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-semibold">
                          {Math.round(injury.recovery.confidence_score * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Daily Calories</p>
                        <p className="font-semibold">{injury.recovery.daily_calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Daily Protein</p>
                        <p className="font-semibold">{injury.recovery.daily_protein_grams}g</p>
                      </div>
                      {injury.actualRecoveryDays && (
                        <div>
                          <p className="text-xs text-muted-foreground">Actual Recovery</p>
                          <p className="font-semibold">{injury.actualRecoveryDays} days</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prediction Accuracy */}
                  {injury.recovery && injury.actualRecoveryDays && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prediction Accuracy</span>
                        <span className="font-medium">
                          {injury.actualRecoveryDays >= injury.recovery.predicted_rtp_days_min &&
                          injury.actualRecoveryDays <= injury.recovery.predicted_rtp_days_max
                            ? "✓ Within predicted range"
                            : injury.actualRecoveryDays < injury.recovery.predicted_rtp_days_min
                            ? "Recovered faster than predicted"
                            : "Took longer than predicted"}
                        </span>
                      </div>
                      <Progress 
                        value={
                          (injury.actualRecoveryDays / injury.recovery.predicted_rtp_days_max) * 100
                        } 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Clinical Notes */}
                  {injury.recovery?.clinical_notes && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View clinical notes
                      </summary>
                      <p className="mt-2 text-muted-foreground leading-relaxed">
                        {injury.recovery.clinical_notes}
                      </p>
                    </details>
                  )}

                  {/* File Upload Section */}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedInjury(expandedInjury === injury.id ? null : injury.id)}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {expandedInjury === injury.id ? "Hide" : "Add Medical Files"}
                    </Button>
                    
                    {expandedInjury === injury.id && (
                      <div className="mt-3">
                        <MedicalFileUpload
                          injuryId={injury.id}
                          athleteId={athleteId}
                          onUploadComplete={() => {
                            setExpandedInjury(null);
                            fetchInjuryHistory();
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {index < injuries.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recovery Patterns Insight */}
      {stats.recoveredInjuries > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recovery Patterns</CardTitle>
            <CardDescription>Insights based on your injury history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Historical Recovery Rate</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You've successfully recovered from {stats.recoveredInjuries} of {stats.totalInjuries} injuries, 
                  with an average recovery time of {stats.averageRecoveryTime} days.
                </p>
              </div>
            </div>

            {injuries.some(inj => inj.recovery && inj.actualRecoveryDays) && (
              <div className="flex items-start gap-3 p-4 bg-success/5 border border-success/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Prediction Reliability</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your recovery history helps improve future predictions. Continue tracking progress 
                    for more accurate forecasts.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
