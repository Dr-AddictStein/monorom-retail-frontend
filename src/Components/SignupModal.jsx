import { useState } from "react";
import Modal from "../Pages/UserDashboard/Modal";
import { useSignup } from "../hooks/useSignup";
import { useOtpResendCooldown } from "../hooks/useOtpResendCooldown";
import { useLocation } from "react-router-dom";

const SignupModal = ({ isOpen, onClose, onOpenLogin }) => {
    const url = useLocation().pathname;
    const [userName, setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [dob, setDateOfBirth] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const [flow, setFlow] = useState('form');
    const [otpCode, setOtpCode] = useState('');
    const [otpBusy, setOtpBusy] = useState(false);

    const handleDateChange = (e) => {
        const isoDate = e.target.value;
        const [year, month, day] = isoDate.split('-');
        setDateOfBirth(`${day}/${month}/${year}`);
    };

    const { signup, sendSignupOtp, verifySignupOtp } = useSignup();
    const { resendSecondsLeft, startResendCooldown, resetResendCooldown } =
        useOtpResendCooldown();

    const resetAll = () => {
        setFlow('form');
        setOtpCode('');
        resetResendCooldown();
    };

    const validateForm = () => {
        if (!userName.trim() || !firstName.trim() || !lastName.trim()) {
            return 'Please fill username, first name, and last name.';
        }
        if (!phone?.trim()) return 'Phone number is required.';
        if (!city.trim()) return 'City is required.';
        if (!shippingAddress.trim()) return 'Shipping address is required.';
        if (!companyName.trim()) return 'Company name is required.';
        if (!dob.trim()) return 'Date of birth is required.';
        if (!/^\d{4}$/.test(pin)) return 'PIN must be exactly 4 digits.';
        if (pin !== confirmPin) return 'PIN and confirm PIN do not match.';
        return null;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const err = validateForm();
        if (err) {
            alert(err);
            return;
        }
        setOtpBusy(true);
        const sendErr = await sendSignupOtp(phone.trim());
        setOtpBusy(false);
        if (sendErr) {
            alert(sendErr);
            return;
        }
        setOtpCode('');
        setFlow('otp');
        startResendCooldown();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(otpCode)) {
            alert('Enter the 6-digit code.');
            return;
        }
        setOtpBusy(true);
        const res = await verifySignupOtp(phone.trim(), otpCode);
        setOtpBusy(false);
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
            shippingAddress.trim(),
            companyName.trim(),
            dob,
            pin,
            res.phoneVerificationToken,
            url
        );
        if (response) alert(response);
        else onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={() => { resetAll(); onClose(); }}>
            <h2 className="text-xl font-bold mb-4">Sign Up</h2>

            {flow === 'otp' && (
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">Code sent to {phone}</p>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="w-full p-2 border border-gray-300 rounded text-center text-xl tracking-widest"
                        placeholder="6-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                    <button type="button" disabled={otpBusy} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-60" onClick={handleVerify}>
                        {otpBusy ? 'Please wait…' : 'Verify & sign up'}
                    </button>
                    <button type="button" disabled={otpBusy || resendSecondsLeft > 0} className="w-full py-2 text-sm text-blue-600 disabled:opacity-60" onClick={async () => {
                        setOtpBusy(true);
                        const err = await sendSignupOtp(phone.trim());
                        setOtpBusy(false);
                        if (err) alert(err); else { alert('Code resent.'); startResendCooldown(); }
                    }}>{resendSecondsLeft > 0 ? `Resend code in ${resendSecondsLeft}` : 'Resend code'}</button>
                    <button type="button" className="w-full py-2 text-sm" onClick={() => { setFlow('form'); setOtpCode(''); resetResendCooldown(); }}>Back</button>
                </div>
            )}

            {flow === 'form' && (
                <>
                    <input type="text" placeholder="Username" className="w-full p-2 border border-gray-300 rounded mb-3" value={userName} onChange={(e) => setUserName(e.target.value)} />
                    <input type="text" placeholder="First Name" className="w-full p-2 border border-gray-300 rounded mb-3" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <input type="text" placeholder="Last Name" className="w-full p-2 border border-gray-300 rounded mb-3" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    <input type="tel" placeholder="Phone (required)" className="w-full p-2 border border-gray-300 rounded mb-3" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <input type="text" placeholder="City" className="w-full p-2 border border-gray-300 rounded mb-3" value={city} onChange={(e) => setCity(e.target.value)} />
                    <input type="text" placeholder="Shipping Address" className="w-full p-2 border border-gray-300 rounded mb-3" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
                    <input type="text" placeholder="Company Name" className="w-full p-2 border border-gray-300 rounded mb-3" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    <input type="date" className="w-full p-2 border border-gray-300 rounded mb-3" onChange={handleDateChange} />
                    <input type="password" inputMode="numeric" maxLength={4} placeholder="PIN (4 digits)" className="w-full p-2 border border-gray-300 rounded mb-3" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                    <input type="password" inputMode="numeric" maxLength={4} placeholder="Confirm PIN" className="w-full p-2 border border-gray-300 rounded mb-3" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                    <button type="button" disabled={otpBusy} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-60" onClick={handleSendOtp}>
                        {otpBusy ? 'Sending…' : 'Send verification code'}
                    </button>
                    <p className="text-sm mt-3">
                        Already have an account?
                        <button className="text-blue-500 ml-1" onClick={onOpenLogin}>
                            Login
                        </button>
                    </p>
                </>
            )}
        </Modal>
    );
};

export default SignupModal;
