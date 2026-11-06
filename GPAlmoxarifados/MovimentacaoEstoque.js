import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const API_PRODUTOS = 'http://10.154.20.141:5000/api/produtos';
const API_MOVIMENTACAO = 'http://10.154.20.141:5000/api/movimentacao';

export default function MovimentacaoEstoque({ navigation }) {

  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [tipo, setTipo] = useState('');
  const [finalidade, setFinalidade] = useState('');

  const [modalProdutos, setModalProdutos] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [loading, setLoading] = useState(false);

  // CARREGAR PRODUTOS
  const carregarProdutos = async () => {
    setLoadingProdutos(true);

    try {
      const response = await fetch(API_PRODUTOS, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao carregar produtos.');
      }

      setProdutos(data);

    } catch (error) {
      console.error(error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível carregar os produtos.'
      );

    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // NAVEGAÇÃO DO MENU
  const navegar = (tela) => {
    setMenuVisivel(false);
    navigation.navigate(tela);
  };

  // SELECIONAR PRODUTO
  const selecionarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setModalProdutos(false);
  };

  // LIMPAR FORMULÁRIO
  const limparFormulario = () => {
    setProdutoSelecionado(null);
    setQuantidade('');
    setTipo('');
    setFinalidade('');
  };

  // REGISTRAR MOVIMENTAÇÃO
  const handleMovimentacao = async () => {

    if (!produtoSelecionado) {
      Alert.alert('Atenção', 'Selecione um produto.');
      return;
    }

    const quantidadeNumero = Number(quantidade);

    if (
      !quantidade.trim() ||
      !Number.isInteger(quantidadeNumero) ||
      quantidadeNumero <= 0
    ) {
      Alert.alert(
        'Quantidade inválida',
        'Informe uma quantidade inteira maior que zero.'
      );
      return;
    }

    if (!tipo) {
      Alert.alert('Atenção', 'Selecione Entrada ou Saída.');
      return;
    }

    if (tipo === 'saida' && !finalidade.trim()) {
      Alert.alert(
        'Atenção',
        'Informe a finalidade da saída.'
      );
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(API_MOVIMENTACAO, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },

        body: JSON.stringify({
          item: produtoSelecionado.nome,
          quantidade: quantidadeNumero,
          tipo: tipo,
          finalidade: finalidade.trim()
        })
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('O servidor retornou uma resposta inválida.');
      }

      if (!response.ok) {
        Alert.alert(
          'Erro na movimentação',
          data.erro || data.mensagem || 'Não foi possível registrar.'
        );
        return;
      }

      Alert.alert(
        'Sucesso!',
        data.mensagem || 'Movimentação registrada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              limparFormulario();
              carregarProdutos();
            }
          }
        ]
      );

    } catch (error) {

      console.error('Erro:', error);

      Alert.alert(
        'Falha na conexão',
        error.message || 'Não foi possível conectar ao servidor.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (

    <SafeAreaView style={styles.container}>

      {/* CABEÇALHO COM MENU DE TRÊS TRACINHOS */}

      <View style={styles.barraTopo}>

        <TouchableOpacity
          style={styles.botaoToggler}
          onPress={() => setMenuVisivel(true)}
        >
          <View style={styles.hamburgerLinha} />
          <View style={styles.hamburgerLinha} />
          <View style={styles.hamburgerLinha} />
        </TouchableOpacity>

      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.formulario}>

          <Text style={styles.titulo}>
            MOVIMENTAÇÃO DE ESTOQUE
          </Text>

          <Text style={styles.subtitulo}>
            Registre entradas e saídas de materiais.
          </Text>

          {/* PRODUTO */}

          <View style={styles.grupo}>

            <Text style={styles.label}>Item</Text>

            <TouchableOpacity
              style={styles.seletor}
              onPress={() => setModalProdutos(true)}
              disabled={loading || loadingProdutos}
            >

              <Text style={styles.textoSeletor}>
                {produtoSelecionado
                  ? produtoSelecionado.nome
                  : 'Selecione o item'}
              </Text>

              <Text style={styles.seta}>▼</Text>

            </TouchableOpacity>

            {loadingProdutos && (
              <ActivityIndicator
                color="#002A54"
                style={{ marginTop: 10 }}
              />
            )}

            {!loadingProdutos && produtos.length === 0 && (
              <TouchableOpacity onPress={carregarProdutos}>
                <Text style={styles.atualizar}>
                  Nenhum produto encontrado. Atualizar lista.
                </Text>
              </TouchableOpacity>
            )}

          </View>

          {/* QUANTIDADE */}

          <View style={styles.grupo}>

            <Text style={styles.label}>Quantidade</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a quantidade"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={quantidade}
              onChangeText={setQuantidade}
              editable={!loading}
            />

          </View>

          {/* TIPO DE MOVIMENTAÇÃO */}

          <View style={styles.grupo}>

            <Text style={styles.label}>
              Tipo de movimentação
            </Text>

            <View style={styles.linhaTipo}>

              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipo === 'entrada' && styles.entradaAtiva
                ]}
                onPress={() => {
                  setTipo('entrada');
                  setFinalidade('');
                }}
                disabled={loading}
              >
                <Text style={styles.tipoTexto}>
                  + Entrada
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipo === 'saida' && styles.saidaAtiva
                ]}
                onPress={() => setTipo('saida')}
                disabled={loading}
              >
                <Text style={styles.tipoTexto}>
                  - Saída
                </Text>
              </TouchableOpacity>

            </View>

          </View>

          {/* FINALIDADE */}

          {tipo === 'saida' && (

            <View style={styles.grupo}>

              <Text style={styles.label}>
                Finalidade da saída
              </Text>

              <TextInput
                style={styles.textArea}
                placeholder="Digite a justificativa da saída..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={finalidade}
                onChangeText={setFinalidade}
                editable={!loading}
              />

            </View>

          )}

          {/* BOTÃO MOVIMENTAR */}

          <TouchableOpacity
            style={[
              styles.botaoEnviar,
              loading && { opacity: 0.7 }
            ]}
            onPress={handleMovimentacao}
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotao}>
                SOLICITAR MOVIMENTAÇÃO
              </Text>
            )}

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoAtualizar}
            onPress={carregarProdutos}
            disabled={loadingProdutos || loading}
          >

            <Text style={styles.textoAtualizar}>
              Atualizar produtos
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* MENU LATERAL */}

      <Modal
        visible={menuVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisivel(false)}
      >

        <View style={styles.offcanvasOverlay}>

          <View style={styles.offcanvasContainer}>

            <View style={styles.offcanvasHeader}>

              <Text style={styles.offcanvasTitle}>
                Menu de Navegação
              </Text>

              <TouchableOpacity
                onPress={() => setMenuVisivel(false)}
              >

                <Text style={styles.btnClose}>
                  ✕
                </Text>

              </TouchableOpacity>

            </View>

            <View style={styles.offcanvasBody}>

              {/* LOGIN */}

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Login')}
              >

                <Text style={styles.navText}>
                  Login
                </Text>

              </TouchableOpacity>

              {/* CADASTRO */}

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Cadastro')}
              >

                <Text style={styles.navText}>
                  Cadastro de Perfil
                </Text>

              </TouchableOpacity>

              {/* HOME */}

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Home')}
              >

                <Text style={styles.navText}>
                  Lista de Materiais
                </Text>

              </TouchableOpacity>

              {/* CADASTRO DE ITEM */}

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('CadastroItem')}
              >

                <Text style={styles.navText}>
                  Cadastro de Item
                </Text>

              </TouchableOpacity>

              {/* MOVIMENTAÇÃO */}

              <TouchableOpacity
                style={[
                  styles.navItem,
                  styles.navItemActive
                ]}
                onPress={() => setMenuVisivel(false)}
              >

                <Text
                  style={[
                    styles.navText,
                    styles.navTextActive
                  ]}
                >
                  Movimentação de Estoque
                </Text>

              </TouchableOpacity>

            </View>

          </View>

          <TouchableOpacity
            style={styles.offcanvasBackdropTouch}
            activeOpacity={1}
            onPress={() => setMenuVisivel(false)}
          />

        </View>

      </Modal>

      {/* MODAL DE SELEÇÃO DE PRODUTOS */}

      <Modal
        visible={modalProdutos}
        transparent
        animationType="slide"
        onRequestClose={() => setModalProdutos(false)}
      >

        <View style={styles.modalFundo}>

          <View style={styles.modalContainer}>

            <Text style={styles.modalTitulo}>
              Selecionar produto
            </Text>

            <FlatList
              data={produtos}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"

              ListEmptyComponent={
                <Text style={styles.vazio}>
                  Nenhum produto encontrado.
                </Text>
              }

              renderItem={({ item }) => (

                <TouchableOpacity
                  style={styles.produtoItem}
                  onPress={() => selecionarProduto(item)}
                >

                  <View>

                    <Text style={styles.produtoNome}>
                      {item.nome}
                    </Text>

                    <Text style={styles.produtoEstoque}>
                      Estoque atual: {item.quantidade}
                    </Text>

                  </View>

                  <Text style={styles.seta}>›</Text>

                </TouchableOpacity>

              )}

            />

            <TouchableOpacity
              style={styles.botaoFechar}
              onPress={() => setModalProdutos(false)}
            >

              <Text style={styles.textoBotao}>
                FECHAR
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
}


