import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Calendar, Target } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { NewsPost } from "@shared/schema";
import heroImage from "@assets/generated_images/Hockey_hero_action_shot_61944fec.png";
import celebrationImage from "@assets/generated_images/Team_celebration_photo_ef5bea2c.png";

export default function Landing() {
  const { data: news = [], isLoading: newsLoading } = useQuery<NewsPost[]>({
    queryKey: ["/api/news"],
  });

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
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight uppercase drop-shadow-lg">
            Wild Dogs
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Club de Hockey en Línea profesional en Bogotá, Colombia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/api/login" data-testid="button-hero-join">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-primary/90 backdrop-blur-sm border border-primary-border hover-elevate active-elevate-2"
              >
                Únete al Club
              </Button>
            </a>
            <Link href="/categorias" data-testid="link-hero-categories">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-background/20 backdrop-blur-sm text-white border-white/30 hover-elevate active-elevate-2"
              >
                Ver Categorías
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2" data-testid="stat-years">
                10+
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Años de Historia
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2" data-testid="stat-players">
                150+
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Jugadores Activos
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2" data-testid="stat-championships">
                25+
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Torneos Ganados
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2" data-testid="stat-categories">
                6
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Categorías
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Nuestra Misión</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Formar deportistas integrales a través del hockey en línea, promoviendo valores de trabajo en equipo, disciplina y excelencia deportiva. Brindar a nuestros jugadores las herramientas técnicas y tácticas necesarias para competir al más alto nivel mientras desarrollan habilidades para la vida.
            </p>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Noticias Recientes</h2>
            <Link href="/torneos">
              <Button variant="outline" data-testid="button-view-all-news">
                Ver Todas
              </Button>
            </Link>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded animate-pulse mb-3" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.slice(0, 3).map((post) => (
                <Card key={post.id} className="overflow-hidden hover-elevate active-elevate-2" data-testid={`news-card-${post.id}`}>
                  {post.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt || post.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <p>No hay noticias disponibles en este momento.</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Descubre Wild Dogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link href="/categorias">
              <Card className="p-8 hover-elevate active-elevate-2 h-full" data-testid="card-categories">
                <Trophy className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Categorías</h3>
                <p className="text-muted-foreground">
                  Conoce nuestras 6 categorías desde Sub 8 hasta Mayores con sus rosters y entrenadores.
                </p>
              </Card>
            </Link>

            <Link href="/servicios">
              <Card className="p-8 hover-elevate active-elevate-2 h-full" data-testid="card-services">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Servicios</h3>
                <p className="text-muted-foreground">
                  Descubre nuestros programas de entrenamiento, horarios y planes de membresía.
                </p>
              </Card>
            </Link>

            <Link href="/torneos">
              <Card className="p-8 hover-elevate active-elevate-2 h-full" data-testid="card-tournaments">
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Torneos</h3>
                <p className="text-muted-foreground">
                  Revisa el calendario de partidos, resultados y tablas de posiciones.
                </p>
              </Card>
            </Link>

            <Link href="/contacto">
              <Card className="p-8 hover-elevate active-elevate-2 h-full" data-testid="card-contact">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Contacto</h3>
                <p className="text-muted-foreground">
                  ¿Tienes preguntas? Contáctanos y te responderemos lo antes posible.
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para Unirte a la Manada?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Forma parte del mejor club de hockey en línea de Bogotá. Desarrolla tus habilidades, compite al más alto nivel y haz amigos para toda la vida.
          </p>
          <a href="/api/login" data-testid="button-cta-join">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-primary-foreground text-primary border-primary-border hover-elevate active-elevate-2"
            >
              Inscríbete Ahora
            </Button>
          </a>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Momentos Wild Dogs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="aspect-square overflow-hidden rounded-md">
              <img
                src={celebrationImage}
                alt="Team Celebration"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-md">
              <img
                src={heroImage}
                alt="Hockey Action"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-md hidden md:block">
              <img
                src={celebrationImage}
                alt="Team Spirit"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
