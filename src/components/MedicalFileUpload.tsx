import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, FileText } from "lucide-react";

interface MedicalFileUploadProps {
  injuryId: string;
  athleteId: string;
  onUploadComplete?: () => void;
}

export const MedicalFileUpload = ({ injuryId, athleteId, onUploadComplete }: MedicalFileUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !reportType) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a file and report type",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${injuryId}-${Date.now()}.${fileExt}`;
      const filePath = `${athleteId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-reports")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create medical report record
      const { error: insertError } = await supabase
        .from("medical_reports")
        .insert({
          athlete_id: athleteId,
          injury_id: injuryId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          report_type: reportType,
          uploaded_by: user.id,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Medical file uploaded successfully",
      });

      // Reset form
      setFile(null);
      setReportType("");
      if (onUploadComplete) onUploadComplete();

    } catch (error: any) {
      console.error("Upload error:", error);
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
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm">Upload Medical Files</h4>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="report-type-upload">Report Type</Label>
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
              <SelectItem value="lab">Lab Results</SelectItem>
              <SelectItem value="prescription">Prescription</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">Medical File</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
          {file && (
            <p className="text-xs text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading || !file || !reportType}
          className="w-full"
          size="sm"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
