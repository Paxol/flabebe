# Step 0 - install pnpm
FROM node:19 AS pnpm
RUN npm install -g pnpm

# Step 1 - install deps
FROM pnpm AS dependencies
WORKDIR /opt/app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Step 2 - build
FROM pnpm AS builder
WORKDIR /opt/app
COPY . .
COPY --from=dependencies /opt/app/node_modules ./node_modules

ENV DATABASE_URL=mysql://
ENV NEXTAUTH_URL=http://app.site
ENV NEXTAUTH_SECRET=
ENV GITHUB_CLIENT_ID=
ENV GITHUB_CLIENT_SECRET=
ENV S3_ACCESS_KEY=
ENV S3_SECRET_KEY=
ENV S3_BUCKET=
ENV S3_ENDPOINT=
ENV WEBHOOK_SECRET=

RUN pnpm prisma generate
RUN pnpm build

# Stage 3: Final image
FROM pnpm AS runner
ENV NODE_ENV=production

WORKDIR /opt/app
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/.next/standalone ./
COPY --from=builder /opt/app/.next/static ./.next/static

EXPOSE 3000

CMD node server.js
