FROM node:20-alpine AS dependencies-env
RUN npm i -g pnpm
# required for packages scripts to work
RUN npm i -g cross-env
COPY . /app

ARG VITE_API_URL
ARG VITE_API_AUTH_URL
ARG VITE_CLOUD_FRONT_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_AUTH_URL=${VITE_API_AUTH_URL}
ENV VITE_CLOUD_FRONT_URL=${VITE_CLOUD_FRONT_URL}
ENV NODE_OPTIONS="--experimental-modules"

FROM dependencies-env AS development-dependencies-env
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN pnpm i --frozen-lockfile

FROM dependencies-env AS production-dependencies-env
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN pnpm i --prod --frozen-lockfile

FROM dependencies-env AS build-env
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN pnpm build

FROM dependencies-env
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["pnpm", "start"]