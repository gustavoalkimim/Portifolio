// Central de eventos reais da sessão. Guarda só a chave de tradução, as
// variáveis e um destino opcional — nunca conteúdo de mensagens do visitante.
// Vive em memória: recarregar a página esvazia a central.

const TIPOS = ['sucesso', 'erro', 'info', 'conquista'];
const LIMITE = 30;
let lista = [];
let sequencia = 0;
const ouvintes = new Set();
const ouvintesNovos = new Set();

function avisar() {
  [...ouvintes].forEach((fn) => fn());
}

export const notificacoes = {
  /**
   * @param {{tipo:string, chave:string, vars?:object, destino?:string, critico?:boolean, unico?:string}} evento
   * `unico` evita registrar duas vezes o mesmo aviso (por exemplo, storage bloqueado).
   */
  registrar(evento) {
    if (!TIPOS.includes(evento.tipo) || !evento.chave) return null;
    if (evento.unico && lista.some((item) => item.unico === evento.unico)) return null;
    const item = {
      id: ++sequencia,
      tipo: evento.tipo,
      chave: evento.chave,
      vars: evento.vars || null,
      destino: evento.destino || null,
      critico: Boolean(evento.critico),
      unico: evento.unico || null,
      data: new Date(),
      lida: false,
    };
    lista = [item, ...lista].slice(0, LIMITE);
    avisar();
    [...ouvintesNovos].forEach((fn) => fn(item));
    return item;
  },
  listar() {
    return lista;
  },
  naoLidas() {
    return lista.filter((item) => !item.lida).length;
  },
  marcarLida(id) {
    const item = lista.find((n) => n.id === id);
    if (item && !item.lida) {
      item.lida = true;
      avisar();
    }
  },
  marcarTodas() {
    if (!lista.some((item) => !item.lida)) return;
    lista.forEach((item) => {
      item.lida = true;
    });
    avisar();
  },
  limpar() {
    lista = [];
    avisar();
  },
  aoMudar(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
  /** Chamado uma vez por evento novo (para o aviso flutuante). */
  aoRegistrar(fn) {
    ouvintesNovos.add(fn);
    return () => ouvintesNovos.delete(fn);
  },
};
