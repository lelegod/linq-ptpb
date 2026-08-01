# Express backend (src/) for Railway — do not use for the Next.js web/ app.
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV npm_config_update_notifier=false

# Install deps first for better layer caching
COPY package.json package-lock.json ./
# Production install — tsx lives in dependencies for `npm start`
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src

# Railway injects PORT
EXPOSE 3000

CMD ["npm", "start"]
