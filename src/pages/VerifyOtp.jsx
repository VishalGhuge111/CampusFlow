import { useState, useRef } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Loader, CheckCircle2 } from "lucide-react";

function VerifyOtp({ userId, onVerified, userName = "" }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await API.post("/auth/verify-otp", {
        userId,
        otp: otpString,
      });

      // Store user name in localStorage if provided
      if (userName) {
        localStorage.setItem("userName", userName);
      }

      setOtp(["", "", "", "", "", ""]);
      alert("Email verified successfully. Please login.");
      navigate("/login");
      onVerified();
    } catch (err) {
      setError("Invalid or expired OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block mb-3 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckCircle2 className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Verify Email</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Enter the 6-digit OTP sent to your email</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Input Boxes */}
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  placeholder="0"
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Didn't receive code?{" "}
              <button type="button" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300">
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
