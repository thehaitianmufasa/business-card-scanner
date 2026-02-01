"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Spreadsheet {
  id: string;
  name: string;
}

interface SheetSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function SheetSelector({ selectedId, onSelect }: SheetSelectorProps) {
  const [sheets, setSheets] = useState<Spreadsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const response = await fetch("/api/sheets/list");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch sheets");
      }

      setSheets(data.spreadsheets);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load spreadsheets"
      );
    } finally {
      setLoading(false);
    }
  };

  const createSheet = async () => {
    if (!newSheetName.trim()) {
      toast.error("Please enter a sheet name");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/sheets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSheetName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create sheet");
      }

      setSheets((prev) => [data.spreadsheet, ...prev]);
      onSelect(data.spreadsheet.id);
      setShowCreate(false);
      setNewSheetName("");
      toast.success("Spreadsheet created!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create spreadsheet"
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Save to Google Sheet
      </label>

      <div className="flex gap-2">
        <select
          value={selectedId || ""}
          onChange={(e) => onSelect(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a spreadsheet...</option>
          {sheets.map((sheet) => (
            <option key={sheet.id} value={sheet.id}>
              {sheet.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          + New
        </button>
      </div>

      {showCreate && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newSheetName}
            onChange={(e) => setNewSheetName(e.target.value)}
            placeholder="Business Card Contacts"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => e.key === "Enter" && createSheet()}
          />
          <button
            onClick={createSheet}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      )}
    </div>
  );
}
