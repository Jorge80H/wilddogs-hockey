import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// WhatsApp del club con mensaje prellenado para identificar leads de la web
export const WHATSAPP_URL =
  "https://wa.me/573143100208?text=Hola%2C%20vengo%20de%20la%20p%C3%A1gina%20web%20de%20Optima%20Wild%20Dogs%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20club%20%F0%9F%8F%92";

export function PublicNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/servicios", label: "Servicios" },
    { href: "/categorias", label: "Categorías" },
    { href: "/torneos", label: "Torneos" },
    { href: "/contacto", label: "Contacto" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md px-3 py-2 -ml-3">
              <picture>
                <source srcSet="/assets/logo.webp" type="image/webp" />
                <img src="/assets/logo.png" alt="Optima Wild Dogs Hockey Club" className="h-16 w-auto" width="64" height="64" />
              </picture>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-${link.label.toLowerCase()}`}>
                <div
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 ${location === link.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground"
                    }`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <a href="/login" data-testid="button-login">
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" data-testid="button-join">
              <Button size="sm">
                Únete al Club
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover-elevate active-elevate-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-menu-toggle"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`block px-4 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 ${location === link.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </div>
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t">
              <a href="/login" className="block" data-testid="button-mobile-login">
                <Button variant="outline" className="w-full">
                  Iniciar Sesión
                </Button>
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block" data-testid="button-mobile-join">
                <Button className="w-full">
                  Únete al Club
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
