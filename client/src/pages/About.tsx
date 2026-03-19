import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Heart, Target, Users } from "lucide-react";
import celebrationImage from "@assets/client_images/IMG_8260.webp";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  }
};

import textureBg from "@assets/client_images/textura-grande_wilddogs_01.webp";
import logoOptima from "@assets/client_images/Logo_Optima.webp";

export default function About() {
  useSEO({
    title: "Nosotros",
    description: "Conoce la historia, misión y valores de Optima Wild Dogs Hockey Club. El renacer del hockey en línea en Bogotá, Colombia. El poder de la manada.",
    url: "/nosotros",
  });

  const values = [
    {
      icon: Trophy,
      title: "Excelencia",
      description: "Buscamos la mejora continua en cada entrenamiento y partido, desarrollando el máximo potencial de cada jugador.",
    },
    {
      icon: Heart,
      title: "Pasión",
      description: "El amor por el hockey y el deporte nos impulsa a dar lo mejor de nosotros en cada momento.",
    },
    {
      icon: Users,
      title: "Trabajo en Equipo",
      description: "El éxito se construye juntos. Cada miembro del equipo es fundamental para alcanzar nuestras metas.",
    },
    {
      icon: Target,
      title: "Disciplina",
      description: "La constancia y el compromiso son la base del crecimiento deportivo y personal.",
    },
  ];

  const leadership = [
    { name: "Alejandro Lucio", role: "Presidente", experience: "Presidente y Representante Legal" },
    { name: "Por definir", role: "Tesorero", experience: "Responsable del manejo de bienes y fondos" },
    { name: "Por definir", role: "Secretario", experience: "Responsable de la gestión administrativa" },
  ];



  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-primary text-primary-foreground overflow-hidden">
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
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase drop-shadow-2xl">
              Nosotros
            </h1>
            <p className="text-xl md:text-2xl drop-shadow-md opacity-90 font-light">
              Conoce la historia, la energía y los valores que nos impulsan a ser el mejor club de hockey en línea de Bogotá
            </p>
          </motion.div>
        </div>
      </section>

      {/* History */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-black mb-6 tracking-tight">Nuestra Historia</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                <p>
                  <strong className="text-primary font-bold">Optima Wild Dogs Hockey Club</strong> es el renacer del hockey en línea, una manada unida por la pasión, el trabajo duro y la excelencia en todos los ámbitos de la vida. Nos diferenciamos por ofrecer una experiencia completa e integral orientada al desarrollo de cada deportista.
                </p>
                <p>
                  <strong className="text-foreground font-bold">El Poder de la Manada, El Poder de la Energía.</strong> Optima Wild Dogs refleja unión y fuerza colectiva. Como en la naturaleza, trabajamos juntos para alcanzar metas, combinando talentos únicos en un equipo sólido y ganador.
                </p>
                <p>
                  En nuestra <strong>visión integral</strong> combinamos entrenamiento táctico, desarrollo de habilidades, preparación física personalizada, teoría de juego tanto en roller como ice hockey, y priorizamos el acompañamiento mental.
                </p>
                <p className="italic border-l-4 border-primary pl-6 py-2 text-foreground bg-primary/5 rounded-r-xl">
                  "Creemos que el trabajo duro siempre da frutos. Por eso, estamos construyendo un programa profesional, centrado en el desarrollo integral, donde el deporte trascienda en la vida de cada deportista y lo prepare para enfrentar cualquier reto dentro y fuera de la pista."
                  <span className="block mt-3 text-sm font-bold text-primary">— Juan Vinueza, Director deportivo</span>
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl overflow-hidden shadow-2xl relative group"
            >
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500" />
              <img
                src={celebrationImage}
                alt="Wild Dogs Team Celebration"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                decoding="async"
                width="1200"
                height="800"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          >
            <motion.div variants={fadeIn}>
              <Card className="h-full border-border/40 hover:border-primary/50 bg-card/40 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-3xl font-black">Misión</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Formar deportistas integrales a través del hockey, promoviendo valores de trabajo en equipo, disciplina y excelencia deportiva. Brindar a nuestros jugadores las herramientas técnicas, tácticas y mentales necesarias para competir al más alto nivel, desarrollando habilidades que trascienden el deporte y los preparan para enfrentar cualquier reto en la vida.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="h-full border-border/40 hover:border-primary/50 bg-card/40 backdrop-blur-sm hover:shadow-xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-3xl font-black">Visión</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Ser reconocidos como el club líder en formación de hockey en Colombia, siendo referente en desarrollo deportivo integral. Aspiramos a que nuestros jugadores representen a Colombia en competencias nacionales e internacionales, y sean ejemplo de excelencia deportiva y humana, llevando el espíritu Optima Wild Dogs a cada reto que enfrenten.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-16 text-center tracking-tight"
          >
            Nuestros Valores
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {values.map((value, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="text-center h-full group border-border/40 hover:border-primary/50 transition-all duration-300" data-testid={`value-card-${index}`}>
                  <CardContent className="pt-10 pb-8 px-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500" />
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <value.icon className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-16 text-center tracking-tight"
          >
            Junta Directiva
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {leadership.map((leader, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-background" data-testid={`leader-card-${index}`}>
                  <CardContent className="pt-8 pb-6 px-4">
                    <div className="w-32 h-32 rounded-full bg-muted/50 mx-auto mb-6 flex items-center justify-center border-4 border-background shadow-inner">
                      <Users className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-black text-center mb-1">{leader.name}</h3>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide text-center mb-3">{leader.role}</p>
                    <p className="text-sm text-muted-foreground text-center leading-relaxed px-2">{leader.experience}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-12 text-center tracking-tight"
          >
            Nuestras Instalaciones
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="overflow-hidden border-border/50 shadow-lg">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-10 flex flex-col justify-center">
                    <h3 className="text-2xl font-black mb-4">Hockey.One Academy</h3>
                    <div className="space-y-6 text-muted-foreground leading-relaxed">
                      <p>
                        Nuestra sede es el hogar oficial de Optima Wild Dogs, equipada con una gran pista para brindar un entorno premium para el desarrollo deportivo.
                      </p>
                      <p>
                        Todos los deportistas que forman parte del equipo cuentan con <strong>acceso ilimitado</strong> a las instalaciones de Hockey.One para practicar cuando quieran.
                      </p>
                      <div className="pt-4 border-t border-border/40">
                        <p className="mb-2"><strong className="text-foreground">Ubicación:</strong> Carrera 22 # 164-83, Bogotá</p>
                        <p><strong className="text-foreground">Teléfono:</strong> +57 314 310 0208</p>
                        <p><strong className="text-foreground">Web:</strong> www.hockeyone.co</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted h-64 md:h-auto overflow-hidden relative">
                    <img
                      src={celebrationImage}
                      alt="Instalaciones Hockey One"
                      className="w-full h-full object-cover mix-blend-luminosity opacity-40 hover:mix-blend-normal hover:opacity-100 transition-all duration-700"
                      loading="lazy"
                      decoding="async"
                      width="1200"
                      height="800"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
