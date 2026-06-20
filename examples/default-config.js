// This configuration perfectly mimics the built-in default layout of agy-statusline.
// You can use this as a starting point to rearrange or remove segments.

export default {
  // The separator placed between segments
  separator: "\x1B[2m | \x1B[0m", // dim colored ' | '
  
  // The array of segments to render, from left to right
  segments: [
    "model",            // e.g. Gemini Pro
    "cwd_branch",       // e.g. agy-statusline@main
    "tokens",           // e.g. 1.5k/1M (0%)
    "quota_gemini",     // e.g. G·5h 100% @14:00, 7d 100% @Fri 14:00
    "quota_anthropic",  // e.g. C·5h 100% @14:00, 7d 100% @Fri 14:00
    "version"           // e.g. v1.0.10
  ]
};
