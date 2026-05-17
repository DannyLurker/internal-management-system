import {
  createUserSelect,
  userRepository,
} from "@/features/users/user.repository";
import { auth } from "../auth";
import { notFound, unauthorized } from "../error-handlers";

const sessionValidation = async () => {
  const currentSession = await auth();

  if (!currentSession?.user.id) throw unauthorized("You're not authorized");

  const selectData = createUserSelect({
    id: true,
    name: true,
    email: true,
    image: true,
    role: true,
  });

  const user = await userRepository.findUserById(
    currentSession?.user.id!,
    selectData,
  );

  if (!user) throw notFound("User with this session not found");

  return user;
};

export default sessionValidation;
