# Guia de Entrega - Rubrica Grupo 6 Sistema Bancario

Esta guia sirve para presentar el proyecto contra los criterios de la rubrica grupal de 35 puntos.

## Funcionalidad General Del Sistema

- Login con JWT y redireccion segun rol.
- Panel administrativo para cuentas, usuarios administrativos, transacciones, tarjetas, prestamos, productos y perfil.
- Panel de cliente para operaciones, tarjetas propias, prestamos, productos, estados de cuenta y perfil.
- Recuperacion de contrasena con `/forgot-password` y `/reset-password?token=...`.
- Integracion API con servicios separados: Auth, Accounts, Transactions, Products y Reporting.

Comandos de verificacion:

```bash
cd "Frontend SistemaBancario"
npm run lint
npm run build
```

## Arquitectura Y Organizacion

- Frontend organizado por `src/features`, `src/shared`, `src/app/router` y `src/app/layouts`.
- Backend separado por servicios:
  - `Auth-Service`
  - `Account-Management-Service`
  - `Transaction-Processing-Service`
  - `Product-Management-Service`
  - `Reporting-Analytics-Service`
- Configuracion de API por variables `VITE_*` con fallback a localhost.
- Rutas privadas centralizadas en `ProtectedRoute` y validacion backend con `validateJWT` y `requireRole`.

## Estado, Hooks, API Y Errores

- Estado global de sesion con Zustand en `authStore`.
- Formularios con `react-hook-form` en login y recuperacion.
- Manejo centralizado de errores API en `shared/utils/apiError.js`.
- Servicios frontend por dominio: cuentas, transacciones, tarjetas, productos/prestamos y reporting.
- Estados de carga, mensajes con `react-hot-toast` y validaciones antes de enviar operaciones bancarias.

## Formularios, Routing Y Roles

- Rutas publicas: `/login`, `/forgot-password`, `/reset-password`, `/verify-email`.
- Rutas privadas bajo `/dashboard`.
- Proteccion por rol:
  - Admin/manager/ATM acceden a vistas administrativas permitidas.
  - Clientes no acceden al control de cuentas administrativas.
  - Reporting filtra estados de cuenta para que `USER_ROLE` solo consulte cuentas propias.
- Prestamos usan estados reales del backend: `solicitado`, `aprobado`, `rechazado`, `desembolsado`, `pagado`, `vencido`.

## Evidencia Git Y SCRUM

Evidencia Git encontrada en el repositorio:

- Rama principal de trabajo: `develop`.
- Ramas feature visibles: `feature/aroquel`, `feature/jjimenez`, `feature/jcruz`, `feature/rcana`, `feature/rrodriguez`.
- Autores visibles en `git shortlog -sn --all`:
  - `rcana-2021639`
  - `jcruz-2021644`
  - `rrodriguez-2023342`
  - `aroquel-2024082`
  - `jjimenez-2021647`

Comandos para mostrar evidencia:

```bash
git log --oneline --decorate -n 12
git branch --all
git shortlog -sn --all
```

Pendiente para el equipo: adjuntar capturas reales de dailies, planning o retro si existen. No se debe inventar evidencia SCRUM.

## Checklist De Demo

- Iniciar sesion con el admin semilla `adminb@sistemabancario.local` / `ADMINB`.
- Crear cliente desde control de cuentas y verificar que se crea cuenta bancaria.
- Realizar deposito como administrativo.
- Realizar transferencia/retiro como cliente.
- Solicitar estado de cuenta y verificar envio por correo/PDF.
- Crear o editar producto y comprarlo desde cliente.
- Solicitar prestamo como cliente y aprobar/rechazar/desembolsar como administrativo.
- Probar recuperacion de contrasena desde el login.
