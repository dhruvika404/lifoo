import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, FileText, Calendar, ExternalLink } from "lucide-react";
import { ChefDocument } from "@/services";
import { getDocumentUrl, formatDocType, getStatusColor } from "./utils";

export function ChefDocumentsSection({ documentsList }: { documentsList: ChefDocument[] }) {
  return (
    <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-[#2d7a4f]" />
          Uploaded KYC & Media Documents ({documentsList.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {documentsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FileText className="h-9 w-9 opacity-30 mb-2" />
            <p className="text-sm font-medium">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documentsList.map((doc) => {
              const docUrl = getDocumentUrl(doc.s3Path);
              return (
                <div key={doc.id} className="p-4 rounded-xl border border-border/40 bg-muted/10 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#2d7a4f]" />
                        {formatDocType(doc.docType)}
                      </span>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      {doc.digioDocId && (
                        <div className="font-mono text-[10px] bg-background/50 p-1.5 rounded border border-border/20">
                          Digio ID: <span className="text-foreground">{doc.digioDocId}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {doc.expiresAt && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3 text-amber-500" />
                          <span>Expires: {new Date(doc.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {docUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-semibold gap-1.5 h-8 bg-background border-border/60 hover:bg-muted/40 mt-1"
                      onClick={() => window.open(docUrl, "_blank")}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#2d7a4f]" />
                      View Document
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
