import { PostData } from "@/lib/types";

interface CommentsProps {
    post: PostData;
}

export default function Comments({ post }: CommentsProps) {
    return (
        <div>
            <h1>Comments</h1>
        </div>
    );
}