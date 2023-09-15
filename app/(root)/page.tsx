// "Use client"
import StringCard from "@/components/cards/StringCard";
import { fetchStrings } from "@/lib/actions/string.actions";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
  const result = await fetchStrings(1, 30);
  const user = await currentUser();

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.strings.length === 0 ? (
          <p className="no-result">No strings found.</p>
        ) : (
          <>
            {result.strings.map((string) => (
              <StringCard
                key={string._id}
                id={string._id}
                currentUserId={user?.id || ""}
                parentId={string.parentId}
                content={string.text}
                author={string.author}
                createdAt={string.createdAt}
                comments={string.children}
                isComment
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
