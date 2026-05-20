import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/client_images/Logo_Optima.webp";

export function PromoVideoSection() {
  return (
    <section className="py-24 bg-[#0a0f1e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/textura_grande_wilddogs.webp')] bg-cover" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <img
            src={logoImg}
            alt="Wild Dogs Hockey Club"
            className="h-20 w-auto mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,88,12,0.6)]"
          />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Somos <span className="text-[#EA580C]">Wild Dogs</span>
          </h2>
          <p className="text-white/50 text-sm uppercase tracking-widest font-semibold">
            El Poder de la Manada
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-[0_0_60px_-10px_rgba(234,88,12,0.4)] border border-[#EA580C]/20"
        >
          <video
            className="w-full aspect-video bg-black"
            controls
            preload="metadata"
            poster="/assets/logo.png"
          >
            <source src="/videos/promo-wild-dogs.mp4" type="video/mp4" />
            Tu navegador no soporta la reproducción de video.
          </video>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex justify-center gap-10 md:gap-16 mt-10 mb-8"
        >
          {[
            { value: "30", label: "Jugadores" },
            { value: "6", label: "Categorías" },
            { value: "100%", label: "Pasión" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-[#EA580C]">{stat.value}</div>
              <div className="text-xs text-white/50 uppercase tracking-widest mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Link href="/Unete">
            <Button
              size="lg"
              className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white rounded-full px-10 py-6 h-auto text-lg shadow-[0_0_30px_-5px_rgba(234,88,12,0.5)] hover:shadow-[0_0_50px_-5px_rgba(234,88,12,0.7)] transition-all duration-300"
            >
              Únete a la Manada
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
