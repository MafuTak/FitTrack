import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import {
  Button,
  Card,
  Input,
  ScreenTitle,
  SectionTitle,
} from '@/components/ui';
import { Palette, Radius, Spacing } from '@/constants/theme';

const ITEM_COLOR = '#1A1A1A';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const router = useRouter();

  const formatarTelefone = (texto: string) => {
    const cleaned = texto.replace(/\D/g, '');
    if (cleaned.length <= 2) return `(${cleaned})`;
    if (cleaned.length <= 7)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
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
    <Screen scroll>
      <ScreenTitle
        title="Cadastro de Aluno"
        subtitle="Preencha os dados para começar o acompanhamento."
      />

      <Card>
        <SectionTitle>Dados pessoais</SectionTitle>

        <Input
          label="Nome *"
          value={nome}
          onChangeText={setNome}
          placeholder="Nome completo"
          autoCapitalize="words"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Input
              label="Idade *"
              value={idade}
              onChangeText={setIdade}
              keyboardType="numeric"
              placeholder="Ex: 25"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Telefone *"
              value={telefone}
              onChangeText={(t) => setTelefone(formatarTelefone(t))}
              keyboardType="phone-pad"
              placeholder="(99) 99999-9999"
            />
          </View>
        </View>
      </Card>

      <Card>
        <SectionTitle>Perfil</SectionTitle>

        <Text style={styles.label}>Objetivo *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={objetivo}
            onValueChange={setObjetivo}
            dropdownIconColor={Palette.orangeLight}
            style={styles.picker}
          >
            <Picker.Item
              label="Selecione o objetivo"
              value=""
              color={ITEM_COLOR}
            />
            <Picker.Item
              label="Emagrecimento"
              value="Emagrecimento"
              color={ITEM_COLOR}
            />
            <Picker.Item
              label="Hipertrofia"
              value="Hipertrofia"
              color={ITEM_COLOR}
            />
            <Picker.Item
              label="Condicionamento"
              value="Condicionamento"
              color={ITEM_COLOR}
            />
          </Picker>
        </View>

        <Text style={styles.label}>Experiência *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={experiencia}
            onValueChange={setExperiencia}
            dropdownIconColor={Palette.orangeLight}
            style={styles.picker}
          >
            <Picker.Item
              label="Selecione o nível"
              value=""
              color={ITEM_COLOR}
            />
            <Picker.Item
              label="Iniciante"
              value="Iniciante"
              color={ITEM_COLOR}
            />
            <Picker.Item
              label="Intermediário"
              value="Intermediário"
              color={ITEM_COLOR}
            />
            <Picker.Item
              label="Avançado"
              value="Avançado"
              color={ITEM_COLOR}
            />
          </Picker>
        </View>
      </Card>

      <Card>
        <SectionTitle>Observações</SectionTitle>
        <Input
          label="Observações (opcional)"
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Restrição, lesão, etc."
          multiline
          style={styles.textArea}
        />
      </Card>

      <Button title="Cadastrar aluno" icon="check" onPress={salvarAluno} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  label: {
    color: Palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerContainer: {
    backgroundColor: Palette.input,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  picker: {
    color: Palette.text,
    backgroundColor: 'transparent',
  },
  textArea: {
    height: 96,
    textAlignVertical: 'top',
  },
});
