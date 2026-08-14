import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";

export const useSignup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const sendSignupOtp = async (phone) => {
    setError(null);
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/send-signup-otp`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      }
    );
    const json = await response.json();
    if (!response.ok) {
      const msg = json.error || "Failed to send verification code";
      setError(msg);
      return msg;
    }
    return null;
  };

  const verifySignupOtp = async (phone, code) => {
    setError(null);
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/verify-signup-otp`,
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
    return { phoneVerificationToken: json.phoneVerificationToken };
  };

  const signup = async (
    userName,
    firstName,
    lastName,
    phone,
    city,
    shippingAddress,
    homeAddress,
    thana,
    district,
    companyName,
    dob,
    pin,
    phoneVerificationToken,
    url
  ) => {
    setError(null);

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/signup`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userName,
          firstName,
          lastName,
          phone,
          city,
          shippingAddress,
          homeAddress,
          thana,
          district,
          companyName,
          pin,
          dob,
          phoneVerificationToken,
        }),
      }
    );

    const json = await response.json();

    if (!response.ok) {
      return json.error;
    }
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(json));

      dispatch({ type: "LOGIN", payload: json });
      if (url) {
        navigate(url);
      } else {
        if (json?.user?.role === "user") {
          navigate("/");
        } else {
          navigate("/dashboard/admin/adminHome");
        }
      }
    }
  };

  const gSignup = async (
    firstName,
    lastName,
    googleId,
    phone,
    phoneVerificationToken,
    url
  ) => {
    setError(null);

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/gSignup`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          googleId,
          phone,
          phoneVerificationToken,
        }),
      }
    );

    const json = await response.json();

    if (!response.ok) {
      return json.error;
    }
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(json));

      dispatch({ type: "LOGIN", payload: json });
      if (url) {
        navigate(url);
      } else {
        if (json?.user?.role === "user") {
          navigate("/");
        } else {
          navigate("/dashboard/admin/adminHome");
        }
      }
    }
  };

  return { signup, gSignup, sendSignupOtp, verifySignupOtp, error };
};
