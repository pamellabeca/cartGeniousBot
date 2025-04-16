const CategoryModel = require("../../models/Category/CategoryModel");

class CategoryController {
  async listAll(req, res) {
    try {
      const emojiMap = {
        mercearia: "🛒",
        limpeza: "🧼",
        proteínas: "🍗",
        laticinios: "🥛",
        utilidades: "🔧",
        higiene: "🧴",
        bebidas: "🥤",
        "frutas verduras e legumes": "🍎",
        outros: "📦",
      };

      const result = await CategoryModel.listAll();

      if (result.success === false) {
        return res.status(404).json({ error: result.error });
      }

      const formatted = result.categories.map((category) => {
        const emoji = emojiMap[category.name] || "";
        const nomeFormatado = `${emoji} ${category.name}`;
        const quantidade = category._count.items;
        const plural = quantidade === 1 ? "item" : "itens";

        return `${nomeFormatado} (${quantidade} ${plural})`;
      });

      res.status(200).json({message: formatted.join('\n')});
    } catch (error) {
      console.log(error);
    }
  }

  async categoryInformations(req, res) {
    try {
      const { name } = req.params;

      const emojiMap = {
        mercearia: "🛒",
        limpeza: "🧼",
        proteínas: "🍗",
        laticinios: "🥛",
        utilidades: "🔧",
        higiene: "🧴",
        bebidas: "🥤",
        "frutas verduras e legumes": "🍎",
        outros: "📦",
      };

      const result = await CategoryModel.categoryInformations(name);

      if (result.success === false) {
        return res.status(404).json({ error: result.error });
      }

      const categories = result.categories;
      const items = result.items;

      const emoji = emojiMap[categories.name] || "";
      const formattedCategory = `${emoji} ${categories.name.toUpperCase()}`;

      const formattedItems = items
        .map((item) => {
          return `- ${item.name}`;
        })
        .join("\n\n        ");

      res.status(200).json({
        message: `${formattedCategory} (Não comprados)\n\n        ${formattedItems}`,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new CategoryController();
