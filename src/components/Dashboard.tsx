import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Clock
} from "lucide-react";

export const Dashboard = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Recovery Dashboard</h2>
            <p className="text-muted-foreground text-lg">
              Real-time predictions and rehabilitation insights for clinical teams
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
                <div className="text-3xl font-bold">18-22 days</div>
                <p className="text-xs text-muted-foreground mt-2">95% confidence interval</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recovery Rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground mt-2">Ahead of baseline</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Functional Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8.2/10</div>
                <p className="text-xs text-muted-foreground mt-2">Single-leg hop test</p>
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
                <div className="text-3xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground mt-2">High reliability</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recovery Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recovery Progression</CardTitle>
                <CardDescription>Time-to-event survival probability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Phase 1: Acute Recovery</span>
                    <Badge variant="default">Complete</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground">Days 1-7: Pain management & mobility</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Phase 2: Rehabilitation</span>
                    <Badge className="bg-accent text-accent-foreground">In Progress</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground">Days 8-14: Strength & ROM restoration</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Phase 3: Sport-Specific Training</span>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-muted-foreground">Days 15-22: Agility & power work</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Phase 4: Return to Play</span>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-muted-foreground">Day 22+: Full competition clearance</p>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Key Risk Factors</CardTitle>
                <CardDescription>SHAP feature importance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Previous ACL injury</p>
                    <p className="text-xs text-muted-foreground">High impact on prediction</p>
                  </div>
                  <span className="text-xs font-mono">-12d</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Workload spike (last 7d)</p>
                    <p className="text-xs text-muted-foreground">Moderate impact</p>
                  </div>
                  <span className="text-xs font-mono">-8d</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">High compliance score</p>
                    <p className="text-xs text-muted-foreground">Positive factor</p>
                  </div>
                  <span className="text-xs font-mono text-success">+4d</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Age (24 years)</p>
                    <p className="text-xs text-muted-foreground">Optimal recovery window</p>
                  </div>
                  <span className="text-xs font-mono text-success">+2d</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clinical Alerts */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Clinical Decision Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Monitor asymmetry in next assessment
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Single-leg hop distance shows 12% deficit. Recommend bilateral strength comparison.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    ROM targets met ahead of schedule
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Knee flexion at 135°, exceeding week-2 target. Consider progression to phase 3.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
