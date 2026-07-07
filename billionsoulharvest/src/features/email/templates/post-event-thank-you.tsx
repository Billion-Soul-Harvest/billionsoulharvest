import { Heading, Text } from "@react-email/components";
import { Button, EmailLayout, styles } from "./shared";

interface PostEventThankYouEmailProps {
  firstName: string;
  eventTitle: string;
}

export function PostEventThankYouEmail({
  firstName,
  eventTitle,
}: PostEventThankYouEmailProps) {
  return (
    <EmailLayout
      previewText={`Thank you for attending ${eventTitle}!`}
      footerNote="You are receiving this email because you attended a Billion Soul Harvest event."
    >
      <Heading style={styles.heading}>Thank You!</Heading>

      <Text style={styles.paragraph}>
        Dear {firstName}, thank you for being part of{" "}
        <strong>{eventTitle}</strong>. Your presence made a real difference, and
        we are grateful you chose to join us.
      </Text>

      <Text style={styles.paragraph}>
        We pray that what you experienced will continue to bear fruit in your
        life and ministry. The seeds planted during this event will reach far
        beyond what we can see today.
      </Text>

      <Text style={{ ...styles.paragraph, fontWeight: "700" as const }}>
        What&apos;s Next
      </Text>

      <Text style={styles.paragraph}>
        Stay connected with the Billion Soul Harvest community. We have more
        events, resources, and opportunities coming up — and we would love for
        you to be part of them.
      </Text>

      <Button href="https://billionsoulharvest.com">
        Stay Connected
      </Button>

      <Text style={styles.paragraph}>
        Blessings,
        <br />
        <strong>The Billion Soul Harvest Team</strong>
      </Text>
    </EmailLayout>
  );
}
