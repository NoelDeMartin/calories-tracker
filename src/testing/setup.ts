import { vi } from 'vitest';

vi.mock('@aerogel/core', async () => {
    // TODO Fix in all aerogel projects
    // See https://github.com/vitest-dev/vitest/issues/5641#event-12673512165
    return { translate: (key: string) => key };
});
