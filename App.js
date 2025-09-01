import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, StatusBar, Image, Modal, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useFonts } from "expo-font"; // Hook para carregar fontes personalizadas
import AsyncStorage from "@react-native-async-storage/async-storage"; // Para salvar dados localmente
import { Feather } from '@expo/vector-icons'; // Icones de Lixeira

const STORAGE_KEY = "@agenda_tarefas"; // Chave para salvar tarefas no AsyncStorage

export default function App() {

  // Hook para carregar fontes personalizadas
  const [fontsLoaded] = useFonts({
    Garamond: require("./assets/fonts/EBGaramond-Regular.ttf"),
    GaramondBold: require("./assets/fonts/EBGaramond-Bold.ttf"),
    Emblema: require("./assets/fonts/EmblemaOne-Regular.ttf"),
  });

  // Estados do aplicativo
  const [tarefas, setTarefas] = useState([]); // Lista de tarefas 
  const [modalVisible, setModalVisible] = useState(false); // Modal para criar/editar tarefas
  const [titulo, setTitulo] = useState(""); // Título da tarefa
  const [descricao, setDescricao] = useState(""); // Descrição da tarefa
  const [horaSelecionada, setHoraSelecionada] = useState(12); // Hora selecionada
  const [minutoSelecionado, setMinutoSelecionado] = useState(0); // Minuto selecionado
  const [periodo, setPeriodo] = useState("AM"); // Período (AM/PM)
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false); // Modal de confirmação para excluir as tarefas
  const [tarefaEditando, setTarefaEditando] = useState(null); // Tarefa sendo editada

  // Função para criar/editar tarefas
  const adicionarTarefa = () => {
    if (!titulo.trim()) return; // Obrigatório ter título

    if (tarefaEditando) {
      // Atualiza uma tarefa já existente
      setTarefas(prev => prev.map(item =>
        item.id === tarefaEditando.id
          ? { ...item, titulo, descricao, hora: formatarHoraManual() }
          : item
      ));
      setTarefaEditando(null);
    } else {
      // Cria uma nova tarefa
      const nova = {
        id: Date.now().toString(),
        titulo,
        descricao,
        hora: formatarHoraManual(),
      };
      setTarefas((prev) => [nova, ...prev]);
    }

    // Limpa campos e fecha o modal
    setTitulo("");
    setDescricao("");
    setHoraSelecionada(12);
    setMinutoSelecionado(0);
    setPeriodo("AM");
    setModalVisible(false);
  };

  // Função para deletar uma tarefa específica
  const deletarTarefa = (id) => {
    setTarefas(prev => prev.filter(item => item.id !== id));
  };

  // Função para apagar todas as tarefas
  const apagarTodasTarefas = () => {
    setTarefas([]);
  };

  // Renderização de cada item da lista 
  const renderItem = ({ item }) => (
    <View style={styles.tarefa}>
      <View style={styles.barra}></View>

      <TouchableOpacity style={styles.botaoRender}
        onPress={() => {
          setTarefaEditando(item);
          setTitulo(item.titulo);
          setDescricao(item.descricao);

          // Configura hora, minuto e período com base na tarefa selecionada
          const [horaStr, periodoStr] = item.hora.split(" ");
          const [h, m] = horaStr.split(":");
          setHoraSelecionada(parseInt(h));
          setMinutoSelecionado(parseInt(m));
          setPeriodo(periodoStr);

          setModalVisible(true);
        }}
      >
        <View style={styles.conteudoTarefa}>
          <View style={styles.tituloContainer}>
            <Text style={styles.hora}>{item.hora}</Text>
            <TouchableOpacity onPress={() => deletarTarefa(item.id)}>
              <Feather name="trash-2" size={20} color="#DAA792" />
            </TouchableOpacity>
          </View>
          <Text style={styles.tituloTarefa}>{item.titulo}</Text>
          <Text style={styles.descricao}>{item.descricao}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Formata a hora manualmente
  const formatarHoraManual = () => {
    const minutosFormatados = minutoSelecionado < 10 ? `0${minutoSelecionado}` : minutoSelecionado;
    return `${horaSelecionada}:${minutosFormatados} ${periodo}`;
  };

  // Carrega tarefas do AsyncStorage ao iniciar o app
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setTarefas(JSON.parse(json));
      } catch (e) {
        console.warn("Erro ao carregar:", e);
      }
    })();
  }, []);

  // Salva tarefas novas automaticamente no AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
      } catch (e) {
        console.warn("Erro ao salvar:", e);
      }
    })();
  }, [tarefas]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>Olá Nathalia!</Text>
          <Text style={styles.subtitulo}>Acompanhe sua agenda de tarefas aqui!</Text>
          <View style={styles.divisor} />
        </View>
        <Image style={styles.imagem} source={require("./assets/image.png")} />
      </View>

      {/* Lista de tarefas */}
      <View style={styles.card}>
        <Text style={styles.data}>
          <Text style={styles.dataNum}>01</Text> SET
        </Text>

        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma tarefa ainda...</Text>
          }
        />
      </View>

      {/*Botões para adicionar e apagar todas tarefas*/}
      <View style={styles.botoesContainer}>
        {/* Adicionar tarefa */}
        <TouchableOpacity
          style={styles.btnMais}
          onPress={() => {
            setModalVisible(true);
            setTarefaEditando(null);
            setTitulo("");
            setDescricao("");
            setHoraSelecionada(12);
            setMinutoSelecionado(0);
            setPeriodo("AM");
          }}
        >
          <Text style={styles.mais}>+</Text>
        </TouchableOpacity>

        {/* Apagar tarefas */}
        <TouchableOpacity
          style={styles.btnApagarTudo}
          onPress={() => setModalConfirmVisible(true)}
        >
          <Text style={styles.apagarTexto}>Apagar Tudo</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para criar/editar tarefa */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.btnFecharModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.fecharTxt}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitulo}>{tarefaEditando ? "Tarefa Editada" : "Nova Tarefa"}</Text>

            <TextInput style={styles.input} placeholder="Digite o título..." value={titulo} onChangeText={setTitulo} />
            <TextInput style={styles.input} placeholder="Digite a descrição..." value={descricao} onChangeText={setDescricao} />

            {/* Seleção de hora */}
            <View style={styles.selecaoHora}>

              {/* Hora */}
              <View style={styles.containerTempo}>
                <Text>Hora</Text>
                <View style={styles.selecao}>
                  <TouchableOpacity onPress={() => setHoraSelecionada(h => h === 12 ? 1 : h + 1)}>
                    <Text style={styles.botaoMaisMenos}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.horaTexto}>{horaSelecionada}</Text>
                  <TouchableOpacity onPress={() => setHoraSelecionada(h => h === 1 ? 12 : h - 1)}>
                    <Text style={styles.botaoMaisMenos}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Minuto */}
              <View style={styles.containerTempo}>
                <Text>Minuto</Text>
                <View style={styles.selecao}>
                  <TouchableOpacity onPress={() => setMinutoSelecionado(m => (m + 10) % 60)}>
                    <Text style={styles.botaoMaisMenos}>▲</Text>
                  </TouchableOpacity>

                  <Text style={styles.horaTexto}>{minutoSelecionado < 10 ? `0${minutoSelecionado}` : minutoSelecionado}</Text>

                  <TouchableOpacity onPress={() => setMinutoSelecionado(m => (m === 0 ? 50 : m - 10))}>
                    <Text style={styles.botaoMaisMenos}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* AM/PM */}
              <View style={styles.containerTempo}>
                <Text>Período</Text>
                <TouchableOpacity onPress={() => setPeriodo(p => p === "AM" ? "PM" : "AM")}>
                  <Text style={styles.horaTexto}>{periodo}</Text>
                </TouchableOpacity>
              </View>
            </View>


            <TouchableOpacity
              style={styles.btnAdicionar}
              onPress={adicionarTarefa}
            >
              <Text style={styles.btnAdicionarTxt}>
                {tarefaEditando ? "FINALIZAR EDIÇÃO" : "ADICIONAR A LISTA"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmação para apagar todas as tarefas */}
      <Modal
        visible={modalConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloApagar}>Tem certeza que deseja apagar todas as tarefas?</Text>

            <View style={styles.botaoModal}>
              <TouchableOpacity
                style={[styles.btnAdicionar, { backgroundColor: "#DAA792" }]}
                onPress={() => {
                  apagarTodasTarefas();
                  setModalConfirmVisible(false);
                }}
              >
                <Text style={styles.btnAdicionarTxt}>Sim</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAdicionar, { backgroundColor: "#aaa" }]}
                onPress={() => setModalConfirmVisible(false)}
              >
                <Text style={styles.btnAdicionarTxt}>Não</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saudacao: {
    fontSize: 28,
    fontFamily: "GaramondBold",
    marginBottom: 6,
    color: "#383A39",
  },
  subtitulo: {
    fontSize: 14,
    fontFamily: "Garamond",
    color: '#555',
    color: "#383A39",
  },
  divisor: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
    width: '80%',
  },
  imagem: {
    width: 150,
    height: 200,
    resizeMode: 'contain',
  },

  /* Lista de tarefas */
  card: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 20,
  },
  data: {
    fontSize: 30,
    fontFamily: "Emblema",
    marginBottom: 12,
    color: "#383A39",
  },
  dataNum: {
    fontSize: 42,
    fontFamily: "Emblema",
    color: "#383A39",
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    fontFamily: "Garamond",
  },

  /* RenderItem */
  tarefa: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  barra: {
    width: 2.5,
    height: "100%",
    backgroundColor: "#DAA792",
    borderRadius: 2,
    marginRight: 10,
  },
  botaoRender: {
    flex: 1,
  },
  conteudoTarefa: {
    flex: 1,
  },
  tituloContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hora: {
    fontSize: 13,
    fontFamily: "Garamond",
    fontStyle: "italic",
    color: "#b8b8b8ff",
  },
  tituloTarefa: {
    fontSize: 16,
    color: "#383A39",
    fontFamily: "GaramondBold",
    marginTop: -2,
  },
  descricao: {
    fontSize: 11,
    fontFamily: "Garamond",
    color: "#555",
  },

  /* Botões para adicionar e apagar todas tarefas */
  botoesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginVertical: 20,
  },
  btnMais: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  mais: {
    fontSize: 28,
    color: "#000",
  },
  btnApagarTudo: {
    backgroundColor: "#DAA792",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  apagarTexto: {
    color: "#fff",
    fontFamily: "GaramondBold",
    fontSize: 14,
  },

  /* Modal para criar/editar tarefa e de confirmação*/
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  btnFecharModal: {
    position: "absolute",
    top: 3,
    right: 16,
    zIndex: 1,
  },
  fecharTxt: {
    fontSize: 38,
    color: "#DAA792",
    fontFamily: "GaramondBold",
  },
  modalTitulo: {
    fontSize: 20,
    fontFamily: "GaramondBold",
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#DAA792",
    marginBottom: 16,
    fontFamily: "Garamond",
    paddingVertical: 6,
  },
  modalTituloApagar: {
    fontSize: 20,
    fontFamily: "GaramondBold",
    marginBottom: 12,
    textAlign: "center",
  },
  botaoModal: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  /* Selecao de Hora */
  selecaoHora: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  containerTempo: {
    alignItems: "center",
  },
  selecao: {
    flexDirection: "row",
    alignItems: "center",
  },
  botaoMaisMenos: {
    fontSize: 18,
    color: "#DAA792",
    marginHorizontal: 4,
  },
  horaTexto: {
    fontSize: 16,
    fontFamily: "GaramondBold",
    marginHorizontal: 4,
  },
  btnAdicionar: {
    backgroundColor: "#DAA792",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  btnAdicionarTxt: {
    color: "#fff",
    fontFamily: "GaramondBold",
    fontSize: 14,
  },
});
