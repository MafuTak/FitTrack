import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useColorScheme,
  Alert,
  LayoutAnimation,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

type Avaliacao = {
  data?: string;
  peso?: string;
  altura?: string;
  imc?: string;
  braco?: string;
  cintura?: string;
  quadril?: string;
  coxa?: string;
  panturrilha?: string;
  torax?: string;
  ombro?: string;
  gordura?: string;
};

type AlunoComAvaliacao = {
  id: string | number;
  nome: string;
  idade?: string;
  telefone?: string;
  objetivo?: string;
  experiencia?: string;
  observacoes?: string;
  avaliacao?: Avaliacao;
};

export default function ListaAlunos() {
  const [alunos, setAlunos] = useState<AlunoComAvaliacao[]>([]);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<string | number | null>(null);
  const [editandoAlunoId, setEditandoAlunoId] = useState<string | number | null>(null);
  const [edicaoDados, setEdicaoDados] = useState<Partial<AlunoComAvaliacao>>({});
  const [busca, setBusca] = useState('');
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  const carregarAlunosComAvaliacao = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem('@alunos');
      const lista: AlunoComAvaliacao[] = dados ? JSON.parse(dados) : [];

      const listaComAvaliacao: AlunoComAvaliacao[] = await Promise.all(
        lista.map(async (aluno) => {
          const avaliacaoDados = await AsyncStorage.getItem(`@avaliacao_${aluno.id}`);
          const avaliacao = avaliacaoDados ? JSON.parse(avaliacaoDados) : undefined;
          return { ...aluno, avaliacao };
        }),
      );

      setAlunos(listaComAvaliacao);
    } catch (error) {
      console.error('Erro ao carregar alunos e avaliações:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarAlunosComAvaliacao();
    }, [carregarAlunosComAvaliacao])
  );

  const alunosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...alunos]
      .filter((aluno) => aluno.nome.toLowerCase().includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [alunos, busca]);

  const alternarDetalhes = (id: string | number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAlunoSelecionadoId((prevId) => (prevId === id ? null : id));
    setEditandoAlunoId(null);
  };

  const iniciarEdicao = (aluno: AlunoComAvaliacao) => {
    setEditandoAlunoId(aluno.id);
    setEdicaoDados({ ...aluno });
  };

  const salvarEdicao = async () => {
    if (!editandoAlunoId) return;

    const obrigatorios = ['nome', 'idade', 'telefone', 'objetivo', 'experiencia'] as const;
    const temCampoVazio = obrigatorios.some(
      (campo) => !String(edicaoDados[campo] ?? '').trim()
    );

    if (temCampoVazio) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const novosAlunos = alunos.map((a) =>
        a.id === editandoAlunoId ? { ...a, ...edicaoDados } : a
      );

      // A avaliação tem chave própria (@avaliacao_<id>) e não deve ser
      // gravada dentro de @alunos.
      const alunosParaSalvar = novosAlunos.map((aluno) => {
        const copia = { ...aluno };
        delete copia.avaliacao;
        return copia;
      });

      setAlunos(novosAlunos);
      await AsyncStorage.setItem('@alunos', JSON.stringify(alunosParaSalvar));
      setEditandoAlunoId(null);
      setEdicaoDados({});
      Alert.alert('Sucesso', 'Dados do aluno atualizados!');
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    }
  };

  const cancelarEdicao = () => {
    setEditandoAlunoId(null);
    setEdicaoDados({});
  };

  const novaAvaliacao = (alunoId: string | number) => {
    router.push({ pathname: '/AvaliacaoScreen', params: { alunoId } });
  };

  const removerAluno = (id: string | number) => {
    Alert.alert(
      'Confirmação',
      'Deseja remover este aluno, sua avaliação e todas as séries associadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const novaLista = alunos.filter((aluno) => aluno.id !== id);
              setAlunos(novaLista);
              await AsyncStorage.setItem('@alunos', JSON.stringify(novaLista));
              await AsyncStorage.removeItem(`@avaliacao_${id}`);

              const todasChaves = await AsyncStorage.getAllKeys();
              const chavesSerieDoAluno = todasChaves.filter((key) =>
                key.startsWith(`@treinos_${id}`)
              );
              if (chavesSerieDoAluno.length > 0) {
                await AsyncStorage.multiRemove(chavesSerieDoAluno);
              }

              Alert.alert('Sucesso', 'Aluno e todos os dados foram removidos!');
            } catch (error) {
              console.error('Erro ao remover aluno:', error);
              Alert.alert('Erro', 'Não foi possível remover o aluno.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: AlunoComAvaliacao }) => {
    const selecionado = alunoSelecionadoId === item.id;
    const editando = editandoAlunoId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)' // card translúcido no dark
              : 'rgba(0,0,0,0.05)',     // card translúcido no light
          },
        ]}
        onPress={() => alternarDetalhes(item.id)}
        onLongPress={() => removerAluno(item.id)}
      >
        <Text style={[styles.nome, { color: isDark ? '#fff' : '#000' }]}>{item.nome}</Text>

        {selecionado && (
          <View style={styles.detalhes}>
            {editando ? (
              <>
                <TextInput
                  style={styles.input}
                  value={edicaoDados.nome ?? ''}
                  onChangeText={(t) => setEdicaoDados((prev) => ({ ...prev, nome: t }))}
                  placeholder="Nome"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.input}
                  value={edicaoDados.idade ?? ''}
                  onChangeText={(t) => setEdicaoDados((prev) => ({ ...prev, idade: t }))}
                  placeholder="Idade"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  value={edicaoDados.telefone ?? ''}
                  onChangeText={(t) => setEdicaoDados((prev) => ({ ...prev, telefone: t }))}
                  placeholder="Telefone"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.input}
                  value={edicaoDados.objetivo ?? ''}
                  onChangeText={(t) => setEdicaoDados((prev) => ({ ...prev, objetivo: t }))}
                  placeholder="Objetivo"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.input}
                  value={edicaoDados.experiencia ?? ''}
                  onChangeText={(t) => setEdicaoDados((prev) => ({ ...prev, experiencia: t }))}
                  placeholder="Experiência"
                  placeholderTextColor="#888"
                />
                <TextInput
                  style={styles.input}
                  value={edicaoDados.observacoes ?? ''}
                  onChangeText={(t) => setEdicaoDados((prev) => ({ ...prev, observacoes: t }))}
                  placeholder="Observações"
                  placeholderTextColor="#888"
                />

                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.botaoAcao, { backgroundColor: '#28a745' }]}
                    onPress={salvarEdicao}
                  >
                    <Text style={styles.textoBotao}>Salvar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botaoAcao, { backgroundColor: '#666' }]}
                    onPress={cancelarEdicao}
                  >
                    <Text style={styles.textoBotao}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.detalhe, { color: isDark ? '#ccc' : '#555' }]}>
                  Idade: {item.idade ?? '-'}
                </Text>
                <Text style={[styles.detalhe, { color: isDark ? '#ccc' : '#555' }]}>
                  Telefone: {item.telefone ?? '-'}
                </Text>
                <Text style={[styles.detalhe, { color: isDark ? '#ccc' : '#555' }]}>
                  Objetivo: {item.objetivo ?? '-'}
                </Text>
                <Text style={[styles.detalhe, { color: isDark ? '#ccc' : '#555' }]}>
                  Experiência: {item.experiencia ?? '-'}
                </Text>
                <Text style={[styles.detalhe, { color: isDark ? '#ccc' : '#555' }]}>
                  Observações: {item.observacoes || 'Nenhuma'}
                </Text>

                {item.avaliacao ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.detalhe, { color: isDark ? '#ccc' : '#555' }]}>
                      📅 Data:{' '}
                      {item.avaliacao.data
                        ? new Date(item.avaliacao.data).toLocaleDateString()
                        : '-'}
                    </Text>
                    <Text style={[styles.detalhe, { color: isDark ? '#ccc' : '#555' }]}>
                      Peso: {item.avaliacao.peso ?? '-'} kg | Altura: {item.avaliacao.altura ?? '-'} m
                    </Text>
                    <Text style={[styles.detalhe, { color: isDark ? '#ccc' : '#555' }]}>
                      IMC: {item.avaliacao.imc ?? '-'}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontStyle: 'italic', color: isDark ? '#666' : '#999', marginTop: 4 }}>
                    Sem avaliação
                  </Text>
                )}

                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.botaoAcao, { backgroundColor: '#3399FF' }]}
                    onPress={() => iniciarEdicao(item)}
                  >
                    <Text style={styles.textoBotao}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botaoAcao, { backgroundColor: '#28a745' }]}
                    onPress={() => novaAvaliacao(item.id)}
                  >
                    <Text style={styles.textoBotao}>Nova Avaliação</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#000', '#0A1A2F']} // 👈 seu gradiente
      style={styles.background}
    >
      <Text style={[styles.titulo, { color: isDark ? '#fff' : '#000' }]}>
        Lista de Alunos
      </Text>
      <TextInput
        style={styles.busca}
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar aluno..."
        placeholderTextColor="#aaa"
      />
      <FlatList
        data={alunosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ color: isDark ? '#aaa' : '#555' }}>
            {busca
              ? 'Nenhum aluno encontrado para essa busca.'
              : 'Nenhum aluno encontrado.'}
          </Text>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  busca: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  item: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  nome: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  detalhes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#999',
  },
  detalhe: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    color: '#000',
    backgroundColor: '#fff',
  },
  botaoAcao: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
