import { motion, useReducedMotion } from "framer-motion";

const stats = [
  { label: "Total Earned", value: "0 XAF" },
  { label: "Outstanding", value: "0 XAF" },
  { label: "Overdue", value: "0 XAF" },
  { label: "Clients", value: "0" },
];

export default function DashboardPage() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="p-6"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-slate-600">Metrics and recent invoices will appear here.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.article
            key={stat.label}
            className="interactive-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.04 * index, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stat.value}</p>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
