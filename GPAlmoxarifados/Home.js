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

const API_URL = "http://10.154.20.173:5000/api/produtos";
// Base da URL caso sua API retorne apenas o caminho relativo da imagem (ex: "uploads/foto.jpg")
const BASE_URL_IMAGEM = "http://10.154.20.173:5000";

export default function Home({ navigation }) {
  const [produtos, setProdutos] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Estados para gerenciar a imagem ampliada
  const [modalVisivel, setModalVisivel] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  const buscarProdutos = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, { method: 'GET' });
      const responseText = await response.text();
      console.log("Resposta Bruta da API de Produtos:", responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        setProdutos(data);
      } else {
        Alert.alert("Erro na API", `Código HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Processamento", "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  // Trata a URL da imagem vinda do banco de dados
  const obterUriImagem = (item) => {
    // Substitua 'item.imagem' pelo nome da sua coluna de imagem no banco (ex: item.foto, item.url_imagem, item.imagem_base64)
    const campoImagem = item.imagem || item.foto || item.url_imagem;

    if (!campoImagem) return null;

    // Se já for uma imagem em Base64 ou uma URL completa do tipo http://...
    if (campoImagem.startsWith('data:') || campoImagem.startsWith('http')) {
      return { uri: campoImagem };
    }

    // Se a API retornar apenas o caminho (ex: "/uploads/produto1.png"), concatena com o IP do servidor
    return { uri: `${BASE_URL_IMAGEM}${campoImagem.startsWith('/') ? '' : '/'}${campoImagem}` };
  };

  const lidarComCliqueProduto = (item) => {
    const fonteImagem = obterUriImagem(item);
    if (fonteImagem) {
      setImagemSelecionada(fonteImagem);
      setModalVisivel(true);
    } else {
      Alert.alert("Aviso", "Este produto não possui imagem cadastrada no banco.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Painel de Produtos</Text>
        <TouchableOpacity style={styles.botaoSair} onPress={() => navigation.navigate('Index')}>
          <Text style={styles.textoBotaoSair}>Sair</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitulo}>Produtos retornados pela API (Clique para abrir a imagem):</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#192a6b" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          refreshing={loading}
          onRefresh={buscarProdutos}
          renderItem={({ item }) => {
            const fonteImagem = obterUriImagem(item);
            return (
              <TouchableOpacity 
                style={styles.cardProduto} 
                onPress={() => lidarComCliqueProduto(item)}
                activeOpacity={0.7}
              >
                <View style={styles.conteudoCard}>
                  {/* Miniatura da imagem à esquerda */}
                  {fonteImagem ? (
                    <Image source={fonteImagem} style={styles.miniatura} />
                  ) : (
                    <View style={[styles.miniatura, styles.miniaturaSemFoto]}>
                      <Text style={styles.textoSemFoto}>🖼️</Text>
                    </View>
                  )}

                  <View style={styles.infoProduto}>
                    <Text style={styles.nomeProduto}>📦 {item.nome || item.nome_produto || "Produto sem Nome"}</Text>
                    <Text style={styles.detalhesProduto}>
                      ID: {item.id} {item.preco ? `| Preço: R$ ${item.preco}` : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.listaVazia}>Nenhum produto listado. Puxe para baixo para recarregar.</Text>
          }
        />
      )}

      {/* Modal para Visualização da Imagem Ampliada */}
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
              <Text style={styles.textoFecharModal}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitulo: { fontSize: 22, fontWeight: 'bold', color: '#192a6b' },
  botaoSair: { backgroundColor: '#dc3545', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 6 },
  textoBotaoSair: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 15, fontWeight: '600' },
  cardProduto: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, elevation: 2 },
  conteudoCard: { flexDirection: 'row', alignItems: 'center' },
  miniatura: { width: 50, height: 50, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
  miniaturaSemFoto: { justifyContent: 'center', alignItems: 'center' },
  textoSemFoto: { fontSize: 18 },
  infoProduto: { flex: 1 },
  nomeProduto: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  detalhesProduto: { fontSize: 12, color: '#777', marginTop: 4 },
  listaVazia: { textAlign: 'center', color: '#999', marginTop: 30, fontSize: 14 },
  
  // Estilos do Modal da Imagem
  containerModal: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fundoModal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.75)' },
  conteudoModal: { width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 15, alignItems: 'center', elevation: 10 },
  imagemAmpliada: { width: '100%', height: 300, borderRadius: 8 },
  botaoFecharModal: { marginTop: 15, backgroundColor: '#192a6b', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 6 },
  textoFecharModal: { color: '#fff', fontWeight: 'bold' }
});
