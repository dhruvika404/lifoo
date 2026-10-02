"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Download, Paperclip, X, FileSpreadsheet, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryService } from "@/services";

const bulkUploadSchema = z.object({
  file: z.any()
    .refine((file) => file instanceof File, "Please upload a file")
    .refine(
      (file) => {
        if (!file) return false;
        const validTypes = [
          "application/zip",
          "application/x-zip-compressed",
          "application/octet-stream",
        ];
        const validExtensions = [".zip"];
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        return validTypes.includes(file.type) || validExtensions.includes(extension);
      },
      "Only ZIP files (.zip) are allowed"
    ),
  sheetName: z.string().optional(),
});

type BulkUploadFormValues = z.infer<typeof bulkUploadSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
};

export function BulkUploadModal({ open, onOpenChange, onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BulkUploadFormValues>({
    resolver: zodResolver(bulkUploadSchema),
    defaultValues: {
      sheetName: "",
    },
  });

  const selectedFile = watch("file") as File | undefined;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("file", file, { shouldValidate: true });
  };

  const handleRemoveFile = () => {
    setValue("file", undefined as any, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const onSubmit = async (values: BulkUploadFormValues) => {
    try {
      const res = await categoryService.bulkUploadCategories(values.file, values.sheetName);
      
      if (res.isBlob && res.blob) {
        const url = window.URL.createObjectURL(res.blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", res.filename || "failed_categories.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.error("Some categories failed to upload. The error report has been downloaded.");
        onUploaded();
        handleClose();
      } else {
        const json = res.json;
        if (json?.ok) {
          const message = json.message || json.data?.message;
          let created = undefined;
          let failed = undefined;

          if (json.data) {
            if (Array.isArray(json.data)) {
              created = json.data.length;
            } else if (typeof json.data === "object") {
              if ("created" in json.data || "createdCount" in json.data || "success" in json.data) {
                created = json.data.created ?? json.data.createdCount ?? json.data.success;
              }
              if ("failed" in json.data || "failedCount" in json.data) {
                failed = json.data.failed ?? json.data.failedCount;
              }
            }
          }

          if (created === undefined && json.created !== undefined) {
            created = json.created;
          }
          if (failed === undefined && json.failed !== undefined) {
            failed = json.failed;
          }

          if (created !== undefined) {
            if (failed !== undefined && failed > 0) {
              toast.success(
                `Bulk upload complete! Created: ${created} categories. Failed: ${failed}.`
              );
            } else {
              toast.success(`Bulk upload complete! Created: ${created} categories.`);
            }
          } else if (message) {
            toast.success(message);
          } else {
            toast.success("Bulk upload completed successfully!");
          }

          onUploaded();
          handleClose();
        } else {
          const errMsg =
            json?.error?.message ||
            json?.message ||
            (typeof json?.error === "string" ? json.error : null) ||
            "Failed to upload categories";
          throw new Error(errMsg);
        }
      }
    } catch (err: any) {
      let errMsg = "Failed to upload categories. Please check your file format.";
      if (err?.response?.data) {
        let errorData = err.response.data;
        if (errorData instanceof Blob) {
          try {
            const text = await errorData.text();
            errorData = JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse error blob", e);
          }
        }

        if (typeof errorData === "object" && errorData !== null) {
          errMsg =
            errorData.error?.message ||
            errorData.message ||
            (typeof errorData.error === "string" ? errorData.error : null) ||
            errMsg;
        } else if (typeof errorData === "string") {
          errMsg = errorData;
        }
      } else if (err?.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const sampleTemplateUrl =
    "https://drive.google.com/drive/folders/1V2l6HT-fDO_jt3aIH88D6vHkQ8cHtVaY";

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="max-w-xl border border-border bg-background shadow-2xl rounded-2xl p-6 sm:p-8">
        <DialogHeader className="relative pr-8">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Bulk Upload Data
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Upload a ZIP file containing your CSV or XLSX data template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border/50">
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2d7a4f]/10 text-[#2d7a4f] text-[11px] font-bold">
                  1
                </span>
                Download Sample Template
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                Download sample template by clicking the button below. You can add the category data according to the template file.
              </p>
            </div>
            <Button
              type="button"
              asChild
              className="bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-full px-5 py-2 h-9 text-xs font-semibold gap-1.5 shadow-sm transition-all shrink-0 w-fit cursor-pointer"
            >
              <a href={sampleTemplateUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" />
                Download Sample
              </a>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-4 border-b border-border/50">
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2d7a4f]/10 text-[#2d7a4f] text-[11px] font-bold">
                  2
                </span>
                Upload ZIP File
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                Zip your completed CSV or XLSX template (and any category images) and upload the ZIP file below.
              </p>

              {selectedFile && (
                <div className="mt-3 ml-7 flex items-center gap-2.5 p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in duration-200">
                  <FileSpreadsheet className="h-5 w-5 text-[#2d7a4f] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {errors.file && (
                <div className="mt-2 ml-7 flex items-center gap-1.5 text-xs text-destructive font-medium animate-in fade-in duration-150">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.file.message as string}</span>
                </div>
              )}
            </div>

            <div className="shrink-0 w-fit">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#2d7a4f] hover:bg-[#236040] text-white rounded-full px-5 py-2 h-9 text-xs font-semibold gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Upload ZIP
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border/50">
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2d7a4f]/10 text-[#2d7a4f] text-[11px] font-bold">
                  3
                </span>
                Sheet Name
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                Enter the name of the Excel sheet to import (optional, defaults to first sheet).
              </p>
            </div>
            <div className="shrink-0 w-full sm:w-48">
              <Input
                id="sheet-name"
                placeholder="e.g. Sheet1"
                className={`h-9 rounded-lg border border-border/60 bg-background px-3 focus-visible:ring-[#2d7a4f]/20 focus-visible:border-[#2d7a4f] transition-all ${
                  errors.sheetName ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : ""
                }`}
                {...register("sheetName")}
              />
              {errors.sheetName && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.sheetName.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-[#eef5f1] hover:bg-[#e2edd7]/60 text-[#2d7a4f] hover:text-[#236040] rounded-full px-6 py-2 h-10 text-xs font-semibold shadow-none border-0 transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isSubmitting}
              className="bg-[#2d7a4f] hover:bg-[#236040] disabled:bg-[#2d7a4f]/40 disabled:text-white/70 text-white rounded-full px-6 py-2 h-10 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Uploading…
                </>
              ) : (
                "Done"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
