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
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState("");
  const [injuryType, setInjuryType] = useState("");
  const [severity, setSeverity] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Maximum file size is 10MB",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !reportType || !injuryType || !severity) {
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
      const { data: injury, error: injuryError } = await supabase
        .from("injuries")
        .insert({
          athlete_id: profile.id,
          injury_type: injuryType,
          injury_location: "To be analyzed",
          severity,
          injury_date: new Date().toISOString().split("T")[0],
          status: "active",
        })
        .select()
        .single();

      if (injuryError) throw injuryError;

      // Upload file to storage
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create medical report record
      const { error: reportError } = await supabase
        .from("medical_reports")
        .insert({
          athlete_id: profile.id,
          injury_id: injury.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          report_type: reportType,
          uploaded_by: userId,
          analysis_status: "pending",
        });

      if (reportError) throw reportError;

      toast({
        title: "Upload successful",
        description: "Medical report uploaded. Starting AI analysis...",
      });

      // Trigger AI analysis
      await analyzeReport(injury.id, fileName);

      // Reset form
      setFile(null);
      setReportType("");
      setInjuryType("");
      setSeverity("");
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

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

  const analyzeReport = async (injuryId: string, filePath: string) => {
    setAnalyzing(true);

    try {
      console.log("Starting analysis for injury:", injuryId, "file:", filePath);
      
      const { data, error } = await supabase.functions.invoke("analyze-medical-report", {
        body: { injuryId, filePath },
      });

      console.log("Analysis response:", data, error);

      if (error) {
        console.error("Analysis error:", error);
        throw error;
      }

      toast({
        title: "Analysis complete",
        description: "Recovery recommendations have been generated!",
      });

      // Reload page to show new data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message || "Failed to analyze report. Please try again.",
      });
    } finally {
      setAnalyzing(false);
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

        <div className="space-y-2">
          <Label htmlFor="severity">Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">Medical Report File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.dcm"
            onChange={handleFileChange}
            disabled={uploading || analyzing}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading || analyzing || !file}
          className="w-full"
        >
          {uploading || analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? "Uploading..." : "Analyzing..."}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Analyze
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
