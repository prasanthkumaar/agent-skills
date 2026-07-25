# Security Review Lane

Review the complete branch diff for concrete security risks.

## Process

1. Inspect authentication, permissions, data access, secrets handling,
   logging, network calls, configuration, mocks, and test bypasses.
2. Check whether development or Storybook helpers can reach production paths.
3. Trace the affected data or capability and the failure or exploit scenario.

## Evidence threshold

Report medium-or-higher risks by default. Include a lower risk only when it is
easy to miss, cheap to fix, and supported by a concrete scenario.

## Finding

For each finding provide:

- location
- issue
- code evidence and exploit or failure scenario
- affected data or capability if it is not addressed
- credible fix options and each option's trade-off
- recommended option and why

Return `no findings` when the lane completes without a supported risk.

## Hard rules

- Read-only.
- Never print secret values or ask for environment keys.
- Do not recommend broad security work without a concrete risk.
