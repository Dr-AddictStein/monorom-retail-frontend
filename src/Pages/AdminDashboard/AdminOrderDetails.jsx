import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { formatDeliveryPlace, formatOrderAddress } from "../../utils/orderAddress";
import { BACKEND_URL } from "@/config";

const AdminOrderDetails = () => {
  const { user } = useAuthContext();
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);

  const navigate = useNavigate();

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `${
          BACKEND_URL
        }/api/order/getOrderDetailsByAdmin/${id}`
      );
      setOrderDetails(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (!orderDetails) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or placeholder
  }

  const handleMarkAsCompleted = async (orderId) => {
    try {
      await axios.patch(
        `${
          BACKEND_URL
        }/api/order/markAsCompleted/${orderId}`
      );
      fetchOrderDetails(); // Refetch orders after marking one as completed
    } catch (error) {
      console.error("Error marking order as completed:", error);
    }
  };
  const handleDelete = async (orderId) => {
    try {
      await axios.delete(
        `${BACKEND_URL}/api/order/deleteOrder/${orderId}`
      );
      navigate("/dashboard/admin/receivedOrders");
    } catch (error) {
      console.error("Error marking order as completed:", error);
    }
  };

  const handleGeneratePDF = () => {
    const printContent = document.getElementById('order-details-content');
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    // Create the PDF document
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Details - ${orderDetails.userName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              background: white;
            }
            .print-container {
              padding: 20px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .print-header img {
              height: 60px;
              width: auto;
              margin-bottom: 10px;
            }
            .print-header h1 {
              margin: 0;
              font-size: 28px;
              color: #333;
              font-weight: bold;
            }
            .print-header h2 {
              margin: 5px 0 0 0;
              font-size: 20px;
              color: #666;
            }
            .order-summary {
              background: #f9f9f9;
              padding: 25px;
              border-radius: 8px;
              margin-bottom: 30px;
              border: 1px solid #ddd;
            }
            .order-summary h3 {
              margin-top: 0;
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
              font-size: 18px;
            }
            .order-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .order-info div {
              margin-bottom: 10px;
              font-size: 14px;
            }
            .order-info strong {
              color: #333;
              font-weight: bold;
            }
            .products-section h3 {
              font-size: 18px;
              margin-bottom: 15px;
              color: #333;
            }
            .products-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 12px;
            }
            .products-table th,
            .products-table td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            .products-table th {
              background-color: #f2f2f2;
              font-weight: bold;
              color: #333;
              font-size: 13px;
            }
            .products-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .product-image {
              width: 40px;
              height: 40px;
              object-fit: cover;
              border-radius: 4px;
            }
            .print-footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .action-buttons {
              position: fixed;
              top: 20px;
              right: 20px;
              display: flex;
              gap: 10px;
              z-index: 1000;
            }
            .download-button, .print-button {
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.3s;
            }
            .download-button:hover {
              background: #0056b3;
            }
            .download-button {
              display: none !important;
            }
            .print-button {
              background: #28a745;
            }
            .print-button:hover {
              background: #218838;
            }
            @media print {
              body { 
                margin: 0 !important; 
                padding: 0 !important;
              }
              .action-buttons { display: none !important; }
              .no-print { display: none !important; }
              @page {
                margin: 0 !important;
                size: A4;
              }
            }
          </style>
          <script>
            function downloadPDF() {
              // Create a new window for PDF generation
              const printWindow = window.open('', '_blank');
              const content = document.querySelector('.print-container').innerHTML;
              
              printWindow.document.write(\`
                <html>
                  <head>
                    <title>Order Details - ${orderDetails.userName}</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                        background: white;
                      }
                      .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                      }
                      .print-header img {
                        height: 60px;
                        width: auto;
                        margin-bottom: 10px;
                      }
                      .print-header h1 {
                        margin: 0;
                        font-size: 28px;
                        color: #333;
                        font-weight: bold;
                      }
                      .print-header h2 {
                        margin: 5px 0 0 0;
                        font-size: 20px;
                        color: #666;
                      }
                      .order-summary {
                        background: #f9f9f9;
                        padding: 25px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        border: 1px solid #ddd;
                      }
                      .order-summary h3 {
                        margin-top: 0;
                        color: #333;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 10px;
                        font-size: 18px;
                      }
                      .order-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 15px;
                      }
                      .order-info div {
                        margin-bottom: 10px;
                        font-size: 14px;
                      }
                      .order-info strong {
                        color: #333;
                        font-weight: bold;
                      }
                      .products-section h3 {
                        font-size: 18px;
                        margin-bottom: 15px;
                        color: #333;
                      }
                      .products-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 12px;
                      }
                      .products-table th,
                      .products-table td {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                      }
                      .products-table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                        color: #333;
                        font-size: 13px;
                      }
                      .products-table tr:nth-child(even) {
                        background-color: #f9f9f9;
                      }
                      .product-image {
                        width: 40px;
                        height: 40px;
                        object-fit: cover;
                        border-radius: 4px;
                      }
                      .print-footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                      }
                      .download-instructions {
                        background: #e3f2fd;
                        border: 1px solid #2196f3;
                        border-radius: 5px;
                        padding: 15px;
                        margin-bottom: 20px;
                        text-align: center;
                      }
                      .download-instructions h3 {
                        margin: 0 0 10px 0;
                        color: #1976d2;
                      }
                      .download-instructions p {
                        margin: 5px 0;
                        color: #333;
                      }
                      @media print {
                        body { 
                          margin: 0 !important; 
                          padding: 0 !important;
                        }
                        .download-instructions { display: none !important; }
                        @page {
                          margin: 0 !important;
                          size: A4;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="download-instructions">
                      <h3>📄 PDF Download Ready</h3>
                      <p>Click <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac) to open print dialog</p>
                      <p>Select <strong>"Save as PDF"</strong> as destination</p>
                      <p>Click <strong>"Save"</strong> to download the PDF file</p>
                    </div>
                    \${content}
                  </body>
                </html>
              \`);
              
              printWindow.document.close();
              printWindow.focus();
            }
          </script>
        </head>
        <body>
          <div class="action-buttons">
            <button class="download-button" onclick="downloadPDF()">Download PDF</button>
            <button class="print-button" onclick="window.print()">Print PDF</button>
          </div>
          
          <div class="print-container">
            <div class="print-header">
              <img src="/Monorom.png" alt="Monorom Logo" />
              <h1>MONOROM</h1>
              <h2>Order Details</h2>
            </div>
          
          <div class="order-summary">
            <h3>Order Summary</h3>
            <div class="order-info">
              <div><strong>User Name:</strong> ${orderDetails.userName}</div>
              <div><strong>Company Name:</strong> ${orderDetails.companyName}</div>
              <div><strong>Email:</strong> ${orderDetails.email}</div>
              <div><strong>Phone:</strong> ${orderDetails.phone}</div>
              <div><strong>Home Address:</strong> ${orderDetails.homeAddress || formatOrderAddress(orderDetails)}</div>
              <div><strong>Thana:</strong> ${orderDetails.thana || "N/A"}</div>
              <div><strong>District:</strong> ${orderDetails.district || "N/A"}</div>
              <div><strong>Delivery:</strong> ${formatDeliveryPlace(orderDetails.deliveryPlace) || "N/A"}</div>
              <div><strong>Subtotal:</strong> ${parseFloat(orderDetails.subtotal || orderDetails.totalCost).toFixed(2)}/-</div>
              <div><strong>Delivery Charge:</strong> ${parseFloat(orderDetails.deliveryCharge || 0).toFixed(2)}/-</div>
              <div><strong>Total Cost:</strong> ${parseFloat(orderDetails.totalCost).toFixed(2)}/-</div>
              <div><strong>Status:</strong> ${orderDetails.status}</div>
              <div><strong>Requirements:</strong> ${orderDetails.requirements || 'N/A'}</div>
              <div><strong>Order Created At:</strong> ${new Date(orderDetails.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div class="products-section">
            <h3>Products in Order</h3>
            <table class="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.products.map((product, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td><img src="${product.image}" alt="${product.name}" class="product-image" /></td>
                    <td>${product.name}</td>
                    <td>৳${product.price.toFixed(2)}</td>
                    <td>${product.qty}</td>
                    <td>৳${product.totalPrice.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="print-footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Thank you for your business!</p>
          </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for images to load before showing the PDF
    setTimeout(() => {
      // The user can now click the "Download PDF" button to save as PDF
      console.log('PDF ready for download');
    }, 1000);
  };

  if (!user) {
    return (
      <div className="h-[100vh] flex flex-col justify-center gap-10">
        <div className="text-5xl text-center">You are Not Logged in.!.</div>
        <div className="text-3xl text-center">Please Sign Up</div>
        <div className="flex justify-center gap-3">
          <Link to={'/login'} className="px-3 py-2 bg-emerald-700 rounded-md text-xl text-white">
            <button>Login</button>
          </Link>
          <Link to={'/signup'} className="px-3 py-2 bg-slate-700 rounded-md text-xl text-white">
            <button>SignUp</button>
          </Link>
        </div>
      </div>
    );
  }

  if (user?.user?.role !== "admin") {
    return (
      <div className="h-[100vh] flex flex-col justify-center">
        <div className="text-5xl text-center">
          Access Denied.!.
        </div>
        <div className="text-2xl text-center pt-5">
          This page can only be accessed by the Admin
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center w-full max-w-6xl mb-4">
        <h2 className="text-2xl font-semibold">Order Details</h2>
        <button
          onClick={handleGeneratePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate PDF
        </button>
      </div>
      <div id="order-details-content" className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
        <div className="mb-2">
          <strong>User Name:</strong> {orderDetails.userName}
        </div>
        <div className="mb-2">
          <strong>Company Name:</strong> {orderDetails.companyName}
        </div>
        <div className="mb-2">
          <strong>Email:</strong> {orderDetails.email}
        </div>
        <div className="mb-2">
          <strong>Phone:</strong> {orderDetails.phone}
        </div>
        <div className="mb-2">
          <strong>Home Address:</strong> {orderDetails.homeAddress || formatOrderAddress(orderDetails)}
        </div>
        <div className="mb-2">
          <strong>Thana:</strong> {orderDetails.thana || "N/A"}
        </div>
        <div className="mb-2">
          <strong>District:</strong> {orderDetails.district || "N/A"}
        </div>
        <div className="mb-2">
          <strong>Delivery:</strong> {formatDeliveryPlace(orderDetails.deliveryPlace) || "N/A"}
        </div>
        <div className="mb-2">
          <strong>Subtotal:</strong>{" "}
          {parseFloat(orderDetails.subtotal || orderDetails.totalCost).toFixed(2)}/-
        </div>
        <div className="mb-2">
          <strong>Delivery Charge:</strong>{" "}
          {parseFloat(orderDetails.deliveryCharge || 0).toFixed(2)}/-
        </div>
        <div className="mb-2">
          <strong>Total Cost:</strong> {" "}
          {parseFloat(orderDetails.totalCost).toFixed(2)}/-
        </div>
        <div className="mb-2">
          <strong>Status:</strong> {orderDetails.status}
        </div>
        <div className="mb-2">
          <strong>Requirements:</strong> {orderDetails.requirements ? orderDetails.requirements : ""}
        </div>
        <div className="mb-2">
          <strong>Order Created At:</strong>{" "}
          {new Date(orderDetails.createdAt).toLocaleString()}
        </div>
        <div className="flex justify-end">
          <div className="">
            {orderDetails.status === "received" && (
              <button
                className="btn bg-green-600 text-white"
                onClick={() => handleMarkAsCompleted(id)}
              >
                Mark as Completed
              </button>
            )}
            <button
              className="btn bg-red-600 text-white ml-1"
              onClick={() => handleDelete(id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Products in Order</h3>
      <div className="overflow-x-auto w-full max-w-6xl">
      <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
              <th className="p-4 text-center">ID</th>
              <th className="p-4 text-center">Image</th>
              <th className="p-4 text-center">Name</th>
              <th className="p-4 text-center">Price</th>
              <th className="p-4 text-center">Quantity</th>
              <th className="p-4 text-center">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.products.map((product, index) => (
              <tr key={product._id} className="border-b hover:bg-gray-100">
                <td className="p-4">{index + 1}</td>
                <td className="p-4 text-center flex justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover"
                  />
                </td>
                <td className="p-4 text-center">{product.name}</td>
                <td className="p-4 text-center">৳{product.price.toFixed(2)}</td>
                <td className="p-4 text-center">{product.qty}</td>
                <td className="p-4 text-center">৳{product.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
