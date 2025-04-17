# CartGeniusBot - Gerenciador Inteligente de Listas de Compras

O CartGeniusBot é um bot para Telegram que ajuda você a gerenciar suas listas de compras de forma inteligente, com categorização automática, relatórios detalhados e análises usando IA.

## ✨ Funcionalidades Principais

- **Adição inteligente de itens** com categorização automática via OpenAI
- **Controle completo** de quantidades e preços
- **Relatórios detalhados** por categoria e mensais
- **Análises comparativas** entre compras
- **Organização por categorias** com emojis visuais
- **Finalização de listas** com transferência automática de itens não comprados

## 🛠 Tecnologias Utilizadas

- **Backend**: Node.js, Express
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **IA**: OpenAI API (GPT-3.5)
- **Bot**: Telegraf (Telegram Bot API)
- **Deploy**: Ngrok (para desenvolvimento local)

## 📦 Estrutura do Projeto

```
CARTGENIOUSBOT/
├── .github/           # Configurações do GitHub
├── node_modules/      # Dependências do projeto
├── prisma/           # Configurações do Prisma ORM
├── scripts/          # Scripts auxiliares
├── src/
│   ├── config/       # Configurações do app
│   ├── controllers/  # Lógica dos endpoints
│   ├── models/       # Modelos de dados e acesso ao DB
│   ├── prompts/      # Templates de prompts para OpenAI
│   ├── routes/       # Definição de rotas
│   └── services/     # Serviços compartilhados
├── .env              # Variáveis de ambiente
├── .gitignore
├── bot.js            # Ponto de entrada do bot
├── package.json
└── server.js         # Ponto de entrada da API
```

## 🚀 Como Executar Localmente

1. **Pré-requisitos**:
   - Node.js (v18+)
   - PostgreSQL
   - Conta na OpenAI
   - Bot do Telegram criado via @BotFather

2. **Configuração**:
   ```bash
   git clone https://github.com/seu-usuario/cartgeniusbot.git
   cd cartgeniusbot
   npm install
   ```

3. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env` baseado no `.env.example`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/cartgenius?schema=public"
   TELEGRAM_TOKEN=seu_token_aqui
   OPENAI_API_KEY=sua_chave_aqui
   PORT=3000
   API_URL=http://localhost:3000
   ```

4. **Iniciar o servidor**:
   ```bash
   npm run dev
   ```

5. **Usar o Ngrok** (para desenvolvimento):
   ```bash
   ngrok http 3000
   ```
   Atualize `API_URL` no `.env` com a URL fornecida pelo Ngrok.

## 🤖 Comandos do Bot

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/add [item]` | Adiciona item à lista de desejos | `/add leite` |
| `/addCart [qtd] [nome] [preço]` | Adiciona ao carrinho | `/addCart 2 leite 4.50` |
| `/remove [qtd] [item]` | Remove item do carrinho | `/remove 1 leite` |
| `/total` | Mostra total da compra | `/total` |
| `/finalized` | Finaliza a compra atual | `/finalized` |
| `/categories` | Lista todas categorias | `/categories` |
| `/[categoria]` | Mostra itens de uma categoria | `/limpeza` |
| `/report [categoria]` | Relatório por categoria | `/report limpeza` |
| `/report mês` | Relatório mensal | `/report mês` |
| `/help` | Mostra todos comandos | `/help` |

## 📊 Exemplos de Uso

1. **Adicionando um item**:
   ```
   /add farinha de trigo
   ```
   Resposta:
   ```
   ✅ FARINHA DE TRIGO ADICIONADO!
   
   📍 Categoria: 🛒mercearia
   ```

2. **Adicionando ao carrinho**:
   ```
   /addCart 2 leite 4.50
   ```
   Resposta:
   ```
   🛍️ LEITE ADICIONADO NO CARRINHO!
   
   🔢 Quantidade: 2 unidades
   💲 Preço unitário: R$ 4.50
   🧮 Subtotal: R$ 9.00
   
   📌 Total da lista agora: R$ 9.00
   ```

3. **Relatório de categoria**:
   ```
   /report limpeza
   ```
   Resposta:
   ```
   🧼 RELATÓRIO LIMPEZA
   
   📊 Top 3 Comprados:
   1. Sabão em pó (comprado 2x)
   2. Desinfetante (comprado 1x)
   3. Esponja (comprado 1x)
   
   💸 Preço Médio:
   - Sabão em pó: R$ 12.50 (±5% vs anterior)
   - Desinfetante: R$ 8.90 (🔻10% vs anterior)
   
   💡 Dica da vez: 
   Compre desinfetante em embalagens maiores para economizar 15% no próximo mês.
   ```

## 📝 Modelo do Banco de Dados

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  items     Item[]
}

model Item {
  id          Int       @id @default(autoincrement())
  name        String
  category    Category  @relation(fields: [categoryId], references: [id])
  unitPrice   Float?
  quantity    Int?
  totalPrice  Float?
  purchased   Boolean   @default(false)
  list        ShoppingList @relation(fields: [listId], references: [id])
}

model ShoppingList {
  id          Int       @id @default(autoincrement())
  createdAt   DateTime  @default(now())
  finalizedAt DateTime?
  totalValue  Float?
  items       Item[]
}
```

## 🤝 Contribuição

Contribuições são bem-vindas! Siga esses passos:

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## ✉️ Contato

Pamella Silva - [Linkedin](https://www.linkedin.com/in/pamella-silva-dev/) - pamellarebecabispo@gmail.com
