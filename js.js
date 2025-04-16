class ImgurAlbumViewer {
  constructor() {
    // DOM Elements
    this.searchInput = document.getElementById("albumIdField");
    this.searchButton = document.getElementById("searchButton");
    this.searchResults = document.getElementById("searchResults");
    this.rateLimitDisplay = document.getElementById("rateLimit");
    this.methodRadios = document.querySelectorAll('input[name="apiMethod"]');

    // App State
    this.state = {
      loading: false,
      rateLimit: {
        remaining: -1,
        limit: -1,
      },
    };

    // API Config
    this.apiConfig = {
      baseUrl: "https://api.imgur.com/3/album",
      clientId: "2b15ea1ee7b293d", // NOTE: Don't expose this in production!
      headers: {
        Authorization: "Client-ID 2b15ea1ee7b293d",
        Accept: "application/json",
      },
    };

    // Initialize
    this.initEventListeners();
  }

  initEventListeners() {
    // Handle Search Button Click
    this.searchButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleSearch();
    });

    // Handle Enter Key Press
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleSearch();
      }
    });
  }

  handleSearch() {
    const albumId = this.getAlbumIdFromInput();
    const method = this.getSelectedMethod();

    if (!this.validateAlbumId(albumId)) return;

    this.clearResults();
    this.setLoading(true);

    switch (method) {
      case "xhr":
        this.fetchWithXHR(albumId);
        break;
      case "async":
        this.fetchWithAsyncAwait(albumId);
        break;
      case "fetch":
      default:
        this.fetchWithFetch(albumId);
    }
  }

  getAlbumIdFromInput() {
    return this.searchInput.value.trim();
  }

  getSelectedMethod() {
    return document.querySelector('input[name="apiMethod"]:checked').value;
  }

  validateAlbumId(albumId) {
    if (!albumId) {
      this.showError("Please enter an album ID.");
      return false;
    }

    if (!/^[a-zA-Z0-9]+$/.test(albumId)) {
      this.showError("Invalid album ID format.");
      return false;
    }

    return true;
  }

  clearResults() {
    this.searchResults.innerHTML = "";
    this.searchResults.className = "results-grid";
  }

  setLoading(isLoading) {
    this.state.loading = isLoading;
    this.searchButton.disabled = isLoading;

    const spinner = this.searchButton.querySelector(".spinner");
    const buttonText = this.searchButton.querySelector(".button-text");

    if (isLoading) {
      spinner.classList.remove("hidden");
      buttonText.textContent = "Searching...";
    } else {
      spinner.classList.add("hidden");
      buttonText.textContent = "Search";
    }
  }

  showError(message) {
    this.searchResults.className = "results-grid error-state";
    this.searchResults.innerHTML = `
      <div class="error-message">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>${message}</p>
      </div>
    `;
  }

  showLoading() {
    this.searchResults.className = "results-grid loading-state";
    this.searchResults.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading album...</p>
      </div>
    `;
  }

  showEmptyState() {
    this.searchResults.className = "results-grid empty-state";
    this.searchResults.innerHTML = `
      <div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No images found in this album.</p>
      </div>
    `;
  }

  updateRateLimit(headers) {
    const remaining = headers.get("X-RateLimit-Remaining") || -1;
    const limit = headers.get("X-RateLimit-Limit") || -1;

    this.state.rateLimit = { remaining, limit };
    this.rateLimitDisplay.textContent = `${remaining}/${limit}`;
  }

  processResponse(data) {
    if (!data?.success) {
      this.showError(data?.data?.error || "Failed to load album.");
      return;
    }

    const images = data.data;

    if (!images || images.length === 0) {
      this.showEmptyState();
      return;
    }

    const fragment = document.createDocumentFragment();
    let hasValidImages = false;

    images.forEach((item) => {
      if (item.link && item.type?.startsWith("image/")) {
        hasValidImages = true;

        const card = document.createElement("div");
        card.className = "image-card";

        const img = document.createElement("img");
        img.src = item.link;
        img.alt = item.title || "Imgur image";
        img.loading = "lazy";

        const info = document.createElement("div");
        info.className = "image-info";

        if (item.title) {
          const title = document.createElement("h3");
          title.textContent = item.title;
          info.appendChild(title);
        }

        if (item.description) {
          const desc = document.createElement("p");
          desc.textContent = item.description;
          info.appendChild(desc);
        }

        card.appendChild(img);
        card.appendChild(info);
        fragment.appendChild(card);
      }
    });

    if (!hasValidImages) {
      this.showEmptyState();
    } else {
      this.searchResults.appendChild(fragment);
    }
  }

  async fetchWithFetch(albumId) {
    try {
      this.showLoading();
      const url = `${this.apiConfig.baseUrl}/${albumId}/images`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.apiConfig.headers,
      });

      this.updateRateLimit(response.headers);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.processResponse(data);
    } catch (error) {
      console.error("Fetch error:", error);
      this.showError(error.message || "Failed to fetch album.");
    } finally {
      this.setLoading(false);
    }
  }

  async fetchWithAsyncAwait(albumId) {
    await this.fetchWithFetch(albumId); // Reuse fetch method
  }

  fetchWithXHR(albumId) {
    const url = `${this.apiConfig.baseUrl}/${albumId}/images`;
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Authorization", this.apiConfig.headers.Authorization);
    xhr.setRequestHeader("Accept", this.apiConfig.headers.Accept);

    xhr.onloadstart = () => this.showLoading();

    xhr.onload = () => {
      try {
        this.updateRateLimit({
          get: (key) => {
            if (key === "X-RateLimit-Remaining")
              return xhr.getResponseHeader(key);
            if (key === "X-RateLimit-Limit") return xhr.getResponseHeader(key);
            return null;
          },
        });

        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          this.processResponse(data);
        } else {
          throw new Error(`API Error: ${xhr.status} ${xhr.statusText}`);
        }
      } catch (error) {
        console.error("XHR error:", error);
        this.showError(error.message || "Failed to fetch album.");
      } finally {
        this.setLoading(false);
      }
    };

    xhr.onerror = () => {
      this.showError("Network error occurred.");
      this.setLoading(false);
    };

    xhr.send();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ImgurAlbumViewer();
});
