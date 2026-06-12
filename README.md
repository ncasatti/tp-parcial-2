# TP Grupal — Seguimiento de Tareas en Proyectos (Previo Parcial 2 · DDS)

Aplicación **full stack** para el seguimiento de tareas dentro de proyectos: permite crear tareas
asociadas a un proyecto, asignarlas a responsables válidos y controlar prioridad y estado siguiendo
reglas de negocio reales (no es un CRUD genérico).

> Este README es la **fuente de verdad** del grupo. A medida que construimos cada módulo,
> completamos las secciones marcadas con `🚧 TODO`.

---

## 1. Stack tecnológico

Decisión deliberada: **solo librerías vistas en la materia, JavaScript plano, sin abstracciones de más.**
Las versiones están fijadas para coincidir con lo enseñado (y poder explicarlas en el parcial).

### Backend
| Librería | Versión instalada | Para qué |
|---|---|---|
| `express` | **4.22.2** | Servidor HTTP, `Router()`, middlewares, error handler. Fijado en v4 (no v5) porque es lo de la cursada. |
| `sequelize` | **6.37.8** | ORM: modelos, asociaciones y consultas sobre la base. |
| `sqlite3` | **6.0.1** | Driver de SQLite (motor de base de datos en archivo). |
| `jsonwebtoken` | **9.0.3** | Generar y verificar JWT. |
| `bcrypt` | **6.0.0** | Hash real de contraseñas. |
| `cors` | **2.8.6** | Habilitar peticiones desde el frontend. |
| `jest` | **30.4.2** (dev) | Framework de pruebas. |
| `supertest` | **7.2.2** (dev) | Pruebas de endpoints HTTP. |

> Dev server con `node --watch` (nativo de Node 22), sin `nodemon`.

### Frontend
| Librería | Versión instalada | Para qué |
|---|---|---|
| `react` + `react-dom` | **18.3.1** | UI por componentes (fijado en v18, no v19). |
| `vite` | **8.0.16** | Bundler / dev server. |
| `react-router-dom` | **6.30.4** | Ruteo, rutas dinámicas (`useParams`), wildcard `*`. |
| `axios` | **1.17.0** | Capa de servicios HTTP. |

---

## 2. Estructura del repositorio

Monorepo con dos proyectos independientes:

```
tp-dds/
├── backend/          # API REST (Express + JWT + Sequelize/SQLite)
│   └── package.json
├── frontend/         # SPA (React + Vite)
│   └── package.json
├── .gitignore
└── README.md
```

> La estructura interna de `backend/src/` y `frontend/src/` se define en el siguiente paso
> (config de Sequelize / models / routes / controllers / services / middlewares en back;
> components / pages / services / context en front).

---

## 3. Requisitos previos

- **Node.js 18+** (probado con Node 22) y **npm**.

---

## 4. Cómo ejecutar

> ⚠️ El código de los módulos todavía no está implementado — esto documenta los comandos definitivos.

### Backend
```bash
cd backend
npm install          # instalar dependencias
npm run seed         # cargar datos semilla (4 proyectos, 5 usuarios, 15 tareas)  🚧 TODO
npm run dev          # levantar API con recarga (http://localhost:3000)           🚧 TODO
npm test             # correr las pruebas (Jest + Supertest)                       🚧 TODO
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # levantar la SPA (http://localhost:5173)
```

> El frontend espera la API en `http://localhost:3000` (configurable en la capa de servicios de Axios).

---

## 5. Persistencia (decisión documentada)

Usamos **Sequelize** (ORM) sobre **SQLite**, motor que guarda la base en un único archivo
(p. ej. `backend/database.sqlite`) y por lo tanto **conserva los datos al reiniciar** el backend.
Cada entidad (`usuarios`, `proyectos`, `tareas`, `historial_tareas`) se modela con Sequelize y sus
asociaciones (un proyecto tiene muchas tareas, una tarea pertenece a un proyecto y a un responsable,
el historial pertenece a una tarea y a un usuario). Las contraseñas se almacenan **hasheadas con
bcrypt** y nunca se exponen en las respuestas ni en el payload del JWT.

> El archivo `.sqlite` está ignorado en `.gitignore`: la base se regenera desde cero con el seed
> (`npm run seed`), así los datos de prueba son previsibles y reseteables.

---

## 6. Dominio: reglas de negocio

### Entidades (4 obligatorias)
- **usuarios** — `id, nombre, email, passwordHash, rol, activo`
- **proyectos** — `id, codigo, nombre, descripcion, estado, integrantes[]`
- **tareas** — `id, proyectoId, titulo, descripcion, responsableId, prioridad, estado, fechaLimite, createdAt`
- **historial_tareas** — `id, tareaId, usuarioId, accion, fechaHora, valorAnterior, valorNuevo`

