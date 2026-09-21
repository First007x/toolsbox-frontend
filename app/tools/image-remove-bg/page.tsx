"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, UploadCloud, Loader2, Download, Scissors, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ImageRemoveBgPage() {
  /* STREAMING_CHUNK:กำหนด State ตัวแปรต่างๆ */
  const [file, setFile] = useState<File | null>(null);
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

  /* STREAMING_CHUNK:ฟังก์ชันประมวลผลลบพื้นหลัง */
  const handleProcess = async () => {
    if (!file) return;
    
    try {
      setStatus("UPLOADING");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const uploadRes: any = await apiClient.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const fileId = uploadRes.data?.file_id;
      if (!fileId) throw new Error("ไม่พบ File ID จากเซิร์ฟเวอร์");

      setStatus("PROCESSING");
      // เรียก API ลบพื้นหลัง (จำลองเวลาทำงานด้วย AI)
      const processRes: any = await apiClient.post("/jobs/image-remove-bg", {
        fileId: fileId,
      });

      const resultPath = processRes.data?.result_url;
      setResultUrl(`http://localhost:3001${resultPath}`);
      setStatus("SUCCESS");
    } catch (error: any) {
      console.error(error);
      setStatus("ERROR");
      setErrorMessage("เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่");
    }
  };

  /* STREAMING_CHUNK:ฟังก์ชันดาวน์โหลดไฟล์ */
  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!resultUrl) return;
    
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `removed-bg-${Date.now()}.png`; // บังคับเป็น PNG เพราะตัดพื้นหลัง
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์");
    }
  };

  /* STREAMING_CHUNK:เรนเดอร์หน้าจอ UI */
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-rose-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> กลับไปหน้าหลัก
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-rose-50 p-3 rounded-lg text-rose-500 relative">
              <Scissors className="w-8 h-8" />
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ลบพื้นหลังรูปภาพ (AI Remove BG)</h1>
              <p className="text-gray-500">ใช้เทคโนโลยี AI เพื่อตัดฉากหลังออกอย่างแนบเนียน (ได้ไฟล์ PNG โปร่งใส)</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">1. อัปโหลดรูปภาพที่ต้องการไดคัท</label>
              <div className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors ${file ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center space-y-3 pointer-events-none">
                  {file ? (
                    <>
                      <ImageIcon className="w-12 h-12 text-rose-500" />
                      <span className="text-rose-600 font-medium text-lg">{file.name}</span>
                      <span className="text-sm text-gray-500">ขนาด: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-600 font-medium text-lg">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</span>
                      <span className="text-sm text-gray-400">รองรับ JPEG, PNG, WEBP ที่มีบุคคลหรือวัตถุชัดเจน</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {status === "ERROR" && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{errorMessage}</div>}
            
            {status === "SUCCESS" && resultUrl && (
              <div className="p-8 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center space-y-5">
                <p className="text-green-700 font-medium text-lg">✨ ลบพื้นหลังสำเร็จ!</p>
                {/* 🚀 พื้นหลังลายหมากรุก เพื่อให้เห็นความโปร่งใสชัดเจน */}
                <div className="bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-200 rounded-lg p-4 border border-gray-300">
                   <img src={resultUrl} alt="Result" className="max-w-sm drop-shadow-lg" />
                </div>
                <a href={resultUrl} onClick={handleDownload} className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer shadow-sm">
                  <Download className="w-5 h-5 mr-2" /> ดาวน์โหลดภาพโปร่งใส (PNG)
                </a>
              </div>
            )}

            <button onClick={handleProcess} disabled={!file || status === "UPLOADING" || status === "PROCESSING"} className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white font-semibold text-lg rounded-xl flex items-center justify-center transition-colors shadow-sm relative overflow-hidden">
              {status === "UPLOADING" && <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> กำลังอัปโหลด...</>}
              {status === "PROCESSING" && (
                <>
                  <Sparkles className="w-6 h-6 mr-2 animate-pulse text-yellow-300" /> 
                  AI กำลังวิเคราะห์และตัดฉากหลัง...
                </>
              )}
              {status !== "UPLOADING" && status !== "PROCESSING" && "เริ่มตัดพื้นหลังเลย!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}