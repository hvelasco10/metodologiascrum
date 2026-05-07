
## Sistema de administrador con permisos por sección

### Concepto

- **Solo el administrador** puede crear usuarios (email + contraseña).
- El **login no tendrá opción de registrarse**: solo formulario de inicio de sesión.
- Al crear cada usuario, el admin define **a qué secciones de la app tendrá acceso** mediante checkboxes (Dashboard, Tablero Scrum, Sprints, Backlog, Equipo, Informes).
- Las secciones sin permiso **no aparecen en la barra lateral** y **no son accesibles por URL** (redirige a "Sin acceso").

### Cómo se crea el primer admin

Como ya no hay registro público, necesitamos un admin inicial. Opciones:

- **Opción recomendada**: El primer usuario que crees mediante un formulario único de "Configurar administrador" (visible solo si no existe ningún admin todavía) se convierte en admin con acceso a todo. Después, ese formulario desaparece para siempre.
- Si ya tienes una cuenta creada en pasos anteriores, la promovemos a admin manualmente.

### Cambios en la base de datos

1. **Tabla `user_permissions`** con un registro por usuario y columnas booleanas:
   `dashboard`, `board`, `sprints`, `backlog`, `team`, `reports`
2. Función `has_permission(_user_id, _section)` (security definer) para evitar recursión en RLS
3. Política: cada usuario puede leer sus propios permisos; solo admin puede modificarlos
4. Trigger: al crear un usuario, se inserta su fila de permisos en `false` por defecto (el admin marca lo que corresponda)
5. **Quitar el trigger** que asignaba rol `developer` automáticamente — ahora el admin asigna todo

### Edge Function: `admin-create-user`

Necesaria porque crear usuarios desde el cliente requiere la `SERVICE_ROLE_KEY` (que nunca debe estar en el frontend).

- Verifica que quien llama es admin (valida JWT + consulta `user_roles`)
- Crea el usuario con `supabase.auth.admin.createUser` (email confirmado automáticamente)
- Inserta sus permisos según lo que envió el admin
- Devuelve el usuario creado

### Cambios en el frontend

**Login (`src/pages/Auth.tsx`)**
- Quitar tab de "Registrarse"
- Solo formulario de inicio de sesión
- Mensaje: "¿No tienes cuenta? Contacta al administrador"

**Página inicial de configuración (`src/pages/Setup.tsx`)** *(nueva)*
- Solo se muestra si no existe ningún admin en el sistema
- Formulario para crear el primer administrador
- Después redirige a login

**Hook `usePermissions()`** *(nuevo)*
- Devuelve `{ permissions, isAdmin, can(section) }`
- Carga desde `user_permissions` + `user_roles` en una sola consulta

**Sidebar (`AppSidebar.tsx`)**
- Filtra los items del menú según `permissions`
- El admin ve "Gestión de usuarios" como item adicional

**Rutas protegidas (`ProtectedRoute.tsx`)**
- Acepta prop `section` y verifica permiso antes de renderizar
- Si no tiene permiso → redirige a la primera sección a la que sí tiene acceso, o a página "Sin acceso"

**Página "Gestión de usuarios" (`src/pages/UsersAdmin.tsx`)** *(nueva, solo admin)*
- Lista todos los usuarios con su email y permisos actuales (badges por sección)
- Botón "Nuevo usuario": modal con email, contraseña, y checkboxes de las 6 secciones
- Botón "Editar permisos" por usuario: modal con los checkboxes para activar/desactivar
- Botón "Eliminar usuario" (con confirmación)
- El admin no puede quitarse permisos a sí mismo ni eliminarse

### Resumen de archivos

**Crear:**
- `supabase/functions/admin-create-user/index.ts`
- `src/hooks/usePermissions.tsx`
- `src/pages/Setup.tsx`
- `src/pages/UsersAdmin.tsx`
- `src/pages/NoAccess.tsx`

**Modificar:**
- `src/pages/Auth.tsx` (quitar registro)
- `src/components/AppSidebar.tsx` (filtrar por permisos + item admin)
- `src/components/ProtectedRoute.tsx` (chequeo por sección)
- `src/App.tsx` (rutas con guard por sección)

**Migración SQL** con tabla `user_permissions`, función `has_permission`, políticas RLS y eliminación del trigger anterior.
