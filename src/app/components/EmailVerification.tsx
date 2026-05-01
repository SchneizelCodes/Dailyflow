import { useState, useEffect } from "react";

interface EmailVerificationProps {
  email: string;
  verificationCode: string;
  onVerify: () => void;
  onCancel: () => void;
  onResend: () => void;
}

export function EmailVerification({ email, verificationCode, onVerify, onCancel, onResend }: EmailVerificationProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(pastedData)) {
      setError("Please paste a valid 6-digit code");
      return;
    }

    const newCode = pastedData.split("");
    setCode(newCode);
    setError("");
  };

  const handleVerify = () => {
    const enteredCode = code.join("");

    if (enteredCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (enteredCode === verificationCode) {
      onVerify();
    } else {
      setError("Invalid verification code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
    }
  };

  const handleResend = () => {
    setIsResending(true);
    setCode(["", "", "", "", "", ""]);
    setError("");
    setTimeLeft(300);
    onResend();

    setTimeout(() => {
      setIsResending(false);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-pink-200/95 to-purple-200/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md relative border border-pink-300/50 m-4">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-700 text-sm">We've sent a 6-digit code to</p>
          <p className="text-pink-600 font-semibold text-sm">{email}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-pink-300/50 mb-6">
          <p className="text-gray-700 text-sm text-center mb-4">Enter the verification code</p>

          <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-white border-2 border-pink-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm text-center mb-4">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Code expires in {formatTime(timeLeft)}</span>
          </div>

          <div className="bg-pink-50/80 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Verification Code (for demo):</p>
            <p className="text-lg font-bold text-pink-600 font-mono tracking-wider">{verificationCode}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerify}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
          >
            Verify Email
          </button>

          <div className="text-center">
            <p className="text-gray-700 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending || timeLeft > 240}
              className="text-pink-600 font-semibold text-sm hover:text-pink-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          </div>

          <button
            onClick={onCancel}
            className="w-full px-6 py-3 bg-white/60 hover:bg-white/80 text-gray-700 font-semibold rounded-lg transition-colors duration-300 border border-pink-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
