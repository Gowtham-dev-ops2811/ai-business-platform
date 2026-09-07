import { useEffect, useState } from "react";

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

function Payments() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/orders"
        );

        if (!response.ok) {
          throw new Error("Failed to load payment data.");
        }

        const data: Order[] = await response.json();

        setOrders(data);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load payments. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const totalPayments = orders.length;

  const paidPayments = orders.filter(
    (order) =>
      order.status.toLowerCase() === "completed"
  ).length;

  const pendingPayments = orders.filter(
    (order) =>
      order.status.toLowerCase() === "pending" ||
      order.status.toLowerCase() === "processing"
  ).length;

  const failedPayments = orders.filter(
    (order) =>
      order.status.toLowerCase() === "cancelled"
  ).length;

  const totalAmount = orders.reduce(
    (total, order) =>
      total + Number(order.total_amount || 0),
    0
  );

  const paidAmount = orders
    .filter(
      (order) =>
        order.status.toLowerCase() === "completed"
    )
    .reduce(
      (total, order) =>
        total + Number(order.total_amount || 0),
      0
    );

  const pendingAmount = orders
    .filter(
      (order) =>
        order.status.toLowerCase() === "pending" ||
        order.status.toLowerCase() === "processing"
    )
    .reduce(
      (total, order) =>
        total + Number(order.total_amount || 0),
      0
    );

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getPaymentStatus = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "completed") {
      return "Paid";
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "processing"
    ) {
      return "Pending";
    }

    if (normalizedStatus === "cancelled") {
      return "Failed";
    }

    return status;
  };

  const getStatusClass = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "completed") {
      return "paid";
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "processing"
    ) {
      return "pending";
    }

    if (normalizedStatus === "cancelled") {
      return "cancelled";
    }

    return "pending";
  };

  const recentPayments = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 10);

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <h1>Payments</h1>

          <p>
            Monitor payment activity and transaction
            performance.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <div className="assistant-avatar">
            $
          </div>
        </div>
      </header>

      <section className="metric-grid">
        <div className="metric-card">
          <span className="metric-title">
            Total Payments
          </span>

          <strong>
            {loading ? "..." : totalPayments}
          </strong>

          <span className="metric-change positive">
            Transactions
            <small>All orders</small>
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">
            Total Amount
          </span>

          <strong>
            {loading
              ? "..."
              : formatCurrency(totalAmount)}
          </strong>

          <span className="metric-change positive">
            Transaction value
            <small>All payments</small>
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">
            Paid Amount
          </span>

          <strong>
            {loading
              ? "..."
              : formatCurrency(paidAmount)}
          </strong>

          <span className="metric-change positive">
            Completed
            <small>{paidPayments} payments</small>
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-title">
            Pending Amount
          </span>

          <strong>
            {loading
              ? "..."
              : formatCurrency(pendingAmount)}
          </strong>

          <span className="metric-change">
            Awaiting completion
            <small>{pendingPayments} payments</small>
          </span>
        </div>
      </section>

      {error && (
        <section className="orders-section">
          <p className="error-message">
            {error}
          </p>
        </section>
      )}

      <section className="orders-section">
        <div className="card-heading">
          <div>
            <h2>Payment Overview</h2>

            <p>
              Summary of payment transaction status.
            </p>
          </div>

          <span className="trend-badge">
            {failedPayments} Failed
          </span>
        </div>

        <div className="bottom-grid">
          <div className="analytics-card">
            <div className="card-heading">
              <div>
                <h2>Payment Status</h2>

                <p>
                  Current transaction distribution
                </p>
              </div>
            </div>

            <div className="status-breakdown">
              <div>
                <span>
                  <span className="task-dot week" />
                  Paid
                </span>

                <strong>
                  {loading ? "..." : paidPayments}
                </strong>
              </div>

              <div>
                <span>
                  <span className="task-dot tomorrow" />
                  Pending
                </span>

                <strong>
                  {loading ? "..." : pendingPayments}
                </strong>
              </div>

              <div>
                <span>
                  <span className="task-dot overdue" />
                  Failed
                </span>

                <strong>
                  {loading ? "..." : failedPayments}
                </strong>
              </div>
            </div>
          </div>

          <div className="ai-forecast-card">
            <div className="robot">
              <div className="robot-head">
                <span />
                <span />
              </div>

              <div className="robot-body">
                <span />
              </div>
            </div>

            <h3>Payment Insights</h3>

            <p>
              {failedPayments > 0
                ? "Some transactions require attention."
                : "Payment activity is currently healthy."}
            </p>

            <button type="button">
              View Insights
            </button>
          </div>
        </div>
      </section>

      <section className="orders-section">
        <div className="card-heading">
          <div>
            <h2>Payment Transactions</h2>

            <p>
              Latest payment activity from your
              orders.
            </p>
          </div>

          <span className="trend-badge">
            {totalPayments} Transactions
          </span>
        </div>

        {loading && (
          <div className="empty-orders">
            Loading payment transactions...
          </div>
        )}

        {!loading &&
          !error &&
          recentPayments.length === 0 && (
            <div className="empty-orders">
              No payment transactions found.
            </div>
          )}

        {!loading &&
          !error &&
          recentPayments.length > 0 && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentPayments.map(
                    (order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>
                            #PAY-{order.id}
                          </strong>
                        </td>

                        <td>
                          {order.customer_name}
                        </td>

                        <td>
                          {order.product_name}
                        </td>

                        <td>
                          {formatCurrency(
                            Number(
                              order.total_amount
                            )
                          )}
                        </td>

                        <td>
                          {new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </td>

                        <td>
                          <span
                            className={`status ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {getPaymentStatus(
                              order.status
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </main>
  );
}

export default Payments;