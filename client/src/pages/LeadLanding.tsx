import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { db } from "@/lib/instant";
import { id } from "@instantdb/react";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@assets/client_images/Jugadores_Wilddogs.webp";
import celebrationImage from "@assets/client_images/IMG_8260.webp";
import sub8Image from "@assets/client_images/Rooster_Sub8.webp";
import sub12Image from "@assets/client_images/Sub12_Grupo.webp";
import sub14Image from "@assets/client_images/sub14_Grupo.webp";
import sub16Image from "@assets/client_images/IMG_8291_1.webp";

// ─── LEAD FORM MODAL ─────────────────────────────────────────────────────────
function LeadModal({ onClose }: { onClose: () => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        parentName: "",
        childName: "",
        childAge: "",
        phone: "",
        email: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.parentName || !form.phone) return;
        setIsSubmitting(true);
        try {
            await db.transact([
                db.tx.contactSubmissions[id()].update({
                    name: form.parentName,
                    email: form.email || "no-email@optimawilddogs.com",
                    phone: form.phone,
                    subject: `Inscripción interesada - Niño/a: ${form.childName}, ${form.childAge} años`,
                    message: `Padre/madre: ${form.parentName} | Hijo/a: ${form.childName} | Edad: ${form.childAge} | Tel: ${form.phone}`,
                    isRead: false,
                    createdAt: Date.now(),
                }),
            ]);
            setSubmitted(true);
        } catch {
            toast({ title: "Error", description: "Intenta de nuevo.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-0"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Modal */}
            <motion.div
                initial={{ y: 80, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 80, opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative z-10 w-full max-w-lg bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Accent top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

                <div className="p-8">
                    {!submitted ? (
                        <>
                            <div className="mb-8">
                                <p className="text-orange-400 text-sm font-black uppercase tracking-[0.25em] mb-2">
                                    Paso 1 de 1
                                </p>
                                <h2 className="text-3xl font-black text-white leading-tight">
                                    Asegura el cupo<br />
                                    <span className="text-orange-400">de tu hijo/a</span>
                                </h2>
                                <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                                    Déjanos tus datos y un coach se comunicará contigo en menos de 24 horas.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                            Tu Nombre*
                                        </label>
                                        <input
                                            name="parentName"
                                            required
                                            value={form.parentName}
                                            onChange={handleChange}
                                            placeholder="Nombre del padre/madre"
                                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                            Nombre del niño/a
                                        </label>
                                        <input
                                            name="childName"
                                            value={form.childName}
                                            onChange={handleChange}
                                            placeholder="Nombre"
                                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                            Edad
                                        </label>
                                        <select
                                            name="childAge"
                                            value={form.childAge}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                                        >
                                            <option value="">Selecciona</option>
                                            {Array.from({ length: 20 }, (_, i) => i + 5).map((age) => (
                                                <option key={age} value={age}>{age} años</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                            WhatsApp / Teléfono*
                                        </label>
                                        <input
                                            name="phone"
                                            required
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="300 000 0000"
                                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                            Email
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="correo@ejemplo.com"
                                            className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 text-sm outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-2 bg-orange-500 hover:bg-orange-400 active:scale-[0.98] text-white font-black text-lg py-4 rounded-2xl transition-all duration-200 shadow-[0_0_40px_-8px_rgba(249,115,22,0.6)] hover:shadow-[0_0_60px_-8px_rgba(249,115,22,0.9)] disabled:opacity-50"
                                >
                                    {isSubmitting ? "Enviando..." : "Quiero unirme a la manada →"}
                                </button>

                                <p className="text-center text-zinc-600 text-xs mt-3">
                                    Sin compromisos. Te contactamos nosotros.
                                </p>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-8"
                        >
                            <div className="text-6xl mb-6">🐺</div>
                            <h3 className="text-3xl font-black text-white mb-3">
                                ¡Bienvenido/a <br />
                                <span className="text-orange-400">a la manada!</span>
                            </h3>
                            <p className="text-zinc-400 leading-relaxed mb-8">
                                Recibimos tu información. Un coach de Wild Dogs se comunicará contigo muy pronto para darte todos los detalles.
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                            >
                                Cerrar
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── STAT COUNTER ─────────────────────────────────────────────────────────────
function StatItem({ value, label, suffix = "" }: { value: string; label: string; suffix?: string }) {
    return (
        <div className="text-center">
            <div className="text-5xl md:text-7xl font-black text-white tabular-nums leading-none">
                {value}<span className="text-orange-400">{suffix}</span>
            </div>
            <div className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-semibold mt-2">{label}</div>
        </div>
    );
}

// ─── MAIN LANDING ────────────────────────────────────────────────────────────
export default function LeadLanding() {
    useSEO({
        title: "Únete a la Manada",
        description: "¿Quieres que tu hijo/a practique hockey en línea en Bogotá? Optima Wild Dogs Hockey Club ofrece formación profesional desde los 5 años. Cupos limitados.",
        url: "/unete",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isModalOpen]);

    const categories = [
        { name: "Sub 8", age: "5–7 años", img: sub8Image, desc: "Los primeros pasos sobre ruedas. Diversión pura." },
        { name: "Sub 12", age: "8–11 años", img: sub12Image, desc: "Técnica progresiva y amor al juego." },
        { name: "Sub 14", age: "12–13 años", img: sub14Image, desc: "Táctica, equipo y competencia real." },
        { name: "Sub 16+", age: "14–17 años", img: sub16Image, desc: "Alto rendimiento y proyección nacional." },
    ];

    const pillars = [
        {
            number: "01",
            title: "Técnica de Clase Mundial",
            body: "Metodología estructurada por nivel. De los fundamentos al dominio total del puck y el skate.",
        },
        {
            number: "02",
            title: "Preparación Física Real",
            body: "Planes individualizados por categoría. Fuerza, velocidad y resistencia específica del hockey.",
        },
        {
            number: "03",
            title: "Formación de Carácter",
            body: "Hockey es disciplina, respeto y trabajo en equipo. Valores que duran toda la vida.",
        },
        {
            number: "04",
            title: "Acompañamiento Mental",
            body: "Somos pioneros en Colombia integrando gestión emocional y mentalidad competitiva desde pequeños.",
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

            {/* ─── HERO ─────────────────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative h-screen min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
                {/* Parallax BG */}
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt="Wild Dogs Hockey en acción"
                        className="w-full h-full object-cover object-center scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/40 to-zinc-950" />
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 to-transparent" />
                </motion.div>

                {/* Nav minimal */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5">
                    <img src="/assets/logo.png" alt="Wild Dogs" className="h-10 w-10 rounded-full object-cover ring-2 ring-orange-500/40" />
                    <a
                        href="https://optimawilddogs.com"
                        className="text-xs text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        optimawilddogs.com
                    </a>
                </div>

                {/* Hero Content */}
                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="relative z-10 text-center px-6 max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-8"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                        Inscripciones Abiertas · Cupos Limitados
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-6xl sm:text-8xl md:text-[7rem] font-black leading-[0.9] tracking-tighter uppercase mb-6"
                    >
                        El Poder<br />
                        de la{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                            Manada
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="text-zinc-300 text-xl md:text-2xl font-light max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Formación deportiva de excelencia para niños y jóvenes en Bogotá.
                        Hockey en línea que transforma vidas.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                    >
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group relative bg-orange-500 hover:bg-orange-400 text-white font-black text-xl px-10 py-5 rounded-2xl transition-all duration-300 shadow-[0_0_60px_-10px_rgba(249,115,22,0.7)] hover:shadow-[0_0_80px_-10px_rgba(249,115,22,1)] hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10">
                                ¡Quiero asegurar un cupo!
                            </span>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <p className="text-zinc-500 text-sm mt-4">
                            Gratis · Sin compromiso · Respuesta en &lt;24h
                        </p>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                >
                    <div className="w-px h-12 bg-gradient-to-b from-transparent to-orange-500/50" />
                </motion.div>
            </section>

            {/* ─── STATS ────────────────────────────────────────────────────────── */}
            <section className="py-20 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-12"
                    >
                        {[
                            { value: "70", suffix: "+", label: "Jugadores activos" },
                            { value: "6", suffix: "", label: "Categorías" },
                            { value: "100", suffix: "%", label: "Pasión y entrega" },
                            { value: "1", suffix: "°", label: "Club en Bogotá" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                            >
                                <StatItem value={stat.value} suffix={stat.suffix} label={stat.label} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── EMOTIONAL HOOK ───────────────────────────────────────────────── */}
            <section className="py-28 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.06)_0%,_transparent_70%)]" />
                <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-orange-400 text-sm font-black uppercase tracking-[0.3em] mb-6">
                            Más que un deporte
                        </p>
                        <h2 className="text-5xl md:text-6xl font-black leading-tight mb-8 tracking-tight">
                            No solo les enseñamos{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                                hockey.
                            </span>
                            <br />Les enseñamos a{" "}
                            <span className="italic">ganar en la vida.</span>
                        </h2>
                        <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl mx-auto">
                            En Wild Dogs creemos que cada niño tiene potencial sin límites.
                            Nuestro programa va más allá de la pista: disciplina, liderazgo,
                            resiliencia y trabajo en equipo que los prepara para cualquier reto.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ─── PILLARS ──────────────────────────────────────────────────────── */}
            <section className="py-20 bg-zinc-900/50">
                <div className="container mx-auto px-6 max-w-6xl">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-orange-400 text-sm font-black uppercase tracking-[0.3em] text-center mb-16"
                    >
                        Nuestro método
                    </motion.p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden">
                        {pillars.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-zinc-950 p-10 hover:bg-zinc-900 transition-colors duration-300 group"
                            >
                                <span className="text-orange-500/30 text-6xl font-black block mb-4 group-hover:text-orange-500/50 transition-colors">
                                    {p.number}
                                </span>
                                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-orange-400 transition-colors">
                                    {p.title}
                                </h3>
                                <p className="text-zinc-500 leading-relaxed">{p.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CATEGORIES ───────────────────────────────────────────────────── */}
            <section className="py-28">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-orange-400 text-sm font-black uppercase tracking-[0.3em] mb-4"
                        >
                            Hay un lugar para tu hijo/a
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-6xl font-black tracking-tight"
                        >
                            Desde los 5 años
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <img
                                    src={cat.img}
                                    alt={cat.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="text-orange-400 font-black text-2xl mb-0.5">{cat.name}</div>
                                    <div className="text-zinc-300 text-xs font-semibold">{cat.age}</div>
                                    <p className="text-zinc-500 text-xs mt-1 leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {cat.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── SOCIAL PROOF / QUOTE ─────────────────────────────────────────── */}
            <section className="relative py-28 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={celebrationImage}
                        alt="Wild Dogs celebración"
                        className="w-full h-full object-cover object-center opacity-15"
                    />
                    <div className="absolute inset-0 bg-zinc-950/80" />
                </div>
                <div className="relative z-10 container mx-auto px-6 max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                    >
                        <div className="text-orange-400 text-7xl font-black leading-none mb-6 opacity-30">"</div>
                        <p className="text-3xl md:text-4xl font-black text-white leading-tight mb-8 italic">
                            El trabajo duro siempre da frutos. Estamos construyendo un programa donde el deporte trasciende en la vida de cada deportista.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-sm">
                                JV
                            </div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm">Juan Vinueza</div>
                                <div className="text-zinc-500 text-xs">Director Deportivo, Optima Wild Dogs</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
            <section className="py-28 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(249,115,22,0.15)_0%,_transparent_70%)]" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                    >
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-none">
                            ¿Listo para<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                                rugir?
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-xl max-w-xl mx-auto mb-12 leading-relaxed">
                            Los cupos son limitados. Asegura el lugar de tu hijo/a en la manada y recibe toda la información sin compromiso.
                        </p>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group relative inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-white font-black text-2xl px-14 py-6 rounded-2xl transition-all duration-300 shadow-[0_0_80px_-10px_rgba(249,115,22,0.8)] hover:shadow-[0_0_120px_-10px_rgba(249,115,22,1)] hover:scale-105 active:scale-95"
                        >
                            Solicitar información gratuita
                            <span className="text-3xl transition-transform duration-300 group-hover:translate-x-2">→</span>
                        </button>

                        <div className="mt-8 flex items-center justify-center gap-6 text-zinc-600 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="text-zinc-500">✓</span> Sin costo
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="text-zinc-500">✓</span> Sin compromiso
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="text-zinc-500">✓</span> Respuesta en &lt;24h
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── FOOTER MINIMAL ───────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/assets/logo.png" alt="Wild Dogs" className="h-8 w-8 rounded-full object-cover" />
                        <span className="text-zinc-500 text-sm">Optima Wild Dogs Hockey Club · Bogotá, Colombia</span>
                    </div>
                    <div className="flex items-center gap-6 text-zinc-600 text-xs">
                        <a href="https://optimawilddogs.com" className="hover:text-white transition-colors">optimawilddogs.com</a>
                        <a href="https://wa.me/573202373500" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
                        <a href="https://www.instagram.com/optimawilddogs/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>

            {/* ─── MODAL ────────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {isModalOpen && <LeadModal onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </div>
    );
}
