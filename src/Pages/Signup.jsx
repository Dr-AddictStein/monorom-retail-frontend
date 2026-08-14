import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSignup } from "../hooks/useSignup";
import { useOtpResendCooldown } from "../hooks/useOtpResendCooldown";

/** @typedef {'main' | 'otp'} SignupFlow */

const Signup = () => {
    const [signUpBanner, setSignUpBanner] = useState("");

    useEffect(() => {
        const fetchSiteData = async () => {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/siteData/getSiteData`
            );
            const data = await response.json();
            setSignUpBanner(data.signUpBanner);
        };
        fetchSiteData();
    }, []);

    const [userName, setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [homeAddress, setHomeAddress] = useState('');
    const [thana, setThana] = useState('');
    const [district, setDistrict] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [dob, setDateOfBirth] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    /** @type {[SignupFlow, React.Dispatch<React.SetStateAction<SignupFlow>>]} */
    const [signupFlow, setSignupFlow] = useState('main');
    const [otpCode, setOtpCode] = useState('');
    const [otpSending, setOtpSending] = useState(false);

    const { signup, sendSignupOtp, verifySignupOtp } = useSignup();
    const { resendSecondsLeft, startResendCooldown, resetResendCooldown } =
        useOtpResendCooldown();

    const handleDateChange = (e) => {
        const isoDate = e.target.value;
        const [year, month, day] = isoDate.split('-');
        setDateOfBirth(`${day}/${month}/${year}`);
    };

    const validateForm = () => {
        if (!userName.trim() || !firstName.trim() || !lastName.trim()) {
            return 'Please fill username, first name, and last name.';
        }
        if (!phone?.trim()) {
            return 'Phone number is required.';
        }
        if (!city.trim()) return 'City is required.';
        if (!homeAddress.trim()) return 'Home address is required.';
        if (!thana.trim()) return 'Thana is required.';
        if (!district.trim()) return 'District is required.';
        if (!companyName.trim()) return 'Company name is required.';
        if (!dob.trim()) return 'Date of birth is required.';
        if (!/^\d{4}$/.test(pin)) {
            return 'PIN must be exactly 4 digits.';
        }
        if (pin !== confirmPin) {
            return 'PIN and confirm PIN do not match.';
        }
        return null;
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        const err = validateForm();
        if (err) {
            alert(err);
            return;
        }
        setOtpSending(true);
        const sendErr = await sendSignupOtp(phone.trim());
        setOtpSending(false);
        if (sendErr) {
            alert(sendErr);
            return;
        }
        setOtpCode('');
        setSignupFlow('otp');
        startResendCooldown();
    };

    const handleVerifyAndSignup = async (e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(otpCode)) {
            alert('Enter the 6-digit code from your SMS.');
            return;
        }
        setOtpSending(true);
        const res = await verifySignupOtp(phone.trim(), otpCode);
        setOtpSending(false);
        if (res.error) {
            alert(res.error);
            return;
        }
        const response = await signup(
            userName.trim(),
            firstName.trim(),
            lastName.trim(),
            phone.trim(),
            city.trim(),
            "",
            homeAddress.trim(),
            thana.trim(),
            district.trim(),
            companyName.trim(),
            dob,
            pin,
            res.phoneVerificationToken
        );
        if (response) alert(response);
    };

    const otpPanel = (opts) => (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
            <p className="text-center text-gray-700">{opts.subtitle}</p>
            <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="input input-bordered w-full text-center text-2xl tracking-widest"
                placeholder="6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            />
            <button
                type="button"
                className="btn bg-blue-600 text-white w-full disabled:opacity-60"
                disabled={otpSending}
                onClick={opts.onVerify}
            >
                {otpSending ? 'Please wait…' : 'Verify & complete signup'}
            </button>
            <button
                type="button"
                className="btn btn-ghost w-full disabled:opacity-60"
                disabled={otpSending || opts.resendSecondsLeft > 0}
                onClick={opts.onResend}
            >
                {opts.resendSecondsLeft > 0
                    ? `Resend code in ${opts.resendSecondsLeft}`
                    : 'Resend code'}
            </button>
            <button type="button" className="btn btn-outline w-full" onClick={opts.onBack}>
                Back
            </button>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row">
            <div className="lg:w-1/2 my-6">
                <div className="flex flex-col justify-center">
                    <h3 className='text-3xl text-center mb-8'>Sign Up</h3>
                    <p className="text-blue-900 mb-4 ml-10 font-bold text-center">
                        <Link to="/" className="flex gap-3 items-center justify-center">
                            <FaArrowLeft /> Back to home
                        </Link>
                    </p>
                    <div className="text-center mx-auto lg:px-40 px-12 h-screen">
                        <div className="flex flex-col justify-center items-center w-full">

                            {signupFlow === 'otp' && otpPanel({
                                subtitle: `Enter the verification code sent to ${phone}`,
                                onVerify: handleVerifyAndSignup,
                                resendSecondsLeft,
                                onResend: async () => {
                                    setOtpSending(true);
                                    const err = await sendSignupOtp(phone.trim());
                                    setOtpSending(false);
                                    if (err) alert(err);
                                    else {
                                        alert('A new code was sent.');
                                        startResendCooldown();
                                    }
                                },
                                onBack: () => {
                                    resetResendCooldown();
                                    setSignupFlow('main');
                                    setOtpCode('');
                                },
                            })}

                            {signupFlow === 'main' && (
                                <>
                                    {[
                                        { label: 'Username', value: userName, set: setUserName, type: 'text' },
                                        { label: 'First name', value: firstName, set: setFirstName, type: 'text' },
                                        { label: 'Last name', value: lastName, set: setLastName, type: 'text' },
                                        { label: 'Phone', value: phone, set: setPhone, type: 'tel' },
                                        { label: 'City', value: city, set: setCity, type: 'text' },
                                        { label: 'Home address', value: homeAddress, set: setHomeAddress, type: 'text' },
                                        { label: 'Thana', value: thana, set: setThana, type: 'text' },
                                        { label: 'District', value: district, set: setDistrict, type: 'text' },
                                        { label: 'Company name', value: companyName, set: setCompanyName, type: 'text' },
                                    ].map((field) => (
                                        <div className="flex justify-center items-center mb-4 w-full max-w-md" key={field.label}>
                                            <input
                                                type={field.type}
                                                className="input input-bordered w-full"
                                                placeholder={field.label}
                                                value={field.value}
                                                onChange={(e) => field.set(e.target.value)}
                                            />
                                        </div>
                                    ))}

                                    <div className="flex flex-col justify-center items-start mb-4 w-full max-w-md mx-auto">
                                        <label htmlFor="dob" className="mb-2 font-medium text-gray-700">
                                            Date of Birth
                                        </label>
                                        <input
                                            id="dob"
                                            type="date"
                                            className="input input-bordered w-full"
                                            onChange={handleDateChange}
                                        />
                                    </div>

                                    <div className="flex justify-center items-center mb-4 w-full max-w-md mx-auto">
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            autoComplete="new-password"
                                            maxLength={4}
                                            className="input input-bordered w-full"
                                            placeholder="PIN (4 digits)"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        />
                                    </div>
                                    <div className="flex justify-center items-center mb-4 w-full max-w-md mx-auto">
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            autoComplete="new-password"
                                            maxLength={4}
                                            className="input input-bordered w-full"
                                            placeholder="Confirm PIN (4 digits)"
                                            value={confirmPin}
                                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn bg-blue-600 text-white w-full max-w-md disabled:opacity-60"
                                        disabled={otpSending}
                                        onClick={handleRequestOtp}
                                    >
                                        {otpSending ? 'Sending code…' : 'Send verification code'}
                                    </button>

                                    <hr className="my-6 w-full max-w-xs" />

                                    <p className="mb-3 w-full max-w-md">
                                        <span className='text-2xl mb-3 block'>If you are not already signed up, Log In please</span>
                                        <Link
                                            to={'/login'}
                                            className="my-3 btn bg-gray-700 text-white w-full flex items-center justify-center text-lg"
                                        >
                                            Login
                                        </Link>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                style={{
                    backgroundImage: `url(${signUpBanner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "100vh",
                }}
                className="hero lg:w-1/2 bg-opacity-60 items-start"
            >
                <div className="hero-overlay bg-opacity-60"></div>
            </div>
        </div>
    );
};

export default Signup;
