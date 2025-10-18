import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Dumbbell, Trophy, Heart, Clock, DollarSign } from "lucide-react";

export default function Services() {
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

  const schedules = [
    { category: "Sub 8 y Sub 12", days: "Martes y Jueves", time: "4:00 PM - 5:30 PM" },
    { category: "Sub 14 y Sub 16", days: "Lunes, Miércoles y Viernes", time: "5:30 PM - 7:00 PM" },
    { category: "Sub 18 y Mayores", days: "Lunes, Miércoles y Viernes", time: "7:00 PM - 9:00 PM" },
    { category: "Preparación Física (Todas)", days: "Sábados", time: "9:00 AM - 11:00 AM" },
  ];

  const plans = [
    {
      name: "Plan Básico",
      price: "$180.000",
      period: "mensual",
      features: [
        "2 entrenamientos por semana",
        "Acceso a instalaciones",
        "Seguro deportivo",
        "Camiseta del club",
      ],
    },
    {
      name: "Plan Competitivo",
      price: "$280.000",
      period: "mensual",
      features: [
        "3 entrenamientos por semana",
        "Preparación física incluida",
        "Participación en torneos",
        "Uniforme completo",
        "Seguro deportivo",
      ],
      popular: true,
    },
    {
      name: "Plan Elite",
      price: "$380.000",
      period: "mensual",
      features: [
        "Entrenamientos ilimitados",
        "Preparación física personalizada",
        "Todos los torneos incluidos",
        "Kit completo de equipamiento",
        "Análisis de video",
        "Nutrición deportiva",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase">
              Servicios
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Programas de entrenamiento profesional para todas las edades y niveles
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Lo Que Ofrecemos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} data-testid={`service-card-${index}`}>
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <Card key={index} data-testid={`schedule-${index}`}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="font-bold text-lg">{schedule.category}</div>
                      <div className="text-muted-foreground">{schedule.days}</div>
                      <div className="font-mono text-primary md:text-right">{schedule.time}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">Planes de Membresía</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus objetivos deportivos. Todos incluyen seguro deportivo y acceso a instalaciones.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={plan.popular ? "border-primary border-2" : ""}
                data-testid={`plan-card-${index}`}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                    MÁS POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="/api/login">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      data-testid={`button-select-plan-${index}`}
                    >
                      Seleccionar Plan
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
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
          <a href="/api/login" data-testid="button-cta-enroll">
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
