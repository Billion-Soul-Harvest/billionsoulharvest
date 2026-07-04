import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CampaignWrapperEmailProps {
  bodyHtml: string;
  previewText: string;
  firstName: string;
  lastName: string;
  unsubscribeUrl: string;
}

export function CampaignWrapperEmail({
  bodyHtml,
  previewText,
  firstName,
  lastName,
  unsubscribeUrl,
}: CampaignWrapperEmailProps) {
  // Replace merge fields in body
  const processedBody = bodyHtml
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{last_name\}\}/g, lastName);

  return (
    <Html>
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>BILLION SOUL HARVEST</Text>
          </Section>

          {/* Campaign Content */}
          <Section style={content}>
            <div dangerouslySetInnerHTML={{ __html: processedBody }} />
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Billion Soul Harvest Ministry
              <br />
              Reaching the nations for Christ
            </Text>
            <Text style={footerSmall}>
              You are receiving this email because you are a contact of Billion
              Soul Harvest.
              <br />
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles — matching registration-confirmation.tsx branding
const main = {
  backgroundColor: "#faf8f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden" as const,
  border: "1px solid #e8e0d4",
};

const header = {
  backgroundColor: "#1a3a2a",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const headerText = {
  color: "#d4a853",
  fontSize: "14px",
  fontWeight: "700" as const,
  letterSpacing: "3px",
  margin: "0",
};

const content = {
  padding: "40px",
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
};

const hr = {
  borderColor: "#e8e0d4",
  margin: "0",
};

const footer = {
  padding: "24px 40px",
};

const footerText = {
  color: "#8b7355",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const footerSmall = {
  color: "#b0a090",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};

const unsubscribeLink = {
  color: "#b0a090",
  textDecoration: "underline",
};
