import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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
  const isDark = useColorScheme() === 'dark';
  const [todasSeries, setTodasSeries] = useState<Record<string, Treino[]>>({});
  const [alunosMap, setAlunosMap] = useState<Record<string, string>>({});
  const [selecionado, setSelecionado] = useState<string | null>(null);

  // Estados de edição
  const [editando, setEditando] = useState<{ alunoId: string; index: number } | null>(null);
  const [edicaoTreino, setEdicaoTreino] = useState<Treino | null>(null);

  useFocusEffect(() => {
    carregarDados();
  });

  const carregarDados = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const serieKeys = keys.filter(k => k.startsWith('@treinos_'));
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

      // 🔹 Carregar todos os alunos de @alunos
      const alunosRaw = await AsyncStorage.getItem('@alunos');
      let map: Record<string, string> = {};

      if (alunosRaw) {
        const listaAlunos: Aluno[] = JSON.parse(alunosRaw);
        listaAlunos.forEach(a => {
          map[a.id.toString()] = a.nome;
        });
      }

      setAlunosMap(map);
      setTodasSeries(grouped);
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  };

  // 🔹 Excluir todas as séries do aluno (mas manter aluno)
  const excluirTodasSeriesDoAluno = async (alunoId: string) => {
    Alert.alert(
      'Excluir Séries',
      `Deseja excluir todas as séries do aluno ${alunosMap[alunoId] || 'Aluno'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`@treinos_${alunoId}`);

              setTodasSeries(prev => {
                const novo = { ...prev };
                delete novo[alunoId];
                return novo;
              });

              if (selecionado === alunoId) setSelecionado(null);

              Alert.alert('Sucesso', 'Todas as séries do aluno foram excluídas.');
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir as séries.');
              console.error(e);
            }
          },
        },
      ]
    );
  };

  // 🔹 Excluir apenas uma série individual
  const excluirSerie = (alunoId: string, index: number) => {
    Alert.alert(
      'Excluir Série',
      'Deseja realmente excluir esta série?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const novasSeries = [...todasSeries[alunoId]];
              novasSeries.splice(index, 1);

              await AsyncStorage.setItem(`@treinos_${alunoId}`, JSON.stringify(novasSeries));

              setTodasSeries(prev => ({ ...prev, [alunoId]: novasSeries }));

              Alert.alert('Sucesso', 'Série excluída com sucesso!');
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir a série.');
              console.error(e);
            }
          },
        },
      ]
    );
  };

  // 🔹 Iniciar edição de série
  const iniciarEdicao = (alunoId: string, index: number) => {
    setEditando({ alunoId, index });
    setEdicaoTreino(todasSeries[alunoId][index]);
  };

  // 🔹 Salvar série editada
  const salvarEdicao = async () => {
    if (!editando || !edicaoTreino) return;

    const { alunoId, index } = editando;
    const novasSeries = [...todasSeries[alunoId]];
    novasSeries[index] = edicaoTreino;

    await AsyncStorage.setItem(`@treinos_${alunoId}`, JSON.stringify(novasSeries));

    setTodasSeries(prev => ({ ...prev, [alunoId]: novasSeries }));
    setEditando(null);
    setEdicaoTreino(null);
  };

  // 🔹 Adicionar exercício na edição
  const adicionarExercicio = () => {
    setEdicaoTreino(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercicios: [...prev.exercicios, { exercicio: '', series: '', repeticoes: '' }],
      };
    });
  };

  // 🔹 Atualizar campos do exercício
  const atualizarCampoExercicio = (index: number, campo: keyof Exercicio, valor: string) => {
    setEdicaoTreino(prev => {
      if (!prev) return null;
      const novos = [...prev.exercicios];
      novos[index] = { ...novos[index], [campo]: valor };
      return { ...prev, exercicios: novos };
    });
  };

  // 🔹 Remover exercício
  const removerExercicio = (index: number) => {
    setEdicaoTreino(prev => {
      if (!prev) return null;
      const novos = prev.exercicios.filter((_, i) => i !== index);
      return { ...prev, exercicios: novos };
    });
  };

  const renderSeries = () => {
    if (!selecionado) return null;
    const lista = todasSeries[selecionado] || [];
    if (lista.length === 0) {
      return <Text style={{ color: isDark ? '#fff' : '#000' }}>Nenhum treino encontrado.</Text>;
    }
    return lista.map((treino, idx) => (
      <View key={idx} style={[styles.serieItem, { backgroundColor: isDark ? '#222' : '#eee' }]}>
        {editando?.alunoId === selecionado && editando.index === idx ? (
          <>
            <TextInput
              style={styles.inputEdicao}
              value={edicaoTreino?.nome || ''}
              onChangeText={(t) => setEdicaoTreino(prev => prev ? { ...prev, nome: t } : null)}
              placeholder="Nome da série"
              placeholderTextColor="#888"
            />

            {edicaoTreino?.exercicios.map((ex, i) => (
              <View key={i} style={styles.cardExercicio}>
                <TextInput
                  style={styles.inputEdicao}
                  value={ex.exercicio}
                  onChangeText={(t) => atualizarCampoExercicio(i, 'exercicio', t)}
                  placeholder="Exercício"
                  placeholderTextColor="#888"
                />
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TextInput
                    style={[styles.inputEdicao, { flex: 1 }]}
                    value={ex.series}
                    onChangeText={(t) => atualizarCampoExercicio(i, 'series', t)}
                    placeholder="Séries"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.inputEdicao, { flex: 1 }]}
                    value={ex.repeticoes}
                    onChangeText={(t) => atualizarCampoExercicio(i, 'repeticoes', t)}
                    placeholder="Reps"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity onPress={() => removerExercicio(i)}>
                  <Text style={{ color: 'red', marginTop: 4 }}>❌ Remover</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={adicionarExercicio} style={styles.botaoAdicionar}>
              <Text style={{ color: '#fff' }}>➕ Adicionar Exercício</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={salvarEdicao} style={styles.botaoSalvar}>
              <Text style={{ color: '#fff' }}>Salvar Alterações</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold', fontSize: 16 }}>
              {treino.nome}
            </Text>
            {treino.exercicios.map((ex, i) => (
              <Text key={i} style={{ color: isDark ? '#ccc' : '#333', marginLeft: 10, marginBottom: 4 }}>
                • {ex.exercicio} — {ex.series} x {ex.repeticoes}
              </Text>
            ))}
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              <TouchableOpacity onPress={() => iniciarEdicao(selecionado!, idx)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#007AFF' }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => excluirSerie(selecionado!, idx)}>
                <Text style={{ color: 'red' }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    ));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Text style={[styles.titulo, { color: isDark ? '#fff' : '#000' }]}>Ver Séries dos Alunos</Text>

      {Object.keys(todasSeries).length === 0 ? (
        <Text style={{ color: isDark ? '#aaa' : '#555' }}>Nenhuma série cadastrada.</Text>
      ) : (
        Object.keys(todasSeries).map(alunoId => (
          <TouchableOpacity
            key={alunoId}
            onPress={() => setSelecionado(selecionado === alunoId ? null : alunoId)}
            onLongPress={() => excluirTodasSeriesDoAluno(alunoId)}
            style={[
              styles.botaoAluno,
              {
                backgroundColor:
                  selecionado === alunoId
                    ? isDark
                      ? '#007AFF'
                      : '#3399FF'
                    : isDark
                    ? '#333'
                    : '#ccc',
              },
            ]}
          >
            <Text style={{ color: isDark ? '#fff' : '#000' }}>
              {alunosMap[alunoId] || `Aluno ${alunoId}`}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {selecionado && (
        <>
          <Text style={[styles.titulo, { color: isDark ? '#fff' : '#000', marginTop: 20 }]}>
            Séries de {alunosMap[selecionado] || `Aluno ${selecionado}`}
          </Text>
          {renderSeries()}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  serieItem: { padding: 12, borderRadius: 6, marginBottom: 10 },
  botaoAluno: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  inputEdicao: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    color: '#000',
    backgroundColor: '#fff',
  },
  cardExercicio: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  botaoAdicionar: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoSalvar: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
});
