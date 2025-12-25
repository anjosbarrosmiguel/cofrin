# Ícones PWA

Para que a instalação PWA funcione corretamente, você precisa adicionar os seguintes ícones nesta pasta:

## Ícones Necessários

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

## Requisitos

- Formato: PNG
- Fundo: Pode ser transparente ou com cor sólida
- Ícone: Deve ter margens para funcionar com "maskable" (zona segura de 80%)
- Resolução: Alta qualidade para displays retina

## Como Criar

### Opção 1: Usar o logo existente
Redimensione o arquivo `public/logo.png` para os tamanhos necessários.

### Opção 2: Ferramentas Online
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### Opção 3: Linha de comando (ImageMagick)
```bash
# Instale ImageMagick primeiro
convert ../logo.png -resize 192x192 icon-192.png
convert ../logo.png -resize 512x512 icon-512.png
```

## Verificação

Após adicionar os ícones, verifique no Chrome DevTools:
1. Abra F12 → Application → Manifest
2. Os ícones devem aparecer sem erros
3. O botão "Install" deve estar disponível
