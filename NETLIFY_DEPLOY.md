# 🚀 Deploy a Netlify - Wild Dogs Hockey

## Repositorio en GitHub
✅ **Tu código está aquí**: https://github.com/Jorge80H/wilddogs-hockey

## Pasos para Deploy en Netlify

### 1. Ir a Netlify
Abre: https://app.netlify.com/

### 2. Importar desde GitHub

1. Click en **"Add new site"** (botón azul)
2. Selecciona **"Import an existing project"**
3. Conecta con **GitHub**
4. Busca y selecciona: **`Jorge80H/wilddogs-hockey`**

### 3. Configurar Build Settings

En la pantalla de configuración, usa estos valores:

```
Base directory: (dejar vacío)
Build command: npm run build
Publish directory: dist/public
Functions directory: dist
```

### 4. Agregar Variables de Entorno

Antes de hacer deploy, click en **"Add environment variables"** y agrega:

| Key | Value |
|-----|-------|
| `VITE_INSTANT_APP_ID` | `27acc1e8-fce9-4800-a9cd-c769cea6844f` |

### 5. Deploy

1. Click en **"Deploy wilddogs-hockey"**
2. Espera 2-3 minutos mientras hace el build
3. Tu sitio estará disponible en una URL como: `https://wilddogs-hockey-abc123.netlify.app`

### 6. Configurar InstantDB

Una vez que tengas tu URL de Netlify, ve al dashboard de InstantDB:

**Dashboard**: https://www.instantdb.com/dash?app=27acc1e8-fce9-4800-a9cd-c769cea6844f

#### Configurar Autenticación:
1. Ve a la sección **"Auth"**
2. Habilita los métodos que necesites:
   - ✅ **Email/Password**
   - ✅ **Magic Links**
   - ✅ **Google OAuth** (opcional)

#### Agregar URL permitida:
1. En **"Auth"** → **"Allowed URLs"**
2. Agrega tu URL de Netlify:
   ```
   https://tu-sitio.netlify.app
   ```

### 7. Probar tu Sitio

1. Abre tu URL de Netlify
2. Prueba el registro de usuarios
3. Verifica que la autenticación funcione
4. Revisa que los datos se guarden en InstantDB

### 8. Configurar Dominio Personalizado (Opcional)

Si tienes un dominio:

1. En Netlify, ve a **"Domain settings"**
2. Click en **"Add custom domain"**
3. Ingresa tu dominio: `wilddogs.com`
4. Sigue las instrucciones para configurar DNS

No olvides agregar el dominio personalizado también en InstantDB!

## 🔄 Actualizaciones Automáticas

Netlify está configurado para auto-deploy:
- Cada vez que hagas `git push` a la rama `main`
- Netlify detectará los cambios
- Y desplegará automáticamente

## 🔍 Verificar Build Logs

Si hay problemas:
1. Ve a **"Deploys"** en Netlify
2. Click en el deploy fallido
3. Revisa los logs para ver el error

## ✅ Checklist de Deployment

- [x] Código en GitHub: https://github.com/Jorge80H/wilddogs-hockey
- [ ] Proyecto importado en Netlify
- [ ] Variable `VITE_INSTANT_APP_ID` configurada
- [ ] Build exitoso
- [ ] Sitio desplegado y funcionando
- [ ] Autenticación habilitada en InstantDB
- [ ] URL de Netlify agregada a InstantDB
- [ ] Prueba de registro/login funcionando
- [ ] Dominio personalizado configurado (opcional)

## 📊 Monitoreo

### Netlify Analytics
- Ve a **"Analytics"** en tu sitio de Netlify
- Revisa tráfico, performance, y errores

### InstantDB Dashboard
- Monitorea queries en tiempo real
- Revisa datos de usuarios
- Dashboard: https://www.instantdb.com/dash?app=27acc1e8-fce9-4800-a9cd-c769cea6844f

## 🆘 Problemas Comunes

### Error: "Build failed"
- Revisa que las variables de entorno estén correctas
- Verifica los logs de build en Netlify
- Asegúrate que `package.json` tenga todas las dependencias

### Error: "Cannot connect to InstantDB"
- Verifica que `VITE_INSTANT_APP_ID` esté configurado
- Revisa que la URL esté en "Allowed URLs" de InstantDB

### Error: "Authentication failed"
- Asegúrate que los métodos de auth estén habilitados en InstantDB
- Verifica que la URL de tu sitio esté permitida

## 🎉 ¡Listo!

Una vez completado, tu aplicación estará:
- 🌐 Live en Internet
- 🔄 Auto-deploy con cada push
- 🔒 Autenticación configurada
- 💾 Base de datos en tiempo real

**Links importantes:**
- GitHub: https://github.com/Jorge80H/wilddogs-hockey
- InstantDB Dashboard: https://www.instantdb.com/dash?app=27acc1e8-fce9-4800-a9cd-c769cea6844f
- Netlify: https://app.netlify.com/
