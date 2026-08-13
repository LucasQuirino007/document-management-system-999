---
description: Moderniza o frontend com Tailwind CSS 3 sem alterar regras de negocio.
name: redesign-visual-tailwind
argument-hint: objetivo visual (ex. dashboard limpo, cards elegantes, melhor mobile)
agent: ui-tailwind3-designer
---

# Redesign visual com Tailwind CSS 3

Aplique um redesign no frontend da aplicacao, com base no objetivo: "${input:objetivo:dashboard limpo, cards elegantes, melhor mobile}".

Contexto do projeto:

- Frontend em React + Vite em `frontend/`.
- Fluxos existentes que nao podem quebrar: upload, listagem e download de documentos.
- Comunicacao com backend via `/api`.

Tarefas obrigatorias:

1. Configurar Tailwind CSS 3 no frontend (incluindo arquivos de configuracao e estilos globais necessarios).
2. Melhorar layout, tipografia, espacamento e estados visuais dos componentes existentes.
3. Garantir responsividade para mobile e desktop.
4. Manter o comportamento funcional dos componentes e chamadas da API.
5. Rodar validacao final do frontend e reportar resultado.

Criterios de aceite:

- Interface visualmente mais consistente e moderna.
- Nenhuma regressao funcional nos fluxos principais.
- Build do frontend concluido com sucesso.
