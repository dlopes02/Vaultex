# Vaultex

Aplicação web de controlo financeiro pessoal para duas pessoas. Permite registar entradas, despesas e poupanças, acompanhar saldos e consultar a distribuição das despesas por categoria.

![Tecnologias](https://img.shields.io/badge/HTML-CSS-JavaScript-D4AF37?style=flat-square)

## Funcionalidades

- Registo de despesas, entradas e valores guardados em poupança.
- Resumo do saldo, entradas, despesas e poupanças.
- Comparação individual entre os dois membros.
- Gráfico de despesas por categoria.
- Pesquisa e filtros por tipo de movimento e por membro.
- Categorias ajustadas automaticamente ao tipo de registo, incluindo categorias personalizadas.
- Personalização dos nomes dos membros, moeda e som dos cliques.
- Dados de exemplo, limpeza de registos e armazenamento local no navegador.
- Interface responsiva para computador e telemóvel.

## Tecnologias

- HTML5
- CSS3
- JavaScript (vanilla)
- [Chart.js](https://www.chartjs.org/) para o gráfico de categorias
- [Flatpickr](https://flatpickr.js.org/) para a seleção de datas
- [Lucide](https://lucide.dev/) para os ícones
- Google Fonts: Cinzel e Plus Jakarta Sans

As bibliotecas externas são carregadas por CDN; por isso, é necessária ligação à Internet para as carregar na primeira abertura.

## Executar localmente

Não é necessária instalação de dependências nem configuração adicional. Abra `index.html` num navegador moderno.

Para servir o projeto com um servidor local, por exemplo:

```powershell
python -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador.

## Utilização

1. Selecione **Adicionar Valor** para criar um registo.
2. Escolha se é uma despesa, entrada ou poupança, preencha os dados e guarde.
3. Use os filtros do topo e da tabela para consultar os movimentos pretendidos.
4. Abra as definições para alterar os nomes, a moeda, carregar exemplos ou eliminar os dados.

## Dados e privacidade

Os dados são guardados apenas no `localStorage` do navegador, sob as chaves:

- `vaultex_pt_config` — nomes e moeda configurados.
- `vaultex_pt_tx` — movimentos financeiros.
- `vaultex_sound_enabled` — preferência de som.

Não existe servidor, conta de utilizador ou sincronização remota. Limpar os dados do navegador ou usar a opção **Eliminar Todos os Dados** remove os registos guardados.

## Estrutura

```text
Vaultex/
|- index.html          # Estrutura da interface
|- style.css           # Tema, componentes e responsividade
|- script.js           # Regras da aplicação e persistência local
`- files/
   `- favicon.svg      # Ícone da aplicação
```
