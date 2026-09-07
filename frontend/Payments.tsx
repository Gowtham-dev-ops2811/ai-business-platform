import { useEffect, useState } from "react";

interface Payment {
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
}

function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/orders"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment transactions");
      }

      const data: Payment[] = await response.json();

      setPayments(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to load payment transactions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const paidPayments = payments.filter(
    (payment) =>
      payment.status.toLowerCase() === "completed" ||
      payment.status.toLowerCase() === "paid"
  );

  const pendingPayments = payments.filter(
    (payment) =>
      payment.status.toLowerCase() === "pending" ||
      payment.status.toLowerCase() === "processing"
  );

  const failedPayments = payments.filter(
    (payment) =>
      payment.status.toLowerCase() === "cancelled" ||
      payment.status.toLowerCase() === "failed"
  );

  const totalAmount = payments.reduce(
    (total, payment) => total + payment.total_amount,
    0
  );

  const paidAmount = paidPayments.reduce(
    (total, payment) => total + payment.total_amount,
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (total, payment) => total + payment.total_amount,
    0
  );

  const failedAmount = failedPayments.reduce(
    (total, payment) => total + payment.total_amount,
    0
  );

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <h1>Payments</h1>
          <p>
            Monitor business payments and transactions.
          </p>
        </div>
      </header>

      <section className="orders-section">
        <h2>Payment Overview</h2>

        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-title">
              Total Payments
            </span>

            <strong>
              {loading ? "..." : payments.length}
            </strong>

            <span className="metric-change positive">
              All transactions
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
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-title">
              Paid
            </span>

            <strong>
              {loading
                ? "..."
                : formatCurrency(paidAmount)}
            </strong>

            <span className="metric-change positive">
              {paidPayments.length} transactions
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-title">
              Pending
            </span>

            <strong>
              {loading
                ? "..."
                : formatCurrency(pendingAmount)}
            </strong>

            <span className="metric-change">
              {pendingPayments.length} transactions
            </span>
          </div>
        </div>
      </section>

      {error && (
        <section className="orders-section">
          <p>{error}</p>
        </section>
      )}

      <section className="orders-section">
        <div className="card-heading">
          <div>
            <h2>All Payment Transactions</h2>

            <p>
              View payments generated from customer orders.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPayments}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading payment transactions...</p>
        ) : payments.length === 0 ? (
          <div className="empty-orders">
            No payment transactions found.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Order Qty</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      #PAY-{payment.id}
                    </td>

                    <td>
                      {payment.customer_name}
                    </td>

                    <td>
                      {payment.product_name}
                    </td>

                    <td>
                      {payment.quantity}
                    </td>

                    <td>
                      {formatCurrency(
                        payment.total_amount
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          "status " +
                          payment.status.toLowerCase()
                        }
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        payment.created_at
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="orders-section">
        <h2>Payment Status</h2>

        <div className="status-breakdown">
          <div>
            <span>
              Paid
            </span>

            <strong>
              {paidPayments.length}
            </strong>
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {pendingPayments.length}
            </strong>
          </div>

          <div>
            <span>
              Failed / Cancelled
            </span>

            <strong>
              {failedPayments.length}
            </strong>
          </div>

          <div>
            <span>
              Failed Amount
            </span>

            <strong>
              {formatCurrency(failedAmount)}
            </strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Payments;