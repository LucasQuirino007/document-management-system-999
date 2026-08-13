# Especificacao - Document Management System

**Status:** proposta para orientar a implementacao

**Versao:** 1.0

**Observacao:** nesta etapa apenas este documento e criado. Os arquivos de backend e frontend permanecem como seed e ainda nao implementam os contratos abaixo.

## 1. Objetivo

Entregar uma aplicacao web que permita a um usuario enviar, listar e baixar seus documentos, mantendo os arquivos no filesystem local e os metadados em memoria.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisicao.
- Listagem dos documentos do usuario identificado na requisicao.
- Download de um documento pelo identificador.
- Armazenamento dos arquivos em `backend/storage` usando Multer com `diskStorage`.
- Armazenamento dos metadados em memoria durante a vida do processo.
- Interface React para upload, listagem, estados de carregamento/erro e download.
- Endpoint operacional `GET /health`.

### Fora do escopo

- Armazenamento externo, cloud storage ou servicos de terceiros.
- Banco de dados ou persistencia duravel dos metadados.
- Autenticacao, autorizacao baseada em sessao, JWT ou cadastro de usuarios.
- Versionamento, edicao, exclusao, compartilhamento ou busca textual.
- Upload multiplo, pastas, previews e conversao de arquivos.
- Paginacao na primeira versao.

## 3. Requisitos funcionais

| ID | Requisito | Criterio de aceite |
| --- | --- | --- |
| RF-01 | A API deve identificar o usuario pelo header `X-User-Id`. | Requisicoes de negocio sem header ou com valor vazio retornam `400`. |
| RF-02 | O usuario deve poder enviar um documento usando `multipart/form-data`. | Um arquivo valido no campo `file` cria um documento e retorna `201`. |
| RF-03 | O sistema deve validar o arquivo antes de registra-lo. | Arquivo ausente, acima do limite ou com MIME type nao permitido e rejeitado sem metadado orfao. |
| RF-04 | O sistema deve gerar um `id` unico e um nome fisico seguro. | O nome original nao e usado como caminho de armazenamento nem e capaz de realizar path traversal. |
| RF-05 | O sistema deve registrar os metadados do documento em memoria. | O retorno do upload contem os metadados publicos definidos na secao 5. |
| RF-06 | O usuario deve poder listar seus documentos. | `GET /documents` retorna apenas documentos cujo `owner` corresponde ao `X-User-Id`, ordenados por `uploadedAt` decrescente. |
| RF-07 | O usuario deve poder baixar seus documentos pelo `id`. | Documento existente e pertencente ao usuario retorna o binario com headers de download. |
| RF-08 | O sistema deve impedir acesso a documento de outro usuario. | O download de documento que nao pertence ao usuario retorna `404`, sem revelar sua existencia. |
| RF-09 | O sistema deve comunicar erros em formato uniforme. | Respostas de erro retornam JSON com `error.code` e `error.message`, exceto falhas do servidor proxy ou da conexao. |
| RF-10 | A interface deve atualizar a listagem depois de um upload bem-sucedido. | O novo documento aparece sem recarregamento manual da pagina. |
| RF-11 | A interface deve representar carregamento, erro, lista vazia e sucesso. | Nenhuma operacao fica sem feedback visual ou bloqueia a pagina indefinidamente. |

## 4. Requisitos nao funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS, conforme o projeto existente. |
| RNF-02 | A organizacao deve seguir `routes -> controllers -> services -> repositories`; cada camada conhece apenas a camada imediatamente interna. |
| RNF-03 | Uploads devem usar Multer com `diskStorage` e permanecer no filesystem local da aplicacao. E proibido usar storage externo. |
| RNF-04 | Os metadados devem permanecer em memoria e ser descartados quando o processo reiniciar. A aplicacao nao promete durabilidade nesta versao. |
| RNF-05 | Configuracoes operacionais devem ser lidas de variaveis de ambiente, com defaults documentados. |
| RNF-06 | O sistema nao deve expor caminho fisico, nome interno ou detalhes de stack trace ao cliente. |
| RNF-07 | Nomes e caminhos de arquivos devem ser gerados pelo sistema, sem concatenar entrada do usuario diretamente ao caminho. |
| RNF-08 | O frontend deve usar componentes funcionais React e `fetch`, consumindo a API pelo prefixo `/api` em desenvolvimento. |
| RNF-09 | A API deve fornecer respostas deterministicas para validacoes, documento ausente e arquivo removido. |
| RNF-10 | O layout deve ser utilizavel em desktop e mobile, com controles acessiveis por teclado e textos de erro associados aos controles. |

