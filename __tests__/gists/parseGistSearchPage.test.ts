import {parseGistSearchPage} from '../../src/features/gists/api/parseGistSearchPage';

test('parses gist search snippets into gist cards', () => {
  const results = parseGistSearchPage(`
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
  `);

  expect(results).toHaveLength(1);
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
