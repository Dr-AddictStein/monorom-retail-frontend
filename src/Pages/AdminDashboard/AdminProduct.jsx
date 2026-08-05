import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../hooks/useAuthContext";

const AdminProduct = () => {
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
      setProducts(data);
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
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              <input
                type="number"
                placeholder="Price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="input input-bordered input-sm"
              />
              <input
                type="number"
                placeholder="Stock"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="input input-bordered input-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                className="btn btn-success btn-sm"
                onClick={handleBulkUpdate}
              >
                Update Selected ({selectedProducts.length})
              </button>
              <button className="btn btn-secondary btn-sm" onClick={toggleBulkEditMode}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={toggleBulkEditMode}>
            Bulk Edit Prices and Stock
          </button>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredProducts.length === 0 ? (
        <div>No products found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300 min-w-[1200px]">
            <thead>
              <tr className="bg-gray-200">
                {bulkEditMode && (
                  <th className="border border-gray-700 px-2 py-2 text-center min-w-[60px]">
                    Select
                  </th>
                )}
                <th className="border border-gray-700 px-2 py-2 text-left min-w-[200px]">Name</th>
                <th className="border border-gray-700 px-2 py-2 text-center min-w-[120px]">Product Code</th>
                <th className="border border-gray-700 px-2 py-2 text-center min-w-[100px]">Category</th>
                <th className="border border-gray-700 px-2 py-2 text-center min-w-[120px]">Special Lines</th>
                <th className="border border-gray-700 px-2 py-2 text-center min-w-[120px]">Price</th>
                <th className="border border-gray-700 px-2 py-2 text-center min-w-[80px]">Stock</th>
                <th className="border border-gray-700 px-2 py-2 text-center min-w-[100px]">Orders Received</th>
                <th className="border border-gray-700 px-2 py-2 text-center min-w-[80px]">Offer</th>
                <th className="border border-gray-700 px-2 py-2 text-center min-w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-100">
                  {bulkEditMode && (
                    <td className="border border-gray-700 px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleCheckboxChange(product._id)}
                      />
                    </td>
                  )}
                  <td className="border border-gray-700 px-2 py-2 text-left">
                    <div className="whitespace-normal break-words" title={product.name}>
                      {product.name}
                    </div>
                  </td>
                  <td className="border border-gray-700 px-2 py-2 text-center">
                    {product.productCode || "N/A"}
                  </td>
                  <td className="border border-gray-700 px-2 py-2 text-center">
                    <div className="max-w-[100px] truncate" title={getCategoryName(product.category)}>
                      {getCategoryName(product.category)}
                    </div>
                  </td>
                  <td className="border border-gray-700 px-2 py-2 text-center">
                    {product.specialLines.length > 0 ? (
                      <div className="max-w-[120px]">
                        <div className="text-xs">
                          {product.specialLines.length} line{product.specialLines.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-600 truncate" title={product.specialLines.join(', ')}>
                          {product.specialLines[0]}
                          {product.specialLines.length > 1 && '...'}
                        </div>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="border border-gray-700 px-2 py-2 text-center">
                    Tk. {Number(product?.price ?? product?.priceFC ?? 0).toFixed(2)}/-
                  </td>
                  <td className="border border-gray-700 px-2 py-2 text-center">
                    {product.stock || 0}
                  </td>
                  <td className="border border-gray-700 px-2 py-2 text-center">
                    {product.orderCount || 0}
                  </td>
                  <td className="border border-gray-700 px-2 py-2 text-center">
                    <span className={`badge ${product.hasOffer ? 'badge-success' : 'badge-neutral'}`}>
                      {product.hasOffer ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="border border-gray-700 px-2 py-2 text-center">
                    <div className="flex flex-col sm:flex-row justify-center gap-1">
                      <Link to={`/dashboard/admin/viewProduct/${product._id}`}>
                        <button className="btn btn-primary btn-xs sm:btn-sm">View</button>
                      </Link>
                      <Link to={`/dashboard/admin/editProduct/${product._id}`}>
                        <button className="btn btn-warning btn-xs sm:btn-sm">Edit</button>
                      </Link>
                      <button
                        className="btn bg-red-600 text-white btn-xs sm:btn-sm"
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
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center mt-4 items-center gap-2">
        {/* Pagination buttons - responsive layout */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
          {getPaginationRange().map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`btn btn-sm ${currentPage === pageNumber ? "btn-primary" : "btn-secondary"}`}
            >
              {pageNumber}
            </button>
          ))}
        </div>
        
        {/* Page navigation controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-outline"
            >
              ←
            </button>
            <span className="text-sm px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-sm btn-outline"
            >
              →
            </button>
          </div>
          
          {/* Direct page input */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder="Page"
              className="input input-bordered input-sm w-16 text-center"
              onChange={(e) => {
                const value = e.target.value;
                const page = Math.max(1, Math.min(totalPages, parseInt(value) || 1));
                setCurrentPage(page);
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
              className="btn btn-sm btn-primary"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProduct;
