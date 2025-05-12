🌱 SmartSeed - Sistema de Controle de Produção de Sementes
O SmartSeed é um sistema completo para controle da produção, beneficiamento, movimentação e destino de sementes em propriedades agrícolas. Com foco em rastreabilidade e gestão eficiente, a plataforma permite o gerenciamento detalhado de cultivares, entradas e saídas de estoque, e o uso interno em plantios próprios.

🚀 Funcionalidades
✅ Controle de Colheitas

Lançamento de colheitas vinculadas por produto (soja, trigo, etc.) e cultivar específica.

Histórico de produção com datas, quantidades e origem.

✅ Controle de Descartes de Beneficiamento

Registro preciso de perdas e descartes ocorridos durante o beneficiamento.

Visão clara do rendimento do processo produtivo.

✅ Controle de Compras de Sementes

Cadastro de compras externas de sementes.

Integração no saldo de estoque automaticamente.

✅ Controle de Vendas de Sementes

Registro de vendas com data, quantidade e destino.

Controle de movimentações por cultivar.

✅ Controle de Uso em Plantio Próprio

Lançamento de saídas de estoque para plantio interno.

Visibilidade clara do consumo interno por safra e produto.

✅ Relatórios Exportáveis em PDF

Geração de relatórios personalizados com filtros por cultivar, movimentação, data e tipo (colheita, compra, venda, etc.).

Exportação em PDF com layout limpo e pronto para impressão.

Ideal para auditorias, prestação de contas e organização interna.

🧱 Tecnologias Utilizadas
Backend
🌐 Next.js 14 (App Router + Server Actions)

🧬 Prisma ORM – modelagem segura e performática do banco de dados.

🛢️ NeonDB – banco de dados PostgreSQL serverless robusto e escalável.

🔐 Middleware e autenticação personalizada com JWT.

Frontend
🎨 Tailwind CSS – estilização moderna e responsiva.

🧩 shadcn/ui – componentes UI reutilizáveis e acessíveis.

📊 Recharts – gráficos interativos no painel de controle.

💡 Diferenciais
🌎 Multi-tenant: cada usuário acessa apenas os dados da sua empresa.

🔐 Autenticação segura com token JWT criptografado.

📈 Dashboard inteligente com relatórios e gráficos de movimentações.

🧾 Relatórios PDF personalizados com filtros inteligentes e visual profissional.

🔄 Fluxo de dados 100% rastreável por cultivar, do plantio à venda.

🛠️ Como rodar localmente
bash
Copiar
Editar
# Clone o repositório
git clone https://github.com/seu-usuario/smartseed.git
cd smartseed

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha os dados do banco (Neon), JWT_SECRET etc.

# Rode as migrations do Prisma
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run dev

📩 Contato
Quer usar o SmartSeed na sua propriedade? Fale comigo:

Email: [marciodavid81@gmail.com]

LinkedIn: [linkedin.com/in/marcio-david-a8152733/]

Instagram: [@o_marciodavid]

