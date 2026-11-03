import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { Palette, Radius, Spacing } from '@/constants/theme';

type Exercicio = {
  exercicio: string;
  series: string;
  repeticoes: string;
};

type Treino = {
  nome: string;
  exercicios: Exercicio[];
};

type Aluno = {
  id: string;
  nome: string;
};

export default function VerSerieScreen() {
  const [todasSeries, setTodasSeries] = useState<Record<string, Treino[]>>({});
  const [alunosMap, setAlunosMap] = useState<Record<string, string>>({});
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const [editando, setEditando] = useState<{
    alunoId: string;
    index: number;
  } | null>(null);
  const [edicaoTreino, setEdicaoTreino] = useState<Treino | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const serieKeys = keys.filter((k) => k.startsWith('@treinos_'));
      const dadosSerie = await AsyncStorage.multiGet(serieKeys);
      const grouped: Record<string, Treino[]> = {};

      dadosSerie.forEach(([chave, valor]) => {
        if (valor) {
          const partes = chave.split('_');
          const alunoId = partes[1];
          const treinoSalvo = JSON.parse(valor) as Treino | Treino[];

          if (!grouped[alunoId]) grouped[alunoId] = [];

          if (Array.isArray(treinoSalvo)) {
            grouped[alunoId].push(...treinoSalvo);
          } else {
            grouped[alunoId].push(treinoSalvo);
          }
        }
      });

      const alunosRaw = await AsyncStorage.getItem('@alunos');
      const map: Record<string, string> = {};

      if (alunosRaw) {
        const listaAlunos: Aluno[] = JSON.parse(alunosRaw);
        listaAlunos.forEach((a) => {
          map[a.id.toString()] = a.nome;
        });
      }

      setAlunosMap(map);
      setTodasSeries(grouped);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados]),
  );

  const excluirTodasSeriesDoAluno = async (alunoId: string) => {
    Alert.alert(
      'Excluir séries',
      `Deseja excluir todas as séries do aluno ${
        alunosMap[alunoId] || 'Aluno'
      }?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`@treinos_${alunoId}`);

              setTodasSeries((prev) => {
                const novo = { ...prev };
                delete novo[alunoId];
                return novo;
              });

              if (selecionado === alunoId) setSelecionado(null);

              Alert.alert(
                'Sucesso',
                'Todas as séries do aluno foram excluídas.',
              );
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir as séries.');
              console.error(e);
            }
          },
        },
      ],
    );
  };

  const excluirSerie = (alunoId: string, index: number) => {
    Alert.alert('Excluir série', 'Deseja realmente excluir esta série?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const novasSeries = [...todasSeries[alunoId]];
            novasSeries.splice(index, 1);

            await AsyncStorage.setItem(
              `@treinos_${alunoId}`,
              JSON.stringify(novasSeries),
            );

            setTodasSeries((prev) => ({ ...prev, [alunoId]: novasSeries }));

            Alert.alert('Sucesso', 'Série excluída com sucesso!');
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível excluir a série.');
            console.error(e);
          }
        },
      },
    ]);
  };

  const iniciarEdicao = (alunoId: string, index: number) => {
    setEditando({ alunoId, index });
    setEdicaoTreino(todasSeries[alunoId][index]);
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setEdicaoTreino(null);
  };

  const salvarEdicao = async () => {
    if (!editando || !edicaoTreino) return;

    const { alunoId, index } = editando;
    const novasSeries = [...todasSeries[alunoId]];
    novasSeries[index] = edicaoTreino;

    await AsyncStorage.setItem(
      `@treinos_${alunoId}`,
      JSON.stringify(novasSeries),
    );

    setTodasSeries((prev) => ({ ...prev, [alunoId]: novasSeries }));
    setEditando(null);
    setEdicaoTreino(null);
  };

  const adicionarExercicio = () => {
    setEdicaoTreino((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercicios: [
          ...prev.exercicios,
          { exercicio: '', series: '', repeticoes: '' },
        ],
      };
    });
  };

  const atualizarCampoExercicio = (
    index: number,
    campo: keyof Exercicio,
    valor: string,
  ) => {
    setEdicaoTreino((prev) => {
      if (!prev) return null;
      const novos = [...prev.exercicios];
      novos[index] = { ...novos[index], [campo]: valor };
      return { ...prev, exercicios: novos };
    });
  };

  const removerExercicio = (index: number) => {
    setEdicaoTreino((prev) => {
      if (!prev) return null;
      const novos = prev.exercicios.filter((_, i) => i !== index);
      return { ...prev, exercicios: novos };
    });
  };

  const renderSeries = () => {
    if (!selecionado) return null;
    const lista = todasSeries[selecionado] || [];

    if (lista.length === 0) {
      return (
        <EmptyState
          icon="list"
          title="Nenhum treino encontrado"
          message="Monte uma série para este aluno na aba Criar."
        />
      );
    }

    return lista.map((treino, idx) => (
      <Card key={`${treino.nome}-${idx}`}>
        {editando?.alunoId === selecionado && editando.index === idx ? (
          <>
            <SectionTitle>Editar série</SectionTitle>

            <Input
              label="Nome da série"
              value={edicaoTreino?.nome || ''}
              onChangeText={(t) =>
                setEdicaoTreino((prev) =>
                  prev ? { ...prev, nome: t } : null,
                )
              }
              placeholder="Nome da série"
            />

            {edicaoTreino?.exercicios.map((ex, i) => (
              <View key={i} style={styles.cardExercicio}>
                <Input
                  label="Exercício"
                  value={ex.exercicio}
                  onChangeText={(t) =>
                    atualizarCampoExercicio(i, 'exercicio', t)
                  }
                  placeholder="Exercício"
                />

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Input
                      label="Séries"
                      value={ex.series}
                      onChangeText={(t) =>
                        atualizarCampoExercicio(i, 'series', t)
                      }
                      placeholder="Séries"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.col}>
                    <Input
                      label="Repetições"
                      value={ex.repeticoes}
                      onChangeText={(t) =>
                        atualizarCampoExercicio(i, 'repeticoes', t)
                      }
                      placeholder="Reps"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Button
                  title="Remover exercício"
                  variant="danger"
                  small
                  icon="times"
                  onPress={() => removerExercicio(i)}
                />
              </View>
            ))}

            <Button
              title="Adicionar exercício"
              variant="secondary"
              small
              icon="plus"
              onPress={adicionarExercicio}
            />

            <View style={styles.actionsRow}>
              <Button
                title="Salvar"
                small
                icon="check"
                onPress={salvarEdicao}
                style={styles.actionButton}
              />
              <Button
                title="Cancelar"
                small
                variant="ghost"
                onPress={cancelarEdicao}
                style={styles.actionButton}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.serieHeader}>
              <Text style={styles.serieTitulo}>{treino.nome}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {treino.exercicios.length}
                </Text>
              </View>
            </View>

            {treino.exercicios.map((ex, i) => (
              <View key={i} style={styles.exercicioRow}>
                <View style={styles.dot} />
                <Text style={styles.exercicioNome}>{ex.exercicio}</Text>
                <Text style={styles.exercicioMeta}>
                  {ex.series} x {ex.repeticoes}
                </Text>
              </View>
            ))}

            <View style={styles.actionsRow}>
              <Button
                title="Editar"
                variant="secondary"
                small
                icon="pencil"
                onPress={() => iniciarEdicao(selecionado!, idx)}
                style={styles.actionButton}
              />
              <Button
                title="Excluir"
                variant="danger"
                small
                icon="trash"
                onPress={() => excluirSerie(selecionado!, idx)}
                style={styles.actionButton}
              />
            </View>
          </>
        )}
      </Card>
    ));
  };

  const alunosComSerie = Object.keys(todasSeries);

  return (
    <Screen scroll>
      <ScreenTitle
        title="Séries"
        subtitle="Treinos montados para cada aluno."
      />

      {alunosComSerie.length === 0 ? (
        <EmptyState
          icon="list"
          title="Nenhuma série cadastrada"
          message="Crie a primeira série na aba Criar."
        />
      ) : (
        <>
          <SectionTitle>Alunos com séries</SectionTitle>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {alunosComSerie.map((alunoId) => (
              <Chip
                key={alunoId}
                label={alunosMap[alunoId] || `Aluno ${alunoId}`}
                selected={selecionado === alunoId}
                onPress={() =>
                  setSelecionado(selecionado === alunoId ? null : alunoId)
                }
                onLongPress={() => excluirTodasSeriesDoAluno(alunoId)}
              />
            ))}
          </ScrollView>

          <Text style={styles.hint}>
            Segure o nome do aluno para excluir todas as séries dele.
          </Text>

          {selecionado ? (
            <>
              <Text style={styles.selectedName}>
                Séries de{' '}
                {alunosMap[selecionado] || `Aluno ${selecionado}`}
              </Text>
              {renderSeries()}
            </>
          ) : (
            <EmptyState
              icon="list"
              title="Selecione um aluno"
              message="Escolha um aluno acima para ver as séries."
            />
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    paddingBottom: Spacing.md,
  },
  hint: {
    color: Palette.textFaint,
    fontSize: 11,
    marginBottom: Spacing.lg,
  },
  selectedName: {
    color: Palette.orangeLight,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  serieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  serieTitulo: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
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
  cardExercicio: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
