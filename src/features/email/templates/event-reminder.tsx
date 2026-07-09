import {
  Heading,
  Img,
  Section,
  Text,
} from "@react-email/components";
import { Button, EmailLayout, styles } from "./shared";

interface EventReminderEmailProps {
  firstName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  daysUntil: number;
  qrCodeUrl?: string;
  registrationId?: string;
}

function getReminderHeading(daysUntil: number): string {
  if (daysUntil <= 1) return "Tomorrow!";
  if (daysUntil <= 3) return "Almost Here!";
  if (daysUntil <= 7) return "1 Week Away!";
  return "Reminder";
}

export function EventReminderEmail({
  firstName,
  eventTitle,
  eventDate,
  eventLocation,
  daysUntil,
  qrCodeUrl,
  registrationId,
}: EventReminderEmailProps) {
  const formattedDate = new Date(eventDate + "T00:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <EmailLayout
      previewText={`${eventTitle} is ${daysUntil <= 1 ? "tomorrow" : `${daysUntil} days away`}!`}
      footerNote="You are receiving this email because you registered for a Billion Soul Harvest event."
    >
      <Heading style={styles.heading}>
        {getReminderHeading(daysUntil)}
      </Heading>

      <Text style={styles.paragraph}>
        Dear {firstName}, {eventTitle} is just{" "}
        {daysUntil <= 1 ? "around the corner" : `${daysUntil} days away`}. We
        cannot wait to see you there!
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

      {qrCodeUrl && (
        <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
          <Img
            src={qrCodeUrl}
            width="180"
            height="180"
            alt="Check-in QR Code"
            style={{ margin: "0 auto", borderRadius: "8px" }}
          />
          {registrationId && (
            <Text
              style={{
                color: "#1a3a2a",
                fontSize: "14px",
                fontWeight: "700" as const,
                textAlign: "center" as const,
                margin: "8px 0 0",
              }}
            >
              Confirmation #{registrationId.substring(0, 8).toUpperCase()}
            </Text>
          )}
        </Section>
      )}

      <Text style={styles.paragraph}>
        <strong>Tips to prepare:</strong>
        <br />
        Arrive early to get settled, bring a notebook for key takeaways, and come
        with an open heart ready to be moved by the Spirit.
      </Text>

      <Button href="https://billionsoulharvest.com">
        View Event Details
      </Button>

      <Text style={styles.paragraph}>
        See you soon!
        <br />
        <strong>The Billion Soul Harvest Team</strong>
      </Text>
    </EmailLayout>
  );
}
