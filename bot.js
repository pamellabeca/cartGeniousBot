require("dotenv").config();
const axios = require("axios");
const { Telegraf } = require("telegraf");

const token = process.env.TELEGRAM_TOKEN;
const API_URL = process.env.API_URL;

const bot = new Telegraf(token);

bot.command("add", async (ctx) => {
  try {
    const itemName = ctx.message.text.split(" ").slice(1).join(" ");

    if (!itemName) {
      return await ctx.reply(
        "Por favor, informe o nome do item após o /add. Ex: /add farinha"
      );
    }

    const response = await axios.post(
      `${API_URL}/add`,
      {
        name: itemName,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    await ctx.reply(response.data.message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    await ctx.reply(
      "❌ Erro ao adicionar item. Os desenvolvedores foram notificados."
    );
  }
});

bot.command("addCart", async (ctx) => {
  const args = ctx.message.text.split(" ");

  const quantity = args[1];
  const unitPrice = args[args.length - 1];
  const name = args.slice(2, args.length - 1).join(" ");

  if (!quantity || !name || !unitPrice)
    return ctx.reply("Use: /addCart quantidade nome preço");

  try {
    const response = await axios.put(
      `${API_URL}/addCart`,
      {
        quantity: parseInt(quantity),
        name,
        unitPrice: parseFloat(unitPrice.replace(",", ".")),
      },
      { headers: { "Content-Type": "application/json" } }
    );

    ctx.reply(response.data.message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    await ctx.reply(
      "❌ Erro ao adicionar item. Os desenvolvedores foram notificados."
    );
  }
});

bot.command("remove", async (ctx) => {
  const args = ctx.message.text.split(" ");

  const quantity = args[1];
  const name = args.slice(2).join(" ");

  if (!quantity || !name)
    return ctx.reply("Use: /addCart quantidade nome preço");

  try {
    const response = await axios.delete(`${API_URL}/remove`, {
      data: { quantity: parseInt(quantity), name },
      headers: { "Content-Type": "application/json" },
    });

    ctx.reply(response.data.message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    await ctx.reply(
      "❌ Erro ao adicionar item. Os desenvolvedores foram notificados."
    );
  }
});

bot.command("total", async (ctx) => {
  try {
    const response = await axios.get(`${API_URL}/total`);

    ctx.reply(response.data.message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    await ctx.reply(
      "❌ Erro ao adicionar item. Os desenvolvedores foram notificados."
    );
  }
});

bot.command("finalized", async (ctx) => {
  try {
    const response = await axios.get(`${API_URL}/finalized`);

    ctx.reply(response.data.message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    await ctx.reply(
      "❌ Erro ao adicionar item. Os desenvolvedores foram notificados."
    );
  }
});

bot.command("report", async (ctx) => {
  try {
    const param = ctx.message.text.split(" ").slice(1).join(" ");

    if (!param) {
      return await ctx.reply(
        "Por favor, especifique o tipo de relatório: '/report mês' ou '/report [categoria]'"
      );
    }

    if (param.toLowerCase() !== "mês") {
      `${API_URL}/report?category=${param}`;
    }

    const response = await axios.get(`${API_URL}/report`);

    if (response.data && response.data.report) {
      await ctx.reply(response.data.report, { parse_mode: "Markdown" });
    } else {
      await ctx.reply("Nenhum dado encontrado para gerar o relatório.");
    }
  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    await ctx.reply(
      "❌ Erro ao adicionar item. Os desenvolvedores foram notificados."
    );
  }
});

bot.command("categories", async (ctx) => {
  try {
    const response = await axios.get(`${API_URL}/categories`);

    ctx.reply(response.data.message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    await ctx.reply(
      "❌ Erro ao adicionar item. Os desenvolvedores foram notificados."
    );
  }
});

bot.hears(
  /^\/(?!add|addCart|remove|total|finalizar|finalized|categories|report)(.+)/,
  async (ctx) => {
    const categoryName = ctx.message.text.slice(1);

    try {
      const response = await axios.get(`${API_URL}/categories/${categoryName}`);

      ctx.reply(response.data.message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("ERRO DETALHADO:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      await ctx.reply(
        "❌ Erro ao adicionar item. Os desenvolvedores foram notificados."
      );
    }
  }
);

bot.command("comandos", async (ctx) => {
  const helpMessage = `
📝 *Lista de Comandos Disponíveis*:

*/add [nome do item]* - Adiciona um item à lista de compras
Ex: \`/add farinha de trigo\`

*/addCart [quantidade] [nome] [preço]* - Adiciona item ao carrinho com quantidade e preço
Ex: \`/addCart 2 leite 4.50\`

*/remove [quantidade] [nome]* - Remove uma quantidade de um item da lista
Ex: \`/remove 1 leite\`

*/total* - Mostra o total da compra e itens no carrinho

*/finalized* - Finaliza a compra e mostra o valor total

*/report [categoria]* - Gera relatório por categoria
Ex: \`/report limpeza\`

*/report mês* - Gera relatório mensal

*/categories* - Lista todas as categorias disponíveis

*/[nome da categoria]* - Mostra itens de uma categoria específica
Ex: \`/limpeza\`

*/help* ou */comandos* - Mostra esta mensagem de ajuda
  `;

  await ctx.reply(helpMessage, { parse_mode: "Markdown" });
});

bot
  .launch()
  .then(() => console.log("Bot iniciado com sucesso!"))
  .catch((err) => console.error("Falha ao iniciar bot:", err));

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  if (text.startsWith("/")) {
    await ctx.reply(
      "Comando não reconhecido. Digite /help para ver os comandos disponíveis."
    );
  }
  console.log("Mensagem de texto recebida:", text);
});
