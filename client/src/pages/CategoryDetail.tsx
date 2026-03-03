import { useParams } from "wouter";
import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, Target } from "lucide-react";
import type { PlayerProfile, User, Coach } from "@shared/schema";
import { motion } from "framer-motion";
import playerPlaceholder from "@assets/generated_images/Player_portrait_placeholder_d8c2b3f0.png";
import coachPlaceholder from "@assets/generated_images/Coach_portrait_placeholder_9533f352.png";
import sub8Image from "@assets/generated_images/Sub_8_category_action_a72d36d1.png";
import sub12Image from "@assets/generated_images/Sub_12_category_action_b13c69c9.png";
import sub14Image from "@assets/generated_images/Sub_14_category_action_8361893f.png";
import sub16Image from "@assets/generated_images/Sub_16_category_action_736df6df.png";
import sub18Image from "@assets/generated_images/Sub_18_category_action_dd3bdc31.png";
import mayoresImage from "@assets/generated_images/Mayores_category_action_e9aef5c0.png";
import femeninoImage from "@assets/generated_images/Femenino_category_action_f0a1b2c3.png";
import sub10Image from "@assets/generated_images/Sub_10_category_action_e5f6g7h8.png";

type PlayerWithUser = PlayerProfile & { user: User };

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function CategoryDetail() {
  const params = useParams();
  const categoryId = params.id as string;

  const { data: players = [], isLoading: playersLoading } = useQuery<PlayerWithUser[]>({
    queryKey: ["/api/categories", categoryId, "players"],
  });

  const { data: coaches = [], isLoading: coachesLoading } = useQuery<Coach[]>({
    queryKey: ["/api/categories", categoryId, "coaches"],
  });

  const categoryImages: Record<string, string> = {
    sub8: sub8Image,
    sub10: sub10Image,
    sub12: sub12Image,
    sub14: sub14Image,
    sub16: sub16Image,
    sub18: sub18Image,
    mayores: mayoresImage,
    femenino: femeninoImage,
  };

  const categoryInfo: Record<string, any> = {
    sub8: {
      name: "Sub 8",
      ageRange: "Menores de 8 años",
      description: "Introducción al hockey en línea con énfasis en diversión y desarrollo de habilidades básicas motoras.",
      schedule: [
        "Lunes (17:00–19:00) · Cancha Federación",
        "Viernes (16:30–18:30) · Cancha Federación"
      ],
      objectives: [
        "Desarrollar habilidades motoras básicas",
        "Aprender fundamentos del patinaje",
        "Manejo básico del stick y puck",
        "Fomentar el amor por el deporte",
      ],
    },
    sub10: {
      name: "Sub 10",
      ageRange: "Menores de 10 años",
      description: "Desarrollo de habilidades individuales y comprensión inicial de las reglas y dinámicas de equipo.",
      schedule: [
        "Lunes (17:00–19:00) · Cancha Federación",
        "Viernes (16:30–18:30) · Cancha Federación"
      ],
      objectives: [
        "Mejorar la agilidad en patines",
        "Familiarización con el juego en conjunto",
        "Técnica de pase y recepción",
        "Comprender reglas básicas del hockey en línea",
      ],
    },
    sub12: {
      name: "Sub 12",
      ageRange: "Menores de 12 años",
      description: "Desarrollo técnico progresivo con introducción a conceptos tácticos básicos del juego.",
      schedule: [
        "Lunes (17:00–19:00) · Cancha Federación",
        "Viernes (16:30–18:30) · Cancha Federación"
      ],
      objectives: [
        "Perfeccionar técnica individual",
        "Comprender posiciones de juego",
        "Trabajar en equipo efectivamente",
        "Participar en torneos locales",
      ],
    },
    sub14: {
      name: "Sub 14",
      ageRange: "Menores de 14 años",
      description: "Formación competitiva con énfasis en táctica colectiva y desarrollo físico.",
      schedule: [
        "Lunes (17:00–19:00) · Cancha Federación",
        "Sábado (07:00–09:00) · Cancha Federación"
      ],
      objectives: [
        "Dominar sistemas tácticos",
        "Mejorar condición física específica",
        "Desarrollar liderazgo en cancha",
        "Competir a nivel regional",
      ],
    },
    sub16: {
      name: "Sub 16",
      ageRange: "Menores de 16 años",
      description: "Alto nivel competitivo con preparación para categorías mayores.",
      schedule: [
        "Lunes (19:30–21:30) · Cancha Federación",
        "Sábado (07:00–09:00) · Cancha Federación",
        "Domingo (08:00–09:00) · Cancha BHC"
      ],
      objectives: [
        "Excelencia técnico-táctica",
        "Preparación mental competitiva",
        "Representación nacional",
        "Proyección deportiva avanzada",
      ],
    },
    sub18: {
      name: "Sub 18",
      ageRange: "Menores de 18 años",
      description: "Categoría pre-profesional con enfoque en alto rendimiento.",
      schedule: [
        "Lunes (21:00–22:30) · Cancha Federación",
        "Jueves (19:00–20:30) · Cancha Federación",
        "Domingo (07:00–08:00) · Cancha BHC"
      ],
      objectives: [
        "Perfeccionamiento integral",
        "Transición a nivel senior",
        "Competencia nacional e internacional",
        "Desarrollo profesional",
      ],
    },
    mayores: {
      name: "Mayores",
      ageRange: "18 años en adelante",
      description: "Competencia adulta de alto nivel en torneos locales y nacionales.",
      schedule: [
        "Lunes (21:00–22:30) · Cancha Federación",
        "Jueves (19:00–20:30) · Cancha Federación",
        "Domingo (07:00–08:00) · Cancha BHC"
      ],
      objectives: [
        "Competencia profesional",
        "Representación del club a máximo nivel",
        "Torneos nacionales",
        "Excelencia deportiva",
      ],
    },
    femenino: {
      name: "Femenino",
      ageRange: "Todas las edades",
      description: "Categoría femenina de alto rendimiento con competencia en torneos locales, nacionales e internacionales.",
      schedule: [
        "Lunes (19:30–21:30) · Cancha Federación",
        "Miércoles (18:00) · Hockey One",
        "Sábado (07:00–09:00) · Cancha Federación",
        "Domingo (08:00–09:00) · Cancha BHC"
      ],
      objectives: [
        "Desarrollo integral de la jugadora femenina",
        "Competencia a nivel local y nacional",
        "Representación del club en torneos femeninos",
        "Proyección deportiva internacional",
      ],
    },
  };

  const info = categoryInfo[categoryId] || categoryInfo.sub8;
  const heroImage = categoryImages[categoryId] || sub8Image;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            src={heroImage}
            alt={info.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight uppercase drop-shadow-2xl"
          >
            {info.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl text-white/90 drop-shadow-md font-light tracking-wide"
          >
            {info.ageRange}
          </motion.p>
        </div>
      </section>

      {/* Category Info */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 -mt-32 -mr-32" />
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <motion.div variants={fadeIn}>
                <Card className="h-full border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <Clock className="h-10 w-10 text-primary mb-3" />
                    <CardTitle className="text-2xl">Horarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(info.schedule) ? (
                      <ul className="space-y-3">
                        {info.schedule.map((slot: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="text-muted-foreground leading-tight">{slot}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-lg">{info.schedule}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeIn}>
                <Card className="h-full border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <Target className="h-10 w-10 text-primary mb-3" />
                    <CardTitle className="text-2xl">Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeIn}>
                <Card className="h-full border-border/40 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader>
                    <Trophy className="h-10 w-10 text-primary mb-3" />
                    <CardTitle className="text-2xl">Nivel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-lg font-semibold">
                      {categoryId === "sub8" || categoryId === "sub10" || categoryId === "sub12"
                        ? "Formativo"
                        : categoryId === "mayores" || categoryId === "femenino"
                          ? "Elite"
                          : "Competitivo"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-12 border-border/40 bg-card/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-3xl font-black">Objetivos Formativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {info.objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="font-medium text-foreground/90">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Player Roster */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-12 text-center tracking-tight"
          >
            Roster de Jugadores
          </motion.h2>
          {playersLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-6">
                    <div className="w-28 h-28 rounded-full bg-muted animate-pulse mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded animate-pulse mb-2 w-3/4 mx-auto" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : players.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {players.map((player) => (
                <motion.div key={player.id} variants={fadeIn}>
                  <Card className="group h-full border-0 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-background overflow-hidden relative" data-testid={`player-card-${player.id}`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    <CardContent className="p-6 text-center relative z-10">
                      <div className="w-28 h-28 rounded-full bg-muted mx-auto mb-4 overflow-hidden border-4 border-background shadow-inner ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300 relative">
                        <img
                          src={player.user.profileImageUrl || playerPlaceholder}
                          alt={`${player.user.firstName} ${player.user.lastName}`}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="text-4xl font-black text-primary/10 absolute top-4 right-4 tracking-tighter group-hover:text-primary/20 transition-colors">
                        #{player.jerseyNumber || "00"}
                      </div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                        {player.user.firstName} {player.user.lastName}
                      </h3>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {player.position || "Jugador"}
                      </p>
                      {(player.goals || player.assists || player.gamesPlayed) ? (
                        <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t border-border/50 flex justify-center gap-4">
                          <div className="flex flex-col"><span className="font-bold text-foreground">{player.gamesPlayed || 0}</span>PJ</div>
                          <div className="flex flex-col"><span className="font-bold text-foreground">{player.goals || 0}</span>G</div>
                          <div className="flex flex-col"><span className="font-bold text-foreground">{player.assists || 0}</span>A</div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="p-16 max-w-2xl mx-auto border-dashed border-2 bg-transparent">
              <div className="text-center text-muted-foreground">
                <Trophy className="mx-auto h-12 w-12 text-muted mb-4" />
                <p className="text-lg">Próximamente estaremos revelando nuestro roster oficial.</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Coaching Staff */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-12 text-center tracking-tight"
          >
            Cuerpo Técnico
          </motion.h2>
          {coachesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-6">
                    <div className="w-32 h-32 rounded-full bg-muted animate-pulse mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded animate-pulse mb-2 w-3/4 mx-auto" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : coaches.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
            >
              {coaches.map((coach) => (
                <motion.div key={coach.id} variants={fadeIn}>
                  <Card className="h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-background" data-testid={`coach-card-${coach.id}`}>
                    <CardContent className="pt-8 pb-6 px-4 text-center">
                      <div className="w-32 h-32 rounded-full bg-muted/50 mx-auto mb-6 flex items-center justify-center border-4 border-background shadow-inner overflow-hidden">
                        <img
                          src={coach.photoUrl || coachPlaceholder}
                          alt={coach.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-black text-center mb-1">{coach.name}</h3>
                      <p className="text-sm font-semibold text-primary uppercase tracking-wide text-center mb-3">{coach.role}</p>
                      {coach.experience && (
                        <p className="text-sm text-muted-foreground text-center leading-relaxed px-2">{coach.experience}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="p-16 max-w-2xl mx-auto border-dashed border-2 bg-transparent">
              <div className="text-center text-muted-foreground">
                <Target className="mx-auto h-12 w-12 text-muted mb-4" />
                <p className="text-lg">Información del cuerpo técnico próximamente.</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
