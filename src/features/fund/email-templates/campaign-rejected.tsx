import { Html, Head, Body, Container, Text, Heading, Hr, Link } from "@react-email/components";

interface CampaignRejectedProps {
  creatorName: string;
  campaignTitle: string;
  reason?: string;
}

export function CampaignRejectedEmail({ creatorName, campaignTitle, reason }: CampaignRejectedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>Campaign Review Update</Heading>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Hi {creatorName}, unfortunately your campaign &ldquo;{campaignTitle}&rdquo; was not approved at this time.
          </Text>
          {reason && (
            <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
              <strong>Reason:</strong> {reason}
            </Text>
          )}
          <Text style={{ color: "#6b7280", fontSize: "14px" }}>
            You can edit your campaign and resubmit it for review. If you have questions, please contact us.
          </Text>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
          <Link href="https://fund.billionsoulharvest.org/dashboard" style={{ color: "#0891b2", fontSize: "14px" }}>
            Go to Dashboard
          </Link>
          <Text style={{ color: "#9ca3af", fontSize: "12px", marginTop: "24px" }}>
            Billion Soul Harvest &middot; fund.billionsoulharvest.org
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
