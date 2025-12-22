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

  // Para Web - custom dropdown
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

      {showPicker && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <Pressable style={styles.webOverlay} onPress={handleClose} />

          {/* Dropdown */}
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {DAYS.map((day) => (
                <Pressable
                  key={day}
                  onPress={() => handleSelect(day)}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        value === day ? colors.primaryBg : 'transparent',
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
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
                      size={18}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </>
      )}
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
  webOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  dropdownItemText: {
    fontSize: 15,
  },
});
