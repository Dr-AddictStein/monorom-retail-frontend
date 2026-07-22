import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLogin } from "../hooks/useLogin";
import { useOtpResendCooldown } from "../hooks/useOtpResendCooldown";

/** @typedef {'login' | 'forgot_phone' | 'forgot_otp' | 'forgot_pin'} LoginMode */

const Login = () => {
    const [loginBanner, setLoginBanner] = useState("");

    useEffect(() => {
        const fetchSiteData = async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/siteData/getSiteData`
            );
            const data = await response.json();
            setLoginBanner(data.loginBanner);
        };
        fetchSiteData();
    }, []);

    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');

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

    const handleLogin = async (e) => {
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
        const err = await login(p, pin);
        if (!err) return;
        if (
            err.includes('No account found') ||
            err.includes('sign up first')
        ) {
            setLoginPhoneError(err);
            return;
        }
        if (err.includes('Incorrect password') || err.includes('password')) {
            setLoginPinError(err);
            return;
        }
        setLoginPhoneError(err);
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
            alert('Enter the 6-digit code from your SMS.');
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
            confirmNewPin
        );
        setBusy(false);
        if (err) alert(err);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row lg:flex-row md:pl-4 lg:pl-4">
                <div className="lg:w-1/2 my-6">
                    <p className="text-blue-900 mb-4 font-bold mt-8 pl-2">
                        <Link to={"/"} className="flex gap-3 items-center">
                            <FaArrowLeft /> Back to home
                        </Link>
                    </p>

                    <div className="text-center mx-auto lg:px-40 px-12">

                        <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto">
                            <h3 className="text-2xl font-semibold mb-6 w-full">Log In</h3>

                            {mode === 'login' && (
                                <form className="w-full space-y-4" onSubmit={handleLogin}>
                                    <div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            className="input input-bordered w-full"
                                            placeholder="Phone"
                                            onChange={(e) => {
                                                setPhone(e.target.value);
                                                setLoginPhoneError('');
                                            }}
                                            autoComplete="tel"
                                        />
                                        {loginPhoneError ? (
                                            <p className="text-red-600 text-sm text-left mt-1">{loginPhoneError}</p>
                                        ) : null}
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={pin}
                                            className="input input-bordered w-full"
                                            placeholder="PIN (4 digits)"
                                            onChange={(e) => {
                                                setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                                                setLoginPinError('');
                                            }}
                                            autoComplete="one-time-code"
                                        />
                                        {loginPinError ? (
                                            <p className="text-red-600 text-sm text-left mt-1">{loginPinError}</p>
                                        ) : null}
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn bg-slate-700 text-white w-full"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline w-full"
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
                                </form>
                            )}

                            {mode === 'forgot_phone' && (
                                <form className="w-full space-y-4" onSubmit={handleForgotSendOtp}>
                                    <p className="text-sm text-gray-600 text-left">
                                        Enter the phone number for your account. If you don&apos;t have an account yet, sign up first.
                                    </p>
                                    <div>
                                        <input
                                            type="tel"
                                            value={forgotPhone}
                                            className="input input-bordered w-full"
                                            placeholder="Phone"
                                            onChange={(e) => {
                                                setForgotPhone(e.target.value);
                                                setForgotPhoneError('');
                                            }}
                                            autoComplete="tel"
                                        />
                                        {forgotPhoneError ? (
                                            <p className="text-red-600 text-sm text-left mt-1">{forgotPhoneError}</p>
                                        ) : null}
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn bg-blue-600 text-white w-full disabled:opacity-60"
                                        disabled={busy}
                                    >
                                        {busy ? 'Sending…' : 'Send verification code'}
                                    </button>
                                    <button type="button" className="btn btn-ghost w-full" onClick={resetForgotFlow}>
                                        Back to login
                                    </button>
                                </form>
                            )}

                            {mode === 'forgot_otp' && (
                                <form className="w-full space-y-4" onSubmit={handleForgotVerifyOtp}>
                                    <p className="text-sm text-gray-600">
                                        Enter the code sent to {forgotPhone}
                                    </p>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otpCode}
                                        className="input input-bordered w-full text-center text-xl tracking-widest"
                                        placeholder="6-digit code"
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        autoComplete="one-time-code"
                                    />
                                    <button
                                        type="submit"
                                        className="btn bg-blue-600 text-white w-full disabled:opacity-60"
                                        disabled={busy}
                                    >
                                        {busy ? 'Please wait…' : 'Verify code'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-ghost w-full text-sm disabled:opacity-60"
                                        disabled={busy || resendSecondsLeft > 0}
                                        onClick={async () => {
                                            setBusy(true);
                                            const err = await sendForgotPinOtp(forgotPhone.trim());
                                            setBusy(false);
                                            if (err) alert(err);
                                            else {
                                                alert('A new code was sent.');
                                                startResendCooldown();
                                            }
                                        }}
                                    >
                                        {resendSecondsLeft > 0
                                            ? `Resend code in ${resendSecondsLeft}`
                                            : 'Resend code'}
                                    </button>
                                    <button type="button" className="btn btn-outline w-full" onClick={() => { resetResendCooldown(); setMode('forgot_phone'); setOtpCode(''); }}>
                                        Back
                                    </button>
                                </form>
                            )}

                            {mode === 'forgot_pin' && (
                                <form className="w-full space-y-4" onSubmit={handleForgotSetPin}>
                                    <p className="text-sm text-gray-600 text-left">
                                        Choose a new 4-digit PIN for your account.
                                    </p>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={newPin}
                                        className="input input-bordered w-full"
                                        placeholder="New PIN (4 digits)"
                                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    />
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={confirmNewPin}
                                        className="input input-bordered w-full"
                                        placeholder="Confirm new PIN"
                                        onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    />
                                    <button
                                        type="submit"
                                        className="btn bg-green-600 text-white w-full disabled:opacity-60"
                                        disabled={busy}
                                    >
                                        {busy ? 'Saving…' : 'Save PIN & log in'}
                                    </button>
                                    <button type="button" className="btn btn-outline w-full" onClick={() => { setMode('forgot_otp'); setNewPin(''); setConfirmNewPin(''); }}>
                                        Back
                                    </button>
                                </form>
                            )}

                            <hr className="my-6 w-full max-w-xs" />

                            <p className="mb-3 w-full">
                                <span className='text-2xl mb-3 block'>If you are not signed in yet, sign up</span>
                                <Link
                                    to={'/signup'}
                                    className="my-3 btn bg-gray-700 text-white w-full flex items-center justify-center text-lg"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        backgroundImage: `url(${loginBanner})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        minHeight: "100vh",
                    }}
                    className="md:w-1/2 lg:w-1/2 hero items-start"
                >
                    <div className="hero-overlay bg-opacity-60"></div>
                    <div className="lg:mx-20 mx-4 pt-20 text-white">
                        <div className="flex gap-6 items-center justify-start mb-4">
                            <div className="bg-white lg:w-[160px] md:w-[140px] h-[1px]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
