import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Hr,
} from "@react-email/components";

interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
}

export default function ContactEmail({
  name,
  email,
  message,
}: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Novo contato via SmartSeed</Preview>

      <Body style={{ backgroundColor: "#f6f9fc" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "24px" }}>
          <Heading>Novo contato recebido</Heading>

          <Text><strong>Nome:</strong> {name}</Text>
          <Text><strong>Email:</strong> {email}</Text>

          <Hr />

          <Text><strong>Mensagem:</strong></Text>
          <Text>{message}</Text>
        </Container>
      </Body>
    </Html>
  );
}
