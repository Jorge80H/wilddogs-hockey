import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">Wild Dogs Hockey Club</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Club de Hockey en Línea profesional en Bogotá, Colombia. Formación deportiva de excelencia para todas las edades.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/nosotros">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Nosotros
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/servicios">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Servicios
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/categorias">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Categorías
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/torneos">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Torneos
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Bogotá, Colombia
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href="tel:+573001234567"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href="mailto:info@wilddogshockey.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  info@wilddogshockey.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Síguenos</h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/wilddogshockey"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-muted hover-elevate active-elevate-2"
                data-testid="link-facebook"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/wilddogshockey"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-muted hover-elevate active-elevate-2"
                data-testid="link-instagram"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/wilddogshockey"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-muted hover-elevate active-elevate-2"
                data-testid="link-twitter"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Wild Dogs Hockey Club. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
