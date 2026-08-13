# DMS — Backend

Backend do **Document Management System**, construído com Node.js e Express seguindo Clean Architecture simples.

## Stack

| Tecnologia | Versão  | Papel                              |
|------------|---------|------------------------------------|
| Node.js    | ≥ 24    | Runtime                            |
| Express    | 5.2.1   | Framework HTTP                     |
| multer     | 2.2.0   | Upload de arquivos (diskStorage)   |

## Arquitetura

```
src/
├── app.js                          # Ponto de entrada e configuração do servidor
├── routes/
│   └── documents.routes.js         # Definição dos endpoints e middleware de erro do multer
├── controllers/
│   └── documents.controller.js     # Entrada/saída HTTP e validação básica
├── services/
│   └── documents.service.js        # Regras de negócio (validação de dono, criação, download)
└── repositories/
    └── documents.repository.js     # Persistência: arquivos no filesystem + metadados em memória
```

Fluxo de dependência: `routes → controllers → services → repositories`.

## Endpoints

| Método | Rota                         | Descrição                                    | Headers obrigatórios |
|--------|------------------------------|----------------------------------------------|----------------------|
| GET    | `/health`                    | Verificação de saúde da API                  | —                    |
| POST   | `/upload`                    | Envia um documento (`multipart/form-data`)   | `X-User-Id`          |
| GET    | `/documents`                 | Lista os documentos do usuário               | `X-User-Id`          |
| GET    | `/documents/:id/download`    | Faz o download de um documento               | `X-User-Id`          |

### Identificação do usuário

O header `X-User-Id` deve conter um identificador de string não vazio. Todos os endpoints de documentos são isolados por usuário — cada usuário só acessa os próprios arquivos.

### Exemplo de upload

```bash
curl -X POST http://localhost:3000/upload \
  -H "X-User-Id: demo-user" \
  -F "file=@/caminho/para/arquivo.pdf"
```

### Exemplo de listagem

```bash
curl http://localhost:3000/documents \
  -H "X-User-Id: demo-user"
```

### Exemplo de download

```bash
curl -OJ "http://localhost:3000/documents/doc_<uuid>/download" \
  -H "X-User-Id: demo-user"
```

## Variáveis de ambiente

| Variável            | Padrão                              | Descrição                                                         |
|---------------------|-------------------------------------|-------------------------------------------------------------------|
| `PORT`              | `3000`                              | Porta em que o servidor vai escutar                               |
| `STORAGE_DIR`       | `<raiz_do_projeto>/backend/storage` | Caminho absoluto da pasta onde os arquivos são gravados           |
| `MAX_FILE_SIZE`     | `10485760` (10 MB)                  | Tamanho máximo em bytes por arquivo                               |
| `ALLOWED_MIME_TYPES`| `application/pdf,image/jpeg,image/png,text/plain` | Lista de MIME types aceitos, separados por vírgula |

## Armazenamento

- Os arquivos enviados são gravados na pasta `backend/storage/` usando `multer` com `diskStorage`.
- Cada arquivo recebe um nome único gerado com `crypto.randomUUID()`.
- Os metadados (id, nome original, tamanho, MIME type, data de upload, dono) ficam **em memória** durante a execução da aplicação — reiniciar o servidor apaga os registros, mas não os arquivos físicos.
- O acesso ao filesystem é restrito ao diretório de armazenamento configurado (path traversal é bloqueado).

## Como executar

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (com recarregamento automático)
npm run dev

# Modo produção
npm start
```

## Testes

Os testes usam o runner nativo do Node.js (`node:test`):

```bash
npm test
```

Os arquivos de teste ficam em `test/`.
