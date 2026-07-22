import { useContext } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";

export const useLogout=()=>{
    const {dispatch}=useAuthContext();
    const navigate=useNavigate();
    // const {dispatch:dispatchW}=useWorkoutsContext();
    const logout=()=>{


        localStorage.removeItem('user');


        dispatch({type:'LOGOUT'});
        navigate(`/`);
    }


    return {logout};
}