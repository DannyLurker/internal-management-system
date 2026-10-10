import { api, type ApiResponse } from "@/shared/lib/api-client";
import type { UserCreateSchema } from "@/shared/lib/zods/user.zod";

export interface CreateStaffAccountResult {
  userId: string;
  emailVerificationId: string;
}

export const userApi = {
  createStaffAccount: async (data: UserCreateSchema) => {
    const res = await api.post<ApiResponse<CreateStaffAccountResult>>(
      "/auth/users",
      {
        ...data,
        // Staff-only: the creation type is fixed, never taken from user input.
        creationType: "STAFF",
      },
    );
    return res.data;
  },
};
