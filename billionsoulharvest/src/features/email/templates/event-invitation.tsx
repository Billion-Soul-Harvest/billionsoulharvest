import { Heading, Section, Text } from "@react-email/components";
import { Button, EmailLayout, styles } from "./shared";

interface EventInvitationEmailProps {
  firstName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventDescription?: string;
  registrationUrl: string;
}

export function EventInvitationEmail({
  firstName,
  eventTitle,
  eventDate,
  eventLocation,
  eventDescription,
  registrationUrl,
}: EventInvitationEmailProps) {
  const formattedDate = new Date(eventDate + "T00:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <EmailLayout
      previewText={`You're invited to ${eventTitle}!`}
      footerNote="You are receiving this email because you are a contact of Billion Soul Harvest."
      unsubscribeUrl="{{unsubscribe_url}}"
    >
      <Heading style={styles.heading}>You&apos;re Invited</Heading>

      <Text style={styles.paragraph}>
        Dear {firstName}, we would love for you to join us at{" "}
        <strong>{eventTitle}</strong> — a powerful gathering where lives will be
        transformed and the harvest will be advanced.
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

      {eventDescription && (
        <Text style={styles.paragraph}>{eventDescription}</Text>
      )}

      <Button href={registrationUrl}>Register Now</Button>

      <Text style={styles.paragraph}>
        Spaces are limited — secure your spot today and be part of something
        extraordinary.
      </Text>

      <Text style={styles.paragraph}>
        Blessings,
        <br />
        <strong>The Billion Soul Harvest Team</strong>
      </Text>
    </EmailLayout>
  );
}
