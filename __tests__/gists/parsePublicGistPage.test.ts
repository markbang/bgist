import {parsePublicGistPage} from '../../src/features/gists/api/parsePublicGistPage';

test('does not double-unescape ampersand-prefixed html entities from public gist pages', () => {
  const html = `
    <html>
      <head>
        <meta property="og:url" content="https://gist.github.com/octocat/gist-1" />
      </head>
      <body>
        <span class="author"><a href="/octocat">octocat</a></span>
        <div itemprop="about">&amp;quot;</div>
        Created
        <relative-time datetime="2026-04-08T00:00:00Z"></relative-time>
        <a href="/octocat/gist-1/raw/abc1234/hello.txt">
          <strong>hello.txt</strong>
        </a>
      </body>
    </html>
  `;

  const gist = parsePublicGistPage(html, 'gist-1');

  expect(gist?.description).toBe('&quot;');
});
