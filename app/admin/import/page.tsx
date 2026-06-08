"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Download, FileText, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, Spinner } from "@/components/ui";
import toast from "react-hot-toast";

interface ImportResult { succeeded: number; failed: number; totalRows: number; errors: Array<{ row: number; error: string }> }

export default function AdminImportPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.data);
      toast.success(`${data.data.succeeded} products imported!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "application/json": [".json"] },
    multiple: false,
    disabled: uploading,
  });

  const downloadTemplate = (type: "csv" | "json") => {
    window.open(`/api/import?template=${type}`, "_blank");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl text-surface-900 dark:text-white">Import Products</h1>
        <p className="text-surface-500 text-sm mt-1">Upload CSV, Excel (.xlsx), or JSON files to bulk-import products.</p>
      </div>

      {/* Download templates */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
        <h2 className="font-semibold text-surface-900 dark:text-white mb-4">Download Templates</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "CSV Template", type: "csv" as const, icon: FileText },
            { label: "JSON Template", type: "json" as const, icon: FileText },
          ].map(t => (
            <Button key={t.type} onClick={() => downloadTemplate(t.type)} variant="outline" size="sm" leftIcon={<Download size={14} />}>
              {t.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-surface-400 mt-3">Templates include all supported fields. For Excel, use the same column headers as the CSV template.</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
            : "border-surface-200 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-700"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner size={40} />
            <p className="text-surface-600 dark:text-surface-400">Processing import…</p>
          </div>
        ) : (
          <>
            <Upload size={40} className={`mx-auto mb-4 ${isDragActive ? "text-brand-500" : "text-surface-300 dark:text-surface-600"}`} />
            <p className="text-lg font-medium text-surface-900 dark:text-white mb-2">
              {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
            </p>
            <p className="text-surface-400 text-sm mb-4">or click to browse</p>
            <p className="text-xs text-surface-300 dark:text-surface-600">Supports: CSV, Excel (.xlsx), JSON</p>
          </>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 space-y-4">
          <h2 className="font-semibold text-surface-900 dark:text-white">Import Results</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-surface-50 dark:bg-surface-800">
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{result.totalRows}</p>
              <p className="text-xs text-surface-400">Total Rows</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-600">{result.succeeded}</p>
              <p className="text-xs text-green-500">Succeeded</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <p className="text-2xl font-bold text-error">{result.failed}</p>
              <p className="text-xs text-red-400">Failed</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Errors ({result.errors.length})</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-red-50 dark:bg-red-900/10">
                    <XCircle size={12} className="text-error shrink-0 mt-0.5" />
                    <span className="text-red-700 dark:text-red-400">Row {e.row}: {e.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Field reference */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6">
        <h2 className="font-semibold text-surface-900 dark:text-white mb-4">Supported Fields</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {["name *","brand","category","subcategory","description","price *","compare_price","cost_price","stock","sku","barcode","tags","weight","length","width","height","featured","sale","new_arrival","images"].map(f => (
            <code key={f} className="text-xs px-2 py-1 rounded bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-mono">{f}</code>
          ))}
        </div>
        <p className="text-xs text-surface-400 mt-3">* Required. Images: comma-separated URLs. Tags: comma-separated values.</p>
      </div>
    </div>
  );
}
