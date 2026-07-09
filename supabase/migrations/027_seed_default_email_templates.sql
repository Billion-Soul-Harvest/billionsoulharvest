-- Seed 5 default email templates with email-compatible inline-styled HTML
-- These are based on the Celestial Harvest design system (Manrope + Work Sans, navy/cyan palette)

INSERT INTO campaign_templates (name, subject, body_html, preview_text, body_json) VALUES

-- ============================================================
-- 1. Welcome Email
-- ============================================================
(
  'Welcome Email',
  'Welcome to Billion Soul Harvest, {{first_name}}!',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" style="width:100%;background-color:#f3f3f4;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">
<!-- Header -->
<tr><td style="background-color:#ffffff;padding:16px 20px;text-align:center;border-bottom:1px solid #c4c6cc;">
<p style="color:#000000;font-family:Manrope,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin:0;">Billion Soul Harvest</p>
</td></tr>
<!-- Hero -->
<tr><td style="background-color:#0f1c2c;padding:60px 20px;text-align:center;">
<h1 style="font-family:Manrope,sans-serif;font-size:36px;font-weight:800;color:#ffffff;margin:0 0 12px;letter-spacing:-0.02em;">Welcome Home.</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:18px;line-height:28px;color:rgba(255,255,255,0.85);margin:0 0 24px;max-width:480px;">You''ve just joined a global movement dedicated to the greatest harvest in human history.</p>
<a href="#" style="display:inline-block;background-color:#006a62;color:#ffffff;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">Get Involved</a>
</td></tr>
<!-- Mission Content -->
<tr><td style="padding:48px 20px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#44474c;margin:0 0 8px;">Our Shared Mission</p>
<h2 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000000;margin:0 0 24px;letter-spacing:-0.01em;">Reaching Every Soul, Everywhere.</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 16px;">The <strong>Billion Soul Harvest</strong> is more than just a goal; it is a divine mandate. We believe that right now, the world is at a pivotal moment. The hearts of people everywhere are prepared, and the "harvest is truly plenteous."</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 24px;">Your presence here strengthens our collective voice. Together, we are building infrastructures of compassion, professional networks of outreach, and a visionary community focused on bringing hope to the farthest corners of the earth.</p>
<!-- Two Column Cards -->
<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:12px 0;">
<tr>
<td style="width:50%;vertical-align:top;border:1px solid #c4c6cc;border-radius:8px;padding:20px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#000000;margin:0 0 8px;">Global Impact</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;line-height:22px;color:#44474c;margin:0;">Strategizing outreach across all 7 continents to ensure no soul is left behind.</p>
</td>
<td style="width:50%;vertical-align:top;border:1px solid #c4c6cc;border-radius:8px;padding:20px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#000000;margin:0 0 8px;">United Action</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;line-height:22px;color:#44474c;margin:0;">Collaborating with local leaders to create sustainable, long-term spiritual growth.</p>
</td>
</tr>
</table>
</td></tr>
<!-- What''s Next -->
<tr><td style="padding:40px 20px;border-top:1px solid #c4c6cc;">
<h3 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000000;margin:0 0 20px;">What''s Next for You</h3>
<table cellpadding="0" cellspacing="0" style="width:100%;">
<tr><td style="padding:6px 0;font-family:''Work Sans'',sans-serif;font-size:16px;line-height:26px;color:#44474c;">&#10003; Receive weekly updates on our global harvest progress.</td></tr>
<tr><td style="padding:6px 0;font-family:''Work Sans'',sans-serif;font-size:16px;line-height:26px;color:#44474c;">&#10003; Connect with like-minded believers in your local area.</td></tr>
<tr><td style="padding:6px 0;font-family:''Work Sans'',sans-serif;font-size:16px;line-height:26px;color:#44474c;">&#10003; Access exclusive resources and training tools.</td></tr>
</table>
</td></tr>
<!-- CTA Section -->
<tr><td style="background-color:#0f1c2c;padding:48px 20px;text-align:center;">
<h2 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#ffffff;margin:0 0 12px;">Be Part of the Story.</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;color:rgba(255,255,255,0.8);margin:0 0 24px;">There are countless ways to get involved, from volunteering to donating to our global outreach funds.</p>
<a href="#" style="display:inline-block;background-color:#006a62;color:#ffffff;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">Learn More</a>
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#f3f3f4;border-top:1px solid #c4c6cc;padding:40px 20px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#1a1c1c;text-align:center;margin:0 0 12px;">Billion Soul Harvest</p>
<p style="font-size:14px;color:#44474c;text-align:center;margin:0 0 12px;line-height:1.6;">
<a href="#" style="color:#44474c;text-decoration:none;">Privacy Policy</a> &middot;
<a href="#" style="color:#44474c;text-decoration:none;">Contact Us</a> &middot;
<a href="{{unsubscribe_url}}" style="color:#44474c;text-decoration:none;">Unsubscribe</a>
</p>
<p style="color:#44474c;font-size:12px;text-align:center;margin:0;">&copy; 2025 Billion Soul Harvest. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>',
  'You''ve just joined a global movement dedicated to the greatest harvest in human history.',
  NULL
),

