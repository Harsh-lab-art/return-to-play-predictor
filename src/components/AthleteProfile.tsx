import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Calendar, 
  Activity, 
  Heart,
  Zap,
  Moon,
  Loader2
} from "lucide-react";

interface AthleteData {
  full_name: string;
  sport: string;
  position: string | null;
  date_of_birth: string;
  height_cm: number | null;
  weight_kg: number | null;
  phone_number: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
}

interface InjuryData {
  injury_type: string;
  injury_location: string;
  severity: string;
  injury_date: string;
  status: string;
}

export const AthleteProfile = () => {
  const [athlete, setAthlete] = useState<AthleteData | null>(null);
  const [currentInjury, setCurrentInjury] = useState<InjuryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAthleteData();
  }, []);

  const fetchAthleteData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("athlete_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setAthlete(profile);

        const { data: injuries } = await supabase
          .from("injuries")
          .select("*")
          .eq("athlete_id", profile.id)
          .eq("status", "active")
          .order("injury_date", { ascending: false })
          .limit(1);

        if (injuries && injuries.length > 0) {
          setCurrentInjury(injuries[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching athlete data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysElapsed = (dateString: string) => {
    const injuryDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - injuryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!athlete) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No athlete profile found</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-primary">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(athlete.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{athlete.full_name}</CardTitle>
                    <CardDescription className="text-base">
                      {athlete.position || athlete.sport}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-semibold">{calculateAge(athlete.date_of_birth)} years</p>
                  </div>
                  {athlete.height_cm && (
                    <div>
                      <p className="text-muted-foreground">Height</p>
                      <p className="font-semibold">{athlete.height_cm}cm</p>
                    </div>
                  )}
                  {athlete.weight_kg && (
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-semibold">{athlete.weight_kg}kg</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Sport</p>
                    <p className="font-semibold">{athlete.sport}</p>
                  </div>
                </div>

                {currentInjury && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Current Injury</h4>
                    <Badge className="bg-accent text-accent-foreground mb-2">
                      {currentInjury.injury_type} - {currentInjury.severity}
                    </Badge>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Injury Date</span>
                        <span className="font-medium">{formatDate(currentInjury.injury_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Days Elapsed</span>
                        <span className="font-medium">{getDaysElapsed(currentInjury.injury_date)} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{currentInjury.injury_location}</span>
                      </div>
                    </div>
                  </div>
                )}

                {athlete.emergency_contact && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Emergency Contact</h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{athlete.emergency_contact}</p>
                      {athlete.emergency_phone && (
                        <p className="text-muted-foreground">{athlete.emergency_phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wearable Data */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Wearable & Biometric Data</CardTitle>
                <CardDescription>Last 7 days aggregate from sensors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Training Load (AU)</p>
                        <p className="text-2xl font-bold mt-1">2,847</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Acute:Chronic ratio: <span className="font-semibold">0.92</span> (optimal)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Resting HR (bpm)</p>
                        <p className="text-2xl font-bold mt-1">58</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          HRV: <span className="font-semibold">67 ms</span> (good recovery state)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-moon/10 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sleep Quality</p>
                        <p className="text-2xl font-bold mt-1">7.2 hrs</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Deep sleep: <span className="font-semibold">1.8 hrs</span> (24%)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Peak Acceleration</p>
                        <p className="text-2xl font-bold mt-1">4.2 m/s²</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          High-speed running distance: <span className="font-semibold">892 m</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Movement Asymmetry</p>
                        <p className="text-2xl font-bold mt-1">8.4%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Step length R/L: <span className="font-semibold">0.92</span> (improving)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Readiness Score</p>
                        <p className="text-2xl font-bold mt-1">82/100</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Perceived exertion: <span className="font-semibold">4/10</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-primary font-medium">
                    📊 All biometric markers within normal ranges. Workload progression appropriate for phase 2 rehab.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
