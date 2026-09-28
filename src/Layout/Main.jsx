import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ScrollToTop from "../Components/ScrollToTop";
import SeoHead from "../Components/SeoHead";

function Main() {
    const location = useLocation();

    const shouldRenderHeaderFooter = ![
        "/login",
        "/dashboard",
        "/signup",
    ].includes(location.pathname);

    const isPrivate =
        location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname.startsWith("/user");

    return (
        <div className="">
            <ScrollToTop/>
            {isPrivate ? (
                <SeoHead
                    title="Monorom"
                    description="Monorom account"
                    path={location.pathname}
                    robots="noindex, nofollow"
                />
            ) : null}
            {shouldRenderHeaderFooter && <div className=""><Navbar /></div>}
            <div className="min-h-[79vh]">
                <Outlet />
            </div>
            {shouldRenderHeaderFooter && <Footer />}
        </div>
    );
}

export default Main;