-- ============================================================
-- 2. Event Invitation
-- ============================================================
(
  'Event Invitation',
  'You''re Invited: {{event_name}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" style="width:100%;background-color:#f3f3f4;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">
<!-- Header -->
<tr><td style="background-color:#ffffff;padding:16px 20px;text-align:center;border-bottom:1px solid #c4c6cc;">
<p style="color:#000000;font-family:Manrope,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin:0;">Billion Soul Harvest</p>
</td></tr>
<!-- Hero with overlay -->
<tr><td style="background-color:#0f1c2c;padding:48px 20px;text-align:center;">
<h1 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#ffffff;margin:0 0 8px;">The Harvest Summit 2025</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;color:rgba(255,255,255,0.8);margin:0;">Uniting visionary leaders for a global mission.</p>
</td></tr>
<!-- Event Details Grid -->
<tr><td style="padding:32px 20px;">
<table cellpadding="0" cellspacing="0" style="width:100%;background-color:#f3f3f4;border-radius:8px;border:1px solid #c4c6cc;">
<tr>
<td style="width:33%;text-align:center;padding:16px 8px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;color:#1a1c1c;margin:0 0 4px;text-transform:uppercase;">Date</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;margin:0;">Oct 24 - 26, 2025</p>
</td>
<td style="width:33%;text-align:center;padding:16px 8px;border-left:1px solid #c4c6cc;border-right:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;color:#1a1c1c;margin:0 0 4px;text-transform:uppercase;">Time</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;margin:0;">09:00 AM EST</p>
</td>
<td style="width:33%;text-align:center;padding:16px 8px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;color:#1a1c1c;margin:0 0 4px;text-transform:uppercase;">Location</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;margin:0;">New York City, NY</p>
</td>
</tr>
</table>
</td></tr>
<!-- Description -->
<tr><td style="padding:0 20px 40px;text-align:center;">
<h2 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000000;margin:0 0 16px;">A Gathering of Purpose</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:18px;line-height:28px;color:#44474c;margin:0 0 32px;">Join thousands of believers and leaders as we strategize for the greatest spiritual harvest in human history. This isn''t just an event; it''s a catalyst for global transformation. Expect powerful keynotes, collaborative workshops, and divine connections.</p>
<!-- Features -->
<table cellpadding="0" cellspacing="0" style="width:100%;max-width:400px;margin:0 auto 32px;">
<tr><td style="padding:6px 0;font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;text-align:left;">&#10003; Strategic networking with 500+ global organizations.</td></tr>
<tr><td style="padding:6px 0;font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;text-align:left;">&#10003; Exclusive insights into the latest missional tools.</td></tr>
<tr><td style="padding:6px 0;font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;text-align:left;">&#10003; Immersive worship and vision-casting sessions.</td></tr>
</table>
<!-- CTA -->
<a href="#" style="display:inline-block;background-color:#006a62;color:#ffffff;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">Register Now</a>
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#f3f3f4;border-top:1px solid #c4c6cc;padding:40px 20px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#1a1c1c;text-align:center;margin:0 0 8px;">Billion Soul Harvest</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;text-align:center;margin:0 0 12px;">To fulfill the Great Commission in our generation through unity, innovation, and prayer.</p>
<p style="font-size:14px;color:#44474c;text-align:center;margin:0 0 12px;line-height:1.6;">
<a href="#" style="color:#44474c;text-decoration:none;">Privacy Policy</a> &middot;
<a href="#" style="color:#44474c;text-decoration:none;">Contact Us</a> &middot;
<a href="{{unsubscribe_url}}" style="color:#44474c;text-decoration:none;">Unsubscribe</a>
</p>
<p style="color:#44474c;font-size:12px;text-align:center;margin:0;">&copy; 2025 Billion Soul Harvest. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>',
  'Join thousands of believers and leaders as we strategize for the greatest spiritual harvest in human history.',
  NULL
),

