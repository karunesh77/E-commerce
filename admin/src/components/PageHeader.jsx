export default function PageHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {action}
    </div>
  );
}
