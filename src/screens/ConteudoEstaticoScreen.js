import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { cores, sombra } from '../theme';

// Conteúdo fixo (sem backend) da Central de Ajuda e dos Termos de Uso
const CONTEUDOS = {
  ajuda: {
    titulo: 'Central de Ajuda',
    introducao: 'Reunimos aqui as dúvidas mais comuns sobre o HobbyHub.',
    itens: [
      {
        titulo: 'Como funcionam os créditos?',
        texto: 'Cada plano dá um número de créditos por mês. Cada aula agendada usa um crédito, e o saldo renova no início de cada ciclo da assinatura.',
      },
      {
        titulo: 'Como agendo uma aula?',
        texto: 'Escolha uma aula na aba Início ou Explorar, toque em "Agendar" e selecione um dos horários disponíveis.',
      },
      {
        titulo: 'Posso cancelar ou reagendar?',
        texto: 'Sim, pela aba Agenda. Cancelando com mais de 24h de antecedência, o crédito volta para o seu saldo. Com menos de 24h, o crédito é debitado normalmente.',
      },
      {
        titulo: 'Como altero meus dados?',
        texto: 'Em Perfil > Dados Pessoais você pode atualizar nome, data de nascimento, e-mail, telefone e senha. O CPF não pode ser alterado.',
      },
    ],
  },
  termos: {
    titulo: 'Termos de Uso',
    introducao: 'Ao usar o HobbyHub você concorda com as condições abaixo.',
    itens: [
      {
        titulo: 'Uso da plataforma',
        texto: 'O HobbyHub conecta você a oficinas e aulas oferecidas por parceiros. Os agendamentos dependem da disponibilidade de vagas em cada horário.',
      },
      {
        titulo: 'Assinatura e créditos',
        texto: 'Os créditos são pessoais, intransferíveis e válidos apenas dentro do ciclo da assinatura em que foram concedidos.',
      },
      {
        titulo: 'Cancelamentos',
        texto: 'Cancelamentos feitos com menos de 24h de antecedência não devolvem o crédito utilizado.',
      },
      {
        titulo: 'Privacidade',
        texto: 'Usamos seus dados pessoais (nome, CPF, e-mail, telefone e data de nascimento) apenas para identificar sua conta e gerenciar seus agendamentos.',
      },
    ],
  },
};

export default function ConteudoEstaticoScreen({ navigation, route }) {
  const conteudo = CONTEUDOS[route.params?.tipo] || CONTEUDOS.ajuda;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader titulo={conteudo.titulo} onVoltar={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.introducao}>{conteudo.introducao}</Text>
        {conteudo.itens.map((item) => (
          <View key={item.titulo} style={styles.card}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.texto}>{item.texto}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  scroll: { paddingHorizontal: 24, paddingBottom: 120 },
  introducao: { fontSize: 15, color: cores.textoSecundario, marginTop: 8, marginBottom: 4, lineHeight: 22 },
  card: { backgroundColor: cores.superficie, borderRadius: 24, padding: 20, marginTop: 14, ...sombra },
  titulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  texto: { fontSize: 14, color: cores.textoSecundario, marginTop: 6, lineHeight: 20 },
});
