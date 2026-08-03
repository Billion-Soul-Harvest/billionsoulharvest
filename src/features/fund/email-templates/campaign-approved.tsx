import { Html, Head, Body, Container, Text, Heading, Hr, Link } from "@react-email/components";

interface CampaignApprovedProps {
  creatorName: string;
  campaignTitle: string;
  campaignSlug: string;
}

export function CampaignApprovedEmail({ creatorName, campaignTitle, campaignSlug }: CampaignApprovedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>Your Campaign is Live!</Heading>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Hi {creatorName}, your campaign &ldquo;{campaignTitle}&rdquo; has been approved and is now live on BSH Fund.
          </Text>
          <Text style={{ color: "#6b7280", fontSize: "14px" }}>
            Share it with your community and start raising support for your ministry!
          </Text>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
          <Link href={`https://fund.billionsoulharvest.org/campaigns/${campaignSlug}`} style={{ color: "#0891b2", fontSize: "14px" }}>
            View Your Campaign
          </Link>
          <Text style={{ color: "#9ca3af", fontSize: "12px", marginTop: "24px" }}>
            Billion Soul Harvest &middot; fund.billionsoulharvest.org
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
