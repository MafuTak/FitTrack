import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Screen } from '@/components/Screen';
import {
  Button,
  EmptyState,
  InfoRow,
  Input,
  ScreenTitle,
} from '@/components/ui';
import { Palette, Radius, Spacing } from '@/constants/theme';

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

const iniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
};

export default function ListaAlunos() {
  const [alunos, setAlunos] = useState<AlunoComAvaliacao[]>([]);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<
    string | number | null
  >(null);
  const [editandoAlunoId, setEditandoAlunoId] = useState<
    string | number | null
  >(null);
  const [edicaoDados, setEdicaoDados] = useState<Partial<AlunoComAvaliacao>>(
    {},
  );
  const [busca, setBusca] = useState('');
  const router = useRouter();

  const carregarAlunosComAvaliacao = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem('@alunos');
      const lista: AlunoComAvaliacao[] = dados ? JSON.parse(dados) : [];

      const listaComAvaliacao: AlunoComAvaliacao[] = await Promise.all(
        lista.map(async (aluno) => {
          const avaliacaoDados = await AsyncStorage.getItem(
            `@avaliacao_${aluno.id}`,
          );
          const avaliacao = avaliacaoDados
            ? JSON.parse(avaliacaoDados)
            : undefined;
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
    }, [carregarAlunosComAvaliacao]),
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

    const obrigatorios = [
      'nome',
      'idade',
      'telefone',
      'objetivo',
      'experiencia',
    ] as const;
    const temCampoVazio = obrigatorios.some(
      (campo) => !String(edicaoDados[campo] ?? '').trim(),
    );

    if (temCampoVazio) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const novosAlunos = alunos.map((a) =>
        a.id === editandoAlunoId ? { ...a, ...edicaoDados } : a,
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
              const restantes = alunos.filter((aluno) => aluno.id !== id);
              const semAvaliacao = restantes.map((aluno) => {
                const copia = { ...aluno };
                delete copia.avaliacao;
                return copia;
              });

              setAlunos(restantes);
              await AsyncStorage.setItem(
                '@alunos',
                JSON.stringify(semAvaliacao),
              );
              await AsyncStorage.removeItem(`@avaliacao_${id}`);

              const todasChaves = await AsyncStorage.getAllKeys();
              const chavesSerieDoAluno = todasChaves.filter((key) =>
                key.startsWith(`@treinos_${id}`),
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
      { cancelable: true },
    );
  };

  const renderItem = ({ item }: { item: AlunoComAvaliacao }) => {
    const selecionado = alunoSelecionadoId === item.id;
    const editando = editandoAlunoId === item.id;
    const avaliacao = item.avaliacao;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => alternarDetalhes(item.id)}
        onLongPress={() => removerAluno(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciais(item.nome)}</Text>
          </View>

          <View style={styles.cardHeaderText}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.cardMeta}>
              {item.objetivo ?? 'Sem objetivo'} ·{' '}
              {item.experiencia ?? 'Sem nível'}
            </Text>
          </View>

          <FontAwesome
            name={selecionado ? 'chevron-up' : 'chevron-down'}
            size={13}
            color={Palette.textFaint}
          />
        </View>

        {selecionado && (
          <View style={styles.detalhes}>
            {editando ? (
              <>
                <Input
                  label="Nome"
                  value={edicaoDados.nome ?? ''}
                  onChangeText={(t) =>
                    setEdicaoDados((prev) => ({ ...prev, nome: t }))
                  }
                  placeholder="Nome"
                />
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Input
                      label="Idade"
                      value={edicaoDados.idade ?? ''}
                      onChangeText={(t) =>
                        setEdicaoDados((prev) => ({ ...prev, idade: t }))
                      }
                      placeholder="Idade"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.col}>
                    <Input
                      label="Telefone"
                      value={edicaoDados.telefone ?? ''}
                      onChangeText={(t) =>
                        setEdicaoDados((prev) => ({ ...prev, telefone: t }))
                      }
                      placeholder="Telefone"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                <Input
                  label="Objetivo"
                  value={edicaoDados.objetivo ?? ''}
                  onChangeText={(t) =>
                    setEdicaoDados((prev) => ({ ...prev, objetivo: t }))
                  }
                  placeholder="Objetivo"
                />
                <Input
                  label="Experiência"
                  value={edicaoDados.experiencia ?? ''}
                  onChangeText={(t) =>
                    setEdicaoDados((prev) => ({ ...prev, experiencia: t }))
                  }
                  placeholder="Experiência"
                />
                <Input
                  label="Observações"
                  value={edicaoDados.observacoes ?? ''}
                  onChangeText={(t) =>
                    setEdicaoDados((prev) => ({ ...prev, observacoes: t }))
                  }
                  placeholder="Observações"
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
                <InfoRow label="Idade" value={item.idade ?? '-'} />
                <InfoRow label="Telefone" value={item.telefone ?? '-'} />
                <InfoRow label="Objetivo" value={item.objetivo ?? '-'} />
                <InfoRow label="Experiência" value={item.experiencia ?? '-'} />
                <InfoRow
                  label="Observações"
                  value={item.observacoes || 'Nenhuma'}
                />

                {avaliacao ? (
                  <View style={styles.evalCard}>
                    <View style={styles.evalHeader}>
                      <FontAwesome
                        name="heartbeat"
                        size={13}
                        color={Palette.orangeLight}
                      />
                      <Text style={styles.evalTitle}>Última avaliação</Text>
                      <Text style={styles.evalDate}>
                        📅{' '}
                        {avaliacao.data
                          ? new Date(avaliacao.data).toLocaleDateString('pt-BR')
                          : '-'}
                      </Text>
                    </View>

                    <View style={styles.evalStats}>
                      <View style={styles.evalStat}>
                        <Text style={styles.evalValue}>
                          {avaliacao.peso ?? '-'}
                        </Text>
                        <Text style={styles.evalLabel}>Peso (kg)</Text>
                      </View>
                      <View style={styles.evalStat}>
                        <Text style={styles.evalValue}>
                          {avaliacao.altura ?? '-'}
                        </Text>
                        <Text style={styles.evalLabel}>Altura (m)</Text>
                      </View>
                      <View style={styles.evalStat}>
                        <Text style={styles.evalValue}>
                          {avaliacao.imc ?? '-'}
                        </Text>
                        <Text style={styles.evalLabel}>IMC</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.semAvaliacao}>Sem avaliação</Text>
                )}

                <View style={styles.actionsRow}>
                  <Button
                    title="Editar"
                    small
                    variant="secondary"
                    icon="pencil"
                    onPress={() => iniciarEdicao(item)}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Nova avaliação"
                    small
                    icon="heartbeat"
                    onPress={() => novaAvaliacao(item.id)}
                    style={styles.actionButton}
                  />
                </View>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Screen contentContainerStyle={styles.screen}>
      <View style={styles.headerArea}>
        <ScreenTitle
          title="Alunos"
          subtitle={`${alunosFiltrados.length} ${
            alunosFiltrados.length === 1
              ? 'aluno encontrado'
              : 'alunos encontrados'
          }`}
        />

        <View style={styles.searchWrap}>
          <FontAwesome
            name="search"
            size={14}
            color={Palette.textFaint}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar aluno..."
            placeholderTextColor={Palette.textFaint}
          />
          {busca ? (
            <TouchableOpacity onPress={() => setBusca('')}>
              <FontAwesome
                name="times-circle"
                size={16}
                color={Palette.textFaint}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.hint}>
          Toque para expandir · segure para remover.
        </Text>
      </View>

      <FlatList
        data={alunosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title={busca ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
            message={
              busca
                ? 'Tente outro nome ou limpe a busca.'
                : 'Cadastre seu primeiro aluno para começar.'
            }
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Spacing.md,
  },
  headerArea: {
    paddingHorizontal: Spacing.xl,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.input,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Palette.text,
    fontSize: 15,
    paddingVertical: 12,
  },
  hint: {
    color: Palette.textFaint,
    fontSize: 11,
    marginTop: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl + Spacing.md,
    flexGrow: 1,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.borderSoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,122,24,0.14)',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  avatarText: {
    color: Palette.orangeLight,
    fontSize: 14,
    fontWeight: '700',
  },
  cardHeaderText: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  nome: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardMeta: {
    color: Palette.textFaint,
    fontSize: 12,
    marginTop: 2,
  },
  detalhes: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSoft,
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
  evalCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,122,24,0.08)',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  evalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  evalTitle: {
    color: Palette.orangeLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginLeft: 6,
    flex: 1,
  },
  evalDate: {
    color: Palette.textMuted,
    fontSize: 11,
  },
  evalStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  evalStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
  },
  evalValue: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  evalLabel: {
    color: Palette.textFaint,
    fontSize: 10,
    marginTop: 2,
  },
  semAvaliacao: {
    color: Palette.textFaint,
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: Spacing.md,
  },
});
