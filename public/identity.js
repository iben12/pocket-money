(() => {
  let identityPromise;

  async function fetchIdentity() {
    if (!identityPromise) {
      identityPromise = (async () => {
        const isLocal = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
        if (isLocal) {
          let email = "dev@example.com";
          let name = "Dev User";
          try {
            email = localStorage.getItem("pocket-money-dev-email") || email;
            name = localStorage.getItem("pocket-money-dev-name") || name;
          } catch (error) {
            console.warn("Unable to read local identity overrides", error);
          }
          return {
            id: email,
            email,
            name,
          };
        }

        try {
          const response = await fetch("/cdn-cgi/access/get-identity", { credentials: "include" });
          if (!response.ok) return null;
          const result = await response.json();
          if (typeof result.email !== "string" || !result.email.trim()) return null;
          const email = result.email.trim();
          return {
            id: typeof result.user_uuid === "string" && result.user_uuid ? result.user_uuid : email,
            email,
            ...(typeof result.name === "string" && result.name ? { name: result.name } : {}),
          };
        } catch (error) {
          console.warn("Unable to load Cloudflare Access identity", error);
          return null;
        }
      })();
    }
    return identityPromise;
  }

  async function isAdmin(identity) {
    if (!identity) return false;
    try {
      const response = await fetch(`/api/me?email=${encodeURIComponent(identity.email)}`);
      if (!response.ok) throw new Error(`/api/me returned ${response.status}`);
      return (await response.json()).isAdmin === true;
    } catch (error) {
      console.error("Unable to determine admin role", error);
      return false;
    }
  }

  window.PocketMoneyIdentity = { fetchIdentity, isAdmin };
})();
