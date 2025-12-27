# Design System - Cofrin

## 📋 Visão Geral

Sistema de design consistente aplicado em toda a aplicação para garantir uma experiência visual unificada e profissional.

## 🎨 Paleta de Cores

### Cores Primárias
- **Roxo primário**: `#5B3DF5` - Marca principal, ícones, destaquessub
- **Roxo claro**: `#E8E4FF` - Fundos de destaque, ícones em círculo
- **Roxo escuro**: `#4A2FA8` - (Depreciado, use roxo primário)

### Fundos
- **Background**: `#F7F8FC` - Fundo geral da aplicação
- **Card**: `#FFFFFF` - Fundo de cards e modais

### Texto
- **Título**: `#1F1F1F` - Títulos e textos importantes
- **Corpo**: `#5F6368` - Texto padrão
- **Muted**: `#9AA0A6` - Labels e textos secundários
- **Inverso**: `#FFFFFF` - Texto em fundos escuros

### Status e Feedback
- **Sucesso**: `#1BB88A` - Valores positivos, receitas, confirmações
- **Sucesso Light**: `#E6F9F4` - Fundos de sucesso
- **Warning**: `#cf5799` - Alertas, atenção, vencimentos próximos
- **Warning Light**: `#FFF3E0` - Fundos de warning
- **Erro**: `#d1195d` - Erros, valores negativos, ações destrutivas
- **Erro Light**: `#FFEBEE` - Fundos de erro

### Estrutura
- **Border**: `#E6E6EB` - Bordas de elementos
- **Divider**: `#E6E6EB` - Separadores e linhas divisórias

### Neutros
- **Cinza**: `#9AA0A6` - Elementos neutros
- **Cinza Light**: `#F5F5F5` - Fundos neutros

## 🔤 Tipografia

### Tamanhos e Pesos

| Uso | Tamanho | Peso | Uso |
|-----|---------|------|-----|
| Título de seção | 18px | 600 | Títulos de cards principais |
| Subtítulo de card | 16px | 600 (roxo) | Subtítulos destacados |
| Valor principal | 26px | 700 (positivo) | Saldos e valores principais |
| Valor secundário | 15px | 600 | Valores em linhas |
| Labels | 12px | 500 (muted) | Labels de campos |
| Texto padrão | 14px | 400 | Texto corrido |

### Estilos Prontos (importados de `designSystem.ts`)

```typescript
import { DS_TYPOGRAPHY } from '../theme/designSystem';

// Uso
<Text style={DS_TYPOGRAPHY.styles.sectionTitle}>Título</Text>
<Text style={DS_TYPOGRAPHY.styles.cardSubtitle}>Subtítulo</Text>
<Text style={DS_TYPOGRAPHY.styles.valueMain}>R$ 1.000,00</Text>
<Text style={DS_TYPOGRAPHY.styles.valueSecondary}>R$ 100,00</Text>
<Text style={DS_TYPOGRAPHY.styles.label}>Label</Text>
<Text style={DS_TYPOGRAPHY.styles.body}>Texto padrão</Text>
```

## 🎯 Ícones

### Tamanhos Padrão
- **Default**: 20px - Ícones em linha
- **Large**: 24px - Ícones de destaque
- **Small**: 16px - Ícones compactos

### Cor Padrão
- **Cor**: Roxo primário (`#5B3DF5`)

### Ícone em Destaque (Featured)
- **Container**: 36px × 36px, círculo
- **Fundo**: Roxo claro (`#E8E4FF`)
- **Ícone**: 20px, roxo primário

```typescript
import { DS_ICONS } from '../theme/designSystem';

// Ícone simples
<MaterialCommunityIcons 
  name="wallet" 
  size={DS_ICONS.size.default} 
  color={DS_ICONS.color} 
/>

// Ícone em destaque (com círculo)
<View style={{
  width: DS_ICONS.featured.containerSize,
  height: DS_ICONS.featured.containerSize,
  borderRadius: DS_ICONS.featured.containerSize / 2,
  backgroundColor: DS_ICONS.featured.backgroundColor,
  alignItems: 'center',
  justifyContent: 'center',
}}>
  <MaterialCommunityIcons 
    name="wallet" 
    size={DS_ICONS.featured.size} 
    color={DS_ICONS.featured.color} 
  />
</View>
```

## 📦 Cards

### Especificações
- **Padding**: 16px
- **Border Radius**: 16px
- **Background**: Branco (`#FFFFFF`)
- **Gap interno**: 12px (espaçamento entre elementos)
- **Sombra**: Suave (elevation: 2)

### Uso

```typescript
import { DS_CARD } from '../theme/designSystem';

const styles = StyleSheet.create({
  card: {
    ...DS_CARD,
    ...DS_CARD.shadow, // Adiciona sombra consistente
    backgroundColor: DS_COLORS.card,
  },
});
```

## 🏷️ Badges e Status

