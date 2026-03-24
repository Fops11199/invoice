import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { useAuth } from "../context/AuthContext";

const topFeatures = [
  {
    title: "Built for Cameroon & XAF",
    body: "Designed around local billing realities with practical defaults that fit how creatives and small studios work.",
  },
  {
    title: "Multi-currency support",
    body: "Invoice confidently in XAF, NGN, GHS, and USD for both local and international clients.",
  },
  {
    title: "Designer-friendly",
    body: "A clean, focused interface built to help you bill faster instead of fighting complex accounting software.",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState("features");
  const [glow, setGlow] = useState({ x: 50, y: 50, visible: false });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [countUsers, setCountUsers] = useState(0);
  const [countCurrency, setCountCurrency] = useState(0);

  useEffect(() => {
    const sections = ["features", "studio-os", "currency"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.45, 0.7] }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    if (reduceMotion) {
      setCountUsers(150);
      setCountCurrency(1);
      return;
    }
    let frameId;
    const duration = 900;
    const start = performance.now();
    const animate = (time) => {
      const elapsed = time - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCountUsers(Math.round(150 * eased));
      setCountCurrency(Math.max(1, Math.round(1 * eased)));
      if (t < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [statsVisible, reduceMotion]);

  const handleHeroMouseMove = (event) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 8;
    const rotateX = (0.5 - py) * 8;
    setTilt({ x: rotateY, y: rotateX });
    setGlow({ x: px * 100, y: py * 100, visible: true });
  };

  const handleHeroMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlow((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="absolute left-0 top-0 h-[2px] bg-primary/80 transition-[width] duration-75" style={{ width: `${scrollProgress}%` }} />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm">
          <Link to="/" className="text-base font-semibold tracking-tight md:text-lg">
            InvoiceApp
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] text-slate-600 md:flex">
            <a
              href="#features"
              className={`interactive border-b-2 pb-1 hover:text-slate-900 ${
                activeSection === "features" ? "border-primary text-slate-900" : "border-transparent"
              }`}
            >
              Features
            </a>
            <a
              href="#studio-os"
              className={`interactive border-b-2 pb-1 hover:text-slate-900 ${
                activeSection === "studio-os" ? "border-primary text-slate-900" : "border-transparent"
              }`}
            >
              Studio OS
            </a>
            <a
              href="#currency"
              className={`interactive border-b-2 pb-1 hover:text-slate-900 ${
                activeSection === "currency" ? "border-primary text-slate-900" : "border-transparent"
              }`}
            >
              Currency
            </a>
            <a href="#footer" className="interactive hover:text-slate-900">
              Support
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="interactive rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white md:text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth/login" className="interactive rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold md:text-sm">
                  Login
                </Link>
                <Link to="/auth/register" className="interactive rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white md:text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <motion.section
          className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:items-center md:pb-20 md:pt-20"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="max-w-xl"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-4 inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-800">
              Africa's modern invoicing tool
            </p>
            <h1 className="text-[38px] font-extrabold leading-[1.02] tracking-tight md:text-6xl">
              Professional Invoicing for the African Creative.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-slate-600">
              Create polished invoices, manage client relationships, and track every payment status from one modern
              workspace made for freelancers and lean teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? "/invoices/new" : "/auth/register"} className="interactive rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(26,86,219,0.28)]">
                Start Free Trial
              </Link>
              <Link to={user ? "/dashboard" : "/auth/login"} className="interactive rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold hover:bg-slate-50">
                {user ? "Open Dashboard" : "Sign In"}
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">No setup fees. Start in minutes.</p>
          </motion.div>

          <div
            className="mx-auto w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_44px_rgba(15,23,42,0.15)]"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            style={
              reduceMotion
                ? undefined
                : {
                    transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                    transition: "transform var(--motion-fast) var(--ease-standard)",
                    willChange: "transform",
                  }
            }
          >
            <div className="relative h-[260px] overflow-hidden rounded-xl border border-slate-700 bg-[radial-gradient(circle_at_top_right,_#1d4ed8,_#0f172a_50%)] p-5 text-white md:h-[290px]">
              {!reduceMotion && (
                <div
                  className="pointer-events-none absolute -inset-8 opacity-40 transition-opacity duration-200"
                  style={{
                    opacity: glow.visible ? 0.4 : 0,
                    background: `radial-gradient(260px circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.28), transparent 60%)`,
                  }}
                />
              )}
              <p className="text-xs text-blue-100/90">Invoice Dashboard Preview</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
                  <p className="text-[10px] text-slate-300">Outstanding</p>
                  <p className="mt-1 text-sm font-bold">1,245,000 XAF</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
                  <p className="text-[10px] text-slate-300">Paid</p>
                  <p className="mt-1 text-sm font-bold">742,000 XAF</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2 w-2/3 rounded bg-slate-300/40" />
                <div className="h-2 w-1/2 rounded bg-slate-300/30" />
                <div className="h-2 w-5/6 rounded bg-slate-300/20" />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16 md:pb-20"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="grid gap-4 md:grid-cols-3"
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? {} : "show"}
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {topFeatures.map((feature, index) => (
              <motion.article
                key={`${feature.title}-${index}`}
                className="interactive-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md"
                variants={reduceMotion ? {} : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="studio-os"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16 md:pb-20"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pb-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight">The Studio OS</h2>
            <p className="mt-2 text-sm text-slate-500">Everything you need to bill, follow up, and stay in control of revenue.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2">
              <h3 className="text-xl font-semibold">Fast Invoicing</h3>
              <p className="mt-2 text-sm text-slate-600">Build clear invoices in minutes with instant totals, tax calculations, and clean templates.</p>
              <div className="mt-4 h-28 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700" />
            </article>
            <article className="rounded-2xl bg-primary p-6 text-white md:min-h-[230px]">
              <h3 className="text-xl font-semibold">Client Management</h3>
              <p className="mt-2 text-sm text-blue-100">Keep every client profile, contact detail, and invoice history in one place.</p>
              <Link to={user ? "/clients" : "/auth/register"} className="interactive mt-6 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary">
                Open Feature
              </Link>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-blue-50 p-6 md:min-h-[210px]">
              <h3 className="text-xl font-semibold">Revenue Insights</h3>
              <p className="mt-2 text-sm text-slate-600">Track paid, outstanding, and overdue totals at a glance so nothing slips.</p>
              <div className="mt-4 h-2 w-2/3 rounded-full bg-blue-300" />
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2">
              <h3 className="text-xl font-semibold">Mobile-first Control</h3>
              <p className="mt-2 text-sm text-slate-600">Work smoothly on phones and low-end laptops with responsive, lightweight screens.</p>
              <div className="mt-4 h-28 rounded-xl bg-gradient-to-r from-slate-200 to-slate-300" />
            </article>
          </div>
        </motion.section>

        <motion.section
          id="currency"
          className="scroll-mt-24 bg-[#071835] py-16 text-white md:py-20"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2"
            onMouseEnter={() => setStatsVisible(true)}
            onFocus={() => setStatsVisible(true)}
          >
            <div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">Finally, Currency without the Headache.</h2>
              <p className="mt-4 max-w-lg text-slate-300">
                Bill confidently across Cameroon, Nigeria, and Ghana with currency-ready invoices that remain clear for
                every client.
              </p>
              <div className="mt-6 flex gap-8">
                <div>
                  <p className="text-2xl font-bold">{countUsers}+</p>
                  <p className="text-xs text-slate-400">users onboarded</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{countCurrency > 0 ? "XAF" : "-"}</p>
                  <p className="text-xs text-slate-400">default currency</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-800/70 bg-[#0b2348] p-6 shadow-2xl">
              <p className="text-xs uppercase tracking-wide text-blue-300">Realtime Converter</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-slate-900/70 p-3">
                  <span>2,500,000 XAF</span>
                  <span className="text-slate-400">From</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900/70 p-3">
                  <span>~ 1,512 USD</span>
                  <span className="text-blue-300">Approx</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl bg-[#eef2ff] p-8 shadow-sm md:p-10">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Ready to bill like a pro?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Join InvoiceApp and manage your invoicing workflow from first quote to confirmed payment.
            </p>
            <div className="mt-6">
              <Link to={user ? "/invoices/new" : "/auth/register"} className="interactive rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(26,86,219,0.28)]">
                {user ? "Create New Invoice" : "Create Your Account"}
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      <footer id="footer" className="scroll-mt-24 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500">
          <p>InvoiceApp for African freelancers</p>
          <div className="flex flex-wrap gap-4">
            <a href="#features" className="interactive hover:text-slate-900">Features</a>
            <a href="#studio-os" className="interactive hover:text-slate-900">Studio OS</a>
            <a href="#currency" className="interactive hover:text-slate-900">Currency</a>
            <Link to="/auth/login" className="interactive hover:text-slate-900">Login</Link>
            <Link to="/auth/register" className="interactive hover:text-slate-900">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
