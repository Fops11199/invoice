import { motion, useReducedMotion } from "framer-motion";

export default function SettingsPage() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="p-6"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-slate-600">Business profile, payment methods, and defaults will be configured here.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="interactive-card rounded-2xl border border-slate-200 bg-white p-5">Business Profile</div>
        <div className="interactive-card rounded-2xl border border-slate-200 bg-white p-5">Payment Methods</div>
      </div>
    </motion.div>
  );
}
