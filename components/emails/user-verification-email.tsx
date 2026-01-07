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

interface UserVerificationEmailProps {
  name: string;
  verifyUrl: string;
}

export default function UserVerificationEmail({
  name,
  verifyUrl,
}: UserVerificationEmailProps) {
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
            Confirme seu e-mail
          </Heading>

          <Text>Olá {name},</Text>

          <Text>
            Seu cadastro no <strong>SmartSeed</strong> foi realizado com sucesso.
            Para continuar e acessar o sistema, precisamos confirmar que este
            endereço de e-mail é realmente seu.
          </Text>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              href={verifyUrl}
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
              Confirmar e-mail
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
            {verifyUrl}
          </Text>

          <Hr />

          <Text style={{ fontSize: "12px", color: "#888" }}>
            Caso você não tenha solicitado este cadastro, apenas ignore este
            e-mail. Nenhuma ação adicional será necessária.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
