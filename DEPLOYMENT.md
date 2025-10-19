# Guía de Deployment - Wild Dogs Hockey Club

## 📋 Pasos para subir a GitHub y desplegar en Netlify

### 1️⃣ Subir a GitHub

Ya tienes el repositorio inicializado. Ahora necesitas:

1. **Crear el repositorio en GitHub**:
   - Ve a https://github.com/new
   - Nombre: `wilddogs-hockey`
   - Descripción: "Wild Dogs Hockey Club - Full-stack web application"
   - Público
   - NO marques README, .gitignore ni license (ya los tienes)

2. **Conectar y hacer push**:
```bash
cd "m:\EMPLEADOS DIGITALES\CLIENTES\WILDDOGS_WEB\WildDogsHockey-1"
git remote add origin https://github.com/TU_USUARIO/wilddogs-hockey.git
git branch -M main
git push -u origin main
```

### 2️⃣ Configurar InstantDB

Tu app de InstantDB ya está creada:
- **App ID**: `27acc1e8-fce9-4800-a9cd-c769cea6844f`
- **Nombre**: WildDogs
- **Dashboard**: https://www.instantdb.com/dash?s=main&t=home&app=27acc1e8-fce9-4800-a9cd-c769cea6844f

#### Configurar Autenticación en InstantDB:

1. Ve al dashboard de InstantDB
2. Selecciona tu app "WildDogs"
3. Ve a la sección "Auth"
4. Habilita los métodos de autenticación que desees:
   - ✅ Email/Password
   - ✅ Magic Links
   - ✅ Google OAuth (opcional)

#### Configurar Schema en InstantDB:

El schema ya fue enviado al MCP de InstantDB. Para verificar o modificar:

1. Ve a la sección "Schema" en el dashboard
2. Verifica que existan estas entidades:
   - `users`
   - `playerProfiles`
   - `categories`
   - `coaches`
   - `newsPosts`
   - `tournaments`
   - `matches`
   - `payments`
   - `documents`
   - `contactSubmissions`

### 3️⃣ Desplegar en Netlify

#### Opción A: Deploy desde GitHub (Recomendado)

1. **Ir a Netlify**: https://app.netlify.com/

2. **Importar proyecto**:
   - Click en "Add new site"
   - Selecciona "Import an existing project"
   - Conecta con GitHub
   - Selecciona el repositorio `wilddogs-hockey`

3. **Configurar Build Settings**:
   ```
   Build command: npm run build
   Publish directory: dist/public
   ```

4. **Variables de Entorno**:
   Añade estas variables en "Site settings" → "Environment variables":
   ```
   VITE_INSTANT_APP_ID=27acc1e8-fce9-4800-a9cd-c769cea6844f
   ```

5. **Deploy**:
   - Click en "Deploy site"
   - Espera a que termine el build
   - Tu sitio estará disponible en `https://random-name.netlify.app`

6. **Configurar dominio personalizado** (opcional):
   - Ve a "Domain settings"
   - Añade tu dominio personalizado
   - Configura DNS según las instrucciones

#### Opción B: Deploy con Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Crear nuevo sitio
netlify init

# Deploy
netlify deploy --prod
```

### 4️⃣ Configuración Post-Deploy

#### Configurar URLs permitidas en InstantDB:

1. Ve al dashboard de InstantDB
2. En la sección "Auth" → "Allowed URLs"
3. Añade tu URL de Netlify:
   ```
   https://tu-sitio.netlify.app
   ```

#### Verificar funcionamiento:

1. Abre tu sitio en Netlify
2. Prueba el registro/login
3. Verifica que los datos se guarden en InstantDB

### 5️⃣ Variables de Entorno

Crea un archivo `.env` local (no lo subas a Git):

```env
# InstantDB
VITE_INSTANT_APP_ID=27acc1e8-fce9-4800-a9cd-c769cea6844f
```

En Netlify, configura las mismas variables en:
**Site settings → Environment variables**

### 6️⃣ Continuous Deployment

Netlify está configurado para auto-deploy:
- Cada push a `main` desplegará automáticamente
- Los pull requests crearán preview deployments

### 🔒 Seguridad

1. **Nunca subas a Git**:
   - Archivos `.env`
   - Credenciales
   - API keys

2. **Configurar Permissions en InstantDB**:
   - Las reglas de permisos ya están configuradas
   - Revísalas en el dashboard si es necesario

3. **CORS**:
   - InstantDB maneja CORS automáticamente
   - Asegúrate de configurar las URLs permitidas

### 📊 Monitoreo

- **Netlify Analytics**: Ver tráfico y performance
- **InstantDB Dashboard**: Ver datos y queries en tiempo real
- **Logs**: Netlify Functions logs para debugging

### 🚨 Troubleshooting

#### Error: "Cannot connect to InstantDB"
- Verifica que `VITE_INSTANT_APP_ID` esté configurado
- Revisa que la URL esté permitida en InstantDB

#### Error: "Build failed"
- Revisa los logs en Netlify
- Asegúrate de que todas las dependencias estén en `package.json`
- Verifica que el comando de build sea correcto

#### Error: "Authentication failed"
- Verifica que los métodos de auth estén habilitados en InstantDB
- Revisa las reglas de permisos

### 📚 Recursos

- [InstantDB Docs](https://www.instantdb.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [GitHub Actions](https://docs.github.com/en/actions)

### ✅ Checklist de Deployment

- [ ] Código subido a GitHub
- [ ] InstantDB app configurada con schema
- [ ] Autenticación habilitada en InstantDB
- [ ] Variables de entorno configuradas en Netlify
- [ ] Build exitoso en Netlify
- [ ] URLs permitidas configuradas en InstantDB
- [ ] Prueba de registro/login funcionando
- [ ] Datos guardándose correctamente
- [ ] Dominio personalizado configurado (opcional)
