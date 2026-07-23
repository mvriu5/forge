import {
  NOTION_VERSION,
  blocksToPlainText,
  getTitleFromProperties,
  type NotionBlock,
} from "@/lib/notion";
import { getNotionPageSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getIntegrationAccessToken } from "@/lib/integration-token";

async function fetchPage(accessToken: string, pageId: string) {
  const fetchWithAuth = (url: string) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
    });

  const pageResponse = await fetchWithAuth(
    `https://api.notion.com/v1/pages/${pageId}`,
  );
  if (!pageResponse.ok) return null;
  const pageData = await pageResponse.json();

  // Top-level blocks
  const allBlocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${pageId}/children`);
    url.searchParams.set("page_size", "100");
    if (cursor) url.searchParams.set("start_cursor", cursor);

    const blocksResponse = await fetchWithAuth(url.toString());
    if (!blocksResponse.ok) return null;

    const blocksData = await blocksResponse.json() as { results?: NotionBlock[]; next_cursor?: string | null };
    allBlocks.push(...(blocksData.results ?? []));
    cursor = blocksData.next_cursor ?? undefined;
  } while (cursor);

  // Nested children
  const expandChildren = async (blocks: NotionBlock[]): Promise<NotionBlock[]> => {
    const expandedBlocks = await Promise.all(
      blocks.map(async (block) => {
        if (!block?.has_children) return block;

        const allChildren: NotionBlock[] = [];
        let cursor: string | undefined;

        do {
          const url = new URL(
            `https://api.notion.com/v1/blocks/${block.id}/children`,
          );
          url.searchParams.set("page_size", "100");
          if (cursor) url.searchParams.set("start_cursor", cursor);

          const childResponse = await fetchWithAuth(url.toString());
          if (!childResponse.ok) return block;

          const childData = await childResponse.json() as { results?: NotionBlock[]; next_cursor?: string | null };
          allChildren.push(...(childData.results ?? []));
          cursor = childData.next_cursor ?? undefined;
        } while (cursor);

        return {
          ...block,
          children: await expandChildren(allChildren),
        };
      }),
    );

    return expandedBlocks;
  };

  const expandedBlocks = await expandChildren(allBlocks);

  return {
    id: pageId,
    title: getTitleFromProperties(pageData.properties),
    plainText: blocksToPlainText(expandedBlocks),
    blocks: expandedBlocks,
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const resolvedParams = await params;
    const validationResult = getNotionPageSchema.safeParse(resolvedParams);

    if (!validationResult.success) {
      return NextResponse.json("Invalid request body", { status: 400 });
    }
    const { pageId } = validationResult.data;

    if (!session) return new NextResponse("Unauthorized", { status: 401 });
    const userId = session.user.id;

    const accessToken = await getIntegrationAccessToken("notion", userId, await headers());
    if (!accessToken)
      return NextResponse.json(
        { error: "Notion integration missing or expired" },
        { status: 401 },
      );

    const page = await fetchPage(accessToken, pageId);
    if (!page)
      return NextResponse.json(
        { error: "Unable to load the Notion page" },
        { status: 502 },
      );

    return NextResponse.json(page, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
