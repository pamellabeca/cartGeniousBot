const ListModel = require('../models/List/ListModel');

const prepareReportData = async (type, category = null) => {
  try {
    if (type === "category") {
      if (!category) {
        throw new Error("Nome da categoria é obrigatório");
      }

      const report = await ListModel.getCategoryReport(category);

      if (!report.success) {
        return {
          success: false,
          error: "Falha ao obter o relatório de categoria",
        };
      }

      const currentTotal = report.currentList.items.reduce(
        (sum, item) => sum + (item.totalPrice || 0),
        0
      );
      const previousTotal = report.previousList.items.reduce(
        (sum, item) => sum + (item.totalPrice || 0),
        0
      );

      return {
        success: true,
        type: "category",
        category,
        current: {
          items: report.currentList.items,
          total: currentTotal,
          date: report.currentList.finalizedAt,
        },
        previous: {
          items: report.previousList.items,
          total: previousTotal,
          date: report.previousList.finalizedAt,
        },
      };
    } else {
      const report = await ListModel.getMonthlyReport();

      if (!report.success) {
        return { success: false, error: "Falha ao obter o relatório mensal" };
      }

      return {
        success: true,
        type: "monthly",
        months: report.monthNames,
        current: {
          totalValue: report.currentMonth.totalValue,
          categorySummary: report.currentMonth.categorySummary,
        },
        previous: {
          totalValue: report.previousMonth.totalValue,
          categorySummary: report.previousMonth.categorySummary,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Erro ao preparar os dados: " + error.message,
    };
  }
};

module.exports = {
  prepareReportData,
};