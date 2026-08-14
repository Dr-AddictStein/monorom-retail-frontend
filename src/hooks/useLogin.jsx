import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";
import { BACKEND_URL } from "@/config";

const navigateAfterLogin = (navigate, json, url) => {
  if (url) {
    navigate(url);
  } else if (json?.user?.role === "user") {
    navigate("/");
  } else {
    navigate("/dashboard/admin/adminHome");
  }
};

export const useLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const login = async (userName, password, url) => {
    setError(null);

    const response = await fetch(
      `${BACKEND_URL}/api/user/login`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userName, password }),
      }
    );

    const json = await response.json();

    if (!response.ok) {
      return json.error;
    }
    localStorage.setItem("user", JSON.stringify(json));
    dispatch({ type: "LOGIN", payload: json });
    navigateAfterLogin(navigate, json, url);
  };

  const sendForgotPinOtp = async (phone) => {
    setError(null);
    const response = await fetch(
      `${BACKEND_URL}/api/user/send-forgot-pin-otp`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      }
    );
    const json = await response.json();
    if (!response.ok) {
      setError(json.error);
      return json.error;
    }
    return null;
  };

  const verifyForgotPinOtp = async (phone, code) => {
    setError(null);
    const response = await fetch(
      `${BACKEND_URL}/api/user/verify-forgot-pin-otp`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, code }),
      }
    );
    const json = await response.json();
    if (!response.ok) {
      const msg = json.error || "Verification failed";
      setError(msg);
      return { error: msg };
    }
    return { pinResetToken: json.pinResetToken };
  };

  const resetWebPin = async (phone, pinResetToken, pin, confirmPin, url) => {
    setError(null);
    const response = await fetch(
      `${BACKEND_URL}/api/user/reset-web-pin`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, pinResetToken, pin, confirmPin }),
      }
    );
    const json = await response.json();
    if (!response.ok) {
      setError(json.error);
      return json.error;
    }
    localStorage.setItem("user", JSON.stringify(json));
    dispatch({ type: "LOGIN", payload: json });
    navigateAfterLogin(navigate, json, url);
  };

  const gLogin = async (firstName, lastName, googleId, url) => {
    setError(null);

    const response = await fetch(
      `${BACKEND_URL}/api/user/gLogin`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, lastName, googleId }),
      }
    );

    const json = await response.json();

    if (!response.ok) {
      return json.error;
    }
    localStorage.setItem("user", JSON.stringify(json));
    dispatch({ type: "LOGIN", payload: json });
    navigateAfterLogin(navigate, json, url);
  };

  return {
    login,
    sendForgotPinOtp,
    verifyForgotPinOtp,
    resetWebPin,
    gLogin,
    error,
  };
};
