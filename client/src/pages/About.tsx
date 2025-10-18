import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Heart, Target, Users } from "lucide-react";
import celebrationImage from "@assets/generated_images/Team_celebration_photo_ef5bea2c.png";

export default function About() {
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
    { name: "Carlos Rodríguez", role: "Presidente", experience: "15 años en hockey profesional" },
    { name: "Ana María García", role: "Directora Técnica", experience: "Entrenadora certificada nivel III" },
    { name: "Luis Fernando Torres", role: "Director Administrativo", experience: "MBA en Gestión Deportiva" },
    { name: "María Fernanda López", role: "Coordinadora Categorías Menores", experience: "Especialista en formación deportiva infantil" },
  ];

  const achievements = [
    { year: 2023, title: "Campeones Liga Nacional Sub 18" },
    { year: 2023, title: "Subcampeones Torneo Bogotá Mayores" },
    { year: 2022, title: "Campeones Copa Colombia Sub 16" },
    { year: 2022, title: "Mejor Club Formativo del Año" },
    { year: 2021, title: "Campeones Regionales Sub 14" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase">
              Nosotros
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Conoce la historia y los valores que nos hacen el mejor club de hockey en línea de Bogotá
            </p>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold mb-6">Nuestra Historia</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  El Club Wild Dogs nació en 2013 con un sueño: crear un espacio donde los jóvenes de Bogotá pudieran desarrollar su pasión por el hockey en línea en un ambiente profesional y familiar.
                </p>
                <p>
                  Fundado por un grupo de entusiastas del hockey que vieron la necesidad de formar un club que no solo se enfocara en la competencia, sino también en la formación integral de deportistas, Wild Dogs ha crecido hasta convertirse en uno de los clubes más respetados de Colombia.
                </p>
                <p>
                  A lo largo de más de 10 años, hemos formado cientos de jugadores, ganado numerosos campeonatos y, lo más importante, creado una comunidad unida por el amor al deporte.
                </p>
                <p>
                  Hoy contamos con 6 categorías competitivas, instalaciones de primer nivel y un cuerpo técnico altamente capacitado que trabaja día a día para mantener vivo el espíritu Wild Dogs.
                </p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden">
              <img
                src={celebrationImage}
                alt="Wild Dogs Team Celebration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Misión</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Formar deportistas integrales a través del hockey en línea, promoviendo valores de trabajo en equipo, disciplina y excelencia deportiva. Brindar a nuestros jugadores las herramientas técnicas y tácticas necesarias para competir al más alto nivel mientras desarrollan habilidades para la vida.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Visión</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Ser reconocidos como el club líder en formación de hockey en línea en Colombia, expandiendo nuestra influencia a nivel internacional y siendo referente en desarrollo deportivo juvenil. Aspiramos a que nuestros jugadores representen a Colombia en competencias internacionales y sean ejemplo de excelencia deportiva y humana.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="text-center" data-testid={`value-card-${index}`}>
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Junta Directiva</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {leadership.map((leader, index) => (
              <Card key={index} data-testid={`leader-card-${index}`}>
                <CardContent className="pt-6">
                  <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-center mb-1">{leader.name}</h3>
                  <p className="text-sm text-primary text-center mb-2">{leader.role}</p>
                  <p className="text-xs text-muted-foreground text-center">{leader.experience}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Logros y Reconocimientos</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className="hover-elevate active-elevate-2" data-testid={`achievement-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-mono text-muted-foreground mb-1">{achievement.year}</div>
                        <div className="text-lg font-semibold">{achievement.title}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Nuestras Instalaciones</h2>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong>Sede Principal:</strong> Contamos con una moderna pista de hockey en línea ubicada en el norte de Bogotá, con superficie de alta calidad, iluminación profesional y gradas para espectadores.
                  </p>
                  <p>
                    <strong>Área de Entrenamiento:</strong> Espacios dedicados para preparación física, técnica individual y análisis táctico con equipamiento de última generación.
                  </p>
                  <p>
                    <strong>Vestidores:</strong> Amplios vestidores separados por categorías, con casilleros personales y duchas de agua caliente.
                  </p>
                  <p>
                    <strong>Sala de Reuniones:</strong> Espacio equipado con pantallas y pizarras para charlas técnicas y análisis de video.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
