import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const AdminGate = ({ children }) => {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <div className="h-[70vh] flex flex-col justify-center gap-10">
        <div className="text-5xl text-center">You are Not Logged in.!.</div>
        <div className="text-3xl text-center">Please Sign Up</div>
        <div className="flex justify-center gap-3">
          <Link
            to={"/login"}
            className="px-3 py-2 bg-emerald-700 rounded-md text-xl text-white"
          >
            <button>Login</button>
          </Link>
          <Link
            to={"/signup"}
            className="px-3 py-2 bg-slate-700 rounded-md text-xl text-white"
          >
            <button>SignUp</button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.user?.role !== "admin") {
    return (
      <div className="h-[70vh] flex flex-col justify-center">
        <div className="text-5xl text-center">Access Denied.!.</div>
        <div className="text-2xl text-center pt-5">
          This page can only be accessed by the Admin
        </div>
      </div>
    );
  }

  return children;
};

export default AdminGate;
