import { useLocation } from "react-router-dom";
import Modal from "../Pages/UserDashboard/Modal";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useOtpResendCooldown } from "../hooks/useOtpResendCooldown";
import logo from "../../public/Monorom.png";

/** @typedef {'login' | 'forgot_phone' | 'forgot_otp' | 'forgot_pin'} LoginMode */

const LoginModal = ({ isOpen, onClose, onOpenSignup }) => {
    const url = useLocation().pathname;

    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");

    /** @type {[LoginMode, React.Dispatch<React.SetStateAction<LoginMode>>]} */
    const [mode, setMode] = useState('login');
    const [forgotPhone, setForgotPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [pinResetToken, setPinResetToken] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [busy, setBusy] = useState(false);
    const [loginPhoneError, setLoginPhoneError] = useState('');
    const [loginPinError, setLoginPinError] = useState('');
    const [forgotPhoneError, setForgotPhoneError] = useState('');

    const { login, sendForgotPinOtp, verifyForgotPinOtp, resetWebPin } = useLogin();
    const { resendSecondsLeft, startResendCooldown, resetResendCooldown } =
        useOtpResendCooldown();

    const resetForgotFlow = () => {
        setMode('login');
        setForgotPhone('');
        setOtpCode('');
        setPinResetToken('');
        setNewPin('');
        setConfirmNewPin('');
        setForgotPhoneError('');
        setLoginPhoneError('');
        setLoginPinError('');
        resetResendCooldown();
    };

    const handleClose = () => {
        resetForgotFlow();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginPhoneError('');
        setLoginPinError('');
        const p = phone.trim();
        if (!p) {
            setLoginPhoneError('Enter your phone number.');
            return;
        }
        if (!/^\d{4}$/.test(pin)) {
            setLoginPinError('PIN must be exactly 4 digits.');
            return;
        }
        const response = await login(p, pin, url);
        if (response) {
            if (
                response.includes('No account found') ||
                response.includes('sign up first')
            ) {
                setLoginPhoneError(response);
            } else if (response.includes('Incorrect password') || response.includes('password')) {
                setLoginPinError(response);
            } else {
                setLoginPhoneError(response);
            }
            return;
        }
        resetForgotFlow();
        onClose();
    };

    const handleForgotSendOtp = async (e) => {
        e.preventDefault();
        setForgotPhoneError('');
        const p = forgotPhone.trim();
        if (!p) {
            setForgotPhoneError('Enter your phone number.');
            return;
        }
        setBusy(true);
        const err = await sendForgotPinOtp(p);
        setBusy(false);
        if (err) {
            setForgotPhoneError(err);
            return;
        }
        setOtpCode('');
        setMode('forgot_otp');
        startResendCooldown();
    };

    const handleForgotVerifyOtp = async (e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(otpCode)) {
            alert('Enter the 6-digit code.');
            return;
        }
        setBusy(true);
        const res = await verifyForgotPinOtp(forgotPhone.trim(), otpCode);
        setBusy(false);
        if (res.error) {
            alert(res.error);
            return;
        }
        setPinResetToken(res.pinResetToken);
        setNewPin('');
        setConfirmNewPin('');
        setMode('forgot_pin');
    };

    const handleForgotSetPin = async (e) => {
        e.preventDefault();
        if (!/^\d{4}$/.test(newPin) || newPin !== confirmNewPin) {
            alert('New PIN must be 4 digits and match confirmation.');
            return;
        }
        setBusy(true);
        const err = await resetWebPin(
            forgotPhone.trim(),
            pinResetToken,
            newPin,
            confirmNewPin,
            url
        );
        setBusy(false);
        if (err) alert(err);
        else {
            resetForgotFlow();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="w-full flex justify-center items-center mb-10">
                <img src={logo} alt="" className="h-10" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

            {mode === 'login' && (
                <>
                    <div className="mb-3">
                        <input
                            type="tel"
                            placeholder="Phone"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                setLoginPhoneError('');
                            }}
                            autoComplete="tel"
                        />
                        {loginPhoneError ? (
                            <p className="text-red-600 text-xs mt-1 text-left">{loginPhoneError}</p>
                        ) : null}
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="PIN (4 digits)"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                                setLoginPinError('');
                            }}
                        />
                        {loginPinError ? (
                            <p className="text-red-600 text-xs mt-1 text-left">{loginPinError}</p>
                        ) : null}
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600" onClick={handleSubmit}>
                        Login
                    </button>
                    <button
                        type="button"
                        className="w-full mt-2 py-2 text-sm text-blue-600 hover:underline"
                        onClick={() => {
                            setLoginPhoneError('');
                            setLoginPinError('');
                            setForgotPhone(phone);
                            setForgotPhoneError('');
                            setMode('forgot_phone');
                            setOtpCode('');
                            setPinResetToken('');
                            setNewPin('');
                            setConfirmNewPin('');
                        }}
                    >
                        Forgot PIN
                    </button>
                </>
            )}

            {mode === 'forgot_phone' && (
                <form className="space-y-3" onSubmit={handleForgotSendOtp}>
                    <p className="text-xs text-gray-600">
                        Enter your account phone. No account? Sign up first.
                    </p>
                    <div>
                        <input
                            type="tel"
                            placeholder="Phone"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={forgotPhone}
                            onChange={(e) => {
                                setForgotPhone(e.target.value);
                                setForgotPhoneError('');
                            }}
                        />
                        {forgotPhoneError ? (
                            <p className="text-red-600 text-xs mt-1 text-left">{forgotPhoneError}</p>
                        ) : null}
                    </div>
                    <button type="submit" disabled={busy} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60">
                        {busy ? 'Sending…' : 'Send code'}
                    </button>
                    <button type="button" className="w-full py-1 text-sm" onClick={resetForgotFlow}>Back to login</button>
                </form>
            )}

            {mode === 'forgot_otp' && (
                <form className="space-y-3" onSubmit={handleForgotVerifyOtp}>
                    <p className="text-xs text-gray-600">Code sent to {forgotPhone}</p>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        className="w-full p-2 border border-gray-300 rounded text-center tracking-widest"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                    <button type="submit" disabled={busy} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60">
                        {busy ? '…' : 'Verify'}
                    </button>
                    <button
                        type="button"
                        disabled={busy || resendSecondsLeft > 0}
                        className="w-full py-1 text-sm text-blue-600 disabled:opacity-60"
                        onClick={async () => {
                            setBusy(true);
                            const err = await sendForgotPinOtp(forgotPhone.trim());
                            setBusy(false);
                            if (err) alert(err); else { alert('Code resent.'); startResendCooldown(); }
                        }}
                    >
                        {resendSecondsLeft > 0 ? `Resend code in ${resendSecondsLeft}` : 'Resend code'}
                    </button>
                    <button type="button" className="w-full py-1 text-sm" onClick={() => { resetResendCooldown(); setMode('forgot_phone'); setOtpCode(''); }}>Back</button>
                </form>
            )}

            {mode === 'forgot_pin' && (
                <form className="space-y-3" onSubmit={handleForgotSetPin}>
                    <p className="text-xs text-gray-600">New 4-digit PIN</p>
                    <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="New PIN"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                    <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="Confirm PIN"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={confirmNewPin}
                        onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                    <button type="submit" disabled={busy} className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-60">
                        {busy ? 'Saving…' : 'Save & log in'}
                    </button>
                    <button type="button" className="w-full py-1 text-sm" onClick={() => { setMode('forgot_otp'); setNewPin(''); setConfirmNewPin(''); }}>Back</button>
                </form>
            )}

            {mode === 'login' && (
                <p className="text-sm mt-3">
                    Don&apos;t have an account?
                    <button className="text-blue-500 ml-1" onClick={onOpenSignup}>
                        Sign Up
                    </button>
                </p>
            )}
        </Modal>
    );
};

export default LoginModal;
