-- Delete existing seeded templates and reseed with Gmail-compatible inline-styled HTML versions
DELETE FROM campaign_templates WHERE name IN ('Welcome Email', 'Event Invitation', 'Event Reminder', 'Post-Event Thank You', 'Blank Template');

INSERT INTO campaign_templates (name, subject, body_html, preview_text, body_json) VALUES
(
  'Welcome Email',
  'Welcome to Billion Soul Harvest, {{first_name}}!',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to Billion Soul Harvest</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td align="center" style="padding:24px 40px;background-color:#ffffff;border-bottom:1px solid #c4c6cc;">
<span style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;color:#0f1c2c;">BILLION SOUL HARVEST</span>
</td></tr>

<!-- Hero Section -->
<tr><td style="background-color:#0f1c2c;padding:60px 40px;text-align:center;">
<h1 style="font-family:Manrope,sans-serif;font-size:36px;font-weight:700;color:#ffffff;margin:0 0 16px 0;">Welcome Home.</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:16px;color:#c4c6cc;margin:0 0 32px 0;line-height:1.6;">You''ve just joined a global movement dedicated to the greatest harvest in human history. Together, we will reach every soul, everywhere.</p>
<span style="display:inline-block;background-color:#00E5FF;color:#0f1c2c;font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;padding:14px 32px;border-radius:4px;text-transform:uppercase;">GET INVOLVED</span>
</td></tr>

<!-- Our Shared Mission -->
<tr><td style="padding:48px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#006a62;text-transform:uppercase;margin:0 0 4px 0;">OUR SHARED MISSION</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:3px;background-color:#00E5FF;"></td></tr></table>
<h2 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#1a1c1c;margin:16px 0;">Reaching Every Soul, Everywhere.</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:15px;color:#44474c;line-height:1.7;margin:0;">We believe in a world where every person has the opportunity to hear and respond to the message of hope. Our network of leaders, churches, and organizations spans the globe, working in unity toward this singular vision.</p>
</td></tr>
</table>
</td></tr>

<!-- Two Cards -->
<tr><td style="padding:0 40px 48px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="48%" valign="top" style="border:1px solid #c4c6cc;border-radius:8px;padding:24px;">
<h3 style="font-family:Manrope,sans-serif;font-size:18px;font-weight:700;color:#1a1c1c;margin:0 0 8px 0;">Global Impact</h3>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;line-height:1.6;margin:0;">Connecting leaders across 150+ nations to accelerate the harvest through strategic partnerships and collaboration.</p>
</td>
<td width="4%"></td>
<td width="48%" valign="top" style="border:1px solid #c4c6cc;border-radius:8px;padding:24px;">
<h3 style="font-family:Manrope,sans-serif;font-size:18px;font-weight:700;color:#1a1c1c;margin:0 0 8px 0;">United Action</h3>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;line-height:1.6;margin:0;">Mobilizing resources, prayer networks, and outreach teams to ensure no community is left unreached.</p>
</td>
</tr>
</table>
</td></tr>

<!-- Harvest Tracker -->
<tr><td style="padding:0 40px 48px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;border-radius:8px;padding:24px;">
<tr><td style="padding:24px;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#006a62;text-transform:uppercase;margin:0 0 12px 0;">THE HARVEST TRACKER</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#c4c6cc;border-radius:4px;height:8px;">
<tr><td style="width:35%;background-color:#00E5FF;border-radius:4px;height:8px;"></td><td></td></tr>
</table>
<p style="font-family:''Work Sans'',sans-serif;font-size:13px;color:#44474c;margin:8px 0 0 0;">35% of our global goal reached</p>
</td></tr>
</table>
</td></tr>

<!-- What''s Next -->
<tr><td style="padding:0 40px 48px 40px;">
<h3 style="font-family:Manrope,sans-serif;font-size:20px;font-weight:700;color:#1a1c1c;margin:0 0 16px 0;">What''s Next for You</h3>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Explore upcoming events and summits</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Connect with leaders in your region</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Discover partnership opportunities</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Join a prayer network near you</td></tr>
</table>
</td></tr>

<!-- Dark CTA Section -->
<tr><td style="background-color:#0f1c2c;padding:48px 40px;text-align:center;">
<h2 style="font-family:Manrope,sans-serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 8px 0;">Be Part of the Story.</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:15px;color:#c4c6cc;margin:0 0 24px 0;">Your journey with us is just beginning.</p>
<span style="display:inline-block;background-color:#00E5FF;color:#0f1c2c;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:12px 28px;border-radius:4px;text-transform:uppercase;">LEARN MORE</span>
<span style="display:inline-block;border:1px solid #ffffff;color:#ffffff;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:12px 28px;border-radius:4px;text-transform:uppercase;margin-left:12px;">CONTACT US</span>
</td></tr>

<!-- Footer -->
<tr><td style="padding:32px 40px;text-align:center;border-top:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;color:#0f1c2c;margin:0 0 8px 0;">BILLION SOUL HARVEST</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0 0 12px 0;">&copy; 2024 Billion Soul Harvest. All rights reserved.</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0;">
<a href="{{unsubscribe_url}}" style="color:#006a62;text-decoration:underline;">Unsubscribe</a>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Privacy Policy</span>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Contact Us</span>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>',
  'You''ve just joined a global movement dedicated to the greatest harvest in human history.',
  NULL
),
(
  'Event Invitation',
  'You''re Invited: {{event_name}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Event Invitation</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td align="center" style="padding:24px 40px;background-color:#ffffff;border-bottom:1px solid #c4c6cc;">
<span style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;color:#0f1c2c;">&#128276; BILLION SOUL HARVEST</span>
</td></tr>

<!-- Hero Section -->
<tr><td style="background-color:#0f1c2c;padding:60px 40px;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:rgba(255,255,255,0.05);border-radius:8px;">
<tr><td style="padding:40px;text-align:center;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#00E5FF;text-transform:uppercase;margin:0 0 12px 0;">YOU''RE INVITED</p>
<h1 style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">The Harvest Summit 2024</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:15px;color:#c4c6cc;margin:0;line-height:1.6;">Join thousands of believers and leaders as we strategize for the greatest spiritual harvest in history.</p>
</td></tr>
</table>
</td></tr>

<!-- Event Details Grid -->
<tr><td style="padding:40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="33%" align="center" style="padding:16px;border:1px solid #c4c6cc;border-radius:8px;">
<p style="font-size:24px;margin:0 0 4px 0;">&#128197;</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;color:#006a62;text-transform:uppercase;margin:0 0 4px 0;">DATE</p>
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:600;color:#1a1c1c;margin:0;">March 14-17, 2024</p>
</td>
<td width="2%"></td>
<td width="33%" align="center" style="padding:16px;border:1px solid #c4c6cc;border-radius:8px;">
<p style="font-size:24px;margin:0 0 4px 0;">&#128336;</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;color:#006a62;text-transform:uppercase;margin:0 0 4px 0;">TIME</p>
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:600;color:#1a1c1c;margin:0;">9:00 AM - 5:00 PM</p>
</td>
<td width="2%"></td>
<td width="33%" align="center" style="padding:16px;border:1px solid #c4c6cc;border-radius:8px;">
<p style="font-size:24px;margin:0 0 4px 0;">&#128205;</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;color:#006a62;text-transform:uppercase;margin:0 0 4px 0;">LOCATION</p>
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:600;color:#1a1c1c;margin:0;">Global Convention Center</p>
</td>
</tr>
</table>
</td></tr>

<!-- A Gathering of Purpose -->
<tr><td style="padding:0 40px 40px 40px;">
<h2 style="font-family:Manrope,sans-serif;font-size:24px;font-weight:700;color:#1a1c1c;margin:0 0 12px 0;">A Gathering of Purpose</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:15px;color:#44474c;line-height:1.7;margin:0 0 24px 0;">This isn''t just another conference. It''s a strategic convergence of visionaries, pastors, and ministry leaders united by one goal: to see every soul reached with the message of hope.</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Keynote sessions from global leaders</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Interactive breakout workshops</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Networking with 5,000+ attendees</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Live worship and prayer experiences</td></tr>
</table>
</td></tr>

<!-- Register Button -->
<tr><td align="center" style="padding:0 40px 40px 40px;">
<span style="display:inline-block;background-color:#006a62;color:#ffffff;font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;padding:14px 40px;border-radius:4px;text-transform:uppercase;">REGISTER NOW</span>
</td></tr>

<!-- Event Capacity -->
<tr><td style="padding:0 40px 48px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;border-radius:8px;">
<tr><td style="padding:24px;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#006a62;text-transform:uppercase;margin:0 0 4px 0;">EVENT CAPACITY</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:13px;color:#44474c;margin:0 0 12px 0;">78% of seats filled</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#c4c6cc;border-radius:4px;height:8px;">
<tr><td style="width:78%;background-color:#00E5FF;border-radius:4px;height:8px;"></td><td></td></tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:32px 40px;text-align:center;border-top:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;color:#0f1c2c;margin:0 0 8px 0;">BILLION SOUL HARVEST</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0 0 4px 0;">Uniting leaders for the greatest harvest in history.</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0 0 12px 0;">&copy; 2024 Billion Soul Harvest. All rights reserved.</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0;">
<a href="{{unsubscribe_url}}" style="color:#006a62;text-decoration:underline;">Unsubscribe</a>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Privacy Policy</span>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Contact Us</span>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>',
  'Join thousands of believers and leaders as we strategize for the greatest spiritual harvest.',
  NULL
),
(
  'Event Reminder',
  'Reminder: {{event_name}} is Almost Here!',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Event Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td align="center" style="padding:24px 40px;background-color:#ffffff;border-bottom:1px solid #c4c6cc;">
<span style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;color:#0f1c2c;">BILLION SOUL HARVEST</span>
</td></tr>

<!-- Badge + Heading -->
<tr><td align="center" style="padding:48px 40px 0 40px;">
<span style="display:inline-block;background-color:#00E5FF;color:#0f1c2c;font-family:Manrope,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 16px;border-radius:20px;text-transform:uppercase;">FINAL REMINDER</span>
<h1 style="font-family:Manrope,sans-serif;font-size:34px;font-weight:700;color:#1a1c1c;margin:20px 0 8px 0;">Just 3 Days to Go!</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:15px;color:#44474c;margin:0 0 32px 0;line-height:1.6;">The global gathering is nearly upon us. Make sure you''re prepared for an unforgettable experience.</p>
</td></tr>

<!-- Countdown -->
<tr><td style="padding:0 40px 40px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #c4c6cc;border-radius:8px;">
<tr>
<td width="33%" align="center" style="padding:24px 16px;border-right:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:36px;font-weight:700;color:#0f1c2c;margin:0;">03</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;color:#44474c;text-transform:uppercase;margin:4px 0 0 0;">DAYS</p>
</td>
<td width="33%" align="center" style="padding:24px 16px;border-right:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:36px;font-weight:700;color:#0f1c2c;margin:0;">14</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;color:#44474c;text-transform:uppercase;margin:4px 0 0 0;">HRS</p>
</td>
<td width="33%" align="center" style="padding:24px 16px;">
<p style="font-family:Manrope,sans-serif;font-size:36px;font-weight:700;color:#0f1c2c;margin:0;">28</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;color:#44474c;text-transform:uppercase;margin:4px 0 0 0;">MINS</p>
</td>
</tr>
</table>
</td></tr>

<!-- Event Card -->
<tr><td style="padding:0 40px 40px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f1c2c;border-radius:8px;">
<tr><td style="padding:32px;text-align:center;">
<h2 style="font-family:Manrope,sans-serif;font-size:22px;font-weight:700;color:#ffffff;margin:0 0 16px 0;">Harvest Global Summit 2024</h2>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#c4c6cc;margin:0 0 4px 0;">&#128197; March 14-17, 2024</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#c4c6cc;margin:0 0 4px 0;">&#128336; 9:00 AM - 5:00 PM Daily</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#c4c6cc;margin:0 0 24px 0;">&#128205; Global Convention Center</p>
<span style="display:inline-block;background-color:#1a1c1c;color:#ffffff;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:12px 24px;border-radius:4px;text-transform:uppercase;">ACCESS THE LIVE STREAM</span>
<span style="display:inline-block;border:1px solid #ffffff;color:#ffffff;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:12px 24px;border-radius:4px;text-transform:uppercase;margin-left:8px;">VIEW FULL AGENDA</span>
</td></tr>
</table>
</td></tr>

<!-- Preparation Checklist -->
<tr><td style="padding:0 40px 48px 40px;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#006a62;text-transform:uppercase;margin:0 0 16px 0;">PREPARATION CHECKLIST</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Confirm your registration details</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Download the event app</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Review the session schedule</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Plan your travel and accommodation</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Invite a friend to join you</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:32px 40px;text-align:center;border-top:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;color:#0f1c2c;margin:0 0 8px 0;">BILLION SOUL HARVEST</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0 0 12px 0;">&copy; 2024 Billion Soul Harvest. All rights reserved.</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0;">
<a href="{{unsubscribe_url}}" style="color:#006a62;text-decoration:underline;">Unsubscribe</a>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Privacy Policy</span>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Contact Us</span>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>',
  'The global gathering is nearly upon us. Just 3 days to go!',
  NULL
),
(
  'Post-Event Thank You',
  'Thank You for Joining Us, {{first_name}}!',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Thank You</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td align="center" style="padding:24px 40px;background-color:#ffffff;border-bottom:1px solid #c4c6cc;">
<span style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;color:#0f1c2c;">&#128276; BILLION SOUL HARVEST</span>
</td></tr>

<!-- Hero Section -->
<tr><td style="background-color:#0f1c2c;padding:60px 40px;text-align:center;">
<h1 style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">Thank You for Joining Us</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:15px;color:#c4c6cc;margin:0;line-height:1.6;">Your presence fueled the momentum. Together, we are witnessing the greatest spiritual harvest in history.</p>
</td></tr>

<!-- Impact Counter -->
<tr><td style="padding:40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #c4c6cc;border-radius:8px;">
<tr><td style="padding:24px;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#006a62;text-transform:uppercase;margin:0 0 16px 0;">THE COLLECTIVE IMPACT</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="48%" align="center" style="padding:16px;background-color:#f3f3f4;border-radius:8px;">
<p style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#0f1c2c;margin:0;">12,400+</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:1px;color:#44474c;text-transform:uppercase;margin:4px 0 0 0;">ATTENDEES</p>
</td>
<td width="4%"></td>
<td width="48%" align="center" style="padding:16px;background-color:#f3f3f4;border-radius:8px;">
<p style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#0f1c2c;margin:0;">82</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:1px;color:#44474c;text-transform:uppercase;margin:4px 0 0 0;">NATIONS</p>
</td>
</tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;">
<tr><td>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#c4c6cc;border-radius:4px;height:8px;">
<tr><td style="width:85%;background-color:#00E5FF;border-radius:4px;height:8px;"></td><td></td></tr>
</table>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:6px 0 0 0;">85% engagement rate across all sessions</p>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- Memorable Moments -->
<tr><td style="padding:0 40px 40px 40px;">
<h3 style="font-family:Manrope,sans-serif;font-size:20px;font-weight:700;color:#1a1c1c;margin:0 0 16px 0;">Memorable Moments</h3>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Unveiling the 2030 Roadmap</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Interactive Community Prayer</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Leadership Roundtable</td></tr>
</table>
</td></tr>

<!-- Help Us Grow CTA -->
<tr><td style="padding:0 40px 40px 40px;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;border-radius:8px;">
<tr><td style="padding:32px;text-align:center;">
<h3 style="font-family:Manrope,sans-serif;font-size:20px;font-weight:700;color:#1a1c1c;margin:0 0 8px 0;">Help Us Grow</h3>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;margin:0 0 20px 0;line-height:1.6;">Your feedback shapes our future events and initiatives.</p>
<span style="display:inline-block;background-color:#00E5FF;color:#0f1c2c;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:12px 28px;border-radius:4px;text-transform:uppercase;">SHARE YOUR FEEDBACK</span>
</td></tr>
</table>
</td></tr>

<!-- Save the Date -->
<tr><td style="padding:0 40px 48px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #c4c6cc;border-radius:8px;">
<tr><td style="padding:32px;text-align:center;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#006a62;text-transform:uppercase;margin:0 0 8px 0;">SAVE THE DATE</p>
<h3 style="font-family:Manrope,sans-serif;font-size:22px;font-weight:700;color:#1a1c1c;margin:0 0 4px 0;">March 14-17, 2025</h3>
<p style="font-family:''Work Sans'',sans-serif;font-size:14px;color:#44474c;margin:0 0 20px 0;">Next year''s summit is already in the works.</p>
<span style="display:inline-block;border:2px solid #0f1c2c;color:#0f1c2c;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;padding:12px 28px;border-radius:4px;text-transform:uppercase;">PRE-REGISTER NOW</span>
</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:32px 40px;text-align:center;border-top:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;color:#0f1c2c;margin:0 0 8px 0;">BILLION SOUL HARVEST</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0 0 12px 0;">&copy; 2024 Billion Soul Harvest. All rights reserved.</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0;">
<a href="{{unsubscribe_url}}" style="color:#006a62;text-decoration:underline;">Unsubscribe</a>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Privacy Policy</span>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Contact Us</span>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>',
  'Your presence fueled the momentum. Together, we are witnessing the greatest spiritual harvest.',
  NULL
),
(
  'Blank Template',
  'A Message from Billion Soul Harvest',
  '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Billion Soul Harvest</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f3f4;font-family:''Work Sans'',sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td align="center" style="padding:24px 40px;background-color:#ffffff;border-bottom:1px solid #c4c6cc;">
<span style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:2px;color:#0f1c2c;">&#128276; BILLION SOUL HARVEST</span>
</td></tr>

<!-- Hero Section with gradient background -->
<tr><td style="background-color:#0f1c2c;padding:60px 40px;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#1a2a3c;border-radius:8px;">
<tr><td style="padding:40px;text-align:center;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#00E5FF;text-transform:uppercase;margin:0 0 12px 0;">BILLION SOUL HARVEST</p>
<h1 style="font-family:Manrope,sans-serif;font-size:30px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">A Vision for the Global Harvest</h1>
<p style="font-family:''Work Sans'',sans-serif;font-size:15px;color:#c4c6cc;margin:0;line-height:1.6;">Join us in our mission to reach every heart and mind with a message of hope and compassion.</p>
</td></tr>
</table>
</td></tr>

<!-- Content Area Placeholder -->
<tr><td style="padding:40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:2px dashed #c4c6cc;border-radius:8px;">
<tr><td style="padding:48px;text-align:center;">
<p style="font-family:Manrope,sans-serif;font-size:16px;font-weight:600;letter-spacing:1px;color:#c4c6cc;margin:0;">MESSAGE CONTENT AREA</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:13px;color:#c4c6cc;margin:8px 0 0 0;">Replace this section with your message content.</p>
</td></tr>
</table>
</td></tr>

<!-- Checklist Items -->
<tr><td style="padding:0 40px 40px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Share your story with the community</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Support through prayer and giving</td></tr>
<tr><td style="padding:8px 0;font-family:''Work Sans'',sans-serif;font-size:15px;color:#1a1c1c;"><span style="color:#006a62;margin-right:8px;">&#10003;</span> Connect with a local harvest group</td></tr>
</table>
</td></tr>

<!-- CTA Button -->
<tr><td align="center" style="padding:0 40px 12px 40px;">
<span style="display:inline-block;background-color:#006a62;color:#ffffff;font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;padding:14px 32px;border-radius:4px;text-transform:uppercase;">SUPPORT THE HARVEST</span>
</td></tr>
<tr><td align="center" style="padding:0 40px 40px 40px;">
<p style="font-family:''Work Sans'',sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;color:#44474c;text-transform:uppercase;margin:12px 0 0 0;">TRANSFORMING LIVES TOGETHER</p>
</td></tr>

<!-- Progress Bar -->
<tr><td style="padding:0 40px 48px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f3f4;border-radius:8px;">
<tr><td style="padding:24px;">
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;font-weight:600;letter-spacing:2px;color:#006a62;text-transform:uppercase;margin:0 0 4px 0;">HARVEST PROGRESS</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:13px;color:#44474c;margin:0 0 12px 0;">72% of our annual goal reached</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#c4c6cc;border-radius:4px;height:8px;">
<tr><td style="width:72%;background-color:#00E5FF;border-radius:4px;height:8px;"></td><td></td></tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:32px 40px;text-align:center;border-top:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;color:#0f1c2c;margin:0 0 8px 0;">BILLION SOUL HARVEST</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0 0 4px 0;">Facebook | Twitter | Instagram</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0 0 12px 0;">&copy; 2024 Billion Soul Harvest. All rights reserved.</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:12px;color:#44474c;margin:0 0 8px 0;">
<a href="{{unsubscribe_url}}" style="color:#006a62;text-decoration:underline;">Unsubscribe</a>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Privacy Policy</span>
<span style="color:#c4c6cc;margin:0 8px;">|</span>
<span style="color:#44474c;">Contact Us</span>
</p>
<p style="font-family:''Work Sans'',sans-serif;font-size:11px;color:#44474c;margin:0;">You are receiving this email because you opted in to communications from Billion Soul Harvest.</p>
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
