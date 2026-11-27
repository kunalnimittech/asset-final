# How TanStack Router and TanStack Query work together

This project uses two TanStack libraries:

| Library | Its job | One-line summary |
|---|---|---|
| **TanStack Router** | Decides **which page** to show for a URL | "You're at `/assets/5`, so show the asset details page" |
| **TanStack Query** | Fetches, **caches** and refreshes **server data** | "Here is asset 5. I already have it, so no new request is needed" |

The router handles navigation and the query library handles data. They are connected so that the router can **start fetching a page's data before the page appears**, and Query keeps that data in a cache so it isn't fetched twice.

---

## 1. The big picture

```
                        +---------------------------+
                        |        Browser URL        |
                        |      /assets/5            |
                        +-------------+-------------+
                                      |
                                      v
   +----------------------------------------------------------------+
   |                      TanStack ROUTER                           |
   |                                                                |
   |   1. Match URL to a route file      src/routes/assets/$id.jsx  |
   |   2. Run that route's loader()  ----------------+              |
   |   3. Render the route's component               |              |
   +-------------------------------------------------|--------------+
                                                     |
                     "make sure asset 5 is loaded"   |
                                                     v
   +----------------------------------------------------------------+
   |                      TanStack QUERY                            |
   |                                                                |
   |      +-----------------------------------------------+         |
   |      |                 QueryClient cache             |         |
   |      |                                               |         |
   |      |   ['assets']        -> [ {..}, {..}, {..} ]   |         |
   |      |   ['assets', 5]     -> { id: 5, name: .. }    |         |
   |      |   ['users', 'me']   -> { name: .. }           |         |
   |      +-----------------------------------------------+         |
   |               |                         ^                      |
   |    in cache?  | no                      | save result          |
   |               v                         |                      |
   |         fetch('/api/assets/5') ---------+                      |
   +----------------------------------------------------------------+
                                      |
                                      v
                        +---------------------------+
                        |     Backend  (/api/...)   |
                        +---------------------------+
```

---

## 2. How the app starts ([src/main.jsx](src/main.jsx))

```
   main.jsx
      |
      |  const queryClient = new QueryClient()        <-- the one shared cache
      |
      |  const router = createRouter({
      |      routeTree,                               <-- generated from src/routes/
      |      context: { queryClient },                <-- every route can use the cache
      |  })
      |
      v
   <QueryClientProvider client={queryClient}>         <-- components can use useQuery()
      |
      +--> <RouterProvider router={router} />         <-- router shows the right page
                 |
                 +--> __root.jsx  (layout: header + <Outlet/>)
                           |
                           +--> index.jsx         when URL is  /
                           +--> assets.jsx        when URL is  /assets
                           +--> assets/$id.jsx    when URL is  /assets/123
```

There is **one** `queryClient`, and both places use it:
- **Route loaders** get it from `context` (`context.queryClient`).
- **Components** get it from `QueryClientProvider` (through `useQuery`).

Because they share one cache, data that a loader fetches is already there when the component asks for it.

---

## 3. File-based routing: files become URLs

The Vite plugin (`tanstackRouter` in [vite.config.js](vite.config.js)) watches `src/routes/` and generates `src/routeTree.gen.ts`. **Never edit the generated file.**

```
src/routes/
 |
 +-- __root.jsx            ->  wraps EVERY page (header, nav, devtools)
 |
 +-- index.jsx             ->  /
 |
 +-- assets.jsx            ->  /assets             (example, not created yet)
 |
 +-- assets/
      +-- $assetId.jsx     ->  /assets/:assetId    ($ = URL parameter)
```

Nesting works like this:

```
 URL: /assets/5

 +--------------------------------------------+
 | __root.jsx                                 |
 |  +--------------------------------------+  |
 |  | header / nav                         |  |
 |  +--------------------------------------+  |
 |  | <Outlet />                           |  |
 |  |   +------------------------------+   |  |
 |  |   | assets/$assetId.jsx          |   |  |
 |  |   |   Asset #5 details...        |   |  |
 |  |   +------------------------------+   |  |
 |  +--------------------------------------+  |
 +--------------------------------------------+
```

---

## 4. What happens when you click a link

```
  User hovers <Link to="/assets/5">
        |
        |   (defaultPreload: "intent" in main.jsx)
        v
  Router PRELOADS: runs loader for /assets/5
        |
        v
  loader calls queryClient.ensureQueryData(assetQuery(5))
        |
        +---- is ['assets', 5] in cache and fresh? ---- YES ---> done, no request
        |
        NO
        |
        v
  fetch('/api/assets/5')  ---> backend
        |
        v
  result saved in cache under ['assets', 5]
        |
  User CLICKS the link
        |
        v
  Router renders the asset page component
        |
        v
  useSuspenseQuery(assetQuery(5))  ---> reads from cache instantly
        |
        v
  Page shows data with NO loading spinner
```

