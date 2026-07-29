import { useState } from 'react';
import { useLocation } from 'wouter';
import { db } from '@/lib/instant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleMagicCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await db.auth.sendMagicCode({ email });
      toast({
        title: '¡Código enviado!',
        description: 'Revisa tu correo electrónico para el código de acceso.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el código',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    setIsLoading(true);
    try {
      // Sign in with magic code
      const result = await db.auth.signInWithMagicCode({ email, code });

      // After successful login, ensure user record exists in InstantDB
      // Check if user already exists
      const { data: existingUsers } = await db.queryOnce({
        users: {
          $: {
            where: { email: email },
          },
        },
      });

      // If user doesn't exist, create their titular (guardian) account
      if (!existingUsers?.users || existingUsers.users.length === 0) {
        await db.transact([
          db.tx.users[result.user.id].update({
            email: email,
            role: 'guardian', // cuenta-titular (padre o adulto)
            status: 'active',  // el login no requiere aprobación; la aprobación es por hijo
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
        ]);
      }

      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.',
      });

      // Redirigir al dashboard después de 1 segundo
      setTimeout(() => {
        setLocation('/');
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Código inválido o error al crear usuario',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="text-6xl">🏒</div>
          </div>
          <CardTitle className="text-2xl text-center">Optima Wild Dogs Hockey</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMagicCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar código de acceso'}
            </Button>
          </form>

          <div className="mt-6">
            <MagicCodeInput onVerify={handleVerifyCode} disabled={isLoading} />
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Recibirás un código de 6 dígitos en tu correo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MagicCodeInput({ onVerify, disabled }: { onVerify: (code: string) => void; disabled: boolean }) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onVerify(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="code">¿Ya tienes el código?</Label>
      <div className="flex gap-2">
        <Input
          id="code"
          type="text"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          disabled={disabled}
          className="text-center text-2xl tracking-widest"
        />
        <Button type="submit" disabled={disabled || code.length !== 6}>
          Verificar
        </Button>
      </div>
    </form>
  );
}
