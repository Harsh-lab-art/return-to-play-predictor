import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Brain, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 z-0" />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
            <Activity className="w-4 h-4" />
            AI-Powered Recovery Prediction
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Predict Athlete Recovery with{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Precision & Confidence
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Leverage multimodal data—biomechanics, wearables, medical history, and rehab progress—to 
            predict return-to-play timelines and support clinical decision-making.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button size="lg" className="group text-lg px-8 h-14">
              View Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14">
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="flex flex-col items-center space-y-3 p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">ML-Powered Insights</h3>
              <p className="text-sm text-muted-foreground text-center">
                Random forests & survival models trained on clinical + wearable data
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-3 p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Multimodal Data</h3>
              <p className="text-sm text-muted-foreground text-center">
                Biomechanics, GPS, IMU sensors, functional tests, and psych metrics
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-3 p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold">Explainable AI</h3>
              <p className="text-sm text-muted-foreground text-center">
                SHAP values & feature importance for clinical trust & transparency
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
