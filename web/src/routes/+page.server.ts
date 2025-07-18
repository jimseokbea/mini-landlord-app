import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const target = locals.user ? "/properties" : "/login";
  return {
    status: 303,
    redirect: target,
  };
};