### Especificações
- **Border Radius**: 8px
- **Padding Horizontal**: 8px
- **Padding Vertical**: 4px

### Variantes

| Tipo | Background | Texto | Uso |
|------|-----------|-------|-----|
| Neutral | `#F5F5F5` | `#9AA0A6` | Estados neutros, pendente |
| Success | `#E6F9F4` | `#1BB88A` | Sucesso, pago |
| Warning | `#FFF3E0` | `#cf5799` | Vencendo hoje, atenção |
| Error | `#FBE3ED` | `#d1195d` | Vencido, erro, grave |

### Uso

```typescript
import { DS_BADGE, getBadgeColors } from '../theme/designSystem';

// Obter cores do badge
const badgeColors = getBadgeColors('warning'); // 'neutral' | 'success' | 'warning' | 'error'

// Aplicar no badge
<View style={[
  DS_BADGE,
  { backgroundColor: badgeColors.backgroundColor }
]}>
  <Text style={{ color: badgeColors.color, fontSize: 10, fontWeight: '600' }}>
    Vence hoje
  </Text>
</View>
```

## 📏 Espaçamentos

| Nome | Valor | Uso |
|------|-------|-----|
| xs | 4px | Gaps mínimos |
| sm | 8px | Gaps pequenos |
| md | 12px | Gaps médios (padrão interno) |
| lg | 16px | Gaps grandes (padding cards) |
| xl | 20px | Gaps extras |
| xxl | 24px | Gaps máximos |

```typescript
import { DS_SPACING } from '../theme/designSystem';

const styles = StyleSheet.create({
  container: {
    gap: DS_SPACING.md,
    padding: DS_SPACING.lg,
  },
});
```

## 🎨 Helpers

### Cor de Valor por Tipo

```typescript
import { getValueColor } from '../theme/designSystem';

const color = getValueColor('positive'); // 'positive' | 'negative' | 'neutral' | 'warning' | 'error'

// Retorna:
// positive -> #1BB88A (verde)
// negative/error -> #d1195d (vermelho)
// warning -> #cf5799
// neutral -> #9AA0A6 (cinza)
```

## ✅ Componentes Atualizados

### Cards da Home
- ✅ **CreditCardsCard** - Cartões de crédito com badges de status
- ✅ **AccountsCard** - Contas e saldos
- ✅ **UpcomingFlowsCard** - Fluxos futuros (contas a receber/pagar)
- ✅ **TopCategoriesCard** - Link para categorias

### Próximos (TODO)
- ⏳ GoalCard - Card de metas
- ⏳ TransactionsList - Lista de transações
- ⏳ Launches screen - Tela de lançamentos
- ⏳ Demais componentes da aplicação

## 📝 Regras de Uso

### ✅ Fazer
1. Sempre importar cores de `DS_COLORS`
2. Usar estilos pré-definidos de `DS_TYPOGRAPHY.styles`
3. Aplicar `DS_CARD` e `DS_CARD.shadow` para todos os cards
4. Usar `DS_SPACING` para todos os gaps e paddings
5. Usar `DS_ICONS` para tamanhos e cores de ícones
6. Aplicar badges com `getBadgeColors()`

### ❌ Não Fazer
1. Criar novas cores hardcoded (ex: `#123456`)
2. Criar novos tamanhos de fonte fora do padrão
3. Usar pesos de fonte fora de: 400, 500, 600, 700
4. Criar sombras customizadas
5. Usar valores de spacing diferentes dos definidos

## 📦 Importação

```typescript
// Importar tudo
import { 
  DS_COLORS, 
  DS_TYPOGRAPHY, 
  DS_ICONS, 
  DS_CARD, 
  DS_BADGE, 
  DS_SPACING,
  getBadgeColors,
  getValueColor,
} from '../theme/designSystem';

// Ou importar individualmente
import { DS_COLORS } from '../theme/designSystem';
```

## 🔄 Migração de Código Existente

### Antes
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A2FA8',
  },
});
```

### Depois
```typescript
import { DS_CARD, DS_TYPOGRAPHY, DS_COLORS } from '../theme/designSystem';

const styles = StyleSheet.create({
  card: {
    ...DS_CARD,
    ...DS_CARD.shadow,
    backgroundColor: DS_COLORS.card,
  },
  title: {
    ...DS_TYPOGRAPHY.styles.sectionTitle,
  },
});
```

## 🎯 Benefícios

1. **Consistência Visual**: Todos os cards e componentes seguem o mesmo padrão
2. **Manutenção Fácil**: Alterar cor primária afeta toda a aplicação
3. **Performance**: Menos estilos duplicados
4. **Acessibilidade**: Cores e contrastes padronizados
5. **Escalabilidade**: Fácil adicionar novos componentes
6. **Documentação**: Único ponto de referência para design

---

**Versão**: 1.0  
**Última atualização**: 27/12/2024
