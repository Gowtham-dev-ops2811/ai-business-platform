import { useEffect, useState } from "react";
import "./Dashboard.css";

interface DashboardData {
  revenue: number;
  customers: number;
  orders: number;
  payments: number;
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

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const dashboardResponse = await fetch(
          "http://127.0.0.1:8000/api/dashboard"
        );

        if (!dashboardResponse.ok) {
          throw new Error("Dashboard API failed");
        }

        const dashboardData: DashboardData =
          await dashboardResponse.json();

        setData(dashboardData);

        const ordersResponse = await fetch(
          "http://127.0.0.1:8000/orders"
        );

        if (ordersResponse.ok) {
          const ordersData: Order[] =
            await ordersResponse.json();

          setOrders(ordersData);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        setError(
          "Unable to load dashboard. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const pendingOrders = orders.filter(
    (order: Order) => order.status === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order: Order) => order.status === "Processing"
  ).length;

  const completedOrders = orders.filter(
    (order: Order) => order.status === "Completed"
  ).length;

  const cancelledOrders = orders.filter(
    (order: Order) => order.status === "Cancelled"
  ).length;

  const recentOrders = [...orders]
    .sort(
      (a: Order, b: Order) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const totalOrders =
    pendingOrders +
    processingOrders +
    completedOrders +
    cancelledOrders;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getPercentage = (value: number) => {
    if (totalOrders === 0) {
      return 0;
    }

    return Math.round((value / totalOrders) * 100);
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <main className="ai-dashboard">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <h1>Hello, Gowtham!</h1>
            <p>
              Here are your analytics and recommendations
            </p>
          </div>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className="date-button"
            >
              Today, {today}
              <span>⌄</span>
            </button>

            <div className="assistant-avatar">
              ✦
            </div>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="dashboard-layout">
          <div className="dashboard-main">
            <section className="metric-grid">
              <div className="metric-card">
                <span className="metric-title">
                  Revenue
                </span>

                <strong>
                  {loading
                    ? "..."
                    : formatCurrency(
                        data?.revenue ?? 0
                      )}
                </strong>

                <span className="metric-change positive">
                  ▲ 12.5%
                  <small>Last week</small>
                </span>
              </div>

              <div className="metric-card">
                <span className="metric-title">
                  Tasks
                </span>

                <strong>
                  {loading
                    ? "..."
                    : data?.orders ?? 0}
                </strong>

                <span className="metric-change positive">
                  ▲ 15.0%
                  <small>Last week</small>
                </span>
              </div>

              <div className="metric-card">
                <span className="metric-title">
                  Customer Satisfaction
                </span>

                <strong>
                  😊 4.7
                </strong>

                <span className="metric-change positive">
                  ▲ 8.8%
                  <small>Last week</small>
                </span>
              </div>

              <div className="metric-card">
                <span className="metric-title">
                  Lead Conversion
                </span>

                <strong>
                  12.5%
                </strong>

                <span className="metric-change positive">
                  ▲ 11.8%
                  <small>Last week</small>
                </span>
              </div>
            </section>

            <section className="analytics-card">
              <div className="card-heading">
                <div>
                  <h2>
                    Metrics Overview
                  </h2>

                  <p>
                    Revenue and business activity
                  </p>
                </div>

                <div className="chart-legend">
                  <span>
                    <i className="legend-dot revenue-dot" />
                    Revenue
                  </span>

                  <span>
                    <i className="legend-dot leads-dot" />
                    Orders
                  </span>
                </div>
              </div>

              <div className="line-chart">
                <div className="chart-y-axis">
                  <span>6000</span>
                  <span>4500</span>
                  <span>3000</span>
                  <span>1500</span>
                  <span>0</span>
                </div>

                <svg
                  viewBox="0 0 700 280"
                  preserveAspectRatio="none"
                  className="chart-svg"
                >
                  <line
                    x1="0"
                    y1="45"
                    x2="700"
                    y2="45"
                    className="chart-grid-line"
                  />

                  <line
                    x1="0"
                    y1="100"
                    x2="700"
                    y2="100"
                    className="chart-grid-line"
                  />

                  <line
                    x1="0"
                    y1="155"
                    x2="700"
                    y2="155"
                    className="chart-grid-line"
                  />

                  <line
                    x1="0"
                    y1="210"
                    x2="700"
                    y2="210"
                    className="chart-grid-line"
                  />

                  <polyline
                    points="0,185 70,150 140,180 210,125 280,145 350,90 420,120 490,75 560,95 630,45 700,28"
                    className="revenue-line"
                  />

                  <polyline
                    points="0,220 70,190 140,205 210,190 280,200 350,165 420,155 490,125 560,110 630,90 700,65"
                    className="orders-line"
                  />

                  <circle
                    cx="490"
                    cy="75"
                    r="5"
                    className="chart-point"
                  />

                  <circle
                    cx="700"
                    cy="28"
                    r="5"
                    className="chart-point"
                  />

                  <circle
                    cx="490"
                    cy="125"
                    r="5"
                    className="orders-point"
                  />

                  <circle
                    cx="700"
                    cy="65"
                    r="5"
                    className="orders-point"
                  />
                </svg>

                <div className="chart-x-axis">
                  <span>Aug 25</span>
                  <span>Aug 26</span>
                  <span>Aug 27</span>
                  <span>Aug 28</span>
                  <span>Aug 29</span>
                  <span>Today</span>
                </div>
              </div>
            </section>

            <section className="bottom-grid">
              <div className="analytics-card sales-card">
                <div className="card-heading">
                  <div>
                    <h2>
                      Sales Trends
                    </h2>

                    <p>
                      Monthly performance
                    </p>
                  </div>

                  <span className="trend-badge">
                    +95%
                  </span>
                </div>

                <div className="bar-chart">
                  {[
                    ["Jan", 42],
                    ["Feb", 60],
                    ["Mar", 52],
                    ["Apr", 78],
                    ["May", 92],
                  ].map(
                    ([month, height]) => (
                      <div
                        className="bar-column"
                        key={month}
                      >
                        <span>
                          ${height}k
                        </span>

                        <div
                          className="sales-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                        <small>
                          {month}
                        </small>
                      </div>
                    )
                  )}
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

                <h3>
                  AI Forecast
                </h3>

                <p>
                  Business performance is trending
                  upward.
                </p>

                <button type="button">
                  View Forecast
                </button>
              </div>
            </section>

            <section className="recent-orders-card">
              <div className="card-heading">
                <div>
                  <h2>
                    Recent Orders
                  </h2>

                  <p>
                    Latest customer transactions
                  </p>
                </div>

                <a href="/orders">
                  View all →
                </a>
              </div>

              {recentOrders.length === 0 ? (
                <div className="empty-orders">
                  No orders available.
                </div>
              ) : (
                <div className="recent-orders-list">
                  {recentOrders.map(
                    (order: Order) => (
                      <div
                        className="recent-order"
                        key={order.id}
                      >
                        <div className="order-number">
                          #{order.id}
                        </div>

                        <div className="order-info">
                          <strong>
                            {order.customer_name}
                          </strong>

                          <span>
                            {order.product_name}
                          </span>
                        </div>

                        <strong className="order-price">
                          {formatCurrency(
                            order.total_amount
                          )}
                        </strong>

                        <span
                          className={
                            "order-status " +
                            order.status.toLowerCase()
                          }
                        >
                          {order.status}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="dashboard-right">
            <section className="recommendations-card">
              <div className="side-card-heading">
                <h2>
                  Next Steps
                </h2>

                <button type="button">
                  ?
                </button>
              </div>

              <div className="recommendation-label">
                AI Recommendations
              </div>

              <div className="recommendation-item priority">
                <span className="dashboard-icon">
                  ♟
                </span>

                <div>
                  <strong>
                    Follow up with leads
                  </strong>

                  <span>
                    Focus on your highest-value
                    opportunities.
                  </span>
                </div>

                <em>
                  TOP PRIORITY
                </em>
              </div>

              <div className="recommendation-item">
                <span className="dashboard-icon">
                  ▦
                </span>

                <div>
                  <strong>
                    Schedule a strategy meeting
                  </strong>

                  <span>
                    Review business goals this week.
                  </span>
                </div>
              </div>

              <div className="recommendation-item">
                <span className="dashboard-icon">
                  ◉
                </span>

                <div>
                  <strong>
                    Improve response time
                  </strong>

                  <span>
                    Target a 15% improvement.
                  </span>
                </div>
              </div>
            </section>

            <section className="tasks-card">
              <div className="side-card-heading">
                <h2>
                  Tasks Due Soon
                </h2>
              </div>

              <div className="task-summary">
                <div>
                  <span className="task-dot overdue" />
                  Overdue
                </div>

                <strong>
                  {cancelledOrders}
                </strong>
              </div>

              <div className="task-summary">
                <div>
                  <span className="task-dot tomorrow" />
                  Due tomorrow
                </div>

                <strong>
                  {pendingOrders}
                </strong>
              </div>

              <div className="task-summary">
                <div>
                  <span className="task-dot week" />
                  Due this week
                </div>

                <strong>
                  {processingOrders}
                </strong>
              </div>

              <div className="donut-container">
                <div
                  className="donut"
                  style={{
                    background:
                      `conic-gradient(` +
                      `#ef6b8b 0 ${getPercentage(
                        cancelledOrders
                      )}%,` +
                      `#f6b65b ${getPercentage(
                        cancelledOrders
                      )}% ${getPercentage(
                        cancelledOrders +
                          pendingOrders
                      )}%,` +
                      `#7188ff ${getPercentage(
                        cancelledOrders +
                          pendingOrders
                      )}% 100%)`,
                  }}
                >
                  <div className="donut-center">
                    <strong>
                      {totalOrders}
                    </strong>

                    <span>
                      Orders
                    </span>
                  </div>
                </div>
              </div>

              <div className="status-breakdown">
                <div>
                  <span>
                    Pending
                  </span>

                  <strong>
                    {pendingOrders}
                  </strong>
                </div>

                <div>
                  <span>
                    Processing
                  </span>

                  <strong>
                    {processingOrders}
                  </strong>
                </div>

                <div>
                  <span>
                    Completed
                  </span>

                  <strong>
                    {completedOrders}
                  </strong>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;