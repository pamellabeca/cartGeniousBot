const prisma = require("../../config/prisma");

class ItemModel {
  async addToWishlist(name, categoryName) {
    try {
      const categoria = await prisma.category.findUnique({
        where: { name: categoryName },
      });

      if (!categoria) {
        throw new Error(`Category "${categoryName}" not founded`);
      }

      const shoppingList =
        (await prisma.shoppingList.findFirst({
          where: { finalizedAt: null },
        })) ||
        (await prisma.shoppingList.create({
          data: { finalizedAt: null },
        }));

      const item = await prisma.item.create({
        data: {
          name: name,
          category: { connect: { name: categoryName } },
          purchased: false,
          list: { connect: { id: shoppingList.id } },
        },
        include: {
          category: true,
          list: true,
        },
      });

      return { success: true, item };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  }

  async DuplicatedItem(name) {
    try {
      const activeList = await prisma.shoppingList.findFirst({
        where: { finalizedAt: null },
      });

      if (!activeList) return false;

      const existsName = await prisma.item.findFirst({
        where: {
          name: name,
          listId: activeList.id,
        },
      });

      return !!existsName;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async addToCart({ unitPrice, name, quantity }) {
    try {
      const activeList = await prisma.shoppingList.findFirst({
        where: { finalizedAt: null },
      });

      if (!activeList) {
        return { success: false, error: "not list founded" };
      }

      const item = await prisma.item.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          listId: activeList.id,
        },
      });

      if (!item) {
        return { success: false, error: "not item founded on active list" };
      }

      const updateQuantity = item.purchased
        ? (item.quantity || 0) + quantity
        : quantity;
      const updateUnitPrice = unitPrice;
      const subtotal = updateQuantity * updateUnitPrice;

      const updatedItem = await prisma.item.update({
        where: { id: item.id },
        data: {
          quantity: updateQuantity,
          unitPrice: updateUnitPrice,
          totalPrice: subtotal,
          purchased: true,
        },
      });

      const items = await prisma.item.findMany({
        where: { listId: activeList.id },
      });

      const totalValue = items.reduce(
        (acc, item) => acc + (item.totalPrice || 0),
        0
      );

      await prisma.shoppingList.update({
        where: { id: activeList.id },
        data: {
          totalValue,
        },
      });

      return {
        status: true,
        data: {
          name: updatedItem.name,
          quantity: updatedItem.quantity,
          unitPrice: updatedItem.unitPrice,
          subtotal: updatedItem.totalPrice,
          totalValue,
          isNewAddition: !item.purchased,
        },
      };
    } catch (error) {
      console.log(error);
      return { status: false };
    }
  }

  async removeItem(quantityToRemove, name) {
    try {
      const activeList = await prisma.shoppingList.findFirst({
        where: { finalizedAt: null },
      });

      if (!activeList) {
        return { success: false, error: "Lista não encontrada" };
      }

      const item = await prisma.item.findFirst({
        where: {
          name: name,
          listId: activeList.id,
        },
      });

      if (!item) {
        return { success: false, error: "Item não encontrado na lista" };
      }

      const unitPrice = item.unitPrice || 0;
      const currentQuantity = item.quantity || 0;
      const currentTotalPrice = item.totalPrice || 0;

      if (quantityToRemove >= currentQuantity || quantityToRemove === 0) {
        await prisma.item.delete({
          where: { id: item.id },
        });

        await this.updateListTotal(activeList.id);

        const updatedList = await prisma.shoppingList.findUnique({
          where: { id: activeList.id },
        });

        return {
          success: true,
          removedCompletely: true,
          removedValue: currentTotalPrice,
          itemName: item.name,
          totalValue: updatedList.totalValue || 0,
        };
      } else {
        const newQuantity = currentQuantity - quantityToRemove;
        const removedValue = quantityToRemove * unitPrice;
        const newTotalPrice = newQuantity * unitPrice;

        await prisma.item.update({
          where: { id: item.id },
          data: {
            quantity: newQuantity,
            totalPrice: newTotalPrice,
          },
        });

        await this.updateListTotal(activeList.id);

        const updatedList = await prisma.shoppingList.findUnique({
          where: { id: activeList.id },
        });

        return {
          success: true,
          removedCompletely: false,
          removedValue,
          remainingQuantity: newQuantity,
          remainingValue: newTotalPrice,
          itemName: item.name,
          totalValue: updatedList.totalValue || 0,
        };
      }
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  }

  async updateListTotal(listId) {
    const items = await prisma.item.findMany({
      where: { listId: listId },
    });

    const totalValue = items.reduce(
      (acc, item) => acc + (item.totalPrice || 0),
      0
    );

    await prisma.shoppingList.update({
      where: { id: listId },
      data: { totalValue },
    });
  }
}

module.exports = new ItemModel();
