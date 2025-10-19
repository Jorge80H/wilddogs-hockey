# 🔐 Configuración de Autenticación InstantDB

## ✅ Cambios Realizados

### 1. Página de Login Creada
- **Archivo**: `client/src/pages/Login.tsx`
- **Características**:
  - Login con Magic Code (código por email)
  - No requiere contraseñas
  - Interfaz moderna con Shadcn UI
  - Validación de código de 6 dígitos

### 2. App.tsx Actualizado
- Integración con `db.useAuth()` de InstantDB
- Rutas protegidas automáticamente
- Redirección a login si no está autenticado

### 3. InstantDB Configurado
- SDK instalado: `@instantdb/react`
- Configuración en: `client/src/lib/instant.ts`
- App ID: `27acc1e8-fce9-4800-a9cd-c769cea6844f`

## 🚀 Pasos para Activar la Autenticación

### Paso 1: Configurar Magic Codes en InstantDB

1. **Ve al Dashboard de InstantDB**:
   https://www.instantdb.com/dash?app=27acc1e8-fce9-4800-a9cd-c769cea6844f

2. **Habilitar Magic Codes**:
   - Click en la pestaña **"Auth"** (menú izquierdo)
   - Busca **"Magic Code"** o **"Email"**
   - Activa el toggle para habilitar Magic Codes
   - Guarda los cambios

### Paso 2: Configurar Email Sender (Opcional)

Por defecto, InstantDB envía emails desde su dominio. Para personalizar:

1. En el dashboard, ve a **"Settings"** → **"Emails"**
2. Configura tu propio servicio de email (opcional)

### Paso 3: Agregar URLs Permitidas

1. En **"Auth"** → busca **"Allowed redirect URLs"** o **"Authorized domains"**
2. Agrega estas URLs:
   ```
   https://tu-sitio.netlify.app
   http://localhost:5000
   http://localhost:3000
   ```

### Paso 4: Probar la Autenticación

1. Abre tu aplicación (local o en Netlify)
2. Ve a `/login`
3. Ingresa tu email
4. Recibirás un código de 6 dígitos
5. Ingresa el código para iniciar sesión

## 🔄 Flujo de Autenticación

```
Usuario → Ingresa email → InstantDB envía código →
Usuario ingresa código → InstantDB valida → Usuario autenticado
```

## 📝 Cómo Funciona

### En el Código:

```typescript
// Enviar código de acceso
await db.auth.sendMagicCode({ email });

// Verificar código e iniciar sesión
await db.auth.signInWithMagicCode({ email, code });

// Verificar estado de autenticación
const { user, isLoading } = db.useAuth();

// Cerrar sesión
await db.auth.signOut();
```

### Componentes de UI:

```typescript
// Mostrar contenido solo para usuarios autenticados
<db.SignedIn>
  <Dashboard />
</db.SignedIn>

// Mostrar contenido solo para usuarios no autenticados
<db.SignedOut>
  <Login />
</db.SignedOut>
```

## 🎯 Integración con tu App

Tu aplicación ahora:

✅ Usa InstantDB para autenticación
✅ Tiene página de login en `/login`
✅ Protege rutas automáticamente
✅ Redirige a login si no está autenticado
✅ No requiere contraseñas

## 🔒 Permisos en InstantDB

Los permisos ya están configurados en tu app de InstantDB:

- **users**: Usuarios pueden ver/editar su propio perfil
- **playerProfiles**: Jugadores pueden editar su propio perfil
- **categories**: Todos pueden ver (solo admins editan)
- **tournaments**: Todos pueden ver
- **payments**: Usuarios solo ven sus propios pagos
- **documents**: Usuarios solo ven sus propios documentos

## 🧪 Testing Local

1. **Iniciar app localmente**:
   ```bash
   cd "m:\EMPLEADOS DIGITALES\CLIENTES\WILDDOGS_WEB\WildDogsHockey-1"
   npm run dev
   ```

2. **Abrir en navegador**:
   http://localhost:5000/login

3. **Probar login**:
   - Ingresa tu email
   - Revisa tu bandeja de entrada
   - Ingresa el código de 6 dígitos

## 🌐 En Producción (Netlify)

Una vez que hagas push a GitHub, Netlify desplegará automáticamente con:

- ✅ Variable `VITE_INSTANT_APP_ID` configurada
- ✅ Build automático
- ✅ Autenticación funcionando

## 🆘 Troubleshooting

### No recibo el email con el código

1. Revisa spam/correo no deseado
2. Verifica que Magic Codes esté habilitado en InstantDB
3. Revisa que el email sea válido

### Error: "Auth is not enabled"

- Ve al dashboard de InstantDB
- Verifica que Magic Codes esté habilitado en la sección Auth

### Error: "Unauthorized domain"

- Agrega tu URL de Netlify a las URLs permitidas en InstantDB

### El código no funciona

- El código expira después de 15 minutos
- Solicita un nuevo código
- Verifica que estés usando el email correcto

## 📚 Recursos

- [InstantDB Auth Docs](https://www.instantdb.com/docs/auth)
- [Magic Codes Docs](https://www.instantdb.com/docs/auth/magic-codes)
- [Tu Dashboard](https://www.instantdb.com/dash?app=27acc1e8-fce9-4800-a9cd-c769cea6844f)

## ✅ Checklist de Configuración

- [ ] Magic Codes habilitado en InstantDB dashboard
- [ ] URLs permitidas configuradas (localhost + Netlify)
- [ ] Variable `VITE_INSTANT_APP_ID` en Netlify
- [ ] Código pusheado a GitHub
- [ ] Deploy exitoso en Netlify
- [ ] Prueba de login funcionando
- [ ] Email de código recibido correctamente

¡Listo! Tu autenticación con InstantDB está configurada. 🎉
