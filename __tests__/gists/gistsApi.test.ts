import {getGist} from '../../src/features/gists/api/gists';
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
