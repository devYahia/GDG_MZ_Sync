-- Role for mentor view (intern | mentor | admin)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'intern';

-- Integrations: Slack/Discord webhook, optional GitHub token
CREATE TABLE IF NOT EXISTS user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slack_webhook_url text,
  github_access_token_encrypted text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations"
  ON user_integrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Progress / activity for mentor view
CREATE TABLE IF NOT EXISTS intern_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  last_activity_at timestamptz DEFAULT now(),
  last_review_at timestamptz,
  last_review_approved boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE intern_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress"
  ON intern_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mentors can read all progress (for mentor view)
CREATE POLICY "Mentors can read all progress"
  ON intern_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mentor', 'admin')
    )
  );

-- Mentors can read all profiles (for mentor view)
CREATE POLICY "Mentors can read all profiles"
  ON profiles FOR SELECT
  USING (
    (SELECT p.role FROM profiles p WHERE p.id = auth.uid() LIMIT 1) IN ('mentor', 'admin')
  );
