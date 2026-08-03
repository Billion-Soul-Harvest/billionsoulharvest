import { Html, Head, Body, Container, Section, Text, Heading, Hr, Link } from "@react-email/components";

interface DonationReceiptProps {
  donorName: string;
  campaignTitle: string;
  campaignSlug: string;
  amountFormatted: string;
  matchedAmountFormatted?: string;
  date: string;
  isRecurring: boolean;
}

export function DonationReceiptEmail({
  donorName,
  campaignTitle,
  campaignSlug,
  amountFormatted,
  matchedAmountFormatted,
  date,
  isRecurring,
}: DonationReceiptProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>Thank you for your donation!</Heading>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Dear {donorName}, your generous {isRecurring ? "recurring " : ""}donation has been received.
          </Text>

          <Section style={{ backgroundColor: "#f0fdfa", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
            <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}><strong>Campaign:</strong> {campaignTitle}</Text>
            <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}><strong>Amount:</strong> {amountFormatted}</Text>
            {matchedAmountFormatted && (
              <Text style={{ fontSize: "14px", color: "#0d9488", margin: "4px 0" }}><strong>Matched:</strong> {matchedAmountFormatted}</Text>
            )}
            <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}><strong>Date:</strong> {date}</Text>
            {isRecurring && <Text style={{ fontSize: "14px", color: "#374151", margin: "4px 0" }}><strong>Type:</strong> Monthly recurring</Text>}
          </Section>

          <Text style={{ color: "#6b7280", fontSize: "14px" }}>
            This email serves as your donation receipt for tax purposes.
          </Text>

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
