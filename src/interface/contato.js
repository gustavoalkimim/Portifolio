// Contato: canais reais e formulário enviado pelo EmailJS.
// Estados do envio (F30): editando → enviando → aceito | erro | desconhecido.
// Os valores ficam só em memória; nada do formulário vai para o localStorage,
// para o histórico ou para as notificações.

import { h, icone, anunciar } from './dom.js';
import { t } from '../servicos/i18n.js';
import { perfil } from '../dados/perfil.js';
import { validar, enviar, LIMITES } from '../servicos/email.js';
import { notificacoes } from '../servicos/notificacoes.js';
import { sobreposicoes } from './sobreposicoes.js';
import { cabecalhoTela, listaDeContatos } from './componentes.js';

const CAMPOS = ['nome', 'email', 'mensagem'];
// Estado do módulo: sobrevive à troca de idioma e ao redesenho da tela.
const estado = {
  valores: { nome: '', email: '', mensagem: '' },
  erros: { nome: '', email: '', mensagem: '' },
  fase: 'editando', // 'editando' | 'enviando'
  retorno: null, // { chave, tipo }
  cancelar: null,
};
let redesenhar = null;

const RETORNOS = {
  aceito: { chave: 'form.aceito', tipo: 'sucesso' },
  recusado: { chave: 'form.recusado', tipo: 'erro' },
  limitado: { chave: 'form.limitado', tipo: 'erro' },
  semRede: { chave: 'form.semRede', tipo: 'erro' },
  desconhecido: { chave: 'form.desconhecido', tipo: 'alerta' },
};

function temConteudo() {
  return CAMPOS.some((campo) => estado.valores[campo].trim() !== '');
}

async function submeter() {
  if (estado.fase === 'enviando') return; // bloqueia envio duplicado
  estado.erros = validar(estado.valores);
  const primeiroErro = CAMPOS.find((campo) => estado.erros[campo]);
  if (primeiroErro) {
    estado.retorno = { chave: 'form.invalido', tipo: 'erro' };
    if (redesenhar) redesenhar('campo-' + primeiroErro);
    return;
  }
  estado.fase = 'enviando';
  estado.retorno = { chave: 'form.enviando', tipo: 'info' };
  const { envio, cancelar } = enviar(estado.valores);
  estado.cancelar = cancelar;
  if (redesenhar) redesenhar('form-cancelar');
  const resultado = await envio;
  estado.fase = 'editando';
  estado.cancelar = null;
  estado.retorno = RETORNOS[resultado.estado];
  if (resultado.estado === 'aceito') {
    // Decisão documentada: após aceitação pela API os campos são limpos.
    estado.valores = { nome: '', email: '', mensagem: '' };
    estado.erros = { nome: '', email: '', mensagem: '' };
  }
  // A notificação registra só o tipo do evento, nunca o conteúdo.
  notificacoes.registrar({
    tipo: resultado.estado === 'aceito' ? 'sucesso' : 'erro',
    chave: 'notif.envio.' + resultado.estado,
    destino: '/contato',
    critico: resultado.estado !== 'aceito',
  });
  if (redesenhar) redesenhar(resultado.estado === 'aceito' ? 'form-retorno' : 'form-enviar');
}

