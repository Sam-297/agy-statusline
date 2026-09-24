// Realistic agy payload for `agy-statusline preview` and screenshots. Anonymized.
// The branch comes through the legacy `git.branch` field so previews show one without touching disk.
export const SAMPLE_PAYLOAD = {
  cwd: '/home/user/projects/demo',
  workspace: { current_dir: '/home/user/projects/demo', project_dir: '/home/user/projects/demo' },
  session_id: '00000000-0000-4000-8000-000000000000',
  model: { id: 'Gemini 3.1 Pro (High)', display_name: 'Gemini 3.1 Pro (High)' },
  version: '1.2.10',
  product: 'antigravity',
  agent_state: 'working',
  plan_tier: 'Google AI Pro',
  email: 'user@example.com',
  sandbox: { enabled: false },
  exceeds_200k_tokens: false,
  vcs: { type: 'git' },
  git: { branch: 'main' },
  context_window: {
    total_input_tokens: 184200,
    total_output_tokens: 9800,
    context_window_size: 1000000,
    used_percentage: 18.42,
    remaining_percentage: 81.58,
  },
  quota: {
    'gemini-5h': { remaining_fraction: 0.62, reset_in_seconds: 9752 },
    'gemini-weekly': { remaining_fraction: 0.91, reset_in_seconds: 345000 },
    '3p-5h': { remaining_fraction: 0.24, reset_in_seconds: 5000 },
    '3p-weekly': { remaining_fraction: 0.47, reset_in_seconds: 215000 },
  },
  terminal_width: 120,
};
