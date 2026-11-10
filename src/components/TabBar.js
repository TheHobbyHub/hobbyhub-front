import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';
import { cores } from '../theme';

const ICONES = {
  Inicio: 'home-outline',
  Explorar: 'compass-outline',
  Agenda: 'calendar-outline',
  Perfil: 'person-outline',
};

const ICONES_ATIVOS = {
  Inicio: 'home',
  Explorar: 'compass',
  Agenda: 'calendar',
  Perfil: 'person',
};

// Barra inferior flutuante e arredondada, como nos protótipos
export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.barra}>
        {state.routes.map((route, index) => {
          const ativo = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const cor = ativo ? cores.primaria : cores.textoSecundario;

          const onPress = () => {
            const evento = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (evento.defaultPrevented) return;
            // Tocar na aba já ativa volta para a primeira tela da pilha dela
            if (ativo && route.state?.key && route.state.index > 0) {
              navigation.dispatch({ ...StackActions.popToTop(), target: route.state.key });
            } else {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.item}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={label}
            >
              <Ionicons name={ativo ? ICONES_ATIVOS[route.name] : ICONES[route.name]} size={22} color={cor} />
              <Text style={[styles.label, { color: cor }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: cores.fundo, paddingHorizontal: 20, paddingTop: 8 },
  barra: {
    flexDirection: 'row',
    backgroundColor: cores.superficie,
    borderRadius: 32,
    paddingVertical: 10,
    shadowColor: '#4A5799',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 12, fontWeight: '500' },
});
