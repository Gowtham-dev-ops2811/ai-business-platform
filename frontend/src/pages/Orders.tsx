import { useEffect, useMemo, useState } from "react";

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface Order {
  id: number;
  customer_id: number;
  product_id: number;
  customer_name: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
}

interface ApiError {
  detail?: string;
  message?: string;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/orders"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const data: Order[] = await response.json();
    setOrders(data);
  };

  const fetchCustomers = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/customers"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch customers");
    }

    const data: Customer[] = await response.json();
    setCustomers(data);
  };

  const fetchProducts = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/products"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data: Product[] = await response.json();
    setProducts(data);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchOrders(),
        fetchCustomers(),
        fetchProducts(),
      ]);
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load order data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async () => {
    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    const selectedProduct = products.find(
      (product) => product.id === Number(productId)
    );

    if (!selectedProduct) {
      setError("Selected product not found.");
      return;
    }

    if (selectedProduct.stock < quantity) {
      setError(
        `Only ${selectedProduct.stock} units are available.`
      );
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "http://127.0.0.1:8000/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: Number(customerId),
            product_id: Number(productId),
            quantity,
          }),
        }
      );

      const data: Order | ApiError = await response.json();

      if (!response.ok) {
        throw new Error(
          "detail" in data && data.detail
            ? data.detail
            : "Failed to create order"
        );
      }

      setCustomerId("");
      setProductId("");
      setQuantity(1);

      await Promise.all([
        fetchOrders(),
        fetchProducts(),
      ]);

      setSuccess("Order created successfully.");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create order.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (
    orderId: number,
    newStatus: string
  ) => {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://127.0.0.1:8000/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data: Order | ApiError = await response.json();

      if (!response.ok) {
        throw new Error(
          "detail" in data && data.detail
            ? data.detail
            : "Failed to update order status"
        );
      }

      if (!("status" in data)) {
        throw new Error("Invalid response from server.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.status,
              }
            : order
        )
      );

      setSuccess("Order status updated successfully.");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update order status.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (orderId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(orderId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://127.0.0.1:8000/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );

      const data: ApiError = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete order"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.filter(
          (order) => order.id !== orderId
        )
      );

      await fetchProducts();

      setSuccess(
        data.message || "Order deleted successfully."
      );
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete order.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "Processing"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const totalRevenue = orders.reduce(
    (total, order) => total + order.total_amount,
    0
  );

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders
      .filter((order) => {
        if (
          statusFilter !== "All" &&
          order.status !== statusFilter
        ) {
          return false;
        }

        if (!searchValue) {
          return true;
        }

        return (
          String(order.id).includes(searchValue) ||
          order.customer_name
            .toLowerCase()
            .includes(searchValue) ||
          order.product_name
            .toLowerCase()
            .includes(searchValue)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
  }, [orders, search, statusFilter]);

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="main-content">
      <header className="orders-topbar">
        <div>
          <h1>Orders</h1>
          <p>
            Track and manage customer orders.
          </p>
        </div>

        <button
          type="button"
          className="orders-refresh-button"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="order-stat-grid">
        <div className="order-stat-card">
          <span>Total Orders</span>
          <strong>{totalOrders}</strong>
          <small>All customer orders</small>
        </div>

        <div className="order-stat-card">
          <span>Pending</span>
          <strong>{pendingOrders}</strong>
          <small>Awaiting processing</small>
        </div>

        <div className="order-stat-card">
          <span>Processing</span>
          <strong>{processingOrders}</strong>
          <small>Currently processing</small>
        </div>

        <div className="order-stat-card">
          <span>Revenue</span>
          <strong>
            {formatCurrency(totalRevenue)}
          </strong>
          <small>
            {completedOrders} completed orders
          </small>
        </div>
      </section>

      <section className="orders-section order-create-card">
        <div className="order-section-heading">
          <div>
            <h2>Create New Order</h2>
            <p>
              Select a customer, product, and quantity.
            </p>
          </div>
        </div>

        <div className="order-form">
          <div className="order-field">
            <label htmlFor="customer">
              Customer
            </label>

            <select
              id="customer"
              value={customerId}
              onChange={(event) =>
                setCustomerId(event.target.value)
              }
              disabled={creating}
            >
              <option value="">
                Select customer
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="order-field">
            <label htmlFor="product">
              Product
            </label>

            <select
              id="product"
              value={productId}
              onChange={(event) =>
                setProductId(event.target.value)
              }
              disabled={creating}
            >
              <option value="">
                Select product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                  disabled={product.stock <= 0}
                >
                  {product.name} -{" "}
                  {formatCurrency(product.price)} (
                  {product.stock} available)
                </option>
              ))}
            </select>
          </div>

          <div className="order-field quantity-field">
            <label htmlFor="quantity">
              Quantity
            </label>

            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  Math.max(
                    1,
                    Number(event.target.value)
                  )
                )
              }
              disabled={creating}
            />
          </div>

          <button
            type="button"
            className="create-order-button"
            onClick={handleCreateOrder}
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Order"}
          </button>
        </div>

        {success && (
          <div className="order-success">
            {success}
          </div>
        )}

        {error && (
          <div className="order-error">
            {error}
          </div>
        )}
      </section>

      <section className="orders-section">
        <div className="orders-list-heading">
          <div>
            <h2>All Orders</h2>
            <p>
              View and manage every customer transaction.
            </p>
          </div>

          <div className="order-filters">
            <input
              type="search"
              placeholder="Search orders..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">
                Processing
              </option>
              <option value="Completed">
                Completed
              </option>
              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="orders-loading">
            Loading orders...
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="orders-empty">
            <strong>No orders found</strong>
            <span>
              Try changing the search or status filter.
            </span>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const statusClass =
                    order.status.toLowerCase();

                  const isBusy =
                    updatingId === order.id ||
                    deletingId === order.id;

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong>
                          #{order.id}
                        </strong>
                      </td>

                      <td>
                        <div className="order-customer-cell">
                          <strong>
                            {order.customer_name}
                          </strong>
                        </div>
                      </td>

                      <td>
                        {order.product_name}
                      </td>

                      <td>{order.quantity}</td>

                      <td>
                        <strong>
                          {formatCurrency(
                            order.total_amount
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`order-status ${statusClass}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          order.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="order-actions">
                          <select
                            value={order.status}
                            disabled={isBusy}
                            onChange={(event) =>
                              handleStatusChange(
                                order.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="Pending">
                              Pending
                            </option>

                            <option value="Processing">
                              Processing
                            </option>

                            <option value="Completed">
                              Completed
                            </option>

                            <option value="Cancelled">
                              Cancelled
                            </option>
                          </select>

                          <button
                            type="button"
                            className="order-delete-button"
                            onClick={() =>
                              handleDelete(order.id)
                            }
                            disabled={isBusy}
                          >
                            {deletingId === order.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="order-summary-card">
        <div>
          <span>Completed</span>
          <strong>{completedOrders}</strong>
        </div>

        <div>
          <span>Cancelled</span>
          <strong>{cancelledOrders}</strong>
        </div>

        <div>
          <span>Processing</span>
          <strong>{processingOrders}</strong>
        </div>

        <div>
          <span>Pending</span>
          <strong>{pendingOrders}</strong>
        </div>
      </section>
    </main>
  );
}

export default Orders;