// ESTILOS

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f4f6f9'
  },

  barraTopo: {
    height: 74,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#FF8C00',
    elevation: 4
  },

  // TRÊS TRACINHOS

  botaoToggler: {
    padding: 8,
    justifyContent: 'space-around',
    height: 35,
    width: 35
  },

  hamburgerLinha: {
    width: 24,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 16
  },

  formulario: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 500,
    padding: 25,
    borderRadius: 15,
    elevation: 5
  },

  titulo: {
    color: '#002A54',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 20,
    marginBottom: 8
  },

  subtitulo: {
    color: '#777',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 25
  },

  grupo: {
    marginBottom: 18
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },

  input: {
    backgroundColor: '#f1f3f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d5dce5',
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333'
  },

  textArea: {
    backgroundColor: '#f1f3f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d5dce5',
    padding: 15,
    height: 100,
    fontSize: 14,
    color: '#333'
  },

  seletor: {
    backgroundColor: '#f1f3f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d5dce5',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  textoSeletor: {
    color: '#333',
    fontSize: 14
  },

  seta: {
    color: '#002A54',
    fontSize: 18
  },

  linhaTipo: {
    flexDirection: 'row',
    gap: 12
  },

  tipoBotao: {
    flex: 1,
    backgroundColor: '#f1f3f6',
    borderWidth: 1,
    borderColor: '#d5dce5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center'
  },

  entradaAtiva: {
    backgroundColor: '#e1f5e9',
    borderColor: '#198754'
  },

  saidaAtiva: {
    backgroundColor: '#fff0e6',
    borderColor: '#FF8C00'
  },

  tipoTexto: {
    fontWeight: '700',
    color: '#002A54',
    fontSize: 14
  },

  botaoEnviar: {
    backgroundColor: '#002A54',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    height: 50,
    elevation: 3
  },

  textoBotao: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14
  },

  botaoAtualizar: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8
  },

  textoAtualizar: {
    color: '#002A54',
    fontWeight: '600',
    fontSize: 13
  },

  atualizar: {
    color: '#002A54',
    fontSize: 12,
    marginTop: 8
  },

  // MENU LATERAL

  offcanvasOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },

  offcanvasBackdropTouch: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },

  offcanvasContainer: {
    width: '75%',
    maxWidth: 300,
    backgroundColor: '#fff',
    height: '100%',
    padding: 20,
    elevation: 10
  },

  offcanvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
    marginBottom: 20
  },

  offcanvasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155'
  },

  btnClose: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666'
  },

  offcanvasBody: {
    gap: 10
  },

  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6
  },

  navItemActive: {
    backgroundColor: '#f1f5f9'
  },

  navText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500'
  },

  navTextActive: {
    color: '#0d6efd',
    fontWeight: 'bold'
  },

  // MODAL DE PRODUTOS

  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '75%'
  },

  modalTitulo: {
    fontSize: 19,
    fontWeight: '800',
    color: '#002A54',
    textAlign: 'center',
    marginBottom: 15
  },

  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },

  produtoNome: {
    color: '#002A54',
    fontSize: 15,
    fontWeight: '700'
  },

  produtoEstoque: {
    color: '#777',
    fontSize: 12,
    marginTop: 4
  },

  vazio: {
    textAlign: 'center',
    color: '#777',
    padding: 20
  },

  botaoFechar: {
    backgroundColor: '#002A54',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15
  }

});
