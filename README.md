# grupo6-sistema-bancario-Frontend

## Despliegue con Docker

### Requisitos previos

Asegúrate de tener instalados [Docker](https://docs.docker.com/get-docker/) y [pnpm](https://pnpm.io/installation).

### Desarrollo local (sin Docker)

Instalar dependencias de cada microservicio backend:

```bash
pnpm --prefix Auth-Service install
pnpm --prefix Account-Management-Service install
pnpm --prefix Transaction-Processing-Service install
pnpm --prefix Product-Management-Service install
pnpm --prefix Reporting-Analytics-Service install
```

Iniciar el frontend en modo desarrollo:

```bash
pnpm run dev
```

### Docker (contenedores)

#### Si las imágenes ya existen (solo borraste los contenedores)

```bash
docker compose --env-file .env.docker up -d
```

#### Si también borraste las imágenes (necesitas reconstruirlas)

```bash
docker compose --env-file .env.docker up -d --build
```

Esto levanta los 8 servicios (PostgreSQL, MongoDB, 5 microservicios backend y frontend con Nginx).