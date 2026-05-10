import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypingIndicator from "./TypingIndicator";

export default function ChatMessage({ message }) {
  const isUserMessage = message.role === "user";

  return (
    <Box
      key={message.id}
      className={`chat__message ${
        isUserMessage ? "chat__message--user" : "chat__message--assistant"
      }`}
    >
      <Typography
        variant="body2"
        color={isUserMessage ? "text.primary" : "text.secondary"}
      >
        {message.loading ? (
          <TypingIndicator />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
        )}
      </Typography>
    </Box>
  );
}
