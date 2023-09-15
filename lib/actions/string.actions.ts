"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Strings from "../models/string.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createString({
  text,
  author,
  communityId,
  path,
}: Params): Promise<void> {
  try {
    connectToDB();
    const createdString = await Strings.create({
      text,
      author,
      community: null,
    });

    //update user model
    await User.findByIdAndUpdate(author, {
      $push: { strings: createdString._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create string: ${error.message}`);
  }
}

export async function fetchStrings(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    //number of strings to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    //strings that have no parent
    const stringsQuery = Strings.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId mage",
        },
      });

    const totalStringsCount = await Strings.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const strings = await stringsQuery.exec();
    const isNext = totalStringsCount > skipAmount + strings.length;

    return { strings, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch strings: ${error.message}`);
  }
}

export async function fetchStringById(stringId: string) {
  connectToDB();

  try {
    const string = await Strings.findById(stringId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Strings,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return string;
  } catch (err) {
    console.error("Error while fetching string:", err);
    throw new Error("Unable to fetch string");
  }
}

export async function addCommentToString(
  stringId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    const originalString = await Strings.findById(stringId);

    if (!originalString) {
      throw new Error("String not found");
    }

    // Create the new comment string
    const commentString = new Strings({ 
      text: commentText,
      author: userId,
      parentId: stringId, 
    });

    const savedCommentString = await commentString.save();

    originalString.children.push(savedCommentString._id);

    await originalString.save();
 
    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
