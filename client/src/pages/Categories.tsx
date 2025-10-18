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

export default function Categories() {
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
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase">
              Categorías
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Seis categorías competitivas desde Sub 8 hasta Mayores
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="overflow-hidden hover-elevate active-elevate-2"
                data-testid={`category-card-${category.id}`}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-black text-primary mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.ageRange}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{category.description}</p>
                  <div className="mb-4 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm font-semibold mb-1">Objetivos:</p>
                    <p className="text-sm text-muted-foreground">{category.objectives}</p>
                  </div>
                  <Link href={`/categorias/${category.id}`}>
                    <Button className="w-full" variant="outline" data-testid={`button-view-${category.id}`}>
                      Ver Detalles
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Encuentra Tu Categoría</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ¿No estás seguro en qué categoría inscribirte? Contáctanos y te ayudaremos a encontrar el grupo perfecto según tu edad y nivel.
          </p>
          <Link href="/contacto">
            <Button size="lg" data-testid="button-contact-category">
              Contáctanos
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
