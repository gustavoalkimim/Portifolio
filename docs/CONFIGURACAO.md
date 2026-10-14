# Configuração e publicação

## Estado do envio

O Service ID, Template ID e Public Key informados pelo proprietário já estão no objeto `EMAILJS`, no início de `script.js`. O e-mail oficial de recebimento é `gusalkimim@gmail.com`.

O teste real `PORTFOLIO-20261013-A5`, em 13/10/2026, foi aceito pelo EmailJS. O formulário exibiu sucesso e limpou os campos. O proprietário confirmou o recebimento. O teste `PORTFOLIO-20261013-PAGES` também foi aceito pela API a partir da URL publicada.

Configuração usada:

- Service ID: `service_j8x2n98`
- Template ID: `template_zopdxbp`
- Public Key: `DE3aJQUg4Su63Vq9E`

Para manter ou reconfigurar:

1. Entrar no painel da mesma conta do EmailJS que contém o serviço e o template.
2. No template, definir **To Email** como `gusalkimim@gmail.com`, **From Name** como `{{from_name}}`, **Reply-To** como `{{reply_to}}` e manter o remetente padrão do serviço conectado.
3. Incluir no conteúdo `{{from_name}}`, `{{reply_to}}` e `{{message}}`. O código também envia `{{to_name}}`.
4. Se trocar serviço, template ou conta, atualizar os três identificadores em `script.js`.
5. Enviar uma mensagem de teste pela URL publicada. Conferir o retorno no site e o recebimento na caixa de entrada, incluindo spam.
6. Se usar uma lista de origens autorizadas no EmailJS, incluir a origem da URL publicada. Respeitar os limites do plano contratado.

Nunca colocar senha de e-mail, token do GitHub ou chave privada no JavaScript. Os três identificadores usados aqui são públicos; o destinatário é definido no template da conta, não pelo visitante.

## Site publicado

- Repositório: https://github.com/gustavoalkimim/Portifolio
- Site: https://gustavoalkimim.github.io/Portifolio/
- GitHub Pages: branch `main`, raiz `/`, HTTPS.
- Se usar uma lista de origens no EmailJS, incluir `https://gustavoalkimim.github.io`.

## Bootstrap

O HTML carrega o CSS do Bootstrap 5.3.8 por CDN, com verificação de integridade. Não é necessário criar conta, instalar pacotes ou compilar. O navegador precisa de internet para carregar essa biblioteca. `style.css` contém os ajustes de aparência e a timeline; `script.js` controla menu, idioma, projetos e formulário.

## Foto, projetos e contato

- A foto pessoal está em `assets/images/gustavo.jpg` e é usada diretamente pelo HTML. O CSS faz o enquadramento circular sem alterar o arquivo da foto.
- O Fisiogrip usa o repositório `https://github.com/Mavilaa/Fisiogrip` e a captura `assets/images/fisiogrip.jpeg`, copiada do repositório. A licença original está em `docs/LICENCA_FISIOGRIP.txt`.
- O WhatsApp mostra o número completo `+55 (31) 98266-5639`, conforme a preferência atual, e aponta para `https://wa.me/5531982665639`.
- O repositório `gustavoalkimim/Projeto_HUB` continua privado. Conceder acesso ao avaliador ou decidir torná-lo público antes da apresentação.

## O que colocar no GitHub

Colocar o conteúdo de `Avaliado` na raiz do repositório de entrega. Os três arquivos principais são `index.html`, `style.css` e `script.js`; `assets` e `docs` contêm as mídias e a documentação que os acompanham.

`.nojekyll` é um arquivo vazio proposital: informa ao GitHub Pages que os arquivos devem ser servidos diretamente, sem processamento pelo Jekyll. Não é um arquivo do Node.js. `LICENSE` registra a licença MIT adotada para o projeto; as fontes e a captura do Fisiogrip têm os avisos de licença correspondentes preservados.

Backups, referências e ferramentas de verificação continuam fora desta pasta e não precisam ser enviados ao repositório.
