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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Substitua pelo IP correto da sua API do backend
const API_URL = 'http://10.154.20.141:5000/api/cadastrar'; 

export default function CadastroItem({ navigation }) {
  const [nome, setNome] = useState('');
  const [qtde, setQtde] = useState('');
  const [preco, setPreco] = useState('');
  const [estoqueMin, setEstoqueMin] = useState('');
  const [foto, setFoto] = useState('');
  const [descricao, setDescdescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!nome.trim() || !qtde.trim() || !preco.trim() || !estoqueMin.trim()) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha todos os campos obrigatórios.");
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
          qtde: parseInt(qtde),
          preco: parseFloat(preco.replace(',', '.')),
          estoque_min: parseInt(estoqueMin),
          foto: foto.trim(),
          descricao: descricao.trim()
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { mensagem: responseText };
      }

      if (response.ok) {
        Alert.alert("Sucesso", "Item cadastrado com sucesso no banco de dados!");
        setNome('');
        setQtde('');
        setPreco('');
        setEstoqueMin('');
        setFoto('');
        setDescdescricao('');
        navigation.navigate('Home');
      } else {
        Alert.alert("Erro ao Cadastrar", data.erro || data.mensagem || "Não foi possível salvar o item.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      Alert.alert("Falha de Conexão", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BARRA DO TOPO */}
      <View style={styles.barraTopo}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={styles.textoVoltar}>Voltar</Text>
        </TouchableOpacity>
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Logo_Senai.svg' }}
          style={styles.logoTopo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.containerFormulario}>
          
          <Text style={styles.tituloHeader}>CADASTRO DE ITEM</Text>

          {/* Campo Nome */}
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

          {/* Campo Qtde */}
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

          {/* Campo Preço */}
          <View style={styles.inputGroup}>
            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Preço</Text>
            </View>
            <TextInput 
              style={styles.formControl}
              placeholder="Preço (ex: 15.50)"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              value={preco}
              onChangeText={setPreco}
              editable={!loading}
            />
          </View>

          {/* Campo Estoque Mínimo */}
          <View style={styles.inputGroup}>
            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Est. Mínimo</Text>
            </View>
            <TextInput 
              style={styles.formControl}
              placeholder="Estoque Mínimo"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={estoqueMin}
              onChangeText={setEstoqueMin}
              editable={!loading}
            />
          </View>

          {/* Campo Foto */}
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

          {/* Campo Descrição */}
          <View style={styles.inputGroup}>
            <View style={styles.inputGroupText}>
              <Text style={styles.labelText}>Descrição</Text>
            </View>
            <TextInput 
              style={styles.formControl}
              placeholder="Descrição do item"
              placeholderTextColor="#94a3b8"
              value={descricao}
              onChangeText={setDescdescricao}
              editable={!loading}
            />
          </View>

          {/* Botão Enviar */}
          <TouchableOpacity 
            style={[styles.btnEnviar, loading && { opacity: 0.7 }]} 
            onPress={handleCadastrar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnEnviarTexto}>Adicionar no banco de dados</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
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
  botaoVoltar: {
    padding: 8
  },
  textoVoltar: {
    color: '#002A54',
    fontWeight: 'bold'
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
  btnEnviar: {
    backgroundColor: '#002A54',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    elevation: 2
  },
  btnEnviarTexto: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase'
  }
});
