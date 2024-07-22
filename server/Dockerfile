FROM node:18

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

RUN npm add -g nodemon

COPY . .

EXPOSE 3000

CMD [ "npx", "pnpm", "run", "dev" ]