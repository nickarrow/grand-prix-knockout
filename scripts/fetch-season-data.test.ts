// Tests for the data-fetch controls: paging across response-limit changes and
// split rounds, retry delay selection with and without Retry-After, and the
// terminal error on a non-retryable status. These cover the fetch seams that
// validate-season-data.test.ts cannot reach because it starts after the fetch.

import { describe, it, expect, vi } from 'vitest';

// @ts-expect-error - plain .mjs module shared with the Node fetch script
import {
  fetchAllPages,
  mergeByRound,
  pageStep,
  retryAfterMs,
  backoffDelay,
  fetchJson,
  fetchDriverStandingsOrder,
} from './fetch-season-helpers.mjs';

// Build a Jolpica-shaped results page. limit is the server's echoed limit, which
// may differ from the requested value.
function resultsPage(
  total: number,
  limit: number,
  races: Array<Record<string, unknown>>
): Record<string, unknown> {
  return {
    MRData: {
      total: String(total),
      limit: String(limit),
      RaceTable: { Races: races },
    },
  };
}

function raceRow(round: number, resultKey: string, rows: unknown[]): Record<string, unknown> {
  return {
    round: String(round),
    season: '2026',
    raceName: `Race ${round}`,
    [resultKey]: rows,
  };
}

describe('pageStep', () => {
  it('advances by the server echoed limit when it is positive', () => {
    expect(pageStep('2', 2)).toBe(2);
    expect(pageStep(100, 100)).toBe(100);
  });

  it('falls back to the rows returned when the echoed limit is zero or missing', () => {
    expect(pageStep('0', 5)).toBe(5);
    expect(pageStep(undefined, 3)).toBe(3);
  });

  it('returns 0 when neither the limit nor the rows make progress', () => {
    expect(pageStep('0', 0)).toBe(0);
    expect(pageStep(undefined, 0)).toBe(0);
  });
});

describe('fetchAllPages', () => {
  it('pages through a season whose echoed limit is smaller than requested', async () => {
    // total 4, but the server echoes limit 2, so advancing by the request size of
    // 100 would skip rows. Advancing by the echoed 2 collects all four.
    const pages = [
      resultsPage(4, 2, [raceRow(1, 'Results', [{}]), raceRow(2, 'Results', [{}])]),
      resultsPage(4, 2, [raceRow(3, 'Results', [{}]), raceRow(4, 'Results', [{}])]),
    ];
    const fetchJsonFn = vi.fn().mockImplementation(() => Promise.resolve(pages.shift()));
    const delayFn = vi.fn().mockResolvedValue(undefined);

    const collected = await fetchAllPages(2026, 'results', fetchJsonFn, delayFn);

    expect(collected).toHaveLength(4);
    expect(fetchJsonFn).toHaveBeenCalledTimes(2);
    expect(fetchJsonFn.mock.calls[0][0]).toContain('offset=0');
    expect(fetchJsonFn.mock.calls[1][0]).toContain('offset=2');
  });

  it('stops after one page when the first page covers the total', async () => {
    const fetchJsonFn = vi
      .fn()
      .mockResolvedValue(resultsPage(1, 100, [raceRow(1, 'Results', [{}])]));
    const delayFn = vi.fn().mockResolvedValue(undefined);

    const collected = await fetchAllPages(2026, 'results', fetchJsonFn, delayFn);

    expect(collected).toHaveLength(1);
    expect(fetchJsonFn).toHaveBeenCalledTimes(1);
  });

  it('throws rather than looping when a page makes no progress', async () => {
    const fetchJsonFn = vi.fn().mockResolvedValue(resultsPage(4, 0, []));
    const delayFn = vi.fn().mockResolvedValue(undefined);

    await expect(fetchAllPages(2026, 'results', fetchJsonFn, delayFn)).rejects.toThrow(
      /made no progress/i
    );
  });
});

