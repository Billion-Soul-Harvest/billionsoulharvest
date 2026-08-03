import { Html, Head, Body, Container, Text, Heading, Hr, Link } from "@react-email/components";

interface CampaignGoalReachedProps {
  creatorName: string;
  campaignTitle: string;
  campaignSlug: string;
  goalFormatted: string;
  raisedFormatted: string;
  donorCount: number;
}

export function CampaignGoalReachedEmail({
  creatorName,
  campaignTitle,
  campaignSlug,
  goalFormatted,
  raisedFormatted,
  donorCount,
}: CampaignGoalReachedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>Congratulations! Goal Reached!</Heading>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Hi {creatorName}, amazing news! Your campaign &ldquo;{campaignTitle}&rdquo; has reached its fundraising goal!
          </Text>
          <Text style={{ fontSize: "20px", color: "#0d9488", fontWeight: "bold", textAlign: "center" as const, margin: "16px 0" }}>
            {raisedFormatted} raised of {goalFormatted} goal
          </Text>
          <Text style={{ color: "#6b7280", fontSize: "14px", textAlign: "center" as const }}>
            Thanks to {donorCount} generous {donorCount === 1 ? "donor" : "donors"}
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
