// Envio do formulário pelo EmailJS (REST). Os três identificadores abaixo são
// públicos e os mesmos do portfólio já publicado; o destinatário é definido no
// template da conta do proprietário. Nenhuma senha ou chave privada entra aqui.

export const EMAILJS = Object.freeze({
  serviceId: 'service_j8x2n98',
  templateId: 'template_zopdxbp',
  publicKey: 'DE3aJQUg4Su63Vq9E',
  url: 'https://api.emailjs.com/api/v1.0/email/send',
});

export const LIMITES = Object.freeze({ nome: 100, email: 254, mensagem: 5000 });
const TEMPO_LIMITE = 15000;

/** Devolve { nome, email, mensagem } com a chave de erro de cada campo (ou ''). */
export function validar(valores) {
  const erros = { nome: '', email: '', mensagem: '' };
  const nome = String(valores.nome || '').trim();
  const email = String(valores.email || '').trim();
  const mensagem = String(valores.mensagem || '').trim();
  if (!nome) erros.nome = 'form.erro.nome';
  else if (nome.length > LIMITES.nome) erros.nome = 'form.erro.longo';
  if (!email) erros.email = 'form.erro.email';
  else if (email.length > LIMITES.email) erros.email = 'form.erro.longo';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = 'form.erro.emailInvalido';
  if (!mensagem) erros.mensagem = 'form.erro.mensagem';
  else if (mensagem.length > LIMITES.mensagem) erros.mensagem = 'form.erro.longo';
  return erros;
}

/**
 * Envia a mensagem. Devolve { envio, cancelar }:
 * `envio` resolve em { estado } com um destes valores:
 *  - 'aceito'        a API respondeu OK (aceitação pelo serviço, não leitura);
 *  - 'recusado'      a API respondeu com erro;
 *  - 'limitado'      a API limitou os envios (429);
 *  - 'semRede'       o navegador informou estar offline antes de enviar;
 *  - 'desconhecido'  timeout, cancelamento ou falha de rede: não dá para saber
 *                    se o provedor recebeu. Nunca reenvia sozinho.
 */
export function enviar(valores) {
  const controle = new AbortController();
  const cancelar = () => controle.abort();
  if (navigator.onLine === false) {
    return { envio: Promise.resolve({ estado: 'semRede' }), cancelar };
  }
  const limite = window.setTimeout(cancelar, TEMPO_LIMITE);
  const envio = fetch(EMAILJS.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controle.signal,
    body: JSON.stringify({
      service_id: EMAILJS.serviceId,
      template_id: EMAILJS.templateId,
      user_id: EMAILJS.publicKey,
      template_params: {
        from_name: String(valores.nome).trim(),
        reply_to: String(valores.email).trim(),
        message: String(valores.mensagem).trim(),
        to_name: 'Gustavo Henrique Santos e Silva',
      },
    }),
  })
    .then(async (resposta) => {
      const texto = await resposta.text();
      if (resposta.ok && texto.trim() === 'OK') return { estado: 'aceito' };
      return { estado: resposta.status === 429 ? 'limitado' : 'recusado', status: resposta.status };
    })
    .catch(() => ({ estado: 'desconhecido' }))
    .finally(() => window.clearTimeout(limite));
  return { envio, cancelar };
}
