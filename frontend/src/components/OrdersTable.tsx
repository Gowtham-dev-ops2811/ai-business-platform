function OrdersTable() {
  return (
    <section className="orders-section">
      <h2>Recent Orders</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>John Smith</td>
              <td>MacBook Pro</td>
              <td>$1,999</td>
              <td>
                <span className="status paid">Paid</span>
              </td>
            </tr>

            <tr>
              <td>Sarah Johnson</td>
              <td>iPhone 17</td>
              <td>$999</td>
              <td>
                <span className="status pending">Pending</span>
              </td>
            </tr>

            <tr>
              <td>Michael Brown</td>
              <td>iPad Pro</td>
              <td>$799</td>
              <td>
                <span className="status paid">Paid</span>
              </td>
            </tr>

            <tr>
              <td>Emily Davis</td>
              <td>AirPods Pro</td>
              <td>$249</td>
              <td>
                <span className="status cancelled">Cancelled</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrdersTable;