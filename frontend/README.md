# DMS — Frontend

Frontend do **Document Management System**, construído com React e Vite.

## Stack

| Tecnologia          | Versão  | Papel                         |
|---------------------|---------|-------------------------------|
| Node.js             | ≥ 24    | Runtime                       |
| React               | 19.2.7  | Biblioteca de UI              |
| Vite                | 8.0.16  | Bundler e servidor de dev     |
| @vitejs/plugin-react| 6.0.3   | Suporte a JSX no Vite         |

## Estrutura

```
src/
├── main.jsx                        # Ponto de entrada — monta o React na DOM
├── App.jsx                         # Componente raiz: estado global, upload e download
├── components/
│   ├── UploadComponent.jsx         # Formulário de seleção e envio de arquivo
│   ├── DocumentList.jsx            # Lista de documentos com tamanho formatado
│   └── DownloadButton.jsx          # Botão de download com estado de carregamento
└── services/
    └── documentsApi.js             # Comunicação com o backend via fetch (/api)
```

## Componentes

### `App`

Componente raiz que:
- Carrega a lista de documentos do usuário na montagem.
- Gerencia os estados de carregamento (`isLoading`), upload em progresso (`isUploading`) e mensagens de erro.
- Orquestra as chamadas de upload e download delegando para `documentsApi`.

### `UploadComponent`

Formulário simples com campo de arquivo e botão de envio. O botão fica desabilitado enquanto nenhum arquivo está selecionado ou o envio está em andamento.

### `DocumentList`

Exibe a lista de documentos do usuário. Cada item mostra o nome original, o tamanho formatado (KB / MB) e um `DownloadButton`.

### `DownloadButton`

Botão que dispara o download de um documento. Fica desabilitado enquanto o download está em andamento para evitar múltiplos cliques.

## Serviço de API (`documentsApi.js`)

Toda a comunicação com o backend passa por `/api` (prefixo reescrito pelo proxy do Vite em desenvolvimento).

O identificador do usuário (`X-User-Id`) é lido do `localStorage` sob a chave `dms-user-id`; quando ausente, o valor padrão `"demo-user"` é utilizado.

| Função              | Método | Rota                          | Descrição                                  |
|---------------------|--------|-------------------------------|--------------------------------------------|
| `uploadDocument`    | POST   | `/api/upload`                 | Envia um arquivo via `multipart/form-data` |
| `listDocuments`     | GET    | `/api/documents`              | Retorna a lista de documentos do usuário   |
| `downloadDocument`  | GET    | `/api/documents/:id/download` | Baixa um arquivo e retorna blob + filename |

## Proxy de desenvolvimento

O Vite redireciona todas as chamadas com prefixo `/api` para `http://localhost:3000`, removendo o prefixo antes de encaminhar a requisição. Isso permite que o frontend rode na porta `5173` sem problemas de CORS durante o desenvolvimento.

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
},
```

## Como executar

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (porta 5173)
npm run dev

# Gerar build de produção
npm run build

# Visualizar build de produção localmente
npm run preview
```

> O backend precisa estar rodando na porta `3000` para que as chamadas de API funcionem durante o desenvolvimento.