-- ============================================================
-- 3. Event Reminder
-- ============================================================
(
  'Event Reminder',
  'Reminder: {{event_name}} is Almost Here!',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" style="width:100%;background-color:#f3f3f4;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">
<!-- Header -->
<tr><td style="background-color:#ffffff;padding:16px 20px;text-align:center;border-bottom:1px solid #c4c6cc;">
<p style="color:#000000;font-family:Manrope,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin:0;">Billion Soul Harvest</p>
</td></tr>
<!-- Countdown Hero -->
<tr><td style="padding:48px 20px;text-align:center;">
<p style="display:inline-block;background-color:#006a62;color:#ffffff;font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;padding:6px 20px;border-radius:9999px;margin:0 0 20px;">Final Reminder</p>
<h1 style="font-family:Manrope,sans-serif;font-size:40px;font-weight:800;color:#000000;margin:0 0 16px;letter-spacing:-0.02em;">Just 3 Days to Go!</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:18px;line-height:28px;color:#44474c;margin:0 0 28px;max-width:460px;">The global gathering for the final harvest is nearly upon us. We are preparing to ignite a new movement of visionary leadership.</p>
<!-- Countdown Display -->
<table cellpadding="0" cellspacing="0" style="margin:0 auto;background-color:#f3f3f4;border-radius:12px;border:1px solid #c4c6cc;">
<tr>
<td style="text-align:center;padding:16px 24px;">
<p style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#000000;margin:0;">03</p>
<p style="font-family:Manrope,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.05em;color:#44474c;margin:4px 0 0;text-transform:uppercase;">Days</p>
</td>
<td style="width:1px;background-color:#c4c6cc;padding:0;"></td>
<td style="text-align:center;padding:16px 24px;">
<p style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#000000;margin:0;">14</p>
<p style="font-family:Manrope,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.05em;color:#44474c;margin:4px 0 0;text-transform:uppercase;">Hrs</p>
</td>
<td style="width:1px;background-color:#c4c6cc;padding:0;"></td>
<td style="text-align:center;padding:16px 24px;">
<p style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#000000;margin:0;">28</p>
<p style="font-family:Manrope,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.05em;color:#44474c;margin:4px 0 0;text-transform:uppercase;">Mins</p>
</td>
</tr>
</table>
</td></tr>
<!-- Event Detail Card -->
<tr><td style="padding:0 20px 40px;">
<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #c4c6cc;border-radius:12px;">
<tr><td style="padding:24px;">
<h2 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000000;margin:0 0 8px;">Harvest Global Summit 2025</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 20px;">Join thousands of world-shapers as we align our strategies for the greatest spiritual expansion in history.</p>
<!-- Details -->
<table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
<tr><td style="padding:6px 0;font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#1a1c1c;">&#128197; OCTOBER 14-16, 2025</td></tr>
<tr><td style="padding:6px 0;font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#1a1c1c;">&#128205; VIRTUAL STREAM &amp; SEOUL, SK</td></tr>
<tr><td style="padding:6px 0;font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#1a1c1c;">&#128336; 09:00 AM - 05:00 PM (KST)</td></tr>
</table>
<!-- CTAs -->
<a href="#" style="display:block;background-color:#000000;color:#ffffff;padding:12px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;text-align:center;margin:0 0 8px;">Access the Live Stream</a>
<a href="#" style="display:block;border:2px solid #000000;color:#000000;padding:12px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;text-align:center;">View Full Agenda</a>
</td></tr>
</table>
</td></tr>
<!-- Preparation Checklist -->
<tr><td style="padding:0 20px 48px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#44474c;margin:0 0 16px;">Preparation Checklist</p>
<table cellpadding="0" cellspacing="0" style="width:100%;">
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;">&#10003; Download the Official Event App for networking.</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;">&#10003; Review the breakout session speakers.</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;">&#10003; Ensure your internet connection is stable for the UHD stream.</td></tr>
</table>
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#f3f3f4;border-top:1px solid #c4c6cc;padding:40px 20px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#1a1c1c;text-align:center;margin:0 0 12px;">Billion Soul Harvest</p>
<p style="font-size:14px;color:#44474c;text-align:center;margin:0 0 12px;line-height:1.6;">
<a href="#" style="color:#44474c;text-decoration:none;">Unsubscribe</a> &middot;
<a href="#" style="color:#44474c;text-decoration:none;">Privacy Policy</a> &middot;
<a href="#" style="color:#44474c;text-decoration:none;">Contact Us</a>
</p>
<p style="color:#44474c;font-size:12px;text-align:center;margin:0;">&copy; 2025 Billion Soul Harvest. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>',
  'The global gathering is nearly upon us. Just 3 days to go!',
  NULL
),

