"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Key, Lock, Unlock, FileUp, Copy, CheckCircle2, AlertTriangle } from "lucide-react";

export default function Base64ToolPage() {
  const [activeTab, setActiveTab] = useState<"ENCODE_TEXT" | "DECODE_TEXT" | "ENCODE_FILE">("ENCODE_TEXT");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // 🚀 ฟังก์ชันทำงานแบบ Real-time ทุกครั้งที่พิมพ์
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("");
      setErrorMsg("");
      return;
    }

    if (activeTab === "ENCODE_TEXT") {
      try {
        // ท่านี้ช่วยให้รองรับสระภาษาไทย (UTF-8) ได้สมบูรณ์
        const encoded = btoa(unescape(encodeURIComponent(inputText)));
        setOutputText(encoded);
        setErrorMsg("");
      } catch (err) {
        setErrorMsg("เกิดข้อผิดพลาดในการเข้ารหัสข้อมูล");
        setOutputText("");
      }
    } else if (activeTab === "DECODE_TEXT") {
      try {
        const decoded = decodeURIComponent(escape(atob(inputText)));
        setOutputText(decoded);
        setErrorMsg("");
      } catch (err) {
        setErrorMsg("รูปแบบ Base64 ไม่ถูกต้อง (โปรดตรวจสอบข้อมูลอีกครั้ง)");
        setOutputText("");
      }
    }
  }, [inputText, activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // จำกัดขนาดไฟล์ที่ 5MB เพราะ Base64 string จะยาวมากและอาจทำให้เบราว์เซอร์ค้าง
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("กรุณาเลือกไฟล์ขนาดไม่เกิน 5MB");
      setOutputText("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOutputText(event.target?.result as string);
      setErrorMsg("");
    };
    reader.onerror = () => {
      setErrorMsg("เกิดข้อผิดพลาดในการอ่านไฟล์");
    };
    reader.readAsDataURL(file); // แปลงไฟล์เป็น Base64 ทันที
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTabChange = (tab: "ENCODE_TEXT" | "DECODE_TEXT" | "ENCODE_FILE") => {
    setActiveTab(tab);
    setInputText("");
    setOutputText("");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> กลับไปหน้าหลัก
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-amber-50 p-3 rounded-lg text-amber-500">
              <Key className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">เข้ารหัส / ถอดรหัส Base64</h1>
              <p className="text-gray-500">แปลงข้อความหรือไฟล์รูปภาพให้เป็น Base64 ทำงานรวดเร็วบนเบราว์เซอร์</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 🚀 ระบบ Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => handleTabChange("ENCODE_TEXT")}
                className={`flex-1 flex items-center justify-center py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === "ENCODE_TEXT" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Lock className="w-4 h-4 mr-2" /> เข้ารหัสข้อความ (Encode)
              </button>
              <button 
                onClick={() => handleTabChange("DECODE_TEXT")}
                className={`flex-1 flex items-center justify-center py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === "DECODE_TEXT" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Unlock className="w-4 h-4 mr-2" /> ถอดรหัสข้อความ (Decode)
              </button>
              <button 
                onClick={() => handleTabChange("ENCODE_FILE")}
                className={`flex-1 flex items-center justify-center py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === "ENCODE_FILE" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FileUp className="w-4 h-4 mr-2" /> แปลงไฟล์เป็น Base64
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ฝั่งซ้าย: Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {activeTab === "ENCODE_TEXT" ? "พิมพ์ข้อความที่ต้องการเข้ารหัส" : 
                   activeTab === "DECODE_TEXT" ? "วางโค้ด Base64 ที่ต้องการถอดรหัส" : 
                   "เลือกไฟล์ที่ต้องการแปลง (สูงสุด 5MB)"}
                </label>
                
                {activeTab !== "ENCODE_FILE" ? (
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeTab === "ENCODE_TEXT" ? "เช่น สวัสดีชาวโลก, Hello World..." : "เช่น 4Liq4Lin4Lix4Liq4LiU4Li1..."}
                    className="w-full h-64 bg-white border border-gray-300 rounded-xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-mono text-sm leading-relaxed"
                  />
                ) : (
                  <div className="relative border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-xl h-64 flex flex-col items-center justify-center text-center transition-colors">
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <FileUp className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-gray-600 font-medium">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</span>
                    <span className="text-sm text-gray-400 mt-1">รองรับทุกไฟล์ (แนะนำรูปภาพ)</span>
                  </div>
                )}
              </div>

              {/* ฝั่งขวา: Output */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">ผลลัพธ์ (Output)</label>
                  <button 
                    onClick={handleCopy}
                    disabled={!outputText}
                    className="inline-flex items-center text-xs font-medium text-amber-600 hover:text-amber-700 disabled:text-gray-400 transition-colors"
                  >
                    {copied ? <><CheckCircle2 className="w-4 h-4 mr-1" /> คัดลอกแล้ว</> : <><Copy className="w-4 h-4 mr-1" /> คัดลอกผลลัพธ์</>}
                  </button>
                </div>
                
                <div className="relative w-full h-64 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                  <textarea 
                    readOnly
                    value={outputText}
                    placeholder="ผลลัพธ์จะแสดงที่นี่อัตโนมัติ..."
                    className="w-full h-full bg-transparent p-4 text-green-400 font-mono text-sm leading-relaxed focus:outline-none resize-none break-all"
                  />
                  {/* แสดง Error แบบ Overlay ถ้ามีข้อผิดพลาด */}
                  {errorMsg && (
                    <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                      <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
                      <p className="text-red-400 font-medium">{errorMsg}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}