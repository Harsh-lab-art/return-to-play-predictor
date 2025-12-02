import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2 } from "lucide-react";

interface MedicalReportUploadProps {
  userId: string;
}

export const MedicalReportUpload = ({ userId }: MedicalReportUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [reportType, setReportType] = useState("");
  const [injuryType, setInjuryType] = useState("");
  const [severity, setSeverity] = useState("");
  const [injurySide, setInjurySide] = useState("");
  const [bodyLocation, setBodyLocation] = useState("");

  const handleUpload = async () => {
    if (!reportType || !injuryType || !severity || !injurySide || !bodyLocation) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields and select a file",
      });
      return;
    }

    setUploading(true);

    try {
      // Get athlete profile
      const { data: profile, error: profileError } = await supabase
        .from("athlete_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;

      // Create injury record
      const injuryLocation = injurySide === "not-applicable" 
        ? bodyLocation 
        : `${injurySide} ${bodyLocation}`;
      
      const { data: injury, error: injuryError } = await supabase
        .from("injuries")
        .insert({
          athlete_id: profile.id,
          injury_type: injuryType,
          injury_location: injuryLocation,
          severity,
          injury_date: new Date().toISOString().split("T")[0],
          status: "active",
        })
        .select()
        .single();

      if (injuryError) throw injuryError;

      toast({
        title: "Success",
        description: "Injury record created successfully.",
      });

      // Reset form
      setReportType("");
      setInjuryType("");
      setSeverity("");
      setInjurySide("");
      setBodyLocation("");

    } catch (error: any) {
      console.error("Upload error details:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Upload Medical Report
        </CardTitle>
        <CardDescription>
          Upload medical imaging, assessments, or clinical reports for AI-powered recovery analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mri">MRI Scan</SelectItem>
              <SelectItem value="xray">X-Ray</SelectItem>
              <SelectItem value="ultrasound">Ultrasound</SelectItem>
              <SelectItem value="ct">CT Scan</SelectItem>
              <SelectItem value="clinical">Clinical Assessment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="injury-type">Injury Type</Label>
          <Select value={injuryType} onValueChange={setInjuryType}>
            <SelectTrigger>
              <SelectValue placeholder="Select injury type" />
            </SelectTrigger>
            <SelectContent className="bg-popover max-h-[300px] overflow-y-auto z-50">
              <SelectItem value="acl-tear">ACL Tear</SelectItem>
              <SelectItem value="mcl-tear">MCL Tear</SelectItem>
              <SelectItem value="lcl-tear">LCL Tear</SelectItem>
              <SelectItem value="pcl-tear">PCL Tear</SelectItem>
              <SelectItem value="meniscus-tear">Meniscus Tear</SelectItem>
              <SelectItem value="hamstring-strain">Hamstring Strain</SelectItem>
              <SelectItem value="quadriceps-strain">Quadriceps Strain</SelectItem>
              <SelectItem value="groin-strain">Groin Strain</SelectItem>
              <SelectItem value="calf-strain">Calf Strain</SelectItem>
              <SelectItem value="hip-flexor-strain">Hip Flexor Strain</SelectItem>
              <SelectItem value="ankle-sprain">Ankle Sprain</SelectItem>
              <SelectItem value="achilles-tendinitis">Achilles Tendinitis</SelectItem>
              <SelectItem value="achilles-rupture">Achilles Rupture</SelectItem>
              <SelectItem value="patella-tendinitis">Patella Tendinitis</SelectItem>
              <SelectItem value="shin-splints">Shin Splints</SelectItem>
              <SelectItem value="stress-fracture">Stress Fracture</SelectItem>
              <SelectItem value="bone-fracture">Bone Fracture</SelectItem>
              <SelectItem value="rotator-cuff">Rotator Cuff Injury</SelectItem>
              <SelectItem value="shoulder-dislocation">Shoulder Dislocation</SelectItem>
              <SelectItem value="labrum-tear">Labrum Tear</SelectItem>
              <SelectItem value="tennis-elbow">Tennis Elbow</SelectItem>
              <SelectItem value="golfers-elbow">Golfer's Elbow</SelectItem>
              <SelectItem value="wrist-sprain">Wrist Sprain</SelectItem>
              <SelectItem value="back-strain">Back Strain</SelectItem>
              <SelectItem value="herniated-disc">Herniated Disc</SelectItem>
              <SelectItem value="concussion">Concussion</SelectItem>
              <SelectItem value="plantar-fasciitis">Plantar Fasciitis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="body-location">Body Location</Label>
            <Select value={bodyLocation} onValueChange={setBodyLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="knee">Knee</SelectItem>
                <SelectItem value="ankle">Ankle</SelectItem>
                <SelectItem value="foot">Foot</SelectItem>
                <SelectItem value="hip">Hip</SelectItem>
                <SelectItem value="thigh">Thigh</SelectItem>
                <SelectItem value="calf">Calf</SelectItem>
                <SelectItem value="hamstring">Hamstring</SelectItem>
                <SelectItem value="quadriceps">Quadriceps</SelectItem>
                <SelectItem value="groin">Groin</SelectItem>
                <SelectItem value="shoulder">Shoulder</SelectItem>
                <SelectItem value="elbow">Elbow</SelectItem>
                <SelectItem value="wrist">Wrist</SelectItem>
                <SelectItem value="hand">Hand</SelectItem>
                <SelectItem value="back">Back</SelectItem>
                <SelectItem value="neck">Neck</SelectItem>
                <SelectItem value="head">Head</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="injury-side">Side</Label>
            <Select value={injurySide} onValueChange={setInjurySide}>
              <SelectTrigger>
                <SelectValue placeholder="Select side" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="bilateral">Bilateral (Both)</SelectItem>
                <SelectItem value="central">Central</SelectItem>
                <SelectItem value="not-applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity">Severity Grade</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="grade-1-mild">Grade 1 - Mild (Minor damage, minimal loss of function)</SelectItem>
              <SelectItem value="grade-2-moderate">Grade 2 - Moderate (Partial tear, noticeable loss of function)</SelectItem>
              <SelectItem value="grade-3-severe">Grade 3 - Severe (Complete tear, significant loss of function)</SelectItem>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Create Injury Record
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
