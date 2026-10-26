import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Cadastro({ navigation }) {
  // Função para navegar simulando a escolha do tipo de acesso
  const selecionarPerfil = (tipoPerfil) => {
    // Aqui você pode redirecionar para a Home passando o tipo de perfil como parâmetro, se necessário
    navigation.navigate('Home', { perfil: tipoPerfil });
  };

  return (
    <View style={styles.body}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.formCard}>
              <Text style={styles.titulo}>Selecione o Perfil</Text>
              <Text style={styles.subtitulo}>Escolha como deseja acessar o painel:</Text>
              
              {/* Botão para entrar como Administrador */}
              <TouchableOpacity 
                style={[styles.button, styles.buttonAdmin]} 
                onPress={() => selecionarPerfil('admin')}
              >
                <Text style={styles.textoButton}>Entrar como Admin</Text>
              </TouchableOpacity>

              {/* Botão para entrar como Usuário Comum */}
              <TouchableOpacity 
                style={[styles.button, styles.buttonComum]} 
                onPress={() => selecionarPerfil('comum')}
              >
                <Text style={styles.textoButton}>Entrar como Comum</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkVoltar} onPress={() => navigation.navigate('Index')}>
                <Text style={styles.textoLinkVoltar}>Voltar ao Login por Senha</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: '#192a6b' },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 },
  container: { backgroundColor: '#fff', borderRadius: 20, width: width * 0.9, maxWidth: 400, padding: 25, elevation: 5 },
  formCard: { alignItems: 'center', width: '100%' },
  titulo: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 5 },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 25, textAlign: 'center' },
  button: { paddingVertical: 12, borderRadius: 8, marginVertical: 8, alignItems: 'center', justifyContent: 'center', width: '100%', height: 50 },
  buttonAdmin: { backgroundColor: '#2c3e50' }, // Cor diferenciada para o Admin
  buttonComum: { backgroundColor: '#192a6b' },
  textoButton: { color: '#ffffff', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  linkVoltar: { marginTop: 25 },
  textoLinkVoltar: { color: '#192a6b', fontSize: 14, fontWeight: '500', textDecorationLine: 'underline' }
});
