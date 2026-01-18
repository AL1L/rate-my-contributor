import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function isUserAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return false;
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    
    return user?.role === "admin";
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error checking admin status:", error);
    }
    return false;
  }
}

export async function getUserFromSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true, 
        role: true,
        name: true,
        githubProfileId: true
      },
    });
    
    return user;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching user:", error);
    }
    return null;
  }
}
