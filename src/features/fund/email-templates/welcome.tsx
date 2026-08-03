import { Html, Head, Body, Container, Text, Heading, Hr, Link } from "@react-email/components";

interface WelcomeProps {
  displayName: string;
}

export function WelcomeEmail({ displayName }: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>Welcome to BSH Fund!</Heading>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Hi {displayName}, welcome to the Billion Soul Harvest fundraising platform! You&apos;re now ready to create campaigns and support ministry work around the world.
          </Text>
          <Text style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px" }}>
            Here&apos;s what you can do:
          </Text>
          <Text style={{ color: "#374151", fontSize: "14px", margin: "8px 0" }}>1. Create a fundraising campaign for your ministry</Text>
          <Text style={{ color: "#374151", fontSize: "14px", margin: "8px 0" }}>2. Share it with your community</Text>
          <Text style={{ color: "#374151", fontSize: "14px", margin: "8px 0" }}>3. Receive donations and post updates</Text>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
          <Link href="https://fund.billionsoulharvest.org/campaigns/new" style={{ color: "#0891b2", fontSize: "14px" }}>
            Start Your First Campaign
          </Link>
          <Text style={{ color: "#9ca3af", fontSize: "12px", marginTop: "24px" }}>
            Billion Soul Harvest &middot; fund.billionsoulharvest.org
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
