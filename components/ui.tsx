import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';

import { Gradients, Palette, Radius, Spacing } from '@/constants/theme';

export type IconName = React.ComponentProps<typeof FontAwesome>['name'];

/* ------------------------------------------------------------------ */
/* Títulos                                                             */
/* ------------------------------------------------------------------ */

export function ScreenTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Superfícies                                                         */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

/* ------------------------------------------------------------------ */
/* Formulário                                                          */
/* ------------------------------------------------------------------ */

type InputProps = TextInputProps & {
  label?: string;
};

export function Input({
  label,
  style,
  onFocus,
  onBlur,
  placeholderTextColor,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const field = (
    <TextInput
      {...props}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      placeholderTextColor={placeholderTextColor ?? Palette.textFaint}
      style={[styles.input, focused && styles.inputFocused, style]}
    />
  );

  if (!label) return field;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {field}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Botões                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled,
  small,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  small?: boolean;
}) {
  const textColor =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'danger'
      ? Palette.danger
      : variant === 'secondary'
      ? Palette.orangeLight
      : Palette.textMuted;

  const content = (
    <View style={[styles.buttonInner, small && styles.buttonInnerSmall]}>
      {icon ? (
        <FontAwesome
          name={icon}
          size={small ? 13 : 15}
          color={textColor}
          style={styles.buttonIcon}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          small && styles.buttonTextSmall,
          { color: textColor },
        ]}
      >
        {title}
      </Text>
    </View>
  );

  const baseStyle: StyleProp<ViewStyle> = [
    styles.buttonBase,
    small && styles.buttonSmall,
    disabled && styles.buttonDisabled,
    style,
  ];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled}
        style={baseStyle}
      >
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const background =
    variant === 'secondary'
      ? 'rgba(255,122,24,0.14)'
      : variant === 'danger'
      ? 'rgba(255,92,92,0.12)'
      : 'transparent';

  const borderColor =
    variant === 'secondary'
      ? Palette.border
      : variant === 'danger'
      ? 'rgba(255,92,92,0.45)'
      : Palette.borderSoft;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        baseStyle,
        { backgroundColor: background, borderWidth: 1, borderColor },
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* Seletores e estados vazios                                          */
/* ------------------------------------------------------------------ */

export function Chip({
  label,
  selected,
  onPress,
  onLongPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  message,
}: {
  icon?: IconName;
  title: string;
  message?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <FontAwesome name={icon} size={24} color={Palette.orangeLight} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Linha de informação (detalhes do aluno)                             */
/* ------------------------------------------------------------------ */

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  titleBlock: {
    marginBottom: Spacing.lg,
  },
  title: {
    color: Palette.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: Palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Palette.orange,
    marginRight: Spacing.sm,
  },
  sectionText: {
    color: Palette.orangeLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.borderSoft,
    marginVertical: Spacing.md,
  },

  field: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Palette.input,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    borderRadius: Radius.md,
    color: Palette.text,
    fontSize: 15,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  inputFocused: {
    borderColor: Palette.orange,
    backgroundColor: 'rgba(255,122,24,0.08)',
  },

  buttonBase: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  buttonSmall: {
    borderRadius: Radius.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    borderRadius: Radius.md,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: Spacing.lg,
  },
  buttonInnerSmall: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonTextSmall: {
    fontSize: 13,
  },

  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    marginRight: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: 'rgba(255,122,24,0.18)',
    borderColor: Palette.orange,
  },
  chipText: {
    color: Palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Palette.orangeLight,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,122,24,0.12)',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  emptyTitle: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyMessage: {
    color: Palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    color: Palette.textFaint,
    fontSize: 13,
  },
  infoValue: {
    color: Palette.text,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    marginLeft: Spacing.md,
    textAlign: 'right',
  },
});