describe('mergeByRound', () => {
  it('concatenates the result rows of a round that straddled a page boundary', () => {
    const paged = [
      raceRow(5, 'Results', [{ driverId: 'a' }, { driverId: 'b' }]),
      raceRow(5, 'Results', [{ driverId: 'c' }]),
    ];
    const byRound = mergeByRound(paged, 'Results');
    expect(byRound.get(5).Results).toHaveLength(3);
  });

  it('keeps separate rounds separate', () => {
    const paged = [raceRow(1, 'Results', [{}]), raceRow(2, 'Results', [{}, {}])];
    const byRound = mergeByRound(paged, 'Results');
    expect(byRound.get(1).Results).toHaveLength(1);
    expect(byRound.get(2).Results).toHaveLength(2);
  });
});

describe('retryAfterMs', () => {
  function headerResponse(value: string | null): {
    headers: { get: (name: string) => string | null };
  } {
    return {
      headers: { get: (name: string): string | null => (name === 'retry-after' ? value : null) },
    };
  }

  it('reads a Retry-After given in seconds', () => {
    expect(retryAfterMs(headerResponse('2'))).toBe(2000);
  });

  it('reads a Retry-After given as an HTTP date', () => {
    const fiveSecondsAhead = new Date(Date.now() + 5000).toUTCString();
    const ms = retryAfterMs(headerResponse(fiveSecondsAhead));
    // Allow a little slack for the clock ticking between build and read.
    expect(ms).toBeGreaterThan(3000);
    expect(ms).toBeLessThanOrEqual(5000);
  });

  it('returns null when the header is absent', () => {
    expect(retryAfterMs(headerResponse(null))).toBeNull();
  });
});

describe('fetchDriverStandingsOrder', () => {
  function standingsResponse(
    standings: Array<{ position: string; driverId: string }>
  ): Record<string, unknown> {
    return {
      MRData: {
        StandingsTable: {
          StandingsLists: [
            {
              DriverStandings: standings.map((s) => ({
                position: s.position,
                Driver: { driverId: s.driverId },
              })),
            },
          ],
        },
      },
    };
  }

  it('returns driverIds sorted by standings position', async () => {
    // Deliberately out of order in the response so the sort is exercised, not
    // the response order.
    const fetchJsonFn = vi.fn().mockResolvedValue(
      standingsResponse([
        { position: '3', driverId: 'c' },
        { position: '1', driverId: 'a' },
        { position: '2', driverId: 'b' },
      ])
    );

    const order = await fetchDriverStandingsOrder(2024, 17, fetchJsonFn);

    expect(order).toEqual(['a', 'b', 'c']);
    expect(fetchJsonFn.mock.calls[0][0]).toContain('/2024/17/driverstandings.json');
  });

  it('returns an empty order when there is no standings list yet', async () => {
    const fetchJsonFn = vi
      .fn()
      .mockResolvedValue({ MRData: { StandingsTable: { StandingsLists: [] } } });

    expect(await fetchDriverStandingsOrder(2026, 16, fetchJsonFn)).toEqual([]);
  });
});

describe('fetchJson retry selection', () => {
  function response(status: number, body: unknown, retryAfter?: string): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: `status ${status}`,
      headers: {
        get: (name: string): string | null =>
          name === 'retry-after' && retryAfter ? retryAfter : null,
      },
      json: () => Promise.resolve(body),
    } as unknown as Response;
  }

  it('retries a 429 honouring Retry-After, then returns the next ok body', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(response(429, null, '2'))
      .mockResolvedValueOnce(response(200, { ok: true }));
    const delayFn = vi.fn().mockResolvedValue(undefined);

    const result = await fetchJson('http://x', fetchFn, delayFn);

    expect(result).toEqual({ ok: true });
    expect(delayFn).toHaveBeenCalledWith(2000);
  });

  it('retries a 503 with no Retry-After using the backoff schedule', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(response(503, null))
      .mockResolvedValueOnce(response(200, { ok: true }));
    const delayFn = vi.fn().mockResolvedValue(undefined);

    const result = await fetchJson('http://x', fetchFn, delayFn);

    expect(result).toEqual({ ok: true });
    expect(delayFn).toHaveBeenCalledWith(backoffDelay(0));
  });

  it('throws on a non-retryable 404 without retrying', async () => {
    const fetchFn = vi.fn().mockResolvedValue(response(404, null));
    const delayFn = vi.fn().mockResolvedValue(undefined);

    await expect(fetchJson('http://x', fetchFn, delayFn)).rejects.toThrow(/404/);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(delayFn).not.toHaveBeenCalled();
  });
});
