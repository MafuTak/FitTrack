import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Screen } from '@/components/Screen';
import { IconName } from '@/components/ui';
import { Palette, Radius, Spacing } from '@/constants/theme';
import logoImg from '@/assets/images/logofitrack.png';

const ACTIONS: {
  icon: IconName;
  title: string;
  description: string;
  route: Href;
}[] = [
  {
    icon: 'user-plus',
    title: 'Cadastrar aluno',
    description: 'Adicione um novo aluno ao seu time',
    route: '/(tabs)/AlunosCadastro',
  },
  {
    icon: 'users',
    title: 'Ver alunos',
    description: 'Consulte, edite e avalie seus alunos',
    route: '/(tabs)/ListaAlunos',
  },
  {
    icon: 'plus-square',
    title: 'Criar série',
    description: 'Monte treinos personalizados',
    route: '/(tabs)/CriarSerieScreen',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logoHalo}>
          <Image source={logoImg} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.brand}>FitTrack</Text>
        <Text style={styles.tagline}>Seu treino, sua evolução.</Text>
      </View>

      <View style={styles.actions}>
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.title}
            activeOpacity={0.85}
            onPress={() => router.push(action.route)}
            style={styles.action}
          >
            <View style={styles.actionIcon}>
              <FontAwesome
                name={action.icon}
                size={18}
                color={Palette.orangeLight}
              />
            </View>

            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>

            <FontAwesome
              name="chevron-right"
              size={13}
              color={Palette.textFaint}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footer}>FitTrack · Personal Trainer</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoHalo: {
    width: 208,
    height: 208,
    borderRadius: 104,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,122,24,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,164,92,0.20)',
  },
  logo: {
    width: 168,
    height: 168,
  },
  brand: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 34,
    color: Palette.orangeLight,
    marginTop: Spacing.md,
  },
  tagline: {
    color: Palette.textMuted,
    fontSize: 14,
    marginTop: Spacing.xs,
    letterSpacing: 0.3,
  },
  actions: {
    gap: Spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,122,24,0.14)',
    borderWidth: 1,
    borderColor: Palette.border,
    marginRight: Spacing.md,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  actionDescription: {
    color: Palette.textFaint,
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    color: Palette.textFaint,
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: Spacing.xxl,
  },
});
