import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme';
import { parseData, diaSemanaCurto, formatarMesAno, formatarIntervalo } from '../utils/formatters';

const chaveMes = (dataIso) => dataIso.slice(0, 7); // "2025-11"

/**
 * Faixa de dias com horários + lista de horários do dia escolhido.
 * Só mostra dias que têm horário cadastrado; as setas navegam entre os meses que têm horários.
 */
export default function SeletorHorario({
  horarios,
  dataSelecionada,
  onSelecionarData,
  horarioSelecionadoId,
  onSelecionarHorario,
  horarioAtualId,
  rotuloData,
}) {
  const datas = useMemo(() => [...new Set(horarios.map((h) => h.data))].sort(), [horarios]);
  const meses = useMemo(() => [...new Set(datas.map(chaveMes))], [datas]);

  if (datas.length === 0) {
    return (
      <View style={styles.vazio}>
        <Ionicons name="calendar-clear-outline" size={28} color={cores.textoSuave} />
        <Text style={styles.vazioTexto}>Nenhum horário disponível para esta aula no momento.</Text>
      </View>
    );
  }

  const dataAtiva = dataSelecionada && datas.includes(dataSelecionada) ? dataSelecionada : datas[0];
  const mesAtivo = chaveMes(dataAtiva);
  const indiceMes = meses.indexOf(mesAtivo);
  const datasDoMes = datas.filter((d) => chaveMes(d) === mesAtivo);
  const horariosDoDia = horarios.filter((h) => h.data === dataAtiva);

  const irParaMes = (indice) => {
    const primeiraData = datas.find((d) => chaveMes(d) === meses[indice]);
    onSelecionarData(primeiraData);
  };

  return (
    <View>
      <View style={styles.mesHeader}>
        <View>
          {rotuloData && <Text style={styles.rotulo}>{rotuloData}</Text>}
          <Text style={styles.mes}>{formatarMesAno(dataAtiva)}</Text>
        </View>
        <View style={styles.setas}>
          <TouchableOpacity
            style={[styles.seta, indiceMes <= 0 && styles.setaDesabilitada]}
            onPress={() => irParaMes(indiceMes - 1)}
            disabled={indiceMes <= 0}
            accessibilityLabel="Mês anterior"
          >
            <Ionicons name="chevron-back" size={18} color={cores.texto} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.seta, indiceMes >= meses.length - 1 && styles.setaDesabilitada]}
            onPress={() => irParaMes(indiceMes + 1)}
            disabled={indiceMes >= meses.length - 1}
            accessibilityLabel="Próximo mês"
          >
            <Ionicons name="chevron-forward" size={18} color={cores.texto} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dias}>
        {datasDoMes.map((data) => {
          const ativo = data === dataAtiva;
          return (
            <TouchableOpacity
              key={data}
              style={[styles.dia, ativo && styles.diaAtivo]}
              onPress={() => onSelecionarData(data)}
              activeOpacity={0.85}
            >
              <Text style={[styles.diaNumero, ativo && styles.diaTextoAtivo]}>
                {String(parseData(data).getDate()).padStart(2, '0')}
              </Text>
              <Text style={[styles.diaSemana, ativo && styles.diaTextoAtivo]}>
                {diaSemanaCurto(data).toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.tituloHorarios}>
        <Text style={styles.tituloHorariosTexto}>Horários disponíveis</Text>
        <View style={styles.ponto} />
      </View>

      {horariosDoDia.map((horario) => {
        const atual = horario.id === horarioAtualId;
        const indisponivel = !horario.disponivel || atual;
        const selecionado = horario.id === horarioSelecionadoId;

        let legenda = `${horario.vagasDisponiveis} ${horario.vagasDisponiveis === 1 ? 'vaga disponível' : 'vagas disponíveis'}`;
        if (atual) legenda = 'Seu horário atual';
        else if (!horario.disponivel) legenda = 'Horário indisponível';

        return (
          <TouchableOpacity
            key={horario.id}
            style={[styles.opcao, indisponivel && styles.opcaoIndisponivel, selecionado && styles.opcaoSelecionada]}
            onPress={() => onSelecionarHorario(horario.id)}
            disabled={indisponivel}
            activeOpacity={0.85}
            accessibilityState={{ selected: selecionado, disabled: indisponivel }}
          >
            <View style={[styles.relogio, selecionado && styles.relogioSelecionado]}>
              <Ionicons
                name="time-outline"
                size={22}
                color={selecionado ? '#FFF' : indisponivel ? cores.textoSuave : cores.primaria}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.intervalo, indisponivel && styles.textoIndisponivel]}>
                {formatarIntervalo(horario.horaInicio, horario.horaFim)}
              </Text>
              <View style={styles.legendaLinha}>
                {indisponivel ? (
                  <Ionicons name="remove-circle-outline" size={14} color={cores.textoSuave} />
                ) : (
                  <View style={styles.pontoVagas} />
                )}
                <Text style={[styles.legenda, indisponivel && styles.textoIndisponivel]}>{legenda}</Text>
              </View>
            </View>
            {selecionado && (
              <View style={styles.check}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  mesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  rotulo: { fontSize: 14, color: cores.textoSecundario, marginBottom: 2 },
  mes: { fontSize: 20, fontWeight: '600', color: cores.texto },
  setas: { flexDirection: 'row', gap: 8 },
  seta: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.superficie,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setaDesabilitada: { opacity: 0.35 },
  dias: { gap: 10, paddingBottom: 4 },
  dia: {
    width: 64,
    height: 92,
    borderRadius: 16,
    backgroundColor: cores.superficie,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  diaAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  diaNumero: { fontSize: 22, fontWeight: '700', color: cores.texto },
  diaSemana: { fontSize: 13, color: cores.textoSecundario, marginTop: 2 },
  diaTextoAtivo: { color: '#FFF' },
  tituloHorarios: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 26, marginBottom: 14 },
  tituloHorariosTexto: { fontSize: 19, fontWeight: '600', color: cores.primaria },
  ponto: { width: 7, height: 7, borderRadius: 4, backgroundColor: cores.primaria },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: cores.superficie,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  opcaoIndisponivel: { backgroundColor: cores.superficieBaixa },
  opcaoSelecionada: { backgroundColor: cores.primariaClara, borderColor: cores.primaria },
  relogio: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.superficieMedia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relogioSelecionado: { backgroundColor: cores.primaria },
  intervalo: { fontSize: 18, fontWeight: '600', color: cores.texto },
  legendaLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  pontoVagas: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#9C93D4' },
  legenda: { fontSize: 13, color: cores.textoSecundario },
  textoIndisponivel: { color: cores.textoSuave },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: cores.primaria,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vazio: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
    borderRadius: 20,
    backgroundColor: cores.superficie,
  },
  vazioTexto: { fontSize: 14, color: cores.textoSecundario, textAlign: 'center' },
});