-- ============================================================
-- 4. Post-Event Thank You
-- ============================================================
(
  'Post-Event Thank You',
  'Thank You for Joining Us, {{first_name}}!',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" style="width:100%;background-color:#f3f3f4;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">
<!-- Header -->
<tr><td style="background-color:#ffffff;padding:16px 20px;text-align:center;border-bottom:1px solid #c4c6cc;">
<p style="color:#000000;font-family:Manrope,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin:0;">Billion Soul Harvest</p>
</td></tr>
<!-- Hero -->
<tr><td style="background-color:#0f1c2c;padding:60px 20px;text-align:center;">
<h1 style="font-family:Manrope,sans-serif;font-size:36px;font-weight:800;color:#ffffff;margin:0 0 12px;letter-spacing:-0.02em;">Thank You for Joining Us</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;line-height:26px;color:#778598;margin:0;max-width:480px;">Your presence fueled the momentum. Together, we are witnessing the greatest spiritual harvest in history.</p>
</td></tr>
<!-- Impact Counter -->
<tr><td style="padding:40px 20px;">
<table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #c4c6cc;border-radius:12px;text-align:center;">
<tr><td colspan="3" style="padding:16px 20px 8px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#006a62;margin:0;">The Collective Impact</p>
</td></tr>
<tr>
<td style="width:50%;padding:12px 20px;">
<p style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#000000;margin:0;">12,400+</p>
<p style="font-family:Manrope,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.05em;color:#44474c;margin:4px 0 0;text-transform:uppercase;">Attendees</p>
</td>
<td style="width:1px;background-color:#c4c6cc;padding:0;"></td>
<td style="width:50%;padding:12px 20px;">
<p style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#000000;margin:0;">82</p>
<p style="font-family:Manrope,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.05em;color:#44474c;margin:4px 0 0;text-transform:uppercase;">Nations</p>
</td>
</tr>
<tr><td colspan="3" style="padding:8px 20px 16px;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;text-align:right;font-style:italic;margin:0;">85% of our 2025 mission goal reached</p>
</td></tr>
</table>
</td></tr>
<!-- Memorable Moments -->
<tr><td style="padding:0 20px 40px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#000000;margin:0 0 16px;">Memorable Moments</p>
<table cellpadding="0" cellspacing="0" style="width:100%;">
<tr><td style="padding:12px 0;border-bottom:1px solid #f3f3f4;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#000000;margin:0 0 4px;">&#10003; Unveiling the 2030 Roadmap</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;margin:0;">The strategic blueprint for reaching 1 billion souls was shared with the global leadership team.</p>
</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #f3f3f4;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#000000;margin:0 0 4px;">&#10003; Interactive Community Prayer</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;margin:0;">A powerful moment of synchronized prayer across 12 time zones simultaneously.</p>
</td></tr>
<tr><td style="padding:12px 0;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#000000;margin:0 0 4px;">&#10003; Leadership Roundtable</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;margin:0;">Practical workshops focused on sustainable growth and community development.</p>
</td></tr>
</table>
</td></tr>
<!-- Feedback CTA -->
<tr><td style="padding:40px 20px;border-top:1px solid #c4c6cc;text-align:center;">
<h2 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000000;margin:0 0 8px;">Help Us Grow</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;margin:0 0 20px;">Your feedback is vital to our mission. Please take 2 minutes to share your experience.</p>
<a href="#" style="display:inline-block;background-color:#006a62;color:#ffffff;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">Share Your Feedback</a>
</td></tr>
<!-- Save the Date -->
<tr><td style="padding:40px 20px;border-top:1px solid #c4c6cc;text-align:center;">
<h2 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000000;margin:0 0 8px;">Save the Date</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;margin:0 0 16px;">The Harvest Continues in Singapore.</p>
<table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;border:1px solid #c4c6cc;border-radius:12px;">
<tr><td style="padding:16px 32px;text-align:center;">
<p style="font-family:Manrope,sans-serif;font-size:24px;font-weight:700;color:#006a62;margin:0 0 4px;">March 14-17, 2026</p>
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;color:#44474c;margin:0;text-transform:uppercase;">The Global Harvest Summit</p>
</td></tr>
</table>
<a href="#" style="display:inline-block;border:2px solid #000000;color:#000000;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;">Pre-Register Now</a>
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#f3f3f4;border-top:1px solid #c4c6cc;padding:40px 20px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#1a1c1c;text-align:center;margin:0 0 12px;">Billion Soul Harvest</p>
<p style="font-size:14px;color:#44474c;text-align:center;margin:0 0 12px;line-height:1.6;">
<a href="#" style="color:#44474c;text-decoration:none;">Unsubscribe</a> &middot;
<a href="#" style="color:#44474c;text-decoration:none;">Privacy Policy</a> &middot;
<a href="#" style="color:#44474c;text-decoration:none;">Contact Us</a>
</p>
<p style="color:#44474c;font-size:12px;text-align:center;margin:0;">&copy; 2025 Billion Soul Harvest. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>',
  'Your presence fueled the momentum. Together, we are witnessing the greatest spiritual harvest in history.',
  NULL
),

