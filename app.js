const webRoutes = [
  {
    method: "GET",
    path: "/",
    summary: "Landing page",
  },
  {
    method: "GET",
    path: "/home",
    summary: "Home page",
  },
  {
    method: "GET",
    path: "/inventory",
    summary: "Inventory listing with filters and sorting",
    params: "Query: brand, type, subtype, sort_by (default brand), order (asc|desc)",
  },
  {
    method: "GET",
    path: "/users",
    summary: "Users page with their reviews",
  },
  {
    method: "GET",
    path: "/events",
    summary: "Events list",
  },
  {
    method: "GET",
    path: "/event",
    summary: "Event console view. This page has the intention of being run on a central device, showing all the whiskeys, reviews and photos from the event.",
    params: "Query: id, version=client|console",
  },
  {
    method: "GET",
    path: "/event_client",
    summary: "Event client view. This page has the intention of being run on user devices. This removes the current reviews and ratings of bottles to leave the tasting un-biased.",
    params: "Query: id; requires user_id cookie",
  },
  {
    method: "GET",
    path: "/bartender",
    summary: "Admin console with table dump/",
  },
  {
    method: "GET",
    path: "/expert_notes",
    summary: "Expert notes editor view for the admin console. Enables the setting and changing of expert notes for each bottle through a simple UI",
  },
];

const apiRoutes = [
  {
    method: "GET",
    path: "/api/bottles",
    summary: "Paginated bottle list",
    params: "Query: offset (default 0), limit (default 30)",
    returns: "Array of {id, brand, name, abv, image_path, available}",
  },
  {
    method: "POST",
    path: "/api/add_bottle",
    summary: "Create a new bottle record",
    params:
      "JSON: brand, name, abv, spirit_type, subtype (optional), description (optional), photo (optional base64 data URL)",
    returns: "201 with {message, id}",
    notes: "If description is empty, it is generated via OpenAI.",
  },
  {
    method: "GET",
    path: "/get_images",
    summary: "Fetch candidate bottle images",
    params: "Query: brand, name",
    returns: "{query, images:[data URLs]}",
  },
  {
    method: "POST",
    path: "/api/remove_entry",
    summary: "Delete a record from a table",
    params: "JSON: table, id",
  },
  {
    method: "POST",
    path: "/api/make_unavailable",
    summary: "Mark a bottle unavailable",
    params: "JSON: id",
  },
  {
    method: "POST",
    path: "/api/add_user",
    summary: "Create a user",
    params: "JSON: name, photo (optional base64 data URL)",
  },
  {
    method: "POST",
    path: "/api/add_review",
    summary: "Create a review for a bottle",
    params:
      "JSON: name (user name or id), review_text, notes (array), score (0-10), bottle_id, event_id (optional)",
    returns: "201 with {message, review_id}",
  },
  {
    method: "GET",
    path: "/api/random_bottle_id",
    summary: "Random available bottle id",
    returns: "{id}",
  },
  {
    method: "POST",
    path: "/api/add_event",
    summary: "Create a tasting event",
    params: "JSON: name, event_date",
    notes: "Folder path uses name + date under ./database_images/events.",
  },
  {
    method: "POST",
    path: "/api/add_bottles_to_event",
    summary: "Assign bottles to an event",
    params: "Form: event_id, bottle_ids (comma-separated)",
  },
  {
    method: "POST",
    path: "/api/add_users_to_event",
    summary: "Assign users to an event",
    params: "Form: event_id, user_ids (comma-separated)",
  },
  {
    method: "POST",
    path: "/api/user_exists",
    summary: "Lookup user id and set cookie",
    params: "Form: name",
    returns: "{user_id} and sets user_id cookie",
  },
  {
    method: "POST",
    path: "/api/upload_event_photo_file",
    summary: "Upload event photo (file)",
    params: "Form: event_id, image_file",
  },
  {
    method: "POST",
    path: "/api/upload_event_photo_b64",
    summary: "Upload event photo (base64)",
    params: "Form: event_id, image_data (data URL)",
  },
  {
    method: "POST",
    path: "/api/edit_expert_notes",
    summary: "Update expert notes and description",
    params: "JSON: bottle_id, description (optional), notes (array)",
  },
  {
    method: "GET",
    path: "/api/check_bottle",
    summary: "Check if bottle exists",
    params: "Query: brand, name",
    returns: "{exists:true|false}",
  },
  {
    method: "GET",
    path: "/api/check_user",
    summary: "Check if user exists",
    params: "Query: name",
    returns: "{exists:true|false}",
  },  
  {
    method: "GET",
    path: "/database_images/[path]",
    summary: "Serve uploaded images",
    params: "path",
    returns: "Image as a Base64 encoded string",
  },
  {
    method: "POST",
    path: "/modal/bottle",
    summary: "Returns bottle details modal HTML",
    params: "JSON: bottle_id",
  },
];

function renderRouteCard(route) {
  const card = document.createElement("article");
  card.className = "route-card";
  card.dataset.path = route.path.toLowerCase();
  card.dataset.summary = (route.summary || "").toLowerCase();

  const header = document.createElement("div");
  header.className = "route-header";
  header.innerHTML = `<span class="method">${route.method}</span><span class="path">${route.path}</span>`;

  const summary = document.createElement("div");
  summary.textContent = route.summary || "";

  const meta = document.createElement("div");
  meta.className = "meta";
  if (route.params) {
    const line = document.createElement("div");
    line.innerHTML = `<span>Params:</span> ${route.params}`;
    meta.appendChild(line);
  }
  if (route.returns) {
    const line = document.createElement("div");
    line.innerHTML = `<span>Returns:</span> ${route.returns}`;
    meta.appendChild(line);
  }
  if (route.notes) {
    const line = document.createElement("div");
    line.innerHTML = `<span>Notes:</span> ${route.notes}`;
    meta.appendChild(line);
  }

  card.append(header, summary, meta);
  return card;
}

function renderRoutes(routes, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  routes.forEach((route) => container.appendChild(renderRouteCard(route)));
}

function setupFilter() {
  const input = document.getElementById("route-filter");
  if (!input) return;
  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    document.querySelectorAll("#api-routes .route-card").forEach((card) => {
      const match =
        card.dataset.path.includes(term) || card.dataset.summary.includes(term);
      card.style.display = match ? "grid" : "none";
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  items.forEach((item) => observer.observe(item));
}

document.addEventListener("DOMContentLoaded", () => {
  renderRoutes(webRoutes, "web-routes");
  renderRoutes(apiRoutes, "api-routes");
  setupFilter();
  setupReveal();
});
