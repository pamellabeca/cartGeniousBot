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
        return category.replace(/,/g, "").replace(/\s+/g, " ").trim();
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

      if (!categoryWithoutEmoji) {
        const normalizedInput = normalizeCategory(categoryWithEmoji);
        categoryWithoutEmoji =
          Object.values(categoryMapping).find(
            (cat) => normalizeCategory(cat) === normalizedInput
          ) ||
          normalizedInput
            .replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, "")
            .trim();
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

  async addToCart(req, res) {
    try {
      const { quantity, name, unitPrice } = req.body;

      const result = await ItemModel.addToCart({
        quantity: Number(quantity),
        name,
        unitPrice: Number(unitPrice),
      });

      if (!result.status) {
        return res.status(400).json({ error: result.error });
      }

      const {
        quantity: qnt,
        name: itemName,
        unitPrice: price,
        subtotal,
        totalValue,
        isNewAddition,
      } = result.data;

      res.status(200).json({
        message: `🛍️ *${itemName.toUpperCase()} ${
          isNewAddition ? "ADICIONADO" : "ATUALIZADO"
        } NO CARRINHO!*\n\n🔢 **Quantidade**: ${qnt} unidades\n💲 **Preço unitário**: R$ ${price.toFixed(
          2
        )}\n🧮 **Subtotal**: R$ ${subtotal.toFixed(
          2
        )}\n\n📌 _Total da lista agora_: R$ ${totalValue.toFixed(2)}`,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async removeItem(req, res) {
    try {
      const { quantity, name } = req.body;

      const quantityToRemove = parseInt(quantity) || 0;

      const result = await ItemModel.removeItem(quantityToRemove, name);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      if (result.removedCompletely) {
        res.status(200).json({
          message: `🗑️ *${result.itemName.toUpperCase()} REMOVIDO COMPLETAMENTE!*\n\n➖ Valor retirado: R$ ${result.removedValue.toFixed(
            2
          )}\n\n📌 _Total da lista agora_: R$ ${result.totalValue.toFixed(2)}`,
        });
      } else {
        res.status(200).json({
          message: `🔻 *${quantityToRemove} ${result.itemName.toUpperCase()} REMOVIDO DO CARRINHO!*\n\n➖ Valor retirado: R$ ${result.removedValue.toFixed(
            2
          )}\n📊 Restam: ${
            result.remainingQuantity
          } unidade(s) (R$ ${result.remainingValue.toFixed(
            2
          )})\n\n📌 _Total da lista agora_: R$ ${result.totalValue.toFixed(2)}`,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ItemController();
