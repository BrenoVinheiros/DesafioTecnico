# Utiliza a imagem oficial do Node.js como base
FROM node:16

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de requisitos e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código do frontend para o container
COPY . .

# Compila o aplicativo React
RUN npm run build

# Utiliza uma imagem do Nginx para servir a aplicação
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta que o Nginx vai rodar
EXPOSE 80

# Comando para rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]
