"use client";

import { useState, useEffect } from "react";

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  website: string;
  rawText: string;
}

interface ScanResultProps {
  data: ContactData;
  onChange: (data: ContactData) => void;
}

export function ScanResult({ data, onChange }: ScanResultProps) {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (field: keyof ContactData, value: string) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onChange(updated);
  };

  const fields: { key: keyof ContactData; label: string; placeholder: string }[] = [
    { key: "name", label: "Name", placeholder: "John Doe" },
    { key: "email", label: "Email", placeholder: "john@example.com" },
    { key: "phone", label: "Phone", placeholder: "(555) 123-4567" },
    { key: "website", label: "Website", placeholder: "www.example.com" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Extracted Information
      </h3>
      <div className="space-y-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type={key === "email" ? "email" : "text"}
              value={localData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
        <details className="mt-4">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Show raw text
          </summary>
          <pre className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {localData.rawText}
          </pre>
        </details>
      </div>
    </div>
  );
}