/** Formulário reutilizado pela tela de contato e pelo modo simples. */
export function formulario() {
  const recipiente = h('div', { class: 'formulario-recipiente' });

  const desenhar = (focar) => {
    const enviando = estado.fase === 'enviando';
    const campo = (id, tipo, autocomplete) => {
      const erro = estado.erros[id];
      const props = {
        class: 'campo',
        id: 'campo-' + id,
        name: id,
        autocomplete,
        required: true,
        maxlength: LIMITES[id],
        placeholder: t('form.exemplo.' + id),
        'aria-invalid': erro ? 'true' : 'false',
        'aria-describedby': 'erro-' + id,
        readonly: enviando ? true : null,
        value: estado.valores[id],
        onInput: (evento) => {
          estado.valores[id] = evento.target.value;
          if (estado.erros[id]) {
            estado.erros[id] = validar(estado.valores)[id];
            const paragrafo = recipiente.querySelector('#erro-' + id);
            paragrafo.textContent = estado.erros[id] ? t(estado.erros[id]) : '';
            paragrafo.hidden = !estado.erros[id];
            evento.target.setAttribute('aria-invalid', estado.erros[id] ? 'true' : 'false');
          }
        },
      };
      const entrada = tipo === 'textarea' ? h('textarea', { ...props, rows: 5 }) : h('input', { ...props, type: tipo });
      return h('div', { class: 'campo-grupo' }, h('label', { for: 'campo-' + id }, t('form.' + id), h('span', { class: 'nota', text: ' (' + t('form.obrigatorio') + ')' })), entrada, h('p', { class: 'campo-erro', id: 'erro-' + id, hidden: !erro, text: erro ? t(erro) : '' }));
    };

    const retorno = estado.retorno
      ? h('p', { class: 'retorno retorno-' + estado.retorno.tipo, id: 'form-retorno', tabindex: '-1', role: estado.retorno.tipo === 'erro' || estado.retorno.tipo === 'alerta' ? 'alert' : 'status' }, icone(estado.retorno.tipo === 'sucesso' ? 'certo' : estado.retorno.tipo === 'info' ? 'relogio' : 'alerta', 18), h('span', { text: t(estado.retorno.chave) }))
      : null;

    const form = h(
      'form',
      { class: 'formulario', novalidate: true, 'aria-labelledby': 'form-titulo', 'aria-busy': enviando ? 'true' : null, 'data-regiao': 'formulario' },
      h('h2', { class: 'ficha-subtitulo', id: 'form-titulo', text: t('form.titulo') }),
      h('p', { class: 'nota', text: t('form.nota') }),
      campo('nome', 'text', 'name'),
      campo('email', 'email', 'email'),
      campo('mensagem', 'textarea', 'off'),
      h(
        'div',
        { class: 'acoes' },
        h('button', { type: 'submit', class: 'botao botao-principal', id: 'form-enviar', disabled: enviando ? true : null }, icone('mensagem', 18), h('span', { text: t(enviando ? 'form.enviandoCurto' : 'form.enviar') })),
        enviando ? h('button', { type: 'button', class: 'botao', id: 'form-cancelar', onClick: () => estado.cancelar && estado.cancelar() }, h('span', { text: t('form.cancelarEspera') })) : null,
      ),
      enviando ? h('p', { class: 'nota', text: t('form.cancelarNota') }) : null,
      retorno,
    );
    form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      submeter();
    });
    recipiente.replaceChildren(form);
    if (focar) {
      const alvo = recipiente.querySelector('#' + focar);
      if (alvo) alvo.focus();
    }
    if (estado.retorno && focar) anunciar(t(estado.retorno.chave));
  };

  desenhar(null);
  redesenhar = (focar) => {
    if (recipiente.isConnected) desenhar(focar);
  };
  return recipiente;
}

/** Guarda de saída: com texto digitado ou envio pendente, pergunta antes. */
export async function podeSairDoFormulario() {
  if (estado.fase !== 'enviando' && !temConteudo()) return true;
  const sair = await sobreposicoes.confirmar({
    titulo: t('form.sair.titulo'),
    texto: t(estado.fase === 'enviando' ? 'form.sair.enviando' : 'form.sair.texto'),
    acoes: [
      { rotulo: t('form.sair.ficar'), valor: false, principal: true },
      { rotulo: t('form.sair.sair'), valor: true, perigo: true },
    ],
  });
  if (sair && estado.fase !== 'enviando') {
    estado.valores = { nome: '', email: '', mensagem: '' };
    estado.erros = { nome: '', email: '', mensagem: '' };
    estado.retorno = null;
  }
  return Boolean(sair);
}

export function montar(raiz) {
  raiz.append(
    cabecalhoTela({ titulo: t('secao.contato'), subtitulo: t('contato.subtitulo') }),
    h(
      'div',
      { class: 'contato-layout' },
      h('section', { 'aria-label': t('contato.canais') }, h('h2', { class: 'ficha-subtitulo', text: t('contato.canais') }), listaDeContatos(perfil.contatos), h('p', { class: 'nota', text: t('contato.canais.nota') })),
      formulario(),
    ),
  );
  const primeiro = raiz.querySelector('.contato');
  if (primeiro) primeiro.setAttribute('data-foco-inicial', '');
  return { titulo: t('secao.contato'), fundo: 'padrao', podeSair: podeSairDoFormulario };
}
