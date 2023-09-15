import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import StringCard from "@/components/cards/StringCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchStringById } from "@/lib/actions/string.actions";
import Comment from "@/components/forms/Comment";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;
  
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const string = await fetchStringById(params.id);

  return (
    <section className='relative'>
      <div>
        <StringCard
          id={string._id}
          currentUserId={user.id}
          parentId={string.parentId}
          content={string.text}
          author={string.author}
          createdAt={string.createdAt}
          comments={string.children}
        />
      </div>

      <div className='mt-7'>
        <Comment
          stringId={params.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className='mt-10'>
        {string.children.map((childItem: any) => (
          <StringCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
}

export default page;