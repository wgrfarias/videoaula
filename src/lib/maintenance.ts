import { getSiteContent } from "@/lib/data/site-content";
import { getCurrentUser } from "@/lib/session";
import { ROLES } from "@/lib/constants";

// Returns the maintenance message to show if the current viewer should see
// the maintenance screen instead of the real page, or null if they should
// see the page normally (maintenance is off, or they're an admin).
export async function getMaintenanceMessage() {
  const content = await getSiteContent();
  if (!content.maintenanceMode) return null;

  const user = await getCurrentUser();
  if (user?.role === ROLES.ADMIN) return null;

  return content.maintenanceMessage;
}
