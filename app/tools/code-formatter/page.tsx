// ไฟล์: toolsbox-frontend/app/tools/code-formatter/page.tsx

"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Code,
  Copy,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

type Language = "json" | "html" | "javascript";
type Status = "IDLE" | "PROCESSING" | "SUCCESS" | "ERROR";

export default function CodeFormatterPage() {
  // =========================
  // State
  // =========================
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("json");

  const [status, setStatus] = useState<Status>("IDLE");
  const [formattedCode, setFormattedCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [autoFixedInfo, setAutoFixedInfo] = useState<{
    isFixed: boolean;
    msg: string;
  }>({
    isFixed: false,
    msg: "",
  });

  const [copied, setCopied] = useState(false);

  // =========================
  // Refs สำหรับ Scroll เลขบรรทัด
  // =========================
  const inputLineRef = useRef<HTMLDivElement>(null);
  const inputCodeRef = useRef<HTMLTextAreaElement>(null);

  const outputLineRef = useRef<HTMLDivElement>(null);
  const outputCodeRef = useRef<HTMLTextAreaElement>(null);

  // =========================
  // Helper
  // =========================
  const getLineCount = (text: string): number => {
    return Math.max(1, text.split("\n").length);
  };

  // =========================
  // Scroll Synchronization
  // =========================
  const handleInputScroll = () => {
    if (inputLineRef.current && inputCodeRef.current) {
      inputLineRef.current.scrollTop = inputCodeRef.current.scrollTop;
    }
  };

  const handleOutputScroll = () => {
    if (outputLineRef.current && outputCodeRef.current) {
      outputLineRef.current.scrollTop = outputCodeRef.current.scrollTop;
    }
  };

  // =========================
  // Format Code
  // =========================
  const handleFormat = async () => {
    if (!code.trim()) {
      return;
    }

    try {
      setStatus("PROCESSING");
      setErrorMessage("");
      setFormattedCode("");
      setAutoFixedInfo({
        isFixed: false,
        msg: "",
      });

      const response = await apiClient.post("/jobs/code-format", {
        code,
        language,
      });

      const resultData = response.data || response;

      const finalCode =
        resultData.formatted_code || resultData.formattedCode;

      if (!finalCode) {
        throw new Error("Backend ไม่ได้ส่งโค้ดที่จัดรูปแบบกลับมา");
      }

      setFormattedCode(finalCode);
      setStatus("SUCCESS");

      // ตรวจสอบว่ามีการ Auto Fix หรือไม่
      if (resultData.auto_fixed || resultData.autoFixed) {
        setAutoFixedInfo({
          isFixed: true,
          msg:
            resultData.auto_fix_message ||
            resultData.autoFixMessage ||
            "ระบบได้ทำการแก้ไขโค้ดบางส่วนให้โดยอัตโนมัติ",
        });
      }
    } catch (error: any) {
      setStatus("ERROR");

      const backendMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message;

      setErrorMessage(
        backendMessage ||
          "เกิดข้อผิดพลาด กรุณาตรวจสอบความถูกต้องของโค้ด"
      );
    }
  };

  // =========================
  // Copy Code
  // =========================
  const handleCopy = async () => {
    if (!formattedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formattedCode);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  // =========================
  // Render
  // =========================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับไปหน้าหลัก
        </Link>

        {/* Main Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
              <Code className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                จัดระเบียบโค้ด (Code Beautifier)
              </h1>

              <p className="text-gray-500">
                จัดหน้าตา Indent และโครงสร้างโค้ดให้อ่านง่าย
                (JSON, HTML, JS)
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* =========================
                1. Language Selection
            ========================= */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                1. เลือกภาษาของโค้ด
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as Language)
                }
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            {/* =========================
                2. Input Code
            ========================= */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                2. วางโค้ดที่ต้องการจัดระเบียบที่นี่
              </label>

              <div className="flex h-64 bg-gray-50 border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-white transition-colors">
                {/* Input Line Numbers */}
                <div
                  ref={inputLineRef}
                  className="w-12 flex-shrink-0 bg-gray-100 border-r border-gray-200 text-gray-400 text-right px-2 py-4 font-mono text-sm leading-relaxed overflow-hidden select-none"
                >
                  {Array.from({
                    length: getLineCount(code),
                  }).map((_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>

                {/* Input Textarea */}
                <textarea
                  ref={inputCodeRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={handleInputScroll}
                  placeholder={`วางโค้ด ${language.toUpperCase()} ของคุณที่นี่...`}
                  className="flex-1 min-w-0 bg-transparent p-4 text-gray-800 font-mono text-sm leading-relaxed focus:outline-none resize-none whitespace-pre overflow-auto"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* =========================
                Error Message
            ========================= */}
            {status === "ERROR" && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />

                <div>
                  <span className="font-bold">แจ้งเตือน:</span>{" "}
                  {errorMessage}
                </div>
              </div>
            )}

            {/* =========================
                Format Button
            ========================= */}
            <button
              type="button"
              onClick={handleFormat}
              disabled={!code.trim() || status === "PROCESSING"}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              {status === "PROCESSING" ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  กำลังจัดรูปแบบ...
                </>
              ) : (
                "จัดระเบียบโค้ดเลย!"
              )}
            </button>

            {/* =========================
                3. Output
            ========================= */}
            {status === "SUCCESS" && formattedCode && (
              <div className="pt-6 border-t border-gray-200 space-y-4 animate-in fade-in duration-500">
                {/* Output Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-green-700 flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-1" />
                      จัดระเบียบสำเร็จ!
                    </label>

                    {/* Auto Fix Message */}
                    {autoFixedInfo.isFixed && (
                      <span className="text-xs font-semibold text-orange-600 mt-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {autoFixedInfo.msg}
                      </span>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <span className="text-green-600">
                        คัดลอกแล้ว!
                      </span>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        คัดลอกโค้ด
                      </>
                    )}
                  </button>
                </div>

                {/* Output Code */}
                <div className="flex h-96 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition-colors">
                  {/* Output Line Numbers */}
                  <div
                    ref={outputLineRef}
                    className="w-12 flex-shrink-0 bg-gray-800 border-r border-gray-700 text-gray-500 text-right px-2 py-4 font-mono text-sm leading-relaxed overflow-hidden select-none"
                  >
                    {Array.from({
                      length: getLineCount(formattedCode),
                    }).map((_, index) => (
                      <div key={index}>{index + 1}</div>
                    ))}
                  </div>

                  {/* Output Textarea */}
                  <textarea
                    ref={outputCodeRef}
                    readOnly
                    value={formattedCode}
                    onScroll={handleOutputScroll}
                    className="flex-1 min-w-0 bg-transparent p-4 text-green-400 font-mono text-sm leading-relaxed focus:outline-none resize-none whitespace-pre overflow-auto"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
