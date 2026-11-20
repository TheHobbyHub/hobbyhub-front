const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// "2025-11-24" -> Date local (new Date("2025-11-24") seria interpretado em UTC e poderia cair no dia anterior)
export const parseData = (dataIso) => {
  const [ano, mes, dia] = dataIso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
};

export const diaSemanaCurto = (dataIso) => DIAS_CURTOS[parseData(dataIso).getDay()];

export const nomeMes = (indice) => MESES[indice];

// "Seg, 24 nov"
export const formatarDataCurta = (dataIso) => {
  const data = parseData(dataIso);
  return `${DIAS_CURTOS[data.getDay()]}, ${data.getDate()} ${MESES[data.getMonth()].slice(0, 3).toLowerCase()}`;
};

// "Seg, 24 de Novembro"
export const formatarDataLonga = (dataIso) => {
  const data = parseData(dataIso);
  return `${DIAS_CURTOS[data.getDay()]}, ${data.getDate()} de ${MESES[data.getMonth()]}`;
};

// "Novembro 2025"
export const formatarMesAno = (dataIso) => {
  const data = parseData(dataIso);
  return `${MESES[data.getMonth()]} ${data.getFullYear()}`;
};

// "15 de Dezembro"
export const formatarDiaMes = (dataIso) => {
  const data = parseData(dataIso);
  return `${data.getDate()} de ${MESES[data.getMonth()]}`;
};

// "14/Nov"
export const formatarDiaMesAbreviado = (dataIso) => {
  const data = parseData(dataIso);
  return `${String(data.getDate()).padStart(2, '0')}/${MESES[data.getMonth()].slice(0, 3)}`;
};

// "18:00:00" -> "18h00"
export const formatarHora = (hora) => {
  if (!hora) return '';
  const [h, m] = hora.split(':');
  return `${h}h${m}`;
};

export const formatarIntervalo = (inicio, fim) => `${formatarHora(inicio)} – ${formatarHora(fim)}`;

// 150 -> "2h30", 120 -> "2h", 45 -> "45min"
export const formatarDuracaoCurta = (minutos) => {
  if (!minutos) return '';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};

// 150 -> "2h 30min"
export const formatarDuracaoLonga = (minutos) => {
  if (!minutos) return '';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  return m ? `${h}h ${m}min` : `${h}h`;
};

// "14 de Outubro, 2024"
export const formatarDataExtenso = (dataIso) => {
  const data = parseData(dataIso);
  return `${data.getDate()} de ${MESES[data.getMonth()]}, ${data.getFullYear()}`;
};

// "14 de Nov de 2024"
export const formatarDataMesAbreviado = (dataIso) => {
  const data = parseData(dataIso);
  return `${data.getDate()} de ${MESES[data.getMonth()].slice(0, 3)} de ${data.getFullYear()}`;
};

// Máscara "0000 0000 0000 0000" ao digitar (até 19 dígitos)
export const mascararNumeroCartao = (valor) =>
  (valor || '').replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');

// Máscara MM/AA ao digitar
export const mascararValidadeCartao = (valor) => {
  const d = (valor || '').replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export const formatarPreco = (valor) =>`R$ ${Number(valor).toFixed(2).replace('.', ',')}`;

export const removerPrefixoPlano = (nome) => (nome || '').replace(/^Plano\s+/i, '');

export const formatarEndereco = (endereco) => {
  if (!endereco) return '';
  const rua = [endereco.logradouro, endereco.numero].filter(Boolean).join(', ');
  return [rua, endereco.bairro].filter(Boolean).join(' • ') + (endereco.estado ? `, ${endereco.estado}` : '');
};

// "11987654321" -> "(11) 98765-4321"; "1134567890" -> "(11) 3456-7890". Aceita valor parcial (máscara ao digitar)
export const formatarTelefone = (valor) => {
  const d = (valor || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const meio = d.length === 11 ? 7 : 6;
  if (d.length <= meio) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, meio)}-${d.slice(meio)}`;
};

// Máscara DD/MM/AAAA ao digitar
export const mascararData = (valor) => {
  const d = (valor || '').replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

// "1995-08-14" -> "14/08/1995"
export const isoParaDataBr = (dataIso) => {
  if (!dataIso) return '';
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
};

// "14/08/1995" -> "1995-08-14"; null se a data não existir no calendário
export const dataBrParaIso = (dataBr) => {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBr || '');
  if (!partes) return null;
  const [, dia, mes, ano] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
  return `${partes[3]}-${partes[2]}-${partes[1]}`;
};
