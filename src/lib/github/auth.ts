const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

export const getGitHubToken = (): string | null => {
  if (isMock) {
    return import.meta.env.VITE_GITHUB_CLIENT_SECRET || null;
  }

  // In future: use token from localStorage or OAuth
  return localStorage.getItem("github_token");
};
