const prisma = require("../../config/prisma");

class ItemModel {
    async addToWishlist(name, categoryName) {
        try {
            const categoria = await prisma.category.findUnique({
                where: { name: categoryName }
            });
    
            if (!categoria) {
                throw new Error(`Category "${categoryName}" not founded`);
            }

            const shoppingList = await prisma.shoppingList.findFirst({
                where: { finalizedAt: null } 
            }) || await prisma.shoppingList.create({
                data: { finalizedAt: null }
            });

            const item = await prisma.item.create({
                data: {
                    name: name,
                    category: { connect: { name: categoryName } },
                    purchased: false,
                    list: { connect: { id: shoppingList.id } } 
                },
                include: {
                    category: true,
                    list: true
                }
            });
    
          return { success: true, item };
        } catch (error) {
          console.error(error);
          return { success: false };
        }
    }

    async DuplicatedItem(name){
        try {
            const activeList = await prisma.shoppingList.findFirst({
                where: {finalizedAt:null}
            })

            if(!activeList) return false

            const existsName = await prisma.item.findFirst({
                where: {
                    name:name,
                    listId: activeList.id
                }
            })

            return !!existsName
        } catch (error) {
            console.log(error)
            return false;
        }
    }
}

module.exports = new ItemModel();