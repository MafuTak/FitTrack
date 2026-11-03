import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { Screen } from '@/components/Screen';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Input,
  ScreenTitle,
  SectionTitle,
} from '@/components/ui';
import { Palette, Spacing } from '@/constants/theme';

type Aluno = {
  id: string | number;
  nome: string;
};

type Exercicio = {
  exercicio: string;
  series: string;
  repeticoes: string;
};

type Treino = {
  nome: string;
  exercicios: Exercicio[];
};

export default function CriarSerieScreen() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [nomeTreino, setNomeTreino] = useState('');
  const [exercicio, setExercicio] = useState('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [treinos, setTreinos] = useState<Treino[]>([]);

  const router = useRouter();

  const carregarAlunos = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem('@alunos');
      const lista: Aluno[] = dados ? JSON.parse(dados) : [];
      setAlunos(lista);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarAlunos();
    }, [carregarAlunos]),
  );

  const adicionarExercicio = () => {
    if (!nomeTreino || !exercicio || !series || !repeticoes) {
      Alert.alert('Erro', 'Preencha todos os campos do treino');
      return;
    }

    const novoExercicio = { exercicio, series, repeticoes };
    const treinoExistente = treinos.find((t) => t.nome === nomeTreino);

    if (treinoExistente) {
      setTreinos((prev) =>
        prev.map((t) =>
          t.nome === nomeTreino
            ? { ...t, exercicios: [...t.exercicios, novoExercicio] }
            : t,
        ),
      );
    } else {
      setTreinos((prev) => [
        ...prev,
        { nome: nomeTreino, exercicios: [novoExercicio] },
      ]);
    }

    setExercicio('');
    setSeries('');
    setRepeticoes('');
  };

  const salvarTreino = async () => {
    if (!alunoSelecionado) {
      Alert.alert('Erro', 'Selecione um aluno para salvar o treino');
      return;
    }
    if (treinos.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício');
      return;
    }

    try {
      const chave = `@treinos_${alunoSelecionado.id}`;
      const existentesRaw = await AsyncStorage.getItem(chave);
      const existentesParsed = existentesRaw ? JSON.parse(existentesRaw) : [];
      const existentes: Treino[] = Array.isArray(existentesParsed)
        ? existentesParsed
        : [existentesParsed];

      // Preserva séries antigas e atualiza apenas as que têm o mesmo nome.
      const nomesNovos = new Set(treinos.map((t) => t.nome));
      const mesclados = [
        ...existentes.filter((t) => !nomesNovos.has(t.nome)),
        ...treinos,
      ];

      await AsyncStorage.setItem(chave, JSON.stringify(mesclados));

      Alert.alert('Sucesso', 'Treino salvo com sucesso!');
      setTreinos([]);
      setNomeTreino('');
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Não foi possível salvar o treino');
    }
  };

  return (
    <Screen scroll>
      <ScreenTitle
        title="Criar Série"
        subtitle="Monte o treino e vincule ao aluno escolhido."
      />

      <SectionTitle>Aluno</SectionTitle>

      {alunos.length === 0 ? (
        <>
          <EmptyState
            icon="user-plus"
            title="Nenhum aluno cadastrado"
            message="Cadastre um aluno antes de montar uma série."
          />
          <Button
            title="Cadastrar aluno"
            icon="user-plus"
            onPress={() => router.push('/(tabs)/AlunosCadastro')}
          />
        </>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {alunos.map((aluno) => (
              <Chip
                key={String(aluno.id)}
                label={aluno.nome}
                selected={alunoSelecionado?.id === aluno.id}
                onPress={() => setAlunoSelecionado(aluno)}
              />
            ))}
          </ScrollView>

          <Text style={styles.selectedName}>
            Aluno selecionado:{' '}
            {alunoSelecionado ? alunoSelecionado.nome : 'nenhum'}
          </Text>
        </>
      )}

      {alunos.length > 0 ? (
        <>
          <Card>
            <SectionTitle>Novo treino</SectionTitle>

            <Input
              label="Nome do treino"
              placeholder="Ex: Peito e tríceps"
              value={nomeTreino}
              onChangeText={setNomeTreino}
            />

            <Input
              label="Exercício"
              placeholder="Ex: Supino reto"
              value={exercicio}
              onChangeText={setExercicio}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Séries"
                  placeholder="Ex: 4"
                  keyboardType="numeric"
                  value={series}
                  onChangeText={setSeries}
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Repetições"
                  placeholder="Ex: 12"
                  keyboardType="numeric"
                  value={repeticoes}
                  onChangeText={setRepeticoes}
                />
              </View>
            </View>

            <Button
              title="Adicionar exercício"
              variant="secondary"
              icon="plus"
              onPress={adicionarExercicio}
            />
          </Card>

          {treinos.length > 0 ? (
            <>
              <SectionTitle>Exercícios adicionados</SectionTitle>

              {treinos.map((treino) => (
                <Card key={treino.nome} style={styles.treinoCard}>
                  <View style={styles.treinoHeader}>
                    <Text style={styles.treinoTitulo}>{treino.nome}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {treino.exercicios.length}
                      </Text>
                    </View>
                  </View>

                  {treino.exercicios.map((ex, idx) => (
                    <View
                      key={`${ex.exercicio}-${idx}`}
                      style={styles.exercicioRow}
                    >
                      <View style={styles.dot} />
                      <Text style={styles.exercicioNome}>{ex.exercicio}</Text>
                      <Text style={styles.exercicioMeta}>
                        {ex.series} x {ex.repeticoes}
                      </Text>
                    </View>
                  ))}
                </Card>
              ))}

              <Button
                title="Salvar treino"
                icon="check"
                onPress={salvarTreino}
              />
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    paddingBottom: Spacing.md,
  },
  selectedName: {
    color: Palette.orangeLight,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  treinoCard: {
    paddingVertical: Spacing.md,
  },
  treinoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  treinoTitulo: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,122,24,0.16)',
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 6,
  },
  countText: {
    color: Palette.orangeLight,
    fontSize: 12,
    fontWeight: '700',
  },
  exercicioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.orange,
    marginRight: Spacing.sm,
  },
  exercicioNome: {
    flex: 1,
    color: Palette.textMuted,
    fontSize: 14,
  },
  exercicioMeta: {
    color: Palette.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
});
