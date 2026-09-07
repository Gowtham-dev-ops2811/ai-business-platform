import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 15000 },
  { month: "Mar", revenue: 14000 },
  { month: "Apr", revenue: 18000 },
  { month: "May", revenue: 21000 },
  { month: "Jun", revenue: 24500 },
];

function RevenueChart() {
  return (
    <section className="chart-card">
      <div className="chart-header">
        <div>
          <h2>Revenue Overview</h2>
          <p>Revenue performance over the last 6 months</p>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default RevenueChart;