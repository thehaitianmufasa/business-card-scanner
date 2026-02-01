"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ImageUploader";
import { ScanResult, ContactData } from "@/components/ScanResult";
import { SheetSelector } from "@/components/SheetSelector";
import { SignInButton } from "@/components/SignInButton";

export default function ScanPage() {
  const { data: session, status } = useSession();
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanData, setScanData] = useState<ContactData | null>(null);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/");
  }

  const handleUpload = async (file: File) => {
    setScanning(true);
    setScanData(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scan image");
      }

      setScanData(data);
      toast.success("Business card scanned successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to scan image"
      );
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSheetId) {
      toast.error("Please select a spreadsheet");
      return;
    }

    if (!scanData) {
      toast.error("No contact data to save");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/sheets/append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId: selectedSheetId,
          data: scanData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save contact");
      }

      toast.success("Contact saved to Google Sheets!");
      setScanData(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save contact"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleScanAnother = () => {
    setScanData(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            Business Card Scanner
          </h1>
          <SignInButton />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {!scanData ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Upload Business Card
              </h2>
              <ImageUploader onUpload={handleUpload} isLoading={scanning} />
            </div>
          ) : (
            <>
              <ScanResult data={scanData} onChange={setScanData} />

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <SheetSelector
                  selectedId={selectedSheetId}
                  onSelect={setSelectedSheetId}
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving || !selectedSheetId}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Save Contact"}
                  </button>
                  <button
                    onClick={handleScanAnother}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
