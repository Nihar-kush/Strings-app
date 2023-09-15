import { redirect } from "next/navigation";

import { fetchUserStrings } from "@/lib/actions/user.actions";

import StringCard from "../cards/StringCard";

interface Result {
  name: string;
  image: string;
  id: string;
  strings: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function StringsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  result = await fetchUserStrings(accountId);

  if (!result) {
    redirect("/");
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.strings.map((string) => (
        <StringCard
          key={string._id}
          id={string._id}
          currentUserId={currentUserId}
          parentId={string.parentId}
          content={string.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: string.author.name,
                  image: string.author.image,
                  id: string.author.id,
                }
          }
          createdAt={string.createdAt}
          comments={string.children}
        />
      ))}
    </section>
  );
}

export default StringsTab;
