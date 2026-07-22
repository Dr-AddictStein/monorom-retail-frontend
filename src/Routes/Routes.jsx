import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import ProductDetails from "../Pages/ProductDetails";
import DashbaordPage from "../Components/DashbaordPage";
import AddProduct from "../Pages/AdminDashboard/AddProduct";
import UserHome from "../Pages/UserDashboard/UserHome";
import Category from "../Pages/Category";
import AdminCategory from "../Pages/AdminDashboard/AdminCategory";
import AdminProduct from "../Pages/AdminDashboard/AdminProduct";
import AdminUsers from "../Pages/AdminDashboard/AdminUsers";
import ViewProduct from "../Pages/AdminDashboard/ViewProduct";
import EditProduct from "../Pages/AdminDashboard/EditProduct";
import Signup from "../Pages/Signup";
import Login from "../Pages/Login";
import Cart from "../Pages/UserDashboard/Cart";
import Profile from "../Pages/UserDashboard/Profile";
import ReceivedOrders from "../Pages/AdminDashboard/ReceivedOrders";
import CompletedOrders from "../Pages/AdminDashboard/CompletedOrders";
import AdminOrderDetails from "../Pages/AdminDashboard/AdminOrderDetails";
import OrderHistory from "../Pages/UserDashboard/OrderHistory";
import UserOrderDetails from "../Pages/UserDashboard/UserOrderDetails";
import AdminHome from "../Pages/AdminDashboard/AdminHome";
import AllProducts from "../Pages/AllProducts";
import AdminRestock from "../Pages/AdminDashboard/AdminRestock";
import AdminNotificationSender from "../Pages/AdminDashboard/AdminNotificationSender";
import LowestOrderProducts from "../Pages/AdminDashboard/LowestOrderProducts";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Main />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/category/:id",
                element: <Category />,
            },
            {
                path: "/productDetails/:id",
                element: <ProductDetails />,
            },
            {
                path: "/signup",
                element: <Signup />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/allProducts",
                element: <AllProducts />,
            },
        ],
    },

    //admin dashboard
    {
        path: '/dashboard/admin',
        element: <DashbaordPage />,
        children: [
            {
                path: '/dashboard/admin/adminHome',
                element: <AdminHome />
            },
            {
                path: '/dashboard/admin/category',
                element: <AdminCategory />
            },
            {
                path: '/dashboard/admin/product',
                element: <AdminProduct />
            },
            {
                path: '/dashboard/admin/lowestOrderProducts',
                element: <LowestOrderProducts />
            },
            {
                path: '/dashboard/admin/restockproduct',
                element: <AdminRestock />
            },
            {
                path: '/dashboard/admin/addProduct',
                element: <AddProduct />
            },
            {
                path: '/dashboard/admin/viewProduct/:id',
                element: <ViewProduct />
            },
            {
                path: '/dashboard/admin/editProduct/:id',
                element: <EditProduct />
            },
            {
                path: '/dashboard/admin/users',
                element: <AdminUsers />
            },
            {
                path: '/dashboard/admin/receivedOrders',
                element: <ReceivedOrders />
            },
            {
                path: '/dashboard/admin/completedOrders',
                element: <CompletedOrders />
            },
            {
                path: '/dashboard/admin/orderDetails/:id',
                element: <AdminOrderDetails />
            },
            {
                path: '/dashboard/admin/notificationSender',
                element: <AdminNotificationSender />
            },
        ]
    },

    //user dashboard
    {
        path: '/dashboard/user',
        element: <DashbaordPage />,
        children: [
            {
                path: '/dashboard/user/orderHistory',
                element: <OrderHistory />
            },
            {
                path: '/dashboard/user/orderDetails/:id',
                element: <UserOrderDetails />
            },
            {
                path: '/dashboard/user/cart',
                element: <Cart />
            },
            {
                path: '/dashboard/user/profile',
                element: <Profile />
            },
            
        ]
    },
]);
