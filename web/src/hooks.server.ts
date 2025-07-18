import type { Handle } from "@sveltejs/kit";
import { supabase } from "$lib/supabaseClient";

export const handle: Handle = async ({ event, resolve }) => {
  // Supabase 세션 쿠키에서 사용자 추출
  const { data } = await supabase.auth.getSession();
  event.locals.user = data.session?.user ?? null;

  // 비로그인인데 보호 페이지 접근 => /login 으로 리다이렉트
  const protectedPaths = ["/properties", "/units", "/tenants", "/payments"];
  if (
    !event.locals.user &&
    protectedPaths.some((p) => event.url.pathname.startsWith(p))
  ) {
    return Response.redirect(new URL("/login", event.url), 303);
  }

  // 로그인 사용자가 /login 으로 오면 홈으로
  if (event.locals.user && event.url.pathname === "/login") {
    return Response.redirect(new URL("/properties", event.url), 303);
  }

  return resolve(event);
};
