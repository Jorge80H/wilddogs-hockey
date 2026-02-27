import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/instant";
import { id } from "@instantdb/react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
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

const contactFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  subject: z.string().min(3, "El asunto debe tener al menos 3 caracteres"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  useSEO({
    title: "Contacto",
    description: "Únete a la manada. Contáctanos en Optima Wild Dogs Hockey Club, Bogotá Colombia. Inscripciones abiertas para todas las edades.",
    url: "/contacto",
  });

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Submit contact form to InstantDB
      await db.transact([
        db.tx.contactSubmissions[id()].update({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
          isRead: false,
          createdAt: Date.now(),
        }),
      ]);

      // Send to n8n Webhook
      try {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...data,
              submittedAt: new Date().toISOString(),
              source: 'Wild Dogs Website'
            }),
          });
        }
      } catch (webhookError) {
        // Log error but don't fail the form submission since data is saved in DB
        console.error('Webhook sending failed:', webhookError);
      }

      toast({
        title: "Mensaje Enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });
      reset();
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu mensaje. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Contacto
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-light drop-shadow-md">
              ¿Tienes preguntas? Estamos aquí para ayudarte
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 -mt-32 -mr-32" />
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {/* Contact Form */}
            <motion.div variants={fadeIn} className="lg:col-span-2">
              <Card className="border-border/40 shadow-lg bg-card/40 backdrop-blur-sm">
                <CardHeader className="border-b border-border/40 pb-6 mb-6">
                  <CardTitle className="text-3xl font-black">Envíanos un Mensaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">Nombre Completo *</Label>
                        <Input
                          id="name"
                          data-testid="input-name"
                          className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                          {...register("name")}
                          placeholder="Juan Pérez"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          data-testid="input-email"
                          className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                          {...register("email")}
                          placeholder="juan@ejemplo.com"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold">Teléfono</Label>
                      <Input
                        id="phone"
                        data-testid="input-phone"
                        className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                        {...register("phone")}
                        placeholder="320 2373500"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive font-medium">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-semibold">Asunto *</Label>
                      <Input
                        id="subject"
                        data-testid="input-subject"
                        className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                        {...register("subject")}
                        placeholder="Consulta sobre inscripción"
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive font-medium">{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold">Mensaje *</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        data-testid="input-message"
                        className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors resize-none"
                        {...register("message")}
                        placeholder="Escribe tu mensaje aquí..."
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive font-medium">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-lg font-bold shadow-lg hover:shadow-primary/25 transition-all duration-300 group"
                      disabled={isSubmitting}
                      data-testid="button-submit-contact"
                    >
                      {isSubmitting ? "Enviando..." : (
                        <span className="flex items-center gap-2">
                          Enviar Mensaje
                          <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={fadeIn} className="space-y-6">
              <Card className="border-border/40 shadow-md bg-card/40 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="border-b border-border/40 pb-4 mb-4">
                  <CardTitle className="text-xl font-bold">Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold mb-1 group-hover:text-primary transition-colors">Dirección</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Carrera 22 No. 164 - 83<br />
                        Bogotá, Colombia
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold mb-1 group-hover:text-primary transition-colors">Teléfono</div>
                      <a
                        href="tel:+573202373500"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                      >
                        320 2373500
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold mb-1 group-hover:text-primary transition-colors">Email</div>
                      <a
                        href="mailto:info@optimawilddogs.com"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors block break-all"
                      >
                        info@optimawilddogs.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold mb-1 group-hover:text-primary transition-colors">Horarios de Atención</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Lunes a Viernes: 3:00 PM - 9:00 PM<br />
                        Sábados: 9:00 AM - 2:00 PM<br />
                        Domingos: Cerrado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 shadow-md bg-card/40 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-3">
                  <CardTitle className="text-lg font-bold">Ubicación</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="aspect-video w-full relative group">
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent pointer-events-none transition-colors duration-500 z-10" />
                    <iframe
                      src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Carrera%2022%20No.%20164%20-%2083+(Wild%20Dogs%20Hockey%20Club)&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Wild Dogs Location"
                      className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
