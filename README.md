# Freebets

Aplicação para gerenciamento de freebets, com **Node.js**, **MongoDB Atlas** e **React** no frontend.

---

## 🚀 Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

- [Node.js](https://nodejs.org/) (v16 ou superior recomendado)  
- [npm](https://www.npmjs.com/)  
- [MongoDB Atlas](https://www.mongodb.com/atlas) (para criar seu cluster e obter a connection string)  

---

## ⚙️ Configuração do MongoDB

1. Crie um servidor no **MongoDB Atlas**.  
2. Copie sua **connection string**.  
3. Crie um arquivo `.env` na pasta raiz `/Freebets`.  

### Exemplo de `.env`
```env
PORT=3000
MONGO_URI="mongodb+srv://user:password@database.zgzqjvm.mongodb.net/?retryWrites=true&w=majority&appName=AppName"
```

## 📦 Instalação

Clone este repositório e instale as dependências.

## Backend
```
cd freebets
npm install
```

## Frontend
```
cd freebets/frontend
npm install
```

## ▶️ Executando o Projeto
## Backend
```
cd freebets
node server.js
```

## Frontend
```
cd freebets/frontend
npm start
```

## 🔧 Ajustes a Fazer

Os responsáveis das contas estão configurados em hardcode.
Em versões futuras será implementado suporte em softcode.