import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import tshirtImage from "../assets/tshirt.avif";
import pantImage from "../assets/pant.jpg";
import sneakersImage from "../assets/sneakers.jpg";

const heroVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: index * 0.08, ease: "easeOut" },
  }),
};

export default function Home() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleShopNow = () => {
    if (role) {
      // If logged in, go to products
      navigate("/products");
    } else {
      // If not logged in, go to login
      navigate("/login");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 pb-16 pt-8 md:px-8">
      <motion.section
        className="relative overflow-hidden rounded-3xl border border-brand-200/70 bg-white p-6 shadow-card md:p-10"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[size:22px_22px] opacity-50" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              Premium Marketplace
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              Welcome to <span className="text-brand-600">Luxe Heaven</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
              Discover premium fashion, exclusive deals, and standout picks curated for your personal style.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="ui-btn-primary" onClick={handleShopNow}>Shop Now</button>
              {!role && (
                <button className="ui-btn-soft" onClick={() => navigate("/register")}>Create Account</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[tshirtImage, pantImage, sneakersImage].map((img, i) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.35 }}
                className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md ${i === 2 ? "col-span-2" : ""}`}
              >
                <img src={img} alt="Collection" className="h-44 w-full object-cover sm:h-52" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["🎯", "Wide Selection", "Thousands of products across categories"],
          ["💰", "Best Prices", "Exclusive deals and smart pricing"],
          ["🔒", "Secure Shopping", "Protected checkout and data safety"],
          ["⭐", "Top Rated", "Loved by repeat customers"],
        ].map(([icon, title, desc], index) => (
          <motion.div
            key={title}
            className="glass-card p-5"
            variants={featureCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={index}
          >
            <div className="text-2xl">{icon}</div>
            <h3 className="mt-2 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-extrabold text-slate-900">Shop by Category</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["👔", "Men's Fashion", "Premium clothing", "Men"],
            ["👗", "Women's Fashion", "Elegant styles", "Women"],
            ["📱", "Electronics", "Latest gadgets", "Electronics"],
            ["🏠", "Home & Living", "Furniture and decor", "Home"],
          ].map(([icon, title, desc, cat]) => (
            <motion.button
              key={title}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 250, damping: 22 }}
              onClick={() => navigate(role ? `/products?category=${cat}` : "/login")}
              className="glass-card group p-5 text-left"
            >
              <div className="text-2xl">{icon}</div>
              <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-brand-700">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {!role && (
        <motion.section
          className="mt-12 rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-600 to-brand-800 p-8 text-white shadow-card"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-2xl font-extrabold">Ready to Start Shopping?</h2>
          <p className="mt-2 text-brand-100">Join thousands of happy customers and discover amazing products.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700" onClick={() => navigate("/register")}>
              Sign Up Free
            </button>
            <button className="rounded-xl border border-brand-300/60 bg-brand-700/40 px-4 py-2.5 text-sm font-bold text-white" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>
        </motion.section>
      )}
    </div>
  );
}
