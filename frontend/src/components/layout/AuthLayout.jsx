import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, highlights, children, accent = "dark" }) {
  const accentClass =
    accent === "gradient" ? "bg-gradient-to-b from-[#0b2348] to-[#071835]" : "bg-[#071835]";

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-10 md:py-16">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:grid-cols-2">
        <section className={`${accentClass} p-8 text-white md:p-10`}>
          <Link to="/" className="text-sm font-semibold text-blue-200">
            InvoiceApp
          </Link>
          <h1 className="mt-8 text-3xl font-extrabold leading-tight">{title}</h1>
          <p className="mt-3 text-sm text-blue-100/90">{subtitle}</p>

          {highlights?.length ? (
            <div className="mt-8 space-y-3 text-sm text-slate-100">
              {highlights.map((item) => (
                <p key={item} className="rounded-xl border border-blue-700/60 bg-[#0c2a59] px-4 py-3">
                  {item}
                </p>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-blue-800/70 bg-[#0b2348] p-5">
              <p className="text-xs uppercase tracking-wide text-blue-300">Quick Tip</p>
              <p className="mt-2 text-sm text-slate-200">
                Keep your billing momentum by following up on overdue invoices from your dashboard.
              </p>
            </div>
          )}
        </section>
        <section className="p-8 md:p-10">{children}</section>
      </div>
    </div>
  );
}
