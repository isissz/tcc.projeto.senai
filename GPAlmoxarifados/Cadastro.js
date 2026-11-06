
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
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://10.154.20.141:5000/api/usuarios';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [permissao, setPermissao] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuVisivel, setMenuVisivel] = useState(false);

  const handleCadastrarUsuario = async () => {
    if (!nome.trim() || !senha.trim() || !permissao) {
      Alert.alert(
        'Campos Obrigatórios',
        'Por favor, preencha todos os campos e selecione a permissão.'
      );
      return;
    }

    if (senha.length < 8) {
      Alert.alert(
        'Senha Curta',
        'A senha precisa ter no mínimo 8 caracteres.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nome: nome.trim(),
          senha: senha,
          permissao: permissao
        })
      });

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { mensagem: responseText };
      }

      if (response.ok) {
        Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
        setNome('');
        setSenha('');
        setPermissao('');
      } else {
        Alert.alert(
          'Erro ao Cadastrar',
          data.erro || data.mensagem || 'Não foi possível criar o usuário.'
        );
      }

    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert(
        'Falha de Conexão',
        'Não foi possível conectar ao servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Navegação do menu
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

      {/* FORMULÁRIO */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.containerFormulario}>

          <Text style={styles.tituloHeader}>
            CADASTRO DE USUÁRIO
          </Text>

          {/* NOME */}
          <View style={styles.inputGroup}>
            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Nome</Text>
            </View>

            <TextInput
              style={styles.formControl}
              placeholder="Nome de usuário"
              placeholderTextColor="#94a3b8"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* SENHA */}
          <View style={styles.inputGroup}>
            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Senha</Text>
            </View>

            <TextInput
              style={styles.formControl}
              placeholder="Mínimo de 8 caracteres"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              editable={!loading}
            />
          </View>

          {/* PERMISSÃO */}
          <View style={styles.inputGroupTextContainer}>
            <Text style={styles.labelPermissao}>
              Categoria / Permissão
            </Text>

            <View style={styles.opcoesContainer}>
              <TouchableOpacity
                style={[
                  styles.botaoOpcao,
                  permissao === 'comum' && styles.opcaoSelecionada
                ]}
                onPress={() => setPermissao('comum')}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.textoOpcao,
                    permissao === 'comum' && styles.textoOpcaoSelecionada
                  ]}
                >
                  Usuário Comum
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoOpcao,
                  permissao === 'admin' && styles.opcaoSelecionada
                ]}
                onPress={() => setPermissao('admin')}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.textoOpcao,
                    permissao === 'admin' && styles.textoOpcaoSelecionada
                  ]}
                >
                  Administrador
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTÃO CADASTRAR */}
          <TouchableOpacity
            style={[
              styles.btnEnviar,
              loading && { opacity: 0.7 }
            ]}
            onPress={handleCadastrarUsuario}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnEnviarTexto}>
                ADICIONAR
              </Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* MENU LATERAL */}
      <Modal
        visible={menuVisivel}
        transparent
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

              {/* LOGIN */}
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Login')}
              >
                <Text style={styles.navText}>Login</Text>
              </TouchableOpacity>

              {/* CADASTRO DE USUÁRIOS */}
              <TouchableOpacity
                style={[styles.navItem, styles.navItemActive]}
                onPress={() => setMenuVisivel(false)}
              >
                <Text style={[styles.navText, styles.navTextActive]}>
                  Cadastro de Usuários
                </Text>
              </TouchableOpacity>

              {/* LISTA DE MATERIAIS */}
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

              {/* MOVIMENTAÇÃO DE ESTOQUE */}
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => navegar('Movimentacao')}
              >
                <Text style={styles.navText}>
                  Movimentação de Estoque
                </Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* FUNDO ESCURO */}
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
    shadowOffset: { width: 0, height: 2 },
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

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16
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
    elevation: 5
  },

  tituloHeader: {
    color: '#002A54',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 25,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    overflow: 'hidden'
  },

  inputGroupText: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    minWidth: 110
  },

  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },

  formControl: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155'
  },

  inputGroupTextContainer: {
    marginBottom: 15
  },

  labelPermissao: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },

  opcoesContainer: {
    flexDirection: 'row',
    gap: 10
  },

  botaoOpcao: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },

  opcaoSelecionada: {
    backgroundColor: '#002A54',
    borderColor: '#002A54'
  },

  textoOpcao: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },

  textoOpcaoSelecionada: {
    color: '#ffffff'
  },

  btnEnviar: {
    backgroundColor: '#002A54',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2
  },

  btnEnviarTexto: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase'
  },

  // MENU LATERAL

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
  }

});
