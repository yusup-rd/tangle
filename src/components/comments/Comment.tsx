import { CommentData } from "@/lib/types";

interface CommentProps {
    comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
    return (
        <div>
            {comment.content}
        </div>
    );
}