### Valores permitidos (enums)
- **Prioridad:** `baja` · `media` · `alta` · `critica`
- **Estado de tarea:** `pendiente` · `en_progreso` · `bloqueada` · `finalizada` · `cancelada`
- **Estado de proyecto:** `activo` · `pausado` · `finalizado`
- **Roles:** `colaborador` · `lider` · `admin`

### Responsable válido
Una tarea solo puede asignarse a un usuario que **figure en `integrantes`** del proyecto asociado.

### Máquina de estados de la tarea
```
pendiente ──▶ en_progreso ──▶ bloqueada
                   │
                   └────────▶ finalizada
cualquier estado (no finalizada) ──▶ cancelada
```
- `finalizada` y `cancelada` son **estados terminales**: no se editan (salvo acción administrativa documentada).
- Una tarea está **vencida** si `fechaLimite < hoy` y su estado **no** es `finalizada` ni `cancelada`.

### Reglas según estado del proyecto
| Estado proyecto | Crear tareas | Editar tareas existentes |
|---|---|---|
| `activo` | ✅ | ✅ |
| `pausado` | ❌ | ✅ |
| `finalizado` | ❌ | ❌ (salvo acción admin puntual) |

> **Todas estas validaciones viven en el servicio del backend** (fuente de verdad). El frontend las
> replica solo para mejorar la experiencia (selects, mensajes), nunca como única validación.

---

## 7. Autenticación, roles y permisos

- Registro y login reales desde el frontend. El login exitoso devuelve un **JWT**.
- El JWT se envía en cada acción protegida como header `Authorization: Bearer <token>`.
- El payload del JWT **no** incluye contraseñas ni datos sensibles.

| Rol | Permisos |
|---|---|
| `colaborador` | Ver tareas asignadas; actualizar descripción; pasar **sus** tareas a `en_progreso` o `bloqueada`. |
| `lider` / `admin` | Crear tareas, reasignar, cambiar prioridad, finalizar o cancelar cualquier tarea del proyecto. |

Respuestas de seguridad en rutas de escritura:
- **401** si no se envía JWT.
- **403** si el usuario está autenticado pero no tiene permiso para la acción.

### Usuarios de prueba (del seed)
🚧 TODO — completar tras implementar el seed:

| Rol | Email | Contraseña |
|---|---|---|
| admin / líder | `🚧` | `🚧` |
| colaborador | `🚧` | `🚧` |

---

## 8. Endpoints principales (API)

| Método | Ruta | Descripción | Protegida |
|---|---|---|---|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Login, devuelve JWT | No |
| GET | `/api/proyectos` | Listar proyectos | Sí |
| GET | `/api/tareas?proyectoId=&responsableId=&estado=&prioridad=` | Listar tareas con filtros (+ `page`, `limit`, `sortBy`, `order`) | Sí |
| GET | `/api/tareas/resumen` | Resumen agregado (solo admin/líder) | Sí (admin) |
| GET | `/api/tareas/:id` | Detalle de una tarea | Sí |
| GET | `/api/tareas/:id/historial` | Historial de cambios de la tarea | Sí |
| POST | `/api/tareas` | Crear tarea | Sí (admin/líder) |
| PUT | `/api/tareas/:id` | Editar tarea | Sí |
| PATCH | `/api/tareas/:id/iniciar` | `pendiente → en_progreso` | Sí |
| PATCH | `/api/tareas/:id/bloquear` | `en_progreso → bloqueada` | Sí |
| PATCH | `/api/tareas/:id/finalizar` | `en_progreso → finalizada` | Sí (admin/líder) |
| PATCH | `/api/tareas/:id/cancelar` | `* → cancelada` | Sí (admin/líder) |

Códigos HTTP usados: `200, 201, 400, 401, 403, 404, 500`. Los errores responden JSON claro,
por ejemplo: `{ "error": "El responsable no pertenece al proyecto" }`.

---

## 9. Rutas del frontend

| Ruta | Pantalla | Protegida |
|---|---|---|
| `/login` | Login | No |
| `/register` | Registro | No |
| `/tareas` | Listado con filtros, paginación y orden | Sí |
| `/tareas/:id` | Detalle de tarea + historial | Sí |
| `/tareas/nueva` | Alta de tarea (form transaccional) | Sí (admin/líder) |
| `/tareas/:id/editar` | Edición de tarea | Sí |
| `/resumen` | Panel resumen administrativo | Sí (admin/líder) |
| `*` | Página 404 (ruta comodín) | — |

