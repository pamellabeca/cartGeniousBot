const { callOpenAI } = require("../../services/openAPI");
const ListModel = require("../../models/List/ListModel");
const {
  createCategoryPrompt,
  createMonthlyPrompt,
} = require("../../prompts/reportPrompts");
const { prepareReportData } = require("../../services/listService");

class ListController {
  async totalPrice(req, res) {
    try {
      const totalValue = await ListModel.totalPrice();

      if (!totalValue.success) {
        return res
          .status(404)
          .json({
            error: totalValue.error || "Could not retrieve total value",
          });
      }

      res.status(200).json({
        message: `💳 *TOTAL DO CARRINHO*\n\n🛒 Itens: ${
          totalValue.itemCount
        }\n💰 Valor: R$ ${totalValue.totalValue.toFixed(2)}`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async finalize(req, res) {
    try {
      const finalizedList = await ListModel.finalize();

      if (!finalizedList.success) {
        return res
          .status(404)
          .json({ error: finalizedList.error || "Falha ao finalizar a lista" });
      }

      const {
        totalValue,
        purchasedItem,
        notPurchasedItem,
        finalizedAt,
        transferredItems,
      } = finalizedList;

      const formattedDate = finalizedAt.toLocaleString("pt-BR");

      let message = `🎉 *COMPRA CONCLUÍDA!*\n\n📅 Data: ${formattedDate}\n💵 Total: R$ ${totalValue.toFixed(
        2
      )}\n📝 Itens comprados: ${purchasedItem}\n🔄 Itens não comprados: ${notPurchasedItem}`;

      if (notPurchasedItem > 0 && transferredItems) {
        message += `\n\n✅ Os ${notPurchasedItem} itens não comprados foram transferidos automaticamente para uma nova lista!`;
      } else {
        message += `\n\n✅ Uma nova lista vazia foi criada!`;
      }

      message += `\n\n⚠️ *A lista anterior agora está bloqueada!*`;

      res.status(200).json({ message });
    } catch (error) {
      console.error("Controller Error:", error);
      res.status(500).json({ error: "Erro interno ao finalizar a lista" });
    }
  }

  async generateReport(req, res) {
    try {
      const { category } = req.query;
      const reportType = category ? "category" : "monthly";

      const reportData = await prepareReportData(reportType, category);

      if (!reportData.success) {
        return res.status(400).json({ error: reportData.error });
      }

      const prompt =
        reportType === "category"
          ? createCategoryPrompt(reportData)
          : createMonthlyPrompt(reportData);

      const reportText = await new Promise((resolve) => {
        callOpenAI(prompt, (response) => resolve(response));
      });

      res.status(200).json({ report: reportText });
    } catch (error) {
      res.status(500).json({ error: "Erro ao gerar relatório" });
    }
  }
}

module.exports = new ListController();
