import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
} from "@react-email/components";

interface UserWelcomeEmailProps {
  name: string;
  email: string;
  password: string;
}

export default function UserUpdatedEmail({
  name,
  email,
  password,
}: UserWelcomeEmailProps) {
  return (
    <Html>
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          background: "#f9f9f9",
          padding: "20px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <Heading
            style={{
              backgroundColor: "#63B926",
              color: "#fff",
              padding: "24px",
              fontWeight: "bold",
              fontSize: "24px",
              textAlign: "center",
            }}
          >
            Usuário Atualizado
          </Heading>
          <Text>Olá {name},</Text>
          <Text>
            Seus dados foram atualizados no sistema <strong>SmartSeed</strong>
            .
          </Text>
          <Section>
            <Text>
              <strong>E-mail de acesso:</strong> {email}
            </Text>
            <Text>
              <strong>Senha:</strong>{" "}
              <span style={{ fontWeight: "bold", color: "#63B926" }}>
                {password}
              </span>
            </Text>
          </Section>
          <Text>
            Acesse o sistema em:{" "}
            <a href="https://smartseed.app.br/login">smartseed.app.br/login</a>
          </Text>
          <Hr />
          <Text style={{ fontSize: "12px", color: "#888" }}>
            Se você não foi você que solicitou esta alteração, entre em contato com o
            administrador do sistema através do formulário de contato,
            disponível na aba <a href="https://smartseed.app.br/#contact">"Contato"</a>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
