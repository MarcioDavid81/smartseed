# 🌱 Smart Seed - Sistema de Controle de Produção de Sementes

O **Smart Seed** é uma solução completa para controle da produção, estoque e saída de sementes de **soja**, **trigo** e **forrageiras de inverno**. Desenvolvido com tecnologias modernas, oferece gestão eficiente e relatórios prontos para auditorias.

---

## 🚀 Funcionalidades

* ✅ **Controle de Colheitas**

  * Registro detalhado de colheitas por **produto** e por **cultivar**.
  * Integração com controle de estoque e rastreabilidade.

* ✅ **Controle de Beneficiamento e Descartes**

  * Registro de lotes descartados durante o beneficiamento.
  * Acompanhamento de perdas por cultivar e por safra.

* ✅ **Controle de Compras de Sementes**

  * Entrada de sementes adquiridas de terceiros no sistema.
  * Atualização automática do estoque.

* ✅ **Controle de Vendas de Sementes**

  * Saídas registradas com data, cliente e cultivar.
  * Gera relatórios de vendas consolidados.

* ✅ **Controle de Uso em Plantio Próprio**

  * Registros de saídas internas para lavouras da própria empresa.
  * Diferenciação de saídas comerciais vs. uso interno.

* ✅ **Relatórios Exportáveis em PDF**

  * Geração de relatórios personalizados com filtros por **cultivar**, **movimentação**, **data** e **tipo**.
  * Exportação em PDF com layout limpo e pronto para impressão.
  * Ideal para auditorias, prestação de contas e organização interna.

---

## 🧱 Tecnologias Utilizadas

### Backend

🌐 Next.js 14 (App Router + Server Actions)

🧬 Prisma ORM – modelagem segura e performática do banco de dados.

🛢️ NeonDB – banco de dados PostgreSQL serverless robusto e escalável.

🔐 Middleware e autenticação personalizada com JWT.

### Frontend

🎨 Tailwind CSS – estilização moderna e responsiva.

🧩 shadcn/ui – componentes UI reutilizáveis e acessíveis.

📊 Recharts – gráficos interativos no painel de controle.

---

## 💡 Diferenciais

* 🌎 **Multi-tenant**: cada usuário acessa apenas os dados da sua empresa.
* 🔐 **Autenticação segura** com token JWT criptografado.
* 📈 **Dashboard inteligente** com relatórios e gráficos de movimentações.
* 🧾 **Relatórios PDF personalizados** com filtros inteligentes e visual profissional.
* 🔄 **Fluxo de dados 100% rastreável** por cultivar, do plantio à venda.

---

## 🛠️ Como Rodar Localmente

```bash
# Clone o repositório
git clone https://github.com/seuusuario/smart-seed.git

# Acesse a pasta do projeto
cd smart-seed

# Instale as dependências
npm install

# Crie o arquivo .env com suas variáveis de ambiente
cp .env.example .env

# Rode as migrations do banco de dados
npx prisma migrate dev

# Inicie o servidor
npm run dev
```

---

📩 Contato
Quer usar o SmartSeed na sua propriedade? Fale comigo:

Email: marciodavid81@gmail.com

LinkedIn: https://www.linkedin.com/in/marcio-david-a8152733/

Instagram: @o_marciodavid

Desenvolvido por [MD - Web Developer](https://md-webdeveloper.vercel.app/) 🤝
