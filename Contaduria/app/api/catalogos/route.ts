import { authContext, json, handle } from "@/lib/api";
import {
  listDocumentTypes,
  listObligations,
  listTemplates,
} from "@/server/services/catalogos.service";

export async function GET() {
  return handle(async () => {
    const session = await authContext("dashboard:read");
    const [documentTypes, obligations, templates] = await Promise.all([
      listDocumentTypes(session.firmId!),
      listObligations(session.firmId!),
      listTemplates(session.firmId!),
    ]);
    return json({ documentTypes, obligations, templates });
  });
}
