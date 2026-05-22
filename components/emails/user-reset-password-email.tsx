import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
  Button,
} from "@react-email/components";

interface UserResetPasswordEmailProps {
  name: string;
  resetUrl: string;
}

export default function UserResetPasswordEmail({
  name,
  resetUrl,
}: UserResetPasswordEmailProps) {
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
            Redefinição de senha no SmartSeed
          </Heading>

          <Text>Olá {name},</Text>

          <Text>
            Recebemos uma solicitação para redefinir sua senha no SmartSeed.
            Para confirmar, clique no botão abaixo:
          </Text>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              href={resetUrl}
              style={{
                backgroundColor: "#63B926",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              Redefinir senha
            </Button>
          </Section>

          <Text style={{ fontSize: "14px", color: "#555" }}>
            Se o botão acima não funcionar, copie e cole o link abaixo no seu
            navegador:
          </Text>

          <Text
            style={{
              fontSize: "12px",
              wordBreak: "break-all",
              color: "#63B926",
            }}
          >
            {resetUrl}
          </Text>

          <Hr />

          <Text style={{ fontSize: "12px", color: "#888" }}>
            Caso você não tenha solicitado esta redefinição de senha, apenas ignore este
            e-mail. Nenhuma ação adicional será necessária.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
