const prisma = require("../../config/prisma");

class ListModel {
  async totalPrice() {
    try {
      const list = await prisma.shoppingList.findFirst({
        where: { finalizedAt: null },
      });

      const itemCount = await prisma.item.count({
        where: { listId: list.id },
      });

      return {
        success: true,
        totalValue: list.totalValue,
        itemCount,
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  async finalize() {
    try {
      return await prisma.$transaction(async (tx) => {
        const activeList = await tx.shoppingList.findFirst({
          where: { finalizedAt: null },
          include: {
            items: {
              where: { purchased: false },
              include: { category: true },
            },
          },
        });

        if (!activeList) {
          return { success: false, error: "Nenhuma lista ativa encontrada" };
        }

        const finalizedList = await tx.shoppingList.update({
          where: { id: activeList.id },
          data: { finalizedAt: new Date() },
        });

        const purchasedItem = await tx.item.count({
          where: {
            listId: activeList.id,
            purchased: true,
          },
        });

        const notPurchasedItems = activeList.items;
        const notPurchasedCount = notPurchasedItems.length;

        if (notPurchasedCount > 0) {
          const newList = await tx.shoppingList.create({
            data: {
              totalValue: 0,
              createdAt: new Date(),
            },
          });

          for (const item of notPurchasedItems) {
            await tx.item.create({
              data: {
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice || 0,
                totalPrice: item.totalPrice || 0,
                purchased: false,
                listId: newList.id,
                categoryId: item.categoryId,
              },
            });
          }

          const totalValueOfNewItems = notPurchasedItems.reduce(
            (sum, item) => sum + (item.totalPrice || 0),
            0
          );

          await tx.shoppingList.update({
            where: { id: newList.id },
            data: { totalValue: totalValueOfNewItems },
          });
        } else {
          await tx.shoppingList.create({
            data: {
              totalValue: 0,
              createdAt: new Date(),
            },
          });
        }

        return {
          success: true,
          finalizedAt: finalizedList.finalizedAt,
          purchasedItem,
          notPurchasedItem: notPurchasedCount,
          totalValue: finalizedList.totalValue,
          transferredItems: notPurchasedCount > 0,
        };
      });
    } catch (error) {
      console.error("ShoppingListModel Error:", error);
      return { success: false, error: error.message };
    }
  }

  async getCategoryReport(categoryName) {
    try {
      const lastTwoLists = await prisma.shoppingList.findMany({
        where: {
          NOT: { finalizedAt: null },
          items: {
            some: {
              category: {
                name: {
                  equals: categoryName,
                  mode: "insensitive",
                },
              },
            },
          },
        },
        orderBy: { finalizedAt: "desc" },
        take: 2,
        include: {
          items: {
            where: {
              category: {
                name: {
                  equals: categoryName,
                  mode: "insensitive",
                },
              },
              purchased: true,
            },
            include: {
              category: true,
            },
          },
        },
      });

      if (lastTwoLists.length < 2) {
        const errorMsg = `Necessário 2 listas finalizadas com a categoria ${categoryName}`;
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      return {
        success: true,
        currentList: lastTwoLists[0],
        previousList: lastTwoLists[1],
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMonthlyReport() {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const [currentMonthLists, previousMonthLists] = await Promise.all([
        prisma.shoppingList.findMany({
          where: {
            finalizedAt: {
              gte: new Date(currentYear, currentMonth, 1),
              lt: new Date(currentYear, currentMonth + 1, 1),
            },
          },
          include: { items: true },
        }),
        prisma.shoppingList.findMany({
          where: {
            finalizedAt: {
              gte: new Date(previousYear, previousMonth, 1),
              lt: new Date(previousYear, previousMonth + 1, 1),
            },
          },
          include: { items: true },
        }),
      ]);

      const consolidate = (lists) => {
        const allItems = lists.flatMap((list) => list.items);
        const totalValue = lists.reduce(
          (sum, list) => sum + (list.totalValue || 0),
          0
        );

        const categorySummary = allItems.reduce((acc, item) => {
          const cat = item.category?.name || "outros";
          acc[cat] = (acc[cat] || 0) + (item.totalPrice || 0);
          return acc;
        }, {});

        return { totalValue, categorySummary };
      };

      return {
        success: true,
        currentMonth: consolidate(currentMonthLists),
        previousMonth: consolidate(previousMonthLists),
        monthNames: [
          this.getMonthName(previousMonth),
          this.getMonthName(currentMonth),
        ],
      };
    } catch (error) {
      console.error("Error on mensal report:", error);
      return { success: false, error: "Error to generate mensal report" };
    }
  }

  getMonthName(monthNumber) {
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return monthNames[monthNumber] || "Mês inválido";
  }
}

module.exports = new ListModel();
