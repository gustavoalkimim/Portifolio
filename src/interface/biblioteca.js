// Biblioteca: catálogo de projetos e jogos com abas, filtros combináveis,
// ordenação, busca local e estado vazio. Os filtros são preservados ao
// voltar de uma ficha; a URL pode trazer um estado inicial (?tipo=&tec=).

import { h, icone, anunciar } from './dom.js';
import { t } from '../servicos/i18n.js';
import { catalogo } from '../servicos/catalogo.js';
import { historico } from '../servicos/historico.js';
import { cartao, cabecalhoTela, segmentos } from './componentes.js';
import { foco } from '../entrada/foco.js';

const PADRAO = { tipo: 'todos', tec: '', ano: '', texto: '', ordem: 'data' };
let estado = { ...PADRAO };
let ultimaConsulta = null;

function aplicarConsulta(consulta) {
  // A URL só redefine os filtros quando traz algo novo (link "Ver tudo").
  const assinatura = JSON.stringify(consulta);
  if (assinatura === ultimaConsulta) return;
  ultimaConsulta = assinatura;
  if (!Object.keys(consulta).length) return;
  estado = { ...PADRAO };
  if (['projeto', 'jogo', 'todos'].includes(consulta.tipo)) estado.tipo = consulta.tipo;
  if (consulta.tec && catalogo.tecnologias().includes(consulta.tec)) estado.tec = consulta.tec;
  if (consulta.ano && catalogo.anos().includes(consulta.ano)) estado.ano = consulta.ano;
}

function filtrosAtivos() {
  return estado.tipo !== 'todos' || estado.tec || estado.ano || estado.texto.trim();
}

export function montar(raiz, rota) {
  aplicarConsulta(rota.consulta);
  const contagem = h('p', { class: 'biblioteca-contagem', role: 'status' });
  const grade = h('div', { class: 'grade', 'data-regiao': 'grade' });
  const vazio = h('div', { class: 'vazio-bloco', hidden: true });
  let temporizador = 0;

  const desenharGrade = (anunciarTotal = false) => {
    const recentes = historico.recentes().map((entrada) => entrada.chave);
    const lista = catalogo.filtrar(estado, recentes);
    grade.replaceChildren(...lista.map((item) => h('div', { class: 'grade-item' }, cartao(item, { variante: item.tipo === 'jogo' ? 'poster' : 'panoramico' }))));
    const total = catalogo.listar().length;
    contagem.textContent = lista.length === total ? t('biblioteca.total', { n: total }) : t('biblioteca.mostrando', { n: lista.length, total });
    vazio.hidden = lista.length > 0;
    grade.hidden = lista.length === 0;
    if (anunciarTotal) anunciar(contagem.textContent);
  };

  const campo = h('input', {
    class: 'campo',
    type: 'search',
    id: 'biblioteca-texto',
    placeholder: t('biblioteca.filtrarTexto'),
    'aria-label': t('biblioteca.filtrarTexto'),
    autocomplete: 'off',
    value: estado.texto,
    onInput: (evento) => {
      estado.texto = evento.target.value;
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => desenharGrade(true), 180);
    },
  });

  const painelFiltros = h('div', { class: 'filtros-corpo' });
  const desenharFiltros = () => {
    painelFiltros.replaceChildren(
      h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('biblioteca.tecnologia') }), segmentos({
        id: 'filtro-tec',
        rotulo: t('biblioteca.tecnologia'),
        valor: estado.tec,
        opcoes: [{ valor: '', rotulo: t('biblioteca.todas') }, ...catalogo.tecnologias().map((tec) => ({ valor: tec, rotulo: tec }))],
        aoEscolher: (valor) => {
          estado.tec = valor;
          desenharGrade(true);
          atualizarLimpar();
        },
      })),
      h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('biblioteca.ano') }), segmentos({
        id: 'filtro-ano',
        rotulo: t('biblioteca.ano'),
        valor: estado.ano,
        opcoes: [{ valor: '', rotulo: t('biblioteca.todos') }, ...catalogo.anos().map((ano) => ({ valor: ano, rotulo: ano }))],
        aoEscolher: (valor) => {
          estado.ano = valor;
          desenharGrade(true);
          atualizarLimpar();
        },
      })),
      h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('biblioteca.ordenar') }), segmentos({
        id: 'filtro-ordem',
        rotulo: t('biblioteca.ordenar'),
        valor: estado.ordem,
        opcoes: [
          { valor: 'data', rotulo: t('biblioteca.ordem.data') },
          { valor: 'nome', rotulo: t('biblioteca.ordem.nome') },
          { valor: 'recente', rotulo: t('biblioteca.ordem.recente') },
        ],
        aoEscolher: (valor) => {
          estado.ordem = valor;
          desenharGrade();
        },
      })),
    );
  };

  const abas = h('div', { class: 'abas-linha' });
  const desenharAbas = () => {
    abas.replaceChildren(
      segmentos({
        id: 'filtro-tipo',
        rotulo: t('biblioteca.tipo'),
        valor: estado.tipo,
        opcoes: [
          { valor: 'todos', rotulo: t('biblioteca.aba.todos') },
          { valor: 'projeto', rotulo: t('biblioteca.aba.projetos') },
          { valor: 'jogo', rotulo: t('biblioteca.aba.jogos') },
        ],
        aoEscolher: (valor) => {
          estado.tipo = valor;
          desenharGrade(true);
          atualizarLimpar();
        },
      }),
    );
  };

  const limparFiltros = (focarDepois) => {
    estado = { ...PADRAO };
    campo.value = '';
    desenharAbas();
    desenharFiltros();
    desenharGrade(true);
    atualizarLimpar();
    if (focarDepois) foco.focar(campo);
  };
  const botaoLimpar = h('button', { type: 'button', class: 'botao', 'data-chave': 'biblioteca:limpar', onClick: () => limparFiltros(true) }, icone('fechar', 16), h('span', { text: t('biblioteca.limpar') }));
  const atualizarLimpar = () => {
    botaoLimpar.hidden = !filtrosAtivos();
  };

  vazio.append(
    h('p', { class: 'vazio-titulo', text: t('biblioteca.vazio') }),
    h('p', { text: t('biblioteca.vazio.dica') }),
    h('button', { type: 'button', class: 'botao botao-principal', 'data-chave': 'biblioteca:limpar-vazio', text: t('biblioteca.limpar'), onClick: () => limparFiltros(true) }),
  );
  campo.addEventListener('input', atualizarLimpar);

  // No celular os filtros ficam recolhidos em <details>.
  const filtros = h('details', { class: 'filtros', open: window.matchMedia('(min-width: 768px)').matches ? true : null }, h('summary', { class: 'filtros-resumo', 'data-chave': 'biblioteca:filtros' }, icone('engrenagem', 16), h('span', { text: t('biblioteca.filtros') })), painelFiltros);

  desenharAbas();
  desenharFiltros();
  desenharGrade();
  atualizarLimpar();

  raiz.append(
    cabecalhoTela({ titulo: t('nav.biblioteca'), subtitulo: t('biblioteca.subtitulo') }),
    h('div', { class: 'biblioteca-barra' }, abas, h('div', { class: 'biblioteca-busca', 'data-regiao': 'biblioteca-busca' }, campo, botaoLimpar)),
    filtros,
    contagem,
    grade,
    vazio,
  );
  const primeiro = grade.querySelector('.cartao-link');
  if (primeiro) primeiro.setAttribute('data-foco-inicial', '');

  return {
    titulo: t('nav.biblioteca'),
    fundo: 'grade',
    destruir() {
      window.clearTimeout(temporizador);
    },
  };
}
