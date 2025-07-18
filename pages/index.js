import { useEffect } from "react";
import { useRouter } from "next/router";
import { getValidId } from "../utils/getValidId";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (getValidId()) {
      router.push("/event");
      return;
    }
    router.push("/login");
  }, [router]);
  return null;
}