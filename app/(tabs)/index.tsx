import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import logoImg from '@/assets/images/logofitrack.png'; // depois podemos trocar por uma logo mais estilizada

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#000', '#0A1A2F']} style={styles.container}>
      <Image source={logoImg} style={styles.logo} resizeMode="contain" />

      <Text style={styles.welcomeText}>
        Bem-vindo ao <Text style={styles.highlight}>FitTrack</Text>
      </Text>

      <View style={styles.buttonsWrapper}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={() => router.push('/(tabs)/AlunosCadastro')}
        >
          <Text style={styles.buttonText}>➕ Cadastrar Aluno</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#34C759' }]}
          onPress={() => router.push('/(tabs)/ListaAlunos')}
        >
          <Text style={styles.buttonText}>📋 Ver Alunos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF9500' }]}
          onPress={() => router.push('/(tabs)/CriarSerieScreen')}
        >
          <Text style={styles.buttonText}>💪 Criar Série</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
    marginTop: -50,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#fff',
  },
  highlight: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 28,
    color: '#0487E6',
  },
  buttonsWrapper: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

