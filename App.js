import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Fluxo de assinatura
import PlanosScreen from './src/screens/PlanosScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import ConfirmacaoScreen from './src/screens/ConfirmacaoScreen';

// Área logada e agendamento de aulas
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import ExplorarScreen from './src/screens/ExplorarScreen';
import DetalhesAulaScreen from './src/screens/DetalhesAulaScreen';
import AgendarAulaScreen from './src/screens/AgendarAulaScreen';
import AulaAgendadaScreen from './src/screens/AulaAgendadaScreen';
import MinhasAulasScreen from './src/screens/MinhasAulasScreen';
import ReagendarAulaScreen from './src/screens/ReagendarAulaScreen';
import CancelarAulaScreen from './src/screens/CancelarAulaScreen';
import AulaCanceladaScreen from './src/screens/AulaCanceladaScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import DadosContaScreen from './src/screens/DadosContaScreen';
import GerenciarAssinaturaScreen from './src/screens/GerenciarAssinaturaScreen';
import TrocarPlanoScreen from './src/screens/TrocarPlanoScreen';
import TrocarCartaoScreen from './src/screens/TrocarCartaoScreen';
import HistoricoFaturamentoScreen from './src/screens/HistoricoFaturamentoScreen';
import PreferenciasPlanoScreen from './src/screens/PreferenciasPlanoScreen';
import ConfirmarTrocaPlanoScreen from './src/screens/ConfirmarTrocaPlanoScreen';
import TrocaPlanoConcluidaScreen from './src/screens/TrocaPlanoConcluidaScreen';
import AlterarSenhaScreen from './src/screens/AlterarSenhaScreen';
import ConteudoEstaticoScreen from './src/screens/ConteudoEstaticoScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const InicioStack = createNativeStackNavigator();
const ExplorarStack = createNativeStackNavigator();
const AgendaStack = createNativeStackNavigator();
const PerfilStack = createNativeStackNavigator();

const semHeader = { headerShown: false };

// Cada aba tem a própria pilha, para Detalhes/Agendar/Reagendar abrirem com a barra inferior visível
function InicioNavigator() {
  return (
    <InicioStack.Navigator screenOptions={semHeader}>
      <InicioStack.Screen name="Home" component={HomeScreen} />
      <InicioStack.Screen name="DetalhesAula" component={DetalhesAulaScreen} />
      <InicioStack.Screen name="AgendarAula" component={AgendarAulaScreen} />
    </InicioStack.Navigator>
  );
}

function ExplorarNavigator() {
  return (
    <ExplorarStack.Navigator screenOptions={semHeader}>
      <ExplorarStack.Screen name="ExplorarAulas" component={ExplorarScreen} />
      <ExplorarStack.Screen name="DetalhesAula" component={DetalhesAulaScreen} />
      <ExplorarStack.Screen name="AgendarAula" component={AgendarAulaScreen} />
    </ExplorarStack.Navigator>
  );
}

function AgendaNavigator() {
  return (
    <AgendaStack.Navigator screenOptions={semHeader}>
      <AgendaStack.Screen name="MinhasAulas" component={MinhasAulasScreen} />
      <AgendaStack.Screen name="ReagendarAula" component={ReagendarAulaScreen} />
      <AgendaStack.Screen name="AgendarAula" component={AgendarAulaScreen} />
    </AgendaStack.Navigator>
  );
}

function PerfilNavigator() {
  return (
    <PerfilStack.Navigator screenOptions={semHeader}>
      <PerfilStack.Screen name="PerfilInicio" component={PerfilScreen} />
      <PerfilStack.Screen name="DadosConta" component={DadosContaScreen} />
      <PerfilStack.Screen name="AlterarSenha" component={AlterarSenhaScreen} />
      <PerfilStack.Screen name="ConteudoEstatico" component={ConteudoEstaticoScreen} />
      <PerfilStack.Screen name="GerenciarAssinatura" component={GerenciarAssinaturaScreen} />
      <PerfilStack.Screen name="TrocarPlano" component={TrocarPlanoScreen} />
      <PerfilStack.Screen name="TrocarCartao" component={TrocarCartaoScreen} />
      <PerfilStack.Screen name="HistoricoFaturamento" component={HistoricoFaturamentoScreen} />
      <PerfilStack.Screen name="PreferenciasPlano" component={PreferenciasPlanoScreen} />
    </PerfilStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={semHeader} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Inicio" component={InicioNavigator} options={{ title: 'Início' }} />
      <Tab.Screen name="Explorar" component={ExplorarNavigator} options={{ title: 'Explorar' }} />
      <Tab.Screen name="Agenda" component={AgendaNavigator} options={{ title: 'Agenda' }} />
      <Tab.Screen name="Perfil" component={PerfilNavigator} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator initialRouteName="Welcome" screenOptions={semHeader}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />

          <Stack.Screen name="Planos" component={PlanosScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Confirmacao" component={ConfirmacaoScreen} />

          <Stack.Screen name="Main" component={MainTabs} />

          {/* Telas de confirmação ficam fora das abas, sem a barra inferior */}
          <Stack.Group screenOptions={{ animation: 'slide_from_bottom' }}>
            <Stack.Screen name="AulaAgendada" component={AulaAgendadaScreen} />
            <Stack.Screen name="CancelarAula" component={CancelarAulaScreen} />
            <Stack.Screen name="AulaCancelada" component={AulaCanceladaScreen} />
            <Stack.Screen name="ConfirmarTrocaPlano" component={ConfirmarTrocaPlanoScreen} />
            {/* Sem gesto de voltar: a saída leva para Gerenciar Assinatura (veja a própria tela) */}
            <Stack.Screen name="TrocaPlanoConcluida" component={TrocaPlanoConcluidaScreen} options={{ gestureEnabled: false }} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
