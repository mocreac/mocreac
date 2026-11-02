# Sources

How to reach each source in `SKILL.md`. Search them in this order. Before searching, ask whether to connect each of Pond, marked.dev, Are.na, Cosmos, Pinterest and Mobbin that is missing. When none are connected, wait for the answer.

## What the user gave

| Input | Reach it with |
| --- | --- |
| Open browser tabs | List the tabs and read each page |
| Screenshots in the thread | Read the images |
| Design files | The Figma MCP `get_screenshot` on the linked node |
| Live sites | Open the page. For exact values, hand over to `match` |

## Pond

The user's own library of saves from Instagram, X, Pinterest, Are.na, Cosmos and the web. The Pond choice downloads from https://pond.raphaelsalaja.com and connects under Settings, Model Context Protocol. Connecting an account needs the Pond browser extension, from Browser Extension in the library menu. Pond runs as a local MCP server over stdio:

```json
{
  "mcpServers": {
    "pond": {
      "command": "/Applications/Pond.app/Contents/MacOS/Pond",
      "args": ["--mcp"]
    }
  }
}
```

Copy the exact command from Pond, under Settings, Model Context Protocol. The Search Saves switch under Access must be on.

| Tool | Use |
| --- | --- |
| `search_library` | Search by meaning, such as `{ "query": "website design" }` |
| `search_library` with `source` | Only one platform, such as `arena`, `cosmos`, `pinterest` or `savee` |
| `search_library` with `visual: { "kind": "saveId", "id" }` | Saves that look like one the user likes |
| `query_library` | Filter by keywords, source, folder, tag or `savedSince` |
| `list_folders` | Find the user's own groupings before searching |
| `read_save` | Caption, text in images, note, link and metadata |
| `grep_library` | Exact words in `query` inside captions, notes and image text |
| `open_save`, `apply_filter` | Show a result in the Pond window |

Keep queries to two or three words and run several. A long descriptive query can return nothing while its short parts match.

A save's files sit in `<Library>.pond/items/<id>.info/`, so a board can show the original image. The Local API also saves URLs with `POST /enqueue`, and `created: false` means the URL is already saved. Its token stays in Pond's settings and is never pasted into chat.

## marked.dev

The user's saved interfaces and motion from X, Pinterest and the web, each credited to its maker. It also holds Explore, a public catalogue browsed by what moves: hover, scroll and drag. It runs as a remote MCP server with no API key. Copy the config from https://marked.dev/mcp, then approve the connection in the browser.

| Tool | Use |
| --- | --- |
| `list_collections`, `get_collection` | The user's own collections, read before searching |
| `search_refs` | The user's saved refs |
| `get_ref` | A saved ref's media, source and author |
| `search_explore`, `get_explore_ref` | Public refs, the first public source once the user's own run short |
| `save_ref` | Save a pick into a collection, only when the user asks |

Search it by interaction when the brief is about motion, such as "hover card lift" or "scroll reveal".

## Boards

| Source | Reach it with |
| --- | --- |
| Are.na | The user's channels in the logged-in browser, or the v3 API |
| Cosmos | The user's clusters in the logged-in browser |
| Pinterest | The user's boards in the logged-in browser or with computer use |

Read the user's existing channel and board names before creating one. When the browser is signed out, ask the user to sign in, then read their boards.

## Pattern libraries

| Tool | Use |
| --- | --- |
| Mobbin `search_screens` | Single screens. Set `platform` to `web` for desktop and web work |
| Mobbin `search_flows` | Multi-step flows, such as onboarding or checkout |
| Mobbin `search_sections` | Sections of marketing sites |
| Mobbin `exclude_screen_ids` | Leave out screens already shown when the user asks for more |
| Mobbin `list_collections`, `get_collection_contents` | The user's own saved collections, searched first |

## Curated galleries

Open them in the browser. Prefer galleries picked by hand to ones that take paid submissions. Dribbble and Behance are mostly concepts, so mark what comes from them.

| Gallery | What it holds |
| --- | --- |
| [Recent](https://recent.design) | High-end sites, branding, motion and type, picked daily. The Web filter shows sites only |
| [Refero](https://refero.design) | Real product screens, flows, patterns and elements, mostly web |
| [Savee](https://savee.com) | Graphic, brand, editorial and web work saved by designers. Searches by colour and image. Pond reads it as `savee` |
| [Cosmos](https://www.cosmos.so) | Visual similarity, colour and motion search, with AI images hidden on request |
| [Siteinspire](https://www.siteinspire.com) | Editorial, typographic sites, filtered by style, type and subject |
| [Minimal Gallery](https://minimal.gallery) | Restrained, functional sites |
| [Land-book](https://land-book.com) | Landing pages, filtered by page type and style |
| [Saaspo](https://saaspo.com) | Software landing, pricing and product pages |
| [Page Flows](https://pageflows.com) | Recorded flows from live web and mobile apps |
