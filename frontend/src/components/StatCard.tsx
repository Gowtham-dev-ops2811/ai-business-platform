interface StatCardProps {
  title: string;
  value: string;
  change: string;
}

function StatCard({ title, value, change }: StatCardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="value">{value}</p>
      <span>{change}</span>
    </div>
  );
}

export default StatCard;