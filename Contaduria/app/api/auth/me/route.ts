import { getSession } from "@/lib/auth";
import { json, handle } from "@/lib/api";

export async function GET() {
  return handle(async () => {
    const session = await getSession();
    if (!session) return json({ user: null });
    return json({ user: session });
  });
}
