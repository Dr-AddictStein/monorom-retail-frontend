import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "@/config";

const Footer = () => {
    const [logo, setLogo] = useState("");

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                const response = await fetch(
                    `${BACKEND_URL}/api/siteData/getSiteData`
                );
                const data = await response.json();
                setLogo(data.logo);
            } catch (error) {
                console.error("Error fetching site data:", error);
            }
        };
        fetchSiteData();
    }, []);

    return (
        <div className="bg-[#212121] text-white mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center py-10 w-3/4 gap-8 mx-auto">
                <div className="flex flex-col">
                    <h6 className="footer-title md:font-bold md:text-[16px] text-[14px]">Company</h6>
                    <Link to="/about-us" className="link link-hover">About us</Link>
                    <Link className="link link-hover">Contact</Link>
                    <Link to="/blogs" className="link link-hover">Blogs</Link>
                </div>
                <div className="flex flex-col">
                    <h6 className="footer-title md:font-bold md:text-[16px] text-[14px]">Legal</h6>
                    <Link to="/terms-of-use" className="link link-hover">Terms of use</Link>
                    <Link to="/privacy-policy" className="link link-hover">Privacy policy</Link>
                    <Link to="/cookie-policy" className="link link-hover">Cookie policy</Link>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <Link to="/" className="flex justify-center w-full">
                        {logo ? (
                            <img src={logo} alt="Monorom" className="w-[110px] h-auto object-contain" />
                        ) : null}
                    </Link>
                    <p className="mt-3 text-sm text-gray-300 text-center leading-snug">
                        © {new Date().getFullYear()} Monorom.
                        <br />
                        All rights reserved
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Footer;
