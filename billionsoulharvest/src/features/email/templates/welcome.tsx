import { Heading, Text } from "@react-email/components";
import { Button, EmailLayout, styles } from "./shared";

interface WelcomeEmailProps {
  firstName: string;
}

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <EmailLayout
      previewText="Welcome to Billion Soul Harvest!"
      footerNote="You are receiving this email because you recently joined Billion Soul Harvest."
    >
      <Heading style={styles.heading}>
        Welcome, {firstName}!
      </Heading>

      <Text style={styles.paragraph}>
        We are so glad you have joined the Billion Soul Harvest family. Together,
        we are reaching the nations for Christ and making an eternal impact across
        the globe.
      </Text>

      <Text style={styles.paragraph}>
        Here is what you can look forward to:
      </Text>

      <Text style={styles.paragraph}>
        <strong>Updates &amp; News</strong> — Stay informed about what God is
        doing through this ministry around the world.
        <br />
        <br />
        <strong>Events &amp; Gatherings</strong> — Be the first to know about
        upcoming conferences, crusades, and outreach opportunities.
        <br />
        <br />
        <strong>Community</strong> — Connect with fellow believers who share your
        passion for the harvest.
      </Text>

      <Button href="https://billionsoulharvest.com">
        Visit Our Website
      </Button>

      <Text style={styles.paragraph}>
        Blessings,
        <br />
        <strong>The Billion Soul Harvest Team</strong>
      </Text>
    </EmailLayout>
  );
}
