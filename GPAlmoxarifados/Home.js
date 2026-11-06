
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://10.154.20.141:5000/api/produtos';
const BASE_URL_IMAGEM = 'http://10.154.20.141:5000/api/produtos';

export default function Home({ navigation }) {

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  const [menuVisivel, setMenuVisivel] = useState(false);

  // BUSCAR PRODUTOS
  const buscarProdutos = async () => {

    setLoading(true);

    try {

      const response = await fetch(API_URL, {
        method: 'GET'
      });

      const responseText = await response.text();

      if (response.ok) {

        const data = JSON.parse(responseText);
        setProdutos(data);

      } else {

        Alert.alert(
          'Erro na API',
          `Código HTTP: ${response.status}`
        );

      }

    } catch (error) {

      console.error(error);

      Alert.alert(
        'Erro de Processamento',
        'Não foi possível carregar os dados.'
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  // OBTER IMAGEM DO PRODUTO
  const obterUriImagem = (item) => {

    const campoImagem =
      item.imagem || item.foto || item.url_imagem;

    if (!campoImagem) return null;

    if (
      campoImagem.startsWith('data:') ||
      campoImagem.startsWith('http')
    ) {
      return { uri: campoImagem };
    }

    return {
      uri: `${BASE_URL_IMAGEM}${campoImagem.startsWith('/') ? '' : '/'}${campoImagem}`
    };

  };

  // VISUALIZAR IMAGEM
  const lidarComCliqueProduto = (item) => {

    const fonteImagem = obterUriImagem(item);

    if (fonteImagem) {

      setImagemSelecionada(fonteImagem);
      setModalVisivel(true);

    } else {

      Alert.alert(
        'Aviso',
        'Este produto não possui imagem cadastrada no banco.'
      );

    }

  };

  // NAVEGAÇÃO DO MENU
  const navegar = (tela) => {

    setMenuVisivel(false);

    navigation.navigate(tela);

  };

  return (

    <SafeAreaView style={styles.container}>

      {/* BARRA DO TOPO */}

      <View style={styles.barraTopo}>

        <TouchableOpacity
          style={styles.botaoToggler}
          onPress={() => setMenuVisivel(true)}
        >

          <View style={styles.hamburgerLinha} />
          <View style={styles.hamburgerLinha} />
          <View style={styles.hamburgerLinha} />

        </TouchableOpacity>

        <Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Logo_Senai.svg'
          }}
          style={styles.logoTopo}
          resizeMode="contain"
        />

      </View>

      {/* LISTA DE MATERIAIS */}

      <View style={styles.mainWrapper}>

        <View style={styles.containerTabela}>

          <Text style={styles.tituloTabela}>
            LISTA DE MATERIAIS DO ALMOXARIFADO
          </Text>

          {loading ? (

            <ActivityIndicator
              size="large"
              color="#002A54"
              style={{
                flex: 1,
                marginVertical: 40
              }}
            />

          ) : (

            <FlatList
              data={produtos}
              keyExtractor={(item, index) =>
                item.id
                  ? item.id.toString()
                  : index.toString()
              }
              refreshing={loading}
              onRefresh={buscarProdutos}

              renderItem={({ item }) => {

                return (

                  <View style={styles.produtoRow}>

                    <Text style={styles.produtoId}>
                      {item.id}
                    </Text>

                    <View style={styles.produtoFotoContainer}>

                      <TouchableOpacity
                        style={styles.btnVisualizar}
                        onPress={() => lidarComCliqueProduto(item)}
                      >

                        <Text style={styles.btnVisualizarTexto}>
                          Visualizar
                        </Text>

                      </TouchableOpacity>

                    </View>

                    <Text
                      style={styles.produtoNome}
                      numberOfLines={1}
                    >
                      {item.nome || item.nome_produto}
                    </Text>

                    <View style={styles.badgeQtd}>

                      <Text style={styles.badgeQtdTexto}>
                        {item.quantidade || item.qtd || 0}
                      </Text>

                    </View>

                  </View>

                );

              }}

              ListEmptyComponent={

                <Text style={styles.listaVazia}>
                  Nenhum produto listado. Puxe para baixo para recarregar.
                </Text>

              }

            />

          )}

        </View>

      </View>

      {/* MENU LATERAL */}

      <Modal
        visible={menuVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisivel(false)}
      >

        <View style={styles.offcanvasOverlay}>

          <View style={styles.offcanvasContainer}>

            {/* CABEÇALHO DO MENU */}

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

            {/* OPÇÕES DO MENU */}

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

              {/* CADASTRO DE USUÁRIOS */}

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Cadastro')}
              >

                <Text style={styles.navText}>
                  Cadastro de Perfil
                </Text>

              </TouchableOpacity>

              {/* LISTA DE MATERIAIS */}

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

              {/* NOVA OPÇÃO: MOVIMENTAÇÃO DE ESTOQUE */}

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('MovimentacaoEstoque')}
              >

                <Text style={styles.navText}>
                  Movimentação de Estoque
                </Text>

              </TouchableOpacity>

            </View>

          </View>

          {/* FUNDO PARA FECHAR MENU */}

          <TouchableOpacity
            style={styles.offcanvasBackdropTouch}
            activeOpacity={1}
            onPress={() => setMenuVisivel(false)}
          />

        </View>

      </Modal>

      {/* MODAL DE IMAGEM AMPLIADA */}

      <Modal
        visible={modalVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >

        <View style={styles.containerModal}>

          <TouchableOpacity
            style={styles.fundoModal}
            activeOpacity={1}
            onPress={() => setModalVisivel(false)}
          />

          <View style={styles.conteudoModal}>

            {imagemSelecionada && (

              <Image
                source={imagemSelecionada}
                style={styles.imagemAmpliada}
                resizeMode="contain"
              />

            )}

            <TouchableOpacity
              style={styles.botaoFecharModal}
              onPress={() => setModalVisivel(false)}
            >

              <Text style={styles.textoFecharModal}>
                Fechar
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#FF8C00',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 10
  },

  botaoToggler: {
    padding: 8,
    justifyContent: 'space-around',
    height: 30,
    width: 35
  },

  hamburgerLinha: {
    width: 24,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2
  },

  logoTopo: {
    height: 45,
    width: 120
  },

  mainWrapper: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },

  containerTabela: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 950,
    flex: 1,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5
  },

  tituloTabela: {
    color: '#002A54',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 20,
    textTransform: 'uppercase'
  },

  produtoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },

  produtoId: {
    width: '15%',
    fontWeight: '600',
    color: '#334155'
  },

  produtoFotoContainer: {
    width: '25%',
    alignItems: 'center'
  },

  btnVisualizar: {
    borderWidth: 1,
    borderColor: '#0d6efd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },

  btnVisualizarTexto: {
    fontSize: 11,
    color: '#0d6efd',
    fontWeight: '600'
  },

  produtoNome: {
    width: '45%',
    color: '#334155',
    fontSize: 13,
    paddingHorizontal: 5
  },

  badgeQtd: {
    width: '15%',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center'
  },

  badgeQtdTexto: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600'
  },

  listaVazia: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    fontSize: 14
  },

  offcanvasOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },

  offcanvasBackdropTouch: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },

  offcanvasContainer: {
    width: '75%',
    maxWidth: 300,
    backgroundColor: '#ffffff',
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

  containerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  fundoModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  },

  conteudoModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 10
  },

  imagemAmpliada: {
    width: '100%',
    height: 300,
    borderRadius: 8
  },

  botaoFecharModal: {
    marginTop: 15,
    backgroundColor: '#002A54',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6
  },

  textoFecharModal: {
    color: '#fff',
    fontWeight: 'bold'
  }

});
