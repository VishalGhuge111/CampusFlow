import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Lock, Eye, EyeOff, Loader, Check, Mail, Upload, Trash2, ArrowLeft } from "lucide-react";

// Image resize utility (Patch 2: Profile Image 413 Fix)
const resizeImage = async (base64String) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64String;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxSize = 200;
      
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    
    img.onerror = () => reject(new Error("Image load failed"));
  });
};

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Profile State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security Tab State
  const [securityTab, setSecurityTab] = useState("change");

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotUserId, setForgotUserId] = useState(null);
  const otpInputRefs = Array(6).fill(null).map(() => ({}));

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setCollege(res.data.college || "");
        setBranch(res.data.branch || "");
        setYear(res.data.year || "1");
        setPhoneNumber(res.data.phoneNumber || "");
        setAvatar(res.data.avatar || "");
        setForgotEmail(res.data.email || "");
      } catch (err) {
        console.error("Error loading profile:", err);
        setProfileError("Failed to load profile");
      }
    };

    if (token) {
      loadProfile();
    }
  }, [token]);

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result;
        const resized = await resizeImage(base64);
        
        // Check size (200KB = 204800 bytes)
        const fileSizeInBytes = Math.ceil((resized.length * 3) / 4);
        if (fileSizeInBytes > 204800) {
          alert("Image must be under 200KB");
          return;
        }
        
        setAvatar(resized);
      } catch (err) {
        console.error("Error processing image:", err);
        alert("Failed to process image");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      await API.put(
        "/users/profile",
        { name, college, branch, year, phoneNumber, avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("userName", name);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError("Failed to update profile");
      console.error("Error:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      await API.post(
        "/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Forgot Password - Send OTP
  const handleSendForgotOTP = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const res = await API.post("/auth/profile-forgot-password", {
        email: forgotEmail,
      });

      setForgotUserId(res.data.userId);
      setForgotStep("otp");
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle OTP change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs[index + 1]?.focus?.();
    }
  };

  // Reset Forgot Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess(false);

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setForgotError("Please enter all 6 digits");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError("Password must be at least 6 characters");
      return;
    }

    setForgotLoading(true);

    try {
      await API.post("/auth/reset-password", {
        userId: forgotUserId,
        otp: otpString,
        newPassword: forgotNewPassword,
      });

      setForgotSuccess(true);
      setTimeout(() => {
        setSecurityTab("change");
        setForgotStep("email");
        setOtp(["", "", "", "", "", ""]);
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotUserId(null);
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone. All your tasks will be permanently deleted."
      )
    ) {
      return;
    }

    setProfileLoading(true);

    try {
      await API.delete("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      navigate("/");
    } catch (err) {
      setProfileError("Failed to delete account");
      console.error("Error:", err);
      setProfileLoading(false);
    }
  };

  const avatarLetter = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Mobile Back Button - Patch 9: Add mt-3 */}
          <button
            onClick={() => navigate("/")}
            className="flex md:hidden items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 font-semibold transition mt-3"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>

          {/* Avatar & Name Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 p-6 md:p-8 mb-6 text-center">
            <div className="relative inline-block mb-6">
              {/* Avatar Circle */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg hover:shadow-xl transition hover:scale-105 relative group"
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  avatarLetter
                )}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
                  <Upload size={24} className="text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </button>
              
              {/* Upload Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{name || "Your Profile"}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1">Click avatar to upload image</p>
          </div>

          {/* Profile Information Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>

            {profileError && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm flex items-center gap-2">
                <Check size={18} />
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">College Name</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Your college"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Branch & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="CSE, ECE, etc."
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Email (readonly + verified badge) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                {/* Patch 6: Mobile - icon inside input, Desktop - badge beside input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Mobile: Input with icon inside on right */}
                  <div className="sm:hidden relative flex-1">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 pr-14 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg opacity-60 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-white" />
                      </div>
                    </div>
                  </div>
                  {/* Desktop: Input + Badge side by side */}
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="hidden sm:block flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg opacity-60 cursor-not-allowed"
                  />
                  {/* Desktop: Badge side by side */}
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-green-100 dark:bg-green-900 rounded-lg whitespace-nowrap">
                    <div className="w-5 h-5 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-300">Verified</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {profileLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock size={20} />
              Security
            </h2>

            {/* Left-aligned tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setSecurityTab("change")}
                className={`px-4 py-3 font-semibold text-sm rounded-t-lg transition ${
                  securityTab === "change"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setSecurityTab("forgot")}
                className={`px-4 py-3 font-semibold text-sm rounded-t-lg transition ${
                  securityTab === "forgot"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Forgot via OTP
              </button>
            </div>

            {/* Change Password Tab */}
            {securityTab === "change" && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordError && (
                  <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm flex items-center gap-2">
                    <Check size={18} />
                    Password changed successfully!
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Tab */}
            {securityTab === "forgot" && (
              <div className="space-y-4">
                {forgotError && (
                  <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm flex items-center gap-2">
                    <Check size={18} />
                    Password reset successfully!
                  </div>
                )}

                {forgotStep === "email" ? (
                  <form onSubmit={handleSendForgotOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      {/* Patch 8: Forgot password email field prefilled and readOnly */}
                      <input
                        type="email"
                        value={forgotEmail}
                        readOnly
                        className="w-full px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Enter OTP</label>
                      {/* OTP inputs responsive: smaller on mobile, larger on desktop, centered with flex-wrap */}
                      <div className="flex gap-1.5 sm:gap-2 justify-center sm:justify-start flex-wrap">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpInputRefs[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-bold bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showForgotNewPassword ? "text" : "password"}
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showForgotNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showForgotConfirmPassword ? "text" : "password"}
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showForgotConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          Reset Password
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Danger Zone Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border-2 border-red-200 dark:border-red-900 p-6">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3">Danger Zone</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Deleting your account is permanent and cannot be undone. All your data will be permanently deleted.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={profileLoading}
              className="w-full py-3 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {profileLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete My Account
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default Profile;
