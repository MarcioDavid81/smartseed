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
}

export default function UserChangedPasswordEmail({
  name,
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
            Senha alterada no SmartSeed
          </Heading>

          <Text>Olá {name},</Text>

          <Text>
            Sua senha no SmartSeed foi alterada com sucesso.
            Para confirmar, clique no botão abaixo:
          </Text>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button
              href={process.env.APP_URL + "/login"}
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
              Acessar o SmartSeed
            </Button>
          </Section>

          <Hr />

          <Text style={{ fontSize: "12px", color: "#888" }}>
            Caso você não tenha solicitado este mudança de senha, entre em contato com nosso suporte.
            Nenhuma ação adicional será necessária.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
