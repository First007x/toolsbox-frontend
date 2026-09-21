// ไฟล์: toolsbox-frontend/app/tools/image-compressor/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  Download,
  Minimize2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(60);

  const [status, setStatus] = useState<
    "IDLE" | "UPLOADING" | "PROCESSING" | "SUCCESS" | "ERROR"
  >("IDLE");

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // ========================================
  // เลือกไฟล์
  // ========================================
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("IDLE");
      setResultUrl(null);
      setErrorMessage("");
    }
  };

  // ========================================
  // อัปโหลด + ลดขนาดไฟล์
  // ========================================
  const handleProcess = async () => {
    if (!file) return;

    try {
      // 1. อัปโหลดไฟล์
      setStatus("UPLOADING");
      setErrorMessage("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const uploadRes: any = await apiClient.post(
        "/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const fileId = uploadRes.data?.file_id;

      if (!fileId) {
        throw new Error("ไม่พบ File ID จากเซิร์ฟเวอร์");
      }

      // 2. ส่งคำสั่งลดขนาดไฟล์
      setStatus("PROCESSING");

      const processRes: any = await apiClient.post(
        "/jobs/image-compress",
        {
          fileId,
          quality: Number(quality),
        }
      );

      const resultPath = processRes.data?.result_url;

      if (!resultPath) {
        throw new Error("ไม่พบ URL ของไฟล์ผลลัพธ์");
      }

      // 3. แสดงไฟล์ผลลัพธ์
      setResultUrl(`http://localhost:3001${resultPath}`);
      setStatus("SUCCESS");
    } catch (error: any) {
      console.error("Image compression error:", error);

      setStatus("ERROR");
      setErrorMessage(
        "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่"
      );
    }
  };

  // ========================================
  // ดาวน์โหลดไฟล์
  // ========================================
  const handleDownload = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();

    if (!resultUrl) return;

    try {
      const response = await fetch(resultUrl);

      if (!response.ok) {
        throw new Error("ไม่สามารถดาวน์โหลดไฟล์ได้");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      // ใช้นามสกุลจากไฟล์ต้นฉบับ
      const ext = file?.name.split(".").pop() || "jpg";
      link.download = `compressed-image.${ext}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์");
    }
  };

  // ========================================
  // UI
  // ========================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับไปหน้าหลัก
        </Link>

        {/* Main card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-orange-50 p-3 rounded-lg text-orange-500">
              <Minimize2 className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                ลดขนาดรูปภาพ (Compressor)
              </h1>

              <p className="text-gray-500">
                บีบอัดขนาดไฟล์ให้เล็กลง โดยไม่เสียรายละเอียดมากนัก
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* ========================================
                1. Upload
            ======================================== */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                1. อัปโหลดรูปภาพที่ต้องการลดขนาด
              </label>

              <div
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                  file
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center space-y-3 pointer-events-none">
                  {file ? (
                    <>
                      <ImageIcon className="w-12 h-12 text-orange-500" />

                      <span className="text-orange-600 font-medium text-lg break-all">
                        {file.name}
                      </span>

                      <span className="text-sm text-gray-500">
                        ขนาดเดิม:{" "}
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-gray-400" />

                      <span className="text-gray-600 font-medium text-lg">
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                      </span>

                      <span className="text-sm text-gray-400">
                        รองรับ JPEG, PNG, WEBP (สูงสุด 15MB)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================
                2. Quality
            ======================================== */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                2. เลือกระดับการบีบอัดไฟล์
              </label>

              <select
                value={quality}
                onChange={(e) =>
                  setQuality(Number(e.target.value))
                }
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value={80}>
                  ชัดเจน (ลดขนาดเล็กน้อย - Quality 80%)
                </option>

                <option value={60}>
                  สมดุล (แนะนำ - Quality 60%)
                </option>

                <option value={40}>
                  ขนาดเล็กสุด (ภาพอาจจะแตกนิดหน่อย - Quality 40%)
                </option>
              </select>
            </div>

            {/* ========================================
                Error
            ======================================== */}
            {status === "ERROR" && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* ========================================
                Success
            ======================================== */}
            {status === "SUCCESS" && resultUrl && (
              <div className="p-8 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center space-y-5">
                <p className="text-green-700 font-medium text-lg">
                  🎉 ลดขนาดไฟล์สำเร็จ!
                </p>

                <img
                  src={resultUrl}
                  alt="Compressed result"
                  className="max-w-sm max-h-96 object-contain rounded-lg shadow-sm border border-gray-200"
                />

                <a
                  href={resultUrl}
                  onClick={handleDownload}
                  className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <Download className="w-5 h-5 mr-2" />
                  ดาวน์โหลดไฟล์ใหม่
                </a>
              </div>
            )}

            {/* ========================================
                Process button
            ======================================== */}
            <button
              onClick={handleProcess}
              disabled={
                !file ||
                status === "UPLOADING" ||
                status === "PROCESSING"
              }
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              {status === "UPLOADING" ||
              status === "PROCESSING" ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  {status === "UPLOADING"
                    ? "กำลังอัปโหลดไฟล์..."
                    : "กำลังบีบอัดไฟล์..."}
                </>
              ) : (
                "เริ่มลดขนาดรูปภาพ!"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}