# 🌱 Smart Seed - Sistema de Gestão Rural

O **Smart Seed** é uma solução completa para gestão de pequenas propriedades, controle de compras e aplicações de insumos agrícolas, colheita, beneficiamento, venda, consumo e estoque de sementes de **soja**, **trigo** e **forrageiras de inverno**. Desenvolvido com tecnologias modernas, oferece gestão eficiente e relatórios prontos para auditorias.

---

## 🚀 Módulo de Sementes

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


## 🚀 Módulo de Insumos Agrícolas

* ✅ **Controle de Compras de Insumos**

  * Entrada de sementes adquiridas de terceiros no sistema.
  * Atualização automática do estoque.

* ✅ **Controle de Aplicações de Insumos**

  * Registros de saídas internas para lavouras da própria empresa.

* ✅ **Controle de Transferências de Insumos**

  * Registros de transferências de estoque para as fezendas que compõem a empresa.

## 🚀 Relatórios Exportáveis em PDF

* ✅ **Os Mais Diversos Cruzamentos de Dados**

  * Geração de relatórios personalizados com filtros por **cultivar**, **movimentação**, **data** e **tipo**.
  * Exportação em PDF com layout limpo e pronto para impressão.
  * Ideal para auditorias, prestação de contas e organização interna.

---

## 🧱 Tecnologias Utilizadas

### Backend


<img src="./public/icons/node.svg" width="30" height="30"/> Node.js 22.16.0


<img src="./public/icons/prisma.svg" width="30" height="30"/> Prisma ORM – modelagem segura e performática do banco de dados.

<img src="./public/icons/postgre.svg" width="30" height="30"/> PostgreSQL - banco de dados relacional.

### Frontend

<img src="./public/icons/next.svg" width="30" height="30"/> Next.js 14.2.16>

<img src="./public//icons//react.svg" width="30" height="30"/> React 18.2.0

<img src="./public/icons/tailwindcss.svg" width="30" height="30"/> Tailwind CSS – estilização moderna e responsiva.

<img src="./public/icons/shadcnui.svg" width="30" height="30"/> Shadcn/ui – componentes UI reutilizáveis e acessíveis.

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
git clone https://github.com/MarcioDavid81/smartseed

# Acesse a pasta do projeto
cd smartseed

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

Instagram: [@o_marciodavid](https://www.instagram.com/o_marciodavid/)

Desenvolvido por [MD - Web Developer](https://md-webdeveloper.vercel.app/) 🤝
