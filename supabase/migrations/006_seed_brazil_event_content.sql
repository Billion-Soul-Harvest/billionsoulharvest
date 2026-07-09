-- Seed Brazil Global Harvest Summit 2026 with rich content
-- Only inserts if the event exists

DO $$
DECLARE
  v_event_id uuid;
  v_speaker_james uuid;
  v_speaker_rick uuid;
  v_speaker_worship uuid;
BEGIN
  SELECT id INTO v_event_id FROM events WHERE slug = 'brazil-global-harvest-2026';

  IF v_event_id IS NULL THEN
    RAISE NOTICE 'Brazil event not found, skipping seed';
    RETURN;
  END IF;

  -- Speakers
  INSERT INTO event_speakers (event_id, name, title, organization, bio, role, sort_order)
  VALUES
    (v_event_id, 'James O. Huang', 'Chairman & Visionary', 'Billion Soul Harvest',
     'Founding visionary of Billion Soul Harvest, dedicated to mobilizing churches and leaders globally for the Great Commission.',
     'keynote', 0),
    (v_event_id, 'Rick Warren', 'Founding Pastor', 'Saddleback Church',
     'Author of The Purpose Driven Life and co-founder of Finishing the Task, a global initiative to engage every unreached people group.',
     'keynote', 1),
    (v_event_id, 'Regional Church Leader', 'Latin America Director', 'BSH Latin America',
     'Leading the charge for church planting and evangelism across Latin America.',
     'speaker', 2),
    (v_event_id, 'Worship Team Brazil', 'Worship Leaders', NULL,
     'A dynamic worship team bringing together musicians from churches across Brazil.',
     'worship', 3);

  -- Get speaker IDs for program references
  SELECT id INTO v_speaker_james FROM event_speakers WHERE event_id = v_event_id AND name = 'James O. Huang';
  SELECT id INTO v_speaker_rick FROM event_speakers WHERE event_id = v_event_id AND name = 'Rick Warren';

  -- Program Schedule
  INSERT INTO event_programs (event_id, title, description, day_date, start_time, end_time, location, type, speaker_id, sort_order)
  VALUES
    -- Day 1: July 20
    (v_event_id, 'Registration & Check-in', 'Arrive and get your conference materials', '2026-07-20', '14:00', '17:00', 'Main Lobby', 'free_time', NULL, 0),
    (v_event_id, 'Welcome Dinner', 'Opening fellowship dinner for all delegates', '2026-07-20', '18:00', '20:00', 'Grand Ballroom', 'meal', NULL, 1),
    (v_event_id, 'Opening Night Worship & Vision Casting', 'Setting the vision for the summit', '2026-07-20', '20:00', '22:00', 'Main Auditorium', 'worship', v_speaker_james, 2),
    -- Day 2: July 21
    (v_event_id, 'Morning Worship', 'Corporate worship and prayer', '2026-07-21', '08:30', '09:30', 'Main Auditorium', 'worship', NULL, 0),
    (v_event_id, 'Keynote: The Billion Soul Vision', 'Casting the vision for reaching 1 billion souls by 2033', '2026-07-21', '09:30', '11:00', 'Main Auditorium', 'main_session', v_speaker_james, 1),
    (v_event_id, 'Lunch', NULL, '2026-07-21', '12:00', '13:30', 'Dining Hall', 'meal', NULL, 2),
    (v_event_id, 'Breakout: Church Planting Strategies', 'Effective models for church planting in Latin America', '2026-07-21', '14:00', '15:30', 'Room A', 'breakout', NULL, 3),
    (v_event_id, 'Breakout: Youth & Next Generation', 'Engaging the next generation in global missions', '2026-07-21', '14:00', '15:30', 'Room B', 'breakout', NULL, 4),
    (v_event_id, 'Evening Session: Purpose Driven Harvest', 'How purpose-driven churches fuel global evangelism', '2026-07-21', '19:00', '21:00', 'Main Auditorium', 'main_session', v_speaker_rick, 5),
    -- Day 3: July 22
    (v_event_id, 'Morning Worship & Prayer', NULL, '2026-07-22', '08:30', '09:30', 'Main Auditorium', 'worship', NULL, 0),
    (v_event_id, 'Panel: Finishing the Task', 'Progress report on engaging unreached people groups', '2026-07-22', '09:30', '11:00', 'Main Auditorium', 'main_session', NULL, 1),
    (v_event_id, 'Lunch', NULL, '2026-07-22', '12:00', '13:30', 'Dining Hall', 'meal', NULL, 2),
    (v_event_id, 'Workshop: Digital Evangelism', 'Leveraging technology for the Gospel in the 2020s', '2026-07-22', '14:00', '16:00', 'Room A', 'workshop', NULL, 3),
    (v_event_id, 'Free Time / City Tour', 'Optional guided tour of the local area', '2026-07-22', '16:00', '18:00', NULL, 'free_time', NULL, 4),
    (v_event_id, 'Worship Night', 'Extended worship and ministry time', '2026-07-22', '19:00', '21:30', 'Main Auditorium', 'worship', NULL, 5),
    -- Day 4: July 23
    (v_event_id, 'Morning Devotion', NULL, '2026-07-23', '08:30', '09:30', 'Main Auditorium', 'worship', NULL, 0),
    (v_event_id, 'Regional Reports & Testimonies', 'Hearing what God is doing across the regions', '2026-07-23', '09:30', '11:30', 'Main Auditorium', 'main_session', NULL, 1),
    (v_event_id, 'Lunch', NULL, '2026-07-23', '12:00', '13:30', 'Dining Hall', 'meal', NULL, 2),
    (v_event_id, 'Partnership Roundtables', 'Facilitated conversations for cross-regional partnerships', '2026-07-23', '14:00', '16:00', 'Various Rooms', 'breakout', NULL, 3),
    (v_event_id, 'Commissioning & Closing Ceremony', 'Sending out with prayer and commissioning', '2026-07-23', '19:00', '21:00', 'Main Auditorium', 'main_session', v_speaker_james, 4),
    -- Day 5: July 24
    (v_event_id, 'Breakfast & Departures', 'Final fellowship and departures', '2026-07-24', '07:00', '10:00', 'Dining Hall', 'meal', NULL, 0);

  -- FAQs
  INSERT INTO event_faqs (event_id, question, answer, category, sort_order)
  VALUES
    (v_event_id, 'What is the Global Harvest Summit?',
     'The Global Harvest Summit is a multi-day gathering of church leaders, pastors, evangelists, and ministry workers from around the world. We come together to worship, learn, and build partnerships for advancing the Gospel.',
     'general', 0),
    (v_event_id, 'Who should attend?',
     'Pastors, church planters, ministry leaders, missionaries, and anyone passionate about global evangelism and the Great Commission are welcome.',
     'general', 1),
    (v_event_id, 'What language will sessions be in?',
     'Main sessions will be in English with simultaneous translation available in Portuguese and Spanish.',
     'general', 2),
    (v_event_id, 'How do I get to the venue from the airport?',
     'Shuttle services will be arranged from the international airport to the conference venue. Details will be sent to registered attendees 2 weeks before the event.',
     'travel', 0),
    (v_event_id, 'Do I need a visa to enter Brazil?',
     'Visa requirements depend on your country of origin. Please check with the Brazilian consulate in your country. We can provide an invitation letter for visa purposes upon request.',
     'travel', 1),
    (v_event_id, 'What accommodation options are available?',
     'We have partnered with nearby hotels offering discounted group rates. Options range from budget to premium. Accommodation details will be shared during registration.',
     'accommodation', 0),
    (v_event_id, 'Is the registration fee refundable?',
     'Registration fees are refundable up to 30 days before the event. After that, a 50% cancellation fee applies. No refunds within 7 days of the event.',
     'registration', 0),
    (v_event_id, 'What does the registration fee include?',
     'The registration fee covers all conference sessions, conference materials, meals during the event (breakfast, lunch, dinner), and shuttle service from partner hotels.',
     'registration', 1);

  -- Info Sections
  INSERT INTO event_sections (event_id, section_type, title, content, sort_order, published)
  VALUES
    (v_event_id, 'arrival_info', 'Arrival Information',
     '<p>The Brazil Global Harvest Summit will be held at a premier conference venue in Brazil. Detailed venue information and directions will be sent to all registered attendees.</p><p><strong>Check-in:</strong> July 20, 2026 from 2:00 PM - 5:00 PM</p><p><strong>Conference Start:</strong> Opening session at 8:00 PM on July 20</p><p><strong>Conference End:</strong> July 24, departures after breakfast</p>',
     0, true),
    (v_event_id, 'accommodation', 'Accommodation',
     '<p>We have secured group rates at several partner hotels near the conference venue:</p><ul><li><strong>Premium:</strong> 5-star hotel, walking distance — special delegate rate</li><li><strong>Standard:</strong> 4-star hotel, 5 min shuttle — affordable comfort</li><li><strong>Budget:</strong> 3-star hotel, 10 min shuttle — great value option</li></ul><p>All hotels include breakfast. Shuttle service between hotels and venue is complimentary for delegates.</p>',
     1, true),
    (v_event_id, 'transportation', 'Getting There',
     '<p><strong>By Air:</strong> Fly into the nearest international airport. We recommend booking flights arriving by noon on July 20 to allow time for check-in.</p><p><strong>Airport Shuttle:</strong> Complimentary shuttle service will run from the airport to partner hotels on July 20 (12 PM - 6 PM) and return shuttles on July 24-25.</p><p><strong>Local Transport:</strong> Shuttle service between partner hotels and the venue runs throughout the conference.</p>',
     2, true);

END $$;
