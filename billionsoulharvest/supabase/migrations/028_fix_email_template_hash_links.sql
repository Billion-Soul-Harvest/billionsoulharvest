-- Fix seeded email templates: remove href="#" placeholder links that cause Gmail to silently drop emails
-- Replace <a href="#" ...> with <span ...> to preserve styling without dead links

-- CTA button styles
UPDATE campaign_templates
SET body_html = replace(
  replace(
    replace(
      replace(
        body_html,
        '<a href="#" style="display:inline-block;background-color:#006a62;color:#ffffff;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">',
        '<span style="display:inline-block;background-color:#006a62;color:#ffffff;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">'
      ),
      '<a href="#" style="display:inline-block;border:2px solid #000000;color:#000000;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;">',
      '<span style="display:inline-block;border:2px solid #000000;color:#000000;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;">'
    ),
    '<a href="#" style="display:block;background-color:#000000;color:#ffffff;padding:12px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;text-align:center;margin:0 0 8px;">',
    '<span style="display:block;background-color:#000000;color:#ffffff;padding:12px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;text-align:center;margin:0 0 8px;">'
  ),
  '<a href="#" style="display:block;border:2px solid #000000;color:#000000;padding:12px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;text-align:center;">',
  '<span style="display:block;border:2px solid #000000;color:#000000;padding:12px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;text-align:center;">'
)
WHERE body_html LIKE '%href="#"%';

-- Footer text links (Privacy Policy, Contact Us, Unsubscribe)
UPDATE campaign_templates
SET body_html = replace(
  replace(
    body_html,
    '<a href="#" style="color:#44474c;text-decoration:none;">',
    '<span style="color:#44474c;text-decoration:none;">'
  ),
  '</a>',
  '</span>'
)
WHERE body_html LIKE '%href="#"%';
