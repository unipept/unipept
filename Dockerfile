FROM node:26-alpine AS build
WORKDIR /src
COPY package.json yarn.lock ./
RUN npm install -g yarn@1.22.22 && yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
