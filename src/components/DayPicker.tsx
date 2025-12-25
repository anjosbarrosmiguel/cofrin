import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Modal,
    Platform,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../contexts/themeContext';
import { spacing, borderRadius } from '../theme';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Gerar array de dias 1-31
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export default function DayPicker({
  value,
  onChange,
  label,
  placeholder = 'Selecione',
  focused = false,
  onFocus,
  onBlur,
}: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [showPicker, setShowPicker] = useState(false);

  const handleOpen = () => {
    onFocus?.();
    setShowPicker(true);
  };

  const handleClose = () => {
    onBlur?.();
    setShowPicker(false);
  };

  const handleSelect = (day: string) => {
    onChange(day);
    handleClose();
  };

  // Para Android/iOS - usar modal com lista
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

        <Pressable
          onPress={handleOpen}
          style={[
            styles.selectButton,
            {
              borderColor: focused ? colors.primary : colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.selectText,
              { color: value ? colors.text : colors.textMuted },
            ]}
          >
            {value || placeholder}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={colors.textMuted}
          />
        </Pressable>

        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleClose}
        >
          <Pressable style={styles.modalOverlay} onPress={handleClose}>
            <View
              style={[
                styles.pickerContainer,
                { backgroundColor: colors.card, paddingBottom: insets.bottom },
              ]}
            >
              <View
                style={[styles.pickerHeader, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.pickerTitle, { color: colors.text }]}>
                  Selecione o dia
                </Text>
                <Pressable onPress={handleClose}>
                  <Text style={[styles.doneButton, { color: colors.primary }]}>
                    Concluído
                  </Text>
                </Pressable>
              </View>
              <ScrollView
                style={styles.optionsList}
                contentContainerStyle={styles.optionsContent}
              >
                {DAYS.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => handleSelect(day)}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor:
                          value === day ? colors.primaryBg : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: value === day ? colors.primary : colors.text,
                          fontWeight: value === day ? '600' : '400',
                        },
                      ]}
                    >
                      {day}
                    </Text>
                    {value === day && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }

  // Para Web - usar Modal para evitar problemas de z-index em ScrollView
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

      <Pressable
        onPress={handleOpen}
        style={[
          styles.selectButton,
          {
            borderColor: focused || showPicker ? colors.primary : colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.selectText,
            { color: value ? colors.text : colors.textMuted },
          ]}
        >
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name={showPicker ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      {/* Modal para seleção - funciona melhor em web dentro de ScrollView */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.webModalOverlay} onPress={handleClose}>
          <View
            style={[
              styles.webModalContent,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>
                {label || 'Selecione o dia'}
              </Text>
              <Pressable onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView style={styles.webModalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.webDaysGrid}>
                {DAYS.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => handleSelect(day)}
                    style={({ pressed }) => [
                      styles.webDayItem,
                      {
                        backgroundColor:
                          value === day ? colors.primary : colors.grayLight,
                        borderColor: value === day ? colors.primary : colors.border,
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.webDayText,
                        {
                          color: value === day ? '#fff' : colors.text,
                          fontWeight: value === day ? '700' : '500',
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  selectText: {
    fontSize: 16,
  },
  // Modal styles (Android/iOS)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionsContent: {
    paddingVertical: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionText: {
    fontSize: 16,
  },
  // Web styles
  webModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  webModalContent: {
    width: '90%',
    maxWidth: 340,
    maxHeight: '70%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  webModalScroll: {
    padding: spacing.md,
  },
  webDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  webDayItem: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  webDayText: {
    fontSize: 15,
  },
});
