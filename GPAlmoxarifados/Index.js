
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// IP do computador + porta publicada pelo Docker + rota da API
const API_URL = 'http://10.154.20.173:5000/api/login';

export default function Index({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuario.trim() || !senha.trim()) {
      Alert.alert(
        'Campos Vazios',
        'Por favor, insira o usuário e a senha.'
      );
      return;
    }

    setLoading(true);

    try {
      console.log('URL da API:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          nome: usuario.trim(),
          senha,
        }),
      });

      const responseText = await response.text();

      console.log('Status HTTP:', response.status);
      console.log(
        'Content-Type:',
        response.headers.get('content-type')
      );
      console.log('Resposta da API:', responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `A API não retornou JSON válido.\n` +
          `Status HTTP: ${response.status}\n` +
          `Resposta: ${responseText.slice(0, 250) || '(vazia)'}`
        );
      }

      if (!response.ok) {
        Alert.alert(
          'Erro no Login',
          data.erro ||
            data.mensagem ||
            `O servidor retornou HTTP ${response.status}.`
        );
        return;
      }

      // Confirme se sua API usa outro campo para indicar sucesso.
      Alert.alert('Sucesso', 'Acesso validado!');
      setUsuario('');
      setSenha('');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro no login:', error);

      Alert.alert(
        'Falha na Conexão',
        error.message ||
          'Não foi possível conectar ao servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.body}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.formCard}>
              <Text style={styles.titulo}>Entrar</Text>

              <TextInput
                style={styles.input}
                placeholder="Usuário"
                placeholderTextColor="#999"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#999"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
                editable={!loading}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  loading && { opacity: 0.7 },
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.textoButton}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkCadastro}
                onPress={() => navigation.navigate('Cadastro')}
                disabled={loading}
              >
                <Text style={styles.textoLinkCadastro}>
                  Não tem conta? Cadastre-se
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoPular}
                onPress={() => navigation.navigate('Home')}
                disabled={loading}
              >
                <Text style={styles.textoBotaoPular}>
                  Avançar sem API (Modo de Teste)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#192a6b',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    padding: 25,
    elevation: 5,
  },
  formCard: {
    alignItems: 'center',
    width: '100%',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#eee',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#192a6b',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 45,
  },
  textoButton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  linkCadastro: {
    marginTop: 20,
  },
  textoLinkCadastro: {
    color: '#192a6b',
    fontSize: 14,
    fontWeight: '500',
  },
  botaoPular: {
    marginTop: 15,
    padding: 5,
  },
  textoBotaoPular: {
    color: '#888',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