---

## 10. Testing

```bash
cd backend && npm test
```

Pruebas con **Jest + Supertest** (cada test valida status HTTP **y** cuerpo JSON). Cobertura mínima exigida:
login válido/inválido, listado con y sin filtros, detalle existente/inexistente, creación válida e
inválida (responsable fuera del proyecto, prioridad/estado no permitido), acceso sin JWT, acceso con
rol insuficiente, creación sobre proyecto finalizado/pausado, y transición de estado no permitida.

> Los datos de prueba deben ser previsibles y reseteables entre tests.

---

## 11. División de trabajo (recomendación)

Somos **4 integrantes**. La regla de oro: **primero acordamos juntos el "contrato"** (nombres exactos
de campos, enums, forma de los endpoints y mensajes de error) para que back y front puedan avanzar en
paralelo sin chocar en la integración. Recién después nos repartimos.

Una división posible, por **pares** que comparten vocabulario:

- **Par Backend**
  - *Infraestructura + Auth:* scaffold, JWT, register/login, middlewares (auth, autorización, validación, manejo de errores), seed de datos.
  - *Dominio (tareas):* servicio con las reglas (responsable válido, máquina de estados, vencidas, reglas de proyecto), controlador, rutas, historial y resumen. **Es el módulo más complejo** → para quien esté más cómodo con lógica de negocio.
- **Par Frontend**
  - *Infraestructura + Auth UI:* setup de Vite, React Router, contexto de autenticación, capa de servicios Axios, rutas protegidas, login/registro y la página 404.
  - *Pantallas de dominio:* listado + filtros + paginación, detalle + historial, formulario de alta/edición, acciones por rol y panel de resumen.

Notas:
- El **testing del backend** lo lidera quien hizo el dominio (conoce las reglas), con apoyo de quien hizo auth para los tests de permisos.
- Como en el parcial **cada uno responde sobre todo el sistema**, reservamos un momento de
  **cross-review** antes de entregar: cada integrante le explica su parte al resto.
- Esta división es una sugerencia: ajústenla al nivel y preferencia de cada uno.

---

## 12. Checklist de requisitos del TP

**Backend**
- [ ] 4 entidades persistidas (usuarios, proyectos, tareas, historial_tareas)
- [ ] `express.Router()` en archivo separado para tareas
- [ ] Middleware de autenticación JWT
- [ ] Middleware de autorización por rol / propiedad del recurso
- [ ] Middleware de validación de entrada
- [ ] Middleware de manejo de errores `(err, req, res, next)` al final
- [ ] Reglas de negocio en el **servicio** (no solo en controladores/forms)
- [ ] Máquina de estados completa + bloqueo de tareas finalizada/cancelada
- [ ] Filtros combinables + paginación (`page`, `limit`, `sortBy`, `order`) en backend
- [ ] Resumen admin (por estado, vencidas, por responsable, críticas)
- [ ] Historial de cambios (reasignación, prioridad, estado, edición)
- [ ] Cálculo de tareas vencidas
- [ ] Regla de proyecto pausado / finalizado
- [ ] Seed: ≥4 proyectos, 5 usuarios (1 líder/admin), 15 tareas en distintos estados
- [ ] Mensajes de error distintos por tipo de fallo
- [ ] Contraseñas hasheadas (bcrypt) + JWT sin datos sensibles

**Frontend**
- [ ] Login y registro
- [ ] Listado de tareas con filtros
- [ ] Detalle en `/tareas/:id` con `useParams`
- [ ] Form transaccional de alta/edición contra la API
- [ ] Acciones por rol (cambiar estado / finalizar / cancelar)
- [ ] Panel resumen para admin/líder
- [ ] Historial visible en el detalle
- [ ] Ruta comodín `*` (404)
- [ ] Contexto/hook para usuario + token + rol
- [ ] Rutas protegidas (no solo botones ocultos)
- [ ] Capa Axios separada por recurso
- [ ] Estados de carga / vacío / error / éxito

**Testing**
- [ ] ≥10 casos (happy + validación + permisos + transiciones inválidas) con Jest + Supertest

**Documentación**
- [ ] README con todos los puntos exigidos (este archivo, completado)

---

## 13. Limitaciones conocidas

🚧 TODO — documentar al cierre (decisiones, simplificaciones y faltantes menores).

---

## Entrega

- **Fecha límite:** sábado **13/06** 23:55 hs.
- Subir a Moodle (portafolio individual + entrega grupal). **No incluir `node_modules`.**
- Incluir `package.json`, código fuente, tests y esta documentación.