-- ============================================================
-- 5. Blank Email Template
-- ============================================================
(
  'Blank Template',
  'A Message from Billion Soul Harvest',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" style="width:100%;background-color:#f3f3f4;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;">
<!-- Header -->
<tr><td style="background-color:#ffffff;padding:16px 20px;text-align:center;border-bottom:1px solid #c4c6cc;">
<p style="color:#000000;font-family:Manrope,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin:0;">Billion Soul Harvest</p>
</td></tr>
<!-- Content -->
<tr><td style="padding:40px 20px;">
<h1 style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#000000;margin:0 0 12px;letter-spacing:-0.01em;">A Vision for the Global Harvest</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:18px;line-height:28px;color:#44474c;margin:0 0 24px;">Join us in our mission to reach every heart and mind with a message of hope and compassion.</p>
<!-- Content Placeholder -->
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px dashed #c4c6cc;border-radius:8px;margin:0 0 24px;">
<tr><td style="padding:48px 20px;text-align:center;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#44474c;margin:0 0 8px;">Message Content Area</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;margin:0;">Insert your professional communication text, images, or flexible modules here.</p>
</td></tr>
</table>
<!-- Bullet Points -->
<table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
<tr><td style="padding:6px 0;font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;">&#10003; Visionary planning for global outreach programs.</td></tr>
<tr><td style="padding:6px 0;font-family:''Work Sans'',sans-serif;font-size:16px;color:#44474c;">&#10003; Compassionate community engagement and support.</td></tr>
</table>
</td></tr>
<!-- CTA -->
<tr><td style="padding:0 20px 40px;text-align:center;">
<a href="#" style="display:inline-block;background-color:#006a62;color:#ffffff;padding:12px 48px;border-radius:8px;font-family:Manrope,sans-serif;font-size:16px;font-weight:600;text-decoration:none;letter-spacing:0.05em;text-transform:uppercase;">Support the Harvest</a>
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#44474c;margin:16px 0 0;">Transforming Lives Together</p>
</td></tr>
<!-- Footer -->
<tr><td style="background-color:#f3f3f4;border-top:1px solid #c4c6cc;padding:40px 20px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#1a1c1c;text-align:center;margin:0 0 12px;">Billion Soul Harvest</p>
<p style="font-size:14px;color:#44474c;text-align:center;margin:0 0 12px;line-height:1.6;">
<a href="#" style="color:#44474c;text-decoration:none;">Unsubscribe</a> &middot;
<a href="#" style="color:#44474c;text-decoration:none;">Privacy Policy</a> &middot;
<a href="#" style="color:#44474c;text-decoration:none;">Contact Us</a>
</p>
<p style="color:#44474c;font-size:12px;text-align:center;margin:0;">&copy; 2025 Billion Soul Harvest. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>',
  'Join us in our mission to reach every heart and mind with a message of hope and compassion.',
  NULL
)

ON CONFLICT DO NOTHING;
