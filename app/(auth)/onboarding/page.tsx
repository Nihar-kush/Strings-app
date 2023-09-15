import AccountProfile from "@/components/forms/AccountProfile";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";

async function Page() {
  const user = await currentUser();
  if (!user) return null;
  
  const userInfo = await fetchUser(user.id);
  const userData = {
    id: user?.id,
    objectId : userInfo?.id,
    username : userInfo?.username || user?.username,
    name : user?.firstName || userInfo?.username || "",
    bio : userInfo?.bio || "",
    image : userInfo?.image || user?.imageUrl,
  };
  return (
    <main className="flex flex-col justify-start px-10 py-20 mx-auto max-w-3xl">
      <h1 className="head-text">Onboarding</h1>
      <p className="text-light-2 text-base-regular mt-3">
        Complete your profile now to use Strings
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;
