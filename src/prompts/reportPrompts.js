const createCategoryPrompt = (data) => {
    return `Você é um especialista em análise de compras domésticas. Gere um relatório completo sobre ${
      data.category
    } com:
    
      **Dados da Última Compra (${new Date(data.current.date).toLocaleDateString(
        "pt-BR"
      )}):**
      - Itens: ${data.current.items
        .map(
          (i) =>
            `${i.quantity}x ${i.name} (R$ ${
              i.unitPrice?.toFixed(2) || "0.00"
            }/un)`
        )
        .join(", ")}
      - Total Gasto: R$ ${data.current.total.toFixed(2)}
    
      **Dados da Penúltima Compra (${new Date(
        data.previous.date
      ).toLocaleDateString("pt-BR")}):**
      - Itens: ${data.previous.items
        .map(
          (i) =>
            `${i.quantity}x ${i.name} (R$ ${
              i.unitPrice?.toFixed(2) || "0.00"
            }/un)`
        )
        .join(", ")}
      - Total Gasto: R$ ${data.previous.total.toFixed(2)}
    
      **Exemplo de formato desejado: (se possível, seguir indispensavelmente)**
      "🧀 **RELATÓRIO ${data.category.toUpperCase()}** [emoji relevante]
    
      📊 **Top 3 Comprados:**
      1. [Item] (comprado [X]x)
      2. [Item] (comprado [X]x)
      3. [Item] (comprado [X]x)
    
      💸 **Preço Médio:**
      - [Item principal]: R$X.XX (±Y% vs anterior)
      - [Item secundário]: R$X.XX ([🔺/🔻]Y% vs anterior)
    
      💡 **Dica da vez:** 
      [Dica prática de economia baseada nos dados]
    
      🔍 **Curiosidade:** 
      [Padrão ou insight interessante identificado]"
    
      **Regras:**
      1. Use apenas os dados fornecidos
      2. Mantenha o tom amigável e útil
      3. Destaque variações acima de 10%
      4. Inclua pelo menos uma dica específica`;
  };
  
  const createMonthlyPrompt = (data) => {
    return `Você é um analista financeiro especializado em compras domésticas. Gere um comparativo mensal detalhado com:
    
      **${data.months[1].toUpperCase()} (Atual):**
      - Total Gasto: R$ ${data.current.totalValue.toFixed(2)}
      - Distribuição: ${Object.entries(data.current.categorySummary)
        .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
        .join(", ")}
    
      **${data.months[0].toUpperCase()} (Anterior):**
      - Total Gasto: R$ ${data.previous.totalValue.toFixed(2)}
      - Distribuição: ${Object.entries(data.previous.categorySummary)
        .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`)
        .join(", ")}
    
      **Exemplo de formato desejado:(se possível, seguir indispensavelmente)**
      "📊 **Comparativo de Compras: ${data.months[1]} vs ${data.months[0]}**
    
      💰 **Valor Total:**
      - ${data.months[1]}: R$ ${data.current.totalValue.toFixed(
      2
    )} ([🔺/🔻]X% vs anterior)
      - ${data.months[0]}: R$ ${data.previous.totalValue.toFixed(2)}
    
      📈 **Maiores Variações:**
      - [Categoria/Item] (R$ X.XX → R$ Y.YY, [🔺/🔻]Z%)
      - [Categoria/Item] (R$ X.XX → R$ Y.YY, [🔺/🔻]Z%)
    
      🛍 **Itens Esquecidos:**
      - [Mês]: [Item] (comprado a cada [Z] meses)
      - [Mês]: Nenhum
    
      💡 **Recomendações:**
      1. [Recomendação específica baseada em dados]
      2. [Dica de economia concreta]
      3. [Sugestão de oportunidade]"
    
      **Regras:**
      1. Calcule porcentagens precisas
      2. Destaque categorias com variação >15%
      3. Identifique itens não recomprados
      4. Sugira 3 ações concretas`;
  };
  
  module.exports = {createCategoryPrompt, createMonthlyPrompt}