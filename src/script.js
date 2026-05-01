let map;
let activeMarker = null;

const appointmentsEndpoint = "/api/v1/apts";
const winnipegCenter = [49.8951, -97.1384];

const exampleAppointments = [
  {
    id: 101,
    clinic: "Addictions Foundation of Manitoba - Main Street",
    type: "Detox Centre",
    spots: 4,
    status: "open",
    address: "123 Main Street, Winnipeg, MB R3C 1A5",
    phone: "(204) 944-6200",
    hours: "Open 24 hours",
    lat: 49.8951,
    lng: -97.1384,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T13:45:00.000Z",
  },
  {
    id: 102,
    clinic: "Behavioural Health Foundation - RAAM Clinic",
    type: "Community Clinic",
    spots: 2,
    status: "pending",
    address: "456 Portage Avenue, Winnipeg, MB R3C 0M5",
    phone: "(204) 786-7733",
    hours: "Today: 8:00 AM - 4:30 PM",
    lat: 49.892,
    lng: -97.153,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T14:10:00.000Z",
  },
  {
    id: 103,
    clinic: "Main Street Project - Housing First",
    type: "Housing/Shelter",
    spots: 0,
    status: "full",
    address: "75 Martha Street, Winnipeg, MB R3B 1A4",
    phone: "(204) 982-8245",
    hours: "Open 24 hours",
    lat: 49.9025,
    lng: -97.13,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T12:30:00.000Z",
  },
  {
    id: 104,
    clinic: "River Point Withdrawal Management",
    type: "Withdrawal Management",
    spots: 1,
    status: "delayed",
    address: "146 Magnus Avenue, Winnipeg, MB",
    phone: "(204) 555-0174",
    hours: "Today: 9:00 AM - 6:00 PM",
    lat: 49.9122,
    lng: -97.1394,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T11:20:00.000Z",
  },
  {
    id: 105,
    clinic: "North End Community Wellness Hub",
    type: "Community Support",
    spots: 0,
    status: "cancelled",
    address: "865 Main Street, Winnipeg, MB",
    phone: "(204) 555-0129",
    hours: "Temporarily closed",
    lat: 49.9138,
    lng: -97.1321,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T09:50:00.000Z",
  },
  {
    id: 106,
    clinic: "West Broadway Recovery Services",
    type: "Treatment Program",
    spots: 6,
    status: "open",
    address: "640 Broadway, Winnipeg, MB",
    phone: "(204) 555-0198",
    hours: "Today: 8:30 AM - 5:00 PM",
    lat: 49.8847,
    lng: -97.1547,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T15:00:00.000Z",
  },
];

const statusView = {
  open: {
    label: "Available",
    group: "available",
    tone: "green",
    note: "Currently accepting appointments. Please confirm availability before visiting.",
  },
  pending: {
    label: "Limited",
    group: "limited",
    tone: "amber",
    note: "Availability is limited. Contact the organization before sending a referral.",
  },
  delayed: {
    label: "Delayed",
    group: "limited",
    tone: "amber",
    note: "Services are delayed. Response times may be longer than usual.",
  },
  full: {
    label: "At Capacity",
    group: "full",
    tone: "red",
    note: "Currently at capacity. Check back later for updated availability.",
  },
  cancelled: {
    label: "Temporarily Closed",
    group: "closed",
    tone: "grey",
    note: "This service is temporarily closed or unavailable.",
  },
};

const state = {
  appointments: [],
  filters: {
    search: "",
    type: "",
    status: "",
    statusGroup: "",
  },
};

const normalizeText = (value) => String(value ?? "").trim();

