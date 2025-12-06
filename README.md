# 🖥️ Sistema de Registro CPD/TI - Loja PDV

Sistema simplificado para registro e controle de abertura e fechamento de lojas do CPD da TI, com checklist de PDVs, upload de imagens e controle de ocorrências.

![GitHub repo size](https://img.shields.io/github/repo-size/Luizdias98/sistema-cpd-loja)
![GitHub](https://img.shields.io/github/license/Luizdias98/sistema-cpd-loja)
![GitHub last commit](https://img.shields.io/github/last-commit/Luizdias98/sistema-cpd-loja)

## 📋 Funcionalidades

- ✅ **Registro de Abertura/Fechamento** de loja
- ✅ **Gerenciamento de PDVs** (cadastrar e remover)
- ✅ **Checklist de PDVs** verificados
- ✅ **Upload de imagens/prints** para documentação
- ✅ **Campo de relatório** detalhado
- ✅ **Controle de e-mail enviado**
- ✅ **Registro de ocorrências** com descrição
- ✅ **Armazenamento local persistente** (dados salvos no navegador)
- ✅ **Visualização de histórico** completo
- ✅ **Interface responsiva** e intuitiva

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para interfaces
- **Lucide React** - Ícones modernos
- **Tailwind CSS** - Estilização responsiva
- **Vite** - Build tool e dev server
- **Local Storage API** - Armazenamento persistente

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/Luizdias98/sistema-cpd-loja.git
cd sistema-cpd-loja
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:5173
```

## 🏗️ Estrutura do Projeto

```
sistema-cpd-loja/
├── src/
│   ├── App.jsx              # Componente principal do sistema
│   ├── main.jsx             # Ponto de entrada
│   └── index.css            # Estilos globais
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 💾 Banco de Dados

O sistema utiliza o **Local Storage** do navegador para armazenar dados de forma persistente:

- **`config-pdvs`** - Lista de PDVs cadastrados
- **`registro-cpd:{ID}`** - Cada registro individual

### Estrutura de Dados

```javascript
// Registro
{
  id: timestamp,
  tipo: 'abertura' | 'fechamento',
  data: 'YYYY-MM-DD',
  horarioInicio: 'HH:mm',
  horarioFim: 'HH:mm',
  checklistPDV: { [pdvId]: boolean },
  imagens: [{ nome, url }],
  relatorio: 'string',
  emailEnviado: boolean,
  temOcorrencia: boolean,
  descricaoOcorrencia: 'string',
  dataRegistro: 'DD/MM/YYYY HH:mm:ss'
}

// PDV
{
  id: timestamp,
  nome: 'string'
}
```

## 📖 Como Usar

### 1. Configurar PDVs
1. Clique em **"Gerenciar PDVs"**
2. Digite o nome do PDV (ex: PDV 01, Caixa 1, Loja A)
3. Clique no botão **+** para adicionar
4. Para remover, clique no **X** ao lado do PDV

### 2. Criar Registro
1. Clique em **"+ Novo Registro"**
2. Selecione o tipo: **Abertura** ou **Fechamento**
3. Preencha **Data** e **Horário de Início** (obrigatórios)
4. Preencha **Horário de Fim** (opcional)
5. Marque os **PDVs verificados** no checklist
6. Faça **upload de imagens** se necessário (prints, comprovantes)
7. Escreva o **relatório** das atividades realizadas
8. Marque se o **e-mail foi enviado**
9. Se houver **ocorrência**, marque e descreva o problema
10. Clique em **"Salvar Registro"**

### 3. Visualizar Registros
- Todos os registros aparecem na lista principal ordenados por data
- Clique no ícone de **olho** 👁️ para ver detalhes completos
- Clique no ícone de **lixeira** 🗑️ para excluir um registro

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🔧 Personalização

### Modificar Cores
Edite as classes Tailwind no arquivo `src/App.jsx` ou customize o `tailwind.config.js`.

### Adicionar Novos Campos
Modifique o estado `registroAtual` no componente principal.

### Alterar Validações
As validações estão na função `salvarRegistro()`.

## 📝 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Luiz Dias**

- GitHub: [@Luizdias98](https://github.com/Luizdias98)
- Repositório: [sistema-cpd-loja](https://github.com/Luizdias98/sistema-cpd-loja)

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/Luizdias98/sistema-cpd-loja/issues) descrevendo:
## 📧 Contato

Para dúvidas, sugestões ou parcerias:
- Abra uma [issue](https://github.com/Luizdias98/sistema-cpd-loja/issues)
- Entre em contato via GitHub

## ⚠️ Avisos Importantes

- Os dados são armazenados localmente no navegador
- Limpar o cache do navegador apaga todos os dados
- Para uso corporativo, considere implementar um backend
- Faça backups regulares usando a função de exportação

## 🙏 Agradecimentos

Desenvolvido para facilitar o trabalho do CPD/TI no controle diário de lojas e PDVs.

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**

**Desenvolvido com ❤️ por [Luiz Dias](https://github.com/Luizdias98)**
