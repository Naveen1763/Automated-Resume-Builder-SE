import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { loginUser, registerUser } from "@/Services/login";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [loading, setLoading] = useState(false);
  // state to display the errors
  const [errors, setErrors] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSignInSubmit = async (event) => {
    event.preventDefault();
    setSignInError("");

    const { email, password } = event.target.elements;
    const newErrors = { email: "", password: "" };

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailPattern.test(email.value)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password.value.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.value.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(newErrors);

    // Stop if any validation errors exist
    if (Object.values(newErrors).some((msg) => msg)) return;

    // Continue with your original logic
    setLoading(true);
    const data = { email: email.value, password: password.value };

    try {
      console.log("Login Started in Frontend");
      const user = await loginUser(data);
      console.log("Login Completed");

      if (user?.statusCode === 200) {
        navigate("/");
      }
    } catch (error) {
      setSignInError(error.message);
      console.log("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (event) => {
    event.preventDefault();
    setSignUpError("");
    const { fullname, email, password } = event.target.elements;
    const newErrors = { fullname: "", email: "", password: "" };

    // Full name validation
    if (!fullname.value.trim()) {
      newErrors.fullname = "Full name is required.";
    } else if (fullname.value.trim().length < 3) {
      newErrors.fullname = "Full name must be at least 3 characters.";
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailPattern.test(email.value)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password.value.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.value.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password.value)
    ) {
      newErrors.password =
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    setErrors(newErrors);

    // Stop if any errors exist
    if (Object.values(newErrors).some((msg) => msg)) return;

    // Continue with your original logic
    setLoading(true);
    console.log("User Registration Started");
    const data = {
      fullName: fullname.value,
      email: email.value,
      password: password.value,
    };
    try {
      const response = await registerUser(data);
      if (response?.statusCode === 201) {
        handleSignInSubmit(event);
      }
    } catch (error) {
      setSignUpError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-r from-green-400 to-purple-500">
      <motion.div
        className="relative w-full max-w-lg p-8 bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-around mb-6 border-b border-gray-200">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-300 rounded-t-lg ${
              !isSignUp ? "bg-green-400 text-white" : "text-gray-600"
            }`}
          >
            <FaSignInAlt />
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-300 rounded-t-lg ${
              isSignUp ? "bg-green-400 text-white" : "text-gray-600"
            }`}
          >
            <FaUserPlus />
            Sign Up
          </button>
        </div>

        <div className="relative overflow-hidden h-[540px]">
          {" "}
          {/* Added height to ensure content is visible */}
          <motion.div
            className={`absolute inset-0 transition-transform duration-500 ${
              isSignUp ? "translate-x-0" : "translate-x-full"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isSignUp ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
            <form
              onSubmit={handleSignUpSubmit}
              className="space-y-4"
              noValidate
            >
              {/* Full Name */}
              <div className="flex flex-col space-y-1">
                <label className="font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-md border-gray-300 p-2 gap-3">
                  <FaUser className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    required
                    minLength={3}
                    pattern="^[A-Za-z\s]{3,}$"
                    title="Full name must contain only letters and spaces, at least 3 characters long."
                    className="outline-none w-full"
                  />
                </div>
                {errors.fullname && (
                  <p className="text-red-500 text-sm">{errors.fullname}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col space-y-1">
                <label className="font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-md border-gray-300 p-2 gap-3">
                  <FaUser className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    title="Please enter a valid email address (e.g. user@example.com)"
                    className="outline-none w-full"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1">
                <label className="font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-md border-gray-300 p-2 gap-3">
                  <FaLock className="text-gray-400 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    required
                    minLength={6}
                    pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$"
                    title="Password must be at least 6 characters long and contain both letters and numbers."
                    className="outline-none w-full"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 ml-2"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="flex-col gap-y-1 text-sm">
                <p className="text-red-500">Please Note:</p>
                <p>Password length should be of at least 8 characters.</p>
                <p>
                  Password must include one at least one uppercase letter, one
                  lowercase letter, one number, and one special character.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-green-400 text-white py-2 rounded-md flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-center" />
                ) : (
                  "Register User"
                )}
              </button>

              {signUpError && (
                <div className="text-red-500 text-center mt-2">
                  {signUpError}
                </div>
              )}
            </form>
          </motion.div>
          <motion.div
            className={`absolute inset-0 transition-transform duration-500 ${
              isSignUp ? "-translate-x-full" : "translate-x-0"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: !isSignUp ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
            <form
              onSubmit={handleSignInSubmit}
              className="space-y-4"
              noValidate
            >
              {/* Email */}
              <div className="flex flex-col space-y-1">
                <label className="font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-md border-gray-300 p-2 gap-3">
                  <FaUser className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    title="Please enter a valid email address (e.g., user@example.com)"
                    className="outline-none w-full"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1">
                <label className="font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border rounded-md border-gray-300 p-2 gap-3">
                  <FaLock className="text-gray-400 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    required
                    minLength={6}
                    title="Password must be at least 6 characters long."
                    className="outline-none w-full"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 ml-2"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-green-400 text-white py-2 rounded-md flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-center" />
                ) : (
                  "Login"
                )}
              </button>

              {/* Backend/Server Error */}
              {signInError && (
                <div className="text-red-500 text-center mt-2">
                  {signInError}
                </div>
              )}
            </form>
          </motion.div>
        </div>

        <p className="mt-4 text-center text-gray-600">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-blue-500 hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-blue-500 hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}

export default AuthPage;
