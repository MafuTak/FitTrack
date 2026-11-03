import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
  Alert,
  FlatList,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

type Aluno = {
  id: string | number;
  nome: string;
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

  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  // 🔹 Formatação
  const formatDecimal = (value: string) => {
    return value.replace(',', '.').replace(/[^0-9.]/g, '');
  };

  const formatAltura = (value: string) => {
    const onlyNums = value.replace(/[^\d]/g, '');
    if (!onlyNums) return '';
    const num = parseFloat(onlyNums) / 100;
    return num.toFixed(2);
  };

  const calcularIMC = () => {
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    if (p > 0 && a > 0) {
      return (p / (a * a)).toFixed(2);
    }
    return '';
  };

  useFocusEffect(() => {
    const carregarAlunos = async () => {
      try {
        const dados = await AsyncStorage.getItem('@alunos');
        const lista: Aluno[] = dados ? JSON.parse(dados) : [];
        setAlunos(lista);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      }
    };
    carregarAlunos();
  });

  useEffect(() => {
    const carregarAvaliacao = async () => {
      if (!alunoSelecionado) return;

      try {
        const dados = await AsyncStorage.getItem(`@avaliacao_${alunoSelecionado.id}`);
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

    const avaliacao = {
      data: new Date().toISOString(),
      peso,
      altura,
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
      await AsyncStorage.setItem(`@avaliacao_${alunoSelecionado.id}`, JSON.stringify(avaliacao));
      Alert.alert('Sucesso', 'Avaliação salva com sucesso!');
      router.push('/ListaAlunos');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a avaliação');
      console.error(error);
    }
  };

  const renderAlunoItem = ({ item }: { item: Aluno }) => {
    const selecionado = alunoSelecionado?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.alunoItem,
          selecionado && styles.alunoSelecionado,
        ]}
        onPress={() => setAlunoSelecionado(item)}
      >
        <Text style={{ color: selecionado ? '#fff' : isDark ? '#fff' : '#000' }}>
          {item.nome}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[styles.titulo, { color: isDark ? '#fff' : '#000' }]}>Avaliação Física</Text>

        <Text style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Selecione o Aluno</Text>
        <FlatList
          data={alunos}
          keyExtractor={item => item.id.toString()}
          renderItem={renderAlunoItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 50, marginBottom: 16 }}
        />

        <Text style={[styles.subtitulo, { color: isDark ? '#fff' : '#000' }]}>
          {alunoSelecionado ? `Avaliação de ${alunoSelecionado.nome}` : 'Nenhum aluno selecionado'}
        </Text>

        {/* Peso e Altura lado a lado */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              value={peso}
              onChangeText={t => setPeso(formatDecimal(t))}
              keyboardType="numeric"
              placeholder="Ex: 75.4"
              placeholderTextColor={"#f0f0f0a8"}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Altura (m)</Text>
            <TextInput
              style={styles.input}
              value={altura}
              onChangeText={t => setAltura(formatAltura(t))}
              keyboardType="numeric"
              placeholder="Ex: 1.70"
              placeholderTextColor={"#f0f0f0a8"}
            />
          </View>
        </View>

        <Text style={[styles.label, { marginBottom: 12, color: isDark ? '#fff' : '#fff' }]}>IMC: {calcularIMC()}</Text>

        {/* Medidas em pares */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Medidas (cm)</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Braço</Text>
              <TextInput style={styles.input} value={braco} onChangeText={t => setBraco(formatDecimal(t))} keyboardType="numeric" placeholderTextColor={"#f0f0f0a8"} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Cintura</Text>
              <TextInput style={styles.input} value={cintura} onChangeText={t => setCintura(formatDecimal(t))} keyboardType="numeric" placeholderTextColor={"#f0f0f0a8"} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Quadril</Text>
              <TextInput style={styles.input} value={quadril} onChangeText={t => setQuadril(formatDecimal(t))} keyboardType="numeric" placeholderTextColor={"#f0f0f0a8"} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Coxa</Text>
              <TextInput style={styles.input} value={coxa} onChangeText={t => setCoxa(formatDecimal(t))} keyboardType="numeric" placeholderTextColor={"#f0f0f0a8"} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Panturrilha</Text>
              <TextInput style={styles.input} value={panturrilha} onChangeText={t => setPanturrilha(formatDecimal(t))} keyboardType="numeric" placeholderTextColor={"#f0f0f0a8"} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Tórax</Text>
              <TextInput style={styles.input} value={torax} onChangeText={t => setTorax(formatDecimal(t))} keyboardType="numeric" placeholderTextColor={"#f0f0f0a8"} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Ombro</Text>
              <TextInput style={styles.input} value={ombro} onChangeText={t => setOmbro(formatDecimal(t))} keyboardType="numeric" placeholderTextColor={"#f0f0f0a8"} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>% Gordura</Text>
              <TextInput style={styles.input} value={gordura} onChangeText={t => setGordura(formatDecimal(t))} keyboardType="numeric" placeholderTextColor={"#f0f0f0a8"} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
          <Text style={styles.textoBotao}>Salvar Avaliação</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  subtitulo: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  label: { fontWeight: 'bold', marginBottom: 4, color: "#f0f0f0" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    color: "#f0f0f0",
    backgroundColor: "#222",
  },
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  col: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: "#f0f0f0" },
  alunoItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#dddddd36",
  },
  alunoSelecionado: { backgroundColor: "#3399FF" },
  botaoSalvar: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