## 5. Modelo de dados

### 5.1 Metadados publicos

| Campo | Tipo | Obrigatorio | Descricao |
| --- | --- | --- | --- |
| `id` | string | sim | Identificador opaco e unico do documento. |
| `originalName` | string | sim | Nome original enviado pelo cliente, retornado apenas como texto e nunca como caminho. |
| `size` | number | sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | sim | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | sim | Valor validado do header `X-User-Id`. |
| `mimeType` | string | sim | MIME type informado/detectado pelo upload e aceito pela configuracao. |

Exemplo:

```json
{
  "id": "doc_01JABC123",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-08-13T12:00:00.000Z",
  "owner": "usuario-123",
  "mimeType": "application/pdf"
}
```

### 5.2 Dados internos

O repository deve manter, alem dos campos publicos, uma referencia privada ao arquivo fisico, por exemplo `storageName` ou `storagePath`. Essa referencia nunca deve ser retornada pela API. O caminho deve ficar restrito ao diretorio configurado e ser derivado de um identificador gerado pelo sistema.

O documento so e considerado criado depois que o arquivo foi gravado e o metadado foi registrado. Se o registro falhar depois da gravacao, o service deve remover o arquivo criado e retornar erro de servidor. Se o arquivo for removido externamente, o metadado permanece em memoria, mas o download retorna `404` ou `410` conforme a convencao adotada na implementacao; a primeira versao deve padronizar `404` para nao expor detalhes do armazenamento.

## 6. Contratos de API

### 6.1 Formato de erro

```json
{
  "error": {
    "code": "FILE_REQUIRED",
    "message": "O arquivo e obrigatorio."
  }
}
```

Codigos previstos: `USER_REQUIRED`, `FILE_REQUIRED`, `FILE_TOO_LARGE`, `FILE_TYPE_NOT_ALLOWED`, `INVALID_ID`, `DOCUMENT_NOT_FOUND`, `STORAGE_ERROR` e `INTERNAL_ERROR`.

### 6.2 POST `/upload`

Cria um documento para o usuario informado.

**Headers obrigatorios:** `X-User-Id: <identificador>`.

**Content-Type:** `multipart/form-data`.

**Campo obrigatorio:** `file`, contendo exatamente um arquivo.

**Sucesso `201 Created`:** retorna o objeto de metadados do documento criado, conforme a secao 5.1.

**Erros:**

| Status | Condicao | Codigo |
| --- | --- | --- |
| `400` | Usuario ausente, arquivo ausente ou requisicao multipart invalida | `USER_REQUIRED` ou `FILE_REQUIRED` |
| `413` | Arquivo excede `MAX_FILE_SIZE` | `FILE_TOO_LARGE` |
| `415` | MIME type nao esta em `ALLOWED_MIME_TYPES` | `FILE_TYPE_NOT_ALLOWED` |
| `500` | Falha ao gravar ou registrar o documento | `STORAGE_ERROR` ou `INTERNAL_ERROR` |

### 6.3 GET `/documents`

Lista os documentos pertencentes ao usuario informado.

**Headers obrigatorios:** `X-User-Id: <identificador>`.

**Sucesso `200 OK`:**

```json
{
  "documents": [
    {
      "id": "doc_01JABC123",
      "originalName": "relatorio.pdf",
      "size": 24576,
      "uploadedAt": "2026-08-13T12:00:00.000Z",
      "owner": "usuario-123",
      "mimeType": "application/pdf"
    }
  ]
}
```

A lista deve ser vazia quando o usuario ainda nao possui documentos. A ordenacao padrao e `uploadedAt` decrescente; em empate, ordenar por `id` para manter determinismo. Nao ha parametros de pagina nesta versao.

**Erros:** `400 USER_REQUIRED` quando o header nao for informado; `500 INTERNAL_ERROR` em falha inesperada.

### 6.4 GET `/documents/:id/download`

Retorna o conteudo binario de um documento pertencente ao usuario.

**Headers obrigatorios:** `X-User-Id: <identificador>`.

**Sucesso `200 OK`:**

- corpo binario do arquivo;
- `Content-Type` igual ao `mimeType` do metadado;
- `Content-Length` igual ao tamanho do arquivo;
- `Content-Disposition: attachment; filename="<nome original seguro>"`.

O nome original deve ser sanitizado para uso no header, sem permitir quebra de header ou alteracao de caminho.