Without the loader, the order would be: page renders, then the fetch starts, then a spinner shows, then the data arrives. With the loader, the fetch starts **while you're still hovering**.

---

## 5. Who does what

```
 +----------------------------+        +-------------------------------+
 |        ROUTER              |        |          QUERY                |
 +----------------------------+        +-------------------------------+
 | - match URL -> page        |        | - fetch data from backend     |
 | - nested layouts (Outlet)  |        | - cache it by key             |
 | - <Link>, navigate()       |        | - avoid duplicate requests    |
 | - URL params ($assetId)    |        | - refetch when stale / focus  |
 | - search params (?page=2)  |        | - mutations (create/update/   |
 | - preload on hover         |        |   delete) + cache refresh     |
 | - run loader() before page |------->| - loading / error states      |
 | - not-found / error pages  |  uses  |                               |
 +----------------------------+        +-------------------------------+
```

**Rule of thumb:** the router decides *when* data is needed, and Query decides *whether it really has to be fetched*.

---

## 6. Copy-paste example: an assets list and detail page

### Step 1: define queries once (`src/queries/assets.js`)

```js
import { queryOptions } from "@tanstack/react-query";

export const assetsQuery = () =>
  queryOptions({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await fetch("/api/assets");
      if (!res.ok) throw new Error("Failed to load assets");
      return res.json();
    },
  });

export const assetQuery = (id) =>
  queryOptions({
    queryKey: ["assets", id],
    queryFn: async () => {
      const res = await fetch(`/api/assets/${id}`);
      if (!res.ok) throw new Error("Failed to load asset");
      return res.json();
    },
  });
```

`queryOptions` keeps the **key** and the **fetch function** together, so the loader and the component always use the same cache entry.

### Step 2: list page (`src/routes/assets/index.jsx` → `/assets`)

```jsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { assetsQuery } from "../../queries/assets";

export const Route = createFileRoute("/assets/")({
  // runs BEFORE the page renders (and on link hover)
  loader: ({ context }) => context.queryClient.ensureQueryData(assetsQuery()),
  component: AssetsPage,
});

function AssetsPage() {
  const { data: assets } = useSuspenseQuery(assetsQuery()); // already cached
  return (
    <ul>
      {assets.map((a) => (
        <li key={a.id}>
          <Link to="/assets/$assetId" params={{ assetId: String(a.id) }}>
            {a.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### Step 3: detail page (`src/routes/assets/$assetId.jsx` → `/assets/5`)

```jsx
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { assetQuery } from "../../queries/assets";

export const Route = createFileRoute("/assets/$assetId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(assetQuery(params.assetId)),
  component: AssetPage,
});

function AssetPage() {
  const { assetId } = Route.useParams();
  const { data: asset } = useSuspenseQuery(assetQuery(assetId));
  return <h1>{asset.name}</h1>;
}
```

### Step 4: changing data (mutations)

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function DeleteAssetButton({ id }) {
  const queryClient = useQueryClient();
  const del = useMutation({
    mutationFn: () => fetch(`/api/assets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      // mark every ['assets', ...] entry stale -> list refetches automatically
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
  return <button onClick={() => del.mutate()}>Delete</button>;
}
```

```
  click Delete
      |
      v
  DELETE /api/assets/5  ---> backend
      |
      v  onSuccess
  invalidateQueries(['assets'])
      |
      +--> ['assets']     marked stale --> refetched --> list updates
      +--> ['assets', 5]  marked stale
```

---

## 7. Cheat sheet

| I want to... | Use |
|---|---|
| Add a page | New file in `src/routes/` |
| Link to a page | `<Link to="/assets">` |
| Navigate in code | `const navigate = useNavigate(); navigate({ to: "/assets" })` |
| Read a URL param | `Route.useParams()` |
| Load data before the page shows | `loader` + `context.queryClient.ensureQueryData(...)` |
| Read that data in the component | `useSuspenseQuery(sameQueryOptions)` |
| Fetch data without a loader | `useQuery(...)` (you handle `isPending` yourself) |
| Create / update / delete | `useMutation` + `invalidateQueries` |
| Inspect the cache | React Query devtools (flower icon, bottom-left) |
| Inspect routes | Router devtools (bottom-right) |

Both devtools appear only in development (`npm run dev`), not in production builds.
