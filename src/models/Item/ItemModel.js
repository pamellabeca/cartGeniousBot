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

}

module.exports = new ItemModel();
