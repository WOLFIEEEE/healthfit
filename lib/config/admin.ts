export function getConfiguredAdminEmails() {
  const raw = [process.env.ADMIN_EMAIL, process.env.HEALTHFIT_ADMIN_EMAILS]
    .filter(Boolean)
    .join(",");

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export function isAdminEmail(email: string) {
  return getConfiguredAdminEmails().includes(email.trim().toLowerCase());
}

export function getAdminEmailConfigLabel() {
  return process.env.ADMIN_EMAIL ? "ADMIN_EMAIL" : "HEALTHFIT_ADMIN_EMAILS";
}
