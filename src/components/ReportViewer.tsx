import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Image as ImageIcon, Download, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MedicalReport {
  id: string;
  file_name: string;
  file_path: string;
  report_type: string;
  file_size: number;
  created_at: string;
  analysis_status: string;
}

interface ReportViewerProps {
  athleteId: string;
  injuryId?: string;
}

export const ReportViewer = ({ athleteId, injuryId }: ReportViewerProps) => {
  const { toast } = useToast();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [reportUrl, setReportUrl] = useState<string>("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [athleteId, injuryId]);

  const fetchReports = async () => {
    try {
      let query = supabase
        .from("medical_reports")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: false });

      if (injuryId) {
        query = query.eq("injury_id", injuryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load medical reports",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSignedUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from("medical-reports")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  };

  const handleViewReport = async (report: MedicalReport) => {
    setSelectedReport(report);
    setLoadingUrl(true);
    setViewerOpen(true);

    try {
      const url = await getSignedUrl(report.file_path);
      setReportUrl(url);
    } catch (error: any) {
      console.error("Error loading report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report file",
      });
      setViewerOpen(false);
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleDownload = async (report: MedicalReport) => {
    try {
      const url = await getSignedUrl(report.file_path);
      const link = document.createElement("a");
      link.href = url;
      link.download = report.file_name;
      link.click();
      
      toast({
        title: "Download started",
        description: `Downloading ${report.file_name}`,
      });
    } catch (error: any) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download file",
      });
    }
  };

  const getFileIcon = (reportType: string) => {
    const imageTypes = ["mri", "xray", "ultrasound", "ct"];
    return imageTypes.includes(reportType) ? ImageIcon : FileText;
  };

  const isImageType = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  const isPdfType = (fileName: string) => {
    return fileName.toLowerCase().endsWith(".pdf");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical Reports</CardTitle>
          <CardDescription>Loading reports...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical Reports</CardTitle>
          <CardDescription>No reports uploaded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload medical imaging or reports to view them here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Medical Reports
          </CardTitle>
          <CardDescription>View uploaded medical images and documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.map((report) => {
            const Icon = getFileIcon(report.report_type);
            const fileSizeMB = (report.file_size / 1024 / 1024).toFixed(2);

            return (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{report.file_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {report.report_type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{fileSizeMB} MB</span>
                      <Badge
                        variant={report.analysis_status === "completed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {report.analysis_status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReport(report)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedReport?.file_name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/20 rounded-lg p-4">
            {loadingUrl ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedReport && isImageType(selectedReport.file_name) ? (
              <div className="flex items-center justify-center h-full">
                <img
                  src={reportUrl}
                  alt={selectedReport.file_name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : selectedReport && isPdfType(selectedReport.file_name) ? (
              <iframe
                src={reportUrl}
                className="w-full h-full rounded-lg"
                title={selectedReport.file_name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Preview not available for this file type
                </p>
                <Button onClick={() => selectedReport && handleDownload(selectedReport)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download to view
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
