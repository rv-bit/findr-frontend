# FROM node:20-alpine AS dependencies-env
# RUN npm i -g pnpm
# # required for packages scripts to work
# RUN npm i -g cross-env
# COPY . /app

# ARG VITE_API_URL
# ARG VITE_API_AUTH_URL
# ARG VITE_CLOUD_FRONT_URL
# ENV VITE_API_URL=${VITE_API_URL}
# ENV VITE_API_AUTH_URL=${VITE_API_AUTH_URL}
# ENV VITE_CLOUD_FRONT_URL=${VITE_CLOUD_FRONT_URL}
# ENV NODE_ENV=production

# FROM dependencies-env AS development-dependencies-env
# COPY ./package.json pnpm-lock.yaml /app/
# WORKDIR /app
# RUN pnpm i --frozen-lockfile

# FROM dependencies-env AS production-dependencies-env
# COPY ./package.json pnpm-lock.yaml /app/
# WORKDIR /app
# RUN pnpm i --prod --frozen-lockfile

# FROM dependencies-env AS build-env
# COPY ./package.json pnpm-lock.yaml /app/
# COPY --from=development-dependencies-env /app/node_modules /app/node_modules
# WORKDIR /app
# RUN pnpm build

# FROM dependencies-env
# COPY ./package.json pnpm-lock.yaml /app/
# COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# COPY --from=build-env /app/build /app/build
# WORKDIR /app
# CMD ["pnpm", "start"]

# Use full Node image (not Alpine) to avoid missing dependencies
FROM node:20 AS build-env

# Install PNPM globally
RUN npm i -g pnpm

# Set working directory
WORKDIR /app

# Define build-time arguments
ARG VITE_API_URL
ARG VITE_API_AUTH_URL
ARG VITE_CLOUD_FRONT_URL

# Set environment variables from arguments
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_AUTH_URL=${VITE_API_AUTH_URL}
ENV VITE_CLOUD_FRONT_URL=${VITE_CLOUD_FRONT_URL}

# Copy package.json & lock file first (to optimize caching)
COPY ./package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy remaining files
COPY . .

# Build the project
RUN pnpm build

# ---- PRODUCTION IMAGE ----
FROM node:20 AS prod-env

WORKDIR /app

# Define runtime environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_AUTH_URL=${VITE_API_AUTH_URL}
ENV VITE_CLOUD_FRONT_URL=${VITE_CLOUD_FRONT_URL}

# Copy only necessary files from the build stage
COPY --from=build-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
COPY --from=build-env /app/package.json ./package.json

# Start the application
CMD ["pnpm", "start"]
