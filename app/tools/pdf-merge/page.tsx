"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  UploadCloud,
  Loader2,
  Download,
  Layers,
  X,
} from "lucide-react";

import { apiClient } from "@/lib/api-client";

export default function PdfMergePage() {
  const [files, setFiles] = useState<File[]>([]);

  const [status, setStatus] = useState<
    "IDLE" | "UPLOADING" | "PROCESSING" | "SUCCESS" | "ERROR"
  >("IDLE");

  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // เลือกไฟล์ PDF
  // =========================================================
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (
      e.target.files &&
      e.target.files.length > 0
    ) {
      // เอาไฟล์ใหม่มาต่อท้ายไฟล์เดิม
      const newFiles = Array.from(
        e.target.files
      );

      setFiles((prev) => [
        ...prev,
        ...newFiles,
      ]);

      setStatus("IDLE");
      setResultUrl(null);
    }
  };

  // =========================================================
  // ลบไฟล์ออกจากรายการ
  // =========================================================
  const removeFile = (
    indexToRemove: number
  ) => {
    setFiles((prev) =>
      prev.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  // =========================================================
  // เริ่มกระบวนการ Merge PDF
  // =========================================================
  const handleProcess = async () => {
    // ต้องมีอย่างน้อย 2 ไฟล์
    if (files.length < 2) {
      setErrorMessage(
        "กรุณาเลือกไฟล์อย่างน้อย 2 ไฟล์"
      );

      setStatus("ERROR");

      return;
    }

    try {
      // -------------------------------------------------------
      // 1. Upload ไฟล์
      // -------------------------------------------------------
      setStatus("UPLOADING");

      const fileIds: string[] = [];

      // Upload ทีละไฟล์
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();

        formData.append(
          "file",
          files[i]
        );

        // บอก Backend ว่าเป็นเอกสาร
        formData.append(
          "type",
          "document"
        );

        const uploadRes: any =
          await apiClient.post(
            "/files/upload",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        // ตรวจสอบว่า Upload สำเร็จหรือไม่
        if (!uploadRes.data?.file_id) {
          throw new Error(
            "อัปโหลดไฟล์ล้มเหลว"
          );
        }

        // เก็บ ID ของไฟล์
        fileIds.push(
          uploadRes.data.file_id
        );
      }

      // -------------------------------------------------------
      // 2. ส่ง File IDs ไปให้ Backend รวม PDF
      // -------------------------------------------------------
      setStatus("PROCESSING");

      const processRes: any =
        await apiClient.post(
          "/jobs/pdf-merge",
          {
            fileIds: fileIds,
          }
        );

      // -------------------------------------------------------
      // 3. รับ URL ของไฟล์ที่รวมแล้ว
      // -------------------------------------------------------
      const resultPath =
        processRes.data?.result_url;

      setResultUrl(
        `http://localhost:3001${resultPath}`
      );

      setStatus("SUCCESS");
    } catch (error: any) {
      console.error(error);

      setStatus("ERROR");

      setErrorMessage(
        error.response?.data?.error?.message ||
          "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่"
      );
    }
  };

  // =========================================================
  // ดาวน์โหลดไฟล์ PDF ที่รวมเสร็จแล้ว
  // =========================================================
  const handleDownload = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();

    if (!resultUrl) {
      return;
    }

    try {
      const response =
        await fetch(resultUrl);

      const blob =
        await response.blob();

      const blobUrl =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = blobUrl;

      link.download =
        `merged-document-${Date.now()}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(
        blobUrl
      );
    } catch (error) {
      console.error(error);

      alert("ดาวน์โหลดล้มเหลว");
    }
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* =====================================================
            Back Button
        ====================================================== */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับไปหน้าหลัก
        </Link>

        {/* =====================================================
            Main Card
        ====================================================== */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">

          {/* ---------------------------------------------------
              Header
          ---------------------------------------------------- */}
          <div className="flex items-center space-x-4 mb-8">

            <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
              <Layers className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                รวมไฟล์เอกสาร (Merge PDF)
              </h1>

              <p className="text-gray-500">
                นำไฟล์ PDF หลายๆ ไฟล์มามัดรวมเป็นไฟล์เดียว
                (เรียงตามลำดับที่เลือก)
              </p>
            </div>

          </div>

          {/* ---------------------------------------------------
              Content
          ---------------------------------------------------- */}
          <div className="space-y-8">

            {/* =================================================
                File Upload
            ================================================== */}
            <div className="space-y-3">

              <label className="block text-sm font-medium text-gray-700">
                1. เลือกไฟล์ PDF
                (ต้องเลือกอย่างน้อย 2 ไฟล์)
              </label>

              {/* Upload Box */}
              <div className="relative border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-8 text-center transition-colors">

                <input
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center space-y-3 pointer-events-none">

                  <UploadCloud className="w-10 h-10 text-gray-400" />

                  <span className="text-gray-600 font-medium">
                    คลิกเพื่อเลือกไฟล์
                    หรือลากไฟล์มาวางที่นี่
                  </span>

                  <span className="text-sm text-gray-400">
                    สามารถเลือกได้หลายไฟล์พร้อมกัน
                  </span>

                </div>
              </div>

              {/* =================================================
                  File List
              ================================================== */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">

                  {/* File Count + Clear */}
                  <p className="text-sm font-medium text-gray-600 flex items-center justify-between">

                    <span>
                      ลำดับไฟล์ที่จะถูกรวม
                      ({files.length} ไฟล์):
                    </span>

                    <button
                      onClick={() =>
                        setFiles([])
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      ล้างทั้งหมด
                    </button>

                  </p>

                  {/* Files */}
                  <ul className="space-y-2">

                    {files.map(
                      (file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in slide-in-from-bottom-2"
                        >

                          {/* File Information */}
                          <div className="flex items-center space-x-3 overflow-hidden">

                            <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2 py-1 rounded-md">
                              {index + 1}
                            </span>

                            <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />

                            <span className="text-gray-700 text-sm truncate font-medium">
                              {file.name}
                            </span>

                            <span className="text-gray-400 text-xs flex-shrink-0">
                              (
                              {(
                                file.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB)
                            </span>

                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() =>
                              removeFile(
                                index
                              )
                            }
                            className="p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>

                        </li>
                      )
                    )}

                  </ul>

                </div>
              )}

            </div>

            {/* =================================================
                Error Message
            ================================================== */}
            {status === "ERROR" && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* =================================================
                Success Message
            ================================================== */}
            {status === "SUCCESS" &&
              resultUrl && (
                <div className="p-8 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center space-y-5 animate-in fade-in zoom-in-95">

                  <p className="text-green-700 font-medium text-lg">
                    🎉 รวมไฟล์ PDF สำเร็จแล้ว!
                  </p>

                  <a
                    href={resultUrl}
                    onClick={
                      handleDownload
                    }
                    className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    ดาวน์โหลดไฟล์รวม (.pdf)
                  </a>

                </div>
              )}

            {/* =================================================
                Merge Button
            ================================================== */}
            <button
              onClick={handleProcess}
              disabled={
                files.length < 2 ||
                status === "UPLOADING" ||
                status === "PROCESSING"
              }
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold text-lg rounded-xl flex items-center justify-center transition-colors shadow-sm relative overflow-hidden"
            >

              {/* Uploading */}
              {status === "UPLOADING" && (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  กำลังอัปโหลดไฟล์ (
                  {files.length} ไฟล์)...
                </>
              )}

              {/* Processing */}
              {status === "PROCESSING" && (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  กำลังผสานเอกสาร...
                </>
              )}

              {/* Default */}
              {status !== "UPLOADING" &&
                status !== "PROCESSING" &&
                `เริ่มรวมไฟล์ PDF! ${
                  files.length > 0
                    ? `(${files.length} ไฟล์)`
                    : ""
                }`}

            </button>

          </div>
        </div>

      </div>
    </div>
  );
}