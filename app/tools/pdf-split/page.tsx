// ไฟล์: toolsbox-frontend/app/tools/pdf-split/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Scissors, Loader2, Download, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function PdfSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState("");
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "PROCESSING" | "SUCCESS" | "ERROR">("IDLE");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("IDLE");
      setResultUrl(null);
    }
  };

  // 🚀 ฟังก์ชันเทพ: แปลงข้อความ "1, 3, 5-7" เป็น Array [1, 3, 5, 6, 7]
  const parsePageStringToArray = (input: string): number[] => {
    const pages = new Set<number>();
    const parts = input.replace(/\s+/g, "").split(","); // ลบช่องว่างและแยกด้วยลูกน้ำ
    
    for (const part of parts) {
      if (!part) continue;
      
      const range = part.split("-");
      if (range.length === 1) {
        const p = parseInt(range[0]);
        if (!isNaN(p)) pages.add(p);
      } else if (range.length === 2) {
        const start = parseInt(range[0]);
        const end = parseInt(range[1]);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) pages.add(i);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleProcess = async () => {
    if (!file) {
      setErrorMessage("กรุณาเลือกไฟล์ PDF");
      setStatus("ERROR");
      return;
    }

    const pagesArray = parsePageStringToArray(pageRange);
    if (pagesArray.length === 0) {
      setErrorMessage("กรุณาระบุหน้าเว็บที่ต้องการแยกให้ถูกต้อง (เช่น 1, 3, 5-7)");
      setStatus("ERROR");
      return;
    }

    try {
      setStatus("UPLOADING");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "document");

      const uploadRes: any = await apiClient.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (!uploadRes.data?.file_id) throw new Error("อัปโหลดไฟล์ล้มเหลว");

      setStatus("PROCESSING");
      const processRes: any = await apiClient.post("/jobs/pdf-split", {
        fileId: uploadRes.data.file_id,
        pages: pagesArray
      });

      setResultUrl(`http://localhost:3001${processRes.data?.result_url}`);
      setStatus("SUCCESS");
    } catch (error: any) {
      setStatus("ERROR");
      setErrorMessage(error.response?.data?.error?.message || "เกิดข้อผิดพลาดในการประมวลผล");
    }
  };

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `split-${file?.name || "document.pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert("ดาวน์โหลดล้มเหลว");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> กลับไปหน้าหลัก
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-green-50 p-3 rounded-lg text-green-600">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">แยกหน้า PDF (Split PDF)</h1>
              <p className="text-gray-500">ดึงเฉพาะหน้าที่ต้องการออกจากเอกสาร PDF</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">1. เลือกไฟล์ PDF ต้นฉบับ</label>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 border border-gray-300 rounded-lg cursor-pointer" 
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 flex justify-between">
                <span>2. ระบุหน้าที่ต้องการแยก</span>
                <span className="text-xs text-gray-400 font-normal">ตัวอย่าง: 1, 3, 5-7</span>
              </label>
              <input 
                type="text" 
                placeholder="เช่น 1, 3, 5-7 หรือ 1,2,3" 
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              />
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
                หากระบุหน้าที่ไม่มีอยู่จริง ระบบจะข้ามหน้านั้นไปโดยอัตโนมัติ
              </p>
            </div>

            {status === "ERROR" && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{errorMessage}</div>}
            
            {status === "SUCCESS" && resultUrl && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center space-y-4 animate-in zoom-in-95">
                <p className="text-green-700 font-medium">🎉 แยกหน้าเอกสารสำเร็จแล้ว!</p>
                <a href={resultUrl} onClick={handleDownload} className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                  <Download className="w-5 h-5 mr-2" /> ดาวน์โหลด PDF ที่แยกแล้ว
                </a>
              </div>
            )}

            <button 
              onClick={handleProcess} 
              disabled={!file || !pageRange || status === "UPLOADING" || status === "PROCESSING"} 
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold text-lg rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              {(status === "UPLOADING" || status === "PROCESSING") && <Loader2 className="w-6 h-6 mr-2 animate-spin" />}
              {status === "UPLOADING" ? "กำลังอัปโหลด..." : status === "PROCESSING" ? "กำลังแยกหน้า PDF..." : "เริ่มแยกหน้า PDF!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}