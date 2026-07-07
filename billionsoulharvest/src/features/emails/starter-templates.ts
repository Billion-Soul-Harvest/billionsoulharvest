export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body_html: string;
  preview_text: string;
}

export const starterTemplates: StarterTemplate[] = [
  {
    id: "welcome",
    name: "Welcome",
    description: "Greet new contacts with an intro to the global mission",
    subject: "Welcome to Billion Soul Harvest",
    preview_text: "You've just joined a global movement.",
    body_html: `<h2 style="font-family:Manrope,sans-serif;font-size:32px;font-weight:700;color:#000;letter-spacing:-0.01em;margin:0 0 16px;">Welcome Home.</h2>
<p style="font-family:'Work Sans',sans-serif;font-size:18px;line-height:28px;color:#44474c;margin:0 0 24px;">You've just joined a global movement dedicated to the greatest harvest in human history.</p>

<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
  <div style="height:3px;width:48px;background:#00E5FF;"></div>
  <span style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#44474c;">Our Shared Mission</span>
</div>

<h3 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000;margin:0 0 16px;">Reaching Every Soul, Everywhere.</h3>

<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 16px;">The <strong>Billion Soul Harvest</strong> is more than just a goal; it is a divine mandate. We believe that right now, the world is at a pivotal moment. The hearts of people everywhere are prepared, and the "harvest is truly plenteous."</p>

<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 24px;">Your presence here strengthens our collective voice. Together, we are building infrastructures of compassion, professional networks of outreach, and a visionary community focused on bringing hope to the farthest corners of the earth.</p>

<h3 style="font-family:Manrope,sans-serif;font-size:22px;font-weight:700;color:#000;margin:0 0 16px;">What's Next for You</h3>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 8px;">&#10003; Receive weekly updates on our global harvest progress.</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 8px;">&#10003; Connect with like-minded believers in your local area.</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 24px;">&#10003; Access exclusive resources and training tools.</p>`,
  },
  {
    id: "event-invitation",
    name: "Event Invitation",
    description: "Invite contacts to register for an upcoming event",
    subject: "You're Invited: [Event Name]",
    preview_text: "Join us for a gathering of purpose.",
    body_html: `<h2 style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000;margin:0 0 8px;">[Event Name]</h2>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 24px;">Uniting visionary leaders for a global mission.</p>

<table style="width:100%;border:1px solid #c4c6cc;border-radius:12px;background:#f3f3f4;margin:0 0 24px;" cellpadding="16" cellspacing="0">
<tr>
<td style="text-align:center;font-family:Manrope,sans-serif;border-right:1px solid #c4c6cc;">
<strong style="font-size:14px;letter-spacing:0.05em;color:#1a1c1c;">DATE</strong><br/>
<span style="font-family:'Work Sans',sans-serif;font-size:14px;color:#44474c;">[Date]</span>
</td>
<td style="text-align:center;font-family:Manrope,sans-serif;border-right:1px solid #c4c6cc;">
<strong style="font-size:14px;letter-spacing:0.05em;color:#1a1c1c;">TIME</strong><br/>
<span style="font-family:'Work Sans',sans-serif;font-size:14px;color:#44474c;">[Time]</span>
</td>
<td style="text-align:center;font-family:Manrope,sans-serif;">
<strong style="font-size:14px;letter-spacing:0.05em;color:#1a1c1c;">LOCATION</strong><br/>
<span style="font-family:'Work Sans',sans-serif;font-size:14px;color:#44474c;">[Location]</span>
</td>
</tr>
</table>

<h3 style="font-family:Manrope,sans-serif;font-size:24px;font-weight:700;color:#000;text-align:center;margin:0 0 16px;">A Gathering of Purpose</h3>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;text-align:center;margin:0 0 24px;">Join thousands of believers and leaders as we strategize for the greatest spiritual harvest in human history. This isn't just an event; it's a catalyst for global transformation.</p>

<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 8px;">&#10003; Strategic networking with 500+ global organizations.</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 8px;">&#10003; Exclusive insights into the latest missional tools.</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 24px;">&#10003; Immersive worship and vision-casting sessions.</p>`,
  },
  {
    id: "event-reminder",
    name: "Event Reminder",
    description: "Remind registered attendees about an upcoming event",
    subject: "Reminder: [Event Name] is Coming Up!",
    preview_text: "The gathering is nearly upon us.",
    body_html: `<div style="text-align:center;margin-bottom:24px;">
<span style="display:inline-block;padding:6px 20px;background:#70f8e8;color:#007168;border-radius:9999px;font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Final Reminder</span>
</div>

<h2 style="font-family:Manrope,sans-serif;font-size:40px;font-weight:800;color:#000;text-align:center;letter-spacing:-0.02em;margin:0 0 16px;">Just 3 Days to Go!</h2>
<p style="font-family:'Work Sans',sans-serif;font-size:18px;line-height:28px;color:#44474c;text-align:center;margin:0 auto 24px;max-width:480px;">The global gathering for the final harvest is nearly upon us. We are preparing to ignite a new movement of visionary leadership.</p>

<div style="border:1px solid #c4c6cc;border-radius:12px;padding:24px;background:#fff;margin:0 0 24px;">
<h3 style="font-family:Manrope,sans-serif;font-size:24px;font-weight:700;color:#000;margin:0 0 8px;">[Event Name]</h3>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 16px;">Join thousands of world-shapers as we align our strategies for the greatest spiritual expansion in history.</p>

<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#1a1c1c;margin:0 0 8px;">&#128197; [Date]</p>
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#1a1c1c;margin:0 0 8px;">&#128205; [Location]</p>
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;color:#1a1c1c;margin:0 0 0;">&#128336; [Time]</p>
</div>

<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#44474c;margin:0 0 12px;">Preparation Checklist</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 8px;">&#10003; Download the Official Event App for networking.</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 8px;">&#10003; Review the breakout session speakers.</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 24px;">&#10003; Ensure your travel arrangements are finalized.</p>`,
  },
  {
    id: "post-event-thank-you",
    name: "Post-Event Thank You",
    description: "Thank attendees after an event with highlights and next steps",
    subject: "Thank You for Joining the Harvest",
    preview_text: "Your presence fueled the momentum.",
    body_html: `<h2 style="font-family:Manrope,sans-serif;font-size:36px;font-weight:800;color:#000;text-align:center;letter-spacing:-0.02em;margin:0 0 12px;">Thank You for Joining Us</h2>
<p style="font-family:'Work Sans',sans-serif;font-size:18px;line-height:28px;color:#44474c;text-align:center;margin:0 0 32px;">Your presence fueled the momentum. Together, we are witnessing the greatest spiritual harvest in history.</p>

<div style="border:1px solid #c4c6cc;border-radius:12px;padding:24px;text-align:center;margin:0 0 32px;">
<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#006a62;margin:0 0 12px;">The Collective Impact</p>
<table style="width:100%;margin:0 0 16px;" cellpadding="0" cellspacing="0">
<tr>
<td style="text-align:center;width:50%;border-right:1px solid #c4c6cc;">
<p style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000;margin:0;">[Number]+</p>
<p style="font-family:Manrope,sans-serif;font-size:12px;font-weight:700;color:#44474c;margin:4px 0 0;">ATTENDEES</p>
</td>
<td style="text-align:center;width:50%;">
<p style="font-family:Manrope,sans-serif;font-size:28px;font-weight:700;color:#000;margin:0;">[Number]</p>
<p style="font-family:Manrope,sans-serif;font-size:12px;font-weight:700;color:#44474c;margin:4px 0 0;">NATIONS</p>
</td>
</tr>
</table>
</div>

<p style="font-family:Manrope,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#000;margin:0 0 12px;">Memorable Moments</p>

<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 8px;">&#10003; <strong style="color:#000;">[Highlight 1]</strong> — Description of a key moment from the event.</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 8px;">&#10003; <strong style="color:#000;">[Highlight 2]</strong> — Description of another key moment.</p>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;margin:0 0 24px;">&#10003; <strong style="color:#000;">[Highlight 3]</strong> — Description of another key moment.</p>

<h3 style="font-family:Manrope,sans-serif;font-size:24px;font-weight:700;color:#000;text-align:center;margin:0 0 8px;">Help Us Grow</h3>
<p style="font-family:'Work Sans',sans-serif;font-size:16px;line-height:26px;color:#44474c;text-align:center;margin:0 0 24px;">Your feedback is vital to our mission. Please take 2 minutes to share your experience.</p>`,
  },
];
