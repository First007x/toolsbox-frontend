// ไฟล์: toolsbox-frontend/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  Image as ImageIcon,
  FileText,
  Code,
  Loader2,
  Key
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Tool {
  id: string | number;
  code: string;
  name: string;
  description?: string;
  category: string;
}

export default function HomePage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  // ========================================
  // โหลดรายการ Tools
  // ========================================
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await apiClient.get("/tools");
      setTools(response.data);
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // กำหนด Icon ตาม Category
  // ========================================
  const getToolIcon = (category: string) => {
    switch (category) {
      case "MULTIMEDIA":
        return <ImageIcon className="w-6 h-6 text-blue-500" />;

      case "DOCUMENT":
        return <FileText className="w-6 h-6 text-green-500" />;

      case "CODE":
        return <Code className="w-6 h-6 text-purple-500" />;

      case "UTILITY": // 🚀 เพิ่มหมวดหมู่ UTILITY สำหรับ Base64
        return <Key className="w-6 h-6 text-amber-500" />;  

      default:
        return <Settings className="w-6 h-6 text-gray-500" />;
    }
  };

  // ========================================
  // กำหนด URL ของแต่ละ Tool
  // ========================================
  const getToolUrl = (code: string) => {
    switch (code) {
      case "IMG_CONVERTER":
        return "/tools/image-converter";
      case "IMG_COMPRESSOR":
        return "/tools/image-compressor";
      case "CODE_FORMATTER":
        return "/tools/code-formatter";
      case "IMG_REMOVE_BG":
        return "/tools/image-remove-bg";
      case "PDF_MERGE":
        return "/tools/pdf-merge";
      case "BASE64_TOOL": // 🚀 เพิ่มลิงก์สำหรับ Base64
        return "/tools/base64-tool";

      case "PDF_SPLIT":
        return "/tools/pdf-split";
        
        default:
        return "#";
    }
  };

  // ========================================
  // UI
  // ========================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-blue-600">
            CSMJU Tools Box
          </h1>

          <p className="text-gray-500">
            เลือกเครื่องมือที่คุณต้องการใช้งาน
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />

            <p className="text-gray-500">
              กำลังโหลดข้อมูลระบบ...
            </p>
          </div>
        )}

        {/* Tools List */}
        {!loading && tools.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={getToolUrl(tool.code)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex items-start space-x-4 cursor-pointer group"
              >
                {/* Icon */}
                <div className="bg-gray-50 p-3 rounded-lg flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                  {getToolIcon(tool.category)}
                </div>

                {/* Tool Information */}
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {tool.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {tool.description ||
                      "เครื่องมืออำนวยความสะดวกสำหรับนักศึกษา"}
                  </p>

                  <span className="inline-block mt-3 px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded">
                    {tool.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Tools */}
        {!loading && tools.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500">
              ยังไม่มีเครื่องมือในระบบ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}