import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="bg-[#212121] text-white mt-20">
            <div className="flex justify-between py-10 w-3/4 gap-2 mx-auto">
                <div className="flex flex-col">
                    <h6 className="footer-title md:font-bold md:text-[16px] text-[14px]">Company</h6>
                    <Link className="link link-hover">About us</Link>
                    <Link className="link link-hover">Contact</Link>
                    <Link className="link link-hover">Jobs</Link>
                    <Link className="link link-hover">Press kit</Link>
                </div>
                <div className="flex flex-col">
                    <h6 className="footer-title md:font-bold md:text-[16px] text-[14px]">Legal</h6>
                    <Link className="link link-hover">Terms of use</Link>
                    <Link className="link link-hover">Privacy policy</Link>
                    <Link className="link link-hover">Cookie policy</Link>
                </div>
                <div className="flex flex-col">
                    <h6 className="footer-title md:font-bold md:text-[16px] text-[14px]">Services</h6>
                    <Link className="link link-hover">Branding</Link>
                    <Link className="link link-hover">Design</Link>
                    <Link className="link link-hover">Marketing</Link>
                    <Link className="link link-hover">Advertisement</Link>
                </div>
            </div>
        </div>
    );
};

export default Footer;