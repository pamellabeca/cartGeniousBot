const { callOpenAI } = require("../../services/openAPI");
const ItemModel = require("../../models/Item/ItemModel");

class ItemController {
  async addToWishlist(req, res) {
    try {
      const { name } = req.body;

      const categoryWithEmoji = await new Promise((resolve) => {
        callOpenAI(
          `Categoria para "${name}"? Responda só com: 🛒mercearia, 🧼limpeza, 🍗proteínas, 🥛laticínios, 🔧utilidades, 🧴higiene, 🥤bebidas, 🍎frutas verduras e legumes ou 📦outros.`,
          (resposta) => resolve(resposta.trim().toLowerCase())
        );
      });

      const normalizeCategory = (category) => {
        return category
          .replace(/,/g, '') 
          .replace(/\s+/g, ' ') 
          .trim();
      };

      const categoryMapping = {
        "🛒mercearia": "mercearia",
        "🧼limpeza": "limpeza",
        "🍗proteínas": "proteínas",
        "🥛laticínios": "laticínios",
        "🔧utilidades": "utilidades",
        "🧴higiene": "higiene",
        "🥤bebidas": "bebidas",
        "🍎frutas verduras e legumes": "frutas verduras e legumes",
        "🍎frutas, verduras e legumes": "frutas verduras e legumes",
        "🍎frutas,verduras e legumes": "frutas verduras e legumes",
        "📦outros": "outros",
      };

      let categoryWithoutEmoji = categoryMapping[categoryWithEmoji];

      if(!categoryWithoutEmoji){
        const normalizedInput = normalizeCategory(categoryWithEmoji);
        categoryWithoutEmoji = Object.values(categoryMapping).find(
          cat => normalizeCategory(cat) === normalizedInput
        ) || normalizedInput.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, "").trim();
      }

      const nameExists = await ItemModel.DuplicatedItem(name);
      if (nameExists) {
        return res
          .status(409)
          .json({ message: "Item já existe na lista de compras." });
      }

      const item = await ItemModel.addToWishlist(name, categoryWithoutEmoji);

      if (!item.success) {
        return res.status(500).json({ error: "Erro ao adicionar item" });
      }

      res.status(200).json({
        message: `✅ ${name.toUpperCase()} ADICIONADO!\n\n📍 *Categoria*: ${categoryWithEmoji}`,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ItemController();
