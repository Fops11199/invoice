export function Badge({ status, children }) {
  const statusColors = {
    draft: "bg-slate-100/50 text-slate-500 border-slate-200/50",
    sent: "bg-blue-50 text-primary border-blue-200/50",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    overdue: "bg-rose-50 text-rose-700 border-rose-200/50"
  };

  const defaultColor = "bg-slate-100 text-slate-600 border-slate-200";
  const colorClass = statusColors[status?.toLowerCase()] || defaultColor;

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] border shadow-sm ${colorClass}`}>
      {children || status}
    </span>
  );
}
