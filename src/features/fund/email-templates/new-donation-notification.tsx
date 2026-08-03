import { Html, Head, Body, Container, Section, Text, Heading, Hr, Link } from "@react-email/components";

interface NewDonationNotificationProps {
  creatorName: string;
  donorName: string;
  campaignTitle: string;
  campaignSlug: string;
  amountFormatted: string;
  message?: string;
}

export function NewDonationNotificationEmail({
  creatorName,
  donorName,
  campaignTitle,
  campaignSlug,
  amountFormatted,
  message,
}: NewDonationNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>New Donation Received!</Heading>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Hi {creatorName}, great news! Your campaign just received a donation.
          </Text>

          <Section style={{ backgroundColor: "#f0fdfa", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
            <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}><strong>From:</strong> {donorName}</Text>
            <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}><strong>Amount:</strong> {amountFormatted}</Text>
            <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}><strong>Campaign:</strong> {campaignTitle}</Text>
          </Section>

          {message && (
            <Section style={{ backgroundColor: "#fef3c7", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
              <Text style={{ fontSize: "14px", color: "#92400e", fontStyle: "italic" }}>&ldquo;{message}&rdquo;</Text>
            </Section>
          )}

          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />

          <Link href={`https://fund.billionsoulharvest.org/campaigns/${campaignSlug}`} style={{ color: "#0891b2", fontSize: "14px" }}>
            View Campaign
          </Link>

          <Text style={{ color: "#9ca3af", fontSize: "12px", marginTop: "24px" }}>
            Billion Soul Harvest &middot; fund.billionsoulharvest.org
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
