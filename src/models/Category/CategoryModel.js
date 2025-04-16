const prisma = require('../../config/prisma')

class CategoryModel {
  async listAll() {
    try {
      const activeList = await prisma.shoppingList.findFirst({
        where: { finalizedAt: null }
      });
  
      if(!activeList){
        return {success: false, error: 'any active list founded'}
      }
      
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              items: {
                where: {
                  listId: activeList.id
                }
              }
            }
          }
        }
      });

      return {
        success: true, 
        categories
      };
    } catch (error) {
        emptyList = []
        console.log(error);
        return {
          success: false,
          emptyList
        }
    }
  }

  async categoryInformations(categoryName){
    try {
      const activeList = await prisma.shoppingList.findFirst({
        where: { finalizedAt: null }
      });
  
      if(!activeList){
        return {success: false, error: 'any active list founded'}
      }
      
      const categories = await prisma.category.findFirst({
        where: { name: categoryName }
      })

      if (!categories) {
        throw new Error(`Category "${categoryName}" not founded`);
      }

      const items = await prisma.item.findMany({
        where: {
          categoryId: categories.id,
          listId: activeList.id,
          purchased: false
        },
        include: {
          category: true
        }
      });
      

      return{
        success: true,
        categories,
        items
      }

    } catch (error) {
      console.log(error);
        return {
          success: false
        }
    }
  }
}

module.exports = new CategoryModel();