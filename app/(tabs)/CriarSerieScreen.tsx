import React, { useCallback, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

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
}

export default function CriarSerieScreen() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [nomeTreino, setNomeTreino] = useState("");
  const [exercicio, setExercicio] = useState("");
  const [series, setSeries] = useState("");
  const [repeticoes, setRepeticoes] = useState("");
  const [treinos, setTreinos] = useState<Treino[]>([]);

  const router = useRouter();

  const carregarAlunos = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem("@alunos");
      const lista: Aluno[] = dados ? JSON.parse(dados) : [];
      setAlunos(lista);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarAlunos();
    }, [carregarAlunos])
  );

  const adicionarExercicio = () => {
    if (!nomeTreino || !exercicio || !series || !repeticoes) {
      Alert.alert("Erro", "Preencha todos os campos do treino");
      return;
    } 

    const treinoExistente = treinos.find((t) => t.nome === nomeTreino);

    if (treinoExistente) {
      treinoExistente.exercicios.push({ exercicio, series, repeticoes });
      setTreinos([...treinos]);
    } else {
      setTreinos([
        ...treinos,
        {
          nome: nomeTreino,
          exercicios: [{ exercicio, series, repeticoes }],
        },
      ]);
    }

    setExercicio("");
    setSeries("");
    setRepeticoes("");
  };

  const salvarTreino = async () => {
    if (!alunoSelecionado) {
      Alert.alert("Erro", "Selecione um aluno para salvar o treino");
      return;
    }
    if (treinos.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos um exercício");
      return;
    }

    try {
      const chave = `@treinos_${alunoSelecionado.id}`;
      await AsyncStorage.setItem(chave, JSON.stringify(treinos));

      Alert.alert("Sucesso", "Treino salvo com sucesso!");
      setTreinos([]);
      setNomeTreino("");
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      Alert.alert("Erro", "Não foi possível salvar o treino");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.titulo}>Criar Série</Text>

      {/* Seleção de Aluno */}
      <Text style={{ fontSize: 16, marginBottom:8, color: "#f0f0f0" }}>Selecione o Aluno:</Text>
      <FlatList
        data={alunos}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.alunoItem,
              alunoSelecionado?.id === item.id && styles.alunoSelecionado,
            ]}
            onPress={() => setAlunoSelecionado(item)}
          >
            <Text style={{ color: alunoSelecionado?.id === item.id ? "#fff" : "#fff" }}>
              {item.nome}
            </Text>
          </TouchableOpacity>
        )}
        style={{ maxHeight: 50, marginBottom: 12 }}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={{ marginVertical: 10, color: "#f0f0f0" }}>
        Aluno Selecionado: {alunoSelecionado ? alunoSelecionado.nome : "Nenhum"}
      </Text>

      {/* Nome do treino */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Treino (ex: Peito e Tríceps)"
        placeholderTextColor={"#f0f0f0a8"}
        value={nomeTreino}
        onChangeText={setNomeTreino}
      />

      {/* Inputs de Exercício */}
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flex2]}
          placeholder="Nome do Exercício"
          placeholderTextColor={"#f0f0f0a8"}
          value={exercicio}
          onChangeText={setExercicio}
        />
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="Séries"
          placeholderTextColor={"#f0f0f0a8"}
          keyboardType="numeric"
          value={series}
          onChangeText={setSeries}
        />
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="Repetições"
          placeholderTextColor={"#f0f0f0a8"}
          keyboardType="numeric"
          value={repeticoes}
          onChangeText={setRepeticoes}
        />
      </View>

      {/* Botão estilizado bem próximo */}
      <TouchableOpacity style={styles.addButton} onPress={adicionarExercicio}>
        <Text style={styles.addButtonText}>+ Adicionar Exercício</Text>
      </TouchableOpacity>

      {/* Lista de treinos */}
      <FlatList
        style={{ marginTop: 20 }}
        data={treinos}
        keyExtractor={(item) => item.nome}
        renderItem={({ item }) => (
          <View style={styles.treinoContainer}>
            <Text style={styles.treinoTitulo}>{item.nome}</Text>
            {item.exercicios.map((ex: Exercicio, idx: number) => (
              <Text key={idx} style={styles.exercicio}>
                • {ex.exercicio} — {ex.series} x {ex.repeticoes}
              </Text>
            ))}
          </View>
        )}
      />

      {/* Botão de salvar treino */}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: "#28a745" }]} onPress={salvarTreino}>
        <Text style={styles.addButtonText}>Salvar Treino</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#f0f0f0",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: "#f0f0f0",
    backgroundColor: "#222",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  treinoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  treinoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  exercicio: {
    fontSize: 16,
    marginLeft: 10,
  },
  alunoItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#dddddd36",
  },
  alunoSelecionado: { backgroundColor: "#3399FF" },
  addButton: {
    backgroundColor: "#3399FF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});


