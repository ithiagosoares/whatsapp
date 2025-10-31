# Use a imagem oficial do Node.js com suporte para o Puppeteer
FROM ghcr.io/puppeteer/puppeteer:22.9.0

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o resto dos arquivos da aplicação para o diretório de trabalho
COPY . .

# Expõe a porta que o nosso servidor Express vai usar
EXPOSE 3001

# Comando para iniciar a aplicação quando o container for executado
CMD [ "node", "index.js" ]
