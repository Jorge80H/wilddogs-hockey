import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Dumbbell, Trophy, Heart, Clock, DollarSign, CheckCircle2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

import textureBg from "@assets/client_images/textura-grande_wilddogs_01.webp";
import logoOptima from "@assets/client_images/Logo_Optima.webp";

export default function Services() {
  useSEO({
    title: "Servicios y Membresías",
    description: "Escuela de formación deportiva, preparación física especializada, torneos y membresía oficial en Optima Wild Dogs Hockey Club. Afiliación desde $430.000/mes.",
    url: "/servicios",
  });

  const services = [
    {
      icon: GraduationCap,
      title: "Escuela de Formación Deportiva",
      description: "Programa integral de formación en hockey en línea para niños y jóvenes. Enseñanza de fundamentos técnicos, tácticos y desarrollo de habilidades específicas del deporte.",
      features: [
        "Metodología progresiva por niveles",
        "Grupos reducidos por edades",
        "Material didáctico incluido",
        "Evaluaciones periódicas",
      ],
    },
    {
      icon: Dumbbell,
      title: "Preparación Física",
      description: "Entrenamiento físico especializado diseñado para mejorar la condición atlética específica del hockey en línea.",
      features: [
        "Planes personalizados por categoría",
        "Trabajo de fuerza y resistencia",
        "Prevención de lesiones",
        "Nutrición deportiva básica",
      ],
    },
    {
      icon: Trophy,
      title: "Participación en Torneos",
      description: "Representación del club en competencias locales, regionales y nacionales. Experiencia competitiva real para todos los niveles.",
      features: [
        "Torneos federados",
        "Campeonatos inter-clubes",
        "Copa nacional",
        "Eventos amistosos",
      ],
    },
    {
      icon: Heart,
      title: "Desarrollo Integral",
      description: "Formación en valores y habilidades para la vida a través del deporte.",
      features: [
        "Trabajo en equipo",
        "Liderazgo y comunicación",
        "Gestión emocional",
        "Disciplina y compromiso",
      ],
    },
  ];

  const HOCKEY_ONE_MAP = "https://www.google.com/maps/place/Hockey.One+Academy/@4.7466044,-74.0455953,141m";
  const FEDE_MAP = "https://www.google.com/maps/place/Coliseo+de+Hockey+en+Linea/@4.7754122,-74.0406326,165m";
  const GUAYMARAL_MAP = "https://www.google.com/maps/place/Pista+De+Hockey+Guaymaral/@4.808551,-74.0353605,130m";

  const schedules = [
    { category: "Sub 8, Sub 10, Sub 12", detail: "Lunes (17:00–19:00) y Viernes (16:30–18:30)", location: "Hockey One (Federación)", mapUrl: FEDE_MAP },
    { category: "Sub 14", detail: "Lunes (17:00–19:00) y Sábado (07:00–09:00)", location: "Hockey One (Federación)", mapUrl: FEDE_MAP },
    { category: "Sub 16", detail: "Lunes (19:30–21:30) / Sábado (07:00–09:00) Fed · Domingo (08:00–09:00) Guaymaral", location: "Hockey One / Guaymaral", mapUrl: FEDE_MAP },
    { category: "Femenino", detail: "Lun (19:30–21:30), Mié (18:00 H1), Sáb (07:00–09:00) Fed · Dom (08:00–09:00) Guaymaral", location: "Hockey One / Guaymaral", mapUrl: FEDE_MAP },
    { category: "Sub 18 y Mayores", detail: "Lunes (21:00–22:30) y Jueves (19:00–20:30) Fed · Domingo (07:00–08:00) Guaymaral", location: "Hockey One / Guaymaral", mapUrl: FEDE_MAP },
  ];

  const membershipPlan = {
    name: "Afiliación Oficial",
    price: "$430.000",
    period: "mensual",
    features: [
      "Entrenamientos de primer nivel por categoría",
      "Preparación física especializada",
      "Formación deportiva y táctica integral",
      "Acceso ilimitado a las instalaciones",
      "Seguro deportivo de cubrimiento total",
      "Camiseta oficial del club (Dotación inicial)",
      "Participación habilitada para torneos federados",
      "Acompañamiento mental y nutricional básico"
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply"
          style={{ 
            backgroundImage: `url(${textureBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase">
              Servicios
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Programas de entrenamiento llenos de energía y nivel profesional para todas las edades y niveles
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Lo Que Ofrecemos</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          >
            {services.map((service, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover-elevate transition-all duration-300" data-testid={`service-card-${index}`}>
                  <CardHeader>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transform -rotate-6 group-hover:rotate-0 transition-transform">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                    <ul className="space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Schedules */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Horarios de Entrenamiento</h2>
              <p className="text-muted-foreground">
                Entrenamientos estructurados por categoría para maximizar el desarrollo
              </p>
            </div>
            <div className="space-y-4">
              {schedules.map((schedule, index) => (
                <Card key={index} data-testid={`schedule-${index}`} className="hover-elevate transition-all border-border/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="font-bold text-lg md:w-1/4 text-primary">{schedule.category}</div>
                      <div className="text-muted-foreground text-sm font-medium md:w-1/2 flex items-center justify-start gap-2">
                        <Clock className="w-4 h-4 shrink-0 opacity-70" />
                        {schedule.detail}
                      </div>
                      <div className="font-semibold text-foreground md:w-1/4 md:text-right text-sm flex items-center md:justify-end gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary opacity-70" />
                        {schedule.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Canchas */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">Nuestras Canchas</h2>
            <p className="text-muted-foreground">
              Entrenamos en las mejores instalaciones de hockey en línea de Bogotá
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Hockey One - Sede */}
            <div>
              <h3 className="text-xl font-bold mb-1">Hockey One Academy</h3>
              <p className="text-sm text-muted-foreground mb-3">Cra. 22 #164-83, Bogotá • Sede principal del club</p>
              <div className="aspect-video w-full rounded-xl overflow-hidden relative group shadow-md">
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent pointer-events-none transition-colors duration-500 z-10" />
                <iframe
                  src="https://maps.google.com/maps?width=100%25&height=400&hl=en&q=4.7466044,-74.0455953+(Hockey+One+Wild+Dogs)&t=&z=17&ie=UTF8&iwloc=B&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Hockey One Academy - Wild Dogs"
                  className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
            {/* Fedepatin */}
            <div>
              <h3 className="text-xl font-bold mb-1">Coliseo Hockey en Línea</h3>
              <p className="text-sm text-muted-foreground mb-3">Bogotá • Cancha de entrenamiento Fedepatín</p>
              <div className="aspect-video w-full rounded-xl overflow-hidden relative group shadow-md">
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent pointer-events-none transition-colors duration-500 z-10" />
                <iframe
                  src="https://maps.google.com/maps?width=100%25&height=400&hl=en&q=4.7754122,-74.0406326+(Coliseo+Hockey+Fedepatin)&t=&z=17&ie=UTF8&iwloc=B&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Coliseo de Hockey en Línea - Fedepatín"
                  className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
            {/* Guaymaral */}
            <div>
              <h3 className="text-xl font-bold mb-1">Pista Hockey Guaymaral</h3>
              <p className="text-sm text-muted-foreground mb-3">Autopista Norte, Bogotá • Cancha de competencia</p>
              <div className="aspect-video w-full rounded-xl overflow-hidden relative group shadow-md">
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent pointer-events-none transition-colors duration-500 z-10" />
                <iframe
                  src="https://maps.google.com/maps?width=100%25&height=400&hl=en&q=4.808551,-74.0353605+(Pista+Hockey+Guaymaral)&t=&z=17&ie=UTF8&iwloc=B&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Pista de Hockey Guaymaral"
                  className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plan */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-primary/20 shadow-2xl bg-background/60 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                      <DollarSign className="h-4 w-4" />
                      Membresía Única
                    </div>
                    <CardTitle className="text-4xl md:text-5xl font-black">{membershipPlan.name}</CardTitle>
                    <p className="text-muted-foreground mt-4 text-lg">
                      La ruta perfecta para comenzar o potenciar tu nivel competitivo en el mejor club de la ciudad.
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-start md:items-end">
                    <span className="text-6xl font-black tabular-nums tracking-tighter text-foreground">
                      {membershipPlan.price.split('.')[0]}<span className="text-4xl">.{membershipPlan.price.split('.')[1]}</span>
                    </span>
                    <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm mt-1">/ {membershipPlan.period}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
                  {membershipPlan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground/90">{feature}</span>
                    </div>
                  ))}
                </div>

                <CardFooter className="p-0">
                  <a href="/login" className="w-full">
                    <Button
                      size="lg"
                      className="w-full text-lg w-full h-16 rounded-xl hover-elevate transition-all shadow-lg hover:shadow-primary/25"
                      data-testid="button-select-plan"
                    >
                      Inscríbete Ahora y Únete a la Manada
                    </Button>
                  </a>
                </CardFooter>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Enrollment Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Proceso de Inscripción</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Regístrate", desc: "Crea tu cuenta en línea" },
                { step: "2", title: "Completa Datos", desc: "Información personal y médica" },
                { step: "3", title: "Elige Tu Plan", desc: "Selecciona membresía" },
                { step: "4", title: "¡Comienza!", desc: "Asiste a tu primera práctica" },
              ].map((item, index) => (
                <div key={index} className="text-center" data-testid={`enrollment-step-${index}`}>
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para Comenzar?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Únete a Wild Dogs hoy y comienza tu camino hacia la excelencia deportiva
          </p>
          <a href="/login" data-testid="button-cta-enroll">
            <Button
              size="lg"
              variant="outline"
              className="bg-primary-foreground text-primary hover-elevate active-elevate-2"
            >
              Inscríbete Ahora
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
