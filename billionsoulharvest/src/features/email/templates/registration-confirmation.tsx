import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface RegistrationConfirmationEmailProps {
  firstName: string;
  eventTitle: string;
  eventDate: string | null;
  eventLocation: string;
}

export function RegistrationConfirmationEmail({
  firstName,
  eventTitle,
  eventDate,
  eventLocation,
}: RegistrationConfirmationEmailProps) {
  const formattedDate = eventDate
    ? new Date(eventDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";

  return (
    <Html>
      <Head />
      <Preview>Your registration for {eventTitle} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>BILLION SOUL HARVEST</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={heading}>Registration Confirmed</Heading>

            <Text style={paragraph}>Dear {firstName},</Text>

            <Text style={paragraph}>
              Thank you for registering for <strong>{eventTitle}</strong>. We
              are excited to have you join us for this powerful gathering!
            </Text>

            {/* Event Details Box */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>EVENT DETAILS</Text>
              <Text style={detailItem}>
                <strong>Event:</strong> {eventTitle}
              </Text>
              <Text style={detailItem}>
                <strong>Date:</strong> {formattedDate}
              </Text>
              <Text style={detailItem}>
                <strong>Location:</strong> {eventLocation}
              </Text>
            </Section>

            <Text style={paragraph}>
              We will send you additional information as the event approaches,
              including accommodation details, schedule, and travel tips.
            </Text>

            <Text style={paragraph}>
              If you have any questions, please don&apos;t hesitate to reach out
              to our team.
            </Text>

            <Text style={paragraph}>
              Blessings,
              <br />
              <strong>The Billion Soul Harvest Team</strong>
            </Text>
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
              You are receiving this email because you registered for a Billion
              Soul Harvest event.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
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
};

const heading = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700" as const,
  margin: "0 0 24px",
};

const paragraph = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const detailsBox = {
  backgroundColor: "#faf8f5",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e8e0d4",
};

const detailsTitle = {
  color: "#8b7355",
  fontSize: "12px",
  fontWeight: "700" as const,
  letterSpacing: "2px",
  margin: "0 0 16px",
};

const detailItem = {
  color: "#4a4a4a",
  fontSize: "15px",
  lineHeight: "1.4",
  margin: "0 0 8px",
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
