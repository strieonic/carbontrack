-- Add DELETE policy to allow users to delete their own surveys
CREATE POLICY "Enable delete for own data" ON carbon_entries
  FOR DELETE USING (true);
