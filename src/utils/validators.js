export const limparCpf = (cpf) => cpf.replace(/\D/g, '');

export const formatarCpf = (valor) => {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};

// Formulário de cartão (Checkout e Trocar Cartão) -> { campo: mensagem }; vazio quando está tudo certo
export const validarCartao = ({ numero, nomeTitular, validade, cvv }) => {
  const erros = {};
  if ((numero || '').replace(/\D/g, '').length < 13) erros.numero = 'Informe o número completo do cartão';
  if (!(nomeTitular || '').trim()) erros.nomeTitular = 'Informe o nome impresso no cartão';

  const partes = /^(\d{2})\/(\d{2})$/.exec(validade || '');
  const mes = partes ? Number(partes[1]) : 0;
  if (!partes || mes < 1 || mes > 12) {
    erros.validade = 'Use o formato MM/AA';
  } else {
    const hoje = new Date();
    if ((2000 + Number(partes[2])) * 12 + mes < hoje.getFullYear() * 12 + hoje.getMonth() + 1) erros.validade = 'Cartão vencido';
  }

  if (!/^\d{3,4}$/.test(cvv || '')) erros.cvv = 'CVV inválido';
  return erros;
};

export const validarSenhaForte = (senha) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return regex.test(senha);
};