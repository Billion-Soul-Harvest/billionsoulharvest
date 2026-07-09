import {
  Heading,
  Img,
  Section,
  Text,
} from "@react-email/components";
import { EmailLayout, styles } from "./shared";

interface RegistrationConfirmationEmailProps {
  firstName: string;
  eventTitle: string;
  eventDate: string | null;
  eventLocation: string;
  qrCodeUrl: string;
  registrationId: string;
}

export function RegistrationConfirmationEmail({
  firstName,
  eventTitle,
  eventDate,
  eventLocation,
  qrCodeUrl,
  registrationId,
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
    <EmailLayout
      previewText={`Your registration for ${eventTitle} is confirmed!`}
      footerNote="You are receiving this email because you registered for a Billion Soul Harvest event."
    >
      <Heading style={styles.heading}>Registration Confirmed</Heading>

      <Text style={styles.paragraph}>Dear {firstName},</Text>

      <Text style={styles.paragraph}>
        Thank you for registering for <strong>{eventTitle}</strong>. We are
        excited to have you join us for this powerful gathering!
      </Text>

      <Section style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>EVENT DETAILS</Text>
        <Text style={styles.detailItem}>
          <strong>Event:</strong> {eventTitle}
        </Text>
        <Text style={styles.detailItem}>
          <strong>Date:</strong> {formattedDate}
        </Text>
        <Text style={styles.detailItem}>
          <strong>Location:</strong> {eventLocation}
        </Text>
      </Section>

      <Section style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>YOUR CHECK-IN QR CODE</Text>
        <Section style={qrCodeContainer}>
          <Img
            src={qrCodeUrl}
            width="200"
            height="200"
            alt="Check-in QR Code"
            style={qrCodeImage}
          />
        </Section>
        <Text style={qrCaption}>
          Present this QR code at the event for quick check-in.
        </Text>
        <Text style={confirmationNumber}>
          Confirmation #{registrationId.substring(0, 8).toUpperCase()}
        </Text>
      </Section>

      <Text style={styles.paragraph}>
        We will send you additional information as the event approaches,
        including accommodation details, schedule, and travel tips.
      </Text>

      <Text style={styles.paragraph}>
        If you have any questions, please don&apos;t hesitate to reach out to
        our team.
      </Text>

      <Text style={styles.paragraph}>
        Blessings,
        <br />
        <strong>The Billion Soul Harvest Team</strong>
      </Text>
    </EmailLayout>
  );
}

// Template-specific styles
const qrCodeContainer = {
  textAlign: "center" as const,
  margin: "16px 0",
};

const qrCodeImage = {
  margin: "0 auto",
  borderRadius: "8px",
};

const qrCaption = {
  color: "#4a4a4a",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "12px 0 4px",
};

const confirmationNumber = {
  color: "#1a3a2a",
  fontSize: "16px",
  fontWeight: "700" as const,
  textAlign: "center" as const,
  letterSpacing: "1px",
  margin: "4px 0 0",
};