**Erros:** `400 INVALID_ID` para identificador malformado; `404 DOCUMENT_NOT_FOUND` para documento inexistente, de outro usuario ou cujo arquivo nao esta disponivel; `500 INTERNAL_ERROR` para falha de leitura nao recuperavel.

### 6.5 GET `/health`

Endpoint operacional sem autenticacao.

**Sucesso `200 OK`:**

```json
{ "status": "ok" }
```

## 7. Decisoes arquiteturais

### Backend

- `routes/`: registra endpoints, middlewares e delega aos controllers.
- `controllers/`: le headers, params e multipart, valida entrada basica e monta a resposta HTTP.
- `services/`: aplica regras de usuario, validacao de negocio, consistencia e autorizacao.
- `repositories/`: grava/le arquivos locais e mantem os metadados em memoria.
- `app.js`: configura Express, middleware, rotas e `/health`; nao deve concentrar regra de negocio.

O repository de arquivos deve garantir que `STORAGE_DIR` exista, usar `multer.diskStorage`, gerar nomes fisicos opacos e nunca usar `originalName` como caminho. O service coordena a gravacao e o registro para evitar metadados sem arquivo.

### Frontend

O frontend deve separar pagina, componentes reutilizaveis e servico de API. A comunicacao usa `fetch('/api/...')`; o proxy do Vite remove `/api` e aponta para `http://localhost:3000` durante o desenvolvimento. O download deve usar a rota `/api/documents/:id/download` e respeitar o nome recebido no header de disposicao.

### Configuracao

| Variavel | Default | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | `backend/storage` | Diretorio local dos arquivos. |
| `MAX_FILE_SIZE` | `10485760` | Limite de 10 MiB por arquivo. |
| `ALLOWED_MIME_TYPES` | `application/pdf,image/jpeg,image/png,text/plain` | Lista separada por virgulas de MIME types aceitos. |

Valores invalidos devem interromper a inicializacao ou ser rejeitados com erro claro, conforme a estrategia definida pela implementacao.

## 8. Plano de execucao futuro

Este plano orienta as proximas etapas e nao sera executado como parte da criacao desta especificacao.

1. **Fundacao:** carregar configuracao, preparar `storage`, configurar Express e preservar `/health`.
2. **Repository:** implementar armazenamento local com `diskStorage`, metadados em memoria, busca por id e filtro por owner.
3. **Service:** implementar validacoes, coordenacao do upload, autorizacao e tratamento de falhas parciais.
4. **Controllers e routes:** adicionar os tres endpoints funcionais, Multer, validacao de headers e respostas padronizadas.
5. **Testes de API:** cobrir upload valido, validacoes, isolamento, ordenacao, download e falhas de filesystem.
6. **Frontend:** criar servico `fetch`, pagina, componente de upload, lista e acao de download.
7. **Integracao:** conectar frontend ao proxy `/api`, atualizar a lista apos upload e tratar loading, vazio, sucesso e erro.
8. **Validacao final:** executar testes, revisar acessibilidade, verificar limites e confirmar que nenhum storage externo foi introduzido.

## 9. Criterios de aceite e testes

| Area | Verificacao |
| --- | --- |
| Upload | Arquivo valido retorna `201`, metadados completos e arquivo em `backend/storage`. |
| Upload | Ausencia de usuario/arquivo, tamanho excedido e MIME type rejeitado retornam status e codigo previstos. |
| Consistencia | Falha no registro remove o arquivo temporario e nao deixa metadado orfao. |
| Listagem | Usuario ve somente seus documentos, em ordem decrescente, e recebe lista vazia quando aplicavel. |
| Download | Usuario autorizado recebe binario e headers corretos; outro usuario recebe `404`. |
| Seguranca | Nomes com `../`, barras, aspas ou caracteres de controle nao escapam do storage nem quebram headers. |
| Reinicio | A documentacao e os testes deixam claro que os metadados em memoria nao sobrevivem ao reinicio. |
| Frontend | Upload, lista vazia, carregamento, erro e download possuem feedback e controles acessiveis. |
| Integracao | O frontend acessa o backend por `/api` usando o proxy de desenvolvimento. |

## 10. Restricoes desta entrega

Nesta entrega nao devem ser criados ou modificados arquivos de `backend/` ou `frontend/`. Tambem nao devem ser implementados banco de dados, autenticacao real, armazenamento em nuvem, versionamento, exclusao, edicao ou paginacao.