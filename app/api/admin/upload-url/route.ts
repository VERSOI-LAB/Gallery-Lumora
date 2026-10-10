import { NextRequest, NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/adminAuth";
import { supabaseService } from "@/lib/supabase/service";

// 관리자 화면은 Supabase 로그인이 아닌 비밀번호 쿠키로 인증하므로, 브라우저에서 바로
// media 버킷에 쓸 권한이 없습니다. 관리자 세션을 확인한 뒤 service_role로 서명된 업로드
// URL을 발급하고, 파일 자체는 브라우저가 Storage로 직접 올립니다(영상 등 큰 파일 대응).
const ADMIN_UPLOAD_PREFIXES = ["artworks/", "merch/", "journal/", "hero/"];

export async function POST(req: NextRequest) {
  try {
    await assertAdminSession();
  } catch {
    return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const path = body?.path;
  if (
    typeof path !== "string" ||
    path.length > 300 ||
    path.includes("..") ||
    path.includes("//") ||
    !ADMIN_UPLOAD_PREFIXES.some((prefix) => path.startsWith(prefix))
  ) {
    return NextResponse.json({ error: "허용되지 않은 업로드 경로입니다." }, { status: 400 });
  }

  const { data, error } = await supabaseService.storage
    .from("media")
    .createSignedUploadUrl(path, { upsert: true });
  if (error || !data) {
    return NextResponse.json({ error: "업로드 URL을 만들지 못했습니다." }, { status: 500 });
  }
  return NextResponse.json({ path: data.path, token: data.token });
}
