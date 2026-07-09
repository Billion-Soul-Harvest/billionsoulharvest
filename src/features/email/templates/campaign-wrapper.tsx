import { EmailLayout, styles } from "./shared";

interface CampaignWrapperEmailProps {
  bodyHtml: string;
  previewText: string;
  firstName: string;
  lastName: string;
  unsubscribeUrl: string;
}

export function CampaignWrapperEmail({
  bodyHtml,
  previewText,
  firstName,
  lastName,
  unsubscribeUrl,
}: CampaignWrapperEmailProps) {
  const processedBody = bodyHtml
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{last_name\}\}/g, lastName);

  return (
    <EmailLayout previewText={previewText} unsubscribeUrl={unsubscribeUrl}>
      <div
        style={{ color: styles.paragraph.color, fontSize: "16px", lineHeight: "1.7" }}
        dangerouslySetInnerHTML={{ __html: processedBody }}
      />
    </EmailLayout>
  );
}