function initMap() {
  const mapEl = document.getElementById("map");

  if (!mapEl || typeof L === "undefined") {
    console.warn("Map element or Leaflet not available.");
    return;
  }

  map = L.map(mapEl).setView(winnipegCenter, 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

function getStatusDetails(status) {
  return statusView[status] ?? {
    label: normalizeText(status) || "Unknown",
    group: "closed",
    tone: "grey",
    note: "No current availability note has been provided.",
  };
}

function getAppointmentPosition(appointment) {
  if (Number.isFinite(appointment.lat) && Number.isFinite(appointment.lng)) {
    return [appointment.lat, appointment.lng];
  }

  const id = Number(appointment.id) || 1;
  const angle = id * 0.9;
  const radius = 0.018 + (id % 5) * 0.006;

  return [
    winnipegCenter[0] + Math.sin(angle) * radius,
    winnipegCenter[1] + Math.cos(angle) * radius,
  ];
}

function formatRelativeTime(isoDate) {
  if (!isoDate) {
    return "Updated recently";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, amount] of units) {
    const value = Math.floor(seconds / amount);
    if (value >= 1) {
      return `Updated ${value} ${unit}${value === 1 ? "" : "s"} ago`;
    }
  }

  return "Updated just now";
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function updateSummary(appointments) {
  const counts = {
    available: 0,
    limited: 0,
    full: 0,
    closed: 0,
  };

  appointments.forEach((appointment) => {
    const status = getStatusDetails(appointment.status);
    counts[status.group] += 1;
  });

  document.getElementById("availableCount").textContent = counts.available;
  document.getElementById("limitedCount").textContent = counts.limited;
  document.getElementById("fullCount").textContent = counts.full;
  document.getElementById("closedCount").textContent = counts.closed;
}

function useAppointments(appointments) {
  state.appointments = appointments;
  updateSummary(state.appointments);
  populateTypeFilter(state.appointments);
  renderAppointments();
}

function populateTypeFilter(appointments) {
  const typeFilter = document.getElementById("typeFilter");
  const currentValue = typeFilter.value;
  const types = [
    ...new Set(appointments.map((apt) => normalizeText(apt.type)).filter(Boolean)),
  ].sort();

  typeFilter.replaceChildren(new Option("All Types", ""));
  types.forEach((type) => {
    typeFilter.append(new Option(type, type));
  });

  typeFilter.value = types.includes(currentValue) ? currentValue : "";
}

function isolateCard(card) {
  const cardsGrid = document.getElementById("cardsGrid");
  const cards = Array.from(document.querySelectorAll(".resource-card"));
  const statusMessage = document.getElementById("orgStatusMessage");

  if (!cardsGrid) return;

  cardsGrid.classList.add("cards-grid--isolated");

  cards.forEach((currentCard) => {
    const isActive = currentCard === card;
    currentCard.classList.toggle("resource-card--active", isActive);
    currentCard.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  const orgName =
    card.querySelector(".resource-card__title")?.textContent?.trim() ||
    "selected organization";

  if (statusMessage) {
    statusMessage.textContent = `Showing only ${orgName}.`;
  }
}

function resetIsolation() {
  const cardsGrid = document.getElementById("cardsGrid");
  const cards = Array.from(document.querySelectorAll(".resource-card"));
  const statusMessage = document.getElementById("orgStatusMessage");

  if (!cardsGrid) return;

  cardsGrid.classList.remove("cards-grid--isolated");

  cards.forEach((card) => {
    card.classList.remove("resource-card--active");
    card.setAttribute("aria-pressed", "false");
  });

  if (statusMessage) {
    statusMessage.textContent = "Showing all organizations.";
  }
}

function updateActiveSummaryCard() {
  document.querySelectorAll(".summary-card[data-status-group]").forEach((card) => {
    const isActive = card.dataset.statusGroup === state.filters.statusGroup;
    card.classList.toggle("summary-card--active", isActive);
    card.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function showOnMap(card) {
  const mapWrapper = document.getElementById("mapWrapper");
  const lat = parseFloat(card.dataset.lat);
  const lng = parseFloat(card.dataset.lng);

  if (!map) {
    console.warn("Map is not initialized.");
    return;
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    console.warn("Missing or invalid lat/lng:", card);
    return;
  }

  const orgName =
    card.querySelector(".resource-card__title")?.textContent?.trim() ||
    "Selected location";
  const orgAddress = card.dataset.address || "Address not available";

  const position = [lat, lng];

  if (mapWrapper) {
    mapWrapper.style.display = "block";
    setTimeout(() => map.invalidateSize(), 0);
    mapWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (activeMarker) {
    map.removeLayer(activeMarker);
  }

  activeMarker = L.marker(position)
    .addTo(map)
    .bindPopup(`<strong>${orgName}</strong><br>${orgAddress}`)
    .openPopup();
  map.setView(position, 14);
}

function buildCard(appointment) {
  const status = getStatusDetails(appointment.status);
  const [lat, lng] = getAppointmentPosition(appointment);
  const card = createElement("article", "resource-card");
  card.dataset.appointmentId = appointment.id;
  card.dataset.lat = lat;
  card.dataset.lng = lng;
  card.dataset.address = appointment.address || "Address not available";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-pressed", "false");

  const header = createElement("header", "resource-card__header");
  const titleGroup = createElement("div");
  titleGroup.append(
    createElement("h2", "resource-card__title", normalizeText(appointment.clinic) || "Unnamed organization"),
    createElement("p", "resource-card__type", normalizeText(appointment.type) || "Healthcare resource")
  );
  header.append(titleGroup);

  const statusRow = createElement("div", "resource-card__status");
  const pill = createElement("span", `pill pill--${status.tone}`);
  pill.append(
    createElement("span", `dot dot--${status.tone}`),
    document.createTextNode(` ${status.label}`)
  );
  statusRow.append(
    pill,
    createElement("span", "resource-card__meta", `${appointment.spots} spot${appointment.spots === 1 ? "" : "s"} available`)
  );

  const details = createElement("div", "resource-card__details");
  details.append(
    createElement("p", "resource-card__row", appointment.address || `Resource ID: ${appointment.id}`),
    createElement("p", "resource-card__row", appointment.phone || `Current status: ${status.label}`),
    createElement("p", "resource-card__row", appointment.hours || formatRelativeTime(appointment.updatedAt))
  );

  const tags = createElement("div", "resource-card__tags");
  tags.append(
    createElement("span", "tag", normalizeText(appointment.type) || "Resource"),
    createElement("span", "tag", `${appointment.spots} spots`),
    createElement("span", "tag", status.label)
  );

  const noteTone =
    status.tone === "red"
      ? "danger"
      : status.tone === "grey"
        ? "muted"
        : status.tone === "amber"
          ? "warning"
          : "info";
  const note = createElement("div", `resource-card__note resource-card__note--${noteTone}`, status.note);

  const footer = createElement("footer", "resource-card__footer");
  const apiLink = createElement("a", "btn btn--outline", "Open API list");
  apiLink.href = appointmentsEndpoint;

  const directionsButton = createElement("button", "btn btn--outline direction-btn", "Directions");
  directionsButton.type = "button";

  footer.append(apiLink, directionsButton, createElement("span", "resource-card__updated", formatRelativeTime(appointment.updatedAt)));
  card.append(header, statusRow, details, tags, note, footer);

  return card;
}

function getFilteredAppointments() {
  return state.appointments.filter((appointment) => {
    const status = getStatusDetails(appointment.status);
    const searchable = `${appointment.clinic} ${appointment.type}`.toLowerCase();
    const matchesSearch = searchable.includes(state.filters.search.toLowerCase());
    const matchesType = !state.filters.type || appointment.type === state.filters.type;
    const matchesStatus = !state.filters.status || appointment.status === state.filters.status;
    const matchesStatusGroup = !state.filters.statusGroup || status.group === state.filters.statusGroup;

    return matchesSearch && matchesType && matchesStatus && matchesStatusGroup;
  });
}

function renderAppointments() {
  const cardsGrid = document.getElementById("cardsGrid");
  const organizationsCount = document.getElementById("organizationsCount");
  const statusMessage = document.getElementById("orgStatusMessage");
  const filteredAppointments = getFilteredAppointments();

  resetIsolation();
  cardsGrid.replaceChildren();

  if (filteredAppointments.length === 0) {
    cardsGrid.append(createElement("div", "empty-state", "No organizations match the current filters."));
  } else {
    filteredAppointments.forEach((appointment) => {
      cardsGrid.append(buildCard(appointment));
    });
  }

  const countLabel = `${filteredAppointments.length} organization${filteredAppointments.length === 1 ? "" : "s"}`;
  organizationsCount.textContent = `Showing ${countLabel}`;
  statusMessage.textContent = organizationsCount.textContent;
  updateActiveSummaryCard();
}

async function loadAppointments() {
  const cardsGrid = document.getElementById("cardsGrid");
  const organizationsCount = document.getElementById("organizationsCount");
  const statusMessage = document.getElementById("orgStatusMessage");

  try {
    const response = await fetch(appointmentsEndpoint);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const appointments = await response.json();
    useAppointments(appointments.length > 0 ? appointments : exampleAppointments);
  } catch (error) {
    useAppointments(exampleAppointments);
    organizationsCount.textContent = "Showing example organizations for testing";
    statusMessage.textContent = error instanceof Error ? error.message : "Using example organizations for testing";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const typeFilter = document.getElementById("typeFilter");
  const statusFilter = document.getElementById("statusFilter");
  const resetButton = document.getElementById("resetView");
  const closeMapBtn = document.getElementById("closeMapBtn");
  const mapWrapper = document.getElementById("mapWrapper");

  initMap();
  loadAppointments();

  searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderAppointments();
  });

  typeFilter.addEventListener("change", (event) => {
    state.filters.type = event.target.value;
    renderAppointments();
  });

  statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    state.filters.statusGroup = "";
    renderAppointments();
  });

  resetButton.addEventListener("click", () => {
    state.filters = {
      search: "",
      type: "",
      status: "",
      statusGroup: "",
    };

    searchInput.value = "";
    typeFilter.value = "";
    statusFilter.value = "";
    renderAppointments();
  });

  document.querySelectorAll(".summary-card[data-status-group]").forEach((summaryCard) => {
    const applySummaryFilter = () => {
      const selectedGroup = summaryCard.dataset.statusGroup;
      state.filters.statusGroup =
        state.filters.statusGroup === selectedGroup ? "" : selectedGroup;
      state.filters.status = "";
      statusFilter.value = "";
      renderAppointments();
    };

    summaryCard.addEventListener("click", applySummaryFilter);
    summaryCard.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        applySummaryFilter();
      }
    });
  });

  closeMapBtn.addEventListener("click", () => {
    mapWrapper.style.display = "none";

    if (activeMarker && map) {
      map.removeLayer(activeMarker);
      activeMarker = null;
    }

    if (map) {
      map.setView(winnipegCenter, 11);
    }
  });

  document.addEventListener("click", (event) => {
    const directionBtn = event.target.closest(".direction-btn");
    const card = event.target.closest(".resource-card");

    if (directionBtn && card) {
      event.stopPropagation();
      showOnMap(card);
      return;
    }

    if (card && !event.target.closest("a, button")) {
      isolateCard(card);
    }
  });

  document.addEventListener("keydown", (event) => {
    const card = event.target.closest(".resource-card");

    if (!card || event.target.closest("a, button")) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      isolateCard(card);
    }
  });
});
