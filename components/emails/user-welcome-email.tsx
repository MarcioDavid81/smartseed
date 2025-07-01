import {
  Html,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
} from '@react-email/components'

interface UserWelcomeEmailProps {
  name: string
  companyName: string
  email: string
}

export default function UserWelcomeEmail({
  name,
  companyName,
  email,
}: UserWelcomeEmailProps) {
  return (
    <Html>
      <Body style={{ fontFamily: 'Arial, sans-serif', background: '#f9f9f9', padding: '20px' }}>
        <Container style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
          <Heading>Bem-vindo ao SmartSeed</Heading>
          <Text>Olá {name},</Text>
          <Text>
            Você foi cadastrado como usuário da empresa <strong>{companyName}</strong> no sistema <strong>SmartSeed</strong>.
          </Text>
          <Section>
            <Text><strong>E-mail de acesso:</strong> {email}</Text>
            <Text><strong>Senha:</strong> cadastrada pelo administrador</Text>
          </Section>
          <Text>
            Acesse o sistema em: <a href="https://smartseed.app.br/login">smartseed.app.br/login</a>
          </Text>
          <Hr />
          <Text style={{ fontSize: '12px', color: '#888' }}>
            Se você não reconhece este acesso, entre em contato com o administrador da sua empresa.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
