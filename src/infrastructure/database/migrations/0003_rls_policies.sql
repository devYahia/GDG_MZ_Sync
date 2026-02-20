-- Enable RLS on core tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "simulation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skill_score" ENABLE ROW LEVEL SECURITY;

-- 1. User Policy: A user can only see and update their own record
CREATE POLICY "Users can view own profile" 
ON "user" FOR SELECT 
USING (current_setting('app.current_user_id', TRUE) = id);

CREATE POLICY "Users can update own profile" 
ON "user" FOR UPDATE 
USING (current_setting('app.current_user_id', TRUE) = id);

-- 2. Simulation Policy: Users only see their custom simulations
CREATE POLICY "Users manage own simulations" 
ON "simulation" FOR ALL 
USING (user_id = current_setting('app.current_user_id', TRUE));

-- 3. Gamification Policy: Users can only see their own scores
CREATE POLICY "Users manage own skill scores" 
ON "skill_score" FOR ALL 
USING (user_id = current_setting('app.current_user_id', TRUE));

-- Expose to authenticated users only generally? Just ensuring auth uid is present
-- Note: Assuming current_setting('app.current_user_id', TRUE) resolves correctly via application logic.
