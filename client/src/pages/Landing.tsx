import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Calendar, Target, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { db } from "@/lib/instant";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSEO } from "@/hooks/useSEO";
import heroImage from "@assets/client_images/Jugadores_Wilddogs.webp";
import celebrationImage from "@assets/client_images/IMG_8260.webp";


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Landing() {
  useSEO({
    title: "Optima Wild Dogs Hockey Club",
    description: "Club de Hockey en Línea en Bogotá, Colombia. El poder de la manada. Formación deportiva de excelencia para todas las edades desde Sub 8 hasta Mayores.",
    url: "/",
  });

  // Query news posts from InstantDB
  const { data, isLoading: newsLoading } = db.useQuery({
    newsPosts: {
      $: {
        where: { status: 'published' },
        order: { publishedAt: 'desc' },
        limit: 3,
      },
    },
    matches: {} // We fetch all to filter the latest past matches locally
  });

  const news = data?.newsPosts || [];

  // Extract latest 3 matches that aren't "Not Started" and are in the past
  const pastMatches = (data?.matches || [])
    .filter((m: any) => m.status !== "Not Started" && m.date < Date.now())
    .sort((a: any, b: any) => b.date - a.date)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Wild Dogs Hockey Action"
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
            width="1920"
            height="1080"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight uppercase drop-shadow-2xl"
          >
            Optima <span className="text-primary tracking-tighter">Wild Dogs</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-3xl font-light text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md"
          >
            El Poder de la Manada, <strong className="font-bold text-white">El Poder de la Energía</strong>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/Unete" data-testid="button-hero-join">
              <Button
                size="lg"
                className="text-lg px-8 py-6 h-auto bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] hover:shadow-[0_0_60px_-15px_rgba(234,88,12,0.8)] transition-all duration-300 rounded-full"
              >
                Únete a la Manada
              </Button>
            </Link>
            <Link href="/categorias" data-testid="link-hero-categories">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto bg-black/20 backdrop-blur-md text-white border-white/20 hover:bg-white/10 transition-all duration-300 rounded-full"
              >
                Ver Categorías
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-b border-border/40">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeIn} className="text-center group">
              <div className="text-4xl md:text-6xl font-black text-primary mb-2 flex items-center justify-center gap-1" data-testid="stat-years">
                1<span className="text-2xl md:text-3xl text-primary/60">+</span>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest font-semibold group-hover:text-foreground transition-colors">
                Año de Historia
              </div>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center group">
              <div className="text-4xl md:text-6xl font-black text-primary mb-2 flex items-center justify-center gap-1" data-testid="stat-players">
                70<span className="text-2xl md:text-3xl text-primary/60">+</span>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest font-semibold group-hover:text-foreground transition-colors">
                Jugadores en la Manada
              </div>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center group">
              <div className="text-4xl md:text-6xl font-black text-primary mb-2 flex items-center justify-center gap-1" data-testid="stat-championships">
                100<span className="text-2xl md:text-3xl text-primary/60">%</span>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest font-semibold group-hover:text-foreground transition-colors">
                Pasión y Entrega
              </div>
            </motion.div>
            <motion.div variants={fadeIn} className="text-center group">
              <div className="text-4xl md:text-6xl font-black text-primary mb-2" data-testid="stat-categories">
                6
              </div>
              <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-widest font-semibold group-hover:text-foreground transition-colors">
                Categorías Activas
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left -z-10" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-8">Nuestra Misión</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Optima Wild Dogs Hockey Club es el renacer del hockey en línea. Somos una manada unida por la pasión, el trabajo duro y la excelencia. Nos diferenciamos por ofrecer una experiencia premium e integral orientada al desarrollo humano y deportivo de cada jugador desde sus primeros años.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Last Matches / Results Section */}
      {pastMatches.length > 0 && (
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12 border-b border-border/40 pb-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Últimos Resultados</h2>
                <p className="text-muted-foreground">La manada en acción sobre la pista.</p>
              </div>
              <Link href="/torneos">
                <Button variant="ghost" className="hidden sm:flex group hover:bg-primary/10 hover:text-primary">
                  <span>Ver Torneos</span>
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {pastMatches.map((match: any) => {
                const isWildDogsHome = match.isHome;
                const homeTeam = isWildDogsHome ? "Wild Dogs" : match.opponent;
                const awayTeam = isWildDogsHome ? match.opponent : "Wild Dogs";
                const divisionStr = match.notes?.split(' - ')[0] || "General";

                return (
                  <motion.div key={match.id} variants={fadeIn}>
                    <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors shadow-sm bg-background">
                      <div className="bg-muted px-4 py-2 flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>{format(new Date(match.date), "dd MMM yyyy", { locale: es })}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{divisionStr}</span>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className={`text-center flex-1 ${isWildDogsHome ? 'font-black text-primary' : 'font-semibold text-foreground'}`}>
                            {homeTeam}
                          </div>
                          <div className="px-4 text-2xl font-black tabular-nums tracking-tighter bg-muted/50 rounded-lg py-2 mx-2">
                            {match.homeScore} - {match.awayScore}
                          </div>
                          <div className={`text-center flex-1 ${!isWildDogsHome ? 'font-black text-primary' : 'font-semibold text-foreground'}`}>
                            {awayTeam}
                          </div>
                        </div>
                        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Target className="h-3 w-3" />
                          {match.location || 'Pista Local'}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/torneos">
                <Button variant="outline" className="w-full">
                  Ver Todos los Resultados
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12 border-b border-border/40 pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Noticias Recientes</h2>
              <p className="text-muted-foreground">Mantente al día con las novedades del club.</p>
            </div>
            <Link href="/torneos">
              <Button variant="ghost" className="hidden sm:flex group hover:bg-primary/10 hover:text-primary">
                <span>Ver Todas</span>
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-none bg-transparent">
                  <div className="h-64 bg-muted rounded-2xl animate-pulse mb-4" />
                  <div className="h-6 bg-muted rounded animate-pulse mb-3 w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-full mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </Card>
              ))}
            </div>
          ) : news.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {news.map((post: any) => (
                <motion.div key={post.id} variants={fadeIn}>
                  <Link href={`/torneos`}>
                    <div className="group cursor-pointer">
                      <div className="h-64 overflow-hidden rounded-2xl mb-6 relative shadow-lg">
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                        <img
                          src={post.imageUrl || heroImage}
                          alt={post.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{post.title}</h3>
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.excerpt || post.content}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-muted-foreground bg-card p-12 rounded-2xl border border-dashed border-border">
              <Calendar className="h-12 w-12 text-muted mx-auto mb-4" />
              <p>Las noticias sobre nuestra jauría aparecerán aquí muy pronto.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">Descubre Optima Wild Dogs</h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full" />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          >
            {[
              { href: "/categorias", icon: Trophy, title: "Categorías", desc: "Desde Sub 8 hasta Mayores. Conoce nuestros rosters." },
              { href: "/servicios", icon: Users, title: "Servicios", desc: "Planes de membresía, preparación física y horarios." },
              { href: "/torneos", icon: Calendar, title: "Torneos", desc: "Revisa el calendario, resultados y standings." },
              { href: "/contacto", icon: Target, title: "Contacto", desc: "Ponte en contacto para unirte al club." }
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeIn}>
                <Link href={item.href}>
                  <Card className="group p-8 border-border/40 hover:border-primary/50 bg-card/40 backdrop-blur-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 h-full overflow-hidden relative cursor-pointer">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-700" />
                    <div className="relative z-10 flex items-start gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={celebrationImage}
            alt="Wild Dogs Action Background"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            loading="lazy"
            decoding="async"
            width="1920"
            height="1080"
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-primary-foreground tracking-tight drop-shadow-md">
              ¿Listo para Unirte a la Manada?
            </h2>
            <p className="text-xl md:text-2xl font-light mb-10 max-w-3xl mx-auto text-primary-foreground/90 leading-relaxed drop-shadow">
              Desarrollo integral, entrenamiento personalizado y convicción pura para alcanzar tu máximo potencial dentro y fuera de la pista.
            </p>
            <Link href="/Unete">
              <Button
                size="lg"
                variant="outline"
                className="text-xl px-12 py-8 h-auto bg-black text-white hover:bg-black/80 hover:text-white border-0 hover:scale-105 transition-all duration-300 rounded-full shadow-2xl"
              >
                Inscripciones Abiertas
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
