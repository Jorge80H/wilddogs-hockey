import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import sub8Image from "@assets/generated_images/Sub_8_category_action_a72d36d1.png";
import sub12Image from "@assets/generated_images/Sub_12_category_action_b13c69c9.png";
import sub14Image from "@assets/generated_images/Sub_14_category_action_8361893f.png";
import sub16Image from "@assets/generated_images/Sub_16_category_action_736df6df.png";
import sub18Image from "@assets/generated_images/Sub_18_category_action_dd3bdc31.png";
import mayoresImage from "@assets/generated_images/Mayores_category_action_e9aef5c0.png";
import femeninoImage from "@assets/generated_images/Femenino_category_action_f0a1b2c3.png";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Categories() {
  useSEO({
    title: "Categorías",
    description: "Siete categorías de hockey en línea: Sub 8, Sub 12, Sub 14, Sub 16, Sub 18, Femenino y Mayores. Wild Dogs Hockey Club en Bogotá, Colombia.",
    url: "/categorias",
  });

  const categories = [
    {
      id: "sub8",
      name: "Sub 8",
      ageRange: "Menores de 8 años",
      description: "Introducción al hockey en línea con énfasis en diversión y desarrollo de habilidades básicas motoras.",
      imageUrl: sub8Image,
      objectives: "Aprender fundamentos del patinaje y manejo básico del stick.",
    },
    {
      id: "sub12",
      name: "Sub 12",
      ageRange: "Menores de 12 años",
      description: "Desarrollo técnico progresivo con introducción a conceptos tácticos básicos del juego.",
      imageUrl: sub12Image,
      objectives: "Perfeccionar técnica individual y comprender posiciones de juego.",
    },
    {
      id: "sub14",
      name: "Sub 14",
      ageRange: "Menores de 14 años",
      description: "Formación competitiva con énfasis en táctica colectiva y desarrollo físico.",
      imageUrl: sub14Image,
      objectives: "Dominar sistemas tácticos y mejorar condición física específica.",
    },
    {
      id: "sub16",
      name: "Sub 16",
      ageRange: "Menores de 16 años",
      description: "Alto nivel competitivo con preparación para categorías mayores y representación nacional.",
      imageUrl: sub16Image,
      objectives: "Excelencia técnico-táctica y preparación mental competitiva.",
    },
    {
      id: "sub18",
      name: "Sub 18",
      ageRange: "Menores de 18 años",
      description: "Categoría pre-profesional con enfoque en alto rendimiento y proyección deportiva.",
      imageUrl: sub18Image,
      objectives: "Perfeccionamiento integral y transición a nivel senior.",
    },
    {
      id: "femenino",
      name: "Femenino",
      ageRange: "Todas las edades",
      description: "Categoría femenina de alto rendimiento con competencia en torneos locales, nacionales e internacionales.",
      imageUrl: femeninoImage,
      objectives: "Desarrollo integral de la jugadora femenina y representación del club a máximo nivel.",
    },
    {
      id: "mayores",
      name: "Mayores",
      ageRange: "18 años en adelante",
      description: "Competencia adulta de alto nivel en torneos locales y nacionales.",
      imageUrl: mayoresImage,
      objectives: "Competencia profesional y representación del club a máximo nivel.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase drop-shadow-2xl">
              Categorías
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-light drop-shadow-md">
              Siete categorías competitivas desde Sub 8 hasta Mayores
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {categories.map((category) => (
              <motion.div key={category.id} variants={fadeIn} className="h-full">
                <Card
                  className="overflow-hidden hover-elevate active-elevate-2 group border-border/40 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col"
                  data-testid={`category-card-${category.id}`}
                >
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-black text-primary mb-1 group-hover:translate-x-1 transition-transform">{category.name}</h3>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{category.ageRange}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-grow">{category.description}</p>
                    <div className="mb-6 p-4 bg-muted/40 rounded-lg border border-border/50">
                      <p className="text-xs font-black uppercase text-primary/80 mb-2 tracking-wider">Objetivos</p>
                      <p className="text-sm text-foreground/80">{category.objectives}</p>
                    </div>
                    <Link href={`/categorias/${category.id}`}>
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" variant="outline" data-testid={`button-view-${category.id}`}>
                        Ver Detalles
                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/30 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-primary/5 rounded-[100%] blur-[80px] -z-10" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-black mb-6 tracking-tight">Encuentra Tu Categoría</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              ¿No estás seguro en qué categoría inscribirte? Contáctanos y te ayudaremos a encontrar el grupo perfecto según tu edad y nivel.
            </p>
            <Link href="/contacto">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-primary/25 transition-all duration-300 group" data-testid="button-contact-category">
                Contáctanos
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
