FROM node:22-alpine AS base
ENV CI=true
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

COPY . .

RUN for dir in Auth-Service Account-Management-Service Transaction-Processing-Service Product-Management-Service Reporting-Analytics-Service; do \
      cd /app/$dir && pnpm install --prod && cd /app; \
    done

WORKDIR /app/Account-Management-Service
EXPOSE 3008
CMD ["node", "index.js"]
