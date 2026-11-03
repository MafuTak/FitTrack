import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  useColorScheme, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  const formatarTelefone = (texto: string) => {
    const cleaned = texto.replace(/\D/g, '');
    if (cleaned.length <= 2) return `(${cleaned})`;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const salvarAluno = async () => {
    if (!nome || !idade || !telefone || !objetivo || !experiencia) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }

    const novoAluno = {
      id: Date.now().toString(),
      nome,
      idade,
      telefone,
      objetivo,
      experiencia,
      observacoes,
    };

    try {
      const dadosExistentes = await AsyncStorage.getItem('@alunos');
      const alunos = dadosExistentes ? JSON.parse(dadosExistentes) : [];
      const novaLista = [...alunos, novoAluno];
      await AsyncStorage.setItem('@alunos', JSON.stringify(novaLista));
      Alert.alert('Sucesso', 'Aluno cadastrado com sucesso!');
      setNome('');
      setIdade('');
      setTelefone('');
      setObjetivo('');
      setExperiencia('');
      setObservacoes('');
      router.push('./ListaAlunos');
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      Alert.alert('Erro', 'Não foi possível salvar o aluno.');
    }
  };

  return (
    <LinearGradient
      colors={['#000', '#0A1A2F']}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "android" ? "padding" : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Text style={[styles.titulo, { color: '#fff' }]}>Cadastro de Aluno</Text>

          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome completo"
            placeholderTextColor={"#f0f0f0a8"}
          />

          <Text style={styles.label}>Idade *</Text>
          <TextInput
            style={styles.input}
            value={idade}
            onChangeText={setIdade}
            keyboardType="numeric"
            placeholder="Ex: 25"
            placeholderTextColor={"#f0f0f0a8"}
          />

          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={(t) => setTelefone(formatarTelefone(t))}
            keyboardType="phone-pad"
            placeholder="(99) 99999-9999"
            placeholderTextColor={"#f0f0f0a8"}
          />

          <Text style={styles.label}>Objetivo *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={objetivo}
              onValueChange={setObjetivo}
              dropdownIconColor="#f0f0f0"
              style={styles.picker}
            >
              <Picker.Item label="Selecione o objetivo" value="" />
              <Picker.Item label="Emagrecimento" value="Emagrecimento" />
              <Picker.Item label="Hipertrofia" value="Hipertrofia" />
              <Picker.Item label="Condicionamento" value="Condicionamento" />
            </Picker>
          </View>

          <Text style={styles.label}>Experiência *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={experiencia}
              onValueChange={setExperiencia}
              dropdownIconColor="#f0f0f0"
              style={styles.picker}
            >
              <Picker.Item label="Selecione o nível" value="" />
              <Picker.Item label="Iniciante" value="Iniciante" />
              <Picker.Item label="Intermediário" value="Intermediário" />
              <Picker.Item label="Avançado" value="Avançado" />
            </Picker>
          </View>

          <Text style={styles.label}>Observações (opcional)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Restrição, lesão, etc."
            placeholderTextColor={"#f0f0f0a8"}
            multiline
          />

          <TouchableOpacity style={styles.botao} onPress={salvarAluno}>
            <Text style={styles.textoBotao}>Cadastrar Aluno</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
    color: "#f0f0f0",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    color: "#f0f0f0",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  picker: {
    color: "#f0f0f0",
  },
  botao: {
    backgroundColor: "#3399FF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

