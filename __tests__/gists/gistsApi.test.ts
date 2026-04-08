import {getGist, getPublicGists, searchGists} from '../../src/features/gists/api/gists';
import {githubClient} from '../../src/shared/api/client';
import {GitHubApiError} from '../../src/shared/api/errors';

jest.mock('../../src/shared/api/client', () => ({
  githubClient: {
    get: jest.fn(),
  },
}));

const gistPageHtml = `
  <div class="gisthead pagehead pb-0 tmp-pt-3 tmp-mb-4">
    <div class="note m-0">
      Created
      <relative-time tense="past" datetime="2026-04-04T16:25:13Z">April 4, 2026 16:25</relative-time>
    </div>
  </div>
  <div itemprop="about">
    llm-wiki
  </div>
  <span class="author"><a href="/karpathy">karpathy</a></span>
  <div id="file-llm-wiki-md" class="file my-2">
    <div class="file-header d-flex flex-md-items-center flex-items-start">
      <div class="file-actions flex-order-2 pt-0">
        <a href="/karpathy/442a6bf555914893e9891c11519de94f/raw/ac46de1ad27f92b28ac95459c782c07f6b8c964a/llm-wiki.md">Raw</a>
      </div>
      <div class="file-info tmp-pr-4 d-flex flex-md-items-center flex-items-start flex-order-1 flex-auto">
        <a class="wb-break-all" href="#file-llm-wiki-md">
          <strong class="user-select-contain gist-blob-name css-truncate-target">
            llm-wiki.md
          </strong>
        </a>
      </div>
    </div>
  </div>
  <div id="file-llm-wiki-md-readme" class="Box-body readme blob tmp-p-5 tmp-p-xl-6 gist-border-0">
    <article class="markdown-body entry-content container-lg" itemprop="text">
      <h1>LLM Wiki</h1>
      <p>Rendered preview</p>
    </article>
  </div>
  <div id="gistcomment-6085194" class="timeline-comment-group"></div>
  <div id="gistcomment-6085195" class="timeline-comment-group"></div>
`;

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'fetch');
  jest.clearAllMocks();
});

test('falls back to the public gist page when the gist detail API returns a 5xx error', async () => {
  (githubClient.get as jest.Mock).mockRejectedValue(
    new GitHubApiError({
      message: 'Server Error',
      status: 502,
      cause: new Error('502'),
    }),
  );

  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    text: async () => gistPageHtml,
  })) as jest.Mock;

  const gist = await getGist('442a6bf555914893e9891c11519de94f');

  expect(globalThis.fetch).toHaveBeenCalled();
  expect(gist.id).toBe('442a6bf555914893e9891c11519de94f');
  expect(gist.html_url).toBe('https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f');
  expect(gist.description).toBe('llm-wiki');
  expect(gist.comments).toBe(2);
  expect(gist.owner.login).toBe('karpathy');
  expect(gist.files['llm-wiki.md']).toMatchObject({
    filename: 'llm-wiki.md',
    raw_url:
      'https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f/raw/ac46de1ad27f92b28ac95459c782c07f6b8c964a/llm-wiki.md',
    renderedHtml: '<h1>LLM Wiki</h1>\n      <p>Rendered preview</p>',
  });
  expect(gist.history[0]?.version).toBe('ac46de1ad27f92b28ac95459c782c07f6b8c964a');
});

test('does not hide non-retryable gist detail errors behind the public-page fallback', async () => {
  const error = new GitHubApiError({
    message: 'Not Found',
    status: 404,
    cause: new Error('404'),
  });

  (githubClient.get as jest.Mock).mockRejectedValue(error);
  globalThis.fetch = jest.fn() as jest.Mock;

  await expect(getGist('missing-gist')).rejects.toBe(error);
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test('forwards abort signals into public gist list requests', async () => {
  const signal = new AbortController().signal;
  (githubClient.get as jest.Mock).mockResolvedValue({data: []});

  await getPublicGists(2, 15, signal);

  expect(githubClient.get).toHaveBeenCalledWith('/gists/public', {
    params: {page: 2, per_page: 15},
    signal,
  });
});

test('searches gists through the public gist website search page', async () => {
  const signal = new AbortController().signal;
  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    text: async () => `
      <div class="gist-snippet">
        <div class="gist-snippet-meta d-flex flex-lg-row flex-column width-full">
          <ul class="col-lg-5 col-12 flex-order-2 f6 tmp-mt-lg-0 tmp-mt-3 tmp-mb-lg-0 mb-2 d-flex flex-lg-justify-end">
            <li><a class="Link--muted" href="/octocat/abc123">1 file</a></li>
            <li><a class="Link--muted" href="/octocat/abc123#comments">3 comments</a></li>
          </ul>
          <div class="flex-order-1 col-lg-7 col-12 d-flex">
            <div class="d-inline-block px-lg-2 px-0">
              <span>
                <a href="/octocat">octocat</a>
                / <a href="/octocat/abc123"><strong class="css-truncate-target">hello.ts</strong></a>
              </span>
              <div class="color-fg-muted f6">
                Last active
                <relative-time datetime="2026-04-08T00:00:00Z"></relative-time>
              </div>
              <span class="f6 color-fg-muted">Search match</span>
            </div>
          </div>
        </div>
      </div>
    `,
  })) as jest.Mock;

  const results = await searchGists('react query', 1, 30, signal);

  expect(globalThis.fetch).toHaveBeenCalledWith(
    'https://gist.github.com/search?q=react+query&p=1',
    {signal},
  );
  expect(results[0]).toMatchObject({
    id: 'abc123',
    html_url: 'https://gist.github.com/octocat/abc123',
    description: 'Search match',
    comments: 3,
  });
  expect(Object.values(results[0].files)[0]).toMatchObject({
    filename: 'hello.ts',
    language: 'TypeScript',
  });
});
