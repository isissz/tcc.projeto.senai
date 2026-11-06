
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://10.154.20.141:5000/api/produtos';

export default function CadastroItem({ navigation }) {

  const [nome, setNome] = useState('');
  const [qtde, setQtde] = useState('');
  const [preco, setPreco] = useState('');
  const [estoqueMin, setEstoqueMin] = useState('');
  const [foto, setFoto] = useState('');
  const [descricao, setDescricao] = useState('');

  const [loading, setLoading] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(false);

  // NAVEGAÇÃO DO MENU
  const navegar = (tela) => {
    setMenuVisivel(false);
    navigation.navigate(tela);
  };

  // LIMPAR FORMULÁRIO
  const limparFormulario = () => {
    setNome('');
    setQtde('');
    setPreco('');
    setEstoqueMin('');
    setFoto('');
    setDescricao('');
  };

  // CADASTRAR PRODUTO
  const handleCadastrar = async () => {

    if (
      !nome.trim() ||
      !qtde.trim() ||
      !preco.trim() ||
      !estoqueMin.trim()
    ) {
      Alert.alert(
        'Campos obrigatórios',
        'Por favor, preencha todos os campos obrigatórios.'
      );
      return;
    }

    const quantidade = Number(qtde);
    const valor = Number(preco.trim().replace(',', '.'));
    const minimo = Number(estoqueMin);

    if (
      !Number.isInteger(quantidade) ||
      quantidade < 0 ||
      !Number.isFinite(valor) ||
      valor < 0 ||
      !Number.isInteger(minimo) ||
      minimo < 0
    ) {
      Alert.alert(
        'Dados inválidos',
        'Verifique a quantidade, o preço e o estoque mínimo.'
      );
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(API_URL, {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },

        body: JSON.stringify({

          nome: nome.trim(),
          quantidade: quantidade,
          preco: valor,
          estoque_min: minimo,
          foto: foto.trim(),
          descricao: descricao.trim(),

        }),

      });

      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { mensagem: responseText };
      }

      if (!response.ok) {

        Alert.alert(
          'Erro ao cadastrar',
          data.erro ||
          data.mensagem ||
          `Erro HTTP ${response.status}`
        );

        return;
      }

      Alert.alert(
        'Sucesso!',
        'Produto cadastrado com sucesso no banco de dados!',
        [
          {
            text: 'OK',
            onPress: () => {
              limparFormulario();
              navigation.navigate('Home');
            },
          },
        ]
      );

    } catch (error) {

      console.error('Erro na requisição:', error);

      Alert.alert(
        'Falha de conexão',
        'Não foi possível conectar ao servidor. Verifique o IP e se o Flask está iniciado.'
      );

    } finally {
      setLoading(false);
    }

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
            uri: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Logo_Senai.svg',
          }}
          style={styles.logoTopo}
          resizeMode="contain"
        />

      </View>

      {/* FORMULÁRIO */}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.containerFormulario}>

          <Text style={styles.tituloHeader}>
            CADASTRO DE ITEM
          </Text>

          {/* NOME */}

          <View style={styles.inputGroup}>

            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Nome</Text>
            </View>

            <TextInput
              style={styles.formControl}
              placeholder="Nome do item"
              placeholderTextColor="#94a3b8"
              value={nome}
              onChangeText={setNome}
              editable={!loading}
            />

          </View>

          {/* QUANTIDADE */}

          <View style={styles.inputGroup}>

            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Qtde</Text>
            </View>

            <TextInput
              style={styles.formControl}
              placeholder="Qtde em estoque"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={qtde}
              onChangeText={setQtde}
              editable={!loading}
            />

          </View>

          {/* PREÇO */}

          <View style={styles.inputGroup}>

            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Preço</Text>
            </View>

            <TextInput
              style={styles.formControl}
              placeholder="Preço (ex: 15,50)"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              value={preco}
              onChangeText={setPreco}
              editable={!loading}
            />

          </View>

          {/* ESTOQUE MÍNIMO */}

          <View style={styles.inputGroup}>

            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Est. Mínimo</Text>
            </View>

            <TextInput
              style={styles.formControl}
              placeholder="Estoque mínimo"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={estoqueMin}
              onChangeText={setEstoqueMin}
              editable={!loading}
            />

          </View>

          {/* FOTO */}

          <View style={styles.inputGroup}>

            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Foto</Text>
            </View>

            <TextInput
              style={styles.formControl}
              placeholder="Caminho ou URL da foto"
              placeholderTextColor="#94a3b8"
              value={foto}
              onChangeText={setFoto}
              autoCapitalize="none"
              editable={!loading}
            />

          </View>

          {/* DESCRIÇÃO */}

          <View style={styles.inputGroup}>

            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Descrição</Text>
            </View>

            <TextInput
              style={styles.formControl}
              placeholder="Descrição do item"
              placeholderTextColor="#94a3b8"
              value={descricao}
              onChangeText={setDescricao}
              editable={!loading}
            />

          </View>

          {/* BOTÃO CADASTRAR */}

          <TouchableOpacity
            style={[
              styles.btnEnviar,
              loading && { opacity: 0.7 },
            ]}
            onPress={handleCadastrar}
            disabled={loading}
          >

            {loading ? (

              <ActivityIndicator color="#ffffff" size="small" />

            ) : (

              <Text style={styles.btnEnviarTexto}>
                Adicionar no banco de dados
              </Text>

            )}

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
                <Text style={styles.btnClose}>✕</Text>
              </TouchableOpacity>

            </View>

            <View style={styles.offcanvasBody}>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Login')}
              >
                <Text style={styles.navText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Cadastro')}
              >
                <Text style={styles.navText}>Cadastro de Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Home')}
              >
                <Text style={styles.navText}>Lista de Materiais</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navItem,
                  styles.navItemActive
                ]}
                onPress={() => setMenuVisivel(false)}
              >
                <Text style={[
                  styles.navText,
                  styles.navTextActive
                ]}>
                  Cadastro de Item
                </Text>
              </TouchableOpacity>

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

          <TouchableOpacity
            style={styles.offcanvasBackdropTouch}
            activeOpacity={1}
            onPress={() => setMenuVisivel(false)}
          />

        </View>

      </Modal>

    </SafeAreaView>

  );

}


// ESTILOS

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 10,
  },

  botaoToggler: {
    padding: 8,
    justifyContent: 'space-around',
    height: 30,
    width: 35,
  },

  hamburgerLinha: {
    width: 24,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
  },

  logoTopo: {
    height: 45,
    width: 120,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  containerFormulario: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 500,
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },

  tituloHeader: {
    color: '#002A54',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },

  inputGroupText: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    minWidth: 110,
  },

  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  formControl: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
  },

  btnEnviar: {
    backgroundColor: '#002A54',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    elevation: 2,
  },

  btnEnviarTexto: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase',
  },

  // MENU LATERAL

  offcanvasOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  offcanvasBackdropTouch: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  offcanvasContainer: {
    width: '75%',
    maxWidth: 300,
    backgroundColor: '#ffffff',
    height: '100%',
    padding: 20,
    elevation: 10,
  },

  offcanvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 15,
    marginBottom: 20,
  },

  offcanvasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },

  btnClose: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },

  offcanvasBody: {
    gap: 10,
  },

  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
  },

  navItemActive: {
    backgroundColor: '#f1f5f9',
  },

  navText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },

  navTextActive: {
    color: '#0d6efd',
    fontWeight: 'bold',
  },

});
