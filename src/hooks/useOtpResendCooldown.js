import { useState, useEffect, useCallback } from "react";

export const OTP_RESEND_COOLDOWN_SEC = 60;

/** After sending an OTP, call `startResendCooldown`; use `resendSecondsLeft` for UI and disabling resend. */
export function useOtpResendCooldown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const startResendCooldown = useCallback(() => {
    setSecondsLeft(OTP_RESEND_COOLDOWN_SEC);
  }, []);

  const resetResendCooldown = useCallback(() => {
    setSecondsLeft(0);
  }, []);

  return {
    resendSecondsLeft: secondsLeft,
    startResendCooldown,
    resetResendCooldown,
  };
}
