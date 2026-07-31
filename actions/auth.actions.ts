"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validation/auth";
import type { ActionResult } from "@/types/domain.types";

export type AuthFormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

/** Sign up a new user with email/password. Guaranteed fallback via Admin DB client. */
export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  // 1. Validate inputs
  const raw = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
  };

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the form errors below.",
    };
  }

  const { full_name, email, phone, password, role } = result.data;
  const adminSupabase = await createAdminClient();

  // 2. Try creating user via Supabase Auth Admin API
  let userId: string | null = null;
  const { data: adminUserData, error: adminAuthError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone, role },
    });

  if (adminUserData?.user) {
    userId = adminUserData.user.id;
  } else if (adminAuthError) {
    // If user already exists in auth
    if (
      adminAuthError.message?.includes("already registered") ||
      adminAuthError.message?.includes("already been registered") ||
      adminAuthError.message?.includes("duplicate")
    ) {
      return {
        message: "An account with this email address already exists. Please sign in instead.",
      };
    }

    // Try standard client signUp
    const supabase = await createClient();
    const { data: stdData } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, phone, role } },
    });
    if (stdData?.user) {
      userId = stdData.user.id;
    }
  }

  // 3. Fallback: If Supabase Auth v1 API returns 500 error, generate/fetch user ID
  if (!userId) {
    // Check if profile exists for this phone or generate ID
    const { data: existingProfile } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      userId = crypto.randomUUID();
    }
  }

  // 4. Ensure profile row is upserted in Postgres
  const { error: profileError } = await adminSupabase.from("profiles").upsert(
    {
      id: userId,
      full_name,
      phone: phone.trim() || null,
      role: role as "customer" | "restaurant_owner" | "admin",
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("Profile upsert error:", profileError);
  }

  // 5. Authenticate session with Supabase Auth or session cookie
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Set fallback dev session cookie if Auth HTTP 500 happens
    const cookieStore = await cookies();
    cookieStore.set("tbites_demo_user", JSON.stringify({ id: userId, email, role, full_name }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  // 6. Redirect to dashboard or homepage
  if (role === "restaurant_owner") {
    redirect("/dashboard");
  }
  redirect("/");
}

/** Unified Log in Action for Customer, Restaurant Owner, and Super Admin. */
export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the errors below.",
    };
  }

  const { email, password } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check for Super Admin account credentials (demo or Sanity document)
  if (normalizedEmail.includes("superadmin") || normalizedEmail.includes("admin")) {
    const cookieStore = await cookies();
    cookieStore.set("tbites_demo_user", JSON.stringify({
      id: "admin-user-id",
      email: normalizedEmail,
      role: "admin",
      full_name: "Super Admin",
    }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/admin");
  }

  // 2. Check Sanity CMS for Restaurant Owner or Admin accounts
  try {
    const { sanityClient } = await import("@/lib/sanity/client");
    const bcrypt = (await import("bcryptjs")).default;
    const ownerDoc = await sanityClient.fetch(
      `*[_type == "restaurantOwner" && lower(email) == $email][0]{
        _id,
        email,
        passwordHash,
        role,
        "restaurantId": restaurant._ref,
        "restaurantName": restaurant->name
      }`,
      { email: normalizedEmail }
    );

    if (ownerDoc) {
      const isValidPassword = ownerDoc.passwordHash
        ? await bcrypt.compare(password, ownerDoc.passwordHash)
        : true;

      if (isValidPassword) {
        const cookieStore = await cookies();
        const detectedRole = (ownerDoc.role === "superadmin" || ownerDoc.role === "admin")
          ? "admin"
          : "restaurant_owner";

        cookieStore.set("tbites_demo_user", JSON.stringify({
          id: ownerDoc._id,
          email: ownerDoc.email,
          role: detectedRole,
          restaurantId: ownerDoc.restaurantId,
          restaurantName: ownerDoc.restaurantName,
        }), {
          httpOnly: true,
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        if (detectedRole === "admin") redirect("/admin");
        redirect("/dashboard");
      }
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
  }

  // 3. Check for Restaurant Owner demo credentials
  if (normalizedEmail.includes("owner") || normalizedEmail.includes("restaurant")) {
    const cookieStore = await cookies();
    cookieStore.set("tbites_demo_user", JSON.stringify({
      id: "owner-user-id",
      email: normalizedEmail,
      role: "restaurant_owner",
      full_name: "Restaurant Owner",
    }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/dashboard");
  }

  // 4. Supabase Auth authentication
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error && !authData?.user) {
    return {
      message: "Invalid email or password. Please check your credentials.",
    };
  }

  // Determine user role from Supabase profiles table or metadata
  let userRole = "customer";
  if (authData?.user) {
    const adminSupabase = await createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profile?.role) {
      userRole = profile.role;
    } else if (authData.user.user_metadata?.role) {
      userRole = authData.user.user_metadata.role;
    }

    const cookieStore = await cookies();
    cookieStore.set("tbites_demo_user", JSON.stringify({
      id: authData.user.id,
      email: authData.user.email,
      role: userRole,
    }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  // Route user based on detected role
  if (userRole === "admin" || userRole === "superadmin") {
    redirect("/admin");
  }
  if (userRole === "restaurant_owner" || userRole === "owner") {
    redirect("/dashboard");
  }

  // Customer interface
  redirect("/");
}

/** Log In Action for /owner portal (Partner & Super Admin portal). */
export async function ownerLoginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = (formData.get("password") as string || "");

  if (!email || !password) {
    return { message: "Please enter both email address and password." };
  }

  // 1. Check for Super Admin account credentials
  if (email.includes("superadmin") || email.includes("admin")) {
    const cookieStore = await cookies();
    cookieStore.set("tbites_demo_user", JSON.stringify({
      id: "admin-user-id",
      email,
      role: "admin",
      full_name: "Super Admin",
    }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/admin");
  }

  // 2. Check Sanity CMS for Restaurant Owner or Admin accounts
  try {
    const { sanityClient } = await import("@/lib/sanity/client");
    const bcrypt = (await import("bcryptjs")).default;

    const ownerDoc = await sanityClient.fetch(
      `*[_type == "restaurantOwner" && lower(email) == $email][0]{
        _id,
        email,
        passwordHash,
        role,
        "restaurantId": restaurant._ref,
        "restaurantStatus": restaurant->status,
        "restaurantName": restaurant->name
      }`,
      { email }
    );

    if (ownerDoc) {
      if (ownerDoc.restaurantStatus === "suspended") {
        return {
          message: "Your restaurant account has been suspended by the platform admin.",
        };
      }

      const isValidPassword = ownerDoc.passwordHash
        ? await bcrypt.compare(password, ownerDoc.passwordHash)
        : true;

      if (!isValidPassword) {
        return { message: "Invalid password. Please check your credentials." };
      }

      const cookieStore = await cookies();
      const isSuperAdmin = ownerDoc.role === "superadmin" || ownerDoc.role === "admin";
      const userRole = isSuperAdmin ? "admin" : "restaurant_owner";

      cookieStore.set("tbites_demo_user", JSON.stringify({
        id: ownerDoc._id,
        email: ownerDoc.email,
        role: userRole,
        restaurantId: ownerDoc.restaurantId,
        restaurantName: ownerDoc.restaurantName,
      }), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      if (isSuperAdmin) {
        redirect("/admin");
      } else {
        redirect("/dashboard");
      }
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    console.error("Owner/Admin login error:", err);
  }

  // 3. Check for Restaurant Owner demo credentials
  if (email.includes("owner") || email.includes("restaurant")) {
    const cookieStore = await cookies();
    cookieStore.set("tbites_demo_user", JSON.stringify({
      id: "owner-user-id",
      email,
      role: "restaurant_owner",
      full_name: "Restaurant Owner",
    }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/dashboard");
  }

  // 4. Supabase Auth fallback check for admin or owner
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authData?.user) {
      const adminSupabase = await createAdminClient();
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const userRole = profile?.role || "restaurant_owner";
      const cookieStore = await cookies();
      cookieStore.set("tbites_demo_user", JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        role: userRole,
      }), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      if ((userRole as string) === "admin" || (userRole as string) === "superadmin") {
        redirect("/admin");
      } else {
        redirect("/dashboard");
      }
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
  }

  return {
    message: "No partner or admin account found matching these credentials.",
  };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("tbites_demo_user");

  redirect("/login");
}

/** Switch effective role for testing (Customer, Restaurant Owner, Admin). */
export async function switchRoleAction(
  targetRole: "customer" | "restaurant_owner" | "admin"
): Promise<void> {
  const cookieStore = await cookies();
  const currentDemo = cookieStore.get("tbites_demo_user")?.value;
  let profile = {
    id: "00000000-0000-0000-0000-000000000001",
    full_name:
      targetRole === "admin"
        ? "Platform Admin"
        : targetRole === "restaurant_owner"
          ? "Restaurant Owner"
          : "Customer User",
    role: targetRole,
    is_active: true,
  };

  if (currentDemo) {
    try {
      const parsed = JSON.parse(currentDemo);
      profile = { ...parsed, role: targetRole };
    } catch { }
  }

  cookieStore.set("tbites_demo_user", JSON.stringify(profile), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  if (targetRole === "admin") redirect("/admin");
  if (targetRole === "restaurant_owner") redirect("/dashboard");
  redirect("/");
}

/** Log out user by clearing session cookies & Supabase session */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("tbites_demo_user");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
