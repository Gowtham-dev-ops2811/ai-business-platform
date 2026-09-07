interface OrderStatusData {
  Pending: number;
  Processing: number;
  Completed: number;
  Cancelled: number;
}

interface OrderStatusProps {
  data?: OrderStatusData;
}

function OrderStatus({
  data,
}: OrderStatusProps) {
  const statusData = data || {
    Pending: 0,
    Processing: 0,
    Completed: 0,
    Cancelled: 0,
  };

  const total =
    statusData.Pending +
    statusData.Processing +
    statusData.Completed +
    statusData.Cancelled;

  return (
    <section className="orders-section">
      <h2>Order Status</h2>

      <div>
        <p>
          Pending: {statusData.Pending}
        </p>

        <p>
          Processing: {statusData.Processing}
        </p>

        <p>
          Completed: {statusData.Completed}
        </p>

        <p>
          Cancelled: {statusData.Cancelled}
        </p>

        <p>
          Total Orders: {total}
        </p>
      </div>
    </section>
  );
}

export default OrderStatus;