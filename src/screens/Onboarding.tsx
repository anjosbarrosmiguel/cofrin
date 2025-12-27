import React, { useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    FlatList,
    ViewToken,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../contexts/themeContext';
import { spacing, borderRadius } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mantém identidade visual do Login (web e mobile)
const BRAND_BG = 'rgb(108 42 143)';
const BRAND_ICON = 'piggy-bank';
const BRAND_TAGLINE = 'Seu controle financeiro simplificado';

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  bullets: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'wallet',
    title: 'Bem-vindo ao Cofrin',
    description: 'Organize suas finanças com um app simples, bonito e rápido.',
    bullets: ['Cadastre contas e cartões', 'Registre receitas e despesas', 'Acompanhe metas e progresso'],
  },
  {
    id: '2',
    icon: 'bank',
    title: 'Contas e cartões',
    description: 'Veja seu dinheiro por conta e controle o cartão sem confusão.',
    bullets: ['Saldo por conta', 'Cartão com fatura separada', 'Tudo centralizado'],
  },
  {
    id: '3',
    icon: 'swap-vertical',
    title: 'Lançamentos em segundos',
    description: 'Registre o que entrou e saiu e mantenha o controle do mês.',
    bullets: ['Despesa e receita', 'Data e conta', 'Edição rápida depois'],
  },
  {
    id: '4',
    icon: 'tag-multiple',
    title: 'Categorias com clareza',
    description: 'Descubra para onde seu dinheiro está indo com categorias e cores.',
    bullets: ['Categorias e subcategorias', 'Visão por período', 'Top gastos automaticamente'],
  },
  {
    id: '5',
    icon: 'target',
    title: 'Metas que funcionam',
    description: 'Defina objetivos e acompanhe o progresso sem esforço.',
    bullets: ['Meta de longo prazo', 'Meta mensal por categoria', 'Acompanhamento no dia a dia'],
  },
];

interface Props {
  navigation: any;
}

export default function Onboarding({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * screenWidth,
        animated: true,
      });
      // Atualiza o index imediatamente para sincronizar os dots
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('@cofrin:onboarding_completed', 'true');
    navigation.replace('Home');
  };

  const renderSlide = useCallback(
    ({ item }: { item: OnboardingSlide }) => (
      <View style={[styles.slide, { width: screenWidth }]}>
        <ScrollView
          contentContainerStyle={styles.slideInner}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.heroIconCircle}>
            <MaterialCommunityIcons name={item.icon as any} size={46} color="#FFFFFF" />
          </View>

          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>

          <View style={styles.bullets}>
            {item.bullets.map((text, idx) => (
              <View key={`${item.id}-${idx}`} style={styles.bulletRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color="rgba(255,255,255,0.92)" />
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    ),
    [screenWidth]
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Background decor */}
      <View pointerEvents="none" style={styles.bgDecor}>
        <View style={styles.bgBlobA} />
        <View style={styles.bgBlobB} />
      </View>

      {/* Header igual ao Login (ícone + frase) */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconContainer}>
            <MaterialCommunityIcons name={BRAND_ICON as any} size={32} color="#fff" />
          </View>
          <Text style={styles.appName}>Cofrin</Text>
        </View>
        <Text style={styles.tagline}>{BRAND_TAGLINE}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          {!isLastSlide ? (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Pular</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => navigation.navigate('Tutorial')} style={styles.skipButton}>
              <Text style={styles.skipText}>Ver tutorial</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [styles.nextButton, pressed && { opacity: 0.92 }]}
          >
            <Text style={[styles.nextText, { color: colors.primary }]}>
              {isLastSlide ? 'Começar' : 'Próximo'}
            </Text>
            <MaterialCommunityIcons
              name={isLastSlide ? 'check' : 'arrow-right'}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  bgDecor: {
    ...StyleSheet.absoluteFillObject,
  },
  bgBlobA: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -120,
    left: -140,
  },
  bgBlobB: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -200,
    right: -180,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  slideInner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 520,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: spacing.sm,
    color: '#FFFFFF',
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
    color: 'rgba(255,255,255,0.88)',
  },
  bullets: {
    width: '100%',
    gap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.92)',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  nextText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
