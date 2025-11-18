import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Calendar, 
  Activity, 
  Heart,
  Zap,
  Moon
} from "lucide-react";

export const AthleteProfile = () => {
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
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">Jordan Davis</CardTitle>
                    <CardDescription className="text-base">Forward • #23</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-semibold">24 years</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Height</p>
                    <p className="font-semibold">6'3" / 190cm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-semibold">185 lbs / 84kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sport</p>
                    <p className="font-semibold">Basketball</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Current Injury</h4>
                  <Badge className="bg-accent text-accent-foreground mb-2">Grade II Hamstring Strain</Badge>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Injury Date</span>
                      <span className="font-medium">Nov 4, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days Elapsed</span>
                      <span className="font-medium">14 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">Right biceps femoris</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Injury History</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Left ACL Reconstruction</p>
                        <p className="text-xs text-muted-foreground">March 2023 • Full recovery</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Right ankle sprain (Grade I)</p>
                        <p className="text-xs text-muted-foreground">Sep 2024 • 3-week RTP</p>
                      </div>
                    </div>
                  </div>
                </div>
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
