

FROM node:18-alpine AS build

RUN npm install -g pnpm

WORKDIR /app


# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile



# Copy the rest of the code
COPY . .


ARG VITE_API_URL=http://localhost:3000

# Build the app
RUN pnpm build


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1

COPY --from=build /app/dist/ /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
