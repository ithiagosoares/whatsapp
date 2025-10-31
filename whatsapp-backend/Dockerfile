
# Use uma imagem base do Node.js que inclua as dependências do Puppeteer
FROM mcr.microsoft.com/playwright/python:v1.39.0-jammy

# Define o diretório de trabalho no container
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta que o app vai rodar
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"]
