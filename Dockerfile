FROM oven/bun:1 AS base
WORKDIR /usr/src/app

RUN npm i -g cross-env

COPY . /app

ARG VITE_API_URL
ARG VITE_AUTH_API_URL
ARG VITE_CLOUD_FRONT_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_API_URL=${VITE_AUTH_API_URL}
ENV VITE_CLOUD_FRONT_URL=${VITE_CLOUD_FRONT_URL}

FROM dependencies-env AS development-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app
RUN bun i --frozen-lockfile

FROM dependencies-env AS production-dependencies-env
COPY ./package.json bun.lock /app/
WORKDIR /app
RUN bun i --prod --frozen-lockfile

FROM dependencies-env AS build-env
COPY ./package.json bun.lock /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN bun build

FROM dependencies-env
COPY ./package.json bun.lock /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app

# run the app
USER bun
CMD ["bun", "start"]