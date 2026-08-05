import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../hooks/useAuthContext";

const AdminRestock = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [bulkEditMode, setBulkEditMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [newPrice, setNewPrice] = useState("");
    const [newStock, setNewStock] = useState("");

    const fetchCategory = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/category`
            );
            if (!response.ok) throw new Error("Failed to fetch categories");
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };


    const fetchProducts = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/product/`
            );
            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();
            let dex = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].stock < 10) {
                    dex.push(data[i]);
                }
            }
            setProducts(dex);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Error fetching products. Please try again later.");
            setLoading(false);
        }
    };

    const handleBulkUpdate = async () => {
        if (!newPrice || !newStock) {
            toast.error("Please provide price and stock values.");
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/product/bulkUpdate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productIds: selectedProducts,
                        price: parseFloat(newPrice),
                        stock: parseInt(newStock, 10),
                    }),
                }
            );
            if (!response.ok) throw new Error("Failed to update products");

            fetchProducts();
            toast.success("Products updated successfully!");
            toggleBulkEditMode();
        } catch (error) {
            console.error("Error updating products:", error);
            toast.error("Error updating products. Please try again.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/product/${id}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!response.ok) throw new Error("Failed to delete product");
                setProducts(products.filter((product) => product._id !== id));
                toast.success("Product deleted successfully!");
            } catch (error) {
                console.error("Error deleting product:", error);
                toast.error("Error deleting product. Please try again.");
            }
        }
    };

    const toggleBulkEditMode = () => {
        setBulkEditMode(!bulkEditMode);
        setSelectedProducts([]);
    };

    const handleCheckboxChange = (id) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((productId) => productId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const paginate = (products) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return products.slice(startIndex, startIndex + itemsPerPage);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getCategoryName = (id) => {
        const category = categories.find((cat) => cat._id === id);
        return category ? category.name : "N/A";
    };


    useEffect(() => {
        fetchCategory();
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedProducts = paginate(filteredProducts);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const getPaginationRange = () => {
        const totalButtons = 7; // 5 next pages + 2 previous pages
        const halfRange = Math.floor(totalButtons / 2);
        const startPage = Math.max(1, currentPage - halfRange);
        const endPage = Math.min(totalPages, startPage + totalButtons - 1);

        let range = [];
        for (let i = startPage; i <= endPage; i++) {
            range.push(i);
        }
        return range;
    };

    return (
        <div className="p-4">
            <ToastContainer />
            <h2 className="text-2xl font-semibold mb-8 text-center">Product List</h2>

            <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="Search by product name"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="input input-bordered w-full md:w-1/3"
                />

                {bulkEditMode ? (
                    <div className="flex flex-wrap gap-4">
                        <input
                            type="number"
                            placeholder="Price"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="input input-bordered"
                        />
                        <input
                            type="number"
                            placeholder="Stock"
                            value={newStock}
                            onChange={(e) => setNewStock(e.target.value)}
                            className="input input-bordered"
                        />
                        <button
                            className="btn btn-success"
                            onClick={handleBulkUpdate}
                        >
                            Update Selected
                        </button>
                        <button className="btn btn-secondary" onClick={toggleBulkEditMode}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={toggleBulkEditMode}>
                        Bulk Edit Prices and Stock
                    </button>
                )}
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : filteredProducts.length === 0 ? (
                <div>No products found.</div>
            ) : (
                <table className="table-auto w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            {bulkEditMode && (
                                <th className="border border-gray-700 px-4 py-2 text-center">
                                    Select
                                </th>
                            )}
                            <th className="border border-gray-700 px-4 py-2 text-center">Name</th>
                            <th className="border border-gray-700 px-4 py-2 text-center">Category</th>
                            <th className="border border-gray-700 px-4 py-2 text-center">Special Lines</th>
                            <th className="border border-gray-700 px-4 py-2 text-center">Price</th>
                            <th className="border border-gray-700 px-4 py-2 text-center">Stock</th>
                            <th className="border border-gray-700 px-4 py-2 text-center">Offer</th>
                            <th className="border border-gray-700 px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedProducts.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-100">
                                {bulkEditMode && (
                                    <td className="border border-gray-700 px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product._id)}
                                            onChange={() => handleCheckboxChange(product._id)}
                                        />
                                    </td>
                                )}
                                <td className="border border-gray-700 px-4 py-2 text-center">
                                    {product.name}
                                </td>
                                <td className="border border-gray-700 px-4 py-2 text-center">
                                    {getCategoryName(product.category)}
                                </td>
                                <td className="border border-gray-700 px-4 py-2 text-center">
                                    {product.specialLines.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {product.specialLines.map((line, index) => (
                                                <li key={index}>{line}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        "N/A"
                                    )}
                                </td>
                                <td className="border border-gray-700 px-4 py-2 text-center">
                                    Tk. {Number(product?.price ?? product?.priceFC ?? 0).toFixed(2)}/-
                                </td>
                                <td className="border border-gray-700 px-4 py-2 text-center">
                                    {product.stock || 0}
                                </td>
                                <td className="border border-gray-700 px-4 py-2 text-center">
                                    {product.hasOffer ? "Yes" : "No"}
                                </td>
                                <td className="border border-gray-700 px-4 py-2 text-center">
                                    <div className="flex justify-center gap-2">
                                        <Link to={`/dashboard/admin/viewProduct/${product._id}`}>
                                            <button className="btn btn-primary">View</button>
                                        </Link>
                                        <Link to={`/dashboard/admin/editProduct/${product._id}`}>
                                            <button className="btn btn-warning">Edit</button>
                                        </Link>
                                        <button
                                            className="btn bg-red-600 text-white"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="flex justify-center mt-4 items-center gap-2">
                {getPaginationRange().map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`btn ${currentPage === pageNumber ? "btn-primary" : "btn-secondary"
                            } mx-1`}
                    >
                        {pageNumber}
                    </button>
                ))}
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder="Page"
                        className="input input-bordered w-20 text-center"
                        onChange={(e) => {
                            const value = e.target.value;
                            const page = Math.max(1, Math.min(totalPages, parseInt(value) || 1));
                            setCurrentPage(page); // Temporarily set the page number for the input
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                const value = e.target.value;
                                const page = Math.max(1, Math.min(totalPages, parseInt(value) || 1));
                                handlePageChange(page);
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            const page = Math.max(1, Math.min(totalPages, currentPage));
                            handlePageChange(page);
                        }}
                        className="btn btn-primary"
                    >
                        Go
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminRestock;
