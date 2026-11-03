import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

type Aluno = {
  id: string | number;
  nome: string;
};

const classificarIMC = (imc: number) => {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidade';
};

export default function AvaliacaoScreen() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);

  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [braco, setBraco] = useState('');
  const [cintura, setCintura] = useState('');
  const [quadril, setQuadril] = useState('');
  const [coxa, setCoxa] = useState('');
  const [panturrilha, setPanturrilha] = useState('');
  const [torax, setTorax] = useState('');
  const [ombro, setOmbro] = useState('');
  const [gordura, setGordura] = useState('');

  const router = useRouter();
  const { alunoId } = useLocalSearchParams<{ alunoId?: string }>();

  const formatDecimal = (value: string) => {
    return value.replace(',', '.').replace(/[^0-9.]/g, '');
  };

  const obterAlturaMetros = () => {
    const valor = parseFloat(altura);
    if (!valor || valor <= 0) return 0;
    return valor > 3 ? valor / 100 : valor;
  };

  const normalizarAltura = () => {
    const metros = obterAlturaMetros();
    if (metros > 0) {
      setAltura(metros.toFixed(2));
    }
  };

  const calcularIMC = () => {
    const p = parseFloat(peso);
    const a = obterAlturaMetros();
    if (p > 0 && a > 0) {
      return (p / (a * a)).toFixed(2);
    }
    return '';
  };

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

  useEffect(() => {
    if (!alunoId) return;
    const encontrado = alunos.find((a) => String(a.id) === String(alunoId));
    if (encontrado) setAlunoSelecionado(encontrado);
  }, [alunoId, alunos]);

  useEffect(() => {
    const carregarAvaliacao = async () => {
      if (!alunoSelecionado) return;

      try {
        const dados = await AsyncStorage.getItem(
          `@avaliacao_${alunoSelecionado.id}`,
        );
        if (dados) {
          const avaliacao = JSON.parse(dados);
          setPeso(avaliacao.peso || '');
          setAltura(avaliacao.altura || '');
          setBraco(avaliacao.braco || '');
          setCintura(avaliacao.cintura || '');
          setQuadril(avaliacao.quadril || '');
          setCoxa(avaliacao.coxa || '');
          setPanturrilha(avaliacao.panturrilha || '');
          setTorax(avaliacao.torax || '');
          setOmbro(avaliacao.ombro || '');
          setGordura(avaliacao.gordura || '');
        } else {
          setPeso('');
          setAltura('');
          setBraco('');
          setCintura('');
          setQuadril('');
          setCoxa('');
          setPanturrilha('');
          setTorax('');
          setOmbro('');
          setGordura('');
        }
      } catch (error) {
        console.error('Erro ao carregar avaliação:', error);
      }
    };
    carregarAvaliacao();
  }, [alunoSelecionado]);

  const salvar = async () => {
    if (!alunoSelecionado) {
      Alert.alert('Erro', 'Selecione um aluno');
      return;
    }
    if (!peso || !altura) {
      Alert.alert('Erro', 'Preencha pelo menos peso e altura');
      return;
    }

    // Grava sempre em metros (ex: "1.70"), mesmo que o usuário digite 170.
    const alturaMetros = obterAlturaMetros();
    if (!alturaMetros) {
      Alert.alert('Erro', 'Informe uma altura válida (ex: 1.70)');
      return;
    }

    const avaliacao = {
      data: new Date().toISOString(),
      peso,
      altura: alturaMetros.toFixed(2),
      imc: calcularIMC(),
      braco,
      cintura,
      quadril,
      coxa,
      panturrilha,
      torax,
      ombro,
      gordura,
    };

    try {
      await AsyncStorage.setItem(
        `@avaliacao_${alunoSelecionado.id}`,
        JSON.stringify(avaliacao),
      );
      Alert.alert('Sucesso', 'Avaliação salva com sucesso!');
      router.push('/ListaAlunos');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a avaliação');
      console.error(error);
    }
  };

  const imc = calcularIMC();
  const imcNumero = parseFloat(imc);
  const classificacao = imcNumero > 0 ? classificarIMC(imcNumero) : '';

  return (
    <Screen scroll>
      <ScreenTitle
        title="Avaliação Física"
        subtitle="Acompanhe a evolução do seu aluno."
      />

      <SectionTitle>Aluno</SectionTitle>

      {alunos.length === 0 ? (
        <>
          <EmptyState
            icon="user-plus"
            title="Nenhum aluno cadastrado"
            message="Cadastre um aluno para registrar a primeira avaliação."
          />
          <Button
            title="Cadastrar aluno"
            icon="user-plus"
            onPress={() => router.push('/(tabs)/AlunosCadastro')}
          />
        </>
      ) : (
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
      )}

      {alunos.length > 0 && !alunoSelecionado ? (
        <EmptyState
          icon="clipboard"
          title="Selecione um aluno"
          message="Escolha um aluno acima para preencher a avaliação."
        />
      ) : null}

      {alunoSelecionado ? (
        <>
          <Text style={styles.selectedName}>
            Avaliando: {alunoSelecionado.nome}
          </Text>

          <Card>
            <SectionTitle>Peso e altura</SectionTitle>

            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Peso (kg)"
                  value={peso}
                  onChangeText={(t) => setPeso(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="Ex: 75.4"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Altura (m)"
                  value={altura}
                  onChangeText={(t) => setAltura(formatDecimal(t))}
                  onBlur={normalizarAltura}
                  keyboardType="numeric"
                  placeholder="Ex: 1.70"
                />
              </View>
            </View>

            <View style={styles.imcCard}>
              <Text style={styles.imcLabel}>IMC</Text>
              <Text style={styles.imcValue}>{imc || '--'}</Text>
              {classificacao ? (
                <Text style={styles.imcClass}>{classificacao}</Text>
              ) : null}
            </View>
          </Card>

          <Card>
            <SectionTitle>Medidas (cm)</SectionTitle>

            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Braço"
                  value={braco}
                  onChangeText={(t) => setBraco(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Cintura"
                  value={cintura}
                  onChangeText={(t) => setCintura(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Quadril"
                  value={quadril}
                  onChangeText={(t) => setQuadril(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Coxa"
                  value={coxa}
                  onChangeText={(t) => setCoxa(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Panturrilha"
                  value={panturrilha}
                  onChangeText={(t) => setPanturrilha(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Tórax"
                  value={torax}
                  onChangeText={(t) => setTorax(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Ombro"
                  value={ombro}
                  onChangeText={(t) => setOmbro(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="% Gordura"
                  value={gordura}
                  onChangeText={(t) => setGordura(formatDecimal(t))}
                  keyboardType="numeric"
                  placeholder="0.0"
                />
              </View>
            </View>
          </Card>

          <Button
            title="Salvar avaliação"
            icon="check"
            onPress={salvar}
          />
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
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  imcCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,122,24,0.10)',
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  imcLabel: {
    color: Palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  imcValue: {
    color: Palette.orangeLight,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 2,
  },
  imcClass: {
    color: Palette.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
